-- Tighten access boundaries around coaching content.
-- Admins manage users and access. Clients and assigned coaches own the actual development content.

revoke all on table public.client_reflections from anon;
revoke all on table public.clients from anon;
revoke all on table public.coaches from anon;
revoke all on table public.coaching_programs from anon;
revoke all on table public.coaching_sessions from anon;
revoke all on table public.development_areas from anon;
revoke all on table public.profiles from anon;
revoke all on table public.program_evaluations from anon;
revoke all on table public.session_actions from anon;

create or replace function public.can_write_program(program_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    public.is_program_coach(program_uuid)
    or public.is_program_client(program_uuid)
$function$;

drop policy if exists "Admin can do everything on clients" on public.clients;
drop policy if exists "Client can read own data" on public.clients;
drop policy if exists "Client can update own data" on public.clients;
drop policy if exists "Coach can read own clients" on public.clients;
drop policy if exists "clients_read_own" on public.clients;

create policy "clients_admin_manage"
on public.clients
as permissive
for all
to authenticated
using (public.current_profile_role() = 'admin')
with check (public.current_profile_role() = 'admin');

create policy "clients_read_own"
on public.clients
as permissive
for select
to authenticated
using (user_id = auth.uid());

create policy "clients_update_own"
on public.clients
as permissive
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "clients_read_assigned_coach"
on public.clients
as permissive
for select
to authenticated
using (public.current_coach_id() = any(coalesce(coach_ids, '{}'::uuid[])));

drop policy if exists "Admin can do everything on coaches" on public.coaches;
drop policy if exists "Coach can read own data" on public.coaches;

create policy "coaches_admin_manage"
on public.coaches
as permissive
for all
to authenticated
using (public.current_profile_role() = 'admin')
with check (public.current_profile_role() = 'admin');

create policy "coaches_read_own"
on public.coaches
as permissive
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "profiles_read_own" on public.profiles;

create policy "profiles_read_own"
on public.profiles
as permissive
for select
to authenticated
using (id = auth.uid());

drop policy if exists "programs_insert_assigned_coach" on public.coaching_programs;
drop policy if exists "programs_update_assigned_coach" on public.coaching_programs;
drop policy if exists "programs_write_admin_coach_client" on public.coaching_programs;

create policy "programs_insert_admin_or_assigned_coach"
on public.coaching_programs
as permissive
for insert
to authenticated
with check (
  public.current_profile_role() = 'admin'
  or public.is_coach_for_client(client_id)
);

create policy "programs_update_client_or_assigned_coach"
on public.coaching_programs
as permissive
for update
to authenticated
using (public.is_client_user(client_id) or public.is_coach_for_client(client_id))
with check (public.is_client_user(client_id) or public.is_coach_for_client(client_id));

drop policy if exists "sessions_write_admin_coach_client" on public.coaching_sessions;
drop policy if exists "sessions_write_program_coach" on public.coaching_sessions;

create policy "sessions_insert_client_or_coach"
on public.coaching_sessions
as permissive
for insert
to authenticated
with check (public.can_write_program(program_id));

create policy "sessions_update_client_or_coach"
on public.coaching_sessions
as permissive
for update
to authenticated
using (public.can_write_program(program_id))
with check (public.can_write_program(program_id));

create policy "sessions_delete_client_or_coach"
on public.coaching_sessions
as permissive
for delete
to authenticated
using (public.can_write_program(program_id));

drop policy if exists "areas_write_admin_coach_client" on public.development_areas;
drop policy if exists "areas_write_program_coach" on public.development_areas;

create policy "areas_insert_client_or_coach"
on public.development_areas
as permissive
for insert
to authenticated
with check (public.can_write_program(program_id));

create policy "areas_update_client_or_coach"
on public.development_areas
as permissive
for update
to authenticated
using (public.can_write_program(program_id))
with check (public.can_write_program(program_id));

create policy "areas_delete_client_or_coach"
on public.development_areas
as permissive
for delete
to authenticated
using (public.can_write_program(program_id));

drop policy if exists "evaluations_delete_program_coach" on public.program_evaluations;
drop policy if exists "evaluations_insert_program_access" on public.program_evaluations;
drop policy if exists "evaluations_update_program_access" on public.program_evaluations;
drop policy if exists "evaluations_write_admin_coach_client" on public.program_evaluations;

create policy "evaluations_insert_client_or_coach"
on public.program_evaluations
as permissive
for insert
to authenticated
with check (public.can_write_program(program_id));

create policy "evaluations_update_client_or_coach"
on public.program_evaluations
as permissive
for update
to authenticated
using (public.can_write_program(program_id))
with check (public.can_write_program(program_id));

create policy "evaluations_delete_client_or_coach"
on public.program_evaluations
as permissive
for delete
to authenticated
using (public.can_write_program(program_id));

drop policy if exists "actions_delete_program_coach" on public.session_actions;
drop policy if exists "actions_insert_program_coach" on public.session_actions;
drop policy if exists "actions_update_program_access" on public.session_actions;
drop policy if exists "actions_write_admin_coach_client" on public.session_actions;

create policy "actions_insert_client_or_coach"
on public.session_actions
as permissive
for insert
to authenticated
with check (public.can_write_program(program_id));

create policy "actions_update_client_or_coach"
on public.session_actions
as permissive
for update
to authenticated
using (public.can_write_program(program_id))
with check (public.can_write_program(program_id));

create policy "actions_delete_client_or_coach"
on public.session_actions
as permissive
for delete
to authenticated
using (public.can_write_program(program_id));
