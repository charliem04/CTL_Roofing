import { client } from "@/client.config";
import { getClips, getVideoPage } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { MoreLink } from "@/components/MoreLink";

const page = getVideoPage();

export const metadata = pageMetadata(page.meta);

/** 104 → "1:44" */
function runtime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function VideoPage() {
  const clips = getClips();

  const jsonLd = clips.map((c) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: c.title,
    description: c.description,
    thumbnailUrl: `${client.siteUrl}${c.poster}`,
    contentUrl: `${client.siteUrl}${c.src}`,
    duration: `PT${Math.floor(c.duration / 60)}M${c.duration % 60}S`,
  }));

  return (
    <>
      {/*
        The hero photo is not the first clip's poster, which is what it
        used to be. That frame is 540x960 — a phone held upright — and
        the hero frame is a 1.4:1 landscape band, so object-cover threw
        away everything except a strip across the speaker's chest: no
        face, no roof, no job. It also carries a burned-in "MUSIC BY"
        credit along its bottom edge, which is fine on a video tile and
        looks like a mistake on a page header.

        This one is 1100x619, near enough the frame's own ratio to
        survive the crop intact, and it shows the page's subject rather
        than a still of it — a full crew mid tear-off. The poster still
        does its real job on the clip below.
      */}
      <PageHero
        path={page.meta.path}
        heading={page.heading}
        lede={page.lede}
        photo={{
          src: "/ctl/gallery/tearoff-crew-tarps.jpg",
          alt: "Crew on a roof mid tear-off with tarps spread over the landscaping below",
          width: 1100,
          height: 619,
        }}
      />

      <section className="band bg-surface">
        <div className="section">
          <ul className="grid list-none gap-12 p-0">
            {clips.map((c) => (
              <Reveal as="li" key={c.slug} className="grid gap-8 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:items-start">
                {/*
                  preload="none" matters more than it looks: this is a
                  10MB file, and nothing should download it because
                  somebody scrolled past. The poster carries the tile
                  until the visitor actually presses play.
                */}
                <video
                  controls
                  preload="none"
                  playsInline
                  poster={c.poster}
                  width={c.width}
                  height={c.height}
                  className="w-full rounded border border-line bg-surface-deep"
                >
                  <source src={c.src} type="video/mp4" />
                  Your browser can’t play this video.{" "}
                  <a href={c.src}>Download it instead</a>.
                </video>

                <div>
                  <p className="u-label">
                    Video · {runtime(c.duration)}
                  </p>
                  <h2 className="mt-2 text-display-2">{c.title}</h2>
                  <p className="mt-4 max-w-[58ch] text-lg">{c.description}</p>
                  <p className="mt-6">
                    <MoreLink href="/services/roofing/">
                      What a replacement involves
                    </MoreLink>
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.1}>
            <p className="mt-12 max-w-[62ch] border-t border-line pt-6">
              More footage goes up here as it is shot. In the meantime the{" "}
              <a
                href="/gallery/"
                className="border-b-2 border-accent text-ink no-underline transition-colors duration-150 hover:text-brand active:text-brand-strong"
              >
                photo gallery
              </a>{" "}
              has forty photographs in it.
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand cta={page.cta} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
