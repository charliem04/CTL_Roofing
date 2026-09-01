import { getFinancing, getPending, hasFinanceTerms } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import { client } from "@/client.config";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { PaymentEstimator } from "@/components/PaymentEstimator";
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

      {/* ── Why finance at all ─────────────────────────────────────── */}
      <section className="band bg-surface">
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

      <FaqList faqs={financing.faqs} heading="Financing questions" />

      <CtaBand cta={financing.cta} />
    </>
  );
}
