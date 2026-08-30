# CTL site rebuild — work breakdown

Source: `ctlsiteplan.md` (client requirements). This file is the build
order, the decisions taken, and what is still blocked on the client.

## Decisions taken

| Decision | Choice |
|---|---|
| Scope now | **Phase 1** — foundation, home rewire, services hub + 5 children, storm/insurance, contact, financing. Areas, case studies, reviews, careers, blog are phase 2. |
| CMS | **CMS-ready, no CMS yet.** Content lives in typed modules under `content/`, read through one loader (`lib/content.ts`). Adding Decap/Sveltia or a headless CMS later replaces the loader, not the pages. |
| Missing client content | **Visible placeholders.** A single `<Pending>` component renders an honest, obviously-unfinished block naming exactly what is needed and from whom. Nothing is invented to fill a gap. |

## Constraint that shapes everything

`next.config.mjs` sets `output: "export"` — a static site on Cloudflare
Pages. No server runtime. Consequences the plan has to respect:

- No API routes. Every form posts to `NEXT_PUBLIC_FORM_ENDPOINT`.
- Reviews cannot be fetched per-request. Either build-time fetch, or
  curated quotes in content. Google's Places terms restrict caching
  review text, so curated-with-permission is the safe default.
- A careers page with résumé upload needs an endpoint that accepts
  multipart — the current JSON submit path does not. Phase 2 problem.
- Call tracking is a script + swapped numbers, not server logic.

---

## Status

Phase 1 is built: Parts A–H below are done and on the branch. The
phase-2 backlog and the blocked-on-Robert list at the foot of this file
are what remains.

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

## What phase 2 switches on

`lib/routes.ts` already carries the phase-2 routes with `live: false`.
Nothing links to them, the sitemap omits them, and the nav renders
"Our Work" and "About" as plain links to the home page's own bands
rather than as dropdowns onto pages that do not exist. The home funnel
links to the gallery, case studies, the team and the areas hub are
written and in place — they render nothing today and appear the moment
their route flips to `live: true`.

## Phase 2 backlog

Areas we serve (hub + 6–10 towns) · case studies (6–8) · gallery page ·
video tab · reviews · careers + application form · blog (10 posts from
existing Facebook copy) · warranty explainer · showroom.

## Blocked on Robert

Carried over from the plan, plus what the build surfaced:

1. Eight headshots, same wall / crop / shirt, with name, role, one line
2. LA contractor licence number
3. Manufacturer certifications — and specifically whether they are
   FORTIFIED-certified (a photo shows a FORTIFIED sign; that is an
   insurance-discount trust badge in Louisiana)
4. Financing partner name, real terms, prequalification link
5. Definitive service-area town list
6. Six to eight projects with before/after photos for case studies
7. Whether reviews may be reproduced on-site, and from where
8. Call-tracking provider and the per-channel numbers
9. Confirmation of the claims-role language in Part E
