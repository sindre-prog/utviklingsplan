# Skisser av Samtaler, Refleksjon og Ressurser – steg 8

Status: til godkjenning hos produkteier. Ingen synlig endring i portalen.
Grunnlag: `DESIGNSYSTEM_PLAN_V1.md` (prinsipper, byggeklosser og steg 8), skjermkontraktene for Samtaler og Refleksjon, og `RESOURCE_DELIVERY_LOOP_V1.md`.

Skissene viser hvordan de tre siste fanene ser ut når de bygges med de samme byggeklossene som Utviklingsfokus, Forløpet og Akkurat nå. Når skissene er godkjent, bygges fanene om i steg 9, og `legacy` i `styles.css` tømmes og fjernes.

## Hvordan skissene er laget

Skissene er ikke tegninger. De er laget med de ekte byggeklossene i `design-system.css` og hjelpefunksjonene i `app.js`, inne i portalen med fiktive data (`tools/visual-check/sketches.html`). Det som ser riktig ut her, kan derfor bygges likt i steg 9.

Fire små varianter finnes ikke i portalen ennå. De ligger i `tools/visual-check/sketches.css` og flyttes til `design-system.css` i steg 9:

- Kontekst over flere linjer, for coachens melding på en ressurs (i dag er konteksten én linje).
- Valget «Hvem kan lese?» med forklaring under. Bruker segmentvalget som allerede finnes i eksperimentoversikten.
- To valgfrie koblinger side om side (fokusoppdrag og lederkompetanse).
- Notater i dagbokform for refleksjoner, og enkel tekst og lister for innholdet i en ressurs.

Bildene ligger i `docs/design-skisser/steg8/`. «i-dag» viser fanen slik den er nå, «forslag» viser skissen. Alle forslag finnes i 1440 px, og hovedskissene også i 390 px (mobil).

## Felles for alle tre

- Ett hvitt ark per side. Bokser i bokser, ikoner i sirkler og piller med versaler (for eksempel «RAMMEVERK» og «FRA COACH») forsvinner.
- Sidetittelen står alene. Ingressen vises bare når fanen er tom.
- Status er prikk og ord, alltid samme sted.
- Korall brukes bare for «Anbefalt neste steg», og bare i Samtaler. Refleksjon og Ressurser får ingen korall.
- Én sort knapp per side.
- Sjeldne valg som «Rediger tittel», «Arkiver samtale» og «Rediger refleksjon» ligger i «···»-menyen.

## Samtaler

Bilder: `forslag-samtaler-1440.png`, `forslag-samtaler-390.png`, `forslag-samtaler-en-1440.png`, `forslag-samtaler-tom-1440.png` og `i-dag-samtaler-1440.png`.

- Listen til venstre har samme utforming som i Utviklingsfokus: tittel, dato og status. «Opprett samtale» står nederst i listen. Med bare én samtale vises ingen liste, og «Opprett samtale» står ved siden av «···».
- Overtittelen er «Samtale 3 · 15. jan. 2099». Datoen er ikke lenger en pille.
- «Anbefalt neste steg» følger samme regler som i dag.
- Samtaleplanen beholder de fem delene, de samme spørsmålene og samme status: Før samtalen, Etter samtalen, Til neste gang, Ta med videre og Eksperiment. Det femte steget teller fortsatt med i «Samtalen er fulgt opp».
- Svarene skrives uten modus og lagres av seg selv, som i Forløpet etter steg 7. «Rediger» og «Lagre» forsvinner fra feltene.
- «Gjør til eksperiment» står under svaret på «Hva vil du prøve eller følge opp?».
- Eksperimentene fra samtalen vises som i Utviklingsfokus, med status og kobling.

## Refleksjon

Bilder: `forslag-refleksjon-1440.png`, `forslag-refleksjon-390.png`, `forslag-refleksjon-rediger-1440.png`, `forslag-refleksjon-coach-1440.png` og `i-dag-refleksjon-1440.png`.

- Skrivefeltet står åpent øverst på siden. Man trenger ikke trykke «Skriv refleksjon» først.
- Forslagene «Hva skjedde? Hva overrasket deg? Hva vil du prøve videre?» står som hjelpetekst over feltet, ikke som små piller.
- «Hvem kan lese?» med «Privat» og «Del med coach». Privat er valgt på forhånd, som i dag.
- «Knytt refleksjonen til arbeidet · Valgfritt» er lukket til man åpner den.
- «Lagre refleksjon» er grå til det står noe i feltet.
- Tidligere refleksjoner vises som en rolig dagbok: status (Privat eller Delt med coach), dato og kobling på én linje, og teksten under i vanlig størrelse. Ingen kort og ingen tall i sirkel.
- «Rediger refleksjon» ligger i «···». Da åpnes refleksjonen på samme sted med de samme valgene, og med «Avbryt» og «Lagre» (se beslutning 1).
- Coachen ser bare delte refleksjoner, som i dag, under «Det klienten har valgt å dele».

## Ressurser

Bilder: `forslag-ressurser-1440.png`, `forslag-ressurser-390.png`, `forslag-ressurser-coach-1440.png` og `i-dag-ressurser-1440.png`.

- Listen har samme utforming som i Utviklingsfokus: tittel og «Rammeverk · 15 min · Åpnet». Statusordene er de samme som i dag (Ny, Åpnet og Refleksjon lagret, og Ikke åpnet for coach).
- Overtittelen er «Ressurs fra coach · Rammeverk · 15 min». Under står tittel og introduksjon.
- «Last ned PDF» blir en vanlig knapp i toppen av ressursen. Den store PDF-boksen forsvinner.
- Coachens melding står som en stille sitatlinje, «Fra coach», rett under introduksjonen.
- Innholdet (tekst, arbeidsark, refleksjonsspørsmål og «Neste steg») står som vanlig tekst og lister i arket.
- «Din refleksjon» har samme valg og knapp som i Refleksjon. Etter lagring vises «Lagret privat» eller «Lagret og delt med coach», som i dag.
- På mobil vises listen først, og ressursen åpnes når man trykker på den (se beslutning 5).

## Ord

Skissene bruker bare ord som finnes i portalen i dag. Noen ord er satt sammen på en ny måte:

| I skissen | Satt sammen av |
|---|---|
| «Samtaler · 3» | Samme mønster som «Ytre prosjekter · 2» |
| «15. jan. 2099 · Under arbeid» | Dato og status for samtalen |
| «Rammeverk · 15 min · Åpnet» | Type, varighet og status for ressursen |
| «Ressurs fra coach · Rammeverk · 15 min» | Overtittel, type og varighet |

Disse ordene forsvinner:

- Refleksjon: «Tidligere», «Se tilbake på det du har lagt merke til.», «Skriv noen få setninger mens observasjonen er fersk.», «Ny refleksjon», «Noter det mens det er ferskt.» og knappen «Skriv refleksjon».
- Ressurser: «Delt med deg» som egen overskrift (blir listetittel), «PDF-versjon», «Ta med deg PDF-versjonen», «Arbeid videre i dokumentet, skriv det ut eller del det med andre.» og «Ikke lagret».
- Samtaler: «Rediger tittel» som synlig knapp (flyttes til «···»).

## Beslutninger for produkteier

1. **Refleksjoner lagres med knapp, ikke av seg selv.** Prinsipp 7 sier at tekst lagres av seg selv. For refleksjoner foreslår vi et unntak: Hvis en refleksjon er delt med coach og lagres mens man skriver, kan coachen lese halvferdig tekst. Valget om å dele skal være et bevisst valg. Forslaget gjelder Refleksjon og «Din refleksjon» i Ressurser. Samtaler lagres av seg selv.
2. **Skrivefeltet i Refleksjon står alltid åpent.** I dag må man trykke «Skriv refleksjon» først. Skjermkontrakten sier at skrivefeltet skal være det viktigste på siden.
3. **Eksperiment er fortsatt del fem av samtaleplanen.** Alternativet er en egen del, «Prøv i praksis · Eksperiment», som i Utviklingsfokus. Da må regelen for «Samtalen er fulgt opp» endres. Vi anbefaler å beholde dagens fem deler.
4. **«Neste steg» i en ressurs er vanlig tekst, ikke korall.** Korall er forbeholdt portalens anbefalte neste steg. Ressursens forslag er en del av innholdet.
5. **Ressurser på mobil åpnes ikke automatisk.** På PC åpnes den første ressursen automatisk, og da regnes den som åpnet, som i dag. På mobil må klienten trykke selv, så status «Åpnet» stemmer.
6. **Coachvisningene beholder én forklarende linje**, for eksempel «Her vises bare refleksjoner klienten aktivt har delt i coachingforløpet.», også når det finnes innhold. Linjen forklarer hva coachen ikke ser. Dette er et unntak fra regelen om at ingressen bare vises i tom tilstand.

## Hva steg 9 innebærer

- `sessionsWorkspace`, `reflectionsWorkspace`, `coachResourcesWorkspace` og visningene i `js/resources/` bygges med byggeklossene. Rekkefølgen er Samtaler, så Refleksjon og så Ressurser. Hver fane er en egen commit, og alt kommer samlet i én PR.
- Samtaler bruker den automatiske lagringen fra steg 7. Samtaler lagres gjennom samme databasefunksjon som Forløpet (`save_development_plan_safe`). Ingen databasemigrering trengs. Lagringen må testes innlogget før merge.
- Refleksjon og Ressurser lagrer på samme måte som i dag, med samme tabeller og felt.
- Innholdet i ressursene vises i dag av `resources.renderer.js`, som også brukes i coachens bibliotek. Det får nye klasser, men samme innhold og rekkefølge. Bilder, modellkort og nedlastinger sjekkes med ekte ressurser.
- Gammel CSS for de tre fanene slettes. Deretter fjernes det som er igjen i `legacy`, og laget fjernes. Dialogene (biblioteket for lederkompetanser og redigeringsvinduene) er siste del av `legacy` og må få byggeklossene i samme steg, eller bli liggende i et lite eget lag. Dette avklares når fanene er ferdige.
