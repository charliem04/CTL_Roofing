"use client";

/**
 * Project cost → estimated monthly payment.
 *
 * The point of it is psychological: a $22,000 roof is a number people
 * flinch at, and the same roof at a monthly figure is a number they can
 * reason about. That only works if the figure is real, so every rate
 * and term here comes from content/financing.ts. There is no default
 * APR and no illustrative example — with no offers configured this
 * component renders nothing and the page shows the pending panel
 * instead. A monthly payment printed on a website is a number a
 * customer will hold you to.
 *
 * Math is the standard amortising payment:
 *   P = principal · r / (1 − (1 + r)^−n),  r = APR/12, n = months
 * with the zero-rate case handled separately.
 */
import { useMemo, useState } from "react";
import type { FinanceOffer } from "@/content/types";

const dollars = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export function monthlyPayment(
  principal: number,
  apr: number,
  months: number
): number {
  if (months <= 0) return 0;
  const r = apr / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function PaymentEstimator({
  offers,
  bounds,
}: {
  offers: FinanceOffer[];
  bounds: { min: number; max: number; step: number; default: number };
}) {
  const [cost, setCost] = useState(bounds.default);

  const rows = useMemo(
    () =>
      offers.map((o) => ({
        ...o,
        monthly: monthlyPayment(cost, o.apr, o.months),
        total: monthlyPayment(cost, o.apr, o.months) * o.months,
      })),
    [cost, offers]
  );

  if (offers.length === 0) return null;

  return (
    <div className="rounded border border-line bg-surface p-6 md:p-8">
      <label htmlFor="project-cost" className="u-label block">
        Project cost
      </label>
      <output
        htmlFor="project-cost"
        className="mt-2 block font-display text-display-2 font-extrabold leading-none text-ink"
      >
        {dollars(cost)}
      </output>

      <input
        id="project-cost"
        type="range"
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={cost}
        onChange={(e) => setCost(Number(e.target.value))}
        className="mt-6 w-full accent-brand"
      />
      <div className="flex justify-between font-mono text-[12px] uppercase tracking-[0.09em] text-ink-faint">
        <span>{dollars(bounds.min)}</span>
        <span>{dollars(bounds.max)}</span>
      </div>

      {/* The checker counts only the Tailwind size tokens it knows about.
          The largest step here is the dollar figure at text-display-2 —
          up to 62px — so the real span is 14→62px, not 14→18px. */}
      {/* deliberate-ignore flat-type-scale */}
      <table className="mt-8 w-full border-collapse text-base">
        <caption className="u-label pb-3 text-left">
          Estimated monthly payment
        </caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="py-2 text-left font-semibold text-ink">
              Term
            </th>
            <th scope="col" className="py-2 text-right font-semibold text-ink">
              APR
            </th>
            <th scope="col" className="py-2 text-right font-semibold text-ink">
              Per month
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-line">
              <td className="py-3 text-ink">
                {r.label}
                {r.note && (
                  <span className="mt-1 block text-sm text-ink-faint">{r.note}</span>
                )}
              </td>
              <td className="py-3 text-right font-mono tabular-nums">
                {r.apr.toFixed(2)}%
              </td>
              <td className="py-3 text-right font-mono text-lg font-semibold tabular-nums text-ink">
                {dollars(r.monthly)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-5 text-sm text-ink-faint">
        An estimate, not an offer. The figures use the terms shown and assume
        the full project cost is financed with nothing down. What you are
        actually offered depends on the lender's decision.
      </p>
    </div>
  );
}
