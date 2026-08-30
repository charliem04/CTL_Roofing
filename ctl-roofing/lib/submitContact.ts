/**
 * ════════════════════════════════════════════════════════════════════
 *  CONTACT SUBMIT — where a lead actually goes.
 *
 *  Two destinations, deliberately separate:
 *
 *  1. EMAIL, via Web3Forms. This is the one that must work; it is what
 *     puts the lead in the office inbox. Configure with
 *       NEXT_PUBLIC_WEB3FORMS_KEY   the access key from web3forms.com
 *       NEXT_PUBLIC_FORM_ENDPOINT   optional override of the API URL
 *     Web3Forms access keys are designed to be public and live in
 *     client-side markup — this is a static site, so there is nowhere
 *     to hide one anyway. The key identifies the destination inbox; it
 *     grants no account access. Rotate it from the Web3Forms dashboard
 *     if it starts attracting spam.
 *
 *  2. THE CRM, via NEXT_PUBLIC_LEAD_WEBHOOK_URL. Fired in parallel and
 *     never awaited, so a CRM outage cannot cost you the email or show
 *     the customer an error. Left unset until a CRM is chosen; when one
 *     is, most accept a JSON webhook and this is a single env var. If
 *     the chosen CRM wants a different body shape, change `crmBody`
 *     below and nothing else.
 *
 *  A form with no email destination configured now FAILS rather than
 *  pretending to succeed. Silently swallowing a lead is worse than
 *  telling someone to phone instead.
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
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
    service: payload.service,
    urgency: payload.urgency,
    message: payload.message,
  });

  const meta = {
    source: typeof window !== "undefined" ? window.location.href : "",
    submittedAt: new Date().toISOString(),
  };

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
