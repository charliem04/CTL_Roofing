import type { ServicePage } from "./types";

/**
 * ════════════════════════════════════════════════════════════════════
 *  SERVICES — the hub and its five child pages.
 *
 *  Copy rule for this file: nothing here asserts anything about CTL
 *  that CTL has not said about itself. Trade explanation is general and
 *  true; anything operational (warranty length, showroom, storm line,
 *  free assessment) traces back to client.config.ts.
 * ════════════════════════════════════════════════════════════════════
 */

export const servicesHub = {
  meta: {
    title: "Services — Roofing, Remodeling, Commercial",
    description:
      "Full-service roofing and construction in Acadiana: roof replacement and repair, remodeling and restoration, outdoor living and commercial roofing.",
    path: "/services/",
  },
  heading: "Not just roofing",
  lede: "Roofs are where most projects start. Decks, siding, windows, patios and interiors are where a lot of them end up — and it is the same crew, the same production team and the same paperwork either way.",
  photo: {
    src: "/ctl/crew-two-story.jpg",
    alt: "A CTL crew working on the roof of a two-story home",
    width: 1200,
    height: 652,
  },
  cta: {
    heading: "Not sure which one you need?",
    body: "Start with the free roof and property assessment. We look at the whole property, tell you what needs doing now and what can wait, and put it in writing.",
  },
};

export const services: ServicePage[] = [
  {
    slug: "roofing",
    span: "wide",
    navLabel: "Roofing",
    meta: {
      title: "Roofing — Shingle, Standing Seam & Flat Roofs",
      description:
        "Roof replacement and repair across Acadiana: architectural shingles, concealed-fastener standing seam metal and flat roofing. 5-year labor warranty.",
      path: "/services/roofing/",
    },
    heading: "Roofing",
    lede: "Replacement, repair and maintenance for shingle, standing seam metal and flat roofs — built from the deck up, not just from the top down.",
    summary:
      "Shingle, standing seam metal and flat roofing for homes across Acadiana, plus repairs and maintenance.",
    photo: {
      src: "/ctl/roofing-metal-aerial.jpg",
      alt: "Aerial view of a large home mid-roof — one wing finished in dark standing seam metal, the rest still in underlayment",
      width: 1200,
      height: 900,
    },
    sections: [
      {
        heading: "What we install",
        columns: [
          {
            label: "Residential",
            items: [
              "Architectural shingle roofing",
              "Standing seam metal",
              "Flat roofs",
              "Repairs and maintenance",
            ],
          },
          {
            label: "Also available",
            items: [
              "Full roof replacement after storm damage",
              "Decking repair and re-sheathing",
              "Flashing, vents and pipe boots",
              "Gutters and drainage tie-ins",
            ],
          },
        ],
        photo: {
          src: "/ctl/service-roofing.jpg",
          alt: "Aerial view of a brick home mid-roof, one wing finished in dark standing seam metal and the main slopes still in underlayment",
          width: 820,
          height: 569,
          caption: "Metal and shingle, one house",
        },
      },
      {
        heading: "What goes on before the roof",
        photo: {
          src: "/ctl/gallery/tearoff-decking.jpg",
          alt: "Roof stripped to the decking mid tear-off, underlayment rolls staged ready",
          width: 1100,
          height: 508,
          caption: "Deck first, then underlayment",
        },
        body: [
          "The visible roof is the last layer. Underneath it sits the decking, the underlayment and the flashing details — and those are what decide whether the roof lasts its rated life or leaks in five years.",
          "A high-temperature self-adhered underlayment goes down first, because the best roofing systems are built from the deck up. If the deck is soft, rotten or under-nailed, that gets fixed before anything goes over it. You see the decking before it’s covered.",
        ],
      },
      {
        heading: "Repairs, not just replacements",
        photo: {
          src: "/ctl/gallery/shingle-turbine-vents.jpg",
          alt: "Close view of a shingle roof with turbine vents along the ridge",
          width: 1100,
          height: 508,
          caption: "Ridge, vents and flashing",
        },
        body: [
          "Not every roof needs replacing. A lifted ridge cap, a failed pipe boot or a section of flashing can be the whole problem, and a repair is the honest answer more often than the industry admits.",
          "The free assessment tells you which one you are looking at. If a repair will hold, we say so.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do I need a full replacement, or will a repair do?",
        a: "That is exactly what the free roof and property assessment answers. We inspect the roof and the property, document what we find, and tell you plainly whether you need work now or not. Plenty of assessments end with a repair, or with nothing at all.",
      },
      {
        q: "What warranty comes with the work?",
        a: "A 5-year labor warranty from CTL, on top of the manufacturer warranty that already comes with your materials.",
      },
      {
        q: "Can I see the materials before I choose?",
        a: "Yes — there is a showroom in Lafayette with shingles, metal, siding and doors to look at in person, rather than choosing a roof off a phone screen.",
      },
      {
        q: "My roof was damaged in a storm. Is that different?",
        a: "The work is the same; the paperwork is not. Storm damage usually runs through an insurance claim, which has its own sequence and its own deadlines. Start on the storm damage and insurance claims page.",
      },
    ],
    cta: {
      heading: "Get the roof looked at before it decides for you",
      body: "The free assessment covers the roof and the property, and comes with photos of what we found. No obligation attached to it.",
    },
    galleryCategory: "roofing",
  },

  {
    slug: "remodeling-restoration",
    span: "narrow",
    navLabel: "Remodeling & Restoration",
    meta: {
      title: "Remodeling & Restoration — Fire, Flood, Siding",
      description:
        "Fire and flood restoration, James Hardie siding upgrades, window and door replacement, and bathroom and kitchen remodeling across Acadiana.",
      path: "/services/remodeling-restoration/",
    },
    heading: "Remodeling & restoration",
    lede: "Putting a property back after fire or flood, and upgrading the parts of it that were tired before anything went wrong.",
    summary:
      "Fire and flood restoration, siding and window upgrades, and bathroom and kitchen remodeling.",
    photo: {
      src: "/ctl/remodel-exterior.jpg",
      alt: "A two-story home mid-renovation, new shingle roof on and new sheathing up, waiting on siding",
      width: 1200,
      height: 554,
    },
    sections: [
      {
        heading: "What we take on",
        columns: [
          {
            label: "Restoration",
            items: [
              "Fire and flood restoration",
              "Water damage removal and property dry-out",
              "Structural and carpentry repairs",
            ],
          },
          {
            label: "Upgrades",
            items: [
              "Siding upgrades to James Hardie",
              "Window and exterior door replacement",
              "Bathroom and kitchen remodeling",
            ],
          },
        ],
        photo: {
          src: "/ctl/remodel-kitchen.jpg",
          alt: "A kitchen part-way through a remodel, cabinets in and countertops papered over, tools on a trestle table in the middle of the room",
          width: 900,
          height: 506,
          caption: "Kitchen, mid-remodel",
        },
      },
      {
        heading: "Restoration runs on a clock",
        photo: {
          src: "/ctl/gallery/interior-mid-remodel.jpg",
          alt: "Living room part-way through a remodel, ceiling fan up and materials still on the floor",
          width: 1100,
          height: 618,
          caption: "Open until it is dry",
        },
        body: [
          "After fire or flood, the sequence matters more than the finish. Water has to come out, the structure has to dry, and what cannot be dried has to come out before anything is closed back up. Skipping that is how a rebuilt wall grows mold behind new paint.",
          "The same production team that runs a roof replacement runs a restoration, with the same written scope and the same office staff keeping permits, invoices and documents on file — which matters when an insurer asks for them a year later.",
        ],
      },
      {
        heading: "While the exterior is open",
        photo: {
          src: "/ctl/gallery/new-build-exterior.jpg",
          alt: "New-build home under construction with the roof on and siding under way",
          width: 1100,
          height: 495,
          caption: "Sheathing still reachable",
        },
        body: [
          "A siding or window job is the cheapest time to fix what is behind them. Wall sheathing, flashing at windows and doors, and the water management details around them are only accessible once the old material is off.",
          "If you are already replacing the roof, doing the exterior in the same run saves a second mobilization and gets one set of flashing details done consistently.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do you work with insurance on fire and flood claims?",
        a: "We document the damage, provide a written scope with photos, and do the repair. Filing and negotiating the claim stays with you and your insurer — see the storm damage and insurance claims page for how that sequence runs.",
      },
      {
        q: "Can you do a bathroom or kitchen without a whole restoration?",
        a: "Yes. Bathroom and kitchen remodeling is ordinary work here, not only something that follows a loss.",
      },
      {
        q: "How is the project managed?",
        a: "The same way every CTL project runs: free assessment, written scope and estimate, a production team supervising the build against our standards, and a final walkthrough that does not close until you are satisfied.",
      },
    ],
    cta: {
      heading: "Start with a walkthrough",
      body: "Whether it is damage or an upgrade, the first step is the same — we come look, document it, and give you a written scope before anyone commits to anything.",
    },
    galleryCategory: "remodeling",
  },

  {
    slug: "outdoor-living",
    span: "narrow",
    navLabel: "Outdoor Living",
    meta: {
      title: "Outdoor Living — Patio Covers & Screen Rooms",
      description:
        "Aluminum patio covers, screen rooms, outdoor kitchens with fireplace or firepit, concrete slab additions and fences, built across Acadiana.",
      path: "/services/outdoor-living/",
    },
    heading: "Outdoor living",
    lede: "Covered patios, outdoor kitchens and the slab, framing and fencing that go under and around them.",
    summary:
      "Patio covers, screen rooms, outdoor kitchens, slab additions and fences.",
    photo: {
      src: "/ctl/outdoor-frame.jpg",
      alt: "A heavy timber patio cover frame going up over a new concrete slab behind a brick home",
      width: 900,
      height: 675,
    },
    sections: [
      {
        heading: "What we build",
        columns: [
          {
            items: [
              "Outdoor kitchens with fireplace or firepit",
              "Aluminum patio covers and screen rooms",
            ],
          },
          {
            items: ["Concrete slab additions", "Fences"],
          },
        ],
        photo: {
          src: "/ctl/service-outdoor.jpg",
          alt: "A newly built covered patio across the back of a home, steel posts carrying the roof over a fresh concrete slab",
          width: 820,
          height: 615,
          caption: "Cover over a new slab",
        },
      },
      {
        heading: "Built by roofers, which shows",
        photo: {
          src: "/ctl/gallery/patio-timber-joint.jpg",
          alt: "Close view of a heavy timber post and beam joint against a clear sky",
          width: 1100,
          height: 825,
          caption: "Post and beam",
        },
        body: [
          "A patio cover is a roof with fewer excuses. Where it ties into the house is where it will leak, so the flashing at that junction gets treated like any other roof-to-wall detail rather than caulked and hoped over.",
          "Aluminum covers and screen rooms come from Elite Aluminum; heavier timber structures use Simpson Strong-Tie Outdoor Accents hardware where the connection is doing structural work.",
        ],
      },
      {
        heading: "Slab first",
        photo: {
          src: "/ctl/gallery/patio-frame-going-up.jpg",
          alt: "Heavy timber patio frame going up over a concrete slab, ladders either side",
          width: 1100,
          height: 825,
          caption: "Framing follows the pour",
        },
        body: [
          "Most outdoor living projects start below grade. If the slab is new, it gets poured and cured before framing; if it is existing, it gets assessed for whether it can carry what is going on top of it.",
          "Fences, drainage and the path from the back door are worth deciding at the same time — they are cheap while the equipment is already on site and expensive afterwards.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do you handle the permits?",
        a: "Payments, invoices, estimates and permits are tracked and logged by our office staff as part of the job.",
      },
      {
        q: "Can you match the new roof to the house?",
        a: "Yes — that is part of why the showroom exists. You can see the covering options against each other before choosing.",
      },
      {
        q: "Can this be financed?",
        a: "Financing options are available so a project can get done now and be paid over time. See the financing page.",
      },
    ],
    cta: {
      heading: "Price the patio before next summer",
      body: "Outdoor projects book out in good weather. A free assessment now gets you a written scope while the calendar still has room in it.",
    },
    galleryCategory: "outdoor",
  },

  {
    slug: "emergency-inspections",
    span: "wide",
    navLabel: "Emergency & Inspections",
    meta: {
      title: "Emergency, Handyman Work & Inspections",
      description:
        "Emergency tarping and leak stop, water damage removal and dry-out, carpentry and repairs, plus full-scope roof evaluations across Acadiana.",
      path: "/services/emergency-inspections/",
    },
    heading: "Emergency, handyman & inspections",
    lede: "Stopping the water tonight, and telling you honestly what the roof is worth in the morning.",
    summary:
      "Tarping and leak stop, dry-out, handyman work, and full-scope roof evaluations.",
    photo: {
      src: "/ctl/emergency-tearoff.jpg",
      alt: "A CTL crew tearing off a large brick home’s roof with tarps laid over the landscaping below",
      width: 1200,
      height: 554,
    },
    sections: [
      {
        heading: "Emergency and handyman",
        columns: [
          {
            label: "When water is getting in",
            items: [
              "Tarping and leak stop",
              "Water damage removal and property dry-out",
            ],
          },
          {
            label: "Smaller jobs",
            items: ["Carpentry, sheetrock, painting, fences"],
          },
        ],
        photo: {
          src: "/ctl/gallery/storm-tarps-yard.jpg",
          alt: "Crew on a roof with blue tarps laid across the driveway and a CTL sign in the yard",
          width: 1100,
          height: 508,
          caption: "Tarps go down first",
        },
      },
      {
        heading: "Full-scope roof evaluations",
        columns: [
          {
            items: [
              "Full-scope roof evaluations",
              "Code deficiencies and roof age",
              "Fair market valuation",
            ],
          },
        ],
        photo: {
          src: "/ctl/gallery/storm-tarped-brick.jpg",
          alt: "Brick home with tarps hung over the roof edge and walls after storm damage",
          width: 1100,
          height: 508,
          caption: "Documented before it moves",
        },
      },
      {
        heading: "A stain is a symptom, not the problem",
        photo: {
          src: "/ctl/water-stain-ceiling.jpg",
          alt: "Brown water stains spreading across a white ceiling beside the crown moulding",
          width: 900,
          height: 405,
          caption: "What it looks like from inside",
        },
        body: [
          "By the time water shows up on a ceiling, it has usually been in the assembly for a while. Decking, insulation and framing can all be involved before anything is visible from inside, which is why the cheap moment to act is the moment you first see the spot.",
          "The storm line is answered around the clock for exactly this. Tarping now is not the repair — it is what stops the repair from getting bigger overnight.",
        ],
      },
    ],
    faqs: [
      {
        q: "What counts as an emergency?",
        a: "Active water coming in, an open roof after a storm, or damage that will get worse before normal business hours. The storm line is answered around the clock for those.",
      },
      {
        q: "Is an evaluation the same as the free assessment?",
        a: "The free roof and property assessment is what most homeowners want: what condition it is in and what needs doing. A full-scope evaluation goes further — code deficiencies, roof age and fair market valuation — and is usually wanted for a sale, a purchase or a claim.",
      },
      {
        q: "Will a tarp hold until the repair?",
        a: "A properly installed tarp buys time, not a season. It is there to stop the loss growing while the scope, the claim or the materials get sorted out.",
      },
    ],
    cta: {
      heading: "Water coming in now?",
      body: "Call the storm line — it is answered around the clock. If it can wait until morning, the free assessment is the cheaper way to find out how bad it is.",
    },
    galleryCategory: "storm",
  },

  {
    slug: "commercial",
    span: "full",
    navLabel: "Commercial",
    meta: {
      title: "Commercial Roofing — TPO, PVC & Coatings",
      description:
        "Commercial roofing across Acadiana: modified bitumen, TPO and PVC, standing seam and exposed fastener metal, silicone coatings and repairs.",
      path: "/services/commercial/",
    },
    heading: "Commercial",
    lede: "Low-slope and metal roofing for property managers and business owners — including the coating route, when the roof does not need replacing yet.",
    summary:
      "Modified bitumen, TPO and PVC, metal systems, silicone coatings, repairs and maintenance.",
    photo: {
      src: "/ctl/shop-metal-stock.jpg",
      alt: "Coils of metal roofing stock on pallets in the CTL shop, beside the roll former",
      width: 1000,
      height: 1333,
    },
    sections: [
      {
        heading: "Systems we install",
        columns: [
          {
            label: "Low slope",
            items: ["Modified bitumen", "TPO", "PVC", "Silicone coatings"],
          },
          {
            label: "Metal",
            items: [
              "Standing seam",
              "Exposed fastener",
              "Repairs and maintenance",
            ],
          },
        ],
        /* The shop, not a commercial job — we have none photographed.
           It is honest here because it is our own metal being formed,
           which is what the list beside it is about. */
        photo: {
          src: "/ctl/metal-copper-hip.jpg",
          alt: "Copper hip caps formed and stacked mirror-bright on the bench in the CTL shop, timber racks behind",
          width: 1000,
          height: 1333,
          caption: "Copper, formed in the shop",
        },
      },
      {
        heading: "Coating instead of replacing",
        body: [
          "A silicone coating is not a patch and it is not a new roof. On a low-slope roof that is watertight but weathering, it can add service life for a fraction of a tear-off, and it goes on without shutting the building down.",
          "It is the wrong answer on a roof with wet insulation or failed seams — coating over trapped moisture buys nothing. The evaluation says which one you have before anyone quotes either.",
        ],
      },
      {
        heading: "Working around a business",
        body: [
          "Commercial work is scheduled around the tenants, not the crew. Access, staging, noise and what happens over an occupied space are part of the scope, not an afterthought discovered on the first morning.",
          "The same office staff track payments, invoices, estimates and permits, which is usually what a property manager actually needs at closeout.",
        ],
      },
    ],
    faqs: [
      {
        q: "Do you do maintenance programs, not just replacements?",
        a: "Repairs and maintenance are a standing part of the commercial work. On a low-slope roof, scheduled attention to seams, drains and penetrations is most of what decides how long the membrane lasts.",
      },
      {
        q: "Can you evaluate a roof we did not install?",
        a: "Yes. Full-scope evaluations cover condition, code deficiencies, roof age and fair market valuation.",
      },
      {
        q: "Who do we call about a leak?",
        a: "The storm line is answered around the clock, the same as for residential.",
      },
    ],
    cta: {
      heading: "Get the building’s roof on paper",
      body: "An evaluation gives you condition, remaining life and a written scope — the three things a budget conversation needs.",
    },
  },
];
