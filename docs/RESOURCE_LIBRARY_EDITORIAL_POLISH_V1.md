# Redaksjonell polering V1

## Status

13. september 2026: lokal implementering etter brukerens «go» til polering, ikke remake. **Ikke produksjonsført.** Produksjon krever egen godkjenning etter før/etter-visning.

Dette er en ny, avgrenset batch. Den avviste QA V2-batchen forblir tilbakeført. Ingen tekster eller illustrasjoner fra den avviste batchen er brukt som utgangspunkt.

Autoritativ rettelse: `supabase/migrations/20260913010000_resource_editorial_polish_v1.sql`. Payloaden inneholder både forventede originalfelt og korrigerte felt. Eldre migrasjoner er urørt.

## Avgrensning

Gjennomgangen omfatter bibliotekets 63 ressurser fra det skrivebeskyttede QA-uttrekket 12. september. Denne batchen retter 16 av dem; 47 beholdes helt uendret, inkludert alle 14 utkast. Fire av utkastene mangler innhold og er ikke ferdige ressurser.

Det er 28 konkrete felt-/tekstrettelser, inkludert fem nummerprefikser i Tankefeller og synkronisering av tre introduksjoner til kompatibilitetsfeltet `summary`. Ingen generell forkorting eller ny redaksjonell mal.

Bevares i samtlige ressurser:
- Titler, identiteter, status, synlighet, emneknagger og godkjenningsmetadata.
- Alle eksisterende oppgaver, spørsmål, eksempler, modellkort og neste steg.
- Antall, type og rekkefølge på innholdsblokkene.
- Alle illustrasjons- og nedlastingsblokker, filreferanser, PDF-er og bilder.
- Alle delinger og allerede sendte coachmeldinger. Bare standardmeldingen for fremtidig deling justeres i tre ressurser.

Ingen appkode, CSS, editorlogikk, dataschema, nye øvelser eller ny QA-infrastruktur.

## Rettelser

| Ressurs | Konkret rettelse |
| --- | --- |
| Vanskelige samtaler | Samler «situasjonen krever HR-» og «juridisk eller formell oppfølging». Setter 01 foran første overskrift, i tråd med eksisterende 02 og 03. |
| Prioriteringsrammeverk | Samler «egen atferd, prioritering eller kommunikasjon» til ett forbehold. Siste ledd er ikke lenger en selvstendig grunn til å unngå ressursen. |
| Beslutningsprinsipper | Standardmeldingen følger oppgavens eksisterende rekkefølge: ett dilemma, deretter ett prinsipp. Ikke 3–5 prinsipper først. |
| Mitt lederprosjekt | Nøytral standardmelding uten «Ref samtale i dag». |
| Pusteøvelser for stressregulering | Standardmeldingen åpner med rolig første utprøving. Ingen endring i teknikker, forskningsavsnitt eller sikkerhetsinstruks. |
| Tankefeller | Fullfører nummereringen 06–10. Ingen begreps- eller illustrasjonsendring. |
| Møteanalyse | Samler «struktur, agenda eller manglende beslutningsmandat» til ett listepunkt. Forbeholdets innhold er ellers uendret. |
| Observasjonsoppdrag | Samler «møter, beslutninger eller krevende samtaler» til ett listepunkt. |
| Tre gode ting | Beholder forskningsavsnittet og oppgaven. Tilføyer betydningen av videre egenpraksis og full referanse i faggrunnlaget. |
| Bruk en styrke på en ny måte | Navngir studien og tilføyer videre egenpraksis i introduksjon og faggrunnlag. VIA-oppgaven og eksemplene beholdes. |
| Takknemlighetsbesøket | Avgrenser den siste sammenligningen i introduksjonen til den omtalte studien. Brev, besøk, spørsmål og faggrunnlag beholdes. |
| Aksepter deg selv | Krediterer Kristin Neffs Self-Compassion Break i faggrunnlaget. Ingen endring i steg eller arbeidsark. |
| Ledermøter | Korrigerer én forskningssetning til de dokumenterte sammenhengene mellom måltydelighet, fokusert kommunikasjon og møteeffektivitet. Legger inn full referanse. Resten beholdes. |
| Eisenhower-matrisen | Erstatter påstanden om en daglig kvote av kognitiv kapasitet med en praktisk begrunnelse for prioritering. Matrisen og figuren beholdes. |
| Fokusblokkering | Erstatter «uforholdsmessig stor effekt» med en nøktern beskrivelse av sammenhengende arbeid. Identifiserbar kilde for oppgavebytte. Ingen ny tidsangivelse. |
| 2-minuttersregelen | Oppgir David Allen/GTD som metodeopphav, fremfor uspesifisert forskning. Oppgave, ryddeøkt og eksisterende test-PDF beholdes. |

Bare de tre faktisk korrigerte introduksjonene synkroniseres til `summary`, i tråd med editorens eksisterende kontrakt. Andre historiske forskjeller mellom `summary` og `client_intro` ryddes ikke som sidearbeid.

## Kilder og åpne spørsmål

Kildene under er kontrollert for de konkrete presiseringene. Praktiske arbeidsark fremstilles ikke som selvstendig effektvaliderte metoder.

- [Seligman, Steen, Park og Peterson (2005)](https://ppc.sas.upenn.edu/sites/default/files/ppprogressarticle.pdf), særlig s. 416–419: resultater og fortsatt egenpraksis. Presiseringen beskriver en sammenheng, ikke en bevist årsak til den enkelte deltakers fremgang.
- [Kristin Neff: Self-Compassion Break](https://self-compassion.org/exercises/exercise-2-self-compassion-break/): opphav til tretrinnsøvelsen. Kreditering er ikke en vurdering av brukstillatelse.
- [Bang, Fuglesang, Ovesen og Eilertsen (2010)](https://doi.org/10.1111/j.1467-9450.2009.00769.x): bibliografi og abstract kontrollert. Observerte sammenhenger, ikke en test av portalens guide.
- [Leroy (2009)](https://doi.org/10.1016/j.obhdp.2009.04.002): bibliografi og abstract kontrollert. Oppgavebytte og oppmerksomhet, ikke optimal blokklengde.
- [David Allen: When to use GTD's Two-Minute Rule](https://gettingthingsdone.com/2011/06/when-to-use-gtds-two-minute-rule/): praktisk metode og brukskontekst.

**Uavklart sitat:** Originalkilden til Bill Gates-sitatet i Ledermøter er ikke funnet. Det er ikke bevist falskt. Sitatet er derfor ikke stille erstattet eller fjernet i denne batchen; kilde eller fjerning må avklares før ressursen kan omtales som fullt kildekontrollert.

Modellvarianter og forskjeller mellom enkelte figurer og tekster er notert i QA-kartleggingen, men gir ikke mandat til ombygging. Kübler-Ross, ABCDE, Kontrollsirkelen, Pareto og Karrieregrafen beholdes. Tankefeller og Eisenhower får bare tekstrettelsene angitt over. Faglige alternativer fra den gamle QA-rapporten er ikke en godkjent restliste.

## Lokal kontroll og senere produksjon

Kontrollert lokalt:
- PostgreSQL mot midlertidige kopier av eksisterende ressurstabell med de 63 originalressursene. Hele testen ble rullet tilbake; lokal hoveddatabase og produksjon er urørt.
- Forventede rettelser i alle 16 ressurser; alle andre felt/rader og 14 utkast identiske. Oppgaver, spørsmål, modellkort og filreferanser er kontrollert separat, inkludert hele Kübler-Ross-ressursen.
- Gjentatt kjøring er en no-op, også med særskilt tidsstempeltest. Konflikt i siste ressurs, manglende ressurs, endret ID/status og arkivering avviser hele batchen. Nyere endring i et uberørt felt bevares.
- 64 før/etter-sammenligninger: alle 16 ressurser i klient- og coachvisning ved 1280 og 390 pikslers bredde. Ingen JavaScript-feil, ukjente blokker eller nye overflytfeil.
- Alle ti aktive originalfiler er tilgjengelige i den lokale visningen. De sju illustrasjonene har identisk filreferanse og lastes før og etter. PDF-knappen åpner den eksisterende test-PDF-en. Kontrollsummer for originalfilene er uendret.
- Sju skjermbilder er tatt. Desktop, mobil og den uendrede Kübler-Ross-kurven er visuelt kontrollert.

Eksisterende mobilfunn i de kontrollerte ressursene: Beslutningsprinsipper, Prioriteringsrammeverk, Observasjonsoppdrag og Takknemlighetsbesøket har lange titler som går utenfor tittelbeholderen ved 390 piksler. Identisk før og etter. Ingen titler eller portal-CSS er endret for å skjule dette.

Lokal gjennomgang: `http://localhost:8027/editorial-polish.html`. Den viser konkrete før/etter-utdrag over eksisterende ressursrenderer og bruker de originale filene. Det er en midlertidig, skrivebeskyttet visning uten innlogging, lagring, deling eller e-post, ikke en ny portalflate. Den eksisterende originalsiden `editorial-v2.html` er ikke overskrevet.

Feltvis endringslogg, databasekontroll, UI-kontroll og skjermbilder ligger i denne taskens `artifacts/` under `/Users/sindrejobb/Documents/Codex/2026-08-27/raeder-conversation-readiness-v1/`, med prefiks `resource-editorial-polish-v1` eller `polish-`. Det er ikke hentet klientdata til kontrollen.

Migrasjonen følger eksisterende mønster: stabil slug, låsing og validering av hele batchen før første oppdatering, og typet `jsonb_populate_record`. Den sammenligner bare feltene som skal endres, med originale verdier i payloaden. Nyere endring i et berørt felt, manglende ressurs, endret identitet/status eller arkivering avbryter hele batchen. Uvedkommende redigeringer bevares. Allerede identiske rettelser hoppes over uten nytt tidsstempel.

Før eventuell produksjon:
1. Innhent eksplisitt godkjenning av før/etter-visningen.
2. Les gjeldende ressursfelt og kontroller mot baseline; ikke overstyr en konflikt.
3. Kontroller at bare denne godkjente migrasjonen inngår. Den avviste V2 skal ikke gjeninnføres.
4. Bevar førverdier og kontroller felter, filer og delinger etterpå.

Publiserte ressurser leses også gjennom eksisterende delinger. En senere produksjonsført tekstrettelse blir derfor synlig der, men endrer ikke klientrespons eller eksisterende coachmelding. Migrasjonen sender ingen e-post.
