export interface WorkItemWithMaker {
  id: string;
  title: string;
  price: number;
  listPrice: number;
  listImageUrl: string;
  largeImageUrl: string;
  affiliateUrl: string;
  releaseDate: string;
  volume?: number | null;
  reviewCount?: number | null;
  reviewAverageScore?: number | null;
  genres: Array<{
    id: string;
    name: string;
  }>;
  makers: Array<{
    id: string;
    name: string;
  }>;
  series: Array<{
    id: string;
    name: string;
  }>;
  maker: {
    id: number;
    name: string;
    totalScore: number;
    avgReviewScore: number | null;
    worksCount: number;
  };
}
