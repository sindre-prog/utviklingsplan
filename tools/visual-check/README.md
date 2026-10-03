# Skjermbildesett

Viser portalen med fiktive data, uten innlogging og uten kobling til databasen. Brukes til å ta samme sett skjermbilder før og etter en endring (se `docs/DESIGNSYSTEM_PLAN_V1.md`, punkt 6 og 7).

- `preview.html` leser `index.html` og `app.js` direkte, så settet følger alltid portalen slik den er. Supabase byttes ut med en frakoblet stub, slik at ingenting kan leses fra eller skrives til databasen.
- `components.html` viser byggeklossene i `design-system.css`, laget med `ds`-funksjonene i `app.js`.
- `sketches.html` viser skissene for steg 10 (dialogene, velgeren for lederkompetanser, innlogging og samtykke, i `sketches.js`) og steg 14 (coachens skjermer, i `sketches-coach.js`). Portalen startes som i `preview.html`, og deretter vises skissen. Byggeklossene som bare finnes i skissene for steg 14, ligger i `sketches.css`. Se `docs/DESIGNSKISSER_STEG10.md` og `docs/DESIGNSKISSER_STEG14.md`.

## Bruk

Start en statisk server fra roten av repoet:

```bash
python3 -m http.server 8770
```

Åpne for eksempel `http://localhost:8770/tools/visual-check/preview.html?scene=workspace&pane=work`.

| Parameter | Verdier |
|---|---|
| `scene` | `now-empty`, `now-draft`, `now-inner-only`, `now-complete`, `now-active`, `rich`, `workspace`, `focus-detail`, `focus-many`, `direction-partial`, `chooser-empty`, `chooser-two`, `chooser-three` |
| `pane` | `now`, `direction`, `work`, `sessions`, `reflections`, `resources` |
| `role` | `client` (standard) eller `coach` |
| `view` | Utviklingsfokus: `assignments`, `competencies` eller `experiments` |
| `edit` | Åpner en tittel for redigering, for eksempel `focus:0:title` |
| `query` | Velgeren: søkeord som står i søkefeltet når velgeren åpnes |
| `mobilepreview` | Velgeren på mobil: viser én kompetanse i stedet for listen |
| `dialog` | Åpner en dialog: `experiment-new`, `experiment-edit`, `experiment-review`, `confirm`, `confirm-remove`, `message`, eller med `role=coach`: `client-invite`, `client-edit`, `resource-edit` og `resource-send` |
| `screen` | Viser en skjerm før portalen: `login`, `password`, `reconnect` eller `consent` |
| `page` | Viser en coach-side med fiktive klienter, coacher og ressurser: `clients`, `clients-empty`, `resources` eller `admin` (med `role=admin`). Med `page=admin` åpner `dialog=resource-new` en ny ressurs |
| `sketch` | Bare i `sketches.html`: navnet på skissen, se `sketches.js` og `sketches-coach.js`. Ressursbiblioteket tar også `guidance=1` («Før du deler» åpen) og `mobilepreview=1`, og ressursredigeringen `part=innhold` |

Ta hele settet og sammenlign (krever `puppeteer-core` og Chrome):

```bash
node tools/visual-check/shoot.js /tmp/vc/for
# … gjør endringen …
node tools/visual-check/shoot.js /tmp/vc/etter
node tools/visual-check/compare.js /tmp/vc/for /tmp/vc/etter
```

Et tredje argument til `shoot.js` filtrerer på navn, for eksempel `"forlopet|akkurat-naa"`. Skissene tas bare når filteret nevner dem, for eksempel `"skisse-.*-(1440|390)$"`. Sett `PUPPETEER_MODULE` og `CHROME_PATH` hvis de ligger et annet sted enn standard. Skjermbildene skal ikke legges i repoet.
