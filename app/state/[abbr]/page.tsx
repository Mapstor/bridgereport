import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { getState, getNational, getCountyName, formatNumber, formatPct } from '@/lib/data';
import RatingBadge from '@/components/RatingBadge';
import ConditionBar from '@/components/ConditionBar';
import SortableCountyTable from '@/components/SortableCountyTable';
import StateBridgeExplorer from '@/components/StateBridgeExplorer';
import type { Metadata } from 'next';
import type { StateSummary } from '@/types';

// Dynamic imports for charts
const RatingDistributionChart = dynamicImport(() => import('@/components/RatingDistributionChart'), {
  loading: () => <div className="h-[140px] bg-slate-50 rounded animate-pulse" />,
});

// ISR — state data refreshes annually with NBI release. 24h revalidate is plenty.
export const revalidate = 86400;

export async function generateStaticParams() {
  const { getAllStateAbbrs } = await import('@/lib/data');
  return getAllStateAbbrs().map((abbr) => ({ abbr: abbr.toLowerCase() }));
}

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ abbr: string }>;
}): Promise<Metadata> {
  const { abbr } = await params;
  const state = getState(abbr);

  if (!state) {
    return { title: 'State Not Found' };
  }

  const title = `${state.stateName} Bridges — ${formatNumber(state.total)} Bridges, ${formatPct(state.poorPct)} Poor`;
  const description = `${formatNumber(state.total)} highway bridges in ${state.stateName}. ${formatNumber(state.poor)} bridges (${formatPct(state.poorPct)}) in poor condition. County data, worst bridges, infrastructure profile.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.bridgereport.org/state/${abbr.toLowerCase()}`,
    },
    openGraph: {
      title: `${state.stateName} Bridges — Condition Report`,
      description,
      type: 'website',
      url: `https://www.bridgereport.org/state/${abbr.toLowerCase()}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${state.stateName} Bridge Conditions - BridgeReport.org`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${state.stateName} Bridges — Condition Report`,
      description,
      images: ['/og-image.png'],
    },
  };
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Combined JSON-LD with @graph for Article + Dataset + FAQ + BreadcrumbList
function StatePageJsonLd({ state, breadcrumbItems }: { state: StateSummary; breadcrumbItems: BreadcrumbItem[] }) {
  const avgAge = new Date().getFullYear() - state.avgYearBuilt;
  const stateUrl = `https://www.bridgereport.org/state/${state.state.toLowerCase()}`;

  const graphData = {
    '@context': 'https://schema.org',
    '@graph': [
      // Article schema — the state page carries 4 paragraphs of analytical prose
      // about the state's bridge infrastructure. Article entity makes that prose
      // citable as content (journalists, researchers, ranking aggregators).
      {
        '@type': 'Article',
        '@id': `${stateUrl}#article`,
        headline: `${state.stateName} Bridge Infrastructure Report`,
        description: `Analysis of ${formatNumber(state.total)} highway bridges in ${state.stateName}: ${formatPct(state.poorPct)} in poor condition, average age ${avgAge} years, ${formatNumber(state.totalDailyCrossings)} daily crossings.`,
        url: stateUrl,
        image: `${stateUrl}/opengraph-image`,
        about: { '@type': 'Place', name: state.stateName },
        author: { '@id': 'https://www.bridgereport.org/#organization' },
        publisher: { '@id': 'https://www.bridgereport.org/#organization' },
        isPartOf: { '@id': 'https://www.bridgereport.org/#website' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': stateUrl },
        dateModified: new Date().toISOString().split('T')[0],
        keywords: [
          `${state.stateName} bridges`,
          `${state.stateName} infrastructure`,
          `${state.stateName} bridge inspection`,
          'National Bridge Inventory',
          'structurally deficient',
        ],
      },
      // Dataset schema (Google Dataset rich-result eligible)
      {
        '@type': 'Dataset',
        name: `${state.stateName} Highway Bridge Inventory`,
        description: `Complete inventory of ${formatNumber(state.total)} highway bridges in ${state.stateName}, with condition ratings, year built, traffic, and structural deficiency status.`,
        url: `https://www.bridgereport.org/state/${state.state.toLowerCase()}`,
        license: 'https://www.usa.gov/government-works',
        creator: {
          '@type': 'GovernmentOrganization',
          name: 'Federal Highway Administration',
          url: 'https://www.fhwa.dot.gov/',
        },
        spatialCoverage: { '@type': 'Place', name: state.stateName },
        temporalCoverage: '2024',
        variableMeasured: [
          'Bridge condition ratings',
          'Structural deficiency status',
          'Average daily traffic',
          'Year built',
          'Construction materials',
          'Span length',
        ],
        distribution: {
          '@type': 'DataDownload',
          encodingFormat: 'text/html',
          contentUrl: `https://www.bridgereport.org/state/${state.state.toLowerCase()}`,
        },
        isBasedOn: {
          '@type': 'Dataset',
          name: 'National Bridge Inventory',
          url: 'https://www.fhwa.dot.gov/bridge/nbi.cfm',
        },
      },
      // FAQ schema
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How many bridges are in ${state.stateName}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${state.stateName} has ${formatNumber(state.total)} highway bridges across ${state.countyCount} counties. ${formatNumber(state.good)} (${formatPct(state.goodPct)}) are in good condition, ${formatNumber(state.fair)} (${formatPct(state.fairPct)}) fair, and ${formatNumber(state.poor)} (${formatPct(state.poorPct)}) poor.`,
            },
          },
          {
            '@type': 'Question',
            name: `What percentage of ${state.stateName} bridges are in poor condition?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${formatPct(state.poorPct)} of bridges in ${state.stateName} are rated poor (structurally deficient). That's ${formatNumber(state.poor)} bridges out of ${formatNumber(state.total)} total.`,
            },
          },
          {
            '@type': 'Question',
            name: 'How are bridge conditions rated?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Bridges are rated 0-9 on deck, superstructure, substructure, or culvert condition. Poor = 0-4, Fair = 5-6, Good = 7-9. Inspections occur every 24 months.',
            },
          },
          {
            '@type': 'Question',
            name: `What is the average age of bridges in ${state.stateName}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Average age is ${avgAge} years (built ~${state.avgYearBuilt}). Oldest: ${state.oldestYear}, newest: ${state.newestYear}.`,
            },
          },
        ],
      },
      // BreadcrumbList schema
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems
          .filter((item) => item.href)
          .map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            item: `https://www.bridgereport.org${item.href}`,
          })),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graphData) }} />;
}

export default async function StatePage({ params }: { params: Promise<{ abbr: string }> }) {
  const { abbr } = await params;
  const state = getState(abbr);
  const national = getNational();

  if (!state || !national) {
    notFound();
  }

  const avgAge = new Date().getFullYear() - state.avgYearBuilt;
  const nationalAvgAge = new Date().getFullYear() - national.avgYearBuilt;

  // Build county data with names for sortable table
  const countiesWithNames = state.topCounties.map((c) => ({
    fips: c.fips,
    name: getCountyName(state.state, c.fips) || `County ${c.fips}`,
    total: c.total,
    good: Math.round((c.total * state.goodPct) / 100), // estimate
    fair: Math.round((c.total * state.fairPct) / 100), // estimate
    poor: c.poor,
    poorPct: c.poorPct,
    avgAdt: c.avgAdt,
  }));

  // Verdict badge styling
  const verdictClass =
    state.poorPct < 5
      ? 'bg-green-50 border-green-200 text-green-700'
      : state.poorPct < 10
      ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
      : 'bg-red-50 border-red-200 text-red-700';
  const verdictDot = state.poorPct < 5 ? 'bg-green-500' : state.poorPct < 10 ? 'bg-yellow-500' : 'bg-red-500';

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'States', href: '/rankings' },
    { label: state.stateName },
  ];

  return (
    <>
      <StatePageJsonLd state={state} breadcrumbItems={breadcrumbItems} />

      {/* HEADER — Compact, data-dense */}
      <header className="border-b-[3px] border-slate-900 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          {/* Breadcrumb */}
          <div className="pt-2 text-xs text-slate-500">
            <Link href="/" className="text-blue-600 hover:underline">BridgeReport.org</Link>
            {' / '}
            <Link href="/rankings" className="text-blue-600 hover:underline">States</Link>
            {' / '}
            <span className="text-slate-900 font-semibold">{state.stateName}</span>
          </div>

          <div className="py-3">
            <div className="flex justify-between items-end gap-5 flex-wrap">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {state.stateName} Bridges
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {formatNumber(state.total)} highway bridges across {state.countyCount} counties · NBI 2024 data
                </p>
              </div>

              {/* Verdict badge */}
              <div className={`flex items-center gap-2.5 px-4 py-2 rounded-md border ${verdictClass}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${verdictDot}`} />
                <div>
                  <div className="text-sm font-bold">{formatPct(state.poorPct)} in poor condition</div>
                  <div className="text-[11px] text-slate-500">
                    National avg: {formatPct(national.poorPct)}
                  </div>
                </div>
              </div>
            </div>

            {/* Condition bar */}
            <div className="mt-3">
              <ConditionBar good={state.good} fair={state.fair} poor={state.poor} total={state.total} />
              <div className="flex justify-between mt-1 text-xs text-slate-500">
                <span><span className="text-green-600 font-bold">●</span> Good: {formatNumber(state.good)} ({formatPct(state.goodPct)})</span>
                <span><span className="text-yellow-600 font-bold">●</span> Fair: {formatNumber(state.fair)} ({formatPct(state.fairPct)})</span>
                <span><span className="text-red-600 font-bold">●</span> Poor: {formatNumber(state.poor)} ({formatPct(state.poorPct)})</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5">

        {/* ABOUT THIS STATE'S INFRASTRUCTURE */}
        <section className="mt-7">
          <h2 className="text-lg font-bold text-slate-900 mb-3">About {state.stateName}&apos;s Bridge Infrastructure</h2>
          <div className="text-sm text-slate-600 space-y-3">
            <p>
              {state.stateName} maintains {formatNumber(state.total)} highway bridges across {state.countyCount} counties,
              forming critical links in the state&apos;s transportation network. With an average construction year of {state.avgYearBuilt},
              the typical bridge in {state.stateName} is approximately {avgAge} years old—{avgAge > nationalAvgAge
                ? `${avgAge - nationalAvgAge} years older than the national average of ${nationalAvgAge} years`
                : avgAge < nationalAvgAge
                ? `${nationalAvgAge - avgAge} years newer than the national average of ${nationalAvgAge} years`
                : 'matching the national average'}.
              {state.oldestYear < 1920 && ` The state&apos;s oldest bridge dates back to ${state.oldestYear}, representing over a century of service and offering a window into historic bridge engineering practices.`}
              {state.newestYear >= new Date().getFullYear() - 1 && ` New construction continues, with bridges completed as recently as ${state.newestYear}.`}
            </p>
            <p>
              Currently, {formatPct(state.poorPct)} of {state.stateName}&apos;s bridges are rated in poor condition,
              {state.poorPct < national.poorPct
                ? ` better than the national average of ${formatPct(national.poorPct)}. This indicates relatively strong investment in bridge maintenance and replacement programs.`
                : state.poorPct > national.poorPct
                ? ` exceeding the national average of ${formatPct(national.poorPct)}. This highlights infrastructure challenges that transportation agencies are working to address through maintenance, rehabilitation, and replacement programs.`
                : ` matching the national average of ${formatPct(national.poorPct)}.`}
              {' '}A &quot;poor&quot; condition rating indicates significant deterioration requiring attention, though these bridges remain safe for travel at their posted limits.
              Federal regulations require bridge inspections at least every 24 months to ensure public safety.
            </p>
            <p>
              Bridge conditions in {state.stateName} reflect decades of infrastructure investment decisions shaped by geography, climate, traffic demands, and available funding.
              {state.avgAdt > national.avgAdt
                ? ` Bridges here carry ${formatNumber(state.avgAdt)} vehicles daily on average—${Math.round((state.avgAdt / national.avgAdt - 1) * 100)}% higher than the national average—placing greater demands on structural maintenance.`
                : ` Average daily traffic of ${formatNumber(state.avgAdt)} vehicles per bridge is below the national average, which can reduce wear but still requires consistent maintenance investment.`}
              {' '}The state&apos;s {formatNumber(state.totalDailyCrossings)} total daily bridge crossings underscore how essential this infrastructure is to daily commerce and commuting.
            </p>
            <p>
              The material composition of {state.stateName}&apos;s bridge inventory reflects regional construction practices and evolving engineering standards.
              {Object.entries(state.materials).sort(([, a], [, b]) => b - a)[0] && (
                <> The predominant construction material is {Object.entries(state.materials).sort(([, a], [, b]) => b - a)[0][0].toLowerCase()},
                accounting for {formatPct((Object.entries(state.materials).sort(([, a], [, b]) => b - a)[0][1] / state.total) * 100)} of all structures.
                Material choice affects maintenance requirements, expected lifespan, and vulnerability to environmental factors specific to the region.</>
              )}
              {' '}Understanding these patterns helps transportation planners allocate resources effectively and prioritize infrastructure investments.
            </p>
          </div>
        </section>

        {/* WORST BRIDGES — First real content */}
        {state.worstBridges.length > 0 && (
          <section className="mt-7">
            <div className="flex justify-between items-baseline">
              <h2 className="text-lg font-bold text-slate-900">Worst-Rated Bridges</h2>
              <Link href={`/worst-bridges/${state.state.toLowerCase()}`} className="text-sm text-blue-600 hover:underline">
                View all {state.poor} poor-condition bridges →
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-1 mb-3">
              {state.poor} of {formatNumber(state.total)} {state.stateName} bridges have a rating of 4 or below. Rating 4 = advanced deterioration.
            </p>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">#</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">Bridge</th>
                      <th className="px-3 py-2 text-center text-[11px] font-semibold text-slate-500 uppercase">Rating</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">Location</th>
                      <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500 uppercase">Built</th>
                      <th className="px-3 py-2 text-right text-[11px] font-semibold text-slate-500 uppercase">Daily Traffic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.worstBridges.slice(0, 10).map((b, i) => {
                      const countyName = getCountyName(state.state, b.countyFips);
                      const rowBg = (b.lowestRating ?? 5) <= 3 ? 'bg-red-50' : '';
                      const rating = b.lowestRating ?? 0;
                      const age = b.yearBuilt ? new Date().getFullYear() - b.yearBuilt : null;

                      // Generate contextual description
                      let description = '';
                      if (rating <= 2) {
                        description = `Critical condition requiring immediate attention. `;
                      } else if (rating === 3) {
                        description = `Serious deterioration affecting structural elements. `;
                      } else if (rating === 4) {
                        description = `Advanced section loss and deterioration present. `;
                      }

                      if (age && age > 80) {
                        description += `At ${age} years old, this is among ${state.stateName}'s oldest structures. `;
                      } else if (age && age > 50) {
                        description += `Built ${age} years ago, approaching the end of typical service life. `;
                      }

                      if (b.adt && b.adt > 50000) {
                        description += `Carries heavy traffic volume of ${formatNumber(b.adt)} vehicles daily.`;
                      } else if (b.adt && b.adt > 10000) {
                        description += `Serves ${formatNumber(b.adt)} vehicles per day.`;
                      } else if (b.adt && b.adt < 100) {
                        description += `Low-traffic rural crossing.`;
                      }

                      return (
                        <tr key={b.id} className={rowBg}>
                          <td className="px-3 py-2.5 text-slate-400 font-semibold">{i + 1}</td>
                          <td className="px-3 py-2.5">
                            <Link href={`/bridge/${state.state.toLowerCase()}/${b.id}`} className="font-semibold text-slate-900 hover:text-blue-600">
                              {b.facilityCarried}
                            </Link>
                            <div className="text-[11px] text-slate-400">over {b.featuresIntersected}</div>
                            {description && (
                              <div className="text-[11px] text-slate-500 mt-1 leading-tight max-w-md">{description.trim()}</div>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <RatingBadge rating={b.lowestRating ?? 0} size="sm" />
                          </td>
                          <td className="px-3 py-2.5 text-xs text-slate-500">
                            {countyName ? `${countyName} Co.` : ''} · {b.location}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs">{b.yearBuilt ?? '—'}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs">{b.adt ? formatNumber(b.adt) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* COUNTIES — Sortable, compact */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Bridges by County</h2>
          <p className="text-sm text-slate-500 mb-3">
            {countiesWithNames.length > 0 && (
              <>
                {countiesWithNames[0].name} holds {Math.round((countiesWithNames[0].total / state.total) * 100)}% of {state.stateName}&apos;s bridges.
                {' '}
                {countiesWithNames.reduce((worst, c) => c.poorPct > worst.poorPct ? c : worst).name} has the highest deficiency rate.
              </>
            )}
          </p>
          <SortableCountyTable
            counties={countiesWithNames}
            stateAbbr={state.state}
            showDescriptions={true}
            stateName={state.stateName}
            stateAvgPoorPct={state.poorPct}
          />
        </section>

        {/* BRIDGE EXPLORER — Map, Search, Full List */}
        <section className="mt-8">
          <StateBridgeExplorer stateAbbr={state.state} stateName={state.stateName} />
        </section>

        {/* INFRASTRUCTURE PROFILE — Tight grid */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Infrastructure Profile</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Key metrics */}
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase mb-2">Key Metrics</div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Average bridge age', `${avgAge} years`],
                    ['Average year built', state.avgYearBuilt],
                    ['Oldest bridge', state.oldestYear],
                    ['Newest bridge', state.newestYear],
                    ['Avg daily traffic/bridge', formatNumber(state.avgAdt)],
                    ['Total daily crossings', `${(state.totalDailyCrossings / 1e6).toFixed(1)}M`],
                  ].map(([label, val]) => (
                    <tr key={String(label)}>
                      <td className="py-1.5 text-slate-500">{label}</td>
                      <td className="py-1.5 text-right font-semibold font-mono">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rating distribution */}
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase mb-2">Rating Distribution (0–9 scale)</div>
              <RatingDistributionChart distribution={state.ratingDistribution} height={140} />
              <div className="text-[10px] text-slate-400 mt-1">0–4 = Poor · 5–6 = Fair · 7–9 = Good</div>
            </div>
          </div>

          {/* Materials */}
          <div className="border border-slate-200 rounded-lg p-4 mt-4">
            <div className="text-[11px] font-semibold text-slate-500 uppercase mb-2">Construction Materials</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(state.materials)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([mat, count]) => (
                  <div key={mat} className="px-3 py-1.5 bg-slate-50 rounded border border-slate-200 text-sm">
                    <span className="font-semibold">{mat}</span>
                    <span className="text-slate-500 ml-1.5">{formatNumber(count)}</span>
                    <span className="text-slate-400 ml-1 text-xs">({((count / state.total) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* STATE vs NATIONAL — Compact grid */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3">{state.stateName} vs. National Average</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Poor Condition',
                state: formatPct(state.poorPct),
                natl: formatPct(national.poorPct),
                better: state.poorPct < national.poorPct,
              },
              {
                label: 'Good Condition',
                state: formatPct(state.goodPct),
                natl: formatPct(national.goodPct),
                better: state.goodPct > national.goodPct,
              },
              {
                label: 'Average Age',
                state: `${avgAge} yr`,
                natl: `${nationalAvgAge} yr`,
                better: avgAge < nationalAvgAge,
              },
              {
                label: 'Avg Daily Traffic',
                state: formatNumber(state.avgAdt),
                natl: formatNumber(national.avgAdt),
                better: true,
              },
            ].map((item) => (
              <div key={item.label} className="border border-slate-200 rounded-lg p-3">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">{item.label}</div>
                <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">{item.state}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  National: {item.natl}
                  <span className={`font-semibold ml-1 ${item.better ? 'text-green-600' : 'text-red-600'}`}>
                    {item.better ? '✓ Better' : '✗ Worse'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DATA SOURCE */}
        <section className="mt-8 pb-10">
          <div className="border-t border-slate-200 pt-4 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-500">Data Source:</strong>{' '}
            <a href="https://www.fhwa.dot.gov/bridge/nbi/ascii2024.cfm" className="text-blue-600 hover:underline">
              Federal Highway Administration, National Bridge Inventory 2024
            </a>.
            Bridge conditions rated 0–9 per{' '}
            <a href="https://www.fhwa.dot.gov/bridge/mtguide.cfm" className="text-blue-600 hover:underline">
              FHWA Recording and Coding Guide
            </a>.
            &quot;Poor&quot; = rating ≤ 4 on deck, superstructure, substructure, or culvert.
            <br />
            Inspections typically occur every 24 months. Structurally deficient does not mean unsafe.
          </div>
        </section>
      </div>
    </>
  );
}
