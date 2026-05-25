-- Seed pilot resources for the resource library.
-- Batch 1C adds metadata/native content only. Actual files are not uploaded here.

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
values
    (
      'ABCDE-modellen',
      'abcde-modellen',
      'Et praktisk refleksjonsverktøy for å utforske hvordan tanker påvirker følelser, reaksjoner og handlinger i krevende situasjoner. Ressursen hjelper deg å skille mellom hva som faktisk skjedde, hvordan du tolket situasjonen, og hvordan tolkningen påvirket deg.',
      'framework',
      'native',
      'reflection',
      'client_assignable',
      'published',
      'approved_for_pilot',
      'no',
      20,
      'medium',
      'Hjelpe klienten å identifisere automatiske tankemønstre og utvikle mer fleksible og konstruktive perspektiver i situasjoner som skaper stress, frustrasjon eller usikkerhet.',
      $$[
        "klient grubler mye etter situasjoner",
        "sterk selvkritikk",
        "emosjonelle reaksjoner virker uforholdsmessige",
        "klient blir sittende fast i negative tolkninger",
        "konflikter eller vanskelige samtaler",
        "høyt prestasjonspress"
      ]$$::jsonb,
      $$[
        "akutt emosjonell krise",
        "alvorlig psykisk sykdom",
        "situasjoner der klienten er sterkt aktivert og trenger stabilisering først"
      ]$$::jsonb,
      $$Bruk modellen på én konkret situasjon fra den siste tiden. Unngå abstrakte diskusjoner om personlighet eller "hvem klienten er". Målet er å utforske sammenhengen mellom hendelse, tolkning og konsekvens, ikke å overbevise klienten om "positiv tenkning".$$,
      $$Vi reagerer sjelden bare på det som skjer rundt oss. Vi reagerer også på hvordan vi fortolker det som skjer. Denne modellen hjelper deg å utforske hvordan tanker påvirker følelser, handlinger og stressnivå, og hvordan små justeringer i perspektiv kan gi større handlingsrom.$$,
      $$Jeg ønsker at du bruker denne ressursen på en konkret situasjon du har stått i den siste tiden. Ikke tenk for mye på "riktig svar". Målet er å utforske hva som faktisk skjer mellom situasjon, tanke og reaksjon.$$,
      $$["reflection", "session", "focus_area"]$$::jsonb,
      $$[
        {
          "type": "intro",
          "content": "ABCDE-modellen hjelper deg å utforske hvordan tanker påvirker følelser og handlinger i krevende situasjoner."
        },
        {
          "type": "illustration",
          "key": "abcde_model"
        },
        {
          "type": "text",
          "heading": "Steg 1: Beskriv situasjonen",
          "content": "Beskriv en konkret situasjon fra den siste tiden som skapte stress, frustrasjon eller usikkerhet."
        },
        {
          "type": "worksheet",
          "fields": [
            "Hva skjedde?",
            "Hvem var involvert?",
            "Hva gjorde situasjonen krevende?"
          ]
        },
        {
          "type": "text",
          "heading": "Steg 2: Utforsk tankene dine",
          "content": "Hva tenkte du umiddelbart i situasjonen?"
        },
        {
          "type": "worksheet",
          "fields": [
            "Hva sa du til deg selv?",
            "Hva antok du?",
            "Hva fryktet du?"
          ]
        },
        {
          "type": "text",
          "heading": "Steg 3: Reaksjon og konsekvens",
          "content": "Hvordan påvirket tankene følelsene og handlingene dine?"
        },
        {
          "type": "worksheet",
          "fields": [
            "Hva følte du?",
            "Hva gjorde du?",
            "Hva unngikk du?"
          ]
        },
        {
          "type": "reflection_questions",
          "questions": [
            "Hva legger du merke til når du skiller mellom situasjon og tolkning?",
            "Hva kunne vært en alternativ og mer balansert forståelse av situasjonen?",
            "Hva ville vært en mer konstruktiv respons neste gang?"
          ]
        }
      ]$$::jsonb,
      $$[
        "Hva overrasket deg mest i øvelsen?",
        "Hvilke tanker påvirket reaksjonen din sterkest?",
        "Hva skjer når du utfordrer den første tolkningen din?",
        "Hva ville du sagt til en kollega i samme situasjon?"
      ]$$::jsonb,
      'Velg én situasjon den neste uken hvor du aktivt skal forsøke å oppdage forskjellen mellom hendelse og tolkning i øyeblikket.',
      'Kognitiv atferdsterapi (CBT) og forskning på kognitiv restrukturering og emosjonell regulering.',
      'Sindre Ræder',
      '2026-05-25'::date,
      null
    ),
    (
      'Kontrollsirkelen',
      'kontrollsirkelen',
      'Et refleksjonsverktøy for å skille mellom det du kan kontrollere, påvirke og ikke kontrollere. Hjelper deg å bruke energi og oppmerksomhet mer presist i situasjoner preget av press, usikkerhet eller frustrasjon.',
      'framework',
      'native',
      'focus',
      'client_assignable',
      'published',
      'approved_for_pilot',
      'no',
      15,
      'easy',
      'Hjelpe klienten å redusere unødvendig mentalt stress ved å tydeliggjøre hvor innsats faktisk har effekt.',
      $$[
        "klient føler lav kontroll",
        "stress og overbelastning",
        "organisatorisk usikkerhet",
        "frustrasjon rundt andre mennesker",
        "høyt mentalt energitap",
        "overfokus på forhold utenfor egen påvirkning"
      ]$$::jsonb,
      $$[
        "situasjoner som krever akutt problemløsning",
        "klienter som allerede bruker unngåelse eller passivitet som strategi"
      ]$$::jsonb,
      'Vær oppmerksom på om klienten bruker modellen til å trekke seg unna ansvar eller vanskelige samtaler. Målet er ikke passivitet, men å flytte energi mot områder med faktisk påvirkningsmulighet.',
      'Mange bruker store mengder mental energi på forhold de verken kan kontrollere eller påvirke. Denne modellen hjelper deg å tydeliggjøre hvor innsatsen din faktisk kan gjøre en forskjell.',
      $$Jeg vil at du bruker denne ressursen på noe som tar mye energi akkurat nå. Målet er ikke å "slutte å bry seg", men å bli tydeligere på hvor du faktisk har påvirkningskraft.$$,
      $$["focus_area", "reflection", "experiment"]$$::jsonb,
      $$[
        {
          "type": "intro",
          "content": "Kontrollsirkelen hjelper deg å skille mellom det du kan kontrollere, påvirke og ikke kontrollere."
        },
        {
          "type": "illustration",
          "key": "control_circle"
        },
        {
          "type": "text",
          "heading": "Steg 1: Identifiser energityver",
          "content": "Skriv ned tre ting som tar mye mental energi akkurat nå."
        },
        {
          "type": "worksheet",
          "fields": [
            "Situasjon 1",
            "Situasjon 2",
            "Situasjon 3"
          ]
        },
        {
          "type": "text",
          "heading": "Steg 2: Sorter situasjonene",
          "content": "Marker hva du faktisk kan kontrollere, påvirke eller ikke kontrollere."
        },
        {
          "type": "worksheet",
          "fields": [
            "Hva kan jeg kontrollere?",
            "Hva kan jeg påvirke?",
            "Hva må jeg akseptere?"
          ]
        },
        {
          "type": "reflection_questions",
          "questions": [
            "Hvor bruker du mest energi i dag?",
            "Hva overrasker deg når du sorterer dette?",
            "Hva kan du gjøre konkret denne uken innenfor din påvirkningssirkel?"
          ]
        }
      ]$$::jsonb,
      $$[
        "Hva bruker du mest mental energi på akkurat nå?",
        "Hva ligger faktisk innenfor din kontroll?",
        "Hvor forsøker du å kontrollere ting som egentlig ikke kan kontrolleres?",
        "Hva skjer hvis du flytter fokus mot påvirkning fremfor bekymring?"
      ]$$::jsonb,
      'Velg én konkret situasjon denne uken hvor du aktivt skal flytte oppmerksomhet fra bekymring til handling innenfor din påvirkningssirkel.',
      'Stoisk filosofi, moderne stressforskning og forskning på psykologisk fleksibilitet og locus of control.',
      'Sindre Ræder',
      '2026-05-25'::date,
      null
    ),
    (
      'Å akseptere frykt',
      'a-akseptere-frykt',
      'En refleksjonsressurs om hvordan frykt påvirker handling, beslutninger og unngåelse. Hjelper deg å forstå at ubehag ofte er en naturlig del av utvikling og endring, ikke nødvendigvis et signal om fare.',
      'guided_session',
      'native',
      'experiment',
      'client_assignable',
      'published',
      'approved_for_pilot',
      'no',
      25,
      'medium',
      'Hjelpe klienten å identifisere hvordan frykt påvirker atferd og valg, og utvikle større toleranse for usikkerhet og ubehag i viktige situasjoner.',
      $$[
        "klient unngår vanskelige beslutninger",
        "frykt for feil eller evaluering",
        "konfliktunngåelse",
        "organisatoriske endringer",
        "utviklingsmotstand",
        "høyt behov for kontroll"
      ]$$::jsonb,
      $$[
        "alvorlig angstproblematikk uten terapeutisk oppfølging",
        "situasjoner med reell fare eller utrygghet",
        "klienter som er sterkt emosjonelt overveldet"
      ]$$::jsonb,
      'Normaliser frykt uten å bagatellisere den. Hold fokus på observerbar atferd og valg, ikke bare emosjonell innsikt. Utforsk særlig hva klienten gjør eller unngår når frykten aktiveres.',
      'Frykt er ofte en naturlig del av utvikling, ansvar og endring. Mange forsøker å bli kvitt frykten før de handler. I praksis handler utvikling ofte om å lære å bevege seg fremover selv om ubehaget er til stede.',
      $$Jeg ønsker at du bruker denne ressursen på en situasjon der du kjenner motstand, usikkerhet eller frykt akkurat nå. Målet er ikke å bli "fryktfri", men å forstå hvordan frykten påvirker handlingene dine.$$,
      $$["experiment", "focus_area", "reflection"]$$::jsonb,
      $$[
        {
          "type": "intro",
          "content": "Frykt er ofte et signal om at noe oppleves viktig, usikkert eller eksponerende. Denne ressursen hjelper deg å utforske hvordan frykt påvirker valgene dine."
        },
        {
          "type": "illustration",
          "key": "fear_curve"
        },
        {
          "type": "text",
          "heading": "Steg 1: Identifiser situasjonen",
          "content": "Beskriv en situasjon du har utsatt, unngått eller kjent sterk motstand mot."
        },
        {
          "type": "worksheet",
          "fields": [
            "Hva er situasjonen?",
            "Hva gjør den krevende?",
            "Hva frykter du kan skje?"
          ]
        },
        {
          "type": "text",
          "heading": "Steg 2: Utforsk unngåelse",
          "content": "Hvordan påvirker frykten handlingene dine?"
        },
        {
          "type": "worksheet",
          "fields": [
            "Hva gjør du for å redusere ubehaget?",
            "Hva unngår du?",
            "Hva koster unngåelsen deg over tid?"
          ]
        },
        {
          "type": "reflection_questions",
          "questions": [
            "Hva ville vært et lite, men modig neste steg?",
            "Hva skjer hvis du ikke lar frykten bestemme hele responsen?",
            "Hvordan kan du handle selv om ubehaget fortsatt er til stede?"
          ]
        }
      ]$$::jsonb,
      $$[
        "Hva forsøker du å beskytte deg mot?",
        "Hva koster unngåelsen deg?",
        "Hva ville du gjort hvis frykten fikk være med, men ikke styre?",
        "Hva er ett lite steg du kan ta denne uken?"
      ]$$::jsonb,
      'Definer ett konkret steg du er villig til å ta denne uken, selv om situasjonen fortsatt oppleves ubehagelig eller usikker.',
      'Acceptance and Commitment Therapy (ACT), eksponeringsteori og forskning på psykologisk fleksibilitet og unngåelsesatferd.',
      'Sindre Ræder',
      '2026-05-25'::date,
      null
    )
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
    reviewed_by = excluded.reviewed_by,
    last_reviewed_at = excluded.last_reviewed_at,
    archived_at = null,
    updated_at = now()
;

delete from public.resource_tags rt
using public.resources r
where rt.resource_id = r.id
  and r.slug in ('abcde-modellen', 'kontrollsirkelen', 'a-akseptere-frykt');

insert into public.resource_tags (resource_id, tag)
select r.id, tag_value.tag
from public.resources r
join (
  values
    ('abcde-modellen', 'tankefeller'),
    ('abcde-modellen', 'emosjonell regulering'),
    ('abcde-modellen', 'robusthet'),
    ('abcde-modellen', 'stress'),
    ('abcde-modellen', 'selvledelse'),
    ('abcde-modellen', 'refleksjon'),
    ('kontrollsirkelen', 'kontroll'),
    ('kontrollsirkelen', 'stress'),
    ('kontrollsirkelen', 'prioritering'),
    ('kontrollsirkelen', 'robusthet'),
    ('kontrollsirkelen', 'beslutninger'),
    ('kontrollsirkelen', 'aksept'),
    ('a-akseptere-frykt', 'frykt'),
    ('a-akseptere-frykt', 'usikkerhet'),
    ('a-akseptere-frykt', 'mot'),
    ('a-akseptere-frykt', 'endring'),
    ('a-akseptere-frykt', 'ledelse'),
    ('a-akseptere-frykt', 'utvikling')
) as tag_value(slug, tag) on tag_value.slug = r.slug
on conflict (resource_id, tag) do nothing;

delete from public.resource_files rf
using public.resources r
where rf.resource_id = r.id
  and r.slug in ('abcde-modellen', 'kontrollsirkelen', 'a-akseptere-frykt');

insert into public.resource_files (resource_id, file_type, storage_path, display_name, sort_order)
select r.id, file_value.file_type, file_value.storage_path, file_value.display_name, file_value.sort_order
from public.resources r
join (
  values
    ('abcde-modellen', 'cover_image', 'resources/abcde-modellen/abcde-cover.jpg', 'ABCDE-modellen coverbilde', 0),
    ('abcde-modellen', 'illustration', 'resources/abcde-modellen/abcde-model-diagram.svg', 'ABCDE-modellen diagram', 1),
    ('abcde-modellen', 'printable', 'resources/abcde-modellen/abcde-printable.pdf', 'ABCDE-modellen som utskriftsvennlig PDF', 2),
    ('kontrollsirkelen', 'cover_image', 'resources/kontrollsirkelen/control-circle-cover.jpg', 'Kontrollsirkelen coverbilde', 0),
    ('kontrollsirkelen', 'illustration', 'resources/kontrollsirkelen/control-circle-diagram.svg', 'Kontrollsirkelen diagram', 1),
    ('kontrollsirkelen', 'printable', 'resources/kontrollsirkelen/kontrollsirkelen-printable.pdf', 'Kontrollsirkelen som utskriftsvennlig PDF', 2),
    ('a-akseptere-frykt', 'cover_image', 'resources/a-akseptere-frykt/fear-acceptance-cover.jpg', 'Å akseptere frykt coverbilde', 0),
    ('a-akseptere-frykt', 'illustration', 'resources/a-akseptere-frykt/fear-curve-diagram.svg', 'Å akseptere frykt diagram', 1),
    ('a-akseptere-frykt', 'printable', 'resources/a-akseptere-frykt/fear-reflection-printable.pdf', 'Å akseptere frykt som utskriftsvennlig PDF', 2)
) as file_value(slug, file_type, storage_path, display_name, sort_order) on file_value.slug = r.slug
on conflict (resource_id, storage_path) do update
set
  file_type = excluded.file_type,
  display_name = excluded.display_name,
  sort_order = excluded.sort_order,
  archived_at = null,
  updated_at = now();
