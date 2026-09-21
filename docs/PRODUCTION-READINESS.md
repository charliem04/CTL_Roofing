# Production readiness — what stands between this and a DNS cutover

`REBUILD-PLAN.md` covers what was built and why. `README-DEPLOY.md` is the
go-live checklist. `LAUNCH-CREDENTIALS.md` and `CUTOVER.md` cover the accounts
and the DNS move. **This file is the engineering readiness audit** — the
findings that none of those carry, and the work that closes them.

It was written on 21 September 2026 after a pass over the whole tree, ahead of
the working session with the client. Items are recorded whether or not they
were acted on, because a known gap that nobody wrote down is indistinguishable
from one nobody found.

The content the client owes is deliberately **not** duplicated here. That lives
in `content/pending.ts`, which is what the dev-only `<Pending>` panels render,
and in the run sheet in `ctl-handover.html`. One list, three renderings.

---

## Findings

Each verified in the tree, not inferred. The "where" column is the file to open.

### 1. The lead relay cannot deploy as written

`workers/lead-relay/wrangler.toml` carries
`database_id = "<paste the id wrangler prints>"`. D1 was never provisioned, so
the Worker has no database to bind. `npx wrangler d1 create ctl-leads`, paste
the real id, then `npm run schema`.

### 2. Both Workers' rate limiters are dead in production

`[[kv_namespaces]]` is commented out in *both* `wrangler.toml` files, which
makes `overRateLimit()` a no-op on each. The comments are honest about this
being a backstop to a WAF rule rather than a substitute — but right now neither
layer exists.

Either create the namespaces and uncomment the bindings, or add WAF
rate-limiting rules on both Worker routes. The WAF rule is the better of the
two because it stops the request before it bills. What matters is that it stops
being ambiguous.

### 3. The privacy policy does not disclose two processors

`app/privacy/page.tsx` names Web3Forms, Calendly, Plausible, Cloudflare and R2.
It does not mention Google or the CRM — a grep for `Google`, `Places`, `CRM` or
`relay` returns one forward-looking code comment and nothing else.

Both handle visitor data:

- Google Places receives the visitor's IP on every page view that renders
  reviews
- The lead relay stores names, phone numbers and addresses, and forwards them
  to a third-party CRM

**Add both paragraphs before setting the corresponding keys, not after.** The
file's own header comment already instructs this whenever a processor is added;
it simply has not been acted on.

### 4. `/careers/` is live, and its form has nowhere to send a file

`lib/routes.ts` has careers at `live: true`, which contradicts
`REBUILD-PLAN.md`'s description of it as dark. So the résumé path is a launch
blocker rather than a phase-2 item: it is a live nav item whose form refuses and
points at the office email.

That refusal is the correct failure — a form that takes a CV and drops it costs
somebody a job they think they applied for. But it is not a shipping state.

### 5. `public/_redirects` is effectively empty

One real rule. The old ctlpro.com has URLs indexed by Google and linked from
Facebook, and every one without an equivalent here 404s the moment DNS moves.

**This is the one launch task that gets harder after cutover, not easier.**
Building the map requires crawling the old site while it is still up. See
`CUTOVER.md`, T-14.

### 6. The contact form has a honeypot and nothing else

`components/Contact.tsx` carries a `company` honeypot; `lib/submitContact.ts`
returns a fake success when it is filled, so a bot learns nothing. There is no
Turnstile on this form — only on careers. Web3Forms' own spam protection should
be switched on at the same time as the key.

### 7. There is no CI

No `.github/` directory exists. The build pipeline is this project's real test
suite — `scripts/seo.mjs` fails on bad titles and descriptions,
`scripts/routes.mjs --check` resolves every internal link against the emitted
files, `scripts/csp.mjs` fails if the output references an origin the policy
does not cover, `scripts/harden.mjs` scans for leaked secrets and stray
`.env`/source-map/`.git` files, `scripts/check.mjs` catches inherited frontend
defaults.

All of it runs only when somebody types `npm run build`. Nothing gates a commit
— including the CMS's direct-to-`main` commits from `/admin/`, which trigger a
Pages build with no check in front of it.

A workflow running `npm run build` and `npm run check` on pull requests and on
pushes to `main` would close this.

### 8. `npm run lint` does nothing, and there are no tests

No eslint config and no eslint dependency, so `next lint` would offer to set one
up rather than lint. No `*.test.*` or `*.spec.*` anywhere, and no test runner.

TypeScript is `strict: true` and `next build` type-checks, so types *are*
enforced — but there is no standalone `typecheck` script.

### 9. Repo hygiene — **closed**

Resolved by the cleanup pass. What was found, and what was done:

- `graphify-out/` (2.7 MB, a code-analysis cache) and `.idea/` were committed.
  Both are untracked and gitignored now. `graphify-out/` is deliberately kept
  in the working tree — it is a local tool cache that earns its keep — so it
  must stay ignored rather than be deleted.
- `ctl_pictures/` (52 MB) is unused by the build but is the client's only copy
  of the originals, so it was kept and moved to `assets/source-photos/`, a name
  that says it is source rather than a build input.
- `package.json` is named `ctl-roofing`. So is the dev launch config, which
  until then ran `--prefix` on a directory that did not exist.
- The stale root `README-DEPLOY.md` — the template copy that **contradicted the
  code**, naming Formspree and claiming an unset key meant the form silently
  succeeds in demo mode — is deleted. The accurate checklist now sits at the
  root in its place.
- `ctl-roofing/docs/` moved to `docs/` at the repo root, alongside the
  checklist, since these describe the launch rather than the Next app.

One thing this does **not** fix: the `.git` directory is still 122 MB, because
untracking a file does not remove its blobs from history. Only a history
rewrite would reclaim that, which is not worth doing before a cutover.

### 10. Missing web app furniture

No web manifest, no `apple-icon`, no `favicon.ico` fallback — `app/icon.png` is
all there is. One OG image shared across all pages.

### 11. No accessibility statement

Only `/terms/` and `/privacy/` exist as legal pages. Home-services contractors
are a standing target for ADA demand letters in the US; a statement is cheap
insurance. It would register in `lib/routes.ts` under `auxRoutes` with
`noindex`, like the other two.

### 12. One config value worth a second look

`ALLOW_INSECURE_NO_CAPTCHA = "true"` exists under `[env.dev.vars]` in
`workers/careers-upload/wrangler.toml`, correctly scoped and clearly warned
about. It is still the one value where a copy-paste turns a gated endpoint into
an open one. Worth confirming its absence from the deployed config at deploy
time, which `CUTOVER.md` does at T-7.

### 13. The Facebook reviews snapshot has a printed date

`content/reviews.ts` holds ten recommendations and the 98% figure, read by hand
because Meta killed the recommendations API in September 2025. The capture date
prints on the page. Re-read it before launch or it reads as stale on day one.

---

## Work

### A. Wire the integrations

Configuration the code already expects. In dependency order:

1. **Web3Forms** — key into `NEXT_PUBLIC_WEB3FORMS_KEY`, spam protection on.
2. **Lead relay** — provision D1 (finding 1), set `INGEST_SECRET` and
   `EXPORT_TOKEN`, deploy. `CRM_WEBHOOK_URL` may stay unset: leads are stored as
   `crm_status='disabled'` and the first sweep after it is set delivers the
   whole backlog.
3. **CRM** — `wrangler secret put CRM_WEBHOOK_URL` once chosen. Most roofing
   CRMs will not take raw JSON, so budget a Zapier/Make account as the adapter.
   The single function to adapt is `crmPayload()` in
   `workers/lead-relay/src/index.ts`.
4. **Careers** — per the decision taken. If the Worker stays: `TURNSTILE_SECRET`,
   `NOTIFY_WEBHOOK` → the relay's `/application`, `RELAY_INGEST_SECRET` matching
   the relay's `INGEST_SECRET`, `IP_HASH_SALT`, and **`npm run retention`
   against the real bucket** — without that lifecycle rule the twelve-month
   promise in the privacy policy is untrue.
5. **Google Reviews** — key and place ID, budget alert the same day.
6. **Rate limiting** — finding 2.
7. **Analytics and call tracking** — per the decisions taken.

A third-party résumé destination changes more than an endpoint: `form-action
'self'` in the generated CSP blocks a cross-origin form POST, an embedded form
needs its domain in `frame-src`, and the privacy policy's R2 paragraph and
retention promise both get rewritten. If the vendor can webhook into the relay's
`/application` route the unified lead book survives; if not, that is a real loss
and should be named rather than discovered.

### B. Repo ownership and the CMS

**Move the site to a client-owned repo first.** The CMS commits directly to
`main` on whatever repo it points at, and today that is a personal account. Then:

- update `backend.repo` in `public/admin/config.yml`
- re-point the `sveltia-cms-auth` Worker's `ALLOWED_DOMAINS`
- repo hygiene, the package name and the stale root `README-DEPLOY.md` are
  already done (finding 9); nothing here is outstanding

**Then extend the CMS beyond the gallery.** The pattern already exists:
`content/gallery.json` is CMS-written, read through `lib/content.ts`, and
validated by `scripts/gallery.mjs`, which fails the build on a missing alt text,
a duplicate, a missing file or an unknown category. Repeat it for `team`,
`testimonials`, `caseStudies`, `careers.roles` and `financing` — convert each
from `.ts` to `.json`, add a Sveltia collection, and leave the loader boundary
in `lib/content.ts` unchanged so the pages do not move.

Worth naming: Sveltia sign-in needs a GitHub account with write access per
editor. For a non-technical office that is real overhead, and it is the reason a
hosted CMS is the alternative. Extending Sveltia is the chosen path, so the
mitigation is creating and documenting those accounts properly rather than
pretending the friction is not there.

### C. Close the gaps

- `public/_redirects` from the old-site crawl (finding 5) — highest risk
- privacy policy processors (finding 3)
- accessibility statement (finding 11)
- CI workflow (finding 7)
- eslint config and a `typecheck` script (finding 8)
- web manifest, `apple-icon`, `favicon.ico` (finding 10)
- uptime monitoring on the site and both Workers — the relay already exposes
  `GET /health`. Decide who gets alerted
- backups: a scheduled `export.csv` pull, and a documented R2 retrieval
  procedure. Gallery content is already safe in git; the lead book is not
- refresh the Facebook snapshot and its date (finding 13)
- `grep -rn "TODO(client)"` must return zero — two remain
  (`app/layout.tsx:4`, `client.config.ts:96`)
- handover training: walk the client's editor through `/admin/`, where leads
  land, and how to pull the CSV. A short screen recording beats a document here

---

## Verification

```bash
cd ctl-roofing
npm run build      # gallery → next build → csp → cms → fonts → seo → routes --check → harden
npm run check      # expect 0 errors, 0 warnings (5 known false-positive advisories)
grep -rn "TODO(client)" .   # must return zero
```

Then work `README-DEPLOY.md` §3 against the preview in full, including the check
most people skip: **submit the contact form with a deliberately wrong key and
confirm the visitor sees the failure and the phone number, not a false
success.**

End-to-end proof the lead path works — a real contact submission and a real
careers application should both appear as rows, with the application also having
an object in R2:

```bash
curl -H "Authorization: Bearer $EXPORT_TOKEN" https://<relay>/export.csv
```

---

## Order

1. Start the long-lead items: attorney review, Business Profile ownership, and
   the old-site crawl (they block the cutover and nothing else depends on them)
2. Wire the integrations as credentials arrive — §A
3. Repo move and CMS extension — §B
4. Close the gaps — §C
5. Preview verification, then `CUTOVER.md`
