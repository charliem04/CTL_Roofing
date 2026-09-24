import type { ReactNode } from "react";

/**
 * Pulls named phrases out of a run of small print.
 *
 * Financial fine print is written to be skimmed past, and the clauses
 * that actually change what someone signs — subject to credit approval,
 * not offers of credit, does not affect your credit score — are the
 * ones a reader most needs and is least likely to reach. Emphasis is
 * doing an honest job here: it lifts the qualifications, not the
 * inducements.
 *
 * ── ON THE COLOUR, WHICH IS TONE-DEPENDENT ON PURPOSE ───────────────
 * Gold is 11.4:1 on the deep ground and completely illegible on white,
 * where it lands near 1.5:1 and fails AA several times over. So the
 * deep ground gets gold and the light ground gets brand indigo, which
 * is around 11:1 on white. Both are accent colours from the same
 * palette; picking one and using it everywhere would mean shipping
 * unreadable small print on half the page.
 *
 * This is also the one place gold carries text below button size, which
 * the palette notes in globals.css otherwise rule out. It is deliberate
 * and it is bounded to this component: a few words of legal emphasis on
 * the deep ground, never body copy.
 * ────────────────────────────────────────────────────────────────────
 */
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function Mark({
  text,
  phrases,
  tone = "light",
  className,
}: {
  text: string;
  /** Exact substrings to lift. Matched case-sensitively, in order. */
  phrases: readonly string[];
  tone?: "light" | "deep";
  className?: string;
}) {
  if (phrases.length === 0) return <p className={className}>{text}</p>;

  const pattern = new RegExp(`(${phrases.map(escape).join("|")})`, "g");
  const parts = text.split(pattern);
  const lift = tone === "deep" ? "text-accent" : "text-brand";

  return (
    <p className={className}>
      {parts.map((part, i) =>
        // split() with one capture group puts the matches at odd indices.
        i % 2 === 1 ? (
          <strong key={i} className={`font-semibold ${lift}`}>
            {part}
          </strong>
        ) : (
          <span key={i}>{part as ReactNode}</span>
        )
      )}
    </p>
  );
}
