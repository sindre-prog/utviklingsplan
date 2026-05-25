# Ressursbibliotek Batch 1 Preflight

Dette dokumentet er teknisk preflight før første implementeringsbatch for ressursbiblioteket.

Ingen appkode er endret i denne preflighten.

## Repo-Funn

Appen er en statisk frontend:

- `index.html`
- `app.js`
- `styles.css`

Det finnes ikke Next.js, server routes eller `src/features/...` i dagens repo.

Supabase brukes direkte fra `app.js` via browser client:

- `state.sb.from(...)`
- `state.sb.auth...`

Migrations ligger i:

- `supabase/migrations/`

Aktuelle migrationsmønstre:

- SQL-filer med timestamp-prefix.
- RLS aktiveres på tabeller.
- Policies bruker helper-funksjoner i `public`.
- Constraint-modell bruker `check (...)` fremfor Postgres enum-typer.
- Senere migrations er additive og bruker `if not exists` der det passer.

## Eksisterende Rollemodell

Roller ligger i `profiles.role`:

- `admin`
- `coach`
- `client`

Eksisterende helper-funksjoner:

- `public.current_profile_role()`
- `public.current_coach_id()`
- `public.is_client_user(client_uuid uuid)`
- `public.is_coach_for_client(client_uuid uuid)`
- `public.is_program_client(program_uuid uuid)`
- `public.is_program_coach(program_uuid uuid)`
- `public.can_access_program(program_uuid uuid)`
- `public.can_write_program(program_uuid uuid)`

Klient-til-coach kobling ligger i:

- `clients.coach_ids uuid[]`

Programtilgang går via:

- `coaching_programs.client_id`

## Viktig Korreksjon Fra Kontrakten

Kontrakten sier at Supabase-tilgang skal gå gjennom tydelige server-funksjoner.

I dagens repo finnes ikke serverlag. For Batch 1 betyr dette:

- Ikke spre ressurs-spørringer tilfeldig i render-kode.
- Lag tydelige datafunksjoner i en samlet ressursseksjon når appkode senere endres.
- Ikke innfør kunstig serverstruktur før repoet faktisk har det.

Hvis appen senere får serverlag, kan funksjonene flyttes dit uten at datamodellen endres.

## Arkitekturbeslutning: Ressurser Som Første Modul

Ressursbiblioteket skal etableres som første avgrensede frontendmodul.

Ny ressurslogikk skal ikke bygges direkte inn i `app.js`, bortsett fra små orkestreringskall hvis nødvendig.

Dette er en kontrollert modernisering, ikke en full rewrite.

### Repo-Tilpasset Struktur

Bruk statisk JavaScript-struktur som passer dagens repo:

```text
js/
  resources/
    resources.constants.js
    resources.api.js
    resources.queries.js
    resources.mutations.js
    resources.renderer.js
    resources.components.js
    resources.seed.js
```

Ikke flytt auth, app state eller annen eksisterende kjernelogikk nå med mindre det er helt nødvendig.

Hvis behovet oppstår senere, kan en separat `js/core/` vurderes:

```text
js/
  core/
    supabaseClient.js
    appState.js
```

Dette skal ikke være en del av ressursbibliotekets første batch.

### Hard Regel

`app.js` kan brukes til:

- init
- routing
- små orkestreringskall

`app.js` skal ikke inneholde:

- ressurs-spørringer
- ressurs-mutations
- `content_json` renderer
- resource cards
- `SendResourceDrawer`
- klientens resource view

### Importavklaring Før Kode

Før Batch 1A implementeres, må importmønsteret avklares i dagens statiske app.

Hvis ES modules brukes:

- `index.html` må eventuelt laste `app.js` med `type="module"`
- eller det må etableres en trygg bro mellom dagens globale app og ressursmodulene

Ikke opprett moduler som ikke faktisk kan importeres rent.

Batch 1A skal ikke lage mappepynt. Modulene skal være minimale, men reelle:

- `resources.constants.js` med faktiske type/status/phase/context-konstanter
- `resources.renderer.js` med eksporterte renderer-stubber
- `resources.queries.js` med eksporterte query-funksjoner
- `resources.mutations.js` med eksporterte mutation-funksjoner
- `resources.api.js` som samler modulens offentlige API

## Batch 1 Mål

Batch 1 skal etablere teknisk grunnmur uten funksjonell UI.

### Batch 1A: Modulstruktur

- opprett `js/resources/`
- legg inn constants
- legg inn renderer-stubber
- legg inn query/mutation-stubber
- dokumenter importmønster
- minimal endring i `index.html` hvis nødvendig
- ingen funksjonell UI

### Batch 1B: Databasegrunnmur

- migrations
- constraints/checks
- RLS
- storage bucket
- seed-struktur

### Batch 1C: Pilotressurser

- seed 3 pilotressurser
- ingen klient-/coach-UI

Deretter:

- Batch 2: resource renderer og read-only preview
- Batch 3: coachbibliotek og `Send ressurs`-flyt
- Batch 4: klientvisning, privat refleksjon og eksplisitt deling med coach

## Foreslåtte Tabeller

### `resources`

Foreslåtte felt:

- `id uuid primary key default gen_random_uuid()`
- `title text not null`
- `slug text not null unique`
- `summary text not null default ''`
- `type text not null`
- `format text not null`
- `phase text not null`
- `estimated_duration integer`
- `difficulty text`
- `language text not null default 'no'`
- `thumbnail_url text`
- `cover_image_url text`
- `illustration_url text`
- `content_json jsonb not null default '[]'::jsonb`
- `intended_outcome text`
- `best_used_when jsonb not null default '[]'::jsonb`
- `not_for jsonb not null default '[]'::jsonb`
- `coach_guidance text`
- `client_intro text`
- `suggested_coach_note text`
- `default_context_types text[] not null default '{}'::text[]`
- `reflection_prompts jsonb not null default '[]'::jsonb`
- `next_step_prompt text`
- `basis text`
- `visibility text not null default 'internal'`
- `status text not null default 'draft'`
- `review_status text not null default 'draft'`
- `reviewed_by text`
- `last_reviewed_at date`
- `created_by uuid default auth.uid() references auth.users(id) on delete set null`
- `created_at timestamptz not null default now()`
- `updated_by uuid references auth.users(id) on delete set null`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz`

Checks:

- `type in ('template','exercise','reflection','framework','worksheet','article','audio','video','guided_session','assessment')`
- `format in ('native','pdf','audio','video','external_link','downloadable_asset')`
- `phase in ('direction','focus','experiment','observation','session','reflection','adjustment')`
- `difficulty in ('easy','medium','hard')`
- `visibility in ('internal','coach','client_assignable')`
- `status in ('draft','published','archived')`
- `review_status in ('draft','approved_for_pilot','reviewed','needs_revision')`

Indexes:

- `resources_slug_key`
- `resources_status_idx`
- `resources_visibility_idx`
- `resources_phase_idx`
- `resources_type_idx`

### `resource_tags`

Foreslåtte felt:

- `resource_id uuid not null references public.resources(id) on delete cascade`
- `tag text not null`

Primary key:

- `(resource_id, tag)`

Index:

- `resource_tags_tag_idx`

### `resource_files`

Foreslåtte felt:

- `id uuid primary key default gen_random_uuid()`
- `resource_id uuid not null references public.resources(id) on delete cascade`
- `file_type text not null`
- `storage_path text not null`
- `display_name text not null`
- `sort_order integer not null default 0`
- `created_by uuid default auth.uid() references auth.users(id) on delete set null`
- `created_at timestamptz not null default now()`

Checks:

- `file_type in ('pdf','audio','video','image','illustration','attachment','external_link')`

Index:

- `resource_files_resource_id_idx`

### `shared_resources`

Foreslåtte felt:

- `id uuid primary key default gen_random_uuid()`
- `resource_id uuid not null references public.resources(id) on delete restrict`
- `client_id uuid not null references public.clients(id) on delete cascade`
- `program_id uuid references public.coaching_programs(id) on delete cascade`
- `shared_by uuid default auth.uid() references auth.users(id) on delete set null`
- `shared_at timestamptz not null default now()`
- `context_type text`
- `context_id uuid`
- `coach_note text`
- `due_at date`
- `status text not null default 'assigned'`
- `viewed_at timestamptz`
- `responded_at timestamptz`
- `archived_at timestamptz`
- `client_note text`
- `client_visibility text not null default 'private'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Checks:

- `context_type is null or context_type in ('program','focus_area','session','experiment','reflection')`
- `status in ('assigned','viewed','responded','archived')`
- `client_visibility in ('private','shared_with_coach')`

Indexes:

- `shared_resources_client_id_idx`
- `shared_resources_program_id_idx`
- `shared_resources_resource_id_idx`
- `shared_resources_context_idx` on `(context_type, context_id)`
- `shared_resources_status_idx`

## RLS Plan

### `resources`

Read:

- Admin can read all.
- Coach can read `published` resources where `visibility in ('coach','client_assignable')`.
- Client can read only resources assigned through `shared_resources`.

Write:

- Admin can insert/update/archive.
- Coach/client cannot write `resources` in V1.

### `resource_tags`

Read:

- Admin can read all.
- Coach can read tags for resources coach can read.
- Client can read tags for assigned resources only.

Write:

- Admin only.

### `resource_files`

Read:

- Admin can read all.
- Coach can read files for resources coach can read.
- Client can read files for assigned resources only.

Write:

- Admin only in V1.

### `shared_resources`

Read:

- Admin can read all.
- Coach can read rows for clients where `public.is_coach_for_client(client_id)`.
- Client can read own rows where `public.is_client_user(client_id)`.

Insert:

- Admin can insert.
- Coach can insert only for clients where `public.is_coach_for_client(client_id)`.
- Client cannot insert.

Update:

- Admin can update.
- Coach can update rows for assigned clients, but should not edit `client_note` as a product rule.
- Client can update own row status/view fields and own `client_note` / `client_visibility`.

Delete:

- No normal delete policy in V1. Use `archived`.

Important:

Column-level update restrictions are awkward in plain RLS. If strict separation of coach/client mutable fields becomes necessary, use RPC functions later. For Batch 1, keep UI writes scoped and RLS ownership strict.

## Storage Plan

Create private bucket:

- `resource-assets`

Do not use public URLs for private files.

Store paths like:

- `resources/abcde-modellen/abcde-printable.pdf`
- `resources/kontrollsirkelen/kontrollsirkelen-printable.pdf`
- `resources/a-akseptere-frykt/fear-reflection-printable.pdf`

Access principle:

- DB stores `storage_path`.
- App generates signed URL only after RLS says user can access the resource.

Open issue:

- Supabase Storage signed URLs from browser require a storage policy that allows the user to read the object. Batch 1 migration should include storage bucket/policy or defer actual file opening until a resource file UI exists.

## Seed Plan

Use `docs/RESOURCE_LIBRARY_PILOT_CONTENT.md` as source of truth for the first three resources.

Batch 1 should include either:

- SQL seed inserts in a migration, or
- a small checked-in seed script.

Recommendation:

- Use SQL seed inside Batch 1 migration for these three pilot resources.
- Use `on conflict (slug) do update` so seed can be rerun safely.
- Insert tags into `resource_tags`.
- Insert file metadata into `resource_files`.

Do not upload actual files in Batch 1 unless assets are provided.

## App Integration Plan For Later Batches

Current app loads program data in `loadClientProgram(client)`.

Later resource integration should add data access functions, for example:

- `getResources(filters)`
- `getResourceById(resourceId)`
- `getSharedResourcesForProgram(programId)`
- `shareResourceWithClient(payload)`
- `updateSharedResourceStatus(id, values)`

I dette repoet skal disse funksjonene ligge i `js/resources/`, ikke direkte i `app.js`.

`app.js` kan bare kalle modulens offentlige API for init, routing eller små orkestreringskall.

Do not put resource queries directly inside render functions.

## Batch 1 Acceptance Criteria

- Migration creates `resources`, `resource_tags`, `resource_files`, `shared_resources`.
- RLS is enabled on all new tables.
- Anon access is revoked for all new resource tables.
- Constraints prevent invalid `type`, `format`, `phase`, `visibility`, `status`, `context_type`, and `client_visibility`.
- Private `resource-assets` bucket exists or is created idempotently.
- Three pilot resources are seedable by slug.
- Running the migration twice does not duplicate pilot resources.
- Batch 1A establishes `js/resources/` with importable modules or a documented bridge to the current static app.
- Resource constants, query stubs, mutation stubs, renderer stubs and public API live outside `app.js`.
- `app.js` receives no resource business logic in Batch 1A.
- No app UI is changed in Batch 1.

## Known Risks

- Direct browser Supabase calls mean RLS must be correct before any UI work.
- Strict column-level rules for `shared_resources` may need RPC later.
- Existing app has some direct Supabase calls in render-adjacent logic; resource work should not worsen that pattern.
- Actual asset files are not present yet, so file opening should be treated as metadata-only until assets are uploaded.
