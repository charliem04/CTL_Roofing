import type { CtaCopy, Faq, PageMeta, Photo } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  STORM DAMAGE & INSURANCE CLAIMS
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

export const storm = {
  meta: {
    title: "Storm Damage & Insurance Claims — What To Do First",
    description:
      "What to do in the first 48 hours after storm damage in Acadiana, what an adjuster looks for on a roof, what CTL does during a claim, and what policies typically cover and don’t.",
    path: "/storm-damage/",
  } satisfies PageMeta,

  heading: "Storm damage & insurance claims",
  lede: "After weather, the roof is only half the problem. This is how the other half — the claim — actually runs, and where we fit in it.",

  photo: {
    src: "/ctl/storm-tarped-home.jpg",
    alt: "A two-story brick home with tarps draped over the roof edge and debris on the lawn after storm damage",
    width: 1200,
    height: 554,
  } satisfies Photo,

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
        body: "Photos and video of everything, inside and out, before anything is moved, swept or thrown away. Wide shots that establish the property, then close-ups. This is the single highest-value hour you will spend on the claim, and it cannot be recreated later.",
      },
      {
        title: "Stop the water",
        body: "Tarping and leak stop is emergency mitigation, and most policies expect you to do it — a loss that grows because nothing was done can be argued about. Keep the receipts for whatever it costs.",
      },
      {
        title: "Open the claim yourself",
        body: "Call your insurer or use their app, and write down the claim number, the adjuster’s name and the date of loss. You open it, not a contractor — and be careful about signing anything that assigns your claim or your benefits to someone else.",
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
          "Bruising and granule loss on the shingle mat, and matching strikes on soft metals — vents, gutters, flashing, HVAC fins.",
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
        "Emergency tarping and leak stop, around the clock",
        "A full-scope assessment with photographs of what we found",
        "Meet your adjuster at the property and walk the roof with them",
        "Provide a written repair scope and estimate",
        "Do the work, and keep the documents on file afterwards",
      ],
    },
    doesNot: {
      label: "CTL does not",
      items: [
        "File the claim for you — you open it with your insurer",
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
  ] satisfies Faq[],

  cta: {
    heading: "Get the damage documented",
    body: "The free roof and property assessment gives you photographs and a written scope — the two things every claim conversation runs on. If water is coming in now, call the storm line instead.",
  } satisfies CtaCopy,
};
