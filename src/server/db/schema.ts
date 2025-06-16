import { relations } from "drizzle-orm";
import {
  int,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// 作品テーブル
export const worksTable = sqliteTable("works", {
  id: text().primaryKey(), // DMM APIのcontent_id
  title: text().notNull(),
  volume: int(), // ページ数
  reviewCount: int(), // レビュー数
  reviewAverageScore: real(), // レビュー平均スコア
  affiliateUrl: text().notNull(), // アフィリエイトURL
  listImageUrl: text().notNull(), // リストページ用画像URL
  smallImageUrl: text(), // 画像URL(小)
  largeImageUrl: text().notNull(), // 画像URL(大)
  price: int().notNull(), // 価格
  listPrice: int().notNull(), // 現在価格
  releaseDate: text().notNull(), // date
  createdAt: text().default("CURRENT_TIMESTAMP"),
  updatedAt: text().default("CURRENT_TIMESTAMP"),
});

export const worksTableRelations = relations(worksTable, ({ many }) => ({
  genres: many(workGenreTable),
  makers: many(workMakerTable),
  series: many(workSeriesTable),
  sampleSmallImages: many(sampleSmallImagesTable),
  sampleLargeImages: many(sampleLargeImagesTable),
}));

// 試し読み画像(小)テーブル
export const sampleSmallImagesTable = sqliteTable(
  "sample_small_images",
  {
    workId: text().references(() => worksTable.id),
    imageUrl: text().notNull(),
    order: int().notNull(), // 表示順序
    createdAt: text().default("CURRENT_TIMESTAMP"),
  },
  (t) => [primaryKey({ columns: [t.workId, t.order] })]
);

export const sampleSmallImagesTableRelations = relations(
  sampleSmallImagesTable,
  ({ one }) => ({
    work: one(worksTable, {
      fields: [sampleSmallImagesTable.workId],
      references: [worksTable.id],
    }),
  })
);

// 試し読み画像(大)テーブル
export const sampleLargeImagesTable = sqliteTable(
  "sample_large_images",
  {
    workId: text().references(() => worksTable.id),
    imageUrl: text().notNull(),
    order: int().notNull(), // 表示順序
    createdAt: text().default("CURRENT_TIMESTAMP"),
  },
  (t) => [primaryKey({ columns: [t.workId, t.order] })]
);

export const sampleLargeImagesTableRelations = relations(
  sampleLargeImagesTable,
  ({ one }) => ({
    work: one(worksTable, {
      fields: [sampleLargeImagesTable.workId],
      references: [worksTable.id],
    }),
  })
);

// genreテーブル
export const genresTable = sqliteTable("genres", {
  id: int().primaryKey(), // DMM API の genre_id
  name: text().notNull(),
  createdAt: text().default("CURRENT_TIMESTAMP"),
});

export const genresTableRelations = relations(genresTable, ({ many }) => ({
  works: many(workGenreTable),
}));

export const workGenreTable = sqliteTable(
  "work_genre",
  {
    workId: text().references(() => worksTable.id),
    genreId: int().references(() => genresTable.id),
    createdAt: text().default("CURRENT_TIMESTAMP"),
  },
  (t) => [primaryKey({ columns: [t.workId, t.genreId] })]
);

export const workGenreTableRelations = relations(workGenreTable, ({ one }) => ({
  work: one(worksTable, {
    fields: [workGenreTable.workId],
    references: [worksTable.id],
  }),
  genre: one(genresTable, {
    fields: [workGenreTable.genreId],
    references: [genresTable.id],
  }),
}));

// makersテーブル
export const makersTable = sqliteTable("makers", {
  id: int().primaryKey(), // DMM API の maker_id
  name: text().notNull(),
  createdAt: text().default("CURRENT_TIMESTAMP"),
  updatedAt: text().default("CURRENT_TIMESTAMP"),
});

export const makersTableRelations = relations(makersTable, ({ many }) => ({
  works: many(workMakerTable),
}));

export const workMakerTable = sqliteTable(
  "work_maker",
  {
    workId: text().references(() => worksTable.id),
    makerId: int().references(() => makersTable.id),
    createdAt: text().default("CURRENT_TIMESTAMP"),
  },
  (t) => [primaryKey({ columns: [t.workId, t.makerId] })]
);

export const workMakerTableRelations = relations(workMakerTable, ({ one }) => ({
  work: one(worksTable, {
    fields: [workMakerTable.workId],
    references: [worksTable.id],
  }),
  maker: one(makersTable, {
    fields: [workMakerTable.makerId],
    references: [makersTable.id],
  }),
}));

// シリーズテーブル
export const seriesTable = sqliteTable("series", {
  id: int().primaryKey(), // DMM APIのseries_id
  name: text().notNull(),
  createdAt: text().default("CURRENT_TIMESTAMP"),
});

export const seriesTableRelations = relations(seriesTable, ({ many }) => ({
  works: many(workSeriesTable),
}));

export const workSeriesTable = sqliteTable(
  "work_series",
  {
    workId: text().references(() => worksTable.id),
    seriesId: int().references(() => seriesTable.id),
    createdAt: text().default("CURRENT_TIMESTAMP"),
  },
  (t) => [primaryKey({ columns: [t.workId, t.seriesId] })]
);

export const workSeriesTableRelations = relations(
  workSeriesTable,
  ({ one }) => ({
    work: one(worksTable, {
      fields: [workSeriesTable.workId],
      references: [worksTable.id],
    }),
    series: one(seriesTable, {
      fields: [workSeriesTable.seriesId],
      references: [seriesTable.id],
    }),
  })
);
