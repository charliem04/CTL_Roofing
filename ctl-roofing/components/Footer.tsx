import Link from "next/link";
import { client } from "@/client.config";
import { nav, liveChildren } from "@/lib/routes";
import { SocialIcons } from "./SocialIcons";

/**
 * The footer is generated from the same route registry as the nav, so a
 * page that exists is reachable from the bottom of every other page,
 * and a page that does not exist is listed in neither.
 */
export function Footer() {
  const year = new Date().getFullYear();

  // Services get their own column; the rest of the nav collapses into
  // one, since those sections are single pages or still being built.
  const servicesNode = nav.find((n) => n.href === "/services/");
  const serviceLinks = servicesNode ? liveChildren(servicesNode) : [];
  const companyLinks = [
    { href: "/services/", label: "All services" },
    { href: "/storm-damage/", label: "Storm damage & insurance" },
    { href: "/financing/", label: "Financing" },
    { href: "/#about", label: "About us" },
    { href: "/#work", label: "Our work" },
  ];

  const reach = [
    { label: `Office ${client.phone}`, href: `tel:${client.phoneHref}` },
    { label: `Storm line ${client.stormPhone}`, href: `tel:${client.stormPhoneHref}` },
    { label: client.email, href: `mailto:${client.email}` },
    ...(client.socials.google
      ? [{ label: "Google reviews", href: client.socials.google }]
      : []),
  ];

  const link =
    "block py-1.5 text-ink-invert-soft no-underline transition-colors duration-150 hover:text-accent active:text-accent-press";

  return (
    <footer className="on-deep bg-surface-deep pb-6 pt-[42px] text-ink-invert-soft">
      <div className="section">
        <div className="grid gap-[42px] md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={client.logoPath}
              alt={client.logoAlt}
              width={552}
              height={219}
              className="mb-4 h-14 w-auto"
            />
            <p>{client.copy.footerBlurb}</p>
            <SocialIcons className="mt-5" size={20} />
          </div>

          <nav aria-label="Services">
            <h2 className="mb-4 text-[19px] text-ink-invert">Services</h2>
            {serviceLinks.map((l) => (
              <Link key={l.href} href={l.href} className={link}>
                {l.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Company">
            <h2 className="mb-4 text-[19px] text-ink-invert">Company</h2>
            {companyLinks.map((l) => (
              <Link key={l.href} href={l.href} className={link}>
                {l.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Get in touch">
            <h2 className="mb-4 text-[19px] text-ink-invert">Get in touch</h2>
            {reach.map((l) => (
              <a key={l.label} href={l.href} className={link}>
                {l.label}
              </a>
            ))}
            <p className="mt-4 text-sm">
              {client.address.street}
              <br />
              {client.address.city}, {client.address.region}{" "}
              {client.address.postalCode}
            </p>
          </nav>
        </div>

        <div className="mt-[42px] flex flex-wrap justify-between gap-4 border-t border-line-dark/20 pt-6 text-sm">
          <span>
            © {year} {client.legalName}
          </span>
          <span className="flex gap-6">
            <Link
              href="/terms/"
              className="border-b border-transparent text-ink-invert-soft no-underline transition-colors duration-150 hover:border-accent hover:text-accent active:text-accent-press"
            >
              Terms of service
            </Link>
            <Link
              href="/privacy/"
              className="border-b border-transparent text-ink-invert-soft no-underline transition-colors duration-150 hover:border-accent hover:text-accent active:text-accent-press"
            >
              Privacy policy
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
