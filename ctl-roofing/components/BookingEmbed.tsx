"use client";

/**
 * ════════════════════════════════════════════════════════════════════
 *  CALENDLY, embedded rather than linked — the plan's point being that
 *  bouncing someone to calendly.com mid-decision loses the ones who
 *  were only half sure.
 *
 *  It does not load on arrival. Calendly is a third party that sets its
 *  own cookies, so the iframe goes in when the visitor asks for it —
 *  either because they already accepted cookies, or because they
 *  pressed the button on this panel, which is consent for this one
 *  embed and nothing else. Anyone who would rather not can still use
 *  the direct link, the phone, or the form below.
 *
 *  ── WHY IT USED TO FEEL SLOW, AND WHAT CHANGED ──────────────────────
 *
 *  The iframe carried `loading="lazy"`, which sounds like the right
 *  answer and was the wrong one here. The booking band sits well down
 *  /contact/, so for a visitor who had already accepted cookies the
 *  browser deferred the whole embed until they had very nearly scrolled
 *  to it — and then started a DNS lookup, a TCP handshake, a TLS
 *  negotiation and a document fetch, all while they sat looking at the
 *  empty box. The lazy attribute did not make the calendar slow to
 *  load; it made it start loading at the last possible moment, which
 *  the visitor experiences as the same thing.
 *
 *  So the work is moved earlier rather than made smaller, in two steps:
 *
 *    1. As soon as the embed is allowed, open the connection to
 *       calendly.com. DNS, TCP and TLS are the fixed cost of talking to
 *       a new origin, and none of it needs to wait for a scroll.
 *    2. About a third of a screen out, mount the iframe and let it
 *       fetch over the connection that is already warm.
 *
 *  A visitor who has not allowed it gets neither, until they reach for
 *  the button — a pointer arriving on it opens the connection, so the
 *  handshake is usually finished by the time the click lands.
 *
 *  ── AND WHY THE PRECONNECT IS NOT IN THE HEAD ───────────────────────
 *
 *  A <link rel="preconnect"> in the document head would be simpler and
 *  faster still, and it would open a connection to a third party for
 *  every visitor who ever lands on this page — including the ones who
 *  decline cookies and the ones who never scroll this far. That
 *  contradicts the rest of the page's posture, so it is not done. Every
 *  path to warmCalendly() runs behind either consent or a deliberate
 *  reach for the button.
 * ════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { client } from "@/client.config";
import { getConsent, CONSENT_EVENT } from "@/lib/consent";
import { btn } from "./Button";

/** Close enough that the visitor means to use it. */
const MOUNT_MARGIN = "300px";

/**
 * Open a connection to Calendly without asking it for anything yet.
 *
 * Idempotent: the browser is happy to be told twice, but a second
 * <link> is litter in the head and this can be reached from a hover, a
 * focus and an observer within the same second.
 */
function warmCalendly() {
  if (typeof document === "undefined") return;
  if (document.head.querySelector('link[data-calendly-warm]')) return;

  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = "https://calendly.com";
  // The iframe document is fetched as a cross-origin navigation, so the
  // connection has to be opened in anonymous mode to be the one reused.
  link.crossOrigin = "anonymous";
  link.setAttribute("data-calendly-warm", "");
  document.head.appendChild(link);
}

export function BookingEmbed() {
  /** The visitor has allowed this embed — by cookie consent or by button. */
  const [allowed, setAllowed] = useState(false);
  /** Scrolled close enough to mount the iframe. */
  const [near, setNear] = useState(false);
  /** Calendly has actually painted, so the skeleton can go. */
  const [ready, setReady] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!client.bookingUrl) return;
    const check = () => {
      if (getConsent() === "accepted") setAllowed(true);
    };
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  /* ── Warm the connection the moment the embed is allowed ─────────
     Consent is the gate, so once it exists there is nothing left to
     wait for: opening the socket early is the entire saving, and the
     visitor on /contact/ with the calendar allowed is going to use it.

     This was an observer on a 900px root margin, which was measured
     and thrown away — the booking band sits about 360px below the fold
     on a 900px viewport, so a margin that size fired on page load
     anyway while reading as though it waited for something. Doing it
     plainly is the same behaviour with none of the pretence, and it
     leaves the whole scroll distance between the handshake and the
     fetch instead of an arbitrary 600px of it.

     It is inside the `allowed` gate and must stay there. Warming
     unconditionally would open a connection to a third party for a
     visitor who has just declined cookies, which is the one thing this
     component exists to avoid. Somebody who has not decided gets a
     connection only if they reach for the button. */
  useEffect(() => {
    if (allowed) warmCalendly();
  }, [allowed]);

  /* ── Mount on approach ───────────────────────────────────────────
     Disconnects on the first hit; the answer cannot change back. */
  useEffect(() => {
    if (!client.bookingUrl) return;
    const el = boxRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // No observer: mount on arrival rather than never. The embed is
      // still behind the consent gate, which is the part that matters.
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: MOUNT_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
    // Re-observes when the gate opens, because the element the ref
    // points at is a different one on each side of it.
  }, [allowed]);

  if (!client.bookingUrl) return null;

  if (!allowed) {
    return (
      <div
        ref={boxRef}
        className="rounded border border-dashed border-line bg-surface p-8 text-center"
      >
        <p className="u-label">Booking calendar</p>
        <p className="mx-auto mt-3 max-w-[46ch]">
          The calendar is hosted by Calendly, which sets its own cookies. Load
          it here, or open it in a new tab — your choice.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={() => setAllowed(true)}
            // The pointer arriving on the button is the earliest honest
            // signal there is. By the time the click lands the
            // handshake is usually done, so the iframe's first request
            // goes out on an open connection.
            onPointerEnter={warmCalendly}
            onFocus={warmCalendly}
            className={btn("gold")}
          >
            Load the calendar
          </button>
          <a
            href={client.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerEnter={warmCalendly}
            className={btn("line")}
          >
            Open Calendly instead
          </a>
        </div>
      </div>
    );
  }

  // An iframe rather than Calendly's widget script: same booking flow,
  // no third-party JavaScript running in the page's own context.
  const src = `${client.bookingUrl}${
    client.bookingUrl.includes("?") ? "&" : "?"
  }hide_gdpr_banner=1&background_color=ffffff&text_color=0b1233&primary_color=2d3581`;

  return (
    <div
      ref={boxRef}
      className="relative h-[760px] w-full overflow-hidden rounded border border-line bg-surface md:h-[700px]"
    >
      {/* The box is drawn at full size before anything arrives in it, so
          the band never changes height and nothing below it moves when
          Calendly paints. The caption is there because an empty bordered
          rectangle reads as something that failed rather than as
          something in progress. */}
      {!ready && (
        <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-mono text-[11px] uppercase tracking-[0.09em] text-ink-faint">
          Loading the booking calendar…
        </p>
      )}

      {near && (
        <iframe
          src={src}
          title={`Book a free assessment with ${client.businessName}`}
          // Deliberately NOT lazy. Reaching this line already means the
          // visitor allowed the embed and is within a third of a screen
          // of it; deferring again is the behaviour this component was
          // rewritten to remove.
          loading="eager"
          onLoad={() => setReady(true)}
          className={`absolute inset-0 h-full w-full transition-opacity duration-200 ease-out ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
