# Screen Contract: Fokusomrader V2

## Status

Draft for visual approval before implementation. No app code should be written from this contract until the visual direction and editing model are accepted.

## Purpose

Fokusomrader helps client and coach choose the few development areas that should get attention now.

It does not manage conversations, reflections, learning history, or progress tracking. Those belong to later surfaces.

It may show a simple list of experiments connected to the selected focus area, because experiments are defined within focus areas during or after conversations. This must stay lightweight and must not become the full practice/readout workflow.

## Relation To Retning

Retning defines the overall contract and compass.

Fokusomrader translates that direction into 1-4 concrete areas of attention.

This surface should feel like a natural continuation of Retning: same calm visual language, same four-tab structure, but less introductory and more focused on choosing and clarifying.

If this contract reveals changes needed in Retning, handle them after Fokusomrader is approved. Do not solve Retning inside this screen.

## Primary User Job

As a client or coach, I need to see and refine the most important focus areas so we know what the coaching should concentrate on in the coming period.

## Core Product Rule

A focus area is a movement, not a topic.

Each focus area answers:

- What is happening now?
- What should it move toward?
- Where does this show up?
- What would show progress?
- Which concrete experiments are connected to this focus?

## Visible Fields

Each focus area has:

1. Name
   Short, human-readable title.

2. Type
   `indre`, `ytre`, or `begge`. Shown as a pill.

3. Current pattern
   Current pattern or tendency.

4. Desired movement
   Desired movement.

5. Typical situations
   Where this appears in real work.

6. Signs of progress
   Observable indicators that something is changing.

Suggested Norwegian UI labels:

- `Dagens mønster`
- `Ønsket bevegelse`
- `Typiske situasjoner`
- `Tegn på fremgang`

## Layout

The page has one main workspace:

Left:

- Prioritized list of focus areas.
- Each item shows priority number, title, type pill, and one-line movement summary.
- `Legg til fokusområde` is the only primary action on this page.

Right:

- Details for the selected focus area.
- Header shows title, type pill, and a discreet more menu.
- Details are simple text fields: `Dagens mønster`, `Ønsket bevegelse`, `Typiske situasjoner`, `Tegn på fremgang`.
- A simple `Eksperimenter for dette fokuset` section may appear below the focus details.

No dashboard modules. No nested cards inside cards. No secondary progress navigation.

## Experiments Section

The selected focus area may include a lightweight experiments section:

Title:

`Eksperimenter for dette fokuset`

Support text:

`Konkrete ting du vil teste, observere og lære av i praksis.`

Empty state:

`Ingen eksperimenter knyttet til dette fokuset ennå.`

Action:

- A discreet `+` action adds an experiment to this focus.

This section should show experiments as related items only. It must not introduce:

- Practice status lifecycle as the main UI
- `Avles praksis`
- Learning trail
- Conversation summary
- Reflection log
- A second primary action competing with `Legg til fokusområde`

## Editing Model

Use direct field-level inline editing.

Normal state:

- Content is calm and readable.
- Fields do not show permanent edit icons.
- Type is shown as a pill.
- Destructive/admin actions live in a discreet more menu.

Hover/focus state:

- A field may show a subtle affordance that it can be edited.
- This can be a faint background, light outline, or tiny contextual edit affordance.
- Do not show labels such as `Inline`, `Redigerbar`, or `Klikk for å redigere`.

Active edit state:

- Only the selected field enters edit mode.
- The field becomes an input/textarea in place.
- Local `Lagre` and `Avbryt` controls appear for that field.
- Other fields remain in read mode.

Type editing:

- Click/tap the type pill.
- Open a local pill/segmented selector with `Indre`, `Ytre`, `Begge`.
- Do not use a modal.

Title editing:

- Click/tap the title.
- Edit title in place.

Delete/archive:

- Use a more menu in the focus-area header.
- Destructive actions require product confirmation UI.

## Primary Action

`Legg til fokusområde`

This creates a new focus area. The creation flow should be lightweight and should not feel like a long form.

Minimum creation fields:

- Name
- Type
- Current pattern
- Desired movement

Situations and signs of progress can be filled in after creation.

## Must Not Include

- Practice status
- `Avles praksis`
- Learning trail
- Conversation links
- Reflection links
- Next-step engine
- Progress cards that compete with top navigation
- Section-level edit mode
- Permanent edit icons on every field
- One icon that opens all fields for editing
- Modal editing for core focus content
- Visible helper text that explains the editing mechanics
- Legacy focus UI below the new surface

## Empty State

If no focus areas exist, show a simple empty state:

`Velg første fokusområde`

Support text:

`Start med ett område som betyr mest de neste ukene. Du kan legge til flere senere.`

Primary action:

`Legg til fokusområde`

## Role Differences

Client view prioritizes:

- What are my focus areas?
- What am I moving from and toward?
- Where does this show up in my work?

Coach view prioritizes:

- Are the focus areas specific enough?
- Are there too many?
- Are situations and signs observable enough to coach from?

For MVP, the same content can be visible to both roles. The difference can be in helper copy and validation, not separate layout.

## Field Mapping

Known existing fields:

- `development_areas.title` -> Name
- `development_areas.project_type` -> Type
- `development_areas.description` -> Current pattern, unless a dedicated field is added
- `development_areas.movement` -> Desired movement
- `development_areas.progress_signs` -> Signs of progress
- `session_actions.development_area_id` -> Experiments connected to this focus

Open decision:

- Add or map `typical_situations`.
- Decide whether `next_practice` should be removed from this surface.
- Decide the minimal experiment fields needed for the lightweight add flow.

## Removal List

Implementation must remove from the active render path:

- Legacy focus list/cards that duplicate this workspace.
- Separate type-only cards.
- Heavy practice, readout, learning, conversation, and reflection UI inside Fokusomrader.
- Section-level edit buttons for core focus content.
- Permanent field edit icons.
- Any modal used for editing core focus fields.
- Native alert/confirm in Fokusomrader.
- Any behavior where blanking a focus hides it without deleting or archiving it.

## Acceptance Criteria

Fokusomrader V2 is accepted when:

- The page reads as a simple prioritization and clarification surface.
- The main layout is a prioritized list plus selected detail.
- The primary action is `Legg til fokusområde`.
- Type is a pill, not a separate card.
- The experiments section is lightweight and related to the selected focus only.
- No readout, conversation, reflection, learning-trail, or progress-engine UI appears.
- Fields use direct field-level inline editing.
- Only the active field enters edit mode.
- Destructive actions use product confirmation UI.
- Old focus UI is not rendered below the new surface.
- The page visually relates to Retning without copying its intro-heavy structure.
- Mobile layout is visually checked.

## Test Plan

Manual:

- Load with no focus areas.
- Add first focus area.
- Add second focus area.
- Select each focus area from the list.
- Edit title inline.
- Edit each text field inline.
- Change type through local pill/segmented selector.
- Add an experiment to the selected focus through the lightweight `+` action.
- Cancel an edit.
- Save an edit and refresh.
- Archive/delete with confirmation.
- Check mobile viewport.

Data:

- Confirm all visible fields persist to intended columns.
- Confirm experiments are linked to the selected focus area.
- Confirm blank edits do not silently hide existing DB rows.

Spaghetti check:

- Search for old focus render branches.
- Search for duplicate focus forms.
- Search for heavy practice/readout/learning-trail UI in Fokusomrader.
- Search for native alert/confirm in Fokusomrader.
- Search for dead focus helper functions after replacement.
