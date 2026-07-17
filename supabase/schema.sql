-- ADCODE inquiries schema
-- Supabase Dashboard → SQL Editor 에 붙여넣고 Run

create extension if not exists "pgcrypto";

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  name text not null,
  phone text not null,
  email text not null,
  message text default '',
  services text default '',
  contact_method text default '전화',
  privacy_agreed boolean not null default false,
  info_agreed boolean not null default false,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'done', 'archived')),
  admin_note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row
  execute function public.set_updated_at();

alter table public.inquiries enable row level security;

-- 누구나 문의 등록 가능 (anon / authenticated)
drop policy if exists "Anyone can insert inquiries" on public.inquiries;
create policy "Anyone can insert inquiries"
  on public.inquiries
  for insert
  to anon, authenticated
  with check (true);

-- 로그인한 관리자만 조회
drop policy if exists "Authenticated can select inquiries" on public.inquiries;
create policy "Authenticated can select inquiries"
  on public.inquiries
  for select
  to authenticated
  using (true);

-- 로그인한 관리자만 수정 (상태, 메모 등)
drop policy if exists "Authenticated can update inquiries" on public.inquiries;
create policy "Authenticated can update inquiries"
  on public.inquiries
  for update
  to authenticated
  using (true)
  with check (true);

-- 로그인한 관리자만 삭제
drop policy if exists "Authenticated can delete inquiries" on public.inquiries;
create policy "Authenticated can delete inquiries"
  on public.inquiries
  for delete
  to authenticated
  using (true);
