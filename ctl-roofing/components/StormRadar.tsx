"use client";

import { useEffect, useRef, useState } from "react";
import { client } from "@/client.config";
import {
  radarLand,
  radarTowns,
  radarView,
  radarZones,
} from "@/lib/radarBasemap";
import {
  LOOP_MINUTES,
  centralTime,
  frameBudget,
  latestFrame,
  fetchAlerts,
  fetchRadarFrames,
  isWarning,
  isSevereKind,
  readSky,
  skyState,
  type NwsAlert,
  type RadarFrame,
  type SkyState,
} from "@/lib/nwsRadar";
import { StormWarnings } from "./StormWarnings";
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
  const dpr =
    typeof window === "undefined"
      ? 1
      : Math.min(window.devicePixelRatio || 1, 2);
  const want = Math.round((css * dpr) / 40) * 40;
  return Math.min(1400, Math.max(560, want));
}

/**
 * ════════════════════════════════════════════════════════════════════
 *  THE CROSSFADE, and why a plain one flickers.
 *
 *  The obvious way to change frames is to fade the outgoing one to zero
 *  while the incoming one comes up — and it pulses, visibly, at every
 *  step. The reason is compositing arithmetic rather than timing. Two
 *  stacked layers over the same patch of rain composite to
 *
 *      result = p_over + (1 - p_over) · p_under
 *
 *  and a symmetric dissolve holds p_over + p_under = 1, so halfway
 *  through, with both layers at 0.5, the rain renders at 0.75 — a 25%
 *  dip in and straight back out again, four or five times a second.
 *  That rhythm is the flicker. It is not the images disagreeing: two
 *  scans five minutes apart are nearly the same picture, which is
 *  precisely why the brightness pumping is the only thing the eye
 *  actually catches.
 *
 *  Solve that equation for result = 1 at every p_over and there is
 *  exactly one answer: p_under = 1 throughout. The outgoing frame has
 *  to stay FULLY opaque while the incoming one comes up over it.
 *
 *  ── SO THERE ARE THREE LAYERS, NOT TWO ──────────────────────────────
 *
 *    · the current frame, fading 0 → 1 on top
 *    · the one before it, pinned at 1 underneath — this is the layer
 *      that keeps the sum at 1 and kills the pulse
 *    · the one before that, fading 1 → 0 at the bottom
 *
 *  The bottom layer only ever contributes the rain the pinned layer
 *  does not already cover — the trailing edge of a cell that has since
 *  moved on — so it reads as a short persistence trail behind the
 *  weather, which is what a radar loop is supposed to look like. Every
 *  other frame sits at 0 with no transition and costs nothing.
 *
 *  ── EXCEPT WHEN THE VISITOR MOVES THE PLAYHEAD ──────────────────────
 *
 *  Everything above is about transitions the page performs to itself,
 *  and the rule for those is absolute: they repeat, so they may never
 *  dip. That includes the wrap from the newest frame back to the
 *  oldest, which an earlier draft of this treated as a dissolve and
 *  which measured as one 48% dip per lap — rarer than the per-frame
 *  pulse, and the same artifact.
 *
 *  A click on a tick is the one transition that is not the loop
 *  running. It happens once, the visitor asked for it, and it usually
 *  lands somewhere far away in the hour — so it gets an ordinary
 *  symmetric dissolve, slower, with nothing pinned. A dissolve is the
 *  conventional way two unrelated images replace one another, and
 *  holding an hour-old scan at full opacity under the newest one would
 *  read as a double exposure rather than as a transition.
 * ════════════════════════════════════════════════════════════════════
 */

/** One step of the loop. Just under the 220ms cadence, so motion barely rests. */
const FADE_STEP_MS = 200;

/** A wrap or a click. Long enough to read as a deliberate dissolve. */
const FADE_JUMP_MS = 320;

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
  /** null until read, and null again whenever the read cannot be trusted. */
  const [sky, setSky] = useState<SkyState | null>(null);
  /** Which frame is held at full opacity under the current one; -1 for none. */
  const [pinned, setPinned] = useState(-1);

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
      { rootMargin: "400px" },
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
      frameBudget(box?.clientWidth ?? 0),
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
        let usable = next.filter((_, i) => ok[i]);

        if (!usable.length && !next[0]?.untimed) {
          /* Every timestamped frame failed, which is what a stale time
             index looks like from here — the times were readable but
             nothing was rendered for them. One more try, with the
             request that lets the service choose its own raster. */
          const still = latestFrame(requestWidth(box));
          if (await preload(still.url)) usable = [still];
        }

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
        if (live && !ac.signal.aborted)
          setStatus((s) => (s === "ready" ? s : "failed"));
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

  /* ── Let the pinned layer go once the fade is over ──────────────
     The pin exists to stop the brightness dipping WHILE the incoming
     frame comes up. Left in place afterwards it becomes a different
     bug: two scans at full opacity simultaneously, so the map shows
     the union of where the rain is and where it was. That matters most
     exactly where it is least expected — the newest frame is held for
     780ms as the answer to the visitor's question, and for all of that
     hold it would have been the answer plus a ghost of five minutes
     ago. Releasing the pin on the fade's own duration leaves the held
     frame alone on screen, and the layer underneath fades out into the
     short persistence trail a radar loop ought to have. */
  useEffect(() => {
    if (pinned < 0) return;
    const id = window.setTimeout(() => setPinned(-1), FADE_STEP_MS);
    return () => window.clearTimeout(id);
    // `index` is a dependency because two consecutive steps can pin the
    // same frame number after a refetch, and the timer has to restart
    // for the second one rather than carry over from the first.
  }, [pinned, index]);

  /* ── Is it actually raining ────────────────────────────────────
     Read off a small dedicated raster rather than the display frames,
     and kept apart from them deliberately: this is the only request on
     the page that needs CORS, and a failure here has to cost the badge
     and nothing else. null means "could not tell", never "clear". */
  useEffect(() => {
    if (!armed) return;
    const ac = new AbortController();
    readSky(ac.signal)
      .then((read) => {
        if (!ac.signal.aborted) setSky(read ? skyState(read) : null);
      })
      .catch(() => setSky(null));
    return () => ac.abort();
  }, [armed, cycle]);

  /* ── Refresh, while the tab is actually being looked at ────────── */
  useEffect(() => {
    if (!armed) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setCycle((c) => c + 1);
    }, 6 * 60_000);
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
    const id = window.setTimeout(
      () => setIndex((i) => (i >= last ? 0 : i + 1)),
      /* 220ms a frame: thirteen scans read as an hour of weather moving
         in about three seconds, the pace a television loop runs at.

         The newest frame is held longer, because the loop shows the
         trend and the last frame is the answer, and an answer that
         flicks past at 220ms is not an answer. But the hold is a beat,
         not a stop: at the 1900ms this was first written with, the map
         spent more than 40% of every cycle motionless and read as
         frozen rather than as paused. 780ms is about three frame-times
         — long enough to land on, short enough that the loop is
         obviously still running. */
      index >= last ? 780 : 220
    );
    return () => window.clearTimeout(id);
  }, [playing, index, frames]);

  /**
   * Which frame stays pinned at full opacity under the current one, or
   * -1 for the plain dissolve. See the crossfade note above.
   *
   * Derived during render rather than in an effect, and this is load
   * bearing: an effect runs after the browser has already painted, so
   * for one frame the outgoing image would be neither current nor
   * pinned, drop toward zero, and be yanked back — the exact flicker
   * this is here to remove. Reading it from a ref gives the right
   * answer in the same paint the index changed in.
   *
   * The guard only fires when index or frames actually changed, so
   * re-running it on the same inputs is a no-op and a double render
   * produces the same answer as a single one.
   */
  const track = useRef({ frames, index, jump: false });
  if (track.current.index !== index || track.current.frames !== frames) {
    const last = track.current;
    // A refetch remaps every index, so a frame from the previous set is
    // never a legitimate thing to pin under the new one.
    const sameSet = last.frames === frames;
    // The wrap counts as the loop advancing, not as a jump. Measured in
    // a browser, leaving it as a symmetric dissolve put one 48%
    // brightness dip into every lap — rarer than the per-frame pulse
    // this whole mechanism exists to remove, and the same artifact. A
    // transition the page performs to itself, over and over, is never
    // allowed to dip; the restart is already legible from the 780ms
    // hold on the newest frame and the ticks snapping back to the left.
    const advanced =
      sameSet &&
      (index === last.index + 1 ||
        (index === 0 && last.index === frames.length - 1));
    track.current = { frames, index, jump: !advanced };
    setPinned(advanced ? last.index : -1);
  }
  // Read off the last move rather than off whether a pin is currently
  // alive, so the pin expiring below cannot change the duration of a
  // fade that is already running.
  const fadeMs = track.current.jump ? FADE_JUMP_MS : FADE_STEP_MS;

  const current = frames[index];
  const newest = frames.length ? frames[frames.length - 1] : undefined;
  const warning = alerts?.some(isWarning) ?? false;
  const severe = alerts?.filter(isSevereKind) ?? [];

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

        {frames.map((frame, i) => {
          const showing = i === index;
          const holding = i === pinned;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={frame.url}
              src={frame.url}
              alt=""
              aria-hidden
              width={radarView.width}
              height={radarView.height}
              // Linear, not eased. An ease-out on the incoming layer
              // front-loads the fade, which over a continuous loop
              // reads as a stutter at every join — the frames are a
              // constant-rate sequence and the fade between them has to
              // be one too.
              className="absolute inset-0 h-full w-full transition-opacity ease-linear"
              style={{
                opacity: showing || holding ? 1 : 0,
                // The pinned layer must sit under the incoming one and
                // over the one fading out, or the arithmetic above
                // describes a different stack than the browser draws.
                zIndex: showing ? 3 : holding ? 2 : 1,
                transitionDuration: `${fadeMs}ms`,
              }}
            />
          );
        })}

        <TownLabels />

        {/* Over the labels, so it is never half-hidden behind a town
            name, and only once there is a map under it to describe. */}
        {status === "ready" && frames.length > 0 && (
          <SkyBadge sky={sky} alerts={alerts} />
        )}

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

      {/* ── Time, transport, legend ───────────────────────────────
          Two clusters, pushed to the two edges of the map above them:
          the controls on the left, the two reference captions on the
          right. Below `sm` they stack and both read left, because at
          that width justifying them apart would put six characters in
          one corner and six in the other with a hole in between. */}
      <div className="mt-4 flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
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

          {/* A fixed measure, because this text changes on every frame
            and everything to the right of it would otherwise shuffle
            sideways once a second. "12:44 PM CT · replay" is the widest
            it gets in normal running, at 20 characters; the font is
            monospaced, so the measure is counted in ch. The fallback
            line is longer and simply overruns it, which is fine —
            there are no ticks beside it in that state.

            23ch and not 20, because the row carries 0.04em of tracking
            and a ch unit knows nothing about it: twenty characters
            actually measure twenty ch plus 0.8em. At 21ch the ticks
            still crept two pixels every loop. */}
          <p className="m-0 inline-block min-w-[23ch] font-mono text-[13px] tracking-[0.04em] text-ink-invert">
            {!current ? (
              <span className="text-ink-invert-soft">—</span>
            ) : current.untimed ? (
              /* The service picked this frame, so we know it is current
               and we do not know what time it is valid for. Printing a
               clock time here would be inventing one. */
              <>
                Latest scan
                {frames.length === 1 && (
                  <span className="text-ink-invert-soft">
                    {" "}
                    · history unavailable
                  </span>
                )}
              </>
            ) : (
              <>
                {centralTime(current.time)} CT
                <span className="text-ink-invert-soft">
                  {current === newest ? " · latest scan" : " · replay"}
                </span>
              </>
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
                    key={frame.url}
                    type="button"
                    aria-label={
                      frame.untimed
                        ? "Latest radar scan"
                        : `Radar at ${centralTime(frame.time)} Central`
                    }
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
            </div>
          )}
        </div>

        <div
          className={`flex flex-wrap items-center gap-x-6 gap-y-3 sm:justify-end ${
            frames.length ? "" : "hidden"
          }`}
        >
          {frames.length > 1 && (
            <p className="m-0 font-mono text-[11px] uppercase tracking-[0.09em] text-ink-invert-soft">
              Last hour
            </p>
          )}
          <div className="flex items-center gap-3">
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
      </div>

      {/* ── Where it comes from, and what it is not ─────────────── */}
      <p className="mt-6 max-w-[74ch] text-[15px] leading-[1.6] text-ink-invert-soft">
        Base reflectivity from the National Weather Service, refreshed every few
        minutes, over {parishes(radarZones.map((z) => z.parish))}. Parish
        outlines from the US Census Bureau. This is a picture of where the rain
        is, not a warning service — for warnings, use{" "}
        <a
          href={NWS_OFFICE}
          rel="noopener"
          target="_blank"
          className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent active:text-accent-press"
        >
          NWS Lake Charles
        </a>{" "}
        and your parish alert system.
        {/* Only when the briefing below is NOT carrying the number.
            A warning that is not severe-kind — a winter or heat product,
            say — still deserves the storm line, but printing it here
            and again six inches lower during a hurricane reads as a
            pitch rather than as help. */}
        {warning && severe.length === 0 && (
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

      {/* Only once the feed has actually answered. Rendering the resting
          state off a null would print "nothing severe is headed for the
          parishes we serve" before anybody had checked. */}
      {alerts !== null && <StormWarnings severe={severe} />}
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
/**
 * The corner badge — what the sky is doing, in two words.
 *
 * ── WHY IT DOES NOT JUST REPEAT THE ALERT PANEL ─────────────────────
 *
 * "No watches or warnings" and "it is not raining" are different facts
 * and the gap between them is most of the year. The overwhelming
 * majority of weather that matters to a roof — the afternoon cell that
 * finds a bad flashing detail, the front that soaks a deck somebody
 * left open — never earns a National Weather Service product. A badge
 * that read the alerts feed alone would sit on ALL CLEAR above a map
 * that was visibly half green, and a visitor only has to catch that
 * once to stop believing anything else on the page.
 *
 * So the badge reads the radar (see readSky) and lets an active alert
 * override it, because an alert is the one thing more important than
 * what the pixels say.
 *
 * ── AND WHY IT IS QUIET WHEN IT CANNOT TELL ─────────────────────────
 *
 * A failed read arrives as null, never as zero coverage, and null falls
 * back to reporting the alerts alone in the alerts' own words. The one
 * sentence this component must never produce is a confident "clear"
 * assembled out of a request that did not come back.
 *
 * Gold is reserved here exactly as it is everywhere else on the site:
 * filled for the thing you act on, outlined for the thing you note,
 * and absent from the states that are merely information. Clear skies
 * are not an action.
 */
function SkyBadge({
  sky,
  alerts,
}: {
  sky: SkyState | null;
  alerts: NwsAlert[] | null;
}) {
  const warning = alerts?.some(isWarning) ?? false;
  const watch = (alerts?.length ?? 0) > 0 && !warning;

  // Priority order: the paperwork outranks the pixels, and an unread
  // sky outranks a guess.
  const state: {
    label: string;
    tone: "act" | "note" | "info";
    detail: string;
  } | null = warning
    ? { label: "Warning in effect", tone: "act", detail: "over the parishes we serve" }
    : watch
      ? { label: "Watch in effect", tone: "note", detail: "over the parishes we serve" }
      : sky === "storms"
        ? { label: "Storms on radar", tone: "note", detail: "heavy returns over the area" }
        : sky === "rain"
          ? { label: "Rain over the area", tone: "info", detail: "widespread returns" }
          : sky === "isolated"
            ? { label: "Isolated showers", tone: "info", detail: "scattered returns" }
            : sky === "clear"
              ? { label: "Skies clear", tone: "info", detail: "no returns on the radar" }
              : alerts && alerts.length === 0
                ? // The radar read failed but the alerts feed answered.
                  // Say only the part we actually know.
                  { label: "No active alerts", tone: "info", detail: "radar check unavailable" }
                : null;

  if (!state) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`absolute right-3 top-3 z-[5] flex items-center gap-2 rounded border px-3 py-2 backdrop-blur-sm ${
        state.tone === "act"
          ? "border-accent bg-accent text-ink"
          : state.tone === "note"
            ? "border-accent/55 bg-surface-deep/85 text-ink-invert"
            : "border-line-dark/25 bg-surface-deep/85 text-ink-invert"
      }`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          state.tone === "act"
            ? "bg-ink"
            : state.tone === "note"
              ? "bg-accent"
              : sky === "clear"
                ? "bg-ink-invert"
                : "bg-ink-invert-soft"
        }`}
      />
      <span className="font-mono text-[10px] uppercase leading-none tracking-[0.09em] sm:text-[11px]">
        {state.label}
      </span>
      {/* The badge is two words by design; the sentence it stands for
          goes to anyone reading it with something other than eyes. */}
      <span className="sr-only"> — {state.detail}.</span>
    </div>
  );
}

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
                <span
                  className={severe ? "text-ink/70" : "text-ink-invert-soft"}
                >
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
      .map((l, i) => (
        <path key={i} d={l.d} vectorEffect="non-scaling-stroke" />
      ));

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
