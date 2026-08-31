import { client } from "@/client.config";
import { getTeamPage } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import { PageHero } from "@/components/PageHero";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { MoreLink } from "@/components/MoreLink";

const page = getTeamPage();

export const metadata = pageMetadata(page.meta);

export default function TeamPage() {
  const { owner } = client.about;

  return (
    <>
      <PageHero
        path={page.meta.path}
        heading={page.heading}
        lede={page.lede}
        photo={page.photo}
      />

      {/* ── The owner — the one person we can name ─────────────────── */}
      <section className="band bg-surface">
        <div className="section grid gap-10 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] md:items-start">
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={owner.photoPath}
              alt={owner.photoAlt}
              width={560}
              height={700}
              className="w-full rounded object-cover"
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="u-label">{owner.role}</p>
            <h2 className="mt-2 text-display-2">{owner.name}</h2>
            <div className="mt-5 max-w-[58ch] space-y-4 text-lg">
              {owner.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            {client.socials.google && (
              <p className="mt-6">
                <MoreLink href={client.socials.google}>
                  What customers say on Google
                </MoreLink>
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── The crew ───────────────────────────────────────────────── */}
      <section className="band bg-surface-alt">
        <div className="section">
          <SectionHead heading="The crew" lede={page.crewNote} />
          <ul className="mt-10 grid list-none grid-cols-2 gap-x-3 gap-y-6 p-0 sm:grid-cols-3 lg:grid-cols-4">
            {page.crew.map((person, i) => (
              <Reveal key={person.photo} delay={Math.min(i, 6) * 0.04}>
                <li>
                  <figure className="m-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={person.photo}
                      alt={`${person.name} of CTL Pro Construction`}
                      width={560}
                      height={700}
                      loading="lazy"
                      className="aspect-[4/5] w-full rounded border border-line object-cover"
                    />
                    {/* Name only. We were sent faces and names, not job
                        titles, and a guessed title under a real face is
                        worse than no title at all. */}
                    <figcaption className="mt-2.5 font-display text-[17px] font-bold uppercase leading-tight text-ink">
                      {person.name}
                    </figcaption>
                  </figure>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Real photographs of the actual team ────────────────────── */}
      <section className="band bg-surface">
        <div className="section">
          <SectionHead heading="Where the work gets run" />
          <ul className="mt-10 grid list-none gap-6 p-0 md:grid-cols-2">
            {page.gallery.map((shot) => (
              <Reveal key={shot.src}>
                <li>
                  <figure className="m-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shot.src}
                      alt={shot.alt}
                      width={shot.width}
                      height={shot.height}
                      loading="lazy"
                      className="h-[320px] w-full rounded object-cover"
                    />
                    <figcaption className="u-label mt-2.5">
                      {shot.caption}
                    </figcaption>
                  </figure>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How the crew is organised ──────────────────────────────── */}
      <section className="band bg-surface-alt">
        <div className="section">
          <SectionHead heading="How a CTL job is staffed" />
          <dl className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
            {page.values.map((v) => (
              <div key={v.title} className="bg-surface p-6">
                <dt className="font-display text-[19px] font-bold uppercase text-ink">
                  {v.title}
                </dt>
                <dd className="m-0 mt-2.5 text-[15px]">{v.body}</dd>
              </div>
            ))}
          </dl>

          <Reveal delay={0.1}>
            <p className="mt-10">
              <MoreLink href="/areas/">Where this crew works</MoreLink>
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand cta={page.cta} />
    </>
  );
}
