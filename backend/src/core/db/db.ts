import { createClient } from "@libsql/client";
import { config } from "../../config";
import { drizzle } from "drizzle-orm/libsql";

if (!config.dbUrl || !config.dbToken) {
  throw new Error("DB_URL or DB_TOKEN is not set");
}

const client = createClient({
  url: config.dbUrl,
  authToken: config.dbToken
});

export const db = drizzle(client);