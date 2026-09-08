import type { CtaCopy, Faq, PageMeta, Photo } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  STORM DAMAGE PREVENTION & RESTORATION
 *
 *  The claim half of this page moved to content/insurance.ts. The two
 *  jobs run on different clocks — the tarp is tonight, the claim is the
 *  next six weeks — and were fighting each other for the top of one
 *  page. This one is about the building: what to do before the season,
 *  what to do in the first 48 hours, and how the repair actually runs.
 *  It links to /insurance/ at the point where the paperwork starts
 *  rather than restating it.
 *
 *  Nothing here promises what a policy will pay. Coverage language
 *  lives on the insurance page, where the licence caveat lives with it.
 * ════════════════════════════════════════════════════════════════════
 */

export const storm = {
  meta: {
    title: "Storm Damage Prevention & Restoration",
    description:
      "How to get a roof ready before hurricane season in Acadiana, what to do in the first 48 hours after storm damage, and how CTL runs the restoration from tarp to final walkthrough.",
    path: "/storm-damage/",
  } satisfies PageMeta,

  heading: "Storm damage prevention & restoration",
  lede: "Two jobs, in this order: keep the next storm from finding a way in, and get the water stopped and the house rebuilt when one does.",

  photo: {
    src: "/ctl/storm-tarped-home.jpg",
    alt: "A two-story brick home with tarps draped over the roof edge and debris on the lawn after storm damage",
    width: 1200,
    height: 554,
  } satisfies Photo,

  /**
   * The card that points here from the services grid. Storm work is not
   * a /services/ child page — it has its own top-level page — so its
   * card is described here rather than in the services array, which
   * generates those child pages.
   *
   * Items are the short form of `restoration` below; nothing is claimed
   * here that is not claimed there. The label is shorter than the page
   * heading because it sits in a card and a nav dropdown, both of which
   * are narrower than a headline.
   */
  card: {
    label: "Storm Damage & Restoration",
    columns: [
      {
        items: [
          "Emergency tarping and leak stop",
          "Water removal and property dry-out",
          "Full-scope damage assessment, with photos",
          "Repair and rebuild, roof through interior",
        ],
      },
    ],
  },

  /**
   * Prevention. First on the page because it is the only part a reader
   * can act on when nothing has happened yet, and because the last item
   * — photographing an undamaged roof — is worth more to a future claim
   * than anything they can do after the fact.
   */
  prevention: {
    heading: "Before the season",
    lede: "Most of what fails in a hurricane was already loose in June. None of this takes a contractor except the first one.",
    items: [
      {
        title: "Have the roof looked at while it is dry",
        body: "Lifted or unsealed shingles, tired flashing at the walls and chimney, soft decking, ridge vents that were never fastened properly. These are cheap to fix in fair weather and are exactly where wind starts.",
      },
      {
        title: "Clear the water’s way off the roof",
        body: "Blocked gutters and valleys back water up under the shingles in a heavy band of rain, which is a leak with no wind involved at all. Downspouts should discharge away from the slab, not beside it.",
      },
      {
        title: "Cut back what can reach the house",
        body: "Overhanging limbs are the most common source of puncture damage in this part of the state, and dead limbs come down in far less wind than people expect.",
      },
      {
        title: "Tie down or bring in what can fly",
        body: "Patio furniture, trampolines, loose sheet metal, unsecured panels on a shed. Debris damage is usually your own yard arriving at your own roof.",
      },
      {
        title: "Photograph the roof now, while it is intact",
        body: "A dated set of photographs of an undamaged roof is the single best answer to “this was pre-existing”, and it costs you twenty minutes on a clear day.",
      },
      {
        title: "Know the two numbers before you need them",
        body: "Your named-storm deductible and the storm line. Neither is a thing to be looking up at 2am with water coming through a ceiling.",
      },
    ],
  },

  /** The first 48 hours, in the order they actually matter. */
  firstHours: {
    heading: "The first 48 hours",
    lede: "In this order. The middle two are the ones people skip and regret.",
    steps: [
      {
        title: "Make it safe",
        body: "Downed lines, standing water near outlets, sagging ceilings. Nothing else on this list is worth an injury — if the structure looks unsound, stay out of it.",
      },
      {
        title: "Document before you clean up",
        body: "Photos and video of everything, inside and out, before anything is moved, swept or thrown away. Wide shots that establish the property, then close-ups. This is the single highest-value hour you will spend, and it cannot be recreated later.",
      },
      {
        title: "Stop the water",
        body: "Tarping and leak stop is emergency mitigation, and most policies expect you to do it — a loss that grows because nothing was done can be argued about. Keep the receipts for whatever it costs.",
      },
      {
        title: "Open the claim yourself",
        body: "Call your insurer or use their app, and write down the claim number, the adjuster’s name and the date of loss. You open it, not a contractor. The insurance page has the rest of that sequence.",
      },
    ],
  },

  /**
   * The restoration sequence. This is the half of the old page that was
   * only ever implied — the role list said CTL does the work, and then
   * the page went back to talking about adjusters. Somebody with a
   * tarped roof wants to know what the next six weeks look like.
   */
  restoration: {
    heading: "How the restoration runs",
    lede: "From the call to the last walkthrough. Steps two and three usually overlap; nothing else in this list does.",
    steps: [
      {
        title: "Make safe and stop the water",
        body: "Tarping and leak stop, around the clock. This is not the repair — it is what keeps the repair from getting bigger overnight, and it is what most policies expect of you.",
      },
      {
        title: "Dry the building out",
        body: "Standing water out, saturated insulation and unsalvageable material removed, and the assembly dried before anything is closed back up. Wet framing shut behind new sheetrock is a mould problem you will meet again next year.",
      },
      {
        title: "Full-scope assessment, photographed",
        body: "Roof, envelope and interior, with the photographs that support it. You get a written scope of what we found and what it takes to put right — the document every other conversation about this house will run on.",
      },
      {
        title: "Scope agreed, work scheduled",
        body: "Once the scope and the money are settled — insurer, financing, or straight out of pocket — the job goes on the calendar with a written estimate against it. After a wide-area storm this is the step where the honest answer is a queue position rather than a date.",
      },
      {
        title: "Repair and rebuild",
        body: "Roof system first, because nothing inside is worth doing twice. Then the envelope and the interior: decking, framing and carpentry, sheetrock, paint, and whatever else the water reached.",
      },
      {
        title: "Walkthrough, and the file stays on file",
        body: "We walk it with you at the end, and the photographs, scope and invoices stay on record afterwards — which is what you need if the claim reopens or the house sells.",
      },
    ],
  },

  faqs: [
    {
      q: "How fast can you get out after a storm?",
      a: "Emergency tarping and leak stop is around the clock on the storm line, and active water gets triaged first. After a wide-area event everyone in Acadiana is calling at once — we would rather give you a real place in the queue than a date we cannot keep.",
    },
    {
      q: "Will a tarp hold until the repair?",
      a: "A properly installed tarp buys time, not a season. It is there to stop the loss growing while the scope, the claim or the materials get sorted out.",
    },
    {
      q: "Should I tarp before the adjuster has seen it?",
      a: "Yes. Photograph everything thoroughly first, then stop the water — most policies expect you to prevent the loss growing, and the photographs are what preserve the evidence you covered up.",
    },
    {
      q: "Do you handle the inside as well as the roof?",
      a: "Yes. Water removal and dry-out, then decking, framing, sheetrock, paint and carpentry. The roof is the cause; the ceiling is usually what the homeowner actually has to live with.",
    },
    {
      q: "Is there anything worth doing before hurricane season?",
      a: "An assessment while the roof is dry, gutters and valleys cleared, limbs cut back, loose items secured, and a dated set of photographs of the roof while it is undamaged. The last one costs nothing and is the best answer there is to a “pre-existing damage” argument later.",
    },
    {
      q: "Is the assessment free after a storm?",
      a: "Yes. The free roof and property assessment gives you photographs and a written scope, whether or not the work goes through a claim and whether or not you use us for the repair.",
    },
  ] satisfies Faq[],

  cta: {
    heading: "Get the damage documented",
    body: "The free roof and property assessment gives you photographs and a written scope — the two things every conversation about this house will run on, whether that is with an insurer, a lender or a buyer. If water is coming in now, call the storm line instead.",
  } satisfies CtaCopy,
};
