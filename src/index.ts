import { collectSources } from "./collector.js";
import { SOURCES } from "./config/sources.js";
import { NamwonHttpClient } from "./http/client.js";
const client = new NamwonHttpClient({ timeoutMs: 15_000, requestDelayMs: 700, retries: 1 });
collectSources(client, SOURCES, 5).then((result) => {
  console.log(JSON.stringify(result, null, 2)); if (result.stats.success === 0) process.exitCode = 1;
}).catch((error: unknown) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
});
