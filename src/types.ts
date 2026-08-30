export type SourceAdapterId = "standard" | "events";
export type SourceConfig = {
  id: string; name: string; listUrl: string; sourceType: string;
  boardUid: string; menuUid: string; adapter: SourceAdapterId;
  selectors: {
    listRow: string; pinned: string; titleLink: string; department: string;
    registeredDate: string; attachmentPresent: string; detailRoot: string;
    detailTitle: string; detailBody: string; detailInfoItem: string; attachmentLink: string;
    eventCategory: string; eventStartDate: string; eventEndDate: string; eventStatus: string;
  };
};
export type ArticleAttachment = { name: string; url: string };
export type NamwonArticle = {
  stableKey: string; sourceId: string; sourceName: string; postUid: string;
  originalTitle: string; originalBody: string | null; bodyMissing: boolean; department: string | null;
  administrativePhone: string | null; registeredDate: string; detailUrl: string;
  attachments: ArticleAttachment[]; collectedAt: string;
  eventStartDate: string | null; eventEndDate: string | null;
  eventStatus: string | null; eventCategory: string | null;
};
export type ListArticle = {
  postUid: string; stableKey: string; originalTitle: string; department: string | null;
  registeredDate: string | null; detailUrl: string; hasAttachments: boolean; isPinned: boolean;
  eventStartDate: string | null; eventEndDate: string | null;
  eventStatus: string | null; eventCategory: string | null;
};
export type DetailArticle = {
  originalTitle: string; originalBody: string | null; bodyMissing: boolean; department: string | null;
  administrativePhone: string | null; registeredDate: string; attachments: ArticleAttachment[];
};
export type Failure = { sourceId: string; detailUrl: string | null; message: string };
export type SourceStats = { requested: number; success: number; failed: number };
export type CollectionResult = {
  articles: NamwonArticle[]; failures: Failure[];
  stats: { total: number; success: number; failed: number; sources: Record<string, SourceStats> };
};
