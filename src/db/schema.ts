import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// user_id는 모두 Clerk 사용자 ID(문자열)이다. 모든 조회·변경은 user_id로 제한해야 한다.

export const categories = pgTable(
  "categories",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    name: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("categories_user_name_uq").on(t.userId, t.name)],
);

export const articles = pgTable(
  "articles",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    originalTitle: text("original_title").notNull(),
    originalUrl: text("original_url").notNull(),
    source: text().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    // RSS 본문 발췌(태그 제거). Claude 번역·요약 전에는 카드 요약 대체값이자 Claude 입력으로 쓴다.
    excerpt: text(),
    // null = 아직 Claude로 번역·요약하지 않음
    titleKo: text("title_ko"),
    summaryKo: text("summary_ko"),
    // null = '미분류'. 카테고리를 삭제하면 해당 기사는 자동으로 null(미분류)이 된다.
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // 같은 사용자의 같은 기사는 한 번만 저장 (Claude 재호출 방지의 기준)
    unique("articles_user_url_uq").on(t.userId, t.originalUrl),
    index("articles_user_category_idx").on(t.userId, t.categoryId),
    index("articles_user_published_idx").on(t.userId, t.publishedAt),
  ],
);

export const notionSaves = pgTable("notion_saves", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  // 기사당 저장 기록은 하나만 (Notion 중복 저장 방지)
  articleId: integer("article_id")
    .notNull()
    .unique()
    .references(() => articles.id, { onDelete: "cascade" }),
  notionPageUrl: text("notion_page_url").notNull(),
  savedAt: timestamp("saved_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type NotionSave = typeof notionSaves.$inferSelect;
