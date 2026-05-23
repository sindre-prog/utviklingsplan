alter table public.clients
add column if not exists account_activated_at timestamp with time zone,
add column if not exists consent_version text;

update public.clients
set account_activated_at = coalesce(account_activated_at, consent_date)
where account_activated_at is null
  and consent_given is true
  and consent_date is not null;

update public.clients
set consent_version = coalesce(consent_version, 'legacy-import')
where consent_version is null
  and consent_given is true;
