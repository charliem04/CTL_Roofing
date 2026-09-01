import type { Metadata } from "next";
import { client } from "@/client.config";
import { isIndexable } from "@/lib/routes";
import { LegalPage } from "../legal";
import { robotsFor } from "@/lib/meta";

export const metadata: Metadata = {
  title: `Privacy Policy — ${client.businessName}`,
  // From the route registry, the same flag that keeps it out of the
  // sitemap — so the tag and the sitemap cannot drift apart.
  robots: robotsFor(isIndexable("/privacy/")),
};

/*
 * Written to describe what this site actually does, service by service,
 * rather than to cover every eventuality in the abstract. If the site
 * gains a processor — a CRM, a call-tracking provider, a chat widget —
 * this page has to gain a line, or it stops being true.
 *
 * It is not legal advice. Have CTL’s attorney read it before launch.
 */
const EFFECTIVE = "August 30, 2026";

/*
 * Job applications are deleted after this long, and an R2 lifecycle
 * rule does the deleting rather than a person remembering to. Three
 * places have to agree — change one, change all three:
 *
 *   1. this constant
 *   2. RETENTION_DAYS in workers/careers-upload/src/index.ts
 *   3. RETENTION_DAYS in workers/careers-upload/scripts/set-retention.sh
 *
 * Saying a number here that the bucket does not enforce is worse than
 * saying nothing.
 */
const APPLICATION_RETENTION = "twelve months";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>Effective {EFFECTIVE}</p>

      <p>
        This policy explains what {client.legalName} does with information
        collected through {client.siteUrl.replace("https://", "")}. We have
        tried to describe what actually happens rather than everything that
        conceivably could.
      </p>

      <h2>What you give us</h2>
      <p>
        The assessment request form asks for your name, phone number, the
        address of the property, the kind of work you need, and anything you
        want to tell us about it. That is the whole form — it does not ask
        for an email address, and there is no account to create.
      </p>
      <p>
        If you call or text either of our numbers, we have your phone number
        and whatever you tell us. If you book through the calendar, the
        scheduling provider collects whatever their booking form asks for.
      </p>
      <p>
        If you apply for a job, the application form asks for your name,
        phone number, an optional email address, a few questions about the
        work, and your résumé. That document is yours and it is the reason
        the rest of this section exists — it usually contains more about you
        than anything else this site collects.
      </p>

      <h2>What we do with it</h2>
      <p>
        We use it to call you back, arrange the assessment, quote the work,
        and carry it out. That means contacting you by phone, text or email
        about your request and the job that follows from it. We do not add
        you to a marketing list because you asked for a roof inspection.
      </p>

      <h2>Where it goes</h2>
      <p>
        A form submission is delivered to our office inbox by{" "}
        <strong>Web3Forms</strong>, a form-delivery service acting on our
        behalf. Where we have enabled it, the same details are also recorded
        in our customer-relationship system so a request does not get lost
        between people. Both process the information only to provide those
        services to us.
      </p>
      <p>
        The booking calendar is hosted by <strong>Calendly</strong>. It does
        not load until you either accept analytics or press the button on the
        booking panel — until then, nothing is sent to them. Once loaded, your
        use of the calendar is subject to Calendly’s own privacy policy.
      </p>
      <p>
        A job application does not go through a form service. The résumé is
        uploaded straight into our own private storage on{" "}
        <strong>Cloudflare R2</strong>, where only we can reach it — there is
        no public address for those files and no way to request one. The
        details you typed are emailed to the office alongside it so somebody
        knows it arrived.
      </p>
      <p>
        The site is hosted on <strong>Cloudflare Pages</strong>, which keeps
        standard server logs, including IP addresses, for security and
        operational purposes.
      </p>

      <h2>Analytics, and the banner</h2>
      <p>
        If you accept on the banner, we load <strong>Plausible Analytics</strong>{" "}
        to see which pages get used and where visitors arrive from. Plausible
        sets no cookies, collects no personal information, and does not follow
        you to other websites. If you decline, the script is never loaded at
        all.
      </p>
      <p>
        Your answer to that banner is stored in your own browser’s local
        storage so we stop asking. That is the only thing this site stores on
        your device. Clearing your browser data clears it, and the banner will
        ask again.
      </p>

      <h2>What we do not do</h2>
      <p>
        We do not sell your personal information, and we do not share it with
        anyone beyond the providers named above except where the law requires
        it. This site is not directed at children, and we do not knowingly
        collect information from them.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Job records — estimates, invoices, permits, photographs and the
        documents that go with them — are kept for as long as we need them for
        the work, the warranty and our legal and tax obligations. Inquiries
        that never became jobs are kept for a reasonable period and then
        cleared.
      </p>
      <p>
        <strong>Job applications are deleted after {APPLICATION_RETENTION}.</strong>{" "}
        That is enforced automatically by a rule on the storage itself, not by
        somebody remembering to tidy up, so it happens whether we think about
        it or not. If you would rather we did not keep yours that long, say
        so and we will delete it sooner.
      </p>
      <p>
        We do not store the internet address your application was sent from
        alongside it. What we keep on the file is a scrambled fingerprint of
        it, which lets us tell that a burst of junk applications came from one
        place without recording where that place is. The address itself is
        held separately for thirty days and then deleted.
      </p>

      <h2>Your choices</h2>
      <p>
        Ask us to correct or delete what we hold about you and we will, unless
        we are required to keep it. That includes a job application — ask and
        the résumé goes, rather than waiting out the {APPLICATION_RETENTION}.
        Ask us to stop contacting you and we will stop. Either way, write to{" "}
        {client.email} or call {client.phone}.
      </p>

      <h2>Changes</h2>
      <p>
        If we change how any of this works, we change this page and move the
        effective date at the top.
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
