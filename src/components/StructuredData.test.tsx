import { describe, expect, it } from "vitest";
import {
  type BreadcrumbItem,
  type WorkData,
  generateAggregateRatingSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateProductSchema,
  generateWebSiteSchema,
} from "./StructuredData";

describe("StructuredData", () => {
  const mockWorkData: WorkData = {
    id: "test-work-123",
    title: "テスト同人誌作品",
    largeImageUrl: "https://example.com/image.jpg",
    affiliateUrl: "https://www.dmm.co.jp/affiliate/test",
    price: 1000,
    listPrice: 1200,
    releaseDate: "2024-01-01",
    volume: 50,
    reviewCount: 10,
    reviewAverageScore: 4.5,
    makers: [{ id: 1, name: "テスト作者" }],
    genres: [{ id: 1, name: "テストジャンル" }],
    series: [{ id: 1, name: "テストシリーズ" }],
  };

  const mockBreadcrumbItems: BreadcrumbItem[] = [
    { label: "作品詳細", href: "/doujinshi/works" },
    { label: "テスト作品", current: true },
  ];

  describe("generateProductSchema", () => {
    it("should generate a valid Product schema", () => {
      const result = generateProductSchema(
        mockWorkData,
        "https://example.com/work/123",
      );

      expect(result).toMatchObject({
        "@context": "https://schema.org",
        "@type": "Product",
        name: "テスト同人誌作品",
        sku: "test-work-123",
        category: "Adult Content",
        inLanguage: "ja",
        contentRating: "adult",
      });

      expect(result.offers).toMatchObject({
        "@type": "Offer",
        priceCurrency: "JPY",
        price: 1000,
        availability: "https://schema.org/InStock",
      });

      expect(result.aggregateRating).toMatchObject({
        "@type": "AggregateRating",
        ratingValue: 4.5,
        reviewCount: 10,
        bestRating: 5,
        worstRating: 1,
      });

      expect(result.author).toMatchObject({
        "@type": "Organization",
        name: "テスト作者",
      });

      expect(result.genre).toEqual(["テストジャンル"]);
    });

    it("should handle missing optional fields gracefully", () => {
      const minimalWorkData: WorkData = {
        ...mockWorkData,
        volume: undefined,
        reviewCount: undefined,
        reviewAverageScore: undefined,
        makers: [],
      };

      const result = generateProductSchema(
        minimalWorkData,
        "https://example.com/work/123",
      );

      expect(result.aggregateRating).toBeUndefined();
      expect(result.author).toBeUndefined();
      expect(result.description).toContain("による同人誌作品");
    });
  });

  describe("generateOrganizationSchema", () => {
    it("should generate a valid Organization schema", () => {
      const maker = { id: 1, name: "テスト作者" };
      const result = generateOrganizationSchema(maker);

      expect(result).toMatchObject({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "テスト作者",
        url: "https://okazu-navi.com/doujinshi/makers/1",
      });

      expect(result.description).toContain(
        "テスト作者による同人誌作品の制作者ページ",
      );
    });

    it("should use custom description when provided", () => {
      const maker = { id: 1, name: "テスト作者" };
      const customDescription = "カスタム説明文";
      const result = generateOrganizationSchema(maker, customDescription);

      expect(result.description).toBe(customDescription);
    });
  });

  describe("generateBreadcrumbSchema", () => {
    it("should generate a valid BreadcrumbList schema", () => {
      const result = generateBreadcrumbSchema(mockBreadcrumbItems);

      expect(result).toMatchObject({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
      });

      expect(result.itemListElement).toHaveLength(3); // Home + 2 breadcrumb items
      expect(result.itemListElement[0]).toMatchObject({
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: "https://okazu-navi.com",
      });

      expect(result.itemListElement[1]).toMatchObject({
        "@type": "ListItem",
        position: 2,
        name: "作品詳細",
        item: "https://okazu-navi.com/doujinshi/works",
      });

      expect(result.itemListElement[2]).toMatchObject({
        "@type": "ListItem",
        position: 3,
        name: "テスト作品",
      });
      // Current item should not have an 'item' property
      expect(result.itemListElement[2]).not.toHaveProperty("item");
    });
  });

  describe("generateWebSiteSchema", () => {
    it("should generate a valid WebSite schema with search action", () => {
      const result = generateWebSiteSchema();

      expect(result).toMatchObject({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "おかずNavi",
        url: "https://okazu-navi.com",
        inLanguage: "ja",
      });

      expect(result.publisher).toMatchObject({
        "@type": "Organization",
        name: "おかずNavi",
      });

      expect(result.potentialAction).toMatchObject({
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://okazu-navi.com/doujinshi/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      });
    });
  });

  describe("generateAggregateRatingSchema", () => {
    it("should generate a valid AggregateRating schema", () => {
      const result = generateAggregateRatingSchema(10, 4.5);

      expect(result).toMatchObject({
        "@context": "https://schema.org",
        "@type": "AggregateRating",
        ratingValue: 4.5,
        reviewCount: 10,
        bestRating: 5,
        worstRating: 1,
      });
    });
  });

  describe("Schema validation", () => {
    it("should generate JSON-LD compatible schemas", () => {
      const productSchema = generateProductSchema(
        mockWorkData,
        "https://example.com/work/123",
      );
      const organizationSchema = generateOrganizationSchema(
        mockWorkData.makers[0] as { id: number; name: string },
      );
      const breadcrumbSchema = generateBreadcrumbSchema(mockBreadcrumbItems);
      const websiteSchema = generateWebSiteSchema();

      // All schemas should be serializable to JSON
      expect(() => JSON.stringify(productSchema)).not.toThrow();
      expect(() => JSON.stringify(organizationSchema)).not.toThrow();
      expect(() => JSON.stringify(breadcrumbSchema)).not.toThrow();
      expect(() => JSON.stringify(websiteSchema)).not.toThrow();

      // All schemas should have required @context and @type properties
      const schemas = [
        productSchema,
        organizationSchema,
        breadcrumbSchema,
        websiteSchema,
      ];
      for (const schema of schemas) {
        expect(schema).toHaveProperty("@context", "https://schema.org");
        expect(schema).toHaveProperty("@type");
      }
    });

    it("should handle adult content appropriately", () => {
      const productSchema = generateProductSchema(
        mockWorkData,
        "https://example.com/work/123",
      );

      expect(productSchema.contentRating).toBe("adult");
      expect(productSchema.audience).toMatchObject({
        "@type": "Audience",
        audienceType: "adult",
        suggestedMinAge: 18,
      });
    });
  });
});
