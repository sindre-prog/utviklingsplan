# Leader Development Plan V1

This document defines the product logic for the first implementation of leadership development plans.

It was originally written before implementation and now acts as the contract for the first competency-based version.

## Source Boundary

The attached CCL/Compass screenshots are treated as product reference material, not implementation instructions.

Use them to understand:

- The competency-based leadership development model.
- The repeated structure used for each competency.
- The distinction between desired behavior, obstacles, self-coaching, immediate improvement, development opportunities, and activities.

Do not copy long passages, checklists, or book text verbatim into the app unless the organization has explicit rights to use that material. The portal should use original Norwegian wording, licensed content, or short internally authored summaries inspired by the structure.

## Product Decision

The existing technical foundation should not be scrapped.

Keep:

- Static app structure.
- Supabase auth, RLS, Storage, and RPC patterns.
- Client/coach/admin role model.
- Invitation and profile verification flow.
- Private/shared reflection logic.
- Resource library and safe resource sharing.
- Existing visual direction and Material 3-inspired CSS.

Replace or heavily refactor:

- The current generic development-plan process.
- The current Retning/Fokusomrader meaning if it remains too broad.
- The hidden-form-as-primary-state pattern for leadership development work.
- Any UI that makes the plan feel like a generic CMS instead of a guided leadership process.

## Core Idea

The development plan should become a guided leadership development process.

Instead of asking leaders to invent focus areas from a blank page, the app helps them choose and work with leadership competencies. Each chosen competency becomes a practical development track with goals, situations, obstacles, experiments, feedback, and reflection.

The user-facing promise:

> Choose the leadership competencies that matter most now, define what better leadership looks like in your context, practice in real situations, and learn from feedback over time.

## Proposed Mental Model

### Old Model

`Retning -> Fokusomrader -> Samtaler -> Refleksjon`

This model is serviceable, but broad. It can support many coaching forms, but it does not strongly guide a leader toward specific leadership behavior.

### New Model

`Lederkontekst -> Kompetanser -> Praksis -> Samtaler -> Refleksjon`

Alternative Norwegian tab labels:

- `Kontekst`
- `Kompetanser`
- `Praksis`
- `Samtaler`
- `Refleksjon`

If we want less navigation change, the current tabs can be remapped:

- `Retning` becomes `Lederkontekst`.
- `Fokusområder` becomes `Kompetanser`.
- `Eksperimenter` become more visible inside the competency track.
- `Samtaler` and `Refleksjon` remain.

## Competency Library

The system should include a structured leadership competency library.

Each competency should have:

- Stable id.
- Display title in Norwegian.
- Optional English source title.
- Category.
- Short description.
- High-performance signals.
- Common obstacles or derailers.
- Self-coaching prompts.
- Suggested practices.
- Development opportunities.
- Related resource tags.

The screenshots indicate a broad competency universe, including examples such as:

- Communication.
- Influence.
- Learning Agility.
- Self-Awareness.
- Change Acceptance.
- Change Implementation.
- Coach and Develop Others.
- Conflict Resolution.
- Courage.
- Decision Making.
- Delegating.
- Feedback.
- Flexibility.
- Interpersonal Savvy.
- Leading with Purpose.
- Problem Solving.
- Relationship Management.
- Resilience.
- Risk Taking.
- Self-Development.
- Strategic Alignment.
- Strategic Planning and Implementation.
- Systems Thinking.
- Team Leadership.
- Time Management.
- Tolerating Ambiguity.
- Trust.
- Vision.
- Working through Others.

The library should also support derailers, for example difficulty adapting to change, difficulty leading teams, failure to meet business objectives, weak strategic orientation, and relationship problems.

## Suggested Categories

### Foundation

Basic leadership capabilities that shape most development plans.

- Communication.
- Influence.
- Self-Awareness.
- Learning Agility.

### People And Relationships

Capabilities related to trust, collaboration, feedback, conflict, and people development.

- Feedback.
- Delegating.
- Coach and Develop Others.
- Conflict Resolution.
- Compassion and Sensitivity.
- Interpersonal Savvy.
- Relationship Management.
- Team Leadership.
- Trust.

### Execution And Direction

Capabilities related to decision-making, strategy, business impact, and follow-through.

- Decision Making.
- Problem Solving.
- Business Development.
- Strategic Alignment.
- Strategic Planning and Implementation.
- Vision.
- Working through Others.
- Time Management.

### Change And Complexity

Capabilities related to ambiguity, change, innovation, systems, and adaptation.

- Change Acceptance.
- Change Implementation.
- Flexibility.
- Innovation.
- Risk Taking.
- Systems Thinking.
- Tolerating Ambiguity.

### Identity And Culture

Capabilities related to executive presence, culture, purpose, inclusion, and organizational understanding.

- Executive Image.
- Difference, Diversity, Inclusion.
- Engagement.
- Leading the Culture.
- Leading with Purpose.
- Organizational Savvy.
- Global Perspective.

### Derailers

Risks that can undermine leadership effectiveness.

- Difficulty Adapting to Change.
- Difficulty Building and Leading Teams.
- Failure to Meet Business Objectives.
- Lacking a Broad Strategic Orientation.
- Problems with Interpersonal Relationships.

## Competency Track Structure

Each selected competency should become a track in the leader's plan.

### 1. Why This Matters Now

User job:

The leader and coach define why this competency matters in the current role and business context.

Fields:

- `Hvorfor denne kompetansen nå?`
- `Hva står på spill hvis dette ikke utvikles?`
- `Hvem påvirkes av dette?`

### 2. What Stronger Leadership Looks Like

User job:

Translate the competency into observable leadership behavior.

Fields:

- `Hva vil du gjøre mer av?`
- `Hva vil andre kunne se eller høre?`
- `Hva vil bli annerledes i møter, beslutninger eller samarbeid?`

### 3. What Gets In The Way

User job:

Identify patterns, fears, context, habits, or organizational constraints that block progress.

Fields:

- `Hva står i veien?`
- `Når skjer dette oftest?`
- `Hvilke mønstre vil du være særlig oppmerksom på?`

### 4. Practice Situations

User job:

Choose real situations where the leader can practice.

Fields:

- `Situasjon`
- `Hvem er involvert?`
- `Hva skal prøves?`
- `Hva skal observeres?`
- `Når skal det evalueres?`

These should map to first-class experiments, not free text only.

### 5. Feedback And Evidence

User job:

Define how progress will be observed beyond self-perception.

Fields:

- `Hvem kan gi feedback?`
- `Hva skal du spørre om?`
- `Hvilke tegn på effekt ser du etter?`
- `Hva lærte du av feedbacken?`

### 6. Reflection

User job:

Capture learning during the process.

Fields:

- `Hva skjedde?`
- `Hva la du merke til hos deg selv?`
- `Hva la du merke til hos andre?`
- `Hva vil du justere neste gang?`

Private remains default. Client chooses what is shared with coach.

## New User Flow

### Step 1: Establish Leadership Context

The first screen should ask for practical leadership context, not generic coaching purpose.

Suggested fields:

- `Rolle og ansvar`
- `Viktigste lederutfordring akkurat nå`
- `Hvem leder du eller påvirker du?`
- `Hva trenger organisasjonen mer av fra deg?`
- `Hva ønsker du at andre skal merke om 8-12 uker?`

This can use existing `coaching_programs` fields initially, but the wording should change.

### Step 2: Choose Competencies

The leader chooses 1-3 competencies.

Selection should support:

- Search.
- Category filters.
- Suggested starting set.
- Coach recommendation.
- Client self-selection.
- Optional derailer warnings.

Do not show a flat list of 50+ equal choices as the primary UI. That will feel overwhelming.

### Step 3: Define Development Goals

For each selected competency, the leader writes one development goal.

A good goal should include:

- Competency.
- Real leadership situation.
- Desired observable behavior.
- Evidence of progress.
- Time horizon.

Example structure:

`I [situasjon] vil jeg øve på [kompetanse] ved å [konkret atferd], slik at [ønsket effekt]. Jeg vet det virker når [observerbart tegn].`

### Step 4: Create Experiments

The app turns goals into small experiments.

Each experiment should answer:

- `Hva skal testes?`
- `I hvilken situasjon?`
- `Hva skal observeres?`
- `Hvem kan gi feedback?`
- `Når ser vi tilbake?`

This reuses the current `session_actions` concept, but the UI should call it practical leadership experiments.

### Step 5: Use Conversations To Review Practice

Samtaler should become review points for competency development.

Each conversation should show:

- Active competencies.
- Active experiments.
- Recent reflections.
- Feedback collected.
- What to adjust next.

Do not make Samtaler the place where all development data is born. It should help the coach and client review and decide.

### Step 6: Reflect Between Conversations

Reflections should be attachable to:

- Whole program.
- Competency.
- Experiment.
- Conversation.

Default visibility remains private.

## Data Model Proposal

The current tables can support a first version, but a clean model will need new first-class objects.

### Keep Existing Tables

- `coaching_programs`
- `development_areas`
- `coaching_sessions`
- `session_actions`
- `client_reflections`
- `resources`
- `shared_resources`

### Add Competency Library

Suggested table: `leadership_competencies`

Columns:

- `id`
- `slug`
- `title_no`
- `title_en`
- `category`
- `summary`
- `source`
- `sort_order`
- `is_active`
- `content_json`
- `created_at`
- `updated_at`

`content_json` can hold authored blocks for:

- high performance signals.
- common obstacles.
- coaching prompts.
- improve-now suggestions.
- development opportunities.

### Add Selected Competencies

Suggested table: `program_competencies`

Columns:

- `id`
- `program_id`
- `competency_id`
- `status`
- `priority`
- `why_now`
- `desired_behavior`
- `current_pattern`
- `obstacles`
- `progress_signs`
- `feedback_plan`
- `created_at`
- `updated_at`

This becomes the replacement for generic focus areas over time.

### Link Existing Objects

Add optional links:

- `session_actions.program_competency_id`
- `client_reflections.program_competency_id`
- `shared_resources.program_competency_id`

Keep `development_area_id` temporarily for backward compatibility.

### Migration Strategy

Existing `development_areas` can be migrated or displayed as legacy focus areas.

Recommended:

1. Add new tables without removing old fields.
2. Introduce competency-based UI for new programs.
3. Keep old focus-area UI behind a legacy path or read-only migration surface.
4. Later migrate old `development_areas` into custom competencies or archived focus notes.

## Resource Library Integration

Resources should become competency-aware.

Add or use tags such as:

- `competency:communication`
- `competency:feedback`
- `competency:delegating`
- `derailer:relationship-problems`

When a coach sends a resource, the send flow should allow:

- Whole program.
- Selected competency.
- Experiment.
- Conversation.

The client should see why the resource was sent, but only if the coach actually wrote a real message.

## UI Direction

The new flow should feel guided and professional, not like a course library.

### First Client Experience

A client opening the plan should see:

- Their leadership context.
- The 1-3 competencies currently in focus.
- Active practice experiments.
- Latest reflection prompt or next review point.

Avoid:

- Blank dashboards.
- Generic progress cards.
- Huge competency grids as the first screen.
- Long textbook-style content as the main experience.

### Competency Selection

Recommended pattern:

- Left: category/search.
- Middle: competency list.
- Right: selected competency preview.

Preview should show original, short authored summaries:

- `Dette handler om`
- `Typisk synlig i`
- `Kan være viktig hvis`
- `Mulige tegn på utvikling`

### Competency Detail

Recommended pattern:

- Header with competency, category, status, priority.
- Work fields in a calm two-column layout.
- Active experiments below.
- Related resources in a side rail or lower section.

No card-inside-card layout.

### Coach View

Coach should see:

- Why each competency was chosen.
- Whether the goal is observable enough.
- Which experiments are active.
- What feedback/evidence exists.
- Suggested resource matches.

Coach should not see private reflections unless shared.

### Client View

Client should see:

- What they are practicing.
- Where they will practice it.
- What to notice.
- What is private.
- What has been shared with coach.

The language should feel personal and concrete, not evaluative.

## What To Remove Or Downgrade

Remove from the new main process:

- Generic focus-area language as the central object.
- Hidden fields as the primary state mechanism for new competency data.
- Modal editing for core development fields.
- Long all-at-once forms.
- Duplicated intro/coach-message text.
- Any admin visibility into private client reflections.

Downgrade:

- Existing `development_areas` becomes a legacy compatibility object unless mapped to competencies.
- Existing Retning fields become context fields, not the main development engine.

Keep:

- Conversations.
- Reflections.
- Experiments.
- Resource sharing.
- Role-based visibility.

## Implementation Packages

### Package 1: Product Contract

Approve:

- Final tab model.
- Competency category list.
- Minimum competency content fields.
- Whether `development_areas` remains visible for old programs.
- Whether the first version supports custom competencies.

Deliverables:

- Final screen contracts.
- Field mapping.
- Migration plan.

### Package 2: Data Foundation

Add:

- `leadership_competencies`
- `program_competencies`
- Optional links from experiments, reflections, and shared resources.

Seed:

- A small pilot set of competencies.
- No copyrighted long-form CCL text.

### Package 3: Competency Library UI

Build:

- Competency browser.
- Category filters.
- Competency preview.
- Select/remove priority handling.

### Package 4: Program Competency Workspace

Build:

- Competency detail surface.
- Inline editing.
- Practice situations.
- Experiment creation from competency.
- Feedback/evidence fields.

### Package 5: Conversation Integration

Build:

- Conversation review of active competencies.
- Convert next step into competency-linked experiment.
- Show recent shared reflections and feedback.

### Package 6: Resource Integration

Build:

- Competency tags in resources.
- Resource recommendations by selected competency.
- Send resource linked to competency.
- Client resource view grouped by competency.

### Package 7: Legacy Migration

Build:

- Mapping from old focus areas to competency tracks or custom legacy tracks.
- Read-only fallback for old plans where needed.
- Admin audit view for migration state.

## Open Decisions

1. Should the main navigation labels change now, or should we keep the current labels and change the meaning underneath first?

2. Should clients self-select competencies, coaches recommend them, or should both be supported from day one?

3. Should the first pilot include all visible CCL-style competencies, or only a curated set of 8-12?

4. Should custom competencies be allowed, or should all development tracks start from the library?

5. Should derailers be visible to clients, or only used as coach/admin guidance?

6. Should resource recommendations be manual only in the first version, or auto-suggested by competency tags?

7. Should old `development_areas` be migrated automatically, or preserved as legacy notes until manually reviewed?

## Recommended First Build

Start with a narrow pilot:

- Keep the existing app shell and roles.
- Add competency library tables.
- Seed 8-12 original, Norwegian competency summaries.
- Add selected competencies per program.
- Replace Fokusomrader for new programs with `Kompetanser`.
- Keep Samtaler and Refleksjon mostly intact, but allow linking to selected competency.
- Do not migrate all old data automatically yet.

This gives the portal a new leadership-development spine without risking auth, privacy, resources, or the existing deployment model.
