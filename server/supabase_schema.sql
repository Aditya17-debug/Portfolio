-- =======================================================
-- Run this in your Supabase SQL Editor (SQL Editor > New Query)
-- =======================================================

-- 1. Create the messages table
create table if not exists public.messages (
    id bigint primary key generated always as identity,
    name text not null,
    email text not null,
    subject text,
    message text not null,
    ip_address text,
    status text default 'unread',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.messages enable row level security;

-- 3. Policy: Allow incoming contact submissions from anyone (anon or backend)
create policy "Allow insert access for all"
on public.messages for insert
with check (true);

-- 4. Policy: Allow reading and updating messages for dashboard / service role / anon
create policy "Allow read access"
on public.messages for select
using (true);

create policy "Allow update access"
on public.messages for update
using (true);
