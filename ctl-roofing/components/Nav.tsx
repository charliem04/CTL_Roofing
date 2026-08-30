"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { client } from "@/client.config";
import { nav, liveChildren, type RouteNode } from "@/lib/routes";
import { btn } from "./Button";

/**
 * Five items and a CTA, per the nav spec. Items with live children open
 * a menu; items without are plain links, which is what keeps a section
 * whose children are still being built from advertising dead routes.
 *
 * The menus answer pointer and keyboard the same way: hover or focus
 * opens, Escape closes and returns focus to the trigger, and clicking
 * the trigger itself navigates to the hub. Nothing here traps a
 * keyboard user inside a dropdown.
 */
export function Nav() {
  const pathname = usePathname() ?? "/";
  const [drawer, setDrawer] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // The rule under the header darkens once the hero starts leaving —
  // the only thing that changes, so the header never jumps in height.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 90);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change and on Escape or an outside click.
  useEffect(() => {
    setOpenMenu(null);
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [openMenu]);

  const isCurrent = (node: RouteNode) =>
    node.href === pathname ||
    (node.children?.some((c) => c.href === pathname) ?? false);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 border-b bg-surface transition-colors duration-200 ${
        scrolled ? "border-brand/40" : "border-line"
      }`}
    >
      <div className="section flex min-h-[70px] items-center gap-4 lg:min-h-[78px] lg:gap-6">
        <Link href="/" className="mr-auto flex items-center" aria-label={`${client.businessName} — home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={client.logoPath}
            alt={client.logoAlt}
            width={552}
            height={219}
            className="h-10 w-auto lg:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-[clamp(10px,1.4vw,22px)] lg:flex" aria-label="Main">
          {nav.map((item) => {
            const kids = liveChildren(item);
            const current = isCurrent(item);

            if (kids.length === 0) {
              return (
                <NavLink key={item.href} href={item.href} current={current}>
                  {item.label}
                </NavLink>
              );
            }

            const open = openMenu === item.href;
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.href)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <span className="flex items-center gap-1">
                  <NavLink href={item.href} current={current}>
                    {item.label}
                  </NavLink>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-label={`${item.label} menu`}
                    onClick={() => setOpenMenu(open ? null : item.href)}
                    className="p-1 text-ink-faint transition-colors duration-150 hover:text-brand active:text-brand-strong"
                  >
                    <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M2 4.5 6 8.5l4-4" />
                    </svg>
                  </button>
                </span>

                {open && (
                  <ul className="absolute left-0 top-full z-50 mt-2 min-w-[240px] list-none rounded border border-line bg-surface py-1.5">
                    {kids.map((kid) => (
                      <li key={kid.href}>
                        <Link
                          href={kid.href}
                          className={`block px-4 py-2.5 text-[15px] no-underline transition-colors duration-150 hover:bg-surface-alt hover:text-brand active:bg-line/40 ${
                            kid.href === pathname ? "text-brand" : "text-ink"
                          }`}
                        >
                          {kid.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <a href={`tel:${client.phoneHref}`} className={`max-lg:hidden ${btn("line", "sm")} font-mono tabular-nums`}>
            {client.phone}
          </a>
          <a href={client.bookingUrl || "/contact/"} className={`${btn("gold", "sm")} whitespace-nowrap`}>
            {client.copy.navCta}
          </a>
          <button
            className="rounded border border-line p-2.5 transition-colors duration-150 hover:border-brand active:bg-surface-alt lg:hidden"
            aria-expanded={drawer}
            aria-controls="mobile-nav"
            aria-label={drawer ? "Close menu" : "Open menu"}
            onClick={() => setDrawer((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {drawer ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {drawer && (
        <nav id="mobile-nav" className="border-t border-line bg-surface lg:hidden" aria-label="Main, mobile">
          <div className="section pb-6">
            {nav.map((item) => {
              const kids = liveChildren(item);
              return (
                <div key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    onClick={() => setDrawer(false)}
                    className="block py-4 font-semibold text-ink no-underline transition-colors duration-150 hover:text-brand active:text-brand-strong"
                  >
                    {item.label}
                  </Link>
                  {kids.length > 0 && (
                    <ul className="list-none pb-3 pl-4 pt-0">
                      {kids.map((kid) => (
                        <li key={kid.href}>
                          <Link
                            href={kid.href}
                            onClick={() => setDrawer(false)}
                            className="block py-2 text-[15px] text-ink-soft no-underline transition-colors duration-150 hover:text-brand active:text-brand-strong"
                          >
                            {kid.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
            <a
              href={`tel:${client.phoneHref}`}
              onClick={() => setDrawer(false)}
              className="block border-b border-line py-4 font-semibold text-ink no-underline transition-colors duration-150 hover:text-brand active:text-brand-strong"
            >
              Call {client.phone}
            </a>
            <a href={client.bookingUrl || "/contact/"} className={`mt-6 w-full ${btn("gold")}`}>
              {client.copy.navCta}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className="group relative py-1.5 text-[15px] font-semibold text-ink no-underline active:text-brand"
    >
      {children}
      <span
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent transition-transform duration-200 group-hover:scale-x-100 ${
          current ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </Link>
  );
}
