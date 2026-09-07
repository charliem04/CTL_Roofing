import Link from "next/link";
import type { Photo, ServiceSection } from "@/content/types";
import { getServices, getStorm } from "@/lib/content";
import { cascade } from "@/lib/motion";
import { Reveal } from "./Reveal";

/**
 * The service card grid, shared by the home band and the services hub
 * so the two can never describe the same work differently.
 *
 * Cards sit on a 12-column field, alternating 7/5 and 5/7 so the row
 * break falls in a different place each time — a services board, not an
 * equal-weight tile grid.
 *
 * Storm damage rides along at the end. It is not a /services/ child
 * page — it has its own top-level page, and adding it to the services
 * array would generate a duplicate one — so it is appended here as a
 * card built from the storm content instead.
 */
const spanClass = {
  wide: "md:col-span-7",
  narrow: "md:col-span-5",
  full: "md:col-span-12",
};

type CardData = {
  key: string;
  href: string;
  label: string;
  span: keyof typeof spanClass;
  photo: Photo;
  columns: NonNullable<ServiceSection["columns"]>;
};

export function ServiceCards({
  className,
  /**
   * The cards are h3 under a section heading on the home page, but on
   * the services hub they are the section’s top-level content with no
   * h2 above them — h1 straight to h3 is a skipped level.
   */
  headingLevel = 3,
}: {
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const storm = getStorm();

  // Commercial and storm damage close the board as a 7/5 pair: the one
  // card addressed to a different reader, beside the one addressed to
  // somebody who is having a bad week.
  const cards: CardData[] = [
    ...getServices().map((s) => ({
      key: s.slug,
      href: s.meta.path,
      label: s.navLabel,
      span: s.span,
      photo: s.photo,
      columns: s.sections[0]?.columns ?? [],
    })),
    {
      key: "storm-damage",
      href: storm.meta.path,
      label: storm.card.label,
      span: "narrow",
      photo: storm.photo,
      columns: storm.card.columns,
    },
  ];

  return (
    <div className={`grid gap-6 md:grid-cols-12 ${className ?? ""}`}>
      {cards.map((c, i) => (
        // Cards arrive in board order rather than as one block, so the
        // alternating 7/5 rhythm is something you watch being dealt
        // out instead of something you have to notice afterwards.
        <Reveal key={c.key} className={spanClass[c.span]} delay={cascade(i)}>
          <Link
            href={c.href}
            className="group flex h-full flex-col overflow-hidden rounded border border-line bg-surface no-underline transition-colors duration-200 hover:border-brand-soft active:border-brand"
          >
            <figure className="m-0 bg-surface-deep-alt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.photo.src}
                alt={c.photo.alt}
                loading="lazy"
                width={c.photo.width}
                height={c.photo.height}
                className={`w-full object-cover ${
                  c.span === "narrow" ? "h-[230px]" : "h-[280px]"
                }`}
              />
            </figure>

            <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
              <Heading className="mb-4 text-display-3 transition-colors duration-200 group-hover:text-brand">
                {c.label}
              </Heading>

              <div
                className={`grid gap-6 ${
                  c.columns.length > 1 ? "sm:grid-cols-2" : ""
                }`}
              >
                {c.columns.map((col, j) => (
                  <div key={col.label ?? j}>
                    {col.label && <p className="u-label mb-2.5">{col.label}</p>}
                    <ul className="ticks m-0 list-none space-y-2 p-0">
                      {col.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <span className="mt-6 inline-flex items-center gap-2 font-semibold text-brand">
                {c.label}
                <span
                  aria-hidden
                  className="transition-transform duration-150 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
