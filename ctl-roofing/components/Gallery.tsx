"use client";

/**
 * Recent work, with a lightbox for the full frame. The dialog traps
 * focus in its three controls, restores focus to the tile that opened
 * it, and answers Escape and the arrow keys — a photo grid is not a
 * reason to drop keyboard access.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { client } from "@/client.config";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { MoreLink } from "./MoreLink";

export function Gallery() {
  const shots = client.gallery;
  const [at, setAt] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const open = (i: number) => {
    opener.current = document.activeElement as HTMLElement;
    setAt(i);
  };

  const close = useCallback(() => {
    setAt(null);
    opener.current?.focus();
  }, []);

  const step = useCallback(
    (delta: number) => setAt((i) => (i === null ? i : (i + delta + shots.length) % shots.length)),
    [shots.length]
  );

  useEffect(() => {
    if (at === null) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "Tab") {
        const ring = [closeRef.current, prevRef.current, nextRef.current].filter(
          (el): el is HTMLButtonElement => Boolean(el)
        );
        const i = ring.indexOf(document.activeElement as HTMLButtonElement);
        e.preventDefault();
        ring[(i + (e.shiftKey ? -1 : 1) + ring.length) % ring.length]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [at, close, step]);

  const shot = at === null ? null : shots[at];

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
                <button
                  type="button"
                  onClick={() => open(i)}
                  aria-label={`Open photo: ${s.caption}`}
                  className="group relative block w-full overflow-hidden rounded border border-line bg-surface-alt p-0 transition-colors duration-200 hover:border-brand active:border-brand-strong"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.src}
                    alt={s.alt}
                    loading="lazy"
                    width={680}
                    height={510}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-deep/90 to-transparent px-3 pb-2.5 pt-6 text-left font-mono text-[11px] uppercase tracking-[0.07em] text-ink-invert group-hover:text-accent">
                    {s.caption}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Reveal>

        <p className="mt-10">
          <MoreLink href="/gallery/">The full gallery</MoreLink>
        </p>
      </div>

      {shot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Project photo: ${shot.caption}`}
          className="on-deep fixed inset-0 z-50 flex items-center justify-center bg-surface-deep/95 p-[clamp(14px,4vw,48px)]"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <figure className="m-0 w-full max-w-[1000px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.src}
              alt={shot.alt}
              className="max-h-[78vh] w-full rounded object-contain"
            />
            <figcaption className="mt-4 flex justify-between gap-4 font-mono text-[12px] uppercase tracking-[0.07em] text-ink-invert-soft">
              <span>{shot.caption}</span>
              <span>
                {(at ?? 0) + 1} / {shots.length}
              </span>
            </figcaption>
          </figure>

          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="absolute right-6 top-6 rounded border border-line-dark/20 px-3.5 py-2.5 font-semibold text-ink-invert transition-colors duration-150 hover:border-accent hover:text-accent active:translate-y-px"
          >
            Close
          </button>
          <div className="absolute bottom-6 right-6 flex gap-2">
            <button
              ref={prevRef}
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="rounded border border-line-dark/20 px-4 py-2.5 font-semibold text-ink-invert transition-colors duration-150 hover:border-accent hover:text-accent active:translate-y-px"
            >
              ←
            </button>
            <button
              ref={nextRef}
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="rounded border border-line-dark/20 px-4 py-2.5 font-semibold text-ink-invert transition-colors duration-150 hover:border-accent hover:text-accent active:translate-y-px"
            >
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
