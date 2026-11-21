-- =====================================================================
-- 0008 · Learning paths (editable content for the homepage "Lộ trình" section)
-- Shown publicly only when status = 'published'. Managed by admins.
-- =====================================================================

create table public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  title text not null check (char_length(title) between 2 and 160),
  summary text not null default '' check (char_length(summary) <= 600),
  duration_label text not null default '' check (char_length(duration_label) <= 60), -- vd: "khoảng 6 tháng"
  link_href text check (link_href is null or link_href ~ '^/'),                      -- vd: "/courses?category=lap-trinh"
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index learning_paths_status_idx on public.learning_paths(status, sort_order);
create trigger learning_paths_updated_at before update on public.learning_paths
  for each row execute function public.set_updated_at();

create table public.learning_path_steps (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  detail text not null default '' check (char_length(detail) <= 300),
  sort_order int not null default 0
);
create index learning_path_steps_path_idx on public.learning_path_steps(path_id, sort_order);

create table public.learning_path_courses (
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  sort_order int not null default 0,
  primary key (path_id, course_id)
);

alter table public.learning_paths enable row level security;
alter table public.learning_path_steps enable row level security;
alter table public.learning_path_courses enable row level security;

create policy learning_paths_read on public.learning_paths for select
  using (status = 'published' or private.is_admin());
create policy learning_paths_admin on public.learning_paths for all
  using (private.is_admin()) with check (private.is_admin());

create policy learning_path_steps_read on public.learning_path_steps for select
  using (exists (select 1 from public.learning_paths p where p.id = path_id and (p.status = 'published' or private.is_admin())));
create policy learning_path_steps_admin on public.learning_path_steps for all
  using (private.is_admin()) with check (private.is_admin());

create policy learning_path_courses_read on public.learning_path_courses for select
  using (exists (select 1 from public.learning_paths p where p.id = path_id and (p.status = 'published' or private.is_admin())));
create policy learning_path_courses_admin on public.learning_path_courses for all
  using (private.is_admin()) with check (private.is_admin());
