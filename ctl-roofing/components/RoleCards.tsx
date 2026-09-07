import type { Role } from "@/content/careers";
import { cascade } from "@/lib/motion";
import { Reveal } from "./Reveal";

/**
 * The work CTL hires for, one card each.
 *
 * ── WHY THESE ARE CARDS AND NOT A HAIRLINE GRID ─────────────────────
 * This was a `gap-px bg-line` grid: fourteen white cells sharing seams
 * on a white band, which is the quietest thing on the site sitting on
 * the page with the most items. Separating them onto a grey ground
 * gives each role an edge of its own, and gives the gold rule somewhere
 * to sit — the same 3px gold rule that tops the Process steps, the
 * review boxes and the financing panel.
 *
 * ── WHY THE HOVER MOVES ─────────────────────────────────────────────
 * FinanceProducts deliberately refuses a lift, and the reasoning there
 * still holds: those cards are links, and a card that moves under the
 * cursor while only its button does anything is a card that lies. These
 * are not links. Nothing here is clickable, so a lift promises nothing
 * it cannot keep — it is the card acknowledging the pointer, which is
 * the one thing hover on a non-interactive card can honestly mean.
 *
 * Two movements, coordinated rather than stacked: the card rises 6px,
 * and brand navy sweeps left-to-right across the gold rule at its top.
 * The sweep is the slower of the two, so the colour is still arriving
 * after the card has settled.
 *
 * Both are transforms — no shadow, because there is not one shadow
 * anywhere else on this site and hover is the wrong place to introduce
 * a new material. Depth here is a rule and an edge, as it is elsewhere.
 *
 * Under prefers-reduced-motion the lift is dropped entirely and the
 * navy arrives instantly instead of sweeping, so the card still answers
 * the pointer without anything travelling. That split is why the two
 * use different guards: motion-safe removes the movement, duration-0
 * keeps the colour and removes only the journey.
 *
 * `group` sits on the Reveal and the transform on the child, because
 * framer-motion writes its own inline transform onto the element it
 * animates: a hover translate on the same node would be overwritten by
 * the entrance the moment they overlapped.
 * ────────────────────────────────────────────────────────────────────
 */
export function RoleCards({ roles }: { roles: readonly Role[] }) {
  return (
    <ul className="mt-10 grid list-none gap-5 p-0 md:grid-cols-2">
      {roles.map((r, i) => (
        <Reveal as="li" key={r.slug} delay={cascade(i)} className="group">
          <div className="relative flex h-full flex-col overflow-hidden rounded border border-line bg-surface px-7 pb-7 pt-8 duration-300 ease-brand [transition-property:transform,border-color] group-hover:border-brand group-active:border-brand-strong motion-safe:group-hover:-translate-y-1.5 motion-safe:group-active:-translate-y-0.5">
            {/* The rule is gold at rest and navy under the cursor. Two
                spans rather than a background swap, so the change reads
                as the colour crossing the card rather than the card
                blinking from one state to the other. */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[3px] bg-accent"
            />
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-brand duration-500 ease-brand [transition-property:transform] group-hover:scale-x-100 motion-reduce:duration-0"
            />

            {/* Omitted rather than guessed — see the note on `basis` in
                content/careers.ts. */}
            {(r.basis || r.location) && (
              <p className="u-label">
                {r.basis}
                {r.basis && r.location && " · "}
                {r.location}
              </p>
            )}
            <h3 className="mt-2 font-display text-[23px] font-bold uppercase text-ink duration-200 ease-brand [transition-property:color] group-hover:text-brand">
              {r.title}
            </h3>
            <p className="mt-3 max-w-[46ch] text-[15px]">{r.summary}</p>

            {r.does.length > 0 && (
              <>
                <p className="u-label mt-6">The work</p>
                <ul className="ticks mt-2.5 list-none text-[15px]">
                  {r.does.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </>
            )}
            {r.needs.length > 0 && (
              <>
                <p className="u-label mt-5">What you need</p>
                <ul className="ticks mt-2.5 list-none text-[15px]">
                  {r.needs.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Reveal>
      ))}
    </ul>
  );
}
