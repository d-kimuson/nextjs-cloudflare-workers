import { SITE_CONFIG } from "@/lib/constants/site";
import type { WorkItemWithMaker } from "@/types/work";
import {
  AVAILABILITY,
  type AggregateRating,
  type BreadcrumbList,
  type ItemList,
  type ListItem,
  type Offer,
  type Organization,
  PRODUCT_CATEGORIES,
  type Product,
  type PropertyValue,
  type WebPage,
  type WebSite,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://okazu-navi.com";

/**
 * Generate Organization structured data for the site
 */
export function createOrganizationSchema(): Organization {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`, // Assuming logo exists
    sameAs: [
      // Add social media URLs if available
    ],
  };
}

/**
 * Generate WebSite structured data
 */
export function createWebSiteSchema(): WebSite {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: BASE_URL,
    publisher: createOrganizationSchema(),
    potentialAction: {
      "@context": "https://schema.org",
      "@type": "SearchAction",
      target: `${BASE_URL}/doujinshi/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate Product structured data for doujinshi work
 */
export function createProductSchema(
  work: WorkItemWithMaker,
  workUrl: string,
): Product {
  const offers: Offer[] = [
    {
      "@context": "https://schema.org",
      "@type": "Offer",
      price: work.price.toString(),
      priceCurrency: "JPY",
      availability: AVAILABILITY.IN_STOCK,
      url: work.affiliateUrl,
      seller: "FANZA",
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days from now
    },
  ];

  // Add discounted price if different from list price
  if (work.listPrice !== work.price && work.listPrice && work.price) {
    if (offers[0]) {
      offers[0].price = work.listPrice.toString();
    }
    offers.push({
      "@context": "https://schema.org",
      "@type": "Offer",
      price: work.price.toString(),
      priceCurrency: "JPY",
      availability: AVAILABILITY.IN_STOCK,
      url: work.affiliateUrl,
      seller: "FANZA",
      priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 7 days for sale price
    });
  }

  const additionalProperties: PropertyValue[] = [
    {
      "@context": "https://schema.org",
      "@type": "PropertyValue",
      name: "Release Date",
      value: work.releaseDate,
    },
    {
      "@context": "https://schema.org",
      "@type": "PropertyValue",
      name: "Work ID",
      value: work.id,
    },
  ];

  if (work.volume) {
    additionalProperties.push({
      "@context": "https://schema.org",
      "@type": "PropertyValue",
      name: "Page Count",
      value: work.volume,
    });
  }

  // Add genres as additional properties
  for (const genre of work.genres) {
    additionalProperties.push({
      "@context": "https://schema.org",
      "@type": "PropertyValue",
      name: "Genre",
      value: genre.name,
    });
  }

  const product: Product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: work.title,
    description: `${work.title} by ${work.makers
      .map((m) => m.name)
      .join(", ")}. Digital doujinshi content available for download.`,
    image: [work.listImageUrl, work.largeImageUrl],
    url: workUrl,
    sku: work.id,
    brand: work.makers.length > 0 ? work.makers[0]?.name : undefined,
    category: PRODUCT_CATEGORIES.DOUJINSHI,
    offers,
    additionalProperty: additionalProperties,
  };

  // Add aggregate rating if available
  if (work.reviewCount && work.reviewAverageScore) {
    product.aggregateRating = {
      "@context": "https://schema.org",
      "@type": "AggregateRating",
      ratingValue: work.reviewAverageScore,
      bestRating: 5,
      worstRating: 1,
      ratingCount: work.reviewCount,
    };
  }

  return product;
}

/**
 * Generate BreadcrumbList structured data
 */
export function createBreadcrumbSchema(
  breadcrumbItems: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>,
): BreadcrumbList {
  const listItems: ListItem[] = breadcrumbItems.map((item, index) => ({
    "@context": "https://schema.org",
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: item.href && !item.current ? `${BASE_URL}${item.href}` : undefined,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  };
}

/**
 * Generate WebPage structured data
 */
export function createWebPageSchema(
  title: string,
  description: string,
  url: string,
  options: {
    mainEntity?: Product | Organization;
    breadcrumb?: BreadcrumbList;
    datePublished?: string;
    dateModified?: string;
  } = {},
): WebPage {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    mainEntity: options.mainEntity,
    breadcrumb: options.breadcrumb,
    isPartOf: createWebSiteSchema(),
    datePublished: options.datePublished,
    dateModified: options.dateModified,
    publisher: createOrganizationSchema(),
  };
}

/**
 * Generate structured data script tag
 */
export function createStructuredDataScript(
  ...schemas: Record<string, unknown>[]
): string {
  if (schemas.length === 1) {
    return JSON.stringify(schemas[0], null, 2);
  }

  return JSON.stringify(schemas, null, 2);
}

/**
 * Create CollectionPage structured data for listing pages (genres, makers, etc.)
 */
export function createCollectionPageSchema(
  name: string,
  description: string,
  url: string,
  totalItems: number,
  options: {
    breadcrumb?: BreadcrumbList;
    datePublished?: string;
    category?: string;
  } = {},
): WebPage {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
    breadcrumb: options.breadcrumb,
    isPartOf: createWebSiteSchema(),
    datePublished: options.datePublished,
    publisher: createOrganizationSchema(),
    mainEntity: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      numberOfItems: totalItems,
      itemListElement: [], // Could be populated with actual items if needed
    } as ItemList,
  };
}

/**
 * Create Article structured data for informational pages
 */
export function createArticleSchema(
  headline: string,
  description: string,
  url: string,
  options: {
    datePublished?: string;
    dateModified?: string;
    image?: string;
    keywords?: string[];
  } = {},
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    image: options.image,
    datePublished: options.datePublished,
    dateModified: options.dateModified,
    keywords: options.keywords,
    publisher: createOrganizationSchema(),
    author: createOrganizationSchema(),
  };
}

/**
 * Create FAQ structured data for help pages
 */
export function createFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Helper function to format structured data for Next.js metadata
 */
export function formatStructuredDataForMetadata(
  ...schemas: Record<string, unknown>[]
) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: createStructuredDataScript(...schemas),
    },
  };
}
