-- Classify the resource catalogue without replacing its existing topic tags.
-- The controlled development-process area is deliberately separate from leadership competency categories.

create temporary table resource_development_area_map_v1 (
  resource_id uuid primary key,
  area_key text not null check (area_key = any (array[
    'development_process'::text,
    'foundation'::text,
    'self_capacity'::text,
    'relationships_influence'::text,
    'team_people'::text,
    'execution_decisions'::text,
    'strategy_business_change'::text,
    'derailer'::text
  ]))
) on commit drop;

insert into resource_development_area_map_v1 (resource_id, area_key)
values
  -- Published resources: development process.
  ('1d4e2ef3-093f-45be-a2b6-c64fa0977edb', 'development_process'), -- Atferdseksperiment
  ('721d5fb0-82d6-4ef4-b98d-5cb4e3573f6d', 'development_process'), -- Etterkritikk / Debrief
  ('aef77022-565e-4dd9-961c-37d4c4d44c99', 'development_process'), -- Forventningskontrakt
  ('4d3694be-8e07-4714-bb61-e0f304c5202f', 'development_process'), -- Observasjonsoppdrag
  ('a87131b9-e70e-4f7b-830c-940ac7e4bd7e', 'development_process'), -- Prioriteringsrammeverk

  -- Published resources: leadership development areas.
  ('07b4b8b4-d4d8-4628-b60b-3bc729b6a60f', 'foundation'), -- AIDA
  ('c15aa362-536c-4147-91a2-b5133b2627fc', 'foundation'), -- Bruk en styrke på en ny måte
  ('6080f5e7-d25a-4401-b910-ba612d196d29', 'foundation'), -- Deg på ditt beste
  ('a7bcbdf4-ee12-4fa2-b910-7c592eebea29', 'foundation'), -- Motivation to lead

  ('742e8f85-f140-4d6d-bf5d-a5f52543bc01', 'self_capacity'), -- 2-minuttersregelen
  ('493d641d-506a-409b-8a26-7d5435da58de', 'self_capacity'), -- A akseptere frykt
  ('aef2057c-3416-4011-a7e0-145dbec315a7', 'self_capacity'), -- ABCDE-modellen
  ('cb6c7e99-964b-49bd-bf0f-3df1555ecc42', 'self_capacity'), -- ABCDE-modellen for prestasjonsforbedring
  ('22ff6c76-dc38-4b7c-8519-19214ac54194', 'self_capacity'), -- Aksepter deg selv
  ('1fb8e2e7-d179-4e18-83f9-f2aeafa5a737', 'self_capacity'), -- Eisenhower-matrisen
  ('44f6b8df-675c-4160-a2bc-b06a37a6adfb', 'self_capacity'), -- Fokusblokkering
  ('c20708df-1c38-460f-8af0-c32fb6a959ec', 'self_capacity'), -- Karrieregrafen
  ('6c5a4520-d9c5-4066-8d21-152d5e29039b', 'self_capacity'), -- Kontrollsirkelen
  ('0edab4f3-85dd-4e70-b2d9-9f99a422c29a', 'self_capacity'), -- Omvend din indre kritiker
  ('86a43744-7ba5-494e-904e-cd09e6de21af', 'self_capacity'), -- Pareto-prinsippet
  ('0c15448e-1cfa-427e-9cfb-25edf51198d3', 'self_capacity'), -- Pusteovelser for stressregulering
  ('92f26684-9984-4634-8816-3680ef752362', 'self_capacity'), -- Situasjonsanalyse
  ('68704fc6-ffab-4e2b-b156-b1753d46ef04', 'self_capacity'), -- Tankefeller
  ('fa90d13a-ad12-403f-b690-ec7accb26abd', 'self_capacity'), -- Tre gode ting

  ('66dacf1f-d841-474a-aca0-c96d81fd5b11', 'relationships_influence'), -- Feedback-forberedelse
  ('955d2a28-1363-4fb7-911a-badbcf88f4a1', 'relationships_influence'), -- Konfliktkartlegging
  ('99a5d0df-9273-4012-a617-e078d6fad6cf', 'relationships_influence'), -- Takknemlighetsbesoket
  ('659bc968-a53e-420f-aab8-b5ad2492c74c', 'relationships_influence'), -- Vanskelige samtaler

  ('b32f892e-bfa7-4c36-b41d-54d4564f3519', 'team_people'), -- Delegeringskart
  ('290b0412-697b-4634-833e-a10c378efa41', 'team_people'), -- Ledermoter
  ('590dab7f-c305-4347-ab42-80f43f6f61d0', 'team_people'), -- Moteanalyse
  ('39889a35-f053-4e7c-8508-77159b68dd61', 'team_people'), -- Sporsmal i coachende ledelse

  ('fc6a9826-88f8-4f8f-93f4-7ea0d0eea646', 'execution_decisions'), -- Beslutningsprinsipper

  ('977b4dac-102a-412b-b6e6-50c915759e84', 'strategy_business_change'), -- Mandatkort
  ('9c2de68f-bb69-42fe-94dc-b8d0b4a5be43', 'strategy_business_change'), -- Mitt lederprosjekt

  -- Draft resources.
  ('aa117d31-11c6-4e5a-adeb-15fedf0e375c', 'development_process'), -- Refleksjonsjournal
  ('cf69d030-48fb-42c8-a5b8-aae0905c8bd5', 'development_process'), -- Utviklingsplan
  ('4800810e-8b32-4e95-a275-217242266dea', 'foundation'), -- Verdikonflikter
  ('c73a9d6b-891c-4905-8614-96ccb07a0e40', 'self_capacity'), -- Belastningssjekk
  ('51ba0772-a966-4f31-a0a7-488c9cf0fa2a', 'self_capacity'), -- Energikartlegging
  ('5e327cf6-f90d-4b38-b657-dac13b9a51bc', 'self_capacity'), -- Livsgrafen
  ('85f67440-9dcc-43f1-923c-2219da8254d1', 'self_capacity'), -- Prestasjonskognisjon
  ('2cb4236a-77b5-42f5-9d05-04d36d8303a2', 'self_capacity'), -- Triggerkartlegging
  ('a821e34a-48b2-4036-80a9-68669aedaa23', 'relationships_influence'), -- Interessentkart
  ('282b341b-64b5-41c8-93ed-b7f99aa82cc9', 'team_people'), -- Psykologisk trygghet i praksis
  ('c240065b-db60-43c5-9836-e77c4a873b19', 'execution_decisions'); -- Beslutningslogg

do $$
declare
  missing_resource_ids text;
begin
  if (select count(*) from resource_development_area_map_v1) <> 46 then
    raise exception 'Resource area mapping must contain exactly 46 resources';
  end if;

  select string_agg(m.resource_id::text, ', ' order by m.resource_id::text)
  into missing_resource_ids
  from resource_development_area_map_v1 m
  left join public.resources r on r.id = m.resource_id
  where r.id is null;

  if missing_resource_ids is not null then
    raise exception 'Resource area mapping references missing resources: %', missing_resource_ids;
  end if;
end;
$$;

delete from public.resource_tags rt
using resource_development_area_map_v1 m
where rt.resource_id = m.resource_id
  and rt.tag like 'area:%'
  and rt.tag <> 'area:' || m.area_key;

insert into public.resource_tags (resource_id, tag)
select m.resource_id, 'area:' || m.area_key
from resource_development_area_map_v1 m
on conflict (resource_id, tag) do nothing;

update public.resources
set
  slug = 'aida-fra-budskap-til-handling',
  updated_at = now()
where id = '07b4b8b4-d4d8-4628-b60b-3bc729b6a60f'
  and slug = 'tre-gode-ting-kopi-mt71die4-kopi-mt71f8lm-kopi-mt71h9cy-kopi-mtbwbgpa';

delete from public.resource_tags
where resource_id = '07b4b8b4-d4d8-4628-b60b-3bc729b6a60f'
  and tag = 'styrkekartlegging';

insert into public.resource_tags (resource_id, tag)
values
  ('07b4b8b4-d4d8-4628-b60b-3bc729b6a60f', 'budskap'),
  ('07b4b8b4-d4d8-4628-b60b-3bc729b6a60f', 'kommunikasjon'),
  ('07b4b8b4-d4d8-4628-b60b-3bc729b6a60f', 'påvirkning')
on conflict (resource_id, tag) do nothing;

update public.resources
set
  summary = 'Se tilbake på en konkret situasjon der du fungerte på ditt beste. Ressursen hjelper deg å identifisere styrkene, valgene og handlingsmønstrene du brukte, slik at du kan ta dem mer bevisst med inn i nye situasjoner.',
  client_intro = 'Se tilbake på en konkret situasjon der du fungerte på ditt beste. Ressursen hjelper deg å identifisere styrkene, valgene og handlingsmønstrene du brukte, slik at du kan ta dem mer bevisst med inn i nye situasjoner.',
  updated_at = now()
where id = '6080f5e7-d25a-4401-b910-ba612d196d29';
