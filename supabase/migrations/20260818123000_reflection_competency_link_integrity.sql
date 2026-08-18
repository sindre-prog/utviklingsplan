-- Keep new reflection links inside the reflection's coaching program.
-- NOT VALID preserves legacy rows while PostgreSQL enforces the rule for every new write.

do $block$
begin
  if not exists (select 1 from pg_constraint where conname = 'client_reflections_competency_same_program_fkey') then
    alter table public.client_reflections
      add constraint client_reflections_competency_same_program_fkey
      foreign key (program_competency_id, program_id)
      references public.program_competencies(id, program_id)
      on delete set null (program_competency_id)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'client_reflections_area_same_program_fkey') then
    alter table public.client_reflections
      add constraint client_reflections_area_same_program_fkey
      foreign key (development_area_id, program_id)
      references public.development_areas(id, program_id)
      on delete set null (development_area_id)
      not valid;
  end if;
end
$block$;

comment on column public.client_reflections.program_competency_id is
  'Optional link to a competency track in the same program. Visibility remains controlled by client_reflections RLS.';
