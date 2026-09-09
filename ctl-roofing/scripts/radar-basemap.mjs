#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════
 *  BASEMAP GENERATOR for the live radar on /storm-damage/.
 *
 *  Run by hand, not by the build:  node scripts/radar-basemap.mjs
 *  It rewrites lib/radarBasemap.ts, which is committed.
 *
 *  ── WHY THE GEOGRAPHY IS BAKED IN RATHER THAN FETCHED ──────────────
 *
 *  The radar layer has to come off the wire — that is the whole point
 *  of it. The coastline does not. Parish lines have not moved since
 *  1912 and will not move while this site is up, so shipping them as a
 *  few kilobytes of SVG path data buys three things a runtime tile
 *  layer cannot:
 *
 *    · The map draws instantly and draws even when the network is the
 *      thing the hurricane took out. A visitor with a bad connection
 *      still sees where the parishes are, and the radar arrives on top
 *      of it or does not.
 *    · No third-party basemap, so no tile-usage terms to comply with,
 *      no attribution bar in someone else's typeface, and one fewer
 *      origin in the CSP.
 *    · The land is drawn in the site's own palette because it is our
 *      SVG, so the map belongs to the page instead of sitting in it.
 *
 *  ── SOURCE ─────────────────────────────────────────────────────────
 *
 *  County/parish polygons from the US Census Bureau's TIGERweb REST
 *  service. Federal government work, public domain, no key, no terms.
 *  Simplified server-side with maxAllowableOffset — at this scale a
 *  ~900m tolerance is well under one screen pixel.
 *
 *  Everything intersecting the viewport is fetched, not just Louisiana:
 *  the frame reaches into Texas and Mississippi, and without their
 *  counties those thirds of the map read as open water.
 * ════════════════════════════════════════════════════════════════════
 */
import { writeFileSync } from "node:fs";

/* ── The viewport ───────────────────────────────────────────────────
   Centred on Lafayette and wide enough to answer the question the page
   is actually being asked after a storm warning: is that thing coming
   here? So it reaches west past Lake Charles, east past Baton Rouge,
   and far enough south to show weather still out over the Gulf.

   West/east and the pixel box are chosen; the north/south bounds are
   derived from them, because Web Mercator only stays square if the
   aspect ratio of the geography matches the aspect ratio of the box. */
const WEST = -94.35;
const EAST = -89.65;
const SOUTH = 28.55;
const W = 1000;
const H = 660;

/** Web Mercator, metres. */
const R = 6378137;
const mx = (lon) => (R * lon * Math.PI) / 180;
const my = (lat) => R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const unMy = (y) => (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * (180 / Math.PI);

const x0 = mx(WEST);
const x1 = mx(EAST);
const y0 = my(SOUTH);
const y1 = y0 + ((x1 - x0) * H) / W;
const NORTH = unMy(y1);

/** Geographic point → SVG user units in a 0 0 W H viewBox. */
const px = (lon) => ((mx(lon) - x0) / (x1 - x0)) * W;
const py = (lat) => ((y1 - my(lat)) / (y1 - y0)) * H;

/**
 * The parishes CTL actually works in, by Census GEOID (22 + parish
 * FIPS). These draw a step brighter than their neighbours, which is the
 * one piece of editorial in an otherwise factual map: the visitor is
 * being shown the weather over the service area, not over Louisiana.
 *
 * Kept in step with content/towns.ts by hand — there are six of them
 * and they change about as often as the parish lines do.
 */
const SERVED = {
  22055: "Lafayette",
  22113: "Vermilion",
  22099: "St. Martin",
  22045: "Iberia",
  22001: "Acadia",
  22097: "St. Landry",
};

/**
 * Towns printed on the map. Not the full service list from
 * content/towns.ts — sixteen labels at this scale is a smear. These are
 * the ones that space out across the frame and let somebody locate
 * themselves, plus the coast and river cities that anchor the shape.
 */
const TOWNS = [
  { name: "Lafayette", lat: 30.2241, lon: -92.0198, home: true },
  { name: "Opelousas", lat: 30.5335, lon: -92.0815 },
  { name: "Crowley", lat: 30.2141, lon: -92.3746 },
  // Breaux Bridge is fifteen miles from Lafayette, which at this scale
  // is close enough that two labels centred under two dots overlap.
  // Its name goes to the right of its marker instead.
  { name: "Breaux Bridge", lat: 30.2735, lon: -91.8993, place: "right" },
  { name: "New Iberia", lat: 30.0035, lon: -91.8187 },
  { name: "Abbeville", lat: 29.9746, lon: -92.1343 },
  { name: "Lake Charles", lat: 30.2266, lon: -93.2174, faint: true },
  { name: "Baton Rouge", lat: 30.4515, lon: -91.1871, faint: true },
  { name: "New Orleans", lat: 29.9511, lon: -90.0715, faint: true },
];

const ENDPOINT =
  "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query";

/** One ring → an SVG path segment, rounded to 0.1 user units. */
function ring(coords) {
  const pts = [];
  let prev = null;
  for (const [lon, lat] of coords) {
    const x = Math.round(px(lon) * 10) / 10;
    const y = Math.round(py(lat) * 10) / 10;
    // Drop points the simplifier left that land on the same tenth of a
    // pixel as the last one. Roughly halves the file on the coast.
    if (prev && prev[0] === x && prev[1] === y) continue;
    pts.push(`${x} ${y}`);
    prev = [x, y];
  }
  if (pts.length < 3) return "";
  return `M${pts.join("L")}Z`;
}

function toPath(geometry) {
  const polys =
    geometry.type === "MultiPolygon" ? geometry.coordinates : [geometry.coordinates];
  return polys
    .map((poly) => poly.map(ring).filter(Boolean).join(""))
    .filter(Boolean)
    .join("");
}

/**
 * True if the county's own bounding box overlaps the frame, tested in
 * SVG units with a small bleed. TIGERweb answers an envelope query
 * generously and the neighbours it throws in are what keeps the land
 * continuous at the edges — but a county wholly off-canvas is bytes
 * shipped to every visitor to draw nothing.
 */
function visible(geometry) {
  const polys =
    geometry.type === "MultiPolygon" ? geometry.coordinates : [geometry.coordinates];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const poly of polys) {
    for (const [lon, lat] of poly[0]) {
      const x = px(lon);
      const y = py(lat);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const bleed = 12;
  return maxX > -bleed && minX < W + bleed && maxY > -bleed && minY < H + bleed;
}

async function main() {
  const params = new URLSearchParams({
    // The frame in lon/lat, so TIGERweb only sends what is on screen.
    geometry: JSON.stringify({
      xmin: WEST - 0.6,
      ymin: SOUTH - 0.6,
      xmax: EAST + 0.6,
      ymax: NORTH + 0.6,
      spatialReference: { wkid: 4326 },
    }),
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "GEOID,BASENAME,STATE",
    returnGeometry: "true",
    // ~0.008° ≈ 900m. One SVG user unit here is about 520m, so the
    // simplifier is working just under the resolution of the drawing.
    maxAllowableOffset: "0.008",
    geometryPrecision: "4",
    outSR: "4326",
    f: "geojson",
  });

  const res = await fetch(`${ENDPOINT}?${params}`, {
    headers: { "User-Agent": "ctlpro.com basemap generator" },
  });
  if (!res.ok) throw new Error(`TIGERweb ${res.status}`);
  const geo = await res.json();
  if (!geo.features?.length) throw new Error("TIGERweb returned no features");

  const counties = geo.features
    .filter((f) => f.geometry && visible(f.geometry))
    .map((f) => ({
      geoid: String(f.properties.GEOID),
      name: String(f.properties.BASENAME),
      d: toPath(f.geometry),
    }))
    .filter((c) => c.d)
    // Louisiana last, so its brighter fill paints over the neighbours
    // where two simplified borders disagree by a pixel.
    .sort((a, b) => Number(a.geoid.startsWith("22")) - Number(b.geoid.startsWith("22")));

  const land = counties.map((c) => ({
    d: c.d,
    ...(c.geoid.startsWith("22") ? { la: true } : {}),
    ...(SERVED[c.geoid] ? { served: true } : {}),
  }));

  // GEOID 22055 → LAC055. The NWS county-zone code is the state alpha
  // plus "C" plus the three-digit county FIPS, which is the back half
  // of the Census GEOID, so the two lists cannot drift apart.
  const zones = Object.entries(SERVED)
    .map(([geoid, parish]) => ({ zone: `LAC${String(geoid).slice(2)}`, parish }))
    .sort((a, b) => a.parish.localeCompare(b.parish));

  const towns = TOWNS.map((t) => ({
    name: t.name,
    x: Math.round(px(t.lon) * 10) / 10,
    y: Math.round(py(t.lat) * 10) / 10,
    ...(t.home ? { home: true } : {}),
    ...(t.faint ? { faint: true } : {}),
    ...(t.place ? { place: t.place } : {}),
  }));

  const file = `/**
 * ════════════════════════════════════════════════════════════════════
 *  GENERATED FILE — do not edit by hand.
 *  Written by scripts/radar-basemap.mjs. Re-run that if the viewport
 *  or the served-parish list changes.
 *
 *  Parish and county outlines under the radar on /storm-damage/,
 *  projected into a ${W}×${H} Web Mercator viewBox so an image
 *  requested from the NWS for the same bounding box registers with it
 *  pixel for pixel.
 *
 *  Source: US Census Bureau TIGERweb (public domain).
 * ════════════════════════════════════════════════════════════════════
 */

/** The frame, in the terms both the SVG and the NWS request need. */
export const radarView = {
  /** SVG viewBox, and the pixel size asked of the image service. */
  width: ${W},
  height: ${H},
  /** WGS84 bounds of that box. */
  west: ${WEST},
  east: ${EAST},
  south: ${SOUTH},
  north: ${NORTH.toFixed(6)},
  /** The same box in EPSG:3857 metres — xmin,ymin,xmax,ymax. */
  bbox3857: "${x0.toFixed(1)},${y0.toFixed(1)},${x1.toFixed(1)},${y1.toFixed(1)}",
} as const;

/**
 * One entry per county in frame. \`la\` marks Louisiana, \`served\` marks
 * a parish CTL works in; both are drawn a step brighter than the
 * surrounding land so the service area reads without a legend.
 */
export const radarLand: { d: string; la?: true; served?: true }[] = ${JSON.stringify(
    land,
    null,
    2
  )};

/**
 * Town labels, already projected. \`home\` is Lafayette, \`faint\` is a
 * city outside the service area kept for orientation, and \`place\`
 * moves a label off its default position under the marker where two
 * of them would otherwise collide.
 */
export const radarTowns: {
  name: string;
  x: number;
  y: number;
  home?: true;
  faint?: true;
  place?: "right";
}[] = ${JSON.stringify(towns, null, 2)};

/**
 * The served parishes as the National Weather Service names them —
 * UGC county zones, "LAC" + the parish FIPS. This is what the alerts
 * endpoint is filtered by, so a watch over Shreveport never appears on
 * a page read in Broussard.
 */
export const radarZones: { zone: string; parish: string }[] = ${JSON.stringify(
    zones,
    null,
    2
  )};
`;

  writeFileSync("lib/radarBasemap.ts", file);
  const served = land.filter((l) => l.served).length;
  console.log(
    `[basemap] ${counties.length} counties (${served} served), ` +
      `${(file.length / 1024).toFixed(0)}kB → lib/radarBasemap.ts`
  );
  console.log(`[basemap] frame ${WEST},${SOUTH} → ${EAST},${NORTH.toFixed(4)}`);
}

main().catch((err) => {
  console.error(`[basemap] ${err.message}`);
  process.exit(1);
});
