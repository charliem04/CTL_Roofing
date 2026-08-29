import { client } from "@/client.config";
import { Reveal } from "./Reveal";
import { SeamMark } from "./SectionHead";
import { btn } from "./Button";

/**
 * "Committed to local" is the company's stated value and the line on
 * the logo, so it gets stated plainly and then evidenced: the crew, the
 * owner, and the sixteen towns actually worked.
 */
export function About() {
  const { about } = client;
  return (
    <section
      id="about"
      className="on-deep band bg-surface-deep text-ink-invert-soft"
    >
      <div className="section grid items-start gap-[clamp(28px,4.5vw,64px)] md:grid-cols-[1.25fr_0.75fr]">
        <Reveal>
          <SeamMark className="mb-4" />
          <h2 className="text-display-2 text-ink-invert">{about.heading}</h2>
          <p className="mt-4 max-w-[58ch] text-lg">{about.lede}</p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={about.photoPath}
            width={1200}
            height={800}
            alt={about.photoAlt}
            loading="lazy"
            className="mt-10 w-full rounded"
          />

          <ul className="mt-6 flex list-none flex-wrap gap-2 p-0">
            {about.towns.map((town) => (
              <li
                key={town}
                className="rounded border border-line-dark/20 px-2.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-invert-soft"
              >
                {town}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
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
    </section>
  );
}
