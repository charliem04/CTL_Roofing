import { client } from "@/client.config";
import { stagger } from "@/lib/motion";
import { Reveal } from "./Reveal";
import { RevealText } from "./RevealText";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { SeamMark } from "./SectionHead";
import { btn } from "./Button";
import { MoreLink } from "./MoreLink";

/**
 * The one band that gets the deep ground and the seam field behind it.
 * Metal is the highest-consideration product CTL sells, so it gets the
 * longest read: a formed panel, a spec table, and no photos of anything
 * else competing for attention.
 *
 * Shared by the home page and the roofing page, which is why the anchor
 * lives here — the home band’s "All roofing services" link lands on the
 * same #metal id further into the site. `moreHref` is what distinguishes
 * the two: on the roofing page there is nowhere further to send anyone.
 */
export function MetalSpec({ moreHref }: { moreHref?: string }) {
  const { metal } = client;
  return (
    <section
      id="metal"
      className="on-deep band seam-field relative overflow-hidden bg-surface-deep text-ink-invert-soft"
    >
      <div className="section relative grid items-center gap-[clamp(28px,5vw,72px)] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Reveal>
          <figure className="m-0">
            {/* No Parallax on this one any more. The frame is now a
                control a visitor drags, and a target that drifts under
                the finger while being dragged is a target that fights
                back. Depth is worth less here than the interaction. */}
            <BeforeAfterSlider
              className="aspect-[820/880] w-full rounded"
              before={{
                src: metal.image,
                alt: metal.imageAlt,
                width: 820,
                height: 880,
              }}
              after={{
                src: metal.imageAfter,
                alt: metal.imageAfterAlt,
                width: 1000,
                height: 1333,
              }}
            />
            <figcaption className="mt-2.5 text-[13px] text-ink-invert-soft/70">
              {metal.imageCaption}
            </figcaption>
          </figure>
        </Reveal>

        {/* The heading is not wrapped in the column's Reveal: a masked
            line rising inside a block that is itself rising reads as
            neither, so the mark and the lines carry the entrance and
            everything under them follows as one. */}
        <div>
          <SeamMark className="mb-4" />
          <RevealText
            as="h2"
            lines={metal.heading}
            delay={stagger.loose}
            className="text-display-2 text-ink-invert"
          />

          <Reveal delay={stagger.loose * 2}>
            <p className="my-6 max-w-[24ch] font-display text-display-4 font-bold uppercase text-accent">
              {metal.pull}
            </p>

          <div className="space-y-4">
            {metal.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>

          <dl className="mt-6 border-t border-line-dark/20">
            {metal.specs.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline gap-6 border-b border-line-dark/20 py-3.5"
              >
                <dt className="min-w-[11ch] shrink-0 font-mono text-[12px] font-medium uppercase tracking-[0.09em] text-accent">
                  {s.label}
                </dt>
                <dd className="m-0 text-base">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {/* Deliberately not client.bookingUrl: this band is the top of
                the metal conversation, not the bottom of it. Sending it to
                the contact form keeps the visitor on the site rather than
                handing them off to a third-party scheduler mid-read. */}
            <a href="/contact/" className={btn("gold")}>
              {metal.cta}
            </a>
            {moreHref && (
              <MoreLink href={moreHref} tone="deep">
                All roofing services
              </MoreLink>
            )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
