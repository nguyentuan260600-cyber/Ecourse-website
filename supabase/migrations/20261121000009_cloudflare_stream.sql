-- =====================================================================
-- 0009 · Video provider: Cloudflare Stream
-- Video ids are provider-neutral (`video_uid` = Cloudflare Stream video UID).
-- Videos are uploaded with requireSignedURLs, so a UID alone cannot be played:
-- the server mints a short-lived token only after checking access.
-- =====================================================================

alter table public.lessons rename column bunny_video_id to video_uid;
alter table public.lessons add constraint lessons_video_uid_format
  check (video_uid is null or video_uid ~ '^[a-f0-9]{32}$');

alter table public.courses rename column preview_bunny_video_id to preview_video_uid;
alter table public.courses add constraint courses_preview_video_uid_format
  check (preview_video_uid is null or preview_video_uid ~ '^[a-f0-9]{32}$');

-- Column privileges follow the rename; re-state them explicitly for clarity.
revoke select on public.lessons from anon, authenticated;
grant select (id, section_id, title, slug, lesson_type, duration_seconds, is_preview, is_required,
              sort_order, video_status, created_at, updated_at)
  on public.lessons to anon, authenticated;

-- Return type changes (column renamed), so drop and recreate.
drop function public.get_lesson_content(uuid);
create function public.get_lesson_content(p_lesson uuid)
returns table (id uuid, lesson_type text, content text, video_uid text, duration_seconds int)
language sql stable security definer set search_path = public as $$
  select l.id, l.lesson_type, l.content, l.video_uid, l.duration_seconds
  from public.lessons l
  where l.id = p_lesson and private.can_view_lesson(p_lesson)
$$;
revoke execute on function public.get_lesson_content(uuid) from public;
grant execute on function public.get_lesson_content(uuid) to anon, authenticated;
