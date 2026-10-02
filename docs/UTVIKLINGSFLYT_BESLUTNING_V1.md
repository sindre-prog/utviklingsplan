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
| Forløpet | Avklares, se åpent spørsmål 2. |
| Ytre prosjekt · Fokusoppdrag | Minst ett Fokusoppdrag har et faktisk navn. `Nytt fokusoppdrag` teller ikke og vises som `Ikke ferdigstilt`. |
| Indre prosjekt · Lederkompetanser | Minst én lederkompetanse er `Aktiv`. |
| Prøv i praksis · Eksperiment | Minst ett eksperiment er `planned` eller `active`. |

Alle øvrige felter er støtte for klientens tenkning, ikke vilkår for neste del.

## Lederkompetanser

- Klienten velger, prioriterer og arkiverer selv. Coachen kan foreslå (`Foreslått av coach`), men ikke aktivere.
- Én lederkompetanse er `Prioritert nå`. Øvrige aktive er `Aktiv`.
- Inntil tre aktive samtidig. Se åpent spørsmål 1.
- Arkivering bevarer eksperimenter og læringshistorikk.

## Anbefalt neste steg

Én regel for hele portalen:

- Neste steg peker til den første delen i modellen som mangler, og bare dit.
- Neste steg sperrer ikke andre handlinger og skjuler ikke andre deler.
- Neste steg ber ikke klienten fylle ut felter i den delen klienten allerede står i. Se åpent spørsmål 4.

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

## Utenfor dette notatet

- Visuell opprydding (typografi, farger, tomme tilstander, mobilfaner) tas som egen pakke etter at flyten er godkjent.
- Ingen endring i database, tilgangsregler, innholdet i de 52 lederkompetansene eller Forløpets seks avklaringer.

## Åpne spørsmål

1. Er tre aktive lederkompetanser en fast grense eller en anbefaling? I dag stopper databasen en fjerde. Å åpne for flere krever en databasemigrering med egen godkjenning.
2. Når er Forløpet på plass? I dag kreves alle seks avklaringene. Forslag: når `Hva vil du oppnå?` er fylt ut. De øvrige fem er støtte.
3. Hvilke statusord gjelder for eksperimenter? `IMPLEMENTATION_GUARDRAILS.md` sier `Planlagt`, `Prøves ut`, `Avlest`, `Videreført`, `Avsluttet`. Portalen viser `Planlagt`, `I gang`, `Prøvd og reflektert`, `Videreføres`, `Avsluttet`.
4. Skal planstatusen for en lederkompetanse (`Ikke påbegynt`, `Under arbeid`, `Klar til å prøves`) beholdes? Forslag: beholdes som beskrivelse, men styrer ikke neste steg.
