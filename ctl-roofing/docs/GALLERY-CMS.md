# The gallery CMS

The gallery at `/gallery/`, and the handful of photos on the home page,
are edited from **`https://ctlpro.com/admin/`** — a sign-in with GitHub,
a list of photos, and a save button. No deploy, no editor, no developer.

This document is the one-time setup, and then the day-to-day.

---

## How it works, in one paragraph

The editor is a git-backed CMS. Saving commits straight to this
repository — the photo into `ctl-roofing/public/ctl/gallery/`, the entry
into `ctl-roofing/content/gallery.json` — and Cloudflare Pages rebuilds
the site from that commit. So the gallery is version-controlled like
everything else: every change has an author, a timestamp and a diff, any
of it can be reverted, and there is no database to back up or keep
running. The cost is the wait for a rebuild, which is a minute or two.

**There is no separate password.** Access is GitHub access: anyone with
write permission on this repository can edit the gallery, and nobody
else can. Removing someone's GitHub access removes their CMS access in
the same motion.

---

## One-time setup

The CMS signs in with GitHub, and GitHub's OAuth requires a *client
secret* that must never be in a web page. So a tiny Cloudflare Worker
holds the secret and performs the token exchange. It is about fifteen
minutes of work, once.

### 1. Create the GitHub OAuth app

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.

| Field | Value |
| --- | --- |
| Application name | `CTL Roofing gallery` |
| Homepage URL | `https://ctlpro.com` |
| Authorization callback URL | `https://ctl-cms-auth.<account>.workers.dev/callback` |

The callback host is the Worker from step 2 — deploy it first if you'd
rather have the real URL to paste; GitHub lets you edit it afterwards
either way.

Note the **Client ID**, then **Generate a new client secret** and keep
the secret on screen. GitHub shows it once.

### 2. Deploy the OAuth relay

The relay is a published, single-purpose Worker — it takes the sign-in
hop and the token exchange, and does nothing else:

```bash
git clone https://github.com/sveltia/sveltia-cms-auth
cd sveltia-cms-auth
npx wrangler deploy
```

Then set its three values as **secrets**, not variables, so they are
never printed in the dashboard or in a build log:

```bash
npx wrangler secret put GITHUB_CLIENT_ID       # from step 1
npx wrangler secret put GITHUB_CLIENT_SECRET   # from step 1
npx wrangler secret put ALLOWED_DOMAINS        # ctlpro.com,www.ctlpro.com
```

`ALLOWED_DOMAINS` is what stops the relay being used to sign people into
some other site. Set it.

Take the Worker's URL from the deploy output, and put it in the GitHub
OAuth app's callback field with `/callback` on the end if you have not
already.

### 3. Tell the site where the relay is

In **Cloudflare Pages → the `ctl-roofing` project → Settings →
Environment variables**, add — to **Production and Preview both**:

```
CMS_AUTH_URL = https://ctl-cms-auth.<account>.workers.dev
```

Redeploy. `scripts/cms.mjs` writes that into the CMS config at build
time and adds it to the `/admin/` security policy.

Until this is set, `/admin/` shows a short setup notice instead of a
sign-in button that could not work. That is deliberate.

### 4. Check it

Open `https://ctlpro.com/admin/`, sign in with GitHub, change a caption,
save. Within a couple of minutes the gallery page shows it, and the
repository has a commit with your name on it.

---

## Day to day

Open `/admin/`, choose **Gallery → Photos**.

- **Add a photo** — *Add Photo*, upload the image, fill in the fields.
- **Reorder** — drag. The order in the list is the order on the page.
- **Remove** — the delete control on the entry. It leaves the file in
  the repository and stops showing it, which is recoverable.
- **Home page** — tick *Also show on the home page*. Keep it to around
  eight; that band is a taste of the work, not the whole gallery.

### The fields

| Field | Notes |
| --- | --- |
| **Photo** | The image itself. Upload the largest version you have — see below. |
| **Alt text** | Required. What is actually in the frame. |
| **Caption** | The short line under the photo. Optional. |
| **Kind of work** | Which filter it appears under, and which service page it links to. |
| **Also show on the home page** | The featured band. |

### Alt text is not optional

It is what a blind visitor's screen reader reads aloud, and it is what
Google Images indexes — which for a contractor is a real source of
work. Describe the frame:

> ✅ "Crew setting metal panels over underlayment on a low-slope
> section"
> ❌ "roof", "IMG_4471", "CTL Roofing Lafayette roofing contractor"

The third one is keyword stuffing. Google has been discounting it since
roughly 2012 and screen-reader users find it useless.

### About photo size

Upload the full-size photo. It is committed as-is and served as-is —
there is no image pipeline resizing it — so a 12MB phone photo is a
12MB download for every visitor on the gallery page.

**Aim for the long edge around 1600px and the file under 600KB.** Any
image tool will do it; on a Mac, Preview → Tools → Adjust Size.

The CMS refuses anything over 6MB, which is a backstop against an
accident, not a target to aim at.

---

## What the build checks

`scripts/gallery.mjs` runs before every build and fails it, with a
message naming the photo, if:

- a photo has no alt text, or under three characters of it
- the same photo is listed twice
- the file an entry points at is not there
- a category is not one of the five real ones
- the CMS's category dropdown has drifted from the site's own list

It also reads each image's true pixel dimensions out of the file header
and records them in `content/gallery.dimensions.json`, so the page can
reserve each photo's box before it loads and the gallery does not
shudder as it fills in. Nobody editing the gallery has to know those
numbers exist.

If a bad entry ever does reach the site, `content/gallery.ts` drops that
one photo rather than letting the page fail — a missing photo is
recoverable, a broken `/gallery/` during a storm week is not.

---

## Troubleshooting

**"The gallery editor is not connected yet"** — `CMS_AUTH_URL` is unset
or the build predates it. Step 3, then redeploy.

**Sign-in popup closes and nothing happens** — the callback URL on the
GitHub OAuth app does not exactly match the Worker's URL plus
`/callback`, or `ALLOWED_DOMAINS` does not include the domain you are
on.

**Saved, but the site has not changed** — check the Pages deployment.
If the build failed, the log names the photo and the reason; the commit
is safe in the repository meanwhile.

**A photo looks stretched** — it was replaced at the same filename and
the browser is showing a cached copy at the old aspect ratio. `/ctl/*`
is cached for a day; a hard refresh confirms it.
