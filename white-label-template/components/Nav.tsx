"use client";

import { useEffect, useState } from "react";
import { client } from "@/client.config";
import { btn } from "./Button";

const links = [
  { href: "#services", label: "Services" },
  { href: "#metal", label: "Metal roofing" },
  { href: "#process", label: "How we work" },
  { href: "#about", label: "About" },
  { href: "#work", label: "Our work" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  // The rule under the header darkens once the hero starts leaving —
  // the only thing that changes, so the header never jumps in height.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 90);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Marks the band you are reading in the nav.
  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector(l.href))
      .filter((el): el is Element => Boolean(el));
    if (!sections.length) return;
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-surface transition-colors duration-200 ${
        scrolled ? "border-brand/40" : "border-line"
      }`}
    >
      <div className="section flex min-h-[70px] items-center gap-4 lg:min-h-[78px] lg:gap-6">
        <a href="#top" className="mr-auto flex items-center" aria-label={`${client.businessName} — home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={client.logoPath}
            alt={client.logoAlt}
            width={552}
            height={219}
            className="h-10 w-auto lg:h-12"
          />
        </a>

        <nav className="hidden items-center gap-[clamp(12px,1.7vw,26px)] lg:flex" aria-label="Main">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={current === l.href ? "true" : undefined}
              className="group relative py-1.5 text-[15px] font-semibold text-ink no-underline active:text-brand"
            >
              {l.label}
              <span
                aria-hidden
                className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent transition-transform duration-200 group-hover:scale-x-100 ${
                  current === l.href ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a href={`tel:${client.phoneHref}`} className={`max-lg:hidden ${btn("line", "sm")} font-mono tabular-nums`}>
            {client.phone}
          </a>
          <a href={client.bookingUrl || "#contact"} className={`${btn("gold", "sm")} whitespace-nowrap`}>
            {client.copy.navCta}
          </a>
          <button
            className="rounded border border-line p-2.5 transition-colors duration-150 hover:border-brand active:bg-surface-alt lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-surface lg:hidden" aria-label="Main, mobile">
          <div className="section pb-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block border-b border-line py-4 font-semibold text-ink no-underline transition-colors duration-150 hover:text-brand active:text-brand-strong"
              >
                {l.label}
              </a>
            ))}
            <a
              href={`tel:${client.phoneHref}`}
              onClick={() => setOpen(false)}
              className="block border-b border-line py-4 font-semibold text-ink no-underline transition-colors duration-150 hover:text-brand active:text-brand-strong"
            >
              Call {client.phone}
            </a>
            <a href={client.bookingUrl || "#contact"} className={`mt-6 w-full ${btn("gold")}`}>
              {client.copy.navCta}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
