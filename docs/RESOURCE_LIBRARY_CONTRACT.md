# Ressursbibliotek V1

Dette dokumentet definerer ressursbiblioteket som produktkontrakt. Det er ikke en implementeringsplan og ikke appkode.

## Produktbeslutning

Ressursbiblioteket skal være et coachingverktøy, ikke en filbank.

Primærverdien er ikke at coach og klient kan finne dokumenter. Primærverdien er at coach kan sende riktig ressurs til riktig klient i riktig kontekst, og at ressursen kan støtte arbeidet mellom samtaler.

Kjernelogikk:

`Coach finner ressurs -> coach sender med kontekst -> klient bruker ressurs -> klient kan reflektere/dele -> coach følger opp i samtale`

Ressurser skal kunne kobles til:

- klient
- coachingprogram
- fokusområde
- samtale
- eksperiment
- refleksjon

Ressursbiblioteket skal støtte den eksisterende løkken:

`Retning -> Fokus -> Praksiseksperiment -> Observasjon -> Samtale -> Refleksjon -> Justering`

Det skal ikke innføres en ny hovedfane i klientens arbeidsflyt i V1.

## Roller

### Coach

Coach trenger å kunne:

- finne relevant ressurs raskt
- forstå når ressursen bør brukes
- sende ressurs til klient
- legge ved kort personlig instruks
- knytte ressursen til fokusområde, samtale eller eksperiment
- se om klienten har åpnet eller svart på ressursen
- følge opp ressursen i neste samtale

### Klient

Klient trenger å kunne:

- se ressurser coachen har sendt
- forstå hvorfor ressursen er sendt
- åpne og bruke ressursen uten administrasjon
- lagre egen respons eller arkivere ressursen
- velge hva som deles tilbake med coach

Klient skal ikke få et stort generelt bibliotek dumpet inn i portalen i V1.

### Admin / fagansvarlig

Admin trenger å kunne:

- opprette og redigere ressurser
- tagge og kategorisere ressurser
- laste opp eller koble til filer, lyd, video og illustrasjoner
- styre publiseringsstatus
- kvalitetssikre språk, design og faglig presisjon

## Ressursobjekt

En ressurs er et faglig verktøy som kan brukes i coachingarbeidet.

Ressurstype er ikke det samme som filformat.

Eksempler:

- `template` -> mal
- `exercise` -> øvelse
- `reflection` -> refleksjonsoppgave
- `framework` -> modell eller rammeverk
- `worksheet` -> utfyllbart arbeidsark
- `article` -> kort fagtekst
- `audio` -> lydfil
- `video` -> video
- `guided_session` -> strukturert samtale- eller arbeidsøkt
- `assessment` -> kartlegging eller egenvurdering

Format beskriver hvordan ressursen leveres:

- `native`
- `pdf`
- `audio`
- `video`
- `external_link`
- `downloadable_asset`

PDF skal være tillegg, ikke fundament. Ressurser bør i hovedsak kunne presenteres som native innhold i portalen.

## Foreslått Datamodell

Alle tabell- og feltnavn skal være engelske. Ikke bland norsk og engelsk i database-schema.

### Phase vs Context

`phase` og `context_type` betyr ikke det samme.

`phase` beskriver ressursens anbefalte faglige plassering i coachingløpet:

- `direction`
- `focus`
- `experiment`
- `observation`
- `session`
- `reflection`
- `adjustment`

`context_type` beskriver hvor ressursen faktisk er koblet når coach sender den til klient:

- `program`
- `focus_area`
- `session`
- `experiment`
- `reflection`

Eksempel:

En ressurs kan ha `phase = reflection`, men sendes med `context_type = session` fordi coach ønsker at klienten reflekterer etter en konkret samtale.

Ikke bland ressursens faglige plassering med konkret delingskontekst.

### `resources`

Selve ressursen.

Felter:

- `id`
- `title`
- `slug`
- `summary`
- `type`
- `format`
- `phase`
- `estimated_duration`
- `difficulty`
- `language`
- `thumbnail_url`
- `cover_image_url`
- `illustration_url`
- `content_json`
- `intended_outcome`
- `best_used_when`
- `coach_guidance`
- `visibility`
- `status`
- `created_by`
- `created_at`
- `updated_by`
- `updated_at`
- `archived_at`

Status:

- `draft`
- `published`
- `archived`

Visibility:

- `internal`
- `coach`
- `client_assignable`

`content_json` skal støtte strukturert presentasjon fra start. Ikke lag én stor `content_body` hvis ressursene senere skal ha blokker.

Eksempel:

```json
[
  { "type": "intro", "content": "..." },
  { "type": "section", "heading": "...", "content": "..." },
  { "type": "question", "content": "..." },
  { "type": "reflection_field", "label": "..." },
  { "type": "download", "file_id": "..." }
]
```

Blokkene er presentasjon i V1, ikke avansert egen logikk.

### `resource_tags`

Tags skal være flate, ikke mapper i mapper.

Eksempler:

- stress
- prioritering
- selvledelse
- kommunikasjon
- konflikter
- grensesetting
- førstegangsleder
- emosjonell regulering
- feedback
- teamledelse
- beslutninger
- robusthet

### `resource_files`

Ressurser kan ha flere filer. Ikke lås datamodellen til én `file_url`.

Felter:

- `id`
- `resource_id`
- `file_type`
- `storage_path`
- `display_name`
- `sort_order`
- `created_by`
- `created_at`

`file_type` kan være:

- `pdf`
- `audio`
- `video`
- `image`
- `illustration`
- `attachment`
- `external_link`

Lagre `storage_path`, ikke bare public URL. Generer signed URL når bruker faktisk skal åpne en privat fil.

Private klientressurser skal ikke gjøres offentlig tilgjengelige via public URL.

### `shared_resources`

Koblingen mellom ressurs, coach, klient og coachingkontekst.

Dette er produktets viktigste tabell for faktisk coachingverdi.

Felter:

- `id`
- `resource_id`
- `client_id`
- `program_id`
- `shared_by`
- `shared_at`
- `context_type`
- `context_id`
- `coach_note`
- `due_at`
- `status`
- `viewed_at`
- `responded_at`
- `archived_at`
- `client_note`
- `client_visibility`

`context_type` kan være:

- `program`
- `focus_area`
- `session`
- `experiment`
- `reflection`

Status:

- `assigned`
- `viewed`
- `responded`
- `archived`

Klientens notat eller respons skal ikke automatisk deles med coach. Deling må være eksplisitt.

Ressursinnhold skal ikke dupliseres per klient. `shared_resources` peker til `resources`. Klientspesifikt innhold bor kun i `shared_resources`.

## Coachflyt V1

Coach skal kunne sende ressurs fra tre steder:

1. Klientprofil / programoversikt
2. Fokusområde
3. Samtale

I V1 bør handlingen hete:

`Send ressurs`

Foreslått flyt:

1. Coach klikker `Send ressurs`.
2. Drawer åpnes.
3. Coach søker eller filtrerer.
4. Coach velger én ressurs.
5. Coach legger til kort instruks.
6. Coach velger eventuell kobling: fokusområde, samtale eller eksperiment.
7. Coach sender.
8. Klient får ressursen under `Ressurser fra coach`.

Dette skal bruke drawer, ikke modal, fordi coach skal beholde klientkonteksten.

Drawer skal bruke eksisterende UI-mønstre for søk, kort, preview, knapper og feilvisning. Ikke bygg en egen modal- eller popup-modell for ressursdeling.

## Klientflyt V1

Klient skal se en enkel seksjon:

`Ressurser fra coach`

Ressurskort bør vise:

- tittel
- type
- estimert tid
- kort instruks fra coach
- koblet kontekst
- status
- primærhandling: `Åpne`

Status i UI bør være rolig og coachingnær:

- `Ikke åpnet`
- `Åpnet`
- `Svart`
- `Arkivert`

Klientens ressursvisning bør ha:

- cover eller illustrasjon
- tittel
- ingress
- hvorfor coach har sendt den
- innhold
- eventuell nedlasting
- eventuell refleksjon eller utfylling
- synlig delingsvalg

Standard skal være privat respons. Klient velger eksplisitt hva som deles med coach.

Klient skal bare se ressurser som er delt med vedkommende. Klient skal ikke kunne åpne eller søke i hele ressursbiblioteket i V1.

## Søk Og Filtrering

Coach må kunne finne ressurser med lav friksjon.

Første versjon trenger:

- fritekstsøk
- type
- tema/tag
- format
- estimert tid
- fase i coachingløpet

Senere kan dette utvides med:

- ledernivå
- intensitet
- individuell/team
- evidensnivå
- rolle eller bransje

Ikke bygg avansert filtrering før ressursmengden gjør det nødvendig.

## Visuell Standard

Ressurser skal se ut som gjennomarbeidede faglige produkter, ikke opplastede vedlegg.

Hver ressurs bør kunne ha:

- coverbilde eller illustrasjon
- visuelt hierarki
- tydelig type og varighet
- god spacing
- lesbar typografi
- relevant faglig grafikk, modell eller diagram
- eventuell utskriftsvennlig eller nedlastbar variant

Visuell retning:

- Material 3-prinsipper i portalens UI
- hvit base
- sterke farger kun som aksent
- illustrasjon brukes for å skape gjenkjennelse og kvalitet, ikke dekorstøy
- ressursinnhold kan ha mer redaksjonell kvalitet enn appens arbeidsflater

Kvalitetskrav:

- En ressurs skal kunne oppleves som noe coach trygt kan sende til en toppleder.
- Illustrasjoner og modeller skal være integrert i ressursens faglige poeng.
- Ingen ressurs skal se ut som et tilfeldig vedlegg i et kort.

## Designbeslutninger For V1

Land designmønstre før implementering, men ikke overdesign.

Ressursbiblioteket skal bruke eksisterende designsystem og tokens. Ikke introduser et nytt visuelt system for bibliotek, lister, drawers, admin eller klientens ressursliste.

Skillet mellom app-UI og ressurs-UI:

- bibliotek, lister, drawers og admin følger portalens Material/workspace-system
- selve ressursvisningen kan ha mer redaksjonell kvalitet
- ressursvisningen skal fortsatt bruke samme typografi-, token- og spacing-prinsipper som portalen

Ressurser skal ikke få egen klient-hovedfane i V1. De skal vises der de er relevante i eksisterende coachingflyt, og samlet som `Ressurser fra coach` for klient.

### `ResourceCard`

Skal brukes i coachbibliotek og klientens ressursliste.

Samme komponent bør støtte to moduser:

- `library`: coach søker etter og velger ressurs
- `assigned`: klient eller coach ser en delt ressurs med status og kontekst

Må vise:

- tittel
- type
- estimert tid
- phase eller tag
- kort summary
- status der relevant
- primærhandling

### `SendResourceDrawer`

Skal brukes når coach sender ressurs.

Drawer, ikke modal. Coach skal beholde klientkonteksten i bakgrunnen.

Flyt:

1. søk/filter
2. velg ressurs
3. preview
4. legg til `coach_note`
5. velg `context_type` og `context_id`
6. send

### `ResourcePreview`

Coach skal kunne forstå ressursen før den sendes.

Må vise:

- title
- summary
- best_used_when
- intended_outcome
- coach_guidance
- type, format og duration
- eventuell preview av innhold

### `ClientResourceList`

Klienten skal ikke få et generelt bibliotek.

Vis bare `Ressurser fra coach`.

Må vise:

- ressurs
- hvorfor coach har sendt den
- koblet kontekst
- status
- åpne-knapp

### `ClientResourceView`

Skal føles mer redaksjonell enn appens arbeidsflater, men fortsatt høre hjemme i portalen.

Må være rolig, lesbar og tillitvekkende.

Må vise:

- cover eller illustrasjon hvis finnes
- tittel
- ingress
- `coach_note`
- ressursinnhold
- eventuelle nedlastinger
- privat refleksjonsfelt
- eksplisitt valg for å dele refleksjon med coach

### `SharedResourceStatus`

Ikke lag LMS-følelse.

Bruk nøkterne statuser:

- `Sendt`
- `Åpnet`
- `Svart`
- `Arkivert`

### Adminflate

Admin skal være praktisk, ikke polert.

Prioriter:

- liste
- ny ressurs
- rediger
- status
- tags
- enkel preview

### Mønstre Som Skal Gjenbrukes

Bruk eksisterende:

- cards
- drawer
- buttons
- inputs
- tabs hvis allerede etablert
- typography
- spacing
- design tokens
- toast/dialog-mønstre for feil og bekreftelser

Ikke bruk native alert/confirm.

Design-akseptanse:

Når V1 er ferdig, skal det visuelt være åpenbart at ressursbiblioteket tilhører portalen, men ressursvisningen for klient skal oppleves mer gjennomarbeidet og faglig enn en vanlig appside.

## Innholdsmodell

Ressursinnhold bør kunne bygges med blokker.

Minimum:

- intro
- tekstseksjon
- punktliste
- spørsmål
- modell/illustrasjon
- nedlastbar fil
- refleksjonsfelt
- avslutning / neste handling

Blokker må være presentasjon, ikke egen datalogikk i V1.

Ikke bygg en full editor før behovet er bevist. Start med kontrollert innholdsmodell og gode maler.

V1 skal ha en enkel renderer for blokktypene som faktisk brukes. Ikke bygg en generisk content engine, LMS-motor eller full blokkbygger.

## Eksempler På Ressurser

### Retning

- Mandatkort
- Forventningskontrakt
- Interessentkart
- Målavklaring

### Fokusområder

- Lederkompass
- Verdikort
- Prioriteringsrammeverk
- Situasjonsanalyse

### Eksperimenter

- Atferdseksperiment-mal
- Observasjonsoppdrag
- Vanekart
- Kognitiv huskeliste

### Samtaler

- Samtaleforberedelse
- Oppsummeringsnotat
- Vanskelige samtaler
- 1:1-samtaleguide

### Refleksjon

- Refleksjonsjournal
- Etter samtalen
- Hva la du merke til?
- Videre utviklingsplan

## Ikke Bygg I V1

Ikke bygg:

- femte hovedfane for klientens coachingflyt
- mappehierarki
- full læringsplattform
- full CMS-editor
- AI-anbefalinger
- avansert analytics
- åpne klientbibliotek med alt innhold
- filbank som primærmodell
- dupliserte ressurskopier per klient
- collections, læringsløp eller pakker
- ordering, nesting, progression eller collection ownership

Dette kan komme senere, men V1 skal bevise kjerneflyten.

## MVP

MVP bør inneholde:

1. Ressursmetadata.
2. Publiserte ressurser.
3. Søk og enkel filtrering for coach.
4. `Send ressurs` fra klient/program, fokusområde og samtale.
5. Personlig instruks fra coach.
6. Klientseksjon: `Ressurser fra coach`.
7. Åpne ressurs.
8. Lagre privat respons eller arkiver ressurs.
9. Valgfri privat respons fra klient.
10. Eksplisitt deling av respons med coach.
11. 1-3 seed/demo-ressurser som viser riktig struktur.

## V2

V2 kan vurdere:

- collections / pakker
- programløp
- tidsstyrt deling
- ressursforslag basert på fokusområde
- ressursmaler med utfyllbare felter
- coachens egne favoritter
- bruksmåling
- AI-støttet anbefaling

## Akseptansekriterier For Første Implementering

- Ressurs kan opprettes og publiseres uten å duplisere innhold.
- Coach kan sende ressurs til klient med instruks.
- Ressursdeling lagres som egen historikk.
- Klient kan se ressursen uten å få tilgang til hele biblioteket.
- Klientrespons er privat som standard.
- Coach kan se status for sendt ressurs.
- Ressurs kan knyttes til fokusområde eller samtale.
- UI bruker eksisterende drawer- og kortmønstre.
- Ingen native alert/confirm.
- Ingen ny hovednavigasjon i klientens coachingflyt.

## Engineering Hygiene

Disse reglene gjelder før implementering. De skal hindre at ressursbiblioteket blir blandet tilfeldig inn i eksisterende kode.

### Featurestruktur

All ressurslogikk skal ligge samlet i én tydelig feature-struktur som passer faktisk repo.

Ikke spre resource-logikk i mange generelle mapper før mønsteret er stabilt.

Hvis repoet får en feature-struktur, bør den følge denne logikken:

```text
resources/
  components/
  server/
  queries/
  mutations/
  types/
  schemas/
  utils/
```

Tilpass mappenavn til faktisk kodebase. Ikke innfør `src/features/...` blindt hvis repoet ikke bruker det.

### Database Og Migrations

- Bruk stabile engelske tabell- og feltnavn.
- Schema-endringer skal gjøres som migrations.
- Ikke gjør manuelle Supabase Studio-endringer som ikke finnes i repoet.
- Bruk enum-typer eller check constraints for `status`, `visibility`, `type`, `format`, `context_type` og `phase`.
- Ikke lag midlertidige kolonner som `temp_url`, `misc`, `data`, `notes2` eller `old_status`.

### Database-Modell vs UI-Modell

Databasefelter skal ikke formes direkte etter første UI.

Lag egne mapping- eller query-funksjoner der det trengs.

Eksempler på funksjoner:

- `getResources`
- `getResourceById`
- `createResource`
- `shareResourceWithClient`
- `getClientSharedResources`

Supabase-kall skal ikke spres tilfeldig i komponenter eller render-funksjoner.

### RLS Og Sikkerhet

RLS skal bygges før UI.

Ikke stol på at UI skjuler data.

Regler:

- Klient skal aldri kunne lese hele ressursbiblioteket.
- Klient skal bare kunne se ressurser via `shared_resources` som tilhører klienten.
- Coach skal bare kunne dele med klienter coachen har tilgang til.
- Admin/fagansvarlig skal kunne administrere ressursbiblioteket.
- Klientnotat er privat med mindre klient eksplisitt deler det med coach.
- Private filer skal åpnes via signed URL, ikke public URL.

### Filer

- Ikke lås en ressurs til én `file_url`.
- Bruk `resource_files` når ressursen kan ha flere filer.
- Lagre `storage_path`.
- Generer signed URL når filen åpnes.
- Ikke gjør private klientressurser offentlig tilgjengelige.

### Audit Og Sletting

Sentrale tabeller skal ha:

- `created_by`
- `created_at`
- `updated_by`
- `updated_at`
- `archived_at`

`shared_resources` skal ha:

- `shared_by`
- `shared_at`

Faginnhold skal ikke slettes fysisk i normal flyt. Bruk `archived` status.

Fysisk sletting kan eventuelt komme senere som admin-only ved feilopprettelse.

### Validering

Valider input med Zod eller tilsvarende hvis stacken støtter det.

Særlig:

- `content_json`
- resource type
- status
- phase
- context_type
- deling med klient
- client visibility

### Seed Og Pilotinnhold

Lag 1-3 seed/demo-ressurser først.

Ikke importer 50 ressurser før datamodellen, renderer og delingsflyten sitter.

Seed-ressursene skal vise:

- strukturert `content_json`
- minst én illustrasjon eller modell
- ressurs uten fil
- ressurs med fil
- ressurs som kan sendes til klient

### Komponentnavn

Komponentnavn skal være presise.

Gode navn:

- `ResourceCard`
- `ResourcePreviewDrawer`
- `SendResourceDrawer`
- `SharedResourceStatus`
- `ClientResourceView`

Dårlige navn:

- `Card2`
- `NewModal`
- `ResourceThing`
- `TestComponent`

### Dokumentasjon Før Ferdigmelding

Når V1 implementeres, skal teknisk oppsummering dokumentere:

- hvilke tabeller som er lagt til
- hvilke RLS-regler som gjelder
- hvilke sider eller ruter som er laget
- hvordan man tester coach -> klient flyten
- kjente begrensninger

Hvis noe er uklart, dokumenter det som TODO i teknisk oppsummering. Ikke lag raske prod-fikser i schema.

### Hygiene-Akseptanse

Etter V1 skal en ny utvikler kunne forstå:

- hvor ressursbiblioteket ligger i koden
- hvilke tabeller som styrer flyten
- hvordan tilgang fungerer
- hvordan man legger til ny ressurs
- hvordan man feilsøker deling

## Anbefalt Byggerekkefølge

1. Datamodell, migrations, RLS og typer.
2. Admin CRUD for ressurser med enkel `content_json` og status.
3. Coachbibliotek med søk, filter og preview.
4. `Send ressurs` fra klient/program, fokusområde og samtale med `coach_note` og kontekst.
5. Klientvisning av sendte ressurser, åpning av ressurs, privat respons og eksplisitt deling.
6. Statusvisning for coach og visuell polish.

Ikke bygg AI, analytics, full editor, collections, læringsløp eller avansert progresjon i V1.

## Åpne Beslutninger Før Kode

- Skal `content_json` være JSONB med enkel intern schema-validering, eller skal første batch starte med et statisk seed-format?
- Skal første versjon støtte opplasting til Supabase Storage, eller kun manuelt seedede `resource_files`?
- Skal admin kunne redigere ressurser i portalen i V1, eller importeres ressurser manuelt?
- Skal klient kunne laste ned alle ressurser som PDF, eller bare utvalgte?
- Skal ressursstatus være synlig for klient, coach eller begge?
- Hvilke 10-15 ressurser skal være pilotinnhold?
