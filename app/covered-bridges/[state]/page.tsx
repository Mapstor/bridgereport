import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getCoveredBridgesForState,
  getStateName,
  getAllStateAbbrs,
  formatNumber,
} from '@/lib/data';
import type { ConditionCategory } from '@/types';
import ConditionBadge from '@/components/ConditionBadge';
import Breadcrumbs, { BreadcrumbJsonLd } from '@/components/Breadcrumbs';
import DataSourceFooter from '@/components/DataSourceFooter';
import BridgeMap from '@/components/BridgeMap';
import type { Metadata } from 'next';

// Use dynamic rendering
export const dynamic = 'force-dynamic';

// Generate metadata dynamically
export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const stateAbbr = state.toUpperCase();
  const stateName = getStateName(stateAbbr);

  if (!stateName) {
    return {
      title: 'State Not Found',
    };
  }

  const bridges = getCoveredBridgesForState(stateAbbr);
  const count = bridges.length;

  if (count === 0) {
    return {
      title: `No Covered Bridges in ${stateName}`,
      description: `${stateName} does not have any covered bridges in the National Bridge Inventory database.`,
    };
  }

  return {
    title: `Covered Bridges in ${stateName} — ${count} Historic Wooden Bridges | BridgeReport.org`,
    description: `Explore ${count} covered bridges in ${stateName}. See locations, conditions, year built, and historic status of these iconic wooden structures.`,
    alternates: {
      canonical: `https://www.bridgereport.org/covered-bridges/${state.toLowerCase()}`,
    },
    openGraph: {
      title: `Covered Bridges in ${stateName}`,
      description: `Explore ${count} covered bridges in ${stateName} with condition ratings and locations.`,
      type: 'website',
      url: `https://www.bridgereport.org/covered-bridges/${state.toLowerCase()}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `Covered Bridges in ${stateName} - BridgeReport.org`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Covered Bridges in ${stateName}`,
      description: `Explore ${count} covered bridges in ${stateName} with condition ratings and locations.`,
      images: ['/og-image.png'],
    },
  };
}

// JSON-LD
function StateJsonLd({
  stateName,
  count,
}: {
  stateName: string;
  count: number;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Covered Bridges in ${stateName}`,
    description: `A list of ${count} covered bridges in ${stateName}`,
    numberOfItems: count,
    itemListElement: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function StateCoveredBridgesPage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const stateAbbr = state.toUpperCase();
  const stateName = getStateName(stateAbbr);

  // Validate state
  const allStates = getAllStateAbbrs();
  if (!allStates.includes(stateAbbr) || !stateName) {
    notFound();
  }

  const bridges = getCoveredBridgesForState(stateAbbr);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Covered Bridges', href: '/covered-bridges' },
    { label: stateName },
  ];

  // Prepare bridges for map (convert to BridgeSlim format)
  const bridgesForMap = bridges
    .filter((b) => b.lat && b.lon)
    .map((b) => ({
      id: b.id,
      structureNumber: b.structureNumber,
      facilityCarried: b.facilityCarried || '',
      featuresIntersected: b.featuresIntersected || '',
      location: b.location || '',
      yearBuilt: b.yearBuilt,
      lowestRating: b.lowestRating,
      conditionCategory: b.conditionCategory as ConditionCategory | null,
      adt: null,
      lengthFt: b.lengthFt,
      lat: b.lat,
      lon: b.lon,
    }));

  // Stats
  const onHistoricRegister = bridges.filter((b) => b.historical === '1').length;
  const goodCondition = bridges.filter((b) => b.conditionCategory === 'good').length;
  const fairCondition = bridges.filter((b) => b.conditionCategory === 'fair').length;
  const poorCondition = bridges.filter((b) => b.conditionCategory === 'poor').length;
  const oldestBridge = bridges[0]; // Already sorted by year

  // No covered bridges case
  if (bridges.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BreadcrumbJsonLd items={breadcrumbs} />
        <Breadcrumbs items={breadcrumbs} />

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          No Covered Bridges in {stateName}
        </h1>
        <p className="text-slate-600 mb-8">
          {stateName} does not have any covered bridges in the National Bridge Inventory
          database. Covered bridges are primarily found in the northeastern and midwestern
          states.
        </p>

        <Link
          href="/covered-bridges"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          ← View all covered bridges by state
        </Link>

        <DataSourceFooter />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <StateJsonLd stateName={stateName} count={bridges.length} />

      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Covered Bridges in {stateName}
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          {stateName} has <strong>{formatNumber(bridges.length)}</strong> covered{' '}
          {bridges.length === 1 ? 'bridge' : 'bridges'} in the National Bridge Inventory.
          {oldestBridge?.yearBuilt && (
            <> The oldest dates back to <strong>{oldestBridge.yearBuilt}</strong>.</>
          )}
          {onHistoricRegister > 0 && (
            <> {onHistoricRegister} {onHistoricRegister === 1 ? 'is' : 'are'} listed on the
            National Register of Historic Places.</>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{formatNumber(bridges.length)}</div>
          <div className="text-sm text-slate-500">Covered Bridges</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{formatNumber(goodCondition)}</div>
          <div className="text-sm text-slate-500">Good Condition</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{formatNumber(fairCondition)}</div>
          <div className="text-sm text-slate-500">Fair Condition</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{formatNumber(poorCondition)}</div>
          <div className="text-sm text-slate-500">Poor Condition</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{formatNumber(onHistoricRegister)}</div>
          <div className="text-sm text-slate-500">On NRHP</div>
        </div>
      </div>

      {/* About Section */}
      <section className="mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-3">
            About Covered Bridges in {stateName}
          </h2>
          <div className="prose prose-slate max-w-none text-sm">
            <p className="text-slate-600 leading-relaxed mb-3">
              Covered bridges represent a uniquely American innovation in wooden bridge construction.
              By enclosing the structural timber within protective roofs and siding, builders extended
              bridge lifespans from roughly 10-15 years to 80 years or more. The oldest surviving
              covered bridges date to the early 1800s, when communities built them to connect
              settlements across rivers and streams throughout the developing nation.
            </p>
            <p className="text-slate-600 leading-relaxed mb-3">
              {stateName}&apos;s covered bridges showcase regional construction traditions that varied by
              available timber species, local carpentry skills, and preferred truss designs. Common
              truss types include the Town lattice (using many light wooden members in a diagonal
              lattice pattern), the Burr arch-truss (combining an arch with a truss for added strength),
              and the Howe truss (using vertical iron rods as tension members). Many covered bridges
              also served social functions — their shelter from weather made them popular gathering
              places, leading to nicknames like &ldquo;kissing bridges&rdquo; or &ldquo;wishing bridges.&rdquo;
            </p>
            <p className="text-slate-600 leading-relaxed">
              Today, covered bridges attract tourists and photographers while serving as important
              connections for rural communities. Those listed on the National Register of Historic
              Places (NRHP) receive special protections and may qualify for preservation funding.
              Maintaining these structures requires specialized craftsmanship to repair or replace
              deteriorated timber while preserving historical authenticity. Many communities actively
              work to preserve their covered bridges as landmarks of local heritage and engineering history.
            </p>
          </div>
        </div>
      </section>

      {/* Map */}
      {bridgesForMap.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Covered Bridge Locations in {stateName}
          </h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <BridgeMap bridges={bridgesForMap} state={stateAbbr} height={400} />
          </div>
        </section>
      )}

      {/* Bridge Table */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          All Covered Bridges in {stateName}
        </h2>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Bridge
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    County
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Year Built
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Length (ft)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Condition
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Historic Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bridges.map((bridge) => (
                  <tr key={bridge.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/bridge/${bridge.state.toLowerCase()}/${encodeURIComponent(bridge.structureNumber)}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {bridge.facilityCarried || 'Unknown Road'}
                      </Link>
                      <div className="text-xs text-slate-500">
                        over {bridge.featuresIntersected || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {bridge.countyName || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {bridge.yearBuilt || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {bridge.lengthFt ? formatNumber(Math.round(bridge.lengthFt)) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ConditionBadge condition={bridge.conditionCategory as ConditionCategory | null} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {bridge.historical === '1' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          NRHP Listed
                        </span>
                      ) : bridge.historical === '2' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                          NRHP Eligible
                        </span>
                      ) : bridge.historical === '3' ? (
                        <span className="text-slate-500 text-xs">Possibly Eligible</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Explore More</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/state/${stateAbbr.toLowerCase()}`}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            All {stateName} Bridges
          </Link>
          <Link
            href={`/worst-bridges/${stateAbbr.toLowerCase()}`}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Worst Bridges in {stateName}
          </Link>
          <Link
            href="/covered-bridges"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            All Covered Bridges
          </Link>
          <Link
            href="/historic-bridges"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Historic Bridges
          </Link>
        </div>
      </section>

      <DataSourceFooter />
    </div>
  );
}
