export type SummaryCandidate = {
  id: string;
  contentHash: string;
  title: string;
  body: string | null;
  department: string | null;
  registeredDate: string;
};

export type GeneratedSummary = { summary: string; keyPoints: string[] };
export type SummaryRunResult = { total: number; success: number; failed: number };

export interface SummaryStore {
  findPending(limit: number): Promise<SummaryCandidate[]>;
  save(article: SummaryCandidate, result: GeneratedSummary, model: string): Promise<void>;
}

export interface SummaryGenerator {
  readonly model: string;
  generate(article: SummaryCandidate): Promise<GeneratedSummary>;
}

export async function summarizePending(
  store: SummaryStore,
  generator: SummaryGenerator,
  limit = 30,
): Promise<SummaryRunResult> {
  const pending = await store.findPending(limit);
  let success = 0;
  let failed = 0;
  for (const article of pending) {
    try {
      const result = await generator.generate(article);
      await store.save(article, result, generator.model);
      success += 1;
    } catch (error) {
      failed += 1;
      console.error(`AI summary failed for ${article.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return { total: pending.length, success, failed };
}
