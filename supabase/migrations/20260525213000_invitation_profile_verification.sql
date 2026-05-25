drop policy if exists "profiles_admin_read" on public.profiles;
drop policy if exists "profiles_assigned_coach_read" on public.profiles;

create policy "profiles_admin_read"
on public.profiles
as permissive
for select
to authenticated
using (public.current_profile_role() = 'admin');

create policy "profiles_assigned_coach_read"
on public.profiles
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.clients
    where clients.user_id = profiles.id
      and public.current_coach_id() = any(coalesce(clients.coach_ids, '{}'::uuid[]))
  )
);
