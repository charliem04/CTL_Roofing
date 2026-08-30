import Link from "next/link";
import { getServices } from "@/lib/content";
import { SectionHead } from "./SectionHead";
import { Reveal } from "./Reveal";

/**
 * The way sideways. Someone who lands on a service page from search is
 * often one door away from what they actually needed — the roof is the
 * emergency, but the siding was the reason they were looking. Ruled
 * entries, not a second set of photo cards, so this never competes with
 * the page it sits under.
 */
export function OtherServices({ currentSlug }: { currentSlug: string }) {
  const others = getServices().filter((s) => s.slug !== currentSlug);
  if (others.length === 0) return null;

  return (
    <section className="band bg-surface-alt">
      <div className="section">
        <SectionHead heading="Also from CTL" />
        <ul className="mt-10 list-none border-t border-line p-0">
          {others.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.05}>
              <li>
                <Link
                  href={s.meta.path}
                  className="group grid gap-2 border-b border-line py-6 no-underline transition-colors duration-200 hover:bg-surface active:bg-line/40 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-8"
                >
                  <h3 className="flex items-center gap-3 text-display-3 text-ink transition-colors duration-200 group-hover:text-brand">
                    {s.navLabel}
                    <span
                      aria-hidden
                      className="text-base text-brand-soft transition-transform duration-150 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </h3>
                  <p className="text-base sm:pt-1">{s.summary}</p>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
