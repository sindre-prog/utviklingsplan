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
  if not public.is_coach_for_client(p_client_id) then
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

  if not public.is_resource_context_in_program(p_program_id, p_context_type, p_context_id) then
    raise exception 'Resource context does not belong to this program.';
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

revoke all on function public.share_resource_with_client_safe(uuid, uuid, uuid, text, uuid, text) from public;
revoke all on function public.share_resource_with_client_safe(uuid, uuid, uuid, text, uuid, text) from anon;
grant execute on function public.share_resource_with_client_safe(uuid, uuid, uuid, text, uuid, text) to authenticated;

comment on function public.share_resource_with_client_safe(uuid, uuid, uuid, text, uuid, text) is
  'Shares or explicitly resends a resource to a client. Re-sending preserves client response and status while updating coach note, sender and shared_at.';
