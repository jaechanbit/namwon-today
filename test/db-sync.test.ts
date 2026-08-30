import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { SOURCES } from "../src/config/sources.js";
import { MemoryArticleRepository } from "../src/db/memory-repository.js";
import { syncCollection } from "../src/db/sync-service.js";
import { readSupabaseConfig } from "../src/db/supabase-repository.js";
import { parseDetail } from "../src/parsers/board-parser.js";
import type { CollectionResult, NamwonArticle } from "../src/types.js";

const noticeSource = SOURCES.find((source) => source.id === "notices")!;
const article = (postUid: string, overrides: Partial<NamwonArticle> = {}): NamwonArticle => ({
  stableKey: `notices:${postUid}`, sourceId: "notices", sourceName: "공지사항", postUid,
  originalTitle: `제목 ${postUid}`, originalBody: "원문 본문", bodyMissing: false,
  department: "민원과", administrativePhone: "063-620-0000", registeredDate: "2026-08-30",
  detailUrl: `https://www.namwon.go.kr/board/post/view.do?postUid=${postUid}`, attachments: [],
  collectedAt: "2026-08-30T14:00:00.000Z", eventStartDate: null, eventEndDate: null,
  eventStatus: null, eventCategory: null, ...overrides,
});
const collection = (articles: NamwonArticle[]): CollectionResult => ({ articles, failures: [], stats: {
  total: articles.length, success: articles.length, failed: 0,
  sources: { notices: { requested: articles.length, success: articles.length, failed: 0 } },
} });

test("Supabase 환경변수 누락과 migration 핵심 constraint를 검증한다", async () => {
  assert.throws(() => readSupabaseConfig({}), /SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY/);
  const sql = await readFile(fileURLToPath(new URL("../supabase/migrations/20260830140000_create_collection_schema.sql", import.meta.url)), "utf8");
  assert.match(sql, /unique \(source_id, external_post_uid\)/i);
  assert.match(sql, /unique \(source_id, detail_url\)/i);
  assert.match(sql, /sync_namwon_article/);
});

test("TEST 1/2: 빈 DB는 NEW, 동일 재수집은 중복 없이 UNCHANGED", async () => {
  const repository = new MemoryArticleRepository(); const input = collection([article("a"), article("b")]);
  const first = await syncCollection(repository, [noticeSource], input);
  assert.equal(first.newCount, 2); assert.equal(repository.articles.size, 2);
  const secondInput = collection(input.articles.map((item) => ({ ...item, collectedAt: "2026-08-30T15:00:00.000Z" })));
  const second = await syncCollection(repository, [noticeSource], secondInput);
  assert.equal(second.unchangedCount, 2); assert.equal(second.newCount, 0); assert.equal(repository.articles.size, 2);
  const stored = [...repository.articles.values()][0];
  assert.equal(stored?.firstSeenAt, "2026-08-30T14:00:00.000Z"); assert.equal(stored?.lastSeenAt, "2026-08-30T15:00:00.000Z");
});

test("TEST 3: 제목이나 본문 변경은 UPDATED", async () => {
  const repository = new MemoryArticleRepository(); await syncCollection(repository, [noticeSource], collection([article("a")]));
  const result = await syncCollection(repository, [noticeSource], collection([article("a", { originalTitle: "변경된 제목" })]));
  assert.equal(result.updatedCount, 1); assert.equal(result.unchangedCount, 0);
});

test("TEST 4: 본문 없이 첨부만 있는 상세도 성공하고 bodyMissing=true", async () => {
  const html = await readFile(fileURLToPath(new URL("./fixtures/attachment-only-detail.html", import.meta.url)), "utf8");
  const detail = parseDetail(noticeSource, html, "https://www.namwon.go.kr/board/post/view.do?postUid=only");
  assert.equal(detail.originalBody, null); assert.equal(detail.bodyMissing, true); assert.equal(detail.attachments.length, 1);
  const repository = new MemoryArticleRepository();
  const result = await syncCollection(repository, [noticeSource], collection([article("only", {
    originalBody: detail.originalBody, bodyMissing: detail.bodyMissing, attachments: detail.attachments,
  })]));
  assert.equal(result.newCount, 1); assert.equal(result.failedCount, 0);
});

test("TEST 5: 첨부 추가와 삭제는 UPDATED이며 최신 목록으로 교체", async () => {
  const repository = new MemoryArticleRepository();
  const one = { name: "a.hwp", url: "https://example.com/a" }; const two = { name: "b.pdf", url: "https://example.com/b" };
  await syncCollection(repository, [noticeSource], collection([article("a", { attachments: [one] })]));
  const added = await syncCollection(repository, [noticeSource], collection([article("a", { attachments: [one, two] })]));
  assert.equal(added.updatedCount, 1); assert.equal(repository.attachmentCount, 2);
  const removed = await syncCollection(repository, [noticeSource], collection([article("a", { attachments: [two] })]));
  assert.equal(removed.updatedCount, 1); assert.equal(repository.attachmentCount, 1);
});

test("TEST 6: 게시물 하나의 저장 실패가 다음 게시물 저장을 막지 않는다", async () => {
  const repository = new MemoryArticleRepository(); repository.failStableKeys.add("notices:bad");
  const result = await syncCollection(repository, [noticeSource], collection([article("bad"), article("good")]));
  assert.equal(result.failedCount, 1); assert.equal(result.newCount, 1); assert.equal(repository.articles.size, 1);
  assert.deepEqual(result.articles.map((item) => item.status), ["FAILED", "NEW"]);
});
