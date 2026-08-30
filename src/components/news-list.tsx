"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { EmptyState } from "@/components/empty-state";
import type { WebArticle } from "@/lib/web-types";

const filters = [{ label: "전체", code: "" }, { label: "공지", code: "notices" }, { label: "우리동네", code: "town_news" }, { label: "행사", code: "events" }, { label: "채용", code: "jobs" }, { label: "고시공고", code: "public_notices" }, { label: "보도자료", code: "press_releases" }];

export function NewsList({ articles }: { articles: WebArticle[] }) {
  const requested = useSearchParams().get("source") ?? "";
  const selected = filters.some((filter) => filter.code === requested) ? requested : "";
  const visible = selected ? articles.filter((article) => article.source.code === selected) : articles;

  return <main className="page news-page"><div className="page-title"><span className="eyebrow">NAMWON NEWS</span><h1>전체소식</h1><p>남원시의 새로운 행정정보를 빠짐없이 모았어요.</p></div><nav className="filter-scroll" aria-label="소식 분류">{filters.map((filter) => <Link key={filter.code} href={filter.code ? `/news?source=${filter.code}` : "/news"} className={selected === filter.code ? "selected" : ""}>{filter.label}</Link>)}</nav><div className="result-count">총 <strong>{visible.length}</strong>건</div>{visible.length ? <div className="news-list">{visible.map((article) => <ArticleCard key={article.id} article={article}/>)}</div> : <EmptyState title="이 분류에는 아직 소식이 없습니다."/>}</main>;
}
