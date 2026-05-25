create or replace function public.get_shared_resources_for_program_safe(p_program_id uuid)
returns table (
  id uuid,
  resource_id uuid,
  client_id uuid,
  program_id uuid,
  context_type text,
  context_id uuid,
  coach_note text,
  shared_by uuid,
  shared_at timestamptz,
  status text,
  viewed_at timestamptz,
  responded_at timestamptz,
  client_note text,
  client_visibility text,
  archived_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  client_note_is_private boolean,
  resource jsonb
)
language sql
security definer
set search_path = public, pg_temp
as $function$
  select
    sr.id,
    sr.resource_id,
    sr.client_id,
    sr.program_id,
    sr.context_type,
    sr.context_id,
    sr.coach_note,
    sr.shared_by,
    sr.shared_at,
    sr.status,
    sr.viewed_at,
    sr.responded_at,
    case
      when public.is_client_user(sr.client_id) or sr.client_visibility = 'shared_with_coach'
        then sr.client_note
      else ''
    end as client_note,
    sr.client_visibility,
    sr.archived_at,
    sr.created_at,
    sr.updated_at,
    case
      when not public.is_client_user(sr.client_id)
        and sr.client_visibility <> 'shared_with_coach'
        and coalesce(sr.client_note, '') <> ''
        then true
      else false
    end as client_note_is_private,
    (
      to_jsonb(r)
      || jsonb_build_object(
        'resource_tags',
        coalesce((
          select jsonb_agg(jsonb_build_object('tag', rt.tag) order by rt.tag)
          from public.resource_tags rt
          where rt.resource_id = r.id
        ), '[]'::jsonb),
        'resource_files',
        coalesce((
          select jsonb_agg(to_jsonb(rf) order by rf.sort_order)
          from public.resource_files rf
          where rf.resource_id = r.id
        ), '[]'::jsonb)
      )
    ) as resource
  from public.shared_resources sr
  join public.resources r on r.id = sr.resource_id
  where sr.program_id = p_program_id
    and sr.archived_at is null
    and (
      public.current_profile_role() = 'admin'
      or public.is_program_coach(p_program_id)
      or public.is_program_client(p_program_id)
    )
  order by sr.shared_at desc;
$function$;

create or replace function public.share_resource_with_client_safe(
  p_resource_id uuid,
  p_client_id uuid,
  p_program_id uuid,
  p_context_type text default 'program',
  p_context_id uuid default null,
  p_coach_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  existing_id uuid;
  shared_id uuid;
begin
  if not (
    public.current_profile_role() = 'admin'
    or public.is_coach_for_client(p_client_id)
  ) then
    raise exception 'Not allowed to share resource with this client.';
  end if;

  if p_context_type is null then
    p_context_type := 'program';
  end if;

  if p_context_type = 'program' then
    p_context_id := null;
  elsif p_context_id is null then
    raise exception 'context_id is required for non-program resource sharing.';
  end if;

  if not exists (
    select 1
    from public.coaching_programs p
    where p.id = p_program_id
      and p.client_id = p_client_id
  ) then
    raise exception 'Program does not belong to this client.';
  end if;

  if not exists (
    select 1
    from public.resources r
    where r.id = p_resource_id
      and r.status = 'published'
      and r.visibility = 'client_assignable'
      and r.archived_at is null
  ) then
    raise exception 'Resource is not assignable.';
  end if;

  select sr.id
  into existing_id
  from public.shared_resources sr
  where sr.resource_id = p_resource_id
    and sr.client_id = p_client_id
    and sr.program_id = p_program_id
    and sr.context_type = p_context_type
    and (
      (p_context_id is null and sr.context_id is null)
      or sr.context_id = p_context_id
    )
    and sr.archived_at is null
  limit 1;

  if existing_id is not null then
    update public.shared_resources
    set
      coach_note = p_coach_note,
      status = 'assigned'
    where id = existing_id
    returning id into shared_id;

    return shared_id;
  end if;

  insert into public.shared_resources (
    resource_id,
    client_id,
    program_id,
    context_type,
    context_id,
    coach_note,
    shared_by,
    status,
    client_visibility
  )
  values (
    p_resource_id,
    p_client_id,
    p_program_id,
    p_context_type,
    p_context_id,
    p_coach_note,
    auth.uid(),
    'assigned',
    'private'
  )
  returning id into shared_id;

  return shared_id;
end;
$function$;

grant execute on function public.get_shared_resources_for_program_safe(uuid) to authenticated;
grant execute on function public.share_resource_with_client_safe(uuid, uuid, uuid, text, uuid, text) to authenticated;

drop policy if exists "shared_resources_coach_read_assigned_clients" on public.shared_resources;

comment on function public.get_shared_resources_for_program_safe(uuid) is
  'Returns shared resources for a program while masking private client notes from coaches and admins.';

comment on function public.share_resource_with_client_safe(uuid, uuid, uuid, text, uuid, text) is
  'Shares or reassigns a resource to a client without requiring coaches to read raw shared_resources rows.';
