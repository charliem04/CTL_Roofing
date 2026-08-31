import { getStorm } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import { client } from "@/client.config";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { FaqList } from "@/components/FaqList";
import { CtaBand } from "@/components/CtaBand";
import { MoreLink } from "@/components/MoreLink";

const storm = getStorm();

export const metadata = pageMetadata(storm.meta);

/**
 * The page the gold storm strip on the home page lands on.
 *
 * Its argument is that the roof is the easy half. Everything here is
 * written to be useful to someone who has not called anyone yet — which
 * is also why the role boundary is stated as plainly as the advice.
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

      {/* ── The first 48 hours ─────────────────────────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          <SectionHead
            heading={storm.firstHours.heading}
            lede={storm.firstHours.lede}
          />
          <ol className="mt-10 grid list-none gap-x-8 gap-y-10 p-0 sm:grid-cols-2">
            {storm.firstHours.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.06} className="grid grid-cols-[auto_1fr] items-start gap-5">
                <span
                  aria-hidden
                  className="font-display text-[52px] font-extrabold leading-none text-accent"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-display-3">{step.title}</h3>
                  <p className="mt-2.5 text-base">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.2}>
            <p className="mt-10">
              <MoreLink href="/services/emergency-inspections/">
                Emergency tarping and leak stop
              </MoreLink>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── What an adjuster looks for ─────────────────────────────── */}
      <section className="on-deep band seam-field relative overflow-hidden bg-surface-deep text-ink-invert-soft">
        <div className="section relative">
          <Reveal>
            <h2 className="text-display-2 text-ink-invert">
              {storm.adjuster.heading}
            </h2>
            <p className="mt-4 max-w-[58ch] text-lg">{storm.adjuster.lede}</p>
          </Reveal>

          <dl className="mt-10 grid gap-x-10 md:grid-cols-2">
            {storm.adjuster.items.map((item, i) => (
              <Reveal
                key={item.label}
                delay={i * 0.05}
                className="border-t border-line-dark/20 py-5"
              >
                  <dt className="font-mono text-[12px] font-medium uppercase tracking-[0.09em] text-accent">
                    {item.label}
                  </dt>
                  <dd className="m-0 mt-2 text-base">{item.value}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ── The role boundary ──────────────────────────────────────── */}
      <section className="band bg-surface-alt">
        <div className="section">
          <SectionHead heading={storm.role.heading} />
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded border border-line bg-surface p-6">
                <p className="u-label mb-4">{storm.role.does.label}</p>
                <ul className="ticks m-0 list-none space-y-3 p-0">
                  {storm.role.does.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="h-full rounded border border-dashed border-line bg-surface-alt p-6">
                <p className="u-label mb-4">{storm.role.doesNot.label}</p>
                <ul className="ticks-muted m-0 list-none space-y-3 p-0">
                  {storm.role.doesNot.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Coverage generalities ──────────────────────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          <SectionHead
            heading={storm.coverage.heading}
            lede={storm.coverage.lede}
          />
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Reveal>
              <div>
                <p className="u-label mb-4">{storm.coverage.covered.label}</p>
                <ul className="ticks m-0 list-none space-y-3 p-0">
                  {storm.coverage.covered.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div>
                <p className="u-label mb-4">{storm.coverage.notCovered.label}</p>
                <ul className="ticks-muted m-0 list-none space-y-3 p-0">
                  {storm.coverage.notCovered.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* The deductible point is the one most likely to change what
              a homeowner decides, so it gets its own weight. */}
          <Reveal delay={0.14}>
            <p className="mt-10 max-w-[70ch] rounded border border-line border-l-4 border-l-accent bg-surface-alt p-6 text-ink">
              {storm.coverage.note}
            </p>
          </Reveal>
        </div>
      </section>

      <FaqList
        faqs={storm.faqs}
        heading="Storm and claim questions"
        lede={`If water is coming in right now, stop reading and call the storm line on ${client.stormPhone}.`}
      />

      <CtaBand cta={storm.cta} />
    </>
  );
}
