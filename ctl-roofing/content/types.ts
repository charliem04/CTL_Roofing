/**
 * ════════════════════════════════════════════════════════════════════
 *  CONTENT TYPES — the shapes every page reads through lib/content.ts
 *
 *  These types are the contract between content and components. A CMS
 *  added later (Decap, Sveltia, Sanity) has to produce these shapes;
 *  nothing in app/ or components/ should ever import a content module
 *  directly, only the loader.
 * ════════════════════════════════════════════════════════════════════
 */

export type Photo = {
  src: string;
  alt: string;
  /** Intrinsic pixels, so the box is reserved before the photo lands */
  width: number;
  height: number;
  caption?: string;
};

/** Filters on the gallery page, each mapping to a service. */
export type GalleryCategory =
  | "roofing"
  | "metal"
  | "outdoor"
  | "remodeling"
  | "storm";

export type GalleryShot = Photo & {
  category: GalleryCategory;
  /** Shown in the home page band as well as the gallery page */
  featured?: boolean;
};

export type Faq = {
  q: string;
  a: string;
};

/** The CTA band that closes every page, in that page’s own words. */
export type CtaCopy = {
  heading: string;
  body: string;
};

/** Per-page <head> content. */
export type PageMeta = {
  title: string;
  description: string;
  /** Path with leading and trailing slash, e.g. "/services/roofing/" */
  path: string;
};

/**
 * A block of content the client still owes us. Rendered as an honest,
 * obviously-unfinished panel rather than filled with invented copy.
 */
export type PendingContent = {
  /** What is missing, in the client’s language */
  needs: string;
  /** Who has to supply it */
  from?: string;
};

export type ServiceSection = {
  heading: string;
  body?: string[];
  /** Tick-list columns; one column reads as a list, two as a spec sheet */
  columns?: { label?: string; items: string[] }[];
};

export type ServicePage = {
  slug: string;
  /** Nav and breadcrumb label — shorter than the page title */
  navLabel: string;
  meta: PageMeta;
  /** Compact interior hero */
  heading: string;
  lede: string;
  photo: Photo;
  /** Short summary used on the services hub and the home cards */
  summary: string;
  /** Home/hub grid width: 7 of 12, 5 of 12, or the full row */
  span: "wide" | "narrow" | "full";
  sections: ServiceSection[];
  faqs: Faq[];
  cta: CtaCopy;
  /** Slugs of gallery photos to show as related work */
  workCaptions?: string[];
};

export type Town = {
  slug: string;
  name: string;
  /** Parish, for schema and for copy that has to sound local */
  parish: string;
};

export type TeamMember = {
  name: string;
  role: string;
  /** One line, in their words */
  line: string;
  photo?: Photo;
};

export type CaseStudy = {
  slug: string;
  title: string;
  town: string;
  /** Groups the study under a parish on the areas hub. */
  parish?: string;
  /** The service line it belongs to, e.g. "/services/roofing/". */
  service?: string;
  /** ISO date the job completed. Newest first on the index. */
  completed?: string;
  problem: string;
  scope: string;
  materials: string[];
  effort: string;
  result: string;
  /**
   * The pair that does the actual persuading. Both or neither — a
   * lone "after" is just a gallery photo, and a lone "before" is a
   * problem with no answer.
   */
  before?: Photo;
  after?: Photo;
  /** Anything else worth showing: detail shots, materials, the crew. */
  photos: Photo[];
};

export type Review = {
  quote: string;
  name: string;
  /** Town, job type, anything that grounds it. Often we simply do not know. */
  detail?: string;
  /** Where it was left, e.g. "Google" or "Facebook". */
  source: string;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string[];
};

/**
 * Financing terms. Every number the estimator prints comes from here —
 * there is no fallback math on invented rates. `offers: []` means the
 * estimator renders the pending panel instead.
 */
export type FinanceOffer = {
  label: string;
  /** Annual percentage rate, e.g. 9.99 */
  apr: number;
  /** Term in months */
  months: number;
  /** Optional note, e.g. "subject to credit approval" */
  note?: string;
};
