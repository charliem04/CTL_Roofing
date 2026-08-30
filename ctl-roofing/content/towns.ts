import type { Town } from "./types";

/**
 * Service-area towns. Used today for the "Committed to local" tag row,
 * the footer, and the areaServed property on the LocalBusiness schema.
 * Phase 2 turns each of these into its own page, which is why the slug
 * and parish are already here.
 *
 * ⚠️ Pending from Robert: the definitive service-area list. Towns that
 * straddle parish lines (Broussard, Duson, Milton) are recorded under
 * the parish holding most of the town.
 */
export const towns: Town[] = [
  { slug: "lafayette", name: "Lafayette", parish: "Lafayette Parish" },
  { slug: "broussard", name: "Broussard", parish: "Lafayette Parish" },
  { slug: "youngsville", name: "Youngsville", parish: "Lafayette Parish" },
  { slug: "scott", name: "Scott", parish: "Lafayette Parish" },
  { slug: "carencro", name: "Carencro", parish: "Lafayette Parish" },
  { slug: "duson", name: "Duson", parish: "Lafayette Parish" },
  { slug: "maurice", name: "Maurice", parish: "Vermilion Parish" },
  { slug: "milton", name: "Milton", parish: "Lafayette Parish" },
  { slug: "breaux-bridge", name: "Breaux Bridge", parish: "St. Martin Parish" },
  { slug: "st-martinville", name: "St. Martinville", parish: "St. Martin Parish" },
  { slug: "new-iberia", name: "New Iberia", parish: "Iberia Parish" },
  { slug: "abbeville", name: "Abbeville", parish: "Vermilion Parish" },
  { slug: "crowley", name: "Crowley", parish: "Acadia Parish" },
  { slug: "rayne", name: "Rayne", parish: "Acadia Parish" },
  { slug: "opelousas", name: "Opelousas", parish: "St. Landry Parish" },
  { slug: "erath", name: "Erath", parish: "Vermilion Parish" },
];
