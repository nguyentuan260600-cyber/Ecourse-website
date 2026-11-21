-- =====================================================================
-- 0004 · Learning: access, enrollment, progress, assessments, certificates
-- access_grants is the AUTHORITATIVE source of course access.
-- =====================================================================

create table public.access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  source_type text not null check (source_type in ('order','free','gift','admin')),
  source_id uuid,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (expires_at is null or expires_at > starts_at)
);
create index access_grants_user_course_idx on public.access_grants(user_id, course_id);
-- One grant per order line: a replayed webhook cannot create a second grant.
create unique index access_grants_source_uidx on public.access_grants(user_id, course_id, source_type, source_id)
  where source_id is not null;

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  last_lesson_id uuid references public.lessons(id) on delete set null,
  last_accessed_at timestamptz,
  completed_at timestamptz,
  unique (user_id, course_id)
);
create index enrollments_course_idx on public.enrollments(course_id);

-- Does p_user currently have access to p_course? (active, not expired, not revoked)
create or replace function public.has_course_access(p_user uuid, p_course uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.access_grants g
    where g.user_id = p_user and g.course_id = p_course
      and g.revoked_at is null
      and g.starts_at <= now()
      and (g.expires_at is null or g.expires_at > now())
  )
$$;

create or replace function public.can_view_lesson(p_lesson uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.lessons l
    join public.course_sections s on s.id = l.section_id
    join public.courses c on c.id = s.course_id
    where l.id = p_lesson and (
      (c.status = 'published' and l.is_preview)
      or (auth.uid() is not null and public.has_course_access(auth.uid(), c.id))
      or public.is_course_instructor(c.id)
      or public.is_admin()
    )
  )
$$;

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','completed')),
  last_position_seconds int not null default 0 check (last_position_seconds >= 0),
  watched_seconds int not null default 0 check (watched_seconds >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create trigger lesson_progress_updated_at before update on public.lesson_progress
  for each row execute function public.set_updated_at();

create table public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  position_seconds int check (position_seconds is null or position_seconds >= 0),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lesson_notes_user_lesson_idx on public.lesson_notes(user_id, lesson_id);
create trigger lesson_notes_updated_at before update on public.lesson_notes
  for each row execute function public.set_updated_at();

-- ---------- quizzes ----------------------------------------------------

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons(id) on delete cascade,
  title text not null,
  time_limit_seconds int check (time_limit_seconds is null or time_limit_seconds > 0),
  max_attempts int check (max_attempts is null or max_attempts > 0),
  passing_score_percent int not null default 70 check (passing_score_percent between 0 and 100),
  is_required_for_completion boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger quizzes_updated_at before update on public.quizzes
  for each row execute function public.set_updated_at();

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_type text not null check (question_type in ('single','multiple','true_false','short_answer')),
  prompt text not null,
  explanation text not null default '',
  points int not null default 1 check (points > 0),
  sort_order int not null default 0
);
create index quiz_questions_quiz_idx on public.quiz_questions(quiz_id, sort_order);

-- is_correct is NEVER exposed to students directly: see view quiz_options_public.
create table public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  sort_order int not null default 0
);
create index quiz_options_question_idx on public.quiz_options(question_id, sort_order);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_number int not null check (attempt_number > 0),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score_percent int check (score_percent between 0 and 100),
  passed boolean,
  grading_status text not null default 'in_progress' check (grading_status in ('in_progress','auto_graded','pending_manual','graded')),
  unique (quiz_id, user_id, attempt_number)
);

create table public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_option_ids uuid[] not null default '{}',
  text_answer text check (text_answer is null or char_length(text_answer) <= 5000),
  points_awarded int check (points_awarded is null or points_awarded >= 0),
  unique (attempt_id, question_id)
);

-- ---------- assignments ------------------------------------------------

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons(id) on delete cascade,
  title text not null,
  instructions text not null default '',
  max_score int not null default 100 check (max_score > 0),
  passing_score int not null default 60 check (passing_score >= 0),
  due_days_after_enrollment int check (due_days_after_enrollment is null or due_days_after_enrollment > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger assignments_updated_at before update on public.assignments
  for each row execute function public.set_updated_at();

create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 20000),
  attachment_path text,
  status text not null default 'submitted' check (status in ('submitted','graded','returned')),
  score int check (score is null or score >= 0),
  feedback text,
  graded_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz not null default now(),
  graded_at timestamptz
);
create index assignment_submissions_idx on public.assignment_submissions(assignment_id, user_id);

-- ---------- certificates -----------------------------------------------

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  verification_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  recipient_name_snapshot text not null,
  course_title_snapshot text not null,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_reason text,
  certificate_url text,
  unique (user_id, course_id)
);

-- Public verification without exposing the certificates table.
create or replace function public.verify_certificate(p_code text)
returns table (recipient_name text, course_title text, issued_at timestamptz, is_revoked boolean)
language sql stable security definer set search_path = public as $$
  select recipient_name_snapshot, course_title_snapshot, issued_at, revoked_at is not null
  from public.certificates where verification_code = upper(p_code)
$$;
