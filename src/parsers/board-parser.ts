import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import { ParseError } from "../errors.js";
import type { DetailArticle, ListArticle, SourceConfig } from "../types.js";
import { cleanText, makeStableKey, normalizeDate } from "../utils.js";

function metadata($: CheerioAPI, source: SourceConfig, label: string): string | null {
  const item = $(source.selectors.detailInfoItem)
    .filter((_, element) => cleanText($(element).find("strong").text()).startsWith(label)).first();
  return cleanText(item.find("span").first().text()) || null;
}
export function parseList(source: SourceConfig, html: string, limit = 5): ListArticle[] {
  const $ = cheerio.load(html); const allRows = $(source.selectors.listRow).toArray();
  if (allRows.length === 0) throw new ParseError("list", `${source.id}: no rows for ${source.selectors.listRow}`);
  const articles: ListArticle[] = [];
  for (const row of allRows) {
    const $row = $(row); const isPinned = $row.find(source.selectors.pinned).length > 0;
    if (isPinned) continue;
    const link = $row.find(source.selectors.titleLink).first();
    const href = link.attr("href"); const title = cleanText(link.attr("title") ?? link.text());
    if (!href || !title) continue;
    const detailUrl = new URL(href, source.listUrl).toString();
    const postUid = new URL(detailUrl).searchParams.get("postUid") ?? "";
    const department = cleanText($row.find(source.selectors.department).first().text())
      .replace(/^(담당부서|제공부서)\s*/, "") || null;
    const rawDate = cleanText($row.find(source.selectors.registeredDate).first().text());
    articles.push({ postUid, stableKey: makeStableKey(source.id, postUid, detailUrl), originalTitle: title,
      department, registeredDate: source.adapter === "events" ? null : normalizeDate(rawDate), detailUrl,
      hasAttachments: $row.find(source.selectors.attachmentPresent).length > 0, isPinned,
      eventCategory: source.adapter === "events" ? cleanText($row.find(source.selectors.eventCategory).text()) || null : null,
      eventStartDate: source.adapter === "events" ? normalizeDate(cleanText($row.find(source.selectors.eventStartDate).text())) : null,
      eventEndDate: source.adapter === "events" ? normalizeDate(cleanText($row.find(source.selectors.eventEndDate).text())) : null,
      eventStatus: source.adapter === "events" ? cleanText($row.find(source.selectors.eventStatus).text()) || null : null });
    if (articles.length >= limit) break;
  }
  if (articles.length === 0) throw new ParseError("list", `${source.id}: no general articles`);
  return articles;
}
export function parseDetail(source: SourceConfig, html: string, detailUrl: string): DetailArticle {
  const $ = cheerio.load(html); const root = $(source.selectors.detailRoot).first();
  if (root.length === 0) throw new ParseError("detail", `${source.id}: missing ${source.selectors.detailRoot}`);
  const originalTitle = cleanText(root.find(source.selectors.detailTitle).first().text());
  const originalBody = cleanText(root.find(source.selectors.detailBody).first().text());
  const registeredDate = normalizeDate(metadata($, source, "등록일") ?? "");
  if (!originalTitle) throw new ParseError("detail", `${source.id}: missing title`);
  if (!registeredDate) throw new ParseError("detail", `${source.id}: invalid registered date`);
  const attachments = root.find(source.selectors.attachmentLink).map((_, element) => {
    const link = $(element); const href = link.attr("href"); const name = cleanText(link.text());
    if (!href || !name) throw new ParseError("detail", `${source.id}: invalid attachment`);
    return { name, url: new URL(href, detailUrl).toString() };
  }).get();
  return { originalTitle, originalBody: originalBody || null, bodyMissing: !originalBody,
    department: metadata($, source, "담당부서") ?? metadata($, source, "제공부서"),
    administrativePhone: metadata($, source, "행정전화번호"), registeredDate, attachments };
}
