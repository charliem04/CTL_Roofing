/**
 * ════════════════════════════════════════════════════════════════════
 *  THE CRM BOUNDARY — one seam, so the CRM stays a decision and not a
 *  rewrite.
 *
 *  The relay was written before the CRM was chosen, and it forwarded to
 *  a URL in a secret precisely so that choice could be deferred without
 *  losing leads in the meantime. That works for "post this JSON
 *  somewhere", which is what a Zapier catch hook or a no-code mapper
 *  wants. It does not work for a real CRM API, which has its own
 *  endpoints, its own auth, its own idea of what a contact looks like,
 *  and — the part that actually forces this directory to exist —
 *  deduplication rules that need a lookup before the write.
 *
 *  So forwarding is an adapter. Each one owns its request shaping, its
 *  endpoint and its auth; the Worker owns the row, the ordering and the
 *  bookkeeping. Adding JobNimbus or AccuLynx later is one new file next
 *  to this one and one line in ./index.ts, not a change to forward().
 *
 *  ── WHAT AN ADAPTER MAY NOT DO ──────────────────────────────────────
 *
 *  It may not throw, and it may not touch the database. Every outcome
 *  comes back as a CrmOutcome and index.ts records it in one place,
 *  which is what keeps the retry sweep a plain query over crm_status
 *  rather than a queue with its own failure modes.
 *
 *  ── WHY THE IMPORTS CARRY `.ts` ─────────────────────────────────────
 *
 *  esbuild (and therefore wrangler) resolves the literal path, and so
 *  does node. That is what lets `npm test` exercise the pure parts of
 *  an adapter with no build step and no test framework — which matters
 *  here, because the CRM account these adapters talk to does not exist
 *  yet and cannot be integration-tested against.
 * ════════════════════════════════════════════════════════════════════
 */

/* ── The row ────────────────────────────────────────────────────── */

export type LeadKind = "lead" | "application";

/**
 * One record in the lead book, as everything downstream of the insert
 * sees it. Mirrors schema.sql: NULL means "this form does not ask",
 * which is different from empty, and is a distinction adapters are
 * expected to preserve rather than flatten into "".
 */
export type LeadRow = {
  id: string;
  kind: LeadKind;
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

/* ── Configuration the adapters read ────────────────────────────── */

export interface CrmEnv {
  /**
   * Which adapter forwards: "generic" (the default) or "hubspot".
   *
   * An unrecognised value is treated as no CRM at all rather than
   * quietly falling back, because a typo here would otherwise throw
   * every lead at whatever CRM_WEBHOOK_URL happens to hold. Rows are
   * stored 'disabled' instead, and the sweep delivers the backlog once
   * the spelling is fixed.
   */
  CRM_ADAPTER?: string;

  /**
   * Where the `generic` adapter forwards. Unset is a supported state,
   * not a misconfiguration: rows are stored with crm_status='disabled'
   * and /export.csv is how they get into whatever is chosen later.
   */
  CRM_WEBHOOK_URL?: string;

  /**
   * Sent as `Authorization: Bearer …` on the forward. The `generic`
   * adapter includes it when set; the `hubspot` adapter REQUIRES it —
   * there it is the private app access token, and without one that
   * adapter reports itself unconfigured rather than sending requests
   * that could only 401.
   */
  CRM_AUTH_TOKEN?: string;

  /**
   * Whether job applications are forwarded as well as leads. Off
   * unless set to 1/true/yes/on, and read only by adapters that
   * choose to honour it — the `generic` webhook takes both kinds, as
   * it always has.
   *
   * Off by default for HubSpot because a sales contact list is not an
   * applicant tracker. Applicants in it put every "here are your leads"
   * view out by however many people applied that month, spend the same
   * contact allowance as customers, and carry different retention
   * obligations — the résumé side of this system promises twelve
   * months, and the CRM knows nothing about that promise.
   *
   * Nothing is lost either way: applications are stored in D1 and
   * appear in /export.csv regardless of this setting.
   */
  CRM_FORWARD_APPLICATIONS?: string;
}

const TRUTHY = new Set(["1", "true", "yes", "on"]);

export function forwardsApplications(env: CrmEnv): boolean {
  return TRUTHY.has((env.CRM_FORWARD_APPLICATIONS ?? "").trim().toLowerCase());
}

/* ── The contract ───────────────────────────────────────────────── */

export type FetchLike = typeof fetch;

/**
 * What an adapter reports back. Never a thrown error — see the header.
 *
 * `spendsAttempt` is the field worth understanding. A row gives up
 * after MAX_CRM_ATTEMPTS, so an attempt is a budget, and a throttle is
 * not a refusal: a CRM answering 429 means "not now", and spending one
 * of six tries on it would eventually strand a perfectly good lead
 * because the office had a busy afternoon. Anything that is a real
 * rejection — a bad payload, a property that does not exist, a revoked
 * token — spends one, so a permanent misconfiguration stops hammering
 * and stays visible in the table as failed.
 */
export type CrmOutcome =
  | { ok: true }
  | { ok: false; error: string; spendsAttempt: boolean };

export interface CrmAdapter {
  readonly id: string;

  /** Whether this adapter has what it needs to send anything at all. */
  configured(env: CrmEnv): boolean;

  /** Whether this particular row is one this CRM should receive. */
  accepts(row: LeadRow, env: CrmEnv): boolean;

  /**
   * Send one row. The fetch is injectable so the flow — dedup,
   * conflict, throttle, refusal — can be exercised without a network
   * or a CRM account, neither of which exists when this is written.
   */
  send(row: LeadRow, env: CrmEnv, doFetch?: FetchLike): Promise<CrmOutcome>;
}
