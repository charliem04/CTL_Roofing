/**
 * ════════════════════════════════════════════════════════════════════
 *  ROUTE REGISTRY — one source of truth for nav, footer and sitemap.
 *
 *  `live: false` marks a route that is planned but not built yet
 *  (phase 2). Nothing links to a route that is not live, and the
 *  sitemap never lists one — so the nav, the footer and the sitemap
 *  cannot drift apart from what actually exists.
 *
 *  A parent whose children are all not-live renders as a plain link to
 *  its own `href`. When phase 2 lands, flipping `live` to true is what
 *  makes the dropdown appear.
 * ════════════════════════════════════════════════════════════════════
 */
import { getServices } from "./content";

export type RouteNode = {
  href: string;
  label: string;
  live: boolean;
  children?: RouteNode[];
  /** Sitemap weight for live routes. */
  priority?: number;
  /**
   * A page that exists and is linked, but should not be indexed — the
   * legal pages. It stays out of the sitemap AND sends noindex, from
   * this one flag, because a sitemap entry is a request to index and
   * listing a noindex page asks Google for two contradictory things.
   * Search Console reports it as "Excluded by noindex", which is noise
   * that hides real coverage problems.
   */
  noindex?: boolean;
};

const serviceChildren: RouteNode[] = getServices().map((s) => ({
  href: s.meta.path,
  label: s.navLabel,
  live: true,
  priority: 0.8,
}));

export const nav: RouteNode[] = [
  {
    href: "/services/",
    label: "Services",
    live: true,
    priority: 0.9,
    children: serviceChildren,
  },
  {
    // The gallery is the hub for now, so this points at a real page
    // rather than at a band on the home page. When case studies and
    // video land they become the dropdown and this stays the parent.
    href: "/gallery/",
    label: "Our Work",
    live: true,
    priority: 0.8,
    children: [
      { href: "/case-studies/", label: "Case studies", live: false },
      { href: "/video/", label: "Video", live: true, priority: 0.6 },
    ],
  },
  { href: "/financing/", label: "Financing", live: true, priority: 0.7 },
  {
    // Meet the team is the hub here, the same way the gallery is for
    // Our Work: the parent is the page itself, so it is never listed
    // twice — once as a parent and again as its own child.
    href: "/team/",
    label: "About",
    live: true,
    priority: 0.7,
    children: [
      { href: "/areas/", label: "Areas we serve", live: true, priority: 0.8 },
      { href: "/reviews/", label: "Reviews", live: true, priority: 0.7 },
      { href: "/careers/", label: "Careers", live: false },
    ],
  },
  { href: "/contact/", label: "Contact", live: true, priority: 0.9 },
];

/** Routes that exist but are not top-level nav items. */
export const auxRoutes: RouteNode[] = [
  { href: "/storm-damage/", label: "Storm damage & insurance", live: true, priority: 0.9 },
  { href: "/terms/", label: "Terms of service", live: true, noindex: true },
  { href: "/privacy/", label: "Privacy policy", live: true, noindex: true },
];

/**
 * Is this path built yet? Home-page funnel links ask this before they
 * render, so flipping `live` in the registry is all it takes to switch
 * a phase-2 destination on across the whole site.
 */
export function isLive(href: string): boolean {
  for (const node of [...nav, ...auxRoutes]) {
    if (node.href === href) return node.live;
    const child = node.children?.find((c) => c.href === href);
    if (child) return child.live;
  }
  return false;
}

/** Children a nav item should actually render — live ones only. */
export function liveChildren(node: RouteNode): RouteNode[] {
  return (node.children ?? []).filter((c) => c.live);
}

/**
 * Should this path be indexed? False for a route that is not built and
 * for one flagged `noindex`. The pages read this for their own robots
 * meta, so the tag and the sitemap can never disagree.
 */
export function isIndexable(href: string): boolean {
  for (const node of [...nav, ...auxRoutes]) {
    if (node.href === href) return node.live && !node.noindex;
    const child = node.children?.find((c) => c.href === href);
    if (child) return child.live && !child.noindex;
  }
  return false;
}

/**
 * Every path the sitemap should list. Anchors, dead routes and
 * noindex pages out — a sitemap is a request to index, so listing a
 * page that refuses indexing asks for two opposite things at once.
 */
export function livePaths(): { path: string; priority: number }[] {
  const out: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
  ];
  const walk = (nodes: RouteNode[]) => {
    for (const n of nodes) {
      if (n.live && !n.noindex && !n.href.includes("#")) {
        out.push({ path: n.href, priority: n.priority ?? 0.5 });
      }
      if (n.children) walk(n.children);
    }
  };
  walk(nav);
  walk(auxRoutes);
  return out;
}

/**
 * Breadcrumb trail for a path, derived from the registry.
 *
 * `leafLabel` is for a page the registry cannot know about by name — a
 * case study, or anything else generated per content item. Without it
 * such a page fell through to a one-entry trail, which <Breadcrumbs>
 * declines to render: no visible trail and, worse, no BreadcrumbList
 * schema on exactly the deep pages that most need one. With it, the
 * page is hung off the longest registered path that prefixes it.
 */
export function trailFor(
  path: string,
  leafLabel?: string
): { href: string; label: string }[] {
  const trail = [{ href: "/", label: "Home" }];

  for (const node of [...nav, ...auxRoutes]) {
    if (node.href === path) {
      trail.push({ href: node.href, label: node.label });
      return trail;
    }
    const child = node.children?.find((c) => c.href === path);
    if (child) {
      if (!node.href.includes("#")) {
        trail.push({ href: node.href, label: node.label });
      }
      trail.push({ href: child.href, label: child.label });
      return trail;
    }
  }

  if (!leafLabel) return trail;

  // No exact match: find the deepest registered ancestor. "/" is not a
  // candidate — it is already the first crumb.
  let best: RouteNode | undefined;
  let bestParent: RouteNode | undefined;
  for (const node of [...nav, ...auxRoutes]) {
    for (const cand of [node, ...(node.children ?? [])]) {
      if (cand.href === "/" || cand.href.includes("#")) continue;
      if (!path.startsWith(cand.href)) continue;
      if (best && cand.href.length <= best.href.length) continue;
      best = cand;
      bestParent = cand === node ? undefined : node;
    }
  }
  if (!best) return trail;

  if (bestParent && !bestParent.href.includes("#")) {
    trail.push({ href: bestParent.href, label: bestParent.label });
  }
  trail.push({ href: best.href, label: best.label });
  trail.push({ href: path, label: leafLabel });
  return trail;
}
