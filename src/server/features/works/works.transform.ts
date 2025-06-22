import type { WorkItem, WorkItemDetail } from "./works.model";

// データベースの生データの型定義
type RawWork = {
  id: string;
  title: string;
  price: number;
  listPrice: number;
  listImageUrl: string;
  largeImageUrl: string;
  affiliateUrl: string;
  releaseDate: string;
  volume: number | null;
  reviewCount: number | null;
  reviewAverageScore: number | null;
  genres: Array<{
    genreId: number | null;
    genre: {
      id: number;
      name: string;
    } | null;
  }>;
  makers: Array<{
    makerId: number | null;
    maker: {
      id: number;
      name: string;
    } | null;
  }>;
  series: Array<{
    seriesId: number | null;
    series: {
      id: number;
      name: string;
    } | null;
  }>;
};

export const transformToWorkItem = (rawWork: RawWork): WorkItem => {
  return {
    id: rawWork.id,
    title: rawWork.title,
    price: rawWork.price,
    listPrice: rawWork.listPrice,
    listImageUrl: rawWork.listImageUrl,
    largeImageUrl: rawWork.largeImageUrl,
    affiliateUrl: rawWork.affiliateUrl,
    releaseDate: rawWork.releaseDate,
    volume: rawWork.volume,
    reviewCount: rawWork.reviewCount,
    reviewAverageScore: rawWork.reviewAverageScore,
    genres: rawWork.genres
      .map((g) => g.genre)
      .filter((g) => g !== null)
      .map((g) => ({
        id: g.id,
        name: g.name,
      })),
    makers: rawWork.makers
      .map((m) => m.maker)
      .filter((m) => m !== null)
      .map((m) => ({
        id: m.id,
        name: m.name,
      })),
    series: rawWork.series
      .map((s) => s.series)
      .filter((s) => s !== null)
      .map((s) => ({
        id: s.id,
        name: s.name,
      })),
  };
};

export const transformToWorkDetailItem = (
  rawWork: RawWork & {
    sampleLargeImages?: Array<{
      imageUrl: string;
      order: number;
    }>;
  }
): WorkItemDetail => {
  const workItem = transformToWorkItem(rawWork);
  return {
    ...workItem,
    sampleLargeImages: rawWork.sampleLargeImages ?? [],
  };
};
