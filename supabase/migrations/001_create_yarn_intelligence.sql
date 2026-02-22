-- Table: yarn_intelligence
-- Logs each gauge estimation request for analytics and model improvement.

create table if not exists yarn_intelligence (
  id               bigint generated always as identity primary key,
  created_at       timestamptz not null default now(),
  pattern_yarn_weight  text    not null,
  pattern_gauge        numeric not null,
  user_yarn_weight     text    not null,
  estimated_gauge      numeric not null
);

-- Optional: row-level security (allow anon inserts for the API key used)
alter table yarn_intelligence enable row level security;

create policy "Allow anon inserts" on yarn_intelligence
  for insert to anon with check (true);
