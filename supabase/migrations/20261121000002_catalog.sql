-- =====================================================================
-- 0002 · Course catalog
-- =====================================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  description text not null default '',
  image_url text,
  tags text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(title) between 5 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,120}$'),
  short_description text not null default '' check (char_length(short_description) <= 400),
  description text not null default '',
  thumbnail_url text,
  preview_bunny_video_id text,
  price_vnd bigint not null default 0 check (price_vnd >= 0),
  compare_at_price_vnd bigint check (compare_at_price_vnd is null or compare_at_price_vnd >= price_vnd),
  level text not null default 'beginner' check (level in ('beginner','intermediate','advanced','expert')),
  language text not null default 'vi',
  status text not null default 'draft' check (status in ('draft','in_review','published','archived')),
  badge text check (badge is null or char_length(badge) <= 30),
  objectives jsonb not null default '[]',
  requirements text[] not null default '{}',
  includes text[] not null default '{}',
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_has_date check (status <> 'published' or published_at is not null)
);
create index courses_status_published_idx on public.courses(status, published_at desc);
create index courses_category_idx on public.courses(category_id);
create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

create table public.course_instructors (
  course_id uuid not null references public.courses(id) on delete cascade,
  instructor_id uuid not null references public.instructor_profiles(user_id) on delete restrict,
  is_primary boolean not null default false,
  primary key (course_id, instructor_id)
);
create unique index course_one_primary_instructor on public.course_instructors(course_id) where is_primary;
create index course_instructors_instructor_idx on public.course_instructors(instructor_id);

create table public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index course_sections_course_idx on public.course_sections(course_id, sort_order);
create trigger course_sections_updated_at before update on public.course_sections
  for each row execute function public.set_updated_at();

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.course_sections(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  slug text not null check (slug ~ '^[a-z0-9-]{1,120}$'),
  lesson_type text not null check (lesson_type in ('video','text','document','quiz','assignment')),
  content text not null default '',
  bunny_video_id text,
  video_status text not null default 'none' check (video_status in ('none','uploading','processing','ready','failed')),
  duration_seconds int not null default 0 check (duration_seconds >= 0),
  is_preview boolean not null default false,
  is_required boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, slug)
);
create index lessons_section_idx on public.lessons(section_id, sort_order);
create trigger lessons_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();

create table public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  resource_type text not null check (resource_type in ('pdf','slide','code','link','other')),
  storage_path text not null,
  display_name text not null,
  visibility text not null default 'enrolled' check (visibility in ('public','enrolled')),
  created_at timestamptz not null default now()
);
create index lesson_resources_lesson_idx on public.lesson_resources(lesson_id);

create table public.course_tags (
  course_id uuid not null references public.courses(id) on delete cascade,
  tag text not null check (char_length(tag) between 1 and 40),
  primary key (course_id, tag)
);
create index course_tags_tag_idx on public.course_tags(tag);

create table public.course_prerequisites (
  course_id uuid not null references public.courses(id) on delete cascade,
  prerequisite_course_id uuid not null references public.courses(id) on delete cascade,
  primary key (course_id, prerequisite_course_id),
  check (course_id <> prerequisite_course_id)
);

-- Helper used by RLS: is the current user an assigned instructor of the course?
create or replace function public.is_course_instructor(p_course_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.course_instructors
    where course_id = p_course_id and instructor_id = auth.uid()
  )
$$;

create or replace function public.course_id_of_section(p_section_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select course_id from public.course_sections where id = p_section_id
$$;

create or replace function public.course_id_of_lesson(p_lesson_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select s.course_id from public.lessons l join public.course_sections s on s.id = l.section_id
  where l.id = p_lesson_id
$$;
