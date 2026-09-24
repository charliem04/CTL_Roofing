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
/**
 * ── THE SCHEDULER TABLE — edit this to change scheduler ─────────────
 *
 * Keyed by the scheduler's document origin, which is derived from
 * client.bookingUrl rather than configured twice.
 *
 * `assets` is the origin the embed fetches its JavaScript and CSS from,
 * when that differs from the document origin. It is matched on the host
 * rather than assumed for every scheduler, because a wrong preconnect
 * is a real cost — a DNS lookup and a socket to somewhere nothing is
 * ever fetched from.
 *
 * `params` are appended to the iframe src. For Calendly, `embed_domain`
 * and `embed_type` are the pair its own widget script appends, and
 * leaving them off is not neutral: without them the request is for the
 * standalone booking page — its own header, footer, branding and cookie
 * handling — rendered inside a 760px box that has no room for any of
 * it. Another scheduler will want a different set, or none.
 *
 * A scheduler that is not in this table still works: the iframe loads
 * the bare URL and the origin is preconnected. The table only adds what
 * a specific provider needs.
 *
 * Whatever you put here, the origins must also appear in INTEGRATIONS
 * in scripts/csp.mjs — `frame` for the document origin, `preconnectOnly`
 * for the asset host. The CSP drift check fails the build otherwise,
 * which is the intended way to find out.
 */
const SCHEDULERS: Record<
  string,
  { assets?: string; params?: Record<string, string> }
> = {
  "https://calendly.com": {
    assets: "https://assets.calendly.com",
    params: {
      // This embed is already behind the site's own consent gate; a
      // second cookie prompt inside the first is not more consent.
      hide_gdpr_banner: "1",
      embed_type: "Inline",
      // TODO(client): match the brand tokens in app/globals.css so the
      // calendar does not arrive as a white rectangle with someone
      // else's blue in it. Hex, no leading #.
      background_color: "ffffff",
      text_color: "111111",
      primary_color: "333333",
    },
  },
};

/** Every origin the booking iframe opens a connection to, in order. */
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
  const assets = SCHEDULERS[origin]?.assets;
  return assets ? [origin, assets] : [origin];
}

/**
 * The URL the iframe actually loads: client.bookingUrl plus whatever
 * the scheduler table says that provider needs.
 */
export function bookingEmbedSrc(): string {
  if (!bookingUrl) return "";

  let origin = "";
  try {
    origin = new URL(bookingUrl).origin;
  } catch {
    // Not a URL we can reason about — send it through untouched.
    return bookingUrl;
  }

  const spec = SCHEDULERS[origin];
  if (!spec?.params) return bookingUrl;

  const params = new URLSearchParams(spec.params);

  // Only meaningful to providers that take it; harmless to the rest.
  if ("embed_type" in spec.params) {
    try {
      params.set("embed_domain", new URL(siteUrl).hostname);
    } catch {
      // No usable siteUrl: send the rest. Calendly treats a missing
      // embed_domain as "unknown parent", not as an error.
    }
  }

  return `${bookingUrl}${bookingUrl.includes("?") ? "&" : "?"}${params}`;
}
