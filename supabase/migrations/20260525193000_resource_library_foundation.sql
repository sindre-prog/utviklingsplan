-- Resource library foundation.
-- Batch 1B creates schema, constraints, RLS and private storage only. No UI and no pilot content.

create table if not exists public.resources (
  id uuid not null default gen_random_uuid(),
  title text not null,
  slug text not null,
  summary text not null default ''::text,
  type text not null,
  format text not null default 'native'::text,
  phase text not null,
  visibility text not null default 'client_assignable'::text,
  status text not null default 'draft'::text,
  review_status text not null default 'draft'::text,
  language text not null default 'no'::text,
  estimated_duration integer,
  difficulty text,
  intended_outcome text,
  best_used_when jsonb not null default '[]'::jsonb,
  not_for jsonb not null default '[]'::jsonb,
  coach_guidance text,
  client_intro text,
  suggested_coach_note text,
  default_context_types jsonb not null default '[]'::jsonb,
  content_json jsonb not null default '[]'::jsonb,
  reflection_prompts jsonb not null default '[]'::jsonb,
  next_step_prompt text,
  basis text,
  reviewed_by text,
  last_reviewed_at date,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_at timestamp with time zone not null default now(),
  archived_at timestamp with time zone,
  constraint resources_pkey primary key (id),
  constraint resources_slug_key unique (slug),
  constraint resources_type_check check (type = any (array[
    'article'::text,
    'exercise'::text,
    'reflection'::text,
    'worksheet'::text,
    'assessment'::text,
    'audio'::text,
    'video'::text,
    'framework'::text,
    'template'::text,
    'guided_session'::text
  ])),
  constraint resources_format_check check (format = any (array[
    'native'::text,
    'pdf'::text,
    'audio'::text,
    'video'::text,
    'link'::text,
    'mixed'::text
  ])),
  constraint resources_phase_check check (phase = any (array[
    'direction'::text,
    'focus'::text,
    'experiment'::text,
    'observation'::text,
    'session'::text,
    'reflection'::text,
    'adjustment'::text
  ])),
  constraint resources_visibility_check check (visibility = any (array[
    'admin'::text,
    'coach'::text,
    'client_assignable'::text
  ])),
  constraint resources_status_check check (status = any (array[
    'draft'::text,
    'published'::text,
    'archived'::text
  ])),
  constraint resources_review_status_check check (review_status = any (array[
    'draft'::text,
    'approved_for_pilot'::text,
    'reviewed'::text,
    'needs_revision'::text
  ])),
  constraint resources_difficulty_check check (
    difficulty is null
    or difficulty = any (array['easy'::text, 'medium'::text, 'advanced'::text])
  ),
  constraint resources_estimated_duration_check check (
    estimated_duration is null
    or estimated_duration > 0
  ),
  constraint resources_best_used_when_array_check check (jsonb_typeof(best_used_when) = 'array'),
  constraint resources_not_for_array_check check (jsonb_typeof(not_for) = 'array'),
  constraint resources_default_context_types_array_check check (jsonb_typeof(default_context_types) = 'array'),
  constraint resources_content_json_array_check check (jsonb_typeof(content_json) = 'array'),
  constraint resources_reflection_prompts_array_check check (jsonb_typeof(reflection_prompts) = 'array')
);

create table if not exists public.resource_tags (
  id uuid not null default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  tag text not null,
  created_at timestamp with time zone not null default now(),
  constraint resource_tags_pkey primary key (id),
  constraint resource_tags_resource_id_tag_key unique (resource_id, tag),
  constraint resource_tags_tag_not_blank check (length(trim(tag)) > 0)
);

create table if not exists public.resource_files (
  id uuid not null default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  file_type text not null,
  storage_path text not null,
  display_name text not null,
  sort_order integer not null default 0,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_at timestamp with time zone not null default now(),
  archived_at timestamp with time zone,
  constraint resource_files_pkey primary key (id),
  constraint resource_files_resource_id_storage_path_key unique (resource_id, storage_path),
  constraint resource_files_file_type_check check (file_type = any (array[
    'cover_image'::text,
    'illustration'::text,
    'printable'::text,
    'attachment'::text,
    'audio'::text,
    'video'::text
  ])),
  constraint resource_files_storage_path_not_blank check (length(trim(storage_path)) > 0),
  constraint resource_files_display_name_not_blank check (length(trim(display_name)) > 0)
);

create table if not exists public.shared_resources (
  id uuid not null default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete cascade,
  program_id uuid references public.coaching_programs(id) on delete cascade,
  context_type text not null default 'program'::text,
  context_id uuid,
  coach_note text,
  client_note text,
  client_visibility text not null default 'private'::text,
  status text not null default 'assigned'::text,
  shared_by uuid default auth.uid() references auth.users(id) on delete set null,
  shared_at timestamp with time zone not null default now(),
  viewed_at timestamp with time zone,
  responded_at timestamp with time zone,
  archived_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint shared_resources_pkey primary key (id),
  constraint shared_resources_status_check check (status = any (array[
    'assigned'::text,
    'viewed'::text,
    'responded'::text,
    'archived'::text
  ])),
  constraint shared_resources_context_type_check check (context_type = any (array[
    'program'::text,
    'focus_area'::text,
    'session'::text,
    'experiment'::text,
    'reflection'::text
  ])),
  constraint shared_resources_client_visibility_check check (client_visibility = any (array[
    'private'::text,
    'shared_with_coach'::text
  ])),
  constraint shared_resources_context_id_required_check check (
    (context_type = 'program'::text and context_id is null)
    or (context_type <> 'program'::text and context_id is not null)
  )
);

alter table public.resources enable row level security;
alter table public.resource_tags enable row level security;
alter table public.resource_files enable row level security;
alter table public.shared_resources enable row level security;

revoke all on table public.resources from anon;
revoke all on table public.resource_tags from anon;
revoke all on table public.resource_files from anon;
revoke all on table public.shared_resources from anon;

grant select, insert, update, delete on table public.resources to authenticated;
grant select, insert, update, delete on table public.resource_tags to authenticated;
grant select, insert, update, delete on table public.resource_files to authenticated;
grant select, insert, update, delete on table public.shared_resources to authenticated;

create index if not exists resources_status_idx
  on public.resources using btree (status);

create index if not exists resources_phase_idx
  on public.resources using btree (phase);

create index if not exists resources_type_idx
  on public.resources using btree (type);

create index if not exists resources_visibility_idx
  on public.resources using btree (visibility);

create index if not exists resource_tags_resource_id_idx
  on public.resource_tags using btree (resource_id);

create index if not exists resource_tags_tag_idx
  on public.resource_tags using btree (tag);

create index if not exists resource_files_resource_id_idx
  on public.resource_files using btree (resource_id);

create index if not exists resource_files_file_type_idx
  on public.resource_files using btree (file_type);

create index if not exists shared_resources_client_id_idx
  on public.shared_resources using btree (client_id);

create index if not exists shared_resources_program_id_idx
  on public.shared_resources using btree (program_id);

create index if not exists shared_resources_resource_id_idx
  on public.shared_resources using btree (resource_id);

create index if not exists shared_resources_context_idx
  on public.shared_resources using btree (context_type, context_id);

create index if not exists shared_resources_status_idx
  on public.shared_resources using btree (status);

create index if not exists shared_resources_client_resource_active_idx
  on public.shared_resources using btree (client_id, resource_id)
  where archived_at is null;

create or replace function public.guard_shared_resource_update()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  role_name text;
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
    if new.resource_id is distinct from old.resource_id
      or new.client_id is distinct from old.client_id
      or new.client_note is distinct from old.client_note
      or new.client_visibility is distinct from old.client_visibility
      or new.viewed_at is distinct from old.viewed_at
      or new.responded_at is distinct from old.responded_at
      or new.shared_by is distinct from old.shared_by
      or new.shared_at is distinct from old.shared_at
      or new.created_at is distinct from old.created_at
    then
      raise exception 'Coaches cannot update client reflection fields or immutable assignment fields.';
    end if;

    return new;
  end if;

  raise exception 'Not allowed to update shared resource.';
end;
$function$;

drop trigger if exists set_updated_at_resources on public.resources;
create trigger set_updated_at_resources
before update on public.resources
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_resource_files on public.resource_files;
create trigger set_updated_at_resource_files
before update on public.resource_files
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_shared_resources on public.shared_resources;
create trigger set_updated_at_shared_resources
before update on public.shared_resources
for each row
execute function public.set_updated_at();

drop trigger if exists guard_shared_resource_update on public.shared_resources;
create trigger guard_shared_resource_update
before update on public.shared_resources
for each row
execute function public.guard_shared_resource_update();

drop policy if exists "resources_admin_manage" on public.resources;
drop policy if exists "resources_coach_read_published" on public.resources;
drop policy if exists "resources_client_read_assigned" on public.resources;

create policy "resources_admin_manage"
on public.resources
as permissive
for all
to authenticated
using (public.current_profile_role() = 'admin')
with check (public.current_profile_role() = 'admin');

create policy "resources_coach_read_published"
on public.resources
as permissive
for select
to authenticated
using (
  public.current_profile_role() = 'coach'
  and status = 'published'
  and visibility = any (array['coach'::text, 'client_assignable'::text])
);

create policy "resources_client_read_assigned"
on public.resources
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.shared_resources sr
    where sr.resource_id = resources.id
      and sr.archived_at is null
      and public.is_client_user(sr.client_id)
  )
);

drop policy if exists "resource_tags_admin_manage" on public.resource_tags;
drop policy if exists "resource_tags_coach_read_accessible" on public.resource_tags;
drop policy if exists "resource_tags_client_read_assigned" on public.resource_tags;

create policy "resource_tags_admin_manage"
on public.resource_tags
as permissive
for all
to authenticated
using (public.current_profile_role() = 'admin')
with check (public.current_profile_role() = 'admin');

create policy "resource_tags_coach_read_accessible"
on public.resource_tags
as permissive
for select
to authenticated
using (
  public.current_profile_role() = 'coach'
  and exists (
    select 1
    from public.resources r
    where r.id = resource_tags.resource_id
      and r.status = 'published'
      and r.visibility = any (array['coach'::text, 'client_assignable'::text])
  )
);

create policy "resource_tags_client_read_assigned"
on public.resource_tags
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.shared_resources sr
    where sr.resource_id = resource_tags.resource_id
      and sr.archived_at is null
      and public.is_client_user(sr.client_id)
  )
);

drop policy if exists "resource_files_admin_manage" on public.resource_files;
drop policy if exists "resource_files_coach_read_accessible" on public.resource_files;
drop policy if exists "resource_files_client_read_assigned" on public.resource_files;

create policy "resource_files_admin_manage"
on public.resource_files
as permissive
for all
to authenticated
using (public.current_profile_role() = 'admin')
with check (public.current_profile_role() = 'admin');

create policy "resource_files_coach_read_accessible"
on public.resource_files
as permissive
for select
to authenticated
using (
  public.current_profile_role() = 'coach'
  and exists (
    select 1
    from public.resources r
    where r.id = resource_files.resource_id
      and r.status = 'published'
      and r.visibility = any (array['coach'::text, 'client_assignable'::text])
  )
);

create policy "resource_files_client_read_assigned"
on public.resource_files
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.shared_resources sr
    where sr.resource_id = resource_files.resource_id
      and sr.archived_at is null
      and public.is_client_user(sr.client_id)
  )
);

drop policy if exists "shared_resources_admin_manage" on public.shared_resources;
drop policy if exists "shared_resources_coach_read_assigned_clients" on public.shared_resources;
drop policy if exists "shared_resources_client_read_own" on public.shared_resources;
drop policy if exists "shared_resources_coach_insert_assigned_clients" on public.shared_resources;
drop policy if exists "shared_resources_coach_update_assigned_clients" on public.shared_resources;
drop policy if exists "shared_resources_client_update_own" on public.shared_resources;

create policy "shared_resources_admin_manage"
on public.shared_resources
as permissive
for all
to authenticated
using (public.current_profile_role() = 'admin')
with check (public.current_profile_role() = 'admin');

create policy "shared_resources_coach_read_assigned_clients"
on public.shared_resources
as permissive
for select
to authenticated
using (public.is_coach_for_client(client_id));

create policy "shared_resources_client_read_own"
on public.shared_resources
as permissive
for select
to authenticated
using (public.is_client_user(client_id));

create policy "shared_resources_coach_insert_assigned_clients"
on public.shared_resources
as permissive
for insert
to authenticated
with check (
  public.is_coach_for_client(client_id)
  and (
    program_id is null
    or exists (
      select 1
      from public.coaching_programs p
      where p.id = program_id
        and p.client_id = shared_resources.client_id
    )
  )
);

create policy "shared_resources_coach_update_assigned_clients"
on public.shared_resources
as permissive
for update
to authenticated
using (public.is_coach_for_client(client_id))
with check (public.is_coach_for_client(client_id));

create policy "shared_resources_client_update_own"
on public.shared_resources
as permissive
for update
to authenticated
using (public.is_client_user(client_id))
with check (public.is_client_user(client_id));

insert into storage.buckets (id, name, public)
values ('resource-assets', 'resource-assets', false)
on conflict (id) do update
set public = false;

drop policy if exists "resource_assets_admin_manage" on storage.objects;
drop policy if exists "resource_assets_coach_read_accessible" on storage.objects;
drop policy if exists "resource_assets_client_read_assigned" on storage.objects;

create policy "resource_assets_admin_manage"
on storage.objects
as permissive
for all
to authenticated
using (
  bucket_id = 'resource-assets'
  and public.current_profile_role() = 'admin'
)
with check (
  bucket_id = 'resource-assets'
  and public.current_profile_role() = 'admin'
);

create policy "resource_assets_coach_read_accessible"
on storage.objects
as permissive
for select
to authenticated
using (
  bucket_id = 'resource-assets'
  and public.current_profile_role() = 'coach'
  and exists (
    select 1
    from public.resource_files rf
    join public.resources r on r.id = rf.resource_id
    where rf.storage_path = storage.objects.name
      and rf.archived_at is null
      and r.status = 'published'
      and r.visibility = any (array['coach'::text, 'client_assignable'::text])
  )
);

create policy "resource_assets_client_read_assigned"
on storage.objects
as permissive
for select
to authenticated
using (
  bucket_id = 'resource-assets'
  and exists (
    select 1
    from public.resource_files rf
    join public.shared_resources sr on sr.resource_id = rf.resource_id
    where rf.storage_path = storage.objects.name
      and rf.archived_at is null
      and sr.archived_at is null
      and public.is_client_user(sr.client_id)
  )
);

comment on table public.resources is
  'Native resource library content and metadata. Clients can only read resources assigned through shared_resources.';

comment on table public.resource_tags is
  'Search and filtering tags for resources.';

comment on table public.resource_files is
  'Private Supabase Storage file metadata for resource assets and downloads.';

comment on table public.shared_resources is
  'Coach-to-client resource assignments with coaching context, status and optional client reflection.';
