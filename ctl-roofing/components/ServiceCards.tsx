import Link from "next/link";
import { getServices } from "@/lib/content";
import { Reveal } from "./Reveal";

/**
 * The service card grid, shared by the home band and the services hub
 * so the two can never describe the same five services differently.
 *
 * Cards sit on a 12-column field, alternating 7/5 and 5/7 so the row
 * break falls in a different place each time — a services board, not an
 * equal-weight tile grid. Commercial takes the full row, because it is
 * the one card addressed to a different reader.
 */
const spanClass = {
  wide: "md:col-span-7",
  narrow: "md:col-span-5",
  full: "md:col-span-12",
};

export function ServiceCards({ className,
  /**
   * The cards are h3 under a section heading on the home page, but on
   * the services hub they are the section's top-level content with no
   * h2 above them — h1 straight to h3 is a skipped level.
   */
  headingLevel = 3,
}: { className?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const services = getServices();

  return (
    <div className={`grid gap-6 md:grid-cols-12 ${className ?? ""}`}>
      {services.map((s) => {
        const columns = s.sections[0]?.columns ?? [];
        return (
          <Reveal key={s.slug} className={spanClass[s.span]}>
            <Link
              href={s.meta.path}
              className="group flex h-full flex-col overflow-hidden rounded border border-line bg-surface no-underline transition-colors duration-200 hover:border-brand-soft active:border-brand"
            >
              <figure className="m-0 bg-surface-deep-alt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.photo.src}
                  alt={s.photo.alt}
                  loading="lazy"
                  width={s.photo.width}
                  height={s.photo.height}
                  className={`w-full object-cover ${
                    s.span === "narrow" ? "h-[230px]" : "h-[280px]"
                  }`}
                />
              </figure>

              <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
                <Heading className="mb-4 text-display-3 transition-colors duration-200 group-hover:text-brand">
                  {s.navLabel}
                </Heading>

                <div
                  className={`grid gap-6 ${
                    columns.length > 1 ? "sm:grid-cols-2" : ""
                  }`}
                >
                  {columns.map((col, i) => (
                    <div key={col.label ?? i}>
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
                  {s.navLabel}
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
        );
      })}
    </div>
  );
}
