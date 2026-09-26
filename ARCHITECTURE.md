# CTL_Roofing — architecture

**Scope:** this describes the `main` branch of `charliem04/CTL_Roofing` as of
commit `4c3641e`. It is written to be handed to an agent doing a port of this
repo's infrastructure into a white-label template, so it favours *why a thing
is shaped the way it is* over *what the code says* — the code says that itself,
at length, in comments that are worth reading.

**How to use it:** read this first, then read the file a section points at
before changing it. Nearly every non-obvious decision here has a comment
attached explaining the failure that produced it. Those comments are load-bearing
documentation, not noise; carry them across rather than summarising them away.

---

## 1. What this is

A statically-exported Next.js 14 marketing site for a roofing and construction
company, deployed to Cloudflare Pages, with two Cloudflare Workers behind it and
a Sanity studio for one content type.

It started from a generic template and grew a lot of machinery that has nothing
to do with roofing. That machinery — the build pipeline, the route registry, the
motion system, the Workers, the CMS wiring, the security posture — is the part
worth porting.

**Stack:** Next.js 14.2 (App Router, `output: "export"`), React 18, TypeScript,
Tailwind 3.4, Framer Motion 11, Lenis 1.3, Fontsource (self-hosted faces).

**There is no GSAP.** If a brief mentions it, the brief is wrong — all animation
is Framer Motion, and all momentum scrolling is Lenis.

**There is no server.** `output: "export"` emits static HTML to `out/`. Anything
that needs a server is a Cloudflare Worker, and there are exactly two.

---

## 2. Repository layout

```
CTL_Roofing/
├── ctl-roofing/           the Next.js app — everything the browser gets
├── workers/
│   ├── lead-relay/        D1 lead book + CRM forwarding + résumé download
│   └── careers-upload/    résumé intake → private R2
├── studio/                Sanity studio (gallery only)
├── docs/                  ten runbooks; ROUTE-MAP.md is generated
├── assets/                source art
├── ctl-handover.html      standalone client handover document
└── README-DEPLOY.md       the go-live checklist
```

The app is in a subdirectory rather than at the root because the Workers and the
studio are siblings of it, not children. Several build scripts rely on this:
`scripts/gallery.mjs` resolves `REPO = resolve(SITE, "..")` to reach
`studio/schemas/`, and `scripts/routes.mjs` writes to `docs/` at the repo root.
**Preserve the two-level shape when porting**, or fix those paths deliberately.

---

## 3. The five seams

This is the part that matters for a port. Five files/directories absorb
essentially all per-client variation, and the discipline is that *nothing else
does*.

| Seam | File | Holds |
|---|---|---|
| Business facts | `ctl-roofing/client.config.ts` | Identity, SEO, contact, hours, socials, booking URL, section copy, testimonials, badges |
| Brand | `ctl-roofing/app/globals.css` | A `:root` token block; every colour on the site resolves to one of these |
| Which pages exist | `ctl-roofing/lib/routes.ts` | The route registry and its `live` flags |
| Long-form content | `ctl-roofing/content/*.ts` | Behind `lib/content.ts`; never imported directly by a component |
| Runtime config | `ctl-roofing/.env.example` → `.env.local` | Endpoints and publishable keys |

`tailwind.config.ts` maps every colour utility onto the CSS variables in
`globals.css` (`rgb(var(--brand) / <alpha-value>)`), so a re-skin is a token
edit and the Tailwind config does not change per client. That indirection is the
point; do not collapse it.

27 of 57 components import `client.config`. If you find yourself editing a
component to change client content, that content belongs in the config.

---

## 4. The route registry — `ctl-roofing/lib/routes.ts`

**The single most portable idea in the repo.** One tree drives the nav, the
footer, the sitemap, the breadcrumbs, and each page's `robots` meta.

```ts
type RouteNode = {
  href: string;
  label: string;
  live: boolean;          // built yet?
  children?: RouteNode[];
  priority?: number;      // sitemap weight
  noindex?: boolean;      // exists and is linked, but not indexed
};
```

Exports: `nav`, `auxRoutes`, `CTA_HREF`, `isLive()`, `isIndexable()`,
`liveChildren()`, `livePaths()`, `trailFor()`.

**`live: false` is how a page ships.** Flipping one flag reveals the nav item,
adds the sitemap entry, drops the `noindex`, and makes the breadcrumb resolve.
Nothing links to a route that is not live; the sitemap never lists one.

**`noindex` and the sitemap are wired together on purpose.** A sitemap entry is a
request to index, so listing a `noindex` page asks Google for two contradictory
things and shows up in Search Console as "Excluded by noindex" — noise that hides
real coverage problems. One flag governs both.

**`CTA_HREF` is separate from `client.bookingUrl`, and this is important.** Every
primary CTA points at `/contact/`. `bookingUrl` means one thing only: which
calendar the embed on `/contact/` loads. They were the same value once, and the
consequence was that the moment a scheduler URL existed, the nav, the hero, the
sticky bar, the call cards and every closing band handed the visitor to a third
party mid-decision. `/contact/` carries the phone, the storm line, the form *and*
the calendar, so it answers whichever way in the visitor actually wanted.

**Known sharp edge:** `components/Nav.tsx` maps over `nav` directly and does
**not** filter top-level items by `live` — only `liveChildren()` filters the
dropdowns. This is invisible here because every top-level item happens to be
live. The moment one is not, the header links a page that does not exist. Same
class of problem in `components/Footer.tsx`, whose second column is a
hand-written array of hrefs rather than a projection of the registry; its own
comments record two occasions it rotted. **Fix both during a port** — filter the
top level, and derive the footer column from the registry with only the ordering
hand-maintained.

---

## 5. The build pipeline

```
npm run build
  = gallery → next build → csp → fonts → seo → routes --check → harden
```

Five of the seven can fail the build. Each exists because a specific thing broke
silently once.

| Script | Lines | Fails the build when |
|---|---|---|
| `gallery.mjs` | 531 | A CMS photo has no alt text, no dimensions, or a category the site cannot render; or the three category lists disagree |
| `csp.mjs` | 295 | An `https://` origin appears in `out/` that the policy does not cover and nothing declares as non-fetched |
| `fonts.mjs` | 123 | No font in the built CSS matches the `PRELOAD` pattern |
| `seo.mjs` | 78 | A rendered title exceeds 60 chars or a description exceeds 160, or either is empty |
| `routes.mjs` | 280 | An internal link resolves to a page the build did not produce |
| `harden.mjs` | 288 | A secret, sourcemap, stray `.env`, editor backup or `.git` shipped; or a security header is missing |
| `env-file.mjs` | 136 | (support) reads `.env.local` for plain-Node scripts, with Next's precedence |
| `preview-build.mjs` | 103 | (support) Windows-safe preview pipeline |
| `preview-headers.mjs` | 57 | (support) appends `X-Robots-Tag` to `out/_headers` |
| `check.mjs` | 367 | Not in the build. `npm run check` — static checker for inherited-default frontend patterns |
| `radar-basemap.mjs` | 309 | Not in the build. Run by hand; regenerates `lib/radarBasemap.ts` |

### Details worth carrying

**`csp.mjs` — the drift check is the whole value.** The policy has to be
generated because three of its origins are only known from the build
environment. But the part that earns its keep is the scan: every `https://`
origin found anywhere in `out/` must be either allowed by the policy or declared
in one of three lists — `LINK_ONLY` (an href a person clicks; CSP has no say),
`INERT` (a string in framework code this site never exercises), or
`PRECONNECT_ONLY` (a handshake with no request, so no fetch directive governs
it). Adding an embed forces a decision. In this repo those origins are hardcoded
at the top of the file; **for a template, lift them into one declared
`INTEGRATIONS` block** sorted by what the browser actually does with each.

`script-src` carries `'unsafe-inline'`, and the file explains why at length: Next
puts eight inline flight-data scripts on every page, a static export has no
nonce, and per-page hashing means a one-byte generator drift serves blank pages
on a site whose job is to take phone calls. Read that comment before "fixing" it.

**`harden.mjs` opens by being honest that HTML cannot be encrypted** and that
obfuscation buys nothing. What it checks is what is actually true of the output.
That framing is worth keeping — it is the difference between a security check and
security theatre.

**`fonts.mjs` exists because Fontsource filenames carry a content hash.** A
hand-written preload is correct until the next `npm update` and then points at a
404 — worse than no preload, because the browser fetches the 404 *and* still
waits for the stylesheet. So the filenames are read out of the built CSS.

**`routes.mjs` reads the build, not the source.** Most hrefs on this site are
assembled from variables (`client.config`, `content/*.ts`, `lib/routes.ts`), so a
source scan cannot see them. The rendered `href` attribute is, definitionally,
where the visitor goes. It also writes `docs/ROUTE-MAP.md`. It cannot see
JavaScript-driven movement (process steps, lightbox, filter chips) and says so.

**`env-file.mjs` is a small file solving a real cross-platform failure.** Next
loads `.env.local` itself, but the plain-Node scripts either side of it saw only
the real environment — so `SANITY_PROJECT_ID` in `.env.local` did nothing and the
documented workaround was `export`, which is POSIX syntax that fails in
PowerShell, where this project is actually developed. A real env var still wins;
this only fills gaps.

**`preview-build.mjs` runs Next as `node <path-to-next-bin> build`**, not by
spawning `next` or `npm`. On Windows those resolve to `.cmd` shims needing
`shell: true`, which drags command-line quoting differences back in.

---

## 6. Preview mode

`NEXT_PUBLIC_PREVIEW=1` produces a build meant for a temporary URL. This site is
a working replica of a real company — real phone numbers, real address, real
photographs — so a public preview is materially different from a mockup.

Four layers, none sufficient alone, all cheap:

1. `components/PreviewBanner.tsx` — undismissable bar on every page saying what
   this is. Not stored in localStorage: the person it exists for is the stranger
   about to ring the real phone number, and they are helped by a bar they cannot
   close.
2. `noindex, nofollow` in page metadata (`lib/meta.ts`, `robotsFor()`).
3. A disallow-everything `robots.txt` (`app/robots.ts`).
4. `X-Robots-Tag` on `out/_headers` via `scripts/preview-headers.mjs` — covers
   what a `<meta>` cannot: PDFs, images, any non-HTML file.

`app/sitemap.ts` returns `[]` in preview, because every URL in it is absolute and
would either advertise the real site from the wrong origin or advertise the
replica.

---

## 7. Data flow

### Contact form → office inbox (+ optional second copy)

```
Contact.tsx → lib/submitContact.ts → POST api.web3forms.com  (email; awaited)
                                   ↘ POST <relay>/lead        (D1 row; NOT awaited)
```

**The revenue path deliberately does not go through our code.** A static page
posting to a hosted form service has almost nothing that can break: no deploy of
ours, no runtime of ours, no secret of ours to expire. Putting our own Worker in
that path would add a thing that can fail at 2am in exchange for hardening a form
whose worst realistic outcome is spam. The relay call is fired in parallel with
`.catch()` and never awaited, so a relay or CRM outage cannot cost the email or
show the customer an error.

Consequence worth knowing: if the relay rejects the origin (403), the visitor
still sees success, the email still arrives, and the row simply never exists.
Nothing on the page says so.

Shared validation: `lib/phone.ts` counts digits (10–15) and ignores formatting.
It is a reachability check, not a validator — arguing with someone about how they
write their own phone number loses a lead for nothing.

Anti-spam: a honeypot field, with autocomplete suppressed so browser autofill
does not fill it and bin real leads.

### Careers form → private R2 (+ relay ping)

```
CareersForm.tsx → lib/submitApplication.ts → POST <careers-worker>/  (multipart)
                                                  ↓
                                        validate → R2 put (private)
                                                  ↓
                                        POST <relay>/application (server-to-server,
                                                                  shared INGEST_SECRET)
```

Unset endpoint → the form refuses and points people at the office email. That is
deliberate: somebody applying for a job has put real work into that document, and
a form that appears to take it and drops it costs them a job they think they
applied for.

### Gallery → Sanity → committed JSON

```
office publishes in Sanity → webhook → Cloudflare deploy hook
  → scripts/gallery.mjs (build step 1)
      ├─ compares three category lists
      ├─ fetches, normalises, validates
      └─ writes content/gallery.generated.json  (committed)
  → content/gallery.ts imports that JSON, filters again at runtime
```

The generated file is committed on purpose: a build with no CMS credentials (a
laptop, CI, a fork) produces the same site rather than an empty gallery, and the
diff means "the gallery changed, here is how". No timestamp is written, so a
no-op build produces no diff.

The validation is deliberately doubled. `gallery.mjs` is the loud half — it fails
the build naming the photo. `content/gallery.ts` is the quiet half, dropping a
bad photo with a console warning, for the case where the loud one did not run. A
marketing hire publishing at 4pm should not be able to take down `/gallery/` and
the home page with a missing alt attribute.

### Live Google reviews (optional)

`lib/googleReviews.ts` calls Places API (New) client-side, per page view that
shows reviews. **The only thing on the site that bills per visitor** — watch it
for a week after launch and set a budget alert. Unset, the page falls back to a
link to the listing: honest, just less persuasive.

### Storm radar (`/storm-damage/`)

`lib/nwsRadar.ts` (607 lines) fetches radar frames and active alerts from the
National Weather Service — keyless, CORS-open, public domain. The *geography* is
not fetched: `lib/radarBasemap.ts` is generated by hand-run
`scripts/radar-basemap.mjs` from Census TIGERweb polygons and committed as SVG
paths. Parish lines have not moved since 1912. The map draws instantly, draws
when the network is what the hurricane took out, needs no third-party basemap or
attribution bar, and is in the site's own palette.

Niche as a feature; **the technique ports** — bake the geography that never
changes, fetch only the volatile layer.

---

## 8. The Workers

Both are TypeScript, both deploy with `wrangler deploy`, both refuse rather than
defaulting open when unconfigured.

### `workers/lead-relay`

One D1 table (`leads`) holding both kinds of contact, plus CRM forwarding.

**Order of operations is the design: write the row, answer the caller, forward
afterwards.** Anything else couples the business's ability to take work to a
third party's uptime. A lead forwarded and not stored is gone; a lead stored and
not forwarded is a row with `crm_status='failed'` that the retry picks up.

| Route | Method | Guard |
|---|---|---|
| `/health` | GET | none — deliberately says nothing about configuration |
| `/lead` | POST | Origin allowlist + optional KV rate limit |
| `/application` | POST | Shared `INGEST_SECRET` (server-to-server) |
| `/export.csv` | GET | Bearer `EXPORT_TOKEN`; closed if unset |
| `/resume/:leadId` | GET | **Cloudflare Access, in front of the Worker** |

**The `/resume/` split is deliberate and cannot be verified from the code.** The
office reaches it by clicking a link in a CRM record, and a browser following a
link cannot attach an `Authorization` header — so a token there would be a token
in the URL, which is a credential in every CRM record, browser history and
forwarded email. Access puts a Google Workspace sign-in in front of the route for
free at this scale. The lead id is an unguessable v4 UUID, which is worth having
and is **not** access control. **Deploying this Worker on a `*.workers.dev`
hostname that Access does not cover leaves job applicants' CVs reachable by
anyone holding the URL.**

**CRM adapters** live in `src/crm/`: `types.ts`, `index.ts` (registry),
`generic.ts` (flat JSON POST — what a Zapier hook wants), `hubspot.ts` (CRM
Objects API). Adding a CRM is one file plus one registry line; nothing else in
the Worker learns its name. An unknown `CRM_ADAPTER` resolves to `null` rather
than falling back, so a typo parks rows as `disabled` instead of posting them
somewhere unintended.

`crm_status`: `pending` / `sent` / `failed` / `disabled` / `skipped`. A cron
sweep every 15 minutes drains everything but `skipped`. **An unconfigured CRM is
a supported state**, not a half-finished one — set the secret later and the next
sweep delivers the whole backlog.

Tests: `test/crm.test.ts`, 23 cases, `node --test` running TypeScript directly.
No build, no framework.

### `workers/careers-upload`

One multipart POST. No read path, no listing, no way to hand a file back out —
and it must not grow one. The thing that takes anonymous uploads from the
internet is the last thing that should also be able to serve them.

Layers, with the file's own honest assessment of each:

1. Origin allowlist — stops another *website's* browser posting on a visitor's
   behalf, and nothing else. A script sets `Origin` to whatever it likes.
2. **Turnstile — the actual gate**, and the only layer distinguishing a person
   from a script. Required: no secret configured means every upload is refused.
3. `Content-Length` pre-gate — an optimisation, not a control (chunked requests
   have none).
4. Extension **and magic bytes**. Extension and Content-Type are both supplied by
   the uploader; only the bytes are evidence. `.doc` refused outright.
5. Optional KV per-IP limit as a backstop. A WAF rule is better — it stops the
   request before it bills.
6. Control characters scrubbed from every text field; R2 metadata encoded to
   printable ASCII, because it travels in HTTP headers.
7. The stored key is generated server-side. A filename from a form field is never
   a path.

Not covered, and stated plainly: nothing scans these files.

`IP_HASH_SALT` lets the bucket record "these uploads came from one place" without
recording where — an unsalted hash of an IPv4 address is a lookup table away from
being the address. `IP_RETENTION_DAYS` (30) ages that out; the résumé itself is
kept 365 days by the R2 lifecycle rule in `scripts/set-retention.sh`.

**That 365 is a promise with infrastructure behind it.** The careers page tells
applicants their file is deleted after twelve months and sits somewhere only the
business can reach. Both promises are kept outside this repo — the lifecycle
rule, and the Access application. If either is not set up, the promise is false.

---

## 9. Motion system

**`lib/motion.ts`** is the vocabulary. Two curves, three durations, travel
distances, stagger, viewport thresholds, `PIN_MIN_WIDTH`. Nothing in
`components/` writes a duration, curve or distance of its own — that is what
keeps thirty animated bands reading as one system rather than thirty
improvisations.

- `ease.out = [0.21, 0.65, 0.36, 1]` — fast out, slow land, no overshoot.
  Overshoot reads as playful and nothing about a roof replacement is playful.
  Deliberately not the Material default, which `check.mjs` flags by name.
- `ease.inOut` — symmetric, for anything reversible (scrubbed sequences, band
  crossfades). An ease-out curve played backwards stalls exactly when the eye is
  following most closely.
- Three durations, spaced far enough apart to tell apart: `quick` 0.25s,
  `base` 0.7s, `slow` 1.1s. Bigger masses move for longer.

**`lib/useScrollMotion.ts`** — `useStillness()`, the reduced-motion gate, and the
most subtle file in the repo. It returns `false` on the server *and on the first
client render*, on purpose. Branching a render tree on `useReducedMotion()`
directly produces markup structurally different from the HTML being hydrated —
React error #418, six on the home page — and React's recovery is to throw the
server markup away and re-render everything on the client, which is the most
expensive thing that can happen on the one path whose purpose is to do less work.
Stillness applies from the second render; the one frame in between is covered by
the `prefers-reduced-motion` block in `globals.css`, not by the hook.

**`components/SmoothScroll.tsx`** — Lenis, mounted once in the layout, renders
nothing. `syncTouch: false` stays off: a finger already has OS momentum, and
layering a second inertia model on top is the commonest way these libraries make
a phone feel broken. `anchors: { offset: -96 }` clears the sticky header, because
Lenis does not read CSS `scroll-margin` — the matching `:target` rule in
`globals.css` covers the native path. The component turns off
`html { scroll-behavior: smooth }` at runtime and restores it on cleanup, because
that rule and Lenis fight over the same scroll position; leaving the rule in the
stylesheet keeps it working for the two cases Lenis is absent from.

**`components/PinnedSteps.tsx`** — a band that holds still while its contents
advance. No library pinning, no fixed positioning, no scroll hijack: an outer
element taller than the screen provides the distance, an inner `position: sticky`
frame stays put. The browser does the pinning natively, so it survives resize,
zoom, find-in-page and back-button restoration with no recalculation of ours.

**`components/Parallax.tsx`** — the inner layer is grown by exactly the travel
distance and offset by half of it, so the drift is spent inside the overflow and
no caller has to remember to oversize its image. Never used on anything a visitor
reads or clicks.

**The `<noscript>` block in `app/layout.tsx`** is worth carrying verbatim. Framer
serialises an animation's starting state into the HTML, so 36 elements on the
home page ship as `style="opacity:0"`. With JS that is invisible for a few
hundred milliseconds; without it, a permanently blank page on a site whose entire
job is to be found and phoned. The rule is a blunt attribute selector on purpose:
it catches every animated element, including ones added later by someone who
never read the file. It uses `dangerouslySetInnerHTML` because `<style>` is a
raw-text element and React would escape the selector's quotes to `&quot;`, which
the CSS parser does not decode — so the rule would silently never match.

---

## 10. App routes

16 pages. All static; `/services/[slug]/` is SSG from `content/services.ts`.

| Route | Source of content | Notable |
|---|---|---|
| `/` | `client.config` + content | Nine bands: Hero, StormStrip, Services, MetalSpec, Process, Brands, About, Testimonials, Gallery, Contact, CtaBand |
| `/services/` | `content/services.ts` | Hub; `ServiceCards` + `Process` |
| `/services/[slug]/` | `content/services.ts` | 5 pages, SSG, `Service` JSON-LD |
| `/gallery/` | Sanity via generated JSON | `GalleryBrowser`, `ImageGallery` JSON-LD |
| `/storm-damage/` | `content/storm.ts` | `StormRadar` — live NWS |
| `/insurance/` | `content/insurance.ts` | Claims-role copy; needs legal review |
| `/financing/` | `content/financing.ts` | `PaymentEstimator`, EnerBank products |
| `/areas/` | `content/areas.ts` | One hub, not sixteen town pages |
| `/team/` | `content/team.ts` | Parent of the About dropdown |
| `/reviews/` | `content/reviews.ts` + live | `GoogleReviews` + `ReviewColumns` |
| `/case-studies/` | `content/caseStudies.ts` | Template built, registry `live: false` |
| `/video/` | `content/video.ts` | Self-hosted H.264 |
| `/careers/` | `content/careers.ts` | `CareersForm`; `postingsAreLive` is separate from route `live` |
| `/contact/` | `content/contact.ts` | Where every CTA lands |
| `/terms/`, `/privacy/` | inline | `noindex` via `isIndexable()`; share `app/legal.tsx` |
| `/_not-found` | — | Hands back real routes and the phone number |

`app/layout.tsx` owns all chrome: `SmoothScroll`, `PageTransition`,
`PreviewBanner`, `UtilityBar`, `Nav`, `main`, `Footer`, `StickyCTA`,
`CookieConsent`, `Analytics`, `InteractionTracking`, `CallCard`, `JsonLd`. A new
page cannot accidentally ship without them.

**`content/careers.ts` has `postingsAreLive`, deliberately separate from the
registry's `live`.** The registry flag decides whether `/careers/` exists and is
indexed. This one decides whether `JobPosting` structured data is published.
Publishing a phantom vacancy into Google for Jobs costs the applicant who finds
it there.

---

## 11. Component inventory (57)

**Portable — no client in them.** Motion primitives: `Reveal`, `RevealText`,
`RevealGroup`, `Parallax`, `PinnedSteps`, `BandTransition`, `DrawRule`,
`PageTransition`, `SmoothScroll`. UI: `Button`, `SectionHead`, `MoreLink`,
`Breadcrumbs`, `Lightbox`, `BeforeAfterSlider`, `Stars`, `Mark`, `Pending`,
`SocialIcons`, `FaqList`, `PageHero`. Chrome/infra: `Nav`, `Footer`,
`UtilityBar`, `StickyCTA`, `CallCard`, `CookieConsent`, `Analytics`,
`InteractionTracking`, `JsonLd`, `Turnstile`, `PreviewBanner`, `BookingEmbed`,
`Contact`, `CareersForm`, `CtaBand`, `Gallery`, `GalleryBrowser`.

**Vertical-specific — rewrite or leave.** `Hero`, `MetalSpec`, `Process`,
`Brands`, `About`, `Services`, `ServiceCards`, `OtherServices`, `Testimonials`,
`StormStrip`, `StormRadar`, `StormWarnings`, `FinanceProducts`, `FinanceStrip`,
`PaymentEstimator`, `RoleCards`, `GoogleReviews`, `ReviewColumns`, `BeforeAfter`,
`CaseStudyArticle`.

Two of the portable ones carry a stray "CTL" in a comment (`SectionHead`,
`CtaBand`), and `Lightbox` references `/ctl/gallery/` paths. Everything else in
that first group is clean. Note that a case-insensitive grep for `ctl` mostly
matches "exa**ctl**y" — filter it out or the count is meaningless.

`components/Pending.tsx` is a good idea worth keeping: a typed marker for content
the client still owes, rendered as an obviously-unfinished panel rather than
filled with invented copy. `content/pending.ts` holds the entries.

---

## 12. lib/ (15 modules)

| File | Role |
|---|---|
| `routes.ts` | Route registry (§4) |
| `content.ts` | Content boundary — pages import getters here, never `content/*` directly. A CMS swap is this file and nothing else |
| `motion.ts`, `useScrollMotion.ts` | Motion system (§9) |
| `meta.ts` | `pageMetadata()`, `robotsFor()`, `absoluteUrl()` — wired to the registry |
| `preview.ts` | `IS_PREVIEW`, `REAL_SITE` |
| `consent.ts` | localStorage consent + change event. `CONSENT_KEY` exported because `/contact/` reads it from an inline script before this module downloads |
| `tracking.ts` | Plausible events + DNI hook. Both consent-gated; no-ops when declined |
| `submitContact.ts`, `submitApplication.ts` | The two form paths (§7) |
| `phone.ts` | Shared digit-count reachability rule |
| `booking.ts` | Embed URL + preconnect origins in one place, so a preconnect cannot disagree with what the iframe fetches |
| `googleReviews.ts` | Places API (New), client-side |
| `nwsRadar.ts`, `radarBasemap.ts` | Storm radar (§7). `radarBasemap.ts` is generated |

---

## 13. Security posture

- **`public/_headers`** — `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Frame-Options: DENY`, `Permissions-Policy` denying camera/mic/geo/payment/usb,
  HSTS `max-age=31536000`. **No `includeSubDomains`, deliberately** — nobody has
  audited what lives under the domain, and a browser that has seen it refuses
  plain HTTP to `mail.`, `cpanel.` and anything else for a year with no way to
  take it back early. The two hostnames that matter both get the header directly.
  `preload` is a much larger commitment and is not something to set on a client's
  behalf without asking. Cache tiers split by whether a URL's bytes are
  content-hashed: `/_next/static/*` immutable for a year, `/ctl/*` one day with
  revalidation (photos reuse filenames).
- **CSP** generated and drift-checked (§5). The generated policy owns CSP
  entirely; `_headers` no longer sets one, because two CSP headers on one path
  are enforced as an intersection and that is confusing to reason about.
- **Secrets never reach the browser.** `harden.mjs` scans `out/` for real key
  material and for any non-`NEXT_PUBLIC_` env value. `SANITY_READ_TOKEN` is the
  one real secret and is build-time only.
- **Publishable ≠ private** — the Web3Forms key and the referrer-restricted
  Places key are compiled into the JS by design. `.env.example` says so for each.

---

## 14. Deployment

| Thing | Target |
|---|---|
| Production site | Cloudflare Pages project `ctl-roofing`, `out/` |
| Preview site | Pages project `ctl-preview` (the only deployment today) |
| Lead relay | Worker `ctl-lead-relay` + D1 `ctl-leads` + R2 read binding + cron |
| Careers upload | Worker `ctl-careers-upload` + R2 `ctl-resumes` (write only) |
| Studio | Sanity-hosted |

Node version pinned in `.nvmrc`. `docs/CUTOVER.md` is the dated go-live sequence;
`docs/LAUNCH-CREDENTIALS.md` lists every account and what breaks without it.

**Preview builds run the correctness checks too** — `preview-build.mjs` includes
gallery, csp, seo and harden, omitting only the font preload and the route check.
While the preview is the only deployment, it is the only thing checking, and a
check that runs solely in production is a check nobody has run.

---

## 15. Porting guidance

### Take verbatim
All ten build scripts. `lib/motion.ts`, `useScrollMotion.ts`, `consent.ts`,
`tracking.ts`, `preview.ts`, `phone.ts`. Every motion primitive and generic UI
component. `tailwind.config.ts`, `next.config.mjs`, `postcss.config.mjs`,
`public/_headers`, `.nvmrc`. Both Workers' source and tests.

### Take and parameterise
- `client.config.ts` → placeholders, **keep every comment** — they are the spec.
- `lib/routes.ts` → generic tree, most children `live: false`.
- `scripts/csp.mjs` → hardcoded origins become one declared `INTEGRATIONS` block.
- `lib/booking.ts` → Calendly's asset host and embed params become a table keyed
  by scheduler origin.
- `components/JsonLd.tsx` → `@type` is currently the literal `"RoofingContractor"`;
  make it a config value, and prune empty fields (a schema asserting an empty
  `telephone` is worse than one that stays quiet).
- `content/types.ts` → generic `GalleryCategory` union; `parish` is
  Louisiana-specific, rename to `region`.
- `workers/*/wrangler.toml` → **contains a real D1 `database_id`**, real bucket
  names, real origins and `RELAY_PUBLIC_ORIGIN`. All must become placeholders.
- `client.config.ts` `stormPhone` → something vertical-neutral like `urgentPhone`,
  and follow it through `Contact`, `UtilityBar`, `CallCard`, `Footer`,
  `CtaBand`, `InteractionTracking`.

### Leave behind
All of `content/*.ts`, the vertical bands listed in §11, `lib/nwsRadar.ts`,
`lib/radarBasemap.ts`, `scripts/radar-basemap.mjs`, and the legal pages' prose.

**The legal pages need saying twice.** Carry the *wiring* — `robotsFor()` +
`isIndexable()` — and throw away the words. Terms describing a roofing
contractor's claims role on another business's site are worse than no terms. What
*is* portable is the list of processors this infrastructure introduces: Web3Forms,
the relay and its CRM, R2 résumé storage, Turnstile, Plausible, call tracking,
the booking iframe, and the localStorage consent flag. That list is exactly what a
privacy policy has to disclose, and it is a property of the code, not the client.

### Fix on the way through
1. `Nav` must filter top-level items by `live` (§4).
2. `Footer`'s second column must be derived from the registry (§4).

Both are invisible in this repo and fail the build immediately in a tree with
non-live top-level routes — `scripts/routes.mjs --check` catches them.

### Verify the port
The bar is that the extracted tree builds and passes its own checks before any
client content exists:

```
cd <site> && npm ci && npm run build   # all five gates green
cd <workers>/lead-relay && npm ci && npm test   # 23 passing
```

---

## 16. Conventions

- **Comments explain the failure, not the code.** Most long comment blocks in
  this repo record something that broke. Deleting one deletes the reason a
  decision looks odd. If you change a decision, change its comment with it —
  `lib/motion.ts` says this outright and it applies everywhere.
- **Trailing slashes everywhere** (`trailingSlash: true`). Route hrefs, `meta.path`
  and the registry all use them; a missing one fails `routes.mjs`.
- **`@/` maps to the app root** (`ctl-roofing/`).
- **Components never import `content/*` directly** — always through
  `lib/content.ts`.
- **Components never write their own motion values** — always through
  `lib/motion.ts`.
- **A config value that is empty means "skip this feature"**, not "render an
  empty thing". `mapEmbedSrc`, `bookingUrl`, `testimonials`, `badges`, every
  social link, and `tracking.dniScriptUrl` all work this way. Preserve it.
- **Refuse rather than default open.** Both Workers do this when unconfigured;
  both forms do this when their endpoint is missing.
