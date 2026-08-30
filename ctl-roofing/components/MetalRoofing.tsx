import { client } from "@/client.config";
import { Reveal } from "./Reveal";
import { SeamMark } from "./SectionHead";
import { btn } from "./Button";

/**
 * The one band that gets the deep ground and the seam field behind it.
 * Metal is the highest-consideration product CTL sells, so it gets the
 * page's longest read: a formed panel, a spec table, and no photos of
 * anything else competing for attention.
 */
export function MetalRoofing() {
  const { metal } = client;
  return (
    <section
      id="metal"
      className="on-deep band seam-field relative overflow-hidden bg-surface-deep text-ink-invert-soft"
    >
      <div className="section relative grid items-center gap-[clamp(28px,5vw,72px)] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Reveal>
          <figure className="m-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={metal.image}
              width={820}
              height={880}
              alt={metal.imageAlt}
              loading="lazy"
              className="w-full rounded"
            />
            <figcaption className="mt-2.5 text-[13px] text-ink-invert-soft/70">
              {metal.imageCaption}
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={0.08}>
          <SeamMark className="mb-4" />
          <h2 className="text-display-2 text-ink-invert">
            {metal.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

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

          <a href={client.bookingUrl || "#contact"} className={`mt-10 ${btn("gold")}`}>
            {metal.cta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
