"use client";

/**
 * Cal.com INLINE embed (official embed snippet, no extra dependency).
 * Configure the event via `calLink` in client.config.ts
 * ("username/event-name"). Empty calLink hides the section.
 */
import { useEffect, useRef } from "react";
import { client } from "@/client.config";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

declare global {
  interface Window {
    Cal?: any;
  }
}

export function Booking() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!client.calLink || !ref.current) return;

    // Official Cal.com loader snippet (namespaced global queue)
    (function (C: any, A: string, L: string) {
      const p = function (a: any, ar: any) {
        a.q.push(ar);
      };
      const d = C.document;
      C.Cal =
        C.Cal ||
        function () {
          const cal = C.Cal;
          const ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api: any = function () {
              p(api, arguments);
            };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    window.Cal("init", "booking", { origin: "https://cal.com" });
    window.Cal.ns.booking("inline", {
      elementOrSelector: ref.current,
      calLink: client.calLink,
      layout: "month_view",
    });
    window.Cal.ns.booking("ui", {
      hideEventTypeDetails: false,
      layout: "month_view",
    });
  }, []);

  if (!client.calLink) return null;

  return (
    <section id="booking" className="band bg-surface-alt">
      <div className="section">
        <SectionHead
          heading={client.copy.bookingHeading}
          lede={client.copy.bookingBlurb}
        />
        <Reveal delay={0.08}>
          <div
            ref={ref}
            className="mt-8 min-h-[560px] overflow-hidden rounded border border-line bg-surface"
          />
        </Reveal>
      </div>
    </section>
  );
}
