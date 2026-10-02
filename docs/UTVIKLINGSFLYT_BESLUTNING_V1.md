# Beslutningsnotat: utviklingsflyten V1

Status: utkast til godkjenning. Ingen kode, skjerm eller kontrakt endres før notatet er godkjent.

## Hensikt

Klienten skal slippe å holde sitt utviklingsfokus i en notatblokk. Portalen skal være stedet der klienten finner igjen hva forløpet skal bidra til, hva som er viktigst å lykkes med i jobben nå, hvilke lederkompetanser klienten utvikler, og hva som prøves i praksis.

Portalen er felles hukommelse og støtte mellom samtalene, ikke et aktivitetskrav (`PILOT_READY_V1.md`).

## Modellen

Den synlige modellen er uendret:

`Forløpet -> Ytre prosjekt -> Indre prosjekt -> Prøv i praksis`

Rekkefølgen er faglig begrunnet:

1. `Forløpet` avklarer mål og rammer mellom coach og klient.
2. `Ytre prosjekt · Fokusoppdrag` beskriver det som er viktigst å lykkes med i jobben nå.
3. `Indre prosjekt · Lederkompetanser` beskriver hva klienten må utvikle for å kunne realisere det ytre prosjektet.
4. `Prøv i praksis · Eksperiment` er små forsøk på det klienten utvikler.

## Grunnregel

Rekkefølgen er anbefalt, ikke låst.

- Hver del kan opprettes, endres og arkiveres uten at en annen del finnes.
- Portalen viser rekkefølgen og fremhever den første delen som mangler, men sperrer aldri en senere del.
- Et indre prosjekt kan finnes uten ytre prosjekt. Et eksperiment kan kobles til lederkompetanse, Fokusoppdrag, begge eller ingen.
- Ingen del skal kreve at felter i en annen del er fylt ut.

Datamodellen støtter dette allerede: `program_competencies` er ikke koblet til `development_areas`, og alle koblinger fra `session_actions` er valgfrie. Grunnregelen krever ingen databaseendring.

## Når en del er på plass

Det som avgjør om en del vises som på plass på `Akkurat nå`:

| Del | På plass når |
| --- | --- |
| Forløpet | `Hva vil du oppnå?` er fylt ut. De øvrige fem avklaringene er støtte. |
| Ytre prosjekt · Fokusoppdrag | Minst ett Fokusoppdrag har et faktisk navn. `Nytt fokusoppdrag` teller ikke og vises som `Ikke ferdigstilt`. |
| Indre prosjekt · Lederkompetanser | Minst én lederkompetanse er `Aktiv`. |
| Prøv i praksis · Eksperiment | Minst ett eksperiment er `planned` eller `active`. |

Alle øvrige felter er støtte for klientens tenkning, ikke vilkår for neste del.

## Lederkompetanser

- Klienten velger, prioriterer og arkiverer selv. Coachen kan foreslå (`Foreslått av coach`), men ikke aktivere.
- Én lederkompetanse er `Prioritert nå`. Øvrige aktive er `Aktiv`.
- Tre aktive samtidig er en anbefaling, ikke en grense. Klienten kan legge til flere. Portalen sier fra om anbefalingen, men sperrer ikke. Teksten for dette skrives av produkteier.
- Arkivering bevarer eksperimenter og læringshistorikk.
- Planstatusen (`Ikke påbegynt`, `Under arbeid`, `Klar til å prøves`) beholdes som beskrivelse. Den styrer ikke neste steg.

Databasen stopper i dag en fjerde aktiv lederkompetanse, og den krever prioritet 1–3. Å fjerne grensen krever en databasemigrering. Migreringen godkjennes og kjøres separat. Til den er kjørt, gjelder dagens grense i portalen.

## Anbefalt neste steg

Én regel for hele portalen:

- Neste steg peker til den første delen i modellen som mangler, og bare dit.
- Neste steg sperrer ikke andre handlinger og skjuler ikke andre deler.
- Neste steg ber ikke klienten fylle ut felter i den delen klienten allerede står i.

## Statusord for eksperimenter

Portalen og styringsdokumentet bruker i dag ulike ord for de samme fem statusene. Anbefaling: ett sett, uten endring i databasen.

| Lagret verdi | Ord i portalen |
| --- | --- |
| `planned` | Planlagt |
| `active` | Prøves ut |
| `reviewed` | Prøvd og reflektert |
| `continued` | Videreført |
| `closed` | Avsluttet |

- Ordene er hentet fra de to eksisterende settene. `Avlest` erstattes av `Prøvd og reflektert`, som portalen allerede bruker og som er lettere å forstå.
- Hovedvisningen grupperer fortsatt i `Aktive` (`planned`, `active`) og `Historikk` (resten). Klienten trenger bare å forholde seg til de fem ordene når et eksperiment endres.
- Ordlisten i `IMPLEMENTATION_GUARDRAILS.md` og `IMPLEMENTATION_PLAN.md` oppdateres samtidig.

## Akkurat nå

- Når en del mangler: alle fire deler vises samtidig, hver med egen handling. I dag vises tre; `Prøv i praksis · Eksperiment` legges til. Den første som mangler, er tydeligst. Ingen rad står uten handling på grunn av en annen del.
- Når delene finnes: oversikten viser Fokusoppdrag, alle aktive lederkompetanser med `Prioritert nå` eller `Aktiv`, og åpne eksperimenter. Samtaler, refleksjoner og ressurser vises under.
- Eksperimenter heter `Eksperiment`, ikke `Arbeidsnotat`.

## Konsekvens for styringsdokumentene

Ved godkjenning endres, i en egen commit:

- `IMPLEMENTATION_GUARDRAILS.md`: setningen om at et ferdig Ytre prosjekt skal lede til Indre prosjekt, og at eksperiment først kan komme etter et indre prosjekt, erstattes med grunnregelen over.
- `SCREEN_CONTRACT_LEADER_COMPETENCIES_AND_EXPERIMENTS_V2.md`: siste punkt under `Skjermlogikk` endres tilsvarende.
- `SCREEN_CONTRACT_AKKURAT_NAA_V1.md`: «indre prosjekt blir handlingsbart når et ytre prosjekt finnes» og akseptkriteriet «Indre prosjekt forklarer avhengigheten til ytre prosjekt» erstattes med grunnregelen.
- `SCREEN_CONTRACT_LEADER_COMPETENCIES_CONTENT_AND_CONVERSATIONS_V3.md`: `Hovedfokus` og `Støttende kompetanse` markeres som erstattet av `Prioritert nå` og `Aktiv`.
- `SCREEN_CONTRACT_LEADER_COMPETENCIES_AND_EXPERIMENTS_V2.md`: «inntil tre aktive» og `3 av 3 aktive` endres til anbefaling når migreringen er godkjent.
- `IMPLEMENTATION_GUARDRAILS.md` og `IMPLEMENTATION_PLAN.md`: statusordlisten for eksperimenter oppdateres.

## Modulen for lederkompetanser

Gjennomgått i biblioteket (velgeren) og arbeidsflaten, desktop og mobil, klient og coach. Modulen oppleves rotete fordi den har for mange lag, dobbelte handlinger og ord som avviker fra de låste begrepene.

### Funn i biblioteket

1. Valgknappen finnes to ganger i samme forhåndsvisning, øverst og nederst.
2. Knappeteksten skifter mellom `Velg og prioriter nå`, `Legg til som aktiv` og `Tre lederkompetanser er aktive`. Kontrakten sier `Velg denne kompetansen`.
3. Biblioteket blir stående åpent etter valg. Klienten ser bare et lite `Valgt`-merke og vet ikke hvor valget ble av.
4. Coachens forslag vises også som `Valgt` i listen. Det er feil: et forslag er ikke aktivt.
5. Forhåndsvisningen har sju blokker: definisjon, `Relevant når`, `Skille mot nærliggende kompetanser`, `Når lykkes du?`, `Se mer`, praksisforslag, `Refleksjonsspørsmål` og `Om rammen for lederkompetanser`. Kontrakten sier at bare de tre første skal vises først.
6. Praksisforslaget i biblioteket heter `Prøv i praksis`. Det er navnet på klientens egne eksperimenter.
7. Hver rad i listen gjentar kategorien over navnet. Med 52 rader blir listen lang og urolig.

### Funn i arbeidsflaten

1. Coachens forslag ligger i et eget felt over listen, med egen overskrift. Det er et ekstra lag før klienten ser sine egne lederkompetanser.
2. Listen heter `Indre prosjekter`, mens hver rad er en lederkompetanse.
3. Listen er smal. Navn kuttes, og `Prioritert nå` står på samme linje som navnet.
4. `Legg til lederkompetanse` forsvinner uten forklaring ved tre aktive.
5. Arkiver er bare et ikon uten tekst.
6. `Anbefalt neste steg` inne i lederkompetansen gjentar det første tomme feltet i planen rett under.
7. Hvert planfelt har to overskrifter som sier det samme, for eksempel `Hvorfor nå?` og `Hvorfor er akkurat denne kompetansen viktig nå?`.
8. Eksperimentdelen heter `I praksis` og `Eksperimenter`, ikke `Prøv i praksis · Eksperiment`.
9. Tom tilstand bruker tre ulike formuleringer: `Velg ditt første indre prosjekt`, `Velg lederkompetanser` og `Legg til lederkompetanse`.

### Anbefaling for biblioteket

1. Én valgknapp per forhåndsvisning: øverst på desktop, fast nederst på mobil. Tekst: `Velg denne kompetansen` for klient og `Foreslå for klienten` for coach. Den første som velges, blir `Prioritert nå`, slik som i dag. Klienten kan endre prioriteringen etterpå.
2. Etter valg lukkes biblioteket, og klienten kommer til den valgte lederkompetansen i arbeidsflaten.
3. Første visning: navn, definisjon, `Relevant når`, `Skille mot nærliggende kompetanser` og valgknappen. Alt annet samles under én `Se mer`.
4. Praksisforslaget heter `Foreslått startforsøk`, som det allerede gjør i arbeidsflaten.
5. Listen merker rader med `Prioritert nå`, `Aktiv` eller `Foreslått av coach`, aldri `Valgt`.
6. Kategorien vises som overskrift for en gruppe rader, ikke på hver rad.

### Anbefaling for arbeidsflaten

1. Coachens forslag vises som rader i samme liste, merket `Foreslått av coach`, med `Aktiver forslag` og `Skjul`. Det egne feltet over listen fjernes.
2. Listen heter `Lederkompetanser`. Navnet står på egen linje, med `Prioritert nå` eller `Aktiv` under.
3. `Legg til lederkompetanse` (klient) eller `Foreslå lederkompetanse` (coach) står alltid nederst i listen. Når anbefalingen om tre er nådd, vises en kort tekst om anbefalingen.
4. Toppen av lederkompetansen viser navn, kategori og definisjon, og handlingene `Prioriter denne nå` og `Arkiver` som tekstknapper.
5. `Anbefalt neste steg` fjernes inne i lederkompetansen. Planstatusen står igjen som beskrivelse.
6. Hvert planfelt har ett spørsmål, med kontraktens ordlyd: `Hvorfor nå?`, `Hva vil du gjøre annerledes?`, `Hva gjør du i dag?`, `Hva kan stå i veien?`.
7. Eksperimentdelen heter `Prøv i praksis · Eksperiment`.
8. Tom tilstand har én handling: `Legg til lederkompetanse` for klient og `Foreslå lederkompetanse` for coach. Coachen ser `Klienten har ikke valgt`.

### Tekst produkteier må skrive

- Teksten som forklarer anbefalingen om tre aktive.
- Overskriften i tom tilstand for klient, hvis `Velg ditt første indre prosjekt` ikke skal beholdes.

## Utenfor dette notatet

- Visuell opprydding (typografi, farger, tomme tilstander, mobilfaner) tas som egen pakke etter at flyten er godkjent.
- Ingen endring i tilgangsregler, innholdet i de 52 lederkompetansene eller Forløpets seks avklaringer.
- Eneste databaseendring er migreringen som fjerner grensen på tre aktive. Den godkjennes separat.

## Avklart

1. Tre aktive lederkompetanser er en anbefaling, ikke en grense.
2. Forløpet er på plass når `Hva vil du oppnå?` er fylt ut.
3. Statusord for eksperimenter: se egen del. Venter på godkjenning.
4. Planstatusen beholdes som beskrivelse og styrer ikke neste steg.
