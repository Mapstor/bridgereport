# BridgeReport.org — Project Specification
# ==========================================
# Master reference document for Claude Code build sessions.
# Keep this file in the project root. Reference it in every CC session.

## 1. PROJECT OVERVIEW

**Domain:** BridgeReport.org
**Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Recharts
**Data:** FHWA National Bridge Inventory (NBI) 2024 — preprocessed JSON in `data/`
**Hosting:** Vercel (static + ISR)
**Monetization:** Raptive display ads (apply after 100K sessions/mo)
**Goal:** Programmatic SEO site covering all 623,218 US highway bridges

## 2. DATA LAYER

### 2.1 Data Directory Structure
All data lives in `data/` as preprocessed JSON from `process_nbi.py`:

```
data/
├── national.json                    # National summary stats
├── states/AL.json ... WY.json       # 54 state summaries
├── counties/AL/001.json ...         # 3,217 county summaries
├── cities/AL/00100.json ...         # 21,365 city/place summaries
├── bridges/AL/structure_id.json ... # 623,218 individual bridges
├── rankings/
│   ├── worst_states.json
│   ├── best_states.json
│   ├── longest_bridges.json
│   ├── oldest_bridges.json
│   ├── most_trafficked.json
│   ├── worst_condition.json
│   ├── longest_span.json
│   └── historic_bridges.json
└── meta/
    ├── sitemap_states.json
    ├── sitemap_counties.json
    └── all_codes.json
```

### 2.2 Key Data Shapes

**National summary** (`national.json`):
```typescript
{
  total: number;          // 623,218
  good: number;           // 274,859
  fair: number;           // 306,279
  poor: number;           // 42,080
  goodPct: number;        // 44.1
  fairPct: number;        // 49.1
  poorPct: number;        // 6.8
  structurallyDeficient: number;
  sdPct: number;
  materials: Record<string, number>;      // {"Steel": 142000, ...}
  designTypes: Record<string, number>;
  ageDistribution: Record<string, number>; // {"0-20 years": 85000, ...}
  owners: Record<string, number>;
  avgAdt: number;
  totalDailyCrossings: number;
  avgYearBuilt: number;
  oldestYear: number;
  newestYear: number;
  avgLengthFt: number;
  ratingDistribution: Record<string, number>; // {"0": 12, "1": 45, ...}
}
```

**State summary** (`states/TX.json`):
```typescript
{
  state: string;            // "TX"
  stateName: string;        // "Texas"
  total: number;
  good/fair/poor: number;
  goodPct/fairPct/poorPct: number;
  materials: Record<string, number>;
  designTypes: Record<string, number>;
  ageDistribution: Record<string, number>;
  owners: Record<string, number>;
  avgAdt: number;
  avgYearBuilt: number;
  countyCount: number;
  cityCount: number;
  topCounties: Array<{fips, total, poor, poorPct, avgAdt}>;
  worstBridges: Array<BridgeSlim>;
  mostTrafficked: Array<BridgeSlim>;
  ratingDistribution: Record<string, number>;
}
```

**County summary** (`counties/TX/201.json`):
Same as state but adds `bridges: Array<BridgeSlim>` with all bridges listed.

**Individual bridge** (`bridges/TX/structure_id.json`):
```typescript
{
  id: string;                    // "TX-00000000001234"
  structureNumber: string;
  state/stateName: string;
  countyFips/placeFips: string;
  location: string;              // "0.1 MI N OF FM 123"
  featuresIntersected: string;   // "TRINITY RIVER"
  facilityCarried: string;       // "IH 35"
  lat/lon: number | null;
  routePrefix/routePrefixName: string;
  routeNumber: string;
  owner/ownerName: string;
  yearBuilt: number | null;
  yearReconstructed: number | null;
  material/materialName/materialGroup: string;
  designType/designTypeName: string;
  lanesOn/lanesUnder: number;
  maxSpanM/maxSpanFt: number | null;
  lengthM/lengthFt: number | null;
  deckWidthM/deckWidthFt: number | null;
  adt: number | null;            // Average daily traffic
  adtYear: number | null;
  truckPct: number | null;
  deckCondition/superstructureCondition/substructureCondition: string | null;
  culvertCondition/channelCondition: string | null;
  lowestRating: number | null;   // 0-9
  conditionCategory: "good" | "fair" | "poor" | null;
  structurallyDeficient: boolean;
  operatingRating/inventoryRating: number | null;
  toll: boolean;
  historical/historicalName: string | null;
  scourCritical: string;
  detourKm: number | null;
  status: string;
  deckArea: number | null;
}
```

### 2.3 Data Access Pattern
- Use `fs.readFileSync` in `generateStaticParams` and server components
- Read from `data/` relative to project root
- Create utility functions in `src/lib/data.ts`:
  - `getNational()`, `getState(abbr)`, `getCounty(state, fips)`
  - `getCity(state, fips)`, `getBridge(state, structureId)`
  - `getRanking(type)`, `getAllStates()`, `getCountiesForState(abbr)`

### 2.4 FIPS County Names
The NBI data uses FIPS codes for counties but does NOT include county names.
We need a FIPS-to-county-name lookup file.
Source: https://www.census.gov/library/reference/code-lists/ansi.html
Create `data/meta/fips_counties.json` mapping `"SSFIPS-CCCFIPS" → "County Name"`.
Similarly for place names: `data/meta/fips_places.json`.


## 3. PAGE ARCHITECTURE

### 3.1 URL Structure & Page Types

| Priority | URL Pattern | Pages | Template |
|----------|-------------|-------|----------|
| P0 | `/` | 1 | Homepage |
| P0 | `/state/[abbr]` | 54 | State profile |
| P0 | `/county/[state]/[county-slug]` | 3,217 | County profile |
| P0 | `/bridge/[state]/[structure-id]` | 623,218 | Bridge profile |
| P0 | `/bridges-near-me` | 1 | Geolocation tool |
| P0 | `/rankings` | 1 | National rankings |
| P1 | `/city/[state]/[city-slug]` | 21,365 | City profile |
| P1 | `/worst-bridges/[state]` | 54 | Worst bridges list |
| P1 | `/longest-bridges` | 1 | Ranking page |
| P1 | `/oldest-bridges` | 1 | Ranking page |
| P1 | `/most-trafficked-bridges` | 1 | Ranking page |
| P1 | `/historic-bridges` | 1 | Ranking page |
| P2 | `/covered-bridges/[state]` | ~30 | Specialty list |
| P2 | `/type/[material-slug]` | 15 | Category page |
| P2 | `/guides/[topic]` | 20 | Editorial |

### 3.2 Static Generation Strategy
- **Full SSG:** State pages, ranking pages, superlative pages (< 100 pages)
- **ISR with generateStaticParams:** County pages, city pages (revalidate: 86400)
- **ISR on-demand:** Individual bridge pages (too many for build-time, use fallback: true)
- **Client-side:** Bridges Near Me (geolocation), interactive map


## 4. DESIGN SYSTEM

### 4.1 Visual Identity
- **Aesthetic:** Clean, data-forward, government/infrastructure feel. Not flashy. Trustworthy.
- **Inspiration:** ASCE Infrastructure Report Card, ARTBA Bridge Report, FiveThirtyEight data pages
- **Primary font:** System font stack (fast loading, professional)
- **Monospace font:** For data values — use `font-mono` Tailwind class
- **Colors:**
  - Slate-900 `#0f172a` — Headers, primary text
  - Slate-700 `#334155` — Body text
  - Slate-400 `#94a3b8` — Secondary text
  - Green-500 `#22c55e` — Good condition
  - Yellow-500 `#eab308` — Fair condition
  - Red-500 `#ef4444` — Poor condition
  - Blue-600 `#2563eb` — Links, interactive elements
  - Blue-50 `#eff6ff` — Highlight backgrounds

### 4.2 Component Library
Build these reusable components in `src/components/`:

- `ConditionBadge` — Green/Yellow/Red badge showing Good/Fair/Poor
- `ConditionPieChart` — Recharts pie showing Good/Fair/Poor split
- `ConditionTrendChart` — Line chart for historical trends (when we add multi-year data)
- `BridgeTable` — Sortable table of bridges with condition, ADT, year, material
- `MaterialBarChart` — Horizontal bar chart of material distribution
- `AgeDistributionChart` — Bar chart of age brackets
- `RatingDistributionChart` — Bar chart of 0-9 ratings
- `StatComparisonCard` — State value vs national average side-by-side
- `KeyFactsBox` — Highlighted box with 4-5 key facts
- `DataSourceFooter` — Standard attribution to FHWA/NBI
- `InternalLinkGrid` — Grid of links to related pages (states, counties, etc.)
- `BridgeMap` — Leaflet/Mapbox map showing bridge locations (client component)
- `NearMeFinder` — Geolocation + nearest bridges tool
- `StatsBar` — Horizontal bar of key numbers (total, deficient, etc.)
- `SortableHeader` — Table header with sort arrows


## 5. SEO REQUIREMENTS

### 5.1 Metadata per Page Type
Every page must have:
- Unique `<title>` with primary keyword
- Unique `<meta description>` (150-160 chars)
- Canonical URL
- Open Graph tags (title, description, type, url)
- JSON-LD structured data

**Title patterns:**
- State: `Bridges in {State} — {total} Bridges, {poorPct}% Deficient | BridgeReport.org`
- County: `Bridges in {County}, {State} — Condition Report | BridgeReport.org`
- Bridge: `{FacilityCarried} over {FeaturesIntersected}, {State} — Bridge Condition | BridgeReport.org`
- City: `Bridges in {City}, {State} — {total} Bridges | BridgeReport.org`

### 5.2 JSON-LD Schemas
- **State/County/City pages:** `Dataset` schema + `BreadcrumbList`
- **Bridge pages:** `Place` schema + `BreadcrumbList`
- **Rankings:** `ItemList` schema
- **Homepage:** `WebSite` + `Organization`

### 5.3 Internal Linking Rules
Every page must link to:
- Parent: Bridge → County → State → Homepage
- Siblings: Other states (from state page), other counties (from county page)
- Children: State → its counties, County → its bridges

Breadcrumb on every page:
`Home > {State} > {County} > {Bridge}`

### 5.4 Sitemaps
- Split by state: `sitemap-bridges-TX.xml`, `sitemap-bridges-CA.xml`, etc.
- Max 50,000 URLs per sitemap file
- `sitemap-index.xml` pointing to all sub-sitemaps
- `sitemap-states.xml` (54 URLs)
- `sitemap-counties.xml` (~3,217 URLs)
- `sitemap-cities.xml` (~21,365 URLs)
- `sitemap-rankings.xml` (static pages)

### 5.5 robots.txt
```
User-agent: *
Allow: /
Sitemap: https://bridgereport.org/sitemap-index.xml
```


## 6. CONTENT STANDARDS

### 6.1 Writing Rules (apply to all generated content)
- **Max 3 sentences per paragraph.** No walls of text.
- **No filler.** Every sentence must contain data or actionable info.
- **Tables over lists** for structured data.
- **Charts for distributions** — condition pie, material bar, age bar.
- **Internal links in context** — mention county names as links, state names as links.
- **External links to authority sources:**
  - FHWA: https://www.fhwa.dot.gov/bridge/nbi.cfm
  - ARTBA: https://artbabridgereport.org/
  - State DOT websites
  - ASCE Infrastructure Report Card: https://infrastructurereportcard.org/
- **Source attribution** at bottom of every page: "Data from FHWA National Bridge Inventory, downloaded [date]."

### 6.2 Condition Rating Explanations
Always explain what ratings mean to non-engineers:
- 9 = Excellent, 8 = Very Good, 7 = Good
- 6 = Satisfactory, 5 = Fair
- 4 = Poor, 3 = Serious, 2 = Critical, 1 = Imminent Failure, 0 = Failed
- "Structurally deficient" = rating ≤ 4 on deck, superstructure, substructure, or culvert
- "Structurally deficient does NOT mean unsafe" — inspectors may impose load limits

### 6.3 Disclaimers (required on every page)
- "Bridge inspection data is typically updated every 24 months. Conditions may have changed."
- "Structurally deficient does not mean a bridge is unsafe or likely to collapse."
- "Data sourced from FHWA National Bridge Inventory. Not for route clearance purposes."


## 7. PERFORMANCE TARGETS

- Lighthouse score: 90+ on all metrics
- LCP < 2.5s
- No layout shift (CLS < 0.1)
- Total page weight < 200KB (excluding ad scripts)
- Charts load lazily (below fold)
- Maps load on interaction only
- Images: None needed for programmatic pages (data-driven, no photos)


## 8. AD INTEGRATION (Phase 2, after traffic)

- Raptive display ads (minimum 100K sessions/mo to apply)
- Ad slots: top of content, mid-content, sidebar (desktop), bottom
- Lazy load all ad units
- Don't let ads break layout or shift content
- Expected RPMs: $12-18 for infrastructure/government content


## 9. FIPS COUNTY NAMES

The NBI data only has FIPS codes, not county names. You MUST create a lookup file.
Download county FIPS names from Census:
https://www.census.gov/library/reference/code-lists/ansi.html#cou

Create `data/meta/fips_counties.json`:
```json
{
  "01-001": "Autauga County",
  "01-003": "Baldwin County",
  ...
}
```

Similarly for place names, create `data/meta/fips_places.json`:
```json
{
  "01-00100": "Abanda",
  "01-00124": "Abbeville",
  ...
}
```

These are essential for generating readable page titles and URLs.


## 10. MULTI-YEAR DATA (Future Enhancement)

The NBI dataset is published annually. For trend charts:
1. Download 2020, 2021, 2022, 2023, 2024 datasets
2. Run process_nbi.py on each with different output dirs
3. Create `data/trends/` with year-over-year comparisons per state
4. This enables "improvement over time" charts on state pages

Not needed for launch but plan the data layer to support it.
