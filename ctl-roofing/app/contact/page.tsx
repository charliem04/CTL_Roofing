import { getContactPage } from "@/lib/content";
import { bookingOrigins } from "@/lib/booking";
import { CONSENT_KEY } from "@/lib/consent";
import { pageMetadata } from "@/lib/meta";
import { client } from "@/client.config";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { BookingEmbed } from "@/components/BookingEmbed";
import { Contact } from "@/components/Contact";
import { CtaBand } from "@/components/CtaBand";

const page = getContactPage();

export const metadata = pageMetadata(page.meta);

/**
 * Routes in, in the order people actually use them: the phone at the
 * top for the ones who are already decided, the calendar — when one is
 * configured — for the ones who hate phone tag, and the form for the
 * ones who would rather write it all down once.
 */
export default function ContactPage() {
  const origins = bookingOrigins();

  const lines = [
    {
      label: "Office",
      value: client.phone,
      href: `tel:${client.phoneHref}`,
      note: client.hoursShort,
    },
    {
      label: "Storm line",
      value: client.stormPhone,
      href: `tel:${client.stormPhoneHref}`,
      note: "Answered around the clock",
    },
    {
      label: "Text",
      value: client.phone,
      href: `sms:${client.smsHref}`,
      note: "If typing is easier than talking",
    },
    {
      label: "Email",
      value: client.email,
      href: `mailto:${client.email}`,
      note: "For documents and photos",
    },
  ];

  return (
    <>
      {/* ── Opening the scheduler's connections before React exists ───
          BookingEmbed preconnects as soon as it knows the visitor has
          accepted cookies — but it only knows that from an effect, and
          an effect cannot run until the bundle has downloaded, parsed
          and hydrated. On a phone on mobile data that is most of a
          second in which the browser knows exactly which origins it is
          about to need and is doing nothing about it.

          This runs while the HTML is still being parsed. It reads the
          same consent key and warms the same origins with the same
          marker attribute, so BookingEmbed finds the links already
          there and appends nothing. The saving is the handshake: by
          the time the iframe mounts, DNS, TCP and TLS are done.

          It stays behind consent, which is the whole posture — a
          visitor who declined, or has not been asked, opens no
          connection to anyone. It ships only on this page, so no other
          route can reach a third party this way, and it is wrapped in
          try/catch because localStorage throws outright in a locked-down
          browser and a dead preconnect must not take the page with it. */}
      {origins.length > 0 && (
        <script
          dangerouslySetInnerHTML={{
            __html:
              `try{if(localStorage.getItem(${JSON.stringify(CONSENT_KEY)})==="accepted")` +
              `${JSON.stringify(origins)}.forEach(function(o){` +
              `var l=document.createElement("link");l.rel="preconnect";l.href=o;` +
              `l.crossOrigin="anonymous";l.setAttribute("data-booking-warm",o);` +
              `document.head.appendChild(l)})}catch(e){}`,
          }}
        />
      )}

      <PageHero
        path={page.meta.path}
        heading={page.heading}
        lede={page.lede}
        photo={page.photo}
      />

      {/* ── The direct lines ───────────────────────────────────────── */}
      <section className="band bg-surface-alt">
        <div className="section">
          <dl className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {lines.map((l) => (
              <div key={l.label} className="bg-surface p-6">
                <dt className="u-label">{l.label}</dt>
                <dd className="m-0 mt-2">
                  <a
                    href={l.href}
                    className="font-mono text-xl font-semibold tabular-nums text-ink no-underline underline-offset-4 transition-colors duration-150 hover:text-brand hover:underline active:text-brand-strong"
                  >
                    {l.value}
                  </a>
                  <span className="mt-2 block text-sm text-ink-faint">{l.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Book a slot ──────────────────────────────────────────────
          The one place on the site that reaches Calendly. Every CTA
          elsewhere points at this page rather than out to the calendar,
          so this band is the end of that path, not a detour off it.

          Gated on the same config as the embed inside it: BookingEmbed
          renders nothing without a scheduler URL, and a band that is
          only a heading over empty space reads as a page that broke
          rather than one that never had a calendar.

          The id is the target of the request form's "pick your own
          time" link, which sits below this band on this page and on
          another page entirely on the home page. */}
      {client.bookingUrl && (
        <section id="booking" className="band bg-surface scroll-mt-24">
          <div className="section">
            <SectionHead heading={page.booking.heading} lede={page.booking.lede} />
            <Reveal delay={0.06}>
              <div className="mt-10">
                <BookingEmbed />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* The request sheet and the showroom details, same component the
          home page uses — one form, one place to maintain it. */}
      <Contact />

      <CtaBand cta={page.cta} />
    </>
  );
}
