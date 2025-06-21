import React from "react";

interface StructuredDataProps {
  data: Record<string, unknown> | Record<string, unknown>[];
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
