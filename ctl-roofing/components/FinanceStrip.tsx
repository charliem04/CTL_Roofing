import { btn } from "./Button";

/**
 * A thin gold shelf between the financing hero and the packages.
 *
 * It is the same device as StormStrip under the home hero, reused
 * rather than reinvented: the site already has one way of saying "one
 * short thing before you go on", and a second treatment for the same
 * job would just be a second thing to keep consistent.
 *
 * It earns its place structurally as well as visually. The financing
 * hero is a short band with a small photo, and it was landing directly
 * against a full-height deep band of loan cards — the hero read as an
 * offcut rather than an opening. A gold shelf gives the eye a step down
 * between the two grounds, and carries the one fact that decides
 * whether a visitor clicks anything below it.
 */
export function FinanceStrip({
  label,
  body,
  href,
}: {
  label: string;
  body: string;
  href: string;
}) {
  return (
    <section className="bg-accent text-ink" aria-labelledby="finance-strip">
      <div className="section flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-[18px]">
        <div className="max-w-[62ch]">
          <h2
            id="finance-strip"
            className="font-mono text-[12px] font-medium uppercase tracking-[0.09em] text-ink/75"
          >
            {label}
          </h2>
          <p className="mt-1 font-semibold text-ink">{body}</p>
        </div>
        {/* Down to the packages, not out to the portal. Each package
            opens its own application, so a general "prequalify" button
            up here would have to choose one on the visitor's behalf —
            which is the exact failure the per-package links exist to
            avoid. */}
        <a
          href={href}
          // active:text-brand matches the storm strip's link, which is
          // the same control on the same gold ground. A press needs a
          // receipt, and the checker is right to insist on one.
          className={`${btn("lineDeep")} whitespace-nowrap border-ink/35 text-ink hover:border-ink active:text-brand`}
        >
          See the packages
        </a>
      </div>
    </section>
  );
}
