# Implementation Plan

This plan turns the approved product contracts into ordered implementation packages. It exists to prevent layer-by-layer UI changes and to keep data, language, and interaction patterns consistent.

No UI package should begin before Package 1 and Package 2 are complete.

## Locked Product Decisions

1. Main navigation remains:
   `Retning -> Fokusomrader -> Samtaler -> Refleksjon`

2. Practice experiments are the learning engine, but not a fifth top-level tab.

3. Fokusomrader is a prioritization and clarification surface, not a full practice workflow.

4. Samtaler keeps the existing field structure for MVP.

5. Refleksjon is the client's reflection room. Private is default.

6. Core content is edited with direct field-level inline editing.

7. No modal/popup is used for core content editing.

8. No native `alert()` / `confirm()` remains in finished core flows.

9. V2 surfaces replace old render paths. They are not layered underneath or above legacy UI.

## Product Glossary

### Object Names

- Use `Eksperiment` as the user-facing object name.
- Avoid mixing `praksis`, `practice`, and `experiment` as object names in UI.
- It is acceptable to use practice-oriented explanatory text, but the object is called `Eksperiment`.

### Experiment Status

Internal enum:

- `planned`
- `active`
- `reviewed`
- `continued`
- `closed`

Norwegian UI labels:

- `planned` -> `Planlagt`
- `active` -> `Prøves ut`
- `reviewed` -> `Avlest`
- `continued` -> `Videreført`
- `closed` -> `Avsluttet`

Do not add new experiment status labels without updating this glossary and the data contract.

### Focus Field Labels

- `Dagens mønster`
- `Ønsket bevegelse`
- `Typiske situasjoner`
- `Tegn på fremgang`

### Sharing Labels

- `Privat`
- `Del med coach`
- `Delt med coach`

## Data Decisions To Lock In Package 1

1. Add a dedicated field for Retning context/stakeholders.
   - Preferred: `coaching_programs.context`
   - Do not overload `practical_frame`.

2. Add a dedicated field for focus situations.
   - Preferred: `development_areas.typical_situations`

3. Deprecate `development_areas.next_practice` from the Fokusomrader V2 surface.
   - Experiments should be first-class related objects, not focus-area free text.

4. Use one lightweight experiment creation model from both Fokusomrader and Samtaler:
   - `Fokusområde`
   - `Hva skal testes?`
   - `I hvilken situasjon?`
   - `Hva skal observeres?`

5. Keep `Mulig neste steg` in Samtaler as free text.
   - Add a path to turn it into an experiment.
   - Do not force every next step to become an experiment.

6. Retning `Rediger retning` behavior:
   - In empty state, it activates the first missing field.
   - In normal state, fields are edited directly.
   - It must not open a global edit mode.

7. Refleksjon focus-area linking:
   - Include in MVP as optional.
   - Do not require a focus link to write a reflection.

## Package 1: Foundation Decisions And Data Contract

### Goal

Lock remaining data and language decisions before any UI build.

### Scope

- Confirm final schema additions.
- Confirm experiment status enum and UI labels.
- Confirm field mapping for Retning, Fokusomrader, Samtaler, and Refleksjon.
- Confirm what happens to deprecated or legacy fields.

### Deliverables

- Updated docs with final data decisions.
- Migration plan for schema changes.
- Field mapping table for each surface.

### Acceptance Criteria

- No open data decision blocks Retning or Fokusomrader.
- Experiment creation fields are identical from Fokusomrader and Samtaler.
- `Mulig neste steg` behavior is explicit.
- `next_practice` behavior is explicit.

## Package 2: Shared Interaction Components

### Goal

Build one interaction system before rebuilding screens.

### Components

- `InlineEditor`
- `InlineTextArea`
- `InlineTitle`
- `Pill`
- `SegmentedControl`
- `MoreMenu`
- `ConfirmDialog`
- `Drawer` or contextual panel for experiment creation
- `ErrorMessage`
- `EmptyState`

### Interaction Rules

- Only one field can be actively edited at a time.
- Long text fields do not autosave on blur.
- Unsaved changes require save/discard/stay handling.
- Save errors keep the user's draft visible.
- Destructive actions use product confirmation UI.

### Acceptance Criteria

- Screens do not create one-off inline editors.
- Screens do not create one-off confirm dialogs.
- Native alert/confirm is not needed for V2 core flows.

## Package 3: Schema Migration

### Goal

Update schema before UI depends on missing fields.

### Expected Changes

- Add `coaching_programs.context` or chosen equivalent.
- Add `development_areas.typical_situations` or chosen equivalent.
- Normalize or prepare experiment status handling on `session_actions`.
- Confirm indexes/foreign keys needed for experiment links.

### Acceptance Criteria

- Local Supabase reset passes.
- Remote dry-run shows expected migration only.
- RLS still protects private/shared data.

## Package 4: Retning V2

### Goal

Replace current Retning surface with contract/compass.

### Scope

- Six visible fields:
  - `Mål`
  - `Tegn på bevegelse`
  - `Forventninger til klient`
  - `Forventninger til coach`
  - `Rammer og konfidensialitet`
  - `Interessenter og kontekst`
- Direct field-level inline editing.
- No progress cards competing with tabs.
- No old Retning UI below the new surface.

### Acceptance Criteria

- All six fields persist.
- Expectations fields are visible.
- Context/stakeholder data persists to dedicated field or is intentionally removed from MVP.
- No global edit mode.

## Package 5: Fokusomrader V2

### Goal

Replace current Fokusomrader with a prioritization and clarification surface.

### Scope

- Prioritized list.
- Selected focus detail.
- Labels:
  - `Dagens mønster`
  - `Ønsket bevegelse`
  - `Typiske situasjoner`
  - `Tegn på fremgang`
- Lightweight `Eksperimenter for dette fokuset` section.
- Direct field-level inline editing.

### Acceptance Criteria

- No heavy practice/readout flow appears.
- Experiments can be added from focus area with the shared lightweight model.
- Type is a pill, not a separate card.
- Old focus UI is removed from render path.

## Package 6: Samtaler V2

### Goal

Preserve current conversation fields while improving editing and experiment creation.

### Scope

- Keep fields:
  - `Tittel`
  - `Mål med samtalen`
  - `Viktig innsikt`
  - `Mulig neste steg`
  - `Hva tar du med deg videre?`
- Direct field-level inline editing.
- `Eksperimenter fra denne samtalen`.
- `Mulig neste steg` remains free text and can be turned into an experiment.

### Acceptance Criteria

- No modal editing for core fields.
- Experiments created from a conversation have `session_id`.
- Experiments can link to a focus area.
- Old conversation UI is removed from render path.

## Package 7: Refleksjon V2

### Goal

Create a simple client reflection room.

### Scope

- Composer first.
- Private by default.
- Explicit `Del med coach`.
- Optional focus-area link.
- Calm reflection history.
- Coach sees only shared reflections.

### Acceptance Criteria

- Private reflections are never shown to coach.
- Reflection creation is low friction.
- No dashboard metrics or progress cards.
- Old reflection UI is removed from render path.

## Package 8: Admin And Destructive Actions

### Goal

Standardize non-core actions.

### Scope

- Delete/archive confirmation.
- Invite client/coach dialogs.
- Error handling.
- Remove native `alert()` / `confirm()` from finished V2 core flows.

### Acceptance Criteria

- Destructive actions use `ConfirmDialog`.
- Errors use product UI.
- No silent success after failed Supabase calls.

## Package 9: Legacy Cleanup

### Goal

Remove old code paths after V2 surfaces are accepted.

### Scope

- Remove old render branches.
- Remove duplicate forms.
- Remove dead helper functions.
- Remove legacy files that are no longer used.
- Remove stale V2 mock/prototype code if not used.

### Acceptance Criteria

- No old surface renders below new V2 surface.
- Search confirms no duplicate modal forms remain for core content.
- Spaghetti check passes for each module.

## Package 10: QA And Release Gate

### Goal

Verify product, UX, role, and security behavior before release.

### Checks

- Desktop visual check.
- Mobile visual check.
- Client role test.
- Coach role test.
- Private/shared reflection test.
- Experiment creation from Fokusomrader.
- Experiment creation from Samtaler.
- RLS smoke test.
- Local Supabase reset.
- Remote migration dry-run before push.

### Acceptance Criteria

- No blocker findings from final audit.
- No unresolved data decisions.
- No known private-data exposure.
- No old UI layers visible.
