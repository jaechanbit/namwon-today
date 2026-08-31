import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readSupabaseConfig } from "../db/supabase-repository.js";
import type { GeneratedSummary, SummaryCandidate, SummaryStore } from "./summary-service.js";

type ArticleRow = {
  id: string; content_hash: string; original_title: string; original_body: string | null;
  department: string | null; registered_date: string;
};
type SummaryRow = { article_id: string; source_content_hash: string };

function assertNoError(error: { message: string } | null, operation: string): void {
  if (error) throw new Error(`Supabase ${operation} failed: ${error.message}`);
}

export class SupabaseSummaryStore implements SummaryStore {
  constructor(private readonly client: SupabaseClient) {}

  static fromEnvironment(env: NodeJS.ProcessEnv = process.env): SupabaseSummaryStore {
    const { url, serviceRoleKey } = readSupabaseConfig(env);
    return new SupabaseSummaryStore(createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }));
  }

  async findPending(limit: number): Promise<SummaryCandidate[]> {
    const [articlesResult, summariesResult] = await Promise.all([
      this.client.from("articles").select("id,content_hash,original_title,original_body,department,registered_date")
        .order("registered_date", { ascending: false }).order("updated_at", { ascending: false }).limit(100),
      this.client.from("article_ai_summaries").select("article_id,source_content_hash"),
    ]);
    assertNoError(articlesResult.error, "AI summary article query");
    assertNoError(summariesResult.error, "AI summary state query");
    const existing = new Map((summariesResult.data as SummaryRow[] | null ?? [])
      .map((row) => [row.article_id, row.source_content_hash]));
    return (articlesResult.data as ArticleRow[] | null ?? [])
      .filter((row) => existing.get(row.id) !== row.content_hash)
      .slice(0, limit)
      .map((row) => ({ id: row.id, contentHash: row.content_hash, title: row.original_title,
        body: row.original_body, department: row.department, registeredDate: row.registered_date }));
  }

  async save(article: SummaryCandidate, result: GeneratedSummary, model: string): Promise<void> {
    const { error } = await this.client.from("article_ai_summaries").upsert({
      article_id: article.id, source_content_hash: article.contentHash, summary: result.summary,
      key_points: result.keyPoints, model,
    }, { onConflict: "article_id" });
    assertNoError(error, "AI summary upsert");
  }
}
