# Skjermkontrakt: lederkompetanser og felles eksperimenter V2

Status: godkjent produktretning for isolert implementasjon. Denne kontrakten presiserer eldre Fokusområder V2 der de overlapper.

## Begrepsgrense

- Kompetanse er en indre utviklingslinse.
- Fokusoppdrag er et ytre prosjekt, en leveranse eller en kontekstuell utfordring.
- Eksperiment er et konkret atferdsforsøk som kan koble kompetanse til arbeid.
- Nye Fokusoppdrag opprettes som `outer`. Eksisterende `inner` og `both` bevares uendret som legacy.

## Aktiv kompetansemodell

- Klienten kan ha ett `Hovedfokus` (`priority = 1`).
- Klienten kan ha inntil to `Støttende kompetanser` (`priority = 2/3`).
- En coach kan opprette `Foreslått av coach` (`status = suggested`, `priority = 0`).
- Forslaget blir ikke aktivt før klienten velger det.
- Kompetansespor arkiveres; eksperiment- og læringshistorikk slettes ikke når sporet tas ut av aktiv plan.

## Bibliotek

Desktop:

1. Søk og kategorifilter ligger over en liste med 52 kompetanser.
2. Valgt rad åpner full faglig beslutningsstøtte i forhåndsvisningen.
3. Forhåndsvisningen viser definisjon, Relevant når og Skille mot først.
4. God praksis, for lite, for mye, barrierer, praksisforslag, effekt og refleksjon følger med rolig, progressiv struktur.
5. Klientens CTA er `Velg denne kompetansen`; coachens er `Foreslå for klienten`.

Mobil:

1. Liste og forhåndsvisning er to forståelige tilstander i samme fullskjermsdialog.
2. `Til biblioteket` går tilbake til søk og filter uten å miste tilstand.
3. Valg-CTA finnes i forhåndsvisningen uten å dekke innholdet.

## Kompetansearbeidsflate

Masterlisten viser én rad som `Hovedfokus` og inntil to som `Støttende kompetanse`. Planstatus uttrykkes med ord, aldri prosent.

Detaljflaten består av:

1. Kompakt kompetansereferanse: navn, engelsk navn, kategori og definisjon.
2. Utviklingshypotese:
   - Hvorfor nå?
   - Hva vil du gjøre annerledes?
   - Hva gjør du i dag?
   - Hva kan stå i veien?
3. Planstatus: `Ikke påbegynt`, `Under arbeid` eller `Klar til å prøves`.
4. Separat praksis- og læringsdel med aktive eksperimenter og historikk.
5. Faglig innhold på forespørsel, ikke permanent kopiert inn i arbeidsflaten.

`Klar til å prøves` betyr bare at utviklingsfokuset er konkret nok. Det betyr ikke at kompetansen er fullført.

## Felles eksperiment

Alle eksperimenter bruker `session_actions`. Opprettelsen spør bare om:

- Hva skal du prøve? (`description.action`)
- Hvor skal du prøve det? (`description.arena` og eventuelt `development_area_id`)
- Hva skal du se etter? (`description.signals`)
- Når vil du se tilbake? (`due_date`)

Eksperimentet kan samtidig ha `program_competency_id` og `development_area_id`, bare én av dem eller ingen. `session_id` er en ekstra opprinnelseskontekst.

Ved senere redigering blir observasjon, effekt, læring og neste justering tilgjengelig. Statusene er `planned`, `active`, `reviewed`, `continued` og `closed`.

## Felles arbeidsflate

`Alle eksperimenter` er en kryssgående arbeidsflate under Fokus, men ikke en tredje likestilt fokustype eller en ny hovednavigasjon.

- `Aktive` viser `planned` og `active`.
- `Historikk` viser `reviewed`, `continued` og `closed`.
- Filter: alle koblinger, kompetanse, Fokusoppdrag, begge eller uten kobling.
- Kompetanse- og Fokusoppdrag-detaljer viser både aktive forsøk og historikk i egen praksisdel.

## Innholdskontrakt

Tabellkolonnene er fortsatt autoritative for navn, kategori og definisjon (`title_no`, `title_en`, `category`, `summary`). Klientnormaliseringen eksponerer navnene som `name_no` og `name_en`, uten å duplisere data i databasen. `content_json` V2 inneholder:

```json
{
  "schema_version": 2,
  "relevant_when": "Kort beslutningsstøtte",
  "distinction": "Skille mot nærliggende kompetanser",
  "best_practice": {
    "success": [],
    "underuse": [],
    "overuse": []
  },
  "barriers": [],
  "practice": {
    "experiment": "Et lite startforsøk",
    "effect": "Et observerbart tegn"
  },
  "reflection": []
}
```

Arraylengder kan variere, også til null. Legacy-nøkler beholdes i JSON og normaliseres i klienten.

## Tekniske grenser

- Statisk HTML/JS/CSS og dagens Supabase-tilgang beholdes.
- Klienten eier aktivering og prioritering i en databasetrigger/RPC, ikke bare i UI.
- Coach kan redigere arbeidsinnhold der dagens programtilgang tillater det, men kan ikke endre status eller prioritet på en aktiv kompetanse.
- Komposittfremmednøkler hindrer nye eksperimentkoblinger på tvers av programmer. De legges til `NOT VALID` slik at eventuell legacy-data ikke omskrives automatisk.
- Ingen nye eksperimenttabeller eller parallelle payloads opprettes.
