"use client";

import { client } from "@/client.config";
import {
  alertKind,
  centralTime,
  isWarning,
  type AlertKind,
  type NwsAlert,
} from "@/lib/nwsRadar";
import { btn } from "./Button";

/**
 * ════════════════════════════════════════════════════════════════════
 *  THE SEVERE WEATHER BRIEFING, under the radar.
 *
 *  The panel above the map answers "is there anything out". This one
 *  answers the two questions somebody asks immediately afterwards, and
 *  that a list of product names cannot: WHEN does it get here, and what
 *  does it do to a roof.
 *
 *  ── WHY IT IS A SECOND BLOCK AND NOT A LONGER FIRST ONE ─────────────
 *
 *  The panel over the map has to stay one glance wide — on the day it
 *  matters, the reader is on a phone, on cellular, possibly in the
 *  dark, and the first thing they need is four words. Hail size, gust
 *  speed, the National Weather Service's own safety text and a phone
 *  number are all the right information and all the wrong thing to put
 *  between someone and the map. So the glance goes above and the
 *  briefing goes below, where scrolling to it is a decision.
 *
 *  ── WHAT COUNTS AS SEVERE ───────────────────────────────────────────
 *
 *  Filtered by isSevereKind before it gets here: tornado, tropical,
 *  hail, damaging wind, and flash flood warnings. A Dense Fog Advisory
 *  is a real product and is not this. The bar is deliberately high,
 *  because a section that lights up for fog is a section the reader
 *  learns to scroll past before the day it says Tornado Warning.
 *
 *  ── AND WHY THE SAFETY TEXT IS QUOTED, NOT WRITTEN ──────────────────
 *
 *  The instruction paragraph is the NWS's, verbatim, attributed. A
 *  roofing company does not compose its own tornado advice, and a
 *  paraphrase of a federal safety instruction is a liability with no
 *  upside. We pass it through and say whose it is.
 *
 *  The resting state is deliberate too. It renders a single quiet line
 *  rather than nothing at all: a block that exists only during a
 *  hurricane is a block nobody has ever seen work, and the line itself
 *  is the sentence a reader on this page came hoping for.
 * ════════════════════════════════════════════════════════════════════
 */

/**
 * The mono label register, written out rather than borrowed from
 * `.u-label`.
 *
 * `.on-deep .u-label` sets `color` directly at specificity 0,2,0, so it
 * beats a `text-accent` utility on the same element — the exact trap
 * the comment above that rule in globals.css describes, which is how
 * `u-label text-accent` silently renders periwinkle. These labels have
 * to be gold: one marks the section the gold rule belongs to, the other
 * is the urgency line on a tornado card.
 */
const GOLD_LABEL =
  "font-mono text-[12px] font-medium uppercase tracking-[0.09em] text-accent";

/** Plain-language framing of the CAP urgency field. */
function whenLabel(alert: NwsAlert): string {
  const onset = alert.onset ? Date.parse(alert.onset) : NaN;
  const startsLater = Number.isFinite(onset) && onset > Date.now() + 60_000;

  if (alert.urgency === "Immediate") return "Happening now";
  if (startsLater) return "On the way";
  if (alert.urgency === "Expected") return "Expected shortly";
  if (alert.urgency === "Future") return "On the way";
  return isWarning(alert) ? "In effect now" : "Being watched";
}

/**
 * What this kind of weather does to a roof, in one line.
 *
 * CTL's own words, about roofs — not a restatement of the hazard, which
 * the event name already gave. This is the half of the briefing a
 * roofing company is actually qualified to add.
 */
const ROOF_NOTE: Record<AlertKind, string> = {
  tornado:
    "Take cover first. Nothing on a roof is worth being outside for — we can look at it afterwards.",
  hurricane:
    "Secure what is loose and stay off the roof. Tarping in wind does more harm than the leak does.",
  hail:
    "Hail bruises shingles without breaking them, so the damage is often invisible from the ground and still voids the roof's remaining life. Worth an inspection once it passes.",
  wind:
    "Wind lifts shingles at the edges and ridges first. Missing tabs after a blow are the thing to look for.",
  flood:
    "Water in the house during a storm is not always the roof — but if it is coming in at a ceiling, it is.",
  thunderstorm:
    "Worth a look afterwards if you hear anything hit the roof.",
  other: "",
};

/** The measured tags the NWS attaches — hail size, gust, detection. */
function tagsFor(alert: NwsAlert): string[] {
  const tags: string[] = [];
  const inches = Number.parseFloat(alert.hail ?? "");
  if (Number.isFinite(inches)) {
    tags.push(`Hail to ${inches}″`);
  }
  if (alert.gust) tags.push(`Gusts ${alert.gust}`);
  if (alert.tornado) {
    // "OBSERVED" means somebody has seen one. That is not the same
    // sentence as "radar indicated" and must not be flattened into it.
    tags.push(
      alert.tornado.toUpperCase() === "OBSERVED"
        ? "Tornado observed"
        : "Radar indicated",
    );
  }
  if (alert.damage) {
    tags.push(`${alert.damage[0]}${alert.damage.slice(1).toLowerCase()} damage threat`);
  }
  return tags;
}

/** "Acadia, Iberia and Vermilion Parishes" — never a trailing comma list. */
function parishes(names: string[]): string {
  const noun = names.length === 1 ? "Parish" : "Parishes";
  if (names.length < 2) return `${names.join("")} ${noun}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]} ${noun}`;
}

export function StormWarnings({ severe }: { severe: NwsAlert[] }) {
  if (!severe.length) {
    return (
      <section
        aria-label="Severe weather"
        className="mt-8 border-t border-line-dark/20 pt-6"
      >
        <p className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[15px] text-ink-invert-soft">
          <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-ink-invert">
            Severe weather
          </span>
          <span>
            Nothing severe is headed for the parishes we serve. This section
            fills in when the National Weather Service puts out a tornado,
            tropical, hail or damaging-wind product over the area.
          </span>
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Severe weather"
      className="mt-8 border-t-[3px] border-accent pt-7"
    >
      <p className={`${GOLD_LABEL} m-0`}>
        Severe weather — {severe.length === 1 ? "1 product" : `${severe.length} products`}{" "}
        active
      </p>

      <ul className="m-0 mt-5 grid list-none gap-4 p-0">
        {severe.map((alert) => {
          const kind = alertKind(alert);
          const tags = tagsFor(alert);
          const note = ROOF_NOTE[kind];
          // Checked rather than trusted: a NaN rendered as a clock time
          // is a worse answer than no time at all.
          const parsed = alert.ends ? Date.parse(alert.ends) : NaN;
          const ends = Number.isFinite(parsed) ? parsed : undefined;

          return (
            <li
              key={alert.id}
              className="border border-line-dark/20 border-l-[3px] border-l-accent bg-surface-deep-alt p-6 sm:p-7"
            >
              <p className={`${GOLD_LABEL} m-0`}>{whenLabel(alert)}</p>

              <h3 className="mt-2.5 text-display-3 text-ink-invert">
                {alert.event}
              </h3>

              <p className="m-0 mt-2 text-[15px] text-ink-invert-soft">
                {parishes(alert.parishes)}
                {ends !== undefined && <> · until {centralTime(ends)} CT</>}
              </p>

              {tags.length > 0 && (
                <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="border border-accent/45 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.07em] text-accent"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}

              {alert.instruction && (
                <blockquote className="m-0 mt-5 border-l border-line-dark/25 pl-5">
                  <p className="m-0 text-[15px] leading-[1.6] text-ink-invert-soft">
                    {alert.instruction}
                  </p>
                  <p className="m-0 mt-2 font-mono text-[11px] uppercase tracking-[0.09em] text-ink-invert-soft/70">
                    — National Weather Service
                  </p>
                </blockquote>
              )}

              {note && (
                <p className="m-0 mt-5 text-[15px] leading-[1.6] text-ink-invert">
                  {note}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* One action, at the bottom of the whole block rather than
          repeated inside every card: there is one phone number and
          printing it four times during a hurricane reads as a pitch. */}
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a href={`tel:${client.stormPhoneHref}`} className={btn("gold")}>
          Storm line — {client.stormPhone}
        </a>
        <p className="m-0 max-w-[46ch] text-[14px] leading-[1.5] text-ink-invert-soft">
          Once it has passed and it is safe to be outside. If water is coming in
          now, call — do not wait for the weather to clear.
        </p>
      </div>
    </section>
  );
}
