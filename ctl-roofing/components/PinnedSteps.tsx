"use client";

/**
 * A band that holds still while its contents advance under the scroll.
 *
 * The scroll wheel stops being a way to move down the page and becomes
 * a way to move through one section of it. Used for Process, where the
 * four steps are a sequence in time — the one place on this site where
 * "next" is a real relationship between two blocks rather than just
 * "the thing printed below".
 *
 * ── HOW IT IS BUILT ─────────────────────────────────────────────────
 * No library pinning, no fixed positioning, no scroll hijack. An outer
 * element taller than the screen provides the scroll distance; an inner
 * `position: sticky` frame stays put while that distance is consumed.
 * The browser does the pinning natively, which means it survives resize,
 * zoom, find-in-page and back-button restoration without a single
 * recalculation of ours.
 *
 * All this component contributes is: how tall the track is, and which
 * step the current scroll position corresponds to.
 * ────────────────────────────────────────────────────────────────────
 *
 * ── THE CONTRACT ────────────────────────────────────────────────────
 * `children` is a render prop taking the active step index.
 *
 *   active >= 0   pinned; render the sequence with this step current
 *   active === -1 NOT pinned; render every step at once, statically
 *
 * The -1 case is what a phone and a reduced-motion visitor get, and it
 * is not a degraded version — it is the plain stacked layout the band
 * had before any of this, which was always fine.
 * ────────────────────────────────────────────────────────────────────
 */
import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { useScrollMotion } from "@/lib/useScrollMotion";

export function PinnedSteps({
  count,
  children,
  className,
  /**
   * Screens of scrolling spent on each step. Below about 0.45 the steps
   * flick past faster than they can be read; past about 0.8 the visitor
   * starts to wonder whether the page has stopped working. 0.6 is a
   * comfortable beat — roughly a second of unhurried scrolling per step.
   */
  scrollPerStep = 0.6,
}: {
  count: number;
  children: (active: number) => ReactNode;
  className?: string;
  scrollPerStep?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useScrollMotion();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    // The track's own travel: from its top hitting the top of the
    // screen to its bottom doing the same. That is exactly the span
    // during which the sticky child is stuck.
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // Each step owns an equal share of the track. Clamped at the top
    // end because progress reaches exactly 1 on the final pixel, which
    // would otherwise index one past the last step for one frame.
    const next = Math.min(count - 1, Math.max(0, Math.floor(p * count)));
    setActive((current) => (current === next ? current : next));
  });

  if (!enabled) return <div className={className}>{children(-1)}</div>;

  return (
    <div
      ref={ref}
      className={className}
      // One screen for the frame itself, plus the travel the steps need.
      style={{ height: `calc(100vh + ${count * scrollPerStep * 100}vh)` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {children(active)}
      </div>
    </div>
  );
}
