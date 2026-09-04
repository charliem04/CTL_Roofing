# Graph Report - CTL_Roofing  (2026-09-03)

## Corpus Check
- 107 files · ~1,124,923 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 580 nodes · 1282 edges · 37 communities (32 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.89)
- Token cost: 114,123 input · 0 output

## Community Hubs (Navigation)
- Marketing Page Routes
- NPM Dependency Manifest
- Brand Token Check Script
- TypeScript Compiler Config
- Home Page and Brand Components
- Content Loader API
- Site Chrome and Navigation
- Page Content Modules
- Careers Upload Worker
- Contact Form and Tracking
- Worker Package Manifest
- Build Scripts: CSP and SEO
- Photo Gallery and Lightbox
- Resume Upload Client
- Worker TypeScript Config
- Go-Live Deploy Checklist
- Client Handover and Blockers
- Preview Mode and Robots
- Consent and Analytics Gating
- Case Study Content Types
- Google Reviews Feed
- Content Architecture Decisions
- Legal Pages and Indexability
- Pending Content Placeholders
- Upload Security Chain
- Deliberate Scope Omissions
- Service Areas and Parishes
- Conversion and Lead Capture
- Static Export Architecture
- Storm Damage and Claims
- Financing Payment Estimator
- Video Page Content
- Next.js Config
- Tailwind Config
- R2 Retention Script

## God Nodes (most connected - your core abstractions)
1. `client` - 45 edges
2. `btn()` - 29 edges
3. `Reveal()` - 23 edges
4. `MoreLink()` - 19 edges
5. `SectionHead()` - 18 edges
6. `CtaBand()` - 16 edges
7. `fetch()` - 16 edges
8. `compilerOptions` - 15 edges
9. `PageHero()` - 14 edges
10. `pageMetadata()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Go-Live Checklist (client template)` --semantically_similar_to--> `CTL Go-Live Checklist`  [INFERRED] [semantically similar]
  README-DEPLOY.md → ctl-roofing/README-DEPLOY.md
- `NEXT_PUBLIC_FORM_ENDPOINT` --semantically_similar_to--> `NEXT_PUBLIC_WEB3FORMS_KEY`  [INFERRED] [semantically similar]
  README-DEPLOY.md → ctl-roofing/README-DEPLOY.md
- `Dev-only <Pending> gap markers` --semantically_similar_to--> `REPLACE BEFORE LAUNCH legal banners`  [INFERRED] [semantically similar]
  ctl-roofing/docs/REBUILD-PLAN.md → README-DEPLOY.md
- `client.config.ts TODO(client) fields` --semantically_similar_to--> `client.config.ts site-level contract`  [INFERRED] [semantically similar]
  README-DEPLOY.md → ctl-roofing/README-DEPLOY.md
- `Honeypot answering 200 and storing nothing` --semantically_similar_to--> `NEXT_PUBLIC_FORM_ENDPOINT`  [INFERRED] [semantically similar]
  workers/careers-upload/README.md → README-DEPLOY.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fail loudly rather than silently losing a lead** — ctl_roofing_readme_deploy_web3forms_key, ctl_roofing_docs_rebuild_plan_careers_gate, ctl_roofing_docs_rebuild_plan_payment_estimator, readme_deploy_preview_no_form_key, ctl_roofing_docs_rebuild_plan_pending_markers [INFERRED 0.85]
- **Résumé upload defence in depth** — workers_careers_upload_readme_careers_upload_worker, workers_careers_upload_readme_allowed_origins, workers_careers_upload_readme_turnstile, workers_careers_upload_readme_honeypot, workers_careers_upload_readme_magic_bytes, workers_careers_upload_readme_r2_key_generation, workers_careers_upload_readme_private_r2_bucket, workers_careers_upload_readme_retention_policy [EXTRACTED 1.00]
- **Containing an unsolicited replica of a live business** — readme_deploy_preview_deploy, readme_deploy_next_public_preview, readme_deploy_preview_no_form_key, ctl_handover_preview_site, ctl_roofing_docs_rebuild_plan_spec_pitch [INFERRED 0.85]

## Communities (37 total, 3 thin omitted)

### Community 0 - "Marketing Page Routes"
Cohesion: 0.07
Nodes (58): areas, metadata, CareersPage(), metadata, page, hub, metadata, metadata (+50 more)

### Community 1 - "NPM Dependency Manifest"
Cohesion: 0.05
Nodes (42): autoprefixer, dependencies, @fontsource/big-shoulders-display, @fontsource/ibm-plex-mono, @fontsource/ibm-plex-sans, framer-motion, next, react (+34 more)

### Community 2 - "Brand Token Check Script"
Cohesion: 0.07
Nodes (33): add(), AI_HEX, argv, byId, CHART_HEX, chroma(), classStrings(), DISPLAY_SIZES (+25 more)

### Community 3 - "TypeScript Compiler Config"
Cohesion: 0.08
Nodes (25): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+17 more)

### Community 4 - "Home Page and Brand Components"
Cohesion: 0.19
Nodes (15): metadata, NotFound(), client, ClientConfig, Testimonial, About(), Brands(), btn() (+7 more)

### Community 5 - "Content Loader API"
Cohesion: 0.10
Nodes (15): CaseStudiesPage(), generateStaticParams(), caseStudiesByDate(), services, servicesHub, ServicePage, getAreas(), getCareersPage() (+7 more)

### Community 6 - "Site Chrome and Navigation"
Cohesion: 0.16
Nodes (12): metadata, Footer(), JsonLd(), isKeyboardFocus(), Nav(), paths, SocialIcons(), StickyCTA() (+4 more)

### Community 7 - "Page Content Modules"
Cohesion: 0.14
Nodes (14): BeforeAfter(), careersPage, Question, Role, contactPage, financing, reviewsPage, storm (+6 more)

### Community 8 - "Careers Upload Worker"
Cohesion: 0.19
Nodes (20): ALLOWED, allowedOrigins(), asciiMeta(), cleanAnswers(), cleanText(), corsHeaders(), Env, extensionOf() (+12 more)

### Community 9 - "Contact Form and Tracking"
Cohesion: 0.16
Nodes (16): Contact(), onSubmit(), EMPTY, REQUIRED, Status, classify(), InteractionTracking(), compact() (+8 more)

### Community 10 - "Worker Package Manifest"
Cohesion: 0.12
Nodes (16): @cloudflare/workers-types, devDependencies, @cloudflare/workers-types, typescript, wrangler, typescript, name, private (+8 more)

### Community 11 - "Build Scripts: CSP and SEO"
Cohesion: 0.19
Nodes (13): applyCsp(), buildCsp(), checkDrift(), INERT, LINK_ONLY, origin(), originsInBuild(), build (+5 more)

### Community 12 - "Photo Gallery and Lightbox"
Cohesion: 0.22
Nodes (12): GalleryPage(), meta, metadata, Gallery(), Filter, GalleryBrowser(), GalleryTile(), Lightbox() (+4 more)

### Community 13 - "Resume Upload Client"
Cohesion: 0.19
Nodes (12): CareersForm(), onSubmit(), Status, Turnstile(), ACCEPTED_EXTENSIONS, ApplicationPayload, applicationsConfigured(), checkResume() (+4 more)

### Community 14 - "Worker TypeScript Config"
Cohesion: 0.12
Nodes (15): @cloudflare/workers-types, ES2022, src/**/*.ts, compilerOptions, isolatedModules, lib, module, moduleResolution (+7 more)

### Community 15 - "Go-Live Deploy Checklist"
Cohesion: 0.15
Nodes (15): ctl-preview.pages.dev preview site, CTL brand tokens and type stack, npm run check content advisories, DNS cutover sequence, CTL Go-Live Checklist, NEXT_PUBLIC_LEAD_WEBHOOK_URL, Cloudflare Pages project settings (root directory ctl-roofing), Privacy page names every processor (+7 more)

### Community 16 - "Client Handover and Blockers"
Cohesion: 0.19
Nodes (13): CTL Pro Construction LLC, Unverified FORTIFIED certification, CTL Pro Site Handover document, Nothing invented to fill a hole, Nineteen-page build ledger, Robert LeBas (client contact), Sixteen client asks, Blocked on Robert backlog (+5 more)

### Community 17 - "Preview Mode and Robots"
Cohesion: 0.24
Nodes (7): dynamic, dynamic, sitemap(), PreviewBanner(), IS_PREVIEW, REAL_SITE, livePaths()

### Community 18 - "Consent and Analytics Gating"
Cohesion: 0.32
Nodes (8): Analytics(), BookingEmbed(), CookieConsent(), choose(), CONSENT_EVENT, ConsentValue, getConsent(), setConsent()

### Community 19 - "Case Study Content Types"
Cohesion: 0.21
Nodes (9): caseStudies, caseStudiesHub, gallery, galleryCategories, CaseStudy, GalleryCategory, GalleryShot, PendingContent (+1 more)

### Community 20 - "Google Reviews Feed"
Cohesion: 0.31
Nodes (8): GoogleReviews(), Stars(), ApiReview, fetchGoogleReviews(), FIELD_MASK, googleFeedConfigured(), GooglePlace, GoogleReview

### Community 21 - "Content Architecture Decisions"
Cohesion: 0.18
Nodes (11): CMS-ready, no CMS yet, Gallery from one content/gallery.ts source, client.config.ts site-level contract, content/ modules read through lib/content.ts, The CMS decision that changes the quote, Five-item nav, socials out of the main nav, client.config.ts TODO(client) fields, NEXT_PUBLIC_FORM_ENDPOINT (+3 more)

### Community 22 - "Legal Pages and Indexability"
Cohesion: 0.29
Nodes (5): LegalPage(), metadata, metadata, robotsFor(), isIndexable()

### Community 23 - "Pending Content Placeholders"
Cohesion: 0.20
Nodes (8): ReviewColumns(), pendingContent, posts, reviews, team, Post, Review, TeamMember

### Community 24 - "Upload Security Chain"
Cohesion: 0.24
Nodes (10): Careers page gated at the route, not by a banner, Site chrome moved into app/layout.tsx, lib/routes.ts route registry and live flags, ALLOWED_ORIGINS fail-closed allowlist, NEXT_PUBLIC_CAREERS_ENDPOINT, Magic-byte file type check, No file scanning — procedural mitigation, Worker-side R2 key generation (+2 more)

### Community 25 - "Deliberate Scope Omissions"
Cohesion: 0.28
Nodes (9): Seven deliberate omissions, Areas hub without per-town pages, Case studies as a compiled component, not a route, Hard-coded Facebook recommendations, GoogleReviews client-side Places fetch, No AggregateRating JSON-LD, Areas we serve hub plus town pages, Project case studies (proposed) (+1 more)

### Community 26 - "Service Areas and Parishes"
Cohesion: 0.25
Nodes (7): AreasPage(), areas, PARISH_ORDER, townsByParish(), towns, Town, getTownsByParish()

### Community 27 - "Conversion and Lead Capture"
Cohesion: 0.25
Nodes (8): Call-tracking DNI script seam, Delegated interaction tracking listener, Financing payment estimator, Dev-only <Pending> gap markers, Build as a spec pitch, One primary action sitewide, Financing estimator (proposed), Sticky mobile bar: Call | Text | Book

### Community 28 - "Static Export Architecture"
Cohesion: 0.38
Nodes (7): How it runs — static files plus one Worker, output: "export" static-export constraint, Careers / join the crew (proposed), ctl-careers-upload Worker, Named environments do not inherit bindings, Percent-encoded R2 custom metadata, Private R2 bucket, no read path

### Community 29 - "Storm Damage and Claims"
Cohesion: 0.47
Nodes (6): Louisiana public adjusting limit (La. R.S. 22:1691), Storm damage & insurance claims page, CTL site rebuild work breakdown, Home page funnel table, CTL Roofing site rebuild plan (client requirements), Storm damage & insurance claims (proposed page)

### Community 30 - "Financing Payment Estimator"
Cohesion: 0.83
Nodes (3): dollars(), monthlyPayment(), PaymentEstimator()

### Community 31 - "Video Page Content"
Cohesion: 0.50
Nodes (3): Clip, clips, videoPage

## Knowledge Gaps
- **165 isolated node(s):** `areas`, `metadata`, `page`, `metadata`, `hub` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 199 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `client` connect `Home Page and Brand Components` to `Marketing Page Routes`, `Site Chrome and Navigation`, `Contact Form and Tracking`, `Photo Gallery and Lightbox`, `Resume Upload Client`, `Preview Mode and Robots`, `Consent and Analytics Gating`, `Google Reviews Feed`, `Legal Pages and Indexability`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `btn()` connect `Home Page and Brand Components` to `Marketing Page Routes`, `Site Chrome and Navigation`, `Contact Form and Tracking`, `Resume Upload Client`, `Consent and Analytics Gating`, `Service Areas and Parishes`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `CTL Roofing site rebuild plan (client requirements)` connect `Storm Damage and Claims` to `Client Handover and Blockers`, `Content Architecture Decisions`, `Deliberate Scope Omissions`, `Conversion and Lead Capture`, `Static Export Architecture`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `areas`, `metadata`, `page` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Marketing Page Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.06910866910866911 - nodes in this community are weakly interconnected._
- **Should `NPM Dependency Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `Brand Token Check Script` be split into smaller, more focused modules?**
  _Cohesion score 0.06984126984126984 - nodes in this community are weakly interconnected._