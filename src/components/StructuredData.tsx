import { SITE_CONFIG } from "@/lib/constants/site";
import type { BreadcrumbItem } from "@/lib/utils/breadcrumb";
import React from "react";

// Type definitions for structured data schemas
interface BaseSchema {
  "@context": string;
  "@type": string;
}

interface ProductSchema extends BaseSchema {
  "@type": "Product";
  name: string;
  description?: string;
  image: string | string[];
  url: string;
  sku: string;
  brand: OrganizationSchema;
  category: string;
  datePublished: string;
  offers: OfferSchema;
  aggregateRating?: AggregateRatingSchema;
  author?: PersonSchema | OrganizationSchema;
  genre?: string[];
  inLanguage: string;
  contentRating: string;
  audience: AudienceSchema;
}

interface OfferSchema {
  "@type": "Offer";
  url: string;
  priceCurrency: string;
  price: number;
  priceValidUntil?: string;
  availability: string;
  seller: OrganizationSchema;
  category: string;
}

interface AggregateRatingSchema extends BaseSchema {
  "@type": "AggregateRating";
  ratingValue: number;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
}

interface OrganizationSchema extends BaseSchema {
  "@type": "Organization";
  name: string;
  url?: string;
  description?: string;
  sameAs?: string[];
}

interface PersonSchema extends BaseSchema {
  "@type": "Person";
  name: string;
  url?: string;
}

interface AudienceSchema {
  "@type": "Audience";
  audienceType: string;
  suggestedMinAge: number;
}

interface BreadcrumbListSchema extends BaseSchema {
  "@type": "BreadcrumbList";
  itemListElement: ListItemSchema[];
}

interface ListItemSchema {
  "@type": "ListItem";
  position: number;
  name: string;
  item?: string;
}

interface WebSiteSchema extends BaseSchema {
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  inLanguage: string;
  publisher: OrganizationSchema;
  potentialAction?: SearchActionSchema;
}

interface SearchActionSchema {
  "@type": "SearchAction";
  target: {
    "@type": "EntryPoint";
    urlTemplate: string;
  };
  "query-input": string;
}

type StructuredDataSchema =
  | ProductSchema
  | OrganizationSchema
  | BreadcrumbListSchema
  | WebSiteSchema
  | AggregateRatingSchema;

interface StructuredDataProps {
  data: StructuredDataSchema | StructuredDataSchema[];
}

/**
 * Component to render structured data JSON-LD script tags
 *
 * @param data - Single schema object or array of schema objects
 */
export function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD structured data
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          jsonLd.length === 1 ? jsonLd[0] : jsonLd,
          null,
          2,
        ),
      }}
    />
  );
}

// Schema generators
export interface WorkData {
  id: string;
  title: string;
  largeImageUrl: string;
  affiliateUrl: string;
  price: number;
  listPrice: number;
  releaseDate: string;
  volume?: number;
  reviewCount?: number;
  reviewAverageScore?: number;
  makers: Array<{ id: number; name: string }>;
  genres: Array<{ id: number; name: string }>;
  series: Array<{ id: number; name: string }>;
}

// Re-export from breadcrumb utils for backward compatibility
export type { BreadcrumbItem } from "@/lib/utils/breadcrumb";

/**
 * Generate Product schema for doujinshi works
 */
export function generateProductSchema(
  work: WorkData,
  pageUrl: string,
): ProductSchema {
  const baseUrl = SITE_CONFIG.url;

  const offers: OfferSchema = {
    "@type": "Offer",
    url: work.affiliateUrl,
    priceCurrency: "JPY",
    price: work.price,
    availability: "https://schema.org/InStock",
    seller: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "FANZA",
      url: "https://www.dmm.co.jp/",
    },
    category: "Adult Content",
  };

  const aggregateRating: AggregateRatingSchema | undefined =
    work.reviewCount && work.reviewAverageScore
      ? {
          "@context": "https://schema.org",
          "@type": "AggregateRating",
          ratingValue: work.reviewAverageScore,
          reviewCount: work.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined;

  const author: OrganizationSchema | undefined =
    work.makers.length > 0 && work.makers[0]
      ? {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: work.makers[0].name,
          url: `${baseUrl}/doujinshi/makers/${work.makers[0].id}`,
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: work.title,
    description: `${work.makers.length > 0 && work.makers[0] ? work.makers[0].name : ""}による同人誌作品。${work.volume ? `${work.volume}ページ。` : ""}FANZAで安全に購入できます。`,
    image: work.largeImageUrl,
    url: pageUrl,
    sku: work.id,
    brand: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_CONFIG.siteName,
      url: baseUrl,
    },
    category: "Adult Content",
    datePublished: work.releaseDate,
    offers,
    ...(aggregateRating && { aggregateRating }),
    ...(author && { author }),
    genre: work.genres.map((g) => g.name),
    inLanguage: "ja",
    contentRating: "adult",
    audience: {
      "@type": "Audience",
      audienceType: "adult",
      suggestedMinAge: 18,
    },
  };
}

/**
 * Generate Organization schema for makers
 */
export function generateOrganizationSchema(
  maker: { id: number; name: string },
  description?: string,
): OrganizationSchema {
  const baseUrl = SITE_CONFIG.url;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: maker.name,
    url: `${baseUrl}/doujinshi/makers/${maker.id}`,
    description: description || `${maker.name}による同人誌作品の制作者ページ`,
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  baseUrl: string = SITE_CONFIG.url,
): BreadcrumbListSchema {
  const itemListElement: ListItemSchema[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: baseUrl,
    },
  ];

  items.forEach((item, index) => {
    const position = index + 2;
    const listItem: ListItemSchema = {
      "@type": "ListItem",
      position,
      name: item.label,
    };

    if (item.href && !item.current) {
      listItem.item = item.href.startsWith("http")
        ? item.href
        : `${baseUrl}${item.href}`;
    }

    itemListElement.push(listItem);
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.siteName,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    inLanguage: "ja",
    publisher: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_CONFIG.author,
      url: SITE_CONFIG.url,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/doujinshi/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate standalone AggregateRating schema
 */
export function generateAggregateRatingSchema(
  reviewCount: number,
  reviewAverageScore: number,
): AggregateRatingSchema {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: reviewAverageScore,
    reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

/**
 * Generate multiple schemas for a work detail page
 */
export function generateWorkDetailSchemas(
  work: WorkData,
  pageUrl: string,
  breadcrumbItems: BreadcrumbItem[],
): StructuredDataSchema[] {
  const schemas: StructuredDataSchema[] = [];

  // Product schema
  schemas.push(generateProductSchema(work, pageUrl));

  // Organization schema for makers
  for (const maker of work.makers) {
    schemas.push(generateOrganizationSchema(maker));
  }

  // Breadcrumb schema
  schemas.push(generateBreadcrumbSchema(breadcrumbItems));

  return schemas;
}

/**
 * Generate multiple schemas for a maker detail page
 */
export function generateMakerDetailSchemas(
  maker: { id: number; name: string; description?: string },
  totalWorks: number,
  breadcrumbItems: BreadcrumbItem[],
  pageUrl: string,
): StructuredDataSchema[] {
  const schemas: StructuredDataSchema[] = [];

  // Organization schema for the maker
  const organizationDescription =
    maker.description ||
    `${maker.name}による同人誌作品の制作者ページ。${totalWorks}作品を掲載中。`;

  schemas.push(generateOrganizationSchema(maker, organizationDescription));

  // Breadcrumb schema
  schemas.push(generateBreadcrumbSchema(breadcrumbItems));

  return schemas;
}

/**
 * Generate multiple schemas for a genre detail page
 */
export function generateGenreDetailSchemas(
  genre: { id: number; name: string; description?: string },
  totalWorks: number,
  breadcrumbItems: BreadcrumbItem[],
  pageUrl: string,
): StructuredDataSchema[] {
  const schemas: StructuredDataSchema[] = [];

  // Organization schema for the genre (as category)
  const genreDescription =
    genre.description ||
    `${genre.name}ジャンルの同人誌・エロ漫画コレクション。${totalWorks}作品を掲載中。`;

  schemas.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: `${genre.name}ジャンル`,
    url: pageUrl,
    description: genreDescription,
  });

  // Breadcrumb schema
  schemas.push(generateBreadcrumbSchema(breadcrumbItems));

  return schemas;
}

/**
 * Generate multiple schemas for a series detail page
 */
export function generateSeriesDetailSchemas(
  series: { id: number; name: string; description?: string },
  totalWorks: number,
  breadcrumbItems: BreadcrumbItem[],
  pageUrl: string,
): StructuredDataSchema[] {
  const schemas: StructuredDataSchema[] = [];

  // Organization schema for the series
  const seriesDescription =
    series.description ||
    `「${series.name}」シリーズの同人誌・エロ漫画コレクション。${totalWorks}作品を掲載中。`;

  schemas.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: `${series.name}シリーズ`,
    url: pageUrl,
    description: seriesDescription,
  });

  // Breadcrumb schema
  schemas.push(generateBreadcrumbSchema(breadcrumbItems));

  return schemas;
}

/**
 * Hook to generate structured data for pages
 *
 * Usage:
 * ```tsx
 * const structuredData = useStructuredData({
 *   type: 'product',
 *   work: workData,
 *   url: pageUrl
 * });
 * ```
 */
export function useStructuredData() {
  // This could be extended to provide hooks for different schema types
  // For now, we'll keep it simple and use the generators directly
  return null;
}
