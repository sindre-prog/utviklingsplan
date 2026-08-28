# Skjermkontrakt: lederkompetanser og felles eksperimenter V2

Status: godkjent produktretning for isolert implementasjon. Denne kontrakten presiserer eldre Fokusområder V2 der de overlapper.

## Begrepsgrense

- Forløpet beskriver mål, forventninger og rammer for coachingsamarbeidet. Det er utgangspunktet, ikke et fjerde utviklingsobjekt.
- Ytre prosjekt er lederoppdraget eller utfordringen det er viktigst å lykkes med i den aktuelle jobbkonteksten, konkretisert som et Fokusoppdrag.
- Indre prosjekt er lederkompetansen klienten må utvikle for å bli bedre i stand til å levere på det ytre prosjektet.
- Prøv i praksis er broen mellom indre og ytre prosjekt, konkretisert som et eksperiment.
- Kompetanse er en indre utviklingslinse.
- Fokusoppdrag er et ytre prosjekt, en leveranse eller en kontekstuell utfordring.
- Eksperiment er et konkret atferdsforsøk som kan koble kompetanse til arbeid.
- Nye Fokusoppdrag opprettes som `outer`. Eksisterende `inner` og `both` bevares uendret som legacy.

Den synlige modellen i klientens utviklingsflate er:

`Forløpet -> Ytre prosjekt -> Indre prosjekt -> Prøv i praksis`

Begrepene skal alltid vises med den konkrete objekttypen i nærheten: `Indre prosjekt · Lederkompetanse`, `Ytre prosjekt · Fokusoppdrag` og `Prøv i praksis · Eksperiment`. Klienten skal ikke måtte utlede forholdet mellom to parallelle begrepssett.

## Skjermlogikk

- Hovedfanen heter fortsatt `Utviklingsfokus`; modellen oppretter ingen ny hovednavigasjon.
- Forløpets mål vises som et separat, unummerert utgangspunkt foran de tre arbeidstrinnene, med teksten `Utgangspunkt · Forløpets mål` og spørsmålet `Hva skal utviklingsløpet bidra til?`. Den skal ikke se ut som et fjerde undertab, og åpner eksisterende Forløpet-flate.
- De tre arbeidstrinnene er én tablist i fast rekkefølge: Ytre prosjekt, Indre prosjekt og Prøv i praksis.
- Hvert trinn viser ett beslutningsspørsmål, objekttypen og antall aktive objekter når antallet er større enn null.
- På mobil stables Forløpets mål og arbeidstrinnene vertikalt uten horisontal rulling.
- Klienten eier valg og prioritering av indre prosjekt. Coachen kan foreslå en lederkompetanse, men ikke aktivere den på klientens vegne.
- Ytre prosjekter og eksperimenter bruker eksisterende redigerings- og tilgangsregler; denne modellen endrer ikke datakontrakten.
- Når arbeidsplanen for et ytre prosjekt er komplett, leder neste steg til Indre prosjekt dersom ingen aktiv lederkompetanse er valgt. Først når et indre prosjekt finnes, leder flyten videre til et praksiseksperiment.

Beslutningsspørsmålene er:

- Ytre prosjekt: `Hva er viktigst å lykkes med i jobben nå?`
- Indre prosjekt: `Hva må du utvikle for å lykkes bedre med det?`
- Prøv i praksis: `Hva vil du prøve i praksis?`

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
