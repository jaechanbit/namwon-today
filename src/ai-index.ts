import "dotenv/config";
import { OpenAiSummaryGenerator } from "./ai/openai-summary-generator.js";
import { summarizePending } from "./ai/summary-service.js";
import { SupabaseSummaryStore } from "./ai/supabase-summary-store.js";

async function main(): Promise<void> {
  const result = await summarizePending(
    SupabaseSummaryStore.fromEnvironment(),
    OpenAiSummaryGenerator.fromEnvironment(),
  );
  console.log(`AI 요약 대상: ${result.total}\n성공: ${result.success}\n실패: ${result.failed}`);
  if (result.failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(`오늘남원 AI 요약 실패: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
