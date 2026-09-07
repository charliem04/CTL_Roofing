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
 *
 * Below 1024 the band cannot be pinned, but the sequence survives it.
 * The steps stack, the page scrolls normally, and the emphasis follows
 * the reader down the column instead of along the row — same four
 * steps, same walking highlight, no scroll held hostage. What the
 * narrow band drops is the current card's extra padding, which is
 * weight the pinned band can spend and a scrolling page cannot.
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
        {(active, pinned) => (
          <div className="section w-full">
            <SectionHead heading={process.heading} lede={process.lede} />

            {/*
              Flex rather than a four-column grid, because the current
              step has to be able to take more of the row than the
              others and a grid column cannot be talked out of its
              share. At lg the cards size to their own content and
              padding and the row centres them; below lg they are
              basis-full or basis-half, the same stacked and two-up
              layout it always was.

              The min-height stops the row changing height as the
              current card takes its extra vertical padding. It mattered
              more in the version before this one, where the cards
              shared the row by flex-grow: step four wrapped to seven
              lines at its narrow width and five at its wide one, and
              the row collapsed 49px at the moment that step expanded —
              391px in three states against 342px in the fourth. With a
              fixed measure the text no longer wraps differently, so
              this is now a floor rather than a fix, and it keeps the
              padding change from nudging the row.
            */}
            <ol className="mt-10 flex list-none flex-wrap gap-6 p-0 lg:min-h-[420px] lg:flex-nowrap lg:justify-center lg:gap-4">
              {process.steps.map((step, i) => {
                // -1 is the still rendering — a reduced-motion visitor,
                // at any width. That is not "every step is current": it
                // is the band exactly as it was before any of this,
                // where the FIRST rule is gold because that is where the
                // job starts, and the other three are brand. Treating -1
                // as all-current turned every rule gold and quietly
                // threw that decision away.
                //
                // Everything else — pinned or not — has a real current
                // step and dims the rest. A phone used to land here on
                // the -1 branch, so it showed step one lit and the other
                // three grey for the whole band: the emphasis of a
                // sequence with none of the sequence.
                const still = active === -1;
                const current = still ? i === 0 : active === i;
                const dimmed = !still && active !== i;
                return (
                  <motion.li
                    key={step.title}
                    // How PinnedSteps finds the steps when there is no
                    // scroll track to measure. See its contract note.
                    data-step
                    // Each step is a box now rather than a column of
                    // loose text. On a white band a white card has no
                    // edge to speak of, so the resting state is the pale
                    // ground and the current step lifts to white with a
                    // brand edge — the box gains weight by coming
                    // forward, not by being outlined harder.
                    className="flex basis-full flex-col rounded border p-7 sm:basis-[calc(50%-12px)] lg:basis-auto lg:p-0"
                    animate={{
                      // ── WHY THE CARD GROWS BY PADDING ─────────────
                      // The first version of this divided the row with
                      // flex-grow, so the current card took a bigger
                      // share and the others took less. It pushed
                      // correctly and it re-wrapped every paragraph on
                      // the way: four columns all changing width means
                      // four blocks of text re-flowing line by line
                      // through the whole transition, which is the
                      // cascade that had to go.
                      //
                      // Nothing about the widening was wrong — the text
                      // being downstream of it was. So the content
                      // column below is a fixed width that no card can
                      // change, and the card grows around it by taking
                      // more padding. Wrap points cannot move, because
                      // the measure the text is set to never does.
                      //
                      // The neighbours are pushed rather than squeezed:
                      // their own width is untouched, so their text
                      // holds still while they slide.
                      //
                      // WHY ONLY WHEN PINNED. Growing the current card
                      // costs nothing while the band is held still —
                      // there is nothing below it to move. Unpinned the
                      // cards are stacked in the ordinary flow of a page
                      // the reader is actively scrolling, and a card
                      // that gains 32px as it reaches the middle of the
                      // screen pushes everything under it down by 32px
                      // mid-scroll. The emphasis is worth having; the
                      // shove is not, so the unpinned band keeps the
                      // colour change and drops the geometry.
                      paddingLeft: pinned && current ? 56 : 28,
                      paddingRight: pinned && current ? 56 : 28,
                      paddingTop: pinned && current ? 44 : 28,
                      paddingBottom: pinned && current ? 44 : 28,
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
                        one: it turns gold as its step becomes current,
                        so the row reads as a progress bar made of the
                        rules that were always there. Stacked on a phone
                        it is the same mark doing the same job down a
                        column instead of along a row. */}
                    <motion.span
                      aria-hidden
                      className="mb-7 block h-[4px] w-full origin-left"
                      animate={{
                        scaleX: still || current ? 1 : 0.4,
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
                    {/*
                      The measure, and the whole point of the change.
                      This width is set here and nothing above can move
                      it, so every paragraph keeps its line breaks
                      through the entire sequence. The card grows around
                      it; the words do not notice.

                      The numbers are sized so the row fits. Four cards
                      plus the expanded card's extra padding plus the
                      gaps has to stay inside the 1112px the section
                      allows at 1440 and the 942px it allows at 1024 —
                      the first attempt used a 196px measure and came to
                      1144, so step four wrapped onto a second line.
                      This comes to 1032 and 888. lg:flex-nowrap is the
                      backstop: if a future edit overruns again it will
                      show as a squeeze rather than silently dropping a
                      card below the row.
                    */}
                    <div className="w-full lg:w-[clamp(140px,12.5vw,176px)]">
                      <span className="block font-display text-[clamp(34px,3.4vw,52px)] font-extrabold leading-none text-brand-soft">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-4 font-display text-[clamp(20px,1.9vw,26px)] font-bold uppercase leading-none text-ink">
                        {step.title}
                      </h3>
                      <p className="mt-3.5 text-[15px]">{step.body}</p>
                    </div>
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
