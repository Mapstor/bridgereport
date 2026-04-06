import dynamicImport from 'next/dynamic';
import Link from 'next/link';
import { getBridgeRanking, formatNumber } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import RankingJsonLd from '@/components/RankingJsonLd';
import LongestSpanMapWrapper from '@/components/LongestSpanMapWrapper';
import SpanComparisonChart from '@/components/SpanComparisonChart';
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
  title: 'Longest Span Bridges in America — Top Bridges by Maximum Span | BridgeReport.org',
  description:
    'Explore the bridges with the longest single spans in the United States. These engineering marvels include suspension bridges, cable-stayed bridges, and arch bridges.',
  alternates: {
    canonical: 'https://www.bridgereport.org/longest-span-bridges',
  },
  openGraph: {
    title: 'Longest Span Bridges in America',
    description:
      'Highway bridges with the longest maximum span lengths in the United States.',
    type: 'website',
    url: 'https://www.bridgereport.org/longest-span-bridges',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Longest Span Bridges in America - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Longest Span Bridges in America',
    description: 'Bridges with the longest maximum span lengths in the United States.',
    images: ['/og-image.png'],
  },
};

export default function LongestSpanBridgesPage() {
  const bridges = getBridgeRanking('longest_span');

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Longest Span Bridges' },
  ];

  // Calculate statistics
  const maxSpan = bridges.length > 0 && bridges[0].maxSpanFt ? bridges[0].maxSpanFt : 0;
  const avgSpan = bridges.length > 0
    ? bridges.reduce((sum, b) => sum + (b.maxSpanFt || 0), 0) / bridges.length
    : 0;

  // Count by design type for insights
  const designCount = new Map<string, number>();
  bridges.forEach(b => {
    const design = b.designTypeName?.split(' - ')[0] || 'Unknown';
    designCount.set(design, (designCount.get(design) || 0) + 1);
  });

  const suspensionCount = bridges.filter(b => b.designTypeName?.includes('Suspension')).length;
  const cableStayedCount = bridges.filter(b => b.designTypeName?.includes('Cable')).length;
  const archCount = bridges.filter(b => b.designTypeName?.includes('Arch')).length;
  const trussCount = bridges.filter(b => b.designTypeName?.includes('Truss')).length;

  return (
    <>
      <RankingJsonLd
        headline="Longest Span Bridges in America"
        description="Bridges with the longest maximum span lengths in the United States. These engineering achievements include iconic suspension bridges, modern cable-stayed designs, and impressive arch and truss structures."
        canonicalUrl="https://www.bridgereport.org/longest-span-bridges"
        items={bridges}
        listName="Longest Span Bridges in America"
        listDescription={`Top ${bridges.length} highway bridges with the longest maximum span in the United States`}
        itemListOrder="Descending"
        breadcrumbItems={breadcrumbItems}
      />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl font-bold mb-4">Longest Span Bridges in America</h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            Bridges with the longest maximum span lengths in the United States. These engineering
            achievements include iconic suspension bridges, modern cable-stayed designs, and
            impressive arch and truss structures.
          </p>

          {/* Stats by Design Type */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-violet-900/50 border border-violet-700 rounded-lg p-4">
              <p className="text-3xl font-bold text-violet-300">{formatNumber(suspensionCount)}</p>
              <p className="text-violet-200 text-sm">Suspension Bridges</p>
            </div>
            <div className="bg-blue-800/40 border border-blue-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-300">{formatNumber(cableStayedCount)}</p>
              <p className="text-blue-200 text-sm">Cable-Stayed</p>
            </div>
            <div className="bg-red-800/40 border border-red-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-red-300">{formatNumber(archCount)}</p>
              <p className="text-red-200 text-sm">Arch Bridges</p>
            </div>
            <div className="bg-emerald-800/40 border border-emerald-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-emerald-300">{formatNumber(trussCount)}</p>
              <p className="text-emerald-200 text-sm">Truss Bridges</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Long Span Engineering */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Engineering Long-Span Bridges
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-4">
              Long-span bridges represent the pinnacle of structural engineering, overcoming the fundamental
              challenge of supporting heavy loads across vast distances without intermediate support. The maximum
              span of a bridge — the longest unsupported distance between piers or towers — determines which
              design approach is feasible. Short spans under 150 feet can use simple beam construction, but
              crossing a major river or bay requires sophisticated structural systems that distribute forces
              efficiently through cables, arches, or carefully designed frameworks.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Suspension bridges achieve the longest spans by suspending the roadway deck from cables draped
              between tall towers. The main cables transfer the deck&apos;s weight to massive anchorages at
              each end, allowing spans exceeding 4,000 feet. America&apos;s longest suspension spans include
              the Verrazano-Narrows Bridge connecting Staten Island to Brooklyn at 4,260 feet, and the Golden
              Gate Bridge in San Francisco at 4,200 feet. These iconic structures require years of engineering
              design and careful coordination of steel fabrication, cable spinning, and deck installation.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Cable-stayed bridges offer an efficient alternative for spans between 500 and 2,000 feet. Unlike
              suspension bridges where cables drape between towers, cable-stayed designs run cables directly
              from the tower to the deck in fan or harp configurations. This approach allows faster construction
              since the deck can be built outward from each tower without temporary supports. Modern cable-stayed
              bridges have become increasingly popular for new crossings, combining aesthetic appeal with
              structural efficiency and constructability.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Arch and truss designs also enable impressive spans by distributing loads through compression
              (arches) or triangular frameworks (trusses). Steel arch bridges like the Bayonne Bridge in
              New York achieve spans over 1,600 feet, while cantilever truss bridges can reach 1,800 feet.
              Understanding maximum span helps engineers select appropriate designs and helps communities
              appreciate the engineering challenges involved in crossing major waterways.
            </p>
          </div>
        </section>

        {/* Interactive Map */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Bridge Locations by Design Type</h2>
            <p className="text-sm text-slate-500">
              Click markers for bridge details. Color indicates design type.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <LongestSpanMapWrapper bridges={bridges} height={500} />
          </div>
        </section>

        {/* Span Comparison Chart */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Top 10 Longest Spans</h2>
            <p className="text-slate-500 text-sm mb-6">
              Maximum span comparison for America&apos;s most impressive engineering feats
            </p>
            <SpanComparisonChart bridges={bridges} count={10} />
          </div>
        </section>

        {/* Design Type Explanation */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Bridge Design Types</h2>
            <p className="text-slate-600 mb-6">
              Different bridge designs enable different span lengths. Suspension and cable-stayed
              bridges can achieve the longest spans, while arch and truss designs offer efficiency
              for medium-span crossings.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex gap-3">
                <span className="w-8 h-8 bg-violet-600 rounded flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Suspension</p>
                  <p className="text-slate-600">Deck hangs from cables suspended between towers. Enables the longest spans (1,000+ ft typical).</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Cable-Stayed</p>
                  <p className="text-slate-600">Cables connect directly from tower to deck. Modern, efficient for 500-1,000 ft spans.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Arch</p>
                  <p className="text-slate-600">Curved structure transfers weight to abutments. Aesthetic choice for 200-800 ft spans.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Truss</p>
                  <p className="text-slate-600">Triangular framework distributes load. Reliable and cost-effective for medium spans.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">About Maximum Span</h2>
          <p className="text-slate-600">
            Maximum span refers to the longest distance between supports (piers or towers) on a
            bridge. This differs from total length, which measures the entire structure. Longer
            spans require more sophisticated engineering designs such as suspension cables,
            cable-stayed systems, or arch construction. The longest spans in America are
            typically found on bridges crossing major waterways where placing support piers in
            the water is difficult or impossible.
          </p>
        </div>

        {/* Ranking Table */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              All {formatNumber(bridges.length)} Bridges by Maximum Span
            </h2>
            <p className="text-slate-600">
              Search by road name, crossing, location, or state. Sorted by maximum span length.
            </p>
          </div>
          <RankingTable
            bridges={bridges}
            valueColumn="maxSpanFt"
            valueLabel="Max Span"
            formatType="feet"
            sortAscending={false}
            showDescription={true}
            descriptionType="span"
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
