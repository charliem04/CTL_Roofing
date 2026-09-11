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
  /** ISO start, for a product issued ahead of the weather it describes. */
  onset?: string;
  /**
   * Immediate | Expected | Future | Past | Unknown. This is the field
   * that answers "on the way" versus "happening now", and it is the
   * only one that does — severity says how bad, not how soon.
   */
  urgency?: string;
  /** The NWS's own one-line summary. Already written for the public. */
  headline?: string;
  /**
   * The "what to do" half of the product, verbatim. We do not write
   * safety instructions for a tornado; we pass along the ones from the
   * office whose job that is.
   */
  instruction?: string;
  /** Largest hail expected, in inches — the CAP `maxHailSize` parameter. */
  hail?: string;
  /** Peak gust, as the NWS words it ("60 mph"). */
  gust?: string;
  /** RADAR INDICATED | OBSERVED, on tornado products. */
  tornado?: string;
  /** CONSIDERABLE | DESTRUCTIVE, on the tagged thunderstorm products. */
  damage?: string;
};

/**
 * The shape of weather an alert is about.
 *
 * Grouped by what a homeowner does about it rather than by the NWS's
 * own product taxonomy: every tropical product lands on "hurricane"
 * because the preparation is the same whether the word is Hurricane,
 * Tropical Storm or Storm Surge, and hail gets its own bucket even
 * though the NWS delivers it inside a Severe Thunderstorm product,
 * because hail is the one that costs a roof.
 */
export type AlertKind =
  | "tornado"
  | "hurricane"
  | "hail"
  | "thunderstorm"
  | "flood"
  | "wind"
  | "other";

export function alertKind(alert: NwsAlert): AlertKind {
  const e = alert.event.toLowerCase();
  if (e.includes("tornado")) return "tornado";
  if (/hurricane|tropical|storm surge|typhoon/.test(e)) return "hurricane";
  if (e.includes("thunderstorm")) {
    // The NWS has no "Hail Warning". Hail arrives tagged onto a severe
    // thunderstorm product, so the tag is what separates the storm that
    // wets a roof from the one that replaces it. One inch is the NWS's
    // own severe threshold and roughly where shingle bruising starts.
    const inches = Number.parseFloat(alert.hail ?? "");
    return Number.isFinite(inches) && inches >= 1 ? "hail" : "thunderstorm";
  }
  if (e.includes("flood")) return "flood";
  if (/wind|gale/.test(e)) return "wind";
  return "other";
}

/**
 * Is this the kind of weather that takes a roof off?
 *
 * The bar for the briefing section under the map, and deliberately
 * narrower than "the NWS has something out". A Dense Fog Advisory is a
 * real alert and it is not what that section is for — putting it there
 * would train the reader to scroll past the block on the day it says
 * Tornado Warning.
 */
export function isSevereKind(alert: NwsAlert): boolean {
  // Statements are narrative follow-ups to a product, not products —
  // a Hurricane Local Statement accompanies the Hurricane Warning that
  // is already in this list, and a Severe Weather Statement is usually
  // the NWS cancelling something. Letting them through would put two
  // cards on screen for one piece of weather, one of which has no
  // timing, no tags and nothing to do about it.
  if (/\bstatement\b/i.test(alert.event)) return false;

  const kind = alertKind(alert);
  return (
    kind === "tornado" ||
    kind === "hurricane" ||
    kind === "hail" ||
    kind === "wind" ||
    // A flash flood warning is a get-out-now product; a river flood
    // advisory two parishes away is not.
    (kind === "flood" && isWarning(alert))
  );
}

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

  /**
   * CAP `parameters` is a bag of string ARRAYS, not strings — every
   * value arrives as ["1.75"] even when there is only ever one. Read
   * through it in one place so nothing downstream renders "1.75"
   * complete with its brackets and quotes.
   */
  const param = (p: any, key: string): string | undefined => {
    const raw = p?.parameters?.[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    const text = typeof value === "string" ? value.trim() : "";
    return text || undefined;
  };

  /** Trim, and drop the empties — an empty string is not a headline. */
  const text = (value: unknown): string | undefined => {
    const s = typeof value === "string" ? value.trim() : "";
    return s || undefined;
  };

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
        onset: p.onset ?? p.effective ?? undefined,
        urgency: text(p.urgency),
        headline: text(p.headline),
        instruction: text(p.instruction),
        hail: param(p, "maxHailSize"),
        gust: param(p, "maxWindGust"),
        tornado: param(p, "tornadoDetection"),
        damage: param(p, "thunderstormDamageThreat"),
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

/**
 * ════════════════════════════════════════════════════════════════════
 *  IS IT ACTUALLY RAINING — reading the sky off the radar itself.
 *
 *  The alerts feed answers "has the National Weather Service issued
 *  something", which on the overwhelming majority of days is no. That
 *  is not the same question as "is there weather over my house": most
 *  rain, including most of the rain that finds a bad flashing detail,
 *  never earns a product. A page that says ALL CLEAR while the map
 *  behind it is half green is a page nobody trusts twice.
 *
 *  So the badge on the map reads the picture rather than the paperwork.
 *
 *  ── HOW, AND WHY IT IS A SEPARATE REQUEST ───────────────────────────
 *
 *  A canvas readback needs the image to be CORS-clean, and a browser
 *  caches a CORS request separately from a plain one — so reusing a
 *  display frame here would re-download it in full. Against a sky full
 *  of storms that is another ~145kB on the phone this file spends its
 *  whole length trying not to spend.
 *
 *  This asks for its own raster instead, 160px wide: a few kB, the same
 *  untimed "whatever is current" request the newest display frame uses,
 *  and enough resolution to measure how much of the map has returns on
 *  it. Coverage is an area fraction, not a diagnosis.
 *
 *  ── EVERY FAILURE RETURNS null ──────────────────────────────────────
 *
 *  If the service sends no Access-Control-Allow-Origin the image never
 *  loads at all and the readback never runs; if it loads and the canvas
 *  is tainted anyway, getImageData throws. Both end here, as null, and
 *  the badge falls back to reporting the alerts alone. What it must
 *  never do is read a failure as zero coverage, because zero coverage
 *  renders as "clear" — the same dangerous lie a blank frame would be.
 * ════════════════════════════════════════════════════════════════════
 */

export type SkyRead = {
  /** Share of the map showing any return at all, 0..1. */
  coverage: number;
  /** Share showing thunderstorm intensity or above — the amber-and-up end. */
  heavy: number;
};

/** The probe raster. Small, current, and nothing else asks for this URL. */
const SKY_PROBE_WIDTH = 160;

/**
 * Below this, the map is empty enough to call clear.
 *
 * Not zero. MRMS mosaics carry a thin scatter of isolated pixels —
 * ground clutter, birds, the edges of the radar's own cone — on
 * afternoons with nothing in the sky at all. Requiring literal zero
 * would mean the badge never once said clear, which is the same as not
 * having built it. Half a percent of the frame is a handful of specks.
 */
const CLEAR_COVERAGE = 0.005;

/** Above this, it is not "a shower somewhere", it is raining on the area. */
const WIDESPREAD_COVERAGE = 0.06;

/** Enough amber-and-up to be worth naming as storms rather than rain. */
const STORM_HEAVY = 0.002;

/**
 * Warm pixel test — thunderstorm intensity or above on the ramp above.
 *
 * Written against LEGEND in StormRadar: amber (255,201,0), orange
 * (255,157,0) and red (193,0,0) pass; every green and blue on the ramp
 * fails on the red channel alone, well clear of the boundary. The
 * `r > b + 60` term is what keeps a downscaled grey-white pixel — the
 * average of several colours at a cell edge — from reading as amber.
 */
function isHeavyPixel(r: number, g: number, b: number): boolean {
  return r >= 140 && b <= 110 && r > b + 60;
}

/**
 * Alpha below which a pixel is scatter rather than weather. Downscaling
 * to the probe size averages a small cell against the transparency
 * around it, so real returns arrive softened; 24/255 keeps those and
 * drops the single-pixel speckle.
 */
const MIN_ALPHA = 24;

export function skyProbeUrl(): string {
  return frameUrl(null, SKY_PROBE_WIDTH);
}

export async function readSky(signal: AbortSignal): Promise<SkyRead | null> {
  if (typeof document === "undefined") return null;

  const img = new Image();
  // Without this the canvas is tainted and getImageData throws. With
  // it, a service that sends no CORS header simply fails to load —
  // which is the same answer, arrived at earlier and more cheaply.
  img.crossOrigin = "anonymous";

  const loaded = await new Promise<boolean>((resolve) => {
    const done = (ok: boolean) => () => resolve(ok);
    img.onload = done(true);
    img.onerror = done(false);
    // An abort mid-flight resolves false rather than hanging the caller.
    signal.addEventListener("abort", done(false), { once: true });
    img.src = skyProbeUrl();
  });

  if (!loaded || signal.aborted) return null;

  try {
    const width = img.naturalWidth || SKY_PROBE_WIDTH;
    const height = img.naturalHeight || SKY_PROBE_WIDTH;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);

    const { data } = ctx.getImageData(0, 0, width, height);
    const total = width * height;
    if (!total) return null;

    let wet = 0;
    let heavy = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < MIN_ALPHA) continue;
      wet++;
      if (isHeavyPixel(data[i], data[i + 1], data[i + 2])) heavy++;
    }
    return { coverage: wet / total, heavy: heavy / total };
  } catch {
    // Tainted canvas, or a browser refusing the readback outright.
    return null;
  }
}

/** What the badge says, given a reading. */
export type SkyState = "clear" | "isolated" | "rain" | "storms";

export function skyState(read: SkyRead): SkyState {
  if (read.heavy >= STORM_HEAVY) return "storms";
  if (read.coverage < CLEAR_COVERAGE) return "clear";
  return read.coverage >= WIDESPREAD_COVERAGE ? "rain" : "isolated";
}
