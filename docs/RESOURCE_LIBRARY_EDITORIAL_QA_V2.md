# Redaksjonell QA V2: avvist og tilbakeført

## Gjeldende status

13. september 2026: Brukeren avviste omtegningene og endringen av Kübler-Ross-kurven. Hele den lokale batchen `0cd3bc9` er tilbakeført i `1f02e1a`, også tekst som var tilpasset de nye figurene. Ingen del ble merget, lastet opp eller produksjonsført.

Migrasjonen `20260913000000_resource_editorial_qa_v2.sql`, de sju nye illustrasjonene, PDF-en og opplastingsmanifestet er fjernet fra aktivt repo. De skal ikke hentes tilbake fra git-historikk eller midlertidige QA-filer som en godkjent leveranse.

Alle tidligere produksjonsførte endringer før denne batchen bevares. Originale ressurstekster og filer er ikke endret av tilbakeføringen.

## Arbeidsform videre

- **Ikke lag, tegn om eller erstatt illustrasjoner eller PDF-er.** Bevar brukerens originaler. Eventuelle feil i dem beskrives som merknader.
- QA skal ikke brukes til å erstatte en etablert modell med en annen fremstilling. Forbehold om modellbruk er ikke i seg selv grunnlag for å fjerne en kurve.
- Skill dokumenterbare feil fra redaksjonelle preferanser og faglige modellvalg. Ikke behandle alle tre som automatiske rettelser.
- Bevar ressursenes stemme, faglige innhold og oppgaver. Ikke fjern forskningsomtale generelt, forkort alle introduksjoner eller bygg om øvelsene under dekke av QA.
- Foreslå små, konkrete før/etter-rettelser med begrunnelse før ny implementering. Produksjon krever egen eksplisitt godkjenning.
- Ingen klientdata, delinger, godkjenningsmetadata eller publiseringsstatus skal endres som sidearbeid.

## Sortering av funn

**Konkrete feil som kan klargjøres som små tekstrettelser:** avrevne listepunkter som «situasjonen krever HR-», feilplassert «prioritering eller kommunikasjon» under Ikke egnet når, og meldingsforslag som motsier oppgaven. Manglende eller upresise kildeopplysninger dokumenteres og presiseres uten å omskrive hele klientteksten.

**Krever redaksjonell eller faglig avklaring:** nye oppgavesteg, endrede innganger til øvelser, forkorting av introduksjoner, bytte av begreper og samordning mellom forskjellige modellvarianter. Ingen slik endring er godkjent gjennom den avviste V2-batchen.

**Merknader, ikke illustrasjonsarbeid:** forskjeller mellom fem reaksjoner i Kübler-Ross-teksten og sju ledd i figuren, E-begrepet i ABCDE og øvrige figurmerknader. Originalene skal stå. At en pedagogisk figur har akser eller en skjematisk kurve, gjør den ikke automatisk til en påstand om målte data.

Full QA-rapport og kildekontroll er bevart i taskens `outputs/RESSURSBIBLIOTEK_REDAKSJONELL_QA_2026-09-12.md`. Rapportens opprinnelige kategorier blandet feil og vurderinger; rapporten er derfor ikke en ferdig godkjent retteliste.
