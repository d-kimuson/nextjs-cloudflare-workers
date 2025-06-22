import type { WorkItem } from "../works/works.model";

export type MakerItem = {
  id: number;
  name: string;
};

export type MakerWithStats = MakerItem & {
  workCount: number;
};

export type MakerItemDetail = MakerItem & {
  works: WorkItem[];
};
