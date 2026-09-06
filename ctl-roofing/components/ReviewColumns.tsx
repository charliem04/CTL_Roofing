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
 * `grid` (a fixed three-up): column balancing needs more items than it
 * has there — with three, one long review fills a whole column, the
 * other two stack beside it, and the third column is left empty. A grid
 * puts one in each.
 *
 * `feature` (the home band’s two): the same quotes given a boxed ground
 * so the proof band carries weight against the photography either side
 * of it. A gold rule down the leading edge rather than a gold fill —
 * the palette reserves that fill for buttons, and body copy has no
 * business sitting on it (see the token notes in globals.css).
 */
export function ReviewColumns({
  reviews,
  layout = "columns",
}: {
  reviews: Review[];
  layout?: "columns" | "grid" | "feature";
}) {
  const list = {
    grid: "mt-8 grid list-none items-start gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3",
    feature: "mt-10 grid list-none items-stretch gap-5 p-0 md:grid-cols-2",
    columns: "mt-8 list-none columns-1 gap-x-10 md:columns-2 lg:columns-3",
  }[layout];

  const item = {
    grid: "",
    // items-stretch above plus h-full here means two quotes of unequal
    // length still box to the same depth, which is the whole point of
    // choosing a matched pair to sit in them.
    feature: "h-full rounded border-l-[3px] border-accent bg-surface-alt p-7 sm:p-8",
    columns: "mb-9 break-inside-avoid",
  }[layout];

  return (
    <ul className={list}>
      {reviews.map((r) => (
        <li key={r.name} className={item}>
          <figure className="m-0">
            <blockquote
              className={
                layout === "feature"
                  ? "m-0 text-[17px] leading-[1.6] text-ink"
                  : "m-0 text-ink"
              }
            >
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
