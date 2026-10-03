# Skisser av dialogene, velgeren for lederkompetanser, innlogging og samtykke – steg 10

Status: godkjent av produkteier 3. oktober 2026, med alle fire beslutninger som foreslått. Ingen synlig endring i portalen.
Grunnlag: `DESIGNSYSTEM_PLAN_DEL2.md` (steg 10–13) og prinsippene og byggeklossene i `DESIGNSYSTEM_PLAN_V1.md`.

Skissene viser hvordan dialogene, velgeren for lederkompetanser, innloggingen og samtykket ser ut når de bygges med de samme byggeklossene som de seks fanene. Når skissene er godkjent, bygges dialogene i steg 11, velgeren i steg 12, og innlogging og samtykke i steg 13.

## Hvordan skissene er laget

Skissene er laget med de ekte byggeklossene i `design-system.css` og hjelpefunksjonene i `app.js`, inne i portalen med fiktive data (`tools/visual-check/sketches.html`). Knappene gjør ingenting.

Fire byggeklosser finnes ikke i portalen ennå. De ligger i `tools/visual-check/sketches.css` og flyttes til `design-system.css` i steg 11:

- **Dialogramme** i fire størrelser: skuff fra høyre (eksperiment), skjemavindu midt på skjermen (coach og admin), lite vindu (bekreft og melding) og stort vindu (velgeren). Alle har tittel øverst, innhold som kan rulles, og knappene nederst. På mobil fyller skuff, skjemavindu og velger hele skjermen.
- **Skjemafelt**: spørsmål, eventuell hjelpetekst og felt, for tekst, dato og nedtrekksliste.
- **Avkrysning** for samtykke og for valg av coach.
- **Innloggingsark**: et smalt ark midt på siden, med logoen øverst til venstre som i toppfeltet.

Bildene ligger i `docs/design-skisser/steg10/`. «i-dag» viser skjermen slik den er nå, og «forslag» viser skissen. Alle forslag finnes i 1440 px. Eksperiment, velgeren, innlogging og samtykke finnes også i 390 px (mobil).

## Felles for alt

- Overtitlene står med vanlige bokstaver, ikke VERSALER. Titlen i en dialog står i Mackinac, som seksjonstitlene i fanene.
- Ikonene i knappene forsvinner, for eksempel lagre-ikonet i «Lagre» og søppelbøtta i «Avslutt». Lukkekrysset blir stående.
- Felt har samme utforming som skrivefeltene i fanene: tynn ramme, mørk ramme når feltet er i bruk og samme skrift.
- Det er én sort knapp per dialog, alltid nederst til høyre. «Avbryt» står ved siden av.
- Bokser i bokser forsvinner. «Knytt til utviklingsarbeidet» og «Se tilbake og juster» blir «Se mer»-felt med en tynn linje over, som i Utviklingsfokus.

## Eksperiment

Bilder: `forslag-eksperiment-ny-1440.png`, `forslag-eksperiment-ny-390.png`, `forslag-eksperiment-rediger-1440.png`, `forslag-eksperiment-se-tilbake-1440.png`, `i-dag-eksperiment-rediger-1440.png` og `i-dag-eksperiment-ny-390.png`.

- Skuffen beholder alle felt, i samme rekkefølge og med de samme spørsmålene.
- Hjelpeteksten «Gjør forsøket lite nok til å prøve i en faktisk situasjon.» står under spørsmålet, over feltet, som i samtaleplanen.
- «Hvor skal du prøve det?» og «Når vil du se tilbake?» står side om side. «Status» får egen linje når man redigerer.
- «Avslutt eksperiment» er en tekstknapp nederst i «Se tilbake og juster», som i dag.

## Skjemavinduet for coach og admin

Bilder: `forslag-inviter-klient-1440.png` og `i-dag-inviter-klient-1440.png`.

- Samme felt som i dag. «Stilling» og «Arbeidsgiver» står side om side.
- «Coach(er)» blir en liste med avkrysning (se beslutning 3).
- Samme ramme brukes for «Rediger klient», «Inviter coach» og «Rediger coach».

## Bekreft og melding

Bilder: `forslag-bekreft-1440.png`, `forslag-bekreft-slett-1440.png`, `forslag-melding-1440.png` og `i-dag-bekreft-1440.png`.

- Lite vindu med tittel, tekst og knapper.
- Hovedknappen er sort når noe arkiveres eller avsluttes, og rød bare når noe slettes for godt (se beslutning 1).
- Meldinger har bare tittel, tekst og «OK».

## Velgeren for lederkompetanser

Bilder: `forslag-bibliotek-1440.png`, `forslag-bibliotek-390.png`, `forslag-bibliotek-kompetanse-390.png` og `i-dag-bibliotek-1440.png`.

- Listen har samme utforming som listene i fanene: tittel og to linjer beskrivelse, og valgt rad har mørk stripe. Ikonene i sirkel og pilene forsvinner.
- Status står som prikk og ord på raden: «Prioritert nå», «Aktiv» eller «Foreslått av coach».
- Til høyre står kompetansen med samme oppsett som en lederkompetanse i Utviklingsfokus: utviklingsområde, tittel, engelsk navn og beskrivelse.
- «Relevant når» og «Skille mot nærliggende kompetanser» står side om side som vanlig tekst, uten bokser og ikoner.
- «Se mer» har samme innhold som i dag.
- «Velg denne kompetansen» står én gang, nederst i vinduet, med «Valget kan endres senere.» ved siden av (se beslutning 2). Knappen skifter tekst som i dag («Allerede aktiv», «Foreslå for klienten» og så videre).
- På mobil vises listen først. Når man trykker på en kompetanse, åpnes den med «Til biblioteket» øverst og knappen nederst, som i dag.

## Innlogging

Bilder: `forslag-innlogging-1440.png`, `forslag-innlogging-390.png`, `forslag-nytt-passord-1440.png`, `forslag-ny-tilkobling-1440.png` og `i-dag-innlogging-1440.png`.

- Samme felt, ord og rekkefølge som i dag.
- Personvernteksten blir en stille sitatlinje, «Personvern», i stedet for en grå boks med ikon. Teksten er den samme.
- «Sett passord» og «Portalen kunne ikke åpnes» får samme ark.

## Samtykke

Bilder: `forslag-samtykke-1440.png`, `forslag-samtykke-390.png` og `i-dag-samtykke-1440.png`.

- Teksten om personvern og samtykke er flyttet ordrett.
- De tre punktene står som en enkel liste med tittel og tekst, i stedet for tre bokser med ikon.
- Avkrysningen står alene under en tynn linje, uten farget boks.
- «Samtykk og åpne portalen» er grå til man har krysset av (se beslutning 4).

## Ord

Skissene bruker bare ord som finnes i portalen i dag. Disse ordene forsvinner:

- «Status» som overtittel i meldinger, og «Bekreft sletting» som overtittel når ingen annen overtittel er gitt.
- «Du må bekrefte punktene før du kan starte.» i samtykket (se beslutning 4).
- «Velg denne kompetansen» som knapp nummer to i velgeren (se beslutning 2).

«52 av 52 lederkompetanser · 2 aktive · én prioritert nå» er de to tekstene fra i dag satt sammen på én linje.

## Beslutninger for produkteier

Alle fire er godkjent som foreslått.

1. **Rød knapp bare for sletting som ikke kan angres.** I dag er hovedknappen rød med søppelbøtte i alle bekreftelser, også når noe bare arkiveres eller avsluttes og blir liggende i historikken. Prinsippet om tre farger med mening sier at sort er hovedhandling. Vi foreslår sort for «Arkiver» og «Avslutt», og rød bare for «Slett», for eksempel når en fil fjernes fra en ressurs.
2. **Én «Velg denne kompetansen» i velgeren.** I dag står knappen både øverst og nederst. Prinsippet er én primærknapp per side. Vi foreslår at den står nederst i vinduet, der den alltid er synlig, også på mobil.
3. **Avkrysning for coach i skjemavinduet.** I dag er «Coach(er)» en liste der man må holde Ctrl eller Cmd for å velge flere. Det er lett å gjøre feil. Vi foreslår en liste med avkrysning. Det som lagres, er det samme.
4. **«Samtykk og åpne portalen» er grå til man har krysset av.** I dag kan man trykke på knappen og får da en feilmelding. Vi foreslår at knappen er grå til avkrysningen er gjort, som «Lagre refleksjon» er grå til det står noe i feltet. Det som lagres, og når det lagres, er det samme.

## Hva steg 11–13 innebærer

- **Steg 11, dialogene:** Skjemavinduet, skuffen, bekreft og melding i `index.html` får dialogrammen. `renderSpec` lager skjemafelt fra byggeklossene, slik at alle skjemaer følger med. Feltene, navnene på dem og det som lagres, er uendret. CSS for `.modal-*`, `.drawer-*`, `.confirm-*`, `.choice-*`, `.checkbox-*` og eksperimentskuffen slettes.
- **Steg 12, velgeren:** `competencyChooserLayout`, `competencyBrowserRow` og `competencyPreview` bygges med byggeklossene. Søk, filter, statuser og regelen om at klienten velger og coachen foreslår er uendret. CSS for `.competency-chooser*`, `.competency-browser*` og `.competency-preview*` slettes.
- **Steg 13, innlogging og samtykke:** Skjermene i `index.html` og `renderConsentGate` får innloggingsarket og avkrysningen. Innlogging, nytt passord, glemt passord og lagring av samtykke virker som i dag. CSS for `.auth-*`, `.privacy-note` og `.consent-*` slettes.
- Ingen steg endrer data, tilgangsregler eller databasefunksjoner.
