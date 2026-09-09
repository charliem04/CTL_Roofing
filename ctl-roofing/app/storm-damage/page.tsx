import { getStorm } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import { client } from "@/client.config";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { FaqList } from "@/components/FaqList";
import { CtaBand } from "@/components/CtaBand";
import { MoreLink } from "@/components/MoreLink";
import { cascade } from "@/lib/motion";

const storm = getStorm();

export const metadata = pageMetadata(storm.meta);

/**
 * The page the gold storm strip on the home page lands on.
 *
 * It runs on the building's clock: what to do before the season, what
 * to do in the first 48 hours, and what the repair itself looks like.
 * The claim runs on a different clock and has its own page — every
 * point where the paperwork starts links to /insurance/ rather than
 * arguing it here, which is what stopped this page having two openings.
 */
export default function StormDamagePage() {
  return (
    <>
      <PageHero
        path={storm.meta.path}
        heading={storm.heading}
        lede={storm.lede}
        photo={storm.photo}
      />

      {/* ── Prevention ─────────────────────────────────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          <SectionHead
            heading={storm.prevention.heading}
            lede={storm.prevention.lede}
          />
          <dl className="mt-10 grid gap-x-10 md:grid-cols-2">
            {storm.prevention.items.map((item, i) => (
              <Reveal
                key={item.title}
                delay={cascade(i)}
                className="border-t border-line py-5"
              >
                <dt className="text-display-3">{item.title}</dt>
                <dd className="m-0 mt-2 text-base">{item.body}</dd>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={0.2}>
            <p className="mt-10">
              <MoreLink href="/services/emergency-inspections/">
                Book a full-scope roof evaluation
              </MoreLink>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── The first 48 hours ─────────────────────────────────────── */}
      <section className="on-deep band seam-field relative overflow-hidden bg-surface-deep text-ink-invert-soft">
        <div className="section relative">
          <Reveal>
            <h2 className="text-display-2 text-ink-invert">
              {storm.firstHours.heading}
            </h2>
            <p className="mt-4 max-w-[58ch] text-lg">{storm.firstHours.lede}</p>
          </Reveal>

          <ol className="mt-10 grid list-none gap-x-8 gap-y-10 p-0 sm:grid-cols-2">
            {storm.firstHours.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={cascade(i)} className="grid grid-cols-[auto_1fr] items-start gap-5">
                <span
                  aria-hidden
                  className="font-display text-[52px] font-extrabold leading-none text-accent"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-display-3 text-ink-invert">{step.title}</h3>
                  <p className="mt-2.5 text-base">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          {/* The hand-off. Step four is where this page stops being
              about the roof, so the link out sits directly under it. */}
          <Reveal delay={0.2}>
            <p className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
              <MoreLink href="/insurance/" tone="deep">
                How the insurance claim runs
              </MoreLink>
              <MoreLink href="/services/emergency-inspections/" tone="deep">
                Emergency tarping and leak stop
              </MoreLink>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── The restoration sequence ───────────────────────────────── */}
      <section className="band bg-surface-alt">
        <div className="section">
          <SectionHead
            heading={storm.restoration.heading}
            lede={storm.restoration.lede}
          />
          <ol className="mt-10 list-none space-y-px border border-line bg-line p-0">
            {storm.restoration.steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={cascade(i)}
                className="grid grid-cols-[auto_1fr] gap-x-5 bg-surface p-6 md:grid-cols-[auto_0.9fr_1.1fr] md:gap-x-8"
              >
                <span
                  aria-hidden
                  className="font-mono text-[13px] font-medium leading-[1.7] tracking-[0.08em] text-brand-soft"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-display-3">{step.title}</h3>
                <p className="col-span-2 mt-2 text-base md:col-span-1 md:mt-0">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </ol>

          {/* Money is the step people stall on, and it is the one thing
              this page cannot answer on its own. Both routes out. */}
          <Reveal delay={0.2}>
            <p className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
              <MoreLink href="/insurance/">Paying for it with a claim</MoreLink>
              <MoreLink href="/financing/">Paying for it over time</MoreLink>
            </p>
          </Reveal>
        </div>
      </section>

      <FaqList
        faqs={storm.faqs}
        heading="Storm questions"
        lede={`If water is coming in right now, stop reading and call the storm line at ${client.stormPhone}.`}
      />

      {/* Water may be coming in while somebody reads this page. */}
      <CtaBand cta={storm.cta} line="storm" />
    </>
  );
}
