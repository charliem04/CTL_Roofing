import Link from "next/link";
import { isLive } from "@/lib/routes";

/**
 * The funnel link that closes a home band. Each section carries its own
 * route onward rather than making the visitor go back up to the nav.
 *
 * It renders nothing when the destination is not built yet, so a
 * phase-2 page can be linked from everywhere it belongs today and
 * simply switch on when `live` flips in the route registry — no dead
 * links in the meantime, and no forgotten wiring later.
 */
export function MoreLink({
  href,
  children,
  tone = "ink",
  className,
}: {
  href: string;
  children: React.ReactNode;
  tone?: "ink" | "deep";
  className?: string;
}) {
  // Same-page anchors and the home page are always reachable; anything
  // else has to be a live route in the registry.
  const path = href.split("#")[0];
  const reachable = path === "" || path === "/" || isLive(path);
  if (!reachable) return null;

  const colors =
    tone === "deep"
      ? "text-accent hover:text-ink-invert active:text-accent-press"
      : "text-brand hover:text-ink active:text-brand-strong";

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 font-semibold no-underline transition-colors duration-150 ${colors} ${
        className ?? ""
      }`}
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-150 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}
