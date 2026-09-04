"use client";

/**
 * A service page’s own work, four photographs of it, and the way
 * through to the rest.
 *
 * A service page argues that we can do the thing; this is the evidence
 * for the argument, which is why it sits on the page itself rather than
 * only in the gallery. The link out carries the real count — "all 13
 * roofing photos" is a reason to click, "view gallery" is furniture —
 * and lands on the gallery already filtered to this category.
 *
 * Photos, tile and lightbox all come from elsewhere, exactly as in the
 * home band. This component is only the framing.
 */
import { useCallback, useRef, useState } from "react";
import type { GalleryCategory } from "@/content/types";
import { getGalleryByCategory, getGalleryCategoryLabel } from "@/lib/content";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { MoreLink } from "./MoreLink";
import { GalleryTile, Lightbox } from "./Lightbox";

/** How many tiles the strip shows before it defers to the gallery. */
const SHOWN = 4;

export function WorkStrip({
  category,
  heading = "This work, on real jobs",
  ground = "bg-surface",
}: {
  category: GalleryCategory;
  heading?: string;
  /** Alternates against whatever section precedes it on the page. */
  ground?: "bg-surface" | "bg-surface-alt";
}) {
  const all = getGalleryByCategory(category);
  const shots = all.slice(0, SHOWN);
  const [at, setAt] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = (i: number) => {
    opener.current = document.activeElement as HTMLElement;
    setAt(i);
  };
  const close = useCallback(() => {
    setAt(null);
    opener.current?.focus();
  }, []);
  // Stepping wraps within the four on show, not the whole category —
  // the arrows stay inside what the visitor can actually see.
  const step = useCallback(
    (d: number) =>
      setAt((i) => (i === null ? i : (i + d + shots.length) % shots.length)),
    [shots.length]
  );

  // No photographs in this category yet: render nothing at all rather
  // than an empty grid or a heading with a hole under it.
  if (shots.length === 0) return null;

  const label = getGalleryCategoryLabel(category)?.toLowerCase() ?? "project";

  // A category with only two photographs in a four-up grid reads as two
  // missing tiles rather than as two photographs, so the row is only
  // ever as wide as there is work to put in it. Written out in full
  // because Tailwind reads these class names out of the source.
  const wide =
    shots.length >= 4
      ? "lg:grid-cols-4"
      : shots.length === 3
        ? "lg:grid-cols-3"
        : "sm:max-w-[640px] lg:grid-cols-2";

  return (
    <section className={`band ${ground}`}>
      <div className="section">
        <SectionHead heading={heading} />

        <Reveal delay={0.06}>
          <ul className={`mt-10 grid list-none grid-cols-2 gap-3 p-0 ${wide}`}>
            {shots.map((s, i) => (
              <li key={s.src}>
                <GalleryTile shot={s} onOpen={() => open(i)} />
              </li>
            ))}
          </ul>
        </Reveal>

        {/* When the strip is already showing the whole category there
            is no "more of this" to promise, so the link goes to the
            gallery entire rather than to a filter holding the same
            four photos over again. */}
        <p className="mt-10">
          {all.length > SHOWN ? (
            <MoreLink href={`/gallery/#${category}`}>
              All {all.length} {label} photos
            </MoreLink>
          ) : (
            <MoreLink href="/gallery/">The full gallery</MoreLink>
          )}
        </p>
      </div>

      <Lightbox shots={shots} at={at} onClose={close} onStep={step} />
    </section>
  );
}
