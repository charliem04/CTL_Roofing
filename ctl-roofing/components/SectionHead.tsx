"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { RevealText } from "./RevealText";
import { Reveal } from "./Reveal";
import { dur, ease, stagger, viewport } from "@/lib/motion";
import { useStillness } from "@/lib/useScrollMotion";

/**
 * The three ascending ribs are the site’s one repeated mark: a standing
 * seam panel seen end-on, taken from the roof CTL builds rather than
 * from an icon set. It opens every band and appears nowhere else.
 *
 * The ribs grow from the base, shortest first. A standing seam is
 * assembled panel by panel and the mark is a drawing of that, so
 * building it in the same order is the one animation on this site that
 * is describing the actual product rather than decorating a heading.
 */
const RIBS = [14, 22, 30];

export function SeamMark({ className }: { className?: string }) {
  const reduce = useStillness();

  return (
    <span aria-hidden className={`flex h-[30px] items-end gap-[5px] ${className ?? ""}`}>
      {RIBS.map((h, i) =>
        reduce ? (
          <i key={h} className="block w-1 bg-accent" style={{ height: h }} />
        ) : (
          <motion.i
            key={h}
            className="block w-1 origin-bottom bg-accent"
            style={{ height: h }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={viewport.standard}
            transition={{ duration: dur.base, delay: i * stagger.tight, ease: ease.out }}
          />
        )
      )}
    </span>
  );
}

/**
 * Seam mark, heading, and an optional lede — the opening of a band.
 *
 * The three arrive in that order rather than together: the mark builds,
 * the heading rises out of its mask, the lede follows. It is the reading
 * order stated as timing, and it is why `stagger.loose` is used here —
 * these are the few big elements of a band opening, not a grid of
 * equals.
 *
 * `heading` is passed to RevealText as a single line. A heading that
 * wraps on a narrow screen rises as one taller block, which is correct
 * and needs no special case; see the note in RevealText on why lines are
 * stated rather than measured.
 */
export function SectionHead({
  heading,
  lede,
  className,
  tone = "light",
}: {
  heading: ReactNode;
  lede?: string;
  className?: string;
  /** The deep ground needs the inverted heading color. */
  tone?: "light" | "deep";
}) {
  return (
    <div className={className}>
      <SeamMark className="mb-4" />
      <RevealText
        as="h2"
        lines={[heading]}
        delay={stagger.loose}
        className={`text-display-2 ${tone === "deep" ? "text-ink-invert" : ""}`}
      />
      {lede && (
        <Reveal delay={stagger.loose * 2}>
          <p className="mt-4 max-w-[58ch] text-lg">{lede}</p>
        </Reveal>
      )}
    </div>
  );
}
