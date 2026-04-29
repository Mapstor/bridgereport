import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import {
  getCityBySlug,
  getCityName,
  getCityFipsBySlug,
  getNational,
  getState,
  cityNameToSlug,
  formatNumber,
  formatPct,
} from '@/lib/data';
import { getPoorPctColorClass } from '@/components/ConditionBadge';
import Breadcrumbs, { BreadcrumbJsonLd } from '@/components/Breadcrumbs';
import DataSourceFooter from '@/components/DataSourceFooter';
import type { Metadata } from 'next';
import type { CitySummary } from '@/types';

// Dynamic imports for charts (client components)
const ConditionPieChart = dynamicImport(() => import('@/components/ConditionPieChart'), {
  loading: () => <ChartSkeleton height={300} />,
});

const CountyBridgeTable = dynamicImport(() => import('@/components/CountyBridgeTable'), {
  loading: () => <TableSkeleton />,
});

// ISR — city data refreshes with NBI release. 24h revalidate.
export const revalidate = 86400;

// Pre-render the top 500 cities by bridge count at build time. The remaining ~7,900
// long-tail cities stay ISR-on-demand (first hit triggers SSR + caches at the edge).
// This keeps build time bounded while ensuring the highest-traffic cities load instantly.
export async function generateStaticParams() {
  const { getAllCitySlugs, getCity } = await import('@/lib/data');
  const slugs = getAllCitySlugs();
  const enriched = slugs.map((s) => ({
    state: s.state,
    slug: s.slug,
    total: getCity(s.state.toUpperCase(), s.fips)?.total ?? 0,
  }));
  enriched.sort((a, b) => b.total - a.total);
  return enriched.slice(0, 500).map(({ state, slug }) => ({ state, slug }));
}

// Chart loading skeleton
function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center bg-slate-50 rounded-lg animate-pulse"
      style={{ height }}
    >
      <p className="text-slate-400">Loading chart...</p>
    </div>
  );
}

// Table loading skeleton
function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-10 bg-slate-100 rounded" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-50 rounded" />
      ))}
    </div>
  );
}

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; slug: string }>;
}): Promise<Metadata> {
  const { state, slug } = await params;
  const fips = getCityFipsBySlug(state, slug);

  if (!fips) {
    return {
      title: 'City Not Found',
    };
  }

  const cityName = getCityName(state, fips);
  const city = getCityBySlug(state, slug);

  if (!city || !cityName) {
    return {
      title: 'City Not Found',
    };
  }

  const title = `Bridges in ${cityName}, ${city.stateName} — ${formatNumber(city.total)} Bridges`;
  const description = `Explore ${formatNumber(city.total)} highway bridges in ${cityName}, ${city.stateName}. ${formatNumber(city.poor)} bridges (${formatPct(city.poorPct)}) are in poor condition. View all bridges and condition ratings.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.bridgereport.org/city/${state.toLowerCase()}/${slug}`,
    },
    // No openGraph.images / twitter.images — file convention opengraph-image.tsx
    // generates a per-city dynamic image which would otherwise be overridden.
    openGraph: {
      title: `Bridges in ${cityName}, ${city.stateName}`,
      description,
      type: 'website',
      url: `https://www.bridgereport.org/city/${state.toLowerCase()}/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Bridges in ${cityName}, ${city.stateName}`,
      description,
    },
  };
}

// JSON-LD structured data for city.
// Includes geo (centroid of city's bridge locations) and containedInPlace (parent state)
// for richer geographic queryability.
function PlaceJsonLd({ city, cityName }: { city: CitySummary; cityName: string }) {
  const bridgesWithCoords = city.bridges.filter((b) => b.lat != null && b.lon != null);
  const geo = bridgesWithCoords.length > 0
    ? {
        '@type': 'GeoCoordinates',
        latitude: bridgesWithCoords.reduce((s, b) => s + (b.lat as number), 0) / bridgesWithCoords.length,
        longitude: bridgesWithCoords.reduce((s, b) => s + (b.lon as number), 0) / bridgesWithCoords.length,
      }
    : undefined;

  const cityUrl = `https://www.bridgereport.org/city/${city.state.toLowerCase()}/${cityNameToSlug(cityName)}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: cityName,
    url: cityUrl,
    image: `${cityUrl}/opengraph-image`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: city.stateName,
      addressCountry: 'US',
    },
    ...(geo ? { geo } : {}),
    containedInPlace: {
      '@type': 'State',
      name: city.stateName,
      url: `https://www.bridgereport.org/state/${city.state.toLowerCase()}`,
    },
    description: `${cityName}, ${city.stateName} has ${formatNumber(city.total)} highway bridges. ${formatNumber(city.poor)} bridges (${formatPct(city.poorPct)}) are in poor condition.`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Comparison table row
function ComparisonRow({
  label,
  city,
  stateData,
  national,
  format = 'number',
}: {
  label: string;
  city: number | null;
  stateData: number | null;
  national: number | null;
  format?: 'number' | 'percent' | 'year';
}) {
  const formatValue = (val: number | null) => {
    if (val === null || val === undefined) return '—';
    if (format === 'percent') return formatPct(val);
    if (format === 'year') return Math.round(val).toString();
    return formatNumber(Math.round(val));
  };

  return (
    <tr className="border-b border-slate-100">
      <td className="py-3 text-slate-600">{label}</td>
      <td className="py-3 text-right font-medium">{formatValue(city)}</td>
      <td className="py-3 text-right text-slate-500">{formatValue(stateData)}</td>
      <td className="py-3 text-right text-slate-400">{formatValue(national)}</td>
    </tr>
  );
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ state: string; slug: string }>;
}) {
  const { state, slug } = await params;
  const fips = getCityFipsBySlug(state, slug);

  if (!fips) {
    notFound();
  }

  const city = getCityBySlug(state, slug);
  const cityName = getCityName(state, fips);

  if (!city || !cityName) {
    notFound();
  }

  const national = getNational();
  const stateData = getState(state);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: city.stateName, href: `/state/${state.toLowerCase()}` },
    { label: cityName },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <PlaceJsonLd city={city} cityName={cityName} />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-4xl font-bold mb-4">
            Bridges in {cityName}, {city.stateName}
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            {cityName} has {formatNumber(city.total)} highway bridges. View condition
            ratings and explore all bridges in the city.
          </p>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-3xl font-bold">{formatNumber(city.total)}</p>
              <p className="text-slate-400 text-sm">Total Bridges</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className={`text-3xl font-bold ${getPoorPctColorClass(city.poorPct)}`}>
                {formatPct(city.poorPct)}
              </p>
              <p className="text-slate-400 text-sm">In Poor Condition</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-400">{formatNumber(city.good)}</p>
              <p className="text-slate-400 text-sm">Good Condition</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-3xl font-bold">{formatNumber(city.avgAdt)}</p>
              <p className="text-slate-400 text-sm">Avg Daily Traffic</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About This City's Bridge Infrastructure */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            About {cityName}&apos;s Bridge Infrastructure
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-4">
              {cityName}, {city.stateName} relies on {formatNumber(city.total)} highway bridges to keep
              traffic moving through the city. These structures handle an average of {formatNumber(city.avgAdt)} vehicles
              per day, {city.avgAdt > (stateData?.avgAdt ?? 0)
                ? `exceeding the statewide average of ${formatNumber(stateData?.avgAdt ?? 0)} daily vehicles`
                : `compared to the statewide average of ${formatNumber(stateData?.avgAdt ?? 0)} daily vehicles`}.
              This traffic volume reflects {cityName}&apos;s role as a {city.avgAdt > 20000 ? 'major urban center' : city.avgAdt > 5000 ? 'growing community' : 'local transportation hub'} in {city.stateName}.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              The average bridge in {cityName} was constructed in {city.avgYearBuilt}, making the typical structure
              approximately {new Date().getFullYear() - city.avgYearBuilt} years old. Bridge ages range from
              the oldest built in {city.oldestYear} to the newest completed in {city.newestYear}.
              {city.avgYearBuilt > (stateData?.avgYearBuilt ?? 1970)
                ? ` The city benefits from relatively newer infrastructure compared to the state average.`
                : ` Many structures are approaching or have exceeded their original design lifespan of 50 years.`}
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Bridge condition assessments show that {formatPct(city.poorPct)} of {cityName}&apos;s bridges
              are rated poor, while {formatPct(city.goodPct)} maintain good condition ratings.
              {city.poorPct < (national?.poorPct ?? 7.5)
                ? ` This is better than the national average of ${formatPct(national?.poorPct ?? 7.5)} poor condition bridges.`
                : ` This exceeds the national average of ${formatPct(national?.poorPct ?? 7.5)}, indicating potential infrastructure investment needs.`}
              Federal regulations require bridge inspections every 24 months to ensure public safety.
            </p>
            <p className="text-slate-600 leading-relaxed">
              The most common construction material for bridges in {cityName} is {Object.entries(city.materials).sort((a, b) => b[1] - a[1])[0]?.[0] || 'concrete'},
              representing {formatPct((Object.entries(city.materials).sort((a, b) => b[1] - a[1])[0]?.[1] ?? 0) / city.total * 100)} of
              all structures. Material type influences maintenance schedules, expected lifespan, and repair costs.
              Steel bridges typically require more frequent painting and corrosion protection, while concrete
              structures may need deck repairs and reinforcement over time.
            </p>
          </div>
        </section>

        {/* Comparison & Condition Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Condition Pie Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Condition Overview</h2>
            <ConditionPieChart
              good={city.good}
              fair={city.fair}
              poor={city.poor}
              height={300}
            />
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{city.good}</p>
                <p className="text-sm text-slate-500">Good ({formatPct(city.goodPct)})</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{city.fair}</p>
                <p className="text-sm text-slate-500">Fair ({formatPct(city.fairPct)})</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{city.poor}</p>
                <p className="text-sm text-slate-500">Poor ({formatPct(city.poorPct)})</p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              How {cityName} Compares
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 text-left text-sm font-medium text-slate-500">Metric</th>
                    <th className="py-2 text-right text-sm font-medium text-slate-500">City</th>
                    <th className="py-2 text-right text-sm font-medium text-slate-500">State</th>
                    <th className="py-2 text-right text-sm font-medium text-slate-500">National</th>
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow
                    label="Poor Condition"
                    city={city.poorPct}
                    stateData={stateData?.poorPct ?? null}
                    national={national?.poorPct ?? null}
                    format="percent"
                  />
                  <ComparisonRow
                    label="Good Condition"
                    city={city.goodPct}
                    stateData={stateData?.goodPct ?? null}
                    national={national?.goodPct ?? null}
                    format="percent"
                  />
                  <ComparisonRow
                    label="Avg. Year Built"
                    city={city.avgYearBuilt}
                    stateData={stateData?.avgYearBuilt ?? null}
                    national={national?.avgYearBuilt ?? null}
                    format="year"
                  />
                  <ComparisonRow
                    label="Avg. Daily Traffic"
                    city={city.avgAdt}
                    stateData={stateData?.avgAdt ?? null}
                    national={national?.avgAdt ?? null}
                    format="number"
                  />
                  <ComparisonRow
                    label="Avg. Length (ft)"
                    city={city.avgLengthFt}
                    stateData={stateData?.avgLengthFt ?? null}
                    national={national?.avgLengthFt ?? null}
                    format="number"
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* All Bridges Table */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            All Bridges in {cityName}
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Complete list of {formatNumber(city.total)} highway bridges. Click column headers to
            sort.
          </p>
          <CountyBridgeTable bridges={city.bridges} state={state} />
        </section>

        {/* Internal Links */}
        <section className="bg-slate-50 rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Explore More</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href={`/state/${state.toLowerCase()}`}
              className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-slate-900">All {city.stateName} Bridges</p>
              <p className="text-sm text-slate-500">
                View statewide bridge data and statistics
              </p>
            </Link>
            <Link
              href={`/state/${state.toLowerCase()}#worst`}
              className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-slate-900">Worst Bridges in {city.stateName}</p>
              <p className="text-sm text-slate-500">
                See the bridges with the lowest ratings
              </p>
            </Link>
            <Link
              href="/"
              className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-slate-900">National Overview</p>
              <p className="text-sm text-slate-500">
                Compare states and explore all US bridges
              </p>
            </Link>
          </div>
        </section>

        {/* Data Source Footer */}
        <DataSourceFooter />
      </div>
    </>
  );
}
