# Pilotklar V1

Dette dokumentet definerer minste nødvendige pilotpakke for å kunne vise og prøve utviklingsportalen med andre coacher uten å utvide produktscope.

## Kort Konklusjon

Portalen er pilotklar for en kontrollert V1-pilot når den brukes som:

- en felles dokumentasjonsflate for leder og coach
- en struktur for mål og rammer for forløpet, utviklingsfokus, samtaler, refleksjoner og delte ressurser
- en rolig støtte mellom samtaler, ikke et aktivitetskrav

Portalen skal ikke selges som et selvstendig læringssystem, LMS, oppgaveplattform eller komplett coach-CRM i V1.

## Hvem Piloten Passer For

Beste første pilot:

- coacher som allerede jobber tett med lederutviklingsforløp
- klienter som har 3-6 samtaler eller mer
- forløp der dokumentasjon, tydelige mål og oppfølging er viktigere enn høy aktivitet mellom samtalene
- coacher som tåler at produktet fortsatt er smalt og kuratert

Ikke riktig første pilot:

- coacher som trenger tung rapportering, teamoversikter eller kommersiell flercoach-administrasjon
- klienter som forventer et komplett digitalt læringsløp
- forløp der portalen må erstatte coachens egen metode

## Produktløfte

For coach:

Portalen gjør det lettere å holde oversikt over hva som er avtalt, dokumentert og delt i hvert lederutviklingsforløp.

For leder:

Portalen gir ett sted å finne mål og rammer for forløpet, utviklingsfokus, samtaler, egne refleksjoner og relevante ressurser fra coach.

Viktig framing:

Lederen trenger ikke bruke portalen aktivt hele tiden. Det er nok at portalen fungerer som felles hukommelse og støtte når noe skal dokumenteres, deles eller hentes frem.

## Coachens Arbeidsflyt

Før samtale:

1. Åpne klienten.
2. Se `Akkurat nå` for det som er mest relevant i forløpet.
3. Sjekk forløpets mål og utviklingsfokus hvis samtalen trenger kontekst.
4. Åpne relevante samtalenotater eller ressurser ved behov.

Under eller rett etter samtale:

1. Dokumenter samtalen kort.
2. Juster mål, rammer eller utviklingsfokus bare hvis noe faktisk har endret seg.
3. Del en ressurs hvis den støtter det klienten står i nå.
4. Ikke legg inn aktivitet bare for å fylle portalen.

Mellom samtaler:

1. Følg med på klienter med ny aktivitet.
2. Bruk ressursdeling selektivt.
3. Les delte refleksjoner når klienten faktisk har valgt å dele.

## Lederens Arbeidsflyt

Lederen skal forstå tre ting:

1. Her finner jeg det vi har blitt enige om.
2. Her kan jeg skrive ned refleksjoner når det er nyttig.
3. Her ligger ressurser coachen har valgt ut for meg.

Lederen skal ikke oppleve at portalen krever daglig aktivitet, mange skjemaer eller komplett rapportering av alt som skjer.

## Demo Med Peder

Bruk Peder Aas som primær demo-klient.

Demo-fortelling:

1. Start i klientoversikten.
   - Vis at coachen ser nylig aktivitet og kan åpne en klient raskt.

2. Åpne Peder.
   - Vis `Akkurat nå` som enkel oversikt over det som er relevant nå.
   - Poeng: coachen trenger ikke lete i alle faner først.

3. Gå til `Forløpet`.
   - Vis at forløpet har tydelige mål, forventninger og rammer.
   - Ikke selg dette som et stort strategidokument.

4. Gå til `Utviklingsfokus`.
   - Start med ytre prosjekt: lederoppdraget eller utfordringen det er viktigst å lykkes med nå.
   - Vis deretter indre prosjekt: lederkompetansen som må utvikles for å lykkes bedre med det ytre prosjektet.
   - Poeng: konteksten skaper utviklingsbehovet, og eksperimenter omsetter det til praksis.

5. Gå til `Samtaler`.
   - Vis at samtalen kan dokumenteres kort.
   - Poeng: portalen støtter coachens arbeid, den overtar ikke samtalen.

6. Gå til `Ressurser`.
   - Vis at coachen kan dele relevante ressurser med kontekst.
   - Poeng: ressursene er kuratert støtte, ikke et bibliotek klienten må jobbe seg gjennom.

7. Avslutt tilbake på `Akkurat nå`.
   - Vis hvordan hele forløpet samles i en enkel nå-status.

Demo-budskap:

Dette er ikke et system for å skape mer administrasjon. Det er et sted der leder og coach kan samle det viktigste i forløpet.

## Minimum Smoke Før Pilot

Kjør denne manuelt i production før en ekstern pilot:

1. Coach kan logge inn.
2. Coach kan åpne klientoversikt.
3. Coach kan åpne Peder.
4. `Akkurat nå` viser relevant innhold uten tekniske feilmeldinger eller rådata.
5. `Forløpet` åpner og viser eksisterende mål, forventninger og rammer.
6. `Utviklingsfokus` åpner med Ytre prosjekt før Indre prosjekt og viser eksisterende data.
7. `Samtaler` åpner og eksisterende samtalenotater vises.
8. `Ressurser` viser Peder sine delte ressurser.
9. Klientvisning for Peder åpner og viser klientens egne data uten coach-only administrasjonstekst.
10. Ingen smoke- eller testhandlinger gjennomføres på aktive, reelle klienter. Karen er en reell klient og skal ikke brukes til test.

Dette er en pilot-smoke, ikke full QA.

## Go/No-Go For Ekstern Pilot

Go hvis:

- eksisterende klientdata vises stabilt
- coach kan forklare portalen på under tre minutter
- Peder-demoen henger sammen uten unnskyldninger
- ressursene vises både i oversikt og detalj
- ingen klientflate presser brukeren til unødvendig aktivitet

No-go hvis:

- data ser borte ut eller inkonsistent ut
- copy skaper feil forventning om at klienten skal dokumentere alt
- coach ikke forstår hva `Akkurat nå`, `Forløpet`, `Utviklingsfokus`, `Samtaler`, `Refleksjon` og `Ressurser` hver gjør
- ressursdeling eller samtaledokumentasjon feiler

## Første Pilotoppsett

Anbefalt første pilot:

- 1-2 coacher
- 2-4 aktive klientforløp
- 2-4 uker bruk
- kort ukentlig notat fra coach om friksjon, verdi og misforståelser

Mål for pilot:

- avdekke om coachen får bedre oversikt
- avdekke om klienten opplever portalen som støtte, ikke arbeidspress
- se hvilke faner som faktisk brukes
- finne copy og arbeidsflyt som fortsatt skaper usikkerhet

Ikke mål for pilot:

- skalere til mange coacher
- bygge analytics
- bygge avansert ressursbibliotek
- perfeksjonere redaksjonelt design
- automatisere onboarding

## Anbefalt Neste Steg

Kjør pilot-smoke i production med Peder. Karen og andre aktive, reelle klienter skal ikke brukes til test.

Hvis den passerer, bruk Peder-demoen i en intern salgsgjennomgang med en coach. Etter den gjennomgangen bør neste produktbeslutning være om portalen er klar for 1-2 eksterne pilotforløp, eller om én tydelig friksjon må fjernes først.
