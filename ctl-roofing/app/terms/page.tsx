import type { Metadata } from "next";
import { client } from "@/client.config";
import { isIndexable } from "@/lib/routes";
import { LegalPage } from "../legal";
import { robotsFor } from "@/lib/meta";

export const metadata: Metadata = {
  title: `Terms of Service — ${client.businessName}`,
  // From the route registry, the same flag that keeps it out of the
  // sitemap — so the tag and the sitemap cannot drift apart.
  robots: robotsFor(isIndexable("/terms/")),
};

/*
 * These terms cover the website, not the construction contract. The
 * separation is deliberate and load-bearing: the signed scope of work
 * governs the job, and nothing a visitor reads here should be capable
 * of contradicting it.
 *
 * It is not legal advice. Have CTL’s attorney read it before launch —
 * particularly the claims-role and limitation sections.
 */
const EFFECTIVE = "August 30, 2026";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>Effective {EFFECTIVE}</p>

      <p>
        These terms cover your use of{" "}
        {client.siteUrl.replace("https://", "")}, operated by{" "}
        {client.legalName}. They do not govern any construction work — that is
        governed by the written scope and contract you sign before work
        begins. Where the two ever appear to disagree, the signed contract
        wins.
      </p>

      <h2>What this site is</h2>
      <p>
        A description of what we do and a way to reach us. The information
        here is general. Roofs, buildings and insurance policies differ, and
        nothing on this site is advice about your specific property until
        someone from CTL has been on it.
      </p>

      <h2>Estimates and prices</h2>
      <p>
        Nothing on this site is a quote or an offer to contract. Prices come
        from a written estimate produced after an assessment, and only that
        written estimate binds either of us.
      </p>

      <h2>Financing figures</h2>
      <p>
        Where this site shows an estimated monthly payment, it is an
        illustration produced from the terms shown beside it, assuming the
        whole project cost is financed with nothing down. It is not an offer
        of credit, not a prequalification, and not a promise of any rate.
        What you are actually offered is the lender’s decision, on the
        lender’s terms.
      </p>

      <h2>Insurance claims</h2>
      <p>
        We document storm damage, meet your adjuster at the property, and
        provide a written repair scope. We do not file, negotiate or settle
        insurance claims on your behalf — in Louisiana that is public
        adjusting and requires a license we do not hold and do not claim to.
        Nothing on this site is legal advice or insurance advice, and nothing
        here predicts what your policy will pay. Your policy and your insurer
        decide that.
      </p>

      <h2>Booking and contacting us</h2>
      <p>
        Booking a slot reserves an assessment, not a crew or a job date. We
        may need to reschedule for weather, which in this line of work happens
        rather than might happen. Submitting the form or booking a time does
        not create a contract between us.
      </p>

      <h2>Emergency response</h2>
      <p>
        The storm line is answered around the clock, and we will get to
        emergencies as fast as we can. After a widespread weather event that
        can still be a queue. If the situation is dangerous, call emergency
        services rather than a roofer.
      </p>

      <h2>Warranty</h2>
      <p>
        Completed work carries a 5-year labor warranty from CTL, alongside
        whatever manufacturer warranty comes with the materials. The terms
        that apply to your job are the ones in your written agreement; this
        page is a description of them, not the warranty itself.
      </p>

      <h2>Photographs and content</h2>
      <p>
        The text, photographs and design on this site belong to{" "}
        {client.legalName} unless credited otherwise, and the project
        photographs are of our own work. Please do not reproduce them without
        asking. Product and manufacturer names belong to their owners and
        appear here to say what we install.
      </p>

      <h2>Links to other sites</h2>
      <p>
        We link out to a scheduling provider, a review page and social
        accounts. Those are run by other people under their own terms, and we
        are not responsible for them.
      </p>

      <h2>Availability and accuracy</h2>
      <p>
        We keep this site accurate and available, but we do not guarantee it
        is free of errors or never down. To the fullest extent the law allows,{" "}
        {client.legalName} is not liable for loss arising from use of this
        website. Nothing in these terms limits liability for the work we
        actually perform — that sits with your contract and with Louisiana
        law.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the State of Louisiana.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The effective date at the top reflects the
        current version.
      </p>

      <h2>Contact</h2>
      <p>
        {client.legalName}
        <br />
        {client.address.street}, {client.address.city}, {client.address.region}{" "}
        {client.address.postalCode}
        <br />
        {client.email} · {client.phone}
      </p>
    </LegalPage>
  );
}
