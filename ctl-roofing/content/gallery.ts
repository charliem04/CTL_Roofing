import type { GalleryCategory, GalleryShot } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  RECENT WORK — every photo, in one place.
 *
 *  This is the single source for both the home page band and the
 *  gallery page: the band shows the ones marked `featured`, the page
 *  shows all of them. Before, the two were separate lists, which meant
 *  the "full gallery" could end up missing the photos on the home page.
 *
 *  Alt text describes what is actually visible in the frame. These are
 *  CTL's own job photographs — no stock, and nothing captioned as
 *  something it isn't.
 * ════════════════════════════════════════════════════════════════════
 */

export const galleryCategories: {
  id: GalleryCategory;
  label: string;
  /** The service this work belongs to, for the way onward */
  service?: string;
}[] = [
  { id: "roofing", label: "Roofing", service: "/services/roofing/" },
  { id: "metal", label: "Metal roofing", service: "/services/roofing/#metal" },
  {
    id: "outdoor",
    label: "Outdoor living",
    service: "/services/outdoor-living/",
  },
  {
    id: "remodeling",
    label: "Remodeling",
    service: "/services/remodeling-restoration/",
  },
  { id: "storm", label: "Storm response", service: "/storm-damage/" },
];

export const gallery: GalleryShot[] = [
  // ── Metal roofing ────────────────────────────────────────────────
  {
    src: "/ctl/work-standing-seam.jpg",
    alt: "Aerial view of a standing seam metal roof installation",
    caption: "Standing seam install",
    width: 680,
    height: 491,
    category: "metal",
    featured: true,
  },
  {
    src: "/ctl/gallery/metal-aerial-complete.jpg",
    alt: "Aerial view of a large home finished in dark standing seam metal, seen from above the ridge",
    caption: "Standing seam, complete",
    width: 1100,
    height: 825,
    category: "metal",
  },
  {
    src: "/ctl/gallery/metal-aerial-progress.jpg",
    alt: "Aerial view of a house part-way through a metal roof install, one wing finished and one still open",
    caption: "Half a roof to go",
    width: 1100,
    height: 825,
    category: "metal",
  },
  {
    src: "/ctl/gallery/metal-panels-underlayment.jpg",
    alt: "Close aerial of metal panels being laid over blue self-adhered underlayment",
    caption: "Panels over underlayment",
    width: 1100,
    height: 826,
    category: "metal",
  },
  {
    src: "/ctl/gallery/metal-crew-ridge.jpg",
    alt: "Crew setting metal roof panels on the ridge of a brick building under construction",
    caption: "Setting the ridge",
    width: 1100,
    height: 508,
    category: "metal",
  },
  {
    src: "/ctl/gallery/metal-panel-setting.jpg",
    alt: "A roofer kneeling to set a metal panel over underlayment on a low-slope section",
    caption: "Panel by panel",
    width: 1100,
    height: 508,
    category: "metal",
  },
  {
    src: "/ctl/gallery/metal-valley-crew.jpg",
    alt: "Aerial view of a crew working along the valley of a metal roof",
    caption: "Working the valley",
    width: 1100,
    height: 618,
    category: "metal",
  },
  {
    src: "/ctl/gallery/copper-sheet-shop.jpg",
    alt: "A sheet of copper on the bench in the CTL shop, catching the light before it is formed",
    caption: "Copper, before forming",
    width: 1100,
    height: 1467,
    category: "metal",
  },

  // ── Roofing ──────────────────────────────────────────────────────
  {
    src: "/ctl/work-shingle-replacement.jpg",
    alt: "Brick home with a completed shingle roof",
    caption: "Shingle replacement",
    width: 680,
    height: 510,
    category: "roofing",
    featured: true,
  },
  {
    src: "/ctl/work-tear-off.jpg",
    alt: "Crew tearing off an old roof deck",
    caption: "Tear-off in progress",
    width: 680,
    height: 382,
    category: "roofing",
    featured: true,
  },
  {
    src: "/ctl/work-architectural-shingles.jpg",
    alt: "Close view of newly laid architectural shingles",
    caption: "Architectural shingles",
    width: 900,
    height: 416,
    category: "roofing",
    featured: true,
  },
  {
    src: "/ctl/gallery/shingle-deck-exposed.jpg",
    alt: "Aerial view of a roof stripped back to bare decking with the crew working across it",
    caption: "Down to the deck",
    width: 1100,
    height: 825,
    category: "roofing",
  },
  {
    src: "/ctl/gallery/shingle-aerial-finished.jpg",
    alt: "Aerial view of a finished grey shingle roof on a brick home",
    caption: "Finished from above",
    width: 1100,
    height: 619,
    category: "roofing",
  },
  {
    src: "/ctl/gallery/shingle-close-finished.jpg",
    alt: "Low aerial of a newly finished shingle roof, ridge line in the foreground",
    caption: "New shingles, close up",
    width: 1100,
    height: 619,
    category: "roofing",
  },
  {
    src: "/ctl/gallery/shingle-brick-ranch.jpg",
    alt: "Brick ranch home with a completed shingle roof and mature planting out front",
    caption: "Brick ranch, done",
    width: 1100,
    height: 825,
    category: "roofing",
  },
  {
    src: "/ctl/gallery/shingle-crew-install.jpg",
    alt: "Crew laying shingles across the front slope of a single-storey brick home",
    caption: "Laying the front slope",
    width: 1100,
    height: 508,
    category: "roofing",
  },
  {
    src: "/ctl/gallery/shingle-turbine-vents.jpg",
    alt: "Close view of a shingle roof with turbine vents along the ridge",
    caption: "Ridge and vents",
    width: 1100,
    height: 508,
    category: "roofing",
  },
  {
    src: "/ctl/gallery/tearoff-decking.jpg",
    alt: "Roof stripped to the decking mid tear-off, underlayment rolls staged ready",
    caption: "Stripped and staged",
    width: 1100,
    height: 508,
    category: "roofing",
  },
  {
    src: "/ctl/gallery/tearoff-crew-tarps.jpg",
    alt: "Crew on a roof mid tear-off with tarps spread over the landscaping below",
    caption: "Tarps down first",
    width: 1100,
    height: 619,
    category: "roofing",
  },
  {
    src: "/ctl/gallery/shingle-two-story.jpg",
    alt: "Two-storey brick home with a finished shingle roof",
    caption: "Two storeys, finished",
    width: 1100,
    height: 733,
    category: "roofing",
  },
  {
    src: "/ctl/gallery/shingle-bundles.jpg",
    alt: "Bundles of architectural shingles stacked on a pallet ready for the job",
    caption: "Materials staged",
    width: 1100,
    height: 508,
    category: "roofing",
  },

  // ── Storm response ───────────────────────────────────────────────
  {
    src: "/ctl/gallery/storm-tarped-brick.jpg",
    alt: "Brick home with tarps hung over the roof edge and walls after storm damage",
    caption: "Tarped and holding",
    width: 1100,
    height: 508,
    category: "storm",
  },
  {
    src: "/ctl/gallery/storm-tarps-yard.jpg",
    alt: "Crew on a roof with blue tarps laid across the driveway and a CTL sign in the yard",
    caption: "Storm callout",
    width: 1100,
    height: 508,
    category: "storm",
  },

  // ── Outdoor living ───────────────────────────────────────────────
  {
    src: "/ctl/work-patio-cover.jpg",
    alt: "Attached patio cover with wood columns",
    caption: "Patio cover",
    width: 680,
    height: 510,
    category: "outdoor",
    featured: true,
  },
  {
    src: "/ctl/gallery/patio-frame-going-up.jpg",
    alt: "Heavy timber patio frame going up over a concrete slab, ladders either side",
    caption: "Frame going up",
    width: 1100,
    height: 825,
    category: "outdoor",
  },
  {
    src: "/ctl/gallery/patio-timber-joint.jpg",
    alt: "Close view of a heavy timber post and beam joint against a clear sky",
    caption: "Post and beam",
    width: 1100,
    height: 825,
    category: "outdoor",
  },
  {
    src: "/ctl/gallery/patio-cover-finished.jpg",
    alt: "Finished white patio cover over a concrete slab, looking out across the yard",
    caption: "Cover, finished",
    width: 1100,
    height: 1467,
    category: "outdoor",
  },
  {
    src: "/ctl/gallery/carport-attached.jpg",
    alt: "Metal carport attached along the side of a home, driveway running under it",
    caption: "Attached carport",
    width: 1100,
    height: 825,
    category: "outdoor",
  },
  {
    src: "/ctl/gallery/porch-wood-columns.jpg",
    alt: "Front porch with stained wood columns on a white weatherboard home",
    caption: "Porch columns",
    width: 1100,
    height: 825,
    category: "outdoor",
  },
  {
    src: "/ctl/gallery/sunroom-exterior.jpg",
    alt: "Enclosed sunroom on the side of a brick home, new windows all round",
    caption: "Sunroom",
    width: 1100,
    height: 825,
    category: "outdoor",
  },

  // ── Remodeling ───────────────────────────────────────────────────
  {
    src: "/ctl/work-interior-remodel.jpg",
    alt: "Interior remodel under way in a living room",
    caption: "Interior remodel",
    width: 680,
    height: 382,
    category: "remodeling",
    featured: true,
  },
  {
    src: "/ctl/work-window-replacement.jpg",
    alt: "New windows installed in a sunroom",
    caption: "Window replacement",
    width: 680,
    height: 510,
    category: "remodeling",
    featured: true,
  },
  {
    src: "/ctl/work-exterior-renovation.jpg",
    alt: "Home mid-renovation with new siding going on",
    caption: "Exterior renovation",
    width: 680,
    height: 314,
    category: "remodeling",
    featured: true,
  },
  {
    src: "/ctl/gallery/interior-new-windows.jpg",
    alt: "Room with newly fitted windows above an exposed brick wall",
    caption: "New windows in",
    width: 1100,
    height: 825,
    category: "remodeling",
  },
  {
    src: "/ctl/gallery/interior-window-wall.jpg",
    alt: "Interior wall of tall replacement windows looking out onto the yard",
    caption: "Window wall",
    width: 1100,
    height: 825,
    category: "remodeling",
  },
  {
    src: "/ctl/gallery/interior-mid-remodel.jpg",
    alt: "Living room part-way through a remodel, ceiling fan up and materials still on the floor",
    caption: "Mid-remodel",
    width: 1100,
    height: 618,
    category: "remodeling",
  },
  {
    src: "/ctl/gallery/bath-tiled-shower.jpg",
    alt: "Bathroom with a marble-effect tiled shower and tub surround",
    caption: "Tiled surround",
    width: 1100,
    height: 1467,
    category: "remodeling",
  },
  {
    src: "/ctl/gallery/bath-vanity-finished.jpg",
    alt: "Finished bathroom with a double vanity and marble-effect walls",
    caption: "Bathroom, finished",
    width: 1100,
    height: 1467,
    category: "remodeling",
  },
  {
    src: "/ctl/gallery/new-build-exterior.jpg",
    alt: "New-build home under construction with the roof on and siding under way",
    caption: "New build",
    width: 1100,
    height: 495,
    category: "remodeling",
  },
  {
    src: "/ctl/gallery/multi-unit-siding.jpg",
    alt: "Multi-unit building mid-renovation with new siding going up in stages",
    caption: "Siding in stages",
    width: 1100,
    height: 508,
    category: "remodeling",
  },
];
