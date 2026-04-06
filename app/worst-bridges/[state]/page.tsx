import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getState, getAllStateAbbrs, formatNumber, formatPct } from '@/lib/data';
import { getPoorPctColorClass } from '@/components/ConditionBadge';
import ConditionBadge from '@/components/ConditionBadge';
import Breadcrumbs, { BreadcrumbJsonLd } from '@/components/Breadcrumbs';
import DataSourceFooter from '@/components/DataSourceFooter';
import type { Metadata } from 'next';

// Generate static params for all states
export async function generateStaticParams() {
  const states = getAllStateAbbrs();
  return states.map((state) => ({
    state: state.toLowerCase(),
  }));
}

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const stateData = getState(state);

  if (!stateData) {
    return {
      title: 'State Not Found',
    };
  }

  const title = `Worst Bridges in ${stateData.stateName} — Lowest Rated Bridges`;
  const description = `View the bridges with the lowest condition ratings in ${stateData.stateName}. ${formatNumber(stateData.poor)} bridges (${formatPct(stateData.poorPct)}) are in poor condition.`;

  return {
    title: `${title} | BridgeReport.org`,
    description,
    alternates: {
      canonical: `https://bridgereport.org/worst-bridges/${state.toLowerCase()}`,
    },
    openGraph: {
      title: `Worst Bridges in ${stateData.stateName}`,
      description,
      type: 'website',
      url: `https://bridgereport.org/worst-bridges/${state.toLowerCase()}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `Worst Bridges in ${stateData.stateName} - BridgeReport.org`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Worst Bridges in ${stateData.stateName}`,
      description,
      images: ['/og-image.png'],
    },
  };
}

function ListJsonLd({ stateName, count }: { stateName: string; count: number }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Worst Bridges in ${stateName}`,
    description: `Top ${count} bridges with the lowest condition ratings in ${stateName}`,
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

export default async function WorstBridgesStatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const stateData = getState(state);

  if (!stateData) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: stateData.stateName, href: `/state/${state.toLowerCase()}` },
    { label: 'Worst Bridges' },
  ];

  const worstBridges = stateData.worstBridges || [];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ListJsonLd stateName={stateData.stateName} count={worstBridges.length} />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl font-bold mb-4">
            Worst Bridges in {stateData.stateName}
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            Bridges with the lowest condition ratings in {stateData.stateName}.
            {' '}{stateData.stateName} has {formatNumber(stateData.poor)} bridges in poor condition
            ({formatPct(stateData.poorPct)} of {formatNumber(stateData.total)} total bridges).
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-3xl font-bold">{formatNumber(stateData.total)}</p>
              <p className="text-slate-400 text-sm">Total Bridges</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className={`text-3xl font-bold ${getPoorPctColorClass(stateData.poorPct)}`}>
                {formatPct(stateData.poorPct)}
              </p>
              <p className="text-slate-400 text-sm">In Poor Condition</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-3xl font-bold text-red-400">{formatNumber(stateData.poor)}</p>
              <p className="text-slate-400 text-sm">Poor Bridges</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-3xl font-bold">{worstBridges.length}</p>
              <p className="text-slate-400 text-sm">Listed Below</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Understanding Bridge Conditions in {stateData.stateName}
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-4">
              {stateData.stateName}&apos;s bridge infrastructure reflects decades of construction, maintenance,
              and replacement decisions influenced by geography, climate, traffic patterns, and available
              funding. With {formatNumber(stateData.poor)} bridges currently rated in poor condition
              ({formatPct(stateData.poorPct)} of the total inventory), understanding what these ratings mean
              helps residents and policymakers make informed decisions about infrastructure investment.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Federal inspectors evaluate three key components on every highway bridge: the deck (the
              driving surface and its immediate supports), the superstructure (beams, girders, trusses,
              or other primary load-carrying members), and the substructure (piers, abutments, and
              foundations that transfer loads to the ground). Each component receives a rating from
              0 to 9, with the lowest of these three ratings determining the overall condition
              category. A rating of 4 or below classifies a bridge as &ldquo;poor,&rdquo; indicating
              significant structural deterioration that warrants prioritized attention.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Poor-rated bridges remain safe for use at their posted limits because federal law requires
              that any bridge with load-carrying deficiencies be either repaired, posted with weight
              restrictions, or closed. Many poor-rated bridges receive more frequent inspections than
              the standard 24-month cycle, allowing engineers to monitor deterioration rates and ensure
              conditions have not worsened beyond safe operating limits. Weight restrictions protect
              the structure while allowing continued service until rehabilitation or replacement can
              be funded and constructed.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Infrastructure investment decisions involve difficult trade-offs between maintaining aging
              structures and building new capacity. Bridges listed below represent the most deteriorated
              structures in {stateData.stateName}&apos;s inventory, where rehabilitation or replacement
              investment would have the greatest impact on improving overall infrastructure condition.
              Understanding where these bridges are located helps communities advocate for appropriate
              funding and plan alternative routes when load restrictions affect commercial traffic.
            </p>
          </div>
        </section>

        {/* Ratings Reference */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Condition Rating Scale</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-3">
              <span className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center font-bold shrink-0">0-2</span>
              <div>
                <p className="font-semibold text-slate-900">Failed to Critical</p>
                <p className="text-slate-600">Closed or severely restricted. Major deterioration requiring immediate action.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-8 h-8 bg-orange-500 text-white rounded flex items-center justify-center font-bold shrink-0">3-4</span>
              <div>
                <p className="font-semibold text-slate-900">Serious to Poor</p>
                <p className="text-slate-600">Significant deterioration affecting capacity. Often weight-restricted.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-8 h-8 bg-yellow-500 text-white rounded flex items-center justify-center font-bold shrink-0">5-6</span>
              <div>
                <p className="font-semibold text-slate-900">Fair</p>
                <p className="text-slate-600">Minor deterioration visible. Maintenance recommended but not urgent.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-8 h-8 bg-green-600 text-white rounded flex items-center justify-center font-bold shrink-0">7-9</span>
              <div>
                <p className="font-semibold text-slate-900">Good to Excellent</p>
                <p className="text-slate-600">Components in sound condition with no significant deficiencies.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Worst Bridges Table */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Lowest Rated Bridges in {stateData.stateName}
          </h2>

          {worstBridges.length === 0 ? (
            <p className="text-slate-600">
              No bridges with poor condition ratings found in {stateData.stateName}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-3 px-4 text-left font-medium text-slate-600 w-16">Rank</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-600">Bridge</th>
                    <th className="py-3 px-4 text-right font-medium text-slate-600">Rating</th>
                    <th className="py-3 px-4 text-right font-medium text-slate-600">Year Built</th>
                    <th className="py-3 px-4 text-center font-medium text-slate-600">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {worstBridges.map((bridge, idx) => {
                    const bridgeSlug = bridge.id;
                    const bridgeName = bridge.facilityCarried || 'Unknown Road';
                    const over = bridge.featuresIntersected || 'Unknown';

                    return (
                      <tr key={bridge.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-500">#{idx + 1}</td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/bridge/${state.toLowerCase()}/${bridgeSlug}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {bridgeName}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">over {over}</p>
                          <p className="text-xs text-slate-400">{bridge.location}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-red-600">
                            {bridge.lowestRating ?? '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          {bridge.yearBuilt || '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <ConditionBadge condition={bridge.conditionCategory} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Internal Links */}
        <section className="bg-slate-50 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Explore More</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href={`/state/${state.toLowerCase()}`}
              className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-slate-900">All {stateData.stateName} Bridges</p>
              <p className="text-sm text-slate-500">
                View complete state bridge data and statistics
              </p>
            </Link>
            <Link
              href="/longest-bridges"
              className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-slate-900">Longest Bridges</p>
              <p className="text-sm text-slate-500">
                Top 500 longest bridges nationwide
              </p>
            </Link>
            <Link
              href="/"
              className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-slate-900">National Overview</p>
              <p className="text-sm text-slate-500">
                Compare all states and explore US bridge data
              </p>
            </Link>
          </div>
        </section>

        <DataSourceFooter />
      </div>
    </>
  );
}
