/**
 * ════════════════════════════════════════════════════════════════════
 *  CONTACT SUBMIT — where a lead actually goes.
 *
 *  TWO PATHS, and the site prefers the first:
 *
 *  1. THROUGH THE WORKER, when NEXT_PUBLIC_LEAD_ENDPOINT is set. The
 *     enquiry posts to the /lead route of workers/careers-upload, which
 *     verifies Turnstile, rate-limits, scrubs the fields and then talks
 *     to Web3Forms using a key held as a Worker secret. This is the
 *     hardened path and the one to launch with.
 *
 *  2. STRAIGHT TO WEB3FORMS, when only NEXT_PUBLIC_WEB3FORMS_KEY is
 *     set. Still works, still fails loudly — but the access key ships
 *     inside the JavaScript this page downloads, so anyone can lift it
 *     and post to the office inbox directly, and the only thing between
 *     a bot and that inbox is a honeypot. Kept so the site can take
 *     leads before the Worker is deployed, not because it is fine.
 *
 *  The key being public is not a Web3Forms flaw — it names a
 *  destination inbox and grants no account access, and a static site
 *  has nowhere to hide one. That is exactly why the Worker exists.
 *
 *  3. NEITHER CONFIGURED: the form refuses and tells the visitor to
 *     phone. Silently swallowing a lead is worse than saying so.
 *
 *  ── VALIDATION ──────────────────────────────────────────────────────
 *
 *  Field scrubbing here is for the benefit of whatever renders the
 *  notification email, and it is repeated in the Worker. Anything a
 *  browser checks can be skipped by not using a browser, so on path 1
 *  the Worker is the side that counts. On path 2 there is no such
 *  side, which is the other reason to prefer path 1.
 * ════════════════════════════════════════════════════════════════════
 */

export type ContactPayload = {
  name: string;
  phone: string;
  /** Empty when the form does not ask for it (CTL's does not) */
  email: string;
  /** Property the work is for; empty when the form does not ask */
  address: string;
  /** Which job — one of client.form.serviceOptions */
  service: string;
  /** How soon; empty when the form does not ask */
  urgency: string;
  /** Free-text detail; optional on the form */
  message: string;
  /** honeypot — must be empty; bots fill it */
  company?: string;
  /** Cloudflare Turnstile token, when the widget is configured. */
  turnstileToken?: string;
};

export type SubmitResult = { ok: true } | { ok: false; error: string };

const LEAD_ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT ?? "";

/**
 * The fallback key.
 *
 * Worth being blunt: Next inlines every NEXT_PUBLIC_* value at build
 * time whether or not the branch reading it ever runs. Preferring the
 * Worker path does NOT, on its own, keep this key out of the
 * JavaScript — leave the variable set and the literal is still in the
 * bundle, which is the exact thing routing through the Worker was
 * meant to fix. Writing it behind a check does not help either; the
 * minifier will not reliably fold it away (tried, verified, it stays).
 *
 * The only thing that actually works is not setting the variable. So
 * next.config.mjs fails the build when both are set, rather than
 * leaving it to whoever configures Cloudflare Pages to remember.
 */
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";
const FORM_ENDPOINT =
  process.env.NEXT_PUBLIC_FORM_ENDPOINT || "https://api.web3forms.com/submit";
const WEBHOOK_URL = process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL ?? "";

/**
 * Strip control characters and collapse whitespace.
 *
 * These strings become an email. A carriage return in a subject or a
 * header-shaped line in a name is injection, and a run of control
 * bytes is a mangled message that somebody has to squint at. Mirrors
 * cleanText() in the Worker.
 */
function scrub(value: string, max: number): string {
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Which path this build will take. Surfaced for the dev-only notice. */
export function contactRoute(): "worker" | "direct" | "none" {
  if (LEAD_ENDPOINT) return "worker";
  if (WEB3FORMS_KEY) return "direct";
  return "none";
}

const CALL_INSTEAD =
  "We couldn't send that. Please call us instead — we don't want to lose your request.";

/** Drop empty strings so the notification email has no blank rows. */
function compact(o: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== ""));
}

export async function submitContact(
  payload: ContactPayload
): Promise<SubmitResult> {
  // Honeypot: report success so bots don't learn they were caught, but
  // send nothing anywhere.
  if (payload.company) return { ok: true };

  const fields = compact({
    name: scrub(payload.name, 120),
    phone: scrub(payload.phone, 40),
    email: scrub(payload.email, 160),
    address: scrub(payload.address, 240),
    service: scrub(payload.service, 120),
    urgency: scrub(payload.urgency, 80),
    message: scrub(payload.message, 4000),
  });

  const meta = {
    source: typeof window !== "undefined" ? window.location.href : "",
    submittedAt: new Date().toISOString(),
  };

  /* ── Path 1: through the Worker ─────────────────────────────────── */
  if (LEAD_ENDPOINT) {
    const body = new FormData();
    for (const [k, v] of Object.entries(fields)) body.append(k, v);
    body.append("source", meta.source);
    if (payload.turnstileToken) {
      body.append("cf-turnstile-response", payload.turnstileToken);
    }
    try {
      // No Content-Type header — the browser sets the multipart
      // boundary, and setting it by hand produces a body the Worker
      // cannot parse.
      const res = await fetch(LEAD_ENDPOINT, { method: "POST", body });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!res.ok || data?.ok !== true) {
        console.error("[contact] lead endpoint rejected:", res.status, data);
        return { ok: false, error: data?.error || CALL_INSTEAD };
      }
      return { ok: true };
    } catch {
      return {
        ok: false,
        error:
          "Couldn't reach the server. Check your connection and try again, or call us.",
      };
    }
  }

  /* ── Path 2: straight to Web3Forms, key and all ─────────────────── */

  // The CRM gets the flat lead, not Web3Forms' envelope.
  const crmBody = JSON.stringify({ ...fields, ...meta });
  if (WEBHOOK_URL) {
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: crmBody,
    }).catch((e) => console.warn("[contact] CRM webhook failed:", e));
  }

  if (!WEB3FORMS_KEY) {
    // Fail loudly and visibly. The old behaviour here was to return
    // success with nothing sent, which is how a site ships looking fine
    // and quietly loses every lead it takes.
    console.error(
      "[contact] Neither NEXT_PUBLIC_LEAD_ENDPOINT nor NEXT_PUBLIC_WEB3FORMS_KEY is set — no email destination is configured, so this submission was not delivered."
    );
    return { ok: false, error: CALL_INSTEAD };
  }

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Assessment request — ${payload.name}`,
        from_name: "ctlpro.com",
        ...fields,
        ...meta,
      }),
    });

    // Web3Forms answers 200 with {success:false} for its own rejections
    // (bad key, spam heuristics), so the status alone is not the answer.
    const data = await res.json().catch(() => null);
    const accepted =
      res.ok && (data === null || data.success !== false);

    if (!accepted) {
      console.error("[contact] Web3Forms rejected the submission:", data);
      return { ok: false, error: CALL_INSTEAD };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "Couldn't reach the server. Check your connection and try again, or call us.",
    };
  }
}
