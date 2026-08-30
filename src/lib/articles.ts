import "server-only";
import { createPublicServerClient } from "@/lib/supabase/server";
import type { CollectorRun, WebArticle } from "@/lib/web-types";

const articleSelect = "id,external_post_uid,original_title,original_body,department,administrative_phone,registered_date,detail_url,event_start_date,event_end_date,event_status,event_category,has_attachments,body_missing,source:sources!inner(code,name),attachments(id,file_name,file_url,file_extension)";

function normalizeArticle(value: unknown): WebArticle {
  const row = value as WebArticle & { source: WebArticle["source"] | WebArticle["source"][] };
  return { ...row, source: Array.isArray(row.source) ? row.source[0]! : row.source, attachments: row.attachments ?? [] };
}

export async function getLatestArticles(limit = 30): Promise<WebArticle[]> {
  const { data, error } = await createPublicServerClient().from("articles").select(articleSelect)
    .order("registered_date", { ascending: false }).order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(`articles query failed: ${error.message}`);
  return (data ?? []).map(normalizeArticle);
}

export async function getArticles(sourceCode?: string): Promise<WebArticle[]> {
  let query = createPublicServerClient().from("articles").select(articleSelect)
    .order("registered_date", { ascending: false }).order("created_at", { ascending: false }).limit(100);
  if (sourceCode) query = query.eq("sources.code", sourceCode);
  const { data, error } = await query;
  if (error) throw new Error(`news query failed: ${error.message}`);
  return (data ?? []).map(normalizeArticle);
}

export async function getArticle(id: string): Promise<WebArticle | null> {
  const { data, error } = await createPublicServerClient().from("articles").select(articleSelect).eq("id", id).maybeSingle();
  if (error) throw new Error(`article query failed: ${error.message}`);
  return data ? normalizeArticle(data) : null;
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
