-- =====================================================================
-- 0001 · Identity & roles
-- Roles live in user_roles (server-managed). profiles has NO role column,
-- so a user can never grant themselves a role by editing their profile.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- helpers ----------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Vietnamese-aware accent folding (portable; no unaccent extension needed).
create or replace function public.vn_unaccent(input text)
returns text language sql immutable parallel safe set search_path = '' as $$
  select lower(translate(coalesce(input, ''),
    'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ',
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyydAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD'))
$$;

-- ---------- profiles ---------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 120),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 1000),
  phone text check (phone is null or phone ~ '^[0-9+ ]{8,20}$'),
  bio text check (bio is null or char_length(bio) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- roles ------------------------------------------------------

create table public.roles (
  id smallint generated always as identity primary key,
  code text not null unique check (code in ('student','instructor','support','admin','super_admin')),
  name text not null
);

insert into public.roles (code, name) values
  ('student', 'Học viên'),
  ('instructor', 'Giảng viên'),
  ('support', 'Nhân viên hỗ trợ'),
  ('admin', 'Quản trị viên'),
  ('super_admin', 'Quản trị cấp cao');

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id smallint not null references public.roles(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id) on delete set null,
  primary key (user_id, role_id)
);
create index user_roles_role_idx on public.user_roles(role_id);

-- SECURITY DEFINER so RLS policies can call it without recursive RLS on user_roles.
create or replace function public.has_role(role_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.code = role_code
  )
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role('admin') or public.has_role('super_admin')
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.has_role('support')
$$;

-- ---------- instructor profiles & preferences -------------------------

create table public.instructor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  headline text not null default '' check (char_length(headline) <= 160),
  biography text not null default '' check (char_length(biography) <= 5000),
  expertise text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger instructor_profiles_updated_at before update on public.instructor_profiles
  for each row execute function public.set_updated_at();

create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  language text not null default 'vi' check (language in ('vi','en')),
  theme text not null default 'system' check (theme in ('light','dark','system')),
  email_preferences jsonb not null default '{"marketing": false, "course_updates": true}',
  updated_at timestamptz not null default now()
);
create trigger user_preferences_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- ---------- new user bootstrap ----------------------------------------
-- Every new auth user gets a profile, preferences and the 'student' role.
-- Elevated roles are ONLY granted via public.assign_role() (super admin) or the
-- service-role bootstrap script.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1)), 120))
  on conflict (id) do nothing;
  insert into public.user_preferences (user_id) values (new.id) on conflict do nothing;
  insert into public.user_roles (user_id, role_id)
  select new.id, id from public.roles where code = 'student'
  on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
