/**
 * ════════════════════════════════════════════════════════════════════
 *  THE NATIONAL WEATHER SERVICE, as this site talks to it.
 *
 *  Two endpoints, both federal, both free, both keyless — which is the
 *  whole reason they were chosen over any of the commercial radar APIs.
 *  There is no account to keep alive, no quota to blow through during
 *  the one week a year this page matters most, and nothing to rotate
 *  when somebody new takes over the site.
 *
 *    1. MRMS base reflectivity, as an ArcGIS image service. Ask it for
 *       a bounding box and a timestamp, get back a transparent PNG of
 *       the rain and nothing else — no basemap, no labels, no logo. The
 *       geography under it is ours (see lib/radarBasemap.ts), so the
 *       radar arrives as a layer in the site's own map rather than as
 *       somebody else's map dropped into the page.
 *
 *    2. Active alerts, filtered to the six parish zones CTL works in.
 *       A tornado warning over Shreveport is not news in Broussard, and
 *       a radar loop with no watch or warning beside it is a picture
 *       without a caption.
 *
 *  ── WHAT THIS IS NOT ────────────────────────────────────────────────
 *
 *  It is not a warning system, and the copy on the page says so. It is
 *  a two-minute-old picture of where the rain is, which is enough to
 *  answer "is that thing coming here" and not enough to be anybody's
 *  only notice that it already has. Nothing here is cached, stored or
 *  written anywhere; every call is a live read.
 * ════════════════════════════════════════════════════════════════════
 */
import { radarView, radarZones } from "./radarBasemap";

const RADAR =
  "https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer";

const ALERTS = "https://api.weather.gov/alerts/active";

/** How far back the loop reaches. The service holds about two hours. */
export const LOOP_MINUTES = 60;

/**
 * Frames in that window, and the reason there are this many.
 *
 * MRMS publishes a new mosaic roughly every two minutes. Sampling that
 * at 13 frames across an hour is a scan every five minutes, which is
 * dense enough that a squall line moves rather than teleports — six
 * frames across the same hour is a slideshow, and a slideshow reads as
 * a stock graphic instead of a live instrument. This is the number that
 * makes the loop look like the radar loop on the news, because it is
 * sampled at about the same rate.
 *
 * The cost is bytes, and they are real: against a sky full of storms a
 * desktop frame is about 145kB. That is why the loading is progressive
 * (the newest frame is shown the moment it decodes) and why the count
 * drops on a small screen or a connection that says it cannot afford
 * them — see `frameBudget`, which is where the arithmetic is written
 * down.
 */
export const FRAME_COUNT = 13;

/** The phone loop. Still the same hour, sampled every seven minutes. */
export const FRAME_COUNT_PHONE = 9;

/** The short loop, for a metered or slow connection. */
export const FRAME_COUNT_LIGHT = 6;

/**
 * How many frames to ask for, given the box and the connection.
 *
 * ── WHY THIS IS NOT ONE NUMBER ──────────────────────────────────────
 *
 * The frames are sized to the box they are drawn in, so a phone's are
 * about a third the bytes of a desktop's — but a phone is also a 2×
 * or 3× display, which claws most of that back, and it is the device
 * most likely to be on cellular in a parish that has just lost power.
 * Measured against a sky full of storms, thirteen desktop frames is
 * ~1.9MB and thirteen phone frames is ~1.2MB, which is not a saving
 * worth having on the connection that can least afford it.
 *
 * So the phone keeps the full hour and gives up density: nine frames
 * is a scan every seven minutes, which still moves. The desktop, where
 * the map is twice the size and the connection is usually not metered,
 * gets the five-minute sampling that makes it read like a television
 * loop rather than a slideshow.
 *
 * The connection check on top of that is an opt-out, not a gate. The
 * Network Information API is Chromium-only and absent on iOS, so the
 * default has to be the good loop; only a browser that actively says
 * "save data" or "this is 2g" is taken at its word.
 */
export function frameBudget(boxWidth: number): number {
  if (typeof navigator !== "undefined") {
    const conn = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (conn?.saveData) return FRAME_COUNT_LIGHT;
    if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") {
      return FRAME_COUNT_LIGHT;
    }
  }
  // 700 CSS px is the point below which the map is a phone-sized map:
  // roughly Tailwind's `md`, and the width at which the town labels
  // other than Lafayette are hidden for the same reason.
  return boxWidth > 0 && boxWidth < 700 ? FRAME_COUNT_PHONE : FRAME_COUNT;
}

export type RadarFrame = {
  /** Valid time of the frame, ms since epoch. Meaningless when `untimed`. */
  time: number;
  url: string;
  /**
   * True for the one frame requested with no time parameter at all, so
   * the service picks its own most recent raster. We do not know what
   * time it is valid for, so the page must not print one.
   */
  untimed?: true;
};

export type NwsAlert = {
  id: string;
  /** "Tornado Warning", "Flash Flood Watch", "Hurricane Warning". */
  event: string;
  severity: string;
  /** Only the parishes CTL serves — never the full areaDesc. */
  parishes: string[];
  /** ISO, if the alert carries one. */
  ends?: string;
};

/**
 * One radar frame as a URL.
 *
 * `size` is the pixel box asked of the service, not the box it is drawn
 * in: the aspect ratio is fixed by radarView, and a phone gets a
 * smaller request than a desktop for the same map. Anything else and a
 * visitor on a phone during a hurricane downloads six full-size PNGs
 * over whatever signal is left.
 */
export function frameUrl(time: number | null, width: number): string {
  const height = Math.round((width * radarView.height) / radarView.width);
  const params = new URLSearchParams({
    bbox: radarView.bbox3857,
    bboxSR: "3857",
    imageSR: "3857",
    size: `${width},${height}`,
    // png32 rather than png8: the transparency is the point, and it is
    // what lets our own coastline read underneath the rain.
    format: "png32",
    transparent: "true",
    f: "image",
  });
  // Omitting `time` entirely makes the service return its own most
  // recent raster, which is the one request that cannot land outside
  // the window. See `latestFrame`.
  if (time !== null) params.set("time", String(time));
  return `${RADAR}/exportImage?${params}`;
}

/**
 * The service's own latest raster, as a one-frame loop.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────
 *
 * The time index and the image renderer are separate paths on the same
 * ArcGIS host and they fail independently: measured on a quiet
 * afternoon, `?f=json` returned 502 once in six calls while
 * `exportImage` answered every time. Losing the whole radar because the
 * index blinked is the wrong trade — the visitor came for the picture,
 * and the picture is still there.
 *
 * So when the index cannot be read, this is what gets drawn: no loop,
 * no history, no invented timestamps, just the current scan. The one
 * request with no `time` on it is also the only one guaranteed to be
 * inside the window, which matters because a timestamp the service has
 * not ingested comes back as a fully transparent PNG — indistinguishable
 * from a clear sky, and the single most dangerous thing this component
 * could render.
 */
export function latestFrame(width: number): RadarFrame {
  return { time: 0, url: frameUrl(null, width), untimed: true };
}

/**
 * fetch with a couple of retries, for an endpoint known to blink.
 *
 * Short waits on purpose: this runs while somebody is looking at an
 * empty map, so the budget is under two seconds total before falling
 * back to the still image. An abort is never retried.
 */
async function fetchRetry(
  url: string,
  signal: AbortSignal,
  init: RequestInit = {},
  attempts = 3
): Promise<Response> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      const res = await fetch(url, { ...init, signal });
      if (res.ok) return res;
      last = new Error(`${url} responded ${res.status}`);
    } catch (err) {
      if (signal.aborted) throw err;
      last = err;
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, 300 * (i + 1) ** 2));
    }
  }
  throw last instanceof Error ? last : new Error(`${url} failed`);
}

/**
 * The frames to animate, oldest first.
 *
 * ── WHY THE NEWEST FRAME CARRIES NO TIMESTAMP ───────────────────────
 *
 * The service's time index runs ahead of its renderer. Measured against
 * the live service: any timestamp inside roughly the last five and a
 * half minutes renders as a 490-byte fully transparent PNG, while
 * `timeInfo.timeExtent[1]` — the newest time the index admits to — was
 * observed at ages between 3.3 and 16.4 minutes. When the index happens
 * to sit on the young side of that boundary, asking for it by name
 * returns a blank, and a blank frame on this map is not an error
 * message: it is a picture of a clear sky over Acadiana, which is the
 * most dangerous thing this component could draw.
 *
 * So the newest frame is requested with no `time` at all and the
 * service picks its own raster. That answer is never blank, and it is
 * strictly fresher than anything we can name: the untimed image hashes
 * differently from every timestamped one, including the boundary the
 * index reports. The cost is that we do not know what minute it is
 * valid for, so the page prints "Latest scan" rather than inventing a
 * clock time — see the `untimed` flag.
 *
 * The history frames step back from the index end and stop one step
 * short of it, so none of them goes near the boundary either.
 */
export async function fetchRadarFrames(
  signal: AbortSignal,
  width: number,
  count: number = FRAME_COUNT
): Promise<RadarFrame[]> {
  let extent: unknown;
  try {
    const res = await fetchRetry(`${RADAR}?f=json`, signal);
    extent = (await res.json())?.timeInfo?.timeExtent;
  } catch (err) {
    if (signal.aborted) throw err;
    return [latestFrame(width)];
  }

  if (!Array.isArray(extent) || extent.length !== 2) {
    return [latestFrame(width)];
  }

  const [start, end] = extent as [number, number];
  const span = Math.min(LOOP_MINUTES * 60_000, end - start);
  if (!(span > 0)) return [latestFrame(width)];

  // count - 1 timestamped frames, then the untimed one. The newest
  // timestamped frame is a full step short of `end`, which is what
  // keeps every named request clear of the render boundary.
  const step = span / (count - 1);
  const history = Array.from({ length: count - 1 }, (_, i) => {
    const time = Math.round(end - step * (count - 1 - i));
    return { time, url: frameUrl(time, width) };
  });
  return [...history, latestFrame(width)];
}

/** Severity, worst first. Anything unrecognised sorts last. */
const RANK: Record<string, number> = {
  Extreme: 0,
  Severe: 1,
  Moderate: 2,
  Minor: 3,
};

/**
 * A warning is the thing that has already happened to you; a watch is
 * the thing that might. The page treats them differently — solid gold
 * against outlined — so the distinction is drawn here, off the event
 * name, which is the only place the NWS puts it reliably.
 */
export function isWarning(alert: NwsAlert): boolean {
  return /warning/i.test(alert.event);
}

/**
 * Active watches, warnings and advisories over the served parishes.
 *
 * Filtered by zone in the request rather than by string-matching
 * areaDesc afterwards: there is a Lafayette County in Arkansas and a
 * Lafayette County in Mississippi, and both are inside the same
 * forecast region as ours.
 */
export async function fetchAlerts(signal: AbortSignal): Promise<NwsAlert[]> {
  const zones = radarZones.map((z) => z.zone);
  const byZone = new Map(radarZones.map((z) => [z.zone, z.parish]));

  const res = await fetchRetry(`${ALERTS}?zone=${zones.join(",")}`, signal, {
    headers: { Accept: "application/geo+json" },
  });
  const body = await res.json();

  const alerts: NwsAlert[] = (body?.features ?? [])
    .map((f: any) => {
      const p = f?.properties ?? {};
      const ugc: string[] = p?.geocode?.UGC ?? [];
      const parishes = ugc
        .filter((code) => byZone.has(code))
        .map((code) => byZone.get(code) as string);
      return {
        id: String(p.id ?? f.id ?? ""),
        event: String(p.event ?? "").trim(),
        severity: String(p.severity ?? "Unknown"),
        parishes,
        ends: p.ends ?? p.expires ?? undefined,
      };
    })
    .filter((a: NwsAlert) => a.event && a.parishes.length > 0);

  alerts.sort(
    (a, b) => (RANK[a.severity] ?? 9) - (RANK[b.severity] ?? 9) || a.event.localeCompare(b.event)
  );
  return alerts;
}

/**
 * Times are printed in Central, always — not in the reader's own zone.
 * The roof this page is about is in Louisiana, and somebody checking it
 * from a hotel in Denver needs the time the storm arrives at the house,
 * not the time it arrives on their watch.
 */
export function centralTime(ms: number): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
  }).format(ms);
}
