
  create table "public"."client_reflections" (
    "id" uuid not null default gen_random_uuid(),
    "program_id" uuid not null,
    "session_id" uuid,
    "action_id" uuid,
    "development_area_id" uuid,
    "visibility" text not null default 'private'::text,
    "prompt" text,
    "body" text not null default ''::text,
    "created_by" uuid not null default auth.uid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."client_reflections" enable row level security;


  create table "public"."clients" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "name" text not null,
    "code" text not null,
    "consent_given" boolean default false,
    "consent_date" timestamp with time zone,
    "plan" jsonb default '{}'::jsonb,
    "last_saved" timestamp with time zone,
    "coach_ids" uuid[] default '{}'::uuid[],
    "role" text,
    "employer" text,
    "user_id" uuid,
    "email" text
      );


alter table "public"."clients" enable row level security;


  create table "public"."coaches" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "name" text not null,
    "code" text not null,
    "user_id" uuid,
    "email" text
      );


alter table "public"."coaches" enable row level security;


  create table "public"."coaching_programs" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null,
    "status" text not null default 'draft'::text,
    "purpose" text,
    "success_criteria" text,
    "expectations_coach" text,
    "expectations_client" text,
    "confidentiality" text,
    "practical_frame" text,
    "start_date" date,
    "end_date" date,
    "session_count" integer,
    "session_duration" text,
    "created_by" uuid default auth.uid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."coaching_programs" enable row level security;


  create table "public"."coaching_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "program_id" uuid not null,
    "session_number" integer,
    "session_date" date,
    "focus" text,
    "insights" text,
    "decisions" text,
    "coach_notes" text,
    "client_notes" text,
    "created_by" uuid default auth.uid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "conversation_goal" text
      );


alter table "public"."coaching_sessions" enable row level security;


  create table "public"."development_areas" (
    "id" uuid not null default gen_random_uuid(),
    "program_id" uuid not null,
    "title" text not null default ''::text,
    "description" text,
    "sort_order" integer not null default 0,
    "status" text not null default 'active'::text,
    "created_by" uuid default auth.uid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "project_type" text not null default 'inner'::text,
    "movement" text,
    "progress_signs" text,
    "next_practice" text
      );


alter table "public"."development_areas" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "role" text not null,
    "name" text not null
      );


alter table "public"."profiles" enable row level security;


  create table "public"."program_evaluations" (
    "id" uuid not null default gen_random_uuid(),
    "program_id" uuid not null,
    "achieved" text,
    "reflection" text,
    "next_steps" text,
    "client_rating" integer,
    "created_by" uuid default auth.uid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."program_evaluations" enable row level security;


  create table "public"."session_actions" (
    "id" uuid not null default gen_random_uuid(),
    "program_id" uuid not null,
    "session_id" uuid,
    "development_area_id" uuid,
    "title" text not null default ''::text,
    "description" text,
    "due_date" date,
    "status" text not null default 'todo'::text,
    "completion_reflection" text,
    "created_by" uuid default auth.uid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."session_actions" enable row level security;

CREATE INDEX client_reflections_created_by_idx ON public.client_reflections USING btree (created_by);

CREATE UNIQUE INDEX client_reflections_pkey ON public.client_reflections USING btree (id);

CREATE INDEX client_reflections_program_id_idx ON public.client_reflections USING btree (program_id);

CREATE INDEX client_reflections_visibility_idx ON public.client_reflections USING btree (visibility);

CREATE UNIQUE INDEX clients_code_key ON public.clients USING btree (code);

CREATE UNIQUE INDEX clients_pkey ON public.clients USING btree (id);

CREATE UNIQUE INDEX coaches_code_key ON public.coaches USING btree (code);

CREATE UNIQUE INDEX coaches_pkey ON public.coaches USING btree (id);

CREATE UNIQUE INDEX coaches_user_id_unique_idx ON public.coaches USING btree (user_id) WHERE (user_id IS NOT NULL);

CREATE INDEX coaching_programs_client_id_idx ON public.coaching_programs USING btree (client_id);

CREATE UNIQUE INDEX coaching_programs_pkey ON public.coaching_programs USING btree (id);

CREATE INDEX coaching_programs_status_idx ON public.coaching_programs USING btree (status);

CREATE INDEX coaching_sessions_date_idx ON public.coaching_sessions USING btree (session_date);

CREATE UNIQUE INDEX coaching_sessions_pkey ON public.coaching_sessions USING btree (id);

CREATE INDEX coaching_sessions_program_id_idx ON public.coaching_sessions USING btree (program_id);

CREATE UNIQUE INDEX development_areas_pkey ON public.development_areas USING btree (id);

CREATE INDEX development_areas_program_id_idx ON public.development_areas USING btree (program_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX program_evaluations_pkey ON public.program_evaluations USING btree (id);

CREATE UNIQUE INDEX program_evaluations_program_id_key ON public.program_evaluations USING btree (program_id);

CREATE UNIQUE INDEX session_actions_pkey ON public.session_actions USING btree (id);

CREATE INDEX session_actions_program_id_idx ON public.session_actions USING btree (program_id);

CREATE INDEX session_actions_session_id_idx ON public.session_actions USING btree (session_id);

CREATE INDEX session_actions_status_idx ON public.session_actions USING btree (status);

alter table "public"."client_reflections" add constraint "client_reflections_pkey" PRIMARY KEY using index "client_reflections_pkey";

alter table "public"."clients" add constraint "clients_pkey" PRIMARY KEY using index "clients_pkey";

alter table "public"."coaches" add constraint "coaches_pkey" PRIMARY KEY using index "coaches_pkey";

alter table "public"."coaching_programs" add constraint "coaching_programs_pkey" PRIMARY KEY using index "coaching_programs_pkey";

alter table "public"."coaching_sessions" add constraint "coaching_sessions_pkey" PRIMARY KEY using index "coaching_sessions_pkey";

alter table "public"."development_areas" add constraint "development_areas_pkey" PRIMARY KEY using index "development_areas_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."program_evaluations" add constraint "program_evaluations_pkey" PRIMARY KEY using index "program_evaluations_pkey";

alter table "public"."session_actions" add constraint "session_actions_pkey" PRIMARY KEY using index "session_actions_pkey";

alter table "public"."client_reflections" add constraint "client_reflections_action_id_fkey" FOREIGN KEY (action_id) REFERENCES public.session_actions(id) ON DELETE SET NULL not valid;

alter table "public"."client_reflections" validate constraint "client_reflections_action_id_fkey";

alter table "public"."client_reflections" add constraint "client_reflections_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."client_reflections" validate constraint "client_reflections_created_by_fkey";

alter table "public"."client_reflections" add constraint "client_reflections_development_area_id_fkey" FOREIGN KEY (development_area_id) REFERENCES public.development_areas(id) ON DELETE SET NULL not valid;

alter table "public"."client_reflections" validate constraint "client_reflections_development_area_id_fkey";

alter table "public"."client_reflections" add constraint "client_reflections_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public.coaching_programs(id) ON DELETE CASCADE not valid;

alter table "public"."client_reflections" validate constraint "client_reflections_program_id_fkey";

alter table "public"."client_reflections" add constraint "client_reflections_session_id_fkey" FOREIGN KEY (session_id) REFERENCES public.coaching_sessions(id) ON DELETE SET NULL not valid;

alter table "public"."client_reflections" validate constraint "client_reflections_session_id_fkey";

alter table "public"."client_reflections" add constraint "client_reflections_visibility_check" CHECK ((visibility = ANY (ARRAY['private'::text, 'shared_with_coach'::text]))) not valid;

alter table "public"."client_reflections" validate constraint "client_reflections_visibility_check";

alter table "public"."clients" add constraint "clients_code_key" UNIQUE using index "clients_code_key";

alter table "public"."clients" add constraint "clients_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."clients" validate constraint "clients_user_id_fkey";

alter table "public"."coaches" add constraint "coaches_code_key" UNIQUE using index "coaches_code_key";

alter table "public"."coaches" add constraint "coaches_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."coaches" validate constraint "coaches_user_id_fkey";

alter table "public"."coaching_programs" add constraint "coaching_programs_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."coaching_programs" validate constraint "coaching_programs_client_id_fkey";

alter table "public"."coaching_programs" add constraint "coaching_programs_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."coaching_programs" validate constraint "coaching_programs_created_by_fkey";

alter table "public"."coaching_programs" add constraint "coaching_programs_session_count_check" CHECK (((session_count IS NULL) OR (session_count > 0))) not valid;

alter table "public"."coaching_programs" validate constraint "coaching_programs_session_count_check";

alter table "public"."coaching_programs" add constraint "coaching_programs_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'completed'::text, 'archived'::text]))) not valid;

alter table "public"."coaching_programs" validate constraint "coaching_programs_status_check";

alter table "public"."coaching_sessions" add constraint "coaching_sessions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."coaching_sessions" validate constraint "coaching_sessions_created_by_fkey";

alter table "public"."coaching_sessions" add constraint "coaching_sessions_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public.coaching_programs(id) ON DELETE CASCADE not valid;

alter table "public"."coaching_sessions" validate constraint "coaching_sessions_program_id_fkey";

alter table "public"."development_areas" add constraint "development_areas_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."development_areas" validate constraint "development_areas_created_by_fkey";

alter table "public"."development_areas" add constraint "development_areas_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public.coaching_programs(id) ON DELETE CASCADE not valid;

alter table "public"."development_areas" validate constraint "development_areas_program_id_fkey";

alter table "public"."development_areas" add constraint "development_areas_project_type_check" CHECK ((project_type = ANY (ARRAY['inner'::text, 'outer'::text]))) not valid;

alter table "public"."development_areas" validate constraint "development_areas_project_type_check";

alter table "public"."development_areas" add constraint "development_areas_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text]))) not valid;

alter table "public"."development_areas" validate constraint "development_areas_status_check";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'coach'::text, 'client'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."program_evaluations" add constraint "program_evaluations_client_rating_check" CHECK (((client_rating IS NULL) OR ((client_rating >= 1) AND (client_rating <= 10)))) not valid;

alter table "public"."program_evaluations" validate constraint "program_evaluations_client_rating_check";

alter table "public"."program_evaluations" add constraint "program_evaluations_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."program_evaluations" validate constraint "program_evaluations_created_by_fkey";

alter table "public"."program_evaluations" add constraint "program_evaluations_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public.coaching_programs(id) ON DELETE CASCADE not valid;

alter table "public"."program_evaluations" validate constraint "program_evaluations_program_id_fkey";

alter table "public"."program_evaluations" add constraint "program_evaluations_program_id_key" UNIQUE using index "program_evaluations_program_id_key";

alter table "public"."session_actions" add constraint "session_actions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."session_actions" validate constraint "session_actions_created_by_fkey";

alter table "public"."session_actions" add constraint "session_actions_development_area_id_fkey" FOREIGN KEY (development_area_id) REFERENCES public.development_areas(id) ON DELETE SET NULL not valid;

alter table "public"."session_actions" validate constraint "session_actions_development_area_id_fkey";

alter table "public"."session_actions" add constraint "session_actions_program_id_fkey" FOREIGN KEY (program_id) REFERENCES public.coaching_programs(id) ON DELETE CASCADE not valid;

alter table "public"."session_actions" validate constraint "session_actions_program_id_fkey";

alter table "public"."session_actions" add constraint "session_actions_session_id_fkey" FOREIGN KEY (session_id) REFERENCES public.coaching_sessions(id) ON DELETE SET NULL not valid;

alter table "public"."session_actions" validate constraint "session_actions_session_id_fkey";

alter table "public"."session_actions" add constraint "session_actions_status_check" CHECK ((status = ANY (ARRAY['todo'::text, 'doing'::text, 'done'::text, 'dropped'::text]))) not valid;

alter table "public"."session_actions" validate constraint "session_actions_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_access_program(program_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.coaching_programs p
    where p.id = program_uuid
      and (
        public.is_client_user(p.client_id)
        or public.is_coach_for_client(p.client_id)
      )
  )
$function$
;

CREATE OR REPLACE FUNCTION public.can_write_program(program_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    public.current_profile_role() = 'admin'
    or public.is_program_coach(program_uuid)
    or public.is_program_client(program_uuid)
$function$
;

CREATE OR REPLACE FUNCTION public.current_coach_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select id from public.coaches where user_id = auth.uid() limit 1
$function$
;

CREATE OR REPLACE FUNCTION public.current_profile_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select role from public.profiles where id = auth.uid()
$function$
;

CREATE OR REPLACE FUNCTION public.is_client_user(client_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.clients c
    where c.id = client_uuid
      and c.user_id = auth.uid()
  )
$function$
;

CREATE OR REPLACE FUNCTION public.is_coach_for_client(client_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.clients c
    where c.id = client_uuid
      and public.current_coach_id() = any(coalesce(c.coach_ids, '{}'::uuid[]))
  )
$function$
;

CREATE OR REPLACE FUNCTION public.is_program_client(program_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.coaching_programs p
    where p.id = program_uuid
      and public.is_client_user(p.client_id)
  )
$function$
;

CREATE OR REPLACE FUNCTION public.is_program_coach(program_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.coaching_programs p
    where p.id = program_uuid
      and public.is_coach_for_client(p.client_id)
  )
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."client_reflections" to "anon";

grant insert on table "public"."client_reflections" to "anon";

grant references on table "public"."client_reflections" to "anon";

grant select on table "public"."client_reflections" to "anon";

grant trigger on table "public"."client_reflections" to "anon";

grant truncate on table "public"."client_reflections" to "anon";

grant update on table "public"."client_reflections" to "anon";

grant delete on table "public"."client_reflections" to "authenticated";

grant insert on table "public"."client_reflections" to "authenticated";

grant references on table "public"."client_reflections" to "authenticated";

grant select on table "public"."client_reflections" to "authenticated";

grant trigger on table "public"."client_reflections" to "authenticated";

grant truncate on table "public"."client_reflections" to "authenticated";

grant update on table "public"."client_reflections" to "authenticated";

grant delete on table "public"."client_reflections" to "service_role";

grant insert on table "public"."client_reflections" to "service_role";

grant references on table "public"."client_reflections" to "service_role";

grant select on table "public"."client_reflections" to "service_role";

grant trigger on table "public"."client_reflections" to "service_role";

grant truncate on table "public"."client_reflections" to "service_role";

grant update on table "public"."client_reflections" to "service_role";

grant delete on table "public"."clients" to "anon";

grant insert on table "public"."clients" to "anon";

grant references on table "public"."clients" to "anon";

grant select on table "public"."clients" to "anon";

grant trigger on table "public"."clients" to "anon";

grant truncate on table "public"."clients" to "anon";

grant update on table "public"."clients" to "anon";

grant delete on table "public"."clients" to "authenticated";

grant insert on table "public"."clients" to "authenticated";

grant references on table "public"."clients" to "authenticated";

grant select on table "public"."clients" to "authenticated";

grant trigger on table "public"."clients" to "authenticated";

grant truncate on table "public"."clients" to "authenticated";

grant update on table "public"."clients" to "authenticated";

grant delete on table "public"."clients" to "service_role";

grant insert on table "public"."clients" to "service_role";

grant references on table "public"."clients" to "service_role";

grant select on table "public"."clients" to "service_role";

grant trigger on table "public"."clients" to "service_role";

grant truncate on table "public"."clients" to "service_role";

grant update on table "public"."clients" to "service_role";

grant delete on table "public"."coaches" to "anon";

grant insert on table "public"."coaches" to "anon";

grant references on table "public"."coaches" to "anon";

grant select on table "public"."coaches" to "anon";

grant trigger on table "public"."coaches" to "anon";

grant truncate on table "public"."coaches" to "anon";

grant update on table "public"."coaches" to "anon";

grant delete on table "public"."coaches" to "authenticated";

grant insert on table "public"."coaches" to "authenticated";

grant references on table "public"."coaches" to "authenticated";

grant select on table "public"."coaches" to "authenticated";

grant trigger on table "public"."coaches" to "authenticated";

grant truncate on table "public"."coaches" to "authenticated";

grant update on table "public"."coaches" to "authenticated";

grant delete on table "public"."coaches" to "service_role";

grant insert on table "public"."coaches" to "service_role";

grant references on table "public"."coaches" to "service_role";

grant select on table "public"."coaches" to "service_role";

grant trigger on table "public"."coaches" to "service_role";

grant truncate on table "public"."coaches" to "service_role";

grant update on table "public"."coaches" to "service_role";

grant delete on table "public"."coaching_programs" to "anon";

grant insert on table "public"."coaching_programs" to "anon";

grant references on table "public"."coaching_programs" to "anon";

grant select on table "public"."coaching_programs" to "anon";

grant trigger on table "public"."coaching_programs" to "anon";

grant truncate on table "public"."coaching_programs" to "anon";

grant update on table "public"."coaching_programs" to "anon";

grant delete on table "public"."coaching_programs" to "authenticated";

grant insert on table "public"."coaching_programs" to "authenticated";

grant references on table "public"."coaching_programs" to "authenticated";

grant select on table "public"."coaching_programs" to "authenticated";

grant trigger on table "public"."coaching_programs" to "authenticated";

grant truncate on table "public"."coaching_programs" to "authenticated";

grant update on table "public"."coaching_programs" to "authenticated";

grant delete on table "public"."coaching_programs" to "service_role";

grant insert on table "public"."coaching_programs" to "service_role";

grant references on table "public"."coaching_programs" to "service_role";

grant select on table "public"."coaching_programs" to "service_role";

grant trigger on table "public"."coaching_programs" to "service_role";

grant truncate on table "public"."coaching_programs" to "service_role";

grant update on table "public"."coaching_programs" to "service_role";

grant delete on table "public"."coaching_sessions" to "anon";

grant insert on table "public"."coaching_sessions" to "anon";

grant references on table "public"."coaching_sessions" to "anon";

grant select on table "public"."coaching_sessions" to "anon";

grant trigger on table "public"."coaching_sessions" to "anon";

grant truncate on table "public"."coaching_sessions" to "anon";

grant update on table "public"."coaching_sessions" to "anon";

grant delete on table "public"."coaching_sessions" to "authenticated";

grant insert on table "public"."coaching_sessions" to "authenticated";

grant references on table "public"."coaching_sessions" to "authenticated";

grant select on table "public"."coaching_sessions" to "authenticated";

grant trigger on table "public"."coaching_sessions" to "authenticated";

grant truncate on table "public"."coaching_sessions" to "authenticated";

grant update on table "public"."coaching_sessions" to "authenticated";

grant delete on table "public"."coaching_sessions" to "service_role";

grant insert on table "public"."coaching_sessions" to "service_role";

grant references on table "public"."coaching_sessions" to "service_role";

grant select on table "public"."coaching_sessions" to "service_role";

grant trigger on table "public"."coaching_sessions" to "service_role";

grant truncate on table "public"."coaching_sessions" to "service_role";

grant update on table "public"."coaching_sessions" to "service_role";

grant delete on table "public"."development_areas" to "anon";

grant insert on table "public"."development_areas" to "anon";

grant references on table "public"."development_areas" to "anon";

grant select on table "public"."development_areas" to "anon";

grant trigger on table "public"."development_areas" to "anon";

grant truncate on table "public"."development_areas" to "anon";

grant update on table "public"."development_areas" to "anon";

grant delete on table "public"."development_areas" to "authenticated";

grant insert on table "public"."development_areas" to "authenticated";

grant references on table "public"."development_areas" to "authenticated";

grant select on table "public"."development_areas" to "authenticated";

grant trigger on table "public"."development_areas" to "authenticated";

grant truncate on table "public"."development_areas" to "authenticated";

grant update on table "public"."development_areas" to "authenticated";

grant delete on table "public"."development_areas" to "service_role";

grant insert on table "public"."development_areas" to "service_role";

grant references on table "public"."development_areas" to "service_role";

grant select on table "public"."development_areas" to "service_role";

grant trigger on table "public"."development_areas" to "service_role";

grant truncate on table "public"."development_areas" to "service_role";

grant update on table "public"."development_areas" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."program_evaluations" to "anon";

grant insert on table "public"."program_evaluations" to "anon";

grant references on table "public"."program_evaluations" to "anon";

grant select on table "public"."program_evaluations" to "anon";

grant trigger on table "public"."program_evaluations" to "anon";

grant truncate on table "public"."program_evaluations" to "anon";

grant update on table "public"."program_evaluations" to "anon";

grant delete on table "public"."program_evaluations" to "authenticated";

grant insert on table "public"."program_evaluations" to "authenticated";

grant references on table "public"."program_evaluations" to "authenticated";

grant select on table "public"."program_evaluations" to "authenticated";

grant trigger on table "public"."program_evaluations" to "authenticated";

grant truncate on table "public"."program_evaluations" to "authenticated";

grant update on table "public"."program_evaluations" to "authenticated";

grant delete on table "public"."program_evaluations" to "service_role";

grant insert on table "public"."program_evaluations" to "service_role";

grant references on table "public"."program_evaluations" to "service_role";

grant select on table "public"."program_evaluations" to "service_role";

grant trigger on table "public"."program_evaluations" to "service_role";

grant truncate on table "public"."program_evaluations" to "service_role";

grant update on table "public"."program_evaluations" to "service_role";

grant delete on table "public"."session_actions" to "anon";

grant insert on table "public"."session_actions" to "anon";

grant references on table "public"."session_actions" to "anon";

grant select on table "public"."session_actions" to "anon";

grant trigger on table "public"."session_actions" to "anon";

grant truncate on table "public"."session_actions" to "anon";

grant update on table "public"."session_actions" to "anon";

grant delete on table "public"."session_actions" to "authenticated";

grant insert on table "public"."session_actions" to "authenticated";

grant references on table "public"."session_actions" to "authenticated";

grant select on table "public"."session_actions" to "authenticated";

grant trigger on table "public"."session_actions" to "authenticated";

grant truncate on table "public"."session_actions" to "authenticated";

grant update on table "public"."session_actions" to "authenticated";

grant delete on table "public"."session_actions" to "service_role";

grant insert on table "public"."session_actions" to "service_role";

grant references on table "public"."session_actions" to "service_role";

grant select on table "public"."session_actions" to "service_role";

grant trigger on table "public"."session_actions" to "service_role";

grant truncate on table "public"."session_actions" to "service_role";

grant update on table "public"."session_actions" to "service_role";


  create policy "reflections_delete_owner"
  on "public"."client_reflections"
  as permissive
  for delete
  to authenticated
using ((created_by = auth.uid()));



  create policy "reflections_insert_program_client"
  on "public"."client_reflections"
  as permissive
  for insert
  to authenticated
with check (((created_by = auth.uid()) AND public.is_program_client(program_id)));



  create policy "reflections_read_private_owner_or_shared_coach"
  on "public"."client_reflections"
  as permissive
  for select
  to authenticated
using (((created_by = auth.uid()) OR ((visibility = 'shared_with_coach'::text) AND public.is_program_coach(program_id))));



  create policy "reflections_update_owner"
  on "public"."client_reflections"
  as permissive
  for update
  to authenticated
using ((created_by = auth.uid()))
with check ((created_by = auth.uid()));



  create policy "Admin can do everything on clients"
  on "public"."clients"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Client can read own data"
  on "public"."clients"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Client can update own data"
  on "public"."clients"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Coach can read own clients"
  on "public"."clients"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.coaches
  WHERE ((coaches.user_id = auth.uid()) AND (clients.coach_ids @> ARRAY[coaches.id])))));



  create policy "clients_read_own"
  on "public"."clients"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "Admin can do everything on coaches"
  on "public"."coaches"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))));



  create policy "Coach can read own data"
  on "public"."coaches"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "programs_delete_assigned_coach"
  on "public"."coaching_programs"
  as permissive
  for delete
  to authenticated
using (public.is_coach_for_client(client_id));



  create policy "programs_insert_assigned_coach"
  on "public"."coaching_programs"
  as permissive
  for insert
  to authenticated
with check (public.is_coach_for_client(client_id));



  create policy "programs_read_client_or_coach"
  on "public"."coaching_programs"
  as permissive
  for select
  to authenticated
using ((public.is_client_user(client_id) OR public.is_coach_for_client(client_id)));



  create policy "programs_update_assigned_coach"
  on "public"."coaching_programs"
  as permissive
  for update
  to authenticated
using (public.is_coach_for_client(client_id))
with check (public.is_coach_for_client(client_id));



  create policy "programs_write_admin_coach_client"
  on "public"."coaching_programs"
  as permissive
  for all
  to authenticated
using (((public.current_profile_role() = 'admin'::text) OR public.is_coach_for_client(client_id) OR public.is_client_user(client_id)))
with check (((public.current_profile_role() = 'admin'::text) OR public.is_coach_for_client(client_id) OR public.is_client_user(client_id)));



  create policy "sessions_read_program_access"
  on "public"."coaching_sessions"
  as permissive
  for select
  to authenticated
using (public.can_access_program(program_id));



  create policy "sessions_write_admin_coach_client"
  on "public"."coaching_sessions"
  as permissive
  for all
  to authenticated
using (public.can_write_program(program_id))
with check (public.can_write_program(program_id));



  create policy "sessions_write_program_coach"
  on "public"."coaching_sessions"
  as permissive
  for all
  to authenticated
using (public.is_program_coach(program_id))
with check (public.is_program_coach(program_id));



  create policy "areas_read_program_access"
  on "public"."development_areas"
  as permissive
  for select
  to authenticated
using (public.can_access_program(program_id));



  create policy "areas_write_admin_coach_client"
  on "public"."development_areas"
  as permissive
  for all
  to authenticated
using (public.can_write_program(program_id))
with check (public.can_write_program(program_id));



  create policy "areas_write_program_coach"
  on "public"."development_areas"
  as permissive
  for all
  to authenticated
using (public.is_program_coach(program_id))
with check (public.is_program_coach(program_id));



  create policy "Users can read own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "profiles_read_own"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((id = auth.uid()));



  create policy "evaluations_delete_program_coach"
  on "public"."program_evaluations"
  as permissive
  for delete
  to authenticated
using (public.is_program_coach(program_id));



  create policy "evaluations_insert_program_access"
  on "public"."program_evaluations"
  as permissive
  for insert
  to authenticated
with check (public.can_access_program(program_id));



  create policy "evaluations_read_program_access"
  on "public"."program_evaluations"
  as permissive
  for select
  to authenticated
using (public.can_access_program(program_id));



  create policy "evaluations_update_program_access"
  on "public"."program_evaluations"
  as permissive
  for update
  to authenticated
using (public.can_access_program(program_id))
with check (public.can_access_program(program_id));



  create policy "evaluations_write_admin_coach_client"
  on "public"."program_evaluations"
  as permissive
  for all
  to authenticated
using (public.can_write_program(program_id))
with check (public.can_write_program(program_id));



  create policy "actions_delete_program_coach"
  on "public"."session_actions"
  as permissive
  for delete
  to authenticated
using (public.is_program_coach(program_id));



  create policy "actions_insert_program_coach"
  on "public"."session_actions"
  as permissive
  for insert
  to authenticated
with check (public.is_program_coach(program_id));



  create policy "actions_read_program_access"
  on "public"."session_actions"
  as permissive
  for select
  to authenticated
using (public.can_access_program(program_id));



  create policy "actions_update_program_access"
  on "public"."session_actions"
  as permissive
  for update
  to authenticated
using (public.can_access_program(program_id))
with check (public.can_access_program(program_id));



  create policy "actions_write_admin_coach_client"
  on "public"."session_actions"
  as permissive
  for all
  to authenticated
using (public.can_write_program(program_id))
with check (public.can_write_program(program_id));


CREATE TRIGGER set_updated_at_client_reflections BEFORE UPDATE ON public.client_reflections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_coaching_programs BEFORE UPDATE ON public.coaching_programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_coaching_sessions BEFORE UPDATE ON public.coaching_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_development_areas BEFORE UPDATE ON public.development_areas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_program_evaluations BEFORE UPDATE ON public.program_evaluations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_session_actions BEFORE UPDATE ON public.session_actions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


