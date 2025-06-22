import type { WorkItem } from "../works/works.model";

export type SeriesItem = {
  id: number;
  name: string;
};

export type SeriesItemDetail = SeriesItem & {
  works: WorkItem[];
  stats: {
    totalWorks: number;
    averageRating: number | null;
  };
};
