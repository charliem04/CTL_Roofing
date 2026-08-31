import type { Photo } from "@/content/types";

/**
 * The two photographs side by side, labelled.
 *
 * Not a drag-slider. A slider looks clever in a demo and then costs a
 * visitor a deliberate interaction to see the thing they came for —
 * on a phone it competes with scrolling, and it shows half of each
 * photo at a time. Two frames next to each other are read in one
 * glance and print correctly, which is what an insurance adjuster or a
 * spouse being shown the page actually needs.
 *
 * Renders nothing unless both photos exist. A lone "after" belongs in
 * the gallery, not here.
 */
export function BeforeAfter({
  before,
  after,
}: {
  before?: Photo;
  after?: Photo;
}) {
  if (!before || !after) return null;

  const frames: [string, Photo][] = [
    ["Before", before],
    ["After", after],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {frames.map(([label, photo]) => (
        <figure key={label} className="m-0">
          <figcaption className="u-label mb-2.5">{label}</figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            className="aspect-[4/3] w-full rounded border border-line object-cover"
          />
        </figure>
      ))}
    </div>
  );
}
