import { client } from "@/client.config";
import { cascade, stagger } from "@/lib/motion";
import { Reveal } from "./Reveal";
import { Parallax } from "./Parallax";
import { SectionHead } from "./SectionHead";
import { btn } from "./Button";
import { MoreLink } from "./MoreLink";

/**
 * "Committed to local" is the company’s stated value and the line on
 * the logo — and it is said in the hero and on the logo itself, which
 * is why this band no longer repeats it. It goes straight to the
 * evidence instead: the crew, the owner, and the sixteen towns actually
 * worked.
 *
 * Two columns that behave differently on the way past. The left one is
 * the evidence and it scrolls: photo, then towns. The right one is the
 * person making the claim, and on desktop he stays put while the
 * evidence goes by underneath.
 */
export function About() {
  const { about } = client;
  // The band's vertical padding sits on the GRID below, not on the
  // section as it does everywhere else on the site. A sticky child can
  // only travel inside its containing block, which is that grid's
  // padding box — so with the padding one level up, the 126px at the
  // bottom of this band was distance Robert was not allowed to use.
  // Moving it in buys that back. Visually identical either way: the
  // ground is painted by the section, and padding is padding.
  return (
    <section
      id="about"
      className="on-deep bg-surface-deep text-ink-invert-soft"
    >
      <div className="section band grid items-start gap-[clamp(28px,4.5vw,64px)] md:grid-cols-[1.25fr_0.75fr]">
        <div>
          {/* The band opening is the shared one now — mark, heading,
              lede — rather than this component's own copy of it. */}
          <SectionHead heading={about.heading} lede={about.lede} tone="deep" />

          <Reveal delay={stagger.loose * 3}>
            <Parallax className="mt-10 aspect-[1200/800] w-full rounded" distance={64}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={about.photoPath}
                width={1200}
                height={800}
                alt={about.photoAlt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </Parallax>
          </Reveal>

          <Reveal delay={stagger.loose * 3.5}>
            <p className="mt-6">
              <MoreLink href="/areas/" tone="deep">Every town we serve</MoreLink>
            </p>
          </Reveal>
          {/* Sixteen towns, arriving in reading order. The cascade is
              capped inside `cascade()`, so the last chip does not land
              a full second after the first. */}
          <ul className="mt-6 flex list-none flex-wrap gap-2 p-0">
            {about.towns.map((town, i) => (
              <Reveal
                as="li"
                key={town}
                variant="riseSm"
                delay={cascade(i)}
                className="rounded border border-line-dark/20 px-2.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-invert-soft"
              >
                {town}
              </Reveal>
            ))}
          </ul>
        </div>

        {/* Robert rides down the side of the band on desktop while the
            crew photo and the sixteen towns scroll past him.

            The sticky lives on this wrapper, not on the Reveal inside
            it: framer leaves a transform on the element it animates, and
            an element that is both the sticky one and a transformed one
            is a fight not worth having. This div is a plain grid item
            that does nothing but hold the position.

            top-24 clears the sticky header, which is 78px at this width.
            Below md the band is a single column and there is nothing to
            track alongside, so the whole thing is md-and-up. */}
        <div className="md:sticky md:top-24 md:self-start">
        <Reveal delay={stagger.loose}>
          <figure className="m-0 grid grid-cols-[130px_1fr] items-center gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={about.owner.photoPath}
              width={560}
              height={700}
              alt={about.owner.photoAlt}
              loading="lazy"
              className="h-[150px] w-[130px] rounded object-cover object-[50%_22%]"
            />
            <figcaption>
              <h3 className="mb-1 text-display-3 text-ink-invert">{about.owner.name}</h3>
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.09em] text-accent">
                {about.owner.role}
              </p>
            </figcaption>
          </figure>

          <div className="mt-6 space-y-4 text-base">
            {about.owner.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>

          <p className="mt-6">
            <MoreLink href="/team/" tone="deep">Meet the crew</MoreLink>
          </p>
          {client.socials.google && (
            <a
              href={client.socials.google}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 ${btn("lineDeep")}`}
            >
              Read our Google reviews
            </a>
          )}
        </Reveal>
        </div>
      </div>
    </section>
  );
}
