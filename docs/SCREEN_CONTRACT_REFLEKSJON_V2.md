# Screen Contract: Refleksjon V2

## Status

Draft for visual approval before implementation. This surface should stay simple.

## Purpose

Refleksjon is the client's reflection room.

It should make it easy to write down observations, thoughts, and learning between conversations, with a clear choice about whether a note stays private or is shared with the coach.

It must not become a dashboard, report, or complex learning archive in MVP.

## Relation To Other Surfaces

Retning gives the overall direction.

Fokusomrader defines what the client is working on.

Samtaler captures what happened in coaching conversations.

Refleksjon gives the client a low-friction place to notice what happens between conversations.

## Primary User Job

As a client, I need a private and calm place to write what I notice, and decide what I want to share with my coach.

## Core Product Rule

Reflection should feel safe, simple, and low pressure.

The user should not feel like they are filling out a report.

## Primary Action

`Skriv refleksjon`

## Reflection Composer

The composer should be the most important element on the page.

It should include:

- One main writing field
- Visibility choice: `Privat` or `Del med coach`
- Optional connection to focus area
- Save action

Suggested placeholder:

`Hva la du merke til?`

## Intro Copy

Use this intro:

Title:

`Legg merke til det som skjer mellom samtalene.`

Text:

`Utvikling skjer i arbeidshverdagen. Skriv ned situasjoner, valg og reaksjoner mens de er ferske, så kan du se mønstre tydeligere over tid. Du velger selv hva som deles med coach.`

Optional support prompts may appear lightly near the composer, but should not become a long form:

- Hva skjedde?
- Hva la du merke til hos deg selv?
- Hva vil du ta med videre?

## Reflection List

Below the composer, show recent reflections.

Each reflection should show:

- Date
- Visibility pill: `Privat` or `Delt med coach`
- Optional focus area pill
- Reflection text preview/full text
- Discreet more menu for edit/delete

The list should feel like a calm journal, not an analytics feed.

## Editing Model

Use direct field-level inline editing for existing reflections.

Normal state:

- Reflections are readable.
- No permanent edit icons on every text block.
- Visibility and focus links are shown as small pills.

Active edit state:

- Only the selected reflection text enters edit mode.
- Local `Lagre` and `Avbryt` controls appear.
- Visibility can be changed locally.

Delete:

- Use more menu.
- Destructive actions require product confirmation UI.

## Sharing Model

Default visibility should be `Privat`.

The user must make an explicit choice to share with coach.

Visibility copy should be plain:

- `Privat`
- `Del med coach`

Avoid vague labels like `Synlighet` as the primary user-facing choice.

## Must Not Include

- Dashboard metrics
- Progress scoring
- Heavy reflection template by default
- Required multi-question form
- Coach-facing analytics
- Native alert/confirm
- Modal editing for reflection text
- Competing navigation or progress cards
- Old reflection UI rendered below the new surface

## Empty State

If no reflections exist:

`Ingen refleksjoner ennå`

Support text:

`Start med én observasjon fra arbeidshverdagen. Du velger selv om den skal deles med coach.`

Primary action:

`Skriv refleksjon`

## Role Differences

Client view prioritizes:

- Write new reflection
- Keep private or share with coach
- See own reflection history

Coach view prioritizes:

- See only reflections shared with coach
- Understand which focus area a shared reflection relates to

For MVP, coach should never see private reflections.

## Field Mapping

Known existing fields:

- `client_reflections.body` -> reflection text
- `client_reflections.visibility` -> private/shared state
- `client_reflections.development_area_id` -> optional focus relation
- `client_reflections.session_id` -> optional conversation relation, not required in MVP UI
- `client_reflections.action_id` -> optional experiment relation, not required in MVP UI
- `client_reflections.created_at`
- `client_reflections.created_by`

Open decision:

- Whether composer should allow focus-area linking in MVP or after first release.

## Removal List

Implementation must remove from the active render path:

- Dashboard-like reflection metrics.
- Heavy required reflection forms.
- Modal editing for reflection text.
- Native alert/confirm in Refleksjon flow.
- Any UI path where private reflections can be shown to coach.
- Old reflection UI below the new surface.

## Acceptance Criteria

Refleksjon V2 is accepted when:

- The page feels like a simple client reflection room.
- Composer is the primary element.
- Default visibility is private.
- Sharing with coach is explicit.
- Existing reflections are readable and calm.
- Coach sees only shared reflections.
- Reflection text uses inline editing.
- Destructive actions use product confirmation UI.
- No dashboard metrics or progress cards appear.
- Mobile layout is visually checked.

## Test Plan

Manual:

- Load with no reflections.
- Write a private reflection.
- Write a reflection shared with coach.
- Link a reflection to a focus area if enabled.
- Edit reflection text inline.
- Change visibility.
- Delete reflection with confirmation.
- Verify client can see private and shared reflections.
- Verify coach can see only shared reflections.
- Check mobile viewport.

Data:

- Confirm body persists.
- Confirm visibility persists.
- Confirm focus relation persists if enabled.
- Confirm coach cannot retrieve private reflections through UI.

Spaghetti check:

- Search for old reflection render branches.
- Search for duplicate reflection forms.
- Search for modal editing in Refleksjon.
- Search for native alert/confirm in Refleksjon.
- Search for dashboard/progress UI in Refleksjon.
