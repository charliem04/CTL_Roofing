"use client";

/**
 * The home page’s recent-work band: a curated handful, with the way
 * through to the full set. The photos, the tile and the lightbox all
 * come from elsewhere — this component is only the framing.
 */
import { useCallback, useRef, useState } from "react";
import { client } from "@/client.config";
import { getFeaturedGallery } from "@/lib/content";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { MoreLink } from "./MoreLink";
import { GalleryTile, Lightbox } from "./Lightbox";

export function Gallery() {
  const shots = getFeaturedGallery();
  const [at, setAt] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = (i: number) => {
    opener.current = document.activeElement as HTMLElement;
    setAt(i);
  };
  const close = useCallback(() => {
    setAt(null);
    opener.current?.focus();
  }, []);
  const step = useCallback(
    (d: number) =>
      setAt((i) => (i === null ? i : (i + d + shots.length) % shots.length)),
    [shots.length]
  );

  return (
    <section id="work" className="band bg-surface">
      <div className="section">
        <SectionHead
          heading={client.copy.galleryHeading}
          lede={client.copy.galleryLede}
        />

        <Reveal>
          <ul className="mt-10 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4">
            {shots.map((s, i) => (
              <li key={s.src}>
                <GalleryTile shot={s} onOpen={() => open(i)} />
              </li>
            ))}
          </ul>
        </Reveal>

        <p className="mt-10">
          <MoreLink href="/gallery/">The full gallery</MoreLink>
        </p>
      </div>

      <Lightbox shots={shots} at={at} onClose={close} onStep={step} />
    </section>
  );
}
