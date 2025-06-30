import { pagesPath } from "@/lib/$path";
import { urlObjectToString } from "@/lib/path/urlObjectToString";

export interface BreadcrumbItem {
  href?: string;
  label: string;
  current?: boolean;
}

/**
 * Generate breadcrumb items for works detail page
 */
export function generateWorkBreadcrumbs(workTitle: string): BreadcrumbItem[] {
  return [
    {
      label: "同人誌",
      href: "/doujinshi",
    },
    {
      label: "作品一覧",
      href: "/doujinshi/works",
    },
    {
      label:
        workTitle.length > 20 ? `${workTitle.substring(0, 20)}...` : workTitle,
      current: true,
    },
  ];
}

/**
 * Generate breadcrumb items for maker detail page
 */
export function generateMakerBreadcrumbs(makerName: string): BreadcrumbItem[] {
  return [
    {
      label: "同人誌",
      href: "/doujinshi",
    },
    {
      label: "作者一覧",
      href: urlObjectToString(pagesPath.doujinshi.makers.$url()),
    },
    {
      label: makerName,
      current: true,
    },
  ];
}

/**
 * Generate breadcrumb items for genre detail page
 */
export function generateGenreBreadcrumbs(genreName: string): BreadcrumbItem[] {
  return [
    {
      label: "同人誌",
      href: "/doujinshi",
    },
    {
      label: "ジャンル一覧",
      href: urlObjectToString(pagesPath.doujinshi.genres.$url()),
    },
    {
      label: genreName,
      current: true,
    },
  ];
}

/**
 * Generate breadcrumb items for series detail page
 */
export function generateSeriesBreadcrumbs(
  seriesName: string,
): BreadcrumbItem[] {
  return [
    {
      label: "同人誌",
      href: "/doujinshi",
    },
    {
      label: "シリーズ一覧",
      href: "/doujinshi/series",
    },
    {
      label: seriesName,
      current: true,
    },
  ];
}

/**
 * Generate breadcrumb items for makers list page
 */
export function generateMakersListBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      label: "同人誌",
      href: "/doujinshi",
    },
    {
      label: "作者一覧",
      current: true,
    },
  ];
}

/**
 * Generate breadcrumb items for genres list page
 */
export function generateGenresListBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      label: "同人誌",
      href: "/doujinshi",
    },
    {
      label: "ジャンル一覧",
      current: true,
    },
  ];
}

/**
 * Generate breadcrumb items for series list page
 */
export function generateSeriesListBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      label: "同人誌",
      href: "/doujinshi",
    },
    {
      label: "シリーズ一覧",
      current: true,
    },
  ];
}

/**
 * Generate breadcrumb items for search page
 */
export function generateSearchBreadcrumbs(query?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      label: "同人誌",
      href: "/doujinshi",
    },
    {
      label: "検索結果",
      current: !query,
    },
  ];

  if (query) {
    items.push({
      label: `"${query}"の検索結果`,
      current: true,
    });
  }

  return items;
}

/**
 * Generate breadcrumb items for daily ranking page
 */
export function generateDailyRankingBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      label: "同人誌",
      href: "/doujinshi",
    },
    {
      label: "デイリーランキング",
      current: true,
    },
  ];
}

/**
 * Generate breadcrumb items for new releases page
 */
export function generateNewReleasesBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      label: "同人誌",
      href: "/doujinshi",
    },
    {
      label: "新着作品",
      current: true,
    },
  ];
}

/**
 * Generate breadcrumb items for doujinshi main page
 */
export function generateDoujinshiBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      label: "同人誌",
      current: true,
    },
  ];
}

/**
 * Generate breadcrumb items for mypage
 */
export function generateMypageBreadcrumbs(): BreadcrumbItem[] {
  return [
    {
      label: "マイページ",
      current: true,
    },
  ];
}
