import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';
import { AdProvider, StickyFooterAd } from '@/components/ads';

// Canonical domain is www.bridgereport.org (not non-www)
const CANONICAL_DOMAIN = 'https://www.bridgereport.org';

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_DOMAIN),
  title: {
    default: 'BridgeReport.org — America\'s 623,218 Highway Bridges',
    template: '%s | BridgeReport.org',
  },
  description: 'Explore bridge condition data for every highway bridge in America. Find bridge ratings, deficiency status, and infrastructure reports by state, county, or location.',
  keywords: ['bridge conditions', 'highway bridges', 'bridge inspection', 'NBI', 'infrastructure', 'structurally deficient bridges', 'National Bridge Inventory', 'FHWA', 'bridge safety', 'bridge data'],
  authors: [{ name: 'BridgeReport.org', url: CANONICAL_DOMAIN }],
  creator: 'BridgeReport.org',
  publisher: 'BridgeReport.org',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: CANONICAL_DOMAIN,
    siteName: 'BridgeReport.org',
    title: 'BridgeReport.org — America\'s 623,218 Highway Bridges',
    description: 'Explore bridge condition data for every highway bridge in America. Find bridge ratings, deficiency status, and infrastructure reports by state, county, or location.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BridgeReport.org - America\'s Bridge Infrastructure Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BridgeReport.org — America\'s 623,218 Highway Bridges',
    description: 'Explore bridge condition data for every highway bridge in America.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'verification_code',
    // yandex: 'verification_code',
    // bing: 'verification_code',
  },
};

// Organization schema with logo for structured data
function OrganizationJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BridgeReport.org',
    url: CANONICAL_DOMAIN,
    logo: `${CANONICAL_DOMAIN}/icon.png`,
    sameAs: [],
    description: 'Explore bridge condition data for every highway bridge in America. Find bridge ratings, deficiency status, and infrastructure reports by state, county, or location.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// WebSite schema for search engines
function WebSiteJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BridgeReport.org',
    url: CANONICAL_DOMAIN,
    description: 'Explore bridge condition data for every highway bridge in America.',
    publisher: {
      '@type': 'Organization',
      name: 'BridgeReport.org',
      logo: {
        '@type': 'ImageObject',
        url: `${CANONICAL_DOMAIN}/icon.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-screen flex flex-col">
        <AdProvider>
          <Analytics />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <StickyFooterAd />
        </AdProvider>
      </body>
    </html>
  );
}
