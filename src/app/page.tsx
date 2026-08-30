import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { CollectorStatus } from "@/components/collector-status";
import { EmptyState } from "@/components/empty-state";
import { Header } from "@/components/header";
import { ArrowIcon } from "@/components/icons";
import { getCollectorOverview, getLatestArticles } from "@/lib/articles";
import { formatKoreanToday } from "@/lib/format";
import { selectHomeHighlights } from "@/lib/recommendations";
export const dynamic = "force-dynamic";
export default async function HomePage() {
  const [articles, overview] = await Promise.all([getLatestArticles(30), getCollectorOverview()]);
  const highlights = selectHomeHighlights(articles, 5);
  return <><Header/><main className="page home-page"><section className="hero"><time>{formatKoreanToday()}</time><h1>오늘 확인할<br/><span>남원 소식</span>이 있어요.</h1><p>복잡한 시청 게시판 대신, 필요한 소식을 한눈에 확인하세요.</p></section><section className="section"><div className="section-heading"><div><span className="eyebrow">TODAY</span><h2>오늘의 주요 소식</h2></div><Link href="/news">전체 보기 <ArrowIcon/></Link></div>{highlights.length ? <div className="highlight-grid">{highlights.map((article, index) => <ArticleCard key={article.id} article={article} featured={index === 0}/>)}</div> : <EmptyState/>}</section><CollectorStatus run={overview.run} sourceCount={overview.sourceCount}/></main></>;
}
