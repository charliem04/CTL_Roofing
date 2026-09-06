"use client";

import { motion } from "framer-motion";
import { client } from "@/client.config";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { MoreLink } from "./MoreLink";
import { PinnedSteps } from "./PinnedSteps";
import { dur, ease } from "@/lib/motion";

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

            <ol className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
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
                    animate={{ opacity: dimmed ? 0.32 : 1 }}
                    transition={{ duration: dur.quick, ease: ease.out }}
                  >
                    {/* The ruled top is the existing mark, not a new
                        one: while pinned it turns gold as its step
                        becomes current, so the row reads as a progress
                        bar made of the rules that were always there. */}
                    <motion.span
                      aria-hidden
                      className="mb-6 block h-[3px] w-full origin-left"
                      animate={{
                        scaleX: unpinned || active === i ? 1 : 0.4,
                        backgroundColor: current
                          ? "rgb(var(--accent))"
                          : "rgb(var(--brand))",
                      }}
                      transition={{ duration: dur.base, ease: ease.out }}
                    />
                    <span className="mb-2.5 block font-mono text-[13px] tracking-[0.08em] text-brand-soft">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mb-2.5 text-display-3">{step.title}</h3>
                    <p className="text-base">{step.body}</p>
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
              <div key={p.title} className="bg-surface p-6">
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
