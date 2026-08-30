import { createHash } from "node:crypto";
import type { NamwonArticle } from "../types.js";

export function articleContentHash(article: NamwonArticle): string {
  const content = {
    originalTitle: article.originalTitle,
    originalBody: article.originalBody,
    department: article.department,
    administrativePhone: article.administrativePhone,
    registeredDate: article.registeredDate,
    eventStartDate: article.eventStartDate,
    eventEndDate: article.eventEndDate,
    eventStatus: article.eventStatus,
    eventCategory: article.eventCategory,
    attachments: [...article.attachments]
      .map(({ name, url }) => ({ name, url }))
      .sort((a, b) => a.url.localeCompare(b.url) || a.name.localeCompare(b.name)),
  };
  return createHash("sha256").update(JSON.stringify(content)).digest("hex");
}

export function fileExtension(fileName: string): string | null {
  const match = fileName.trim().toLowerCase().match(/\.([a-z0-9]{1,10})$/i);
  return match?.[1] ?? null;
}
