import { createHash } from "node:crypto";
export const cleanText = (value: string): string => value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
export function normalizeDate(value: string): string | null {
  const match = value.match(/(\d{4})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})/);
  if (!match?.[1] || !match[2] || !match[3]) return null;
  const normalized = `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  const date = new Date(`${normalized}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === normalized ? normalized : null;
}
export function makeStableKey(sourceId: string, postUid: string, detailUrl: string): string {
  return postUid ? `${sourceId}:${postUid}` : `${sourceId}:url:${createHash("sha256").update(detailUrl).digest("hex")}`;
}
export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
export const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error);
