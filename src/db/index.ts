import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다 (.env.local).");
}

export const db = drizzle(neon(url), { schema });
