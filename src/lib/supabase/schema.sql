create extension if not exists pgcrypto;

create table if not exists songs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  artist text,
  album text,
  genre text,
  duration integer,
  poster_url text,
  audio_url text not null,
  file_size integer,
  play_count integer default 0,
  source text default 'uploaded',
  uploaded_at timestamp with time zone default now()
);

alter table songs enable row level security;

alter publication supabase_realtime add table songs;

create policy "public read" on songs for select using (true);

create policy "public insert" on songs for insert with check (true);
