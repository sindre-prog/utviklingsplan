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
      client_note = null,
      client_visibility = 'private',
      status = 'assigned',
      viewed_at = null,
      responded_at = null,
      shared_by = auth.uid(),
      shared_at = now()
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

create or replace function public.save_client_resource_reflection_safe(
  p_shared_resource_id uuid,
  p_client_note text,
  p_client_visibility text default 'private'
)
returns public.shared_resources
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  target_row public.shared_resources;
  updated_row public.shared_resources;
  next_note text;
  next_visibility text;
begin
  next_note := coalesce(p_client_note, '');
  next_visibility := coalesce(nullif(p_client_visibility, ''), 'private');

  if next_visibility not in ('private', 'shared_with_coach') then
    raise exception 'Invalid client visibility.';
  end if;

  select *
    into target_row
  from public.shared_resources
  where id = p_shared_resource_id
    and archived_at is null
  for update;

  if target_row.id is null then
    raise exception 'Shared resource not found.';
  end if;

  if not public.is_client_user(target_row.client_id) then
    raise exception 'Only the assigned client can save this reflection.';
  end if;

  update public.shared_resources
  set
    client_note = next_note,
    client_visibility = next_visibility,
    status = case when length(trim(next_note)) > 0 then 'responded' else 'viewed' end,
    responded_at = case when length(trim(next_note)) > 0 then now() else null end,
    viewed_at = coalesce(viewed_at, now())
  where id = target_row.id
  returning * into updated_row;

  return updated_row;
end;
$function$;

comment on function public.share_resource_with_client_safe(uuid, uuid, uuid, text, uuid, text) is
  'Shares or reassigns a resource to a client. Re-sending the same active context resets stale client response state.';

comment on function public.save_client_resource_reflection_safe(uuid, text, text) is
  'Safely lets an assigned client save a private or shared reflection; empty notes keep the assignment viewed, not responded.';

create or replace function public.guard_shared_resource_update()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  role_name text;
  is_coach_resend boolean;
begin
  role_name := public.current_profile_role();

  if role_name = 'admin' then
    return new;
  end if;

  if public.is_client_user(old.client_id) then
    if new.resource_id is distinct from old.resource_id
      or new.client_id is distinct from old.client_id
      or new.program_id is distinct from old.program_id
      or new.context_type is distinct from old.context_type
      or new.context_id is distinct from old.context_id
      or new.coach_note is distinct from old.coach_note
      or new.shared_by is distinct from old.shared_by
      or new.shared_at is distinct from old.shared_at
      or new.archived_at is distinct from old.archived_at
      or new.created_at is distinct from old.created_at
    then
      raise exception 'Clients can only update their own resource status and reflection fields.';
    end if;

    if new.status <> all (array['viewed'::text, 'responded'::text]) then
      raise exception 'Clients can only mark assigned resources as viewed or responded.';
    end if;

    return new;
  end if;

  if public.is_coach_for_client(old.client_id) then
    is_coach_resend := new.status = 'assigned'
      and new.client_note is null
      and new.client_visibility = 'private'
      and new.viewed_at is null
      and new.responded_at is null;

    if new.resource_id is distinct from old.resource_id
      or new.client_id is distinct from old.client_id
      or new.created_at is distinct from old.created_at
      or (
        not is_coach_resend
        and (
          new.client_note is distinct from old.client_note
          or new.client_visibility is distinct from old.client_visibility
          or new.viewed_at is distinct from old.viewed_at
          or new.responded_at is distinct from old.responded_at
          or new.shared_by is distinct from old.shared_by
          or new.shared_at is distinct from old.shared_at
        )
      )
    then
      raise exception 'Coaches cannot update client reflection fields or immutable assignment fields.';
    end if;

    return new;
  end if;

  raise exception 'Not allowed to update shared resource.';
end;
$function$;
