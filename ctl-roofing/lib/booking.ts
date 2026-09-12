/**
 * ════════════════════════════════════════════════════════════════════
 *  WHAT THE BOOKING IFRAME ASKS FOR, AND WHO IT TALKS TO
 *
 *  Two facts about the embed that both BookingEmbed and the preconnect
 *  on /contact/ need, kept in one place so they cannot disagree about
 *  which origins to warm or which URL is actually fetched — a
 *  preconnect to an origin the iframe never contacts is a wasted
 *  handshake, and one it contacts but we did not warm is the whole
 *  saving thrown away.
 * ════════════════════════════════════════════════════════════════════
 */
import { client } from "@/client.config";

/** Widened: client.config.ts is `as const`, so this is a literal type. */
const bookingUrl: string = client.bookingUrl;
const siteUrl: string = client.siteUrl;

/**
 * Every origin the booking iframe opens a connection to, in the order
 * it needs them.
 *
 * The scheduler's document origin is first and is the one that blocks:
 * nothing renders until that HTML arrives. But the document is a shell
 * — Calendly serves its JavaScript and CSS from assets.calendly.com,
 * and the browser cannot discover that origin until it has parsed the
 * HTML, so that handshake starts a full round trip late and stacks on
 * top of the first. Warming both overlaps them.
 *
 * The CDN entry is matched on the host rather than assumed for every
 * scheduler, because a wrong preconnect is a real cost — a DNS lookup
 * and a socket to somewhere nothing is ever fetched from. If the
 * scheduler changes, this is where its asset host goes.
 */
export function bookingOrigins(): string[] {
  if (!bookingUrl) return [];
  let origin: string;
  try {
    origin = new URL(bookingUrl).origin;
  } catch {
    // A relative or malformed URL is nothing to preconnect to. The
    // iframe still works; it just starts cold.
    return [];
  }
  return origin === "https://calendly.com"
    ? [origin, "https://assets.calendly.com"]
    : [origin];
}

/**
 * The URL the iframe actually loads.
 *
 * `embed_domain` and `embed_type` are the pair Calendly's own widget
 * script appends, and leaving them off is not neutral: without them
 * the request is for the standalone booking page — its own header,
 * footer, branding and cookie handling — rendered inside a 760px box
 * that has no room for any of it. With them Calendly serves the inline
 * embed view, which is the thing this band was always meant to show.
 *
 * The colours match the site so the calendar does not arrive as a
 * white rectangle with someone else's blue in it, and the GDPR banner
 * is hidden because this embed is already behind our own consent gate
 * — a second cookie prompt inside the first is not more consent.
 */
export function bookingEmbedSrc(): string {
  if (!bookingUrl) return "";

  const params = new URLSearchParams({
    hide_gdpr_banner: "1",
    background_color: "ffffff",
    text_color: "0b1233",
    primary_color: "2d3581",
    embed_type: "Inline",
  });

  try {
    params.set("embed_domain", new URL(siteUrl).hostname);
  } catch {
    // No usable siteUrl: send the rest. Calendly treats a missing
    // embed_domain as "unknown parent", not as an error.
  }

  return `${bookingUrl}${bookingUrl.includes("?") ? "&" : "?"}${params}`;
}
