"use client";

import { motion } from "framer-motion";
import { client } from "@/client.config";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { MoreLink } from "./MoreLink";
import { PinnedSteps } from "./PinnedSteps";
import { dur, ease } from "@/lib/motion";

/**
 * Four boxed steps under ruled tops — the first rule gold so the eye
 * starts where the job starts — then the four promises that hold for
 * every job, set as one boxed register rather than four floating cards.
 *
 * ── WHY THIS BAND IS THE PINNED ONE ─────────────────────────────────
 * Everywhere else on this page, "below" only means "printed after".
 * Here it means "next", because a roof job genuinely runs inspect →
 * quote → build → warranty in that order. Holding the band still and
 * walking the emphasis along the row is that sequence stated as motion
 * rather than as four boxes the eye takes in at once.
 *
 * All four steps stay on screen and in the DOM throughout. Revealing
 * them one at a time would read better as a slideshow and worse as
 * information: a homeowner wants to see that the whole process is four
 * steps long before being walked through them.
 * ────────────────────────────────────────────────────────────────────
 *
 * This is a client component, which the rest of the page's bands are
 * not. PinnedSteps takes a render prop, and a function cannot cross the
 * server/client boundary. The step copy still ships in the static HTML.
 */
export function Process() {
  const { process } = client;

  return (
    <section id="process" className="band bg-surface">
      <PinnedSteps count={process.steps.length}>
        {(active) => (
          <div className="section w-full">
            <SectionHead heading={process.heading} lede={process.lede} />

            {/*
              Flex rather than a four-column grid, because the current
              step has to be able to take more of the row than the
              others and a grid column cannot be talked out of its
              share.

              Below lg every card is basis-full or basis-half and the
              growth below is 1 across the board, so this is the same
              stacked and two-up layout it always was. At lg the basis
              drops to 0 and width becomes entirely a question of
              flex-grow, which is what the animation drives.
            */}
            {/*
              The min-height is what stops the push jolting vertically.
              Cards stretch to the row, and the row takes the height of
              whichever card wraps to the most lines — which changes as
              they widen. Step four has the longest body: at 234px it
              runs seven lines, at 339px it runs five, so the row
              collapsed 49px at the exact moment that step expanded.
              Measured, not guessed: 391px in three of the four states
              and 342px in the fourth.

              Holding a floor above the tallest state means the row
              keeps one height and the only thing that moves is what is
              supposed to move. It applies at lg and up, which is
              exactly where the pinning that drives all this happens.
            */}
            <ol className="mt-10 flex list-none flex-wrap gap-6 p-0 lg:min-h-[420px]">
              {process.steps.map((step, i) => {
                // -1 is the un-pinned rendering — a phone, or a
                // reduced-motion visitor. That is not "every step is
                // current": it is the band exactly as it was before any
                // of this, where the FIRST rule is gold because that is
                // where the job starts, and the other three are brand.
                // Treating -1 as all-current turned every rule gold and
                // quietly threw that decision away.
                const unpinned = active === -1;
                const current = unpinned ? i === 0 : active === i;
                const dimmed = !unpinned && active !== i;
                return (
                  <motion.li
                    key={step.title}
                    // Each step is a box now rather than a column of
                    // loose text. On a white band a white card has no
                    // edge to speak of, so the resting state is the pale
                    // ground and the current step lifts to white with a
                    // brand edge — the box gains weight by coming
                    // forward, not by being outlined harder.
                    className="flex min-w-0 basis-full flex-col rounded border p-7 sm:basis-[calc(50%-12px)] lg:basis-0"
                    animate={{
                      // The push. At lg the basis is 0, so the row is
                      // divided purely by these numbers: the current
                      // step takes 1.6 shares against 1 each for the
                      // other three, which is 35% of the row against
                      // 21.7%, and the neighbours slide aside to pay
                      // for it.
                      //
                      // Grow rather than width. Animating width reflows
                      // the row on every frame and is the thing
                      // check.mjs flags as layout-animation by name;
                      // flex-grow hands the distribution to the flex
                      // algorithm and moves all four in one pass.
                      //
                      // 1.6 is deliberately short of dramatic. Past
                      // about 2 the other three narrow enough to gain a
                      // line of wrapped text, which makes the whole row
                      // taller and turns a sideways push into a
                      // vertical jolt.
                      flexGrow: unpinned ? 1 : current ? 1.6 : 1,
                      opacity: dimmed ? 0.32 : 1,
                      backgroundColor: current
                        ? "rgb(var(--surface))"
                        : "rgb(var(--surface-alt))",
                      borderColor: current
                        ? "rgb(var(--brand))"
                        : "rgb(var(--line))",
                    }}
                    // One duration for the whole card, so the widening,
                    // the brightening and the border arrive together
                    // rather than as three separate events.
                    transition={{ duration: dur.base, ease: ease.out }}
                  >
                    {/* The ruled top is the existing mark, not a new
                        one: while pinned it turns gold as its step
                        becomes current, so the row reads as a progress
                        bar made of the rules that were always there. */}
                    <motion.span
                      aria-hidden
                      className="mb-7 block h-[4px] w-full origin-left"
                      animate={{
                        scaleX: unpinned || active === i ? 1 : 0.4,
                        backgroundColor: current
                          ? "rgb(var(--accent))"
                          : "rgb(var(--brand))",
                      }}
                      transition={{ duration: dur.base, ease: ease.out }}
                    />
                    {/* The number carries the size. It is the one thing
                        in the card that can grow without wrapping, and
                        a step count set large is what makes four narrow
                        columns read as four substantial things. */}
                    <span className="block font-display text-[clamp(34px,3.4vw,52px)] font-extrabold leading-none text-brand-soft">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 font-display text-[clamp(20px,1.9vw,26px)] font-bold uppercase leading-none text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-3.5 text-[15px]">{step.body}</p>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        )}
      </PinnedSteps>

      <div className="section">
        <Reveal delay={0.1}>
          {/* gap-px over a line-colored ground: the cells are separated
              by one hairline in every layout, with no doubled rules */}
          <dl className="mt-10 grid gap-px rounded border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {process.promises.map((p) => (
              <div key={p.title} className="border-t-[3px] border-brand bg-surface p-6">
                <dt className="mb-2.5 font-display text-[19px] font-bold uppercase text-ink">
                  {p.title}
                </dt>
                <dd className="m-0 text-[15px]">{p.body}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-10">
            <MoreLink href="/case-studies/">See how it ran on real jobs</MoreLink>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
