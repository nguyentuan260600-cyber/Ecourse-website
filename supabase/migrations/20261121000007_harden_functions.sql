-- =====================================================================
-- 0007 · Harden SECURITY DEFINER functions (Supabase advisor 0028/0029)
-- RLS helper functions move to a `private` schema that PostgREST does not
-- expose, so they can still be used by policies but not called via /rpc.
-- Only intentional RPCs stay in `public`: get_lesson_content, verify_certificate,
-- assign_role (super_admin only, checked inside).
-- =====================================================================

create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

-- Policies and the course_cards view reference functions by OID, so they keep working.
alter function public.has_role(text) set schema private;
alter function public.is_admin() set schema private;
alter function public.is_staff() set schema private;
alter function public.is_course_instructor(uuid) set schema private;
alter function public.course_id_of_section(uuid) set schema private;
alter function public.course_id_of_lesson(uuid) set schema private;
alter function public.has_course_access(uuid, uuid) set schema private;
alter function public.can_view_lesson(uuid) set schema private;
alter function public.course_student_count(uuid) set schema private;

-- Function bodies are resolved by name at run time: point them at private.*
create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select private.has_role('admin') or private.has_role('super_admin')
$$;

create or replace function private.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select private.is_admin() or private.has_role('support')
$$;

create or replace function private.can_view_lesson(p_lesson uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.lessons l
    join public.course_sections s on s.id = l.section_id
    join public.courses c on c.id = s.course_id
    where l.id = p_lesson and (
      (c.status = 'published' and l.is_preview)
      or (auth.uid() is not null and private.has_course_access(auth.uid(), c.id))
      or private.is_course_instructor(c.id)
      or private.is_admin()
    )
  )
$$;

create or replace function public.get_lesson_content(p_lesson uuid)
returns table (id uuid, lesson_type text, content text, bunny_video_id text, duration_seconds int)
language sql stable security definer set search_path = public as $$
  select l.id, l.lesson_type, l.content, l.bunny_video_id, l.duration_seconds
  from public.lessons l
  where l.id = p_lesson and private.can_view_lesson(p_lesson)
$$;

create or replace function public.assign_role(p_user uuid, p_role text, p_grant boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_role_id smallint;
begin
  if not private.has_role('super_admin') then
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

grant execute on all functions in schema private to anon, authenticated, service_role;

-- Trigger functions are never meant to be called directly.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.reviews_fill_author() from public, anon, authenticated;

-- assign_role: signed-in only (the function itself requires super_admin).
revoke execute on function public.assign_role(uuid, text, boolean) from public, anon;
grant execute on function public.assign_role(uuid, text, boolean) to authenticated;

-- email_outbox intentionally has RLS on and no policies: service role only.
comment on table public.email_outbox is 'Service-role only (no RLS policies by design).';
