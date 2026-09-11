/**
 * ════════════════════════════════════════════════════════════════════
 *  LEAD RELAY — one list, whatever CRM turns out to be the right one.
 *
 *  Two things happen on this site that the business needs to act on: a
 *  homeowner asks for an assessment, and somebody applies for a job.
 *  Before this, those went to two different places — Web3Forms sent the
 *  first to an inbox, the careers Worker put the second in an R2 bucket
 *  — and neither was a list anyone could work through.
 *
 *  This is that list. Everything lands here, in one table, and from
 *  here it is forwarded to whichever CRM gets chosen.
 *
 *  ── WHY IT IS CRM-AGNOSTIC, WHICH IS THE WHOLE POINT ────────────────
 *
 *  The CRM has not been picked yet. Writing directly to HubSpot or
 *  Jobber or AccuLynx would mean either waiting for that decision — and
 *  losing every lead in the meantime — or rewriting both forms when it
 *  is made. So the relay stores first and forwards second, to a URL in
 *  a secret. Pointing it at a real CRM later is one `wrangler secret
 *  put`; until then every lead is still captured, and /export.csv hands
 *  the backlog to whatever gets chosen, for import on day one.
 *
 *  ── THE ORDER OF OPERATIONS IS THE DESIGN ───────────────────────────
 *
 *  Write the row. Answer the caller. Forward afterwards.
 *
 *  Anything else couples the business's ability to take work to a third
 *  party's uptime. If the CRM is down, a lead that was forwarded and
 *  not stored is gone; a lead that was stored and not forwarded is a
 *  row with crm_status='failed' that the retry picks up. The failure
 *  mode is a delayed delivery instead of a lost customer.
 *
 *  ── WHAT THIS IS NOT ────────────────────────────────────────────────
 *
 *  It is NOT on the critical path for either form. The contact form
 *  still posts to Web3Forms, and the email still arrives whether or not
 *  this Worker is reachable; the careers Worker still writes the résumé
 *  to R2 before it pings here. This is the second copy, deliberately,
 *  because the first copy must not depend on code we maintain.
 *
 *  It is also not a public read path. /export.csv needs a bearer token
 *  and there is no other way to get data out — the table holds
 *  strangers' names, phone numbers and addresses.
 * ════════════════════════════════════════════════════════════════════
 */

export interface Env {
  /** The lead book. See schema.sql. */
  DB: D1Database;

  /** Comma-separated, exact scheme+host. No wildcards, no trailing slash. */
  ALLOWED_ORIGINS: string;

  /**
   * Where leads are forwarded. Unset is a supported state, not a
   * misconfiguration: rows are stored with crm_status='disabled' and
   * /export.csv is how they get into whatever is chosen later.
   */
  CRM_WEBHOOK_URL?: string;

  /**
   * Sent as `Authorization: Bearer …` on the forward, when the CRM
   * wants one. Most do.
   */
  CRM_AUTH_TOKEN?: string;

  /**
   * Shared secret for POST /application, which is called by the careers
   * Worker rather than by a browser. REQUIRED for that route: without
   * it the route refuses everything, because an open endpoint that
   * writes to the lead book is a spam faucet.
   */
  INGEST_SECRET?: string;

  /** Bearer token for GET /export.csv. Required for that route. */
  EXPORT_TOKEN?: string;

  /** Leads per IP per hour on the public route. Default 10. */
  RATE_LIMIT_PER_HOUR?: string;

  /** Optional KV for the per-IP backstop limiter. */
  RATE_LIMIT?: KVNamespace;
}

const DEFAULT_RATE_PER_HOUR = 10;

/** How many times the retry will keep trying before it gives up. */
const MAX_CRM_ATTEMPTS = 6;

/** Rows per retry sweep. Small enough to stay well inside a cron's budget. */
const RETRY_BATCH = 25;

/* ── Origins and responses ──────────────────────────────────────── */

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

/** One vague message for the caller; the real reason goes to the log. */
function reject(
  logReason: string,
  status: number,
  origin: string | null,
  env: Env,
  userMessage = "We couldn't record that."
): Response {
  console.warn(`[relay] rejected (${status}): ${logReason}`);
  return json({ ok: false, error: userMessage }, status, origin, env);
}

/* ── Cleaning ───────────────────────────────────────────────────── */

/**
 * Strip control characters, collapse whitespace, cap the length.
 *
 * These strings end up in a database, a CSV and somebody else's CRM. A
 * newline inside a name is header-shaped to whatever renders it, and a
 * megabyte in a field nobody caps is a cheap way to fill the table.
 */
function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Null rather than "" for a field the form does not ask about. */
function orNull(value: string): string | null {
  return value.length ? value : null;
}

/**
 * The questionnaire, re-serialised rather than stored as it arrived.
 *
 * Parsing and rebuilding it means a caller cannot smuggle anything
 * structural through a field that is only ever read back as a flat
 * object of short strings.
 */
function cleanAnswers(raw: unknown): string | null {
  const text = typeof raw === "string" ? raw : "";
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return orNull(clean(text, 4000));
    }
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed).slice(0, 40)) {
      const key = clean(k, 200);
      if (key) out[key] = clean(v, 2000);
    }
    return Object.keys(out).length ? JSON.stringify(out) : null;
  } catch {
    return orNull(clean(text, 4000));
  }
}

/* ── Rate limiting ──────────────────────────────────────────────── */

function ratePerHour(env: Env): number {
  const n = Number.parseInt(env.RATE_LIMIT_PER_HOUR ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_RATE_PER_HOUR;
}

/**
 * A backstop, not a control. A WAF rate-limiting rule on the route is
 * better because it stops the request before it reaches the Worker and
 * bills; this is what exists without one. A no-op when KV is unbound.
 */
async function overRateLimit(ip: string, env: Env): Promise<boolean> {
  if (!env.RATE_LIMIT || !ip) return false;
  const hour = new Date().toISOString().slice(0, 13);
  const key = `rate:${hour}:${ip}`;
  try {
    const current = Number.parseInt((await env.RATE_LIMIT.get(key)) ?? "0", 10);
    if (current >= ratePerHour(env)) return true;
    await env.RATE_LIMIT.put(key, String(current + 1), {
      expirationTtl: 7200,
    });
    return false;
  } catch (e) {
    // A limiter that is down must not become a gate that is closed.
    console.warn("[relay] rate limiter unavailable:", e);
    return false;
  }
}

/* ── The row ────────────────────────────────────────────────────── */

type LeadRow = {
  id: string;
  kind: "lead" | "application";
  received_at: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  service: string | null;
  urgency: string | null;
  message: string | null;
  role: string | null;
  answers: string | null;
  resume_key: string | null;
  source: string | null;
};

function rowFrom(body: Record<string, unknown>, kind: LeadRow["kind"]): LeadRow {
  return {
    id: crypto.randomUUID(),
    kind,
    // Server time, always. A timestamp the caller supplies is one the
    // caller can backdate, and this column is used for ordering.
    received_at: new Date().toISOString(),
    name: orNull(clean(body.name, 120)),
    phone: orNull(clean(body.phone, 40)),
    email: orNull(clean(body.email, 160)),
    address: orNull(clean(body.address, 240)),
    service: orNull(clean(body.service, 120)),
    urgency: orNull(clean(body.urgency, 80)),
    message: orNull(clean(body.message, 4000)),
    role: orNull(clean(body.role, 120)),
    answers: cleanAnswers(body.answers),
    resume_key: orNull(clean(body.resumeKey ?? body.resume_key, 240)),
    source: orNull(clean(body.source, 400)),
  };
}

async function store(row: LeadRow, status: string, env: Env): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO leads (
       id, kind, received_at, name, phone, email, address, service,
       urgency, message, role, answers, resume_key, source, crm_status
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  )
    .bind(
      row.id,
      row.kind,
      row.received_at,
      row.name,
      row.phone,
      row.email,
      row.address,
      row.service,
      row.urgency,
      row.message,
      row.role,
      row.answers,
      row.resume_key,
      row.source,
      status
    )
    .run();
}

/* ── Forwarding ─────────────────────────────────────────────────── */

/**
 * One flat JSON object, the same shape for both kinds.
 *
 * Flat because almost every CRM's inbound webhook, Zapier step and
 * no-code mapper is happier with a flat object than a nested one, and
 * the cost of flatness here is nothing — these records have no depth to
 * lose. If the CRM eventually chosen wants a different shape, this
 * function is the only thing that changes.
 */
function crmPayload(row: LeadRow): Record<string, unknown> {
  return {
    id: row.id,
    type: row.kind,
    receivedAt: row.received_at,
    name: row.name ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    service: row.service ?? "",
    urgency: row.urgency ?? "",
    message: row.message ?? "",
    role: row.role ?? "",
    answers: row.answers ? JSON.parse(row.answers) : {},
    resumeKey: row.resume_key ?? "",
    source: row.source ?? "",
  };
}

/**
 * Send one row onward and record what happened.
 *
 * Never throws. Every outcome is a state written back to the row, which
 * is what lets the retry sweep below be a simple query rather than a
 * queue with its own failure modes.
 */
async function forward(row: LeadRow, env: Env): Promise<void> {
  if (!env.CRM_WEBHOOK_URL) return;

  let ok = false;
  let error = "";
  try {
    const res = await fetch(env.CRM_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.CRM_AUTH_TOKEN
          ? { Authorization: `Bearer ${env.CRM_AUTH_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(crmPayload(row)),
    });
    ok = res.ok;
    if (!ok) {
      // The body is often where a CRM says WHY it refused, and a status
      // code alone has sent people hunting for hours.
      const detail = await res.text().catch(() => "");
      error = `${res.status} ${detail.slice(0, 500)}`;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  try {
    await env.DB.prepare(
      `UPDATE leads
          SET crm_status = ?, crm_attempts = crm_attempts + 1,
              crm_error = ?, crm_sent_at = ?
        WHERE id = ?`
    )
      .bind(
        ok ? "sent" : "failed",
        ok ? null : error.slice(0, 1000),
        ok ? new Date().toISOString() : null,
        row.id
      )
      .run();
  } catch (e) {
    // The lead is safe either way; only the bookkeeping is lost.
    console.error(`[relay] could not record CRM result for ${row.id}:`, e);
  }

  if (!ok) console.error(`[relay] CRM refused ${row.id}: ${error}`);
}

/**
 * The retry sweep, run on a schedule.
 *
 * Oldest first, so a backlog drains in the order it arrived rather than
 * newest-first — somebody who asked for a roof assessment on Tuesday
 * should not sit behind Friday's just because the CRM came back on
 * Friday. Rows past MAX_CRM_ATTEMPTS are left alone and stay visible in
 * the table as failed; something that has refused six times is a
 * configuration problem, and hammering it forever hides that.
 */
async function retryFailed(env: Env): Promise<number> {
  if (!env.CRM_WEBHOOK_URL) return 0;

  const { results } = await env.DB.prepare(
    `SELECT * FROM leads
      WHERE crm_status IN ('failed', 'pending', 'disabled')
        AND crm_attempts < ?
      ORDER BY received_at ASC
      LIMIT ?`
  )
    .bind(MAX_CRM_ATTEMPTS, RETRY_BATCH)
    .all<LeadRow>();

  for (const row of results ?? []) await forward(row, env);
  return (results ?? []).length;
}

/* ── Export ─────────────────────────────────────────────────────── */

const CSV_COLUMNS = [
  "id",
  "kind",
  "received_at",
  "name",
  "phone",
  "email",
  "address",
  "service",
  "urgency",
  "message",
  "role",
  "answers",
  "resume_key",
  "source",
  "crm_status",
] as const;

/**
 * One CSV cell.
 *
 * The leading apostrophe on a value starting with =, +, - or @ is not
 * cosmetic: Excel and Sheets treat those as formulas, so a "name" of
 * `=cmd|'/c calc'!A1` becomes code the moment somebody opens the export
 * on an office machine. This table is filled in by strangers through a
 * public form, which is exactly the threat model that attack was
 * written for.
 */
function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/* ── Handler ────────────────────────────────────────────────────── */

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = req.headers.get("Origin");
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }

    if (path === "/health") {
      // Deliberately says nothing about configuration. A health check
      // that reports which secrets are set is a reconnaissance endpoint.
      return json({ ok: true }, 200, origin, env);
    }

    /* ── The export ─────────────────────────────────────────────── */
    if (path === "/export.csv") {
      if (req.method !== "GET") {
        return reject("wrong method for export", 405, origin, env);
      }
      const token = (req.headers.get("Authorization") ?? "").replace(
        /^Bearer\s+/i,
        ""
      );
      // No token configured means the route is closed, not open. The
      // table holds strangers' addresses and phone numbers.
      if (!env.EXPORT_TOKEN || !token || token !== env.EXPORT_TOKEN) {
        return reject("bad or missing export token", 401, origin, env, "Not authorised.");
      }

      const { results } = await env.DB.prepare(
        `SELECT ${CSV_COLUMNS.join(", ")} FROM leads ORDER BY received_at DESC`
      ).all<Record<string, unknown>>();

      const rows = results ?? [];
      const csv = [
        CSV_COLUMNS.join(","),
        ...rows.map((r) => CSV_COLUMNS.map((c) => csvCell(r[c])).join(",")),
      ].join("\r\n");

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="ctl-leads-${new Date()
            .toISOString()
            .slice(0, 10)}.csv"`,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    /* ── Intake ─────────────────────────────────────────────────── */
    const isLead = path === "/lead";
    const isApplication = path === "/application";
    if (!isLead && !isApplication) {
      return reject(`no route for ${path}`, 404, origin, env, "Not found.");
    }
    if (req.method !== "POST") {
      return reject("wrong method", 405, origin, env);
    }

    // /lead is called by a browser, so it is origin-gated — which stops
    // another WEBSITE posting on a visitor's behalf and nothing else; a
    // script sets Origin to whatever it likes.
    //
    // /application is called by the careers Worker, server to server,
    // so it has no Origin to check and uses a shared secret instead.
    if (isApplication) {
      const secret = req.headers.get("X-Ingest-Secret") ?? "";
      if (!env.INGEST_SECRET || secret !== env.INGEST_SECRET) {
        return reject("bad or missing ingest secret", 401, origin, env, "Not authorised.");
      }
    } else {
      const list = allowedOrigins(env);
      if (list.length && origin && !list.includes(origin)) {
        return reject(`origin not allowed: ${origin}`, 403, origin, env);
      }
    }

    const ip = req.headers.get("CF-Connecting-IP") ?? "";
    if (isLead && (await overRateLimit(ip, env))) {
      return reject(`rate limit hit for ${ip}`, 429, origin, env, "Too many submissions. Please call us.");
    }

    let body: Record<string, unknown>;
    try {
      const parsed = await req.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("not an object");
      }
      body = parsed as Record<string, unknown>;
    } catch (e) {
      return reject(`unparseable body: ${e}`, 400, origin, env);
    }

    const row = rowFrom(body, isApplication ? "application" : "lead");

    // A record with no way to reach the person is not a lead. This is
    // the only content rule: everything else on both forms is optional
    // somewhere.
    if (!row.phone && !row.email) {
      return reject("no phone and no email", 400, origin, env, "Please include a phone number or an email.");
    }

    const status = env.CRM_WEBHOOK_URL ? "pending" : "disabled";
    try {
      await store(row, status, env);
    } catch (e) {
      // The one failure the caller is told about, because it is the one
      // that means the lead is genuinely not written down anywhere here.
      console.error("[relay] could not store lead:", e);
      return reject(`store failed: ${e}`, 500, origin, env);
    }

    // Answer now; forward on the way out. The caller's form is not made
    // to wait on somebody else's CRM, and the row is already safe.
    if (env.CRM_WEBHOOK_URL) ctx.waitUntil(forward(row, env));

    return json({ ok: true, id: row.id }, 200, origin, env);
  },

  /**
   * The retry sweep. Scheduled in wrangler.toml.
   *
   * This is what turns "the CRM was down" from a lost lead into a late
   * one, and it is the reason the forward is allowed to fail quietly.
   */
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      retryFailed(env)
        .then((n) => {
          if (n) console.log(`[relay] retried ${n} lead(s)`);
        })
        .catch((e) => console.error("[relay] retry sweep failed:", e))
    );
  },
} satisfies ExportedHandler<Env>;
