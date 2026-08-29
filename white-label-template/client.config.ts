/**
 * ════════════════════════════════════════════════════════════════════
 *  CLIENT CONFIG — the ONLY file you should need to edit per client
 *  (plus swapping images in /public and setting .env.local).
 *
 *  Every component reads from this file. If you find yourself editing
 *  a component to change client content, that content belongs here.
 *  See README-DEPLOY.md for the full go-live checklist.
 *
 *  Currently configured for: CTL Pro Construction LLC (CTL Roofing).
 * ════════════════════════════════════════════════════════════════════
 */

export type ServiceCard = {
  title: string;
  /** Photo for the card header — file in /public */
  image: string;
  imageAlt: string;
  /** 1 column reads as a list, 2 columns as a spec sheet */
  columns: { label?: string; items: string[] }[];
  /** Wide cards take 7 of 12 grid columns, narrow ones 5 */
  span: "wide" | "narrow";
};

export type Testimonial = {
  quote: string;
  name: string;
  detail: string; // e.g. "Homeowner, Broussard" or "Fleet manager"
};

export type Shot = {
  src: string;
  alt: string;
  caption: string;
  /** Portrait tiles break the gallery's horizon line */
  orientation?: "landscape" | "portrait";
};

export const client = {
  // ── Identity ──────────────────────────────────────────────────────
  businessName: "CTL Roofing",
  legalName: "CTL Pro Construction LLC", // used in legal pages + footer
  /** Hero headline. `emphasis` prints in gold on its own line. */
  tagline: "Committed to local.",
  taglineEmphasis: "Certified to last.",
  subheadline:
    "Roof replacement, storm restoration and full-scope construction for homes and businesses across Acadiana. We live here, we buy here, and we hire here.",
  logoPath: "/ctl/logo.png",
  logoAlt: "CTL Roofing — Committed to Local",

  // ── Domain / SEO ──────────────────────────────────────────────────
  siteUrl: "https://www.ctlpro.com", // no trailing slash
  metaTitle:
    "CTL Roofing — Committed to Local | Roofing & Construction in Acadiana",
  metaDescription:
    "CTL Pro Construction is a Broussard-based roofing and construction company serving Acadiana and South Louisiana since 2019. Roof replacement, storm restoration, remodeling, patio covers and windows. Free roof and property assessment.",
  ogImagePath: "/ctl/og.jpg",

  // ── Contact ───────────────────────────────────────────────────────
  phone: "337-658-6596",
  phoneHref: "+13376586596", // E.164, used for tel:/sms: links
  /** Second line answered around the clock after weather events. */
  stormPhone: "337-534-0040",
  stormPhoneHref: "+13375340040",
  email: "office@ctlpro.com",
  address: {
    street: "1605 Eraste Landry Road",
    city: "Lafayette",
    region: "LA",
    postalCode: "70506",
  },
  hours: [
    { days: "Monday – Friday", time: "8am – 5pm" },
    { days: "Saturday", time: "9am – 2pm" },
    { days: "Sunday", time: "Closed" },
    { days: "Storm emergencies", time: "Around the clock" },
  ],
  /** Short form of the hours, printed in the utility bar. */
  hoursShort: "Mon–Fri 8–5 · Sat 9–2",
  /**
   * Google Maps embed URL. Get it from Maps → Share → Embed a map,
   * and paste ONLY the src attribute value here. Empty string = the
   * map panel is skipped.
   */
  mapEmbedSrc: "",

  // ── Booking ───────────────────────────────────────────────────────
  /**
   * Scheduler the primary CTAs point at. Empty string falls the CTAs
   * back to the on-page request form.
   */
  bookingUrl: "https://calendly.com/d/ct7p-3by-878/free-consultation",
  /**
   * Cal.com inline embed ("username/event"). Left empty because this
   * site books through the Calendly link above.
   */
  calLink: "",

  // ── Socials (empty string hides the link) ─────────────────────────
  socials: {
    facebook: "https://www.facebook.com/ctlprola",
    instagram: "",
    google: "https://g.page/r/CdzPt0LheRXZEAI/review", // review link
  },
  /** Off-site page for financing terms. Empty string hides the link. */
  financingUrl: "https://www.ctlpro.com/new-page-1",

  // ── Storm strip (sits directly under the hero) ────────────────────
  storm: {
    label: "Storm response",
    body: "Hit by the latest round of weather? Get a free roof and property assessment and find storm damage before it becomes a bigger problem.",
  },

  // ── Services ──────────────────────────────────────────────────────
  services: [
    {
      title: "Roofing",
      image: "/ctl/service-roofing.jpg",
      imageAlt: "Aerial view of a shingle roof replacement in progress",
      span: "wide",
      columns: [
        {
          label: "Residential",
          items: [
            "Shingle roofing",
            "Standing seam metal",
            "Flat roofs",
            "Repairs and maintenance",
          ],
        },
        {
          label: "Commercial",
          items: [
            "Modified bitumen, TPO, PVC",
            "Standing seam and exposed fastener metal",
            "Silicone coatings",
            "Repairs and maintenance",
          ],
        },
      ],
    },
    {
      title: "Remodeling & restoration",
      image: "/ctl/service-remodeling.jpg",
      imageAlt: "Finished bathroom remodel with tiled shower and double vanity",
      span: "narrow",
      columns: [
        {
          items: [
            "Fire and flood restoration",
            "Siding upgrades to James Hardie",
            "Window and exterior door replacement",
            "Bathroom and kitchen remodeling",
          ],
        },
      ],
    },
    {
      title: "Outdoor living",
      image: "/ctl/service-outdoor.jpg",
      imageAlt: "Finished aluminum patio cover over a concrete slab",
      span: "narrow",
      columns: [
        {
          items: [
            "Outdoor kitchens with fireplace or firepit",
            "Aluminum patio covers and screen rooms",
            "Concrete slab additions",
            "Fences",
          ],
        },
      ],
    },
    {
      title: "Emergency, handyman & inspections",
      image: "/ctl/service-emergency.jpg",
      imageAlt: "Crew tarping a storm-damaged roof",
      span: "wide",
      columns: [
        {
          items: [
            "Tarping and leak stop",
            "Water damage removal and property dry-out",
            "Carpentry, sheetrock, painting, fences",
          ],
        },
        {
          items: [
            "Full-scope roof evaluations",
            "Code deficiencies and roof age",
            "Fair market valuation",
          ],
        },
      ],
    },
  ] as ServiceCard[],

  // ── Metal roofing feature band ────────────────────────────────────
  metal: {
    heading: ["Built to last.", "Designed to impress."],
    pull: "Clean lines. No exposed fasteners. No unnecessary maintenance.",
    body: [
      "A properly installed concealed-fastener standing seam roof can protect a home for decades with very little upkeep — one of the longest-lasting systems available. It isn't a roof you plan to replace in fifteen years.",
      "What you can't see matters just as much. A high-temperature self-adhered underlayment goes down first, because the best roofing systems are built from the deck up, not just from the top down.",
    ],
    specs: [
      { label: "Fasteners", value: "Concealed — nothing exposed to the weather" },
      { label: "Underlayment", value: "High-temperature self-adhered membrane" },
      { label: "Upkeep", value: "Low-maintenance by design" },
      { label: "Built for", value: "South Louisiana heat, rain and wind" },
    ],
    cta: "Talk through a metal roof",
    image: "/ctl/metal-panel.jpg",
    imageAlt: "A copper metal panel being formed in the CTL shop",
    imageCaption: "Copper panel, formed in our shop.",
  },

  // ── Process ───────────────────────────────────────────────────────
  process: {
    heading: "How a project runs",
    lede: "Four steps, in this order, on every job — from a single repair to a full renovation.",
    steps: [
      {
        title: "Free assessment",
        body: "We inspect the roof and property, document what we find, and tell you plainly whether you need work now or not.",
      },
      {
        title: "Scope and estimate",
        body: "A written scope with product options from our Lafayette showroom, plus financing terms if you want to spread the cost.",
      },
      {
        title: "Build",
        body: "A production team supervises the job against our standards and keeps you updated while the crew works.",
      },
      {
        title: "Final walkthrough",
        body: "We walk the finished job with you and don't close it out until you're satisfied. Office staff keeps every payment, permit and document on file.",
      },
    ],
    promises: [
      {
        title: "5-year labor warranty",
        body: "On top of the manufacturer warranty that already comes with your materials.",
      },
      {
        title: "A real showroom",
        body: "Come see shingles, metal, siding and doors in person before you choose.",
      },
      {
        title: "Paperwork handled",
        body: "Payments, invoices, estimates and permits tracked and logged by our office staff.",
      },
      {
        title: "Financing available",
        body: "Options that let you get the project done now and pay over time.",
      },
    ],
  },

  // ── Manufacturers we install ──────────────────────────────────────
  brands: {
    heading: "What we build with",
    lede: "We stock and install products with real manufacturer backing — the warranty is only as good as what's under it.",
    items: [
      { name: "James Hardie", detail: "Fiber cement siding and trim" },
      { name: "ProVia", detail: "Doors, windows, siding, stone and roofing" },
      { name: "Elite Aluminum", detail: "Patio covers and screen rooms" },
      { name: "Simpson Strong-Tie", detail: "Outdoor Accents structural hardware" },
    ],
  },

  // ── Contact form dropdown ─────────────────────────────────────────
  form: {
    serviceOptions: [
      "Roof replacement",
      "Storm damage assessment",
      "Repair or leak",
      "Metal roofing",
      "Patio cover or outdoor living",
      "Remodeling or restoration",
      "Something else",
    ],
  },

  // ── About / local ─────────────────────────────────────────────────
  about: {
    heading: "Committed to local isn't a slogan",
    lede: "It's the core value the company runs on. We invest in the communities we serve, support local businesses, and do business with integrity and accountability. Being local means more than having a local address — it means being committed to the people who call Acadiana home.",
    photoPath: "/ctl/team.jpg",
    photoAlt: "The CTL Pro Construction team at their Lafayette office",
    owner: {
      name: "Robert LeBas",
      role: "Owner & general manager",
      photoPath: "/ctl/owner.jpg",
      photoAlt:
        "Robert LeBas, owner and general manager of CTL Pro Construction",
      body: [
        "Born and raised in Lafayette. Graduated from STM in 2003. Ten years running roofing and construction companies before CTL.",
        "“When you surround yourself with good people who share the same values, everyone wins — our businesses, our communities, and most of all our customers.”",
      ],
    },
    /** Towns worked, printed as a mono tag row. */
    towns: [
      "Lafayette",
      "Broussard",
      "Youngsville",
      "Scott",
      "Carencro",
      "Duson",
      "Maurice",
      "Milton",
      "Breaux Bridge",
      "St. Martinville",
      "New Iberia",
      "Abbeville",
      "Crowley",
      "Rayne",
      "Opelousas",
      "Erath",
    ],
  },

  // ── Recent work gallery ───────────────────────────────────────────
  gallery: [
    {
      src: "/ctl/work-standing-seam.jpg",
      alt: "Aerial view of a standing seam metal roof installation",
      caption: "Standing seam install",
    },
    {
      src: "/ctl/work-shingle-replacement.jpg",
      alt: "Brick home with a completed shingle roof",
      caption: "Shingle replacement",
    },
    {
      src: "/ctl/work-patio-cover.jpg",
      alt: "Attached patio cover with wood columns",
      caption: "Patio cover",
    },
    {
      src: "/ctl/work-tear-off.jpg",
      alt: "Crew tearing off an old roof deck",
      caption: "Tear-off in progress",
    },
    {
      src: "/ctl/work-interior-remodel.jpg",
      alt: "Interior remodel under way in a living room",
      caption: "Interior remodel",
    },
    {
      src: "/ctl/work-window-replacement.jpg",
      alt: "New windows installed in a sunroom",
      caption: "Window replacement",
    },
    {
      src: "/ctl/work-exterior-renovation.jpg",
      alt: "Home mid-renovation with new siding going on",
      caption: "Exterior renovation",
    },
    {
      src: "/ctl/work-architectural-shingles.jpg",
      alt: "Close view of newly laid architectural shingles",
      caption: "Architectural shingles",
    },
  ] as Shot[],

  /** Photo printed beside the contact details column. */
  contactPhoto: {
    src: "/ctl/materials.jpg",
    alt: "Pallets of shingles and underlayment staged for delivery",
  },

  // ── Testimonials (set to [] to hide the section) ──────────────────
  // Real reviews only. The Google review link in the About band carries
  // this weight until CTL supplies quotes cleared for the site.
  testimonials: [] as Testimonial[],

  // ── Trust badges (license #s, certs — set to [] to hide) ──────────
  badges: [],

  // ── Section copy (headings/CTAs) ──────────────────────────────────
  copy: {
    utilityBar: "Broussard-based · serving Acadiana since 2019",
    heroCta: "Schedule a free assessment",
    heroSecondaryCta: "Call",
    heroFacts: [
      { value: "2019", label: "serving Acadiana" },
      { value: "5-year", label: "labor warranty" },
      { value: "Showroom", label: "in Lafayette" },
      { value: "Financing", label: "available" },
    ],
    navCta: "Free assessment",
    servicesHeading: "Not just roofing",
    servicesLede:
      "CTL is a full-service construction company. Roofs are where most projects start — decks, siding, windows, patios and interiors are where a lot of them end up.",
    galleryHeading: "Recent work",
    galleryLede:
      "Roofs, patios, interiors and full renovations across Acadiana and South Louisiana.",
    testimonialsHeading: "Word travels",
    bookingHeading: "Book a time that works",
    bookingBlurb:
      "Pick a slot and we'll confirm by text. Prefer to talk? Call or send the form below.",
    contactHeading: "Request an assessment",
    contactLede:
      "Tell us where you are and what you're seeing. We'll call to set a time — usually the same business day.",
    contactSubmit: "Request my assessment",
    contactConfirmation:
      "Got it. We'll call you at the number you gave to set a time for your free roof and property assessment.",
    closingHeading: "Don't ignore that water spot on the ceiling",
    closingBody:
      "A stain is usually the symptom, not the problem. By the time water shows up inside, decking, insulation and framing may already be involved. Catch it early and save thousands.",
    footerBlurb:
      "CTL Pro Construction LLC — a full-service roofing and construction company serving Acadiana and South Louisiana since 2019.",
    stickyCtaLabel: "Free assessment",
  },
} as const;

export type ClientConfig = typeof client;
