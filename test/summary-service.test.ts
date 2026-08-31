import assert from "node:assert/strict";
import test from "node:test";
import { summarizePending, type GeneratedSummary, type SummaryCandidate,
  type SummaryGenerator, type SummaryStore } from "../src/ai/summary-service.js";

const candidates: SummaryCandidate[] = [
  { id: "a", contentHash: "hash-a", title: "제목 A", body: "본문 A", department: "민원과", registeredDate: "2026-08-31" },
  { id: "b", contentHash: "hash-b", title: "제목 B", body: "본문 B", department: null, registeredDate: "2026-08-31" },
];

test("AI 요약은 개별 실패와 무관하게 다음 게시물을 처리한다", async () => {
  const saved: string[] = [];
  const store: SummaryStore = {
    async findPending(limit) { return candidates.slice(0, limit); },
    async save(article) { saved.push(article.id); },
  };
  const generator: SummaryGenerator = {
    model: "test-model",
    async generate(article): Promise<GeneratedSummary> {
      if (article.id === "a") throw new Error("temporary failure");
      return { summary: "요약", keyPoints: ["핵심"] };
    },
  };
  const result = await summarizePending(store, generator);
  assert.deepEqual(result, { total: 2, success: 1, failed: 1 });
  assert.deepEqual(saved, ["b"]);
});
