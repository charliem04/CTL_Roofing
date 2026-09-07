"use client";

/**
 * The wipe between pages. Five gold panels lying across the screen,
 * each a slightly different shade, sweeping off to the right one after
 * the other.
 *
 * The panels are the point: horizontal bands laid one below the next
 * are a metal roof going on, which is the thing this company sells. A
 * generic fade would have cost the same and said nothing.
 *
 * They used to carry a rule between them, on the reasoning that a seam
 * is what makes bands read as standing seam. In gold it did the
 * opposite — five hard lines across the screen read as five stripes
 * rather than one surface, and the shade step already separates them.
 *
 * ── WHY IT REVEALS RATHER THAN COVERS ───────────────────────────────
 * The reference this came from covers the screen on click, holds, then
 * uncovers once the new page is ready — about 1.4s each way. That shape
 * is built for a site where the next page takes a moment to arrive.
 *
 * This is a static export with client-side routing: the next page is
 * already there in well under a tenth of a second. Covering first would
 * mean sitting on a deliberate delay of roughly two seconds per click,
 * added to a site whose entire job is getting somebody to a phone
 * number. So the panels start covering and sweep away — the navigation
 * is never blocked, the new page is underneath the whole time, and what
 * a visitor sees is the same wipe.
 * ────────────────────────────────────────────────────────────────────
 *
 * ── WHAT IT DOES NOT DO ─────────────────────────────────────────────
 * It does not run on first load. The panels would sit over the hero
 * while the page is painting for the first time, which is the one
 * moment that decides the Largest Contentful Paint — a decorative
 * overlay is not worth spending that on.
 *
 * It does not run under prefers-reduced-motion. A full-screen wipe on
 * every navigation is exactly the kind of thing that setting exists to
 * turn off.
 *
 * It never takes a pointer event. The panels are decorative and gone in
 * about 1.2 seconds; a visitor who clicks where one used to be should
 * hit the page, not an invisible sheet.
 * ────────────────────────────────────────────────────────────────────
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { dur, ease, stagger } from "@/lib/motion";
import { useStillness } from "@/lib/useScrollMotion";

/**
 * Five, as in the reference. Enough to read as a sequence, few enough
 * to stay quick.
 *
 * Each panel is its own shade, lightest at the top and darkest at the
 * bottom — light falling across a roof plane rather than five identical
 * stripes. The ends are the palette's own accent-lift and accent-press;
 * the three between them are steps along that ramp.
 *
 * They are written out here rather than added to globals.css as brand
 * tokens. Two intermediate golds that exist only for one animation are
 * not part of the brand, and putting them in the palette would invite
 * their use somewhere they have never been contrast-checked.
 */
const PANELS = [
  "rgb(248 220 124)", // accent-lift
  "rgb(245 212 98)",
  "rgb(241 204 71)", // accent
  "rgb(226 186 51)",
  "rgb(212 168 31)", // accent-press
];

export function PageTransition() {
  const pathname = usePathname();
  const still = useStillness();
  /**
   * `run` counts navigations, so returning to a page you have already
   * been on still replays. `seen` is what keeps it off the first load.
   *
   * ── WHY THIS COMPARES PATHS AND DOES NOT COUNT MOUNTS ───────────────
   * This was a `first` boolean ref: true on mount, set false, skip.
   * That is defeated by React Strict Mode, which `next dev` turns on by
   * default — it mounts, runs effects, cleans up and runs them again.
   * The first pass spent the flag, the second pass saw it already false
   * and fired, and the wipe played across the hero on every fresh load
   * of the dev server.
   *
   * Holding the last path instead is immune to how many times the
   * effect runs: on mount it equals the current path and nothing
   * happens, however often that is re-checked. Only an actual change
   * of route gets through.
   * ────────────────────────────────────────────────────────────────────
   */
  const [run, setRun] = useState(0);
  const seen = useRef(pathname);

  useEffect(() => {
    if (seen.current === pathname) return;
    seen.current = pathname;
    setRun((n) => n + 1);
  }, [pathname]);

  if (still || run === 0) return null;

  return (
    <div
      aria-hidden
      // Named so a test can find it without depending on the exact
      // Tailwind classes, which are a styling decision and not a
      // contract.
      data-page-wipe
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {PANELS.map((shade, i) => (
        <motion.span
          // The run number is in the key so every navigation remounts
          // the panels and replays them from covering.
          key={`${run}-${i}`}
          // No divider between panels. The shade step does the
          // separating on its own, and a hard rule across every band
          // read as five stripes rather than one surface. The 20.2%
          // height against 20% spacing is deliberate overlap, so no
          // sub-pixel seam of the page shows through between them.
          className="absolute left-0 w-full origin-right"
          style={{ top: `${i * 20}%`, height: "20.2%", backgroundColor: shade }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          // dur.base and stagger.loose rather than numbers of its own:
          // 0.7s a panel, 120ms apart, so the whole wipe runs about
          // 1.18s against the 0.78s it did before. Slow enough to watch
          // the panels leave in sequence, still short of the point where
          // somebody who just wanted the phone number starts waiting.
          transition={{ duration: dur.base, delay: i * stagger.loose, ease: ease.out }}
        />
      ))}
    </div>
  );
}
