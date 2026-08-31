import "server-only";
import { createPublicServerClient } from "@/lib/supabase/server";
import type { CollectorRun, WebArticle } from "@/lib/web-types";

const baseArticleSelect = "id,external_post_uid,original_title,original_body,department,administrative_phone,registered_date,detail_url,event_start_date,event_end_date,event_status,event_category,has_attachments,body_missing,source:sources!inner(code,name),attachments(id,file_name,file_url,file_extension)";
const articleSelect = `${baseArticleSelect},ai_summary:article_ai_summaries(summary,key_points,model,updated_at)`;

function normalizeArticle(value: unknown): WebArticle {
  const row = value as WebArticle & {
    source: WebArticle["source"] | WebArticle["source"][];
    ai_summary?: WebArticle["ai_summary"] | Exclude<WebArticle["ai_summary"], null>[];
  };
  return { ...row, source: Array.isArray(row.source) ? row.source[0]! : row.source,
    attachments: row.attachments ?? [],
    ai_summary: Array.isArray(row.ai_summary) ? row.ai_summary[0] ?? null : row.ai_summary ?? null };
}

export async function getLatestArticles(limit = 30): Promise<WebArticle[]> {
  const client = createPublicServerClient();
  const result = await client.from("articles").select(articleSelect)
    .order("registered_date", { ascending: false }).order("created_at", { ascending: false }).limit(limit);
  if (result.error?.code === "PGRST200") {
    const fallback = await client.from("articles").select(baseArticleSelect)
      .order("registered_date", { ascending: false }).order("created_at", { ascending: false }).limit(limit);
    if (fallback.error) throw new Error(`articles query failed: ${fallback.error.message}`);
    return (fallback.data ?? []).map(normalizeArticle);
  }
  if (result.error) throw new Error(`articles query failed: ${result.error.message}`);
  return (result.data ?? []).map(normalizeArticle);
}

export async function getArticles(sourceCode?: string): Promise<WebArticle[]> {
  const client = createPublicServerClient();
  let query = client.from("articles").select(articleSelect)
    .order("registered_date", { ascending: false }).order("created_at", { ascending: false }).limit(100);
  if (sourceCode) query = query.eq("sources.code", sourceCode);
  const result = await query;
  if (result.error?.code === "PGRST200") {
    let fallbackQuery = client.from("articles").select(baseArticleSelect)
      .order("registered_date", { ascending: false }).order("created_at", { ascending: false }).limit(100);
    if (sourceCode) fallbackQuery = fallbackQuery.eq("sources.code", sourceCode);
    const fallback = await fallbackQuery;
    if (fallback.error) throw new Error(`news query failed: ${fallback.error.message}`);
    return (fallback.data ?? []).map(normalizeArticle);
  }
  if (result.error) throw new Error(`news query failed: ${result.error.message}`);
  return (result.data ?? []).map(normalizeArticle);
}

export async function getArticle(id: string): Promise<WebArticle | null> {
  const client = createPublicServerClient();
  const result = await client.from("articles").select(articleSelect).eq("id", id).maybeSingle();
  if (result.error?.code === "PGRST200") {
    const fallback = await client.from("articles").select(baseArticleSelect).eq("id", id).maybeSingle();
    if (fallback.error) throw new Error(`article query failed: ${fallback.error.message}`);
    return fallback.data ? normalizeArticle(fallback.data) : null;
  }
  if (result.error) throw new Error(`article query failed: ${result.error.message}`);
  return result.data ? normalizeArticle(result.data) : null;
}

export async function getCollectorOverview(): Promise<{ run: CollectorRun | null; sourceCount: number }> {
  const client = createPublicServerClient();
  const [runResult, sourceResult] = await Promise.all([
    client.from("collector_runs").select("finished_at,total,status,failed_count").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    client.from("sources").select("id", { count: "exact", head: true }).eq("active", true),
  ]);
  if (runResult.error) throw new Error(`collector run query failed: ${runResult.error.message}`);
  if (sourceResult.error) throw new Error(`sources query failed: ${sourceResult.error.message}`);
  return { run: runResult.data, sourceCount: sourceResult.count ?? 0 };
}
