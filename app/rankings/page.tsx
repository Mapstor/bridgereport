import Link from 'next/link';
import { getStateRanking, getNational, formatNumber, formatPct } from '@/lib/data';
import StateRankingTable from '@/components/StateRankingTable';
import NationalBridgeMapWrapper from '@/components/NationalBridgeMapWrapper';
import DataSourceFooter from '@/components/DataSourceFooter';
import { BreadcrumbJsonLd } from '@/components/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'State Bridge Rankings — Worst to Best by Condition | BridgeReport.org',
  description:
    'Compare bridge conditions across all 50 states, DC, and US territories. See which states have the most structurally deficient bridges ranked by percentage in poor condition.',
  alternates: {
    canonical: 'https://bridgereport.org/rankings',
  },
  openGraph: {
    title: 'State Bridge Rankings — Worst to Best by Condition',
    description:
      'Compare bridge conditions across all US states. See rankings by percentage in poor condition.',
    type: 'website',
    url: 'https://bridgereport.org/rankings',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'US State Bridge Rankings - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'State Bridge Rankings — Worst to Best by Condition',
    description: 'Compare bridge conditions across all US states.',
    images: ['/og-image.png'],
  },
};

// JSON-LD structured data
function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'US State Bridge Condition Rankings',
    description: 'All US states and territories ranked by percentage of bridges in poor condition',
    url: 'https://bridgereport.org/rankings',
    numberOfItems: 54,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'U.S. Virgin Islands',
        url: 'https://bridgereport.org/state/vi',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Iowa',
        url: 'https://bridgereport.org/state/ia',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'West Virginia',
        url: 'https://bridgereport.org/state/wv',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function RankingsPage() {
  const national = getNational();
  const worstStates = getStateRanking('worst_states');

  if (!national || worstStates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Error loading rankings data</p>
      </div>
    );
  }

  // Get top 3 worst and best states for summary
  const top3Worst = worstStates.slice(0, 3);
  const top3Best = worstStates.slice(-3).reverse();

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'State Rankings' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <JsonLd />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">State Rankings</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">US Bridge Condition Rankings</h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            Compare bridge conditions across all 50 states, DC, and US territories.
            Rankings based on the percentage of bridges rated in poor condition.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="text-3xl font-bold text-white">{formatNumber(national.total)}</p>
              <p className="text-slate-400 text-sm">Total Bridges</p>
            </div>
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-400">{formatPct(national.goodPct)}</p>
              <p className="text-green-300 text-sm">Good Condition</p>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
              <p className="text-3xl font-bold text-yellow-400">{formatPct(national.fairPct)}</p>
              <p className="text-yellow-300 text-sm">Fair Condition</p>
            </div>
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <p className="text-3xl font-bold text-red-400">{formatPct(national.poorPct)}</p>
              <p className="text-red-300 text-sm">Poor Condition</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Bridge Rankings */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Understanding America&apos;s Bridge Infrastructure
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-4">
              The United States maintains over {formatNumber(national.total)} highway bridges, representing one of the largest
              bridge inventories in the world. These structures range from small rural creek crossings to massive multi-mile
              causeways spanning major bodies of water. Every bridge longer than 20 feet is inspected at least every 24 months
              and rated using the National Bridge Inventory (NBI) system, providing a comprehensive snapshot of infrastructure health.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Bridge condition varies significantly by state due to factors including climate, traffic volumes, construction era,
              and maintenance funding levels. States in the Northeast and Midwest tend to have older bridge stocks and more severe
              freeze-thaw cycles, which accelerate deterioration. Southern and Western states often have newer infrastructure but
              face challenges from extreme heat, hurricanes, or seismic activity. The national average shows {formatPct(national.poorPct)} of
              bridges in poor condition, {formatPct(national.fairPct)} in fair condition, and {formatPct(national.goodPct)} in good condition.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              A &quot;poor&quot; condition rating does not mean a bridge is unsafe. Federal regulations require that any bridge with load-carrying
              deficiencies be either repaired, posted with weight restrictions, or closed. Poor-rated bridges simply indicate that
              significant deterioration exists and rehabilitation or replacement should be prioritized. States with higher percentages
              of poor bridges often face difficult choices about allocating limited transportation funding across competing priorities.
            </p>
            <p className="text-slate-600 leading-relaxed">
              The rankings below help identify which states face the greatest infrastructure challenges. By comparing your state
              to national averages, you can better understand local bridge conditions and advocate for appropriate maintenance
              and replacement investments. The Federal Highway Administration requires states to maintain bridges in safe
              condition, with regular inspections ensuring that deterioration is identified before it affects public safety.
            </p>
          </div>
        </section>

        {/* Interactive Map */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Bridge Conditions by State</h2>
            <p className="text-sm text-slate-500">
              Hover over states to see details. Click to view state page.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <NationalBridgeMapWrapper height={500} />
          </div>
        </section>

        {/* Worst & Best States Cards */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Worst States */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-4">
                Highest % Poor Condition
              </h3>
              <ol className="space-y-3">
                {top3Worst.map((state, i) => (
                  <li key={state.state} className="flex items-center justify-between">
                    <Link
                      href={`/state/${state.state.toLowerCase()}`}
                      className="text-slate-900 hover:text-red-600 transition-colors font-medium"
                    >
                      <span className="text-slate-400 mr-2">{i + 1}.</span>
                      {state.stateName}
                    </Link>
                    <div className="text-right">
                      <span className="font-mono font-bold text-red-600">
                        {formatPct(state.poorPct)}
                      </span>
                      <span className="text-slate-500 text-sm ml-2">
                        ({formatNumber(state.poor)} bridges)
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Best States */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-4">
                Lowest % Poor Condition
              </h3>
              <ol className="space-y-3">
                {top3Best.map((state, i) => (
                  <li key={state.state} className="flex items-center justify-between">
                    <Link
                      href={`/state/${state.state.toLowerCase()}`}
                      className="text-slate-900 hover:text-green-600 transition-colors font-medium"
                    >
                      <span className="text-slate-400 mr-2">{worstStates.length - 2 + i}.</span>
                      {state.stateName}
                    </Link>
                    <div className="text-right">
                      <span className="font-mono font-bold text-green-600">
                        {formatPct(state.poorPct)}
                      </span>
                      <span className="text-slate-500 text-sm ml-2">
                        ({formatNumber(state.poor)} bridges)
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Full Rankings Table */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              All States Ranked by Condition
            </h2>
            <p className="text-slate-600">
              Click column headers to sort. Ranked by percentage of bridges in poor condition.
            </p>
          </div>

          <StateRankingTable states={worstStates} />

          <div className="mt-6 text-sm text-slate-500 space-y-2 pt-6 border-t border-slate-100">
            <p>
              <strong>Poor:</strong> Rating 0-4 on key structural components (deck, superstructure, substructure, or culvert)
            </p>
            <p>
              <strong>Fair:</strong> Rating 5-6 on key structural components
            </p>
            <p>
              <strong>Good:</strong> Rating 7-9 on key structural components
            </p>
            <p>
              <strong>ADT:</strong> Average Daily Traffic — estimated vehicles crossing per day
            </p>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">More Bridge Rankings</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/worst-condition-bridges"
              className="group bg-red-50 hover:bg-red-100 rounded-xl p-5 border border-red-200 hover:border-red-300 transition-all"
            >
              <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-300 transition-colors">
                <svg className="w-5 h-5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-red-700 transition-colors">
                Worst Condition
              </h3>
              <p className="text-sm text-slate-500">
                9,800+ bridges rated 0-3
              </p>
            </Link>

            <Link
              href="/longest-bridges"
              className="group bg-blue-50 hover:bg-blue-100 rounded-xl p-5 border border-blue-200 hover:border-blue-300 transition-all"
            >
              <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-300 transition-colors">
                <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                Longest Bridges
              </h3>
              <p className="text-sm text-slate-500">
                By total length in feet
              </p>
            </Link>

            <Link
              href="/oldest-bridges"
              className="group bg-amber-50 hover:bg-amber-100 rounded-xl p-5 border border-amber-200 hover:border-amber-300 transition-all"
            >
              <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-300 transition-colors">
                <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-amber-700 transition-colors">
                Oldest Bridges
              </h3>
              <p className="text-sm text-slate-500">
                Historic bridges still in service
              </p>
            </Link>

            <Link
              href="/most-trafficked-bridges"
              className="group bg-green-50 hover:bg-green-100 rounded-xl p-5 border border-green-200 hover:border-green-300 transition-all"
            >
              <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-300 transition-colors">
                <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-green-700 transition-colors">
                Most Trafficked
              </h3>
              <p className="text-sm text-slate-500">
                Highest daily traffic counts
              </p>
            </Link>
          </div>
        </section>

        <DataSourceFooter generatedAt={national.generatedAt} />
      </div>
    </>
  );
}
