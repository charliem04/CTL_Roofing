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
      `/contact/`, `/financing/`, `/terms/`, `/privacy/`, 404
- [ ] Phase 2: `/gallery/`, `/case-studies/`, `/video/`, `/team/`,
      `/areas/` + town pages, `/reviews/`, `/careers/`, blog

## 3. Images — `/public/ctl`
- [x] Logo, hero, four service photos, metal panel, team, owner,
      eight gallery shots, materials — all real CTL job photography
- [x] OG image (1200×630, `og.jpg`)
- [x] Favicon — `app/icon.png`, the CTL letterform on the wordmark
      periwinkle with the gold bar; legible at 32px

## 4. Environment — `.env.local` (copy from `.env.example`)
- [ ] `NEXT_PUBLIC_FORM_ENDPOINT` — Formspree URL or Cloudflare Worker.
      Unset = the form silently succeeds in demo mode. DO NOT SHIP UNSET.
      The payload includes `address`, so map that field on the receiver.
- [ ] `NEXT_PUBLIC_LEAD_WEBHOOK_URL` — only for Speed-to-Lead clients
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — or leave empty for no analytics
- [ ] Mirror these in Cloudflare Pages → Settings → Environment variables

## 5. Legal — ⚠️ both pages ship with REPLACE BEFORE LAUNCH banners
- [ ] `app/terms/page.tsx` — review/replace text, set effective date,
      remove the warning banner block
- [ ] `app/privacy/page.tsx` — same, and confirm disclosures match what
      actually runs (analytics on/off, lead webhook on/off)

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

## Deploy
```bash
npm run build            # emits ./out (static export)
npx wrangler pages deploy out
```
Then Cloudflare Pages → Custom domains → attach the client domain, and
submit the sitemap (`{siteUrl}/sitemap.xml`) in Google Search Console.
