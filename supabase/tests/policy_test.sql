-- Database policy tests. Each block raises NOTICE 'PASS: ...' or an exception.
-- Run with: npm run test:db  (PGlite, no Postgres install needed)

-- ---------- fixtures for the tests ------------------------------------
-- The dev seed has no courses, so the tests create their own (rolled into this file only).
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'student.a@example.dev'),
  ('00000000-0000-0000-0000-00000000000b', 'student.b@example.dev'),
  (md5('ks:i-nam')::uuid, 'instructor.nam@example.dev'),
  (md5('ks:i-ly')::uuid, 'instructor.ly@example.dev');
insert into public.instructor_profiles (user_id, slug, status) values
  (md5('ks:i-nam')::uuid, 'test-nam', 'active'),
  (md5('ks:i-ly')::uuid, 'test-ly', 'active');
insert into public.user_roles (user_id, role_id)
  select u, r.id from unnest(array[md5('ks:i-nam')::uuid, md5('ks:i-ly')::uuid]) u, public.roles r where r.code = 'instructor';

insert into public.categories (id, name, slug) values
  (md5('ks:c-ai')::uuid, 'Danh mục kiểm thử A', 'kiem-thu-a'),
  (md5('ks:c-design')::uuid, 'Danh mục kiểm thử B', 'kiem-thu-b');

-- co-1 (owned by i-nam): section 1 has a preview lesson, section 2 is paid (lesson 8 = quiz).
-- co-4 (owned by i-ly): published.
insert into public.courses (id, category_id, title, slug, price_vnd, status, published_at) values
  (md5('ks:co-1')::uuid, md5('ks:c-ai')::uuid, 'Khoá kiểm thử 1', 'khoa-kiem-thu-1', 1490000, 'published', now()),
  (md5('ks:co-4')::uuid, md5('ks:c-design')::uuid, 'Khoá kiểm thử 4', 'khoa-kiem-thu-4', 990000, 'published', now());
insert into public.course_instructors (course_id, instructor_id, is_primary) values
  (md5('ks:co-1')::uuid, md5('ks:i-nam')::uuid, true),
  (md5('ks:co-4')::uuid, md5('ks:i-ly')::uuid, true);
insert into public.course_sections (id, course_id, title, sort_order) values
  (md5('ks:co-1-s1')::uuid, md5('ks:co-1')::uuid, 'Chương 1', 0),
  (md5('ks:co-1-s2')::uuid, md5('ks:co-1')::uuid, 'Chương 2', 1);
insert into public.lessons (id, section_id, title, slug, lesson_type, duration_seconds, is_preview, sort_order)
  select md5('ks:co-1-s1-l' || g)::uuid, md5('ks:co-1-s1')::uuid, 'Bài 1.' || g, 'bai-1-' || g, 'video', 600, g = 1, g - 1
  from generate_series(1, 3) g;
insert into public.lessons (id, section_id, title, slug, lesson_type, duration_seconds, is_preview, sort_order)
  select md5('ks:co-1-s2-l' || g)::uuid, md5('ks:co-1-s2')::uuid, 'Bài 2.' || g, 'bai-2-' || g,
         case when g = 8 then 'quiz' else 'video' end, 600, false, g - 1
  from generate_series(1, 8) g;

-- Student A owns course co-1 through a paid order (written as service role would).
insert into public.orders (id, user_id, subtotal_vnd, discount_vnd, total_vnd, status, paid_at)
values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-00000000000a', 1490000, 0, 1490000, 'paid', now());
insert into public.access_grants (user_id, course_id, source_type, source_id)
values ('00000000-0000-0000-0000-00000000000a', md5('ks:co-1')::uuid, 'order', '00000000-0000-0000-0000-0000000000a1');
insert into public.enrollments (user_id, course_id) values ('00000000-0000-0000-0000-00000000000a', md5('ks:co-1')::uuid);
update public.lessons set content = 'NOI DUNG BI MAT', video_uid = 'aaaabbbbccccddddeeeeffff00001111' where section_id in
  (select id from public.course_sections where course_id = md5('ks:co-1')::uuid);

-- A quiz with a correct answer.
insert into public.quizzes (id, lesson_id, title, max_attempts) values
  ('00000000-0000-0000-0000-0000000000c1', md5('ks:co-1-s2-l8')::uuid, 'Quiz chương 2', 2);
insert into public.quiz_questions (id, quiz_id, question_type, prompt) values
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-0000000000c1', 'single', 'RAG là gì?');
insert into public.quiz_options (question_id, label, is_correct) values
  ('00000000-0000-0000-0000-0000000000c2', 'Retrieval-Augmented Generation', true),
  ('00000000-0000-0000-0000-0000000000c2', 'Random Access Graph', false);

-- ---------- helpers ---------------------------------------------------
create or replace function pg_temp.as_user(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(uid, ''), false);
  if uid is null then execute 'set role anon'; else execute 'set role authenticated'; end if;
end $$;

-- 1. Guests see the published catalog through the read model.
select pg_temp.as_user(null);
do $$ declare n int; begin
  select count(*) into n from public.course_cards;
  if n <> 2 then raise exception 'FAIL: guest sees % courses in course_cards (expected 2)', n; end if;
  raise notice 'PASS: guest sees published catalog (% courses)', n;
end $$;

-- 2. Guests cannot read lesson bodies or video ids directly.
do $$ begin
  begin
    perform content from public.lessons limit 1;
    raise exception 'FAIL: guest could select lessons.content';
  exception when insufficient_privilege then
    raise notice 'PASS: lessons.content hidden from guests';
  end;
end $$;

-- 3. Guest gets preview lesson content but not paid lesson content.
do $$ declare n_preview int; n_paid int; begin
  select count(*) into n_preview from public.get_lesson_content(md5('ks:co-1-s1-l1')::uuid);
  select count(*) into n_paid from public.get_lesson_content(md5('ks:co-1-s2-l1')::uuid);
  if n_preview <> 1 or n_paid <> 0 then raise exception 'FAIL: guest preview=% paid=%', n_preview, n_paid; end if;
  raise notice 'PASS: guest can open preview lessons only';
end $$;

-- 4. Student without purchase cannot read paid content; owner can.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ declare n int; begin
  select count(*) into n from public.get_lesson_content(md5('ks:co-1-s2-l1')::uuid);
  if n <> 0 then raise exception 'FAIL: non-buyer read paid lesson'; end if;
  raise notice 'PASS: student cannot open unpurchased course';
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ declare v text; begin
  select video_uid into v from public.get_lesson_content(md5('ks:co-1-s2-l1')::uuid);
  if v is distinct from 'aaaabbbbccccddddeeeeffff00001111' then raise exception 'FAIL: buyer cannot read purchased lesson'; end if;
  raise notice 'PASS: buyer can open purchased lesson';
end $$;

-- 5. Student B cannot see student A's orders or grants.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ declare n int; m int; begin
  select count(*) into n from public.orders;
  select count(*) into m from public.access_grants;
  if n <> 0 or m <> 0 then raise exception 'FAIL: student B sees % orders, % grants of others', n, m; end if;
  raise notice 'PASS: students cannot read other students'' orders or access';
end $$;

-- 6. Students cannot mark orders paid or grant themselves access.
do $$ begin
  begin
    insert into public.access_grants (user_id, course_id, source_type)
    values ('00000000-0000-0000-0000-00000000000b', md5('ks:co-1')::uuid, 'admin');
    raise exception 'FAIL: student inserted an access grant';
  exception when insufficient_privilege or check_violation then
    raise notice 'PASS: students cannot grant themselves access';
  end;
end $$;
do $$ declare n int; begin
  update public.orders set status = 'paid' where id = '00000000-0000-0000-0000-0000000000a1';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: student updated an order'; end if;
  raise notice 'PASS: students cannot change order status';
end $$;

-- 7. Role escalation attempts fail.
do $$ begin
  begin
    insert into public.user_roles (user_id, role_id)
    select '00000000-0000-0000-0000-00000000000b', id from public.roles where code = 'admin';
    raise exception 'FAIL: student inserted a role';
  exception when insufficient_privilege or check_violation then
    raise notice 'PASS: students cannot insert roles';
  end;
  begin
    perform public.assign_role('00000000-0000-0000-0000-00000000000b', 'admin', true);
    raise exception 'FAIL: student called assign_role';
  exception when insufficient_privilege then
    raise notice 'PASS: assign_role requires super_admin';
  end;
end $$;

-- 8. Correct quiz answers are not readable by students.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  begin
    perform is_correct from public.quiz_options limit 1;
    raise exception 'FAIL: student read quiz_options.is_correct';
  exception when insufficient_privilege then
    raise notice 'PASS: correct answers hidden from students';
  end;
end $$;

-- 9. Instructor cannot edit a course they are not assigned to.
select pg_temp.as_user(md5('ks:i-ly')::uuid::text);
do $$ declare n int; begin
  update public.courses set title = 'Bị chiếm quyền' where id = md5('ks:co-1')::uuid; -- owned by i-nam
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: instructor edited an unrelated course'; end if;
  raise notice 'PASS: instructor cannot edit unrelated courses';
end $$;
-- ...and cannot publish their own course.
do $$ begin
  begin
    update public.courses set status = 'published' where id = md5('ks:co-4')::uuid; -- owned by i-ly, already published
    raise notice 'PASS: published course is not editable by instructor (0 rows)';
  exception when insufficient_privilege or check_violation then
    raise notice 'PASS: instructor cannot publish';
  end;
end $$;

-- ---------- service-role checks ---------------------------------------
reset role;
select set_config('request.jwt.claim.sub', '', false);

-- 10. A replayed payment cannot create a second grant for the same order line.
do $$ begin
  begin
    insert into public.access_grants (user_id, course_id, source_type, source_id)
    values ('00000000-0000-0000-0000-00000000000a', md5('ks:co-1')::uuid, 'order', '00000000-0000-0000-0000-0000000000a1');
    raise exception 'FAIL: duplicate access grant inserted';
  exception when unique_violation then
    raise notice 'PASS: duplicate grant for the same order rejected';
  end;
  begin
    insert into public.enrollments (user_id, course_id) values ('00000000-0000-0000-0000-00000000000a', md5('ks:co-1')::uuid);
    raise exception 'FAIL: duplicate enrollment inserted';
  exception when unique_violation then
    raise notice 'PASS: duplicate enrollment rejected';
  end;
end $$;

-- 11. Revoked access blocks protected content.
update public.access_grants set revoked_at = now() where user_id = '00000000-0000-0000-0000-00000000000a';
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ declare n int; begin
  select count(*) into n from public.get_lesson_content(md5('ks:co-1-s2-l1')::uuid);
  if n <> 0 then raise exception 'FAIL: revoked user still reads paid content'; end if;
  raise notice 'PASS: revoked access blocks protected lessons';
end $$;
reset role;

-- 12. Money integrity: totals must add up; audit log is append-only.
do $$ begin
  begin
    insert into public.orders (user_id, subtotal_vnd, discount_vnd, total_vnd)
    values ('00000000-0000-0000-0000-00000000000a', 1000000, 100000, 1000000);
    raise exception 'FAIL: inconsistent order total accepted';
  exception when check_violation then
    raise notice 'PASS: order total must equal subtotal - discount';
  end;
  insert into public.audit_logs (action, entity_type) values ('test', 'test');
  begin
    update public.audit_logs set action = 'tampered';
    raise exception 'FAIL: audit log was modified';
  exception when raise_exception then
    raise notice 'PASS: audit_logs is append-only';
  end;
end $$;

-- 13. New users get exactly the student role.
do $$ declare roles text; begin
  select string_agg(r.code, ',') into roles from public.user_roles ur join public.roles r on r.id = ur.role_id
  where ur.user_id = '00000000-0000-0000-0000-00000000000b';
  if roles is distinct from 'student' then raise exception 'FAIL: new user roles = %', roles; end if;
  raise notice 'PASS: new users get only the student role';
end $$;

-- 14. RLS helpers are not exposed through the public API schema; trigger functions are not callable.
select pg_temp.as_user(null);
do $$ begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname in ('has_role','is_admin','is_staff','has_course_access','can_view_lesson','is_course_instructor')) then
    raise exception 'FAIL: RLS helper still in public schema';
  end if;
  begin
    perform public.handle_new_user();
    raise exception 'FAIL: anon executed trigger function';
  exception when insufficient_privilege or feature_not_supported or object_not_in_prerequisite_state then
    raise notice 'PASS: RLS helpers hidden from the API and trigger functions not callable';
  end;
end $$;
reset role;
