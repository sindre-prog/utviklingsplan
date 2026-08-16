-- Leadership competency foundation.
-- Adds å first-class competency library and selected competency tracks for leadership development plans.

create table if not exists public.leadership_competencies (
  id uuid not null default gen_random_uuid(),
  slug text not null,
  title_no text not null,
  title_en text,
  category text not null,
  summary text not null default ''::text,
  source text not null default 'raeder-originål'::text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  content_json jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint leadership_competencies_pkey primary key (id),
  constraint leadership_competencies_slug_key unique (slug),
  constraint leadership_competencies_slug_not_blank check (length(trim(slug)) > 0),
  constraint leadership_competencies_title_no_not_blank check (length(trim(title_no)) > 0),
  constraint leadership_competencies_category_check check (category = any (array[
    'foundation'::text,
    'people_relationships'::text,
    'execution_direction'::text,
    'change_complexity'::text,
    'identity_culture'::text,
    'derailer'::text
  ])),
  constraint leadership_competencies_content_object_check check (jsonb_typeof(content_json) = 'object')
);

create table if not exists public.program_competencies (
  id uuid not null default gen_random_uuid(),
  program_id uuid not null references public.coaching_programs(id) on delete cascade,
  competency_id uuid not null references public.leadership_competencies(id) on delete restrict,
  status text not null default 'active'::text,
  priority integer not null default 0,
  why_now text,
  desired_behavior text,
  current_pattern text,
  obstacles text,
  progress_signs text,
  feedback_plan text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_at timestamp with time zone not null default now(),
  constraint program_competencies_pkey primary key (id),
  constraint program_competencies_program_competency_key unique (program_id, competency_id),
  constraint program_competencies_status_check check (status = any (array[
    'active'::text,
    'paused'::text,
    'completed'::text,
    'archived'::text
  ])),
  constraint program_competencies_priority_check check (priority >= 0)
);

alter table public.session_actions
  add column if not exists program_competency_id uuid references public.program_competencies(id) on delete set null;

alter table public.client_reflections
  add column if not exists program_competency_id uuid references public.program_competencies(id) on delete set null;

alter table public.shared_resources
  add column if not exists program_competency_id uuid references public.program_competencies(id) on delete set null;

alter table public.shared_resources
  drop constraint if exists shared_resources_context_type_check;

alter table public.shared_resources
  add constraint shared_resources_context_type_check check (context_type = any (array[
    'program'::text,
    'focus_area'::text,
    'competency'::text,
    'session'::text,
    'experiment'::text,
    'reflection'::text
  ]));

alter table public.leadership_competencies enåble row level security;
alter table public.program_competencies enåble row level security;

revoke all on table public.leadership_competencies from anon;
revoke all on table public.program_competencies from anon;

grant select, insert, update, delete on table public.leadership_competencies to authenticated;
grant select, insert, update, delete on table public.program_competencies to authenticated;

create index if not exists leadership_competencies_category_idx
  on public.leadership_competencies using btree (category);

create index if not exists leadership_competencies_active_sort_idx
  on public.leadership_competencies using btree (is_active, sort_order, title_no);

create index if not exists program_competencies_program_id_idx
  on public.program_competencies using btree (program_id);

create index if not exists program_competencies_competency_id_idx
  on public.program_competencies using btree (competency_id);

create index if not exists program_competencies_status_idx
  on public.program_competencies using btree (status);

create index if not exists session_actions_program_competency_id_idx
  on public.session_actions using btree (program_competency_id);

create index if not exists client_reflections_program_competency_id_idx
  on public.client_reflections using btree (program_competency_id);

create index if not exists shared_resources_program_competency_id_idx
  on public.shared_resources using btree (program_competency_id);

drop trigger if exists set_updated_at_leadership_competencies on public.leadership_competencies;
create trigger set_updated_at_leadership_competencies
before update on public.leadership_competencies
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_program_competencies on public.program_competencies;
create trigger set_updated_at_program_competencies
before update on public.program_competencies
for each row execute function public.set_updated_at();

drop policy if exists "leadership_competencies_read_active" on public.leadership_competencies;
create policy "leadership_competencies_read_active"
on public.leadership_competencies
as permissive
for select
to authenticated
using (is_active or public.current_profile_role() = 'admin');

drop policy if exists "leadership_competencies_admin_manåge" on public.leadership_competencies;
create policy "leadership_competencies_admin_manåge"
on public.leadership_competencies
as permissive
for all
to authenticated
using (public.current_profile_role() = 'admin')
with check (public.current_profile_role() = 'admin');

drop policy if exists "program_competencies_read_program_client_or_coach" on public.program_competencies;
create policy "program_competencies_read_program_client_or_coach"
on public.program_competencies
as permissive
for select
to authenticated
using (public.can_access_program(program_id));

drop policy if exists "program_competencies_insert_client_or_coach" on public.program_competencies;
create policy "program_competencies_insert_client_or_coach"
on public.program_competencies
as permissive
for insert
to authenticated
with check (public.can_write_program(program_id));

drop policy if exists "program_competencies_update_client_or_coach" on public.program_competencies;
create policy "program_competencies_update_client_or_coach"
on public.program_competencies
as permissive
for update
to authenticated
using (public.can_write_program(program_id))
with check (public.can_write_program(program_id));

drop policy if exists "program_competencies_delete_client_or_coach" on public.program_competencies;
create policy "program_competencies_delete_client_or_coach"
on public.program_competencies
as permissive
for delete
to authenticated
using (public.can_write_program(program_id));

insert into public.leadership_competencies (
  slug,
  title_no,
  title_en,
  category,
  summary,
  sort_order,
  content_json
)
values
  (
    'kommunikasjon',
    'Kommunikasjon',
    'Communication',
    'foundation',
    'Gjør retning, prioriteringer og forventninger tydelige for ulike målgrupper.',
    10,
    jsonb_build_object(
      'signals', jsonb_build_array('Er tydelig på budskap og hensikt.', 'Tilpasser form og kanal til mottaker.', 'Lytter aktivt for å forstå før det svares.'),
      'obstacles', jsonb_build_array('For mye detalj uten tydelig hovedpoeng.', 'Uklart hvem kommunikasjonen er for.', 'For lite rom for sporsmål og reaksjoner.'),
      'practices', jsonb_build_array('Start viktige samtaler med ett tydelig hovedbudskap.', 'Be mottaker oppsummere hva de tar med seg.', 'Test om skriftlig og muntlig budskap peker samme vei.')
    )
  ),
  (
    'pavirkning',
    'Påvirkning',
    'Influence',
    'foundation',
    'Skaper oppslutning uten å lene seg bare på formell rolle eller autoritet.',
    20,
    jsonb_build_object(
      'signals', jsonb_build_array('Forstår interessene til dem som skal påvirkes.', 'Knytter forslag til felles mål.', 'Bygger allianser tidlig.'),
      'obstacles', jsonb_build_array('Argumenterer for tidlig.', 'Undervurderer motstand eller usikkerhet.', 'Snakker mest til egne behov.'),
      'practices', jsonb_build_array('Kartlegg tre interessenter for et viktig initiativ.', 'Spørsmål før råd før du presenterer løsningen.', 'Avklar hva hver part trenger for å si ja.')
    )
  ),
  (
    'selvinnsikt',
    'Selvinnsikt',
    'Self-Awareness',
    'foundation',
    'Ser egne mønstre, styrker og blindsoner tydelig nok til å lede mer bevisst.',
    30,
    jsonb_build_object(
      'signals', jsonb_build_array('Ber om konkret feedback.', 'Kjenner igjen egne triggere.', 'Justerer atferd når situasjonen krever det.'),
      'obstacles', jsonb_build_array('Forsvarer seg når feedback kommer.', 'Tolker intensjon som effekt.', 'Unngår situasjoner som utfordrer selvbildet.'),
      'practices', jsonb_build_array('Velg en situasjon der du vil observere egen reaksjon.', 'Spør en kollega hva du bør fortsette og justere.', 'Skriv ned hva som faktisk skjedde før du tolker det.')
    )
  ),
  (
    'laeringssmidighet',
    'Læringssmidighet',
    'Learning Agility',
    'foundation',
    'Lærer raskt av erfaring og bruker innsikten i nye og uklare situasjoner.',
    40,
    jsonb_build_object(
      'signals', jsonb_build_array('Tester smått og justerer raskt.', 'Søker nye perspektiver.', 'Overfører læring mellom situasjoner.'),
      'obstacles', jsonb_build_array('Venter på perfekt plan.', 'Holder fast ved gamle løsninger.', 'Reflekterer for lite etter handling.'),
      'practices', jsonb_build_array('Definer ett lite eksperiment i en ny situasjon.', 'Etter en viktig hendelse: hva lærte jeg, og hva prøver jeg neste gang?', 'Be om et perspektiv fra noen utenfor eget fagmiljø.')
    )
  ),
  (
    'feedback',
    'Feedback',
    'Feedback',
    'people_relationships',
    'Gir og ber om tilbakemeldinger som hjelper mennesker å forstå effekt og utvikle praksis.',
    50,
    jsonb_build_object(
      'signals', jsonb_build_array('Gir feedback tett på situasjonen.', 'Skiller observasjon fra tolkning.', 'Gjør neste steg konkret.'),
      'obstacles', jsonb_build_array('Utsetter vanskelige tilbakemeldinger.', 'Blir for generell eller for hard.', 'Ber sjelden om feedback selv.'),
      'practices', jsonb_build_array('Gi en konkret observasjon og ett spørsmål.', 'Avslutt feedback med hva personen kan prøve neste gang.', 'Be om feedback på egen lederatferd etter et møte.')
    )
  ),
  (
    'delegering',
    'Delegering',
    'Delegating',
    'people_relationships',
    'Gir ansvar på en måte som skaper eierskap, læring og bedre kapasitet.',
    60,
    jsonb_build_object(
      'signals', jsonb_build_array('Avklarer mandat og forventet resultat.', 'Følger opp uten å overta.', 'Matcher ansvar med utviklingsmulighet.'),
      'obstacles', jsonb_build_array('Holder fast i oppgaver for lenge.', 'Delegerer aktivitet, men ikke ansvar.', 'Gir uklare rammer.'),
      'practices', jsonb_build_array('Velg en oppgave du vanligvis beholder selv.', 'Avklar hva som er fast og hva personen kan beslutte.', 'Planlegg ett kort innsjekkspunkt.')
    )
  ),
  (
    'beslutningstaking',
    'Beslutningstaking',
    'Decision Making',
    'execution_direction',
    'Tar tydelige beslutninger med riktig tempo, godt nok grunnlag og klar oppfølging.',
    70,
    jsonb_build_object(
      'signals', jsonb_build_array('Skiller mellom beslutning og drøfting.', 'Forklarer rasjonale og konsekvens.', 'Følger opp hvem som gjør hva.'),
      'obstacles', jsonb_build_array('Søker for mye sikkerhet.', 'Lar uklare roller stoppe fremdrift.', 'Kommuniserer beslutningen for sent.'),
      'practices', jsonb_build_array('Definer beslutningskriterier for et aktuelt valg.', 'Si eksplisitt når en beslutning er tatt.', 'Avklar neste steg i samme møte.')
    )
  ),
  (
    'strategisk-retning',
    'Strategisk retning',
    'Strategic Alignment',
    'execution_direction',
    'Kobler arbeid, prioriteringer og mennesker til en tydeligere strategisk retning.',
    80,
    jsonb_build_object(
      'signals', jsonb_build_array('Oversetter strategi til hverdagsvalg.', 'Prioriterer bort arbeid som ikke støtter retningen.', 'Gjør sammenhenger tydelige for teamet.'),
      'obstacles', jsonb_build_array('Blir for operativ i viktige veivalg.', 'Kommuniserer strategi som slagord.', 'Unngår prioriteringskonflikter.'),
      'practices', jsonb_build_array('Knytt en ukentlig prioritering til strategisk mål.', 'Forklar hva teamet ikke skal bruke tid på.', 'Be teamet identifisere uklare prioriteringer.')
    )
  ),
  (
    'endringsledelse',
    'Endringsledelse',
    'Change Implementation',
    'change_complexity',
    'Gjør endring forståelig, praktisk og mulig å handle på for dem som beres av den.',
    90,
    jsonb_build_object(
      'signals', jsonb_build_array('Forklarer hvorfor endringen trengs.', 'Ser både saklige og emosjonelle reaksjoner.', 'Skaper korte læringssløyfer.'),
      'obstacles', jsonb_build_array('Undervurderer tap eller usikkerhet.', 'Kommuniserer for sjelden.', 'Forveksler informasjon med forankring.'),
      'practices', jsonb_build_array('Lag et kort budskap om hvorfor nå.', 'Spør hvilke bekymringer folk har før du svarer.', 'Velg en liten handling som viser endringen i praksis.')
    )
  ),
  (
    'tillit',
    'Tillit',
    'Trust',
    'people_relationships',
    'Bygger trygghet gjennom tydelighet, integritet, oppfølging og reell interesse for andre.',
    100,
    jsonb_build_object(
      'signals', jsonb_build_array('Holder avtaler og forklarer avvik.', 'Er åpen om usikkerhet når det er relevant.', 'Tar ansvar for egen effekt på andre.'),
      'obstacles', jsonb_build_array('Overlover eller blir uklar.', 'Tar lite eierskap når noe går galt.', 'Virker utilgjengelig i viktige perioder.'),
      'practices', jsonb_build_array('Følg opp en liten avtale raskt.', 'Si tydelig hva du vet og ikke vet.', 'Spør hva andre trenger for å ha tillit til prosessen.')
    )
  ),
  (
    'teamledelse',
    'Teamledelse',
    'Team Leadership',
    'people_relationships',
    'Skaper retning, samspill og ansvar i teamet slik at gruppen fungerer bedre enn enkeltpersonene alene.',
    110,
    jsonb_build_object(
      'signals', jsonb_build_array('Gjør mål og roller tydelige.', 'Tar tak i samspill som hemmer fremdrift.', 'Bruker teamets ulike perspektiver aktivt.'),
      'obstacles', jsonb_build_array('Lar uklare forventninger leve for lenge.', 'Løser for mye en-til-en.', 'Unngår friksjon som teamet trenger å jobbe gjennom.'),
      'practices', jsonb_build_array('Start et møte med hva teamet må få til sammen.', 'Avklar en rolle eller beslutningsregel.', 'Inviter eksplisitt inn et stille perspektiv.')
    )
  ),
  (
    'tvetydighet',
    'Tvetydighet',
    'Tolerating Ambiguity',
    'change_complexity',
    'Beholder handlekraft og trygg nok retning selv når informasjonen er ufullstendig.',
    120,
    jsonb_build_object(
      'signals', jsonb_build_array('Skiller mellom det som er kjent, antatt og uklart.', 'Tar neste nyttige steg uten falsk sikkerhet.', 'Hjelper andre å stå i usikkerhet.'),
      'obstacles', jsonb_build_array('Venter for lenge på avklaringer.', 'Gir for sikre svar for tidlig.', 'Lar usikkerhet lekke som stress.'),
      'practices', jsonb_build_array('Skriv ned hva vi vet, tror og må finne ut.', 'Definer ett reversibelt neste steg.', 'Kommuniser usikkerhet uten å miste retning.')
    )
  )
on conflict (slug) do update
set
  title_no = excluded.title_no,
  title_en = excluded.title_en,
  category = excluded.category,
  summary = excluded.summary,
  sort_order = excluded.sort_order,
  content_json = excluded.content_json,
  is_active = true,
  updated_at = now();

comment on table public.leadership_competencies is
  'Original Raeder leadership competency library inspired by competency-based leadership development structure.';

comment on table public.program_competencies is
  'Selected leadership competency tracks for a coaching program.';

comment on column public.session_actions.program_competency_id is
  'Optional link from a practice experiment to a selected leadership competency track.';

comment on column public.client_reflections.program_competency_id is
  'Optional link from a client reflection to a selected leadership competency track.';

comment on column public.shared_resources.program_competency_id is
  'Optional link from a shared resource to a selected leadership competency track.';
