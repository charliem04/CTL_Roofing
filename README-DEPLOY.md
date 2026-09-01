# Go-Live Checklist — touch every item before a client site ships

> For CTL specifically, `ctl-handover.html` in this directory is the
> client-facing version of what is built and what is still needed.
> Open it in a browser.

Workflow per client: `git clone` → new repo → work through this list top
to bottom → `npm run deploy`.

## 1. `client.config.ts` — every `TODO(client)` field
- [ ] `businessName`, `legalName`, `tagline`, `subheadline`
- [ ] `siteUrl` (the real production domain, https, no trailing slash)
- [ ] `metaTitle`, `metaDescription`
- [ ] `phone`, `phoneHref` (E.164), `email`
- [ ] `address`, `hours`
- [ ] `mapEmbedSrc` (Google Maps → Share → Embed → copy the iframe `src`)
- [ ] `calLink` (client's Cal.com "username/event" — or `""` to hide booking)
- [ ] `socials` (empty string hides a link)
- [ ] `services` — icons, titles, descriptions
- [ ] `about` — heading, body paragraphs, stats (or `[]`)
- [ ] `testimonials` — REAL reviews only (or `[]` to hide the section)
- [ ] `badges` — real license number(s)
- [ ] `copy` — skim; defaults usually fine

## 2. Images — `/public`
- [ ] Replace `placeholder/logo.svg` (or add real logo + update `logoPath`)
- [ ] Replace hero image slot in `components/Hero.tsx` with a real
      job-site photo/video (see the TODO comment there) + write alt text
- [ ] Replace `placeholder/about.svg` reference + write alt text in
      `components/About.tsx`
- [ ] Create a real 1200×630 OG image, update `ogImagePath`

## 3. Environment — `.env.local` (copy from `.env.example`)
- [ ] `NEXT_PUBLIC_FORM_ENDPOINT` — Formspree URL or Cloudflare Worker.
      Unset = form silently succeeds in demo mode. DO NOT SHIP UNSET.
- [ ] `NEXT_PUBLIC_LEAD_WEBHOOK_URL` — only for Speed-to-Lead clients
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — or leave empty for no analytics
- [ ] Mirror these in Cloudflare Pages → Settings → Environment variables

## 4. Legal — ⚠️ both pages ship with REPLACE BEFORE LAUNCH banners
- [ ] `app/terms/page.tsx` — review/replace text, set effective date,
      remove the warning banner block
- [ ] `app/privacy/page.tsx` — same, and confirm disclosures match what
      actually runs (analytics on/off, lead webhook on/off)

## 5. Brand
- [ ] `app/globals.css` — set the `--brand*` color tokens
- [ ] Fonts: self-host in `/public/fonts` + `@font-face` if the brand
      needs a webfont; otherwise keep system stacks

## 6. Verify before DNS cutover
- [ ] `npm run build` clean
- [ ] Form submits end-to-end (check inbox AND lead webhook if enabled)
- [ ] Cal.com embed loads and books a test slot
- [ ] Cookie banner: decline → no analytics request in Network tab;
      accept → script loads
- [ ] Lighthouse mobile ≥ 90 performance
- [ ] Rich Results Test on the LocalBusiness JSON-LD
- [ ] tel:/sms: links work from a real phone
- [ ] Grep the repo for `TODO(client)` — must return zero results

## Deploy
```bash
npm run build            # emits ./out (static export)
npx wrangler pages deploy out
```
Then Cloudflare Pages → Custom domains → attach the client domain, and
submit the sitemap (`{siteUrl}/sitemap.xml`) in Google Search Console.

## Preview deploy — the pitch link, before there is a client

For putting the site on a temporary URL to show it to somebody, while
it is still a replica of a business that has not asked for it.

```bash
cd ctl-roofing
npx wrangler login                 # opens a browser; needs a Cloudflare account
npm run preview:deploy             # builds with NEXT_PUBLIC_PREVIEW=1 and pushes
```

The first run asks to create the Pages project (`ctl-preview`); accept,
and pick "Direct Upload". It prints a `*.pages.dev` URL — that is the
link to send. Non-interactively (CI, or no browser), set
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` instead of logging
in; the token needs the "Cloudflare Pages: Edit" permission.

`NEXT_PUBLIC_PREVIEW=1` is what makes that build safe to expose:

| Layer | What it stops |
|---|---|
| Banner on every page, not dismissible | Somebody believing it is CTL's site and calling the number on it |
| `noindex, nofollow` on every page | The replica competing with ctlpro.com in search |
| `robots.txt` disallowing everything, no sitemap advertised | A well-behaved crawler before it fetches a page |
| `X-Robots-Tag` response header | Images and other files a meta tag cannot reach |

Do NOT set `NEXT_PUBLIC_WEB3FORMS_KEY` on a preview build. With no key
the contact form refuses and tells the visitor to phone, which is the
honest failure; with a key, a stranger's enquiry lands in CTL's inbox
from a site CTL has never seen.

**Take it down when the conversation ends.** Nothing here does that for
you — `npx wrangler pages project delete ctl-preview`.

When CTL says yes, this all goes away: deploy with `npm run deploy`
(no preview flag), which restores the real robots.txt, the sitemap and
the indexable pages, and drops the banner.
