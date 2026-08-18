# Skjermkontrakt: kompetanseinnhold og samtaleintegrasjon V3

Status: implementert på isolert feature-branch. Overstyrer V2 der innhold, refleksjonskobling og Samtaler berøres.

## Brukerflyt

```text
Utforsk kompetanse
  -> les definisjon, Relevant når og Skille mot
  -> åpne Se mer ved behov
  -> velg som Hovedfokus eller Støttende kompetanse
  -> konkretiser utviklingshypotesen
  -> opprett ett lite eksperiment i session_actions
  -> observer, lær og juster
  -> ta delt refleksjon og læring med inn i neste samtale
```

Samtalen oppretter ikke en parallell utviklingsplan. Den samler relevant kontekst før klient og coach velger neste forsøk.

## Innholdsspråk

Dagens korte norske innhold er stilnormen. Det faglig reviderte dokumentet brukes som QA- og kompletteringsgrunnlag, ikke som erstatningscopy.

- `Når lykkes du?` beskriver god, observerbar bruk. Alle punkter begynner med `Når du ...`.
- `Når du bruker kompetansen for lite` beskriver konkret fravær eller tilbakeholdt praksis. Alle punkter begynner med `Når du ...`.
- `Når du bruker kompetansen for mye eller i feil situasjon` beskriver overstyrke, feil tidspunkt eller feil kontekst. Alle punkter begynner med `Når du ...`.
- `Hva kan stå i veien?` beskriver gjenkjennelige hypoteser, aldri diagnoser. Alle punkter skrives direkte til lederen med `Du ...`.
- Ett punkt skal bære ett atferdspoeng. Punktantall varierer med faglig behov.
- Punktene innen samme kompetanse skal dekke ulike dimensjoner og ikke gjenta hverandre.
- Gode eksisterende formuleringer beholdes.

`Se mer` er progressiv inngang til gode grep, mulige feilgrep og barrierer. Underliggende faginnhold skal ikke dominere førstevalget.

## Bibliotek

```text
+-------------------------+--------------------------------+
| Søk + kategori          | Kompetansenavn                 |
|                         | Definisjon                     |
| 52 kompetanser          | Relevant når                   |
| [valgt rad]             | Skille mot ...                |
|                         |                                |
|                         | [Se mer]                       |
|                         | Prøv i praksis                 |
|                         | Faglig grunnlag                |
|                         | [Velg / Foreslå]               |
+-------------------------+--------------------------------+
```

Kompetansenavn som inngår i `Skille mot nærliggende kompetanser`, fremheves typografisk. Markeringen bygges med tekstnoder og `strong`, ikke rå HTML.

Kildenoten skal være nøktern: rammen tar utgangspunkt i CCL Compass, mens norske beskrivelser og utviklingsgrep er selvstendig bearbeidet med støtte i forskning og praksis. Produktet skal ikke gi inntrykk av å være et psykometrisk verktøy eller offisielt CCL-innhold.

## Samtaler

```text
+----------------------------------------------------------+
| Samtalegrunnlag                                          |
|                                                          |
| Aktive kompetanser       | Delt refleksjon og læring     |
| Hovedfokus               | Delte klientrefleksjoner      |
| Støttende kompetanser    | Avleste eksperimenter         |
|                                                          |
|                         [Åpne kompetanser]                |
+----------------------------------------------------------+
| Samtaleplan og eksperimenter fra samtalen                |
+----------------------------------------------------------+
```

- Samtalegrunnlaget viser Hovedfokus først og deretter Støttende kompetanser.
- Private klientrefleksjoner vises aldri i samtalegrunnlaget. Bare `visibility = shared_with_coach` tas med.
- Relevant læring leses fra eksisterende `session_actions`.
- `Gjør til eksperiment` bruker den samme opprettelsesflaten som resten av løsningen og forhåndsvelger Hovedfokus. Brukeren kan endre eller fjerne koblingen før lagring.
- En refleksjon kan kobles til Fokusoppdrag, kompetanse, begge eller ingen.

På mobil stables de to panelene. Ingen ny hovednavigasjon eller egen samtale-/kompetansemodell innføres.

## Datakontrakt

Autoritative tabellkolonner for navn og definisjon beholdes. `content_json` V3 har denne konseptuelle formen:

```json
{
  "schema_version": 3,
  "relevant_when": "Kort beslutningsstøtte",
  "distinction": "Avgrensning mot nærliggende kompetanser",
  "best_practice": {
    "success": [],
    "underuse": [],
    "overuse": []
  },
  "barriers": [],
  "practice": {
    "experiment": "Ett lite startforsøk",
    "effect": "Ett observerbart tegn"
  },
  "reflection": []
}
```

Arraylengder varierer. Legacy-nøkler bevares ved JSON-merge i migrasjonen.

Eksperimenter forblir ett felles objekt i `session_actions`:

- `program_competency_id` kobler til kompetanse.
- `development_area_id` kobler til Fokusoppdrag.
- `session_id` angir eventuell samtaleopprinnelse.
- alle tre koblinger er valgfrie innen eksisterende integritetsgrenser.
- observasjon, effekt, læring og neste justering ligger i den versjonerte `description`-payloaden.

Refleksjoner gjenbruker eksisterende `client_reflections.program_competency_id` og `development_area_id`. Ingen ny tabell er nødvendig.

## Tekniske grenser

- Statisk HTML, CSS og JavaScript beholdes.
- Eksisterende Supabase-klient, RLS og programgrenser beholdes.
- Nye refleksjonskoblinger til kompetanse og Fokusoppdrag må tilhøre samme program; komposittfremmednøkler legges til som `NOT VALID` for å bevare legacy-rader.
- Ingen automatisk konvertering av legacy Fokusoppdrag.
- Ingen privat refleksjon gjøres synlig for coach gjennom klientlogikk.
- Ingen parallell eksperimenttabell, kompetanseeksperiment eller samtaleeksperiment opprettes.
- Produksjonsmigrering og deploy krever egen godkjenning etter visuell QA.

## Akseptansekriterier

- Alle 52 aktive kompetanser har V3-kontrakt.
- Alle fire punktseksjoner finnes og består strukturell språkvalidering.
- `Relevant når` og gode eksisterende tekster er bevart.
- Innholdsmigrasjonen kan kjøres flere ganger uten å duplisere data.
- Biblioteket bruker `Se mer`, viser faglig grunnlag og fremhever kjente kompetansenavn i avgrensningen.
- Samtaler viser aktive kompetanser, bare delte refleksjoner og læring fra felles eksperimentmodell.
- Opprettelse fra samtale skriver fortsatt til `session_actions`.
- Aktiv og avsluttet eksperimenthistorikk forblir synlig på relevante flater.
- Desktop og mobil er visuelt kontrollert før produksjonssetting.
