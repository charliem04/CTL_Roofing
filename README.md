# CTL Roofing

The website for **CTL Pro Construction LLC** (CTL Roofing), Broussard LA —
a statically exported Next.js site on Cloudflare Pages, plus two
Cloudflare Workers that handle the things a static site cannot.

## Where things are

| Path | What it is |
|---|---|
| `ctl-roofing/` | The Next.js app. All `npm` commands run from here. |
| `workers/lead-relay/` | Worker: receives form submissions, stores the lead, notifies. |
| `workers/careers-upload/` | Worker: validates résumé uploads, writes to a private R2 bucket. |
| `docs/` | Engineering documentation — see below. |
| `assets/source-photos/` | The client's original unprocessed photos and video. Not a build input; the site's images are the processed copies under `ctl-roofing/public/ctl/`. |
| `ctl-handover.html` | Client-facing: what is built, and the run sheet for the session that collects the rest. Mirrored to a published artifact — read the note in its header before editing. |
| `README-DEPLOY.md` | The go-live checklist. Start here before a launch. |

## The documents

- **`README-DEPLOY.md`** (repo root) — the go-live checklist. Every item
  that stands between this tree and a DNS cutover.
- **`docs/PRODUCTION-READINESS.md`** — the engineering audit: what is
  unfinished in the infrastructure and the work that closes it. Start
  here.
- **`docs/LAUNCH-CREDENTIALS.md`** — every account and key, who creates
  it, and what breaks without it.
- **`docs/CUTOVER.md`** — the DNS move, T-14 to T+7, with the rollback.
- **`docs/REBUILD-PLAN.md`** — the build order, decisions taken, and what
  is still blocked on the client.
- **`docs/SITE-PLAN.md`** — the original client requirements the rebuild
  was planned against.
- **`docs/ROUTE-MAP.md`** — generated. Where every link and button goes.
  Written by `npm run routes`; `npm run build` verifies it.
- **`docs/GALLERY-CMS.md`** — how the photo CMS at `/admin/` works.
- **`docs/OPTIMISATION.md`** — the measured performance pass.

## Running it

```bash
cd ctl-roofing
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/, plus every build-time check
npm run deploy     # build, then wrangler pages deploy
```

`npm run build` is not just Next.js: it regenerates the gallery manifest,
writes the CSP, verifies every internal route resolves, and hardens the
output. A broken internal link fails the build.
