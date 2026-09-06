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
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
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

  /**
   * ── WHY THIS MEASURES THE TRACK ITSELF ──────────────────────────────
   * This was framer's useScroll with target/offset, and it was silently
   * wrong. The gate below starts false, so the first render returned the
   * un-pinned tree — which did not carry the ref. useScroll's effect ran
   * against a null target, and rather than failing it fell back to
   * tracking progress through the whole document. The steps still
   * advanced, which is what made it hard to see: they were advancing on
   * page position instead of band position, so the band opened already
   * on step 2 and never reached step 4.
   *
   * Reading the track's own rect on each frame has no such failure mode.
   * -rect.top is how far into the track we have scrolled; the span is
   * the part of it that is not the sticky frame. Both are read live, so
   * images loading in above, a resize, or a font swap simply produce a
   * correct answer on the next frame instead of a stale one forever.
   * ────────────────────────────────────────────────────────────────────
   */
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      // The track is one screen taller than the travel it provides.
      const span = rect.height - window.innerHeight;
      if (span <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / span));
      // Each step owns an equal share. Clamped at the top because
      // progress reaches exactly 1 on the last pixel, which would
      // otherwise index one past the final step for a frame.
      const next = Math.min(count - 1, Math.floor(progress * count));
      setActive((current) => (current === next ? current : next));
    };
    // Coalesced to one measurement per frame: Lenis emits a scroll
    // event per animation frame while decelerating, and getBoundingClientRect
    // is a layout read we do not want to do twice for the same paint.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, count]);

  return (
    <div
      ref={ref}
      className={className}
      // One screen for the frame itself, plus the travel the steps need.
      style={enabled ? { height: `calc(100vh + ${count * scrollPerStep * 100}vh)` } : undefined}
    >
      {enabled ? (
        // Deliberately not overflow-hidden. A frame exactly one screen
        // tall will be shorter than its contents on a laptop with a
        // short viewport, and clipping there silently removes the last
        // step from a sequence whose whole point is that there are four
        // of them. Overflowing is visible and survivable; clipping is
        // neither.
        <div className="sticky top-0 flex h-screen items-center">{children(active)}</div>
      ) : (
        children(-1)
      )}
    </div>
  );
}
