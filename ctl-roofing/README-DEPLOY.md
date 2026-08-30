# Go-Live Checklist — touch every item before a client site ships

This tree is currently configured for **CTL Pro Construction LLC (CTL
Roofing)**, Broussard LA. Items already done for CTL are checked; the
open boxes are what still stands between this and a DNS cutover.

Phase 1 of the multi-page rebuild is built — see `docs/REBUILD-PLAN.md`
for the work breakdown, what phase 2 switches on, and the content still
owed by the client.

Workflow for a new client: `git clone` → new repo → work back through
this list top to bottom → `npm run deploy`.

## 1. Content — `client.config.ts` and `content/`

`client.config.ts` holds identity, contact and sitewide copy. Page
content lives in `content/`, read through `lib/content.ts` — which is
also the one file a CMS would replace.
- [x] `businessName`, `legalName`, `tagline`, `taglineEmphasis`, `subheadline`
- [x] `siteUrl` (https://www.ctlpro.com, no trailing slash)
- [x] `metaTitle`, `metaDescription`
- [x] `phone`/`phoneHref` and `stormPhone`/`stormPhoneHref` (E.164), `email`
- [x] `address`, `hours`, `hoursShort`
- [ ] `mapEmbedSrc` (Google Maps → Share → Embed → copy the iframe `src`).
      Empty today, so the contact column skips the map panel.
- [x] `bookingUrl` — the Calendly link every primary CTA points at.
      `calLink` is empty, so the Cal.com inline section stays hidden.
- [x] `socials` — Facebook, Instagram and the Google review link.
      Icons sit in the utility strip and footer, never the main nav.
- [x] `metal`, `process`, `brands`, `about`, `gallery` (config);
      `content/services.ts`, `content/storm.ts`, `content/contact.ts`,
      `content/towns.ts` (page content)
- [x] `form.serviceOptions` — the one dropdown on the request sheet
- [ ] `content/financing.ts` → `offers`, `lender`, `prequalifyUrl`.
      Empty today, so the estimator renders the pending panel instead
      of a payment. Do not add an offer until the terms are real.
- [ ] `content/pending.ts` — every entry here is a visible placeholder
      on the live site. The list shrinks as content arrives.
- [ ] `client.config.ts` → `tracking.dniScriptUrl` — the call-tracking
      provider's script. Empty = every number shown is the real one.
- [ ] `testimonials` — REAL reviews only. Empty today, so the section
      does not render; add quotes CTL has cleared for the site.
- [ ] `badges` — real license number(s). Empty today, so no license line
      prints. Confirm CTL's LA contractor license and add it.
- [x] `copy` — headings, CTAs, hero facts, closing band

## 2. Routes

Phase-2 pages are registered in `lib/routes.ts` with `live: false`.
Nothing links to them and the sitemap omits them until that flips.

- [x] `/`, `/services/` + five service pages, `/storm-damage/`,
      `/contact/`, `/financing/`, `/gallery/`, `/terms/`, `/privacy/`, 404
- [ ] Phase 2: `/case-studies/`, `/video/`, `/team/`, `/areas/` + town
      pages, `/reviews/`, `/careers/`, blog

## 3. Images — `/public/ctl`
- [x] Logo, hero, four service photos, metal panel, team, owner,
      materials — all real CTL job photography
- [x] Gallery: 40 photographs across five categories, in
      `content/gallery.ts`, feeding both the home band and `/gallery/`
- [x] OG image (1200×630, `og.jpg`)
- [x] Favicon — `app/icon.png`, the CTL letterform on the wordmark
      periwinkle with the gold bar; legible at 32px

## 4. Environment — `.env.local` (copy from `.env.example`)
- [ ] `NEXT_PUBLIC_WEB3FORMS_KEY` — REQUIRED. The access key for the
      office inbox. Without it the form refuses to submit and shows the
      phone number; it no longer pretends to succeed.
- [ ] `NEXT_PUBLIC_LEAD_WEBHOOK_URL` — the CRM copy of the lead, once a
      CRM is chosen. Fired in parallel and never awaited, so a CRM
      outage cannot cost the email.
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — or leave empty for no analytics
- [ ] Mirror these in Cloudflare Pages → Settings → Environment
      variables, for Production *and* Preview

## 5. Legal — written, not yet lawyer-reviewed
Both pages now describe what this site actually does, service by
service, with an effective date set. They are a careful draft, not
legal advice.
- [ ] CTL's attorney reads both — particularly the claims-role section
      in the terms, which states that CTL does not adjust claims
- [ ] Re-check the privacy page whenever a processor is added or
      removed. It names Web3Forms, Calendly, Plausible and Cloudflare
      by name, so adding a CRM or call tracking means adding a line.

## 6. Brand
- [x] `app/globals.css` — color tokens sampled from the CTL logo:
      indigo `#2D3581`, periwinkle `#5160A6`, gold `#F1CC47`, ink
      `#0B1233`. Gold is the only call-to-action color; indigo carries
      structure, links and focus rings.
- [x] Type: Big Shoulders Display (display) + IBM Plex Sans/Mono
      (body/utility), self-hosted via Fontsource — latin subsets only,
      imported in `app/layout.tsx`. To swap: `npm i @fontsource/<face>`,
      change the import, and update `--font-*` in globals.css.

## 7. Verify before DNS cutover
- [x] `npm run build` clean (static export to `./out`)
- [x] `npm run check` — 0 errors, 0 warnings. The 5 advisories are
      false positives (gradient `100%` stops read as round stats;
      em-dashes counted inside CSS and TS comments). New findings elsewhere
      mean a component edit inherited a default — fix it, or suppress
      consciously with `deliberate-ignore`.
- [ ] Form submits end-to-end (check inbox AND lead webhook if enabled)
- [ ] Calendly books a test slot — both the inline embed on `/contact/`
      (which only loads once the visitor asks for it) and the direct link
- [ ] Storm page language checked against how CTL actually operates in a
      claim — see the ⚠️ note in `content/storm.ts`
- [ ] Cookie banner: decline → no analytics request in Network tab;
      accept → script loads
- [ ] Lighthouse mobile ≥ 90 performance
- [ ] Rich Results Test on the `RoofingContractor`, `Service`,
      `FAQPage` and `BreadcrumbList` JSON-LD
- [ ] tel:/sms: links work from a real phone — both the office line and
      the storm line
- [ ] Grep the repo for `TODO(client)` — must return zero results

## Deploy — Cloudflare Pages

The old ctlpro.com site is still live and DNS still points at it. Ship
to a `*.pages.dev` preview first, check it there, and only then move
DNS. Nothing below touches the live site until the final step.

### 1. Connect the repo

Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `out` |
| **Root directory (advanced)** | `ctl-roofing` |

The root directory is the one people miss. The Next project is not at
the repo root, and without it the build fails looking for a package.json.

Node version comes from `.nvmrc` (20). If Pages ignores it, set a
`NODE_VERSION` environment variable to `20`.

### 2. Environment variables

Set these under Settings → Environment variables, for **both**
Production and Preview — a preview without them behaves differently
from production, which defeats the point of checking it there.

- [ ] `NEXT_PUBLIC_WEB3FORMS_KEY` — required, or the form refuses to
      submit and tells people to phone
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — `ctlpro.com`, or empty for none
- [ ] `NEXT_PUBLIC_LEAD_WEBHOOK_URL` — once a CRM is chosen

### 3. Check the preview

- [ ] Submit the form and confirm the email actually arrives
- [ ] Submit with the key deliberately wrong, and confirm the visitor
      sees the failure and the phone number rather than a false success
- [ ] Book a real slot through the inline calendar
- [ ] Decline the analytics banner, then confirm no Plausible request
      in the Network tab; accept, and confirm it loads
- [ ] Both phone numbers and the text link from an actual phone
- [ ] Lighthouse mobile ≥ 90

### 4. Before DNS moves

- [ ] Fill in `public/_redirects` from the old site's URLs — crawl it
      while it is still up. This gets harder after cutover, not easier.
- [ ] Legal pages read and approved (see §5)
- [ ] Decide on the `www` vs apex canonical and make the other redirect
- [ ] `siteUrl` in `client.config.ts` matches the winner

### 5. Cutover

Pages → Custom domains → add the domain, then move the DNS records.
Afterwards:

- [ ] Turn on HSTS in the Cloudflare dashboard (deliberately not set in
      `_headers` — committing to it before the domain is fully served
      over HTTPS is hard to undo)
- [ ] Submit `{siteUrl}/sitemap.xml` in Google Search Console
- [ ] Re-check the old site's top URLs now redirect rather than 404

### Manual deploy, if ever needed

```bash
cd ctl-roofing
npm run build            # emits ./out (static export)
npx wrangler pages deploy out
```
