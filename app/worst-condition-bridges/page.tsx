import Link from 'next/link';
import { getWorstConditionStats, getBridgeRankingPaginated, formatNumber } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import RankingJsonLd from '@/components/RankingJsonLd';
import WorstConditionMapWrapper from '@/components/WorstConditionMapWrapper';
import DataSourceFooter from '@/components/DataSourceFooter';
import PaginatedRankingTable from '@/components/PaginatedRankingTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Worst Condition Bridges in America — Ratings 0-3',
  description:
    'Search bridges rated 0-3 on the federal condition scale. Find failed, critical, and serious condition bridges by state with full inspection data.',
  alternates: {
    canonical: 'https://www.bridgereport.org/worst-condition-bridges',
  },
  openGraph: {
    title: 'Worst Condition Bridges in America',
    description:
      'Highway bridges rated 0-3 — from failed to serious condition.',
    type: 'website',
    url: 'https://www.bridgereport.org/worst-condition-bridges',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Worst Condition Bridges in America - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Worst Condition Bridges in America',
    description: 'Highway bridges rated 0-3 — from failed to serious condition.',
    images: ['/og-image.png'],
  },
};

export default function WorstConditionBridgesPage() {
  // Load pre-computed stats (no need to load all 9,800+ bridges)
  const stats = getWorstConditionStats();

  // Load limited bridges for the map (first 500)
  const { bridges: mapBridges } = getBridgeRankingPaginated('worst_condition', 500);

  // Load first page of bridges for SSR (so Google sees populated table)
  const { bridges: initialBridges, total: initialTotal } = getBridgeRankingPaginated('worst_condition', 50);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Worst Condition Bridges' },
  ];

  // Use pre-computed stats
  const { total, rating0, rating1, rating2, rating3 } = stats;

  return (
    <>
      <RankingJsonLd
        headline="Worst Condition Bridges in America"
        description="All highway bridges rated 0-3 on the federal condition scale. These bridges have the most critical structural needs and are prioritized for repair or closure."
        canonicalUrl="https://www.bridgereport.org/worst-condition-bridges"
        items={mapBridges}
        listName="Worst Condition Bridges in America"
        listDescription={`${total} highway bridges with the lowest condition ratings in the United States`}
        itemListOrder="Ascending"
        breadcrumbItems={breadcrumbItems}
      />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl font-bold mb-4">Worst Condition Bridges in America</h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            All {formatNumber(total)} highway bridges rated 0-3 on the federal condition scale.
            These bridges have the most critical structural needs and are prioritized for repair or closure.
          </p>

          {/* Stats by Rating */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
              <p className="text-3xl font-bold text-red-300">{formatNumber(rating0)}</p>
              <p className="text-red-200 text-sm">Rating 0 — Failed</p>
            </div>
            <div className="bg-red-800/40 border border-red-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-red-300">{formatNumber(rating1)}</p>
              <p className="text-red-200 text-sm">Rating 1 — Imminent Failure</p>
            </div>
            <div className="bg-orange-800/40 border border-orange-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-orange-300">{formatNumber(rating2)}</p>
              <p className="text-orange-200 text-sm">Rating 2 — Critical</p>
            </div>
            <div className="bg-yellow-800/40 border border-yellow-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-yellow-300">{formatNumber(rating3)}</p>
              <p className="text-yellow-200 text-sm">Rating 3 — Serious</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Worst Condition Bridges */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Understanding Low-Rated Bridge Conditions
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-4">
              Bridges with condition ratings of 0-3 represent the most deteriorated structures in America&apos;s highway
              inventory. These ratings indicate that significant structural deterioration has occurred, requiring
              either immediate attention, load restrictions, or closure to traffic. While alarming to see, it is
              important to understand that federal safety requirements mandate that any bridge remaining open to
              traffic must be safe for its posted limits, even when rated in critical or serious condition.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              The National Bridge Inspection Standards require that bridges with critical structural needs be
              inspected more frequently than the standard 24-month cycle. Many bridges rated 2-3 receive quarterly
              inspections to monitor deterioration and ensure that conditions have not worsened beyond posted
              restrictions. This enhanced oversight allows transportation agencies to keep bridges in service
              while planning and funding rehabilitation or replacement projects, which often require years of
              engineering design and environmental review.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Bridges rated 0 (failed) or 1 (imminent failure) are either closed to traffic or restricted to
              extremely limited use. In most cases, these structures have been replaced by modern bridges nearby,
              with the old bridge remaining in the inventory during demolition planning or preserved for historical
              significance. Rating 2 (critical) indicates severe deterioration that may require closure unless
              repairs are completed, while rating 3 (serious) shows major structural problems that affect
              load-carrying capacity but remain manageable with weight restrictions.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Many low-rated bridges serve rural communities where replacement funding competes with urban
              infrastructure priorities. Local and county bridges often lack the federal funding available for
              Interstate highways, resulting in slower rehabilitation timelines. Understanding where these
              bridges are located helps communities advocate for infrastructure investment and plan alternative
              routes when load restrictions affect commercial truck traffic or emergency vehicle access.
            </p>
          </div>
        </section>

        {/* Interactive Map */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Bridge Locations</h2>
            <p className="text-sm text-slate-500">
              Click markers for bridge details. Showing worst 2,000 bridges.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <WorstConditionMapWrapper bridges={mapBridges} height={500} />
          </div>
        </section>

        {/* Rating Scale Explanation */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Understanding These Ratings</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex gap-3">
                <span className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center font-bold shrink-0">0</span>
                <div>
                  <p className="font-semibold text-slate-900">Failed Condition</p>
                  <p className="text-slate-600">Bridge is out of service and closed to traffic.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-8 h-8 bg-orange-600 text-white rounded flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <p className="font-semibold text-slate-900">Imminent Failure</p>
                  <p className="text-slate-600">Major deterioration. May be closed until repaired.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-8 h-8 bg-orange-500 text-white rounded flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <p className="font-semibold text-slate-900">Critical Condition</p>
                  <p className="text-slate-600">May need to close unless closely monitored.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <p className="font-semibold text-slate-900">Serious Condition</p>
                  <p className="text-slate-600">Structural elements show serious deterioration.</p>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-4 pt-4 border-t border-slate-100">
              Bridges rated 4 (&ldquo;Poor&rdquo;) are not included here but can be found on state and county pages.
              All open bridges must meet federal safety standards regardless of condition rating.
            </p>
          </div>
        </section>

        {/* Full Ranking Table */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              All {formatNumber(total)} Bridges Rated 0-3
            </h2>
            <p className="text-slate-600">
              Search by road name, crossing, location, or state. Sorted by lowest rating first.
            </p>
          </div>
          <PaginatedRankingTable
            rankingType="worst_condition"
            valueColumn="lowestRating"
            valueLabel="Rating"
            formatType="rating"
            showDescription={true}
            descriptionType="condition"
            initialBridges={initialBridges}
            initialTotal={initialTotal}
          />
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">More Bridge Rankings</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/rankings"
              className="group bg-slate-50 hover:bg-slate-100 rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all"
            >
              <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-300 transition-colors">
                <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
                State Rankings
              </h3>
              <p className="text-sm text-slate-500">
                Compare all 50 states
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

        <DataSourceFooter />
      </div>
    </>
  );
}
