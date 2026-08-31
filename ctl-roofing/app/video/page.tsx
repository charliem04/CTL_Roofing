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
      <PageHero
        path={page.meta.path}
        heading={page.heading}
        lede={page.lede}
        photo={{
          src: clips[0].poster,
          alt: clips[0].description,
          width: clips[0].width,
          height: clips[0].height,
        }}
      />

      <section className="band bg-surface">
        <div className="section">
          <ul className="grid list-none gap-12 p-0">
            {clips.map((c) => (
              <Reveal key={c.slug}>
                <li className="grid gap-8 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:items-start">
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
                    Your browser can&apos;t play this video.{" "}
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
                </li>
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
              has forty jobs in it.
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
