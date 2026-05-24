# Screen Contract: Samtaler V2

## Status

Draft for approval before implementation. This contract is intentionally narrow: reuse the existing conversation structure and improve editing logic.

## Purpose

Samtaler helps client and coach prepare for and capture the important parts of each coaching conversation.

This is not a full redesign of the conversation model. The current fields remain the basis for MVP.

## Relation To Retning And Fokusomrader

Retning defines the overall contract.

Fokusomrader defines what the coaching should concentrate on.

Samtaler captures what is clarified, learned, decided, and carried forward in each conversation. A conversation may also create experiments connected to one of the focus areas.

## Primary User Job

As a client or coach, I need to capture the purpose and outcome of a conversation without leaving the context of the conversation page.

## Existing Fields To Keep

Samtaler V2 should reuse the current conversation fields:

1. Tittel
2. Mål med samtalen
3. Viktig innsikt
4. Mulig neste steg
5. Hva tar du med deg videre?

Do not rethink these fields in this iteration.

## Layout

The page should keep the existing conversation structure:

Left or top-level list:

- Conversation list with date/session number/title where available.

Selected conversation:

- Tittel
- Mål med samtalen
- Etter samtalen section
- Viktig innsikt
- Mulig neste steg
- Hva tar du med deg videre?
- Eksperimenter fra denne samtalen

The visual style should be calm and consistent with Retning and Fokusomrader.

## Editing Model

Use direct field-level inline editing, same principle as Fokusomrader.

Normal state:

- Conversation fields display as readable content, not as a form.
- No modal is used for core conversation fields.
- No global `Rediger samtale` mode.
- No section-level edit button that opens several fields at once.
- No permanent edit icon on every field.

Hover/focus state:

- A field may show a subtle affordance that it can be edited.
- Do not show visible labels such as `Inline`, `Redigerbar`, or `Klikk for å redigere`.

Active edit state:

- Only the selected field enters edit mode.
- The field becomes an input/textarea in place.
- Local `Lagre` and `Avbryt` controls appear for that field.
- Other fields remain in read mode.

Destructive/admin actions:

- Use a discreet more menu for delete/archive.
- Destructive actions require product confirmation UI.

## Experiments Section

Selected conversation should include a lightweight experiments section:

Title:

`Eksperimenter fra denne samtalen`

Purpose:

Capture concrete experiments agreed during the conversation.

Action:

- A discreet `+` action creates an experiment from the conversation.

Minimum experiment creation fields:

- Fokusområde
- Hva skal testes?
- I hvilken situasjon?
- Hva skal observeres?

Required relation:

- The experiment must be linked to the conversation.
- The experiment should be linked to a focus area when one exists.

This section must not become a full practice/readout workflow.

## Primary Action

If no conversation is selected or created:

`Legg til samtale`

Inside a selected conversation, editing happens directly on the field the user touches.

The experiment `+` is a local secondary action, not the main page action.

## Must Not Include

- Modal editing for core conversation fields
- One global edit mode for all conversation fields
- Section-level edit mode for multiple fields
- Permanent edit icons on every field
- Native alert/confirm
- Heavy practice lifecycle
- Reflection log
- Learning trail
- New conversation field model in this iteration
- Old conversation UI rendered below the new surface

## Empty State

If no conversations exist:

`Legg til første samtale`

Support text:

`Start med formålet for samtalen. Utfallet kan fylles ut etterpå.`

## Role Differences

Client view prioritizes:

- What is this conversation helping me clarify?
- What became important?
- What should I remember or try next?

Coach view prioritizes:

- Is the conversation purpose clear?
- What insight or decision should be carried forward?
- Should the next step become an experiment tied to a focus area?

For MVP, client and coach can use the same fields and layout.

## Field Mapping

Known existing fields:

- `coaching_sessions.focus` -> Tittel or conversation focus, depending on current app mapping
- `coaching_sessions.conversation_goal` -> Mål med samtalen
- `coaching_sessions.insights` -> Viktig innsikt
- `coaching_sessions.decisions` -> Mulig neste steg or decisions, depending on current app mapping
- `coaching_sessions.client_notes` / `coach_notes` -> Hva tar du med deg videre?, depending on current app mapping
- `session_actions.session_id` -> Experiments from this conversation
- `session_actions.development_area_id` -> Focus area relation for experiment

Open decision:

- Confirm exact current mapping for the five visible conversation fields before implementation.
- Confirm whether `Mulig neste steg` should remain free text, create an experiment, or support both.

## Removal List

Implementation must remove from the active render path:

- Modal editing for core conversation fields.
- Duplicate conversation edit forms.
- Any native alert/confirm in Samtaler flow.
- Any old behavior where blanking a conversation field hides or loses data unexpectedly.
- Any heavy practice/readout/reflection UI inside Samtaler.

## Acceptance Criteria

Samtaler V2 is accepted when:

- Existing conversation fields are preserved.
- Core fields use direct field-level inline editing.
- Only the active field enters edit mode.
- No modal is used for core conversation fields.
- A lightweight experiments section exists for the selected conversation.
- Experiments created from a conversation can be linked to a focus area.
- The experiment section does not become a full practice/readout flow.
- Destructive actions use product confirmation UI.
- Old conversation UI is not rendered below the new surface.
- Mobile layout is visually checked.

## Test Plan

Manual:

- Load with no conversations.
- Add first conversation.
- Select an existing conversation.
- Edit title inline.
- Edit each conversation field inline.
- Cancel an edit.
- Save an edit and refresh.
- Add an experiment from the conversation.
- Link that experiment to a focus area.
- Delete/archive a conversation with confirmation.
- Check mobile viewport.

Data:

- Confirm the five visible conversation fields persist to intended columns.
- Confirm experiments created from a conversation have `session_id`.
- Confirm focus-linked experiments have `development_area_id`.
- Confirm blank edits do not silently hide existing DB rows.

Spaghetti check:

- Search for old conversation render branches.
- Search for duplicate conversation forms.
- Search for modal editing in Samtaler.
- Search for native alert/confirm in Samtaler.
- Search for accidental heavy practice/readout/reflection UI in Samtaler.
