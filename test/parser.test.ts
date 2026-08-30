import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { SOURCES } from "../src/config/sources.js";
import { parseDetail, parseList } from "../src/parsers/board-parser.js";
import { makeStableKey, normalizeDate } from "../src/utils.js";

const fixture = async (name: string) => readFile(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), "utf8");
const source = (id: string) => {
  const found = SOURCES.find((item) => item.id === id);
  assert.ok(found); return found;
};

test("고정 공지를 제외하고 일반 게시물을 파싱한다", async () => {
  const posts = parseList(source("notices"), await fixture("notices-list.html"), 5);
  assert.equal(posts.length, 1); assert.equal(posts[0]?.postUid, "normal-1");
  assert.equal(posts[0]?.department, "민원과"); assert.equal(posts[0]?.registeredDate, "2026-08-28");
  assert.equal(posts[0]?.hasAttachments, false); assert.equal(posts[0]?.stableKey, "notices:normal-1");
});

test("공연·행사 목록은 목록 등록일과 담당부서를 비워 상세 파싱에 맡긴다", async () => {
  const [post] = parseList(source("events"), await fixture("events-list.html"), 5);
  assert.equal(post?.registeredDate, null); assert.equal(post?.department, null);
  assert.equal(post?.hasAttachments, true);
  assert.equal(post?.eventCategory, "행사"); assert.equal(post?.eventStartDate, "2026-08-29");
  assert.equal(post?.eventEndDate, "2026-08-29"); assert.equal(post?.eventStatus, "종료");
});

test("상세 본문, 메타데이터와 첨부 URL만 추출한다", async () => {
  const url = "https://www.namwon.go.kr/board/post/view.do?postUid=normal-1";
  const detail = parseDetail(source("notices"), await fixture("notice-detail.html"), url);
  assert.equal(detail.originalTitle, "일반 게시물"); assert.equal(detail.department, "민원과");
  assert.equal(detail.administrativePhone, "063-620-6105"); assert.equal(detail.registeredDate, "2026-08-28");
  assert.equal(detail.originalBody, "메뉴와 푸터가 아닌 게시물 본문입니다.");
  assert.equal(detail.bodyMissing, false);
  assert.deepEqual(detail.attachments, [{ name: "안내문.hwpx", url: "https://www.namwon.go.kr/board/post/download.do?atchFileUid=file-1" }]);
});

test("날짜 정규화와 postUid 없는 stable key가 결정적이다", () => {
  assert.equal(normalizeDate("등록일 2026년 8월 3일"), "2026-08-03");
  assert.equal(normalizeDate("invalid"), null);
  assert.equal(makeStableKey("special", "", "https://example.com/a"), makeStableKey("special", "", "https://example.com/a"));
});
