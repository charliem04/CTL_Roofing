# HubSpot setup — wiring the lead relay to a real CRM

The lead relay stores every enquiry in D1 and forwards it to whatever CRM is
configured. This file is the *whatever*: how to create the HubSpot account,
give the Worker a token, create the four properties the code writes to, and
prove a real lead lands — start to finish, without needing to know the
codebase.

Everything HubSpot-specific lives in `workers/lead-relay/src/crm/hubspot.ts`
and two variables. That is deliberate, and section 7 is how it comes back out.

---

## 0. What this is, and what it is not

**HubSpot Free is the demo CRM.** It exists so the client can see a contact
record appear, with a real lead status, from a real form submission — this
week, without a purchase decision. It is not a recommendation to run a roofing
business on it.

What HubSpot does not know about: a claim, a supplement, an adjuster, a scope,
a crew, a material order, a job schedule. A roofing CRM — JobNimbus, AccuLynx,
Roofr — is built around exactly those, and the client will almost certainly end
up on one. Section 7 exists because that move was planned for on day one.

**Free tier limits worth knowing before you build on it:**

| | |
| --- | --- |
| Custom properties | **10 per object.** This integration spends 4 of them. Six left for the client — see section 3 |
| Seats | 2 core seats on a free account |
| Contacts | Far more than this business will ever produce; storage is not the constraint. Marketing *email* sends are what free actually caps |
| Automation | None worth relying on. No workflows on free — assignment and follow-up are manual |

HubSpot changes its packaging regularly. Check the current pricing page before
repeating any of these numbers to the client; the one that matters to the code
is the custom-property cap, and that is the one to re-check if a property
refuses to create.

**Before switching this on:** `app/privacy/page.tsx` names the processors that
receive visitor data, and HubSpot will be one of them — names, phone numbers,
addresses and whatever somebody typed into the message box, leaving Cloudflare
for a US CRM. Add the paragraph *before* the token is set, not after. The same
rule is in `docs/LAUNCH-CREDENTIALS.md` §6 and it is not a formality.

---

## 1. Create the HubSpot account

1. Go to <https://www.hubspot.com/products/get-started> and create a **free
   HubSpot CRM** account.
2. Use **CTL's own email address**, not a personal one, and not Charlie's.
   Whoever owns this login owns the client's contact database. The same rule as
   the Cloudflare account in `docs/LAUNCH-CREDENTIALS.md` §2.
3. Skip the onboarding questionnaire and the marketing-email wizard. Nothing in
   this integration needs them.
4. Note the **portal ID**, shown in the bottom-left account menu. Nothing in
   the code uses it — the token identifies the portal — but it is what HubSpot
   support asks for first.

> **Create a fresh account, even if an old free one exists.** Legacy free
> portals do not all expose **Private Apps** in the settings UI, and there is
> no way to switch it on from inside the account. If section 2 cannot find the
> menu item, that is what happened: make a new free account and use that one.
> Do not work around it with an API key — HubSpot's legacy API keys were
> retired, and anything still suggesting one is out of date.

---

## 2. Create the private app and its token

A **private app** is HubSpot's per-account API credential. It produces a bearer
token, which is exactly what the relay already sends.

1. In HubSpot: **Settings** (the gear, top right) → **Integrations** →
   **Private Apps** → **Create a private app**.
2. **Basic info** tab — name it something a stranger will understand in a
   year, e.g. `CTL website lead relay`.
3. **Scopes** tab — search each of these and tick it:

   | Scope | Why the code needs it |
   | --- | --- |
   | `crm.objects.contacts.write` | Creating and updating the contact |
   | `crm.objects.contacts.read` | The phone-number search, used when a lead has no email |

   Those two, and nothing else. A token that can only touch contacts is a
   token whose worst case is bounded, and this code never reads a deal, a
   company or a file.
4. **Create app** → **Continue creating** → **Show token** → copy it.

The token starts `pat-`. It is a credential with write access to the client's
contact database: it goes into `wrangler secret put` (section 4) and nowhere
else. Not into `wrangler.toml`, not into a commit, not into a chat message.
If it leaks, come back to this screen and **Rotate**.

---

## 3. Create the four custom properties

The code maps most of a lead onto HubSpot's standard contact properties —
`email`, `phone`, `firstname`, `lastname`, `address`, and `message`, which
HubSpot ships for precisely this purpose. That leaves four things HubSpot has
no standard home for.

In HubSpot: **Settings** → **Properties** → **Create property**, with **Object
type: Contact**, for each row below.

| Label to type | Internal name the code sends | Field type | Holds |
| --- | --- | --- | --- |
| CTL service | `ctl_service` | Single-line text | Which job — one of the dropdown options on the form |
| CTL urgency | `ctl_urgency` | Single-line text | How soon. Empty today; the field exists in the relay and a future form may ask |
| CTL lead id | `ctl_lead_id` | Single-line text | The D1 row id, so a HubSpot record traces back to the lead book |
| CTL source page | `ctl_source_page` | Single-line text | The page the enquiry was submitted from |

**The internal name is the part that matters.** HubSpot derives it from the
label when you create the property, and it is shown under the label field —
click into it and confirm it reads exactly as the middle column above, all
lowercase, underscores, no trailing digit. HubSpot appends a numeric suffix if
a property of that name ever existed and was deleted, which is the most common
way this goes wrong.

Two different failures follow from getting it wrong, and only one of them is
loud:

- **The property does not exist at all** → HubSpot refuses the whole request
  with `400 Property "ctl_service" does not exist`, the contact is not created,
  and the row sits in D1 as `failed` with that sentence in `crm_error`. Loud,
  diagnosable, and the retry sweep delivers everything the moment you create
  the property.
- **The property exists under a slightly different name** (`ctl_services`,
  `ctl_service_1`) → HubSpot accepts everything, the contact is created, and
  the value lands in a property nobody is looking at. Silent. This is why the
  middle column is worth reading twice.

Single-line text for all four, including service. A dropdown would be tidier,
but the service list lives in `client.config.ts → form.serviceOptions` and
changing it there would silently start producing values HubSpot rejects.

Text is also what keeps this to **four** of the ten custom properties. The
other six belong to the client — leave them.

---

## 4. Point the relay at HubSpot

Two settings. One is not a secret and lives in the repo; one is, and never
does.

**a. The adapter**, in `workers/lead-relay/wrangler.toml` — uncomment:

```toml
[vars]
CRM_ADAPTER = "hubspot"
```

**b. The token**, as a Worker secret:

```bash
cd workers/lead-relay
npx wrangler secret put CRM_AUTH_TOKEN     # paste the pat-… token, then Enter
npx wrangler deploy
```

That is the whole integration. `CRM_WEBHOOK_URL` is not used by this adapter
and can stay unset; leaving it set does nothing, and switching `CRM_ADAPTER`
back to `generic` re-enables it, which is the fastest way to fall back if
HubSpot has to come out in a hurry.

**Job applications are not forwarded**, on purpose. A sales contact list is not
an applicant tracker: applicants distort every "here are your leads" view,
consume the same contact allowance as customers, and carry a different
retention promise than customers do — the résumé side of this system commits to
twelve months and HubSpot knows nothing about that. They are stored in D1 and
appear in `/export.csv` either way. To send them anyway:

```toml
CRM_FORWARD_APPLICATIONS = "true"
```

Note that this does **not** backfill: applications captured while it was off
are recorded as `crm_status='skipped'`, which the retry sweep deliberately
leaves alone so a pile of old applications cannot starve the leads behind them.
To send the ones already stored, one statement:

```bash
npx wrangler d1 execute ctl-leads --remote \
  --command "UPDATE leads SET crm_status='pending' WHERE crm_status='skipped';"
```

---

## 5. Verify a real lead lands

Do this on the **preview** deployment before production, and use a real address
you can check — a bad token and a missing property look identical from the
front of the site, because the form does not depend on any of this.

**1. Submit the form.** `/contact/` on the preview site. Name, phone, an email
you own, address, and something recognisable in the message box.

**2. The form should say it sent.** If it did not, the problem is Web3Forms or
`NEXT_PUBLIC_WEB3FORMS_KEY`, not HubSpot — the CRM is downstream of the reply
the visitor gets, deliberately.

**3. Check the row, which is the thing that must exist:**

```bash
cd workers/lead-relay
npx wrangler d1 execute ctl-leads --remote --command \
  "SELECT received_at, email, crm_status, crm_attempts, substr(crm_error,1,120) AS err
     FROM leads ORDER BY received_at DESC LIMIT 3;"
```

| `crm_status` | What it means |
| --- | --- |
| `sent` | HubSpot accepted it. Go to step 5 |
| `pending` | Stored, forward not finished — wait fifteen minutes for the sweep and look again |
| `failed` | HubSpot refused. `err` says why; section 6 |
| `disabled` | The Worker does not think a CRM is configured. The token is missing, or `CRM_ADAPTER` is misspelled — check the Worker's log |
| `skipped` | It is an application, and applications are not forwarded (section 4) |

**4. The same thing through the export**, if you would rather not touch D1 —
this is also the check that proves `EXPORT_TOKEN` works:

```bash
curl -sS -H "Authorization: Bearer $EXPORT_TOKEN" \
  https://<the-relay-hostname>/export.csv | head -3
```

**5. Check HubSpot.** **Contacts** → sort by **Create date**. The contact
should be there with:

- first and last name split off the one name field,
- the phone, the address and the message,
- **Lead status: New**,
- and the four `CTL …` properties filled in — open the record, **View all
  properties**, and search `ctl`. If those four are empty but everything else
  is right, the internal names are wrong. Section 3.

**6. Submit a second lead with the same email address.** This is the one people
skip and it is the one that matters: HubSpot must show **one** contact,
updated, not two. If it shows two, section 6.

---

## 6. Troubleshooting

The `crm_error` column holds HubSpot's own words, truncated. It is almost
always enough.

| What you see | Cause | Fix |
| --- | --- | --- |
| `401 … NOT TRANSIENT` | The token is wrong, revoked, or from a different portal | Re-copy it from the private app (section 2) and `wrangler secret put CRM_AUTH_TOKEN` again. Retrying will not fix it — the row will sit failed until the token is right, then the sweep delivers it |
| `403` with a scope message | The private app is missing `crm.objects.contacts.read` or `.write` | Add the scope in the private app's Scopes tab. Note that changing scopes issues a **new token**; set the secret again |
| `400 Property "ctl_…" does not exist` | The property was not created, or its internal name differs | Create it exactly as section 3 says. Nothing is lost; the next sweep delivers the backlog |
| `429 throttled by HubSpot, will retry` | Rate limited | Nothing. This does not count against the six-attempt budget and the sweep retries in fifteen minutes |
| Row says `sent`, no contact in HubSpot | Almost always the wrong portal — two HubSpot accounts, token from the other one | Check the portal ID in the account menu against the one you created the private app in |
| Duplicate contacts for the same person | The lead had no email, so it matched on phone — and HubSpot's stored number is formatted differently from what the visitor typed (`(337) 555-0113` vs `3375550113`). The search is an exact string match | Merge the two in HubSpot. This cannot happen for a lead submitted through the current form, which requires an email; it is a risk for rows captured before that and for applications |
| Everything `disabled` | No token, or `CRM_ADAPTER` is misspelled — a value that names no adapter is treated as *no CRM* rather than falling back to the generic webhook, so a typo cannot post leads somewhere unintended | `npx wrangler tail` and look for the `CRM_ADAPTER="…" is not one of` line |
| `crm_attempts` stuck at 6 | Six refusals; the relay stops rather than hammering a configuration problem forever | Fix the cause, then `UPDATE leads SET crm_status='pending', crm_attempts=0 WHERE crm_status='failed';` |

Live logs, while testing: `cd workers/lead-relay && npx wrangler tail`.

---

## 7. Moving off HubSpot later

When the client picks JobNimbus, AccuLynx or anything else, the work is:

1. **Write one adapter.** A file in `workers/lead-relay/src/crm/` exporting a
   `CrmAdapter` — `configured`, `accepts`, `send` — and one line adding it to
   `ADAPTERS` in `src/crm/index.ts`. `hubspot.ts` is the worked example,
   including the parts that are genuinely fiddly: deduplication before the
   write, a conflict treated as an update, and a throttle that must not spend
   one of the six retry attempts.
2. **Change two variables.** `CRM_ADAPTER` in `wrangler.toml`, and
   `CRM_AUTH_TOKEN` via `wrangler secret put`.
3. **Backfill from the export.** `/export.csv` is the entire history, in one
   file, including everything HubSpot never saw. Most CRMs import a CSV.

What does not change: the forms, the site, the database, the retry sweep, the
`/export.csv` route, or anything in `src/index.ts`. That was the point of
storing first and forwarding second.

If the new CRM takes a webhook rather than an API — many of them do, via Zapier
or Make — there is nothing to write at all: set `CRM_ADAPTER` back to
`generic` and point `CRM_WEBHOOK_URL` at it.

**Leaving HubSpot behind properly:** delete the private app (which invalidates
the token), export or delete the contacts if the client is not keeping the
account, and take HubSpot back out of the privacy policy's processor list. A
dormant free account holding customer data is a disclosure obligation nobody is
thinking about a year later.
