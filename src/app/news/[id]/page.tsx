import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AttachmentBadge, EventInfo, SourceBadge } from "@/components/article-parts";
import { Header } from "@/components/header";
import { ArrowIcon, PhoneIcon } from "@/components/icons";
import { getArticle, getArticles } from "@/lib/articles";
import { formatFullDate } from "@/lib/format";
export const dynamic = "force-static";
export const dynamicParams = false;
export async function generateStaticParams() { return (await getArticles()).map((article) => ({ id: article.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const article = await getArticle((await params).id); return { title: article?.original_title ?? "소식 상세" }; }
export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const article = await getArticle((await params).id); if (!article) notFound();
  return <><Header compact/><main className="page detail-page"><Link href="/news" className="back-link">← 전체소식</Link><article><header className="detail-header"><div className="detail-badges"><SourceBadge source={article.source}/>{article.has_attachments && <AttachmentBadge count={article.attachments.length}/>}</div><h1>{article.original_title}</h1><dl className="article-meta">{article.department && <div><dt>담당부서</dt><dd>{article.department}</dd></div>}<div><dt>등록일</dt><dd>{formatFullDate(article.registered_date)}</dd></div>{article.administrative_phone && <div><dt>행정전화</dt><dd><a href={`tel:${article.administrative_phone}`}><PhoneIcon/>{article.administrative_phone}</a></dd></div>}</dl><EventInfo article={article}/></header>{article.ai_summary ? <section className="ai-placeholder"><span>오늘남원 AI 핵심요약</span><p>{article.ai_summary.summary}</p>{article.ai_summary.key_points.length > 0 && <ul>{article.ai_summary.key_points.map((point) => <li key={point}>{point}</li>)}</ul>}<small>AI가 생성한 요약입니다. 정확한 내용은 원문을 확인하세요.</small></section> : <section className="ai-placeholder"><span>오늘남원 핵심요약</span><p>AI 요약을 준비하고 있습니다.</p></section>}<section className="article-body"><h2>원문 내용</h2>{article.original_body ? <p>{article.original_body}</p> : <div className="body-missing">본문 없이 첨부파일로 제공된 소식입니다.</div>}</section>{article.attachments.length > 0 && <section className="attachments"><h2>첨부파일 <span>{article.attachments.length}</span></h2><ul>{article.attachments.map((file) => <li key={file.id}><a href={file.file_url} target="_blank" rel="noopener noreferrer"><span className="file-extension">{file.file_extension?.toUpperCase() ?? "FILE"}</span><span>{file.file_name}</span><ArrowIcon/></a></li>)}</ul></section>}<footer className="source-panel"><div><strong>출처: 남원시</strong><p>이 정보는 남원시청에서 수집한 원문 행정정보입니다.</p></div><a href={article.detail_url} target="_blank" rel="noopener noreferrer">남원시 원문 보기 <ArrowIcon/></a></footer></article></main></>;
}
