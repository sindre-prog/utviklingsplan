# Redaksjonell QA: rettingsrunde V2

## Status

13. september 2026: implementert og testet lokalt etter brukerens «kjør» til en avgrenset rettingsrunde. **Ikke godkjent for produksjon, ikke merget og ikke lastet opp til produksjonslageret.**

Arbeidsgren: `content/resource-editorial-qa-v2`. Denne batchen endrer innhold og tilhørende fagfigurer, ikke appkode, CSS, dataskjema, klientflyter eller e-postmaler.

Autoritativ tekst og feltbaseline ligger i `supabase/migrations/20260913000000_resource_editorial_qa_v2.sql`. Filene ligger i `supabase/resource-assets/editorial-v2/`; `manifest.json` angir nye lagringsstier, fil-ID-er, MIME-type, størrelse og SHA-256. Eldre migrasjoner og lagringsobjekter er ikke overskrevet.

Utgangspunktet var lesende QA av alle 63 produksjonsressurser: 49 publiserte og 14 utkast. Fullrapport og uttrekk finnes i denne taskens `outputs/RESSURSBIBLIOTEK_REDAKSJONELL_QA_2026-09-12.md` og `artifacts/resource-editorial-qa-snapshot-20260912.json`, under `/Users/sindrejobb/Documents/Codex/2026-08-27/raeder-conversation-readiness-v1/`.

## Omfang

24 ressursrader får tekstendringer. Åtte eksisterende filrader får nye lagringsstier og navn: sju illustrasjoner og én PDF. Totalt berøres 25 publiserte ressurser, siden ABCDE kun får ny figur.

| Ressurs | Rettelse |
| --- | --- |
| 2-minuttersregelen | Avgrenser når regelen brukes og oppgir David Allen. Test-PDF bevares. |
| Å akseptere frykt | Identifiserbar ACT-kilde og tydelig redaksjonell tilpasning. |
| ABCDE-modellen | Ny redigerbar figur med samme A-E-begreper som teksten. Klientteksten er uendret. |
| Aksepter deg selv | Krediterer Neff og skiller lesesetninger fra spørsmål. |
| Beslutningsprinsipper | Meldingsforslaget starter med ett dilemma og ett prinsipp, som oppgaven. |
| Bruk en styrke på en ny måte | Nøktern introduksjon, alternativ uten VIA-resultat og presis tidsangivelse. Avgrenser forskning i basis. |
| Deg på ditt beste | Kortere og tydeligere opphav i basis; klientoppgaven bevares. |
| Eisenhower-matrisen | Fjerner påstand om fast dagskvote for kapasitet. Figuren sier deleger eller avklar. |
| Etterkritikk / Debrief | Fjerner prestisjeargumentet. Konkret neste steg og avgrensning mot traumebearbeiding. |
| Fokusblokkering | Fjerner effektløftet og uforklart presisjon. Fleksibelt tidseksempel og konkret kilde. |
| Karrieregrafen | Merker oppdiktet eksempel, forklarer skalaen og presiserer tilhørighet. Separate stolper erstatter kurve mellom kategorier. |
| Kontrollsirkelen | Skiller valg fra automatiske reaksjoner. Samordner tekst, spørsmål og figur. |
| Kübler-Ross endringskurve | Fem reaksjoner i tekst, figur og PDF. Ingen målekurve, tidsakse eller fast trinnrekkefølge. |
| Ledermøter | Fjerner uverifisert sitat og forskningspåstand om nøyaktig tre faktorer. Praktiske råd bevares. |
| Mitt lederprosjekt | Meldingsforslaget forutsetter ikke en samtale samme dag. |
| Møteanalyse | Retter fragmenterte unntak, skiller observasjon fra tolkning og gir neste steg. |
| Omvend din indre kritiker | Undersøker både støtte og motinformasjon; antar ikke én universell årsak til selvkritikk. |
| Pareto-prinsippet | Samme 80/20-forbehold i tekst, oppgave og figur. Ivaretar støttearbeid, ansvar og risiko. |
| Prioriteringsrammeverk | Retter feilplassert forbehold og kobler neste steg til gjeldende utviklingsmodell. |
| Pusteøvelser for stressregulering | Meldingsforslaget begynner med rolig utprøving og beholder stoppinstruks. |
| Skap gjennomslag uten formell myndighet | Skiller fire redaksjonelle kort fra French og Ravens modell. Konkrete kilder. |
| Takknemlighetsbesøket | Nøktern introduksjon. Spørsmål fungerer også uten at brevet deles. Presis kildeavgrensning. |
| Tankefeller | Samme ti navn i figur og tekst; fullfører nummerering og metodehenvisning. |
| Tre gode ting | Fjerner effektløfte fra ingressen og presiserer videre praksis i kildefeltet. |
| Vanskelige samtaler | Reparerer HR-forbehold og åpner for pause, nye fakta og korrigering av egne feil. |

Dette er ikke en erklæring om at alle funn i fullrapporten er lukket. Øvrige P2-presiseringer, generelt vedlikehold og ferdigstilling av utkast inngår ikke.

## Redaksjonelle avklaringer

- Klientintroduksjonen forklarer nytten uten å love effekt. Det faglige grunnlaget beskriver opphav, forskningsresultat og vår tilpasning. `basis` er et adminfelt, ikke ordinær klienttekst.
- Bare de fire introduksjonene som faktisk endres synkroniseres til `summary` og `client_intro`. Ingen generell synkronisering av historiske forskjeller.
- Meldingsforslagene er forslag i ressurseditoren. Ingen allerede sendt coachmelding eller transaksjonell e-postmal endres.
- Ressursen «Skap gjennomslag uten formell myndighet» får en konkret Yukl/Falbe 1990-henvisning for påvirkningstaktikker. Den usikre navneformen på en medforfatter i 1995-kilden kopieres ikke videre eller automatisk korrigeres i andre ressurser.
- Originalfigurene hadde tekst som konturer. Nye SVG-er lagrer lesbar tekst og er selvstendige redigerbare filer. De er laget som fagdiagrammer, ikke som nye UI-komponenter.
- **Kübler-Ross:** Den gamle sjuleddsfiguren og PDF-en stemte ikke med ressursens fem reaksjoner. Forslaget beholder ressursens tittel og de fem reaksjonene, men viser en reaksjonsoversikt uten påstått målkurve. «Nedstemthet» er eksplisitt en arbeidslivstilpasning, ikke en diagnose. Dette bør gjennomgås visuelt før produksjonsgodkjenning.
- PDF-en er en separat, én-sides leveranse av samme femfeltsfigur. Den er laget fra den redigerbare SVG-en med nettleserens PDF-rendering. Ingen originalfil er redigert over.

## Bevares og holdes utenfor

- Alle 14 utkast, inkludert fire tomme, beholder innhold og status.
- Ressurs-ID, slug, tittel, type, synlighet, publiseringsstatus, godkjenningsmetadata, emneknagger og redaktøridentiteter bevares.
- Eksisterende delinger, personlige coachmeldinger, klientrespons, klientprofiler og e-postkø berøres ikke.
- `Forside.pdf` på 2-minuttersregelen bevares som bevisst testvedlegg. Den blir ikke omklassifisert eller fjernet uten egen avklaring.
- Forskningsartikkelen på Motivation to lead er uendret. QA-en dokumenterer ikke distribusjonsrettighetene til denne fullteksten.
- Ingen personer føres opp som faglig godkjenner, og ingen godkjenningsdato settes automatisk.

## Sikker innlegging etter eventuell godkjenning

1. Kontroller at brukeren har godkjent både tekst, figurer og PDF. Se denne batchen samlet; ikke publiser bare tekst eller bare bilder.
2. Ta et nytt, lesende uttrekk av berørte felt og filreferanser. Bevar førverdier for eventuell reversering. Nyere redigeringer skal ikke overskrives.
3. Kontroller lokal filstørrelse og SHA-256 mot manifestet. Last opp de åtte filene til nøyaktig de nye stiene i privat `resource-assets` med riktig MIME-type. Ikke overskriv eller slett gamle objekter. Finnes en ny sti fra et tidligere forsøk, sammenlign filinnhold før eventuell gjenbruk.
4. Les de opplastede filene tilbake og kontroller SHA-256, størrelse, MIME-type og at de åpnes. SQL sjekker at objektnavnene finnes, men kan ikke bevise at opplastede bytes er riktige; derfor er denne kontrollen obligatorisk.
5. Kjør bare godkjent migrasjon. Alle ressurser og filreferanser valideres før første oppdatering. Konflikt, manglende objekt eller endret publiseringsstatus avbryter hele SQL-blokken.
6. Kontroller forventede etterverdier og at øvrige rader, delinger, klientrespons og meldingskø er uendret. Kontroller privat filtilgang og PDF-knapp med avtalt testklient, aldri ved å skrive testdata på ekte klienter.
7. Oppdater status i dette dokumentet etter faktisk produksjonssetting. Gamle objekter beholdes for sporbarhet.

Ressurser leses av eksisterende delinger: en godkjent produksjonsrettelse blir også synlig for klienter som allerede har ressursen. Migrasjonen sender ingen e-post. Samme rettelse kan kjøres igjen uten nye tidsstempelendringer.

## Lokal verifikasjon

- Reell PostgreSQL kjørte SQL-blokken mot midlertidige tabeller med snapshot av ressursinnholdet. Alle testtransaksjoner ble rullet tilbake. Lokal hoveddatabase og produksjon ble ikke oppdatert.
- Alle 24 tekstendringer og åtte filendringer gir forventede feltverdier.
- Alle 63 ressurser og 21 filreferanser bevares; utkast og uvedkommende felt/rader er uendret. Nyere redigering i et uberørt felt bevares.
- Gjentatt kjøring er en no-op, inkludert tidsstempler.
- Testet full avvisning og ingen delvise endringer ved nyere tekst, manglende ressurs, endret publiseringsstatus, manglende fil, nyere filnavn, arkivert fil og manglende opplasting.
- 25 før/etter-par er testet i både klient- og coachvisning ved 1280 og 390 pikslers bredde, med eksisterende renderer og CSS. Ingen JavaScript-feil, ukjente blokktyper, nye tekstoverflytfeil eller blanke bilder. PDF-knappen åpner korrekt lokal PDF.
- Alle sju SVG-er er rendret, lest visuelt og kontrollert for tekst utenfor bildeflaten. PDF-en er én side, har søkbar tekst og er rendret og kontrollert visuelt.
- Eksisterende mobiloverflyt på titlene Beslutningsprinsipper, Prioriteringsrammeverk og Takknemlighetsbesøket er uendret. Ikke legg til CSS-lapping i denne innholdsbatchen.
- Ingen ny QA-infrastruktur er lagt inn i repoet. Engangstester og før/etter-visning ligger i task-/tempområdet.

Lokal før/etter-visning: [Redaksjonell rettingsrunde](http://localhost:8027/editorial-v2.html). Dette er en skrivebeskyttet lesekopi med lokale filer, ikke en innlogget portal eller en ny produktflate.

## Kildegrunnlag

Kilderegister og kontrollnivå per ressurs står i fullrapporten. For nye presiseringer er blant annet følgende primærkilder brukt:

- [Seligman, Steen, Park og Peterson (2005)](https://ppc.sas.upenn.edu/sites/default/files/ppprogressarticle.pdf): konkrete øvelser og resultatavgrensning.
- [Kristin Neff: Self-Compassion Break](https://self-compassion.org/exercises/exercise-2-self-compassion-break/): metodeopphav.
- [Beck Institute: Testing Your Thoughts](https://beckinstitute.org/wp-content/uploads/2021/08/Testing-Your-Thoughts-Worksheet.pdf): balansert undersøkelse av tanker.
- [David Allen: When to use GTD's Two-Minute Rule](https://gettingthingsdone.com/2011/06/when-to-use-gtds-two-minute-rule/): bruksområde.
- [Leroy (2009)](https://doi.org/10.1016/j.obhdp.2009.04.002): oppmerksomhet ved oppgavebytte.
- [Bang mfl. (2010)](https://doi.org/10.1111/j.1467-9450.2009.00769.x): måltydelighet, fokusert kommunikasjon og læringsatferd i ledermøter.
- [ACBS: The Six Core Processes of ACT](https://contextualscience.org/six_core_processes_act): aksept og valgt handling.
- [Yukl og Falbe (1990), forfatteropplastet original](https://www.researchgate.net/profile/Gary-Yukl/publication/232570561_Influence_Tactics_and_Objectives_in_Upward_Downward_and_Lateral_Influence_Attempts/links/02e7e52ed0e26eab43000000/Influence-Tactics-and-Objectives-in-Upward-Downward-and-Lateral-Influence-Attempts.pdf): påvirkningstaktikker i ulike relasjoner.

Ikke alle bakgrunnsbøker er lest i fulltekst. Det hevdes ikke at våre arbeidsark er validert av disse kildene.
