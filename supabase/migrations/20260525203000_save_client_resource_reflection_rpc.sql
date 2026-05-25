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
  next_visibility text;
begin
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
    client_note = coalesce(p_client_note, ''),
    client_visibility = next_visibility,
    status = 'responded',
    responded_at = now()
  where id = target_row.id
  returning * into updated_row;

  return updated_row;
end;
$function$;

grant execute on function public.save_client_resource_reflection_safe(uuid, text, text) to authenticated;

comment on function public.save_client_resource_reflection_safe(uuid, text, text) is
  'Safely lets an assigned client save a private or shared reflection on a resource without broad client-side updates.';
