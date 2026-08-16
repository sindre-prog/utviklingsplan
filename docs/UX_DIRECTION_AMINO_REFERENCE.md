# UX Direction: Amino Reference

This document captures UI/UX direction from the Amino screenshots.

The screenshots are reference material, not instructions to copy Amino's product, brand, content, or exact visual design. Use them to improve consistency, density, hierarchy, and interaction quality in the Raeder leadership development portal.

## What Works In The Reference

### Calm App Shell

The top navigation is simple, stable, and low-friction:

- Logo on the left.
- Primary nav as short text labels.
- Active nav state shown with a soft filled pill.
- Utility icons on the right.
- Clear horizontal divider between app chrome and content.

For Raeder:

- Keep the app shell quiet and predictable.
- Avoid heavy dashboard framing around every view.
- Make the current area obvious without adding a second competing navigation system.

### Generous But Controlled Layout

The pages use a centered content frame with generous margins, then divide content into clear columns where useful.

For Raeder:

- Use one main content width per screen.
- Use two-column layouts only when there is a real master/detail or summary/detail job.
- Keep form flows focused in a single large surface rather than many small floating cards.
- Make mobile collapse predictable: primary content first, support content below.

### Card And List Consistency

Amino uses a small number of repeated containers:

- Large feature card.
- Row list card.
- Section card with clear header and rows.
- Selection row with checkbox.
- Pill/chip input.

For Raeder:

- Standardize repeated object rows for clients, competencies, resources, experiments, sessions, and reflections.
- Prefer list rows for scannable actions.
- Use cards for bounded objects, not for every page section.
- Avoid nested cards inside cards.

### Strong Primary Action

The primary action is large, clear, and visually stable.

For Raeder:

- Each main workflow should have one obvious primary action.
- Primary action labels should be concrete: `Velg kompetanse`, `Lag praksisforsøk`, `Lagre`, `Send ressurs`.
- Secondary actions should be quieter and not compete with the main action.

### Soft Status And Category Language

The reference uses color-coded statuses and categories without making the page feel noisy.

For Raeder:

- Use restrained color for status, not decoration.
- Green remains success/progress.
- Warm accent may be used for selected/active states.
- Avoid lavender-heavy borders and large gradients.
- Use clear labels, not technical values.

### Progressive Detail

The reference reveals detail by opening rows, navigating to detail, or switching tabs.

For Raeder:

- Do not show every detail at once.
- Use summary rows for competencies, experiments, resources, and sessions.
- Open one selected item in detail.
- Keep the user's place stable when editing or switching selected items.

## Application To Leadership Development

### Home Or First Experience

The first screen for a leader should show:

- Current leadership context.
- Selected competencies.
- Active practice experiments.
- Next useful action.
- Recent shared resources or reflection prompt.

Avoid:

- A generic marketing hero.
- A blank CMS-like workspace.
- Four or five equal panels with unclear priority.

### Competency Selection

Use a large focused selection surface:

- Header: what the leader is choosing and why.
- Search/category controls.
- Rows or chips for competencies.
- Selected items visible as clear pills.
- Sticky or stable `Lagre` action when the flow is long.

Selection rows should feel like the Amino checkbox rows:

- Large tap target.
- Clear active border.
- Check indicator.
- No tiny controls that make mobile hard.

### Competency Workspace

Use a two-column master/detail layout where appropriate:

- Left: selected competency tracks as concise rows.
- Right: selected competency detail, including goal, obstacles, experiments, and feedback.

On mobile:

- Selected competency list first.
- Detail opens below or as a focused view.

### Resource And Reflection Lists

Use list cards with row dividers:

- Title.
- Short summary.
- Status/visibility chip.
- Chevron or clear open action.

Do not duplicate the same text as both intro and coach note.

### Editing

The editing model should be consistent:

- Field-level inline editing for core development content.
- Large row selection for multi-choice setup flows.
- Drawer for bounded creation/editing of experiments and admin/resource operations.
- Product confirmation dialog for destructive actions.

Avoid:

- Modal editing for core Retning/Kompetanse fields.
- Page jumps after creating or editing.
- Multiple unrelated edit patterns on the same screen.

## Typography

Display font:

- `p22-mackinac-pro`
- Loaded via `https://use.typekit.net/ynv7fqd.css`

Usage:

- `h1`, `h2`, and `h3` should use the display font.
- Body text and controls should remain readable sans-serif.
- Compact labels, badges, inputs, buttons, and table text should use the body font.

Font weights:

- Use available Typekit weights: `400` and `700`.
- Avoid synthetic display weights such as `500` and `750` for headings where possible.

## Visual Rules

Use:

- Off-white page background.
- White cards and panels.
- Subtle borders.
- Moderate radius.
- Clear row dividers.
- Large tap targets.
- Calm spacing.

Avoid:

- Decorative gradient backgrounds.
- Overuse of colored cards.
- Nested panels.
- Tiny controls.
- Layout shifts during editing.
- Multiple styles for the same control role.

## Acceptance Criteria For New Screens

A new or rebuilt screen should pass these checks:

- One clear primary job.
- One clear primary action.
- Repeated rows share one visual pattern.
- Selection states are obvious.
- Text hierarchy is consistent.
- H1/H2/H3 use `p22-mackinac-pro`.
- Body/control text remains easy to read.
- Mobile layout does not overlap or jump.
- No technical values are shown to clients.
- Private/shared state is explicit where relevant.
