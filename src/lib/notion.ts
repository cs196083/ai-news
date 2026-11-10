import "server-only";
import { Client } from "@notionhq/client";

// 저장 대상 Notion 데이터베이스의 속성 이름 (데이터베이스와 정확히 같아야 한다. "카데고리" 철자 그대로).
const PROP = {
  title: "제목",
  summary: "요약",
  category: "카데고리",
  source: "출처",
  date: "날짜",
} as const;

export type NotionArticle = {
  title: string;
  summary: string | null;
  category: string | null;
  source: string;
  url: string;
  publishedAt: Date;
};

let client: Client | undefined;
let dataSourceId: Promise<string> | undefined;

function getClient() {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not set");
  return (client ??= new Client({ auth: token }));
}

/** NOTION_DATABASE_ID에는 ID뿐 아니라 데이터베이스 주소 전체가 들어 있어도 된다. */
function parseDatabaseId(raw: string | undefined) {
  const match = raw
    ?.split("?")[0]
    .replace(/-/g, "")
    .match(/[0-9a-f]{32}(?![0-9a-f])/i);
  if (!match) throw new Error("NOTION_DATABASE_ID is not set or invalid");
  return match[0];
}

/** 데이터베이스의 첫 번째 데이터 소스 ID (Notion API 최신 버전은 페이지를 데이터 소스 아래에 만든다). */
function getDataSourceId() {
  dataSourceId ??= getClient()
    .databases.retrieve({
      database_id: parseDatabaseId(process.env.NOTION_DATABASE_ID),
    })
    .then((db) => {
      const id = "data_sources" in db ? db.data_sources[0]?.id : undefined;
      if (!id) throw new Error("Notion database has no data source");
      return id;
    })
    .catch((e) => {
      dataSourceId = undefined; // 실패한 결과를 캐시하지 않는다
      throw e;
    });
  return dataSourceId;
}

const richText = (text: string) => [
  // Notion은 rich_text 한 덩어리를 2000자까지만 받는다.
  { type: "text" as const, text: { content: text.slice(0, 2000) } },
];

/** 뉴스 한 건을 Notion 데이터베이스에 새 페이지로 저장하고 페이지 주소를 돌려준다. */
export async function createNotionPage(article: NotionArticle) {
  const page = await getClient().pages.create({
    parent: { type: "data_source_id", data_source_id: await getDataSourceId() },
    properties: {
      [PROP.title]: { title: richText(article.title) },
      [PROP.summary]: { rich_text: richText(article.summary ?? "") },
      [PROP.source]: { select: { name: article.source } },
      [PROP.date]: { date: { start: article.publishedAt.toISOString() } },
      ...(article.category
        ? { [PROP.category]: { select: { name: article.category } } }
        : {}),
    },
    // 데이터베이스에 링크 속성이 없어서 원문 링크는 페이지 본문에 넣는다.
    children: [
      {
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: { content: "원문 보기 ↗", link: { url: article.url } },
            },
          ],
        },
      },
    ],
  });
  if (!("url" in page)) throw new Error("Notion did not return a page url");
  return { id: page.id, url: page.url };
}

/** 방금 만든 페이지를 휴지통으로 보낸다 (동시 저장으로 중복 생성된 페이지 정리용). */
export async function trashNotionPage(pageId: string) {
  await getClient().pages.update({ page_id: pageId, in_trash: true });
}
