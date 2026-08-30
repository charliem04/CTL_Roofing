"use client";

import { motion, useReducedMotion } from "framer-motion";
import { client } from "@/client.config";
import { btn } from "./Button";

export function Hero() {
  const reduce = useReducedMotion();
  const anim = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: [0.21, 0.65, 0.36, 1] as const },
        };

  return (
    <section id="top" className="on-deep relative overflow-hidden bg-surface-deep">
      {/* The photo is the ground, not an illustration beside the copy:
          a real Acadiana job in progress, scrimmed left-to-right so the
          headline sits on ink and the work stays visible on the right. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ctl/hero.jpg"
        width={1500}
        height={652}
        alt="A CTL crew replacing the roof on a two-story home in Acadiana"
        className="absolute inset-0 h-full w-full object-cover object-[58%_42%]"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(96deg, rgb(var(--surface-deep) / 0.96) 0%, rgb(var(--surface-deep) / 0.9) 38%, rgb(var(--surface-deep) / 0.5) 68%, rgb(var(--surface-deep) / 0.28) 100%)",
        }}
      />

      <div className="section relative pb-[clamp(56px,8vw,96px)] pt-[clamp(60px,9vw,104px)]">
        <motion.h1 {...anim(0)} className="max-w-[14ch] text-display-1 text-ink-invert">
          {client.tagline}
          <em className="block not-italic text-accent">{client.taglineEmphasis}</em>
        </motion.h1>

        <motion.p
          {...anim(0.08)}
          className="mt-6 max-w-[48ch] text-[clamp(17px,1.5vw,20px)] text-ink-invert-soft"
        >
          {client.subheadline}
        </motion.p>

        <motion.div {...anim(0.16)} className="mt-10 flex flex-wrap gap-2.5">
          <a href={client.bookingUrl || "#contact"} className={btn("gold")}>
            {client.copy.heroCta}
          </a>
          <a href={`tel:${client.stormPhoneHref}`} className={btn("lineDeep")}>
            {client.copy.heroSecondaryCta} {client.stormPhone}
          </a>
        </motion.div>

        {/* Four facts a homeowner actually weighs, in the mono register
            the rest of the site uses for figures. */}
        <motion.dl
          {...anim(0.24)}
          className="mt-10 flex flex-wrap gap-x-[42px] gap-y-4 border-t border-line-dark/20 pt-6 font-mono text-[12px] uppercase tracking-[0.09em] text-ink-invert-soft/85"
        >
          {client.copy.heroFacts.map((f) => (
            <div key={f.label} className="flex gap-2">
              <dt className="font-semibold text-accent">{f.value}</dt>
              <dd className="m-0">{f.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
