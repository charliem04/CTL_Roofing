import { getInsurance } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import { client } from "@/client.config";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { FaqList } from "@/components/FaqList";
import { CtaBand } from "@/components/CtaBand";
import { MoreLink } from "@/components/MoreLink";
import { btn } from "@/components/Button";
import { cascade } from "@/lib/motion";

const insurance = getInsurance();

export const metadata = pageMetadata(insurance.meta);

/**
 * The claim, on its own page.
 *
 * It used to be the back half of /storm-damage/, which meant a reader
 * with a tarped roof and a reader with an adjuster's voicemail were
 * handed the same opening. They want different things and are usually
 * weeks apart. This page owns the paperwork; the storm page owns the
 * building, and each links to the other at the seam.
 *
 * The role boundary is not a disclaimer bolted to the bottom — it is a
 * section in the middle of the page, stated as plainly as the advice,
 * because in Louisiana negotiating a claim for a homeowner requires a
 * public adjuster's licence. See the note in content/insurance.ts.
 */
export default function InsurancePage() {
  return (
    <>
      <PageHero
        path={insurance.meta.path}
        heading={insurance.heading}
        lede={insurance.lede}
        photo={insurance.photo}
      />

      {/* ── Opening the claim ──────────────────────────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          <SectionHead
            heading={insurance.filing.heading}
            lede={insurance.filing.lede}
          />
          <ol className="mt-10 grid list-none gap-x-8 gap-y-10 p-0 sm:grid-cols-2">
            {insurance.filing.steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={cascade(i)}
                className="grid grid-cols-[auto_1fr] items-start gap-5"
              >
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

          {/* Somebody who lands here mid-storm needs the other page,
              and needs it before they finish reading this one. */}
          <Reveal delay={0.2}>
            <p className="mt-10">
              <MoreLink href="/storm-damage/">
                What to do about the roof itself
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
              {insurance.adjuster.heading}
            </h2>
            <p className="mt-4 max-w-[58ch] text-lg">{insurance.adjuster.lede}</p>
          </Reveal>

          <dl className="mt-10 grid gap-x-10 md:grid-cols-2">
            {insurance.adjuster.items.map((item, i) => (
              <Reveal
                key={item.label}
                delay={cascade(i)}
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
          <SectionHead heading={insurance.role.heading} />
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded border border-line bg-surface p-6">
                <p className="u-label mb-4">{insurance.role.does.label}</p>
                <ul className="ticks m-0 list-none space-y-3 p-0">
                  {insurance.role.does.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="h-full rounded border border-dashed border-line bg-surface-alt p-6">
                <p className="u-label mb-4">{insurance.role.doesNot.label}</p>
                <ul className="ticks-muted m-0 list-none space-y-3 p-0">
                  {insurance.role.doesNot.items.map((i) => (
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
            heading={insurance.coverage.heading}
            lede={insurance.coverage.lede}
          />
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Reveal>
              <div>
                <p className="u-label mb-4">{insurance.coverage.covered.label}</p>
                <ul className="ticks m-0 list-none space-y-3 p-0">
                  {insurance.coverage.covered.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div>
                <p className="u-label mb-4">
                  {insurance.coverage.notCovered.label}
                </p>
                <ul className="ticks-muted m-0 list-none space-y-3 p-0">
                  {insurance.coverage.notCovered.items.map((i) => (
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
              {insurance.coverage.note}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── The gap between the settlement and the job ──────────────
          The question this page raises and cannot answer on its own,
          and the reason it sits under Financing in the nav. */}
      <section className="band bg-surface-alt">
        <div className="section grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <SectionHead heading={insurance.gap.heading} />
          <div>
            <div className="space-y-4 text-lg">
              {insurance.gap.body.map((p, i) => (
                <Reveal key={p.slice(0, 24)} delay={0.06 + i * 0.05}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <a href="/financing/" className={btn("gold")}>
                  See financing options
                </a>
                {/* A plain anchor, not MoreLink: MoreLink checks the
                    href against the route registry, and a path carrying
                    a query string matches nothing there, so the link
                    silently renders as nothing at all. /financing/ uses
                    a bare <a> to this same destination for the same
                    reason. */}
                <a
                  href="/contact/?about=financing"
                  className="group inline-flex items-center gap-2 font-semibold text-brand no-underline transition-colors duration-150 hover:text-ink active:text-brand-strong"
                >
                  Talk to us about terms
                  <span
                    aria-hidden
                    className="transition-transform duration-150 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <FaqList
        faqs={insurance.faqs}
        heading="Claim questions"
        lede={`Nothing here is legal or insurance advice, and none of it outranks your own declarations page. If water is coming in right now, call the storm line at ${client.stormPhone} first.`}
      />

      <CtaBand cta={insurance.cta} />
    </>
  );
}
