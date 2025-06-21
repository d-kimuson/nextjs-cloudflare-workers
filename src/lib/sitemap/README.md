# Sitemap Implementation

This document describes the comprehensive sitemap implementation for the おかずNavi doujinshi affiliate site.

## Overview

The sitemap system is designed to help search engines efficiently discover and index all valuable content on the site, including works, makers, series, and genres. The implementation includes pagination support for large datasets and intelligent priority calculation based on content quality and popularity.

## Architecture

### Main Components

1. **Sitemap Index** (`/sitemap-index.xml`) - Central sitemap that references all other sitemaps
2. **Static Pages Sitemap** (`/sitemap.xml`) - Core site pages and navigation
3. **Works Sitemap** (`/sitemap-works.xml`) - Individual doujinshi works (paginated)
4. **Makers Sitemap** (`/sitemap-makers.xml`) - Creator/author pages (paginated)
5. **Series Sitemap** (`/sitemap-series.xml`) - Series collection pages
6. **Genres Sitemap** (`/sitemap-genres.xml`) - Genre category pages

### Pagination Strategy

- **Works**: 45,000 URLs per sitemap page
- **Makers**: 40,000 URLs per sitemap page
- **Series & Genres**: Single sitemap (typically smaller datasets)

URLs for paginated sitemaps:
- Page 1: `/sitemap-works.xml`
- Page 2+: `/sitemap-works.xml?page=2`

## Priority Calculation

### Works (0.5-1.0 priority range)
- **Base priority**: 0.5
- **Review count boost**: 
  - 200+ reviews: +0.4 (priority 0.9)
  - 100+ reviews: +0.3 (priority 0.8)
  - 50+ reviews: +0.2 (priority 0.7)
  - 20+ reviews: +0.1 (priority 0.6)
- **Review score boost**: 
  - 4.5+ average: +0.1
  - 4.0+ average: +0.05
- **Recency boost**: +0.1 for works released within 30 days

### Makers (0.4-1.0 priority range)
- **Base priority**: 0.4
- **Work count boost**:
  - 50+ works: 0.9
  - 20+ works: 0.8
  - 10+ works: 0.7
  - 5+ works: 0.6
- **Score boost**: High-scoring makers get +0.05 to +0.15
- **Review quality**: Average review scores and counts provide additional boost

### Genres (0.5-1.0 priority range)
- **Base priority**: 0.5
- **Work count boost**:
  - 5000+ works: 0.95
  - 2000+ works: 0.9
  - 1000+ works: 0.85
  - 500+ works: 0.8
- **Activity boost**: Recent releases and quality metrics

### Series (0.4-1.0 priority range)
- **Base priority**: 0.4
- **Work count and recency**: Similar to makers
- **Quality metrics**: Review scores and popularity

## Change Frequency

### Dynamic Calculation
- **Daily**: New releases, very active content
- **Weekly**: Popular content, active creators
- **Monthly**: Stable content, archived material

### Factors
- Recent activity (releases, updates)
- Popularity metrics (reviews, engagement)
- Content age and stability

## Caching Strategy

- **Production cache**: 6 hours browser, 12 hours CDN
- **Error fallback**: 5 minutes browser, 10 minutes CDN
- **Index cache**: Dynamic based on data freshness

## Error Handling

1. **Database failures**: Fallback to static sitemap structure
2. **Pagination errors**: 404 for invalid pages
3. **Data validation**: Sanitized URLs and safe date handling
4. **Graceful degradation**: Basic sitemap if advanced features fail

## Performance Optimizations

1. **Database indexing**: Optimized queries for sitemap generation
2. **Pagination**: Prevents memory issues with large datasets
3. **Selective fields**: Only fetch necessary data for sitemap
4. **Efficient ordering**: Most important content first

## SEO Benefits

### Crawl Budget Optimization
- **Priority signals**: Help search engines focus on valuable content
- **Change frequency**: Prevents unnecessary re-crawling of static content
- **Fresh content discovery**: Daily sitemaps for new releases

### Content Discovery
- **Comprehensive coverage**: All public content included
- **Logical structure**: Organized by content type
- **Update signals**: Accurate lastModified dates

### Performance Impact
- **Faster indexing**: Clear URL structure and priorities
- **Better ranking**: Fresh content and quality signals
- **Reduced server load**: Efficient crawling patterns

## Monitoring

### Key Metrics
- Sitemap generation time
- Error rates and fallback usage
- Search engine crawl patterns
- Index coverage in Google Search Console

### Alerts
- Database connection failures
- Sitemap generation errors
- Pagination threshold breaches
- Cache invalidation issues

## Maintenance

### Regular Tasks
1. Monitor sitemap sizes and pagination thresholds
2. Review priority calculations based on performance data
3. Update change frequencies based on content patterns
4. Validate XML format and structure

### Scaling Considerations
- Increase pagination limits if needed
- Add new content types as site grows
- Optimize database queries for larger datasets
- Consider sitemap compression for very large sites

## Files

- `/src/app/sitemap.ts` - Static pages sitemap
- `/src/app/sitemap-index.xml/route.ts` - Sitemap index
- `/src/app/sitemap-works.xml/route.ts` - Works sitemap
- `/src/app/sitemap-makers.xml/route.ts` - Makers sitemap
- `/src/app/sitemap-series.xml/route.ts` - Series sitemap
- `/src/app/sitemap-genres.xml/route.ts` - Genres sitemap
- `/src/lib/sitemap/utils.ts` - Utility functions
- `/public/robots.txt` - Sitemap references for search engines