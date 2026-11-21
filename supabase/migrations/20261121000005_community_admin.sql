-- =====================================================================
-- 0005 · Community, notifications, support, administration
-- =====================================================================

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null default '' check (char_length(body) <= 3000),
  status text not null default 'published' check (status in ('published','hidden','flagged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, user_id)
);
create index reviews_course_idx on public.reviews(course_id, status, created_at desc);

-- Reviews are public, profiles are not: copy only the public display name/avatar.
alter table public.reviews
  add column author_display_name text not null default 'Học viên',
  add column author_avatar_url text;
create or replace function public.reviews_fill_author()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select coalesce(nullif(display_name, ''), 'Học viên'), avatar_url
    into new.author_display_name, new.author_avatar_url
  from public.profiles where id = new.user_id;
  new.author_display_name := coalesce(new.author_display_name, 'Học viên');
  return new;
end $$;
create trigger reviews_fill_author before insert on public.reviews
  for each row execute function public.reviews_fill_author();
create trigger reviews_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

create table public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table public.discussion_threads (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index discussion_threads_course_idx on public.discussion_threads(course_id, created_at desc);

create table public.discussion_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.discussion_threads(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create index discussion_messages_thread_idx on public.discussion_messages(thread_id, created_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  link text check (link is null or link ~ '^/'),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, read_at, created_at desc);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (char_length(subject) between 3 and 200),
  category text not null default 'general' check (category in ('general','payment','access','technical','refund')),
  status text not null default 'open' check (status in ('open','pending','escalated','resolved','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assigned_to uuid references auth.users(id) on delete set null,
  related_order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_tickets_status_idx on public.support_tickets(status, created_at desc);
create trigger support_tickets_updated_at before update on public.support_tickets
  for each row execute function public.set_updated_at();

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);
create index support_messages_ticket_idx on public.support_messages(ticket_id, created_at);

-- Append-only audit trail for money, access and role changes.
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_state jsonb,
  after_state jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs(actor_id, created_at desc);

create or replace function public.audit_logs_immutable()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'audit_logs is append-only';
end $$;
create trigger audit_logs_no_update before update or delete on public.audit_logs
  for each row execute function public.audit_logs_immutable();

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all' check (audience in ('all','students','instructors')),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  subject text not null,
  html_body text not null,
  updated_at timestamptz not null default now()
);

-- Outbox: emails are queued in the same transaction as the business event,
-- then sent by a worker with retries. A Brevo outage never rolls back a payment.
create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  to_email text not null,
  payload jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending','sending','sent','failed')),
  attempts int not null default 0,
  last_error text,
  next_attempt_at timestamptz not null default now(),
  dedupe_key text unique,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index email_outbox_pending_idx on public.email_outbox(status, next_attempt_at) where status in ('pending','failed');

create table public.system_settings (
  key text primary key,
  value jsonb not null,
  is_sensitive boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.activity_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  course_id uuid references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);
create index activity_events_user_idx on public.activity_events(user_id, occurred_at desc);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  link text check (link is null or link ~ '^/'),
  image_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- ---------- catalog read model ----------------------------------------
-- One row per published course with everything a course card needs,
-- so listing pages are a single query (no N+1).

-- Aggregate only: exposes a count, never which users are enrolled.
create or replace function public.course_student_count(p_course uuid)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from public.enrollments where course_id = p_course
$$;

create or replace view public.course_cards
with (security_invoker = true) as
select
  c.id, c.slug, c.title, c.short_description, c.thumbnail_url,
  c.price_vnd, c.compare_at_price_vnd, c.level, c.badge, c.published_at,
  cat.slug as category_slug, cat.name as category_name,
  ip.user_id as instructor_id, ip.slug as instructor_slug,
  p.display_name as instructor_name, ip.headline as instructor_headline, p.avatar_url as instructor_avatar_url,
  coalesce(stats.duration_seconds, 0)::int as duration_seconds,
  coalesce(stats.lesson_count, 0)::int as lesson_count,
  coalesce(rv.rating_avg, 0)::numeric(3,2) as rating_average,
  coalesce(rv.rating_count, 0)::int as rating_count,
  public.course_student_count(c.id) as student_count,
  coalesce(tg.tags, '{}') as tags,
  public.vn_unaccent(c.title || ' ' || c.short_description || ' ' || coalesce(p.display_name, '') || ' ' ||
    coalesce(cat.name, '') || ' ' || array_to_string(coalesce(tg.tags, '{}'), ' ')) as search_text
from public.courses c
left join public.categories cat on cat.id = c.category_id
left join public.course_instructors ci on ci.course_id = c.id and ci.is_primary
left join public.instructor_profiles ip on ip.user_id = ci.instructor_id
left join public.profiles p on p.id = ip.user_id
left join lateral (
  select sum(l.duration_seconds) as duration_seconds, count(*) as lesson_count
  from public.course_sections s join public.lessons l on l.section_id = s.id
  where s.course_id = c.id
) stats on true
left join lateral (
  select avg(r.rating) as rating_avg, count(*) as rating_count
  from public.reviews r where r.course_id = c.id and r.status = 'published'
) rv on true
left join lateral (
  select array_agg(t.tag order by t.tag) as tags from public.course_tags t where t.course_id = c.id
) tg on true
where c.status = 'published';

-- ---------- newsletter -------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  source text not null default 'website',
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);
