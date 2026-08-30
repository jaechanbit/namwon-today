import type { SourceConfig } from "../types.js";

const sharedSelectors: SourceConfig["selectors"] = {
  listRow: "table.bbs_table tbody > tr",
  pinned: "td.num.icoNotice",
  titleLink: "td.title > a[href]",
  department: "td[data-cell-header='담당부서'], td[data-cell-header='제공부서']",
  registeredDate: "td.date",
  attachmentPresent: "td.file .icon_file",
  detailRoot: "table.view_table",
  detailTitle: "thead .title > strong",
  detailBody: "td.view_con",
  detailInfoItem: ".info_list > li",
  attachmentLink: "ul.file_list > li span.text > a[href]",
  eventCategory: "td.event",
  eventStartDate: "td[data-cell-header='시작일']",
  eventEndDate: "td[data-cell-header='종료일']",
  eventStatus: "td[data-cell-header='상태']",
};
const source = (id: string, name: string, sourceType: string, boardUid: string, menuUid: string,
  adapter: SourceConfig["adapter"] = "standard", sort = false): SourceConfig => ({
  id, name, sourceType, boardUid, menuUid, adapter,
  listUrl: `https://www.namwon.go.kr/board/post/list.do?boardUid=${boardUid}&menuUid=${menuUid}${sort ? "&sort=registerDt,desc" : ""}`,
  selectors: { ...sharedSelectors },
});
export const SOURCES: readonly SourceConfig[] = [
  source("notices", "공지사항", "notice", "ff8080818ea1b850018ea1e3e9ad0081", "ff8080818e3beff0018e4075e410006e"),
  source("town_news", "읍면동소식", "townNews", "ff8080818f2717db018f2c6a0b9e036d", "ff8080818e3beff0018e407625450070"),
  source("events", "공연·행사", "event", "ff8080818ea1fec5018ea23d867e002b", "ff8080818e3beff0018e40767c3d0074", "events"),
  source("jobs", "시험채용", "recruitment", "ff8080818ea1fec5018ea23e8f1e002d", "ff8080818e3beff0018e4076a5e00076", "standard", true),
  source("public_notices", "고시공고", "publicNotice", "ff8080818ea1fec5018ea24137680031", "ff8080818e3beff0018e4077131b007a", "standard", true),
  source("press_releases", "보도자료", "pressRelease", "ff8080818ea1fec5018ea24651660037", "ff8080818e3beff0018e407936b40088"),
] as const;
