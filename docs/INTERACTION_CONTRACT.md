# Interaction Contract

This contract is the implementation boundary for shared editing patterns in the coaching portal.

## Core Rules

1. Core coaching content is edited inline at field level.
2. One field can be actively edited at a time.
3. Larger bounded objects use the shared drawer.
4. Destructive choices use the shared confirm dialog.
5. Native `alert()` and `confirm()` are not allowed in V2 core flows.
6. Screen-specific editing widgets should not be created unless the shared pattern cannot support the job.

## Inline Editing

Use inline editing for the main work surfaces:

- Forløp fields.
- Ytre prosjekt fields.
- Indre prosjekt fields.
- Samtale fields.
- Refleksjon body and visibility.

Required behavior:

- Read state looks like content, not a form.
- Clicking the field opens editing for that field only.
- Local `Lagre` and `Avbryt` controls live next to the field being edited.
- Unsaved changes must be handled before changing tab or active field.

## Calm Saving

Saving core client work must preserve the user's place in the portal.

Required behavior:

- Show `Lagrer …` followed by `Lagret` while a write is in progress.
- Preserve the active main tab, active subview, selected object and scroll position.
- Update the active pane from the local program cache after ordinary field edits.
- Do not replace the whole workspace with a loading skeleton after a successful inline save.
- Fetch the program again in the background only when server-created identity or related server state is required, such as after creating a new conversation, focus assignment, reflection or experiment.
- Background refreshes update only the active pane and must not move the user to the top of the page.

## Drawer

Use the shared drawer for bounded objects that need more than one or two fields:

- Create experiment.
- Edit experiment.
- Future: create experiment from `Mulig neste steg`.

Required behavior:

- The drawer keeps the current screen in context.
- The drawer must not become a generic replacement for inline editing.
- The drawer has local save, cancel and optional destructive action.

## Dialogs

Dialogs are limited to:

- Destructive confirmation.
- Short system feedback when inline or drawer feedback is not available.
- Administrative flows such as invite client or invite coach.

Dialogs are not allowed for:

- Editing Forløp.
- Editing ytre or indre projects.
- Editing Samtaler.
- Editing Refleksjon.

## Current Shared Components

- `openEntityModal`: legacy/admin modal for bounded administrative forms.
- `openEntityDrawer`: shared drawer for experiment creation/editing.
- `confirmDelete`: shared destructive confirmation dialog.
- `showAppMessage`: shared non-native feedback dialog for errors that cannot be placed inline.

## Acceptance Criteria

- No `window.confirm`, bare `confirm`, or `alert` calls remain in `app.js`.
- Experiment creation and editing use `openEntityDrawer`.
- Destructive actions use `confirmDelete`.
- Supabase write errors are surfaced instead of silently ignored.
- New screen work reuses these primitives instead of creating one-off patterns.
