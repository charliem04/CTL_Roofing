"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { client } from "@/client.config";
import { btn } from "./Button";
import { Parallax } from "./Parallax";
import { RevealText } from "./RevealText";
import { useScrollMotion, useStillness } from "@/lib/useScrollMotion";
import { cascade, dur, ease, stagger, travel } from "@/lib/motion";

export function Hero() {
  const reduce = useStillness();
  const scrollMotion = useScrollMotion();
  const ref = useRef<HTMLElement>(null);

  /**
   * The hero is the one band that animates on load rather than on
   * entry — it is already on screen, so there is nothing to wait for.
   * Everything below it uses whileInView instead.
   */
  const anim = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: travel.md },
          animate: { opacity: 1, y: 0 },
          transition: { duration: dur.base, delay, ease: ease.out },
        };

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // The ground darkens as the hero leaves, so the headline stays legible
  // against a photograph that is drifting underneath it, and the band
  // hands off to the gold storm shelf rather than just ending.
  const veil = useTransform(scrollYProgress, [0, 1], [0, 0.45]);

  return (
    <section id="top" className="on-deep relative overflow-hidden bg-surface-deep" ref={ref}>
      {/* The photo is the ground, not an illustration beside the copy:
          a real Acadiana job in progress, scrimmed left-to-right so the
          headline sits on ink and the work stays visible on the right.

          Parallax sits inside its own positioned wrapper rather than
          taking `absolute` on itself — it applies `relative`, and two
          position utilities on one element is a coin flip decided by
          stylesheet order. */}
      <div className="absolute inset-0">
        <Parallax className="h-full w-full" distance={80}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ctl/hero.jpg"
            width={1500}
            height={652}
            alt="A CTL crew replacing the roof on a two-story home in Acadiana"
            className="h-full w-full object-cover object-[58%_42%]"
          />
        </Parallax>
      </div>

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(96deg, rgb(var(--surface-deep) / 0.96) 0%, rgb(var(--surface-deep) / 0.9) 38%, rgb(var(--surface-deep) / 0.5) 68%, rgb(var(--surface-deep) / 0.28) 100%)",
        }}
      />

      {scrollMotion && (
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-surface-deep"
          style={{ opacity: veil }}
        />
      )}

      <div className="section relative pb-[clamp(56px,8vw,96px)] pt-[clamp(60px,9vw,104px)]">
        <RevealText
          as="h1"
          className="max-w-[14ch] text-display-1 text-ink-invert"
          lines={[
            client.tagline,
            <em key="emphasis" className="not-italic text-accent">
              {client.taglineEmphasis}
            </em>,
          ]}
        />

        <motion.p
          {...anim(stagger.loose * 2)}
          className="mt-6 max-w-[48ch] text-[clamp(17px,1.5vw,20px)] text-ink-invert-soft"
        >
          {client.subheadline}
        </motion.p>

        <motion.div {...anim(stagger.loose * 3)} className="mt-10 flex flex-wrap gap-2.5">
          <a href={client.bookingUrl || "/contact/"} className={btn("gold")}>
            {client.copy.heroCta}
          </a>
          {/* The office, not the storm line. This is the generic "call
              us" button; the storm band directly below carries the
              around-the-clock number, labelled as such. */}
          <a href={`tel:${client.phoneHref}`} className={btn("lineDeep")}>
            {client.copy.heroSecondaryCta} {client.phone}
          </a>
        </motion.div>

        {/* Four facts a homeowner actually weighs, in the mono register
            the rest of the site uses for figures. They arrive one after
            the next rather than as a block: the row reads left to right,
            so it is built left to right. */}
        <motion.dl
          {...anim(stagger.loose * 4)}
          className="mt-10 flex flex-wrap gap-x-[42px] gap-y-4 border-t border-line-dark/20 pt-6 font-mono text-[12px] uppercase tracking-[0.09em] text-ink-invert-soft/85"
        >
          {client.copy.heroFacts.map((f, i) => (
            <motion.div
              key={f.label}
              className="flex gap-2"
              {...(reduce
                ? {}
                : {
                    initial: { opacity: 0, y: travel.sm },
                    animate: { opacity: 1, y: 0 },
                    transition: {
                      duration: dur.base,
                      delay: stagger.loose * 4 + cascade(i),
                      ease: ease.out,
                    },
                  })}
            >
              <dt className="font-semibold text-accent">{f.value}</dt>
              <dd className="m-0">{f.label}</dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
