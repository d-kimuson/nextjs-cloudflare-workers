// Export all structured data utilities
export * from "./types";
export * from "./generators";

// Re-export commonly used functions
export {
  createOrganizationSchema,
  createWebSiteSchema,
  createProductSchema,
  createBreadcrumbSchema,
  createWebPageSchema,
  createCollectionPageSchema,
  createArticleSchema,
  createFAQSchema,
  createStructuredDataScript,
  formatStructuredDataForMetadata,
} from "./generators";
