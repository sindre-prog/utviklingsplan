# Ressursmodulen

Dette er den avgrensede frontendmodulen for ressursbibliotek, ressursvisning, deling og ressursfiler.

## Importmønster

`index.html` importerer `resources.api.js` fra den eksisterende `<script type="module">`-blokken og eksponerer den på:

```js
window.RaederResourceLibrary
```

`app.js` er fortsatt en klassisk deferred scriptfil. Ressurslogikk skal likevel ligge i denne modulen og eksponeres gjennom `resources.api.js`.

## Grense

`app.js` kan bruke det offentlige API-et for routing, initiering og orkestrering.

Ressursspesifikk logikk skal ligge her:

- constants
- queries
- mutations
- content block rendering
- resource components
- taksonomi og kompatibilitetsnormalisering
- seed helpers

Ikke legg ny ressursforretningslogikk direkte i `app.js`.

## Produktkontrakter

### Kort introduksjon

Editor viser ett felt: `Kort introduksjon`.

- Ved lesing brukes `client_intro`, deretter `summary` som fallback.
- I biblioteket avkortes teksten visuelt.
- I ressursvisningen brukes teksten som ingress.
- Ved lagring fra editor skrives samme verdi til både `summary` og `client_intro`.

De to databasefeltene beholdes foreløpig for kompatibilitet. Ikke introduser dem som to separate editorfelt igjen.

### Refleksjonsspørsmål

Nye refleksjonsspørsmål redigeres som `reflection_questions` i `content_json`. Det eldre toppnivåfeltet `reflection_prompts` bevares i databasen, men vises ikke som et parallelt editorfelt. Når en eldre ressurs uten spørsmålsblokk åpnes i editoren, legges de eksisterende spørsmålene inn som en blokk i utkastet.

### Portalinnhold, PDF og bilder

Native `content_json` er et selvstendig redaksjonelt format. Det skal gi verdi uten PDF og kan avvike fra PDF-versjonen.

- Første `printable` etter `sort_order` er ressursens fremhevede PDF-versjon.
- `printable` betyr godkjent, klientrettet PDF. Faglige kilder og supplerende filer er `attachment`.
- Primær PDF vises høyt, men skal ikke dupliseres i en senere nedlastingsblokk eller filliste.
- `cover_image` brukes i PDF-flaten når det finnes.
- `illustration`-blokken velger en opplastet illustrasjon og kan flyttes til ønsket sted i innholdsrekkefølgen.
- Klientvisning, coachpreview og adminpreview skal bruke samme fil- og innholdslogikk.
- Editor foreslår filtype fra den valgte filen: PDF blir `printable`, bilder blir `illustration`, og lyd/video får tilsvarende type. Redaktøren kan endre PDF til `attachment` når dokumentet er en kilde eller et supplement.
- Editor skal avvise åpenbare typekonflikter, som PDF lagret som bilde/illustrasjon eller en ikke-PDF lagret som `printable`.

### Utviklingsområde

Ressursen kan ha ett primært område: `Utviklingsløpet` eller ett av lederkompetansenes etablerte utviklingsområder. Området lagres som `area:<key>` i `resource_tags`.

- Bruk kontrollert valg i UI, aldri fritekst for området.
- Bevar eksisterende emneknagger når området endres.
- Ukategoriserte ressurser skal fortsatt være synlige.
- Bruk `Utviklingsløpet` for tverrgående metodeinnhold i selve utviklingsarbeidet, aldri som en generell `Annet`-kategori.

Den autoritative produktbeskrivelsen ligger i `docs/RESOURCE_LIBRARY_CONTRACT.md`.

### Editorgrense

Den daglige editoren skal prioritere tittel, kort introduksjon, utviklingsområde, type, tidsbruk og faginnhold. `slug`, `format`, språk og eldre vanskelighetsgrad er kompatibilitetsdata og skal ikke gjeninnføres som ordinære brukerfelt uten en ny produktbeslutning. Status, synlighet og faglig vurdering hører hjemme under `Publisering og kvalitet`.
