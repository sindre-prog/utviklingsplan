alter table public.coaching_programs
  add column if not exists context text;

alter table public.development_areas
  add column if not exists typical_situations text;

alter table public.development_areas
  drop constraint if exists development_areas_project_type_check;

alter table public.development_areas
  add constraint development_areas_project_type_check
  check (project_type = any (array['inner'::text, 'outer'::text, 'both'::text]));

alter table public.session_actions
  drop constraint if exists session_actions_status_check;

update public.session_actions
set status = case status
  when 'todo' then 'planned'
  when 'doing' then 'active'
  when 'testing' then 'active'
  when 'done' then 'reviewed'
  when 'reviewed' then 'reviewed'
  when 'dropped' then 'closed'
  when 'continued' then 'continued'
  when 'closed' then 'closed'
  else 'planned'
end;

alter table public.session_actions
  alter column status set default 'planned';

alter table public.session_actions
  add constraint session_actions_status_check
  check (status = any (array[
    'planned'::text,
    'active'::text,
    'reviewed'::text,
    'continued'::text,
    'closed'::text
  ]));

create index if not exists session_actions_development_area_id_idx
  on public.session_actions using btree (development_area_id);

create index if not exists client_reflections_development_area_id_idx
  on public.client_reflections using btree (development_area_id);

comment on column public.coaching_programs.context is
  'Stakeholders and organizational context for the coaching program.';

comment on column public.development_areas.typical_situations is
  'Typical work situations where this focus area appears.';

comment on column public.development_areas.next_practice is
  'Legacy free-text practice field. Not used by Fokusomrader V2; experiments should be stored in session_actions.';
