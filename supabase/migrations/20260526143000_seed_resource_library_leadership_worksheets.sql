-- Seed leadership worksheet resources from the next brutto list.
-- Inserted as drafts so each resource can be reviewed before publishing.

with seed_resources as (
  select *
  from jsonb_to_recordset($$[
    {
      "title": "Feedback-forberedelse",
      "slug": "feedback-forberedelse",
      "summary": "Et arbeidsark som hjelper klienten å forberede krevende eller viktige tilbakemeldinger på en tydelig, konkret og relasjonelt trygg måte.",
      "type": "worksheet",
      "phase": "session",
      "estimated_duration": 25,
      "difficulty": "medium",
      "intended_outcome": "Redusere unngåelse og øke kvaliteten i tilbakemeldinger og vanskelige samtaler.",
      "best_used_when": ["klienten utsetter en samtale", "feedback blir for vag eller emosjonell", "relasjoner begynner å skurre", "behov for tydeligere ledelse"],
      "not_for": ["konflikten er eskalert og utrygg", "HR- eller personalsak krever formell prosess"],
      "coach_guidance": "Hjelp klienten å skille mellom observasjon, tolkning og intensjon. Mange går inn i samtaler med for mye frustrasjon og for lite klarhet.",
      "client_intro": "Mange vanskelige samtaler blir vanskeligere fordi vi går inn i dem uten å ha tenkt godt nok gjennom hva vi faktisk ønsker å si, hvorfor det er viktig, og hvordan den andre personen sannsynligvis vil oppleve det.\n\nGod feedback handler ikke om å være hard eller myk. Det handler om å være tydelig, konkret og respektfull samtidig.",
      "suggested_coach_note": "Fyll ut arbeidsarket før en konkret samtale du vet du bør ta.",
      "default_context_types": ["session", "focus_area", "reflection"],
      "content_json": [
        { "type": "intro", "content": "Bruk dette arbeidsarket til å forberede en konkret tilbakemelding før du tar samtalen." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hva er situasjonen?", "Hva har du konkret observert?", "Hvordan påvirker dette teamet, arbeidet eller relasjonen?", "Hva ønsker du skal endres?", "Hva kan den andre personen oppleve eller føle?", "Hvordan vil du åpne samtalen?"] }
      ],
      "reflection_prompts": ["Hva gjør denne samtalen vanskelig?", "Hva risikerer du ved å unngå den?", "Hva er viktigst: å få ut frustrasjon eller å skape utvikling?", "Hvordan kan du være tydelig uten å bli hard?"],
      "next_step_prompt": "Fyll ut arbeidsarket før en konkret samtale du vet du bør ta.",
      "basis": "Feedback, vanskelig dialog og relasjonell ledelse."
    },
    {
      "title": "Konfliktkartlegging",
      "slug": "konfliktkartlegging",
      "summary": "Et verktøy for å forstå konflikter mer presist ved å skille mellom fakta, tolkninger, behov, relasjoner og mønstre.",
      "type": "worksheet",
      "phase": "session",
      "estimated_duration": 30,
      "difficulty": "medium",
      "intended_outcome": "Øke perspektivbevissthet og redusere fastlåste konfliktnarrativer.",
      "best_used_when": ["samarbeidet skurrer", "klienten kjenner irritasjon eller frustrasjon", "kommunikasjon bryter sammen", "konflikter gjentar seg"],
      "not_for": ["situasjonen er akutt eller truende", "det foregår alvorlige personalsaker"],
      "coach_guidance": "Vær oppmerksom på hvor raskt klienten går til moralske forklaringer om den andre personen.",
      "client_intro": "Når konflikter oppstår, fyller vi ofte hullene med egne forklaringer og antakelser. Over tid kan dette gjøre situasjonen mer låst enn den egentlig er.\n\nDenne øvelsen hjelper deg med å analysere konflikten mer strukturert og mindre reaktivt.",
      "suggested_coach_note": "",
      "default_context_types": ["session", "focus_area", "reflection"],
      "content_json": [
        { "type": "intro", "content": "Bruk kartleggingen til å skille tydeligere mellom fakta, tolkninger, egne behov og mulige mønstre i konflikten." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hva har faktisk skjedd?", "Hva tolker du inn i situasjonen?", "Hva tror du den andre personen ønsker eller forsøker å beskytte?", "Hva trenger du selv?", "Hva har du bidratt med i dynamikken?", "Hva kunne vært et lite steg i riktig retning?"] }
      ],
      "reflection_prompts": ["Hva vet du sikkert?", "Hva antar du?", "Hvilket mønster gjentar seg?", "Hva skjer hvis konflikten fortsetter uendret?"],
      "next_step_prompt": "",
      "basis": "Konfliktforståelse, perspektivtaking og relasjonell analyse."
    },
    {
      "title": "Beslutningslogg",
      "slug": "beslutningslogg",
      "summary": "En strukturert logg for å dokumentere viktige beslutninger, antakelser og læringspunkter over tid.",
      "type": "worksheet",
      "phase": "focus",
      "estimated_duration": 20,
      "difficulty": "medium",
      "intended_outcome": "Styrke beslutningskvalitet og redusere etterrasjonalisering.",
      "best_used_when": [],
      "not_for": [],
      "coach_guidance": "",
      "client_intro": "Ledere vurderes ofte på kvaliteten av beslutningene sine. Problemet er at vi sjelden stopper opp og analyserer hvordan beslutningene faktisk ble tatt.\n\nDenne loggen hjelper deg å utvikle bedre beslutningsbevissthet over tid.",
      "suggested_coach_note": "",
      "default_context_types": ["focus_area", "session", "reflection"],
      "content_json": [
        { "type": "intro", "content": "Bruk beslutningsloggen på beslutninger som er viktige nok til at du bør lære av dem senere." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hvilken beslutning står du i?", "Hvilke alternativer vurderer du?", "Hva bygger du beslutningen på?", "Hva er usikkert?", "Hva frykter du mest?", "Hva er sannsynlige konsekvenser?", "Når skal beslutningen evalueres?"] }
      ],
      "reflection_prompts": ["Er du for rask eller for treg?", "Hva påvirker deg emosjonelt akkurat nå?", "Hvilken informasjon mangler du?", "Hva ville en utenforstående observert?"],
      "next_step_prompt": "",
      "basis": "Beslutningspsykologi, læring og refleksjon over antakelser."
    },
    {
      "title": "Energikartlegging",
      "slug": "energikartlegging",
      "summary": "Et refleksjonsverktøy som hjelper klienten å identifisere hva som gir og tapper energi i arbeidshverdagen.",
      "type": "worksheet",
      "phase": "reflection",
      "estimated_duration": 20,
      "difficulty": "easy",
      "intended_outcome": "Øke bevissthet rundt bærekraftig prestasjon og belastning.",
      "best_used_when": [],
      "not_for": [],
      "coach_guidance": "",
      "client_intro": "Stress handler ikke bare om hvor mye du gjør. Det handler også om forholdet mellom det som tapper deg og det som gir deg energi.\n\nMange ledere er flinke til å registrere press, men dårligere til å forstå hva som faktisk bygger kapasitet over tid.",
      "suggested_coach_note": "",
      "default_context_types": ["reflection", "focus_area", "session"],
      "content_json": [
        { "type": "intro", "content": "Bruk kartleggingen til å se mer presist hva som bygger kapasitet, og hva som gradvis tapper deg." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hva gir deg energi?", "Hva tapper deg?", "Hvilke møter gir energi?", "Hvilke situasjoner drenerer deg?", "Når fungerer du best?", "Hva trenger du mer eller mindre av?"] }
      ],
      "reflection_prompts": ["Hva overrasker deg?", "Hvilke mønstre går igjen?", "Hva ignorerer du over tid?", "Hva er små justeringer med stor effekt?"],
      "next_step_prompt": "",
      "basis": "Belastning, kapasitet og bærekraftig prestasjon."
    },
    {
      "title": "Møteanalyse",
      "slug": "moteanalyse",
      "summary": "Et observasjonsverktøy for å analysere dynamikk, kommunikasjon og ledelse i møter.",
      "type": "worksheet",
      "phase": "observation",
      "estimated_duration": 20,
      "difficulty": "easy",
      "intended_outcome": "Øke kvaliteten på møter og synliggjøre faktisk lederatferd.",
      "best_used_when": [],
      "not_for": [],
      "coach_guidance": "",
      "client_intro": "Møter er et av stedene ledelse blir mest synlig i praksis. Likevel reflekterer få systematisk over hva som faktisk skjer i dem.\n\nDenne øvelsen hjelper deg med å observere møtene dine mer presist.",
      "suggested_coach_note": "",
      "default_context_types": ["session", "focus_area", "reflection"],
      "content_json": [
        { "type": "intro", "content": "Bruk analysen rett etter et møte, eller som observasjonsramme før du går inn i et viktig møte." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hvem snakket mest?", "Hvem sa lite?", "Hvor oppsto energi eller motstand?", "Ble beslutninger tydelige?", "Hva gjorde du som leder?", "Hva burde vært gjort annerledes?"] }
      ],
      "reflection_prompts": ["Hvem får mest plass?", "Hva blir ikke sagt?", "Hvordan påvirker du dynamikken?", "Hvilke mønstre gjentar seg?"],
      "next_step_prompt": "",
      "basis": "Møtedynamikk, kommunikasjon og lederatferd."
    },
    {
      "title": "Vanskelige samtaler",
      "slug": "vanskelige-samtaler",
      "summary": "Et rammeverk for å gjennomføre krevende samtaler med tydelighet, ro og respekt.",
      "type": "worksheet",
      "phase": "session",
      "estimated_duration": 25,
      "difficulty": "medium",
      "intended_outcome": "Øke trygghet og kvalitet i krevende dialoger.",
      "best_used_when": [],
      "not_for": [],
      "coach_guidance": "",
      "client_intro": "Mange ledere utsetter vanskelige samtaler fordi de er redde for konflikt, reaksjoner eller dårlig stemning. Problemet er at det sjelden blir enklere av å vente.\n\nGode vanskelige samtaler handler ofte mindre om perfekt formulering og mer om tydelighet, tilstedeværelse og evne til å tåle reaksjoner.",
      "suggested_coach_note": "",
      "default_context_types": ["session", "focus_area", "reflection"],
      "content_json": [
        { "type": "intro", "content": "Bruk arbeidsarket til å klargjøre budskap, intensjon og hvordan du vil møte reaksjoner." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hva må sies?", "Hvorfor er dette viktig?", "Hva ønsker du å oppnå?", "Hva frykter du?", "Hvordan vil du møte reaksjoner?", "Hvordan vil du avslutte samtalen?"] }
      ],
      "reflection_prompts": [],
      "next_step_prompt": "",
      "basis": "Vanskelig dialog, feedback og emosjonell regulering."
    },
    {
      "title": "Delegasjonskart",
      "slug": "delegasjonskart",
      "summary": "Et arbeidsark som hjelper klienten å tydeliggjøre hva som bør eies, delegeres eller følges opp annerledes.",
      "type": "worksheet",
      "phase": "focus",
      "estimated_duration": 25,
      "difficulty": "medium",
      "intended_outcome": "Redusere overkontroll og styrke ansvarliggjøring.",
      "best_used_when": [],
      "not_for": [],
      "coach_guidance": "",
      "client_intro": "Mange ledere blir flaskehalser uten å mene det. De holder for mye selv, går for raskt inn i detaljer eller tar tilbake ansvar når ting blir usikkert.\n\nGod delegering handler ikke om å gi bort arbeid. Det handler om å skape tydelig ansvar og autonomi.",
      "suggested_coach_note": "",
      "default_context_types": ["focus_area", "session", "reflection"],
      "content_json": [
        { "type": "intro", "content": "Bruk kartet til å se hvor du holder for tett, og hvor andre kan få tydeligere eierskap." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hva holder du for tett?", "Hva kunne andre eid?", "Hvorfor er det vanskelig å delegere?", "Hva må tydeliggjøres?", "Hva trenger oppfølging?", "Hva må du slippe kontroll på?"] }
      ],
      "reflection_prompts": [],
      "next_step_prompt": "",
      "basis": "Delegering, ansvarliggjøring og lederrolle."
    },
    {
      "title": "Beslutningsprinsipper",
      "slug": "beslutningsprinsipper",
      "summary": "Et refleksjonsverktøy for å definere hvilke prinsipper som faktisk skal styre beslutninger og prioriteringer.",
      "type": "worksheet",
      "phase": "direction",
      "estimated_duration": 20,
      "difficulty": "medium",
      "intended_outcome": "",
      "best_used_when": [],
      "not_for": [],
      "coach_guidance": "",
      "client_intro": "Under press blir ledelse ofte mer reaktiv. Derfor er det nyttig å tydeliggjøre hvilke prinsipper som skal ligge fast også når tempoet øker.",
      "suggested_coach_note": "",
      "default_context_types": ["program", "focus_area", "reflection"],
      "content_json": [
        { "type": "intro", "content": "Bruk prinsippene som et kompass for beslutninger når tempo, press eller uenighet øker." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hva skal alltid prioriteres?", "Hva skal aldri kompromitteres?", "Hvordan ønsker du å ta beslutninger?", "Hva skal teamet kunne forvente?", "Hvilke prinsipper ønsker du å være kjent for?"] }
      ],
      "reflection_prompts": [],
      "next_step_prompt": "",
      "basis": "Prinsippstyrt ledelse og beslutningskvalitet."
    },
    {
      "title": "Psykologisk trygghet i praksis",
      "slug": "psykologisk-trygghet-i-praksis",
      "summary": "Et observasjonsverktøy for å undersøke hvordan trygghet faktisk kommer til uttrykk i teamets atferd og kommunikasjon.",
      "type": "worksheet",
      "phase": "observation",
      "estimated_duration": 20,
      "difficulty": "medium",
      "intended_outcome": "",
      "best_used_when": [],
      "not_for": [],
      "coach_guidance": "",
      "client_intro": "Psykologisk trygghet handler ikke først og fremst om hyggelig stemning. Det handler om hvor trygt det oppleves å si ifra, stille spørsmål, være uenig og innrømme feil.",
      "suggested_coach_note": "",
      "default_context_types": ["focus_area", "session", "reflection"],
      "content_json": [
        { "type": "intro", "content": "Bruk observasjonen til å se etter faktisk atferd, ikke bare generell stemning i teamet." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hvem tør å være uenig?", "Hvordan reageres det på feil?", "Hvem tar risiko i gruppen?", "Hva skjer når noen utfordrer lederen?", "Hvilke temaer unngås?"] }
      ],
      "reflection_prompts": [],
      "next_step_prompt": "",
      "basis": "Psykologisk trygghet, teamatferd og læringskultur."
    },
    {
      "title": "Verdikonflikter",
      "slug": "verdikonflikter",
      "summary": "Et refleksjonsverktøy for situasjoner hvor ulike verdier, hensyn eller lojaliteter kolliderer.",
      "type": "worksheet",
      "phase": "reflection",
      "estimated_duration": 25,
      "difficulty": "medium",
      "intended_outcome": "",
      "best_used_when": [],
      "not_for": [],
      "coach_guidance": "",
      "client_intro": "Noen av de vanskeligste lederutfordringene handler ikke om riktig eller galt, men om kolliderende hensyn.\n\nDenne øvelsen hjelper deg å analysere dilemmaer mer bevisst.",
      "suggested_coach_note": "",
      "default_context_types": ["reflection", "session", "focus_area"],
      "content_json": [
        { "type": "intro", "content": "Bruk arbeidsarket når en situasjon består av flere legitime hensyn som trekker i ulike retninger." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hva er dilemmaet?", "Hvilke verdier står mot hverandre?", "Hvem påvirkes?", "Hva oppleves riktig?", "Hva er konsekvensene av ulike valg?"] }
      ],
      "reflection_prompts": [],
      "next_step_prompt": "",
      "basis": "Etisk refleksjon, verdier og lederansvar."
    },
    {
      "title": "Triggerkartlegging",
      "slug": "triggerkartlegging",
      "summary": "Et arbeidsark for å identifisere situasjoner, mennesker eller mønstre som trigger sterke reaksjoner.",
      "type": "worksheet",
      "phase": "reflection",
      "estimated_duration": 20,
      "difficulty": "medium",
      "intended_outcome": "",
      "best_used_when": [],
      "not_for": [],
      "coach_guidance": "",
      "client_intro": "Sterke reaksjoner handler ofte om mer enn situasjonen alene. Triggerkartlegging hjelper deg å forstå hva som skjer i deg før reaksjonen tar over styringen.",
      "suggested_coach_note": "",
      "default_context_types": ["reflection", "session", "focus_area"],
      "content_json": [
        { "type": "intro", "content": "Bruk kartleggingen til å forstå mønstre i egne reaksjoner før du velger hva du vil gjøre annerledes." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hva trigger deg?", "Hvordan reagerer du?", "Hva skjer i kroppen?", "Hvilke tanker dukker opp?", "Hva trenger du i slike situasjoner?", "Hva ville hjulpet deg å regulere bedre?"] }
      ],
      "reflection_prompts": [],
      "next_step_prompt": "",
      "basis": "Selvregulering, emosjonelle triggere og lederatferd."
    },
    {
      "title": "Etterkritikk / Debrief",
      "slug": "etterkritikk-debrief",
      "summary": "En strukturert metode for læring etter viktige situasjoner, møter eller prestasjoner.",
      "type": "worksheet",
      "phase": "reflection",
      "estimated_duration": 20,
      "difficulty": "easy",
      "intended_outcome": "Øke læring, tilpasningsevne og prestasjonsutvikling.",
      "best_used_when": [],
      "not_for": [],
      "coach_guidance": "",
      "client_intro": "Mange går videre til neste oppgave uten å stoppe opp og lære systematisk av det som nettopp skjedde.\n\nDebrief brukes i alt fra eliteidrett og beredskap til spesialstyrker og toppledelse fordi små refleksjoner over tid kan gi stor utvikling.",
      "suggested_coach_note": "",
      "default_context_types": ["reflection", "session", "experiment"],
      "content_json": [
        { "type": "intro", "content": "Bruk debriefen rett etter en viktig situasjon, mens observasjonene fortsatt er ferske." },
        { "type": "worksheet", "heading": "Arbeidsark", "fields": ["Hva var målet?", "Hva skjedde faktisk?", "Hva fungerte bra?", "Hva fungerte dårlig?", "Hva overrasket deg?", "Hva tar du med videre?"] }
      ],
      "reflection_prompts": ["Hva ville du gjort annerledes?", "Hvilke mønstre ser du?", "Hva lærte du om deg selv?", "Hva bør repeteres eller justeres neste gang?"],
      "next_step_prompt": "",
      "basis": "Debrief, læring og prestasjonsutvikling."
    }
  ]$$::jsonb) as resource(
    title text,
    slug text,
    summary text,
    type text,
    phase text,
    estimated_duration integer,
    difficulty text,
    intended_outcome text,
    best_used_when jsonb,
    not_for jsonb,
    coach_guidance text,
    client_intro text,
    suggested_coach_note text,
    default_context_types jsonb,
    content_json jsonb,
    reflection_prompts jsonb,
    next_step_prompt text,
    basis text
  )
)
insert into public.resources (
  title,
  slug,
  summary,
  type,
  format,
  phase,
  visibility,
  status,
  review_status,
  language,
  estimated_duration,
  difficulty,
  intended_outcome,
  best_used_when,
  not_for,
  coach_guidance,
  client_intro,
  suggested_coach_note,
  default_context_types,
  content_json,
  reflection_prompts,
  next_step_prompt,
  basis,
  reviewed_by,
  last_reviewed_at,
  archived_at
)
select
  title,
  slug,
  summary,
  type,
  'native',
  phase,
  'client_assignable',
  'draft',
  'draft',
  'no',
  estimated_duration,
  difficulty,
  intended_outcome,
  best_used_when,
  not_for,
  coach_guidance,
  client_intro,
  suggested_coach_note,
  default_context_types,
  content_json,
  reflection_prompts,
  next_step_prompt,
  basis,
  null,
  null,
  null
from seed_resources
on conflict (slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  type = excluded.type,
  format = excluded.format,
  phase = excluded.phase,
  visibility = excluded.visibility,
  status = excluded.status,
  review_status = excluded.review_status,
  language = excluded.language,
  estimated_duration = excluded.estimated_duration,
  difficulty = excluded.difficulty,
  intended_outcome = excluded.intended_outcome,
  best_used_when = excluded.best_used_when,
  not_for = excluded.not_for,
  coach_guidance = excluded.coach_guidance,
  client_intro = excluded.client_intro,
  suggested_coach_note = excluded.suggested_coach_note,
  default_context_types = excluded.default_context_types,
  content_json = excluded.content_json,
  reflection_prompts = excluded.reflection_prompts,
  next_step_prompt = excluded.next_step_prompt,
  basis = excluded.basis,
  reviewed_by = null,
  last_reviewed_at = null,
  archived_at = null,
  updated_at = now();

with seed_slugs as (
  select jsonb_array_elements_text($$[
    "feedback-forberedelse",
    "konfliktkartlegging",
    "beslutningslogg",
    "energikartlegging",
    "moteanalyse",
    "vanskelige-samtaler",
    "delegasjonskart",
    "beslutningsprinsipper",
    "psykologisk-trygghet-i-praksis",
    "verdikonflikter",
    "triggerkartlegging",
    "etterkritikk-debrief"
  ]$$::jsonb) as slug
)
delete from public.resource_tags rt
using public.resources r, seed_slugs s
where rt.resource_id = r.id
  and r.slug = s.slug;

with seed_tags as (
  select *
  from jsonb_to_recordset($$[
    { "slug": "feedback-forberedelse", "tags": ["feedback", "vanskelige samtaler", "kommunikasjon", "ledelse"] },
    { "slug": "konfliktkartlegging", "tags": ["konflikt", "perspektiv", "relasjoner", "kommunikasjon"] },
    { "slug": "beslutningslogg", "tags": ["beslutninger", "læring", "prioritering", "lederutvikling"] },
    { "slug": "energikartlegging", "tags": ["energi", "belastning", "stress", "kapasitet"] },
    { "slug": "moteanalyse", "tags": ["møter", "kommunikasjon", "lederatferd", "observasjon"] },
    { "slug": "vanskelige-samtaler", "tags": ["vanskelige samtaler", "dialog", "feedback", "ledelse"] },
    { "slug": "delegasjonskart", "tags": ["delegering", "ansvar", "kontroll", "ledelse"] },
    { "slug": "beslutningsprinsipper", "tags": ["beslutninger", "prinsipper", "prioritering", "retning"] },
    { "slug": "psykologisk-trygghet-i-praksis", "tags": ["psykologisk trygghet", "team", "kommunikasjon", "observasjon"] },
    { "slug": "verdikonflikter", "tags": ["verdier", "dilemma", "beslutninger", "refleksjon"] },
    { "slug": "triggerkartlegging", "tags": ["triggere", "selvregulering", "følelser", "refleksjon"] },
    { "slug": "etterkritikk-debrief", "tags": ["debrief", "læring", "prestasjon", "refleksjon"] }
  ]$$::jsonb) as tag_group(slug text, tags jsonb)
)
insert into public.resource_tags (resource_id, tag)
select r.id, tag_value.tag
from seed_tags st
join public.resources r on r.slug = st.slug
cross join lateral jsonb_array_elements_text(st.tags) as tag_value(tag)
on conflict (resource_id, tag) do nothing;
