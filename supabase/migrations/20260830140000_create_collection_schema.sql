create extension if not exists pgcrypto;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  list_url text not null,
  source_type text not null,
  board_uid text,
  menu_uid text,
  active boolean not null default true,
  last_collected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete restrict,
  external_post_uid text,
  original_title text not null,
  original_body text,
  department text,
  administrative_phone text,
  registered_date date not null,
  detail_url text not null,
  event_start_date date,
  event_end_date date,
  event_status text,
  event_category text,
  has_attachments boolean not null default false,
  body_missing boolean not null default false,
  content_hash text not null,
  collected_at timestamptz not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_source_post_uid_unique unique (source_id, external_post_uid),
  constraint articles_source_detail_url_unique unique (source_id, detail_url),
  constraint articles_identity_present check (external_post_uid is not null or detail_url <> '')
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_extension text,
  created_at timestamptz not null default now(),
  constraint attachments_article_url_unique unique (article_id, file_url)
);

create table if not exists public.collector_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED')),
  total integer not null default 0,
  new_count integer not null default 0,
  updated_count integer not null default 0,
  unchanged_count integer not null default 0,
  failed_count integer not null default 0,
  error_message text
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists sources_set_updated_at on public.sources;
create trigger sources_set_updated_at before update on public.sources for each row execute function public.set_updated_at();
drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles for each row execute function public.set_updated_at();

create or replace function public.sync_namwon_article(
  p_source_id uuid,
  p_article jsonb,
  p_attachments jsonb
) returns table(article_id uuid, sync_status text)
language plpgsql security definer set search_path = public as $$
declare
  v_existing articles%rowtype;
  v_id uuid;
  v_status text;
  v_seen timestamptz := coalesce((p_article->>'collected_at')::timestamptz, now());
begin
  select * into v_existing from articles
  where source_id = p_source_id and (
    ((p_article->>'external_post_uid') is not null and external_post_uid = p_article->>'external_post_uid')
    or detail_url = p_article->>'detail_url'
  ) limit 1 for update;

  if not found then
    insert into articles (source_id, external_post_uid, original_title, original_body, department,
      administrative_phone, registered_date, detail_url, event_start_date, event_end_date,
      event_status, event_category, has_attachments, body_missing, content_hash, collected_at,
      first_seen_at, last_seen_at)
    values (p_source_id, nullif(p_article->>'external_post_uid',''), p_article->>'original_title',
      p_article->>'original_body', p_article->>'department', p_article->>'administrative_phone',
      (p_article->>'registered_date')::date, p_article->>'detail_url',
      nullif(p_article->>'event_start_date','')::date, nullif(p_article->>'event_end_date','')::date,
      p_article->>'event_status', p_article->>'event_category',
      (p_article->>'has_attachments')::boolean, (p_article->>'body_missing')::boolean,
      p_article->>'content_hash', v_seen, v_seen, v_seen) returning id into v_id;
    v_status := 'NEW';
  else
    v_id := v_existing.id;
    v_status := case when v_existing.content_hash = p_article->>'content_hash' then 'UNCHANGED' else 'UPDATED' end;
    update articles set
      external_post_uid = nullif(p_article->>'external_post_uid',''), original_title = p_article->>'original_title',
      original_body = p_article->>'original_body', department = p_article->>'department',
      administrative_phone = p_article->>'administrative_phone', registered_date = (p_article->>'registered_date')::date,
      detail_url = p_article->>'detail_url', event_start_date = nullif(p_article->>'event_start_date','')::date,
      event_end_date = nullif(p_article->>'event_end_date','')::date, event_status = p_article->>'event_status',
      event_category = p_article->>'event_category', has_attachments = (p_article->>'has_attachments')::boolean,
      body_missing = (p_article->>'body_missing')::boolean, content_hash = p_article->>'content_hash',
      collected_at = v_seen, last_seen_at = v_seen
    where id = v_id;
  end if;

  if v_status in ('NEW','UPDATED') then
    delete from attachments where attachments.article_id = v_id;
    insert into attachments(article_id, file_name, file_url, file_extension)
      select v_id, item->>'file_name', item->>'file_url', item->>'file_extension'
      from jsonb_array_elements(coalesce(p_attachments, '[]'::jsonb)) item;
  end if;
  return query select v_id, v_status;
end $$;

alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.attachments enable row level security;
alter table public.collector_runs enable row level security;
revoke all on function public.sync_namwon_article(uuid,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.sync_namwon_article(uuid,jsonb,jsonb) to service_role;

insert into public.sources(code,name,list_url,source_type,board_uid,menu_uid) values
('notices','공지사항','https://www.namwon.go.kr/board/post/list.do?boardUid=ff8080818ea1b850018ea1e3e9ad0081&menuUid=ff8080818e3beff0018e4075e410006e','notice','ff8080818ea1b850018ea1e3e9ad0081','ff8080818e3beff0018e4075e410006e'),
('town_news','읍면동소식','https://www.namwon.go.kr/board/post/list.do?boardUid=ff8080818f2717db018f2c6a0b9e036d&menuUid=ff8080818e3beff0018e407625450070','townNews','ff8080818f2717db018f2c6a0b9e036d','ff8080818e3beff0018e407625450070'),
('events','공연·행사','https://www.namwon.go.kr/board/post/list.do?boardUid=ff8080818ea1fec5018ea23d867e002b&menuUid=ff8080818e3beff0018e40767c3d0074','event','ff8080818ea1fec5018ea23d867e002b','ff8080818e3beff0018e40767c3d0074'),
('jobs','시험채용','https://www.namwon.go.kr/board/post/list.do?boardUid=ff8080818ea1fec5018ea23e8f1e002d&menuUid=ff8080818e3beff0018e4076a5e00076&sort=registerDt,desc','recruitment','ff8080818ea1fec5018ea23e8f1e002d','ff8080818e3beff0018e4076a5e00076'),
('public_notices','고시공고','https://www.namwon.go.kr/board/post/list.do?boardUid=ff8080818ea1fec5018ea24137680031&menuUid=ff8080818e3beff0018e4077131b007a&sort=registerDt,desc','publicNotice','ff8080818ea1fec5018ea24137680031','ff8080818e3beff0018e4077131b007a'),
('press_releases','보도자료','https://www.namwon.go.kr/board/post/list.do?boardUid=ff8080818ea1fec5018ea24651660037&menuUid=ff8080818e3beff0018e407936b40088','pressRelease','ff8080818ea1fec5018ea24651660037','ff8080818e3beff0018e407936b40088')
on conflict(code) do update set name=excluded.name,list_url=excluded.list_url,source_type=excluded.source_type,
board_uid=excluded.board_uid,menu_uid=excluded.menu_uid,active=true;
