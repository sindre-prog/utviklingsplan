create or replace function public.is_resource_context_in_program(
  p_program_id uuid,
  p_context_type text,
  p_context_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select case
    when p_context_type = 'program' then p_context_id is null
    when p_context_type = 'focus_area' then exists (
      select 1
      from public.development_areas da
      where da.id = p_context_id
        and da.program_id = p_program_id
    )
    when p_context_type = 'session' then exists (
      select 1
      from public.coaching_sessions cs
      where cs.id = p_context_id
        and cs.program_id = p_program_id
    )
    when p_context_type = 'experiment' then exists (
      select 1
      from public.session_actions sa
      where sa.id = p_context_id
        and sa.program_id = p_program_id
    )
    when p_context_type = 'reflection' then exists (
      select 1
      from public.client_reflections cr
      where cr.id = p_context_id
        and cr.program_id = p_program_id
        and cr.visibility = 'shared_with_coach'
    )
    else false
  end;
$function$;

create or replace function public.save_development_plan_safe(
  p_program_id uuid,
  p_program jsonb,
  p_areas jsonb default '[]'::jsonb,
  p_sessions jsonb default '[]'::jsonb,
  p_evaluation jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  area_item jsonb;
  session_item jsonb;
  area_id uuid;
  session_id uuid;
  area_title text;
  area_description text;
  area_movement text;
  area_typical_situations text;
  area_progress_signs text;
  session_has_content boolean;
  evaluation_has_content boolean;
  changed_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not exists (
    select 1
    from public.coaching_programs p
    where p.id = p_program_id
  ) then
    raise exception 'Program does not exist.';
  end if;

  if not public.can_write_program(p_program_id) then
    raise exception 'Not allowed to save this program.';
  end if;

  if jsonb_typeof(coalesce(p_areas, '[]'::jsonb)) <> 'array' then
    raise exception 'p_areas must be an array.';
  end if;

  if jsonb_typeof(coalesce(p_sessions, '[]'::jsonb)) <> 'array' then
    raise exception 'p_sessions must be an array.';
  end if;

  update public.coaching_programs
  set
    purpose = p_program->>'purpose',
    success_criteria = p_program->>'success_criteria',
    expectations_coach = p_program->>'expectations_coach',
    expectations_client = p_program->>'expectations_client',
    confidentiality = p_program->>'confidentiality',
    practical_frame = p_program->>'practical_frame',
    start_date = nullif(p_program->>'start_date', '')::date,
    end_date = nullif(p_program->>'end_date', '')::date,
    session_count = nullif(p_program->>'session_count', '')::integer,
    session_duration = p_program->>'session_duration',
    status = coalesce(nullif(p_program->>'status', ''), 'active'),
    context = p_program->>'context'
  where id = p_program_id;

  get diagnostics changed_count = row_count;
  if changed_count <> 1 then
    raise exception 'Program could not be saved.';
  end if;

  for area_item in
    select value from jsonb_array_elements(coalesce(p_areas, '[]'::jsonb))
  loop
    area_id := nullif(area_item->>'id', '')::uuid;
    area_title := coalesce(area_item->>'title', '');
    area_description := nullif(area_item->>'description', '');
    area_movement := nullif(area_item->>'movement', '');
    area_typical_situations := nullif(area_item->>'typical_situations', '');
    area_progress_signs := nullif(area_item->>'progress_signs', '');

    if area_title <> ''
      or area_description is not null
      or area_movement is not null
      or area_typical_situations is not null
      or area_progress_signs is not null
    then
      if area_id is null then
        insert into public.development_areas (
          program_id,
          title,
          description,
          project_type,
          movement,
          typical_situations,
          progress_signs,
          next_practice,
          sort_order
        )
        values (
          p_program_id,
          area_title,
          area_description,
          coalesce(nullif(area_item->>'project_type', ''), 'inner'),
          area_movement,
          area_typical_situations,
          area_progress_signs,
          nullif(area_item->>'next_practice', ''),
          coalesce(nullif(area_item->>'sort_order', '')::integer, 0)
        );
      else
        update public.development_areas
        set
          title = area_title,
          description = area_description,
          project_type = coalesce(nullif(area_item->>'project_type', ''), 'inner'),
          movement = area_movement,
          typical_situations = area_typical_situations,
          progress_signs = area_progress_signs,
          next_practice = nullif(area_item->>'next_practice', ''),
          sort_order = coalesce(nullif(area_item->>'sort_order', '')::integer, 0)
        where id = area_id
          and program_id = p_program_id;

        get diagnostics changed_count = row_count;
        if changed_count <> 1 then
          raise exception 'Focus area does not belong to this program.';
        end if;
      end if;
    end if;
  end loop;

  for session_item in
    select value from jsonb_array_elements(coalesce(p_sessions, '[]'::jsonb))
  loop
    session_id := nullif(session_item->>'id', '')::uuid;
    session_has_content :=
      nullif(session_item->>'session_date', '') is not null
      or nullif(session_item->>'focus', '') is not null
      or nullif(session_item->>'conversation_goal', '') is not null
      or nullif(session_item->>'insights', '') is not null
      or nullif(session_item->>'decisions', '') is not null
      or nullif(session_item->>'client_notes', '') is not null;

    if session_has_content then
      if session_id is null then
        insert into public.coaching_sessions (
          program_id,
          session_number,
          session_date,
          focus,
          conversation_goal,
          insights,
          decisions,
          client_notes
        )
        values (
          p_program_id,
          nullif(session_item->>'session_number', '')::integer,
          nullif(session_item->>'session_date', '')::date,
          nullif(session_item->>'focus', ''),
          nullif(session_item->>'conversation_goal', ''),
          nullif(session_item->>'insights', ''),
          nullif(session_item->>'decisions', ''),
          nullif(session_item->>'client_notes', '')
        );
      else
        update public.coaching_sessions
        set
          session_number = nullif(session_item->>'session_number', '')::integer,
          session_date = nullif(session_item->>'session_date', '')::date,
          focus = nullif(session_item->>'focus', ''),
          conversation_goal = nullif(session_item->>'conversation_goal', ''),
          insights = nullif(session_item->>'insights', ''),
          decisions = nullif(session_item->>'decisions', ''),
          client_notes = nullif(session_item->>'client_notes', '')
        where id = session_id
          and program_id = p_program_id;

        get diagnostics changed_count = row_count;
        if changed_count <> 1 then
          raise exception 'Session does not belong to this program.';
        end if;
      end if;
    end if;
  end loop;

  evaluation_has_content :=
    nullif(p_evaluation->>'achieved', '') is not null
    or nullif(p_evaluation->>'reflection', '') is not null
    or nullif(p_evaluation->>'next_steps', '') is not null;

  if evaluation_has_content then
    insert into public.program_evaluations (
      program_id,
      achieved,
      reflection,
      next_steps
    )
    values (
      p_program_id,
      nullif(p_evaluation->>'achieved', ''),
      nullif(p_evaluation->>'reflection', ''),
      nullif(p_evaluation->>'next_steps', '')
    )
    on conflict (program_id) do update
    set
      achieved = excluded.achieved,
      reflection = excluded.reflection,
      next_steps = excluded.next_steps;
  end if;
end;
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

revoke all on function public.is_resource_context_in_program(uuid, text, uuid) from public;
revoke all on function public.is_resource_context_in_program(uuid, text, uuid) from anon;
revoke all on function public.is_resource_context_in_program(uuid, text, uuid) from authenticated;
revoke all on function public.save_development_plan_safe(uuid, jsonb, jsonb, jsonb, jsonb) from public;
revoke all on function public.save_development_plan_safe(uuid, jsonb, jsonb, jsonb, jsonb) from anon;
revoke all on function public.share_resource_with_client_safe(uuid, uuid, uuid, text, uuid, text) from public;
revoke all on function public.share_resource_with_client_safe(uuid, uuid, uuid, text, uuid, text) from anon;

grant execute on function public.save_development_plan_safe(uuid, jsonb, jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.share_resource_with_client_safe(uuid, uuid, uuid, text, uuid, text) to authenticated;

comment on function public.save_development_plan_safe(uuid, jsonb, jsonb, jsonb, jsonb) is
  'Saves the core development plan in one database transaction. Mirrors the existing client save behavior without deleting omitted child rows.';

comment on function public.is_resource_context_in_program(uuid, text, uuid) is
  'Validates that a resource sharing context belongs to the selected program. Reflection contexts must be shared with coach.';
