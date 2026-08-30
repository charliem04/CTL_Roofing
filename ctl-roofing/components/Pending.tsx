import type { PendingContent } from "@/content/types";

/**
 * The honest placeholder.
 *
 * Where the client still owes us content, the page says so — what is
 * missing and who owes it — instead of filler, lorem, a stock photo or
 * an invented number. It is deliberately styled as unfinished: dashed
 * rule, no photo, no CTA. A visitor reading it learns nothing false.
 *
 * Every one of these is a line item on the go-live checklist. When the
 * content arrives, the panel is replaced by the real thing, not by a
 * quieter version of itself.
 */
export function Pending({
  content,
  className,
}: {
  content: PendingContent;
  className?: string;
}) {
  return (
    <div
      className={`rounded border border-dashed border-brand-soft/60 bg-surface-alt/60 p-6 ${
        className ?? ""
      }`}
    >
      <p className="u-label flex items-center gap-2">
        <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-accent-press" />
        Content pending
      </p>
      <p className="mt-3 max-w-[62ch] text-ink">{content.needs}</p>
      {content.from && (
        <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.09em] text-ink-faint">
          Waiting on {content.from}
        </p>
      )}
    </div>
  );
}
