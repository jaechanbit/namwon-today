import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { AttachmentBadge, EventInfo, SourceBadge } from "@/components/article-parts";
import { formatShortDate } from "@/lib/format";
import type { WebArticle } from "@/lib/web-types";
export function ArticleCard({ article, featured = false }: { article: WebArticle; featured?: boolean }) {
  return <article className={`article-card ${featured ? "featured" : ""}`}><Link href={`/news/${article.id}`} className="card-link"><div className="card-top"><SourceBadge source={article.source}/><time dateTime={article.registered_date}>{formatShortDate(article.registered_date)}</time></div><h3>{article.original_title}</h3>{article.department && <p className="department">{article.department}</p>}<EventInfo article={article} compact/><div className="card-bottom">{article.has_attachments ? <AttachmentBadge count={article.attachments.length}/> : <span/>}<ArrowIcon className="arrow-icon"/></div></Link></article>;
}
