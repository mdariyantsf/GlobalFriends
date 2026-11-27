-- GlobalFriends database schema
-- Run this entire script in Supabase SQL Editor.
-- Keep Row Level Security enabled. Never put the service_role key in the frontend.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  country text not null default '' check (char_length(country) <= 60),
  language text not null default 'English' check (char_length(language) <= 80),
  bio text not null default '' check (char_length(bio) <= 350),
  interests text[] not null default '{}',
  skills text[] not null default '{}',
  learning_goals text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint different_connection_users check (requester_id <> receiver_id),
  constraint unique_connection_pair unique (requester_id, receiver_id)
);

create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint different_block_users check (blocker_id <> blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post','profile','comment')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 500),
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists comments_post_id_idx on public.comments (post_id, created_at);
create index if not exists connections_receiver_idx on public.connections (receiver_id, status);

-- Automatically create a profile after email signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  chosen_name text;
begin
  chosen_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    'Student'
  );
  insert into public.profiles (id, display_name)
  values (new.id, left(chosen_name, 40))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.connections enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

-- Profiles: authenticated students can discover basic student profiles;
-- only the profile owner can create or edit their own row.
drop policy if exists "profiles readable by authenticated users" on public.profiles;
create policy "profiles readable by authenticated users"
on public.profiles for select to authenticated using (true);

drop policy if exists "profile owner inserts own profile" on public.profiles;
create policy "profile owner inserts own profile"
on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profile owner updates own profile" on public.profiles;
create policy "profile owner updates own profile"
on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Posts: authenticated users can read, authors can create/update/delete their posts.
drop policy if exists "authenticated users read posts" on public.posts;
create policy "authenticated users read posts"
on public.posts for select to authenticated using (true);

drop policy if exists "authors create posts" on public.posts;
create policy "authors create posts"
on public.posts for insert to authenticated with check (auth.uid() = author_id);

drop policy if exists "authors update posts" on public.posts;
create policy "authors update posts"
on public.posts for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "authors delete posts" on public.posts;
create policy "authors delete posts"
on public.posts for delete to authenticated using (auth.uid() = author_id);

-- Likes
drop policy if exists "likes readable by authenticated users" on public.likes;
create policy "likes readable by authenticated users"
on public.likes for select to authenticated using (true);

drop policy if exists "users add own likes" on public.likes;
create policy "users add own likes"
on public.likes for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users remove own likes" on public.likes;
create policy "users remove own likes"
on public.likes for delete to authenticated using (auth.uid() = user_id);

-- Comments
drop policy if exists "comments readable by authenticated users" on public.comments;
create policy "comments readable by authenticated users"
on public.comments for select to authenticated using (true);

drop policy if exists "users add own comments" on public.comments;
create policy "users add own comments"
on public.comments for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "authors delete own comments" on public.comments;
create policy "authors delete own comments"
on public.comments for delete to authenticated using (auth.uid() = user_id);

-- Connection requests: only participants can read; requester creates; receiver changes status.
drop policy if exists "participants read connections" on public.connections;
create policy "participants read connections"
on public.connections for select to authenticated
using (auth.uid() = requester_id or auth.uid() = receiver_id);

drop policy if exists "requester creates connection" on public.connections;
create policy "requester creates connection"
on public.connections for insert to authenticated with check (auth.uid() = requester_id);

drop policy if exists "receiver updates connection" on public.connections;
create policy "receiver updates connection"
on public.connections for update to authenticated
using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

-- Blocks: only blocker can see/create/delete their block records.
drop policy if exists "blocker reads own blocks" on public.blocks;
create policy "blocker reads own blocks"
on public.blocks for select to authenticated using (auth.uid() = blocker_id);

drop policy if exists "users create own blocks" on public.blocks;
create policy "users create own blocks"
on public.blocks for insert to authenticated with check (auth.uid() = blocker_id);

drop policy if exists "users delete own blocks" on public.blocks;
create policy "users delete own blocks"
on public.blocks for delete to authenticated using (auth.uid() = blocker_id);

-- Reports: reporters can create and see only their own reports.
-- Trusted moderation staff should be granted a separate, controlled admin role outside this MVP.
drop policy if exists "users create own reports" on public.reports;
create policy "users create own reports"
on public.reports for insert to authenticated with check (auth.uid() = reporter_id);

drop policy if exists "reporters read own reports" on public.reports;
create policy "reporters read own reports"
on public.reports for select to authenticated using (auth.uid() = reporter_id);

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, delete on public.likes to authenticated;
grant select, insert, delete on public.comments to authenticated;
grant select, insert, update on public.connections to authenticated;
grant select, insert, delete on public.blocks to authenticated;
grant select, insert on public.reports to authenticated;

-- ============================================================
-- Administrator and moderation (added)
-- Only the account whose confirmed email is ariyantsf@gmail.com is an admin.
-- Keep "Confirm email" turned ON in Supabase Authentication settings.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$ select coalesce(auth.jwt() ->> 'email', '') = 'ariyantsf@gmail.com' $$;

create table if not exists public.banned_users (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);
alter table public.banned_users enable row level security;

create or replace function public.is_banned()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select exists (select 1 from public.banned_users where user_id = auth.uid()) $$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_banned() to authenticated;

drop policy if exists "admin manages banned users" on public.banned_users;
create policy "admin manages banned users"
on public.banned_users for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Banned people cannot create a new profile.
drop policy if exists "profile owner inserts own profile" on public.profiles;
create policy "profile owner inserts own profile"
on public.profiles for insert to authenticated
with check (auth.uid() = id and not public.is_banned());

drop policy if exists "admin deletes profiles" on public.profiles;
create policy "admin deletes profiles"
on public.profiles for delete to authenticated using (public.is_admin());

drop policy if exists "admin deletes posts" on public.posts;
create policy "admin deletes posts"
on public.posts for delete to authenticated using (public.is_admin());

drop policy if exists "admin deletes comments" on public.comments;
create policy "admin deletes comments"
on public.comments for delete to authenticated using (public.is_admin());

drop policy if exists "admin reads reports" on public.reports;
create policy "admin reads reports"
on public.reports for select to authenticated using (public.is_admin());

drop policy if exists "admin updates reports" on public.reports;
create policy "admin updates reports"
on public.reports for update to authenticated
using (public.is_admin()) with check (public.is_admin());

grant delete on public.profiles to authenticated;
grant update on public.reports to authenticated;
grant select, insert, update, delete on public.banned_users to authenticated;
