create table if not exists public.article_ai_summaries (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null unique references public.articles(id) on delete cascade,
  source_content_hash text not null,
  summary text not null,
  key_points text[] not null default '{}',
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint article_ai_summaries_summary_present check (length(trim(summary)) > 0),
  constraint article_ai_summaries_key_points_limit check (cardinality(key_points) <= 3)
);

drop trigger if exists article_ai_summaries_set_updated_at on public.article_ai_summaries;
create trigger article_ai_summaries_set_updated_at before update on public.article_ai_summaries
for each row execute function public.set_updated_at();

create index if not exists article_ai_summaries_content_hash_idx
on public.article_ai_summaries(source_content_hash);

alter table public.article_ai_summaries enable row level security;
drop policy if exists "Public read article AI summaries" on public.article_ai_summaries;
create policy "Public read article AI summaries" on public.article_ai_summaries
for select to anon using (true);
grant select on public.article_ai_summaries to anon;
