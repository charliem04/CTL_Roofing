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
  { href: "/terms/", label: "Terms of service", live: true, priority: 0.2 },
  { href: "/privacy/", label: "Privacy policy", live: true, priority: 0.2 },
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

/** Every real page path, for the sitemap. Anchors and dead routes out. */
export function livePaths(): { path: string; priority: number }[] {
  const out: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
  ];
  const walk = (nodes: RouteNode[]) => {
    for (const n of nodes) {
      if (n.live && !n.href.includes("#")) {
        out.push({ path: n.href, priority: n.priority ?? 0.5 });
      }
      if (n.children) walk(n.children);
    }
  };
  walk(nav);
  walk(auxRoutes);
  return out;
}

/** Breadcrumb trail for a path, derived from the registry. */
export function trailFor(path: string): { href: string; label: string }[] {
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
  return trail;
}
