# Data Contract

This document locks the Package 1 data decisions used by the V2 coaching flow.

## Program Direction

Table: `coaching_programs`

- `purpose` -> `Mål`
- `success_criteria` -> `Tegn på bevegelse`
- `expectations_client` -> `Forventninger til klient`
- `expectations_coach` -> `Forventninger til coach`
- `practical_frame` -> practical frame portion of `Rammer og konfidensialitet`
- `confidentiality` -> confidentiality portion of `Rammer og konfidensialitet`
- `context` -> `Interessenter og kontekst`

Decision:

- Add `coaching_programs.context`.
- Do not overload `practical_frame` for context/stakeholders.

## Focus Areas

Table: `development_areas`

- `title` -> focus area name
- `project_type` -> focus type
- `description` -> `Dagens mønster`
- `movement` -> `Ønsket bevegelse`
- `typical_situations` -> `Typiske situasjoner`
- `progress_signs` -> `Tegn på fremgang`
- `next_practice` -> legacy field, not used by Fokusomrader V2

Allowed `project_type` values:

- `inner`
- `outer`
- `both`

Decision:

- Add `development_areas.typical_situations`.
- Keep `next_practice` in the database for backward compatibility, but do not use it in the V2 focus surface.

## Experiments

Table: `session_actions`

User-facing object name: `Eksperiment`

Minimum creation fields:

- `development_area_id` -> `Fokusområde`
- `title` -> `Hva skal testes?`
- `description` -> structured JSON for situation/observation and later readout fields
- `session_id` -> conversation relation when created from Samtaler

Shared lightweight creation model:

- `Fokusområde`
- `Hva skal testes?`
- `I hvilken situasjon?`
- `Hva skal observeres?`

Status enum:

- `planned`
- `active`
- `reviewed`
- `continued`
- `closed`

Legacy status migration:

- `todo` -> `planned`
- `doing` -> `active`
- `testing` -> `active`
- `done` -> `reviewed`
- `dropped` -> `closed`

Allowed transitions:

- `planned -> active`
- `active -> reviewed`
- `reviewed -> continued`
- `reviewed -> closed`
- `continued -> active`

## Conversations

Table: `coaching_sessions`

The MVP keeps the existing visible fields:

- `focus` -> `Tittel` or conversation focus, depending on current app mapping
- `conversation_goal` -> `Mål med samtalen`
- `insights` -> `Viktig innsikt`
- `decisions` -> `Mulig neste steg`
- `client_notes` / `coach_notes` -> `Hva tar du med deg videre?`, depending on role mapping

Decision:

- `Mulig neste steg` remains free text.
- The action `Gjør til eksperiment` copies this text into the shared experiment drawer field `Hva skal testes?`.

## Reflections

Table: `client_reflections`

- `body` -> reflection text
- `visibility` -> `private` or `shared_with_coach`
- `development_area_id` -> optional focus relation
- `session_id` -> optional conversation relation, not required in MVP UI
- `action_id` -> optional experiment relation, not required in MVP UI

Decision:

- Focus-area linking is optional in MVP.
- Private remains the default visibility.
- Coach must never see private reflections.
