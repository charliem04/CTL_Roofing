"use client";

/**
 * Headline lines rising out of a mask, one after the next.
 *
 * The effect only works on display type, and it is the reason it exists
 * here rather than as a Reveal variant: at display-1 (up to 102px) a
 * plain fade has nothing to do — the type is so large that opacity
 * alone reads as the page still loading. A masked rise reads as the
 * words being set.
 *
 * ── WHY LINES ARE PASSED IN, NOT MEASURED ───────────────────────────
 * The obvious implementation measures where the browser wrapped the
 * text and masks each visual line. That needs a layout pass before the
 * first paint, it re-runs on every resize, and it fights a clamp()
 * type scale that changes the wrap point continuously rather than at
 * breakpoints. So the caller states the lines instead. It is more
 * typing at the call site and it never desynchronises.
 *
 * A line that wraps on a narrow screen simply rises as one taller
 * block, which is the correct behaviour and needs no special case.
 * ────────────────────────────────────────────────────────────────────
 */
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { dur, ease, stagger, viewport } from "@/lib/motion";
import { useStillness } from "@/lib/useScrollMotion";

type TextAs = "h1" | "h2" | "h3" | "p";

export function RevealText({
  lines,
  className,
  delay = 0,
  as: Tag = "h2",
}: {
  /**
   * Each entry is one masked line, revealed `stagger.line` after the
   * one above. Readonly because the headings in client.config are
   * `as const` tuples and this only ever maps over them.
   */
  lines: readonly ReactNode[];
  className?: string;
  delay?: number;
  as?: TextAs;
}) {
  const reduce = useStillness();

  if (reduce) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        // The mask. Descenders on the display face sit below the line
        // box, so the clip box is pushed 0.16em lower and the same
        // amount is pulled back off the bottom margin — without this,
        // overflow-hidden shears the tail off every g, y and p.
        <span key={i} className="block overflow-hidden pb-[0.16em] mb-[-0.16em]">
          <motion.span
            className="block"
            initial={{ y: "112%" }}
            whileInView={{ y: "0%" }}
            viewport={viewport.standard}
            transition={{
              duration: dur.slow,
              delay: delay + i * stagger.line,
              ease: ease.out,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
