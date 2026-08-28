# Implementation Guardrails

This document is the working contract for rebuilding the development portal without adding new layers on top of old structure.

## Non-Negotiable Product Model

The portal is a coaching and leadership development workspace, not a generic development-plan editor.

The visible development model is:

`Forløpet (mål og rammer) -> Ytre prosjekt -> Indre prosjekt -> Prøv i praksis`

The complete learning loop is:

`Forløpet -> Ytre prosjekt -> Indre prosjekt -> Praksiseksperiment -> Observasjon -> Samtale -> Refleksjon -> Justering`

The main navigation remains:

`Akkurat nå -> Forløpet -> Utviklingsfokus -> Samtaler -> Refleksjon -> Ressurser`

`Praksiseksperiment` is the engine inside the flow, not a fifth top-level tab.

`Forløpet` is the coaching program's goal, working agreement, and frame. It is not the leader's operative direction. `Ytre prosjekt` is the work-facing leadership assignment that matters most now. `Indre prosjekt` is the leadership competence the client develops to improve their ability to deliver on that assignment.

In UI copy, `Ytre prosjekt` must be paired with `Fokusoppdrag`, and `Indre prosjekt` must be paired with `Lederkompetanse`, until the relationship is self-evident from context. Do not reverse the sequence or reintroduce leader competencies and focus assignments as unexplained parallel concepts.

The next-step flow must preserve the same sequence. A completed `Ytre prosjekt` routes to `Indre prosjekt` when no active leadership competence exists; only after an inner project exists may the flow route to a practice experiment.

## Enforcement Rules

1. No new UI without a screen contract.
   Each screen contract must define purpose, primary action, visible fields, editable fields, empty state, role differences, edit pattern, removal list, and acceptance criteria.

2. Replace, do not layer.
   A V2 surface must remove the old render path for that surface. Old UI must not be hidden, styled around, or kept as fallback unless there is an explicit temporary feature flag and a deletion date.

3. One module at a time.
   Finish and audit each module before starting the next. Do not redesign Forløpet, Utviklingsfokus, Samtaler, and Refleksjon in one pass.

4. Data contract before screen.
   Each object must have one source of truth for status, ownership, relations, deletion, and visibility before UI is built around it.

5. No competing navigation.
   The four tabs are the primary process navigation. Status, checklists, and next-step prompts may guide action, but must not behave like a second tab system.

6. Inline first, drawer second, dialog last.
   Coaching work should happen in context. Use inline editing for core fields, drawers for larger bounded objects, and dialogs only for administration or destructive confirmation.

7. No native alert or confirm in finished flows.
   Errors, confirmations, and destructive actions must use the same product UI patterns as the rest of the portal.

8. Every work package has a removal list.
   If a task only adds code and removes nothing from the old surface, it is probably building a layer.

9. Every module ends with a spaghetti check.
   Before moving on, check for duplicated render logic, duplicated forms, mismatched status values, old UI remnants, dead functions, and inconsistent component patterns.

10. Stop instead of working around bad structure.
    If the existing structure makes the correct product solution awkward, stop and replace the structure. Do not code around it.

## Editing Patterns

### Authentication Sessions

- Browser sessions must be persisted and refreshed by the Supabase client.
- A transient profile or reference-data error must never call `signOut()` or remove a valid local session.
- Retry session recovery once, then show a reconnect state with explicit `Prøv igjen` and `Logg ut` actions.
- Only show the login form when the browser has no valid session.
- Pin the browser Supabase client to an exact tested version.

### Unsaved Changes

All inline editing must handle unsaved changes explicitly:

- If the user navigates away, switches tab, changes selected item, or closes an edit field with unsaved changes, show product UI that asks whether to save, discard, or stay.
- Do not silently save on blur for long text fields.
- Do not silently discard user input.
- Network or save errors must keep the user's draft visible and explain what failed.

### Inline

Use for:

- Forløpet fields
- Focus area fields
- Active practice summaries
- Conversation notes
- Reflection text
- Observation and adjustment fields

### Drawer

Use for:

- Creating or editing a practice experiment
- More extensive conversation preparation or summary
- Linking reflection to focus/practice/conversation if the operation needs context

### Dialog

Use for:

- Invite client
- Invite coach
- Confirm delete
- Small administrative actions that are separate from the coaching work

## Component Contract

Before broad UI rebuilds, these patterns should exist or be explicitly defined:

- Button
- IconButton
- Pill
- InlineEditor
- Drawer
- ConfirmDialog
- FieldGroup
- WorkspaceShell
- Section
- EmptyState
- ErrorMessage

Do not create one-off buttons, cards, popups, or status pills inside individual screens unless they map back to these patterns.

## Data Priorities

The following must be resolved before building heavy new UI:

1. One practice-experiment status model:
   `planned -> active -> reviewed -> continued / closed`

   UI labels:
   - `planned` -> `Planlagt`
   - `active` -> `Prøves ut`
   - `reviewed` -> `Avlest`
   - `continued` -> `Videreført`
   - `closed` -> `Avsluttet`

   Do not introduce additional status words in UI or code without updating this glossary first.

2. Practice experiments can be linked to:
   - program
   - focus area
   - conversation
   - reflection

3. Reflections can be linked to:
   - program
   - focus area
   - practice experiment
   - conversation

4. Conversation next steps can become practice experiments.

5. Delete and clear behavior must have one truth.

6. Save behavior must avoid silent partial success.

7. Client write access must be scoped to intended client-owned fields, not broad row updates.

## Required Work-Package Template

Each implementation package must define:

- Problem
- Product decision
- Data contract
- Screen contract
- Edit pattern
- Removal list
- Acceptance criteria
- Test plan
- Spaghetti check

## Definition Of Done For A Module

A module is not done until:

- The screen contract is implemented.
- The old surface it replaces is removed from the render path.
- There is one edit pattern for each action.
- Empty, loading, error, and saved states are handled.
- Client and coach behavior is explicit.
- Mobile layout has been visually checked.
- No new competing navigation has been introduced.
- No native alert/confirm remains in that module.
- A spaghetti check has been performed.
