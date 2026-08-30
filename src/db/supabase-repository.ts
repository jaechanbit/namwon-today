import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { NamwonArticle, SourceConfig } from "../types.js";
import { articleContentHash, fileExtension } from "./content-hash.js";
import type { ArticleRepository, RunTotals, SyncStatus } from "./repository.js";

function assertNoError(error: { message: string } | null, operation: string): void {
  if (error) throw new Error(`Supabase ${operation} failed: ${error.message}`);
}

export function readSupabaseConfig(env: NodeJS.ProcessEnv = process.env): { url: string; serviceRoleKey: string } {
  const missing = [!env.SUPABASE_URL && "SUPABASE_URL", !env.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(`Supabase environment variables missing: ${missing.join(", ")}. Copy .env.example to .env and set server-only credentials.`);
  }
  return { url: env.SUPABASE_URL!, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY! };
}

export class SupabaseArticleRepository implements ArticleRepository {
  constructor(private readonly client: SupabaseClient) {}

  static fromEnvironment(env: NodeJS.ProcessEnv = process.env): SupabaseArticleRepository {
    const { url, serviceRoleKey } = readSupabaseConfig(env);
    return new SupabaseArticleRepository(createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }));
  }

  async seedSources(sources: readonly SourceConfig[]): Promise<Map<string, string>> {
    const rows = sources.map((source) => ({ code: source.id, name: source.name, list_url: source.listUrl,
      source_type: source.sourceType, board_uid: source.boardUid, menu_uid: source.menuUid, active: true }));
    const { data, error } = await this.client.from("sources").upsert(rows, { onConflict: "code" }).select("id,code");
    assertNoError(error, "source seed");
    return new Map((data ?? []).map((row) => [String(row.code), String(row.id)]));
  }

  async startRun(startedAt: string): Promise<string> {
    const { data, error } = await this.client.from("collector_runs").insert({ started_at: startedAt, status: "RUNNING" }).select("id").single();
    assertNoError(error, "collector run start");
    if (!data?.id) throw new Error("Supabase collector run start returned no id");
    return String(data.id);
  }

  async syncArticle(sourceDbId: string, article: NamwonArticle): Promise<SyncStatus> {
    const articlePayload = {
      external_post_uid: article.postUid || null, original_title: article.originalTitle,
      original_body: article.originalBody, department: article.department,
      administrative_phone: article.administrativePhone, registered_date: article.registeredDate,
      detail_url: article.detailUrl, event_start_date: article.eventStartDate,
      event_end_date: article.eventEndDate, event_status: article.eventStatus,
      event_category: article.eventCategory, has_attachments: article.attachments.length > 0,
      body_missing: article.bodyMissing, content_hash: articleContentHash(article), collected_at: article.collectedAt,
    };
    const attachmentPayload = article.attachments.map(({ name, url }) => ({
      file_name: name, file_url: url, file_extension: fileExtension(name),
    }));
    const { data, error } = await this.client.rpc("sync_namwon_article", {
      p_source_id: sourceDbId, p_article: articlePayload, p_attachments: attachmentPayload,
    });
    assertNoError(error, "article sync");
    const result = Array.isArray(data) ? data[0] : data;
    const status = result?.sync_status;
    if (status !== "NEW" && status !== "UPDATED" && status !== "UNCHANGED") {
      throw new Error(`Supabase article sync returned invalid status: ${String(status)}`);
    }
    return status;
  }

  async markSourceCollected(sourceDbId: string, collectedAt: string): Promise<void> {
    const { error } = await this.client.from("sources").update({ last_collected_at: collectedAt }).eq("id", sourceDbId);
    assertNoError(error, "source collection timestamp update");
  }

  async finishRun(runId: string, finishedAt: string, totals: RunTotals): Promise<void> {
    const { error } = await this.client.from("collector_runs").update({ finished_at: finishedAt, status: totals.status,
      total: totals.total, new_count: totals.newCount, updated_count: totals.updatedCount,
      unchanged_count: totals.unchangedCount, failed_count: totals.failedCount, error_message: totals.errorMessage }).eq("id", runId);
    assertNoError(error, "collector run finish");
  }
}
