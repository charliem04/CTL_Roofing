import type { FinanceProduct } from "@/content/types";
import { cascade } from "@/lib/motion";
import { Reveal } from "./Reveal";
import { btn } from "./Button";

/**
 * The lender's three packages, each opening the prequalification portal.
 *
 * ── ON NOT USING THE LENDER'S ARTWORK ───────────────────────────────
 * These arrive from CTL as three green JPEGs carrying the Regions
 * wordmark, the FDIC mark and a "Start My Project Today!" button baked
 * into the pixels. They are not used, for four reasons that all point
 * the same way: text in an image is invisible to search and to a screen
 * reader; it cannot reflow on a phone; it goes stale the day a rate
 * changes and nobody can edit it; and dropping another firm's green and
 * wordmark into the middle of this page reads as co-branding rather
 * than as "here is who lends the money".
 *
 * So the terms are set in our own type on our own ground, and the
 * lender is credited in words underneath. The rate is now a string in
 * content/financing.ts that anyone can change in ten seconds.
 * ────────────────────────────────────────────────────────────────────
 *
 * Each card carries its own portal link. The three packages have three
 * different loanCodes, and only the code differs between them — which
 * means a wrong one does not error, it silently opens the application
 * for a product the visitor did not choose.
 */
export function FinanceProducts({
  products,
}: {
  products: readonly FinanceProduct[];
}) {
  return (
    <ul className="mt-10 grid list-none gap-5 p-0 md:grid-cols-3">
      {products.map((p, i) => (
        <Reveal as="li" key={p.name} delay={cascade(i)}>
          {/*
            The whole card is the link, and the button inside it is a
            span. Two reasons, and the second is the real one.

            A card that lifts under the cursor while only its button
            actually does anything is a card that lies — the affordance
            has to match the target, so the target became the card. And
            a real <a> inside this <a> would be nested interactive
            content, which is invalid and which screen readers and
            keyboards both handle badly. ServiceCards already resolves
            it this way.

            Hover is border and button colour only. No lift, no scale:
            the checker flags hover:scale-1xx as decorative motion by
            name, and a transform here would fight the entrance the
            Reveal is already running on the same element.
          */}
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col rounded border border-line-dark/20 bg-surface-deep-alt p-7 no-underline transition-colors duration-200 hover:border-accent active:border-accent-press"
          >
            <p className="font-display text-[clamp(26px,3vw,34px)] font-extrabold uppercase leading-none text-accent">
              {p.headline}
              {/* Points at the disclosure under the cards, the same way
                  the lender's own artwork points at its footnote. */}
              <sup className="ml-0.5 text-[0.6em]">*</sup>
            </p>
            <h3 className="mt-2 text-display-4 text-ink-invert">{p.name}</h3>
            {p.detail && (
              <p className="mt-4 flex-1 text-[15px] text-ink-invert-soft">{p.detail}</p>
            )}
            {/* group-hover, because the pointer is usually on the card
                rather than on this span, and the button still has to
                light up when it is. */}
            <span
              className={`mt-7 w-full ${btn("gold")} group-hover:bg-accent-lift group-active:bg-accent-press`}
            >
              Check if I prequalify
            </span>
          </a>
        </Reveal>
      ))}
    </ul>
  );
}
