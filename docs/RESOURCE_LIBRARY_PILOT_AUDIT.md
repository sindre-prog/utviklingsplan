# Ressursbibliotek Pilot Audit

Dette er en audit av `RESOURCE_LIBRARY_PILOT_CONTENT.md` før implementering.

## Konklusjon

Pilotinnholdet er godt nok til å gå videre til teknisk batch 1: datamodell, migrations, RLS og seed-struktur.

De tre ressursene tester nok variasjon til V1:

- `ABCDE-modellen` tester refleksjon, kognitiv modell og samtale-/refleksjonskontekst.
- `Kontrollsirkelen` tester fokusområde, enkel modell og lavterskel refleksjon.
- `Å akseptere frykt` tester eksperimentfase, guidet øvelse og sterkere faglige avgrensninger.

## Produktfunn

### Styrker

- Ressursene dekker tre ulike faser: `reflection`, `focus`, `experiment`.
- Alle tre har tydelig `suggested_coach_note`, som gjør `Send ressurs`-flyten testbar.
- Alle tre kan vises både som coach preview og klientressurs.
- Alle tre har `default_context_types`, slik at kontekstkobling kan testes uten å gjette.

### Justert Før Kode

- Pilotressursene manglet `visibility` og `status`. Dette er nå lagt til som `client_assignable` og `published`.
- `files` var bare filnavn. Dette er nå endret til seedbare `resource_files`-objekter med `file_type`, `storage_path`, `display_name` og `sort_order`.

## Fagfunn

### Styrker

- Språket er direkte til klienten og i hovedsak rolig.
- Ressursene beskriver mønstre og handlinger, ikke identitet.
- `not_for` er viktig og tydelig, særlig for ABCDE og fryktressursen.
- Coach guidance begrenser terapeutisk overtolkning ved å holde fokus på konkrete situasjoner og observerbar atferd.

### Risiko Å Følge Med På

- `ABCDE-modellen` og `Å akseptere frykt` ligger tett på terapeutiske tradisjoner. Dette er akseptabelt for pilot fordi `not_for`, `basis` og `coach_guidance` setter grenser.
- I UI bør disse ressursene presenteres som refleksjons- og utviklingsverktøy, ikke behandling eller psykisk helsehjelp.

## Teknisk Seedbarhet

### Styrker

- YAML-blokkene validerer.
- Alle ressurser har stabil `slug`.
- `content_json` bruker et lite sett blokktyper:
  - `intro`
  - `illustration`
  - `text`
  - `worksheet`
  - `reflection_questions`
- Disse blokktypene er nok for første renderer.

### Første Renderer Bør Støtte

- introblokk
- illustrasjonsblokk med `key`
- tekstblokk med `heading` og `content`
- worksheetblokk med liste av felt
- refleksjonsspørsmål med liste av spørsmål

Renderer skal ikke gjøre worksheetfeltene til avansert skjema i første batch. De kan vises som strukturerte prompts inntil lagring av utfylling er definert.

## Aksept For Å Gå Videre

Neste arbeidspakke kan starte med:

1. database-migrations
2. RLS
3. seed-format basert på pilotinnholdet
4. enkel resource renderer

Ikke bygg admin CRUD, AI, analytics, collections eller generell klientbibliotektilgang i neste steg.
