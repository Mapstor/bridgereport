import Link from 'next/link';
import { getAllCoveredBridges, formatNumber } from '@/lib/data';
import ConditionBadge from '@/components/ConditionBadge';
import Breadcrumbs from '@/components/Breadcrumbs';
import RankingJsonLd from '@/components/RankingJsonLd';
import CoveredBridgesMapWrapper from '@/components/CoveredBridgesMapWrapper';
import CoveredBridgesTimeline from '@/components/CoveredBridgesTimeline';
import DataSourceFooter from '@/components/DataSourceFooter';
import type { Metadata } from 'next';
import type { ConditionCategory } from '@/types';

export const metadata: Metadata = {
  title: 'Covered Bridges in America — 300+ Historic Wooden Bridges by State | BridgeReport.org',
  description:
    'Explore 300+ covered bridges in America from the National Bridge Inventory. Find covered bridges by state, see condition ratings, and discover bridges dating to the 1820s.',
  alternates: {
    canonical: 'https://www.bridgereport.org/covered-bridges',
  },
  openGraph: {
    title: 'Covered Bridges in America — 300+ Historic Wooden Bridges',
    description:
      'Explore 300+ covered bridges from the National Bridge Inventory. Find by state with condition ratings.',
    type: 'website',
    url: 'https://www.bridgereport.org/covered-bridges',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Covered Bridges in America - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Covered Bridges in America — 300+ Historic Bridges',
    description: 'Explore 300+ covered bridges from the NBI. Find by state with condition ratings.',
    images: ['/og-image.png'],
  },
};

// Use dynamic rendering to avoid memory issues during build
export const dynamic = 'force-dynamic';

// Use fixed year to avoid hydration mismatch
const CURRENT_YEAR = 2026;

// Generate description for covered bridge
function getCoveredBridgeDescription(bridge: {
  facilityCarried?: string | null;
  featuresIntersected?: string | null;
  yearBuilt?: number | null;
  stateName?: string | null;
  countyName?: string | null;
  conditionCategory?: string | null;
  historical?: string | null;
}): string {
  const age = bridge.yearBuilt ? CURRENT_YEAR - bridge.yearBuilt : null;
  const name = bridge.facilityCarried || 'This bridge';
  const crossing = bridge.featuresIntersected || 'the waterway';
  const location = bridge.countyName
    ? `${bridge.countyName}, ${bridge.stateName}`
    : bridge.stateName || 'its location';

  // Determine era description
  let eraDesc = '';
  if (bridge.yearBuilt) {
    if (bridge.yearBuilt < 1830) {
      eraDesc = 'the Early Republic period, when covered bridge construction was just beginning in America';
    } else if (bridge.yearBuilt < 1850) {
      eraDesc = 'the Antebellum era, during the early expansion of America\'s road network';
    } else if (bridge.yearBuilt < 1865) {
      eraDesc = 'the Civil War era, a time of significant infrastructure development';
    } else if (bridge.yearBuilt < 1880) {
      eraDesc = 'the Reconstruction period, when communities rebuilt and expanded transportation routes';
    } else if (bridge.yearBuilt < 1900) {
      eraDesc = 'the late 19th century, during the golden age of covered bridge construction';
    } else {
      eraDesc = 'the early 20th century, near the end of the covered bridge building tradition';
    }
  }

  // Build sentences
  let sentence1 = '';
  if (age && bridge.yearBuilt) {
    sentence1 = `${name} is a ${age}-year-old covered bridge spanning ${crossing} in ${location}, built in ${bridge.yearBuilt} during ${eraDesc}.`;
  } else {
    sentence1 = `${name} is a historic covered bridge spanning ${crossing} in ${location}.`;
  }

  // Construction and design context
  const sentence2 =
    'This wooden truss structure features the enclosed design that protects its timbers from weather, allowing covered bridges to survive for centuries when properly maintained.';

  // Condition and historic status
  let sentence3 = '';
  const conditionLower = bridge.conditionCategory?.toLowerCase() || '';
  const isHistoric =
    bridge.historical === '1' || bridge.historical === '2';

  if (isHistoric && conditionLower) {
    const registerStatus =
      bridge.historical === '1'
        ? 'listed on the National Register of Historic Places'
        : 'eligible for the National Register of Historic Places';
    sentence3 = `Currently rated in ${conditionLower} condition, this bridge is ${registerStatus}.`;
  } else if (conditionLower) {
    sentence3 = `It is currently rated in ${conditionLower} condition.`;
  } else if (isHistoric) {
    const registerStatus =
      bridge.historical === '1'
        ? 'listed on the National Register of Historic Places'
        : 'eligible for the National Register of Historic Places';
    sentence3 = `This historic structure is ${registerStatus}.`;
  }

  return `${sentence1} ${sentence2}${sentence3 ? ' ' + sentence3 : ''}`;
}

export default function CoveredBridgesPage() {
  const data = getAllCoveredBridges();
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Covered Bridges' },
  ];

  // Get oldest covered bridges for featured section
  const oldestBridges = data.bridges.slice(0, 20);

  // Calculate era distribution
  const pre1850 = data.bridges.filter(b => b.yearBuilt && b.yearBuilt < 1850).length;
  const era1850_1879 = data.bridges.filter(b => b.yearBuilt && b.yearBuilt >= 1850 && b.yearBuilt < 1880).length;
  const era1880_1909 = data.bridges.filter(b => b.yearBuilt && b.yearBuilt >= 1880 && b.yearBuilt < 1910).length;
  const era1910Plus = data.bridges.filter(b => b.yearBuilt && b.yearBuilt >= 1910).length;

  // Top 5 states
  const topStates = data.byState.slice(0, 5);

  return (
    <>
      <RankingJsonLd
        headline="Covered Bridges in America"
        description="America's covered bridges still standing across multiple states. These historic wooden truss structures, some dating back to the early 1800s, represent an important part of American engineering and architectural heritage."
        canonicalUrl="https://www.bridgereport.org/covered-bridges"
        items={data.bridges}
        listName="Covered Bridges in America"
        listDescription={`A comprehensive list of ${data.total} covered bridges across ${data.byState.length} U.S. states`}
        itemListOrder="Ascending"
        breadcrumbItems={breadcrumbs}
      />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbs} className="mb-6" />

          <h1 className="text-4xl font-bold mb-4">Covered Bridges in America</h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            America has <strong className="text-white">{formatNumber(data.total)}</strong> covered bridges
            still standing across <strong className="text-white">{data.byState.length}</strong> states.
            These historic wooden truss structures, some dating back to the early 1800s, represent an
            important part of American engineering and architectural heritage.
          </p>

          {/* Stats by Era */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-900/50 border border-amber-700 rounded-lg p-4">
              <p className="text-3xl font-bold text-amber-300">{formatNumber(pre1850)}</p>
              <p className="text-amber-200 text-sm">Before 1850</p>
            </div>
            <div className="bg-amber-800/40 border border-amber-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-amber-300">{formatNumber(era1850_1879)}</p>
              <p className="text-amber-200 text-sm">1850-1879</p>
            </div>
            <div className="bg-amber-700/40 border border-amber-500 rounded-lg p-4">
              <p className="text-3xl font-bold text-amber-300">{formatNumber(era1880_1909)}</p>
              <p className="text-amber-200 text-sm">1880-1909</p>
            </div>
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
              <p className="text-3xl font-bold text-slate-300">{formatNumber(era1910Plus)}</p>
              <p className="text-slate-400 text-sm">1910 & Later</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Interactive Map */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Covered Bridge Locations</h2>
            <p className="text-sm text-slate-500">
              Click markers for bridge details. Most covered bridges are in the Northeast & Midwest.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <CoveredBridgesMapWrapper bridges={data.bridges} height={500} />
          </div>
        </section>

        {/* Timeline of Oldest Bridges */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Oldest Covered Bridges</h2>
            <p className="text-slate-500 text-sm mb-6">
              The oldest covered bridges in America date back to the early 1800s
            </p>
            <CoveredBridgesTimeline bridges={data.bridges} count={10} />
          </div>
        </section>

        {/* States Grid */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Covered Bridges by State</h2>
            <p className="text-slate-600 mb-6">
              Pennsylvania and Ohio lead the nation with the most covered bridges. Many states in
              the Northeast and Midwest have preserved these historic structures.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {data.byState.map((item) => (
                <Link
                  key={item.state}
                  href={`/covered-bridges/${item.state.toLowerCase()}`}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-4 hover:border-amber-400 hover:shadow-sm transition-all"
                >
                  <div className="font-semibold text-slate-900">{item.stateName}</div>
                  <div className="text-sm text-amber-700 font-medium">
                    {formatNumber(item.count)} {item.count === 1 ? 'bridge' : 'bridges'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Full Table of Oldest Bridges */}
        <section className="mb-12">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Top 20 Oldest Covered Bridges
              </h2>
              <p className="text-slate-600">
                Pre-Civil War structures still standing today, preserving centuries of American history.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700" colSpan={6}>
                      Bridge Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {oldestBridges.map((bridge, index) => {
                    const age = bridge.yearBuilt ? CURRENT_YEAR - bridge.yearBuilt : null;
                    const description = getCoveredBridgeDescription(bridge);
                    return (
                      <tr key={bridge.structureNumber} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-500 font-mono align-top">#{index + 1}</td>
                        <td className="px-4 py-3" colSpan={6}>
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <Link
                                href={`/bridge/${bridge.state.toLowerCase()}/${encodeURIComponent(bridge.structureNumber)}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {bridge.facilityCarried || 'Unknown Road'}
                              </Link>
                              <span className="text-xs text-slate-500">
                                over {bridge.featuresIntersected || 'Unknown'}
                              </span>
                              <span className="text-sm text-slate-600">
                                {bridge.countyName && `${bridge.countyName}, `}
                                {bridge.stateName}
                              </span>
                              <span className="text-sm font-semibold text-amber-700">
                                {bridge.yearBuilt || '—'}
                              </span>
                              <span className="text-sm text-slate-600">
                                {age ? `${age} years` : '—'}
                              </span>
                              <ConditionBadge condition={bridge.conditionCategory as ConditionCategory | null} />
                              {bridge.historical === '1' ? (
                                <span className="text-sm text-amber-600 font-medium">NRHP Listed</span>
                              ) : bridge.historical === '2' ? (
                                <span className="text-sm text-amber-500">NRHP Eligible</span>
                              ) : null}
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {description}
                            </p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="mb-12">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-3">About Covered Bridges</h2>
            <div className="prose prose-slate max-w-none text-sm">
              <p>
                Covered bridges are wooden bridges with a roof and enclosed sides. The covering
                protects the wooden structural components from weather, significantly extending
                the bridge&apos;s lifespan from 10-15 years for an exposed wooden bridge to
                80 years or more for a well-maintained covered structure. Most covered bridges
                use truss designs, with the roof and siding protecting the structural timbers
                from rain, snow, and direct sunlight that would otherwise cause rapid deterioration.
              </p>
              <p>
                The golden age of covered bridge construction was the 19th century, when thousands
                were built across America to support the growing transportation network. Covered
                bridges served the turnpike roads, canal towpaths, and early rail lines that
                connected expanding communities. Local carpenters and timber framers developed
                regional building traditions, resulting in distinctive truss designs that varied
                by state and era. The Town lattice truss, Burr arch truss, and Howe truss were
                among the most popular configurations.
              </p>
              <p>
                Today, approximately 800-900 covered bridges remain nationwide, with over 300 tracked
                in the National Bridge Inventory as public highway bridges. They are primarily concentrated
                in Pennsylvania, Ohio, Indiana, Oregon, and Vermont. Many are listed on the National
                Register of Historic Places and maintained as local landmarks and tourist attractions.
                Covered bridge festivals draw thousands of visitors annually to regions like
                Parke County, Indiana (the &quot;Covered Bridge Capital of the World&quot;) and
                Madison County, Iowa (made famous by the novel and film). Several states have
                active preservation societies that maintain historic covered bridges and occasionally
                construct new ones using traditional techniques.
              </p>
              <p>
                <strong>How we identify covered bridges:</strong> We classify a bridge as
                &quot;covered&quot; if it uses wood/timber material (NBI code 7) and has a
                truss design (deck truss or through truss, NBI codes 09-10). This methodology
                captures the traditional covered bridge design while excluding modern timber
                structures with different configurations. Some covered bridges may be miscoded
                in the National Bridge Inventory or may have been rebuilt with steel trusses
                while retaining their historic appearance.
              </p>
            </div>
          </div>
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
                All types, oldest first
              </p>
            </Link>

            <Link
              href="/historic-bridges"
              className="group bg-violet-50 hover:bg-violet-100 rounded-xl p-5 border border-violet-200 hover:border-violet-300 transition-all"
            >
              <div className="w-10 h-10 bg-violet-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-violet-300 transition-colors">
                <svg className="w-5 h-5 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-violet-700 transition-colors">
                Historic Bridges
              </h3>
              <p className="text-sm text-slate-500">
                National Register listings
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
