import { getFinancing, getPending, hasFinanceTerms } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import { client } from "@/client.config";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { PaymentEstimator } from "@/components/PaymentEstimator";
import { FinanceProducts } from "@/components/FinanceProducts";
import { Pending } from "@/components/Pending";
import { FaqList } from "@/components/FaqList";
import { CtaBand } from "@/components/CtaBand";
import { MoreLink } from "@/components/MoreLink";
import { btn } from "@/components/Button";

const financing = getFinancing();

export const metadata = pageMetadata(financing.meta);

export default function FinancingPage() {
  const termsReady = hasFinanceTerms();

  return (
    <>
      <PageHero
        path={financing.meta.path}
        heading={financing.heading}
        lede={financing.lede}
        photo={financing.photo}
      />

      {/* ── The three packages, and the way into the portal ──────────
          First because it is the action: a homeowner who arrives here
          from a quote already knows they want the work and is asking
          what it costs a month and whether they qualify. Prequalifying
          answers the second question in a couple of minutes without
          touching their credit score, so nothing is put in front of it. */}
      <section className="on-deep band bg-surface-deep text-ink-invert-soft">
        <div className="section">
          <SectionHead
            heading={financing.products_heading}
            lede={financing.products_lede}
            tone="deep"
          />
          <FinanceProducts
            products={financing.products}
            url={financing.prequalifyUrl}
          />
          <Reveal delay={0.16}>
            <p className="mt-8 max-w-[70ch] text-[13px] leading-relaxed text-ink-invert-soft/75">
              <span aria-hidden>* </span>
              {financing.disclosure}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── The estimator, once there are real terms to drive it ─────
          Until then this reads as a straight answer to the question a
          homeowner actually asked, not as a hole in the page. The one
          thing it must never do is print an invented rate. */}
      <section className="band bg-surface-alt">
        <div className="section grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <SectionHead
              heading="What would it cost a month?"
              lede={
                termsReady
                  ? "Move the slider to the size of the project. The figures come from our lender’s current terms."
                  : "It depends on two things: the size of the job, and the terms you qualify for. We can put both in front of you in one conversation."
              }
            />
            <Reveal delay={0.06}>
              <div className="mt-10">
                {termsReady ? (
                  <PaymentEstimator
                    offers={financing.offers}
                    bounds={financing.estimator}
                  />
                ) : (
                  <div className="space-y-4 text-lg">
                    <p>
                      A roof is one of the few purchases this size that
                      nobody plans for, and the monthly figure is usually
                      what decides whether it gets done properly or patched
                      again. So we would rather talk about it early than
                      have you find out at the end.
                    </p>
                    <p>
                      The free assessment gives you a written scope and a
                      real number. Bring that to the conversation and we can
                      go through what the payment options look like against
                      it — no guesswork on either side.
                    </p>
                    <Pending content={getPending("financingTerms")} />
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                {financing.prequalifyUrl ? (
                  <a
                    href={financing.prequalifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btn("gold")}
                  >
                    Check if you prequalify
                  </a>
                ) : (
                  <a href={client.bookingUrl || "/contact/"} className={btn("gold")}>
                    {client.copy.heroCta}
                  </a>
                )}
                <MoreLink href="/services/">See what we build</MoreLink>
              </div>
              {financing.lender && (
                <p className="mt-4 text-sm text-ink-faint">
                  Financing provided by {financing.lender}.
                </p>
              )}
            </Reveal>
          </div>

          <div>
            <Reveal delay={0.12}>
              <div className="rounded border border-line bg-surface p-6">
                <h2 className="text-display-3">{financing.prepare.heading}</h2>
                <ul className="ticks mt-5 list-none space-y-3 p-0">
                  {financing.prepare.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── The comparison a homeowner is actually running ──────────
          Anyone weighing this against a HELOC is doing this arithmetic
          in their head already, usually with only half the numbers.
          Leading with the drawback is what makes the rest credible. */}
      <section className="band bg-surface">
        <div className="section grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <SectionHead heading={financing.secured.heading} />
          <div className="space-y-4 text-lg">
            {financing.secured.body.map((p, i) => (
              <Reveal key={p.slice(0, 24)} delay={0.06 + i * 0.05}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why finance at all ─────────────────────────────────────── */}
      <section className="band bg-surface-alt">
        <div className="section">
          <SectionHead heading={financing.points.heading} />
          <dl className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
            {financing.points.items.map((p) => (
              <div key={p.title} className="bg-surface p-6">
                <dt className="font-display text-[19px] font-bold uppercase text-ink">
                  {p.title}
                </dt>
                <dd className="m-0 mt-2.5 text-[15px]">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Turned down, or priced badly ────────────────────────────
          CTL's source page puts a second form here, with its own name,
          phone, email, ideal-terms and notes fields. That is a whole
          second submission pipeline — endpoint, spam handling, consent
          copy, a place for the replies to land — to collect what the
          contact form already collects. This routes to that form
          instead and carries the reason in the link, which is one
          inbox, one set of anti-spam rules, and nothing new to
          maintain. If CTL wants the dedicated "ideal financing terms"
          field, it is a field on the existing form, not a new form. */}
      <section className="band bg-surface">
        <div className="section grid items-start gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <SectionHead
              heading={financing.fallback.heading}
              lede={financing.fallback.body}
            />
          </div>
          <Reveal delay={0.1}>
            <a href="/contact/?about=financing" className={btn("gold")}>
              Talk to us about terms
            </a>
          </Reveal>
        </div>
      </section>

      <FaqList faqs={financing.faqs} heading="Financing questions" />

      <CtaBand cta={financing.cta} />
    </>
  );
}
