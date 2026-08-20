# QA Remediation Closeout - 2026-08-20

## Status

Critical QA remediation is complete and verified in production.

Production currently runs merge commit `c06f351a2419b6ad0a089b6cf028d8d50b33f210` with app assets at `polish-116`.

## Completed Remediation

### Mobile Auth Layout

- Mobile auth panel is constrained to viewport width.
- Auth layout uses explicit box sizing and mobile media rules.
- Production CSS signature was verified on `styles.css?v=polish-116`.

### Admin And Resource Sharing

- Admin resource flow is available from the admin workspace.
- Resource sharing uses the safe RPC path.
- `share_resource_with_client_safe` requires `context_id` for non-program contexts.
- Resource context is validated against the selected program before sharing.

### Transactional Plan Save

- `savePlan` uses `save_development_plan_safe` when available.
- Production RPC definition does not delete omitted focus areas or sessions.
- Existing client plan data and active flows are preserved.

### Experiment Status

- Experiment status model is explicit:
  - `planned`
  - `active`
  - `reviewed`
  - `continued`
  - `closed`
- Production data sanity found zero invalid experiment statuses.
- Closing an experiment updates status to `closed`; it is not hard-deleted.

### Non-Destructive Archiving

- Focus areas and coaching sessions now use `archived_at`.
- Clients and coaches now use `archived_at`.
- Archived records are hidden from active lists and access flows.
- Profiles, auth users, plan data, reflections and related history are preserved.

## Production Verification

- PR #3 merged and production verified.
- PR #4 merged and production verified.
- PR #5 merged and production verified.
- PR #6 merged and production verified.
- GitHub Pages deploy for `c06f351` completed successfully.
- Supabase migrations through `20260820200000_archive_admin_people.sql` are applied remotely.
- Rollback-based production smoke checks passed for archive updates without leaving test data.

## Deferred Low-Priority Backlog

These are not blockers for closing QA remediation.

1. Update GitHub Actions dependencies that still emit Node 20 deprecation warnings.
2. Add a product-approved archive recovery view if archived focus areas, sessions, clients or coaches need to be restored from the UI.
3. Add a formal account lifecycle policy for hard delete requests, covering privacy, retention and audit needs.
4. Consider lightweight automated smoke checks for production asset versions and critical RPC signatures.
5. Review legacy `v2/` and `index-legacy-before-v2.html` files separately if they are still served or referenced.

## Release Position

No further critical QA remediation is required before normal product work resumes.

Future changes should be handled as separate product or technical hygiene items, with their own PRs and production approval.
