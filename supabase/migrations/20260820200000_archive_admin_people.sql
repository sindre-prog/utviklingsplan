alter table public.clients
  add column if not exists archived_at timestamp with time zone;

alter table public.coaches
  add column if not exists archived_at timestamp with time zone;

create index if not exists clients_active_name_idx
  on public.clients using btree (name)
  where archived_at is null;

create index if not exists coaches_active_name_idx
  on public.coaches using btree (name)
  where archived_at is null;

create or replace function public.get_admin_client_overview()
returns table (
  id uuid,
  created_at timestamp with time zone,
  name text,
  code text,
  consent_given boolean,
  consent_date timestamp with time zone,
  account_activated_at timestamp with time zone,
  consent_version text,
  coach_ids uuid[],
  role text,
  employer text,
  user_id uuid,
  email text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select
    c.id,
    c.created_at,
    c.name,
    c.code,
    c.consent_given,
    c.consent_date,
    c.account_activated_at,
    c.consent_version,
    coalesce(c.coach_ids, '{}'::uuid[]) as coach_ids,
    c.role,
    c.employer,
    c.user_id,
    c.email
  from public.clients c
  where public.current_profile_role() = 'admin'
    and c.archived_at is null
  order by c.name;
$function$;

grant execute on function public.get_admin_client_overview() to authenticated;

comment on column public.clients.archived_at is
  'Soft archive marker. Archived clients are hidden from active lists and access flows, while plan data remains intact.';

comment on column public.coaches.archived_at is
  'Soft archive marker. Archived coaches are hidden from active lists and access flows, while related client data remains intact.';
