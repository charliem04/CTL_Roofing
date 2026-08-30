import { client } from "@/client.config";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { btn } from "./Button";

/**
 * Manufacturers set as typographic entries under gold rules — no logo
 * cloud. These are real product lines CTL stocks, and a wall of
 * borrowed trademarks would say less than the names do.
 */
export function Brands() {
  return (
    <section className="band bg-surface-alt">
      <div className="section">
        <SectionHead heading={client.brands.heading} lede={client.brands.lede} />

        <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {client.brands.items.map((b, i) => (
            <Reveal key={b.name} delay={i * 0.06}>
              <div className="border-t-[3px] border-accent pt-4">
                <dt className="mb-1.5 font-display text-[23px] font-bold uppercase leading-none text-ink">
                  {b.name}
                </dt>
                <dd className="m-0 text-[15px]">{b.detail}</dd>
              </div>
            </Reveal>
          ))}
        </dl>

        <Reveal delay={0.1}>
          <a href="/services/" className={`mt-10 ${btn("ink")}`}>
            See what we install
          </a>
        </Reveal>
      </div>
    </section>
  );
}
