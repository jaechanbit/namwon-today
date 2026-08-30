import type { CollectionResult, SourceConfig } from "../types.js";
import { errorMessage } from "../utils.js";
import type { ArticleRepository, SyncStatus } from "./repository.js";

export type ArticleSyncResult = { source: string; postUid: string; status: SyncStatus | "FAILED"; error?: string };
export type SyncResult = {
  runId: string; startedAt: string; finishedAt: string; durationMs: number;
  total: number; newCount: number; updatedCount: number; unchangedCount: number;
  failedCount: number; attachmentCount: number; articles: ArticleSyncResult[];
};

export async function syncCollection(repository: ArticleRepository, sources: readonly SourceConfig[], collection: CollectionResult): Promise<SyncResult> {
  const startedAt = new Date().toISOString(); const startedMs = Date.now();
  const sourceIds = await repository.seedSources(sources); const runId = await repository.startRun(startedAt);
  const results: ArticleSyncResult[] = [];
  let newCount = 0; let updatedCount = 0; let unchangedCount = 0;
  let storageFailures = 0;
  for (const article of collection.articles) {
    try {
      const sourceDbId = sourceIds.get(article.sourceId);
      if (!sourceDbId) throw new Error(`DB source id missing for ${article.sourceId}`);
      const status = await repository.syncArticle(sourceDbId, article);
      if (status === "NEW") newCount += 1;
      else if (status === "UPDATED") updatedCount += 1;
      else unchangedCount += 1;
      results.push({ source: article.sourceId, postUid: article.postUid, status });
    } catch (error) {
      storageFailures += 1;
      results.push({ source: article.sourceId, postUid: article.postUid, status: "FAILED", error: errorMessage(error) });
    }
  }
  for (const source of sources) {
    const sourceDbId = sourceIds.get(source.id);
    if (sourceDbId) {
      try { await repository.markSourceCollected(sourceDbId, collection.articles[0]?.collectedAt ?? startedAt); }
      catch (error) { storageFailures += 1; results.push({ source: source.id, postUid: "", status: "FAILED", error: errorMessage(error) }); }
    }
  }
  const failedCount = collection.stats.failed + storageFailures;
  const finishedAt = new Date().toISOString();
  await repository.finishRun(runId, finishedAt, {
    status: failedCount === 0 ? "COMPLETED" : newCount + updatedCount + unchangedCount > 0 ? "PARTIAL" : "FAILED",
    total: collection.stats.total, newCount, updatedCount, unchangedCount, failedCount,
    errorMessage: failedCount > 0 ? `${failedCount} item(s) failed; inspect command JSON output` : null,
  });
  return { runId, startedAt, finishedAt, durationMs: Date.now() - startedMs, total: collection.stats.total,
    newCount, updatedCount, unchangedCount, failedCount,
    attachmentCount: collection.articles.reduce((sum, article) => sum + article.attachments.length, 0), articles: results };
}

function duration(value: number): string {
  const seconds = Math.floor(value / 1000); const minutes = Math.floor(seconds / 60);
  return `00:${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
export function formatSummary(sourceCount: number, result: SyncResult): string {
  return ["오늘남원 Collector", "", `수집 정보원: ${sourceCount}`, `확인 게시물: ${result.total}`, "",
    `NEW: ${result.newCount}`, `UPDATED: ${result.updatedCount}`, `UNCHANGED: ${result.unchangedCount}`,
    `FAILED: ${result.failedCount}`, "", `첨부파일: ${result.attachmentCount}`, "", `소요시간: ${duration(result.durationMs)}`].join("\n");
}
