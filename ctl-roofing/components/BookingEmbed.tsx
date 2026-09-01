"use client";

/**
 * Calendly, embedded rather than linked — the plan’s point being that
 * bouncing someone to calendly.com mid-decision loses the ones who were
 * only half sure.
 *
 * It does not load on arrival. Calendly is a third party that sets its
 * own cookies, so the iframe goes in when the visitor asks for it —
 * either because they already accepted cookies, or because they pressed
 * the button on this panel, which is consent for this one embed and
 * nothing else. Anyone who would rather not can still use the direct
 * link, the phone, or the form below.
 */
import { useEffect, useState } from "react";
import { client } from "@/client.config";
import { getConsent, CONSENT_EVENT } from "@/lib/consent";
import { btn } from "./Button";

export function BookingEmbed() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!client.bookingUrl) return;
    const check = () => {
      if (getConsent() === "accepted") setLoaded(true);
    };
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, []);

  if (!client.bookingUrl) return null;

  if (!loaded) {
    return (
      <div className="rounded border border-dashed border-line bg-surface p-8 text-center">
        <p className="u-label">Booking calendar</p>
        <p className="mx-auto mt-3 max-w-[46ch]">
          The calendar is hosted by Calendly, which sets its own cookies.
          Load it here, or open it in a new tab — your choice.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button type="button" onClick={() => setLoaded(true)} className={btn("gold")}>
            Load the calendar
          </button>
          <a
            href={client.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={btn("line")}
          >
            Open Calendly instead
          </a>
        </div>
      </div>
    );
  }

  // An iframe rather than Calendly’s widget script: same booking flow,
  // no third-party JavaScript running in the page’s own context.
  const src = `${client.bookingUrl}${
    client.bookingUrl.includes("?") ? "&" : "?"
  }hide_gdpr_banner=1&background_color=ffffff&text_color=0b1233&primary_color=2d3581`;

  return (
    <iframe
      src={src}
      title={`Book a free assessment with ${client.businessName}`}
      loading="lazy"
      className="h-[760px] w-full rounded border border-line bg-surface md:h-[700px]"
    />
  );
}
