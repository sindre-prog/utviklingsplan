-- Correct the test PDF uploaded to the resource already shared with Peder Aas.
-- The shared resource references the live resource, so no resend is required.

update public.resource_files rf
set
  file_type = 'printable',
  updated_at = now()
where rf.id = 'c7cca218-132b-4dab-8607-536777694407'
  and rf.resource_id = '742e8f85-f140-4d6d-bf5d-a5f52543bc01'
  and rf.storage_path = '742e8f85-f140-4d6d-bf5d-a5f52543bc01/1787905761980-forside.pdf'
  and rf.archived_at is null
  and rf.file_type = 'illustration'
  and exists (
    select 1
    from storage.objects so
    where so.bucket_id = 'resource-assets'
      and so.name = rf.storage_path
  );
