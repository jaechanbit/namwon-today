import type { NamwonHttpClient } from "./http/client.js";
import { parseDetail, parseList } from "./parsers/board-parser.js";
import type { CollectionResult, NamwonArticle, SourceConfig, SourceStats } from "./types.js";
import { errorMessage } from "./utils.js";
export async function fetchList(client: NamwonHttpClient, source: SourceConfig, limit = 5) {
  return parseList(source, await client.fetchHtml(source.listUrl), limit);
}
export async function fetchDetail(client: NamwonHttpClient, source: SourceConfig, detailUrl: string) {
  return parseDetail(source, await client.fetchHtml(detailUrl), detailUrl);
}
export async function collectSources(client: NamwonHttpClient, sources: readonly SourceConfig[], perSource = 5): Promise<CollectionResult> {
  const collectedAt = new Date().toISOString(); const articles: NamwonArticle[] = [];
  const failures: CollectionResult["failures"] = []; const sourceStats: Record<string, SourceStats> = {};
  for (const source of sources) {
    const stats = { requested: perSource, success: 0, failed: 0 }; sourceStats[source.id] = stats;
    let posts;
    try { posts = await fetchList(client, source, perSource); }
    catch (error) { stats.failed = perSource; failures.push({ sourceId: source.id, detailUrl: null, message: errorMessage(error) }); continue; }
    if (posts.length < perSource) stats.failed += perSource - posts.length;
    for (const post of posts) {
      try {
        const detail = await fetchDetail(client, source, post.detailUrl);
        articles.push({ stableKey: post.stableKey, sourceId: source.id, sourceName: source.name,
          postUid: post.postUid, originalTitle: detail.originalTitle, originalBody: detail.originalBody,
          bodyMissing: detail.bodyMissing,
          department: detail.department ?? post.department, administrativePhone: detail.administrativePhone,
          registeredDate: detail.registeredDate, detailUrl: post.detailUrl, attachments: detail.attachments, collectedAt,
          eventStartDate: post.eventStartDate, eventEndDate: post.eventEndDate,
          eventStatus: post.eventStatus, eventCategory: post.eventCategory });
        stats.success += 1;
      } catch (error) { stats.failed += 1; failures.push({ sourceId: source.id, detailUrl: post.detailUrl, message: errorMessage(error) }); }
    }
  }
  return { articles, failures, stats: {
    total: Object.values(sourceStats).reduce((sum, item) => sum + item.requested, 0), success: articles.length,
    failed: Object.values(sourceStats).reduce((sum, item) => sum + item.failed, 0), sources: sourceStats } };
}
