/**
 * ════════════════════════════════════════════════════════════════════
 *  CONTENT LOADER — the boundary.
 *
 *  Pages and components import from here, never from content/* directly.
 *  Today these are synchronous reads of typed modules bundled at build
 *  time. Swapping in a CMS (Decap/Sveltia reading markdown, or a
 *  headless API fetched at build) means rewriting this file and nothing
 *  else — every consumer already speaks the types in content/types.ts.
 *
 *  If you add a getter, keep it returning the same shapes.
 * ════════════════════════════════════════════════════════════════════
 */
import { services, servicesHub } from "@/content/services";
import { storm } from "@/content/storm";
import { financing } from "@/content/financing";
import { contactPage } from "@/content/contact";
import { towns } from "@/content/towns";
import { gallery, galleryCategories } from "@/content/gallery";
import { areas, townsByParish } from "@/content/areas";
import { clips, videoPage } from "@/content/video";
import { teamPage } from "@/content/team";
import { reviewsPage } from "@/content/reviews";
import { careersPage } from "@/content/careers";
import {
  caseStudies,
  caseStudiesByDate,
  caseStudiesHub,
} from "@/content/caseStudies";
import { pendingContent, posts, reviews, team } from "@/content/pending";
import type { CaseStudy, ServicePage, Town } from "@/content/types";

/* ── Services ─────────────────────────────────────────────────────── */

export function getServicesHub() {
  return servicesHub;
}

export function getServices(): ServicePage[] {
  return services;
}

export function getService(slug: string): ServicePage | undefined {
  return services.find((s) => s.slug === slug);
}

export function getServiceSlugs(): string[] {
  return services.map((s) => s.slug);
}

/* ── Single-page collections ──────────────────────────────────────── */

export function getStorm() {
  return storm;
}

export function getContactPage() {
  return contactPage;
}

export function getFinancing() {
  return financing;
}

/** True only when real lender terms exist — gates the estimator. */
export function hasFinanceTerms(): boolean {
  return financing.offers.length > 0;
}

/* ── Gallery ──────────────────────────────────────────────────────── */

export function getGallery() {
  return gallery;
}

/** The subset the home page band shows. */
export function getFeaturedGallery() {
  return gallery.filter((s) => s.featured);
}

/** Only categories that actually have photos in them. */
export function getGalleryCategories() {
  return galleryCategories.filter((c) =>
    gallery.some((s) => s.category === c.id)
  );
}

/* ── Areas ────────────────────────────────────────────────────────── */

export function getTowns(): Town[] {
  return towns;
}

/* ── Areas, video, team ───────────────────────────────────────────── */

export function getAreas() {
  return areas;
}

export function getTownsByParish() {
  return townsByParish();
}

export function getVideoPage() {
  return videoPage;
}

export function getClips() {
  return clips;
}

export function getTeamPage() {
  return teamPage;
}

/* ── Phase 2 collections (empty until the content exists) ─────────── */

export function getTeam() {
  return team;
}

/* ── Careers ──────────────────────────────────────────────────────── */

export function getCareersPage() {
  return careersPage;
}

/* ── Case studies ─────────────────────────────────────────────────── */

export function getCaseStudiesHub() {
  return caseStudiesHub;
}

/** Newest first. Empty until Robert sends projects — see the module. */
export function getCaseStudies(): CaseStudy[] {
  return caseStudiesByDate();
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function getCaseStudySlugs(): string[] {
  return caseStudies.map((c) => c.slug);
}

export function getReviewsPage() {
  return reviewsPage;
}

/**
 * Curated reviews only. The live Google feed does not come through
 * here — it cannot be cached, so it is fetched in the browser by
 * components/GoogleReviews.tsx and never touches the content layer.
 */
export function getReviews() {
  return reviews;
}

export function getPosts() {
  return posts;
}

/** What a <Pending> panel should say, keyed by what is missing. */
export function getPending(key: keyof typeof pendingContent) {
  return pendingContent[key];
}
