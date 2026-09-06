"use client";

/**
 * Two photographs in one frame, revealed against each other by a
 * draggable divider.
 *
 * ── WHY THIS EXISTS BESIDE BeforeAfter, NOT INSTEAD OF IT ───────────
 * components/BeforeAfter.tsx argues, at length and correctly, against
 * exactly this control: a slider shows half of each photograph at a
 * time and charges a deliberate interaction for the rest. That
 * reasoning holds for storm-damage case studies, where an adjuster or a
 * spouse needs both states legible in one glance, and it is why the
 * case study pages are untouched.
 *
 * It does not hold here. This pair is not damage and repair — it is
 * copper before and after the shop forms it, and the point is the
 * transformation rather than the two end states. A divider you push
 * across is the control that shows flat stock becoming a folded hip.
 *
 * Worth being straight about the limit: the two frames are not
 * registered. They are the same material in the same shop at two
 * stages, not one locked-off camera position photographed twice, so the
 * wipe reads as "here is the next stage" rather than as a seamless
 * morph. That is honest for what this band claims — we form our own
 * metal — and it is the reason the labels are always on screen instead
 * of relying on the seam to explain itself.
 * ────────────────────────────────────────────────────────────────────
 *
 * ── THE OBJECTIONS THAT DO SURVIVE, AND WHAT ANSWERS THEM ───────────
 * A horizontal drag on a phone competes with a vertical scroll, and a
 * bespoke drag handle is invisible to a keyboard.
 *
 * Both are answered by making the control a real <input type="range">
 * stretched over the frame at zero opacity, rather than hand-written
 * pointer maths. It is draggable by mouse and finger, focusable, and
 * already understood by every screen reader and every keyboard —
 * arrows nudge, Home and End slam to either end, at no cost.
 *
 * `touch-action: pan-y` is what keeps the phone honest: a horizontal
 * drag moves the divider, and a vertical one scrolls the page straight
 * past it, because the browser resolves that gesture conflict itself
 * and does it better than we would.
 * ────────────────────────────────────────────────────────────────────
 *
 * With no JavaScript the divider sits where it was rendered and both
 * photographs are half visible, which still reads as a comparison.
 * Nothing here is required to understand the band.
 */
import { useState } from "react";
import type { Photo } from "@/content/types";

export function BeforeAfterSlider({
  before,
  after,
  className,
  /** Where the divider starts, as a percentage from the left. */
  start = 50,
}: {
  before: Photo;
  after: Photo;
  className?: string;
  start?: number;
}) {
  const [pos, setPos] = useState(start);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {/* The "before" is the ground; the "after" is clipped over it, so
          the divider position is a single inset on one element and the
          two never disagree about where the seam is. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={before.src}
        alt={before.alt}
        width={before.width}
        height={before.height}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={after.src}
        alt={after.alt}
        width={after.width}
        height={after.height}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      />

      <span className="u-label absolute left-3 top-3 rounded bg-surface-deep/70 px-2 py-1 text-ink-invert">
        Before
      </span>
      <span className="u-label absolute right-3 top-3 rounded bg-surface-deep/70 px-2 py-1 text-ink-invert">
        After
      </span>

      {/* The seam, and a grip on it. Decorative — the range input below
          is the actual control — so it never swallows a pointer. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-[2px] bg-accent"
        style={{ left: `calc(${pos}% - 1px)` }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent font-mono text-[13px] font-semibold text-ink">
          ⇔
        </span>
      </span>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Reveal the formed copper. Drag, or use the arrow keys."
        // Zero opacity rather than sr-only: it has to stay the size of
        // the frame to be draggable across it.
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        style={{ touchAction: "pan-y" }}
      />
    </div>
  );
}
