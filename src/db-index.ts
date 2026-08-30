import "dotenv/config";
import { collectSources } from "./collector.js";
import { SOURCES } from "./config/sources.js";
import { SupabaseArticleRepository } from "./db/supabase-repository.js";
import { formatSummary, syncCollection } from "./db/sync-service.js";
import { NamwonHttpClient } from "./http/client.js";

async function main(): Promise<void> {
  const repository = SupabaseArticleRepository.fromEnvironment();
  const client = new NamwonHttpClient({ timeoutMs: 15_000, requestDelayMs: 700, retries: 1 });
  const collection = await collectSources(client, SOURCES, 5);
  const result = await syncCollection(repository, SOURCES, collection);
  if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
  else console.log(`${formatSummary(SOURCES.length, result)}\n\nJSON 결과\n${JSON.stringify(result, null, 2)}`);
  if (result.failedCount > 0) process.exitCode = 1;
}
main().catch((error: unknown) => {
  console.error(`오늘남원 Collector 실패: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1;
});
