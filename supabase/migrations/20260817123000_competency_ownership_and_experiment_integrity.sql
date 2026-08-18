-- Protect client ownership of active competency priorities and keep shared experiment links in one program.
-- This migration is additive: legacy focus types and existing experiment payloads are not rewritten.

alter table public.program_competencies
  drop constraint if exists program_competencies_status_check;

alter table public.program_competencies
  add constraint program_competencies_status_check check (status = any (array[
    'suggested'::text,
    'active'::text,
    'paused'::text,
    'completed'::text,
    'archived'::text
  ]));

-- Normal product flows archive competency tracks. Hard deletion remains available only to
-- privileged maintenance/privacy processes that bypass table RLS.
drop policy if exists "program_competencies_delete_client_or_coach" on public.program_competencies;

-- Normalize already selected rows into one primary and up to two supporting priorities.
with ranked as (
  select
    id,
    row_number() over (
      partition by program_id
      order by case when priority > 0 then priority else 2147483647 end, created_at, id
    ) as next_priority
  from public.program_competencies
  where status = 'active'
)
update public.program_competencies pc
set priority = least(ranked.next_priority, 3)
from ranked
where pc.id = ranked.id
  and ranked.next_priority <= 3;

-- Preserve any unexpected fourth+ legacy selection as paused instead of discarding it.
with ranked as (
  select
    id,
    row_number() over (
      partition by program_id
      order by case when priority > 0 then priority else 2147483647 end, created_at, id
    ) as next_priority
  from public.program_competencies
  where status = 'active'
)
update public.program_competencies pc
set status = 'paused', priority = 0
from ranked
where pc.id = ranked.id
  and ranked.next_priority > 3;

create or replace function public.guard_program_competency_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  active_count integer;
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
    if new.priority not between 1 and 3 then
      raise exception 'Active competencies must use priority 1, 2 or 3.';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(new.program_id::text, 0));

    select count(*) into active_count
    from public.program_competencies
    where program_id = new.program_id
      and status = 'active'
      and id <> new.id;

    if active_count >= 3 then
      raise exception 'A program can have one primary and up to two supporting competencies.';
    end if;

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

drop trigger if exists guard_program_competency_ownership on public.program_competencies;
create trigger guard_program_competency_ownership
before insert or update on public.program_competencies
for each row execute function public.guard_program_competency_ownership();

create or replace function public.set_primary_program_competency(p_program_competency_id uuid)
returns public.program_competencies
language plpgsql
security definer
set search_path = public
as $function$
declare
  target public.program_competencies;
  result_row public.program_competencies;
  primary_id uuid;
  target_priority integer;
begin
  select * into target
  from public.program_competencies
  where id = p_program_competency_id;

  if target.id is null or not public.is_program_client(target.program_id) then
    raise exception 'Only the client can choose the primary competency.';
  end if;

  if target.status <> 'active' then
    raise exception 'Only an active competency can become the primary focus.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target.program_id::text, 0));

  select id into primary_id
  from public.program_competencies
  where program_id = target.program_id
    and status = 'active'
    and priority = 1
    and id <> target.id
  limit 1;

  target_priority := greatest(target.priority, 2);
  perform set_config('app.competency_priority_rebalance', 'on', true);

  update public.program_competencies
  set priority = case
    when id = target.id then 1
    when id = primary_id then target_priority
    else priority
  end
  where id in (target.id, primary_id);

  perform set_config('app.competency_priority_rebalance', 'off', true);

  select * into result_row
  from public.program_competencies
  where id = target.id;

  return result_row;
end;
$function$;

revoke all on function public.set_primary_program_competency(uuid) from public;
grant execute on function public.set_primary_program_competency(uuid) to authenticated;

-- Composite keys let foreign keys enforce that every optional experiment link belongs to its program.
do $block$
begin
  if not exists (select 1 from pg_constraint where conname = 'program_competencies_id_program_key') then
    alter table public.program_competencies
      add constraint program_competencies_id_program_key unique (id, program_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'development_areas_id_program_key') then
    alter table public.development_areas
      add constraint development_areas_id_program_key unique (id, program_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'coaching_sessions_id_program_key') then
    alter table public.coaching_sessions
      add constraint coaching_sessions_id_program_key unique (id, program_id);
  end if;
end
$block$;

do $block$
begin
  if not exists (select 1 from pg_constraint where conname = 'session_actions_competency_same_program_fkey') then
    alter table public.session_actions
      add constraint session_actions_competency_same_program_fkey
      foreign key (program_competency_id, program_id)
      references public.program_competencies(id, program_id)
      on delete set null (program_competency_id)
      not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'session_actions_area_same_program_fkey') then
    alter table public.session_actions
      add constraint session_actions_area_same_program_fkey
      foreign key (development_area_id, program_id)
      references public.development_areas(id, program_id)
      on delete set null (development_area_id)
      not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'session_actions_session_same_program_fkey') then
    alter table public.session_actions
      add constraint session_actions_session_same_program_fkey
      foreign key (session_id, program_id)
      references public.coaching_sessions(id, program_id)
      on delete set null (session_id)
      not valid;
  end if;
end
$block$;

comment on table public.session_actions is
  'Shared experiment object. May link to a competency, focus assignment, both, a session, or none; learning remains in the versioned description payload.';
