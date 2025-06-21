// Structured Data Schema Types for JSON-LD
export interface BaseSchema {
  "@context": string;
  "@type": string;
}

export interface Organization extends BaseSchema {
  "@type": "Organization";
  name: string;
  description?: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: ContactPoint[];
}

export interface ContactPoint {
  "@type": "ContactPoint";
  contactType: string;
  url?: string;
  email?: string;
}

export interface Product extends BaseSchema {
  "@type": "Product";
  name: string;
  description?: string;
  image: string | string[];
  url: string;
  sku?: string;
  brand?: Organization | string;
  category?: string;
  offers: Offer[];
  aggregateRating?: AggregateRating;
  review?: Review[];
  additionalProperty?: PropertyValue[];
}

export interface Offer extends BaseSchema {
  "@type": "Offer";
  price: string;
  priceCurrency: string;
  availability: string;
  url: string;
  seller?: Organization | string;
  priceValidUntil?: string;
  validFrom?: string;
}

export interface AggregateRating extends BaseSchema {
  "@type": "AggregateRating";
  ratingValue: number;
  bestRating: number;
  worstRating: number;
  ratingCount: number;
}

export interface Review extends BaseSchema {
  "@type": "Review";
  reviewRating: Rating;
  author?: Person | Organization;
  reviewBody?: string;
  datePublished?: string;
}

export interface Rating extends BaseSchema {
  "@type": "Rating";
  ratingValue: number;
  bestRating: number;
  worstRating: number;
}

export interface Person extends BaseSchema {
  "@type": "Person";
  name: string;
  url?: string;
}

export interface PropertyValue extends BaseSchema {
  "@type": "PropertyValue";
  name: string;
  value: string | number;
}

export interface BreadcrumbList extends BaseSchema {
  "@type": "BreadcrumbList";
  itemListElement: ListItem[];
}

export interface ListItem extends BaseSchema {
  "@type": "ListItem";
  position: number;
  name: string;
  item?: string;
}

export interface ItemList extends BaseSchema {
  "@type": "ItemList";
  numberOfItems?: number;
  itemListElement: ListItem[];
}

export interface WebPage extends BaseSchema {
  "@type": "WebPage";
  name: string;
  description?: string;
  url: string;
  mainEntity?: BaseSchema;
  breadcrumb?: BreadcrumbList;
  isPartOf?: WebSite;
  datePublished?: string;
  dateModified?: string;
  author?: Person | Organization;
  publisher?: Organization;
}

export interface WebSite extends BaseSchema {
  "@type": "WebSite";
  name: string;
  description?: string;
  url: string;
  publisher?: Organization;
  potentialAction?: SearchAction;
}

export interface SearchAction extends BaseSchema {
  "@type": "SearchAction";
  target: string;
  "query-input": string;
}

// Availability enum values
export const AVAILABILITY = {
  IN_STOCK: "https://schema.org/InStock",
  OUT_OF_STOCK: "https://schema.org/OutOfStock",
  PRE_ORDER: "https://schema.org/PreOrder",
  ONLINE_ONLY: "https://schema.org/OnlineOnly",
} as const;

// Category values for adult content
export const PRODUCT_CATEGORIES = {
  DIGITAL_CONTENT: "Digital Content",
  ADULT_ENTERTAINMENT: "Adult Entertainment",
  DOUJINSHI: "Doujinshi",
  MANGA: "Manga",
} as const;
