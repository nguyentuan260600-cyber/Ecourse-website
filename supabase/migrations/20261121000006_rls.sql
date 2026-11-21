-- =====================================================================
-- 0006 · Row Level Security
-- Principles:
--  * RLS on for every table. Default = deny.
--  * Financial/authorization tables are written only by the service role
--    (server code after verification) — no insert/update policies for users.
--  * Sensitive columns (lesson content, video ids, correct answers) are hidden
--    with column privileges and served by SECURITY DEFINER functions that check access.
-- =====================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','roles','user_roles','instructor_profiles','user_preferences',
    'categories','courses','course_instructors','course_sections','lessons','lesson_resources',
    'course_tags','course_prerequisites',
    'carts','cart_items','coupons','coupon_courses','orders','order_items','payments','payment_events',
    'coupon_redemptions','refunds',
    'access_grants','enrollments','lesson_progress','lesson_notes',
    'quizzes','quiz_questions','quiz_options','quiz_attempts','quiz_answers',
    'assignments','assignment_submissions','certificates',
    'reviews','wishlists','discussion_threads','discussion_messages','notifications',
    'support_tickets','support_messages','audit_logs','announcements','email_templates','email_outbox',
    'system_settings','activity_events','banners'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- ---------- identity --------------------------------------------------

create policy profiles_select_self_or_staff on public.profiles for select
  using (id = auth.uid() or public.is_staff()
         or exists (select 1 from public.instructor_profiles ip where ip.user_id = profiles.id and ip.status = 'active'));
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

create policy roles_select_all on public.roles for select using (true);

-- Users can see their own roles; nobody can write via the API.
-- Role changes go through public.assign_role() (super admin only, audited).
create policy user_roles_select on public.user_roles for select
  using (user_id = auth.uid() or public.is_admin());

create policy instructor_profiles_public on public.instructor_profiles for select
  using (status = 'active' or user_id = auth.uid() or public.is_admin());
create policy instructor_profiles_update_self on public.instructor_profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy instructor_profiles_admin on public.instructor_profiles for all
  using (public.is_admin()) with check (public.is_admin());
-- Instructors may edit their public text, never their status or slug.
revoke update on public.instructor_profiles from authenticated;
grant update (headline, biography, expertise) on public.instructor_profiles to authenticated;

create policy user_preferences_self on public.user_preferences for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- catalog ---------------------------------------------------

create policy categories_public on public.categories for select using (true);
create policy categories_admin_write on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy courses_public_or_owner on public.courses for select
  using (status = 'published' or public.is_course_instructor(id) or public.is_admin());
create policy courses_instructor_insert on public.courses for insert
  with check (public.has_role('instructor') and status = 'draft' and created_by = auth.uid());
-- Instructors edit their own drafts and may submit for review; only admins publish/archive.
create policy courses_instructor_update on public.courses for update
  using (public.is_course_instructor(id) and status in ('draft','in_review'))
  with check (public.is_course_instructor(id) and status in ('draft','in_review'));
create policy courses_admin_all on public.courses for all
  using (public.is_admin()) with check (public.is_admin());

create policy course_instructors_read on public.course_instructors for select using (true);
create policy course_instructors_admin on public.course_instructors for all
  using (public.is_admin()) with check (public.is_admin());

create policy course_sections_read on public.course_sections for select
  using (exists (select 1 from public.courses c where c.id = course_id
                 and (c.status = 'published' or public.is_course_instructor(c.id) or public.is_admin())));
create policy course_sections_write on public.course_sections for all
  using (public.is_course_instructor(course_id) or public.is_admin())
  with check (public.is_course_instructor(course_id) or public.is_admin());

-- Curriculum rows (titles, durations) are public for published courses.
create policy lessons_read on public.lessons for select
  using (exists (select 1 from public.course_sections s join public.courses c on c.id = s.course_id
                 where s.id = section_id
                   and (c.status = 'published' or public.is_course_instructor(c.id) or public.is_admin())));
create policy lessons_write on public.lessons for all
  using (public.is_course_instructor(public.course_id_of_section(section_id)) or public.is_admin())
  with check (public.is_course_instructor(public.course_id_of_section(section_id)) or public.is_admin());

-- ...but the lesson body and video id are not readable through the API.
revoke select on public.lessons from anon, authenticated;
grant select (id, section_id, title, slug, lesson_type, duration_seconds, is_preview, is_required,
              sort_order, video_status, created_at, updated_at)
  on public.lessons to anon, authenticated;

create or replace function public.get_lesson_content(p_lesson uuid)
returns table (id uuid, lesson_type text, content text, bunny_video_id text, duration_seconds int)
language sql stable security definer set search_path = public as $$
  select l.id, l.lesson_type, l.content, l.bunny_video_id, l.duration_seconds
  from public.lessons l
  where l.id = p_lesson and public.can_view_lesson(p_lesson)
$$;

create policy lesson_resources_read on public.lesson_resources for select
  using ((visibility = 'public' and public.can_view_lesson(lesson_id))
         or public.has_course_access(auth.uid(), public.course_id_of_lesson(lesson_id))
         or public.is_course_instructor(public.course_id_of_lesson(lesson_id)) or public.is_admin());
create policy lesson_resources_write on public.lesson_resources for all
  using (public.is_course_instructor(public.course_id_of_lesson(lesson_id)) or public.is_admin())
  with check (public.is_course_instructor(public.course_id_of_lesson(lesson_id)) or public.is_admin());

create policy course_tags_read on public.course_tags for select using (true);
create policy course_tags_write on public.course_tags for all
  using (public.is_course_instructor(course_id) or public.is_admin())
  with check (public.is_course_instructor(course_id) or public.is_admin());

create policy course_prereq_read on public.course_prerequisites for select using (true);
create policy course_prereq_admin on public.course_prerequisites for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- commerce --------------------------------------------------

create policy carts_self on public.carts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cart_items_self on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

-- Coupons are validated server-side; codes are not enumerable by users.
create policy coupons_admin on public.coupons for all
  using (public.is_admin()) with check (public.is_admin());
create policy coupon_courses_admin on public.coupon_courses for all
  using (public.is_admin()) with check (public.is_admin());

-- Read-only for owners and staff. Writes: service role only.
create policy orders_read on public.orders for select
  using (user_id = auth.uid() or public.is_staff());
create policy order_items_read on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));
create policy payments_read on public.payments for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));
create policy payment_events_admin_read on public.payment_events for select using (public.is_admin());
create policy coupon_redemptions_read on public.coupon_redemptions for select
  using (user_id = auth.uid() or public.is_admin());
create policy refunds_read on public.refunds for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));

-- ---------- learning --------------------------------------------------

create policy access_grants_read on public.access_grants for select
  using (user_id = auth.uid() or public.is_staff());
create policy enrollments_read on public.enrollments for select
  using (user_id = auth.uid() or public.is_course_instructor(course_id) or public.is_staff());

create policy lesson_progress_self on public.lesson_progress for select
  using (user_id = auth.uid() or public.is_course_instructor(public.course_id_of_lesson(lesson_id)) or public.is_admin());
create policy lesson_progress_upsert on public.lesson_progress for insert
  with check (user_id = auth.uid() and public.can_view_lesson(lesson_id));
create policy lesson_progress_update on public.lesson_progress for update
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.can_view_lesson(lesson_id));

create policy lesson_notes_self on public.lesson_notes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.can_view_lesson(lesson_id));

create policy quizzes_read on public.quizzes for select using (public.can_view_lesson(lesson_id));
create policy quizzes_write on public.quizzes for all
  using (public.is_course_instructor(public.course_id_of_lesson(lesson_id)) or public.is_admin())
  with check (public.is_course_instructor(public.course_id_of_lesson(lesson_id)) or public.is_admin());

create policy quiz_questions_read on public.quiz_questions for select
  using (exists (select 1 from public.quizzes q where q.id = quiz_id and public.can_view_lesson(q.lesson_id)));
create policy quiz_questions_write on public.quiz_questions for all
  using (exists (select 1 from public.quizzes q where q.id = quiz_id
                 and (public.is_course_instructor(public.course_id_of_lesson(q.lesson_id)) or public.is_admin())))
  with check (exists (select 1 from public.quizzes q where q.id = quiz_id
                 and (public.is_course_instructor(public.course_id_of_lesson(q.lesson_id)) or public.is_admin())));

create policy quiz_options_read on public.quiz_options for select
  using (exists (select 1 from public.quiz_questions qq join public.quizzes q on q.id = qq.quiz_id
                 where qq.id = question_id and public.can_view_lesson(q.lesson_id)));
create policy quiz_options_write on public.quiz_options for all
  using (exists (select 1 from public.quiz_questions qq join public.quizzes q on q.id = qq.quiz_id
                 where qq.id = question_id and (public.is_course_instructor(public.course_id_of_lesson(q.lesson_id)) or public.is_admin())))
  with check (exists (select 1 from public.quiz_questions qq join public.quizzes q on q.id = qq.quiz_id
                 where qq.id = question_id and (public.is_course_instructor(public.course_id_of_lesson(q.lesson_id)) or public.is_admin())));
-- Correct answers are never readable through the API; grading runs server-side.
revoke select on public.quiz_options from anon, authenticated;
grant select (id, question_id, label, sort_order) on public.quiz_options to anon, authenticated;

-- Attempts/answers: read own; written by server-side grading (service role).
create policy quiz_attempts_read on public.quiz_attempts for select
  using (user_id = auth.uid() or public.is_admin()
         or exists (select 1 from public.quizzes q where q.id = quiz_id and public.is_course_instructor(public.course_id_of_lesson(q.lesson_id))));
create policy quiz_answers_read on public.quiz_answers for select
  using (exists (select 1 from public.quiz_attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.is_admin())));

create policy assignments_read on public.assignments for select using (public.can_view_lesson(lesson_id));
create policy assignments_write on public.assignments for all
  using (public.is_course_instructor(public.course_id_of_lesson(lesson_id)) or public.is_admin())
  with check (public.is_course_instructor(public.course_id_of_lesson(lesson_id)) or public.is_admin());

create policy submissions_read on public.assignment_submissions for select
  using (user_id = auth.uid() or public.is_admin()
         or exists (select 1 from public.assignments a where a.id = assignment_id and public.is_course_instructor(public.course_id_of_lesson(a.lesson_id))));
create policy submissions_insert on public.assignment_submissions for insert
  with check (user_id = auth.uid() and status = 'submitted' and score is null and graded_by is null
              and exists (select 1 from public.assignments a where a.id = assignment_id and public.can_view_lesson(a.lesson_id)));
create policy submissions_grade on public.assignment_submissions for update
  using (exists (select 1 from public.assignments a where a.id = assignment_id
                 and (public.is_course_instructor(public.course_id_of_lesson(a.lesson_id)) or public.is_admin())))
  with check (exists (select 1 from public.assignments a where a.id = assignment_id
                 and (public.is_course_instructor(public.course_id_of_lesson(a.lesson_id)) or public.is_admin())));

create policy certificates_read on public.certificates for select
  using (user_id = auth.uid() or public.is_staff());

-- ---------- community -------------------------------------------------

create policy reviews_public on public.reviews for select
  using (status = 'published' or user_id = auth.uid() or public.is_admin());
create policy reviews_insert_enrolled on public.reviews for insert
  with check (user_id = auth.uid() and status = 'published' and public.has_course_access(auth.uid(), course_id));
create policy reviews_update_own on public.reviews for update
  using (user_id = auth.uid()) with check (user_id = auth.uid() and status = 'published');
create policy reviews_delete_own on public.reviews for delete using (user_id = auth.uid());
create policy reviews_moderate on public.reviews for update
  using (public.is_admin()) with check (public.is_admin());

create policy wishlists_self on public.wishlists for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy threads_read on public.discussion_threads for select
  using (public.has_course_access(auth.uid(), course_id) or public.is_course_instructor(course_id) or public.is_staff());
create policy threads_insert on public.discussion_threads for insert
  with check (author_id = auth.uid() and (public.has_course_access(auth.uid(), course_id) or public.is_course_instructor(course_id)));
create policy messages_read on public.discussion_messages for select
  using (exists (select 1 from public.discussion_threads t where t.id = thread_id
                 and (public.has_course_access(auth.uid(), t.course_id) or public.is_course_instructor(t.course_id) or public.is_staff())));
create policy messages_insert on public.discussion_messages for insert
  with check (author_id = auth.uid() and exists (select 1 from public.discussion_threads t where t.id = thread_id
                 and (public.has_course_access(auth.uid(), t.course_id) or public.is_course_instructor(t.course_id))));

create policy notifications_self_read on public.notifications for select using (user_id = auth.uid());
create policy notifications_self_mark on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy tickets_read on public.support_tickets for select
  using (user_id = auth.uid() or public.is_staff());
create policy tickets_insert on public.support_tickets for insert
  with check (user_id = auth.uid() and status = 'open' and assigned_to is null);
create policy tickets_staff_update on public.support_tickets for update
  using (public.is_staff()) with check (public.is_staff());

create policy ticket_messages_read on public.support_messages for select
  using (exists (select 1 from public.support_tickets t where t.id = ticket_id
                 and ((t.user_id = auth.uid() and not is_internal) or public.is_staff())));
create policy ticket_messages_insert on public.support_messages for insert
  with check (author_id = auth.uid() and exists (select 1 from public.support_tickets t where t.id = ticket_id
                 and ((t.user_id = auth.uid() and not is_internal) or public.is_staff())));

-- ---------- administration --------------------------------------------

create policy audit_logs_super_admin on public.audit_logs for select using (public.has_role('super_admin'));
create policy announcements_read on public.announcements for select using (published_at is not null and published_at <= now() or public.is_admin());
create policy announcements_admin on public.announcements for all using (public.is_admin()) with check (public.is_admin());
create policy email_templates_admin on public.email_templates for all using (public.is_admin()) with check (public.is_admin());
create policy system_settings_read on public.system_settings for select
  using (public.has_role('super_admin') or (public.is_admin() and not is_sensitive));
create policy system_settings_write on public.system_settings for all
  using (public.has_role('super_admin')) with check (public.has_role('super_admin'));
create policy activity_events_self on public.activity_events for select using (user_id = auth.uid() or public.is_admin());
create policy banners_public on public.banners for select
  using ((is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())) or public.is_admin());
create policy banners_admin on public.banners for all using (public.is_admin()) with check (public.is_admin());
-- email_outbox: no policies → service role only.

-- ---------- role management (audited) ---------------------------------

create or replace function public.assign_role(p_user uuid, p_role text, p_grant boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_role_id smallint;
begin
  if not public.has_role('super_admin') then
    raise exception 'forbidden: only super_admin can change roles' using errcode = '42501';
  end if;
  if p_user = auth.uid() and p_role = 'super_admin' and not p_grant then
    raise exception 'cannot revoke your own super_admin role';
  end if;
  select id into v_role_id from public.roles where code = p_role;
  if v_role_id is null then raise exception 'unknown role %', p_role; end if;

  if p_grant then
    insert into public.user_roles (user_id, role_id, assigned_by) values (p_user, v_role_id, auth.uid())
    on conflict do nothing;
  else
    delete from public.user_roles where user_id = p_user and role_id = v_role_id;
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, after_state)
  values (auth.uid(), case when p_grant then 'role.grant' else 'role.revoke' end, 'user', p_user::text,
          jsonb_build_object('role', p_role));
end $$;

revoke execute on function public.assign_role(uuid, text, boolean) from anon;

-- Newsletter: anyone may subscribe; nobody can list subscribers via the API.
alter table public.newsletter_subscribers enable row level security;
create policy newsletter_subscribe on public.newsletter_subscribers for insert
  to anon, authenticated with check (confirmed_at is null and unsubscribed_at is null);
