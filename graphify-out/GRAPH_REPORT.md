# Graph Report - CTL_Roofing  (2026-09-03)

## Corpus Check
- 273 files · ~1,124,923 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 750 nodes · 1449 edges · 90 communities (47 shown, 41 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 116 edges (avg confidence: 0.9)
- Token cost: 610,002 input · 61,393 output

## Community Hubs (Navigation)
- App Router Page Shells
- Site NPM Dependencies
- Brand Token Check Script
- Careers Form and Turnstile
- Content Loader and Taxonomies
- Site TypeScript Config
- Careers Upload Worker
- Gallery Source and Shots
- Worker Package Manifest
- Build Scripts: CSP and SEO
- Worker TypeScript Config
- Go-Live Deploy Checklist
- Root Layout and Preview Mode
- Navigation and Route Registry
- Google Reviews Feed
- Pending Content Placeholders
- Metal Roofing Photos
- Client Handover and Blockers
- Services Content and Imagery
- Shingle Roofing Photos
- Team Page and Headshots
- Patio and Carport Photos
- Consent and Analytics Gating
- Contact, Reviews, Video Content
- Tear-Off and Storm Tarp Photos
- Gallery Browser and Lightbox
- Content Architecture Decisions
- Legal Pages and Indexability
- Financing and Storm Content
- Upload Security Chain
- Deliberate Scope Omissions
- Conversion and Lead Capture
- Static Export Architecture
- Window and Sunroom Photos
- Storm Damage and Claims
- Patio Cover Framing Photos
- Leadership Headshots
- Financing Payment Estimator
- Utility Bar and Socials
- Office and Team Photos
- Sitemap Generation
- Bathroom Remodel Photos
- Aerial Underlayment Photos
- Sunroom Renovation Photos
- Roof Replacement Sequence
- Brand Logo Assets
- Video Page
- Copper Fabrication Photos
- Water Damage and Logo
- Bathroom Fixture Photos
- Site Safety and Prep Photos
- New Construction Photos
- Atlas Plant Visit Photos
- Next.js Config
- Kitchen Remodel Photos
- Tailwind Config
- R2 Retention Script
- Aerial View of Metal Roof Installation P
- Aerial View of Roof Tear-Off
- Aerial View of Completed Shingle Roof - 
- Aerial View of Completed Shingle Roof - 
- Aerial View of Completed Fortified Roof
- Patio cover installation
- Carport awning installation
- Megan Chauvin Headshot
- Peyton Peltier Headshot
- Mueller Inc metal coils in warehouse
- Atlas Pinnacle Sun shingles on pallets
- Kitchen renovation in progress
- Interior painting and remodeling
- CTL Roofing construction site with mater
- Roofing crew installing metal roof panel
- Roofing crew working on a blue two-story
- Roofing crew working on a blue house sur
- Completed shingle roof with ridge vents 
- CTL Roofing team meeting in progress
- Worker installing metal roof panels near
- Roofing crew installing metal roof panel
- Roofing crew prepping a large residentia
- Roofing crew working on a residential ho
- Large roofing crew installing shingles o
- Aerial view of metal and shingle roof in
- Roof tear-off and replacement in progres
- Roofing Materials Stack
- Copper Metal Hip Caps
- Copper Metal Panel Sheet
- Outdoor Wooden Deck and Ramp
- Water Stain on Ceiling

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
- **Containing an unsolicited replica of a live business** — readme_deploy_preview_deploy, readme_deploy_next_public_preview, readme_deploy_preview_no_form_key, ctl_handover_preview_site, ctl_roofing_docs_rebuild_plan_spec_pitch [INFERRED 0.85]
- **Fail loudly rather than silently losing a lead** — ctl_roofing_readme_deploy_web3forms_key, ctl_roofing_docs_rebuild_plan_careers_gate, ctl_roofing_docs_rebuild_plan_payment_estimator, readme_deploy_preview_no_form_key, ctl_roofing_docs_rebuild_plan_pending_markers [INFERRED 0.85]
- **Résumé upload defence in depth** — workers_careers_upload_readme_careers_upload_worker, workers_careers_upload_readme_allowed_origins, workers_careers_upload_readme_turnstile, workers_careers_upload_readme_honeypot, workers_careers_upload_readme_magic_bytes, workers_careers_upload_readme_r2_key_generation, workers_careers_upload_readme_private_r2_bucket, workers_careers_upload_readme_retention_policy [EXTRACTED 1.00]
- **CTL Branding Assets** — ctl_roofing_app_icon, ctl_roofing_public_ctl_logo, ctl_roofing_public_ctl_og [EXTRACTED 1.00]
- **Interior Remodeling Showcase** — ctl_roofing_public_ctl_work_interior_remodel, ctl_roofing_public_ctl_gallery_interior_mid_remodel, ctl_roofing_public_ctl_gallery_bath_vanity_finished [INFERRED 0.85]
- **Metal Roofing Project Gallery** — ctl_roofing_public_ctl_gallery_metal_aerial_progress, ctl_roofing_public_ctl_gallery_metal_crew_ridge, ctl_roofing_public_ctl_gallery_metal_panel_setting, ctl_roofing_public_ctl_gallery_metal_panels_underlayment, ctl_roofing_public_ctl_gallery_metal_valley_crew [EXTRACTED 1.00]
- **Shingle Roofing Project Gallery** — ctl_roofing_public_ctl_gallery_shingle_aerial_finished, ctl_roofing_public_ctl_gallery_shingle_brick_ranch, ctl_roofing_public_ctl_gallery_shingle_bundles, ctl_roofing_public_ctl_gallery_shingle_close_finished, ctl_roofing_public_ctl_gallery_shingle_crew_install, ctl_roofing_public_ctl_gallery_shingle_deck_exposed, ctl_roofing_public_ctl_gallery_shingle_turbine_vents, ctl_roofing_public_ctl_gallery_shingle_two_story [EXTRACTED 1.00]
- **Patio and Timber Construction Gallery** — ctl_roofing_public_ctl_gallery_patio_cover_finished, ctl_roofing_public_ctl_gallery_patio_frame_going_up, ctl_roofing_public_ctl_gallery_patio_timber_joint, ctl_roofing_public_ctl_gallery_porch_wood_columns [EXTRACTED 1.00]
- **Metal Roofing Installation Workflow** — ctl_roofing_metal_aerial_complete, ctl_roofing_metal_aerial_progress, ctl_roofing_metal_crew_ridge, ctl_roofing_metal_panel_setting, ctl_roofing_metal_panels_underlayment, ctl_roofing_metal_valley_crew [INFERRED 0.90]
- **Sunroom Remodel Project** — ctl_roofing_sunroom_exterior, ctl_roofing_interior_new_windows, ctl_roofing_interior_window_wall [INFERRED 0.95]
- **Patio Construction Gallery** — ctl_roofing_public_ctl_gallery_thumb_patio_frame_going_up_jpg, ctl_roofing_public_ctl_gallery_thumb_patio_timber_joint_jpg, ctl_roofing_public_ctl_gallery_thumb_porch_wood_columns_jpg [INFERRED 0.95]
- **Roof Tear-off and Installation Process** — ctl_roofing_public_ctl_gallery_thumb_tearoff_crew_tarps_jpg, ctl_roofing_public_ctl_gallery_thumb_tearoff_decking_jpg, ctl_roofing_public_ctl_gallery_thumb_shingle_crew_install_jpg, ctl_roofing_public_ctl_gallery_thumb_shingle_aerial_finished_jpg [INFERRED 0.95]
- **CTL Roofing Team Members** — ctl_roofing_public_ctl_team_alex_alverez_jpg, ctl_roofing_public_ctl_team_ceci_harper_jpg, ctl_roofing_public_ctl_team_jody_holliday_jpg, ctl_roofing_public_ctl_team_jp_bourdreaux_jpg [INFERRED 0.95]
- **Metal Roof Installation Sequence** — ctl_pictures_ariel_1, ctl_pictures_ariel_2, ctl_pictures_ariel_3, ctl_pictures_ariel_4 [EXTRACTED 0.95]
- **Patio Cover Construction Sequence** — ctl_pictures_covering_1, ctl_pictures_covering_2, ctl_pictures_covering_3, ctl_pictures_covering_10 [EXTRACTED 0.95]
- **Brick House Roof Replacement Sequence** — ctl_pictures_roof_3, ctl_pictures_roof_4, ctl_pictures_roof_2 [INFERRED 0.90]
- **CTL Roofing Team and Staff Photos** — ctl_pictures_team_1, ctl_pictures_team_2, ctl_pictures_team_3, ctl_pictures_team_4, ctl_pictures_team_5 [EXTRACTED 1.00]
- **CTL Roofing Active Jobsite Portfolio** — ctl_pictures_roof_6, ctl_pictures_roof_7, ctl_pictures_roof_8, ctl_pictures_work_1, ctl_pictures_work_2, ctl_pictures_work_3, ctl_pictures_work_4, ctl_pictures_work_5, ctl_pictures_work_6, ctl_pictures_work_7 [EXTRACTED 1.00]
- **CTL Pro Team Headshots** — ctl_pictures_headshots_jp_bourdreaux, ctl_pictures_headshots_megan_chauvin, ctl_pictures_headshots_owner, ctl_pictures_headshots_paige_thacker, ctl_pictures_headshots_peyton_peltier, ctl_pictures_headshots_scott_toups [EXTRACTED 1.00]
- **Service Category Visuals** — ctl_roofing_public_ctl_service_emergency, ctl_roofing_public_ctl_service_outdoor, ctl_roofing_public_ctl_service_remodeling, ctl_roofing_public_ctl_service_roofing [EXTRACTED 1.00]
- **Shingle Roofing Installation Workflow** — ctl_roofing_public_ctl_gallery_shingle_deck_exposed, ctl_roofing_public_ctl_gallery_shingle_crew_install, ctl_roofing_public_ctl_gallery_shingle_aerial_finished [EXTRACTED 0.85]
- **Patio Timber Framing Workflow** — ctl_roofing_public_ctl_gallery_patio_frame_going_up, ctl_roofing_public_ctl_gallery_patio_timber_joint, ctl_roofing_public_ctl_gallery_patio_cover_finished [EXTRACTED 0.85]
- **Interior Remodeling and Finishing** — ctl_roofing_bath_tiled_shower, ctl_roofing_bath_vanity_finished, ctl_roofing_interior_mid_remodel [INFERRED 0.85]
- **Roofing Project Lifecycle** — ctl_roofing_public_ctl_gallery_thumb_shingle_bundles_jpg, ctl_roofing_public_ctl_gallery_thumb_tearoff_decking_jpg, ctl_roofing_public_ctl_gallery_thumb_shingle_crew_install_jpg, ctl_roofing_public_ctl_gallery_thumb_shingle_aerial_finished_jpg [EXTRACTED 0.95]
- **CTL Team Member Portraits** — ctl_roofing_public_ctl_team_megan_chauvin, ctl_roofing_public_ctl_team_paige_thacker, ctl_roofing_public_ctl_team_peyton_peltier, ctl_roofing_public_ctl_team_scott_toups [EXTRACTED 1.00]
- **Metal Roof Installation Sequence** — ctl_pictures_ariel_1, ctl_pictures_ariel_2, ctl_pictures_ariel_3, ctl_pictures_ariel_4 [INFERRED 0.85]

## Communities (90 total, 41 thin omitted)

### Community 0 - "App Router Page Shells"
Cohesion: 0.06
Nodes (74): areas, AreasPage(), metadata, CareersPage(), metadata, page, CaseStudiesPage(), hub (+66 more)

### Community 1 - "Site NPM Dependencies"
Cohesion: 0.05
Nodes (42): autoprefixer, dependencies, @fontsource/big-shoulders-display, @fontsource/ibm-plex-mono, @fontsource/ibm-plex-sans, framer-motion, next, react (+34 more)

### Community 2 - "Brand Token Check Script"
Cohesion: 0.07
Nodes (33): add(), AI_HEX, argv, byId, CHART_HEX, chroma(), classStrings(), DISPLAY_SIZES (+25 more)

### Community 3 - "Careers Form and Turnstile"
Cohesion: 0.09
Nodes (26): CareersForm(), onSubmit(), Status, onSubmit(), classify(), InteractionTracking(), Turnstile(), careersPage (+18 more)

### Community 4 - "Content Loader and Taxonomies"
Cohesion: 0.09
Nodes (20): generateStaticParams(), areas, PARISH_ORDER, townsByParish(), caseStudies, caseStudiesByDate(), caseStudiesHub, towns (+12 more)

### Community 5 - "Site TypeScript Config"
Cohesion: 0.08
Nodes (25): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+17 more)

### Community 6 - "Careers Upload Worker"
Cohesion: 0.19
Nodes (20): ALLOWED, allowedOrigins(), asciiMeta(), cleanAnswers(), cleanText(), corsHeaders(), Env, extensionOf() (+12 more)

### Community 7 - "Gallery Source and Shots"
Cohesion: 0.11
Nodes (17): gallery, galleryCategories, Copper Sheet Shop Photo, Interior Mid Remodel Photo, Multi Unit Siding Photo, New Build Exterior Photo, Copper Sheet in Shop, Interior Mid-Remodel (+9 more)

### Community 8 - "Worker Package Manifest"
Cohesion: 0.12
Nodes (16): @cloudflare/workers-types, devDependencies, @cloudflare/workers-types, typescript, wrangler, typescript, name, private (+8 more)

### Community 9 - "Build Scripts: CSP and SEO"
Cohesion: 0.19
Nodes (13): applyCsp(), buildCsp(), checkDrift(), INERT, LINK_ONLY, origin(), originsInBuild(), build (+5 more)

### Community 10 - "Worker TypeScript Config"
Cohesion: 0.12
Nodes (15): @cloudflare/workers-types, ES2022, src/**/*.ts, compilerOptions, isolatedModules, lib, module, moduleResolution (+7 more)

### Community 11 - "Go-Live Deploy Checklist"
Cohesion: 0.15
Nodes (15): ctl-preview.pages.dev preview site, CTL brand tokens and type stack, npm run check content advisories, DNS cutover sequence, CTL Go-Live Checklist, NEXT_PUBLIC_LEAD_WEBHOOK_URL, Cloudflare Pages project settings (root directory ctl-roofing), Privacy page names every processor (+7 more)

### Community 12 - "Root Layout and Preview Mode"
Cohesion: 0.21
Nodes (7): metadata, dynamic, JsonLd(), PreviewBanner(), StickyCTA(), IS_PREVIEW, REAL_SITE

### Community 13 - "Navigation and Route Registry"
Cohesion: 0.23
Nodes (10): Breadcrumbs(), Footer(), isKeyboardFocus(), Nav(), auxRoutes, liveChildren(), nav, RouteNode (+2 more)

### Community 14 - "Google Reviews Feed"
Cohesion: 0.26
Nodes (11): GoogleReviews(), Stars(), Testimonials(), getReviewsPage(), ApiReview, fetchGoogleReviews(), FIELD_MASK, googleFeedConfigured() (+3 more)

### Community 15 - "Pending Content Placeholders"
Cohesion: 0.19
Nodes (11): ReviewColumns(), pendingContent, posts, reviews, team, GalleryShot, PendingContent, Post (+3 more)

### Community 16 - "Metal Roofing Photos"
Cohesion: 0.16
Nodes (14): Metal Aerial Complete Photo, Metal Aerial Progress Photo, Metal Crew Ridge Photo, Metal Panel Setting Photo, Metal Panels Underlayment Photo, Metal Valley Crew Photo, Metal Roof Aerial Complete, Aerial progress photo of metal roof installation (+6 more)

### Community 17 - "Client Handover and Blockers"
Cohesion: 0.19
Nodes (13): CTL Pro Construction LLC, Unverified FORTIFIED certification, CTL Pro Site Handover document, Nothing invented to fill a hole, Nineteen-page build ledger, Robert LeBas (client contact), Sixteen client asks, Blocked on Robert backlog (+5 more)

### Community 18 - "Services Content and Imagery"
Cohesion: 0.15
Nodes (12): services, servicesHub, ServicePage, Crew Working on Two-Story House, Emergency Roof Tear-Off, Hero Image - Roofing Crew, Outdoor Patio Frame Construction, Exterior Remodeling Construction (+4 more)

### Community 19 - "Shingle Roofing Photos"
Cohesion: 0.18
Nodes (13): Aerial photo of finished shingle roof, Photo of shingle roof on brick ranch home, Aerial photo of finished shingle roof details, Aerial photo of exposed roof decking during tear-off, Photo of finished shingle roof with turbine vents, Before and after photos of a two-story home shingle roof, Shingle Aerial Finished, Shingle Brick Ranch (+5 more)

### Community 20 - "Team Page and Headshots"
Cohesion: 0.17
Nodes (11): Ceci Harper Headshot, Paige Thacker Roof Selfie, teamPage, CTL Roofing Team, Alex Alvarez, Ceci Harper, Jody Holliday, Megan Chauvin - Team Photo (+3 more)

### Community 21 - "Patio and Carport Photos"
Cohesion: 0.21
Nodes (12): Carport Attached Photo, Patio Cover Finished Photo, Attached Carport, Photo of finished patio cover, Photo of patio frame construction, Photo of patio timber joint detail, Photo of porch with finished wood columns, Patio Frame Going Up (+4 more)

### Community 22 - "Consent and Analytics Gating"
Cohesion: 0.32
Nodes (8): Analytics(), BookingEmbed(), CookieConsent(), choose(), CONSENT_EVENT, ConsentValue, getConsent(), setConsent()

### Community 23 - "Contact, Reviews, Video Content"
Cohesion: 0.20
Nodes (9): contactPage, reviewsPage, CtaCopy, PageMeta, Clip, clips, videoPage, CTL Office Meeting (+1 more)

### Community 24 - "Tear-Off and Storm Tarp Photos"
Cohesion: 0.20
Nodes (11): Atlas Pinnacle Sun Shingles, Photo of stacked shingle bundles, Photo of crew installing shingle underlayment, Shingle Bundles, Shingle Crew Install, Storm Tarps Yard, Tearoff Crew Tarps, Tearoff Decking (+3 more)

### Community 25 - "Gallery Browser and Lightbox"
Cohesion: 0.27
Nodes (9): GalleryPage(), Filter, GalleryBrowser(), GalleryTile(), Lightbox(), thumbFor(), GalleryCategory, getGallery() (+1 more)

### Community 26 - "Content Architecture Decisions"
Cohesion: 0.18
Nodes (11): CMS-ready, no CMS yet, Gallery from one content/gallery.ts source, client.config.ts site-level contract, content/ modules read through lib/content.ts, The CMS decision that changes the quote, Five-item nav, socials out of the main nav, client.config.ts TODO(client) fields, NEXT_PUBLIC_FORM_ENDPOINT (+3 more)

### Community 27 - "Legal Pages and Indexability"
Cohesion: 0.29
Nodes (5): LegalPage(), metadata, metadata, robotsFor(), isIndexable()

### Community 28 - "Financing and Storm Content"
Cohesion: 0.22
Nodes (7): BeforeAfter(), financing, storm, Faq, Photo, Shop Metal Stock, Storm Tarped Home

### Community 29 - "Upload Security Chain"
Cohesion: 0.24
Nodes (10): Careers page gated at the route, not by a banner, Site chrome moved into app/layout.tsx, lib/routes.ts route registry and live flags, ALLOWED_ORIGINS fail-closed allowlist, NEXT_PUBLIC_CAREERS_ENDPOINT, Magic-byte file type check, No file scanning — procedural mitigation, Worker-side R2 key generation (+2 more)

### Community 30 - "Deliberate Scope Omissions"
Cohesion: 0.28
Nodes (9): Seven deliberate omissions, Areas hub without per-town pages, Case studies as a compiled component, not a route, Hard-coded Facebook recommendations, GoogleReviews client-side Places fetch, No AggregateRating JSON-LD, Areas we serve hub plus town pages, Project case studies (proposed) (+1 more)

### Community 31 - "Conversion and Lead Capture"
Cohesion: 0.25
Nodes (8): Call-tracking DNI script seam, Delegated interaction tracking listener, Financing payment estimator, Dev-only <Pending> gap markers, Build as a spec pitch, One primary action sitewide, Financing estimator (proposed), Sticky mobile bar: Call | Text | Book

### Community 32 - "Static Export Architecture"
Cohesion: 0.38
Nodes (7): How it runs — static files plus one Worker, output: "export" static-export constraint, Careers / join the crew (proposed), ctl-careers-upload Worker, Named environments do not inherit bindings, Percent-encoded R2 custom metadata, Private R2 bucket, no read path

### Community 33 - "Window and Sunroom Photos"
Cohesion: 0.29
Nodes (7): Interior New Windows Photo, Interior Window Wall Photo, Interior New Windows, Interior Window Wall, Sunroom Exterior, Window Replacement Work, Sunroom Exterior Photo

### Community 34 - "Storm Damage and Claims"
Cohesion: 0.47
Nodes (6): Louisiana public adjusting limit (La. R.S. 22:1691), Storm damage & insurance claims page, CTL site rebuild work breakdown, Home page funnel table, CTL Roofing site rebuild plan (client requirements), Storm damage & insurance claims (proposed page)

### Community 35 - "Patio Cover Framing Photos"
Cohesion: 0.50
Nodes (5): Patio Cover Framing - Posts and Header, Completed Patio Cover with Stained Columns, Patio Cover Framing - Joint Detail, Patio Cover Framing - Rafters and Scaffolding, Completed Wooden Deck and Ramp Structure

### Community 36 - "Leadership Headshots"
Cohesion: 0.40
Nodes (5): JP Boudreaux Headshot, Owner Headshot, Scott Toups Headshot, CTL Owner Portrait, JP Boudreaux

### Community 37 - "Financing Payment Estimator"
Cohesion: 0.60
Nodes (4): dollars(), monthlyPayment(), PaymentEstimator(), FinanceOffer

### Community 38 - "Utility Bar and Socials"
Cohesion: 0.50
Nodes (3): paths, SocialIcons(), UtilityBar()

### Community 39 - "Office and Team Photos"
Cohesion: 0.67
Nodes (4): Alex Alvarez Headshot, Jody Holliday Headshot, CTL Roofing office team sitting at a conference table, CTL Roofing team standing in front of office counter

### Community 40 - "Sitemap Generation"
Cohesion: 0.67
Nodes (3): dynamic, sitemap(), livePaths()

### Community 41 - "Bathroom Remodel Photos"
Cohesion: 0.67
Nodes (4): Bath Tiled Shower Photo, Bath Vanity Finished Photo, Bath Tiled Shower, Finished Bath Vanity

### Community 42 - "Aerial Underlayment Photos"
Cohesion: 0.67
Nodes (3): Aerial View of Roof Underlayment Installation - Angle 1, Aerial View of Roof Underlayment Installation - Angle 2, Aerial View of Roof Underlayment Installation - Angle 3

### Community 43 - "Sunroom Renovation Photos"
Cohesion: 0.67
Nodes (3): Exterior window and siding installation, Interior sunroom renovation with brick wainscoting, Interior sunroom view with windows

### Community 44 - "Roof Replacement Sequence"
Cohesion: 0.67
Nodes (3): Completed shingle roof on brick home, Brick home before roof replacement, Roof replacement in progress with CertainTeed underlayment

### Community 45 - "Brand Logo Assets"
Cohesion: 0.67
Nodes (3): CTL Roofing App Icon, CTL Roofing Logo, Open Graph Image

### Community 46 - "Video Page"
Cohesion: 0.67
Nodes (3): runtime(), VideoPage(), getClips()

## Knowledge Gaps
- **254 isolated node(s):** `areas`, `metadata`, `page`, `metadata`, `hub` (+249 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 289 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `client` connect `App Router Page Shells` to `Careers Form and Turnstile`, `Utility Bar and Socials`, `Sitemap Generation`, `Root Layout and Preview Mode`, `Navigation and Route Registry`, `Google Reviews Feed`, `Consent and Analytics Gating`, `Legal Pages and Indexability`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `btn()` connect `App Router Page Shells` to `Careers Form and Turnstile`, `Navigation and Route Registry`, `Consent and Analytics Gating`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `JP Boudreaux` connect `Leadership Headshots` to `Team Page and Headshots`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `areas`, `metadata`, `page` to the rest of the system?**
  _254 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Router Page Shells` be split into smaller, more focused modules?**
  _Cohesion score 0.062039493073975834 - nodes in this community are weakly interconnected._
- **Should `Site NPM Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `Brand Token Check Script` be split into smaller, more focused modules?**
  _Cohesion score 0.06984126984126984 - nodes in this community are weakly interconnected._