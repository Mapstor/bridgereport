import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About BridgeReport.org - Our Mission, Methodology & Team',
  description: 'Learn about BridgeReport.org, our mission to make bridge infrastructure data accessible, our data methodology, and the team of infrastructure enthusiasts behind the project.',
  alternates: {
    canonical: 'https://bridgereport.org/about',
  },
  openGraph: {
    title: 'About BridgeReport.org - Our Mission, Methodology & Team',
    description: 'Learn about BridgeReport.org, our mission to make bridge infrastructure data accessible, our data methodology, and the team of infrastructure enthusiasts behind the project.',
    url: 'https://bridgereport.org/about',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'About BridgeReport.org - Our Mission, Methodology & Team',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About BridgeReport.org - Our Mission, Methodology & Team',
    description: 'Learn about BridgeReport.org, our mission to make bridge infrastructure data accessible, our data methodology, and the team of infrastructure enthusiasts behind the project.',
    images: ['/og-image.png'],
  },
};

function AboutJsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://bridgereport.org/#organization',
    name: 'BridgeReport.org',
    url: 'https://bridgereport.org',
    logo: 'https://bridgereport.org/icon.png',
    description: 'BridgeReport.org makes America\'s bridge infrastructure data accessible, understandable, and actionable for everyone. We provide comprehensive bridge condition data for over 623,000 highway bridges.',
    foundingDate: '2024',
    email: 'info@bridgereport.org',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@bridgereport.org',
      contactType: 'customer service',
    },
    sameAs: [],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://bridgereport.org',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: 'https://bridgereport.org/about',
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://bridgereport.org/about',
    name: 'About BridgeReport.org',
    description: 'Learn about BridgeReport.org, our mission to make bridge infrastructure data accessible, our data methodology, and the team of infrastructure enthusiasts behind the project.',
    url: 'https://bridgereport.org/about',
    mainEntity: {
      '@id': 'https://bridgereport.org/#organization',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'BridgeReport.org',
      url: 'https://bridgereport.org',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}

export default function AboutPage() {
  return (
    <>
      <AboutJsonLd />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About BridgeReport.org</h1>
          <p className="text-xl text-slate-300">
            Making America&apos;s bridge infrastructure data accessible, understandable, and actionable for everyone.
          </p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org was founded with a singular mission: to democratize access to America&apos;s bridge infrastructure data. Every day, over 178 million trips are taken across the nation&apos;s 623,000+ highway bridges. Yet despite the critical role these structures play in our daily lives, detailed information about their condition, age, and structural integrity has historically been locked away in technical databases accessible only to engineers and government officials.
            </p>
            <p>
              We believe that every American has the right to know the condition of the bridges they cross. Parents driving their children to school, commuters heading to work, and truckers transporting goods across the country all deserve easy access to factual, comprehensive bridge safety data. BridgeReport.org transforms complex federal inspection data into clear, actionable information that empowers citizens to make informed decisions and engage meaningfully with their local infrastructure priorities.
            </p>
            <p>
              Our platform serves multiple audiences: concerned citizens seeking to understand their local bridge conditions, journalists investigating infrastructure stories, researchers studying transportation networks, local government officials benchmarking their bridge inventories, educators teaching about civil engineering, and infrastructure enthusiasts who share our passion for the built environment.
            </p>
          </div>
        </section>

        {/* Who We Are Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Who We Are</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org is created and maintained by a dedicated team of infrastructure enthusiasts, data scientists, software engineers, and geography experts who share a common passion: understanding and communicating the state of America&apos;s built environment. Our diverse backgrounds span civil engineering, urban planning, cartography, data visualization, and public policy.
            </p>
            <p>
              What unites us is a deep appreciation for the engineering marvels that connect our communities. From the iconic Golden Gate Bridge to the humble county road crossings that serve rural America, every bridge tells a story of human ingenuity, community need, and ongoing stewardship. We are driven by a belief that infrastructure literacy is essential for civic engagement in the 21st century.
            </p>
            <p>
              Our team members have collectively spent decades studying transportation infrastructure, analyzing government datasets, and building tools that make complex information accessible to general audiences. Several of us have backgrounds in geographic information systems (GIS) and have contributed to open-source mapping projects. Others bring experience from journalism, having covered infrastructure policy and transportation safety for major publications.
            </p>
            <p>
              We operate as an independent, non-partisan project. BridgeReport.org is not affiliated with any government agency, political organization, construction company, or engineering firm. Our sole agenda is providing accurate, comprehensive, and useful bridge data to the public. We do not advocate for specific policy positions, though we do believe that informed citizens make better decisions about infrastructure investment.
            </p>
          </div>
        </section>

        {/* Data Sources Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Data Sources</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              The foundation of BridgeReport.org is the National Bridge Inventory (NBI), a comprehensive database maintained by the Federal Highway Administration (FHWA) within the U.S. Department of Transportation. The NBI contains detailed information on every highway bridge in the United States that spans more than 20 feet, representing over 623,000 structures nationwide.
            </p>
            <p>
              The National Bridge Inventory has been collected since 1971 following the tragic collapse of the Silver Bridge between West Virginia and Ohio in 1967, which claimed 46 lives. In response, Congress mandated the creation of the National Bridge Inspection Standards (NBIS), requiring regular inspection of all public highway bridges. Today, each bridge must be inspected at least once every 24 months by qualified inspectors, with more frequent inspections required for bridges in poor condition or with special structural concerns.
            </p>
            <p>
              The NBI data we present includes information on bridge location (latitude, longitude, state, county, and city), physical characteristics (length, width, number of lanes, material type, and design), age and construction history (year built and year of major reconstruction), ownership (state, county, city, federal, or private), traffic data (average daily traffic counts), and most importantly, condition ratings for the deck, superstructure, substructure, and culvert components.
            </p>
            <p>
              We supplement NBI data with geographic information from the U.S. Census Bureau, including official place names, FIPS codes, and population data. This allows us to provide context about the communities each bridge serves and to organize our data in ways that align with how people think about places.
            </p>
            <p>
              Additionally, we incorporate historical bridge data spanning multiple years (2020-2024) to track condition trends over time. This multi-year analysis allows users to see whether bridges are improving, stable, or declining in condition—information that single-year snapshots cannot provide.
            </p>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Methodology</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Data Processing Pipeline</h3>
            <p>
              Our data processing pipeline begins with the annual NBI data release from the FHWA, typically published each spring for the previous calendar year. We download the complete dataset, which contains over 120 data fields for each bridge, and process it through a series of validation, cleaning, and transformation steps.
            </p>
            <p>
              During validation, we check for data anomalies such as impossible geographic coordinates, future construction dates, or condition ratings outside the valid 0-9 scale. We flag but do not alter these records, as anomalies in the source data may reflect genuine reporting issues that users should be aware of. Our processing logs track all flagged records for transparency.
            </p>
            <p>
              Data transformation involves converting raw NBI codes into human-readable descriptions. For example, material code &quot;1&quot; becomes &quot;Concrete,&quot; owner code &quot;01&quot; becomes &quot;State Highway Agency,&quot; and historical significance code &quot;1&quot; becomes &quot;Bridge is on the National Register of Historic Places.&quot; We maintain comprehensive lookup tables based on the official FHWA Recording and Coding Guide.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Condition Classification</h3>
            <p>
              Bridge conditions on BridgeReport.org are classified as Good, Fair, or Poor based on the FHWA&apos;s official methodology. This classification uses the lowest rating among the deck, superstructure, and substructure components (or the culvert rating for culvert-type structures).
            </p>
            <p>
              The condition scale works as follows: Ratings of 7, 8, or 9 indicate Good condition, meaning the component is functioning as designed with minimal deterioration. Ratings of 5 or 6 indicate Fair condition, showing some deterioration but remaining fully functional. Ratings of 4 or below indicate Poor condition, with significant deterioration requiring maintenance attention or potential load restrictions.
            </p>
            <p>
              It is critically important to understand that &quot;Poor&quot; condition does not mean &quot;unsafe.&quot; Bridges in poor condition are still safe for public use—they are inspected more frequently and may have load restrictions or other operational limitations in place. State and local transportation agencies actively monitor all poor-condition bridges and take appropriate action when safety concerns arise. A bridge is closed or restricted long before it becomes dangerous.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Structurally Deficient Classification</h3>
            <p>
              We also track the &quot;structurally deficient&quot; classification, which the FHWA defines as any bridge with a condition rating of 4 or below for deck, superstructure, substructure, or culvert. This classification was historically used as a primary measure of bridge condition but has been supplemented by the Good/Fair/Poor system since 2016. We include both metrics to provide historical continuity and to align with how some government reports still categorize bridges.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Geographic Processing</h3>
            <p>
              Each bridge in the NBI includes latitude and longitude coordinates, which we use to place bridges on interactive maps and to associate them with cities, counties, and states. However, the NBI&apos;s place codes (FIPS place codes) sometimes refer to Census-Designated Places (CDPs) or unincorporated areas that may not be familiar to users. We process these codes using Census Bureau data to provide the most accurate and recognizable place names possible.
            </p>
            <p>
              For county-level aggregations, we use the 5-digit FIPS county codes present in the NBI data. For state-level aggregations, we use the 2-digit FIPS state codes. All percentages and statistics are calculated from the underlying bridge records, not from secondary sources, ensuring consistency across our platform.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Trend Analysis</h3>
            <p>
              Our trend analysis compares bridge conditions across multiple years of NBI data. We track the same bridge over time using its unique Structure Number, which remains constant even if other bridge attributes change. Trends are classified as Improving (condition rating increased), Declining (condition rating decreased), or Stable (no change in condition category).
            </p>
            <p>
              Aggregate trends for states and the nation are calculated by comparing the percentage of bridges in each condition category year over year. A state with a decreasing percentage of poor-condition bridges is showing improvement, while one with an increasing percentage is experiencing decline.
            </p>
          </div>
        </section>

        {/* Data Limitations Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Data Limitations and Transparency</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              We believe in complete transparency about what our data can and cannot tell you. Understanding these limitations is essential for using BridgeReport.org effectively.
            </p>
            <p>
              <strong>Inspection Timing:</strong> NBI data reflects the condition of each bridge at its most recent inspection, which may have occurred up to 24 months ago (or longer for bridges that qualify for extended inspection intervals). Conditions may have changed since the last inspection due to deterioration, maintenance work, or reconstruction projects.
            </p>
            <p>
              <strong>Data Currency:</strong> We process and publish new NBI data as soon as it becomes available, typically in spring each year for the previous calendar year&apos;s inspections. The &quot;data year&quot; displayed on each page indicates when the underlying inspection data was collected.
            </p>
            <p>
              <strong>Scope Limitations:</strong> The NBI covers highway bridges with spans greater than 20 feet. Smaller bridges, pedestrian bridges (unless they also carry highway traffic), railroad bridges (unless they also carry highway traffic), and private bridges not on public roads are generally not included. Approximately 300,000 additional bridges fall outside the NBI&apos;s scope.
            </p>
            <p>
              <strong>Condition vs. Safety:</strong> Condition ratings measure the state of deterioration, not the immediate safety risk. A bridge with a poor condition rating may be perfectly safe for normal traffic while awaiting scheduled rehabilitation. Conversely, a bridge could have a sudden safety issue between inspections that wouldn&apos;t appear in the data. Always follow posted signs and restrictions.
            </p>
            <p>
              <strong>Geographic Precision:</strong> While most NBI coordinates are accurate, some bridges have approximate coordinates or coordinates that place them slightly away from their actual location. We display coordinates as provided in the NBI without modification.
            </p>
          </div>
        </section>

        {/* How We Use Data Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">How to Use Our Data</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org is designed to serve multiple use cases, and we encourage users to explore the data in ways that serve their specific needs.
            </p>
            <p>
              <strong>For Concerned Citizens:</strong> Use our state and county pages to understand the overall bridge conditions in your area. The &quot;Bridges Near Me&quot; feature lets you find and learn about specific bridges you cross regularly. Remember that poor condition doesn&apos;t mean unsafe—but if you have concerns about a specific bridge, contact your state or county department of transportation.
            </p>
            <p>
              <strong>For Journalists and Researchers:</strong> Our data can support infrastructure reporting and academic research. We recommend downloading the original NBI data from FHWA for detailed analysis, using our site as a starting point and for geographic context. Please cite both BridgeReport.org and the FHWA National Bridge Inventory when publishing.
            </p>
            <p>
              <strong>For Local Officials:</strong> Compare your jurisdiction&apos;s bridge conditions to state and national averages. Identify bridges that may need prioritization for inspection, maintenance, or capital improvement programming. Our trend data can help demonstrate progress or identify emerging concerns.
            </p>
            <p>
              <strong>For Educators:</strong> BridgeReport.org provides real-world data for teaching about civil engineering, transportation systems, data analysis, and civic infrastructure. Students can explore bridges in their own communities and compare them to bridges elsewhere.
            </p>
          </div>
        </section>

        {/* Technical Implementation Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Technical Implementation</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org is built using modern web technologies chosen for performance, accessibility, and maintainability. Our frontend is built with Next.js, a React framework that enables fast page loads through static generation and server-side rendering. We use TypeScript throughout our codebase to ensure type safety and code quality.
            </p>
            <p>
              Interactive maps are powered by Leaflet, an open-source JavaScript library, with map tiles from OpenStreetMap contributors. Our data visualizations use D3.js and Recharts for rendering charts and graphs that work across devices and screen sizes.
            </p>
            <p>
              We process NBI data using Python scripts that validate, transform, and aggregate the raw data into optimized JSON files for web delivery. This preprocessing approach allows us to serve pages quickly without database queries for most page loads.
            </p>
            <p>
              The site is designed to be accessible and performs well on mobile devices, recognizing that many users will access bridge information while traveling. We follow web accessibility guidelines and test across multiple browsers and devices.
            </p>
          </div>
        </section>

        {/* Community and Feedback Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Community and Feedback</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org is built for the public, and we welcome feedback from our community. If you notice data errors, have suggestions for new features, or want to share how you&apos;ve used our data, please reach out through our <Link href="/contact" className="text-blue-600 hover:text-blue-800">Contact page</Link>.
            </p>
            <p>
              We are particularly interested in hearing from:
            </p>
            <ul>
              <li>Transportation professionals who can help us improve our data presentation</li>
              <li>Journalists who have used our data in their reporting</li>
              <li>Educators who have incorporated BridgeReport.org into their curriculum</li>
              <li>Local officials who have feedback on how our data compares to their internal records</li>
              <li>Bridge enthusiasts who share our passion for infrastructure</li>
            </ul>
            <p>
              While we cannot respond to every message individually, we read all feedback and use it to guide our ongoing development priorities.
            </p>
          </div>
        </section>

        {/* Acknowledgments Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Acknowledgments</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org would not be possible without the work of countless individuals and organizations dedicated to bridge safety and infrastructure transparency.
            </p>
            <p>
              We gratefully acknowledge the Federal Highway Administration for maintaining and publicly releasing the National Bridge Inventory data. The bridge inspectors across all 50 states who assess these structures every inspection cycle perform essential work that keeps our transportation network safe.
            </p>
            <p>
              We also acknowledge the American Society of Civil Engineers (ASCE), whose Infrastructure Report Card has raised public awareness of infrastructure conditions for decades, and the American Road & Transportation Builders Association (ARTBA), whose annual bridge reports provide valuable context for understanding bridge conditions nationally.
            </p>
            <p>
              The open-source community has provided many of the tools that power BridgeReport.org, including Next.js, React, Leaflet, and countless other libraries. We are grateful for their contributions to the commons.
            </p>
            <p>
              Finally, we acknowledge the legacy of the Silver Bridge collapse victims, whose tragedy led to the bridge inspection programs that generate the data we present today. Their memory reminds us why infrastructure transparency matters.
            </p>
          </div>
        </section>

        {/* Future Plans Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Roadmap</h2>
          <div className="prose prose-lg max-w-none text-slate-700">
            <p>
              BridgeReport.org is an ongoing project, and we have ambitious plans for future development:
            </p>
            <ul>
              <li><strong>Enhanced Historical Analysis:</strong> Deeper trend analysis spanning more years of data, allowing users to see long-term patterns in bridge conditions.</li>
              <li><strong>Improved Search:</strong> More powerful search capabilities to find bridges by name, route number, or features crossed.</li>
              <li><strong>API Access:</strong> A public API allowing developers and researchers to access our processed data programmatically.</li>
              <li><strong>Additional Data Integration:</strong> Incorporation of related datasets such as bridge construction costs, maintenance records where available, and correlation with traffic and safety data.</li>
              <li><strong>Community Features:</strong> Ways for users to contribute local knowledge, photos, and historical information about bridges in their communities.</li>
            </ul>
            <p>
              We develop new features based on user feedback and available resources. If you have suggestions for capabilities you&apos;d find valuable, please let us know.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-slate-100 rounded-xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Start Exploring</h2>
          <p className="text-slate-700 mb-6">
            Ready to discover the bridges in your area? Use our interactive tools to explore America&apos;s bridge infrastructure.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/bridges-near-me"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Find Bridges Near Me
            </Link>
            <Link
              href="/rankings"
              className="inline-flex items-center px-6 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              View Bridge Rankings
            </Link>
          </div>
        </section>
      </article>
      </main>
    </>
  );
}
