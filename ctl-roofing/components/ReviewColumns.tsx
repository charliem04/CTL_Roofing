import type { Review } from "@/content/types";

/**
 * Quoted reviews, packed into columns.
 *
 * Two layouts, because the two places these appear have opposite
 * problems.
 *
 * `columns` (the full list): CSS multi-column. Real reviews are wildly
 * uneven — one is two hundred words, the next is nine — and a grid would
 * give every row the height of its tallest card and leave craters under
 * the short ones. Columns just flow, and `break-inside-avoid` keeps a
 * quote from splitting across two of them.
 *
 * `grid` (the home band's three): a fixed three-up. Column balancing
 * needs more items than it has here — with three, one long review fills
 * a whole column, the other two stack beside it, and the third column
 * is left empty. A grid puts one in each.
 */
export function ReviewColumns({
  reviews,
  layout = "columns",
}: {
  reviews: Review[];
  layout?: "columns" | "grid";
}) {
  return (
    <ul
      className={
        layout === "grid"
          ? "mt-8 grid list-none items-start gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3"
          : "mt-8 list-none columns-1 gap-x-10 md:columns-2 lg:columns-3"
      }
    >
      {reviews.map((r) => (
        <li
          key={r.name}
          className={layout === "grid" ? "" : "mb-9 break-inside-avoid"}
        >
          <figure className="m-0">
            <blockquote className="m-0 text-ink">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <figcaption className="u-label mt-3.5">
              {r.name}
              {r.detail && ` · ${r.detail}`}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

/** "2026-08-31" → "August 2026". Deliberately not day-precise. */
export function capturedMonth(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
