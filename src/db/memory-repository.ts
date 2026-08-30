import type { NamwonArticle, SourceConfig } from "../types.js";
import { articleContentHash } from "./content-hash.js";
import type { ArticleRepository, RunTotals, SyncStatus } from "./repository.js";

type StoredArticle = { article: NamwonArticle; hash: string; firstSeenAt: string; lastSeenAt: string };
export class MemoryArticleRepository implements ArticleRepository {
  readonly articles = new Map<string, StoredArticle>();
  readonly runs = new Map<string, { startedAt: string; finishedAt?: string; totals?: RunTotals }>();
  readonly sourceIds = new Map<string, string>();
  failStableKeys = new Set<string>();
  private runSequence = 0;

  async seedSources(sources: readonly SourceConfig[]): Promise<Map<string, string>> {
    for (const source of sources) this.sourceIds.set(source.id, `source-${source.id}`);
    return new Map(this.sourceIds);
  }
  async startRun(startedAt: string): Promise<string> {
    const id = `run-${++this.runSequence}`; this.runs.set(id, { startedAt }); return id;
  }
  async syncArticle(sourceDbId: string, article: NamwonArticle): Promise<SyncStatus> {
    if (this.failStableKeys.has(article.stableKey)) throw new Error("injected article storage failure");
    const identity = article.postUid ? `${sourceDbId}:post:${article.postUid}` : `${sourceDbId}:url:${article.detailUrl}`;
    const existing = this.articles.get(identity); const hash = articleContentHash(article);
    if (!existing) {
      this.articles.set(identity, { article: structuredClone(article), hash, firstSeenAt: article.collectedAt, lastSeenAt: article.collectedAt });
      return "NEW";
    }
    const status = existing.hash === hash ? "UNCHANGED" : "UPDATED";
    this.articles.set(identity, { article: structuredClone(article), hash, firstSeenAt: existing.firstSeenAt, lastSeenAt: article.collectedAt });
    return status;
  }
  async markSourceCollected(): Promise<void> {}
  async finishRun(runId: string, finishedAt: string, totals: RunTotals): Promise<void> {
    const run = this.runs.get(runId); if (!run) throw new Error(`unknown run: ${runId}`);
    run.finishedAt = finishedAt; run.totals = structuredClone(totals);
  }
  get attachmentCount(): number {
    return [...this.articles.values()].reduce((sum, row) => sum + row.article.attachments.length, 0);
  }
}
