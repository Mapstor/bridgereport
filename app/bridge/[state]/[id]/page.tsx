import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getBridge,
  getCountyName,
  formatNumber,
} from '@/lib/data';
import { generateBridgeTrend } from '@/lib/trends';
import ConditionBadge from '@/components/ConditionBadge';
import RatingIndicator from '@/components/RatingIndicator';
import Breadcrumbs, { BreadcrumbJsonLd } from '@/components/Breadcrumbs';
import DataSourceFooter from '@/components/DataSourceFooter';
import { BridgeTrendSection } from '@/components/TrendSection';
import SingleBridgeMap from '@/components/SingleBridgeMap';
import type { Metadata } from 'next';
import type { Bridge } from '@/types';

// Use dynamic rendering to avoid memory issues during build (623K+ pages)
export const dynamic = 'force-dynamic';

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; id: string }>;
}): Promise<Metadata> {
  const { state, id } = await params;
  const bridge = getBridge(state.toUpperCase(), id);

  if (!bridge) {
    return {
      title: 'Bridge Not Found',
    };
  }

  const title = `${bridge.facilityCarried || 'Bridge'} over ${bridge.featuresIntersected || 'Unknown'}, ${bridge.stateName}`;
  const description = `${bridge.facilityCarried || 'Bridge'} in ${bridge.location || bridge.stateName}. Built ${bridge.yearBuilt || 'unknown'}. Condition: ${bridge.conditionCategory || 'unknown'}. Average daily traffic: ${bridge.adt ? formatNumber(bridge.adt) : 'N/A'}.`;

  return {
    title: `${title} — Bridge Condition | BridgeReport.org`,
    description,
    alternates: {
      canonical: `https://bridgereport.org/bridge/${state.toLowerCase()}/${id}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://bridgereport.org/bridge/${state.toLowerCase()}/${id}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${bridge.facilityCarried || 'Bridge'} - BridgeReport.org`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

// JSON-LD structured data for Bridge (CivicStructure)
function BridgeJsonLd({ bridge, countyName }: { bridge: Bridge; countyName: string | null }) {
  const bridgeName = `${bridge.facilityCarried || 'Bridge'} over ${bridge.featuresIntersected || 'Unknown'}`;
  const currentYear = new Date().getFullYear();
  const bridgeAge = bridge.yearBuilt ? currentYear - bridge.yearBuilt : null;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Bridge',
    '@id': `https://bridgereport.org/bridge/${bridge.stateFips?.toLowerCase() || 'us'}/${bridge.id}`,
    name: bridgeName,
    description: `${bridgeName} in ${countyName ? `${countyName}, ` : ''}${bridge.stateName}. ${bridge.materialName || ''} ${bridge.designTypeName || ''} structure${bridge.yearBuilt ? ` built in ${bridge.yearBuilt}` : ''}. Current condition: ${bridge.conditionCategory || 'unknown'}.${bridge.adt ? ` Carries ${formatNumber(bridge.adt)} vehicles daily.` : ''}`,
    url: `https://bridgereport.org/bridge/${bridge.stateFips?.toLowerCase() || 'us'}/${bridge.id}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: bridge.location || countyName || undefined,
      addressRegion: bridge.stateName,
      addressCountry: 'US',
    },
    geo: bridge.lat && bridge.lon ? {
      '@type': 'GeoCoordinates',
      latitude: bridge.lat,
      longitude: bridge.lon,
    } : undefined,
    ...(bridge.yearBuilt && { foundingDate: String(bridge.yearBuilt) }),
    ...(bridgeAge && {
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Age',
          value: `${bridgeAge} years`,
        },
        {
          '@type': 'PropertyValue',
          name: 'Condition Rating',
          value: bridge.conditionCategory || 'Unknown',
        },
        ...(bridge.lowestRating !== null ? [{
          '@type': 'PropertyValue',
          name: 'NBI Rating',
          value: bridge.lowestRating,
          minValue: 0,
          maxValue: 9,
        }] : []),
        ...(bridge.adt ? [{
          '@type': 'PropertyValue',
          name: 'Average Daily Traffic',
          value: bridge.adt,
          unitText: 'vehicles per day',
        }] : []),
        ...(bridge.lengthFt ? [{
          '@type': 'PropertyValue',
          name: 'Total Length',
          value: Math.round(bridge.lengthFt),
          unitCode: 'FOT',
          unitText: 'feet',
        }] : []),
      ],
    }),
    isAccessibleForFree: true,
    publicAccess: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// FAQ JSON-LD for common bridge questions
function BridgeFAQJsonLd({ bridge, countyName }: { bridge: Bridge; countyName: string | null }) {
  const bridgeName = bridge.facilityCarried || 'This bridge';
  const currentYear = new Date().getFullYear();
  const bridgeAge = bridge.yearBuilt ? currentYear - bridge.yearBuilt : null;

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the condition of ${bridgeName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${bridgeName} is currently rated in ${bridge.conditionCategory || 'unknown'} condition${bridge.lowestRating !== null ? ` with a lowest component rating of ${bridge.lowestRating} on the 0-9 federal scale` : ''}. ${bridge.structurallyDeficient ? 'The bridge is classified as structurally deficient, meaning one or more components have significant deterioration, though it remains safe for travel within posted limits.' : 'The bridge meets current federal safety standards.'}`,
        },
      },
      ...(bridgeAge ? [{
        '@type': 'Question',
        name: `How old is ${bridgeName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${bridgeName} was built in ${bridge.yearBuilt}, making it ${bridgeAge} years old.${bridge.yearReconstructed ? ` It was reconstructed in ${bridge.yearReconstructed}.` : ''}`,
        },
      }] : []),
      ...(bridge.adt ? [{
        '@type': 'Question',
        name: `How much traffic does ${bridgeName} carry?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${bridgeName} carries approximately ${formatNumber(bridge.adt)} vehicles per day (Average Daily Traffic)${bridge.truckPct ? `, with ${bridge.truckPct}% being commercial trucks` : ''}.`,
        },
      }] : []),
      {
        '@type': 'Question',
        name: `Where is ${bridgeName} located?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${bridgeName} is located in ${bridge.location ? `${bridge.location}, ` : ''}${countyName ? `${countyName}, ` : ''}${bridge.stateName}${bridge.lat && bridge.lon ? ` at coordinates ${bridge.lat.toFixed(4)}, ${bridge.lon.toFixed(4)}` : ''}.`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}

// Detail row component
function DetailRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-slate-600">{label}</span>
      <span className={`text-slate-900 font-medium ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}

export default async function BridgePage({
  params,
}: {
  params: Promise<{ state: string; id: string }>;
}) {
  const { state, id } = await params;
  const bridge = getBridge(state.toUpperCase(), id);

  if (!bridge) {
    notFound();
  }

  const countyName = getCountyName(state, bridge.countyFips);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: bridge.stateName, href: `/state/${state.toLowerCase()}` },
    ...(countyName ? [{ label: countyName }] : []),
    { label: bridge.facilityCarried || 'Bridge' },
  ];

  const hasLocation = bridge.lat !== null && bridge.lon !== null;

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <BridgeJsonLd bridge={bridge} countyName={countyName} />
      <BridgeFAQJsonLd bridge={bridge} countyName={countyName} />

      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {bridge.facilityCarried || 'Bridge'}
          </h1>
          <p className="text-xl text-slate-300 mb-4">
            over {bridge.featuresIntersected || 'Unknown'}
          </p>
          <p className="text-slate-400">
            {bridge.location && `${bridge.location}, `}
            {countyName && `${countyName}, `}
            {bridge.stateName}
          </p>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Condition</p>
              <ConditionBadge condition={bridge.conditionCategory} size="lg" />
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Year Built</p>
              <p className="text-2xl font-bold font-mono">{bridge.yearBuilt || '—'}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Daily Traffic</p>
              <p className="text-2xl font-bold font-mono">{bridge.adt ? formatNumber(bridge.adt) : '—'}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Length</p>
              <p className="text-2xl font-bold font-mono">
                {bridge.lengthFt ? `${formatNumber(Math.round(bridge.lengthFt))} ft` : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About This Bridge */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Bridge</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-4">
              {bridge.facilityCarried || 'This bridge'} carries traffic over {bridge.featuresIntersected || 'the crossing'} in {countyName ? `${countyName}, ` : ''}{bridge.stateName}.
              {bridge.yearBuilt && ` Built in ${bridge.yearBuilt}, this structure is ${new Date().getFullYear() - bridge.yearBuilt} years old, ${bridge.yearBuilt < 1950 ? 'making it a historic structure that has served the community for generations' : bridge.yearBuilt < 1980 ? 'placing it among the older bridges still in active service' : bridge.yearBuilt < 2000 ? 'built during a period of significant highway expansion' : 'representing modern engineering and construction standards'}.`}
              {bridge.materialName && bridge.designTypeName && ` The bridge features ${bridge.materialName.toLowerCase()} construction with a ${bridge.designTypeName.toLowerCase()} design, a combination chosen by engineers to meet the specific requirements of this crossing.`}
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              {bridge.adt ? `Approximately ${formatNumber(bridge.adt)} vehicles cross this bridge daily, ` : 'Traffic data is recorded to help engineers understand usage patterns. '}
              {bridge.adt && bridge.adt > 50000 ? 'making it a high-traffic corridor critical to regional transportation. Bridges carrying this volume require enhanced inspection schedules and proactive maintenance programs. ' : bridge.adt && bridge.adt > 10000 ? 'representing moderate traffic volumes typical of important regional connectors. This level of usage requires regular monitoring to ensure continued safe operation. ' : bridge.adt ? 'indicating lower traffic volumes common for local roads and rural routes. While traffic is lighter, these bridges still serve essential community transportation needs. ' : ''}
              {bridge.truckPct !== null && bridge.truckPct > 0 && `Commercial trucks account for ${bridge.truckPct}% of all crossings. ${bridge.truckPct > 15 ? 'This heavy commercial usage significantly impacts structural wear, as a single fully-loaded truck can cause as much deck wear as thousands of passenger vehicles. Transportation planners factor this into maintenance scheduling and budget allocation.' : 'This proportion of commercial traffic is typical for this roadway classification and is factored into the bridge\'s design load ratings.'}`}
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              The bridge is currently rated in <strong>{bridge.conditionCategory || 'unknown'}</strong> condition based on federal inspection criteria established by the Federal Highway Administration.
              {bridge.structurallyDeficient ? ' It is classified as structurally deficient, meaning one or more components have received a rating of 4 or below on the 0-9 scale. This designation indicates significant deterioration that warrants attention, though the bridge remains safe for travel within its posted limits. Structurally deficient does not mean unsafe—rather, it signals that repairs or replacement should be prioritized in transportation planning.' : ' The structure meets current safety standards for its designated use and load capacity.'}
              {bridge.lengthFt && ` With a total length of ${formatNumber(Math.round(bridge.lengthFt))} feet, ${bridge.lengthFt > 500 ? 'this is a major span requiring specialized engineering expertise for inspection and maintenance. Longer bridges present unique challenges including thermal expansion, wind loads, and more complex structural analysis.' : bridge.lengthFt > 100 ? 'this structure falls within the typical range requiring standard inspection procedures conducted by certified bridge inspectors.' : 'this is a shorter span typical of local road crossings, often carrying traffic over small streams, drainage channels, or other roadways.'}`}
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              {bridge.materialName === 'Concrete' || bridge.materialName === 'Prestressed Concrete' ? 'Concrete bridges offer excellent durability and relatively low maintenance requirements. They resist corrosion well but can develop cracking over time, particularly in regions with freeze-thaw cycles or heavy use of deicing chemicals. Regular inspection focuses on detecting cracks, spalling, and reinforcement corrosion.' : bridge.materialName === 'Steel' ? 'Steel bridges provide high strength-to-weight ratios, making them suitable for longer spans. However, they require ongoing protection against corrosion through painting or weathering steel designs. Inspectors pay close attention to connection points, fatigue cracking, and coating condition.' : bridge.materialName === 'Wood/Timber' ? 'Timber bridges, while less common in modern construction, continue to serve many rural areas. Wood structures require vigilant inspection for decay, insect damage, and connection deterioration. Proper drainage and treatment are essential for longevity.' : 'The construction materials used in this bridge were selected based on engineering requirements, cost considerations, and local conditions at the time of construction.'}
            </p>
            <p className="text-slate-600 leading-relaxed">
              Federal law requires that all highway bridges be inspected at least every 24 months by qualified inspectors following the National Bridge Inspection Standards (NBIS). Some bridges with known issues or unusual characteristics may be inspected more frequently. Inspection data is reported to the National Bridge Inventory, a database maintained by the Federal Highway Administration that tracks the condition of all public highway bridges in the United States. This bridge data is sourced from that federal database and reflects the most recent available inspection results.
            </p>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Condition Overview */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Condition Ratings</h2>

              {bridge.structurallyDeficient && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="font-semibold text-red-800">Structurally Deficient</p>
                  <p className="text-sm text-red-700 mt-1">
                    This bridge has one or more component ratings of 4 or below, indicating significant deterioration
                    that requires attention. The bridge remains safe for travel but may have load restrictions.
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <RatingIndicator
                  rating={bridge.deckCondition}
                  label="Deck Condition"
                  size="lg"
                />
                <RatingIndicator
                  rating={bridge.superstructureCondition}
                  label="Superstructure"
                  size="lg"
                />
                <RatingIndicator
                  rating={bridge.substructureCondition}
                  label="Substructure"
                  size="lg"
                />
                {bridge.culvertCondition && (
                  <RatingIndicator
                    rating={bridge.culvertCondition}
                    label="Culvert"
                    size="lg"
                  />
                )}
                <RatingIndicator
                  rating={bridge.channelCondition}
                  label="Channel & Protection"
                  size="lg"
                />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center font-bold font-mono text-lg text-slate-600">
                    {bridge.lowestRating ?? '—'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Lowest Rating</p>
                    <p className="text-xs text-slate-500">Determines condition category</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-slate-600 space-y-2">
                <p>
                  NBI condition ratings range from 0 (failed) to 9 (excellent). Ratings of 4 or below are considered poor.
                  The overall condition category is determined by the lowest individual component rating.
                </p>
                <p>
                  {bridge.deckCondition !== null && Number(bridge.deckCondition) <= 4 && `The deck rating of ${bridge.deckCondition} indicates ${Number(bridge.deckCondition) <= 2 ? 'critical deterioration requiring immediate attention' : Number(bridge.deckCondition) === 3 ? 'serious deterioration with section loss or spalling' : 'advanced deterioration affecting the driving surface'}. `}
                  {bridge.superstructureCondition !== null && Number(bridge.superstructureCondition) <= 4 && `The superstructure rating of ${bridge.superstructureCondition} shows ${Number(bridge.superstructureCondition) <= 2 ? 'severe structural concerns in load-bearing elements' : Number(bridge.superstructureCondition) === 3 ? 'serious section loss affecting structural capacity' : 'advanced deterioration in beams or girders'}. `}
                  {bridge.substructureCondition !== null && Number(bridge.substructureCondition) <= 4 && `The substructure rating of ${bridge.substructureCondition} reflects ${Number(bridge.substructureCondition) <= 2 ? 'critical foundation or pier problems' : Number(bridge.substructureCondition) === 3 ? 'serious deterioration in supports' : 'significant wear in piers, abutments, or foundations'}. `}
                  {bridge.lowestRating !== null && bridge.lowestRating >= 7 && `With a lowest rating of ${bridge.lowestRating}, this bridge demonstrates ${bridge.lowestRating === 9 ? 'excellent condition with no problems noted' : bridge.lowestRating === 8 ? 'very good condition with only minor issues' : 'good condition meeting all safety standards'}. `}
                  {bridge.lowestRating !== null && bridge.lowestRating >= 5 && bridge.lowestRating <= 6 && `The fair condition rating of ${bridge.lowestRating} indicates ${bridge.lowestRating === 6 ? 'satisfactory condition with minor section loss or deterioration' : 'some deterioration that warrants monitoring but doesn\'t affect structural integrity'}. `}
                </p>
                <p>
                  {bridge.yearBuilt && bridge.lowestRating !== null && `For a structure built in ${bridge.yearBuilt}, ${bridge.lowestRating >= 7 ? 'maintaining good condition demonstrates effective maintenance practices' : bridge.lowestRating >= 5 ? 'this condition level is expected given the bridge\'s age and usage patterns' : 'the current condition reflects the cumulative effects of age, traffic, and environmental exposure'}. `}
                  {bridge.adt && bridge.lowestRating !== null && bridge.adt > 20000 && bridge.lowestRating <= 5 && 'High traffic volumes on a bridge in fair or poor condition typically elevate its priority for rehabilitation or replacement in state transportation planning. '}
                  {bridge.detourKm && bridge.detourKm > 10 && `If this bridge were closed, traffic would face a detour of approximately ${Math.round(bridge.detourKm * 0.621371)} miles, underscoring the importance of maintaining this crossing. `}
                </p>
              </div>
            </section>

            {/* Bridge Details */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Bridge Details</h2>
              <p className="text-sm text-slate-600 mb-4">
                {bridge.materialName || 'The bridge material'} is the primary structural material, which influences maintenance requirements and expected lifespan.
                {bridge.designTypeName && ` The ${bridge.designTypeName.toLowerCase()} design was selected based on span requirements, load capacity needs, and site conditions at the time of construction.`}
                {bridge.ownerName && ` Maintenance responsibility falls to ${bridge.ownerName}.`}
              </p>

              <div className="grid md:grid-cols-2 gap-x-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Construction</h3>
                  <DetailRow label="Year Built" value={bridge.yearBuilt} mono />
                  {bridge.yearReconstructed && (
                    <DetailRow label="Year Reconstructed" value={bridge.yearReconstructed} mono />
                  )}
                  <DetailRow label="Material" value={bridge.materialName} />
                  <DetailRow label="Design Type" value={bridge.designTypeName} />
                  <DetailRow label="Owner" value={bridge.ownerName} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Dimensions</h3>
                  <DetailRow
                    label="Total Length"
                    value={bridge.lengthFt ? `${formatNumber(Math.round(bridge.lengthFt))} ft (${bridge.lengthM?.toFixed(1)} m)` : null}
                    mono
                  />
                  <DetailRow
                    label="Max Span"
                    value={bridge.maxSpanFt ? `${Math.round(bridge.maxSpanFt)} ft (${bridge.maxSpanM?.toFixed(1)} m)` : null}
                    mono
                  />
                  <DetailRow
                    label="Deck Width"
                    value={bridge.deckWidthFt ? `${Math.round(bridge.deckWidthFt)} ft` : null}
                    mono
                  />
                  <DetailRow
                    label="Deck Area"
                    value={bridge.deckArea ? `${formatNumber(Math.round(bridge.deckArea))} sq ft` : null}
                    mono
                  />
                  <p className="text-xs text-slate-500 mt-3">
                    {bridge.maxSpanFt && bridge.maxSpanFt > 200 ? 'The maximum span length indicates this is a major crossing requiring specialized engineering.' : 'Span dimensions affect structural design choices and load distribution.'}
                    {bridge.deckArea && ` The deck area of ${formatNumber(Math.round(bridge.deckArea))} sq ft determines surface maintenance scope.`}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8 mt-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Classification</h3>
                  <DetailRow label="Route Type" value={bridge.routePrefixName} />
                  <DetailRow label="Route Number" value={bridge.routeNumber} />
                  <DetailRow label="Lanes On Bridge" value={bridge.lanesOn} mono />
                  <DetailRow label="Lanes Under Bridge" value={bridge.lanesUnder} mono />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Status</h3>
                  <DetailRow label="Toll Bridge" value={bridge.toll ? 'Yes' : 'No'} />
                  <DetailRow label="Historical Significance" value={bridge.historicalName} />
                  <DetailRow label="Scour Critical" value={bridge.scourCritical === '5' ? 'No' : bridge.scourCritical} />
                  <DetailRow
                    label="Detour Length"
                    value={bridge.detourKm ? `${Math.round(bridge.detourKm * 0.621371)} mi (${bridge.detourKm} km)` : null}
                    mono
                  />
                </div>
              </div>
            </section>

            {/* Traffic Section */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Traffic Data</h2>
              <p className="text-sm text-slate-600 mb-4">
                Traffic volume data helps engineers assess bridge wear patterns and plan maintenance schedules.
                Average Daily Traffic (ADT) counts are updated periodically and represent typical weekday usage.
              </p>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold font-mono text-slate-900">
                    {bridge.adt ? formatNumber(bridge.adt) : '—'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Avg Daily Traffic {bridge.adtYear ? `(${bridge.adtYear})` : ''}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Vehicles per day crossing this bridge</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold font-mono text-slate-900">
                    {bridge.truckPct !== null ? `${bridge.truckPct}%` : '—'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Truck Traffic</p>
                  <p className="text-xs text-slate-400 mt-1">Commercial vehicle percentage</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold font-mono text-slate-900">
                    {bridge.futureAdt ? formatNumber(bridge.futureAdt) : '—'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Projected Future ADT</p>
                  <p className="text-xs text-slate-400 mt-1">Estimated future demand</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-600 space-y-2">
                {bridge.adt && (
                  <p>
                    This bridge carries approximately {formatNumber(bridge.adt)} vehicles per day, translating to roughly {formatNumber(bridge.adt * 365)} crossings annually.
                    {bridge.adt > 50000 ? ' This high volume places significant demands on the structure and necessitates frequent inspections.' : bridge.adt > 10000 ? ' This moderate traffic level is typical for regional connectors.' : ' Lower traffic volumes generally result in less structural wear over time.'}
                  </p>
                )}
                {bridge.truckPct !== null && bridge.truckPct > 0 && (
                  <p>
                    Commercial trucks comprise {bridge.truckPct}% of traffic. Heavy vehicles cause disproportionate wear—a single fully loaded truck can have the impact of thousands of passenger cars on bridge deck surfaces.
                    {bridge.truckPct > 15 && ' This high percentage of truck traffic may accelerate deterioration of deck surfaces and structural components.'}
                  </p>
                )}
                {bridge.futureAdt && bridge.adt && (
                  <p>
                    Traffic projections estimate future volumes of {formatNumber(bridge.futureAdt)} vehicles daily, a {bridge.futureAdt > bridge.adt ? `${Math.round(((bridge.futureAdt - bridge.adt) / bridge.adt) * 100)}% increase` : 'decrease'} from current levels.
                    These projections inform capacity planning and potential upgrade requirements.
                  </p>
                )}
              </div>
            </section>

            {/* Load Ratings */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Load Ratings</h2>
              <p className="text-sm text-slate-600 mb-4">
                Load ratings determine what weight this bridge can safely support. These values are critical for routing heavy vehicles and issuing overweight permits.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Operating Rating</p>
                  <p className="text-2xl font-bold font-mono">
                    {bridge.operatingRating !== null ? `${bridge.operatingRating.toFixed(1)} tons` : '—'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Maximum allowable load for special permits
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Inventory Rating</p>
                  <p className="text-2xl font-bold font-mono">
                    {bridge.inventoryRating !== null ? `${bridge.inventoryRating.toFixed(1)} tons` : '—'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Load level for normal traffic
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-600">
                {bridge.operatingRating !== null && bridge.inventoryRating !== null && (
                  <p>
                    The operating rating of {bridge.operatingRating.toFixed(1)} tons represents the absolute maximum load this bridge can carry under controlled conditions with special permits.
                    The inventory rating of {bridge.inventoryRating.toFixed(1)} tons is the safe load limit for everyday traffic without restrictions.
                    {bridge.operatingRating < 20 && ' These relatively low ratings may result in posted weight limits or route restrictions for heavy vehicles.'}
                    {bridge.operatingRating > 40 && ' These ratings indicate robust load-carrying capacity suitable for most commercial traffic.'}
                  </p>
                )}
              </div>
            </section>

            {/* 5-Year Condition Trend */}
            <BridgeTrendSection data={generateBridgeTrend(bridge)} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Map */}
            {hasLocation && (
              <section className="bg-white rounded-xl border border-slate-200 p-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Location</h2>
                <SingleBridgeMap
                  lat={bridge.lat!}
                  lon={bridge.lon!}
                  condition={bridge.conditionCategory}
                  facilityCarried={bridge.facilityCarried}
                  featuresIntersected={bridge.featuresIntersected}
                  height={300}
                />
                <p className="mt-2 text-xs text-slate-500 text-center">
                  {bridge.lat?.toFixed(6)}, {bridge.lon?.toFixed(6)}
                </p>
              </section>
            )}

            {/* Structure ID */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Identification</h2>
              <DetailRow label="Structure Number" value={bridge.structureNumber} mono />
              <DetailRow label="NBI ID" value={bridge.id} mono />
              <DetailRow label="State FIPS" value={bridge.stateFips} mono />
              <DetailRow label="County FIPS" value={bridge.countyFips} mono />
            </section>

            {/* Internal Links */}
            <section className="bg-slate-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Explore More</h2>
              <div className="space-y-3">
                <Link
                  href={`/state/${state.toLowerCase()}`}
                  className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-slate-900">All {bridge.stateName} Bridges</p>
                  <p className="text-sm text-slate-500">View statewide bridge data</p>
                </Link>
                <Link
                  href={`/state/${state.toLowerCase()}#worst`}
                  className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-slate-900">Worst Bridges in {bridge.stateName}</p>
                  <p className="text-sm text-slate-500">See the lowest-rated bridges</p>
                </Link>
                <Link
                  href="/"
                  className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <p className="font-medium text-slate-900">National Overview</p>
                  <p className="text-sm text-slate-500">Compare all 50 states</p>
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* Data Source Footer */}
        <DataSourceFooter />
      </div>
    </>
  );
}
