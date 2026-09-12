# Innholdsutvidelse for ressursbiblioteket V1

## Status

Dette dokumentet er det redaksjonelle og faglige beslutningsgrunnlaget for innholdsutvidelsen.

Alle tolv ressurser ble 12. september 2026 implementert lokalt som utkast i `supabase/migrations/20260912173000_seed_resource_content_expansion_v1.sql`. Migrasjonen bruker eksisterende ressursmodell, innholdsblokker og utviklingsområder. Den er verifisert mot lokal PostgreSQL, men er ikke kjørt mot production. Ressursene har `status = draft` og `review_status = draft` frem til innholdet er gjennomgått i admin-preview.

Formålet er å definere tolv nye ressurser som kan utvikles videre uten å gjøre biblioteket til en generell kursportal. Ressursene skal sendes av coach i en konkret sammenheng og støtte lederens arbeid mellom samtalene.

## Vurdering av CCL Activity Center

CCLs [Compass Book Activity Center](https://resources.ccl.org/compass-book-activity-center/) er nyttig som referanse for innholdsformat, ikke som tekstgrunnlag. Gjennomgangen 12. september 2026 omfattet hele oversikten med 121 lenkede aktiviteter under 52 lederkompetanser og et utvalg av selve arbeidsarkene på tvers av blant annet strategi, endring, påvirkning, tillit, problemløsning, delegering og utvikling av medarbeidere.

Flere av arbeidsarkene er på én side. [Delegation Evaluation](https://www.ccl.org/wp-content/uploads/2017/06/Delegating-Delegation-Evaluation.pdf) bruker en kort innledning og en konkret sjekkliste. [Planning to Influence](https://www.ccl.org/wp-content/uploads/2017/06/Influence-Planning-to-Influence.pdf) tar utgangspunkt i én kommende påvirkningssituasjon og leder brukeren gjennom en serie planleggingsspørsmål. De beste ressursene har fire kjennetegn:

- De tar utgangspunkt i én gjenkjennelig arbeidssituasjon.
- De ber lederen gjøre én avgrenset jobb.
- De kan brukes på kort tid uten et kurs rundt.
- De gir et konkret utgangspunkt for en senere samtale.

Vi bør bruke denne logikken, men ikke kopiere oppbygning, modeller, formuleringer eller spørsmål. CCL-materialet er opphavsrettslig beskyttet. Ræder&-ressursene skal være originale, bygge på relevant faglitteratur og passe portalens utviklingsmodell.

## Låst innholdsstandard

Hver ressurs skal:

- løse ett tydelig problem
- kunne stå på egne ben i portalen
- kunne gjennomføres på 10 til 20 minutter
- bruke en konkret situasjon fra lederens egen arbeidshverdag
- ende i en beslutning, observasjon eller handling
- ha to til fire refleksjonsspørsmål
- ha tydelig avgrensning mot terapi, personalsak, juridisk rådgivning eller annen bruk den ikke er laget for
- forklare faggrunnlaget nøkternt, uten å love mer effekt enn forskningen gir dekning for

Språket skal være konkret. Unngå formuleringer som «utforsk potensialet», «ta eierskap til reisen», «lås opp» og andre uttrykk som ikke forteller lederen hva som faktisk skal gjøres.

PDF skal bare lages når et arbeidsark, en tabell eller en utskriftsflate gir selvstendig verdi. PDF er ikke en kopi av portalteksten og er ikke nødvendig for alle ressurser.

## Foreslått første portefølje

### 1. Fra strategi til konkret lederpraksis

**Utviklingsområde:** Strategi, virksomhet og endring

**Type og fase:** Øvelse, fokus eller eksperiment
**Anslått tid:** 15 minutter

**Bruk når:** Lederen forstår en strategisk prioritering, men har ikke gjort den om til tydelige valg i egen lederhverdag.

**Ønsket resultat:** Én strategisk prioritering blir oversatt til to observerbare lederhandlinger, én handling som skal nedprioriteres, og et bestemt tidspunkt eller en situasjon der den nye praksisen skal tas i bruk.

**Kjerneøvelse:**

1. Skriv den strategiske prioriteringen med egne ord.
2. Beskriv hva medarbeidere eller kolleger skal merke hvis prioriteringen faktisk påvirker ledelsen din.
3. Velg to handlinger du skal gjøre oftere og én handling du skal gjøre mindre av.
4. Fullfør setningen: «Når [konkret situasjon oppstår], skal jeg [konkret handling].»
5. Velg ett tegn du kan observere etter to uker.

**Refleksjonsspørsmål:**

- Hvilket av dagens ledervalg trekker i motsatt retning?
- Hva vil gjøre det lett å falle tilbake til gammel praksis?
- Hvem vil merke endringen først?

**Avgrensning mot eksisterende bibliotek:** `Mitt lederprosjekt` avklarer den større leveransen lederen må lykkes med. `Mandatkort` avklarer ansvar og beslutningsrom. Denne ressursen brukes etterpå for å gjøre én strategisk prioritering om til konkret lederatferd.

**PDF-rolle:** Ikke nødvendig i første versjon. Portalinnholdet er tilstrekkelig.

**Faglig grunnlag:** Mål virker bedre når de er spesifikke og krevende, og når oppfølgingen gir informasjon om fremdrift. Implementeringsintensjoner kobler en bestemt situasjon til en bestemt handling og kan redusere avstanden mellom intensjon og gjennomføring. Ressursen bygger på [Locke og Latham (2002)](https://doi.org/10.1037/0003-066X.57.9.705) og [Gollwitzer (1999)](https://doi.org/10.1037/0003-066X.54.7.493).

### 2. Forstå motstand før du leder endring

**Utviklingsområde:** Strategi, virksomhet og endring

**Type og fase:** Refleksjonsøvelse, observasjon eller samtale
**Anslått tid:** 15 minutter

**Bruk når:** En endring møter lav oppslutning, stillhet, forsinkelse eller tydelige innvendinger, og lederen står i fare for å forklare reaksjonen som manglende vilje.

**Ønsket resultat:** Lederen skiller mellom det som faktisk er observert, mulige forklaringer og hva som må undersøkes før neste påvirkningsgrep.

**Kjerneøvelse:**

1. Beskriv atferden du observerer uten å tolke motivet.
2. Noter hva endringen kan oppleves å koste for dem som berøres.
3. Vurder om reaksjonen kan handle om endringens innhold, prosessen, lokal kontekst eller tidligere erfaringer.
4. Skriv ned hva du vet, og hva du bare antar.
5. Formuler to spørsmål som kan gi bedre informasjon.
6. Velg ett element i tilnærmingen du er villig til å justere.

**Refleksjonsspørsmål:**

- Hvilken legitim bekymring kan du ha undervurdert?
- Hva ved din egen fremgangsmåte kan bidra til reaksjonen?
- Hva må stå fast, og hva kan påvirkes?

**Avgrensning:** Ressursen skal ikke brukes til å psykologisere ansatte eller gjøre all kritikk til «motstand». Den erstatter ikke medvirkning, risikovurdering eller formelle prosesser.

**Avgrensning mot eksisterende bibliotek:** Ressursen dekker mottakerens reaksjon før lederen velger tiltak. Den dupliserer ikke `Kontrollsirkelen`, som handler om lederens egen bruk av oppmerksomhet og energi.

**PDF-rolle:** Et enkelt arbeidsark kan være nyttig, men bør vente til portalversjonen er prøvd i coaching.

**Faglig grunnlag:** Reaksjoner på organisatorisk endring påvirkes både av individuelle forhold, intern kontekst, endringsprosess, opplevd nytte eller tap og selve endringens innhold. Ressursen bygger på 60-årsgjennomgangen til [Oreg, Vakola og Armenakis (2011)](https://doi.org/10.1177/0021886310396550).

### 3. Definer problemet før du velger løsning

**Utviklingsområde:** Beslutninger, problemløsning og innovasjon

**Type og fase:** Arbeidsark, fokus eller samtale
**Anslått tid:** 15 minutter

**Bruk når:** En ledergruppe diskuterer tiltak før det er klart hvilket problem som skal løses, eller når symptomer og årsaker blandes sammen.

**Ønsket resultat:** En presis, foreløpig problemdefinisjon som kan undersøkes før det velges løsning.

**Kjerneøvelse:**

1. Beskriv hva som faktisk skjer med konkrete observasjoner eller data.
2. Beskriv gapet mellom dagens situasjon og ønsket situasjon.
3. Skill mellom symptom, mulig årsak og konsekvens.
4. Noter hvem som opplever problemet, og hvem som ikke gjør det.
5. List to alternative forklaringer som også kan passe med observasjonene.
6. Formuler problemet uten å bake inn en bestemt løsning.

**Refleksjonsspørsmål:**

- Hvilken løsning har du allerede forelsket deg i?
- Hva må du vite før problemdefinisjonen er god nok?
- Hvem ser situasjonen fra en annen vinkel?

**Avgrensning:** Ikke bruk øvelsen til å forsinke handling når situasjonen krever umiddelbar håndtering. Problemdefinisjonen er foreløpig og skal kunne endres når ny informasjon kommer.

**Avgrensning mot eksisterende bibliotek:** `Situasjonsanalyse` gir et bredt bilde av kontekst. Denne ressursen går smalere inn i ett problem og beskytter mot at en foretrukket løsning blir presentert som selve problemet.

**PDF-rolle:** Egner seg godt som ett-sides arbeidsark med egne felt for observasjon, gap, forklaringer og problemformulering.

**Faglig grunnlag:** Måten et uklart problem blir konstruert og representert på, påvirker videre problemløsning. Ressursen bygger på [Getzels (1979)](https://doi.org/10.1207/s15516709cog0302_4) og bokkapittelet om problemkonstruksjon i dårlig definerte problemområder av [Mumford, Reiter-Palmon og Redmond (1994)](https://digitalcommons.unomaha.edu/facultybooks/166/).

### 4. Test antakelsene bak beslutningen

**Utviklingsområde:** Beslutninger, problemløsning og innovasjon

**Type og fase:** Beslutningsøvelse, fokus eller eksperiment
**Anslått tid:** 12 minutter

**Bruk når:** En viktig beslutning hviler på flere usikre antakelser, særlig når gruppen raskt har samlet seg om én forklaring eller løsning.

**Ønsket resultat:** De mest kritiske antakelsene blir synlige, og minst én av dem blir undersøkt før beslutningen låses eller investeringen økes.

**Kjerneøvelse:**

1. Skriv beslutningen eller anbefalingen i én setning.
2. List tre forhold som må være sanne for at beslutningen skal være god.
3. Marker antakelsen som både er viktigst og mest usikker.
4. Beskriv hva du forventer å se hvis antakelsen er feil.
5. Finn den raskeste forsvarlige måten å hente inn relevant motinformasjon på.
6. Gjør en kort føranalyse: Tenk at beslutningen har mislyktes. Hva er den mest sannsynlige forklaringen?

**Refleksjonsspørsmål:**

- Hvilken informasjon ville fått deg til å skifte mening?
- Hvem har mest grunn til å se noe dere andre overser?
- Hva er kostnaden ved å teste antakelsen nå sammenlignet med å oppdage feilen senere?

**Avgrensning:** Ressursen skal ikke skape en forestilling om at alle skjevheter kan fjernes. Den skal gi bedre informasjonsinnhenting, ikke en fasit.

**Avgrensning mot eksisterende bibliotek:** `Beslutningslogg` dokumenterer beslutning, begrunnelse og utfall. `Beslutningsprinsipper` avklarer faste kriterier. Denne ressursen brukes før en konkret beslutning for å undersøke premissene den hviler på.

**PDF-rolle:** Ikke nødvendig i første versjon.

**Faglig grunnlag:** Mennesker tester ofte tilfeller som forventes å passe med arbeidshypotesen. Det er ikke alltid irrasjonelt, men kan gi svak informasjon når alternative forklaringer ikke undersøkes. Ressursen bygger på [Klayman og Ha (1987)](https://doi.org/10.1037/0033-295X.94.2.211). Føranalysen er inspirert av Gary Kleins praktiske [premortem-metode](https://hbr.org/2007/09/performing-a-project-premortem), som brukes som arbeidsform, ikke som dokumentasjon på en sikker effekt.

### 5. Hva bygger og bryter ned tillit?

**Utviklingsområde:** Relasjoner og påvirkning

**Type og fase:** Rammeverk og refleksjon, observasjon eller samtale
**Anslått tid:** 15 minutter

**Bruk når:** Samarbeidet er preget av tilbakeholdenhet, ekstra kontroll eller lav vilje til å være avhengig av hverandre, men det er uklart hva mistilliten gjelder.

**Ønsket resultat:** Lederen identifiserer hvilken konkret atferd som påvirker opplevelsen av dyktighet, velvilje eller integritet i relasjonen, og velger én troverdig endring.

**Kjerneøvelse:**

1. Velg én relasjon og én konkret situasjon.
2. Beskriv hva den andre parten må være villig til å overlate eller risikere for at samarbeidet skal fungere.
3. Vurder egne handlinger under tre overskrifter: faglig evne, hensyn til den andres interesser og samsvar mellom ord og handling.
4. Finn eksempler som støtter vurderingen, og eksempler som utfordrer den.
5. Velg én atferd som kan gjøre deg mer forutsigbar eller troverdig i situasjonen.

**Refleksjonsspørsmål:**

- Hva ber du den andre om å ta en risiko på?
- Hvilken forklaring har du på deres tilbakeholdenhet?
- Hva kan du gjøre som er synlig og etterprøvbart, ikke bare betryggende ord?

**Avgrensning:** Ressursen vurderer atferd i en relasjon, ikke menneskers karakter. Den skal ikke brukes alene ved varsling, trakassering, økonomiske misligheter eller andre alvorlige tillitsbrudd.

**Avgrensning mot eksisterende bibliotek:** `Interessentkart` viser relasjoner og avhengigheter. Denne ressursen brukes når kvaliteten på én bestemt relasjon må forstås bedre.

**PDF-rolle:** En enkel trekolonne-modell kan fungere godt som PDF og illustrasjon i portalen.

**Faglig grunnlag:** En sentral modell for organisatorisk tillit skiller mellom opplevd dyktighet, velvilje og integritet, og definerer tillit som vilje til å gjøre seg sårbar under usikkerhet. Ressursen bygger på [Mayer, Davis og Schoorman (1995)](https://doi.org/10.5465/AMR.1995.9508080335). Betydningen av tillit til ledere er undersøkt på tvers av 106 utvalg i meta-analysen til [Dirks og Ferrin (2002)](https://doi.org/10.1037/0021-9010.87.4.611).

### 6. Gjenopprett tillit etter et brudd

**Utviklingsområde:** Relasjoner og påvirkning

**Type og fase:** Strukturert forberedelse, samtale eller justering
**Anslått tid:** 20 minutter

**Bruk når:** Lederen selv har bidratt til et konkret tillitsbrudd og trenger å forberede en ryddig reparasjon og oppfølging.

**Ønsket resultat:** Lederen kan beskrive hendelsen og virkningen uten bortforklaring, ta presist ansvar, foreslå en relevant reparasjon og avtale hvordan ny atferd skal kunne vurderes over tid.

**Kjerneøvelse:**

1. Beskriv hva som skjedde, og skill fakta fra egen hensikt.
2. Beskriv hva den andre parten kan ha mistet, risikert eller blitt usikker på.
3. Avklar hvilket ansvar du faktisk har.
4. Vurder om bruddet først og fremst gjelder dyktighet, omsorg for den andres interesser, integritet eller flere forhold samtidig.
5. Formuler en kort erkjennelse uten forbehold som skyver ansvaret tilbake.
6. Foreslå en konkret reparasjon og en dato for oppfølging.

**Refleksjonsspørsmål:**

- Hva kan du med rimelighet reparere, og hva kan du ikke kreve tilgivelse for?
- Hvilken ny atferd må være stabil over tid for at ordene dine skal være troverdige?
- Hva trenger du å høre fra den andre før du bestemmer løsningen?

**Avgrensning:** Ressursen er ikke et manus for å oppnå rask tilgivelse. Den passer ikke ved pågående skade, alvorlige arbeidsmiljøsaker eller situasjoner som krever formell håndtering. Ved uenighet om faktum skal lederen ikke instrueres til å innrømme noe som ikke er avklart.

**Avgrensning mot eksisterende bibliotek:** `Vanskelige samtaler` forbereder krevende dialog generelt. Denne ressursen gjelder særskilt når lederens egen handling har svekket tillit og reparasjon må følges av etterprøvbar atferd.

**PDF-rolle:** Egner seg som privat forberedelsesark. PDF-en skal ikke fremstå som en standardisert unnskyldningsoppskrift.

**Faglig grunnlag:** Forskning viser at typen tillitsbrudd påvirker hvordan forklaringer, erkjennelser og senere bevis blir tolket. Funnene gir ikke grunnlag for én universell reparasjonsoppskrift. Ressursen bygger blant annet på [Kim, Ferrin, Cooper og Dirks (2004)](https://doi.org/10.1037/0021-9010.89.1.104) og den bredere tillitsmodellen til [Mayer, Davis og Schoorman (1995)](https://doi.org/10.5465/AMR.1995.9508080335).

### 7. Skap gjennomslag uten formell myndighet

**Utviklingsområde:** Relasjoner og påvirkning

**Type og fase:** Samtaleforberedelse, fokus eller eksperiment
**Anslått tid:** 15 minutter

**Bruk når:** Lederen trenger støtte fra en kollega, fagperson, overordnet eller annen aktør som ikke kan instrueres gjennom linjen.

**Ønsket resultat:** Lederen forbereder én konkret påvirkningssamtale med klart mål, forståelse for den andres interesser og et rimelig neste steg.

**Kjerneøvelse:**

1. Definer hva du konkret ønsker at personen skal forstå, bidra med eller beslutte.
2. Beskriv hva saken betyr for den andre partens mål, risiko og handlingsrom.
3. Vurder hvilke kilder til innflytelse du faktisk har: relevant kunnskap, troverdighet, relasjon, tilgang, gjensidighet eller en viktig sak.
4. Velg en fremgangsmåte som passer både målet og relasjonen.
5. Formuler en tydelig forespørsel som den andre kan svare reelt ja eller nei på.
6. Bestem hva du vil spørre om før du argumenterer.

**Refleksjonsspørsmål:**

- Hvorfor skulle den andre prioritere dette nå?
- Hvilken motforestilling bør du være villig til å lære av?
- Hva kan du tilby uten å gjøre påvirkningen taktisk eller manipulerende?

**Avgrensning:** Påvirkning skal ikke skjule interesser, presse frem samtykke eller omgå legitime beslutningsprosesser.

**Avgrensning mot eksisterende bibliotek:** `Interessentkart` identifiserer aktørene. Denne ressursen forbereder én påvirkningssamtale med én bestemt person.

**PDF-rolle:** Ikke nødvendig i første versjon.

**Faglig grunnlag:** Sosial innflytelse kan bygge på flere kilder enn formell posisjon. Valg av påvirkningsform varierer også med mål, relasjon og om påvirkningen går oppover, sideveis eller nedover i organisasjonen. Ressursen bygger på [French og Raven (1959)](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Power/French_%26_Raven_Studies_Social_Power_ch9_pp150-167.pdf) og [Yukl, Guinan og Sottolano (1995)](https://doi.org/10.1177/1059601195203003).

### 8. Fra interessentkart til påvirkningsgrep

**Utviklingsområde:** Relasjoner og påvirkning

**Type og fase:** Arbeidsark, fokus eller samtale
**Anslått tid:** 20 minutter

**Bruk når:** Lederen har kartlagt interessentene, men fortsatt mangler en plan for rekkefølge, involvering og konkrete henvendelser.

**Ønsket resultat:** Tre prioriterte interessenter får hver sin begrunnede tilnærming, og lederen bestemmer hvem som bør involveres først.

**Kjerneøvelse:**

1. Hent frem eksisterende interessentkart og velg de tre aktørene som er viktigst for saken nå.
2. Beskriv for hver aktør: ønsket bidrag, sannsynlig interesse, mulig bekymring og hvilken informasjon som mangler.
3. Velg om aktøren bør informeres, konsulteres, involveres i utforming eller bes om en beslutning.
4. Vurder hvem som er den mest troverdige avsenderen.
5. Bestem rekkefølge og tidspunkt.
6. Formuler første konkrete henvendelse til hver aktør.

**Refleksjonsspørsmål:**

- Hvem har du satt sent i planen, men burde involvert tidlig?
- Hvem kan forbedre løsningen, ikke bare støtte den?
- Hvor kan samme budskap få ulik virkning fordi interessene er forskjellige?

**Avgrensning:** Planen skal ikke brukes til å spille aktører mot hverandre eller skjule relevant informasjon.

**Avgrensning mot eksisterende bibliotek:** Dette er en direkte oppfølger til `Interessentkart`. Kartet gir oversikt; denne ressursen gjør oversikten om til en sekvens av handlinger. Den skal ikke gjenta selve kartleggingen.

**PDF-rolle:** Høy verdi. Et landskapsformat med én rad per interessent og egen kolonne for rekkefølge vil være nyttig i arbeid og deling.

**Faglig grunnlag:** Forskning på påvirkning viser at ledere bruker ulike taktikker for ulike mål og relasjoner. Ressursen bygger på [Yukl og Falbe (1990)](https://doi.org/10.1037/0021-9010.75.2.132) og [Yukl, Guinan og Sottolano (1995)](https://doi.org/10.1177/1059601195203003).

### 9. Deleger for utvikling, ikke bare avlastning

**Utviklingsområde:** Team og medarbeidere

**Type og fase:** Arbeidsark, fokus eller eksperiment
**Anslått tid:** 15 minutter

**Bruk når:** Lederen skal delegere en reell oppgave som både må leveres og kan gi en medarbeider relevant strekk og læring.

**Ønsket resultat:** Oppgaven får tydelig resultat, beslutningsrom, risikogrenser, støtte og oppfølging, uten at lederen tar tilbake eierskapet underveis.

**Kjerneøvelse:**

1. Beskriv leveransen og hvorfor den betyr noe.
2. Velg hvilket utviklingsbehov oppgaven faktisk kan trene.
3. Avklar hva medarbeideren kan beslutte selv, hva som skal forankres og hva som ikke kan delegeres.
4. Beskriv de viktigste risikoene og avtal når lederen skal kobles inn.
5. Spør hvilken støtte medarbeideren ønsker før du tilbyr løsninger.
6. Avtal ett læringspunkt og ett leveransepunkt for oppfølging.

**Refleksjonsspørsmål:**

- Er oppgaven utfordrende av riktig grunn, eller bare dårlig avgrenset?
- Hvilken feil må medarbeideren få lov til å gjøre?
- Hva vil du sannsynligvis bli fristet til å overta?

**Avgrensning:** Utviklingshensynet fritar ikke lederen fra å vurdere kapasitet, risiko, kompetanse og rettferdig arbeidsfordeling. Medarbeideren skal ikke få en kritisk oppgave uten nødvendig støtte.

**Avgrensning mot eksisterende bibliotek:** `Delegasjonskart` hjelper lederen å velge hvilke oppgaver som kan flyttes. Denne ressursen brukes etter valget for å utforme selve delegeringen som både leveranse og utvikling.

**PDF-rolle:** Egner seg godt som ett-sides delegeringsavtale eller samtaleark.

**Faglig grunnlag:** Utfordrende jobboppgaver kan være viktige utviklingsarenaer når de gir reelt ansvar, nye krav og mulighet for læring. Ressursen bygger på studien av utviklingskomponenter i lederjobber av [McCauley, Ruderman, Ohlott og Morrow (1994)](https://doi.org/10.1037/0021-9010.79.4.544).

### 10. Skap eierskap uten å overta

**Utviklingsområde:** Team og medarbeidere

**Type og fase:** Samtaleøvelse, eksperiment eller observasjon
**Anslått tid:** 12 minutter

**Bruk når:** Medarbeidere kommer med problemer, og lederen har en vane for å gi løsningen, ta beslutningen tilbake eller bli den egentlige eieren av oppfølgingen.

**Ønsket resultat:** Lederen gir tydelig retning og støtte, samtidig som medarbeideren beholder ansvar for vurdering, anbefaling og neste steg.

**Kjerneøvelse:**

1. Velg en kommende samtale der du vanligvis ville gått raskt til løsning.
2. Avklar først hva som er fast: ønsket resultat, rammer, risiko og beslutningsmyndighet.
3. Spør medarbeideren hva vedkommende allerede har vurdert.
4. Be om minst to mulige veier videre og en anbefaling.
5. Avtal hvilken støtte du skal gi, uten å gjøre oppgaven til din.
6. Avslutt med tydelig eier, neste steg og tidspunkt for oppfølging.

**Refleksjonsspørsmål:**

- Når blir din hjelpsomhet en form for overtakelse?
- Hva gjør det vanskelig for deg å vente på medarbeiderens vurdering?
- Hvilke rammer må være tydelige for at selvstendighet skal være forsvarlig?

**Avgrensning:** Eierskap betyr ikke fravær av ledelse. Lederen skal fortsatt sette retning, avklare ansvar og gripe inn ved vesentlig risiko eller manglende forutsetninger.

**Avgrensning mot eksisterende bibliotek:** `Spørsmål i coachende ledelse` gir et bredere repertoar av spørsmål. Denne ressursen retter seg mot ett bestemt mønster: at lederen ufrivillig tar problemet og ansvaret tilbake.

**PDF-rolle:** Ikke nødvendig i første versjon.

**Faglig grunnlag:** Selvbestemmelsesteori viser betydningen av støtte til autonomi, kompetanse og tilhørighet for indre motivasjon og selvregulering. Autonomistøtte er ikke det samme som fravær av struktur. Ressursen bygger på [Ryan og Deci (2000)](https://doi.org/10.1037/0003-066X.55.1.68).

### 11. Når en styrke brukes for mye

**Utviklingsområde:** Mulige avsporere

**Type og fase:** Refleksjonsøvelse, observasjon eller justering
**Anslått tid:** 15 minutter

**Bruk når:** Lederen får gjentatt feedback på en atferd som i utgangspunktet er nyttig, men som får dårlig effekt i bestemte situasjoner eller ved høy intensitet.

**Ønsket resultat:** Lederen identifiserer overbrukssignalet, hvilken motvekt situasjonen krever, og ett avgrenset forsøk på bedre dosering.

**Kjerneøvelse:**

1. Navngi styrken uten å gjøre den til en identitet.
2. Beskriv situasjoner der den gir tydelig verdi.
3. Beskriv hva andre kan observere når den brukes for sterkt, for ofte eller for lenge.
4. Noter hvilken kostnad overbruken får for oppgave, relasjon eller læring.
5. Velg en komplementær atferd som bør få litt mer plass.
6. Planlegg ett møte eller én situasjon der du skal redusere intensiteten og observere effekten.

**Refleksjonsspørsmål:**

- Hvilket tidlig signal forteller at styrken er i ferd med å tippe over?
- Hvem merker overbruken før du gjør det selv?
- Hvordan kan du beholde verdien uten å bruke styrken automatisk?

**Avgrensning:** Ressursen skal ikke gjøre sterke sider til skjulte svakheter eller plassere lederen i en fast type. Den handler om situasjon og dosering.

**Avgrensning mot eksisterende bibliotek:** `Bruk en styrke på en ny måte` utvider bruken av en styrke. Denne ressursen brukes når en styrke allerede dominerer og trenger en tydelig motvekt.

**PDF-rolle:** En enkel kurve eller vippeillustrasjon kan gi verdi, men bør ledsages av konkret tekst og ikke stå som forklaringsmodell alene.

**Faglig grunnlag:** Lederstyrker kan bli mindre effektive når de overdrives eller ikke balanseres av komplementær atferd. Ressursen bygger på [Kaiser og Overfield (2011)](https://doi.org/10.1037/a0024470).

### 12. Fra forsvar til nysgjerrighet

**Utviklingsområde:** Mulige avsporere

**Type og fase:** Refleksjonsøvelse, observasjon eller eksperiment
**Anslått tid:** 15 minutter

**Bruk når:** Lederen merker at kritikk, usikkerhet eller tap av kontroll utløser raske forklaringer, avvisning, detaljstyring, taushet eller trang til å vinne diskusjonen.

**Ønsket resultat:** Lederen gjenkjenner ett tidlig forsvarssignal og forbereder en enkel respons som holder informasjonsinnhentingen åpen.

**Kjerneøvelse:**

1. Velg en konkret situasjon der du ble utfordret eller usikker.
2. Beskriv det første kroppslige, tankemessige eller atferdsmessige signalet du la merke til.
3. Noter hva du forsøkte å beskytte: kontroll, status, selvbilde, tempo eller noe annet.
4. Beskriv hvilken informasjon du sluttet å ta inn.
5. Lag en kort pausehandling, for eksempel å oppsummere det du hørte før du svarer.
6. Formuler ett ekte undersøkende spørsmål du kan bruke neste gang.

**Refleksjonsspørsmål:**

- Hva gjør du som får andre til å holde tilbake informasjon?
- Hvilken del av kritikken kan være nyttig selv om du er uenig i resten?
- Hva vil være et observerbart tegn på at du forble åpen lenger?

**Avgrensning:** Ressursen skal ikke brukes til å gjøre en legitim grense, faglig uenighet eller reaksjon på utrygghet til et personlig problem. Den er heller ikke en erstatning for håndtering av alvorlig konflikt eller skadelig atferd.

**Avgrensning mot eksisterende bibliotek:** `Triggerkartlegging` identifiserer situasjoner som utløser sterke reaksjoner. Denne ressursen går videre til hva lederen gjør med informasjon, kontroll og dialog når reaksjonen oppstår.

**PDF-rolle:** Ikke nødvendig i første versjon.

**Faglig grunnlag:** Under opplevd trussel kan informasjonsbehandling snevres inn og kontroll bli mer rigid. Defensive rutiner kan samtidig gjøre viktige antakelser vanskeligere å undersøke. Ressursen bygger på [Staw, Sandelands og Dutton (1981)](https://doi.org/10.2307/2392337) og Chris Argyris' arbeid med defensive rutiner, blant annet [Argyris (1990)](https://doi.org/10.1177/0021886390263004).

## Anbefalt rekkefølge for videre innholdsarbeid

De tolv ressursene bør ikke publiseres samlet uten redaksjonell utprøving. Første skrive- og kvalitetssikringsrunde bør være:

1. Hva bygger og bryter ned tillit?
2. Skap gjennomslag uten formell myndighet
3. Fra strategi til konkret lederpraksis
4. Definer problemet før du velger løsning
5. Deleger for utvikling, ikke bare avlastning
6. Når en styrke brukes for mye

Denne gruppen dekker seks tydelige behov, fyller dagens kategorigap og har moderat faglig og etisk risiko. De øvrige seks bør skrives etter at struktur, språk og faktisk bruk er prøvd i de første ressursene.

`Gjenopprett tillit etter et brudd` og `Fra forsvar til nysgjerrighet` bør få særskilt faglig kvalitetssikring før publisering fordi feil språk lett kan bli moraliserende eller forenkle krevende relasjonelle situasjoner.

## Hva som holdes utenfor

- Ingen automatisk anbefalingsmotor.
- Ingen åpent klientbibliotek.
- Ingen ny kategori- eller datamodell. Ressursene bruker de eksisterende utviklingsområdene, inkludert `Mulige avsporere`.
- Ingen nye skjemafelter for hvert arbeidsark før behovet er dokumentert i faktisk bruk.
- Ingen oversettelse eller gjenbruk av CCL-arbeidsark.
- Ingen PDF-produksjon før portalteksten og øvelsen er faglig godkjent.
- Ingen publisering før hver enkelt ressurs har godkjent tekst, avgrensning og kildegrunnlag.

## Kvalitetskontroll før publisering

For hver ressurs skal fagansvarlig kunne svare ja på følgende:

- Er brukssituasjonen tydelig nok til at coachen vet når ressursen passer?
- Kan klienten gjennomføre øvelsen uten muntlig forklaring?
- Fører øvelsen frem til noe som kan observeres eller følges opp?
- Er ressursen tydelig forskjellig fra det som allerede finnes?
- Er påstandene mer nøkterne enn kildegrunnlaget, ikke sterkere?
- Er avgrensningen tydelig nok for krevende person-, helse- og arbeidsmiljøsaker?
- Er språket konkret og fritt for kurs-, konsulent- og maskinspråk?
- Har PDF-en en egen funksjon dersom det foreslås PDF?

## Sentrale kilder

- [Argyris, C. (1990). Inappropriate Defenses Against the Monitoring of Organization Development Practice](https://doi.org/10.1177/0021886390263004)
- [CCL Compass Book Activity Center](https://resources.ccl.org/compass-book-activity-center/)
- [Dirks, K. T. og Ferrin, D. L. (2002). Trust in leadership: Meta-analytic findings and implications for research and practice](https://doi.org/10.1037/0021-9010.87.4.611)
- [French, J. R. P. og Raven, B. (1959). The Bases of Social Power](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Power/French_%26_Raven_Studies_Social_Power_ch9_pp150-167.pdf)
- [Getzels, J. W. (1979). Problem Finding: A Theoretical Note](https://doi.org/10.1207/s15516709cog0302_4)
- [Gollwitzer, P. M. (1999). Implementation Intentions: Strong Effects of Simple Plans](https://doi.org/10.1037/0003-066X.54.7.493)
- [Kaiser, R. B. og Overfield, D. V. (2011). Strengths, Strengths Overused, and Lopsided Leadership](https://doi.org/10.1037/a0024470)
- [Kim, P. H., Ferrin, D. L., Cooper, C. D. og Dirks, K. T. (2004). Removing the Shadow of Suspicion](https://doi.org/10.1037/0021-9010.89.1.104)
- [Klein, G. (2007). Performing a Project Premortem](https://hbr.org/2007/09/performing-a-project-premortem)
- [Klayman, J. og Ha, Y.-W. (1987). Confirmation, Disconfirmation, and Information in Hypothesis Testing](https://doi.org/10.1037/0033-295X.94.2.211)
- [Locke, E. A. og Latham, G. P. (2002). Building a Practically Useful Theory of Goal Setting and Task Motivation](https://doi.org/10.1037/0003-066X.57.9.705)
- [Mayer, R. C., Davis, J. H. og Schoorman, F. D. (1995). An Integrative Model of Organizational Trust](https://doi.org/10.5465/AMR.1995.9508080335)
- [McCauley, C. D., Ruderman, M. N., Ohlott, P. J. og Morrow, J. E. (1994). Assessing the Developmental Components of Managerial Jobs](https://doi.org/10.1037/0021-9010.79.4.544)
- [Mumford, M. D., Reiter-Palmon, R. og Redmond, M. R. (1994). Problem Construction and Cognition: Applying Problem Representations in Ill-Defined Domains](https://digitalcommons.unomaha.edu/facultybooks/166/)
- [Oreg, S., Vakola, M. og Armenakis, A. (2011). Change Recipients' Reactions to Organizational Change](https://doi.org/10.1177/0021886310396550)
- [Ryan, R. M. og Deci, E. L. (2000). Self-Determination Theory and the Facilitation of Intrinsic Motivation, Social Development, and Well-Being](https://doi.org/10.1037/0003-066X.55.1.68)
- [Staw, B. M., Sandelands, L. E. og Dutton, J. E. (1981). Threat-Rigidity Effects in Organizational Behavior](https://doi.org/10.2307/2392337)
- [Yukl, G. og Falbe, C. M. (1990). Influence Tactics and Objectives in Upward, Downward, and Lateral Influence Attempts](https://doi.org/10.1037/0021-9010.75.2.132)
- [Yukl, G., Guinan, P. J. og Sottolano, D. (1995). Influence Tactics Used for Different Objectives with Subordinates, Peers, and Superiors](https://doi.org/10.1177/1059601195203003)
