# ctl-careers-upload

The only server-side code in the CTL project. It exists for one reason:
a static export cannot receive a file, and `/careers/` needs to take a
résumé.

It accepts one multipart `POST`, validates it hard, writes the file to a
**private** R2 bucket, and pings the office. There is no read path, no
listing endpoint, and no way to get a file back out over HTTP —
retrieving an application is done from the R2 dashboard or with
`wrangler r2 object get`.

That is the important design decision. The bucket holds strangers'
names, phone numbers and CVs, so the failure mode worth engineering out
is "someone found a public URL", not "someone uploaded a 6MB file".

## Deploy

```sh
npm install
npx wrangler login

# One private bucket. Do NOT attach a custom domain or enable the
# r2.dev public URL on it.
npx wrangler r2 bucket create ctl-resumes

# The bot defence. Get the pair from the Cloudflare dashboard
# (Turnstile → Add site). The site key goes in the site's
# NEXT_PUBLIC_TURNSTILE_SITE_KEY; the secret goes here.
npx wrangler secret put TURNSTILE_SECRET

# Where the "new application" notification goes. A Web3Forms endpoint,
# a Slack incoming webhook, or the CRM — anything that takes JSON.
npx wrangler secret put NOTIFY_WEBHOOK

npx wrangler deploy
```

Then put the deployed URL in the site's `NEXT_PUBLIC_CAREERS_ENDPOINT`,
rebuild the site, and flip `/careers/` to `live: true` in
`ctl-roofing/lib/routes.ts`.

## Configuration

Set in `wrangler.toml` under `[vars]`:

| Var | Meaning |
|---|---|
| `ALLOWED_ORIGINS` | Comma-separated, exact scheme+host, no wildcards. Checked server-side, not just via CORS. |
| `MAX_UPLOAD_BYTES` | Default 5 MB. Keep it in step with `MAX_RESUME_BYTES` in `lib/submitApplication.ts`. |
| `RATE_LIMIT_PER_HOUR` | Only does anything when the KV namespace is bound. |

Secrets (`wrangler secret put`, never in the toml):

| Secret | Meaning |
|---|---|
| `TURNSTILE_SECRET` | Unset = captcha not enforced. Set it before launch. |
| `NOTIFY_WEBHOOK` | Unset = the file is stored silently and only the Workers log knows. |

### Two configuration traps

**A named environment does not inherit top-level bindings.** `[env.dev]`
needs its own `[[env.dev.r2_buckets]]`, or `env.RESUMES` arrives
`undefined` and every upload dies at the R2 put with a 502. Same for any
`[env.staging]` added later.

**`ALLOWED_ORIGINS` unset means the Worker refuses everything**, by
design. It does not fall back to allowing all origins — an
unconfigured Worker that accepts uploads from anywhere is worse than one
that is down.

## What it validates, and in what order

1. `OPTIONS` → CORS preflight. Anything but `POST` → 405.
2. Origin against the allowlist, server-side. The browser's CORS check
   is advisory; `curl` ignores it.
3. `Content-Length` before the body is read, so an oversized upload is
   refused without buffering it.
4. Per-IP rate limit, if a KV namespace is bound.
5. Honeypot field → answers `200 {ok:true}` and stores nothing, so a bot
   learns nothing from the response.
6. Turnstile, when the secret is set.
7. Name and phone present.
8. File extension, then **magic bytes**. Extension and `Content-Type`
   are both supplied by the uploader, so only the bytes are evidence:
   `%PDF`, `PK\x03\x04` for docx, `\xD0\xCF\x11\xE0` for doc.
9. The R2 key is generated here — `applications/YYYY/MM/<uuid>-<safe
   name>`. A filename from a form field is never a path.

Errors returned to the browser are deliberately vague; the real reason
goes to `wrangler tail`.

## Local development

```sh
npm run dev          # wrangler dev --env dev, port 8787
npm run typecheck
npm run tail         # production logs
```

`--env dev` allows `http://localhost:3000` and `:4173` and uses a
separate `ctl-resumes-dev` bucket, simulated on disk by miniflare.

## Reading applications

```sh
npx wrangler r2 object list ctl-resumes --prefix applications/2026/
npx wrangler r2 object get ctl-resumes <key> --file resume.pdf
```

Applicant details ride on the object as custom metadata — name, phone,
email, role, original filename, timestamp, IP — so an object is never an
orphan blob whose owner is only recoverable from an email somewhere.

## Before this handles a real application

- [ ] `TURNSTILE_SECRET` set. Without it the only bot defence is a
      honeypot, which stops the lazy ones and nothing else.
- [ ] A WAF rate-limiting rule on the route. The KV limiter runs *after*
      the request has already reached the Worker and cost money; a WAF
      rule stops it before that.
- [ ] Bucket confirmed private — no custom domain, no r2.dev URL.
- [ ] A retention decision. These are job applications with personal
      data in them; decide how long they are kept and set an R2 lifecycle
      rule to match. The privacy policy should say the same number.
- [ ] `NOTIFY_WEBHOOK` set, and a test application actually arriving in
      the inbox somebody reads.
