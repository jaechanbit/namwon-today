import type { WebArticle } from "@/lib/web-types";

const preferred = ["notices", "town_news", "events", "public_notices", "jobs", "press_releases"];
export function selectHomeHighlights(articles: WebArticle[], limit = 5): WebArticle[] {
  const chosen: WebArticle[] = [];
  for (const code of preferred) {
    const match = articles.find((article) => article.source.code === code && !chosen.some((item) => item.id === article.id));
    if (match) chosen.push(match);
    if (chosen.length >= limit) return chosen;
  }
  for (const article of articles) {
    if (!chosen.some((item) => item.id === article.id)) chosen.push(article);
    if (chosen.length >= limit) break;
  }
  return chosen;
}
