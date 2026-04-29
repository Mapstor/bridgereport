import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Methodology — How BridgeReport Sources NBI Inspection Data',
  description: 'Detailed explanation of BridgeReport.org data sources, processing methodology, condition ratings, and how we present bridge infrastructure information.',
  alternates: {
    canonical: 'https://www.bridgereport.org/methodology',
  },
  openGraph: {
    title: 'Data Methodology - BridgeReport.org',
    description: 'Detailed explanation of BridgeReport.org data sources, processing methodology, condition ratings, and how we present bridge infrastructure information.',
    url: 'https://www.bridgereport.org/methodology',
    type: 'article',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Data Methodology - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Methodology - BridgeReport.org',
    description: 'Detailed explanation of BridgeReport.org data sources, processing methodology, condition ratings, and how we present bridge infrastructure information.',
    images: ['/og-image.png'],
  },
};

function MethodologyJsonLd() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.bridgereport.org',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Methodology',
        item: 'https://www.bridgereport.org/methodology',
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': 'https://www.bridgereport.org/methodology',
    headline: 'Data Methodology - BridgeReport.org',
    description: 'Detailed explanation of BridgeReport.org data sources, processing methodology, condition ratings, and how we present bridge infrastructure information.',
    url: 'https://www.bridgereport.org/methodology',
    author: { '@id': 'https://www.bridgereport.org/#organization' },
    publisher: { '@id': 'https://www.bridgereport.org/#organization' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://www.bridgereport.org/methodology',
    },
    about: [
      { '@type': 'Thing', name: 'National Bridge Inventory' },
      { '@type': 'Thing', name: 'Bridge Inspection' },
      { '@type': 'Thing', name: 'Infrastructure Data' },
    ],
    isPartOf: { '@id': 'https://www.bridgereport.org/#website' },
  };

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'BridgeReport.org Bridge Data',
    description: 'Comprehensive bridge condition data derived from the National Bridge Inventory (NBI), covering over 623,000 highway bridges in the United States.',
    url: 'https://www.bridgereport.org',
    license: 'https://www.usa.gov/government-works',
    creator: {
      '@type': 'Organization',
      name: 'BridgeReport.org',
    },
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: 'https://www.bridgereport.org',
    },
    temporalCoverage: '2020/2024',
    spatialCoverage: {
      '@type': 'Place',
      name: 'United States',
    },
    variableMeasured: [
      {
        '@type': 'PropertyValue',
        name: 'Bridge Condition Rating',
        description: 'Condition ratings for deck, superstructure, and substructure on a 0-9 scale',
      },
      {
        '@type': 'PropertyValue',
        name: 'Bridge Classification',
        description: 'Good, Fair, or Poor classification based on lowest component rating',
      },
    ],
    isBasedOn: {
      '@type': 'Dataset',
      name: 'National Bridge Inventory',
      url: 'https://www.fhwa.dot.gov/bridge/nbi.cfm',
      creator: {
        '@type': 'GovernmentOrganization',
        name: 'Federal Highway Administration',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
    </>
  );
}

export default function MethodologyPage() {
  return (
    <>
      <MethodologyJsonLd />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Data Methodology</h1>
          <p className="text-xl text-slate-300">
            A comprehensive guide to our data sources, processing methods, and how we present bridge condition information.
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Table of Contents</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <li><a href="#data-sources" className="text-blue-600 hover:text-blue-800">1. Data Sources</a></li>
          <li><a href="#nbi-overview" className="text-blue-600 hover:text-blue-800">2. National Bridge Inventory Overview</a></li>
          <li><a href="#condition-ratings" className="text-blue-600 hover:text-blue-800">3. Condition Ratings Explained</a></li>
          <li><a href="#classification" className="text-blue-600 hover:text-blue-800">4. Good/Fair/Poor Classification</a></li>
          <li><a href="#structurally-deficient" className="text-blue-600 hover:text-blue-800">5. Structurally Deficient Definition</a></li>
          <li><a href="#data-processing" className="text-blue-600 hover:text-blue-800">6. Data Processing Pipeline</a></li>
          <li><a href="#geographic-data" className="text-blue-600 hover:text-blue-800">7. Geographic Data Processing</a></li>
          <li><a href="#trend-analysis" className="text-blue-600 hover:text-blue-800">8. Multi-Year Trend Analysis</a></li>
          <li><a href="#statistics" className="text-blue-600 hover:text-blue-800">9. Statistics and Aggregations</a></li>
          <li><a href="#limitations" className="text-blue-600 hover:text-blue-800">10. Data Limitations</a></li>
          <li><a href="#updates" className="text-blue-600 hover:text-blue-800">11. Update Schedule</a></li>
          <li><a href="#references" className="text-blue-600 hover:text-blue-800">12. References and Resources</a></li>
        </ul>
      </nav>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Data Sources */}
        <section id="data-sources" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">1. Data Sources</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org aggregates data from multiple authoritative government sources to provide comprehensive bridge infrastructure information. Our primary data sources include:
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">National Bridge Inventory (NBI)</h3>
            <p>
              The National Bridge Inventory is our primary data source and serves as the foundation for all bridge information on this website. The NBI is maintained by the Federal Highway Administration (FHWA), a division of the U.S. Department of Transportation. It contains detailed records for every highway bridge in the United States with a span of more than 20 feet that is located on a public road.
            </p>
            <p>
              The NBI includes information on approximately 623,000 bridges and is updated annually based on inspection data submitted by all 50 states, the District of Columbia, and Puerto Rico. Each record contains over 100 data fields covering bridge identification, location, physical characteristics, condition ratings, traffic data, and maintenance information.
            </p>
            <p>
              <strong>Source URL:</strong>{' '}
              <a href="https://www.fhwa.dot.gov/bridge/nbi.cfm" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                https://www.fhwa.dot.gov/bridge/nbi.cfm
              </a>
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">U.S. Census Bureau</h3>
            <p>
              We supplement NBI data with geographic information from the U.S. Census Bureau. This includes official place names (cities, towns, Census Designated Places), FIPS codes for geographic identification, county boundaries, and population data. Census data helps us associate bridges with recognizable places and provide demographic context.
            </p>
            <p>
              <strong>Source URL:</strong>{' '}
              <a href="https://www.census.gov/data.html" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                https://www.census.gov/data.html
              </a>
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">FHWA Recording and Coding Guide</h3>
            <p>
              The FHWA Recording and Coding Guide for the Structure Inventory and Appraisal of the Nation&apos;s Bridges provides the official definitions and codes used in the NBI. We use this guide to translate numeric codes into human-readable descriptions for materials, design types, ownership, and other categorical fields.
            </p>
            <p>
              <strong>Source URL:</strong>{' '}
              <a href="https://www.fhwa.dot.gov/bridge/mtguide.cfm" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                https://www.fhwa.dot.gov/bridge/mtguide.cfm
              </a>
            </p>
          </div>
        </section>

        {/* NBI Overview */}
        <section id="nbi-overview" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">2. National Bridge Inventory Overview</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Historical Background</h3>
            <p>
              The National Bridge Inventory was established following the tragic collapse of the Silver Bridge on December 15, 1967. The Silver Bridge, which connected Point Pleasant, West Virginia, to Gallipolis, Ohio, collapsed during rush hour, resulting in 46 deaths. The disaster revealed that many bridges across the nation had not been systematically inspected or maintained.
            </p>
            <p>
              In response, Congress passed the Federal-Aid Highway Act of 1968, which mandated the creation of the National Bridge Inspection Standards (NBIS) and required all states to inventory and inspect their bridges on public roads. The first NBI data collection began in 1971, and the program has been continuously maintained and improved since then.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">What&apos;s Included in the NBI</h3>
            <p>
              The NBI covers highway bridges that meet the following criteria:
            </p>
            <ul>
              <li>Located on a public road (federal, state, county, city, or other public authority)</li>
              <li>Has a span of at least 20 feet (measured along the centerline of the roadway)</li>
              <li>Carries vehicular traffic (not exclusively pedestrian or railroad, unless also carrying highway traffic)</li>
            </ul>
            <p>
              This includes bridges over waterways, other roads, railroads, and other features. Culverts (box structures that carry roads over waterways) are included when they have a clear span of 20 feet or more.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">What&apos;s NOT Included</h3>
            <p>
              Several types of bridges are not included in the NBI:
            </p>
            <ul>
              <li>Bridges with spans less than 20 feet (estimated at 300,000+ nationwide)</li>
              <li>Bridges on private roads not open to public traffic</li>
              <li>Pedestrian-only bridges that do not carry vehicular traffic</li>
              <li>Railroad bridges that do not also carry highway traffic</li>
              <li>Bridges on federal lands managed under separate inspection programs (some National Park bridges, military installations, etc.)</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Inspection Requirements</h3>
            <p>
              Under the National Bridge Inspection Standards, each bridge in the NBI must be inspected at regular intervals by qualified inspectors:
            </p>
            <ul>
              <li><strong>Routine Inspections:</strong> At least once every 24 months for most bridges</li>
              <li><strong>Underwater Inspections:</strong> At least once every 60 months for bridges with underwater structural elements</li>
              <li><strong>Fracture-Critical Inspections:</strong> At least once every 24 months for bridges with fracture-critical members</li>
              <li><strong>Special Inspections:</strong> More frequent for bridges in poor condition or with known deficiencies</li>
            </ul>
            <p>
              States may request extended inspection intervals (up to 48 months) for bridges that meet certain criteria, though this requires FHWA approval.
            </p>
          </div>
        </section>

        {/* Condition Ratings */}
        <section id="condition-ratings" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">3. Condition Ratings Explained</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              Bridge inspectors assign condition ratings to key structural components using a standardized 0-9 scale defined by the FHWA. These ratings assess the physical condition of bridge elements based on visual inspection and, when appropriate, testing.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">The 0-9 Rating Scale</h3>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Rating</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Condition</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-green-700">9</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Excellent</td>
                    <td className="px-4 py-3 text-sm text-slate-600">No problems noted</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-green-700">8</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Very Good</td>
                    <td className="px-4 py-3 text-sm text-slate-600">No problems noted</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-green-700">7</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Good</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Some minor problems noted</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-yellow-700">6</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Satisfactory</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Structural elements show some minor deterioration</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-yellow-700">5</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Fair</td>
                    <td className="px-4 py-3 text-sm text-slate-600">All primary structural elements are sound but may have minor section loss, cracking, spalling, or scour</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-red-700">4</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Poor</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Advanced section loss, deterioration, spalling, or scour</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-red-700">3</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Serious</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Loss of section, deterioration, spalling, or scour have seriously affected primary structural components</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-red-700">2</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Critical</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Advanced deterioration of primary elements. May need bridge closure until corrective action taken</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-red-700">1</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Imminent Failure</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Major deterioration or section loss. Bridge may be closed or restricted to light traffic</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-red-700">0</td>
                    <td className="px-4 py-3 text-sm text-slate-700">Failed</td>
                    <td className="px-4 py-3 text-sm text-slate-600">Out of service, beyond corrective action</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Components Rated</h3>
            <p>
              Inspectors rate the condition of four main structural components:
            </p>
            <ul>
              <li><strong>Deck (NBI Item 58):</strong> The riding surface of the bridge that directly carries traffic. This includes the wearing surface, deck membrane, and structural deck.</li>
              <li><strong>Superstructure (NBI Item 59):</strong> The structural components that support the deck and transfer loads to the substructure. This includes girders, beams, trusses, arches, and floor systems.</li>
              <li><strong>Substructure (NBI Item 60):</strong> The components that support the superstructure and transfer loads to the foundation. This includes abutments, piers, caps, and footings.</li>
              <li><strong>Culvert (NBI Item 62):</strong> For culvert-type structures (pipes or boxes), this single rating replaces deck, superstructure, and substructure ratings.</li>
            </ul>
          </div>
        </section>

        {/* Classification */}
        <section id="classification" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">4. Good/Fair/Poor Classification</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org uses the FHWA&apos;s official Good/Fair/Poor classification system, which was introduced in 2016 as part of performance-based planning requirements under MAP-21 and the FAST Act. This system provides a simplified, consistent way to communicate bridge conditions to the public and policymakers.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Classification Method</h3>
            <p>
              The overall condition of a bridge is determined by the <strong>lowest rating</strong> among its primary structural components:
            </p>
            <ul>
              <li>For conventional bridges: The lowest of deck, superstructure, or substructure ratings</li>
              <li>For culverts: The culvert rating</li>
            </ul>
            <p>
              This lowest rating is then classified as follows:
            </p>

            <div className="not-prose grid gap-4 mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-green-700 mr-3">Good</span>
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Ratings 7, 8, or 9</span>
                </div>
                <p className="text-green-800 mt-2">
                  The bridge is in good condition, functioning as designed with minimal or no deterioration. May have some minor problems that do not affect structural capacity or function.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-yellow-700 mr-3">Fair</span>
                  <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Ratings 5 or 6</span>
                </div>
                <p className="text-yellow-800 mt-2">
                  The bridge shows some deterioration but is fully functional. Primary structural elements are sound. The bridge may benefit from preventive maintenance or minor repairs.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-red-700 mr-3">Poor</span>
                  <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">Ratings 4 or below</span>
                </div>
                <p className="text-red-800 mt-2">
                  The bridge has one or more key structural elements in poor condition. Advanced deterioration is present. The bridge remains safe but warrants attention and may have load restrictions.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Important Clarification: &quot;Poor&quot; Does Not Mean &quot;Unsafe&quot;</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
              <p className="text-blue-900 font-medium mb-2">
                A bridge classified as &quot;Poor&quot; is NOT the same as an unsafe bridge.
              </p>
              <p className="text-blue-800">
                Bridges in poor condition are still safe for public travel. They are inspected more frequently, may have load restrictions (weight limits) in place, and are prioritized for repair or replacement. State and local transportation agencies actively monitor these bridges and take appropriate action long before they become dangerous. A bridge would be closed to traffic before it becomes unsafe.
              </p>
            </div>
          </div>
        </section>

        {/* Structurally Deficient */}
        <section id="structurally-deficient" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">5. Structurally Deficient Definition</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              &quot;Structurally Deficient&quot; is a historical classification that was the primary metric for bridge conditions before the Good/Fair/Poor system was introduced in 2016. We include this metric for continuity with historical reporting and because some government reports and media sources still use this term.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Current Definition (Post-2018)</h3>
            <p>
              Under current FHWA standards, a bridge is classified as Structurally Deficient if it has a condition rating of <strong>4 or below</strong> for any of the following:
            </p>
            <ul>
              <li>Deck (NBI Item 58)</li>
              <li>Superstructure (NBI Item 59)</li>
              <li>Substructure (NBI Item 60)</li>
              <li>Culvert (NBI Item 62)</li>
            </ul>
            <p>
              This definition is essentially equivalent to the &quot;Poor&quot; classification in the Good/Fair/Poor system.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Historical Definition (Pre-2018)</h3>
            <p>
              Prior to 2018, the Structurally Deficient classification also considered the Structural Evaluation and Deck Geometry ratings. The 2018 change narrowed the definition to focus solely on physical condition ratings, which is why you may see historical reports showing higher numbers of Structurally Deficient bridges than current data.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Our Implementation</h3>
            <p>
              BridgeReport.org uses the current (post-2018) definition consistently across all data, including historical years. This provides apples-to-apples comparisons across years, though it means our historical Structurally Deficient counts may differ from reports that used the pre-2018 definition.
            </p>
          </div>
        </section>

        {/* Data Processing */}
        <section id="data-processing" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">6. Data Processing Pipeline</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              Our data processing pipeline transforms raw NBI data into the structured, accessible information presented on BridgeReport.org. This section describes each step in the process.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Step 1: Data Acquisition</h3>
            <p>
              We download the complete National Bridge Inventory dataset from the FHWA website when new data is released, typically in the spring of each year for the previous calendar year&apos;s inspection data. The raw data is provided in delimited text format with fixed-width fields.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Step 2: Data Parsing</h3>
            <p>
              We parse the raw NBI files according to the FHWA&apos;s Recording and Coding Guide specifications. Each field is extracted, validated against expected formats, and converted to appropriate data types (integers, decimals, strings, dates).
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Step 3: Data Validation</h3>
            <p>
              We perform validation checks on the parsed data:
            </p>
            <ul>
              <li>Geographic coordinates are checked for validity (within expected bounds)</li>
              <li>Condition ratings are verified to be within the 0-9 scale or valid N/A codes</li>
              <li>Year built dates are checked for reasonableness</li>
              <li>Required fields are checked for presence</li>
            </ul>
            <p>
              Records that fail validation are flagged but not removed, as anomalies may reflect genuine data issues that should be visible to users.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Step 4: Code Translation</h3>
            <p>
              Numeric codes are translated to human-readable descriptions using lookup tables based on the Recording and Coding Guide:
            </p>
            <ul>
              <li>Material codes (1, 2, 3...) become &quot;Concrete&quot;, &quot;Concrete Continuous&quot;, &quot;Steel&quot;, etc.</li>
              <li>Design type codes become &quot;Slab&quot;, &quot;Stringer/Multi-beam&quot;, &quot;Girder&quot;, etc.</li>
              <li>Owner codes become &quot;State Highway Agency&quot;, &quot;County Highway Agency&quot;, etc.</li>
              <li>Historical significance codes become meaningful descriptions</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Step 5: Derived Calculations</h3>
            <p>
              We calculate derived fields not present in the raw data:
            </p>
            <ul>
              <li><strong>Lowest Rating:</strong> The minimum of deck, superstructure, and substructure ratings (or culvert rating)</li>
              <li><strong>Condition Category:</strong> Good/Fair/Poor classification based on lowest rating</li>
              <li><strong>Structurally Deficient:</strong> Boolean flag based on condition ratings</li>
              <li><strong>Unit Conversions:</strong> Metric measurements converted to imperial (feet) for U.S. audience</li>
              <li><strong>Age:</strong> Calculated from year built</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Step 6: Aggregation</h3>
            <p>
              We calculate aggregate statistics at multiple geographic levels:
            </p>
            <ul>
              <li>National totals and averages</li>
              <li>State-level summaries</li>
              <li>County-level summaries</li>
              <li>City-level summaries</li>
            </ul>
            <p>
              Aggregations include counts (total, good, fair, poor), percentages, averages (age, length, traffic), and distributions (by material, design, owner, decade built).
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Step 7: Output Generation</h3>
            <p>
              Processed data is output in optimized JSON format for web delivery. We generate separate files for each geographic unit (state, county, city) and for rankings/lists. This preprocessing approach allows fast page loads without database queries for most requests.
            </p>
          </div>
        </section>

        {/* Geographic Data */}
        <section id="geographic-data" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">7. Geographic Data Processing</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Coordinates</h3>
            <p>
              Bridge locations in the NBI are specified as latitude and longitude coordinates. We display these coordinates as provided in the NBI without modification. However, users should be aware that:
            </p>
            <ul>
              <li>Some coordinates are approximate, especially for older bridges</li>
              <li>Some coordinates may place bridges slightly off their actual location</li>
              <li>A small percentage of bridges have coordinates of 0,0 or other obviously incorrect values</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">FIPS Codes</h3>
            <p>
              We use Federal Information Processing Standards (FIPS) codes for geographic identification:
            </p>
            <ul>
              <li><strong>State FIPS (2 digits):</strong> Uniquely identifies each state (e.g., 06 = California)</li>
              <li><strong>County FIPS (5 digits):</strong> State FIPS + 3-digit county code (e.g., 06037 = Los Angeles County, CA)</li>
              <li><strong>Place FIPS (5 digits):</strong> Identifies cities, towns, and Census Designated Places within states</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Place Name Processing</h3>
            <p>
              The NBI uses Census FIPS place codes to identify the cities/places where bridges are located. We translate these codes to place names using Census Bureau data. Some considerations:
            </p>
            <ul>
              <li>Census place names include type suffixes (e.g., &quot;Los Angeles city&quot;, &quot;Lakewood CDP&quot;)</li>
              <li>We clean these names for display while preserving the official Census designation</li>
              <li>Some bridges are in unincorporated areas not associated with any named place</li>
              <li>Census Designated Places (CDPs) are statistical areas, not incorporated municipalities</li>
            </ul>
          </div>
        </section>

        {/* Trend Analysis */}
        <section id="trend-analysis" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">8. Multi-Year Trend Analysis</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org provides trend analysis comparing bridge conditions across multiple years of NBI data (2020-2024). This allows users to see how conditions are changing over time.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Bridge Matching</h3>
            <p>
              We track individual bridges across years using the Structure Number, a unique identifier assigned to each bridge. This identifier remains constant even if other bridge attributes change, allowing us to follow the same bridge over time.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Trend Classification</h3>
            <p>
              Bridge trends are classified as:
            </p>
            <ul>
              <li><strong>Improving:</strong> Condition category improved (e.g., Poor → Fair, or Fair → Good)</li>
              <li><strong>Declining:</strong> Condition category worsened (e.g., Good → Fair, or Fair → Poor)</li>
              <li><strong>Stable:</strong> Condition category remained the same across the analysis period</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Aggregate Trends</h3>
            <p>
              For states and the nation, we calculate aggregate trends showing:
            </p>
            <ul>
              <li>Change in total bridge count</li>
              <li>Change in percentage of bridges in each condition category</li>
              <li>Overall trend direction based on Poor bridge percentage changes</li>
            </ul>
          </div>
        </section>

        {/* Statistics */}
        <section id="statistics" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">9. Statistics and Aggregations</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Counts and Percentages</h3>
            <p>
              We calculate the following counts and percentages at each geographic level:
            </p>
            <ul>
              <li><strong>Total Bridges:</strong> Count of all bridges in the NBI for that area</li>
              <li><strong>Good/Fair/Poor Counts:</strong> Number of bridges in each condition category</li>
              <li><strong>Good/Fair/Poor Percentages:</strong> Each count divided by total, rounded to one decimal place</li>
              <li><strong>Structurally Deficient:</strong> Count and percentage of SD bridges</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Averages</h3>
            <p>
              We calculate arithmetic means for:
            </p>
            <ul>
              <li><strong>Average Year Built:</strong> Mean of year built values (excluding nulls)</li>
              <li><strong>Average Length:</strong> Mean bridge length in feet</li>
              <li><strong>Average Daily Traffic (ADT):</strong> Mean of ADT values (excluding zeros and nulls)</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Distributions</h3>
            <p>
              We calculate distributions (counts by category) for:
            </p>
            <ul>
              <li>Material type (concrete, steel, wood, etc.)</li>
              <li>Design type (slab, beam, truss, arch, etc.)</li>
              <li>Owner (state, county, city, federal, private)</li>
              <li>Decade built (pre-1900, 1900s, 1910s, ... 2020s)</li>
              <li>Condition rating (0-9)</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Rankings</h3>
            <p>
              We generate various rankings including:
            </p>
            <ul>
              <li>States by Poor bridge percentage (best and worst)</li>
              <li>Longest bridges by total length</li>
              <li>Oldest bridges by year built</li>
              <li>Most trafficked bridges by ADT</li>
              <li>Historic bridges on the National Register</li>
            </ul>
          </div>
        </section>

        {/* Limitations */}
        <section id="limitations" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">10. Data Limitations</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              We believe in transparency about data limitations. Users should understand the following constraints when using BridgeReport.org:
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Data Currency</h3>
            <ul>
              <li>NBI data is typically released in spring for the previous calendar year</li>
              <li>Individual bridge inspections may have occurred up to 24 months before the data year</li>
              <li>Conditions may have changed significantly since the last inspection</li>
              <li>Bridges may have been repaired, rehabilitated, replaced, or closed since the data was collected</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Scope Limitations</h3>
            <ul>
              <li>Only bridges with spans ≥20 feet are included</li>
              <li>Only public road bridges are included</li>
              <li>An estimated 300,000+ smaller bridges are not in the NBI</li>
              <li>Some federal lands bridges may not be included</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Data Quality</h3>
            <ul>
              <li>Data quality varies by state and reporting year</li>
              <li>Some fields have significant missing data</li>
              <li>Geographic coordinates may be approximate</li>
              <li>Some coding errors exist in the source data</li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Interpretation Cautions</h3>
            <ul>
              <li>Condition ratings are professional judgments, not absolute measurements</li>
              <li>The same condition may be rated differently by different inspectors</li>
              <li>Poor condition does not indicate imminent danger</li>
              <li>Comparisons between states may reflect different inspection practices</li>
            </ul>
          </div>
        </section>

        {/* Updates */}
        <section id="updates" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">11. Update Schedule</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              We update our data following this schedule:
            </p>
            <ul>
              <li><strong>Annual Full Update:</strong> When new NBI data is released (typically April-May for previous year&apos;s data)</li>
              <li><strong>Processing Time:</strong> Updates typically appear on the site within 2-4 weeks of FHWA release</li>
              <li><strong>Data Year Display:</strong> Each page shows the NBI data year to indicate currency</li>
            </ul>
            <p>
              We do not modify or update individual bridge records between annual releases, as this could create inconsistencies with the official NBI data.
            </p>
          </div>
        </section>

        {/* References */}
        <section id="references" className="mb-16 scroll-mt-24">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">12. References and Resources</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Primary Sources</h3>
            <ul>
              <li>
                <a href="https://www.fhwa.dot.gov/bridge/nbi.cfm" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  FHWA National Bridge Inventory
                </a>
                — Official NBI data downloads
              </li>
              <li>
                <a href="https://www.fhwa.dot.gov/bridge/mtguide.cfm" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  Recording and Coding Guide
                </a>
                — Official field definitions and coding instructions
              </li>
              <li>
                <a href="https://www.fhwa.dot.gov/bridge/nbis.cfm" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  National Bridge Inspection Standards
                </a>
                — Inspection requirements and procedures
              </li>
            </ul>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Additional Resources</h3>
            <ul>
              <li>
                <a href="https://infrastructurereportcard.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  ASCE Infrastructure Report Card
                </a>
                — Overall infrastructure condition assessment
              </li>
              <li>
                <a href="https://artbabridgereport.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  ARTBA Bridge Report
                </a>
                — American Road & Transportation Builders Association analysis
              </li>
              <li>
                <a href="https://www.census.gov/data.html" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  U.S. Census Bureau Data
                </a>
                — Geographic and demographic data
              </li>
            </ul>
          </div>
        </section>

        {/* Questions */}
        <section className="bg-slate-100 rounded-xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions About Our Methodology?</h2>
          <p className="text-slate-700 mb-6">
            If you have questions about our data sources, processing methods, or how we present information, we&apos;d love to hear from you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </Link>
        </section>
      </article>
      </main>
    </>
  );
}
