import Link from "next/link";
import { client } from "@/client.config";

export function Footer() {
  const year = new Date().getFullYear();
  const company = [
    { label: "Services", href: "#services" },
    { label: "How we work", href: "#process" },
    { label: "About us", href: "#about" },
    { label: "Our work", href: "#work" },
    ...(client.financingUrl
      ? [{ label: "Financing", href: client.financingUrl }]
      : []),
  ];
  const reach = [
    { label: `Office ${client.phone}`, href: `tel:${client.phoneHref}` },
    { label: `Storm line ${client.stormPhone}`, href: `tel:${client.stormPhoneHref}` },
    { label: client.email, href: `mailto:${client.email}` },
    ...(client.socials.facebook
      ? [{ label: "Facebook", href: client.socials.facebook }]
      : []),
    ...(client.socials.instagram
      ? [{ label: "Instagram", href: client.socials.instagram }]
      : []),
    ...(client.socials.google
      ? [{ label: "Google reviews", href: client.socials.google }]
      : []),
  ];

  const link =
    "block py-1.5 text-ink-invert-soft no-underline transition-colors duration-150 hover:text-accent active:text-accent-press";

  return (
    <footer className="on-deep bg-surface-deep pb-6 pt-[42px] text-ink-invert-soft">
      <div className="section">
        <div className="grid gap-[42px] md:grid-cols-[1.3fr_1fr_1fr]">
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
          </div>

          <nav aria-label="Company">
            <h2 className="mb-4 text-[19px] text-ink-invert">Company</h2>
            {company.map((l) => (
              <a key={l.label} href={l.href} className={link}>
                {l.label}
              </a>
            ))}
          </nav>

          <nav aria-label="Get in touch">
            <h2 className="mb-4 text-[19px] text-ink-invert">Get in touch</h2>
            {reach.map((l) => (
              <a key={l.label} href={l.href} className={link}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-[42px] flex flex-wrap justify-between gap-4 border-t border-line-dark/20 pt-6 text-sm">
          <span>
            © {year} {client.legalName} · {client.address.street},{" "}
            {client.address.city}, {client.address.region} {client.address.postalCode}
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
