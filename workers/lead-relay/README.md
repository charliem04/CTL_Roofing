# Lead relay

Every enquiry the site produces, in one list, forwarded to whichever CRM
gets chosen.

Two things happen on this site that somebody has to act on: a homeowner
asks for an assessment, and somebody applies for a job. They used to go
to two different places — an email inbox and an R2 bucket — and neither
was a list you could work through. This is that list.

```
  contact form ─────────────────► Web3Forms ──► office inbox
        │                                          (unchanged)
        └──────────────┐
                       ▼
  careers form ──► careers Worker ──► R2 (the résumé file)
        │                │
        │                └──────────┐
        │                           ▼
        └──────────────────────► lead relay ──► D1 (the lead book)
                                      │
                                      └────────► CRM webhook
```

## Why it stores before it forwards

The order is the design: **write the row, answer the caller, forward
afterwards.**

A relay that only forwards loses everything the CRM was not awake for.
Storing first means an outage at the far end costs a *delivery* rather
than a *lead* — the row sits at `crm_status='failed'` and the retry
sweep, which runs every fifteen minutes, picks it up when the CRM comes
back.

It is also deliberately **not** on the critical path for either form.
The contact form still posts to Web3Forms and that email arrives whether
or not this Worker is reachable; the careers Worker still writes the
résumé to R2 before it pings here. This is the second copy, on purpose,
because the first copy must not depend on code we maintain.

## Why it is CRM-agnostic

The CRM has not been chosen. Writing straight to HubSpot or Jobber or
AccuLynx would mean either waiting for that decision — losing every lead
in the meantime — or rewriting both forms once it is made.

So leads are captured now and forwarded to a URL in a secret. When a CRM
is picked, `wrangler secret put CRM_WEBHOOK_URL` is the whole
integration, and the next retry sweep delivers the entire backlog.
Nothing collected in the meantime is lost. `/export.csv` hands the same
backlog to anything that prefers an import.

## Routes

| Route | Who calls it | Auth |
| --- | --- | --- |
| `POST /lead` | the contact form, from a browser | CORS origin allowlist |
| `POST /application` | the careers Worker, server-to-server | `X-Ingest-Secret` |
| `GET /export.csv` | a person, occasionally | `Authorization: Bearer` |
| `GET /health` | uptime checks | none |

`POST /lead`'s origin check stops another *website* posting on a
visitor's behalf and nothing else — a script sets `Origin` to whatever
it likes. The KV rate limiter is a backstop; a WAF rate-limiting rule on
the route is better, because it stops the request before it bills.

The only content rule is that a record must carry a phone number or an
email. Everything else on both forms is optional somewhere.

## Setup

```bash
npm install

# 1. The database
npx wrangler d1 create ctl-leads      # paste the id into wrangler.toml
npm run schema                        # creates the table and indexes

# 2. Secrets
npx wrangler secret put INGEST_SECRET   # any long random string
npx wrangler secret put EXPORT_TOKEN    # any long random string
# When a CRM is chosen:
npx wrangler secret put CRM_WEBHOOK_URL
npx wrangler secret put CRM_AUTH_TOKEN  # if it wants one

# 3. Deploy
npx wrangler deploy
```

Then connect the two producers:

- **Contact form** — set `NEXT_PUBLIC_LEAD_WEBHOOK_URL` to
  `https://<relay>/lead` in the Cloudflare Pages environment variables
  (Production *and* Preview), and redeploy the site.
- **Careers Worker** — in `workers/careers-upload`:
  ```bash
  npx wrangler secret put NOTIFY_WEBHOOK        # https://<relay>/application
  npx wrangler secret put RELAY_INGEST_SECRET   # the SAME value as INGEST_SECRET
  ```

`CRM_WEBHOOK_URL` being unset is a supported state, not a half-finished
one: leads are stored with `crm_status='disabled'` and delivered in full
the first time the secret exists.

## Getting the leads out

```bash
curl -H "Authorization: Bearer $EXPORT_TOKEN" \
     https://<relay>/export.csv -o leads.csv
```

Cells beginning `=`, `+`, `-` or `@` are prefixed with an apostrophe.
That is not cosmetic: spreadsheets treat those as formulas, and this
table is filled in by strangers through a public form — the exact threat
model CSV injection was written for.

There is no other read path. The table holds names, phone numbers and
addresses; with `EXPORT_TOKEN` unset, `/export.csv` refuses everything
rather than serving customer records to anyone who guesses the path.

## What was verified, and how

Run locally against a stand-in CRM (`wrangler dev --env dev --local
--test-scheduled`):

- a contact lead and a job application both stored and forwarded, in one
  normalised shape
- a record with no phone and no email refused
- `/application` without the shared secret → 401; `/export.csv` without
  the bearer token → 401; unknown route → 404; wrong method → 405
- **the outage case**: with the CRM returning 503, the caller still got
  `{"ok":true}`, the row was written as `failed`, and after the CRM
  recovered the scheduled sweep delivered it — along with rows captured
  before any CRM was configured, oldest first
- CSV injection: `=cmd|'/c calc'!A1`, `@SUM(1+1)` and a leading `+`
  all neutralised in the export; newlines and tabs collapsed
- the real contact form, driven in Chromium, reached the relay and the
  CRM with its source URL attributed, while Web3Forms got its own copy

## Operating notes

`crm_attempts` stops at 6. Something that has refused six times is a
configuration problem, and retrying forever hides it — the rows stay
visible as `failed` with the CRM's own error text in `crm_error`, which
is usually where a CRM says *why*.

```sql
-- what has not landed
SELECT id, kind, name, crm_attempts, crm_error
  FROM leads WHERE crm_status = 'failed' ORDER BY received_at;
```

```bash
npx wrangler tail   # live logs
```
