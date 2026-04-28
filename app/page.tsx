import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getNational, getAllStates, getBridgeRanking, formatNumber } from '@/lib/data';
import { StateGrid } from '@/components/StateCard';
import BridgeTable from '@/components/BridgeTable';
import DataSourceFooter from '@/components/DataSourceFooter';
import NationalBridgeMapWrapper from '@/components/NationalBridgeMapWrapper';
import type { Metadata } from 'next';

// Lazy load the pie chart (client component with Recharts)
const ConditionPieChart = dynamic(() => import('@/components/ConditionPieChart'), {
  loading: () => (
    <div className="h-[250px] flex items-center justify-center bg-slate-50 rounded-lg">
      <p className="text-slate-400">Loading chart...</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'US Bridge Conditions — 623,218 Bridges Rated',
  description:
    'Explore condition data for all 623,218 US highway bridges. Find bridge ratings, deficiency status, and infrastructure reports by state, county, or location.',
  alternates: {
    canonical: 'https://www.bridgereport.org',
  },
  openGraph: {
    title: 'US Bridge Conditions — 623,218 Bridges Rated',
    description:
      'Explore condition data for all 623,218 US highway bridges. Find bridge ratings and infrastructure reports.',
    type: 'website',
    url: 'https://www.bridgereport.org',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BridgeReport.org - America\'s Bridge Infrastructure Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Bridge Conditions — 623,218 Bridges Rated',
    description: 'Explore condition data for all 623,218 US highway bridges.',
    images: ['/og-image.png'],
  },
};

// JSON-LD structured data — Organization + WebSite (with SearchAction) are emitted
// by the root layout via SiteWideJsonLd. The homepage only adds the Dataset entity.
function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': 'https://www.bridgereport.org/#dataset',
    name: 'US National Bridge Inventory Data',
    description: 'Complete inventory of 623,218 highway bridges in the United States with condition ratings, inspection data, and infrastructure metrics.',
    url: 'https://www.bridgereport.org',
    license: 'https://www.usa.gov/government-works',
    creator: {
      '@type': 'GovernmentOrganization',
      name: 'Federal Highway Administration',
      url: 'https://www.fhwa.dot.gov/',
    },
    temporalCoverage: '2024',
    spatialCoverage: {
      '@type': 'Place',
      name: 'United States of America',
    },
    variableMeasured: [
      'Bridge condition ratings',
      'Structural deficiency status',
      'Average daily traffic',
      'Year built',
      'Construction materials',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function Home() {
  const national = getNational();
  const allStates = getAllStates();
  const worstBridges = getBridgeRanking('worst_condition').slice(0, 10);

  if (!national) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Error loading national data</p>
      </div>
    );
  }

  return (
    <>
      <JsonLd />

      {/* Compact Hero Section */}
      <section className="bg-slate-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                America&apos;s {formatNumber(national.total)} Highway Bridges
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Federal Highway Administration inspection data · Updated 2024
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/bridges-near-me"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Bridges Near Me
              </Link>
              <Link
                href="/rankings"
                className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
              >
                State Rankings
              </Link>
            </div>
          </div>

          {/* Hook Text */}
          <p className="mt-5 text-slate-300 text-base max-w-3xl leading-relaxed">
            Every highway bridge in America is inspected and rated by federal mandate.
            We make that data accessible — search bridges near you, compare states,
            explore historic landmarks, or find the longest, oldest, and most critical structures.
            All sourced directly from the National Bridge Inventory.
          </p>
        </div>
      </section>

      {/* Interactive Bridge Map - NOW AT TOP */}
      <section className="bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-lg font-bold text-slate-900">Interactive Bridge Map</h2>
            <p className="text-slate-500 text-sm">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Good</span>
              <span className="inline-flex items-center gap-1 ml-3"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Fair</span>
              <span className="inline-flex items-center gap-1 ml-3"><span className="w-2 h-2 rounded-full bg-red-500"></span> Poor</span>
            </p>
          </div>
          <div className="rounded-xl border border-slate-300 overflow-hidden shadow-sm">
            <NationalBridgeMapWrapper height={420} />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Zoom in to explore individual bridges. Click markers for details.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-lg font-bold text-slate-900 mb-3">What is BridgeReport.org?</h2>
            <div className="text-slate-600 text-sm space-y-3">
              <p>
                <strong className="text-slate-900">Free access to federal bridge inspection data.</strong> We transform the National Bridge Inventory (NBI) —
                containing inspection records for every US highway bridge — into searchable, easy-to-understand reports for citizens, journalists, researchers, and officials.
              </p>
              <p>
                <strong className="text-slate-900">How bridges are rated:</strong> Federal law requires inspection of every highway bridge at least every 24 months.
                Inspectors rate deck, superstructure, and substructure on a 0-9 scale. A rating of 4 or below classifies a bridge as &quot;poor condition&quot; —
                not unsafe, but prioritized for repair.
              </p>
              <p>
                <strong className="text-slate-900">What you can do here:</strong> Check bridges in your area, compare states and counties, explore historic landmarks,
                find record-breaking structures, or embed data on your website. All data comes directly from FHWA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Bridge Data - Redesigned Cards */}
      <section className="py-12 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Explore Bridge Data</h2>

          {/* Primary Actions - Large Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <Link href="/bridges-near-me" className="group block relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white overflow-hidden hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-2">Bridges Near Me</h3>
                <p className="text-blue-100 text-sm leading-relaxed">Find bridges within any radius using your location. See ratings, age, and traffic data.</p>
              </div>
            </Link>

            <Link href="/rankings" className="group block relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 text-white overflow-hidden hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-2">State Rankings</h3>
                <p className="text-slate-300 text-sm leading-relaxed">Compare all 50 states by condition. Track infrastructure quality nationwide.</p>
              </div>
            </Link>

            <Link href="/worst-condition-bridges" className="group block relative bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white overflow-hidden hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-2">Worst Condition</h3>
                <p className="text-red-100 text-sm leading-relaxed">9,800+ bridges rated 0-3. Failed, critical, and serious conditions.</p>
              </div>
            </Link>
          </div>

          {/* Secondary Links - Compact Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/longest-bridges" className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Longest Bridges</h3>
              <p className="text-sm text-slate-500 mt-1">Ranked by total length</p>
            </Link>

            <Link href="/oldest-bridges" className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">Oldest Bridges</h3>
              <p className="text-sm text-slate-500 mt-1">Dating back to 1800s</p>
            </Link>

            <Link href="/most-trafficked-bridges" className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-green-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-green-600 transition-colors">Most Trafficked</h3>
              <p className="text-sm text-slate-500 mt-1">Highest daily traffic</p>
            </Link>

            <Link href="/longest-span-bridges" className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Longest Spans</h3>
              <p className="text-sm text-slate-500 mt-1">Single span length</p>
            </Link>

            <Link href="/historic-bridges" className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-purple-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">Historic Bridges</h3>
              <p className="text-sm text-slate-500 mt-1">National Register listed</p>
            </Link>

            <Link href="/covered-bridges" className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-orange-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">Covered Bridges</h3>
              <p className="text-sm text-slate-500 mt-1">Wooden heritage</p>
            </Link>

          </div>
        </div>
      </section>

      {/* National Condition Overview */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">National Condition Overview</h2>
              <div className="text-slate-600 text-sm space-y-3">
                <p>
                  Currently, <strong className="text-red-600">{formatNumber(national.poor)} bridges ({national.poorPct}%)</strong> are
                  rated poor condition, meaning at least one component scored 4 or below. These bridges
                  remain safe but are prioritized for repair or replacement.
                </p>
                <p>
                  The average US bridge was built in <strong>{national.avgYearBuilt}</strong> and
                  carries <strong>{formatNumber(national.avgAdt)}</strong> vehicles per day.
                  The oldest bridge still in service dates to <strong>{national.oldestYear}</strong>.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-2 text-center">Condition Distribution</h3>
              <ConditionPieChart
                good={national.good}
                fair={national.fair}
                poor={national.poor}
              />
            </div>
          </div>
        </div>
      </section>

      {/* All States Grid */}
      <section className="py-10 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Browse by State</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Click any state to explore counties, cities, and individual bridges
              </p>
            </div>
            <Link href="/rankings" className="text-sm text-blue-600 hover:text-blue-700 font-medium hidden sm:block">
              Full Rankings →
            </Link>
          </div>
          <StateGrid
            states={allStates.map((s) => ({
              state: s.state,
              stateName: s.stateName,
              total: s.total,
              poorPct: s.poorPct,
            }))}
          />
        </div>
      </section>

      {/* Worst Bridges Preview */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lowest Rated Bridges</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Structural ratings of 0-2 on a 9-point scale
              </p>
            </div>
            <Link href="/worst-condition-bridges" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All 9,800+ →
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <BridgeTable bridges={worstBridges} showRank showState />
          </div>
        </div>
      </section>

      {/* Data Source Footer */}
      <DataSourceFooter generatedAt={national.generatedAt} />
    </>
  );
}
