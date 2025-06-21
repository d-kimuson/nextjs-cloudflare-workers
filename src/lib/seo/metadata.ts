import type { Metadata } from "next";
import { SITE_CONFIG } from "../constants/site";

export interface PageMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  prev?: string;
  next?: string;
}

/**
 * 共通のページメタデータを生成する
 */
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    noindex = false,
    ogImage = "/og-image.jpg",
    ogType = "website",
    publishedTime,
    modifiedTime,
    authors = [],
    section,
    tags = [],
    prev,
    next,
  } = options;

  // タイトルが長すぎる場合は短縮
  const pageTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title;

  // 説明文が長すぎる場合は短縮
  const pageDescription =
    description.length > 160
      ? `${description.substring(0, 157)}...`
      : description;

  // キーワード統合
  const allKeywords = [...new Set([...SITE_CONFIG.keywords, ...keywords])];

  const metadata: Metadata = {
    title: pageTitle,
    description: pageDescription,
    keywords: allKeywords,
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          nocache: false,
          googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    alternates: {
      canonical: canonical || undefined,
      languages: {
        "ja-JP": canonical || undefined,
      },
      ...(prev && { prev }),
      ...(next && { next }),
    },
    openGraph: {
      type: ogType,
      locale: SITE_CONFIG.locale,
      siteName: SITE_CONFIG.siteName,
      title: pageTitle,
      description: pageDescription,
      url: canonical,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors.length > 0 && { authors }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: "summary_large_image",
      site: "@okazu_navi",
      creator: "@okazu_navi",
      title:
        pageTitle.length > 70 ? `${pageTitle.substring(0, 67)}...` : pageTitle,
      description:
        pageDescription.length > 125
          ? `${pageDescription.substring(0, 122)}...`
          : pageDescription,
      images: [ogImage],
    },
  };

  return metadata;
}

/**
 * 作品詳細ページ用のメタデータを生成する
 */
export function generateWorkMetadata(work: {
  id: string;
  title: string;
  price: number;
  listPrice: number;
  largeImageUrl: string;
  releaseDate: string;
  reviewCount?: number;
  reviewAverageScore?: number;
  makers: Array<{ name: string }>;
  genres: Array<{ name: string }>;
}): Metadata {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(price);
  };

  const rjCode = work.id;
  const makerName = work.makers.length > 0 ? work.makers[0]?.name || "" : "";
  const title = `[${rjCode}][${makerName}] ${work.title}`;

  const description = `${work.title}のダウンロード情報。価格${formatPrice(work.price)}${
    work.listPrice !== work.price
      ? `（定価${formatPrice(work.listPrice)}から${Math.round(
          ((work.listPrice - work.price) / work.listPrice) * 100,
        )}%OFF）`
      : ""
  }。正規ダウンロード・安全な購入はこちらから。${
    work.reviewCount && work.reviewAverageScore
      ? `評価★${work.reviewAverageScore.toFixed(1)}（${work.reviewCount}件）`
      : ""
  }`;

  const workUrl = `${SITE_CONFIG.url}/doujinshi/works/${work.id}`;
  const keywords = [
    rjCode,
    makerName,
    work.title,
    "同人誌",
    "ダウンロード",
    "FANZA",
    "正規購入",
    ...work.genres.map((g) => g.name),
  ].filter(Boolean);

  return generatePageMetadata({
    title: title.length > 60 ? `${work.title} | ${makerName}` : title,
    description,
    keywords,
    canonical: workUrl,
    ogImage: work.largeImageUrl,
    ogType: "website",
    publishedTime: work.releaseDate,
    authors: work.makers.map((m) => m.name),
    tags: work.genres.map((g) => g.name),
  });
}

/**
 * 作者詳細ページ用のメタデータを生成する
 */
export function generateMakerMetadata(
  maker: { id: string; name: string; description?: string },
  totalWorks: number,
  page = 1,
): Metadata {
  const pageTitle = page > 1 ? ` - ${page}ページ目` : "";
  const pageUrl = `${SITE_CONFIG.url}/doujinshi/makers/${maker.id}${page > 1 ? `?page=${page}` : ""}`;

  const description = `${maker.name}の同人作品一覧ページ。${totalWorks}作品を掲載中。高品質な同人誌・エロ漫画を安全にダウンロード購入できる正規サイトへご案内します。`;

  const keywords = [
    maker.name,
    "制作者",
    "サークル",
    "同人誌",
    "作品一覧",
    "正規購入",
    "FANZA",
    "DLsite",
    "ダウンロード",
    "エロ漫画",
  ];

  return generatePageMetadata({
    title: `${maker.name}の同人作品${pageTitle}`,
    description,
    keywords,
    canonical: pageUrl,
    ogType: "profile",
    prev:
      page > 2
        ? `${SITE_CONFIG.url}/doujinshi/makers/${maker.id}?page=${page - 1}`
        : page > 1
          ? `${SITE_CONFIG.url}/doujinshi/makers/${maker.id}`
          : undefined,
    next: undefined, // 次ページがあるかは呼び出し元で判断
  });
}

/**
 * ジャンル詳細ページ用のメタデータを生成する
 */
export function generateGenreMetadata(
  genre: { id: string; name: string; description?: string },
  totalWorks: number,
  page = 1,
): Metadata {
  const pageTitle = page > 1 ? ` - ${page}ページ目` : "";
  const pageUrl = `${SITE_CONFIG.url}/doujinshi/genres/${genre.id}${page > 1 ? `?page=${page}` : ""}`;

  const description = `${genre.name}ジャンルの同人誌・エロ漫画一覧。${totalWorks}作品を掲載中。${genre.name}の人気作品を安全な正規サイトでダウンロード購入できます。`;

  const keywords = [
    genre.name,
    "ジャンル",
    "同人誌",
    "エロ漫画",
    "作品一覧",
    "正規購入",
    "FANZA",
    "DLsite",
    "カテゴリ",
    "タグ",
  ];

  return generatePageMetadata({
    title: `${genre.name}の同人作品${pageTitle}`,
    description,
    keywords,
    canonical: pageUrl,
    section: genre.name,
    tags: [genre.name],
    prev:
      page > 2
        ? `${SITE_CONFIG.url}/doujinshi/genres/${genre.id}?page=${page - 1}`
        : page > 1
          ? `${SITE_CONFIG.url}/doujinshi/genres/${genre.id}`
          : undefined,
    next: undefined, // 次ページがあるかは呼び出し元で判断
  });
}
