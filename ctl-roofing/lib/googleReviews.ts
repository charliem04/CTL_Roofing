/**
 * ════════════════════════════════════════════════════════════════════
 *  GOOGLE REVIEWS — fetched live, in the visitor's browser, every view.
 *
 *  Why it works this way, because it looks like the slow option:
 *
 *  Google's Places policy forbids pre-fetching, caching or storing
 *  Places content. `place_id` is the documented exception and may be
 *  stored indefinitely; coordinates may be held 30 days; review text,
 *  ratings, author names and photos may not be held at all. Baking
 *  reviews into the HTML at build time — which is what a static export
 *  invites you to do — is exactly the storage the policy prohibits, and
 *  it would also freeze the rating at whatever it was the day we built.
 *  So the request happens client-side, per view, and nothing is written
 *  down anywhere.
 *
 *  The API also returns at most FIVE reviews. That is a hard ceiling,
 *  not a page size — there is no cursor, and asking again does not get
 *  you a sixth. The page is designed around five.
 *
 *  Attribution is not optional. Google requires that each review is
 *  shown with its author's name, their photo where one is supplied, and
 *  a link back to the review on Google. The component renders all three
 *  and must keep doing so.
 *
 *  Docs: https://developers.google.com/maps/documentation/places/web-service/policies
 * ════════════════════════════════════════════════════════════════════
 */

/** A review exactly as Google hands it over. Nothing added, nothing stored. */
export type GoogleReview = {
  id: string;
  rating: number;
  /** Google's own phrasing, e.g. "3 months ago" — not a date we compute. */
  age: string;
  text: string;
  authorName: string;
  authorPhoto?: string;
  /** The author's Google Maps contributor page. */
  authorUri?: string;
  /** This review on Google. Required by the attribution rules. */
  uri?: string;
};

export type GooglePlace = {
  rating: number;
  total: number;
  mapsUri: string;
  reviews: GoogleReview[];
};

const KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY ?? "";
const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID ?? "";

/**
 * Is the feed wired up? Both halves are needed, and neither has a
 * sensible default — a wrong place ID would show another business's
 * reviews under CTL's name, which is worse than showing none.
 */
export function googleFeedConfigured(): boolean {
  return KEY.length > 0 && PLACE_ID.length > 0;
}

/** Everything the API is asked for. Fewer fields, smaller bill. */
const FIELD_MASK = [
  "rating",
  "userRatingCount",
  "googleMapsUri",
  "reviews",
].join(",");

type ApiReview = {
  name?: string;
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: {
    displayName?: string;
    uri?: string;
    photoUri?: string;
  };
  googleMapsUri?: string;
};

/**
 * One live call to Places API (New). Returns null rather than throwing:
 * a reviews band is not worth breaking a page over, and the caller has
 * an honest fallback ready — the link straight to the Google listing.
 */
export async function fetchGoogleReviews(
  signal?: AbortSignal
): Promise<GooglePlace | null> {
  if (!googleFeedConfigured()) return null;

  let res: Response;
  try {
    res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(PLACE_ID)}`,
      {
        signal,
        headers: {
          "X-Goog-Api-Key": KEY,
          "X-Goog-FieldMask": FIELD_MASK,
        },
      }
    );
  } catch {
    // Offline, blocked, or the request was aborted on unmount.
    return null;
  }

  if (!res.ok) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[reviews] Places API returned ${res.status}. Check that the key is ` +
          `enabled for Places API (New) and that its HTTP-referrer ` +
          `restriction includes this origin.`
      );
    }
    return null;
  }

  const data = (await res.json()) as {
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    reviews?: ApiReview[];
  };

  const reviews: GoogleReview[] = (data.reviews ?? [])
    .map((r, i) => ({
      id: r.name ?? `review-${i}`,
      rating: r.rating ?? 0,
      age: r.relativePublishTimeDescription ?? "",
      // Google translates reviews; originalText is what the customer
      // actually typed, so it wins where both are present.
      text: (r.originalText?.text ?? r.text?.text ?? "").trim(),
      authorName: r.authorAttribution?.displayName ?? "A Google customer",
      authorPhoto: r.authorAttribution?.photoUri,
      authorUri: r.authorAttribution?.uri,
      uri: r.googleMapsUri,
    }))
    // A rating with no words is a real rating but not a testimonial.
    .filter((r) => r.text.length > 0);

  if (typeof data.rating !== "number" || typeof data.userRatingCount !== "number") {
    return null;
  }

  return {
    rating: data.rating,
    total: data.userRatingCount,
    mapsUri: data.googleMapsUri ?? "",
    reviews,
  };
}
