import { HttpError } from "../errors.js";
import { sleep } from "../utils.js";
export type HttpClientOptions = { timeoutMs?: number; requestDelayMs?: number; retries?: number };
export class NamwonHttpClient {
  private lastRequestAt = 0;
  private readonly timeoutMs: number; private readonly requestDelayMs: number; private readonly retries: number;
  constructor(options: HttpClientOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? 15_000; this.requestDelayMs = options.requestDelayMs ?? 700;
    this.retries = options.retries ?? 1;
  }
  async fetchHtml(url: string): Promise<string> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      await this.waitForSlot();
      try {
        const response = await fetch(url, { headers: { Accept: "text/html,application/xhtml+xml",
          "User-Agent": "today-namwon-collector/0.2 (+administrative-information-collector)" },
          signal: AbortSignal.timeout(this.timeoutMs) });
        if (!response.ok) {
          const error = new HttpError(url, response.status, response.statusText);
          if (response.status !== 429 && response.status < 500) throw error;
          lastError = error;
        } else return await response.text();
      } catch (error) {
        lastError = error;
        if (error instanceof HttpError && error.status !== 429 && error.status < 500) throw error;
      }
      if (attempt < this.retries) await sleep(1_000);
    }
    throw lastError instanceof Error ? lastError : new Error(`HTTP request failed: ${url}`);
  }
  private async waitForSlot(): Promise<void> {
    const waitMs = this.lastRequestAt + this.requestDelayMs - Date.now();
    if (waitMs > 0) await sleep(waitMs);
    this.lastRequestAt = Date.now();
  }
}
