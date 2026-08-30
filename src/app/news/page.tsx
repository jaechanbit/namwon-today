import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { EmptyState } from "@/components/empty-state";
import { Header } from "@/components/header";
import { getArticles } from "@/lib/articles";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "전체소식" };
const filters = [{ label: "전체", code: "" }, { label: "공지", code: "notices" }, { label: "우리동네", code: "town_news" }, { label: "행사", code: "events" }, { label: "채용", code: "jobs" }, { label: "고시공고", code: "public_notices" }, { label: "보도자료", code: "press_releases" }];
export default async function NewsPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const selected = (await searchParams).source ?? ""; const valid = filters.some((item) => item.code === selected) ? selected : "";
  const articles = await getArticles(valid || undefined);
  return <><Header compact/><main className="page news-page"><div className="page-title"><span className="eyebrow">NAMWON NEWS</span><h1>전체소식</h1><p>남원시의 새로운 행정정보를 빠짐없이 모았어요.</p></div><nav className="filter-scroll" aria-label="소식 분류">{filters.map((filter) => <Link key={filter.code} href={filter.code ? `/news?source=${filter.code}` : "/news"} className={valid === filter.code ? "selected" : ""}>{filter.label}</Link>)}</nav><div className="result-count">총 <strong>{articles.length}</strong>건</div>{articles.length ? <div className="news-list">{articles.map((article) => <ArticleCard key={article.id} article={article}/>)}</div> : <EmptyState title="이 분류에는 아직 소식이 없습니다."/>}</main></>;
}
