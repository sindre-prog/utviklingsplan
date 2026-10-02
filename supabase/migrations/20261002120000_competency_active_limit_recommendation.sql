-- Three active leadership competencies is a recommendation, not a limit (UTVIKLINGSFLYT_BESLUTNING_V1).
-- Only the guard trigger function changes: the client still owns activation and priority, one priority
-- per active competency is still unique, and set_primary_program_competency is unchanged.

create or replace function public.guard_program_competency_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  same_priority_count integer;
  next_primary_id uuid;
  is_client boolean;
  is_coach boolean;
  rebalancing boolean;
begin
  is_client := public.is_program_client(new.program_id);
  is_coach := public.is_program_coach(new.program_id);
  rebalancing := coalesce(current_setting('app.competency_priority_rebalance', true), '') = 'on';

  if tg_op = 'INSERT' and is_coach and not is_client then
    if new.status <> 'suggested' or new.priority <> 0 then
      raise exception 'Coaches may suggest competencies, but only the client can activate or prioritize them.';
    end if;
  end if;

  if tg_op = 'UPDATE' and is_coach and not is_client then
    if new.program_id is distinct from old.program_id
      or new.competency_id is distinct from old.competency_id
      or (
        (new.status is distinct from old.status or new.priority is distinct from old.priority)
        and not (new.status = 'suggested' and new.priority = 0 and old.status in ('suggested', 'archived'))
      ) then
      raise exception 'Only the client can change competency activation or priority.';
    end if;
  end if;

  if new.status = 'suggested' then
    new.priority := 0;
  end if;

  if new.status = 'active' and not rebalancing then
    if new.priority < 1 then
      raise exception 'Active competencies must use a priority of 1 or higher.';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(new.program_id::text, 0));

    select count(*) into same_priority_count
    from public.program_competencies
    where program_id = new.program_id
      and status = 'active'
      and priority = new.priority
      and id <> new.id;

    if same_priority_count > 0 then
      raise exception 'The selected competency priority is already in use.';
    end if;
  end if;

  if tg_op = 'UPDATE'
    and is_client
    and not rebalancing
    and old.status = 'active'
    and old.priority = 1
    and new.status <> 'active' then
    select id into next_primary_id
    from public.program_competencies
    where program_id = old.program_id
      and status = 'active'
      and id <> old.id
    order by priority, created_at, id
    limit 1;

    if next_primary_id is not null then
      perform set_config('app.competency_priority_rebalance', 'on', true);
      update public.program_competencies
      set priority = 1
      where id = next_primary_id;
      perform set_config('app.competency_priority_rebalance', 'off', true);
    end if;
  end if;

  new.updated_by := auth.uid();
  return new;
end;
$function$;
