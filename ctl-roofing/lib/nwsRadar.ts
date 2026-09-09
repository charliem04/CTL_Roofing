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
export const LOOP_MINUTES = 50;

/** Frames in that window. Six is a legible sweep without a megabyte. */
export const FRAME_COUNT = 6;

export type RadarFrame = {
  /** Valid time of the frame, ms since epoch. */
  time: number;
  url: string;
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
export function frameUrl(time: number, width: number): string {
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
    time: String(time),
    f: "image",
  });
  return `${RADAR}/exportImage?${params}`;
}

/**
 * The frames to animate, oldest first.
 *
 * The service publishes its own moving window and it is not exactly two
 * hours — it is whatever has been ingested — so the window is read
 * rather than assumed. Asking for a timestamp outside it returns an
 * empty image, which looks exactly like clear skies and is the one
 * failure this component must never render.
 */
export async function fetchRadarFrames(
  signal: AbortSignal,
  width: number
): Promise<RadarFrame[]> {
  const res = await fetch(`${RADAR}?f=json`, { signal });
  if (!res.ok) throw new Error(`radar service ${res.status}`);
  const meta = await res.json();
  const extent = meta?.timeInfo?.timeExtent;
  if (!Array.isArray(extent) || extent.length !== 2) {
    throw new Error("radar service returned no time extent");
  }

  const [start, end] = extent as [number, number];
  const span = Math.min(LOOP_MINUTES * 60_000, end - start);
  if (!(span > 0)) throw new Error("radar service window is empty");

  const step = span / (FRAME_COUNT - 1);
  return Array.from({ length: FRAME_COUNT }, (_, i) => {
    const time = Math.round(end - step * (FRAME_COUNT - 1 - i));
    return { time, url: frameUrl(time, width) };
  });
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

  const res = await fetch(`${ALERTS}?zone=${zones.join(",")}`, {
    signal,
    headers: { Accept: "application/geo+json" },
  });
  if (!res.ok) throw new Error(`alerts ${res.status}`);
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
