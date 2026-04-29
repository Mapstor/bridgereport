import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bridges Near Me — Find Local Highway Bridges',
  description:
    'Find highway bridges near your location. View bridge conditions, ratings, and details for over 623,000 bridges across the United States.',
  alternates: {
    canonical: 'https://www.bridgereport.org/bridges-near-me',
  },
  openGraph: {
    title: 'Bridges Near Me',
    description:
      'Discover highway bridges near you with condition ratings and inspection details.',
    type: 'website',
    url: 'https://www.bridgereport.org/bridges-near-me',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bridges Near Me - BridgeReport.org',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bridges Near Me — Find Local Highway Bridges',
    description: 'Find highway bridges near your location with condition ratings and details.',
    images: ['/og-image.png'],
  },
};

function BridgesNearMeJsonLd() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bridgereport.org' },
      { '@type': 'ListItem', position: 2, name: 'Bridges Near Me', item: 'https://www.bridgereport.org/bridges-near-me' },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://www.bridgereport.org/bridges-near-me',
    name: 'Bridges Near Me — Find Local Highway Bridges',
    description: 'Find highway bridges near your location. View bridge conditions, ratings, and inspection details for over 623,000 bridges across the United States.',
    url: 'https://www.bridgereport.org/bridges-near-me',
    isPartOf: { '@id': 'https://www.bridgereport.org/#website' },
    primaryImageOfPage: { '@id': 'https://www.bridgereport.org/og-image.png' },
    mainEntity: { '@id': 'https://www.bridgereport.org/bridges-near-me#tool' },
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://www.bridgereport.org/bridges-near-me#tool',
    name: 'Bridge Locator',
    description: 'Geolocation-based bridge lookup tool. Enter coordinates or use your device location to discover highway bridges within a configurable radius.',
    url: 'https://www.bridgereport.org/bridges-near-me',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript and geolocation API',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Geolocation-based bridge lookup',
      'Radius search (1–50 miles)',
      'Bridge condition ratings (Good/Fair/Poor)',
      'Year built and traffic data',
      'Direct links to bridge inspection details',
    ],
    publisher: { '@id': 'https://www.bridgereport.org/#organization' },
  };

  // No FAQPage schema here — page is interactive (no visible Q&A content), and
  // Google penalizes FAQ schema that isn't rendered as visible page content.

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
    </>
  );
}

export default function BridgesNearMeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BridgesNearMeJsonLd />
      {children}
    </>
  );
}
