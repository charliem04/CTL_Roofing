/**
 * ────────────────────────────────────────────────────────────────────
 *  GENERIC — the original forward, moved behind the adapter boundary
 *  and otherwise untouched.
 *
 *  Same URL, same headers, same body, same error string. This is the
 *  default and it stays the default: the thing on the far end may be a
 *  Zapier catch hook somebody wired up by hand, and a refactor of ours
 *  is not a reason for it to start receiving a different shape.
 * ────────────────────────────────────────────────────────────────────
 */

import type { CrmAdapter, LeadRow } from "./types.ts";

/**
 * One flat JSON object, the same shape for both kinds.
 *
 * Flat because almost every CRM's inbound webhook, Zapier step and
 * no-code mapper is happier with a flat object than a nested one, and
 * the cost of flatness here is nothing — these records have no depth to
 * lose. This is the `generic` adapter's wire format and nothing else's:
 * a CRM with a real API gets shaped by its own adapter instead.
 */
export function crmPayload(row: LeadRow): Record<string, unknown> {
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

export const generic: CrmAdapter = {
  id: "generic",

  configured: (env) => Boolean(env.CRM_WEBHOOK_URL),

  // Both kinds, as before. The unified lead book is the point of this
  // Worker, and a webhook pointed at a spreadsheet wants the
  // applications too.
  accepts: () => true,

  async send(row, env, doFetch = fetch) {
    const url = env.CRM_WEBHOOK_URL;
    if (!url) {
      return {
        ok: false,
        error: "CRM_WEBHOOK_URL is not set",
        spendsAttempt: false,
      };
    }
    try {
      const res = await doFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(env.CRM_AUTH_TOKEN
            ? { Authorization: `Bearer ${env.CRM_AUTH_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(crmPayload(row)),
      });
      if (res.ok) return { ok: true };

      // The body is often where a CRM says WHY it refused, and a status
      // code alone has sent people hunting for hours.
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        error: `${res.status} ${detail.slice(0, 500)}`,
        spendsAttempt: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        spendsAttempt: true,
      };
    }
  },
};
