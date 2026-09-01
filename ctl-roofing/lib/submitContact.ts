/**
 * ════════════════════════════════════════════════════════════════════
 *  CONTACT SUBMIT — where a lead actually goes.
 *
 *  Straight to Web3Forms from the browser. No server, no Worker, no
 *  build step between the form and the office inbox.
 *
 *  That is a deliberate choice, not a shortcut. The contact form is the
 *  revenue path: if it is down, the business is not taking work. A
 *  static page posting to a hosted form service has almost nothing that
 *  can break — no deploy of ours, no runtime of ours, no secret of ours
 *  to expire. Putting our own code in that path would add a thing that
 *  can fail at 2am, in exchange for hardening a form whose worst
 *  realistic outcome is spam in an inbox.
 *
 *  ── ABOUT THE ACCESS KEY ────────────────────────────────────────────
 *
 *  It ships in the JavaScript this page downloads. That is by design on
 *  Web3Forms' side: the key names a destination inbox and grants no
 *  account access, so the exposure is "someone can post to the office
 *  inbox", not "someone can read the account". Publishable is not the
 *  same as private, though — if the key starts drawing spam, rotate it
 *  from the Web3Forms dashboard, and turn on their spam protection
 *  before reaching for anything more elaborate.
 *
 *  NOT CONFIGURED: the form refuses and tells the visitor to phone.
 *  Silently swallowing a lead is worse than saying so.
 *
 *  ── VALIDATION ──────────────────────────────────────────────────────
 *
 *  Everything checked here is checked in a browser, and anything a
 *  browser checks can be skipped by not using a browser. The scrubbing
 *  below is therefore for the benefit of whoever reads the notification
 *  email — a name with a carriage return in it arrives as one inert
 *  line rather than something header-shaped — and not a security
 *  control. Web3Forms is the side that has to be robust to what it is
 *  sent.
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
};

export type SubmitResult = { ok: true } | { ok: false; error: string };

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";
const FORM_ENDPOINT =
  process.env.NEXT_PUBLIC_FORM_ENDPOINT || "https://api.web3forms.com/submit";
const WEBHOOK_URL = process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL ?? "";

/**
 * Strip control characters and collapse whitespace.
 *
 * These strings become an email. A run of control bytes is a mangled
 * message somebody has to squint at, and a newline inside a name is the
 * kind of thing that reads as a header to whatever renders it.
 */
function scrub(value: string, max: number): string {
  return (
    value
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max)
  );
}

/** Whether this build has anywhere to send a lead. */
export function contactConfigured(): boolean {
  return WEB3FORMS_KEY.length > 0;
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

  // The CRM gets the flat lead, not Web3Forms' envelope. Deliberately
  // not awaited: a CRM outage must not cost a lead.
  if (WEBHOOK_URL) {
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, ...meta }),
    }).catch((e) => console.warn("[contact] CRM webhook failed:", e));
  }

  if (!WEB3FORMS_KEY) {
    // Fail loudly and visibly. The old behaviour here was to return
    // success with nothing sent, which is how a site ships looking fine
    // and quietly loses every lead it takes.
    console.error(
      "[contact] NEXT_PUBLIC_WEB3FORMS_KEY is not set — no email destination is configured, so this submission was not delivered."
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
        // The scrubbed name, not payload.name — an email subject is the
        // one field where a stray newline is genuinely header-shaped.
        subject: `Assessment request — ${fields.name ?? ""}`,
        from_name: "ctlpro.com",
        ...fields,
        ...meta,
      }),
    });

    // Web3Forms answers 200 with {success:false} for its own rejections
    // (bad key, spam heuristics), so the status alone is not the answer.
    const data = await res.json().catch(() => null);
    const accepted = res.ok && (data === null || data.success !== false);

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
