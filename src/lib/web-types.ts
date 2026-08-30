export type WebSource = { code: string; name: string };
export type WebAttachment = { id: string; file_name: string; file_url: string; file_extension: string | null };
export type WebArticle = {
  id: string; external_post_uid: string | null; original_title: string; original_body: string | null;
  department: string | null; administrative_phone: string | null; registered_date: string;
  detail_url: string; event_start_date: string | null; event_end_date: string | null;
  event_status: string | null; event_category: string | null; has_attachments: boolean;
  body_missing: boolean; source: WebSource; attachments: WebAttachment[];
};
export type CollectorRun = {
  finished_at: string | null; total: number; status: string; failed_count: number;
};
