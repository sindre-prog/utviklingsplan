# Skisser av coachens skjermer – steg 14

Status: godkjent av produkteier 4. oktober 2026, med alle sju beslutninger som foreslått. Ingen synlig endring i portalen.
Grunnlag: `DESIGNSYSTEM_PLAN_DEL2.md` (steg 14–16) og prinsippene og byggeklossene i `DESIGNSYSTEM_PLAN_V1.md`.

Skissene viser klientlisten, admin, ressursbiblioteket, ressursredigering og «Del ressurs» bygget med de samme byggeklossene som de seks fanene, dialogene og velgeren. Klientlisten og admin bygges i steg 15, og ressursbiblioteket, redigering og sending i steg 16.

## Hvordan skissene er laget

Skissene er laget med de ekte byggeklossene i `design-system.css` og hjelpefunksjonene i `app.js`, inne i portalen med fiktive klienter, coacher og ressurser (`tools/visual-check/sketches.html`, skissene ligger i `sketches-coach.js`). Knappene gjør ingenting.

Skjermbildesettet har fått scener for skjermene slik de er i dag: `coach-klienter`, `coach-klienter-tom`, `coach-ressursbibliotek`, `admin`, `admin-ressursbibliotek` og `dialog-ressurs-ny`. De brukes til å sammenligne før og etter i steg 15 og 16.

Tre byggeklosser finnes ikke i portalen ennå. De ligger i `tools/visual-check/sketches.css` og flyttes til `design-system.css` i steg 15:

- **Nøkkeltall**: tall i Mackinac med ord under, uten ikon og boks.
- **Filterrad**: søkefelt og nedtrekkslister på én linje. På mobil står de under hverandre.
- **Tabell**: rader med faste kolonner og en tynn linje mellom. Overskriftene over kolonnene står med små bokstaver. Hele raden kan åpnes når den har en lenke. På mobil står cellene under hverandre, og knappene står øverst til høyre på raden.

Bildene ligger i `docs/design-skisser/steg14/`. «i-dag» viser skjermen slik den er nå, og «forslag» viser skissen. Alle forslag finnes i 1440 px. Klientlisten, admin, ressursbiblioteket og «Del ressurs» finnes også i 390 px (mobil).

## Felles for alt

- Coach-sidene får tittel og ingress som fanene, øverst i siden. Overtitlene i versaler forsvinner (se beslutning 1).
- Hver side er ett ark, som fanene. Seksjonene i arket skilles med en tynn linje og har tittel i Mackinac, som seksjonene i fanene.
- Bokser i bokser, ikoner i sirkel, piler og farget bakgrunn forsvinner.
- Status står som prikk og ord, som i fanene: grønn prikk for det som er klart, rosa prikk for det som mangler, grå prikk ellers.
- Det er én sort knapp per side. Andre knapper er hvite med tynn ramme, eller tekstknapper.

## Klientlisten

Bilder: `forslag-klienter-1440.png`, `forslag-klienter-390.png`, `forslag-klienter-tom-1440.png`, `i-dag-klienter-1440.png` og `i-dag-klienter-390.png`.

- «Inviter klient» står øverst til høyre, som i dag.
- De tre nøkkeltallene står øverst i arket, med de samme ordene som i dag.
- «Nylige oppdateringer» blir en tabell med klient, siste aktivitet og neste samtale, i stedet for kort. «Åpne» og pilen forsvinner, fordi hele raden åpner klienten (se beslutning 3).
- «Klientoversikt» har søk, coach og sortering på én linje, og en tabell med klient, sist aktivitet, neste samtale og status. Bokstavsirklene og pilene forsvinner.
- Når coachen ikke har aktivitet ennå, står «Klienten eier utviklingsløpet» som topp i arket, uten ikon og farget boks.
- På mobil viser tabellen navn, arbeidsgiver og status, som i dag.

## Admin

Bilder: `forslag-admin-1440.png`, `forslag-admin-390.png` og `i-dag-admin-1440.png`.

- Nøkkeltallene er «Coacher» og «Klienter». «Rollebasert · Tilgang» forsvinner, fordi det ikke er et tall (se beslutning 2).
- «Inviter coach» og «Inviter klient» står én gang hver, ved sin seksjon (se beslutning 4).
- Coacher og klienter står i tabeller. «Rediger» og «Arkiver» flyttes inn i menyen ⋯ på raden, som i Samtaler. «Åpne» står igjen som tekstknapp på klientene coachen kan åpne. Klienter med «Kun oversikt» har grå tittel (se beslutning 5).
- «Arkiver» er ikke lenger rød, som besluttet i steg 10.
- Ressursene står i en tabell med tittel, status, type, utviklingsområde og introduksjon, og med «Før publisering» som prikk og ord. «Publiser» står på utkast. Arkiv-ikonet blir tekstknappen «Arkiver» eller «Reaktiver».

## Ressursbiblioteket

Bilder: `forslag-ressursbibliotek-1440.png`, `forslag-ressursbibliotek-vurdering-1440.png`, `forslag-ressursbibliotek-admin-1440.png`, `forslag-ressursbibliotek-390.png`, `forslag-ressursbibliotek-ressurs-390.png`, `i-dag-ressursbibliotek-1440.png` og `i-dag-ressursbibliotek-390.png`.

- Samme oppsett som velgeren for lederkompetanser: søk og filter øverst i listen til venstre, ressursene gruppert etter utviklingsområde, og ressursen til høyre.
- Overskriften «Publisert innhold · Bibliotek» forsvinner. Antallet står under filtrene.
- Ressursen har type og tid over tittelen, introduksjonen under, og «Send ressurs» som sort knapp til høyre. Admin får også «Rediger ressurs».
- «Før du deler» er et «Se mer»-felt med de fire feltene for coach side om side.
- «Dette ser klienten» viser innholdet slik klienten ser det i Ressurser-fanen. Innholdsblokkene ser like ut begge steder.
- På mobil vises listen først. Når man trykker på en ressurs, åpnes den med «Til biblioteket» øverst, som i velgeren (se beslutning 6).

## Ressursredigering

Bilder: `forslag-ressurs-rediger-1440.png`, `forslag-ressurs-rediger-innhold-1440.png` og `i-dag-ressurs-rediger-1440.png`.

Skissen viser alternativ A i beslutning 7.

- Samme skuff som i dag, med skjemaet til venstre og forhåndsvisningen til høyre.
- Alle felt står i samme rekkefølge og med de samme ordene. Seksjonene «Start her», «Faglig plassering», «Innhold» og «Filer og bilder» får tittel med en tynn linje over, i stedet for hver sin boks. «For coach og deling» og «Publisering og kvalitet» er «Se mer»-felt, som i dag.
- «Før publisering» blir en stille sitatlinje med det som mangler som prikk og ord, i stedet for en farget boks.
- Hver innholdsblokk har navnet sitt, pilene og søppelbøtta på én linje, feltene under og «Legg til under» som tekstknapp.
- Opplastingen får navn på feltene: «Fil», «Filtype» og «Visningsnavn».
- Forhåndsvisningen viser ressursen slik coach og klient ser den.
- «Dupliser» flytter fra en egen boks nederst i skjemaet til en tekstknapp ved siden av «Arkiver».

## Del ressurs

Bilder: `forslag-ressurs-del-1440.png`, `forslag-ressurs-del-390.png` og `i-dag-ressurs-del-1440.png`.

- Samme skuff, felt og ord som i dag.
- «Ressursen klienten mottar» blir en stille sitatlinje med tittel og introduksjon, uten boks og ikon.
- «Vurdering for coach» er et «Se mer»-felt med en tynn linje over.
- «Hvor skal ressursen ligge?» er et vanlig felt med hjelpeteksten under spørsmålet, i stedet for en grå boks.

## Ord

Skissene bruker bare ord som finnes i portalen i dag, med disse unntakene:

- Overskriftene over kolonnene i tabellene: «Klient», «Navn», «E-post», «Coach», «Status», «Tilgang», «Klienter», «Sist aktivitet», «Neste samtale», «Ressurs» og «Før publisering». Alle ordene finnes i portalen fra før, men ikke som kolonneoverskrifter i klientlisten.
- «Fil», «Filtype» og «Visningsnavn» over opplastingsfeltene i ressursredigeringen.

Disse ordene forsvinner:

- Overtitlene «Klientarbeid», «Plattform», «Fagbibliotek» (øverst på siden), «Utviklingsforløp», «Siste aktivitet», «Team», «Tilgang» og «Publisert innhold», og overskriften «Bibliotek» (se beslutning 1).
- «Rollebasert», «Tilgang» og «fortrolig innhold er skjermet» i nøkkeltallene for admin (se beslutning 2).
- «2 nylig oppdaterte», «4 totalt» og «Åpne» på kortene i klientlisten (se beslutning 3).
- «Lag variant» og «Dupliser når du vil lage en variant med samme struktur uten å skrive alt på nytt.» i ressursredigeringen. «Dupliser» står igjen.

## Beslutninger for produkteier

Alle sju er godkjent som foreslått, inkludert alternativ A for ressursredigering.

1. **Tittel i siden, uten overtittel i versaler.** I dag har coach-sidene en overtittel i versaler over tittelen, for eksempel «KLIENTARBEID» over «Klienter», og seksjonene har overtitler som «UTVIKLINGSFORLØP» og «TEAM». Fanene har ingen av delene. Vi foreslår at coach-sidene får tittel og ingress som fanene, og at overtitlene forsvinner. Menyen øverst viser allerede hvor man er.
2. **Nøkkeltall bare når det er et tall.** I dag viser admin «Rollebasert · Tilgang · fortrolig innhold er skjermet» som et nøkkeltall. Det er ikke et tall og endrer seg aldri. Vi foreslår å ta det bort. Setningen under «Klienter» i admin sier det samme: «Admin viser tilgang og status. Forløpsinnhold, notater og refleksjoner kan bare åpnes når du selv er coach for klienten.»
3. **Hele raden åpner klienten.** I dag har hver klient både et kort med «Åpne» og en pil. Vi foreslår at hele raden kan trykkes på, som radene i fanene og velgeren. Tellerne «2 nylig oppdaterte» og «4 totalt» forsvinner, fordi de samme tallene står i nøkkeltallene. Klienter coachen ikke kan åpne, kan heller ikke trykkes på, som i dag.
4. **«Inviter coach» og «Inviter klient» én gang hver.** I dag står begge knappene både øverst på siden og ved sin seksjon i admin. Vi foreslår at de bare står ved seksjonen, der man ser listen man legger til i.
5. **«Rediger» og «Arkiver» i menyen ⋯ på raden.** I dag har hver rad i admin to eller tre knapper. Vi foreslår at «Rediger» og «Arkiver» ligger i menyen ⋯, som for samtaler, og at «Åpne» står igjen som tekstknapp. Det blir roligere, og «Arkiver» ligger ett trykk lenger unna. For ressurser står «Arkiver» og «Reaktiver» som tekstknapp, fordi raden åpner redigeringen.
6. **Ressursbiblioteket på mobil som velgeren.** I dag viser mobilen en nedtrekksliste med ressursene over den valgte ressursen. Vi foreslår listen først, og ressursen med «Til biblioteket» når man trykker, som i velgeren for lederkompetanser.
7. **Hvor langt ressursredigeringen bygges om.** Godkjent som alternativ A: samme skjema med byggeklossene. Alle felt, seksjoner, innholdsblokker og forhåndsvisningen beholdes, med samme rekkefølge og ord. Bare utseendet endres, som i skissen. Det er nok til at den gamle CSS-en kan slettes, og det endrer ikke hvordan admin jobber. De to alternativene som ikke ble valgt:
   - **B: Dele skjemaet i trinn.** For eksempel «Innhold», «For coach» og «Publisering» som faner i skuffen.
   - **C: Bare bytte CSS.** Beholde boksene og utseendet som i dag, men flytte CSS-en til designsystemet.

## Hva steg 15 og 16 innebærer

- **Steg 15, klientlisten, aktivitet og admin:** `renderClients`, `clientActivitySection`, `clientGrid`, `renderAdmin`, `adminTable` og `actionGroup` bygges med byggeklossene. `filterMenu` erstattes av nedtrekkslisten i byggeklossene, med samme valg og samme filtrering. Søk, sortering, hvem som ser hvilke klienter, og hvem som kan åpne, invitere, endre og arkivere, er uendret. Nøkkeltall, filterrad og tabell flyttes til `design-system.css`. CSS for `.main-*`, `.client-*`, `.filter-*`, `.table-wrap`, `.row-actions` og `.metric-card` slettes.
- **Steg 16, ressursbiblioteket, redigering og sending:** `renderResources`, `createResourceCard`, `createResourcePreview`, `renderResourceAdminSection`, `openResourceAdminEditor`, blokkredigeringen og `openSendResourceDrawer` bygges med byggeklossene. Broen for ressursinnhold i `design-system.css` erstattes av egne byggeklosser. Feltene, det som lagres, publiseringskravene og reglene for deling er uendret. CSS for `.resource-*` og `.send-resource-*` slettes.
- Ingen steg endrer data, tilgangsregler eller databasefunksjoner.
