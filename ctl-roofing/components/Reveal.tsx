"use client";

/**
 * Scroll-reveal wrapper. Short-travel fade (12px, 400ms) the first time
 * content enters the viewport. Pass `delay` (seconds) to stagger
 * siblings, or use <RevealGroup> for cascade on lists/grids.
 * Respects prefers-reduced-motion (renders static).
 *
 * `as` picks the element it renders. It exists because the default div
 * is invalid inside a list: `<ul><Reveal><li>…` emits `<ul><div><li>`,
 * which axe flags as a broken list and which strips the list semantics
 * a screen reader announces ("list, 8 items"). Inside a <ul>, <ol> or
 * <dl>, pass the element the parent expects and move the <li> markup
 * onto the Reveal itself.
 */
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealAs = "div" | "li" | "figure";

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: RevealAs;
}) {
  const reduce = useReducedMotion();
  const Motion = motion[as];
  const Plain = as;

  if (reduce) return <Plain className={className}>{children}</Plain>;
  return (
    <Motion
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.4, delay, ease: [0.21, 0.65, 0.36, 1] }}
    >
      {children}
    </Motion>
  );
}

/** Cascade children with a fixed stagger step. */
export function RevealGroup({
  children,
  step = 0.06,
  className,
  itemClassName,
}: {
  children: ReactNode[];
  step?: number;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * step} className={itemClassName}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
