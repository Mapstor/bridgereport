import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bridges Near Me — Find Local Highway Bridges | BridgeReport.org',
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

export default function BridgesNearMeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
