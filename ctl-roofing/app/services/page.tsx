import { getServicesHub } from "@/lib/content";
import { pageMetadata } from "@/lib/meta";
import { PageHero } from "@/components/PageHero";
import { ServiceCards } from "@/components/ServiceCards";
import { Process } from "@/components/Process";
import { CtaBand } from "@/components/CtaBand";

const hub = getServicesHub();

export const metadata = pageMetadata(hub.meta);

export default function ServicesPage() {
  return (
    <>
      <PageHero
        path={hub.meta.path}
        heading={hub.heading}
        lede={hub.lede}
        photo={hub.photo}
      />
      <section className="band bg-surface-alt">
        <div className="section">
          <ServiceCards />
        </div>
      </section>
      {/* How a project runs is the same on every one of them, so it is
          stated once here rather than repeated on all five children. */}
      <Process />
      <CtaBand cta={hub.cta} />
    </>
  );
}
