import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

let client: ReturnType<typeof postgres> | null = null;

export function isDbEnabled(): boolean {
  return !!connectionString;
}

export function getDb() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!client) {
    client = postgres(connectionString, { max: 10 });
  }
  return drizzle(client, { schema });
}
