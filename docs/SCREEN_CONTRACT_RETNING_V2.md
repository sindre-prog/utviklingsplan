# Screen Contract: Retning V2

## Status

Draft for approval before implementation. No UI should be coded from this contract until the field model and removal list are accepted.

## Purpose

Retning is the contract and compass for the coaching program.

It answers:

- Why does this coaching program exist?
- What movement are we trying to create?
- What will show that something is changing?
- What can the client expect from the coach?
- What does the client commit to testing?
- What are the practical and confidentiality boundaries?
- Which context or stakeholders matter?

Retning must not behave like a generic note page or a stacked collection of legacy cards.

## Primary User Job

As a client or coach, I need a shared, concise agreement about the direction and frame of the coaching program so that all later focus areas, conversations, experiments, and reflections have a clear anchor.

## Primary Action

`Rediger retning`

Preferred edit pattern: inline editing section by section.

## Secondary Action

`Gå til fokusområder`

This action is only a next-step prompt after the direction contract has enough content.

## Required Fields

MVP Retning has six visible fields:

1. Mål
   What should this coaching program help create?

2. Tegn på bevegelse
   What will be observable if the work is helping?

3. Forventninger til klient
   What is the client responsible for between conversations?

4. Forventninger til coach
   What should the coach provide, challenge, hold, or follow up?

5. Rammer og konfidensialitet
   What are the practical boundaries, confidentiality expectations, and limits of the work?

   This field must make both parts visible in helper text:
   - Practical frame: cadence, duration, meeting rhythm, and boundaries for the collaboration.
   - Confidentiality: what is private, what may be shared, and what is outside the scope of coaching.

6. Interessenter og kontekst
   Which people, teams, roles, or organizational expectations shape the work?

## Field Mapping

Known existing data fields:

- `coaching_programs.purpose` -> Mål
- `coaching_programs.success_criteria` -> Tegn på bevegelse
- `coaching_programs.expectations_client` -> Forventninger til klient
- `coaching_programs.expectations_coach` -> Forventninger til coach
- `coaching_programs.practical_frame` -> Practical frame portion of Rammer og konfidensialitet
- `coaching_programs.confidentiality` -> Confidentiality portion of Rammer og konfidensialitet
- Existing schema does not currently have a dedicated stakeholder/context field.

Data decision before implementation:

- Do not overload `practical_frame` for Interessenter og kontekst.
- Before implementing Retning V2, either add a dedicated `context` / `stakeholders` field to `coaching_programs`, or explicitly remove Interessenter og kontekst from MVP.
- Preferred decision: add a dedicated field if schema work is already included in the implementation package.

## Visible Structure

Retning V2 should have:

1. Header
   - Program/client name
   - Light status summary
   - Primary action

2. Direction summary
   - Mål
   - Tegn på bevegelse

3. Working agreement
   - Forventninger til klient
   - Forventninger til coach

4. Frame and context
   - Rammer og konfidensialitet
   - Interessenter og kontekst

5. Next step
   - A single prompt to continue to Fokusområder when minimum fields are present

## UX Writing Direction

The intro copy should feel direct, personal, and action-oriented, closer to:

`Hei Maria, la oss gjøre dette konkret.`

Avoid generic explanatory product copy in the main intro. The first section should help the user feel oriented and invited into the work, not instructed by a dashboard.

## Must Not Include

- Large progress cards that compete with the four main tabs
- A second navigation system
- Old Retning sections stacked below the new surface
- Hidden fields that are saved but not visible
- Modal editing for the six core fields unless inline editing is impossible
- Decorative cards with no user job

## Status Logic

Retning status should be based on content quality at a simple MVP level:

- `Mangler retning`: Mål or Tegn på bevegelse is empty
- `Mangler avtale`: one or both expectation fields are empty
- `Retning satt`: Mål, Tegn på bevegelse, and both expectation fields exist

The status is informational. It is not navigation.

## Empty State

If no Retning content exists, the surface should say plainly that the program needs a shared direction before focus areas are chosen.

Primary action:

`Sett retning`

The empty state should lead into inline fields, not a separate modal.

## Role Differences

### Client

Prioritize:

- What are we working toward?
- What am I expected to practice or observe?
- What is private and what may be shared?

Minimum MVP difference:

- Client-facing helper text should emphasize clarity, safety, and what the client commits to between conversations.

### Coach

Prioritize:

- Is the contract clear enough to coach from?
- Are client and coach expectations explicit?
- Is context/stakeholder pressure visible?
- Is the program ready for focus selection?

Minimum MVP difference:

- Coach-facing helper text should emphasize whether the contract is specific enough to coach from.

For MVP, client and coach may see the same fields, but helper text, status, and next action should reflect role when possible.

## Edit Pattern

Use direct field-level inline editing, consistent with Fokusomrader, Samtaler, and Refleksjon.

Normal state:

- Retning fields display as readable content, not as a form.
- No modal is used for core Retning fields.
- No global `Rediger retning` mode that opens all fields at once.
- No section-level edit button that opens several fields at once.
- No permanent edit icon on every field.

Active edit state:

- Only the selected field enters edit mode.
- The field becomes an input/textarea in place.
- Local `Lagre` and `Avbryt` controls appear for that field.
- Other fields remain in read mode.

Do not use a generic full-screen modal for Retning core fields.

## Removal List

Retning V2 implementation must remove from the active render path:

- Legacy Retning stacked cards
- Competing progress navigation cards inside Retning
- Hidden expectation fields that are saved without being shown
- Section-level edit mode for multiple Retning fields
- Any Retning-specific native alert or confirm
- Any duplicate Retning form path

## Acceptance Criteria

Retning V2 is accepted when:

- The six MVP fields are visible.
- The two expectation fields are no longer orphaned.
- Core field editing uses direct field-level inline editing.
- Only the active field enters edit mode.
- There is one clear primary action.
- There is no competing progress navigation.
- Old Retning UI is not rendered below the new surface.
- Client and coach meaning is explicit.
- Empty state is clear.
- Mobile layout is visually checked.
- No native alert/confirm is used in the Retning flow.

## Test Plan

Manual:

- Load Retning with no program content.
- Fill each of the six fields.
- Save and refresh.
- Edit a single section and cancel.
- Edit a single section and save.
- Check client role view.
- Check coach role view.
- Check mobile viewport.

Data:

- Confirm all six visible fields persist to the intended columns.
- Confirm no hidden Retning data is being silently overwritten.

Spaghetti check:

- Search for old Retning render branches.
- Search for duplicate Retning forms.
- Search for unused Retning helper functions.
- Search for native alert/confirm in Retning flow.
