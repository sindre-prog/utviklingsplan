# Skjermkontrakt: Akkurat nå V1

Status: godkjent produktretning for samlet oppstartsseksjon.

## Formål

`Akkurat nå` skal vise det som er mest relevant i forløpet uten å gjøre portalen til en oppgaveplattform. Når grunnmodellen ikke er satt, skal klienten kunne se hele sammenhengen i én rolig arbeidsrekkefølge.

## Oppstartsseksjon

Seksjonen `Sett grunnlaget for forløpet` vises når minst én av disse mangler:

1. `Forløpet · Mål og rammer`
2. `Ytre prosjekt · Fokusoppdrag`
3. `Indre prosjekt · Lederkompetanse`

Hver rad viser beslutningsspørsmål, faktisk status og en handling når rollen har tilgang. Første uløste steg får tydeligst handling. Ytre prosjekt kan åpnes før alle mål og rammer er ferdige; indre prosjekt blir handlingsbart når et ytre prosjekt finnes.

`Forløpet` og `Utviklingsfokus` vises med samme typografiske behandling som to toppnivåer. `Mål og rammer` ligger under Forløpet; ytre og indre prosjekt ligger under Utviklingsfokus. Objekttypene `Fokusoppdrag` og `Lederkompetanse` er nøytral metadata, ikke fargekodede kategorier.

Farge uttrykker bare tilstand: korall markerer anbefalt neste steg, grønt markerer avklart, nøytral behandling markerer tilgjengelig og grå behandling markerer ikke tilgjengelig ennå. Dekorative fargemarkører skal ikke brukes til å forklare hierarkiet.

Når alle tre delene finnes, fjernes oppstartsseksjonen. Den ordinære oversikten og statusstripen vises da som før.

## Roller

- Klienten kan avklare Forløpet, velge ytre prosjekt og velge eller aktivere indre prosjekt.
- Coachen ser samme status og kan arbeide i Forløpet og ytre prosjekt etter eksisterende tilgangsregler.
- Coachen kan foreslå en lederkompetanse, men kan ikke aktivere klientens indre prosjekt.
- Andre roller uten redigering ser status uten handlingsknapper.

## Eksisterende innhold

Samtaler, ressurser, refleksjoner og andre samtalerelevante elementer kan fortsatt vises under oppstartsseksjonen. Statusstripen skjules mens oppstartsseksjonen er synlig for å unngå duplisert status for ytre og indre prosjekt.

## Fjerning

- Separate mangelkort for Forløpet, ytre prosjekt og indre prosjekt fjernes fra `nowActionItems()`.
- Den separate klientorienteringen som skjulte første mangelkort fjernes.
- Ingen nye tabeller, statusfelt eller parallelle datakilder opprettes.

## Akseptansekriterier

- Alle manglende deler er synlige samtidig uten å fremstå som tre likeverdige oppgaver.
- Første uløste steg er visuelt prioritert.
- Indre prosjekt forklarer avhengigheten til ytre prosjekt.
- Ytre og indre prosjekt har en tydelig, felles tilhørighet til Utviklingsfokus.
- Forløpet og Utviklingsfokus har samme toppnivå i teksthierarkiet.
- Klienten eier aktivering av lederkompetansen.
- Seksjonen forsvinner når grunnlaget er komplett.
- Desktop og mobil har ingen overlapping eller horisontal rulling.
