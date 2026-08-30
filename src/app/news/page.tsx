import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { NewsList } from "@/components/news-list";
import { getArticles } from "@/lib/articles";
export const dynamic = "force-static";
export const metadata: Metadata = { title: "전체소식" };
export default async function NewsPage() {
  const articles = await getArticles();
  return <><Header compact/><Suspense><NewsList articles={articles}/></Suspense></>;
}
