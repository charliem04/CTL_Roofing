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
 *  ── THE TWO READ PATHS, AND WHAT GUARDS EACH ───────────────────────
 *
 *  Nothing here is readable without passing something. /export.csv
 *  wants a bearer token, because the table holds strangers' names,
 *  phone numbers and addresses. /resume/:leadId hands back the résumé
 *  file a job applicant uploaded, and is guarded by CLOUDFLARE ACCESS
 *  IN FRONT OF THE WORKER rather than by code in it.
 *
 *  That split is deliberate. The office needs to click a link in a CRM
 *  record and get a file; a browser following a link cannot attach an
 *  Authorization header, so a token on that route would only be a token
 *  in the URL, which is a credential in every CRM record, every browser
 *  history and every email that forwards the lead. Access puts a Google
 *  Workspace sign-in in front of the route and costs nothing at CTL's
 *  size. The R2 bucket stays private either way — see the R2 comment in
 *  wrangler.toml, and docs/LAUNCH-CREDENTIALS.md for the Access
 *  application itself, which is configuration and not code.
 *
 *  The consequence worth stating plainly: the résumé route's
 *  authentication lives somewhere this file cannot see, so it cannot be
 *  verified from here. The lead id in the path is an unguessable v4
 *  UUID, which is worth having and is NOT access control. Deploying
 *  this Worker on a hostname Access does not cover leaves that route
 *  open to anyone holding a lead id.
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
   * wants one. Most do — HubSpot's Forms API is the exception, see
   * CRM_ADAPTERS.
   */
  CRM_AUTH_TOKEN?: string;

  /**
   * Where job applications are forwarded, when they should not go where
   * customer leads go. Unset = applications follow CRM_WEBHOOK_URL,
   * which is exactly the previous behaviour.
   *
   * Set it and applicants stop landing in a sales CRM's contact list.
   * That is worth doing for two unrelated reasons: a free CRM tier has
   * a contact cap that job applicants will quietly burn through, and an
   * applicant carries different retention obligations from a customer —
   * the privacy policy promises their file is gone in twelve months,
   * and that is a promise about our storage, not about a CRM's.
   */
  CRM_APPLICATION_WEBHOOK_URL?: string;

  /**
   * Which shape to send. A key of CRM_ADAPTERS; unset means "generic",
   * the flat JSON object this Worker has always sent.
   */
  CRM_ADAPTER?: string;

  /**
   * This Worker's own public origin, e.g. https://relay.ctlpro.com —
   * scheme and host, no trailing slash, no path.
   *
   * Used to build the absolute résumé URL that goes to the CRM. It is a
   * variable rather than something derived from the incoming request
   * because forward() also runs from the scheduled retry sweep, where
   * there is no request to derive it from. A link that is right on the
   * request path and empty on the retry path is the kind of bug that
   * only ever shows up in the rows nobody looked at.
   */
  RELAY_PUBLIC_ORIGIN?: string;

  /**
   * Read-only handle on the résumé bucket, for GET /resume/:leadId.
   *
   * The careers Worker owns the write side and keeps it; this binding
   * exists only so a file that used to be reachable through the R2
   * dashboard or `wrangler r2 object get` is reachable by clicking a
   * link in a CRM record. The bucket itself stays PRIVATE — no r2.dev
   * URL, no custom domain — because what makes this route safe is
   * Cloudflare Access in front of it, not the bucket being open.
   *
   * Optional in the type on purpose: a deploy that predates the binding
   * should lose one route to an honest 503 rather than break the intake
   * routes that are the reason this Worker exists.
   */
  RESUMES?: R2Bucket;

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

/* ── The résumé link ────────────────────────────────────────────── */

/**
 * The absolute URL of this row's résumé, or "" if there is not one.
 *
 * This is what replaced sending the bare R2 object key to the CRM. The
 * key — `applications/2026/09/<uuid>-cv.pdf` — was honest and useless:
 * the person looking at the CRM record cannot do anything with it
 * without the R2 dashboard or wrangler, so in practice the résumé was
 * not attached to the lead at all. A URL somebody can click is the
 * difference between a pipeline that runs and a pipeline that works.
 *
 * Why not a presigned R2 URL, which needs no Worker route: R2's
 * S3-compatible signing tops out at seven days. A CRM record whose
 * résumé link dies after a week is worse than one that never claimed to
 * have a link, because the failure arrives long after anybody is
 * watching for it. Why not push the file into the CRM itself: that
 * copies a CV into a second retention regime nobody here controls,
 * which makes the privacy policy's twelve-month promise untrue.
 *
 * The key is kept alongside it. It costs one field and it is what
 * somebody needs to find the object by hand when the URL is the thing
 * that is broken.
 */
function resumeUrl(row: LeadRow, env: Env): string {
  if (!row.resume_key) return "";

  const origin = (env.RELAY_PUBLIC_ORIGIN ?? "").trim().replace(/\/+$/, "");
  if (!origin) {
    // Loud, because the row still forwards and looks fine: the office
    // just silently gets an application with no way to read the CV.
    console.warn(
      `[relay] RELAY_PUBLIC_ORIGIN is not set — ${row.id} forwarded without a résumé link`
    );
    return "";
  }
  return `${origin}/resume/${encodeURIComponent(row.id)}`;
}

/* ── CRM adapters ───────────────────────────────────────────────── */

/**
 * One CRM's idea of a request: a body, and whatever that body needs.
 *
 * ── WHY AN ADAPTER RATHER THAN AN `if` IN forward() ─────────────────
 *
 * The demo runs on HubSpot Free and the client will likely move to
 * JobNimbus or AccuLynx, so this shape changes at least once more. The
 * forward path is the part that must NOT change with it: it holds the
 * ordering guarantee, the attempt cap, the error capture and the retry
 * bookkeeping, and each of those is a thing you only get right once.
 *
 * So adding a CRM is writing one function and adding one line to
 * CRM_ADAPTERS. It cannot reach the code that decides whether a lead is
 * safe, which is the property worth protecting — a mapping mistake in a
 * new adapter costs a badly-shaped record the retry will show you, not
 * a lost lead.
 */
type CrmRequest = {
  contentType: string;
  body: string;
  /** Anything beyond Content-Type and the optional bearer token. */
  headers?: Record<string, string>;
};

type CrmAdapter = (row: LeadRow, env: Env) => CrmRequest;

/**
 * The questionnaire as an object, whatever is actually in the column.
 *
 * cleanAnswers() is allowed to store a plain string when what arrived
 * did not parse as an object — it keeps the text rather than dropping
 * the only thing the applicant wrote. So a bare JSON.parse() here would
 * throw on exactly those rows, and a row that throws on every forward
 * is a row that retries six times and then sits failed forever with a
 * SyntaxError where the CRM's own reason should be.
 */
function parsedAnswers(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Fall through: it is text, not an object.
  }
  return { answers: raw };
}

/**
 * One flat JSON object, the same shape for both kinds. The default.
 *
 * Flat because almost every CRM's inbound webhook, Zapier step and
 * no-code mapper is happier with a flat object than a nested one, and
 * the cost of flatness here is nothing — these records have no depth to
 * lose.
 *
 * This is also the shape to point a Zapier or Make webhook at, which is
 * still the right answer for any CRM whose own API is not worth an
 * adapter: the mapping lives in their UI instead of in this file.
 */
function crmPayload(row: LeadRow, env: Env): Record<string, unknown> {
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
    answers: parsedAnswers(row.answers),
    // The clickable one first, because it is the one a person uses.
    // The key stays for support: it is how you find the object by hand.
    resumeUrl: resumeUrl(row, env),
    resumeKey: row.resume_key ?? "",
    source: row.source ?? "",
  };
}

const genericAdapter: CrmAdapter = (row, env) => ({
  contentType: "application/json",
  body: JSON.stringify(crmPayload(row, env)),
});

/**
 * One name field into HubSpot's two.
 *
 * Both forms ask for a name once, because making a homeowner split
 * their own name into two boxes is friction that buys nothing. HubSpot
 * forms have firstname and lastname, so the split happens here: first
 * token to firstname, everything after it to lastname.
 *
 * It is wrong for some names and there is no rule that is right for all
 * of them. What makes it acceptable is that nothing is lost — the full
 * string as the person typed it is in D1, in /export.csv and in the
 * message text below. It is mis-boxed, not destroyed.
 */
function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return {
    first: parts[0] ?? "",
    last: parts.slice(1).join(" "),
  };
}

/**
 * HubSpot Free, via the Forms API v3.
 *
 * CRM_WEBHOOK_URL holds the whole endpoint:
 *   https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}
 * It is unauthenticated — the form GUID is the credential — so
 * CRM_AUTH_TOKEN stays unset for HubSpot. That is HubSpot's design, not
 * an oversight here; it is the same endpoint their embedded form posts
 * to from a visitor's browser.
 *
 * Three things about this API worth knowing before debugging it at 9pm:
 *
 *  1. Every `name` must be a field that EXISTS on that form, and an
 *     unknown one makes HubSpot refuse the whole submission with a 400
 *     that names it. That error text lands in crm_error, where it is
 *     readable — but it means a stock form is the safe target, so
 *     everything without a standard box for it goes into the message
 *     text rather than into a field that may not be there.
 *  2. Values must be strings. A nested object is not accepted, which is
 *     the other reason the questionnaire is flattened into prose
 *     instead of being sent as `answers`.
 *  3. HubSpot identifies a contact by email address. A submission
 *     carrying only a phone number is refused with a 400.
 *
 * That last one is left as a visible failure rather than papered over
 * with a synthetic address. A made-up email in a CRM is worse than a
 * row somebody has to look at: it is wrong forever, and it is wrong in
 * the field the office will try to reach the customer on. The row stays
 * in D1 with the real details and the refusal in crm_error, and
 * /export.csv still has it.
 */
const hubspotAdapter: CrmAdapter = (row, env) => {
  const { first, last } = splitName(row.name ?? "");

  // Everything a stock HubSpot form has no box for, as prose in the
  // message field — which certainly exists. If the office later adds
  // custom properties (`resume_url` is the one worth adding first, so
  // the link is clickable in the record rather than sitting in the
  // message body), each one becomes a line in the fields array below
  // and can come back out of here.
  const notes: string[] = [
    row.kind === "application" ? "Job application" : "Assessment request",
  ];
  const note = (label: string, value: string | null) => {
    if (value) notes.push(`${label}: ${value}`);
  };
  note("Role", row.role);
  note("Service", row.service);
  note("Urgency", row.urgency);
  note("Address", row.address);
  note("Message", row.message);

  for (const [q, a] of Object.entries(parsedAnswers(row.answers))) {
    notes.push(`${q}: ${a}`);
  }

  const url = resumeUrl(row, env);
  if (url) notes.push(`Résumé: ${url}`);
  note("Submitted from", row.source);
  notes.push(`Relay id: ${row.id}`);

  const fields: Array<{ name: string; value: string }> = [];
  const field = (name: string, value: string) => {
    // Omitted rather than sent empty. A blank value on a HubSpot
    // property overwrites whatever a returning contact already had
    // there, so "we did not ask" must not arrive as "it is empty now".
    if (value) fields.push({ name, value });
  };
  field("firstname", first);
  field("lastname", last);
  field("email", row.email ?? "");
  field("phone", row.phone ?? "");
  field("message", notes.join("\n"));

  return {
    contentType: "application/json",
    body: JSON.stringify({
      fields,
      // HubSpot shows this on the contact's timeline, which is where
      // somebody asks "where did this person come from".
      context: {
        pageUri: row.source ?? "",
        pageName: row.kind === "application" ? "Careers form" : "Contact form",
      },
    }),
  };
};

/**
 * The registry. One line per CRM.
 *
 * `generic` is the default and stays the default: it is the shape a
 * Zapier or Make hook expects, and it is what every row forwarded
 * before this existed was sent as, so nothing already wired changes
 * shape because this file grew.
 */
const CRM_ADAPTERS = {
  generic: genericAdapter,
  hubspot: hubspotAdapter,
} satisfies Record<string, CrmAdapter>;

function adapterFor(env: Env): CrmAdapter {
  const name = (env.CRM_ADAPTER ?? "").trim().toLowerCase();
  if (!name) return genericAdapter;
  if (name in CRM_ADAPTERS) {
    return CRM_ADAPTERS[name as keyof typeof CRM_ADAPTERS];
  }
  // A typo in CRM_ADAPTER must not stop leads being delivered, so this
  // falls back rather than refusing — but it says so every time,
  // because the CRM quietly receiving the wrong shape is the failure
  // that takes longest to notice.
  console.error(
    `[relay] unknown CRM_ADAPTER "${name}" — falling back to "generic". Known: ${Object.keys(
      CRM_ADAPTERS
    ).join(", ")}`
  );
  return genericAdapter;
}

/* ── Forwarding ─────────────────────────────────────────────────── */

/**
 * Where this row goes, which depends on what it is.
 *
 * Applications prefer CRM_APPLICATION_WEBHOOK_URL and fall back to the
 * one URL, so an unset second destination is the previous behaviour
 * unchanged. Leads only ever go to CRM_WEBHOOK_URL — a customer has no
 * business in the applicant tracker.
 *
 * undefined means "nowhere is configured for this kind", which is a
 * supported state and not an error: the row is stored with
 * crm_status='disabled' and delivered by the first sweep after a
 * destination exists.
 */
function crmEndpoint(row: LeadRow, env: Env): string | undefined {
  if (row.kind === "application" && env.CRM_APPLICATION_WEBHOOK_URL) {
    return env.CRM_APPLICATION_WEBHOOK_URL;
  }
  return env.CRM_WEBHOOK_URL;
}

/**
 * Send one row onward and record what happened.
 *
 * Never throws. Every outcome is a state written back to the row, which
 * is what lets the retry sweep below be a simple query rather than a
 * queue with its own failure modes.
 */
async function forward(row: LeadRow, env: Env): Promise<void> {
  const endpoint = crmEndpoint(row, env);
  if (!endpoint) return;

  let ok = false;
  let error = "";
  try {
    // Inside the try, not above it: shaping the body is now adapter
    // code, and an adapter is the newest and least-exercised thing in
    // this file. A throw from one has to land in crm_error like any
    // other failure — the alternative is an exception escaping a
    // function documented never to throw, which in the retry sweep
    // would abandon every row queued behind this one.
    const request = adapterFor(env)(row, env);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": request.contentType,
        ...(env.CRM_AUTH_TOKEN
          ? { Authorization: `Bearer ${env.CRM_AUTH_TOKEN}` }
          : {}),
        // Last, so an adapter can correct either of the above for a CRM
        // that wants something other than a bearer token.
        ...(request.headers ?? {}),
      },
      body: request.body,
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
  // Only ask for kinds that have somewhere to go. Without this filter
  // the batch of 25 fills up with rows forward() will decline to send —
  // if only CRM_APPLICATION_WEBHOOK_URL is set, every 'disabled' lead
  // ever captured sorts ahead of the applications by received_at and
  // starves them, sweep after sweep, while the table looks busy.
  const kinds: LeadRow["kind"][] = [];
  if (env.CRM_WEBHOOK_URL) kinds.push("lead");
  if (env.CRM_WEBHOOK_URL || env.CRM_APPLICATION_WEBHOOK_URL) {
    kinds.push("application");
  }
  if (!kinds.length) return 0;

  const { results } = await env.DB.prepare(
    `SELECT * FROM leads
      WHERE kind IN (${kinds.map(() => "?").join(",")})
        AND crm_status IN ('failed', 'pending', 'disabled')
        AND crm_attempts < ?
      ORDER BY received_at ASC
      LIMIT ?`
  )
    .bind(...kinds, MAX_CRM_ATTEMPTS, RETRY_BATCH)
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

/* ── The résumé download ────────────────────────────────────────── */

/**
 * Plain text, because the caller here is a person.
 *
 * Every other response this Worker makes is JSON for a form's
 * JavaScript. This route is a link somebody clicked inside a CRM
 * record, so what it says on a bad day is read by a human in a browser
 * tab — and a bare 410 with an empty body sends that human to ask us
 * what happened, where a sentence does not.
 *
 * No CORS headers, either. This is a top-level navigation, not a
 * cross-origin fetch, and there is no page anywhere that should be
 * reading a résumé out of this route with script.
 */
function resumeText(body: string, status: number): Response {
  return new Response(`${body}\n`, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * A lead id is a crypto.randomUUID() minted in rowFrom().
 *
 * This guard is not what makes the lookup safe — the query is
 * parameterised, and that is what makes it safe. It is what stops a
 * path full of junk becoming a D1 round trip, and it is deliberately
 * looser than a UUID pattern so the route does not quietly start
 * 404ing if ids ever change shape.
 */
function looksLikeLeadId(id: string): boolean {
  return id.length > 0 && id.length <= 64 && /^[A-Za-z0-9._-]+$/.test(id);
}

/**
 * `Jane-Doe-resume.pdf`, not `9f2c…-cv.pdf`.
 *
 * The extension comes off the stored key rather than off anything the
 * applicant typed: the careers Worker built that key from an extension
 * it had already checked against the file's magic bytes, so it is the
 * one trustworthy statement about what this file is. The name comes
 * from the D1 row rather than the object's metadata because the row is
 * already in hand and the metadata is percent-encoded.
 *
 * Both header forms are sent. Content-Disposition is an HTTP header and
 * therefore ASCII, which would turn `José` into mojibake at best; the
 * RFC 5987 `filename*` carries the real UTF-8 name for anything
 * current, and the stripped ASCII `filename` is the fallback. A name
 * that strips away to nothing becomes plain `resume`, because a
 * download called `-resume.pdf` looks like a bug.
 */
function resumeDisposition(row: {
  name: string | null;
  resume_key: string | null;
}): string {
  const ext =
    /\.([A-Za-z0-9]{1,8})$/.exec(row.resume_key ?? "")?.[1]?.toLowerCase() ?? "";
  const suffix = ext ? `.${ext}` : "";

  const stem = (row.name ?? "").trim().replace(/\s+/g, "-") || "resume";
  const pretty = `${stem}-resume${suffix}`;
  const ascii =
    pretty.replace(/[^\x20-\x7e]/g, "").replace(/["\;]/g, "").trim() ||
    `resume${suffix}`;

  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(
    pretty
  )}`;
}

/**
 * GET /resume/:leadId — the résumé behind a lead, as a download.
 *
 * This is the route the CRM's resumeUrl points at, and the reason this
 * Worker has an R2 binding at all. What guards it is CLOUDFLARE ACCESS
 * IN FRONT OF THE WORKER, not code in it — see the header of this file
 * for why a bearer token cannot do this job, and
 * docs/LAUNCH-CREDENTIALS.md for the application to create.
 *
 * Considered and rejected: checking for the `Cf-Access-Jwt-Assertion`
 * header as a belt-and-braces gate. A header check is not a signature
 * check, so it would refuse an honest misconfiguration while waving
 * through anybody who can reach the Worker on a hostname Access does
 * not cover and set a header — which is precisely the case it would be
 * there to catch. Pseudo-security that reads as security is worse than
 * none, so the requirement is stated in the comments and the docs, and
 * `workers_dev = false` plus a route on the zone is what actually
 * enforces it. Verifying the JWT properly is the real upgrade, and it
 * needs the team domain and audience tag as configuration.
 */
async function serveResume(
  rawId: string,
  req: Request,
  env: Env
): Promise<Response> {
  if (req.method !== "GET") {
    return resumeText("Use GET to download a résumé.", 405);
  }

  let id: string;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    // A malformed percent-escape is not a lead id.
    return resumeText("No application matches that link.", 404);
  }
  if (!looksLikeLeadId(id)) {
    return resumeText("No application matches that link.", 404);
  }

  const row = await env.DB.prepare(
    `SELECT id, name, resume_key FROM leads WHERE id = ?`
  )
    .bind(id)
    .first<{ id: string; name: string | null; resume_key: string | null }>();

  // One answer for "no such lead" and "that lead has no résumé". Both
  // are "there is nothing here", and telling them apart would turn this
  // route into a way to ask whether a given id exists.
  if (!row || !row.resume_key) {
    return resumeText("No résumé is attached to that application.", 404);
  }

  if (!env.RESUMES) {
    console.error(
      `[relay] RESUMES is not bound — cannot serve ${row.resume_key}`
    );
    return resumeText(
      "Résumé downloads are not configured on this deployment. The file itself is unaffected: it is in the ctl-resumes bucket and can be fetched with `wrangler r2 object get`.",
      503
    );
  }

  const object = await env.RESUMES.get(row.resume_key);

  // The 410 is the entire reason this is not another 404.
  //
  // A row that has a key and no object is the retention rule having
  // done its job: applications are deleted after twelve months by an R2
  // lifecycle rule, deliberately, and the privacy policy promises
  // exactly that. "Gone, and here is why" is the truthful answer. A 404
  // would read as a broken link and send somebody hunting for a file
  // that was destroyed on purpose — or, worse, asking whether the
  // pipeline is broken.
  if (!object) {
    console.log(
      `[relay] résumé gone for ${row.id} (${row.resume_key}) — past retention or deleted`
    );
    return resumeText(
      "This résumé is no longer available. Job applications are kept for twelve months and then deleted automatically, and this one's retention period has elapsed. The applicant's own details are still on the lead record.",
      410
    );
  }

  // Streamed straight through rather than buffered: a 5 MB cap means
  // either would work, but there is no reason for the file to exist in
  // the Worker's memory on the way past.
  return new Response(object.body, {
    status: 200,
    headers: {
      // R2 kept the content type the careers Worker verified on upload.
      "Content-Type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
      "Content-Disposition": resumeDisposition(row),
      "Content-Length": String(object.size),
      // Never cached, anywhere. This is somebody's CV behind a sign-in,
      // and a cached copy outlives the sign-in that authorised it.
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
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

    /* ── The résumé download ────────────────────────────────────── */
    // Matched before intake so a bad id gets the readable text answer
    // rather than the JSON "Not found." meant for a form's JavaScript.
    if (path === "/resume" || path.startsWith("/resume/")) {
      return serveResume(path.slice("/resume/".length), req, env);
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

    // Per row, not per Worker: with only CRM_APPLICATION_WEBHOOK_URL
    // set, an application is 'pending' and a lead is genuinely
    // 'disabled', and the sweep reads exactly that distinction back.
    const status = crmEndpoint(row, env) ? "pending" : "disabled";
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
    if (status === "pending") ctx.waitUntil(forward(row, env));

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
