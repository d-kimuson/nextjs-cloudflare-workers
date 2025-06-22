import type { SeriesItem } from "../series/series.model";

export type WorkItem = {
  id: string;
  title: string;
  volume?: number | null;
  reviewCount?: number | null;
  reviewAverageScore?: number | null;
  affiliateUrl: string;
  listImageUrl: string;
  smallImageUrl?: string | null;
  largeImageUrl: string;
  price: number;
  listPrice: number;
  releaseDate: string;

  // relations
  genres: Array<{
    id: number;
    name: string;
  }>;
  makers: Array<{
    id: number;
    name: string;
  }>;
  series: Array<SeriesItem>;
};

export type WorkItemDetail = WorkItem & {
  sampleLargeImages?: Array<{
    imageUrl: string;
    order: number;
  }>;
};
