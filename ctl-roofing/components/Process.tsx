import { client } from "@/client.config";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { MoreLink } from "./MoreLink";

/**
 * Four steps under ruled tops — the first rule gold so the eye starts
 * where the job starts — then the four promises that hold for every
 * job, set as one boxed register rather than four floating cards.
 */
export function Process() {
  const { process } = client;
  return (
    <section id="process" className="band bg-surface">
      <div className="section">
        <SectionHead heading={process.heading} lede={process.lede} />

        <ol className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {process.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.06}>
              <li
                className={`border-t-[3px] pt-6 ${
                  i === 0 ? "border-accent" : "border-brand"
                }`}
              >
                <span className="mb-2.5 block font-mono text-[13px] tracking-[0.08em] text-brand-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mb-2.5 text-display-3">{step.title}</h3>
                <p className="text-base">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.1}>
          {/* gap-px over a line-colored ground: the cells are separated
              by one hairline in every layout, with no doubled rules */}
          <dl className="mt-10 grid gap-px rounded border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {process.promises.map((p) => (
              <div key={p.title} className="bg-surface p-6">
                <dt className="mb-2.5 font-display text-[19px] font-bold uppercase text-ink">
                  {p.title}
                </dt>
                <dd className="m-0 text-[15px]">{p.body}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-10">
            <MoreLink href="/case-studies/">See how it ran on real jobs</MoreLink>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
