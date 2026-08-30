create policy "Public can read sources" on public.sources for select to anon using (active = true);
create policy "Public can read articles" on public.articles for select to anon using (true);
create policy "Public can read attachments" on public.attachments for select to anon using (true);
create policy "Public can read collector runs" on public.collector_runs for select to anon using (true);
