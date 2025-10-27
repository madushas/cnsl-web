import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const raw = process.env.DATABASE_URL || "";
const connectionString = raw.replace(/^["']|["']$/g, "").trim();
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const isValidPostgresUrl = (u: string) => {
  try {
    const url = new URL(u);
    return (
      (url.protocol === "postgres:" || url.protocol === "postgresql:") &&
      !!url.hostname
    );
  } catch {
    return false;
  }
};
if (!isValidPostgresUrl(connectionString)) {
  throw new Error("DATABASE_URL must be a valid postgres/postgresql URL");
}

export const db = drizzle(neon(connectionString), { schema });
export { schema };
