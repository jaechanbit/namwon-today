import type { NamwonArticle, SourceConfig } from "../types.js";

export type SyncStatus = "NEW" | "UPDATED" | "UNCHANGED";
export type RunStatus = "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED";
export type RunTotals = {
  status: RunStatus; total: number; newCount: number; updatedCount: number;
  unchangedCount: number; failedCount: number; errorMessage: string | null;
};
export interface ArticleRepository {
  seedSources(sources: readonly SourceConfig[]): Promise<Map<string, string>>;
  startRun(startedAt: string): Promise<string>;
  syncArticle(sourceDbId: string, article: NamwonArticle): Promise<SyncStatus>;
  markSourceCollected(sourceDbId: string, collectedAt: string): Promise<void>;
  finishRun(runId: string, finishedAt: string, totals: RunTotals): Promise<void>;
}
