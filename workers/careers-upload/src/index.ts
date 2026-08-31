/**
 * ════════════════════════════════════════════════════════════════════
 *  CAREERS UPLOAD — the only server-side code in this project.
 *
 *  The site is a static export, which cannot accept a file. This Worker
 *  exists solely so somebody can attach a résumé: it takes one
 *  multipart POST, validates it hard, writes the file to a PRIVATE R2
 *  bucket, and pings the office. Nothing else. It has no read path, no
 *  listing, and no way to hand a file back out — retrieving an
 *  application is done from the R2 dashboard or with wrangler.
 *
 *  That is deliberate. A public read path on a bucket full of
 *  strangers' phone numbers and addresses is the failure mode worth
 *  designing out, not the file-size limit.
 *
 *  ── THE LAYERS, and why each is here ────────────────────────────────
 *
 *  1. Origin allowlist. The browser's CORS check is advisory — curl
 *     ignores it — so the origin is checked server-side too and the
 *     response echoes one matched origin, never "*".
 *  2. Content-Length gate before the body is read, so an oversized
 *     upload is refused without buffering it into memory.
 *  3. Extension + declared MIME + MAGIC BYTES. The first two are
 *     attacker-controlled; the third is the one that means anything.
 *  4. Turnstile, when a secret is configured. This is the only thing
 *     that actually stops a bot flooding the bucket.
 *  5. Optional KV rate limit per IP as a backstop for when Turnstile
 *     is not yet configured.
 *  6. The stored key is generated here. A filename from a form field
 *     is never a path.
 *
 *  Errors returned to the browser are deliberately vague. Details go to
 *  the Workers log, where the operator can see them and an attacker
 *  cannot.
 * ════════════════════════════════════════════════════════════════════
 */

export interface Env {
  /** Private R2 bucket. Do NOT attach a public bucket URL to it. */
  RESUMES: R2Bucket;
  /** Comma-separated, exact scheme+host. No wildcards, no trailing slash. */
  ALLOWED_ORIGINS: string;
  /** Bytes. Default 5 MB if unset or unparseable. */
  MAX_UPLOAD_BYTES?: string;
  /** Cloudflare Turnstile secret. Unset = captcha not enforced. */
  TURNSTILE_SECRET?: string;
  /** Where the "new application" ping goes. Unset = no ping. */
  NOTIFY_WEBHOOK?: string;
  /** Optional KV namespace for the per-IP backstop limiter. */
  RATE_LIMIT?: KVNamespace;
  /** Applications per IP per hour when RATE_LIMIT is bound. Default 5. */
  RATE_LIMIT_PER_HOUR?: string;
}

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_RATE_PER_HOUR = 5;

/** What a résumé is allowed to be, and how to recognise one for real. */
const ALLOWED = [
  { ext: "pdf", mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    magic: [0x50, 0x4b, 0x03, 0x04], // PK.. — docx is a zip
  },
  {
    ext: "doc",
    mime: "application/msword",
    magic: [0xd0, 0xcf, 0x11, 0xe0], // OLE compound file
  },
] as const;

/* ── Small helpers ─────────────────────────────────────────────────── */

function allowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function corsHeaders(origin: string | null, env: Env): HeadersInit {
  const list = allowedOrigins(env);
  const matched = origin && list.includes(origin) ? origin : "";
  return {
    // Echo exactly one origin, never "*". Vary so a cache cannot serve
    // one site's CORS answer to another's request.
    ...(matched ? { "Access-Control-Allow-Origin": matched } : {}),
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(
  body: unknown,
  status: number,
  origin: string | null,
  env: Env
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...corsHeaders(origin, env),
    },
  });
}

/** One vague message for the browser; the real reason goes to the log. */
function reject(
  logReason: string,
  status: number,
  origin: string | null,
  env: Env,
  userMessage = "We couldn't accept that application."
): Response {
  console.warn(`[careers] rejected (${status}): ${logReason}`);
  return json({ ok: false, error: userMessage }, status, origin, env);
}

function maxBytes(env: Env): number {
  const n = Number.parseInt(env.MAX_UPLOAD_BYTES ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_BYTES;
}

/**
 * Collapse a submitted filename to something safe to put in a key.
 *
 * Everything outside [A-Za-z0-9._-] becomes a dash, which folds away
 * path separators, control bytes and unicode tricks in one pass.
 * Leading dots and dashes are then stripped so a name can never become
 * ".." or a hidden file, and an empty result falls back rather than
 * producing a key that ends in a bare slash.
 */
function safeName(name: string): string {
  return (
    name
      .replace(/[^A-Za-z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[.-]+/, "")
      .slice(0, 80) || "resume"
  );
}

/**
 * What a file part actually is at runtime.
 *
 * @cloudflare/workers-types declares FormData.get() as `string | null`,
 * but a multipart file part really does come back as a File. The types
 * are lossy rather than the runtime being different, so the entry is
 * duck-typed here instead of blind-cast — if the shape is ever not what
 * we expect, this returns false and the request is rejected cleanly
 * rather than throwing on `.arrayBuffer()` halfway through.
 */
type UploadedFile = {
  name: string;
  size: number;
  type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
};

function isUploadedFile(v: unknown): v is UploadedFile {
  if (typeof v !== "object" || v === null) return false;
  const f = v as Partial<UploadedFile>;
  return (
    typeof f.size === "number" &&
    typeof f.name === "string" &&
    typeof f.arrayBuffer === "function"
  );
}

function extensionOf(name: string): string {
  return /\.([A-Za-z0-9]+)$/.exec(name)?.[1]?.toLowerCase() ?? "";
}

async function verifyTurnstile(
  token: string,
  ip: string,
  secret: string
): Promise<boolean> {
  try {
    const body = new FormData();
    body.append("secret", secret);
    body.append("response", token);
    if (ip) body.append("remoteip", ip);
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body }
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.error("[careers] turnstile verify threw:", e);
    return false;
  }
}

/**
 * Backstop limiter. Only active when a KV namespace is bound — it is
 * not a substitute for Turnstile or for a WAF rate-limiting rule, both
 * of which stop traffic before it reaches this Worker and costs money.
 */
async function overRateLimit(ip: string, env: Env): Promise<boolean> {
  if (!env.RATE_LIMIT || !ip) return false;
  const cap =
    Number.parseInt(env.RATE_LIMIT_PER_HOUR ?? "", 10) || DEFAULT_RATE_PER_HOUR;
  const key = `ip:${ip}:${new Date().toISOString().slice(0, 13)}`; // per hour
  const seen = Number.parseInt((await env.RATE_LIMIT.get(key)) ?? "0", 10);
  if (seen >= cap) return true;
  // 2h TTL so the hour bucket outlives its own window without a sweep.
  await env.RATE_LIMIT.put(key, String(seen + 1), { expirationTtl: 7200 });
  return false;
}

/* ── The handler ───────────────────────────────────────────────────── */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const allowed = allowedOrigins(env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }
    if (request.method !== "POST") {
      return reject("method not POST", 405, origin, env);
    }
    if (allowed.length === 0) {
      // Refuse rather than defaulting open. An unconfigured Worker that
      // accepts uploads from anywhere is worse than one that is down.
      return reject("ALLOWED_ORIGINS is not configured", 500, origin, env);
    }
    if (!origin || !allowed.includes(origin)) {
      return reject(`origin not allowed: ${origin ?? "(none)"}`, 403, origin, env);
    }

    const limit = maxBytes(env);
    const declaredLength = Number.parseInt(
      request.headers.get("Content-Length") ?? "",
      10
    );
    if (Number.isFinite(declaredLength) && declaredLength > limit) {
      return reject(
        `content-length ${declaredLength} over ${limit}`,
        413,
        origin,
        env,
        "That file is too large. Please send a résumé under 5MB."
      );
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "";
    if (await overRateLimit(ip, env)) {
      return reject(
        `rate limited: ${ip}`,
        429,
        origin,
        env,
        "Too many applications from this connection. Please try again later."
      );
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch (e) {
      return reject(`unparseable multipart: ${e}`, 400, origin, env);
    }

    // Honeypot. Answer 200 so a bot learns nothing, store nothing.
    if (String(form.get("company") ?? "")) {
      console.warn("[careers] honeypot tripped");
      return json({ ok: true }, 200, origin, env);
    }

    if (env.TURNSTILE_SECRET) {
      const token = String(form.get("cf-turnstile-response") ?? "");
      if (!token || !(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET))) {
        return reject(
          "turnstile failed",
          403,
          origin,
          env,
          "We couldn't verify that you're human. Please reload and try again."
        );
      }
    }

    const name = String(form.get("name") ?? "").trim().slice(0, 120);
    const phone = String(form.get("phone") ?? "").trim().slice(0, 40);
    const email = String(form.get("email") ?? "").trim().slice(0, 160);
    const role = String(form.get("role") ?? "").trim().slice(0, 120);
    const answers = String(form.get("answers") ?? "").slice(0, 8000);

    if (!name || !phone) {
      return reject(
        "missing name or phone",
        400,
        origin,
        env,
        "Please give us a name and a phone number."
      );
    }

    const file: unknown = form.get("resume");
    if (!isUploadedFile(file) || file.size === 0) {
      return reject(
        "no resume file",
        400,
        origin,
        env,
        "Please attach your résumé."
      );
    }
    if (file.size > limit) {
      return reject(
        `file ${file.size} over ${limit}`,
        413,
        origin,
        env,
        "That file is too large. Please send a résumé under 5MB."
      );
    }

    const ext = extensionOf(file.name);
    const spec = ALLOWED.find((a) => a.ext === ext);
    if (!spec) {
      return reject(
        `extension not allowed: ${ext}`,
        415,
        origin,
        env,
        "Please send a PDF or Word document."
      );
    }

    // The bytes decide. Extension and Content-Type are both supplied by
    // whoever is uploading, so neither is evidence of anything.
    const bytes = new Uint8Array(await file.arrayBuffer());
    const magicOk = spec.magic.every((b, i) => bytes[i] === b);
    if (!magicOk) {
      return reject(
        `magic bytes do not match .${ext}: ${[...bytes.slice(0, 4)]
          .map((b) => b.toString(16))
          .join(" ")}`,
        415,
        origin,
        env,
        "That file doesn't look like a PDF or Word document."
      );
    }

    const now = new Date();
    const key = [
      "applications",
      String(now.getUTCFullYear()),
      String(now.getUTCMonth() + 1).padStart(2, "0"),
      `${crypto.randomUUID()}-${safeName(file.name)}`,
    ].join("/");

    try {
      await env.RESUMES.put(key, bytes, {
        httpMetadata: { contentType: spec.mime },
        // Applicant details ride with the file so the bucket is
        // self-describing — an object is never an orphan blob whose
        // owner is only recoverable from an email somewhere.
        customMetadata: {
          name,
          phone,
          email,
          role,
          originalFilename: safeName(file.name),
          submittedAt: now.toISOString(),
          ip,
        },
      });
    } catch (e) {
      console.error("[careers] R2 put failed:", e);
      return json(
        {
          ok: false,
          error:
            "We couldn't store that just now. Please try again, or email your résumé to the office.",
        },
        502,
        origin,
        env
      );
    }

    // Tell the office. Never blocks the applicant: if the ping fails
    // the file is already safely in R2, and losing the notification is
    // recoverable in a way that losing the application is not.
    if (env.NOTIFY_WEBHOOK) {
      const payload = {
        subject: `Job application — ${name}${role ? ` (${role})` : ""}`,
        name,
        phone,
        email,
        role,
        answers,
        resumeKey: key,
        submittedAt: now.toISOString(),
      };
      try {
        const res = await fetch(env.NOTIFY_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.error(`[careers] notify webhook ${res.status} for ${key}`);
        }
      } catch (e) {
        console.error(`[careers] notify webhook threw for ${key}:`, e);
      }
    } else {
      console.warn(`[careers] no NOTIFY_WEBHOOK set — ${key} stored silently`);
    }

    return json({ ok: true }, 200, origin, env);
  },
} satisfies ExportedHandler<Env>;
