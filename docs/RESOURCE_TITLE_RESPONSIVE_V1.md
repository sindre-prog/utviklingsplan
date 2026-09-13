# Lange ressurstitler: lokal retting

Status 13. september 2026: Implementert og kontrollert lokalt etter brukerens godkjenning. Ikke produksjonsført. Brukeren skal se før/etter-visningen før eventuell produksjonsgodkjenning.

## Avgrensning

Lange ressurstitler skal holde seg innenfor ressursvisningen, også på mobil og i smale previewkolonner. Selve tittelteksten og eksisterende skriftstørrelser skal beholdes. Ingen endring av innhold, illustrasjoner, PDF-er, klientdata, delinger eller lagringslogikk.

## Rettelse

En mobilregel med `overflow-wrap: break-word` og standard minimumsbredde for grid-elementer lot lange ord utvide overskriften utover beholderen.

Eksisterende, felles regler i `styles.css` er rettet:

- `min-width: 0` på `.client-resource-view-title` og dens `h3` innenfor `.resource-workspace-v2` lar overskriften krympe med tilgjengelig bredde.
- `overflow-wrap: anywhere` hindrer at lange ord stikker utenfor. Den motstridende mobildeklarasjonen er fjernet.
- `hyphens: auto` bruker portalens eksisterende `lang="no"` for orddeling der nettleseren støtter det. `text-wrap: balance` balanserer linjene. Nødlinjebryting fungerer også uten støtte for disse egenskapene.

Ingen nye selektorer, tittelspesifikke unntak eller ekstra CSS-overstyringer. Fontfamilie, størrelse, vekt, linjehøyde, tegnavstand og farge er uendret. Appkode og dataschema er urørt.

## Verifikasjon

564 før/etter-kontroller med Playwright og Chrome mot de faktiske ressurskomponentene i lokale, rolletypiske beholdere:

- Alle 63 ressurstitler ved 320 og 1280 piksler i klientvisning, coachens klientvisning, coachbibliotek og adminpreview.
- Fem utvalgte titler i de samme fire visningene ved 390, 430 og 768 piksler.
- Ingen gjenværende titteloverløp, overlapping med etterfølgende tekst eller nye horisontale sideoverløp. Ingen JavaScript-feil.
- Identisk titteltekst, rendret ressurs-HTML og kontrollerte fontverdier før/etter. Mobil- og desktopskjermbilder er kontrollert visuelt.

Testen bruker en lagret ressurssnapshot og syntetiske delinger i minnet. Ingen backendkall eller klientskriving. Ingen ny QA-infrastruktur er lagt til i repoet. Safari og fysiske mobilenheter er ikke testet.

Lokal før/etter-visning: `http://localhost:8027/resource-title.html?ressurs=beslutningsprinsipper`. Testresultat og skjermbilder ligger i den tilhørende oppgavens `artifacts/resource-title-responsive-v1-test.json` og `artifacts/resource-title-*.png`.

## Ved Eventuell Publisering

Krever eksplisitt produksjonsgodkjenning. Følg eksisterende publiseringsrutine, oppdater stylesheetens cacheversjon i `index.html`, og kontroller den publiserte visningen. Ingen databasemigrasjon er nødvendig.
