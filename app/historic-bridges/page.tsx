import dynamicImport from 'next/dynamic';
import Link from 'next/link';
import { getBridgeRanking, formatNumber } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import RankingJsonLd from '@/components/RankingJsonLd';
import HistoricBridgesMapWrapper from '@/components/HistoricBridgesMapWrapper';
import HistoricBridgesMaterialChart from '@/components/HistoricBridgesMaterialChart';
import HistoricBridgesTimeline from '@/components/HistoricBridgesTimeline';
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
  title: 'Historic Bridges in America — National Register of Historic Places | BridgeReport.org',
  description:
    'Explore highway bridges listed on the National Register of Historic Places. These bridges represent significant engineering achievements and cultural heritage.',
  alternates: {
    canonical: 'https://www.bridgereport.org/historic-bridges',
  },
  openGraph: {
    title: 'Historic Bridges in America',
    description:
      'Highway bridges listed on the National Register of Historic Places, preserving American engineering heritage.',
    type: 'website',
    url: 'https://www.bridgereport.org/historic-bridges',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Historic Bridges in America - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Historic Bridges in America',
    description: 'Highway bridges listed on the National Register of Historic Places.',
    images: ['/og-image.png'],
  },
};

export default function HistoricBridgesPage() {
  const bridges = getBridgeRanking('historic_bridges');

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Historic Bridges' },
  ];

  // Calculate statistics
  const oldestYear = bridges.length > 0
    ? Math.min(...bridges.filter(b => b.yearBuilt).map(b => b.yearBuilt!))
    : null;

  // Count by state
  const stateCount = new Set(bridges.map(b => b.state)).size;

  // Count by era
  const pre1850 = bridges.filter(b => b.yearBuilt && b.yearBuilt < 1850).length;
  const era1850to1870 = bridges.filter(b => b.yearBuilt && b.yearBuilt >= 1850 && b.yearBuilt < 1870).length;
  const era1870to1890 = bridges.filter(b => b.yearBuilt && b.yearBuilt >= 1870 && b.yearBuilt < 1890).length;

  // Count by material
  const woodCount = bridges.filter(b => b.materialName?.includes('Wood')).length;
  const masonryCount = bridges.filter(b => b.materialName?.includes('Masonry')).length;
  const steelCount = bridges.filter(b => b.materialName?.includes('Steel')).length;
  const ironCount = bridges.filter(b => b.materialName?.includes('Iron')).length;

  return (
    <>
      <RankingJsonLd
        headline="Historic Bridges in America"
        description="Highway bridges listed on the National Register of Historic Places. These 19th-century structures represent significant achievements in American engineering and are preserved for their cultural and architectural value."
        canonicalUrl="https://www.bridgereport.org/historic-bridges"
        items={bridges}
        listName="Historic Bridges in America"
        listDescription={`${bridges.length} highway bridges listed on the National Register of Historic Places`}
        itemListOrder="Ascending"
        breadcrumbItems={breadcrumbItems}
      />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl font-bold mb-4">Historic Bridges in America</h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            {formatNumber(bridges.length)} highway bridges listed on the National Register of Historic Places.
            These 19th-century structures represent significant achievements in American engineering
            and are preserved for their cultural and architectural value.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-900/50 border border-amber-700 rounded-lg p-4">
              <p className="text-3xl font-bold text-amber-300">{formatNumber(pre1850)}</p>
              <p className="text-amber-200 text-sm">Before 1850</p>
            </div>
            <div className="bg-orange-800/40 border border-orange-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-orange-300">{formatNumber(era1850to1870)}</p>
              <p className="text-orange-200 text-sm">1850-1869</p>
            </div>
            <div className="bg-yellow-800/40 border border-yellow-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-yellow-300">{formatNumber(era1870to1890)}</p>
              <p className="text-yellow-200 text-sm">1870-1889</p>
            </div>
            <div className="bg-slate-700/50 border border-slate-500 rounded-lg p-4">
              <p className="text-3xl font-bold text-slate-300">{stateCount}</p>
              <p className="text-slate-400 text-sm">States</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Historic Bridges */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Preserving America&apos;s Bridge Heritage
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-4">
              Bridges listed on the National Register of Historic Places represent more than old infrastructure —
              they document the evolution of American engineering, transportation, and community development.
              These structures survived when thousands of their contemporaries were replaced, often because local
              communities recognized their significance and advocated for preservation. From stone arch bridges
              built by colonial masons to iron truss bridges erected during the railroad era, each historic bridge
              tells a story about the materials, techniques, and ambitions of its builders.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              The earliest surviving bridges date to the late 1700s and early 1800s, primarily stone arch
              structures built to last centuries using locally quarried materials and hand-cut masonry techniques.
              Pennsylvania leads the nation in pre-Civil War bridges due to its extensive canal and turnpike
              systems that required durable crossings. Covered wooden bridges from this era also survive in
              significant numbers, primarily in New England, Ohio, Indiana, and Oregon. The protective roof
              and siding that gave covered bridges their name extended structural timber lifespan from 10-15
              years to 80 years or more, enabling many to survive into the automobile age.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              The transition from wood and stone to metal construction began in the mid-1800s with cast iron,
              followed by wrought iron and eventually steel. Patent truss designs — including the Pratt, Howe,
              Warren, and Whipple configurations — standardized bridge construction and enabled prefabricated
              components to be shipped nationwide by railroad. Many historic iron bridges were built by companies
              that have since vanished, their nameplates and construction dates providing valuable documentation
              for industrial historians. The Phoenix Column company, the Berlin Iron Bridge Company, and dozens
              of regional fabricators left their marks across the American landscape.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Today, state departments of transportation and historic preservation offices work together to
              balance infrastructure needs with heritage conservation. Some historic bridges have been
              rehabilitated to carry modern traffic with weight restrictions, while others have been bypassed
              by new structures but preserved for pedestrians and cyclists. The National Register listing
              provides recognition and can unlock funding for sensitive rehabilitation, ensuring these
              engineering landmarks remain accessible for future generations to study and appreciate.
            </p>
          </div>
        </section>

        {/* Interactive Map */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Historic Bridge Locations</h2>
            <p className="text-sm text-slate-500">
              Color-coded by construction material. Click markers for details.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <HistoricBridgesMapWrapper bridges={bridges} height={500} />
          </div>
        </section>

        {/* Two Column: Timeline + Materials */}
        <section className="mb-12 grid lg:grid-cols-2 gap-6">
          {/* Oldest Bridges Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">10 Oldest Historic Bridges</h2>
            <p className="text-slate-600 text-sm mb-6">
              The oldest bridges on the National Register, some dating back to the early 1800s.
            </p>
            <HistoricBridgesTimeline bridges={bridges} count={10} />
          </div>

          {/* Materials Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Construction Materials</h2>
            <p className="text-slate-600 text-sm mb-6">
              Historic bridges showcase a variety of 19th-century construction techniques.
            </p>
            <HistoricBridgesMaterialChart bridges={bridges} />

            {/* Material explanations */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="w-4 h-4 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: '#854d0e' }}></span>
                <div>
                  <p className="font-medium text-slate-700">Wood/Timber</p>
                  <p className="text-slate-500">Covered bridges and early trestle structures.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-4 h-4 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: '#7c3aed' }}></span>
                <div>
                  <p className="font-medium text-slate-700">Masonry</p>
                  <p className="text-slate-500">Stone arch bridges, highly durable construction.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-4 h-4 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: '#dc2626' }}></span>
                <div>
                  <p className="font-medium text-slate-700">Iron</p>
                  <p className="text-slate-500">Cast and wrought iron, revolutionary for its time.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Historic Bridges */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Understanding Historic Bridge Eras</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-amber-600 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">Pre-1850 — Early Republic</p>
                  <p className="text-slate-600">Stone arch bridges and covered wooden bridges built when America was expanding westward. Many feature hand-cut stone masonry.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-orange-600 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">1850-1869 — Pre-Civil War & Reconstruction</p>
                  <p className="text-slate-600">Iron technology emerged, but many regions still used traditional wood and stone construction methods.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-yellow-600 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">1870-1889 — Gilded Age</p>
                  <p className="text-slate-600">Railroad expansion drove bridge innovation. Steel began replacing iron, and truss designs became standardized.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-slate-500 rounded-full shrink-0 mt-0.5"></span>
                <div>
                  <p className="font-semibold text-slate-900">National Register Criteria</p>
                  <p className="text-slate-600">Bridges are listed for engineering significance, architectural merit, or association with important historical events.</p>
                </div>
              </div>
            </div>
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
            descriptionType="historic"
          />
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">More Bridge Rankings</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                All bridges by age
              </p>
            </Link>

            <Link
              href="/covered-bridges"
              className="group bg-yellow-50 hover:bg-yellow-100 rounded-xl p-5 border border-yellow-200 hover:border-yellow-300 transition-all"
            >
              <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-300 transition-colors">
                <svg className="w-5 h-5 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-yellow-700 transition-colors">
                Covered Bridges
              </h3>
              <p className="text-sm text-slate-500">
                Wooden covered bridges
              </p>
            </Link>

            <Link
              href="/longest-bridges"
              className="group bg-violet-50 hover:bg-violet-100 rounded-xl p-5 border border-violet-200 hover:border-violet-300 transition-all"
            >
              <div className="w-10 h-10 bg-violet-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-violet-300 transition-colors">
                <svg className="w-5 h-5 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-violet-700 transition-colors">
                Longest Bridges
              </h3>
              <p className="text-sm text-slate-500">
                By total length
              </p>
            </Link>

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
          </div>
        </section>

        <DataSourceFooter />
      </div>
    </>
  );
}
