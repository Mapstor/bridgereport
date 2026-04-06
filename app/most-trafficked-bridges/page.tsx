import dynamicImport from 'next/dynamic';
import Link from 'next/link';
import { getBridgeRanking, formatNumber } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import RankingJsonLd from '@/components/RankingJsonLd';
import TraffickedBridgesMapWrapper from '@/components/TraffickedBridgesMapWrapper';
import TrafficComparisonChart from '@/components/TrafficComparisonChart';
import DataSourceFooter from '@/components/DataSourceFooter';
import type { Metadata } from 'next';

const RankingTable = dynamicImport(() => import('@/components/RankingTable'), {
  loading: () => (
    <div className="animate-pulse space-y-2">
      <div className="h-10 bg-slate-100 rounded" />
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-14 bg-slate-50 rounded" />
      ))}
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'Most Trafficked Bridges in America — Highest ADT Rankings | BridgeReport.org',
  description:
    'Explore the busiest highway bridges in the United States, ranked by average daily traffic (ADT). These bridges carry hundreds of thousands of vehicles daily.',
  alternates: {
    canonical: 'https://www.bridgereport.org/most-trafficked-bridges',
  },
  openGraph: {
    title: 'Most Trafficked Bridges in America',
    description:
      'The busiest highway bridges in the United States, ranked by average daily traffic.',
    type: 'website',
    url: 'https://www.bridgereport.org/most-trafficked-bridges',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Most Trafficked Bridges in America - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Most Trafficked Bridges in America',
    description: 'The busiest highway bridges in the United States, ranked by daily traffic.',
    images: ['/og-image.png'],
  },
};

export default function MostTraffickedBridgesPage() {
  const bridges = getBridgeRanking('most_trafficked');

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Most Trafficked Bridges' },
  ];

  // Calculate statistics
  const highestAdt = bridges.length > 0 && bridges[0].adt ? bridges[0].adt : 0;
  const totalDailyCrossings = bridges.reduce((sum, b) => sum + (b.adt || 0), 0);

  // Count by traffic category (based on actual data distribution)
  const over500k = bridges.filter(b => b.adt && b.adt >= 500000).length;
  const over300k = bridges.filter(b => b.adt && b.adt >= 300000 && b.adt < 500000).length;
  const over200k = bridges.filter(b => b.adt && b.adt >= 200000 && b.adt < 300000).length;
  const under200k = bridges.filter(b => b.adt && b.adt < 200000).length;

  // Count by state for insights
  const stateCount = new Map<string, number>();
  bridges.forEach(b => {
    stateCount.set(b.state, (stateCount.get(b.state) || 0) + 1);
  });
  const topStates = [...stateCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      <RankingJsonLd
        headline="Most Trafficked Bridges in America"
        description="The busiest highway bridges in the United States, ranked by average daily traffic (ADT). These critical infrastructure assets carry hundreds of thousands of vehicles every day across major metropolitan areas."
        canonicalUrl="https://www.bridgereport.org/most-trafficked-bridges"
        items={bridges}
        listName="Most Trafficked Bridges in America"
        listDescription={`Top ${bridges.length} busiest highway bridges in the United States by average daily traffic`}
        itemListOrder="Descending"
        breadcrumbItems={breadcrumbItems}
      />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl font-bold mb-4">Most Trafficked Bridges in America</h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            The busiest highway bridges in the United States, ranked by average daily traffic
            (ADT). These critical infrastructure assets carry hundreds of thousands of vehicles
            every day across major metropolitan areas.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
              <p className="text-3xl font-bold text-red-300">{formatNumber(over500k)}</p>
              <p className="text-red-200 text-sm">Over 500k/day</p>
            </div>
            <div className="bg-orange-800/40 border border-orange-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-orange-300">{formatNumber(over300k)}</p>
              <p className="text-orange-200 text-sm">300k-500k/day</p>
            </div>
            <div className="bg-yellow-800/40 border border-yellow-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-yellow-300">{formatNumber(over200k)}</p>
              <p className="text-yellow-200 text-sm">200k-300k/day</p>
            </div>
            <div className="bg-lime-800/40 border border-lime-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-lime-300">{formatNumber(under200k)}</p>
              <p className="text-lime-200 text-sm">Under 200k/day</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Interactive Map */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Bridge Locations by Traffic Volume</h2>
            <p className="text-sm text-slate-500">
              Click markers for bridge details. Color indicates daily traffic.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <TraffickedBridgesMapWrapper bridges={bridges} height={500} />
          </div>
        </section>

        {/* Traffic Comparison Chart */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Top 10 Busiest Bridges</h2>
            <p className="text-slate-500 text-sm mb-6">
              Daily traffic comparison for America&apos;s highest-volume bridges
            </p>
            <TrafficComparisonChart bridges={bridges} count={10} />
          </div>
        </section>

        {/* State Distribution */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Traffic by State</h2>
            <p className="text-slate-600 mb-4">
              High-traffic bridges concentrate in states with major urban centers and interstate highways.
              California dominates due to Los Angeles and Bay Area traffic, while Texas, New York, and
              Florida also have numerous high-volume crossings.
            </p>
            <div className="flex flex-wrap gap-3">
              {topStates.map(([state, count]) => (
                <Link
                  key={state}
                  href={`/state/${state.toLowerCase()}`}
                  className="px-4 py-2 bg-green-50 text-green-800 rounded-lg hover:bg-green-100 border border-green-200 transition-colors"
                >
                  {state}: {count} bridges
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Understanding America&apos;s Busiest Bridges
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-4">
              The busiest bridges in America carry traffic volumes that would have seemed unimaginable
              to the engineers who designed our original interstate highway system. Average Daily Traffic
              (ADT) counts exceeding 300,000 vehicles are concentrated in major metropolitan areas where
              interstate highways cross rivers, bays, and urban corridors. These high-volume crossings
              serve as critical chokepoints for regional transportation networks, where any disruption
              can cascade into widespread congestion affecting millions of commuters and commercial traffic.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              California dominates the rankings of busiest bridges due to the confluence of massive
              population centers in Los Angeles and the San Francisco Bay Area with geographic barriers
              requiring bridge crossings. Interstate highways like I-405, I-5, and I-10 in Southern
              California regularly exceed 300,000 vehicles per day across multiple bridge structures.
              The Bay Area&apos;s bridges carry substantial traffic as the only connections between
              peninsula communities and the East Bay, creating concentrated demand at each crossing point.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              High traffic volumes create unique maintenance challenges for transportation agencies.
              Bridges carrying hundreds of thousands of vehicles daily experience accelerated wear on
              deck surfaces, expansion joints, and bearings. Inspection and repair work must often occur
              during limited overnight windows to minimize traffic disruption, increasing costs and extending
              project schedules. Some of the busiest crossings have implemented managed lanes, high-occupancy
              vehicle restrictions, and variable tolling to distribute demand more evenly throughout the day.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              The structural demands on high-traffic bridges extend beyond simple wear and tear. Live
              loads from heavy truck traffic can accumulate fatigue damage in steel components over decades
              of service. Concrete decks experience cracking from thermal cycles and the concentrated
              wheel loads of dense traffic. Transportation agencies monitor these bridges more frequently
              than lower-volume crossings, often installing permanent sensors to track deflection, strain,
              and vibration patterns that might indicate developing structural issues.
            </p>
          </div>
        </section>

        {/* Traffic Categories */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Traffic Volume Categories</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-3">
              <span className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center font-bold shrink-0 text-xs">500k+</span>
              <div>
                <p className="font-semibold text-slate-900">Extreme Traffic</p>
                <p className="text-slate-600">Over 500,000 vehicles per day. Major interstate interchanges.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-8 h-8 bg-orange-500 text-white rounded flex items-center justify-center font-bold shrink-0 text-xs">300k</span>
              <div>
                <p className="font-semibold text-slate-900">Very High Traffic</p>
                <p className="text-slate-600">300,000-500,000 vehicles per day. Major urban corridors.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-8 h-8 bg-yellow-500 text-white rounded flex items-center justify-center font-bold shrink-0 text-xs">200k</span>
              <div>
                <p className="font-semibold text-slate-900">High Traffic</p>
                <p className="text-slate-600">200,000-300,000 vehicles per day. Busy metropolitan routes.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-8 h-8 bg-lime-500 text-white rounded flex items-center justify-center font-bold shrink-0 text-xs">&lt;200k</span>
              <div>
                <p className="font-semibold text-slate-900">Moderate High Traffic</p>
                <p className="text-slate-600">Still among America&apos;s busiest bridges.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Table */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              All {formatNumber(bridges.length)} Busiest Bridges
            </h2>
            <p className="text-slate-600">
              Search by road name, crossing, location, or state. Sorted by daily traffic.
            </p>
          </div>
          <RankingTable
            bridges={bridges}
            valueColumn="adt"
            valueLabel="Daily Traffic"
            sortAscending={false}
            showDescription={true}
            descriptionType="trafficked"
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
              href="/longest-span-bridges"
              className="group bg-indigo-50 hover:bg-indigo-100 rounded-xl p-5 border border-indigo-200 hover:border-indigo-300 transition-all"
            >
              <div className="w-10 h-10 bg-indigo-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-300 transition-colors">
                <svg className="w-5 h-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                Longest Span Bridges
              </h3>
              <p className="text-sm text-slate-500">
                Largest single spans
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
                Lowest rated bridges
              </p>
            </Link>
          </div>
        </section>

        <DataSourceFooter />
      </div>
    </>
  );
}
