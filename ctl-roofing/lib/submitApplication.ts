import { client } from "@/client.config";

/**
 * ════════════════════════════════════════════════════════════════════
 *  APPLICATION SUBMIT — the one request in this site that carries a file.
 *
 *  Everything else here is a static export talking to a third-party
 *  form service over JSON. A résumé cannot go that way: there is no
 *  server to receive multipart, and the contact form's JSON path
 *  cannot carry a file.
 *
 *  So this posts to a Cloudflare Worker — workers/careers-upload in
 *  this repo — which validates the upload and writes it to a private
 *  R2 bucket. Set the deployed URL in:
 *
 *      NEXT_PUBLIC_CAREERS_ENDPOINT
 *
 *  Unset, the form refuses to submit and points the applicant at the
 *  office email instead. That is the same rule the contact form
 *  follows and it matters more here, not less: somebody applying for a
 *  job has spent real effort on that document, and a form that appears
 *  to accept it and drops it costs them a job they think they applied
 *  for.
 *
 *  ── WHAT IS VALIDATED WHERE ─────────────────────────────────────────
 *
 *  The checks below are for the applicant's benefit — instant feedback
 *  instead of a round trip. They are NOT security. Every one of them is
 *  repeated in the Worker, which is the only side that counts, because
 *  anything running in a browser can be skipped by not using a browser.
 * ════════════════════════════════════════════════════════════════════
 */

export type ApplicationPayload = {
  name: string;
  phone: string;
  email: string;
  /** Which role, or "" when they are applying generally. */
  role: string;
  /** Questionnaire answers, question → answer. */
  answers: Record<string, string>;
  resume: File | null;
  /** honeypot — must be empty; bots fill it */
  company?: string;
  /** Cloudflare Turnstile token, when the widget is configured. */
  turnstileToken?: string;
};

export type SubmitResult = { ok: true } | { ok: false; error: string };

const ENDPOINT = process.env.NEXT_PUBLIC_CAREERS_ENDPOINT ?? "";

/** Keep in step with MAX_UPLOAD_BYTES in workers/careers-upload. */
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;

const EMAIL_INSTEAD = `We couldn't send that. Please email your résumé to ${client.email} instead — we don't want you to lose the application.`;

export function applicationsConfigured(): boolean {
  return ENDPOINT.length > 0;
}

/** Client-side only. The Worker re-checks all of this. */
export function checkResume(file: File | null): string | null {
  if (!file) return "Please attach your résumé.";
  if (file.size === 0) return "That file looks empty. Try attaching it again.";
  if (file.size > MAX_RESUME_BYTES) {
    return "That file is over 5MB. Please attach a smaller PDF or Word document.";
  }
  const lower = file.name.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return "Please attach a PDF or a Word document.";
  }
  return null;
}

export async function submitApplication(
  payload: ApplicationPayload
): Promise<SubmitResult> {
  // Honeypot: report success so bots learn nothing, send nothing.
  if (payload.company) return { ok: true };

  const fileError = checkResume(payload.resume);
  if (fileError) return { ok: false, error: fileError };

  if (!ENDPOINT) {
    console.error(
      "[careers] NEXT_PUBLIC_CAREERS_ENDPOINT is not set — the upload Worker is not wired up, so this application was not delivered."
    );
    return { ok: false, error: EMAIL_INSTEAD };
  }

  const body = new FormData();
  body.append("name", payload.name);
  body.append("phone", payload.phone);
  body.append("email", payload.email);
  body.append("role", payload.role);
  // One JSON blob rather than a field per question, so adding a
  // question to content/careers.ts needs no change here or in the Worker.
  body.append("answers", JSON.stringify(payload.answers));
  body.append("resume", payload.resume as File);
  if (payload.turnstileToken) {
    body.append("cf-turnstile-response", payload.turnstileToken);
  }

  try {
    // No Content-Type header: the browser must set the multipart
    // boundary itself, and setting it by hand produces a body the
    // Worker cannot parse.
    const res = await fetch(ENDPOINT, { method: "POST", body });
    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;

    if (!res.ok || data?.ok !== true) {
      console.error("[careers] upload rejected:", res.status, data);
      return { ok: false, error: data?.error || EMAIL_INSTEAD };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "Couldn't reach the server. Check your connection and try again, or email it to us.",
    };
  }
}
