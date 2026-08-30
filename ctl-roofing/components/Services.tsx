import { client } from "@/client.config";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

/**
 * Four cards on a 12-column field, alternating 7/5 and 5/7 so the row
 * break falls in a different place each time — a services board, not
 * an equal-weight tile grid. Each card leads with the work itself.
 */
export function Services() {
  return (
    <section id="services" className="band bg-surface-alt">
      <div className="section">
        <SectionHead
          heading={client.copy.servicesHeading}
          lede={client.copy.servicesLede}
        />

        <div className="mt-10 grid gap-6 md:grid-cols-12">
          {client.services.map((s) => (
            <Reveal
              key={s.title}
              className={s.span === "wide" ? "md:col-span-7" : "md:col-span-5"}
            >
              <article className="flex h-full flex-col overflow-hidden rounded border border-line bg-surface transition-colors duration-200 hover:border-brand-soft active:border-brand">
                <figure className="m-0 bg-surface-deep-alt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.imageAlt}
                    loading="lazy"
                    width={820}
                    height={640}
                    className={`w-full object-cover ${
                      s.span === "wide" ? "h-[280px]" : "h-[230px]"
                    }`}
                  />
                </figure>

                <div className="px-6 pb-10 pt-6">
                  <h3 className="mb-4 text-display-3">{s.title}</h3>
                  <div
                    className={`grid gap-6 ${
                      s.columns.length > 1 ? "sm:grid-cols-2" : ""
                    }`}
                  >
                    {s.columns.map((col, i) => (
                      <div key={col.label ?? i}>
                        {col.label && <p className="u-label mb-2.5">{col.label}</p>}
                        <ul className="ticks m-0 list-none space-y-2 p-0">
                          {col.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
