# Skjermbildesett

Viser portalen med fiktive data, uten innlogging og uten kobling til databasen. Brukes til å ta samme sett skjermbilder før og etter en endring (se `docs/DESIGNSYSTEM_PLAN_V1.md`, punkt 6 og 7).

- `preview.html` leser `index.html` og `app.js` direkte, så settet følger alltid portalen slik den er. Supabase byttes ut med en frakoblet stub, slik at ingenting kan leses fra eller skrives til databasen.
- `components.html` viser byggeklossene i `design-system.css`, laget med `ds`-funksjonene i `app.js`.

## Bruk

Start en statisk server fra roten av repoet:

```bash
python3 -m http.server 8770
```

Åpne for eksempel `http://localhost:8770/tools/visual-check/preview.html?scene=workspace&pane=work`.

| Parameter | Verdier |
|---|---|
| `scene` | `now-empty`, `now-draft`, `now-inner-only`, `now-complete`, `workspace`, `focus-detail`, `focus-many`, `direction-partial`, `chooser-empty`, `chooser-two`, `chooser-three` |
| `pane` | `now`, `direction`, `work`, `sessions`, `reflections`, `resources` |
| `role` | `client` (standard) eller `coach` |
| `view` | Utviklingsfokus: `assignments`, `competencies` eller `experiments` |
| `edit` | Åpner et felt for redigering, for eksempel `direction:c_expect_client` eller `direction:frame` |

Ta hele settet og sammenlign (krever `puppeteer-core` og Chrome):

```bash
node tools/visual-check/shoot.js /tmp/vc/for
# … gjør endringen …
node tools/visual-check/shoot.js /tmp/vc/etter
node tools/visual-check/compare.js /tmp/vc/for /tmp/vc/etter
```

Et tredje argument til `shoot.js` filtrerer på navn, for eksempel `"forlopet|akkurat-naa"`. Sett `PUPPETEER_MODULE` og `CHROME_PATH` hvis de ligger et annet sted enn standard. Skjermbildene skal ikke legges i repoet.
