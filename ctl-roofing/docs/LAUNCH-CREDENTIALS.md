# Launch credentials — what has to exist, and who creates it

One page, for the working session. Every variable named here is already
documented in `ctl-roofing/.env.example`, `workers/lead-relay/README.md` or
`workers/careers-upload/README.md`; this file is the *acquisition* order, not
the configuration reference.

Three columns matter: **who** creates it, **when** it is needed, and **what
breaks without it**. A blank here is not a half-finished state — in almost
every case the code was written to fail honestly rather than silently, so the
site is safe to ship with gaps. It just cannot take a lead.

---

## 1. Robert brings these to the meeting

Nothing on this list can be created by anyone else, and several have lead
times measured in days.

| Item | Needed for | Notes |
|---|---|---|
| Domain registrar login for ctlpro.com | Cutover | Confirm the domain is unlocked and the auth/EPP code is retrievable |
| **Full DNS record export from the current host** | Cutover | MX, SPF, DKIM, DMARC and any vendor CNAMEs. See the warning below |
| CTL's legal name + EIN | Google Business Profile, any vendor account | |
| The Google account that owns the Business Profile | Reviews, Search Console, Maps embed | If nobody knows who owns it, start the GBP reclaim process immediately — it takes days |
| LA contractor licence number | `client.config.ts → badges` | No licence line prints until this exists |
| Attorney contact | Legal sign-off | Four documents to review; start this first |
| Current web host + contract end date | Rollback window | Do not cancel until 30 days after cutover |

> ### The one that will actually hurt
>
> Moving the nameservers to Cloudflare without first recreating CTL's **MX,
> SPF, DKIM and DMARC** records means company email stops arriving. Not
> degrades — stops. Get the zone export before anything else in this document,
> and recreate every non-web record in Cloudflare *before* the nameservers
> move, not after.

---

## 2. Created together, in the room

These need Robert present (his account, his billing, his decision) but take
minutes each once he is sitting there.

| Item | Variable it fills | Without it |
|---|---|---|
| Cloudflare account, **in CTL's name**, Charlie added as a member | — | CTL is locked to Charlie's personal account. Do this even if it costs an hour |
| Web3Forms access key for the office inbox | `NEXT_PUBLIC_WEB3FORMS_KEY` | **The contact form refuses to submit** and shows the phone number. The site cannot take a lead |
| Web3Forms spam protection switched on | — | The contact form's only defence today is a honeypot |
| Google Cloud project → Places API (New) → API key, restricted to HTTP referrers | `NEXT_PUBLIC_GOOGLE_PLACES_KEY` | Reviews band degrades to a link. Harmless, just weaker |
| **Budget alert on that key, set the same day** | — | This is the only thing on the site that bills per visitor |
| Place ID, verified against the real listing | `NEXT_PUBLIC_GOOGLE_PLACE_ID` | A wrong ID shows **a different business's reviews under CTL's name**. Verify, do not assume |
| Cloudflare Turnstile site + secret pair | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + Worker secret | The careers Worker refuses every upload rather than running open |
| GitHub organisation owned by CTL, + an account for each person who edits content | CMS sign-in | Sveltia requires a GitHub account with write access per editor. Real friction for an office — budget time to set it up properly |
| CRM account + its webhook or Zapier/Make URL | `CRM_WEBHOOK_URL` (Worker secret) | Supported blank state: leads still stored, delivered in bulk the first time it is set |
| Analytics account (Plausible paid / GA4 free) | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No analytics. Banner still behaves correctly |
| Call-tracking provider, if adopted | `client.config.ts → tracking.dniScriptUrl` | Every number on the site stays the real one, which is the correct default |
| Résumé handling decision | `NEXT_PUBLIC_CAREERS_ENDPOINT` | `/careers/` is a **live nav item** — the form refuses and points at email until this is resolved |

---

## 3. Charlie generates afterwards

No client involvement. Listed so nothing is forgotten at wiring time.

| Secret | Where it goes | Rule |
|---|---|---|
| `INGEST_SECRET` | lead-relay | Must equal `RELAY_INGEST_SECRET` on careers-upload, or applications are refused with a 401 |
| `RELAY_INGEST_SECRET` | careers-upload | ″ |
| `EXPORT_TOKEN` | lead-relay | Gates `/export.csv`, the only way customer data leaves the Worker. Unset = refuses everything |
| `IP_HASH_SALT` | careers-upload | Unset = no IP-derived value stored at all. Safe, but loses the "same source" signal |
| `NOTIFY_WEBHOOK` | careers-upload | Point at the relay's `/application` route |
| D1 `database_id` | `workers/lead-relay/wrangler.toml` | **Currently a placeholder string.** `wrangler d1 create ctl-leads`, paste the real id, `npm run schema` |
| GitHub OAuth app client ID + secret | the `sveltia-cms-auth` Worker | Plus `ALLOWED_DOMAINS` |
| `CMS_AUTH_URL` | Pages build env | Build-time only — **not** `NEXT_PUBLIC_`. Read by `scripts/cms.mjs` |

---

## 4. Mirror everything into Cloudflare Pages

Settings → Environment variables, for **Production *and* Preview**. A preview
missing a variable behaves differently from production, which defeats the
entire point of checking it there.

```
NEXT_PUBLIC_WEB3FORMS_KEY
NEXT_PUBLIC_LEAD_WEBHOOK_URL
NEXT_PUBLIC_CAREERS_ENDPOINT
NEXT_PUBLIC_TURNSTILE_SITE_KEY
NEXT_PUBLIC_GOOGLE_PLACES_KEY
NEXT_PUBLIC_GOOGLE_PLACE_ID
NEXT_PUBLIC_PLAUSIBLE_DOMAIN
CMS_AUTH_URL
```

Pages build settings, since the Next project is not at the repo root:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `out` |
| **Root directory (advanced)** | `ctl-roofing` |

Node comes from `.nvmrc` (20). If Pages ignores it, set `NODE_VERSION=20`.

---

## 5. Two things to add that are not credentials

- **WAF rate-limiting rules** on both Worker routes. The KV limiters in both
  `wrangler.toml` files are commented out in production, so `overRateLimit()`
  is currently a no-op on both Workers. Either create the namespaces and
  uncomment the bindings, or add the WAF rules — which is the better place
  anyway, because a WAF rule stops the request before it bills. Do not leave
  it ambiguous.
- **Uptime monitoring** on the site and both Workers. The relay already
  exposes `GET /health` for exactly this. Decide who gets the alert.

---

## 6. Privacy policy must be updated before two of these switch on

`app/privacy/page.tsx` names Web3Forms, Calendly, Plausible, Cloudflare and
R2. It does **not** mention Google Places or the lead relay/CRM. Both are
processors handling visitor data:

- Google Places sends the visitor's IP to Google on every page view that
  renders reviews
- The relay stores names, phone numbers and addresses, and forwards them to a
  third-party CRM

Add both paragraphs *before* setting the corresponding keys, not after. The
file's own header comment already says to do this whenever a processor is
added.
