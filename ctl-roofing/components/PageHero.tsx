import type { Photo } from "@/content/types";
import { Breadcrumbs } from "./Breadcrumbs";
import { SeamMark } from "./SectionHead";

/**
 * Interior page opener. Deliberately shorter than the home hero and
 * without its own call to action — the home page’s job is to stop you,
 * an interior page’s job is to answer the question you arrived with.
 * The photo sits beside the words rather than under them, so the fold
 * still carries copy on a phone.
 */
export function PageHero({
  path,
  heading,
  lede,
  photo,
  crumbLabel,
}: {
  path: string;
  heading: string;
  lede: string;
  photo?: Photo;
  /** For a page the route registry cannot name — see trailFor(). */
  crumbLabel?: string;
}) {
  return (
    <section className="on-deep bg-surface-deep text-ink-invert-soft">
      <div className="section pb-12 pt-6 md:pb-16">
        <Breadcrumbs path={path} leafLabel={crumbLabel} />
        <div className="mt-8 grid items-end gap-8 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <SeamMark className="mb-4" />
            <h1 className="text-display-2 text-ink-invert">{heading}</h1>
            <p className="mt-4 max-w-[52ch] text-lg">{lede}</p>
          </div>
          {photo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              className="h-[220px] w-full rounded object-cover md:h-[280px]"
            />
          )}
        </div>
      </div>
    </section>
  );
}
