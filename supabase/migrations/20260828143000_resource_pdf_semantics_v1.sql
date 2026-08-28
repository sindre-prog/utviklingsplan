-- Align existing resource data with the client-facing resource contract.
-- Printable means an approved client-facing PDF; research material remains an attachment.

update public.resources r
set
  content_json = coalesce((
    select jsonb_agg(item order by position)
    from jsonb_array_elements(r.content_json) with ordinality as blocks(item, position)
    where item ->> 'type' <> 'reflection_questions'
  ), '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
    'type', 'reflection_questions',
    'heading', 'Refleksjonsspørsmål',
    'questions', jsonb_build_array(
      'Hva forsøker du å beskytte deg mot?',
      'Hva koster unngåelsen deg over tid?',
      'Hva ville du gjort hvis frykten fikk være med, men ikke styre?',
      'Hva er ett lite, men modig steg du kan ta denne uken?'
    )
  )),
  updated_at = now()
where r.id = '493d641d-506a-409b-8a26-7d5435da58de';

update public.resource_files
set
  file_type = 'attachment',
  display_name = 'Faglig kilde om Motivation to Lead',
  updated_at = now()
where id = 'f9e4dd97-c923-49dc-80e1-13c89c825107'
  and resource_id = 'a7bcbdf4-ee12-4fa2-b910-7c592eebea29';

update public.resources r
set
  content_json = coalesce((
    select jsonb_agg(item order by position)
    from jsonb_array_elements(r.content_json) with ordinality as blocks(item, position)
    where item ->> 'type' <> 'download'
      or not exists (
        select 1
        from public.resource_files rf
        where rf.id = 'f9e4dd97-c923-49dc-80e1-13c89c825107'
          and (
            item ->> 'file_id' = rf.id::text
            or item ->> 'storage_path' = rf.storage_path
            or item ->> 'file_url' = rf.storage_path
          )
      )
  ), '[]'::jsonb),
  updated_at = now()
where r.id = 'a7bcbdf4-ee12-4fa2-b910-7c592eebea29';
