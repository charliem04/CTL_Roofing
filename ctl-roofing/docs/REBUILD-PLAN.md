# CTL site rebuild — work breakdown

Source: `ctlsiteplan.md` (client requirements). This file is the build
order, the decisions taken, and what is still blocked on the client.

## Decisions taken

| Decision | Choice |
|---|---|
| Scope now | Phase 1 shipped, then most of phase 2: gallery, areas hub, video, team, reviews. Case studies, town pages, careers and the blog remain. |
| What this build is for | **A spec pitch.** Robert has not commissioned it, there is no deploy access and no crawl of the old site. It has to stand up on its own as a demo, which is why nothing on it reads as unfinished. |
| CMS | **CMS-ready, no CMS yet.** Content lives in typed modules under `content/`, read through one loader (`lib/content.ts`). Adding Decap/Sveltia or a headless CMS later replaces the loader, not the pages. |
| Missing client content | **Dev-only gap markers.** `<Pending>` returns null outside `npm run dev` — a note reading "waiting on Robert" is the right thing in a dev server and the wrong thing to show the client it names. Every gap therefore needs real visitor-facing copy in the built site: nothing invented, nothing apologetic, no reference to what is missing. The gaps stay tracked in `content/pending.ts`. |

## Constraint that shapes everything

`next.config.mjs` sets `output: "export"` — a static site on Cloudflare
Pages. No server runtime. Consequences the plan has to respect:

- No API routes. Every form posts to `NEXT_PUBLIC_FORM_ENDPOINT`.
- Reviews cannot be fetched at build time — not because of the export,
  but because Google's Places policy forbids caching or storing review
  text, and baking it into the HTML is exactly that. Solved by fetching
  client-side per view (`components/GoogleReviews.tsx`). Facebook has no
  API at all any more, so those are hard-coded. See Part I.
- A careers page with résumé upload needs an endpoint that accepts
  multipart, which the JSON submit path cannot do. Solved in Part J with
  a Cloudflare Worker writing to a private R2 bucket — the one piece of
  server-side code in the project, and the only thing here that can
  break at 2am.
- Call tracking is a script + swapped numbers, not server logic.

---

## Status

Phase 1 is built: Parts A–H below are done and on the branch. Phase 2
is done too — the gallery, areas hub, video tab, team page and reviews
are live (Part I), and case studies and careers are built but dark
(Part J), waiting on content and a deploy rather than on code.

## Part A — Content architecture (CMS-ready) ✅

`client.config.ts` stays the site-level contract: identity, both phone
lines, address, hours, socials, sitewide CTA copy. Page content moves
to `content/`:

```
content/types.ts      shared shapes (Photo, Faq, CtaCopy, PageMeta, …)
content/services.ts   hub copy + 5 service pages
content/storm.ts      storm damage & insurance claims
content/contact.ts    contact page copy
content/financing.ts  lender terms + estimator config
content/towns.ts      service areas (data now, pages phase 2)
content/pending.ts    phase-2 collections (team, cases, reviews, posts),
                      typed and empty, plus the text every <Pending>
                      panel renders — what is missing and who owes it
lib/content.ts        the loader boundary — the only file a CMS swap touches
lib/routes.ts         route registry: drives nav, footer, sitemap, breadcrumbs
lib/meta.ts           per-page title/description/canonical/OG from one PageMeta
lib/tracking.ts       conversion events + the call-tracking seam
```

## Part B — Site chrome ✅

- **Nav**: five items (Services, Our Work, Financing, About, Contact)
  with dropdown children, plus the gold Free assessment button.
  Keyboard-operable menus, mobile drawer mirrors it as an accordion.
  Facebook leaves the main nav.
- **Utility strip + footer**: Facebook and Instagram as icons.
- **Sticky mobile bar**: Call | Text | Book — three actions, was two.
- **Shared page furniture**: `PageHero`, `Breadcrumbs`, `CtaBand` with
  per-page copy, `Pending` placeholder, `Faq` (with FAQPage JSON-LD).
- **Route registry** so nav, footer and sitemap cannot drift apart.

## Part C — Home rewire ✅

Every band gets its own inline link, per the plan's funnel table:

| Band | Goes to |
|---|---|
| Hero | Contact / booking |
| Storm strip | Storm damage & insurance claims |
| Service cards | Each service page |
| Metal roofing | Roofing → metal |
| How a project runs | Process (phase 2: case studies) |
| What we build with | Services / warranty |
| Committed to local | Meet the team + areas we serve |
| Recent work | Gallery |
| Closing CTA | Contact |

## Part D — Services hub + five children ✅

`/services/` plus roofing, remodeling-restoration, outdoor-living,
emergency-inspections, commercial. Each page: what's included, how it
runs, what it's built with, related work, FAQ, CTA band. Roofing
carries the `#metal` anchor the home band points at. Commercial exists
so a property manager looking for TPO never reads shingle copy.

## Part E — Storm damage & insurance claims ✅

The highest-value missing page. First 48 hours, what an adjuster looks
for, what CTL does and does not do during a claim, covered vs not, FAQ.

⚠️ **Legal check before launch**: in Louisiana, negotiating a claim on
a homeowner's behalf is public adjusting and requires a licence. The
page is written so CTL documents damage, meets the adjuster on site,
and scopes the repair — the homeowner files and negotiates. Robert
should confirm that language matches how they actually operate.

## Part F — Contact page ✅

Full request form, inline Calendly (consent-gated, since it is a third
party), both phone lines, hours, map slot, showroom address.

## Part G — Financing + payment estimator ✅

Slider from project cost to estimated monthly payment, driven entirely
by a terms table in `content/financing.ts`. With no real terms set the
estimator does not render invented numbers — it renders `<Pending>`.

## Part H — Cross-cutting ✅

Per-page metadata and OG, canonicals, sitemap from the route registry,
404, JSON-LD per page type, call-tracking config seam, analytics
events on call/text/book/submit.

Two things worth knowing about how this landed:

- **The chrome moved into `app/layout.tsx`.** It used to be assembled on
  the home page, which meant any new route rendered with no header,
  footer or sticky bar. It cannot now.
- **Events are one delegated listener**, not an onClick per button
  (`components/InteractionTracking.tsx`). Any `tel:`, `sms:` or booking
  link added anywhere later is tracked without being wired up, and it
  records which line was tapped — office or storm.

Call tracking proper (dynamic number insertion) is a provider script,
so it is a URL in `client.config.ts → tracking.dniScriptUrl`, loaded
with the other consented scripts. Empty until a provider is chosen,
which means every number on the site is the real one.

---

## Part I — Phase 2 as built ✅

**Gallery** (`/gallery/`) — 40 photographs, five category filters,
shared lightbox. One source (`content/gallery.ts`) feeds both the home
band and the page; `featured` picks the home subset.

**Areas** (`/areas/`) — hub only, 16 towns grouped into 6 parishes by
`townsByParish()`. Deliberately no per-town pages: a town page with no
local project on it is a thin near-duplicate, which is the doorway
pattern search engines demote. Town pages become worth building once
case studies exist to put on them.

**Video** (`/video/`) — one clip, 10.6MB, `preload="none"` so nothing
downloads until play is pressed (verified: zero mp4 requests on scroll).
The second supplied file is a 417KB truncated download that decodes one
frame and stops, so it is excluded rather than shipped broken.

**Team** (`/team/`) — Robert at the top in his own words, then eight
crew headshots cropped 4:5 from the photos supplied. Names only. No job
titles, because we were sent faces and names and a guessed title under a
real person's face is not a thing this site does.

**Reviews** (`/reviews/`) — two platforms, two mechanics, and the
difference is not a choice we made:

- *Google is live.* `components/GoogleReviews.tsx` calls Places API
  (New) from the browser on every view. Nothing is cached, because the
  Places policy forbids storing review content — `place_id` is the only
  documented exception. The API caps a response at five reviews, so the
  page is built around five rather than paginating toward a sixth that
  does not exist. Author name, author photo and a link back to the
  review are all required attribution; do not strip them. Unconfigured,
  the band degrades to a link to the listing and makes zero outbound
  requests.
- *Facebook is hard-coded, permanently.* Meta deprecated Page
  recommendations in Graph API v22.0 and killed them across every
  version on 9 September 2025 — reading one returns error code 12.
  There is no API to wait for and scraping violates their terms. Ten
  recommendations and the 98%/39-people figure were copied by hand into
  `content/reviews.ts`, verbatim, with the capture date printed on the
  page next to the stat.

**No AggregateRating JSON-LD anywhere, deliberately.** Reviews about CTL
on CTL's own site are self-serving; Google has not shown review snippets
for self-serving LocalBusiness markup since 2019, so the stars would not
appear, and marking it up anyway is what earns a structured-data manual
action across the whole domain. The reasoning is repeated in a comment
at the top of `app/reviews/page.tsx` so nobody helpfully adds it back.

---

## Part J — Case studies and careers, scaffolded ✅

Both page types are built. Both routes stay `live: false`, so nothing
links to them and the sitemap omits them; both index pages carry
`noindex` derived from `isLive()` rather than hardcoded, so it lifts
itself on switch-on.

**Case studies.** `content/caseStudies.ts` is empty and documents the
shape. The detail template is `components/CaseStudyArticle.tsx` rather
than a route, because `output: "export"` refuses a dynamic route whose
`generateStaticParams()` returns `[]` — it reads "no params" as "no
generateStaticParams" and fails the build. As a component it stays
compiled and typechecked; the twelve-line page file that activates it
is written out in its header.

*Switch on:* add studies, create the page file, flip the flag.

**Careers.** `content/careers.ts` holds the copy and a six-question
questionnaire; `roles` is empty because nobody has said what CTL hires
for, or whether they are hiring. While it is empty the page runs as a
general application, which names no job that may not exist.

WARNING: the questions need an employment attorney's read. They are
written conservatively — every one is about doing the job, the physical
question describes the work and asks whether the applicant can do it
(an essential-function question, not a health question), and nothing
touches criminal history, age, health, family or citizenship. Careful is
not the same as cleared.

**The upload path, the only server-side code in the project.**
`workers/careers-upload` is a Cloudflare Worker: one multipart POST in,
validated hard, written to a PRIVATE R2 bucket, office pinged. No read
path, no listing, no way to pull a file back over HTTP. That is the
point — the bucket holds strangers' names, numbers and CVs, so the
failure mode designed out is "someone found a public URL", not "someone
uploaded a big file".

Validated in order: origin allowlist server-side (CORS is advisory,
curl ignores it), Content-Length before the body is read, per-IP KV
limit if bound, honeypot, Turnstile, name and phone, extension, then
MAGIC BYTES — because extension and Content-Type are both supplied by
the uploader. The R2 key is generated Worker-side; a filename from a
form field is never a path.

Exercised locally against `wrangler dev` with a real R2: happy paths for
PDF and DOCX store; wrong origin 403, no origin 403, GET 405, honeypot
200-with-nothing-stored, missing phone 400, no file 400, `.exe` 415,
text-renamed-`.pdf` 415, 6MB 413. A traversal filename landed as
`applications/2026/08/<uuid>-etc-passwd.pdf`. The browser form was then
driven end to end against that Worker — real file, real 200, real object
in the bucket — and the magic-byte rejection surfaces to the applicant
verbatim with no false success.

*Switch on:* deploy the Worker (its README has the sequence), set
`NEXT_PUBLIC_CAREERS_ENDPOINT` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
add roles, attorney sign-off, flip the flag.

Unset endpoint means the form refuses and points at the office email.
That is why the gate is the route and not a banner: a live "apply here"
form with nothing behind it takes somebody's resume and drops it.

---

## How a route goes live

`lib/routes.ts` is the single registry. A route with `live: false` is
linked from nowhere, omitted from the sitemap, and skipped by the
breadcrumb trail; flipping it to `true` is the entire switch-on. Live
today: gallery, video, areas, team, reviews, plus everything from phase
1. Still `false`: case studies and careers.

Two shapes worth preserving. A parent whose children are all dead
renders as a plain link to its own page rather than an empty dropdown.
And a parent is never also its own child — "Our Work" points at the
gallery and "About" at the team page, so neither is listed twice in the
sitemap.

## Phase 2 backlog

**Done:** gallery, areas hub, video, team, reviews (Part I). Case
studies and careers are built and dark (Part J).

**What is left.**

1. **Case-study content (6-8 projects)** — the page type is finished, so
   this is now purely a content drop. Still the single highest-value
   thing to get out of Robert: it unblocks per-town pages and is the
   only remaining page type that adds real ranking surface.
2. **Per-town pages** — built on top of the case studies, not before.
3. **Careers go-live** — deploy the Worker, add roles, attorney read.
4. **Blog** — on hold; not a launch priority.
5. **Warranty explainer, showroom.**

## Blocked on Robert

Everything here is tracked in `content/pending.ts` as well, which is
what the dev-only `<Pending>` panels render. Nothing on this list shows
to a visitor.

**Stops a page from being finished**

1. **Job titles for the eight crew** — the headshots and names are on
   `/team/` now; the roles are the missing half. A line each in their
   own words would finish the section. Spellings are confirmed.
2. **Six to eight projects with before/after photos** — unblocks case
   studies, and case studies unblock town pages.
3. **A working export of the second video** — the supplied file is a
   417KB truncated download. Also: titles in CTL's own words, and
   captions, since the audio carries the message.
4. **A commercial job photo** — low-slope membrane, a coating in
   progress or a finished commercial metal roof.

**Stops something switching on**

5. **Google Cloud API key + place ID** — turns the live Google reviews
   band on. Places API (New), key restricted to HTTP referrers. Note it
   bills per page view; set a budget alert in the first week. Details in
   `.env.example`.
6. **Web3Forms key** — without it the contact form refuses to submit and
   tells the visitor to phone, which is the honest failure. Nothing on
   the site captures a lead until this exists.
7. **Financing partner name, real terms, prequalification link** — the
   payment estimator stays switched off until these are real. A monthly
   figure on the site is a number a customer will hold you to.
8. **Call-tracking provider and the per-channel numbers** — until then
   every number on the site is the real one.

**Legal / factual sign-off**

9. **LA contractor licence number.**
10. **Manufacturer certifications** — specifically whether CTL is
    FORTIFIED-certified. A supplied photo shows a FORTIFIED sign, but
    the certification is unverified, so the photo is excluded and no
    badge is claimed. It is an insurance-discount trust badge in
    Louisiana and worth confirming.
11. **Claims-role language on the storm page** — Louisiana public
    adjusting is licensed under La. R.S. 22:1691. The copy is written to
    stay on the right side of that line; it needs a read.
12. **Attorney review of the legal pages.**
13. **The old site's URLs**, for `_redirects`. No crawl access yet, so
    the redirect map cannot be built.

**Refresh, not blocking**

14. The Facebook stat and recommendations are a hand-read snapshot dated
    on the page. Re-read them when the number moves — there is no feed
    that will do it for us.
