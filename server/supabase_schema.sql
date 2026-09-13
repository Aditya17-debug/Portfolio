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

-- 3. Policy: Allow incoming contact submissions from anyone (public anon visitors)
-- Visitors can ONLY INSERT (send messages). They CANNOT read or edit any records.
drop policy if exists "Allow insert access for all" on public.messages;
drop policy if exists "Allow read access" on public.messages;
drop policy if exists "Allow update access" on public.messages;

create policy "Allow insert only for public"
on public.messages for insert
with check (true);

-- Note: No SELECT or UPDATE policy is created for anon.
-- Only you (logged into your Supabase Dashboard or using the secret Service Role key)
-- can read or manage these messages.
