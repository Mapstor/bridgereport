# BridgeReport.org — Claude Code Build Prompts
# ================================================
# Sequential prompts for building the site in Claude Code.
# Run each prompt in a fresh CC session (or continue in same if context allows).
# Always reference PROJECT_SPEC.md at the start of each session.
#
# TOTAL SESSIONS NEEDED: ~12-15 for full site
# ESTIMATED BUILD TIME: 2-3 days
#
# Before starting: Ensure data/ directory exists with all JSON files from process_nbi.py


# ════════════════════════════════════════════════════════════
# SESSION 1: Project Scaffold + Data Layer
# ════════════════════════════════════════════════════════════

"""
Read PROJECT_SPEC.md first. This is the master spec for BridgeReport.org.

Initialize the Next.js project in this directory:
- Next.js 14+ with App Router, TypeScript, Tailwind CSS
- Install recharts for charts
- Install leaflet + react-leaflet for maps (we'll use later)

Then build the data access layer in src/lib/data.ts:
- Functions to read JSON from data/ directory
- getNational(), getState(abbr), getAllStates()
- getCounty(state, fips), getCountiesForState(state)  
- getCity(state, fips), getCitiesForState(state)
- getBridge(state, structureId)
- getRanking(type) for rankings/*.json
- getMeta() for code lookups from meta/all_codes.json
- All functions should use fs.readFileSync with JSON.parse
- Add proper TypeScript types matching the data shapes in PROJECT_SPEC.md

Also create the FIPS county name lookup:
- Download county FIPS codes from Census or create from a reliable source
- Save to data/meta/fips_counties.json mapping "SS-CCC" → "County Name"
- Download place FIPS codes similarly
- Save to data/meta/fips_places.json mapping "SS-PPPPP" → "Place Name"
- Add getCountyName(state, fips) and getPlaceName(state, fips) to data.ts

Create basic layout in src/app/layout.tsx:
- Clean, professional layout with navigation
- Follow the design system colors from PROJECT_SPEC.md
- Header with site name and nav links: Home, Rankings, Near Me, States dropdown
- Footer with data source attribution and links to FHWA, ARTBA

Don't build any pages yet — just the foundation.
"""


# ════════════════════════════════════════════════════════════
# SESSION 2: Homepage + National Rankings Page
# ════════════════════════════════════════════════════════════

"""
Read PROJECT_SPEC.md for reference.

Build the homepage at src/app/page.tsx:
- Hero section: "America's 623,218 Highway Bridges" with key stats bar
  (total bridges, % good, % fair, % poor, daily crossings)
- "Bridges Near Me" CTA button (links to /bridges-near-me)
- National condition overview with pie chart (Good/Fair/Poor using Recharts)
- All 50 States grid: clickable cards showing state name, bridge count, % poor
  - Sort by bridge count by default
  - Color-code the % poor (green < 5%, yellow 5-10%, red > 10%)
  - Each card links to /state/[abbr]
- "Worst Bridges in America" preview section — top 10 from rankings
- Quick links to: Longest Bridges, Oldest Bridges, Most Trafficked
- Data source footer
- SEO: title "US Bridge Conditions — 623,218 Bridges Rated | BridgeReport.org"
- JSON-LD: WebSite + Organization schema

Build the national rankings page at src/app/rankings/page.tsx:
- Sortable table of all 54 states/territories
- Columns: Rank, State, Total Bridges, Good%, Fair%, Poor%, Avg ADT, Avg Year Built
- Default sort by % poor (highest first = worst)
- Toggle to sort by any column
- Color-code the Poor% column (green/yellow/red)
- Each state name links to /state/[abbr]
- SEO: "Bridge Conditions by State — Ranking All 50 States | BridgeReport.org"
- JSON-LD: ItemList schema

Content rules: Max 3 sentences per paragraph. No filler text. Tables over bullet lists.
External links to FHWA, ARTBA as authority sources.
"""


# ════════════════════════════════════════════════════════════
# SESSION 3: State Pages (the big one)
# ════════════════════════════════════════════════════════════

"""
Read PROJECT_SPEC.md for reference.

Build the state page template at src/app/state/[abbr]/page.tsx:
This is the most important template — it serves 54 pages. Make it comprehensive.

Use generateStaticParams to pre-build all 54 state pages.

Page structure:
1. Hero: State name, total bridges, key stats bar
2. State vs National comparison cards (side by side: state poorPct vs 6.8% national)
3. Condition breakdown: Pie chart (Good/Fair/Poor) + table with counts and percentages
4. Rating distribution chart: Bar chart of 0-9 ratings  
5. Bridge materials: Horizontal bar chart (Steel, Concrete, Prestressed, Wood, etc.)
6. Age distribution: Bar chart by decade brackets
7. Ownership: Who owns the bridges (State DOT, County, City, Federal, etc.)
8. Top counties table: Top 20 counties by bridge count, with poor count and %, 
   each county name linking to /county/[state]/[county-slug]
9. Worst bridges section: Top 10 worst-rated bridges in the state,
   each linking to /bridge/[state]/[id]
10. Most trafficked section: Top 10 highest ADT bridges
11. Internal links: Grid of neighboring states, link to national rankings
12. Data sources & methodology footer

Generate dynamic SEO metadata:
- Title: "Bridges in {StateName} — {total} Bridges, {poorPct}% Deficient | BridgeReport.org"  
- Description: "{StateName} has {total} highway bridges. {poorPct}% are structurally deficient..."
- JSON-LD: Dataset schema + BreadcrumbList (Home > {State})

Content around charts — add 2-3 sentence context paragraphs between each section.
Never more than 3 sentences in a row. Every sentence must include a data point.

Charts should lazy-load (dynamic import with ssr: false for Recharts components).
"""


# ════════════════════════════════════════════════════════════
# SESSION 4: County Pages
# ════════════════════════════════════════════════════════════

"""
Read PROJECT_SPEC.md for reference.

Build county page at src/app/county/[state]/[slug]/page.tsx:

Use generateStaticParams to generate params for all 3,217 counties.
URL slug should be county name lowercased with hyphens (e.g., "harris-county").
Use fips_counties.json to resolve county names from FIPS codes.

Page structure:
1. Header: "{County Name}, {State}" with bridge count and condition stats
2. Condition pie chart + stats vs state and national averages
3. Full bridge table: ALL bridges in the county, sortable by:
   - Condition (worst first), Year Built, ADT, Length, Material
   - Each bridge row links to /bridge/[state]/[id]
   - Show: Facility Carried, Features Intersected, Year, Rating, Condition badge, ADT
4. Material and age distribution charts
5. Map showing all bridge locations in county (if lat/lon available)
   - Use Leaflet with markers colored by condition (green/yellow/red)
   - Lazy load the map component
6. Internal links: Back to state page, neighboring counties, worst bridges
7. Data source footer

SEO metadata:
- Title: "Bridges in {County}, {State} — {total} Bridges | BridgeReport.org"
- JSON-LD: Dataset + BreadcrumbList (Home > {State} > {County})

Breadcrumb component: Home > Texas > Harris County
"""


# ════════════════════════════════════════════════════════════
# SESSION 5: Individual Bridge Pages
# ════════════════════════════════════════════════════════════

"""
Read PROJECT_SPEC.md for reference.

Build bridge profile page at src/app/bridge/[state]/[id]/page.tsx:

This serves 623,218 pages — the long-tail SEO core.
Use generateStaticParams for ONLY the top ~5,000 most-searched bridges
(highest ADT + historic bridges). All others use fallback: true with ISR.

Page structure:
1. Header: "{Facility Carried} over {Features Intersected}"
   Subtitle: "{Location}, {County Name}, {State}"
2. Condition overview card:
   - Overall condition badge (Good/Fair/Poor) — big and prominent
   - Individual ratings: Deck, Superstructure, Substructure, Culvert, Channel
   - Each shown as a colored number (0-9) with label
   - "Structurally Deficient: Yes/No" flag
   - If SD, add explanation: "This bridge has a rating of 4 or below..."
3. Bridge details table:
   - Year Built / Year Reconstructed
   - Material type / Design type
   - Length (ft + m) / Max span (ft + m) / Deck width
   - Lanes on / Lanes under
   - Owner
   - Route type and number
   - Functional class
   - Toll bridge yes/no
   - Historical significance
   - Scour critical rating
   - Detour length
4. Traffic section:
   - Average Daily Traffic with year
   - Truck percentage
   - Future ADT projection
5. Map: Single marker showing bridge location (if lat/lon available)
6. Operating/Inventory ratings with explanation
7. Internal links:
   - "Other bridges in {County}" → link to county page
   - "All bridges in {State}" → link to state page
   - "Worst bridges in {State}" → link to worst page
8. Data disclaimer + source footer

SEO metadata:
- Title: "{Facility} over {Features}, {State} — Bridge Condition | BridgeReport.org"
- Description with year built, condition, ADT
- JSON-LD: Place schema + BreadcrumbList (Home > State > County > Bridge)

IMPORTANT: Keep this page lightweight. No heavy charts. Just data display.
Must load fast since there are 623K of them.
"""


# ════════════════════════════════════════════════════════════
# SESSION 6: City Pages
# ════════════════════════════════════════════════════════════

"""
Read PROJECT_SPEC.md for reference.

Build city page at src/app/city/[state]/[slug]/page.tsx:

Similar to county pages but scoped to city/place FIPS.
21,365 cities. Use generateStaticParams for top 2,000 by bridge count,
fallback: true for the rest.

Page structure:
1. Header: "Bridges in {City Name}, {State}"
2. Condition summary with pie chart
3. Bridge table (all bridges in city)
4. Internal links to parent county and state

Simpler than county page — no map needed here. Focus on the bridge table.

SEO: "Bridges in {City}, {State} — {total} Bridges | BridgeReport.org"
Breadcrumb: Home > {State} > {County} > {City}
"""


# ════════════════════════════════════════════════════════════
# SESSION 7: Ranking Pages (Superlatives)
# ════════════════════════════════════════════════════════════

"""
Read PROJECT_SPEC.md for reference.

Build these ranking pages using data from data/rankings/:

1. /longest-bridges (page.tsx) — Top 500 longest bridges by total length
2. /oldest-bridges — Top 500 oldest by year built
3. /most-trafficked-bridges — Top 500 by average daily traffic
4. /historic-bridges — Bridges on National Register of Historic Places
5. /worst-bridges/[state] — Per-state worst bridges (54 pages)

Each page should have:
- Numbered table with rank, bridge name, state, value, condition badge
- Each row links to the individual bridge page
- Intro paragraph with context (2-3 sentences max)
- SEO optimized title and meta description

For /longest-bridges:
- Title: "Longest Bridges in the United States — Top 500 | BridgeReport.org"
- Target keyword: "longest bridges in the us" (18,100/mo)

For /oldest-bridges:
- Title: "Oldest Bridges in America — Top 500 | BridgeReport.org"
- Target keyword: "oldest bridges in america" (880/mo)

For /worst-bridges/[state]:
- Title: "Worst Bridges in {State} — Structurally Deficient | BridgeReport.org"
- generateStaticParams for all 54 states
"""


# ════════════════════════════════════════════════════════════
# SESSION 8: Bridges Near Me Tool
# ════════════════════════════════════════════════════════════

"""
Read PROJECT_SPEC.md for reference.

Build /bridges-near-me as a client-side interactive tool.
Target keyword: "bridges near me" (27,100/mo)

This page needs:
1. Geolocation request on page load (with fallback to IP-based location)
2. Once we have lat/lon, find nearest bridges from our dataset
3. Show results on a Leaflet map with colored markers (green/yellow/red)
4. List of nearest 50 bridges sorted by distance, with:
   - Bridge name/facility, distance, condition badge, year built, ADT
   - Each links to bridge profile page

Implementation approach:
- Since we can't query 623K JSON files client-side, we need an approach:
  OPTION A: Pre-generate a spatial index file (simplified lat/lon + id + condition 
  for all bridges, ~15MB) and load it client-side with a KD-tree search
  OPTION B: Create an API route that reads bridge files server-side
  OPTION C: Use a lightweight SQLite database for spatial queries

Recommend OPTION A for Vercel deployment:
- Create data/spatial-index.json with just: [{lat, lon, id, state, facility, 
  features, condition, yearBuilt, adt}] for all bridges with valid coordinates
- Load this file client-side (will be ~15-20MB gzipped to ~3MB)
- Use haversine distance calculation to find nearest
- Show loading state while index loads

Page SEO:
- Title: "Bridges Near Me — Check Bridge Conditions in Your Area | BridgeReport.org"
- Server-render a static intro + state links, then hydrate with geolocation
"""


# ════════════════════════════════════════════════════════════
# SESSION 9: Sitemaps + robots.txt
# ════════════════════════════════════════════════════════════

"""
Read PROJECT_SPEC.md for reference.

Create XML sitemaps following the strategy in the spec:

1. src/app/sitemap-index.xml/route.ts — Index pointing to all sub-sitemaps
2. src/app/sitemap-states.xml/route.ts — 54 state URLs
3. src/app/sitemap-counties.xml/route.ts — ~3,217 county URLs
4. src/app/sitemap-cities.xml/route.ts — ~21,365 city URLs  
5. src/app/sitemap-rankings.xml/route.ts — Static ranking/tool pages
6. src/app/sitemap-bridges-[state].xml/route.ts — Per-state bridge URLs
   (one sitemap per state, each containing that state's bridges)
   Texas alone has 56K bridges so it needs its own sitemap file.
   Split into multiple files if a state exceeds 50K URLs.

Also create:
7. src/app/robots.txt/route.ts — Standard robots.txt pointing to sitemap index

Use Next.js Route Handlers (route.ts) to generate XML dynamically.
Read from data/meta/sitemap_states.json and sitemap_counties.json.
For bridge sitemaps, read the bridges directory to list all structure IDs.

Priority values:
- Homepage: 1.0
- State pages: 0.9
- County pages: 0.7
- City pages: 0.6
- Bridge pages: 0.5
- Rankings/tools: 0.8
"""


# ════════════════════════════════════════════════════════════
# SESSION 10: SEO Polish + JSON-LD + Metadata
# ════════════════════════════════════════════════════════════

"""
Read PROJECT_SPEC.md for reference.

Review and polish all SEO elements across the site:

1. Verify every page has unique title and meta description
2. Add JSON-LD structured data to every page type:
   - Homepage: WebSite + Organization
   - State/County/City: Dataset + BreadcrumbList  
   - Bridge: Place + BreadcrumbList
   - Rankings: ItemList + BreadcrumbList
3. Add Open Graph tags to all pages
4. Create a reusable Breadcrumb component used on every page
5. Ensure all internal links use Next.js <Link> component
6. Add rel="nofollow" to external links
7. Verify all images have alt text (maps mainly)
8. Check heading hierarchy (single H1 per page, proper H2/H3 nesting)
9. Add FAQ section with JSON-LD to state pages:
   - "How many bridges are in {State}?"
   - "What percentage of {State} bridges are structurally deficient?"
   - "How are bridge conditions rated?"

Test: Run `next build` and verify no errors. Check a few pages in browser.
"""


# ════════════════════════════════════════════════════════════
# SESSION 11: Performance + Deployment
# ════════════════════════════════════════════════════════════

"""
Read PROJECT_SPEC.md for reference.

Optimize for production:

1. Verify Lighthouse scores on key pages (aim for 90+ all metrics)
2. Lazy load all Recharts components with next/dynamic
3. Lazy load Leaflet maps (only load on interaction/viewport)
4. Minimize JSON data loaded per page (don't load full bridge list for state page)
5. Add proper caching headers
6. Test build: `next build` should complete without errors
7. Verify ISR works for bridge pages (fallback: true)
8. Estimate build time — if too long, adjust generateStaticParams
9. Create vercel.json if needed for configuration
10. Set up analytics (Google Analytics or Plausible)

Deploy checklist:
- [ ] All pages render correctly
- [ ] Sitemaps generate valid XML
- [ ] robots.txt is correct
- [ ] No console errors
- [ ] No broken internal links (spot check 20+ pages)
- [ ] Mobile responsive
- [ ] Condition badges display correctly
- [ ] Charts render
- [ ] Bridge Near Me geolocation works
"""


# ════════════════════════════════════════════════════════════
# FUTURE SESSIONS (Phase 2)
# ════════════════════════════════════════════════════════════

# SESSION 12: Covered bridges pages (/covered-bridges/[state])
# SESSION 13: Bridge type category pages (/type/[material])
# SESSION 14: State comparison tool (/compare)
# SESSION 15: Editorial guide articles (/guides/[topic])
# SESSION 16: Multi-year trend data (download 2020-2024 datasets)
# SESSION 17: Embeddable widget for backlink outreach
# SESSION 18: Ad integration (Raptive setup once traffic qualifies)
