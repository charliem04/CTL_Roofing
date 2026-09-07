"use client";

import { AnimatePresence, motion } from "framer-motion";
import { client } from "@/client.config";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { MoreLink } from "./MoreLink";
import { PinnedSteps } from "./PinnedSteps";
import { dur, ease, travel } from "@/lib/motion";

/**
 * Four steps under ruled tops — the first rule gold so the eye starts
 * where the job starts — then the four promises that hold for every
 * job, set as one boxed register rather than four floating cards.
 *
 * ── WHY THIS BAND IS THE PINNED ONE ─────────────────────────────────
 * Everywhere else on this page, "below" only means "printed after".
 * Here it means "next", because a roof job genuinely runs inspect →
 * quote → build → warranty in that order. Holding the band still and
 * walking the emphasis along the row is that sequence stated as motion
 * rather than as four boxes the eye takes in at once.
 *
 * Pinned, one step is shown at a time: a navy card that rises, expands
 * and settles in the middle of the screen as its turn comes. That is a
 * slideshow, and a slideshow is worse than a row at one specific thing
 * — knowing how many steps there are before you commit to watching.
 *
 * So the rail underneath carries all four, named, with its rule filling
 * as you pass each one. The big card gives the sequence a beat; the
 * rail keeps the answer to "how long is this going to take" on screen
 * the whole time. Losing that was the one thing worth guarding against.
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

            {active === -1 ? (
              /* Un-pinned: a phone, or a visitor who asked for less
                 motion. The band exactly as it was — four steps side by
                 side, first rule gold because that is where the job
                 starts, the other three brand. */
              <ol className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
                {process.steps.map((step, i) => (
                  <li key={step.title}>
                    <span
                      aria-hidden
                      className={`mb-6 block h-[3px] w-full ${
                        i === 0 ? "bg-accent" : "bg-brand"
                      }`}
                    />
                    <span className="mb-2.5 block font-mono text-[13px] tracking-[0.08em] text-brand-soft">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mb-2.5 text-display-3">{step.title}</h3>
                    <p className="text-base">{step.body}</p>
                  </li>
                ))}
              </ol>
            ) : (
              /*
                Pinned: one step at a time, large and centred, on the
                deep ground so the band has somewhere to go in colour —
                a navy card carrying a gold numeral, floating on the
                light band rather than sitting flat in it.

                The rail underneath is what keeps the thing honest. The
                four steps used to be visible at once, and that mattered:
                a homeowner wants to know the whole process is four steps
                long before being walked through it. One big card alone
                would have thrown that away, so the rail states all four
                and marks how far along you are.
              */
              <div className="mt-10">
                {/*
                  A one-cell grid, with every card placed in that same
                  cell. Two things fall out of it.

                  The cards can cross without mode="wait", which held
                  the incoming card until the outgoing one had finished
                  leaving and so put the rail most of a second ahead of
                  the card — the rail marking step three while the card
                  still said step two.

                  And the container takes the height of its tallest
                  card on its own. The first attempt at stacking used
                  absolute positioning over a min-height, and the
                  min-height was a guess: step four's copy is taller
                  than step two's, so the card overflowed and sat on top
                  of the rail. A grid cell cannot get that wrong.
                */}
                <div className="grid">
                  <AnimatePresence>
                    <motion.article
                      key={active}
                      className="col-start-1 row-start-1 mx-auto w-full max-w-[62ch] rounded bg-surface-deep p-[clamp(28px,4vw,52px)] text-ink-invert-soft"
                      initial={{ opacity: 0, y: travel.md, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -travel.sm, scale: 0.97 }}
                      transition={{ duration: dur.base, ease: ease.out }}
                    >
                      <span className="block font-display text-[clamp(40px,6vw,68px)] font-extrabold leading-none text-accent">
                        {String(active + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-4 text-display-2 text-ink-invert">
                        {process.steps[active].title}
                      </h3>
                      <p className="mt-5 text-[clamp(16px,1.5vw,19px)]">
                        {process.steps[active].body}
                      </p>
                    </motion.article>
                  </AnimatePresence>
                </div>

                {/* Every step named, so the length of the process is
                    never a surprise. The rule fills as you pass it. */}
                <ol className="mx-auto mt-10 grid max-w-[62ch] list-none grid-cols-4 gap-3 p-0">
                  {process.steps.map((step, i) => (
                    <li key={step.title}>
                      <span aria-hidden className="block h-[3px] w-full bg-line">
                        <motion.span
                          className="block h-full w-full origin-left bg-accent"
                          animate={{ scaleX: i <= active ? 1 : 0 }}
                          transition={{ duration: dur.base, ease: ease.out }}
                        />
                      </span>
                      <motion.span
                        className="mt-3 block font-mono text-[12px] uppercase tracking-[0.08em]"
                        animate={{ opacity: i === active ? 1 : 0.45 }}
                        transition={{ duration: dur.quick, ease: ease.out }}
                      >
                        <span className="text-brand-soft">
                          {String(i + 1).padStart(2, "0")}
                        </span>{" "}
                        <span className="text-ink">{step.title}</span>
                      </motion.span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
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
