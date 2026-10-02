# Designsystem for utviklingsportalen – plan v1

Status: forslag til godkjenning av produkteier, 2. oktober 2026.
Grunnlag: skisserunde 2 (PR #33), design-review 2. oktober og avklaringene om scope samme dag.

Planen beskriver hvordan portalen får ett felles visuelt språk i koden, og i hvilken rekkefølge skjermene bygges om. Den endrer ikke produktlogikk, ord, ruter eller data.

## 1. Hvorfor tidligere opprydding ikke har lyktes

Dette er målt i `styles.css` på `main` etter #32:

| Måling | I dag |
|---|---|
| Linjer i `styles.css` | 17 536 |
| Seksjoner som legger nye regler oppå gamle | 39, hvorav 28 heter noe med «system», «platform», «contract», «consistency» eller «polish» |
| Ulike fargekoder | 127 |
| Ulike skriftstørrelser | 30 |
| Ulike hjørneradier | 11 |
| Ulike brytningspunkter for skjermbredde | mer enn 10 |
| Steder med `:root` som definerer variabler på nytt | 5 |

Mønsteret er det samme hver gang: En ny runde legges til nederst og skal vinne over det som står over. Det gamle blir stående. For å vinne må de nye reglene bli stadig mer spesifikke, for eksempel med `#content`, lange `:is(...)`-lister eller `!important`. Neste runde må da bli enda mer spesifikk. Designrundene 2. oktober gjorde det samme, og derfor ble innholdssidene blandet.

Problemet er altså ikke at noen har valgt feil farger. Det er at koden mangler et sted der det nye erstatter det gamle.

## 2. Prinsipper

Disse reglene gjelder alle skjermer. De kommer fra skisserunde 2.

1. **Ett ark per side.** Innholdet ligger på én hvit flate på en varm bakgrunn. Deler skilles med luft og en tynn linje, aldri med bokser i bokser.
2. **Spørsmålet leder, svaret er teksten.** Spørsmålet er overskriften, og svaret står i vanlig tekst under. Et tomt svar er et skrivefelt.
3. **Brukerens ord kommer foran forklaringer.** Svaret får tydelig skrift og plass. Forklarende tekst vises når et felt er tomt, ikke når det er fylt ut. Dette er en moderert variant: ingen store sitater overalt.
4. **Tre farger med mening.** Korall brukes bare for anbefalt neste steg, maks én gang per side. Grønt betyr «på plass». Sort betyr valgt og hovedhandling. Alt annet er nøytralt, og lavendel brukes ikke for «valgt».
5. **Én type status.** Prikk og ord, alltid samme sted.
6. **Handlinger der de brukes.** Det er én primærknapp per side. Sjeldne valg som «Rediger tittel» og «Arkiver» ligger i en «···»-meny.
7. **Skriv uten modus.** Man klikker og skriver, og teksten lagres av seg selv med et stille «Lagret». Dette innføres som eget steg (se punkt 6, steg 7).

Mackinac brukes bare til side-, seksjons- og objekttitler (h1–h3). Spørsmål, etiketter og brødtekst står i Roboto.

## 3. Teknisk grep

### 3.1 Lag i CSS

Hele dagens `styles.css` pakkes inn i et lag som heter `legacy`. Det nye designsystemet ligger i et lag som heter `ds`, i en egen fil, `design-system.css`.

```css
/* Øverst i styles.css */
@layer legacy, ds;
@layer legacy {
  /* … hele dagens innhold, uendret … */
}
```

```css
/* design-system.css */
@layer ds {
  /* faste verdier og byggeklosser */
}
```

Et senere lag vinner alltid over et tidligere lag, uansett hvor spesifikk den gamle regelen er. Nye byggeklosser trenger derfor aldri `#content`, lange selektorer eller `!important`.

Kjente unntak som må håndteres:
- `!important` i et tidligere lag vinner over et senere lag. Det finnes 10 slike regler i dag (linje 103, 104, 489, 1112, 2985, 2987, 3200, 3201, 7101 og 13784). De gjennomgås i steg 2. `.hidden` og `.mobile-only` skal fortsatt vinne og kan bli stående.
- Stiler skrevet direkte i HTML (`style="…"`) ligger utenfor lagene. De fjernes fra skjermer som bygges om.

Nettlesere har støttet lag i CSS siden 2022 (Chrome 99, Safari 15.4 og Firefox 97).

### 3.2 Egne klassenavn

Nye byggeklosser bruker prefikset `ds-`, for eksempel `ds-sheet`, `ds-qa` og `ds-status`. Gamle selektorer som `.ui-button` eller `.workspace-tab` treffer dermed ikke ny markup, og ingen gamle stiler «lekker» inn.

JavaScript som i dag finner elementer via visuelle klassenavn, for eksempel `.workspace-tab` og `.workspace-pane`, skal bruke data-attributter i stedet, som `data-tab` og `data-pane`. Da kan utseende og oppførsel endres hver for seg.

### 3.3 Gammel CSS slettes skjerm for skjerm

Når en skjerm er bygget om med byggeklossene, slettes reglene i `legacy` som bare gjaldt den skjermen, i samme PR. Regler som brukes av flere skjermer, slettes når den siste skjermen er flyttet. Målet er at `legacy` til slutt er tom og kan fjernes.

Ingen PR får legge til nye regler i `styles.css`.

### 3.4 Hjelpefunksjoner i `app.js`

Byggeklossene får hver sin hjelpefunksjon i en egen, samlet seksjon i `app.js` (for eksempel `dsSheet()`, `dsQuestion()`, `dsStatus()`), ved siden av dagens `el()`. `app.js` lastes som et vanlig skript og kan ikke importere moduler, så dette er det enkleste nå. Seksjonen kan flyttes til en egen fil senere.

## 4. Faste verdier

Alle farger, størrelser og avstander i `ds` hentes herfra. Ingen fargekode eller pikselverdi skrives direkte i en byggekloss.

### Farger

| Navn | Verdi | Bruk | Kontrast mot hvit |
|---|---|---|---|
| `--ds-canvas` | `#fdfaf4` | Sidebakgrunn | – |
| `--ds-paper` | `#ffffff` | Arket | – |
| `--ds-ink` | `#171517` | Titler, valgt, primærknapp | 18,2 : 1 |
| `--ds-text` | `#302d30` | Brødtekst og svar | 13,6 : 1 |
| `--ds-muted` | `#5d585d` | Etiketter, hjelpetekst, status | 7,0 : 1 |
| `--ds-placeholder` | `#6e696e` | Tekst i tomme skrivefelt | 5,4 : 1 |
| `--ds-line` | `#ebe8e4` | Skillelinjer | – |
| `--ds-line-strong` | `#d6d2cc` | Kant på felt og sekundærknapp | – |
| `--ds-wash` | `#f7f5f2` | Valgt rad, hover | – |
| `--ds-next` | `#fff2ef` | Flate for anbefalt neste steg | – |
| `--ds-next-ink` | `#8a3a3a` | Etikett på anbefalt neste steg | 7,6 : 1 |
| `--ds-next-accent` | `#ffa6a6` | Korall (Ræder&) | – |
| `--ds-done` | `#3f7a4a` | På plass | 5,1 : 1 |
| `--ds-danger` | `#8b2424` | Feil og sletting | – |

All tekst holder minst 4,5 : 1 mot både arket og sidebakgrunnen. Hjelpetekst i tomme felt er mørkere enn i skissene, der den lå på 3,6 : 1.

### Skrift

| Navn | Skrift | Størrelse / linjehøyde | Bruk |
|---|---|---|---|
| `--ds-title-page` | Mackinac 400 | 36 / 1,15 (mobil 28) | Sidetittel |
| `--ds-title-object` | Mackinac 400 | 34 / 1,15 (mobil 24) | Fokusoppdrag, lederkompetanse |
| `--ds-title-section` | Mackinac 400 | 24 / 1,2 | Seksjon i arket |
| `--ds-question` | Roboto 600 | 16 / 1,4 | Spørsmål |
| `--ds-body` | Roboto 400 | 16 / 1,55 | Svar og brødtekst |
| `--ds-support` | Roboto 400 | 15 / 1,5 | Hjelpetekst |
| `--ds-label` | Roboto 600 | 13 / 1,35 | Etiketter, status, overtitler |

Ingen tekst er mindre enn 13 px, og ingen tekst står i versaler.

### Avstand, form og skygge

- Avstander i trinn på 4 px: 4, 8, 12, 16, 20, 24, 32, 40 og 56.
- Hjørner: 6 px på felt og rader, 8 px på ark, knapper og flater. Pille-form brukes bare på faner i toppfeltet og i bunnmenyen.
- Én skygge for arket: `0 1px 2px rgba(30,25,28,.04), 0 10px 30px rgba(30,25,28,.05)`. Ingen andre skygger.
- Trykkflater er minst 40 px høye, og tekstknapper har usynlig trykkflate på minst 40 px.

### Bredder og brytningspunkter

- Innholdsbredde: 1272 px. Lesespalte (Forløpet og skjemaer): 760 px.
- Tre brytningspunkter: mobil til og med 700 px, nettbrett 701–1239 px og PC fra 1240 px. Dagens mer enn ti brytningspunkter fases ut.

## 5. Byggeklosser

| # | Byggekloss | Hva den er | Erstatter blant annet |
|---|---|---|---|
| 1 | `ds-appbar` | Toppfelt med logo, seks faner og bruker. Fanene står i toppfeltet på PC. | `.sidebar`, `.topline`, `.workspace-tabs` |
| 2 | `ds-bottomnav` | Bunnmeny på mobil med seks faner, ikon og navn | Mobilreglene for `.workspace-tabs` |
| 3 | `ds-page` | Sidetopp med tittel og eventuell ingress. Ingressen vises bare i tom tilstand. | `pageIntro`, `.ui-page-intro`, `.workspace-intro` |
| 4 | `ds-sheet` | Arket. Kan deles i liste og detalj. | `.panel`, `.ui-section-card`, `.workspace-detail-surface`, `.focus-workbench` |
| 5 | `ds-list` og `ds-row` | Liste med rader. Valgt rad har mørk stripe og lys bakgrunn. Vises bare når det finnes mer enn ett element. | `.workspace-master-rail`, `.leadership-track-*`, `.focus-nav-button` |
| 6 | `ds-steps` | Tre steg i Utviklingsfokus: Ytre prosjekt, Indre prosjekt og Prøv i praksis | `.focus-view-tabs`, `.development-model-origin` |
| 7 | `ds-object-head` | Overtittel, objekttittel og «···»-meny | `.competency-workspace-head`, «Rediger tittel», arkiv-ikon |
| 8 | `ds-menu` | «···»-meny med sjeldne valg | Frittstående knapper for Rediger tittel og Arkiver |
| 9 | `ds-qa` | Spørsmål, svar og skrivefelt, med merket for «på plass» | `workspacePlanStep`, `directionCard`, `.competency-plan-step`, `.direction-plan-row` |
| 10 | `ds-next` | Anbefalt neste steg, én per side | `.workspace-next-step`, `.now-primary-action` |
| 11 | `ds-status` | Prikk og ord | `.ui-meta`, `.type-chip`, `.plan-status-chip`, statusmerker |
| 12 | `ds-button` | Primær, sekundær og tekst | `.button`, `.ui-button-*`, `.ui-field-action`, `.ui-title-action`, `.ui-add-action`, `.competency-step-action` |
| 13 | `ds-context` | Stille sitatlinje, for eksempel Forløpets mål i fokusoppdraget | – (ny) |
| 14 | `ds-disclosure` | «Se mer» og «Se eksempel» | `details` med nettleserens trekant |
| 15 | `ds-empty` | Tom tilstand med én forklaring og én handling | Flere ulike tomtilstander |
| 16 | `ds-saved` | Stille «Lagret»-merke | `.workspace-save-row` |

Dialogene (biblioteket for lederkompetanser og redigeringsvinduene) beholder dagens utforming i første omgang. De får byggeklossene når skjermene rundt er ferdige.

## 6. Rekkefølge

Hvert steg er én PR til `main`. Produkteier tester innlogget før merge.

| Steg | Innhold | Synlig endring |
|---|---|---|
| 1 | Denne planen | Nei |
| 2 | Grunnmur: lag i CSS, `design-system.css` med faste verdier og byggeklosser, hjelpefunksjoner i `app.js`, gjennomgang av de 10 `!important`-reglene og skjermbildesett i repoet | Nei. Skjermbildene før og etter skal være like. |
| 3 | Toppfelt og bunnmeny (byggekloss 1–2). Den midlertidige prototype-CSS-en fra #32 slettes. | Ja, men nær dagens uttrykk |
| 4 | Utviklingsfokus: fokusoppdrag, lederkompetanser og eksperimenter (byggekloss 3–15). Forløpets mål flyttes ut av stegvelgeren. | Ja |
| 5 | Forløpet | Ja |
| 6 | Akkurat nå | Ja |
| 7 | Skriv uten modus, med automatisk lagring. Endrer hvordan data skrives og krever testrunde med ekte innlogging. | Ja |
| 8 | Skisser av Samtaler, Refleksjon og Ressurser til godkjenning | Nei |
| 9 | Samtaler, Refleksjon og Ressurser bygges om. `legacy` tømmes og fjernes. | Ja |

Steg 7 kan flyttes før steg 5 hvis produkteier ønsker det. Byggeklossen `ds-qa` lages slik at den kan brukes både med og uten automatisk lagring.

### Når et steg er ferdig

- Skjermen bruker bare byggeklosser fra `ds`.
- Gammel CSS som bare gjaldt skjermen, er slettet i samme PR.
- Ingen nye regler er lagt til i `styles.css`.
- Skjermbildesettet er tatt før og etter, på 1440, 1024, 390 og 360 px, og avvik er forklart i PR-en.
- Tastaturnavigasjon og synlig fokus er sjekket på skjermen.
- Låste ord og produktregler er uendret (se punkt 8).
- Versjonsmerket i `index.html` er oppdatert i en egen commit.

## 7. Skjermbildesett

I dag finnes det et testoppsett utenfor repoet, med fiktive data og ulike tilstander (tom, utkast, komplett, coach og mobil). Det legges inn i repoet under `tools/visual-check/` i steg 2, slik at alle, også andre AI-modeller, kan ta samme sett skjermbilder før og etter en endring.

Oppsettet bruker bare fiktive data og skriver aldri til Supabase. Siden GitHub Pages publiserer hele repoet, blir mappen også tilgjengelig på portalens adresse. Den inneholder ingen hemmeligheter, men se beslutning 3.

## 8. Det som ikke endres

- De seks fanene og navnene deres: Akkurat nå, Forløpet, Utviklingsfokus, Samtaler, Refleksjon og Ressurser.
- Låste ord: Forløpet / Mål og rammer, «Ytre prosjekt · Fokusoppdrag», «Indre prosjekt · Lederkompetanser», «Prøv i praksis · Eksperiment», «Prioritert nå», «Aktiv», «Foreslått av coach» og «Arkiver». «Støttende kompetanse» skal ikke tilbake.
- Statusordene for eksperimenter: Planlagt, Prøves ut, Prøvd og reflektert, Videreført og Avsluttet.
- Reglene i `UTVIKLINGSFLYT_BESLUTNING_V1.md`: anbefalt rekkefølge uten lås, tre aktive som anbefaling og når en del regnes som på plass.
- Klienten velger og aktiverer lederkompetanser selv. Coachen foreslår.
- Data, tilgangsregler og databasefunksjoner. Bare steg 7 endrer hvordan data skrives, og ingen steg krever databasemigrering.

## 9. Utenfor denne planen

Frister og datoer, samtalen som anker på Akkurat nå, tidslinje, påminnelser og referat, synlig coach med navn og bilde overalt, og sammenslåing av faner.

## 10. Risiko

| Risiko | Tiltak |
|---|---|
| Å pakke `styles.css` i et lag endrer rekkefølgen for regler som i dag er ulagdelt. | Steg 2 gjør ingen andre endringer. Hele skjermbildesettet skal være likt før og etter. |
| Gammel CSS slettes og ødelegger en annen skjerm som brukte den. | Det slettes bare regler som er bekreftet å gjelde én skjerm. Hele skjermbildesettet tas, ikke bare skjermen som endres. |
| Coachvisningen glemmes. | Skjermbildesettet har egne coachtilstander for hver skjerm. |
| Midlertidig blandet uttrykk mens skjermene bygges om. | Rekkefølgen tar de mest brukte skjermene først. Hvert steg publiseres samlet. |
| Automatisk lagring gir mange små skrivinger mot Supabase. | Lagring skjer med kort forsinkelse etter at man slutter å skrive, og ved tap av fokus. Testes innlogget før merge. |

## 11. Beslutninger fra produkteier

1. Godkjenne prinsippene i punkt 2 og de faste verdiene i punkt 4.
2. Godkjenne rekkefølgen i punkt 6, inkludert om steg 7 (skriv uten modus) skal komme før Forløpet.
3. Om testoppsettet kan ligge i repoet og dermed publiseres sammen med portalen, eller om publiseringen skal begrenses til de filene portalen trenger. Det siste krever en liten endring i `pages.yml`.
