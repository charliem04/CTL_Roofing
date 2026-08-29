import { client } from "@/client.config";

/**
 * A thin gold shelf directly under the hero — the one band that breaks
 * the page's section rhythm, because after weather this is the only
 * thing on the page some visitors need.
 */
export function StormStrip() {
  return (
    <section className="bg-accent text-ink" aria-labelledby="storm-label">
      <div className="section flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-[18px]">
        <div>
          <h2
            id="storm-label"
            className="font-mono text-[12px] font-medium uppercase tracking-[0.09em] text-ink/60"
          >
            {client.storm.label}
          </h2>
          <p className="mt-1 max-w-[70ch] font-semibold text-ink">{client.storm.body}</p>
        </div>
        <a
          href={`tel:${client.stormPhoneHref}`}
          className="whitespace-nowrap border-b-2 border-ink/35 font-mono text-lg font-semibold tabular-nums text-ink no-underline transition-colors duration-150 hover:border-ink active:text-brand"
        >
          {client.stormPhone}
        </a>
      </div>
    </section>
  );
}
