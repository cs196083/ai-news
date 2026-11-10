import "server-only";
import { count, eq } from "drizzle-orm";
import { db } from "./index";
import { categories } from "./schema";

export const DEFAULT_CATEGORIES = [
  "기술·원리",
  "활용·도구",
  "교육·학습",
  "윤리·안전·저작권",
  "정책·규제",
  "산업·진로",
] as const;

/**
 * 사용자의 카테고리가 하나도 없으면 기본 카테고리를 만든다 (최초 접근 시 1회).
 * 사용자가 카테고리를 전부 지우면 다음 접근 때 기본값이 다시 생긴다.
 * '미분류'는 카테고리 행이 아니라 articles.category_id = null 로 표현한다.
 */
export async function ensureDefaultCategories(userId: string) {
  const [{ value }] = await db
    .select({ value: count() })
    .from(categories)
    .where(eq(categories.userId, userId));
  if (value > 0) return;

  await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((name) => ({ userId, name })))
    .onConflictDoNothing({ target: [categories.userId, categories.name] });
}
