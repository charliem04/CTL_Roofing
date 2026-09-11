import type { CtaCopy, Faq, PageMeta, Photo } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  INSURANCE — claims, adjusters and coverage
 *
 *  Split out of content/storm.ts. That page was carrying two arguments
 *  at once: what to do about the weather, and what to do about the
 *  carrier. They are different jobs, done by different people, on
 *  different clocks — the tarp is tonight, the claim is the next six
 *  weeks — so they are two pages now. /storm-damage/ owns the roof;
 *  this owns the paperwork. Each links to the other rather than
 *  restating it.
 *
 *  ⚠️ LEGAL CHECK BEFORE LAUNCH — in Louisiana, negotiating or settling
 *  a claim on a homeowner’s behalf is public adjusting and requires a
 *  licence (La. R.S. 22:1691 et seq.). This page is deliberately
 *  written so CTL documents, meets the adjuster on site, and scopes the
 *  repair, while the homeowner files and decides. Robert should confirm
 *  the language matches how they actually operate before this ships.
 *
 *  Everything here about policies is general and points the reader back
 *  at their own declarations page. No coverage promise is made.
 * ════════════════════════════════════════════════════════════════════
 */

export const insurance = {
  meta: {
    /*
     * The visible heading is "Insurance" and nothing else. The <title>
     * carries the two words somebody actually types — a document titled
     * "Insurance | CTL Pro Construction" competes with every carrier in
     * the state and tells a searcher nothing about what is on it.
     */
    title: "Roof Insurance Claims — Adjusters & Coverage",
    description:
      "How a roof insurance claim runs in Louisiana: opening it, what an adjuster looks for, what is covered, and where CTL stands in it.",
    path: "/insurance/",
  } satisfies PageMeta,

  heading: "Insurance",
  lede: "A roof claim is a separate job from the roof itself, with its own sequence and its own deadlines. This is how it runs, and where a contractor is allowed to stand in it.",

  /**
   * Two people standing in the driveway looking up at a tarped roof
   * while the crew works on it — which is the picture of this page:
   * the walkthrough, not the weather. The tarped-home shot belongs to
   * /storm-damage/ and the interior stain reads as a pale rectangle at
   * hero size, so neither is this one.
   */
  photo: {
    src: "/ctl/gallery/storm-tarps-yard.jpg",
    alt: "Two people in a driveway looking up at a storm-damaged roof while a crew works on it, tarps laid across the drive",
    width: 1100,
    height: 508,
  } satisfies Photo,

  /**
   * Opening the claim — the part that is the homeowner's to do, in the
   * order it has to happen. Step one used to live on the storm page as
   * the fourth of the first-48-hours steps; it is the hinge between the
   * two pages, so it opens this one.
   */
  filing: {
    heading: "Opening the claim",
    lede: "You open it, not a contractor. Four things done properly here save weeks later.",
    steps: [
      {
        title: "Document before you clean up",
        body: "Photos and video of everything, inside and out, before anything is moved, swept or thrown away. Wide shots that establish the property, then close-ups. This is the single highest-value hour you will spend on the claim, and it cannot be recreated later.",
      },
      {
        title: "Call your insurer, or use their app",
        body: "Write down the claim number, the adjuster’s name and the date of loss, and keep them somewhere you are not going to lose them. Everything after this references that claim number.",
      },
      {
        title: "Keep every receipt",
        body: "Tarping, a hotel night, a dehumidifier hire, the tree service. Emergency mitigation is usually reimbursable, but only against paper. Photograph the receipts as well as keeping them.",
      },
      {
        title: "Read before you sign anything",
        body: "Be careful about signing anything that assigns your claim or your insurance benefits to someone else. A work authorisation and an assignment of benefits are not the same document, and the second one hands your claim away.",
      },
    ],
  },

  /** What the adjuster is actually looking at when they get on the roof. */
  adjuster: {
    heading: "What an adjuster looks for",
    lede: "Knowing this is not gaming the system. It is the difference between a walkthrough that finds the damage and one that misses it.",
    items: [
      {
        label: "Date of loss",
        value:
          "Whether the damage is consistent with a specific storm on a specific date, rather than accumulated weather.",
      },
      {
        label: "Wind evidence",
        value:
          "Creased, lifted or missing shingles, unsealed tabs, and damage patterns that follow the wind direction across the slopes.",
      },
      {
        label: "Hail evidence",
        value:
          "Bruising and granule loss on the shingle mat, and matching strikes on soft metals: vents, gutters, flashing, HVAC fins.",
      },
      {
        label: "Interior damage",
        value:
          "Staining, wet insulation and anything that traces back to the same opening in the roof.",
      },
      {
        label: "Pre-existing condition",
        value:
          "Wear, age and prior repairs, which is what gets a claim reduced or denied. Photographic history helps you here.",
      },
      {
        label: "Code upgrades",
        value:
          "What current code requires that the old roof did not have. Whether that is payable depends on your policy’s ordinance-or-law coverage.",
      },
    ],
  },

  /** The role boundary, stated plainly. */
  role: {
    heading: "What we do — and what we don’t",
    does: {
      label: "CTL does",
      items: [
        "A full-scope assessment with photographs of what we found",
        "Meet your adjuster at the property and walk the roof with them",
        "Provide a written repair scope and estimate",
        "Supply our documentation to whoever you engage on the claim",
        "Do the work, and keep the documents on file afterwards",
      ],
    },
    doesNot: {
      label: "CTL does not",
      items: [
        "File the claim for you; you open it with your insurer",
        "Negotiate or settle the claim on your behalf; in Louisiana that is public adjusting and requires a license",
        "Ask you to sign over your claim or your insurance benefits",
        "Promise what your policy will pay before your insurer says so",
      ],
    },
  },

  /** Coverage generalities — always deferring to the policy itself. */
  coverage: {
    heading: "Typically covered, typically not",
    lede: "Your declarations page decides, not this website. But the pattern is consistent enough to be worth knowing before you call.",
    covered: {
      label: "Usually covered",
      items: [
        "Sudden damage from a named storm, straight-line wind or hail",
        "Falling limbs and wind-driven debris",
        "Interior damage that resulted from the opening in the roof",
        "Emergency mitigation, like tarping, done to stop the loss growing",
      ],
    },
    notCovered: {
      label: "Usually not",
      items: [
        "Wear, age and deferred maintenance",
        "Damage that predates the storm you are claiming for",
        "Work done before the adjuster saw it, with no documentation",
        "Cosmetic-only marks, where the policy excludes them",
      ],
    },
    note: "Louisiana policies commonly carry a separate named-storm or hurricane deductible calculated as a percentage of your dwelling coverage rather than a flat amount — which can be a much larger number than the deductible you are used to. Check your declarations page before you assume a claim is worth filing.",
  },

  /**
   * The gap between the settlement and the job, which is the question
   * this page raises and /financing/ answers. It is the reason this
   * page sits under Financing in the nav rather than beside the storm
   * page: for most people the claim ends in a number that does not
   * cover the whole thing.
   */
  gap: {
    heading: "When the settlement does not cover it",
    body: [
      "A deductible is yours by definition, and a named-storm deductible in Louisiana is often a percentage of dwelling coverage rather than a flat figure — a real number, on a house you are already trying to dry out.",
      "Depreciation is the other half. Many policies pay actual cash value first and release the rest once the work is done, which means the money arrives in two pieces and the second piece arrives after you have paid for the repair.",
      "Financing exists for that shape of problem: it bridges the gap so the roof gets fixed on the roof’s schedule rather than on the carrier’s. The packages are the same ones on the financing page — nothing about a claim changes the terms.",
    ],
  },

  faqs: [
    {
      q: "Should I file a claim at all?",
      a: "Not always. If the repair is likely to cost less than your deductible — and in Louisiana a named-storm deductible is often a percentage of dwelling coverage, not a flat figure — filing may cost you more than it returns. A free assessment gives you a written scope to compare against your deductible before you decide.",
    },
    {
      q: "Can you tell me what my insurance will pay?",
      a: "No, and be wary of anyone who does. We can document the damage thoroughly and give you a written scope. What that is worth under your policy is between you, your policy and your insurer.",
    },
    {
      q: "The adjuster is coming — should someone from CTL be there?",
      a: "Usually yes, and it costs you nothing. Two people looking at the same roof at the same time resolves far more than two reports written a week apart.",
    },
    {
      q: "My claim was denied or underpaid. Now what?",
      a: "You can ask your insurer to re-inspect, and you can engage a licensed public adjuster or an attorney to act for you — those are the people licensed to negotiate a claim in Louisiana. We can supply our documentation and scope to whoever you engage.",
    },
    {
      q: "How long do I have?",
      a: "Policies carry notice deadlines and Louisiana sets prescriptive periods for property-damage claims, and both can be shorter than people expect. Do not sit on it. Your policy and your insurer are the authority on your specific deadline.",
    },
    {
      q: "Do I have to use the contractor my insurer suggests?",
      a: "No. You choose who does the work on your property.",
    },
    {
      q: "Will tarping the roof hurt my claim?",
      a: "No — the opposite. Most policies expect you to prevent the loss growing, and a loss that got worse because nothing was done can be argued about. Photograph the damage thoroughly first, then stop the water, and keep the receipts.",
    },
    {
      q: "The settlement is less than the repair. What now?",
      a: "That is common, and usually deductible and depreciation rather than a mistake. Ask your insurer how the recoverable depreciation is released, and talk to us about financing the difference — the free assessment gives you a written scope to hold the two numbers against.",
    },
  ] satisfies Faq[],

  cta: {
    heading: "Get the damage documented",
    body: "The free roof and property assessment gives you photographs and a written scope — the two things every claim conversation runs on. Bring them to your adjuster.",
  } satisfies CtaCopy,
};
