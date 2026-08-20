alter table public.development_areas
  add column if not exists archived_at timestamp with time zone;

alter table public.coaching_sessions
  add column if not exists archived_at timestamp with time zone;

create index if not exists development_areas_active_program_idx
  on public.development_areas using btree (program_id, sort_order)
  where archived_at is null;

create index if not exists coaching_sessions_active_program_idx
  on public.coaching_sessions using btree (program_id, session_date desc)
  where archived_at is null;

comment on column public.development_areas.archived_at is
  'Soft archive marker. Archived focus areas are hidden from active workspaces, but linked history remains intact.';

comment on column public.coaching_sessions.archived_at is
  'Soft archive marker. Archived coaching sessions are hidden from active workspaces, but linked history remains intact.';
