import { IS_PREVIEW, REAL_SITE } from "@/lib/preview";

/**
 * Says what this site is, on every page, to whoever happens to be
 * looking at it.
 *
 * Deliberately not dismissible and not stored in localStorage. The
 * person it exists for is the stranger who found this by accident and
 * is about to ring the phone number on it believing it is CTL's site —
 * and that person is helped by a bar they cannot close, not by one they
 * click away in the first second.
 *
 * It renders nothing at all in a production build, so shipping this
 * component to the real domain is a no-op rather than an embarrassment.
 */
export function PreviewBanner() {
  if (!IS_PREVIEW) return null;

  return (
    <div className="border-b border-accent/40 bg-ink px-4 py-2.5 text-center text-ink-invert">
      <p className="mx-auto max-w-[80ch] text-[13px] leading-snug">
        <strong className="font-semibold text-accent">Preview.</strong>{" "}
        An unsolicited redesign proposed to CTL Pro Construction. This is not
        CTL&rsquo;s official website and the forms here do not reach anyone
        &mdash;{" "}
        <a
          href={REAL_SITE}
          className="font-semibold text-ink-invert underline underline-offset-2"
        >
          go to ctlpro.com
        </a>
        .
      </p>
    </div>
  );
}
