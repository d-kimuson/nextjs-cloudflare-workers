import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const getDb = (database: D1Database) => {
  return drizzle(database, { schema });
};

export type DB = ReturnType<typeof getDb>;
