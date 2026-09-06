"use client";

/**
 * A band whose ground shifts tone as you scroll into it, so the seam
 * between two sections arrives gradually instead of as a hard edge.
 *
 * ── THIS IS NOT THE LIGHT-TO-DARK CROSSFADE THAT WAS PLANNED ────────
 * The original idea was to crossfade a band from the light ground to
 * the deep one on scroll. That cannot be made safe. Text on this site
 * is either ink-on-light or invert-on-deep, and halfway through such a
 * crossfade it is neither: dark ink over a half-darkened ground lands
 * somewhere near 2:1, well under the 4.5:1 body minimum, and it sits
 * there for the entire middle of the transition. The alternative —
 * crossfading the text color in step — spends the same failure on the
 * text instead of the ground.
 *
 * So the shift is within one tone family: surface → surface-alt, or
 * surface-deep → surface-deep-alt. Every point in that interpolation
 * holds the same contrast against the copy, because both endpoints
 * already do. The effect is quieter than the plan, and it is the
 * version that can actually ship on a page people have to read.
 * ────────────────────────────────────────────────────────────────────
 *
 * Built as an opacity fade on an overlay rather than an animated
 * background-color: opacity is composited on the GPU, while color is
 * repainted every frame across the full width of the band.
 */
import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useScrollMotion } from "@/lib/useScrollMotion";

/**
 * Both tones of a pair, as Tailwind background utilities. Keep them in
 * the same family — see the note above.
 */
type TonePair = {
  /** The ground the band starts on. Applied to the container. */
  from: string;
  /** The ground it arrives at. Applied to the overlay that fades in. */
  to: string;
};

export const TONES = {
  light: { from: "bg-surface", to: "bg-surface-alt" },
  deep: { from: "bg-surface-deep", to: "bg-surface-deep-alt" },
} satisfies Record<string, TonePair>;

export function BandTransition({
  children,
  tones,
  className,
  id,
}: {
  children: ReactNode;
  tones: TonePair;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const enabled = useScrollMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    // Complete by the time the band is centred, so the shift belongs to
    // arriving at the section rather than trailing through all of it.
    offset: ["start end", "center center"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (!enabled) {
    return (
      <section id={id} className={`${tones.from} ${className ?? ""}`}>
        {children}
      </section>
    );
  }

  return (
    <section ref={ref} id={id} className={`relative ${tones.from} ${className ?? ""}`}>
      <motion.span aria-hidden className={`absolute inset-0 ${tones.to}`} style={{ opacity }} />
      <div className="relative">{children}</div>
    </section>
  );
}
