-- Add the richer competency content contract without replacing the established UI copy.
-- Legacy keys remain in content_json so older clients can keep reading the library.

update public.leadership_competencies
set content_json = content_json || jsonb_build_object(
  'schema_version', 2,
  'relevant_when', coalesce(
    content_json -> 'relevant_when',
    to_jsonb(coalesce(content_json ->> 'choose_when', ''))
  ),
  'distinction', coalesce(
    content_json -> 'distinction',
    to_jsonb(''::text)
  ),
  'best_practice', jsonb_build_object(
    'success', coalesce(content_json #> '{best_practice,success}', content_json -> 'signals', '[]'::jsonb),
    'underuse', coalesce(
      content_json #> '{best_practice,underuse}',
      case
        when nullif(trim(content_json ->> 'underuse'), '') is null then '[]'::jsonb
        else jsonb_build_array(content_json ->> 'underuse')
      end
    ),
    'overuse', coalesce(
      content_json #> '{best_practice,overuse}',
      case
        when nullif(trim(content_json ->> 'overuse'), '') is null then '[]'::jsonb
        else jsonb_build_array(content_json ->> 'overuse')
      end
    )
  ),
  'barriers', coalesce(content_json -> 'barriers', '[]'::jsonb),
  'practice', jsonb_build_object(
    'experiment', coalesce(content_json #>> '{practice,experiment}', content_json ->> 'experiment', ''),
    'effect', coalesce(content_json #>> '{practice,effect}', content_json ->> 'evidence', '')
  ),
  'reflection', coalesce(content_json -> 'reflection', '[]'::jsonb)
)
where is_active = true;

-- The revised source document contains materially richer content for Delegation.
-- Keep the portal's concise definition and behavioural copy, and add only useful hypotheses/questions.
update public.leadership_competencies
set content_json = jsonb_set(
  jsonb_set(
    content_json,
    '{barriers}',
    jsonb_build_array(
      'Du er usikker på om andre vil levere med ønsket kvalitet.',
      'Du synes det er vanskelig å gi fra deg kontroll.',
      'Du tenker at det går raskere eller blir bedre hvis du gjør arbeidet selv.',
      'Du undervurderer hva medarbeiderne faktisk kan håndtere.',
      'Du får mestring eller anerkjennelse gjennom arbeid du kunne gitt videre.'
    ),
    true
  ),
  '{reflection}',
  jsonb_build_array(
    'Hvor blir du selv en flaskehals?',
    'Når du følger opp: hjelper du den andre videre, eller tar du i praksis arbeidet tilbake?'
  ),
  true
)
where slug = 'delegering';

-- A small number of metacompetencies benefit from one precise reflection question.
update public.leadership_competencies
set content_json = jsonb_set(
  content_json,
  '{reflection}',
  case slug
    when 'laeringssmidighet' then jsonb_build_array('Hvilken nylig erfaring utfordret en måte å lede på som tidligere har virket godt?')
    when 'selvinnsikt' then jsonb_build_array('Er manglende innsikt i eget mønster selve flaskehalsen, eller en støtte for et mer konkret utviklingsmål?')
    when 'egenutvikling' then jsonb_build_array('Hvilken én atferd er viktigere å øve på nå enn å lære mer om?')
  end,
  true
)
where slug in ('laeringssmidighet', 'selvinnsikt', 'egenutvikling');

-- Editorial category corrections: these are primarily relational, not strategic or intrapersonal.
update public.leadership_competencies
set category = 'relationships_influence'
where slug in (
  'grensekryssende-samarbeid',
  'tydelig-ledertilstedevaerelse',
  'eksterne-partnerskap'
);

update public.leadership_competencies
set category = 'foundation'
where slug = 'troverdighet-og-integritet';

comment on column public.leadership_competencies.content_json is
  'Versioned competency content. Schema v2 adds relevant_when, distinction, best_practice, barriers, practice and reflection while retaining legacy keys.';
