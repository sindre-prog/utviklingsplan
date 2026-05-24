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
- se om klienten har åpnet eller fullført ressursen
- følge opp ressursen i neste samtale

### Klient

Klient trenger å kunne:

- se ressurser coachen har sendt
- forstå hvorfor ressursen er sendt
- åpne og bruke ressursen uten administrasjon
- markere ressurs som ferdig eller lagre egen respons
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
- `content_body`
- `file_url`
- `audio_url`
- `video_url`
- `external_url`
- `visibility`
- `status`
- `created_by`
- `created_at`
- `updated_at`

Status:

- `draft`
- `published`
- `archived`

Visibility:

- `internal`
- `coach`
- `client_assignable`

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

### `resource_collections`

Kuraterte pakker.

Eksempler:

- Første 90 dager som leder
- Stressmestring for ledere
- Vanskelige samtaler
- Retning og mandat
- Selvledelse i press

En collection er en presentasjons- og kurateringsstruktur. Den skal ikke duplisere ressursinnhold.

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
- `completed_at`
- `client_note`
- `client_visibility`

`context_type` kan være:

- `program`
- `direction`
- `focus_area`
- `session`
- `experiment`
- `reflection`

Status:

- `assigned`
- `viewed`
- `in_progress`
- `completed`
- `skipped`

Klientens notat eller respons skal ikke automatisk deles med coach. Deling må være eksplisitt.

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
8. Marker ferdig.
9. Valgfri privat respons fra klient.
10. Eksplisitt deling av respons med coach.

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

## Åpne Beslutninger Før Kode

- Skal ressursinnhold lagres som Markdown, JSON-blokker eller enkel rich text?
- Skal første versjon støtte opplasting til Supabase Storage, eller kun URL-er til eksisterende filer?
- Skal admin kunne redigere ressurser i portalen i V1, eller importeres ressurser manuelt?
- Skal klient kunne laste ned alle ressurser som PDF, eller bare utvalgte?
- Skal ressursstatus være synlig for klient, coach eller begge?
- Hvilke 10-15 ressurser skal være pilotinnhold?

