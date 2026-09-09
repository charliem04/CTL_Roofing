"use client";

import { useEffect, useRef, useState } from "react";
import { client } from "@/client.config";
import { radarLand, radarTowns, radarView, radarZones } from "@/lib/radarBasemap";
import {
  LOOP_MINUTES,
  centralTime,
  frameBudget,
  fetchAlerts,
  fetchRadarFrames,
  isWarning,
  type NwsAlert,
  type RadarFrame,
} from "@/lib/nwsRadar";
import { useStillness } from "@/lib/useScrollMotion";
import { btn } from "./Button";

/**
 * ════════════════════════════════════════════════════════════════════
 *  THE LIVE RADAR on /storm-damage/.
 *
 *  Three things stacked in one frame, in this order from the back:
 *
 *    1. Our own map. Parish outlines drawn from committed path data
 *       (lib/radarBasemap.ts) in the site's palette, with the six
 *       parishes CTL works in lifted out of the surrounding land.
 *    2. The last hour of NWS base reflectivity, sampled every five
 *       minutes, as transparent PNGs from a federal image service.
 *    3. Town markers and labels, in HTML rather than SVG text so a
 *       label is the same number of real pixels on a phone as on a
 *       desktop instead of scaling down into a smear.
 *
 *  Above all of it: whatever the National Weather Service currently has
 *  out over those six parishes, which on most days is nothing, and on
 *  the day it is not is the most useful sentence on this page.
 *
 *  ── WHAT IT DOES NOT DO, DELIBERATELY ───────────────────────────────
 *
 *  It does not pan or zoom. A general-purpose weather app is a solved
 *  problem and this is not an attempt at one — it is the frame over
 *  Acadiana, held still, answering one question. A pinch-zoom map on a
 *  marketing page mostly succeeds at trapping the scroll.
 *
 *  It does not load anything until it is scrolled to, and it draws the
 *  newest scan before the rest of the hour has arrived. An hour of
 *  radar is thirteen PNGs on a desktop and nine on a phone, because the
 *  visitor this page was built for is on cellular in a parish that may
 *  have just lost power: nothing is requested until the frame is nearly
 *  on screen, the request is sized to the box it will be drawn in, and
 *  a browser reporting a metered or 2g connection gets the short loop.
 *
 *  It does not claim to be a warning system. The copy says so, the
 *  attribution line says where the data comes from, and every failure
 *  path ends at the NWS's own radar rather than at an error.
 * ════════════════════════════════════════════════════════════════════
 */

/** The official NWS radar for the office that covers Acadiana. */
const NWS_RADAR = "https://radar.weather.gov/station/KLCH/standard";
const NWS_OFFICE = "https://www.weather.gov/lch/";

/**
 * The reflectivity ramp, sampled from the service's own output rather
 * than copied from the textbook NEXRAD scale — MRMS does not use the
 * textbook scale, and a legend whose colours are not the colours above
 * it is worse than no legend at all. Sampled with a canvas readback
 * over a frame with weather in it; re-sample if NOAA ever restyles the
 * service. Blue is barely raining, green is rain, amber upwards is the
 * part that takes shingles off.
 */
const LEGEND = [
  { color: "#4A68A4", label: "Very light" },
  { color: "#59BCBE", label: "Light rain" },
  { color: "#44D685", label: "Rain" },
  { color: "#13D61F", label: "Steady rain" },
  { color: "#095F09", label: "Heavy rain" },
  { color: "#FFC900", label: "Thunderstorm" },
  { color: "#FF9D00", label: "Intense" },
  { color: "#C10000", label: "Severe" },
];

type Status = "idle" | "loading" | "ready" | "failed";

/** "Acadia, Iberia and Vermilion Parishes" — never a trailing comma list. */
function parishes(names: string[]): string {
  const noun = names.length === 1 ? "Parish" : "Parishes";
  if (names.length < 2) return `${names.join("")} ${noun}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]} ${noun}`;
}

/**
 * Pixel width to ask the image service for.
 *
 * Rounded to the nearest 40 so that a browser resize, or one visitor's
 * 1273px column against another's 1280px, does not mint a whole new set
 * of URLs that nothing has cached.
 */
function requestWidth(el: HTMLElement | null): number {
  const css = el?.clientWidth || 900;
  const dpr = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  const want = Math.round((css * dpr) / 40) * 40;
  return Math.min(1400, Math.max(560, want));
}

/**
 * Resolves true when the frame is decodable, false when it is not.
 *
 * A radar frame that failed to load renders as an empty transparent
 * layer, which on this map is indistinguishable from a clear sky. That
 * is the one thing this component must never show, so frames are
 * decoded before they are put in the loop and the failures are dropped.
 */
function preload(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export function StormRadar() {
  const boxRef = useRef<HTMLDivElement>(null);
  const still = useStillness();

  const [armed, setArmed] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [alerts, setAlerts] = useState<NwsAlert[] | null>(null);

  /* ── Nothing happens until the map is nearly on screen ─────────── */
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setArmed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ── The frames ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!armed) return;
    const ac = new AbortController();
    let live = true;
    setStatus((s) => (s === "ready" ? s : "loading"));

    const box = boxRef.current;
    fetchRadarFrames(
      ac.signal,
      requestWidth(box),
      frameBudget(box?.clientWidth ?? 0)
    )
      .then(async (next) => {
        /* ── Newest first, then the rest ──────────────────────────
           An hour of radar is thirteen images, and waiting for all
           thirteen before drawing any of them means the map sits empty
           for as long as the slowest one takes. The visitor's actual
           question — is it raining on my house right now — is answered
           by the last frame alone, so that one is fetched, shown and
           left holding while the history fills in behind it. The loop
           starts when the set is complete; nothing on screen jumps when
           it does, because the frame being displayed is still the
           newest one. */
        const newest = next[next.length - 1];
        if (await preload(newest.url)) {
          if (!live || ac.signal.aborted) return;
          setFrames([newest]);
          setIndex(0);
          setStatus("ready");
        }

        // The newest is already in the cache; this re-resolves it for
        // free and keeps the indexing honest.
        const ok = await Promise.all(next.map((f) => preload(f.url)));
        const usable = next.filter((_, i) => ok[i]);
        if (!live || ac.signal.aborted) return;
        if (!usable.length) throw new Error("no frame decoded");
        setFrames(usable);
        setIndex(usable.length - 1);
        setStatus("ready");
      })
      .catch(() => {
        // A refresh that fails leaves the frames already on screen
        // alone. They are an hour old at worst, and an hour-old radar
        // beats an error message where a map was.
        if (live && !ac.signal.aborted) setStatus((s) => (s === "ready" ? s : "failed"));
      });

    return () => {
      live = false;
      ac.abort();
    };
  }, [armed, cycle]);

  /* ── The alerts ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!armed) return;
    const ac = new AbortController();
    fetchAlerts(ac.signal)
      .then((next) => {
        if (!ac.signal.aborted) setAlerts(next);
      })
      .catch(() => {
        // Left as null, which renders nothing. An alert panel that says
        // "could not check for warnings" is worse than an absent one:
        // it invites the reader to conclude something from a gap.
      });
    return () => ac.abort();
  }, [armed, cycle]);

  /* ── Refresh, while the tab is actually being looked at ────────── */
  useEffect(() => {
    if (!armed) return;
    const id = window.setInterval(
      () => {
        if (document.visibilityState === "visible") setCycle((c) => c + 1);
      },
      6 * 60_000
    );
    return () => window.clearInterval(id);
  }, [armed]);

  /* ── Playback ──────────────────────────────────────────────────── */
  useEffect(() => {
    // Somebody who has asked their system for less motion gets the
    // current frame, not a loop, and the play button still works.
    if (still) setPlaying(false);
  }, [still]);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const last = frames.length - 1;
    // A longer hold on the newest frame: the loop exists to show which
    // way the weather is moving, and the answer is read off the end of
    // it. Without the pause the eye never settles on now.
    const id = window.setTimeout(
      () => setIndex((i) => (i >= last ? 0 : i + 1)),
      // 220ms a frame: thirteen scans read as an hour of weather moving
      // in about three seconds, which is the pace a television loop
      // runs at. The long hold on the newest frame is what stops it
      // being a flicker — the loop shows the trend, the hold is the
      // answer, and the eye needs a moment on the answer.
      index >= last ? 1900 : 220
    );
    return () => window.clearTimeout(id);
  }, [playing, index, frames]);

  const current = frames[index];
  const newest = frames.length ? frames[frames.length - 1] : undefined;
  const warning = alerts?.some(isWarning) ?? false;

  return (
    <div className="mt-10">
      <AlertPanel alerts={alerts} />

      {/* ── The map ─────────────────────────────────────────────── */}
      <div
        ref={boxRef}
        className="relative mt-7 w-full overflow-hidden rounded border border-line-dark/20 bg-surface-deep"
        style={{ aspectRatio: `${radarView.width} / ${radarView.height}` }}
      >
        <Basemap />

        {frames.map((frame, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={frame.time}
            src={frame.url}
            alt=""
            aria-hidden
            width={radarView.width}
            height={radarView.height}
            className="absolute inset-0 h-full w-full transition-opacity duration-150 ease-out"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}

        <TownLabels />

        {status === "loading" && !frames.length && (
          <p className="absolute inset-x-0 bottom-4 text-center font-mono text-[11px] uppercase tracking-[0.09em] text-ink-invert-soft">
            Loading the last {LOOP_MINUTES} minutes…
          </p>
        )}

        {status === "failed" && !frames.length && (
          /* The honest empty state. The map underneath is still drawn
             and still says where the parishes are; only the rain is
             missing, so this says that and points at the NWS. */
          <div className="absolute inset-0 grid place-items-center p-6">
            <p className="max-w-[38ch] border border-line-dark/25 bg-surface-deep/95 p-5 text-center text-base">
              The radar feed isn’t answering right now.{" "}
              <a
                href={NWS_RADAR}
                rel="noopener"
                target="_blank"
                className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent active:text-accent-press"
              >
                Open the National Weather Service radar
              </a>
              .
            </p>
          </div>
        )}
      </div>

      {/* ── Time, transport, legend ─────────────────────────────── */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          disabled={frames.length < 2}
          className={`${btn("lineDeep", "sm")} disabled:pointer-events-none disabled:opacity-40`}
        >
          {/* Reads Play whenever nothing is looping, including when the
              feed is down — a disabled Pause describes a state the page
              is not in. */}
          <span aria-hidden className="font-mono text-[13px] leading-none">
            {playing && frames.length > 1 ? "❚❚" : "▶"}
          </span>
          {playing && frames.length > 1 ? "Pause" : "Play"}
          <span className="sr-only"> the radar loop</span>
        </button>

        <p className="m-0 font-mono text-[13px] tracking-[0.04em] text-ink-invert">
          {current ? (
            <>
              {centralTime(current.time)} CT
              <span className="text-ink-invert-soft">
                {current === newest ? " · latest scan" : " · replay"}
              </span>
            </>
          ) : (
            <span className="text-ink-invert-soft">—</span>
          )}
        </p>

        {frames.length > 1 && (
          /* Captioned the way the legend beside it is. A row of ticks
             says "there is a sequence"; it does not say how much time
             the sequence covers, and an hour is the fact that makes the
             loop mean anything. */
          <div className="flex items-center gap-3">
            <div
              role="group"
              aria-label="Radar frames"
              className="flex items-end gap-1"
            >
              {frames.map((frame, i) => (
                <button
                  key={frame.time}
                  type="button"
                  aria-label={`Radar at ${centralTime(frame.time)} Central`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => {
                    setPlaying(false);
                    setIndex(i);
                  }}
                  className={`w-2.5 rounded-none border-0 transition-colors duration-150 ease-out active:translate-y-px ${
                    i === index
                      ? "h-5 bg-accent"
                    : "h-3 bg-ink-invert-soft/35 hover:bg-ink-invert-soft/70"
                  }`}
                />
              ))}
            </div>
            <p className="m-0 font-mono text-[11px] uppercase tracking-[0.09em] text-ink-invert-soft">
              Last hour
            </p>
          </div>
        )}

        <div className={`flex items-center gap-3 ${frames.length ? "" : "hidden"}`}>
          <div aria-hidden className="flex">
            {LEGEND.map((step) => (
              <i
                key={step.color}
                title={step.label}
                className="block h-2.5 w-4"
                style={{ background: step.color }}
              />
            ))}
          </div>
          <p className="m-0 font-mono text-[11px] uppercase tracking-[0.09em] text-ink-invert-soft">
            Light → severe
          </p>
        </div>
      </div>

      {/* ── Where it comes from, and what it is not ─────────────── */}
      <p className="mt-6 max-w-[74ch] text-[15px] leading-[1.6] text-ink-invert-soft">
        Base reflectivity from the National Weather Service, refreshed every few
        minutes, over{" "}
        {parishes(radarZones.map((z) => z.parish))}. Parish outlines from the US Census Bureau.
        This is a picture of where the rain is, not a warning service — for
        warnings, use{" "}
        <a
          href={NWS_OFFICE}
          rel="noopener"
          target="_blank"
          className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent active:text-accent-press"
        >
          NWS Lake Charles
        </a>{" "}
        and your parish alert system.
        {warning && (
          <>
            {" "}
            If a warning above is over your address and water is already coming
            in, the storm line is{" "}
            <a
              href={`tel:${client.stormPhoneHref}`}
              className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent active:text-accent-press"
            >
              {client.stormPhone}
            </a>
            .
          </>
        )}
      </p>
    </div>
  );
}

/**
 * Active watches and warnings over the served parishes.
 *
 * Three states and all three are worth rendering. Null is "we have not
 * heard back yet" and shows nothing at all. Empty is the common case
 * and is genuinely useful information on a page about storms — it is
 * the sentence somebody came here hoping to read. Non-empty is the
 * loudest block on the page, and warnings are louder than watches:
 * gold filled against gold outlined, which is the same distinction the
 * rest of the site draws between an action and a note.
 */
function AlertPanel({ alerts }: { alerts: NwsAlert[] | null }) {
  if (!alerts) return null;

  if (!alerts.length) {
    return (
      <p className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-[3px] border-l-line-dark/30 py-1 pl-5 text-base">
        <span className="font-mono text-[12px] uppercase tracking-[0.09em] text-ink-invert">
          All clear
        </span>
        <span>
          No National Weather Service watches or warnings are active over the
          parishes we serve.
        </span>
      </p>
    );
  }

  return (
    <ul className="m-0 grid list-none gap-3 p-0">
      {alerts.map((alert) => {
        const severe = isWarning(alert);
        // The NWS omits `ends` on some products and sends it unparseable
        // on none — but a NaN printed as a time is a worse answer than
        // no time at all, so it is checked rather than trusted.
        const parsed = alert.ends ? Date.parse(alert.ends) : NaN;
        const ends = Number.isFinite(parsed) ? parsed : undefined;
        return (
          <li
            key={alert.id}
            className={
              severe
                ? "grid gap-x-6 gap-y-1 bg-accent p-5 text-ink sm:grid-cols-[auto_1fr] sm:items-baseline"
                : "grid gap-x-6 gap-y-1 border border-accent/40 border-l-[3px] border-l-accent p-5 sm:grid-cols-[auto_1fr] sm:items-baseline"
            }
          >
            <h3
              className={`text-display-3 ${severe ? "text-ink" : "text-accent"}`}
            >
              {alert.event}
            </h3>
            <p className={`m-0 text-base ${severe ? "text-ink" : ""}`}>
              {parishes(alert.parishes)}
              {ends !== undefined && (
                <span className={severe ? "text-ink/70" : "text-ink-invert-soft"}>
                  {" · until "}
                  {centralTime(ends)} CT
                </span>
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The land under the rain, in three passes back to front: the
 * neighbouring states, then Louisiana, then the six parishes. Each pass
 * is a step brighter, so the service area reads as the subject of the
 * map without a key explaining it.
 *
 * The six are marked by a brighter land tone inside a gold boundary,
 * not by a gold fill. A gold wash over the ink ground at any alpha low
 * enough to read the rain through is a desaturated olive, and against
 * periwinkle land it looks like a hole punched in Louisiana rather than
 * the part being pointed at. Brightness does the emphasis, gold draws
 * the line, and the rain stays the most saturated thing in the frame —
 * which it has to be, because it is the reason anybody is looking.
 *
 * Strokes are non-scaling: this SVG is drawn at anything from 340 to
 * 1150 real pixels wide, and a hairline that scaled with it would be
 * invisible on a phone and heavy on a desktop.
 */
function Basemap() {
  const pass = (filter: (l: (typeof radarLand)[number]) => boolean) =>
    radarLand
      .filter(filter)
      // vector-effect is not an inherited property, so it goes on every
      // path rather than once on the group around them.
      .map((l, i) => <path key={i} d={l.d} vectorEffect="non-scaling-stroke" />);

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${radarView.width} ${radarView.height}`}
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <g
        fill="rgb(var(--brand-soft) / 0.16)"
        stroke="rgb(var(--brand-soft) / 0.30)"
        strokeWidth="0.75"
      >
        {pass((l) => !l.la)}
      </g>
      <g
        fill="rgb(var(--brand-soft) / 0.26)"
        stroke="rgb(var(--brand-soft) / 0.45)"
        strokeWidth="0.75"
      >
        {pass((l) => !!l.la)}
      </g>
      <g
        fill="rgb(var(--brand-soft) / 0.46)"
        stroke="rgb(var(--accent) / 0.7)"
        strokeWidth="1.4"
      >
        {pass((l) => !!l.served)}
      </g>
    </svg>
  );
}

/**
 * Town markers, and their labels.
 *
 * The dots are SVG because they have to sit exactly on a projected
 * coordinate. The labels are HTML, positioned as a percentage of the
 * same box, because SVG text scales with the viewBox: at 1150px wide a
 * 12px label is 12px, and on a 360px phone it would be four.
 *
 * Below the `sm` breakpoint only Lafayette is named. Six labels inside
 * 340 pixels is not a map with more information on it, it is a smear.
 */
function TownLabels() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg
        viewBox={`0 0 ${radarView.width} ${radarView.height}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {radarTowns.map((t) => (
          <circle
            key={t.name}
            cx={t.x}
            cy={t.y}
            r={t.home ? 5 : 3}
            vectorEffect="non-scaling-stroke"
            fill={t.home ? "rgb(var(--accent))" : "rgb(var(--ink-invert))"}
            fillOpacity={t.faint ? 0.45 : 1}
            stroke="rgb(var(--ink) / 0.75)"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {radarTowns.map((t) => {
        // Default is centred under the marker; `right` sets the label
        // beside it instead, for the pairs too close to stack.
        const right = t.place === "right";
        return (
          <span
            key={t.name}
            className={`absolute whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.07em] md:text-[11px] ${
              right ? "-translate-y-1/2" : "-translate-x-1/2"
            } ${
              t.home
                ? "font-medium text-accent"
                : t.faint
                  ? "hidden text-ink-invert-soft/70 sm:block"
                  : "hidden text-ink-invert-soft sm:block"
            }`}
            style={{
              left: `${((t.x + (right ? 9 : 0)) / radarView.width) * 100}%`,
              top: `${((t.y + (right ? 0 : 12)) / radarView.height) * 100}%`,
              textShadow: "0 1px 3px rgb(var(--ink))",
            }}
          >
            {t.name}
          </span>
        );
      })}
    </div>
  );
}
