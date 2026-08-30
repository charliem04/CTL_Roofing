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

      {/* ── The estimator, or an honest account of why there isn't one ── */}
      <section className="band bg-surface-alt">
        <div className="section grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <SectionHead
              heading="What would it cost a month?"
              lede={
                termsReady
                  ? "Move the slider to the size of the project. The figures come from our lender's current terms."
                  : "This is where the estimator goes. It is switched off until the lender's real terms are in hand — a monthly figure on a website is a number you will be held to."
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
                  <Pending content={getPending("financingTerms")} />
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
