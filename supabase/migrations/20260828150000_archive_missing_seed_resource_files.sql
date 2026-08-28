-- Retire pilot file references whose storage objects were never uploaded.
-- Keep the rows archived so the correction remains reversible and auditable.

update public.resource_files rf
set
  archived_at = now(),
  updated_at = now()
where rf.id in (
    '6e84f2df-291d-4e76-b1a7-e3ea4e4cdb76',
    '8a52cb92-5090-4a53-bae7-7d4f7774b98f',
    '0f41b4b6-1a40-4c51-94f7-a0dd179ae89b'
  )
  and rf.resource_id = '493d641d-506a-409b-8a26-7d5435da58de'
  and rf.archived_at is null
  and not exists (
    select 1
    from storage.objects so
    where so.bucket_id = 'resource-assets'
      and so.name = rf.storage_path
  );

update public.resources r
set
  content_json = coalesce((
    select jsonb_agg(item order by position)
    from jsonb_array_elements(r.content_json) with ordinality as blocks(item, position)
    where not (
      item ->> 'type' = 'illustration'
      and item ->> 'key' = 'fear_curve'
    )
  ), '[]'::jsonb),
  updated_at = now()
where r.id = '493d641d-506a-409b-8a26-7d5435da58de'
  and not exists (
    select 1
    from public.resource_files rf
    join storage.objects so
      on so.bucket_id = 'resource-assets'
      and so.name = rf.storage_path
    where rf.resource_id = r.id
      and rf.file_type = 'illustration'
      and rf.archived_at is null
  );
