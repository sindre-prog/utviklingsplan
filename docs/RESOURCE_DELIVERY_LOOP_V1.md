# Resource Delivery Loop V1

Status: produktkontrakt med godkjent første e-posttekst. Første implementeringsbatch er på branch `product/resource-delivery-loop-v1`. Production krever egen eksplisitt go.

Dette dokumentet definerer neste anbefalte produktspor for Ræder& utviklingsportal. Det erstatter ikke `RESOURCE_LIBRARY_CONTRACT.md`, men presiserer den viktigste verdiløkken etter at ressursbibliotek, deling og klientvisning finnes.

Ingen ny e-posttekst skal implementeres eller sendes i production før teksten er eksplisitt godkjent av bruker. Første ressursvarsel i dette dokumentet er godkjent.

## Problem

Ressursflyten finnes i portalen, men verdien kan lekke mellom handlingene.

Coach kan sende en ressurs med kontekst, og klienten kan se ressursen når klienten er inne i portalen. Men dersom klienten ikke får en tydelig og rolig inngang tilbake til portalen, blir ressursen lett liggende som intern dokumentasjon i stedet for å støtte arbeidet mellom samtaler.

Dette sporet skal derfor gjøre én løkke tydelig:

`Coach sender ressurs -> klient får beskjed -> klient åpner ressurs -> klient kan svare privat eller dele -> coach kan følge opp delt respons`

Dette skal ikke gjøre portalen til et LMS, en oppgaveplattform eller et system for aktivitetsjakt.

## Produktbeslutning

Første versjon skal støtte ressurslevering som en relasjonell og lavmælt oppfølging fra coach, ikke som en oppgave eller kampanje.

Når coach sender en ressurs, skal klienten få en e-post med:

- hvem som har sendt ressursen
- ressursens tittel
- eventuell kort melding fra coach
- én tydelig inngang til portalen
- rolig språk som ikke skaper press

E-posten skal ikke inneholde klientens private refleksjoner, interne coachnotater, statuslogg eller tekniske detaljer.

## Roller

### Coach

Coach trenger å:

- sende en relevant ressurs med kort personlig kontekst
- vite om ressursen er sendt
- se om klienten har åpnet ressursen
- se klientrespons bare når klienten eksplisitt deler den
- kunne følge opp delt respons i neste samtale

En bruker med profilrollen `admin` kan bruke coachflyten når brukeren også har en aktiv coachprofil. Tilgangen følger coachprofilens klienttildelinger; adminrollen gir ikke i seg selv tilgang til å sende ressurser.

### Klient

Klient trenger å:

- forstå at coachen har delt noe relevant
- komme direkte til portalen uten å lete
- oppleve ressursen som støtte, ikke krav
- skrive respons privat som standard
- velge aktivt om responsen deles med coach

## Triggerregler

### Send E-post

E-post kan sendes når:

1. Coach sender en ressurs til en klient for første gang.
2. Coach sender samme ressurs på nytt med ny melding eller ny kontekst, hvis handlingen er eksplisitt presentert som ny deling eller sending på nytt.

### Ikke Send E-post

E-post skal ikke sendes når:

1. Klient åpner en ressurs.
2. Klient lagrer privat respons.
3. Klient redigerer privat respons.
4. Coach åpner klientens ressursstatus.
5. Admin redigerer ressursinnhold.
6. Systemet oppdaterer tekniske statusfelt.
7. En gammel ressursrad reaktiveres uten eksplisitt coachhandling.

### Vurder Senere

Varsel til coach når klient deler respons kan vurderes etter første pilotrunde, men skal ikke inn i første batch.

Begrunnelse: Første mål er å bevise at klienten faktisk får og forstår ressursen. Coach-varsling kan lett gjøre løsningen mer aktivitetsdrevet før vi vet hvordan flyten brukes.

## E-postutkast 1: Ressurs Sendt Til Klient

Status: godkjent for første implementeringsbatch.

### Emne

Din ledercoach har delt en ressurs med deg

### Preheader

Du finner ressursen i utviklingsportalen.

### Brødtekst

Hei {{client_first_name}},

{{coach_name}} har delt en ressurs med deg i utviklingsportalen:

{{resource_title}}

{{coach_note_block}}

Du kan åpne ressursen når det passer. Hvis du ønsker, kan du skrive en egen refleksjon i portalen. Den er privat med mindre du selv velger å dele den med coach.

### CTA

Åpne ressursen

### Footer

Du får denne e-posten fordi du deltar i et coachingforløp hos Ræder&.

## E-postutkast 1A: Coachmelding Finnes

Status: godkjent for første implementeringsbatch.

Denne blokken settes inn som `{{coach_note_block}}` hvis coach har skrevet melding.

### Tekst

Melding fra {{coach_name}}:

{{coach_note}}

## E-postutkast 1B: Ingen Coachmelding

Status: godkjent for første implementeringsbatch.

Denne blokken brukes hvis coach ikke har skrevet melding.

### Tekst

Coachen din har valgt ressursen som støtte i utviklingsarbeidet ditt.

## Lenkemål

Godkjent første lenkemål:

`/?pane=resources` med innlogget redirect til klientens utviklingsplan og `Ressurser`.

Ønsket senere lenkemål:

Direktelenke til delt ressurs når appen trygt kan håndtere ressurs-id i URL uten å eksponere data på tvers av klienter.

Første batch bør ikke blokkere på direktelenke hvis det gir høy teknisk risiko. En trygg portal-CTA er god nok for første pilot.

## Statusmodell

Autoritative statuser i `shared_resources.status`:

- `assigned`: ressursen er sendt, men ikke åpnet
- `viewed`: klienten har åpnet ressursen
- `responded`: klienten har lagret en respons
- `archived`: ressursen er arkivert

Autoritative tidsfelt:

- `shared_at`: når coach sendte eller sendte på nytt
- `viewed_at`: når klient åpnet ressursen
- `responded_at`: når klient lagret respons med innhold

`reflected_at` skal ikke brukes for ressursrespons hvis feltet ikke finnes i datamodellen. Appkode som bruker `reflected_at` for `shared_resources` må ryddes til `responded_at`.

## Resend-Regler

Å sende samme ressurs på nytt må være et produktvalg, ikke bare en teknisk upsert.

Før implementering må UI og database følge samme beslutning:

1. Hvis coach sender samme ressurs i samme kontekst med ny melding, skal dette behandles som `Send på nytt`.
2. `shared_at` bør oppdateres til nytt tidspunkt.
3. `coach_note` bør oppdateres til ny melding.
4. Gammel klientrespons skal ikke slettes uten eksplisitt produktbeslutning.
5. Status skal ikke late som ressursen er uåpnet hvis klienten allerede har åpnet eller svart, med mindre vi bevisst lager en egen resend-status.

Godkjent V1-beslutning:

Bevar gammel respons og status ved resend, men oppdater coachmelding og `shared_at`. Vis e-post som ny beskjed, ikke som ny oppgave.

Hvis det senere trengs full historikk per sending, bør det vurderes egen `resource_delivery_events`-modell. Det er utenfor V1.

## Personvernregler

- Klientrespons er privat som standard.
- Coach kan bare lese klientrespons når `client_visibility = shared_with_coach`.
- Privat respons kan gi generisk livstegn i oversikt, men skal ikke beskrives som konkret innhold.
- E-post til klient skal aldri inneholde privat respons.
- E-post til coach om privat respons skal aldri sendes.
- Adminflyter skal ikke eksponere coachinginnhold mer enn dagens tilgangsmodell tillater.

## Første Implementeringsbatch

Første tekniske batch omfatter:

1. Rydd `reflected_at` til `responded_at` i ressursoversikt og aktivitetslogikk.
2. Avklar og implementer resend-semantikk i `share_resource_with_client_safe`.
3. Legg til én Edge Function for ressurs-e-post, eller utvid eksisterende funksjonsmønster hvis det er tryggere.
4. Kall e-postfunksjonen etter vellykket `shareResourceWithClient`.
5. Vis tydelig coach-feedback etter sending: ressurs sendt, og e-post forsøkt sendt.
6. Håndter e-postfeil uten å rulle tilbake selve ressursdelingen.

## Miljøvariabler For E-post

Edge Function for ressursvarsel krever:

- `RESEND_API_KEY`: API-nøkkel for e-postleverandør.
- `RESOURCE_EMAIL_FROM`: verifisert avsender, for eksempel `Ræder& <...>`.
- `PORTAL_URL`: lenkemål for CTA. Funksjonen legger til `pane=resources` hvis parameteren mangler. Kan falle tilbake til `https://portal.raederog.no?pane=resources`.

Production skal ikke få e-postfunksjonen aktivert før disse er satt og avsender er verifisert.

## Utenfor Første Batch

- Coach-varsling når klient åpner ressurs.
- Coach-varsling når klient lagrer privat respons.
- Full notifikasjonsplattform.
- Ressurspakker, kursløp eller tidsstyrte drypp.
- Avansert aktivitetsfeed.
- Ny hovednavigasjon.
- Ny CRM-modell.
- Ny databasehistorikk for hver e-posthendelse, med mindre implementeringen viser at dette er nødvendig for trygghet.

## Akseptansekriterier

- Første e-posttekst er eksplisitt godkjent før koding.
- Coach kan sende ressurs som før.
- Admin med aktiv coachprofil kan sende til egne tildelte klienter, mens ren admin ikke kan sende.
- Klient mottar én rolig e-post ved ny ressursdeling.
- E-post inneholder ikke sensitivt coachinginnhold utover ressursens tittel og coachens egen melding.
- Klientrespons forblir privat som standard.
- Coach ser delt respons bare når klienten aktivt deler.
- Ressursstatus bruker `responded_at`, ikke et ikke-eksisterende `reflected_at`.
- Sending på nytt har konsistent produkt- og databaseoppførsel.
- Feil ved e-postsending forklares uten å skape dobbeltdeling eller datatap.
- Ingen production-endring gjøres uten egen godkjenning.

## Godkjente Beslutninger

Disse beslutningene er godkjent for første implementeringsbatch:

1. E-postemnet `Din ledercoach har delt en ressurs med deg` er godkjent for første ressursvarsel.
2. Preheader er `Du finner ressursen i utviklingsportalen.`
3. CTA er `Åpne ressursen`.
4. Første lenkemål er generell portal med innlogget redirect til klientens plan og `Ressurser`, ikke direktelenke til ressurs.
5. Coachmelding er valgfri, men sendeflyten bør oppfordre coach til å skrive kort hvorfor ressursen deles.
6. Resend sender ny e-post bare når coach gjør en eksplisitt `Send på nytt`-handling, ikke ved teknisk statusoppdatering.
7. Hvis e-postsending feiler, forblir ressursen delt, og coach får beskjed om at e-post ikke ble sendt.

## Åpne Beslutninger

Disse kan vente til senere batch:

1. Om direktelenke til ressurs skal bygges etter første pilot.
2. Om coach skal varsles når klient eksplisitt deler ressursrespons.
3. Om det trengs egen historikkmodell for hver ressurslevering.
