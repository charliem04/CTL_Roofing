"use client";

/**
 * The one gate every scroll-linked effect asks before it runs: is this
 * a screen wide enough for pinning and parallax, and does this visitor
 * want motion at all?
 *
 * Entrance animations (see components/Reveal.tsx) do NOT use this —
 * they only check reduced-motion, because a fade is fine on a phone.
 * This gate is specifically for the expensive, scroll-position-linked
 * work: PinnedSteps, Parallax, BandTransition.
 *
 * It returns false on the server and on the first client render, which
 * is deliberate on a statically exported site. The HTML in /out is the
 * un-animated layout — real content, correct order, no dependency on
 * JavaScript for anything a crawler or a reader needs — and the scroll
 * effects attach afterwards as an enhancement. Starting `true` would
 * mean guessing the viewport width during SSR and mismatching hydration
 * on every wrong guess.
 */
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { PIN_MIN_WIDTH } from "./motion";

export function useScrollMotion(): boolean {
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${PIN_MIN_WIDTH}px)`);
    const sync = () => setWide(mq.matches);
    sync();
    // Rotating a tablet crosses the threshold, so this stays subscribed
    // rather than sampling once on mount.
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return wide && !reduce;
}
