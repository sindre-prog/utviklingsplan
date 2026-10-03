# Designsystem for utviklingsportalen – plan del 2

Status: godkjent av produkteier 3. oktober 2026, som foreslått.
Grunnlag: `DESIGNSYSTEM_PLAN_V1.md` (steg 1–9) og kartleggingen etter steg 9 (PR #43).

Steg 1–9 bygget om de seks fanene. `legacy` i `styles.css` kunne likevel ikke fjernes, fordi andre deler av portalen fortsatt bruker de gamle klassene. Denne planen beskriver resten av jobben, slik at `legacy` og til slutt hele `styles.css` kan slettes.

Prinsippene, de faste verdiene og byggeklossene fra plan v1 gjelder uendret. Planen endrer ikke produktlogikk, ord, ruter eller data.

## 1. Det som fortsatt bruker `legacy`

Målt på grenen til PR #43. Der er `styles.css` 7 487 linjer, og omtrent 320 gamle klasser er fortsatt i bruk.

| Del av portalen | Hvem ser den | Omfang i `app.js` | Gamle klasser, omtrent |
|---|---|---|---|
| Innlogging, nytt passord og ny tilkobling | Alle | ca. 70 linjer og HTML i `index.html` | 12 |
| Samtykke ved første innlogging | Klient | ca. 60 linjer | 9 |
| Bekreft og melding | Alle | ca. 30 linjer | 6 |
| Skuffen for nytt og endret eksperiment | Klient og coach | ca. 170 linjer | 13 |
| Velgeren for lederkompetanser | Klient og coach | ca. 270 linjer | 48 |
| Skjemavinduet for å invitere og endre klienter og coacher | Coach og admin | ca. 140 linjer | 12 |
| Klientlisten og aktivitet | Coach og admin | ca. 260 linjer | 47 |
| Admin | Admin | ca. 210 linjer | 30 |
| Ressursbiblioteket og forhåndsvisning | Coach og admin | ca. 160 linjer og modulene i `js/resources/` | 60 |
| Ressursredigering og sending av ressurs | Admin, og coach ved sending | ca. 830 linjer | 50 |
| Skallet rundt sidene: overskrift, faneflater, lasting og de skjulte skjemaene | Alle | ca. 180 linjer | 13 |

Noen klassefamilier deles av flere deler. CSS-en for dem kan først slettes når den siste delen er flyttet:

- **Knapper, meldingstekst og overtitler** (`.button`, `.form-message`, `.eyebrow`, `.muted`): nesten alt over.
- **Skjemavindu og skuff** (`.modal-*`, `.drawer-*`): alle dialoger med skjema.
- **Filter og søk** (`.filter-menu*`, `.search`): klientlisten, admin og ressursbiblioteket.
- **Listeflatene til coach** (`.main-*`, `.panel`, `.toolbar`): klientlisten, admin og ressursbiblioteket.
- **Ressursinnhold** (`.resource-block*`): forhåndsvisning for coach og Ressurser-fanen for klient. Klientfanen bruker i dag en bro i `design-system.css`.

## 2. Rekkefølge

Rekkefølgen tar det klienten ser først, deretter coach og admin. Hvert steg er én PR til `main`, med samme krav som i plan v1, punkt 6 («Når et steg er ferdig»).

| Steg | Innhold | Synlig endring |
|---|---|---|
| 10 | Skisser av dialogene, velgeren for lederkompetanser, innlogging og samtykke til godkjenning | Nei |
| 11 | Dialogene: bekreft, melding, skuffen for eksperiment og skjemavinduet. De får byggeklossene, og skuff og skjemavindu får felles ramme. | Ja |
| 12 | Velgeren for lederkompetanser | Ja |
| 13 | Innlogging, nytt passord og samtykke | Ja |
| 14 | Skisser av coachens skjermer: klientlisten, admin og ressursbiblioteket til godkjenning | Nei |
| 15 | Klientlisten, aktivitet og admin. Filter og søk blir byggeklosser. | Ja |
| 16 | Ressursbiblioteket, forhåndsvisning, ressursredigering og sending. Broen for ressursinnhold i `design-system.css` erstattes av egne byggeklosser. | Ja |
| 17 | Skallet rundt sidene. `legacy` og `styles.css` slettes. | Nei. Skjermbildene før og etter skal være like. |

Funksjoner i `app.js` som ingen kaller lenger, fjernes i steget der CSS-en deres slettes. Noen var ubrukt allerede før steg 9, for eksempel `experimentRow`, `freeExperimentSection` og `focusDetailBlock`.

## 3. Skjermbildesett

Skjermbildesettet i `tools/visual-check/` dekker i dag de seks fanene for klient og coach, ressursbiblioteket og byggeklossene. Før hvert steg legges det til scener for skjermene steget endrer. Steg 10 legger til dialogene, velgeren, innlogging og samtykke. Steg 14 legger til klientlisten, admin og ressursredigering. Alle scener bruker bare fiktive data.

## 4. Det som ikke endres

Alt i plan v1, punkt 8, gjelder. I tillegg:

- Hvem som kan invitere, endre, sende og redigere, og hva coach og admin ser.
- Teksten om personvern og samtykke. Den flyttes ordrett.
- Feltene i skjemaene og rekkefølgen deres.

## 5. Beslutninger fra produkteier

Besluttet 3. oktober 2026:

1. Rekkefølgen i punkt 2 er godkjent: klientflatene først, deretter coach og admin.
2. Skissene tas i to runder, i steg 10 og steg 14.
3. Hvor langt ressursredigeringen bygges om, avgjøres med skissene i steg 14.

## 6. Spørsmålene som ble stilt

1. Er rekkefølgen riktig: klientflatene først, deretter coach og admin?
2. Skal skissene tas i to runder, slik forslaget er (steg 10 og 14), eller i én runde for alt?
3. Ressursredigeringen brukes bare av admin og er den største delen. Skal den bygges om fullt ut i steg 16, eller bare få nye knapper, felt og ramme, slik at oppsettet er som i dag?
