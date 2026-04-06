import dynamicImport from 'next/dynamic';
import Link from 'next/link';
import { getBridgeRanking, formatNumber } from '@/lib/data';
import Breadcrumbs, { BreadcrumbJsonLd } from '@/components/Breadcrumbs';
import OldestBridgesMapWrapper from '@/components/OldestBridgesMapWrapper';
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
  title: 'Oldest Bridges in America — Historic Bridges by Year Built | BridgeReport.org',
  description:
    'Discover the oldest highway bridges still in use in the United States. Many date back to the 1800s and feature historic masonry and iron construction.',
  alternates: {
    canonical: 'https://bridgereport.org/oldest-bridges',
  },
  openGraph: {
    title: 'Oldest Bridges in America',
    description:
      'The oldest highway bridges still standing in the United States, ranked by year built.',
    type: 'website',
    url: 'https://bridgereport.org/oldest-bridges',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Oldest Bridges in America - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oldest Bridges in America',
    description: 'The oldest highway bridges still standing in the United States, by year built.',
    images: ['/og-image.png'],
  },
};

function ListJsonLd({ count }: { count: number }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Oldest Bridges in America',
    description: `Top ${count} oldest highway bridges in the United States by year built`,
    numberOfItems: count,
    itemListOrder: 'Ascending',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function OldestBridgesPage() {
  const bridges = getBridgeRanking('oldest_bridges');

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Oldest Bridges' },
  ];

  // Count by era
  const pre1850 = bridges.filter(b => b.yearBuilt && b.yearBuilt < 1850).length;
  const era1850 = bridges.filter(b => b.yearBuilt && b.yearBuilt >= 1850 && b.yearBuilt < 1900).length;

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ListJsonLd count={bridges.length} />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl font-bold mb-4">Oldest Bridges in America</h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            The oldest {formatNumber(bridges.length)} highway bridges still in service in the United States.
            Many of these historic structures date back to the 1800s and showcase early American engineering.
          </p>

          {/* Stats by Era */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-violet-900/50 border border-violet-700 rounded-lg p-4">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-violet-300">{formatNumber(pre1850)}</p>
                <p className="text-violet-200 text-sm">Before 1850</p>
              </div>
              <p className="text-violet-300/70 text-sm mt-1">Stone arches and early wooden covered bridges from the Early Republic era.</p>
            </div>
            <div className="bg-purple-800/40 border border-purple-600 rounded-lg p-4">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-purple-300">{formatNumber(era1850)}</p>
                <p className="text-purple-200 text-sm">1850-1899</p>
              </div>
              <p className="text-purple-300/70 text-sm mt-1">Cast iron, wrought iron, and early steel bridges from the Industrial Age.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Historic Bridges */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            America&apos;s Oldest Standing Highway Bridges
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-4">
              The oldest bridges still carrying highway traffic in America date back to the late 18th and early 19th centuries,
              representing remarkable feats of engineering that have withstood over 150 years of use. These historic structures
              include stone arch bridges built during the canal era, wooden covered bridges that protected their structural
              timbers from weather, and early iron bridges from the dawn of the Industrial Revolution. Pennsylvania, with its
              rich history of turnpikes and canal infrastructure, leads the nation in surviving historic bridges.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Stone arch bridges from the pre-1850 era remain among the most durable structures ever built. Using locally
              quarried stone and traditional masonry techniques, these bridges were designed to carry horse-drawn wagons
              but continue to support modern automobile traffic with minimal modification. Many feature multiple arches
              spanning rivers and creeks, with abutments and piers that have settled into remarkably stable foundations
              over the centuries. The oldest examples often served toll roads or connected communities to canal networks.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Covered bridges represent a uniquely American innovation from the early 1800s. By enclosing the wooden truss
              structure within a roof and siding, builders extended the lifespan of these bridges from roughly 10-15 years
              to 80 years or more. Original covered bridges from the 1820s through 1870s survive primarily in New England,
              Ohio, Indiana, and Oregon. Many are listed on the National Register of Historic Places and maintained as
              local landmarks, though they continue to carry light vehicle traffic on rural roads.
            </p>
            <p className="text-slate-600 leading-relaxed">
              The transition from wood and stone to metal bridges began in the mid-1800s with cast iron, followed by
              wrought iron and eventually steel construction. Early iron bridges from the 1850s through 1880s showcased
              innovative truss designs including the Pratt, Howe, and Whipple configurations. These bridges enabled the
              railroad expansion that transformed America and many were later adapted for highway use. Understanding
              bridge ages helps prioritize maintenance and replacement investments, as older structures may require
              more frequent inspection and specialized preservation techniques.
            </p>
          </div>
        </section>

        {/* Interactive Map */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Bridge Locations</h2>
            <p className="text-sm text-slate-500">
              Click markers for bridge details. Showing oldest 1,000 bridges.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <OldestBridgesMapWrapper bridges={bridges} height={500} />
          </div>
        </section>

        {/* Era Explanation */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Bridge Eras in America</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-violet-600 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">Pre-1850 — Early Republic</p>
                  <p className="text-slate-600">Stone arch bridges and early wooden covered bridges. Many built for canals and turnpikes during westward expansion.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-purple-500 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">1850-1899 — Industrial Age</p>
                  <p className="text-slate-600">Cast and wrought iron bridges, early steel construction. The railroad expansion era drove bridge innovation.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-sky-500 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">1900-1919 — Progressive Era</p>
                  <p className="text-slate-600">Reinforced concrete introduction and standardized steel designs. Early automobile bridges appeared.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-teal-500 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">1920-1939 — Auto Age</p>
                  <p className="text-slate-600">Art Deco styling and wider roadways for cars. Early highway system bridges began appearing.</p>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-sm mt-4 pt-4 border-t border-slate-100">
              Pennsylvania leads with many stone arch bridges dating to the early 1800s.
              Despite their age, many of these bridges continue to serve local communities.
            </p>
          </div>
        </section>

        {/* Full Ranking Table */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              All {formatNumber(bridges.length)} Historic Bridges
            </h2>
            <p className="text-slate-600">
              Search by road name, crossing, location, or state. Sorted by oldest first.
            </p>
          </div>
          <RankingTable
            bridges={bridges}
            valueColumn="yearBuilt"
            valueLabel="Year Built"
            formatType="year"
            sortAscending={true}
            showDescription={true}
            descriptionType="oldest"
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
