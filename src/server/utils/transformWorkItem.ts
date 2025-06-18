import type { WorkItem } from "../../components/works/WorksList";

// データベースの生データの型定義
export type RawWork = {
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
  sampleLargeImages?: Array<{
    imageUrl: string;
    order: number;
  }>;
};

// データベースの生データをWorkItemに変換するユーティリティ関数
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
      .filter(
        (
          g
        ): g is typeof g & {
          genreId: number;
          genre: NonNullable<typeof g.genre>;
        } => g.genreId !== null && g.genre !== null
      )
      .map((g) => ({
        id: String(g.genreId),
        name: g.genre.name,
      })),
    makers: rawWork.makers
      .filter(
        (
          m
        ): m is typeof m & {
          makerId: number;
          maker: NonNullable<typeof m.maker>;
        } => m.makerId !== null && m.maker !== null
      )
      .map((m) => ({
        id: String(m.makerId),
        name: m.maker.name,
      })),
    series: rawWork.series
      .filter(
        (
          s
        ): s is typeof s & {
          seriesId: number;
          series: NonNullable<typeof s.series>;
        } => s.seriesId !== null && s.series !== null
      )
      .map((s) => ({
        id: String(s.seriesId),
        name: s.series.name,
      })),
    sampleLargeImages: rawWork.sampleLargeImages ?? [],
  };
};
