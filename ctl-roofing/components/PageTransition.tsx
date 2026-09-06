"use client";

/**
 * The wipe between pages. Five deep panels lying across the screen,
 * sweeping off to the right one after the other, each with a gold seam
 * on its lower edge.
 *
 * The panels are the point: horizontal bands with a bright seam between
 * them are a standing seam roof going on, which is the thing this
 * company sells and the same mark the seam logo makes. A generic fade
 * would have cost the same and said nothing.
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
 * under a second; a visitor who clicks where one used to be should hit
 * the page, not an invisible sheet.
 * ────────────────────────────────────────────────────────────────────
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ease } from "@/lib/motion";
import { useStillness } from "@/lib/useScrollMotion";

/** Five, as in the reference. Enough to read as a sequence, few enough to stay quick. */
const PANELS = [0, 1, 2, 3, 4];

export function PageTransition() {
  const pathname = usePathname();
  const still = useStillness();
  /**
   * Counts navigations rather than tracking the path, so returning to a
   * page you have already been on still plays. Starts at 0 and the
   * first render is skipped, which is what keeps it off the initial
   * load.
   */
  const [run, setRun] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
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
      {PANELS.map((i) => (
        <motion.span
          // The run number is in the key so every navigation remounts
          // the panels and replays them from covering.
          key={`${run}-${i}`}
          className="absolute left-0 w-full origin-right border-b-[3px] border-accent bg-surface-deep"
          style={{ top: `${i * 20}%`, height: "20.2%" }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 0.5, delay: i * 0.07, ease: ease.out }}
        />
      ))}
    </div>
  );
}
