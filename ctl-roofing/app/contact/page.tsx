import { getContactPage } from "@/lib/content";
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
 * Three routes in, in the order people actually use them: the phone at
 * the top for the ones who are already decided, the calendar for the
 * ones who hate phone tag, and the form for the ones who would rather
 * write it all down once.
 */
export default function ContactPage() {
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

      {/* ── Book a slot ────────────────────────────────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          <SectionHead heading={page.booking.heading} lede={page.booking.lede} />
          <Reveal delay={0.06}>
            <div className="mt-10">
              <BookingEmbed />
            </div>
          </Reveal>
        </div>
      </section>

      {/* The request sheet and the showroom details, same component the
          home page uses — one form, one place to maintain it. */}
      <Contact />

      <CtaBand cta={page.cta} />
    </>
  );
}
