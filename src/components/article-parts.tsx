import { PaperclipIcon } from "@/components/icons";
import { formatShortDate } from "@/lib/format";
import type { WebArticle } from "@/lib/web-types";
const labels: Record<string, string> = { notices: "공지", town_news: "우리동네", events: "공연·행사", jobs: "채용", public_notices: "고시공고", press_releases: "보도자료" };
export function SourceBadge({ source }: { source: WebArticle["source"] }) { return <span className={`source-badge source-${source.code}`}>{labels[source.code] ?? source.name}</span>; }
export function AttachmentBadge({ count = 1 }: { count?: number }) { return <span className="attachment-badge"><PaperclipIcon/>첨부 {count > 1 ? count : ""}</span>; }
export function EventInfo({ article, compact = false }: { article: WebArticle; compact?: boolean }) {
  if (!article.event_start_date) return null;
  const period = article.event_end_date && article.event_end_date !== article.event_start_date ? `${formatShortDate(article.event_start_date)} – ${formatShortDate(article.event_end_date)}` : formatShortDate(article.event_start_date);
  return <div className={`event-info ${compact ? "compact" : ""}`}><span>{article.event_category ?? "행사"}</span><strong>{period}</strong>{article.event_status && <em>{article.event_status}</em>}</div>;
}
