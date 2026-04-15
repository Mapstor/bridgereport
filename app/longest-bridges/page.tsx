import dynamicImport from 'next/dynamic';
import Link from 'next/link';
import { getBridgeRanking, formatNumber } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import RankingJsonLd from '@/components/RankingJsonLd';
import LongestBridgesMapWrapper from '@/components/LongestBridgesMapWrapper';
import BridgeLengthComparison from '@/components/BridgeLengthComparison';
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
  title: 'Longest Bridges in America — Top 500 by Total Length',
  description:
    'Explore the 500 longest highway bridges in the United States, ranked by total length. Includes Lake Pontchartrain Causeway, Manchac Swamp Bridge, and more.',
  alternates: {
    canonical: 'https://www.bridgereport.org/longest-bridges',
  },
  openGraph: {
    title: 'Longest Bridges in America',
    description:
      'The 500 longest highway bridges in the United States, ranked by total length in feet.',
    type: 'website',
    url: 'https://www.bridgereport.org/longest-bridges',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Longest Bridges in America - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Longest Bridges in America',
    description: 'The 500 longest highway bridges in the United States, ranked by total length.',
    images: ['/og-image.png'],
  },
};

export default function LongestBridgesPage() {
  const bridges = getBridgeRanking('longest_bridges');

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Longest Bridges' },
  ];

  // Count by length category (based on actual data distribution)
  const over10k = bridges.filter(b => b.lengthFt && b.lengthFt >= 10000).length;
  const over5k = bridges.filter(b => b.lengthFt && b.lengthFt >= 5000 && b.lengthFt < 10000).length;
  const over2500 = bridges.filter(b => b.lengthFt && b.lengthFt >= 2500 && b.lengthFt < 5000).length;
  const over1000 = bridges.filter(b => b.lengthFt && b.lengthFt >= 1000 && b.lengthFt < 2500).length;

  // Longest bridge stats
  const longestBridge = bridges[0];
  const longestMiles = longestBridge?.lengthFt ? (longestBridge.lengthFt / 5280).toFixed(1) : null;

  return (
    <>
      <RankingJsonLd
        headline="Longest Bridges in America"
        description="The top longest highway bridges in the United States. These massive structures span lakes, rivers, bays, and wetlands across the country."
        canonicalUrl="https://www.bridgereport.org/longest-bridges"
        items={bridges}
        listName="Longest Bridges in America"
        listDescription={`Top ${bridges.length} longest highway bridges in the United States by total length`}
        itemListOrder="Descending"
        breadcrumbItems={breadcrumbItems}
      />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl font-bold mb-4">Longest Bridges in America</h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            The top {formatNumber(bridges.length)} longest highway bridges in the United States.
            These massive structures span lakes, rivers, bays, and wetlands across the country.
          </p>

          {/* Stats by Length */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-violet-900/50 border border-violet-700 rounded-lg p-4">
              <p className="text-3xl font-bold text-violet-300">{formatNumber(over10k)}</p>
              <p className="text-violet-200 text-sm">Over 2 miles</p>
            </div>
            <div className="bg-blue-800/40 border border-blue-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-300">{formatNumber(over5k)}</p>
              <p className="text-blue-200 text-sm">1-2 miles</p>
            </div>
            <div className="bg-cyan-800/40 border border-cyan-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-cyan-300">{formatNumber(over2500)}</p>
              <p className="text-cyan-200 text-sm">0.5-1 mile</p>
            </div>
            <div className="bg-emerald-800/40 border border-emerald-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-emerald-300">{formatNumber(over1000)}</p>
              <p className="text-emerald-200 text-sm">1,000-2,500 ft</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Long Bridges */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            America&apos;s Longest Highway Bridges
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-4">
              America&apos;s longest bridges stretch for miles across lakes, bays, swamps, and river deltas where conventional
              road construction would be impossible. The Lake Pontchartrain Causeway in Louisiana, spanning nearly 24 miles
              of open water, holds the record for longest bridge over water in the United States. This remarkable structure
              connects Metairie to Mandeville across the shallow waters of Lake Pontchartrain, carrying over 40,000 vehicles
              daily along its parallel twin spans built in 1956 and 1969.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Louisiana dominates the list of longest American bridges due to its unique geography. The state&apos;s extensive
              wetlands, swamps, and coastal marshes require elevated roadways that can stretch for dozens of miles without
              touching solid ground. The Manchac Swamp Bridge carries Interstate 55 for nearly 23 miles through the
              Manchac Swamp between LaPlace and Ponchatoula, while the Atchafalaya Basin Bridge extends over 18 miles
              across the largest river swamp in the United States. These extended viaducts represent massive engineering
              investments that enable critical transportation links across otherwise impassable terrain.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Florida&apos;s Overseas Highway connecting the Florida Keys features the Seven Mile Bridge, one of the most
              scenic extended bridges in the nation. The original 1912 railroad bridge was converted for automobile use,
              with the current parallel structure completed in 1982. Bay bridges connecting major cities to surrounding
              communities also rank among America&apos;s longest, including the Chesapeake Bay Bridge-Tunnel in Virginia,
              which uses a combination of bridges, tunnels, and man-made islands to span 17.6 miles of open water.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Bridge length is measured as total deck length from abutment to abutment, as reported in the National Bridge
              Inventory. This measurement captures the full extent of the elevated structure but differs from main span
              length, which measures the longest unsupported distance between piers. Extended bridges like causeways may
              have relatively short individual spans while achieving remarkable total lengths through continuous construction
              across multiple support piers. Understanding the difference helps engineers and planners evaluate both the
              overall scale and the engineering complexity of these massive infrastructure projects.
            </p>
          </div>
        </section>

        {/* Interactive Map */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Bridge Locations</h2>
            <p className="text-sm text-slate-500">
              Click markers for bridge details. Larger markers = longer bridges.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <LongestBridgesMapWrapper bridges={bridges} height={500} />
          </div>
        </section>

        {/* Visual Length Comparison */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Top 10 Longest Bridges Compared</h2>
            <p className="text-slate-600 text-sm mb-6">
              Visual comparison of America&apos;s longest bridges. The Lake Pontchartrain Causeway in Louisiana
              is nearly 24 miles long, making it one of the longest bridges over water in the world.
            </p>
            <BridgeLengthComparison bridges={bridges} count={10} />
          </div>
        </section>

        {/* Length Categories Explanation */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Understanding Bridge Lengths</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-violet-600 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">2+ Miles (10,000+ ft)</p>
                  <p className="text-slate-600">Major causeways and extended water crossings, including Louisiana&apos;s iconic lake and swamp bridges.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-blue-600 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">1-2 Miles (5,000-10,000 ft)</p>
                  <p className="text-slate-600">Large river crossings and bay bridges spanning significant bodies of water.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-cyan-600 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">0.5-1 Mile (2,500-5,000 ft)</p>
                  <p className="text-slate-600">Major highway viaducts, river crossings, and elevated roadways through wetlands.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-emerald-600 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">1,000-2,500 ft</p>
                  <p className="text-slate-600">Significant bridges including medium river crossings and interstate overpasses.</p>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-4 pt-4 border-t border-slate-100">
              Bridge length is measured as total deck length from abutment to abutment, as reported in the National Bridge Inventory.
            </p>
          </div>
        </section>

        {/* Full Ranking Table */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              All {formatNumber(bridges.length)} Longest Bridges
            </h2>
            <p className="text-slate-600">
              Search by road name, crossing, location, or state. Sorted by longest first.
            </p>
          </div>
          <RankingTable
            bridges={bridges}
            valueColumn="lengthFt"
            valueLabel="Length"
            formatType="feet"
            sortAscending={false}
            showDescription={true}
            descriptionType="longest"
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
                Longest Spans
              </h3>
              <p className="text-sm text-slate-500">
                By main span length
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
