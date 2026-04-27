/**
 * JSON-LD Schema component for ranking pages
 * Outputs Article + ItemList using @graph pattern
 */

interface RankingItem {
  id?: string;
  structureNumber?: string;
  state: string;
  facilityCarried?: string | null;
  featuresIntersected?: string | null;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface RankingJsonLdProps {
  headline: string;
  description: string;
  canonicalUrl: string;
  items: RankingItem[];
  listName: string;
  listDescription: string;
  itemListOrder?: 'Ascending' | 'Descending';
  breadcrumbItems?: BreadcrumbItem[];
}

export default function RankingJsonLd({
  headline,
  description,
  canonicalUrl,
  items,
  listName,
  listDescription,
  itemListOrder = 'Descending',
  breadcrumbItems,
}: RankingJsonLdProps) {
  // Get today's date in ISO format
  const today = new Date().toISOString().split('T')[0];

  // Build up to 100 list items (Google honors longer lists; 10 was leaving rich-result coverage on the table)
  const listItems = items.slice(0, 100).map((item, index) => {
    const bridgeId = item.id || item.structureNumber || '';
    const bridgeName = item.facilityCarried || item.featuresIntersected || 'Bridge';
    const bridgeUrl = `https://www.bridgereport.org/bridge/${item.state.toLowerCase()}/${encodeURIComponent(bridgeId)}`;

    return {
      '@type': 'ListItem',
      position: index + 1,
      name: bridgeName,
      url: bridgeUrl,
    };
  });

  // Build breadcrumb list if provided
  const breadcrumbList = breadcrumbItems
    ? {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems
          .filter((item) => item.href)
          .map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            item: `https://www.bridgereport.org${item.href}`,
          })),
      }
    : null;

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline,
        description,
        url: canonicalUrl,
        dateModified: today,
        author: {
          '@type': 'Organization',
          name: 'BridgeReport.org',
          url: 'https://www.bridgereport.org',
        },
        publisher: {
          '@type': 'Organization',
          name: 'BridgeReport.org',
          url: 'https://www.bridgereport.org',
        },
      },
      {
        '@type': 'ItemList',
        name: listName,
        description: listDescription,
        numberOfItems: items.length,
        itemListOrder,
        itemListElement: listItems,
      },
      ...(breadcrumbList ? [breadcrumbList] : []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
