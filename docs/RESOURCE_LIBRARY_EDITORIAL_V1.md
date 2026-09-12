# Redaksjonell forbedring av eksisterende ressurser V1

## Status og godkjenning

12. september 2026: lokalt implementert etter brukerens «Kjør» til en avgrenset redaksjonell batch. Ikke produksjonsført eller pushet. Dette er rettelser i tolv eksisterende ressurser, ikke ytterligere tolv nye ressurser.

Autoritativ endring ligger i `supabase/migrations/20260912190000_resource_editorial_corrections_v1.sql`. SQL-payloaden er den nøyaktige teksten som skal vurderes. Eldre seed-migrasjoner skal ikke omskrives.

Produksjonsinnlegging krever egen godkjenning. Ikke kjør generell database-push som del av annen publisering uten å ta stilling til denne ventende migrasjonen.

## Omfang

| Ressurs | Endring | Bevares |
| --- | --- | --- |
| Bruk en styrke på en ny måte | Korrigerer `basis` til riktig øvelse og avgrenser effektpåstanden. | Introduksjon, oppgave og neste steg. |
| Takknemlighetsbesøket | Korrigerer `basis` til riktig øvelse og oppfølgingstid. | Hele klientteksten. |
| Deg på ditt beste | Korrigerer `basis`; beskriver portaløvelsen som en tilpasning. | Hele klientteksten. |
| Delegeringskart | Fire konkrete punkter per oppgave, ett eksempel og en avklaring som neste steg. Rydder feilplassert coachveiledning i `not_for`. | Tittel, introduksjon og rolle som kartlegging før selve delegeringen. |
| Beslutningsprinsipper | Starter med et dilemma; prøver et konkret prinsipp mot en virkelig beslutning og en vanskelig grensesituasjon. | Tittel, introduksjon og formål. |
| ABCDE-modellen | Gjør A–E eksplisitt, med spørsmål og ett gjennomgående eksempel. | Identitet, filer og illustrasjonsreferanser. |
| ABCDE-modellen for prestasjonsforbedring | Presiserer D som undersøkelse, E som forståelse og handling, og den fremoverskuende bruken. | Egen ressurs og eksisterende delinger. Ingen sammenslåing. |
| Mitt lederprosjekt | Én kobling til portalmodellen og et konkret neste steg. | Den langsiktige refleksjonen og alle opprinnelige spørsmål. |
| Pusteøvelser for stressregulering | Presise, uanstrengte instrukser; skiller teknikker og dokumentasjon; fjerner autoritetsargumentet om spesialstyrker. | De fire øvelsene og tittelen. |
| Motivation to lead | Retter «Chen» til «Chan». | Alt annet, også innholdsblokker og filreferanser. |
| Kübler-Ross endringskurve | Neste steg ber om observasjon og undersøkelse, ikke plassering av mennesker på kurven. | Hele innholdsteksten og alle filer. |
| Tre gode ting | Deler to sammenklistrede spørsmål. | Øvrig tekst og faggrunnlag. |

Ingen generell språkvask. AIDA, Mandatkort, Spørsmål i coachende ledelse og Observasjonsoppdrag er ikke endret. Forslagene om nye ressurser, Psykologisk trygghet i praksis og Interessentkart er en annen batch og inngår ikke her.

## Redaksjonelle avklaringer

- Delegeringskart er en struktur for notater om oppgaver, nåværende eier, ønsket eier og nødvendige avklaringer. Det innføres ikke et nytt lagringsskjema. Planlegging av selve overføringen hører til «Deleger for utvikling, ikke bare avlastning».
- ABCDE-variantene beholdes. Forslaget er å bruke grunnvarianten til etterrefleksjon og prestasjonsvarianten til forberedelse. Begge må undersøke tolkninger, ikke bare erstatte ubehagelige tanker med positive. Dette er redaksjonelle tilpasninger, ikke to selvstendig validerte metoder.
- Mitt lederprosjekt skal ikke innføre et tredje prosjektbegrep. Refleksjonen brukes som grunnlag for ytre prosjekt. Indre prosjekt er lederkompetansene som støtter dette. Forløpet samler mål og rammer.
- Pusteøvelsene lover ikke behandling eller dokumentert lik effekt på tvers av teknikker. Et kort forsøk i portalen er ikke identisk med en studie av daglig praksis.
- Introduksjonen synkroniseres til `summary` og `client_intro` bare i de to ressursene der introduksjonen faktisk endres: ABCDE-modellen og Pusteøvelser for stressregulering. Historiske forskjeller i andre ressurser ryddes ikke som sidearbeid.
- PDF-er og illustrasjoner oppdateres ikke. Portaltekst og PDF kan ha ulike roller. Eventuell faglig motstrid i en eksisterende PDF må vurderes før produksjonsgo; denne batchen har ikke gjennomgått selve PDF-filene.

## Datavern og produksjonskontroll

Baseline er lest fra de aktuelle ressursene i produksjon 12. september 2026. Ingen klientprofiler, refleksjoner eller e-poster er hentet inn til lokal forhåndsvisning.

Migrasjonen oppdaterer eksisterende rader etter stabil slug. Den endrer ikke ID, tittel, slug, status, synlighet, godkjenningsmetadata, filer, emneknagger, delinger, klientrespons eller e-postkø. Ingen nye tabeller, RPC-er, UI-komponenter eller CSS-regler innføres i portalen.

Hver rad har kontrollsum av bare feltene som skal endres. Alle tolv rader låses og valideres før noen oppdateres. Hvis et berørt felt har fått en nyere redigering, eller en ressurs mangler, avbrytes hele SQL-blokken. Endringer i andre felter bevares. En rad som allerede har den nøyaktige rettelsen hoppes over, også uten endring av `updated_at`.

Ved senere produksjonsgo:

1. Kontroller at arbeidsmappen og migrasjonslisten bare inneholder godkjente endringer.
2. Kontroller gjeldende berørte felt mot baseline; ikke fjern konfliktsjekken for å tvinge gjennom en batch.
3. Bevar en kopi av berørte felt før innlegging, og noter antall ressurser, filer og delinger.
4. Kjør bare godkjent migrasjon og kontroller feltene etterpå.
5. Husk at publiserte ressurser leses av eksisterende delinger: en tekstendring blir synlig også for klienter som allerede har ressursen. Ingen e-post sendes av migrasjonen.

## Verifikasjon

Lokal PostgreSQL-test kjører migrasjonen mot midlertidige kopier av eksisterende ressurstabell, med dagens tolv ressursversjoner som testgrunnlag. Alt rulles tilbake; lokal hoveddatabase og produksjon er uendret.

Kontrollert:
- Alle tolv rettelser gir forventede feltverdier.
- Antall ressurser og alle uvedkommende rader/felter er uendret.
- Illustrasjons- og nedlastingsreferanser i innholdet er identiske før og etter.
- Gjentatt kjøring er en no-op, inkludert tidsstempel.
- Nyere redaksjonell endring og manglende ressurs avviser hele batchen.
- Alle tolv før/etter-par er kontrollert med Playwright i 1280 og 390 pikslers bredde, med eksisterende renderer, ressurs-wrapper og portalens fonter. Ingen nye overflytfeil, ukjente blokktyper eller JavaScript-feil. Seks skjermbilder er tatt, og desktop-/mobilvisning er visuelt kontrollert.

Eksisterende UI-funn, utenfor denne batchen: Titlene «Beslutningsprinsipper», «ABCDE-modellen for prestasjonsforbedring» og «Takknemlighetsbesøket» gir overflyt i tittelbeholderen ved 390 piksler. Samme overflyt finnes med originalinnholdet. Ikke endre titler eller legg til lokal CSS-lapping for å skjule dette som del av innholdsarbeidet; håndter responsiv tittellayout separat.

Før/etter-visningen er en midlertidig, skrivebeskyttet lokal tekstvisning med eksisterende ressursrenderer og CSS. Den viser ikke PDF-filer eller private lagringsbilder og har ingen delings-, lagrings- eller e-postfunksjon. Dette er ikke ny QA-infrastruktur eller en ny portalflate.

## Kilder

Kildene er kontrollert for de konkrete rettelsene, ikke brukt som generell autoritet for hele biblioteket.

- [Seligman, Steen, Park og Peterson (2005)](https://ppc.sas.upenn.edu/sites/default/files/ppprogressarticle.pdf): separate øvelser og resultater; se faggrunnlaget i de tre rettelsene.
- [Albert Ellis Institute: REBT](https://albertellis.org/rebt-cbt-therapy/): undersøkelse av antakelser og mer holdbare forståelser.
- [University of Connecticut: ABCDE](https://nrcgt.uconn.edu/underachievement_study/school-perceptions/sp_section14/): begrepsrekkefølgen, ikke dokumentasjon av denne ledertilpasningen.
- [Chan og Drasgow (2001)](https://pubmed.ncbi.nlm.nih.gov/11419808/): korrekt forfatternavn.
- [Balban et al. (2023)](https://doi.org/10.1016/j.xcrm.2022.100895): de undersøkte pusteteknikkene og forsøksopplegget.
- [NHS: Breathing exercises for stress](https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/) og [NHS: Nervous system regulation](https://www.asph.nhs.uk/nervous-system-regulation): uanstrengt pust og avbrudd ved svimmelhet.
- [Andrew Weil Center: 4-7-8](https://awcim.arizona.edu/content/CLH00048.html): rytmebeskrivelse. Praktisk veiledning, ikke effektstudie.
