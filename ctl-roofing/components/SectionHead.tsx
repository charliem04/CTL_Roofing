import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/**
 * The three ascending ribs are the site’s one repeated mark: a standing
 * seam panel seen end-on, taken from the roof CTL builds rather than
 * from an icon set. It opens every band and appears nowhere else.
 */
export function SeamMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex h-[30px] items-end gap-[5px] ${className ?? ""}`}
    >
      <i className="block h-[14px] w-1 bg-accent" />
      <i className="block h-[22px] w-1 bg-accent" />
      <i className="block h-[30px] w-1 bg-accent" />
    </span>
  );
}

/** Seam mark, heading, and an optional lede — the opening of a band. */
export function SectionHead({
  heading,
  lede,
  className,
}: {
  heading: ReactNode;
  lede?: string;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <SeamMark className="mb-4" />
      <h2 className="text-display-2">{heading}</h2>
      {lede && <p className="mt-4 max-w-[58ch] text-lg">{lede}</p>}
    </Reveal>
  );
}
