-- Approved for local review only. See docs/RESOURCE_LIBRARY_EDITORIAL_V1.md.
-- Preserve identities, publication state, sharing, files and unrelated fields.
-- Compare only edited fields, and stop on intervening editorial changes.

do $editorial$
declare
  batch constant jsonb := $payload$
[
  {
    "slug": "tre-gode-ting-kopi-mt71die4",
    "changes": {
      "basis": "Seligman, Steen, Park og Peterson (2005), Positive Psychology Progress: Empirical Validation of Interventions, doi:10.1037/0003-066X.60.5.410. Studien undersøkte blant annet daglig bruk av signaturstyrker på nye måter i én uke. Gruppen viste forbedring i selvrapportert lykke og depressive symptomer ved seksmånedersoppfølging. Studien dokumenterer ikke effekt på lederprestasjoner eller behandlingseffekt for denne portalressursen."
    },
    "expected_hash": "afffa4cfbe25740942e9be0796cae920"
  },
  {
    "slug": "tre-gode-ting-kopi-mt71die4-kopi-mt71f8lm",
    "changes": {
      "basis": "Seligman, Steen, Park og Peterson (2005), Positive Psychology Progress: Empirical Validation of Interventions, doi:10.1037/0003-066X.60.5.410. Takknemlighetsbesøket ga i studien forbedring i selvrapportert lykke og depressive symptomer gjennom én måned, men ikke ved tre måneder. Resultatet fra Tre gode ting skal ikke overføres til denne øvelsen. Her brukes besøket til å uttrykke takknemlighet, ikke som behandling."
    },
    "expected_hash": "afffa4cfbe25740942e9be0796cae920"
  },
  {
    "slug": "tre-gode-ting-kopi-mt71die4-kopi-mt71f8lm-kopi-mt71h9cy",
    "changes": {
      "basis": "Inspirert av You at your best i Seligman, Steen, Park og Peterson (2005), doi:10.1037/0003-066X.60.5.410. Deltakerne beskrev en god erfaring og reflekterte over styrkene i den. Studien viste ikke tilsvarende varige resultater som for Tre gode ting. Portalversjonen er en tilpasset lederrefleksjon, ikke en dokumentert metode for varig økning i lykke eller lederprestasjon."
    },
    "expected_hash": "afffa4cfbe25740942e9be0796cae920"
  },
  {
    "slug": "delegasjonskart",
    "changes": {
      "content_json": [
        {
          "type": "text",
          "heading": "Kartlegg det du holder i",
          "content": "Velg tre til fem oppgaver eller beslutninger du bruker tid på i en vanlig arbeidsuke. Ta med minst én som stadig kommer tilbake til deg. For hver av dem fyller du ut de fire punktene nedenfor. Skriv konkret, for eksempel «godkjenne den ukentlige bemanningsplanen», ikke «drift»."
        },
        {
          "type": "worksheet",
          "heading": "Én rad per oppgave eller beslutning",
          "fields": [
            "Oppgave eller beslutning: Hva er det konkret som skal gjøres eller avgjøres?",
            "Eier i dag: Hvem gjør arbeidet, og hvem tar den endelige beslutningen?",
            "Ønsket eier: Hvem bør kunne gjøre eller avgjøre dette? Hva må du fortsatt stå ansvarlig for?",
            "Må avklares: Hvilket resultat, handlingsrom eller hvilken støtte mangler før ansvaret kan flyttes?"
          ]
        },
        {
          "type": "callout",
          "tone": "note",
          "heading": "Eksempel",
          "content": "Oppgave: Godkjenne ukens bemanningsplan.\nEier i dag: Jeg justerer og godkjenner alle vakter.\nØnsket eier: Teamlederen setter planen innenfor avtalte rammer. Jeg har fortsatt ansvar for at bemanningen er forsvarlig.\nMå avklares: Hvilke endringer teamlederen kan beslutte, og hvilke avvik vi må ta sammen."
        },
        {
          "type": "text",
          "heading": "Velg én overføring",
          "content": "Se på kartet og velg én oppgave eller beslutning du vil avklare med en medarbeider. Undersøk kapasitet og forutsetninger før dere avtaler en ny fordeling. Noe skal du fortsatt eie selv; kartet er ikke en oppfordring til å delegere alt."
        },
        {
          "type": "reflection_questions",
          "heading": "Refleksjonsspørsmål",
          "questions": [
            "Hvor gjør du arbeid som egentlig ikke trenger din vurdering?",
            "Hvor er fordelingen uklar, snarere enn at du holder for mye selv?",
            "Hva må være på plass for at den nye eieren kan lykkes?"
          ]
        }
      ],
      "next_step_prompt": "Ta en samtale om én rad i kartet. Avklar hvem som gjør hva, hva personen kan beslutte, og når dere følger opp.",
      "coach_guidance": "Se på konkrete oppgaver og beslutninger før du tolker hvorfor klienten holder dem tett. Undersøk mandat, kapasitet og kompetanse, og deretter eventuelle mønstre knyttet til kontroll eller tillit. Skill mellom å flytte arbeidet, å gi beslutningsmyndighet og å beholde lederansvar. Når én oppgave er valgt, kan «Deleger for utvikling, ikke bare avlastning» brukes til å planlegge selve overføringen.",
      "not_for": [
        "Oppgaven eller beslutningen ligger utenfor lederens myndighet å delegere.",
        "Det trengs umiddelbar håndtering av en hendelse, ikke kartlegging av ansvarsfordeling."
      ]
    },
    "expected_hash": "63801a85701affa79cded56c10849a54"
  },
  {
    "slug": "beslutningsprinsipper",
    "changes": {
      "content_json": [
        {
          "type": "text",
          "heading": "Begynn med en beslutning",
          "content": "Velg en tilbakevendende beslutning der du blir trukket mellom to hensyn. Det kan være leveringstid og kvalitet, kortsiktig kapasitet og utvikling av medarbeidere, eller likebehandling og individuelle behov. Beskriv hva som faktisk står mot hverandre."
        },
        {
          "type": "worksheet",
          "heading": "Dilemmaet",
          "fields": [
            "Hvilken beslutning går igjen?",
            "Hvilke to hensyn trekker i hver sin retning?",
            "Hva har du pleid å velge, og hva har det ført til?"
          ]
        },
        {
          "type": "text",
          "heading": "Formuler et prinsipp som hjelper deg å velge",
          "content": "Et prinsipp må si mer enn «kvalitet er viktig» eller «mennesker først». Beskriv hvordan hensynet skal påvirke beslutningen. Avklar også hvilke krav som ikke kan fravikes, og når du trenger å undersøke mer eller løfte saken videre."
        },
        {
          "type": "callout",
          "tone": "note",
          "heading": "Eksempel",
          "content": "Generelt ønske: «Vi skal holde det vi lover.»\nBeslutningsprinsipp: «Vi bekrefter ikke en ny leveringsdato før ansvarlig for leveransen har vurdert kapasiteten. Hvis datoen er låst, avklarer vi omfang eller ressurser før vi forplikter oss.»\nPrinsippet endrer hva lederen gjør når en viktig kunde ber om raskere levering."
        },
        {
          "type": "text",
          "heading": "Prøv prinsippet mot virkeligheten",
          "content": "Bruk prinsippet på beslutningen du valgte. Prøv det deretter på en situasjon der det blir vanskelig å følge. Målet er ikke en formulering som passer alt, men en tydelig føring som tåler å bli undersøkt."
        },
        {
          "type": "worksheet",
          "heading": "Fra formulering til valg",
          "fields": [
            "Mitt prinsipp: Når dette hensynet står på spill, gjør vi ...",
            "Hva ville prinsippet fått meg til å velge i den konkrete saken?",
            "Hva må jeg være villig til å si nei til eller bruke mer tid på?",
            "Hvor går grensen for prinsippet, og hva må eventuelt avklares?"
          ]
        },
        {
          "type": "reflection_questions",
          "heading": "Refleksjonsspørsmål",
          "questions": [
            "Vil en medarbeider kunne se forskjell på beslutningene dine hvis du følger dette?",
            "Hvilken innvending mot prinsippet bør du ta på alvor?",
            "Hva trenger andre å vite for å forstå valget ditt?"
          ]
        }
      ],
      "next_step_prompt": "Bruk ett prinsipp i en kommende beslutning. Forklar begrunnelsen til dem som berøres, og vurder etterpå om prinsippet ga god nok hjelp."
    },
    "expected_hash": "9fb98769b97258f70b7591f6e9de2d72"
  },
  {
    "slug": "abcde-modellen",
    "changes": {
      "summary": "Bruk en konkret hendelse til å skille mellom det som skjedde, tolkningen din og reaksjonen som fulgte. ABCDE hjelper deg å undersøke tolkningen før du velger hvordan du vil møte en lignende situasjon.",
      "client_intro": "Bruk en konkret hendelse til å skille mellom det som skjedde, tolkningen din og reaksjonen som fulgte. ABCDE hjelper deg å undersøke tolkningen før du velger hvordan du vil møte en lignende situasjon.",
      "content_json": [
        {
          "type": "text",
          "heading": "Fem deler av én situasjon",
          "content": "A er hendelsen, B er det du tror eller antar om den, og C er følelsene og handlingene som følger. I D undersøker du tolkningen. I E formulerer du en mer holdbar forståelse og hva den betyr for handlingen din. Bokstavene kommer fra de engelske begrepene activating event, beliefs, consequences, disputing og effective new belief.\nBruk denne varianten etter en situasjon du vil forstå bedre. Prestasjonsvarianten brukes til å forberede hvordan du vil møte en bestemt situasjon. Begge er tilpassede refleksjonsøvelser for lederarbeid, ikke behandling."
        },
        {
          "display_name": "",
          "file_id": "",
          "key": "",
          "storage_path": "",
          "type": "illustration"
        },
        {
          "type": "text",
          "heading": "A: Hva skjedde?",
          "content": "Velg én avgrenset hendelse. Beskriv det som kunne vært sett eller hørt, uten å forklare den andres motiv."
        },
        {
          "type": "worksheet",
          "heading": "Hendelsen",
          "fields": [
            "Hva ble sagt eller gjort?",
            "Hva var situasjonen, og hvem var involvert?"
          ]
        },
        {
          "type": "text",
          "heading": "B: Hva tenkte du?",
          "content": "Skriv den første tolkningen med dine egne ord. Ta med eventuelle krav til deg selv eller andre."
        },
        {
          "type": "worksheet",
          "heading": "Tolkningen",
          "fields": [
            "Hva tok du hendelsen som et tegn på?",
            "Hva mente du at du selv eller den andre måtte eller burde gjøre?"
          ]
        },
        {
          "type": "text",
          "heading": "C: Hva ble reaksjonen?",
          "content": "Skill mellom det du kjente, og det du faktisk gjorde. Situasjonen og rammene betyr også noe; reaksjonen skyldes ikke nødvendigvis bare tolkningen din."
        },
        {
          "type": "worksheet",
          "heading": "Følelse og handling",
          "fields": [
            "Hva kjente du?",
            "Hva gjorde eller unnlot du å gjøre?",
            "Hva ble konsekvensen for samtalen eller arbeidet?"
          ]
        },
        {
          "type": "text",
          "heading": "D: Holder tolkningen?",
          "content": "Undersøk både det som støtter tolkningen, og det som taler imot. Ikke erstatt en ubehagelig tanke med en positiv påstand du ikke tror på."
        },
        {
          "type": "worksheet",
          "heading": "Undersøk tolkningen",
          "fields": [
            "Hva vet du, og hva antar du?",
            "Hvilke observasjoner støtter eller utfordrer tolkningen?",
            "Hvilken annen forklaring bør du undersøke?"
          ]
        },
        {
          "type": "text",
          "heading": "E: Hva er en mer holdbar forståelse?",
          "content": "Formuler en forståelse som tar observasjonene på alvor og gir deg et begrunnet handlingsvalg. Du trenger ikke bli enig med den andre eller slutte å kjenne ubehag."
        },
        {
          "type": "worksheet",
          "heading": "Forståelse og handling",
          "fields": [
            "En mer presis måte å forstå hendelsen på er ...",
            "Med den forståelsen vil jeg ..."
          ]
        },
        {
          "type": "callout",
          "tone": "note",
          "heading": "Et kort eksempel",
          "content": "A: En kollega ba om mer tallgrunnlag i møtet.\nB: «Hun tror jeg ikke kan jobben min.»\nC: Jeg ble irritert og avbrøt.\nD: Jeg vet at hun etterspurte tall. Jeg vet ikke hva hun mener om kompetansen min.\nE: Jeg spør hvilke tall hun trenger, og avklarer hva som er nødvendig for beslutningen."
        },
        {
          "type": "reflection_questions",
          "heading": "Refleksjonsspørsmål",
          "questions": [
            "Hva ble tydeligere da du skilte hendelsen fra tolkningen?",
            "Hva trenger du å undersøke før du konkluderer?",
            "Hvilken handling vil du prøve neste gang?"
          ]
        }
      ],
      "basis": "Tilpasset Albert Ellis' ABCDE-arbeid i Rational Emotive Behavior Therapy (REBT). A: activating event, B: beliefs, C: consequences, D: disputing, E: effective new belief eller philosophy. Se Albert Ellis Institute: https://albertellis.org/rebt-cbt-therapy/. Norske overskrifter og arbeidseksempel er redaksjonelle tilpasninger til lederrefleksjon. Ressursen er ikke behandling eller en selvstendig validert intervensjon.",
      "next_step_prompt": "Velg én handling fra E som du vil prøve i en lignende situasjon. Legg merke til hva som skjer, også hvis utfallet blir annerledes enn forventet."
    },
    "expected_hash": "c6f29206243657b75d16cd9175ef8cc3"
  },
  {
    "slug": "abcde-modellen-prestasjonsforbedring",
    "changes": {
      "content_json": [
        {
          "type": "intro",
          "content": "Bruk denne varianten før en konkret situasjon der du vil handle mer hensiktsmessig, for eksempel en presentasjon, beslutning eller krevende samtale. Ta gjerne utgangspunkt i erfaring fra en lignende situasjon.\nDette er en prestasjonsrettet tilpasning av ABCDE: A er situasjonen, B er tolkningen, C er konsekvensene, D er undersøkelsen av tolkningen, og E er en mer holdbar forståelse og handling. Den ordinære ABCDE-ressursen går mer trinnvis gjennom en hendelse i etterkant."
        },
        {
          "content": "Definer situasjonen tydelig. Hva skjer, hvor, når og med hvem?",
          "heading": "A – Aktivitet eller situasjon",
          "type": "text"
        },
        {
          "type": "text",
          "heading": "B: Tanker og antakelser",
          "content": "Skriv hvilke tanker du forventer vil dukke opp. Hva antar du at situasjonen betyr, og hvilke krav stiller du til deg selv?"
        },
        {
          "type": "text",
          "heading": "C: Forventede konsekvenser",
          "content": "Hvordan pleier denne tolkningen å påvirke følelsene og handlingene dine? Hva kan den få deg til å gjøre eller unngå i situasjonen du forbereder?"
        },
        {
          "type": "text",
          "heading": "D: Undersøk tankene",
          "content": "Hva taler for og imot tolkningen? Hvilken forklaring er mer holdbar, og hva trenger du fortsatt å finne ut? Målet er ikke bare å tenke positivt."
        },
        {
          "type": "text",
          "heading": "E: En mer holdbar forståelse og handling",
          "content": "Skriv hva du vil minne deg selv på, og hvilken konkret handling det skal hjelpe deg å gjennomføre. Velg noe du kan styre selv, ikke en garanti for hvordan andre skal reagere."
        },
        {
          "type": "worksheet",
          "heading": "Forbered situasjonen",
          "fields": [
            "A: Situasjonen jeg skal møte",
            "B: Tanker eller antakelser jeg forventer",
            "C: Hvordan disse pleier å påvirke meg",
            "D: Hva støtter eller utfordrer tolkningen?",
            "E: Hva vil jeg minne meg selv på, og gjøre konkret?"
          ]
        },
        {
          "type": "reflection_questions",
          "heading": "Refleksjonsspørsmål",
          "questions": [
            "Hvilken antakelse er det viktigst å undersøke?",
            "Hva er et realistisk mål for din egen handling?",
            "Hva vil du se etter i etterkant for å vurdere hva du lærte?"
          ]
        }
      ],
      "basis": "Prestasjonsrettet, redaksjonell tilpasning av Albert Ellis' ABCDE-arbeid i REBT. D innebærer å undersøke og utfordre en tolkning, ikke bare å erstatte den med en positiv tanke. E kobler en mer holdbar forståelse til en konkret handling. Se https://albertellis.org/rebt-cbt-therapy/. Tilpasningen er ikke en egen validert prestasjonsmodell eller behandling."
    },
    "expected_hash": "def6d942c484ddea74ebb7a381352cbc"
  },
  {
    "slug": "mitt-lederprosjekt",
    "changes": {
      "content_json": [
        {
          "content": "Mange går inn i lederroller uten å stoppe opp og definere hva de faktisk ønsker å få til som leder. Hverdagen fylles raskt av møter, drift, forventninger og kortsiktige problemer, og over tid kan lederrollen bli mer reaktiv enn bevisst.\n\nEt lederprosjekt handler om å formulere hva du ønsker å bygge, påvirke eller utvikle gjennom lederskapet ditt over tid. Ikke bare hvilke oppgaver du skal løse, men hvilket avtrykk du ønsker å skape i mennesker, team, kultur, retning eller resultater.\n\nMålet med denne øvelsen er å løfte blikket fra den daglige driften og tydeliggjøre hva du faktisk ønsker å levere fra deg som leder på lengre sikt.",
          "type": "intro"
        },
        {
          "type": "callout",
          "tone": "note",
          "heading": "Slik bruker du refleksjonen i portalen",
          "content": "Bruk ambisjonen du beskriver her til å avklare det ytre prosjektet: Hva er viktigst å lykkes med i lederjobben din nå? Det indre prosjektet er lederkompetansene du trenger å utvikle for å lykkes bedre med dette. Forløpet samler mål og rammer for utviklingsarbeidet. Du skal ikke opprette enda et prosjekt ved siden av disse."
        },
        {
          "content": "",
          "heading": "Refleksjonsoppgaver",
          "type": "text"
        },
        {
          "cards": [
            {
              "body": "",
              "title": "Hva består rollen din av i dag?"
            },
            {
              "body": "",
              "title": "Hva bruker du mest energi på?"
            },
            {
              "body": "",
              "title": "Hva opplever du som viktigst akkurat nå?"
            }
          ],
          "heading": "Lederrollen din i dag",
          "type": "model_cards"
        },
        {
          "cards": [
            {
              "body": "",
              "title": "Hva ønsker du å skape eller utvikle gjennom lederskapet ditt?"
            },
            {
              "body": "",
              "title": "Hva håper du er annerledes om to år?"
            },
            {
              "body": "",
              "title": "Hva ønsker du at teamet, organisasjonen eller menneskene rundt deg skal si at du bidro til?"
            }
          ],
          "heading": "Lederprosjektet ditt",
          "type": "model_cards"
        },
        {
          "cards": [
            {
              "body": "",
              "title": "Hvilke verdier eller prinsipper ønsker du å være kjent for?"
            },
            {
              "body": "",
              "title": "Hvordan ønsker du at andre skal oppleve deg som leder?"
            },
            {
              "body": "",
              "title": "Hva ønsker du at skal stå igjen etter deg?"
            }
          ],
          "heading": "Ønsket avtrykk",
          "type": "model_cards"
        },
        {
          "cards": [
            {
              "body": "",
              "title": "Hva kan trekke deg bort fra dette prosjektet?"
            },
            {
              "body": "",
              "title": "Hva risikerer du å bli fanget i?"
            },
            {
              "body": "",
              "title": "Hvilke mønstre eller vaner kan stå i veien?"
            }
          ],
          "heading": "Hindringer og risiko",
          "type": "model_cards"
        },
        {
          "cards": [
            {
              "body": "",
              "title": "Hva trenger mer plass i hverdagen?"
            },
            {
              "body": "",
              "title": "Hva trenger mindre plass?"
            },
            {
              "body": "",
              "title": "Hvilke konkrete valg må tas for å bevege deg i riktig retning?"
            }
          ],
          "heading": "Prioriteringer fremover",
          "type": "model_cards"
        },
        {
          "heading": "Refleksjonsspørsmål",
          "questions": [
            "Driver du ditt eget lederprosjekt, eller andres forventninger?",
            "Hva ville vært meningsfullt å se tilbake på om noen år?",
            "Hva forsøker du egentlig å bygge?",
            "Hvilke deler av lederrollen gir deg mest mening?",
            "Hva skjer dersom du fortsetter akkurat som nå?"
          ],
          "type": "reflection_questions"
        }
      ],
      "next_step_prompt": "Ta med én formulering fra refleksjonen til ytre prosjekt. Avklar hvilken konkret lederoppgave den peker mot i jobben din nå."
    },
    "expected_hash": "a65f2d6b3efe7aca32313da5a496b55c"
  },
  {
    "slug": "mindfulness-pusteovelser-stressregulering",
    "changes": {
      "summary": "Prøv en kort puste- eller oppmerksomhetsøvelse når du trenger en pause fra høyt tempo. Velg én som kjennes behagelig. Øvelsene kan gi ro, men løser ikke årsaken til belastningen.",
      "client_intro": "Prøv en kort puste- eller oppmerksomhetsøvelse når du trenger en pause fra høyt tempo. Velg én som kjennes behagelig. Øvelsene kan gi ro, men løser ikke årsaken til belastningen.",
      "content_json": [
        {
          "type": "text",
          "heading": "Før du begynner",
          "content": "Sett deg godt til rette og velg én øvelse. Pust uten å presse inn mer luft eller holde pusten lenger enn det som kjennes behagelig. Avslutt og gå tilbake til vanlig pust hvis du blir svimmel eller mer urolig. Du trenger ikke gjennomføre alle øvelsene eller få til bestemte tellinger."
        },
        {
          "type": "text",
          "heading": "1. Fysiologisk sukk",
          "content": "Pust rolig inn gjennom nesen, og ta deretter en liten ekstra innpust uten å presse. Slipp luften langsomt ut. Prøv to til tre ganger og kjenn etter før du eventuelt fortsetter.\nStudien omtalt nedenfor undersøkte gjentatte sukk i fem minutter daglig, ikke effekten av bare to til tre pust."
        },
        {
          "type": "text",
          "heading": "2. 4-7-8-pusteteknikken",
          "content": "Rytmen er innpust mens du teller til fire, en pause til sju og utpust til åtte. Tallene angir forholdet mellom fasene, ikke et krav om sekunder. Prøv bare dersom det kjennes uanstrengt. Hvis pausen blir anstrengende, velg rolig pust uten pustehold i stedet."
        },
        {
          "type": "text",
          "heading": "3. Boksånding",
          "content": "Bruk fire like lange faser: pust inn, ta en pause, pust ut, ta en pause. Du kan telle rolig til fire i hver fase hvis det er behagelig. Prøv noen få runder. Velg vanlig, rolig pust dersom pustehold gir ubehag."
        },
        {
          "type": "text",
          "heading": "4. Kroppsskanning",
          "content": "La pusten gå av seg selv. Flytt oppmerksomheten rolig fra føttene og opp gjennom kroppen. Legg merke til kontakt med underlaget og steder som kjennes spente eller avslappede. Du trenger ikke endre det du kjenner, og du kan ha øynene åpne."
        },
        {
          "type": "callout",
          "tone": "note",
          "heading": "Hva forskningen sier",
          "content": "Balban og kolleger (2023) undersøkte fem minutter daglig med tre bestemte pusteøvelser eller oppmerksomhetsmeditasjon gjennom én måned. Gjentatte sukk med vekt på utpust ga særlig lovende resultater for positivt stemningsleie og redusert pustefrekvens. Studien testet verken 4-7-8-pust eller kroppsskanning slik de beskrives her, og dokumenterer ikke at alle teknikkene virker likt."
        },
        {
          "type": "reflection_questions",
          "heading": "Refleksjonsspørsmål",
          "questions": [
            "Hva merket du før og etter øvelsen?",
            "Var det noe som gjorde øvelsen anstrengende eller mindre nyttig?",
            "Når kan en kort pause passe, og hva ved belastningen trenger en annen løsning?"
          ]
        }
      ],
      "basis": "Balban et al. (2023), Brief structured respiration practices enhance mood and reduce physiological arousal, doi:10.1016/j.xcrm.2022.100895. Studien omfattet daglig femminutterspraksis i én måned; de korte utprøvingene her er ikke identiske med forsøket. Råd om uanstrengt pust og å stoppe ved svimmelhet: NHS, https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/ og https://www.asph.nhs.uk/nervous-system-regulation. 4-7-8 beskrives som en praktisk pusterytme, ikke som en teknikk validert i Balban-studien. Kroppsskanning er en oppmerksomhetsøvelse, ikke styrt pust. Beskrivelse av 4-7-8-rytmen: Andrew Weil Center for Integrative Medicine, https://awcim.arizona.edu/content/CLH00048.html (praktisk veiledning, ikke effektstudie).",
      "next_step_prompt": "Prøv én øvelse i en rolig situasjon. Vurder om den passer for deg før du bruker den i en mer krevende arbeidssituasjon."
    },
    "expected_hash": "8adfdf283c95c39cebde9b3e9cf9e1c5"
  },
  {
    "slug": "motivation-to-lead",
    "changes": {
      "content_json": [
        {
          "content": "Ikke alle som er dyktige fagpersoner ønsker å være ledere. På samme måte er det ikke alle ledere som motiveres av de samme tingene. Forskning på Motivation to Lead viser at motivasjon for ledelse består av flere ulike drivkrefter, og at disse påvirker hvordan mennesker går inn i, utøver og utvikler seg i lederroller.\n\nChan og Drasgow beskriver særlig tre former for ledermotivasjon:\n\n→ Affektiv ledermotivasjon handler om at man genuint liker å lede, påvirke og ta ansvar.\n→ Sosial-normativ ledermotivasjon handler om plikt, ansvarsfølelse eller forventninger fra omgivelsene.\n→ Ikke-kalkulativ ledermotivasjon handler om villigheten til å ta lederansvar uten å være for opptatt av personlig kostnad, status eller belastning.\n\nMålet med denne øvelsen er ikke å vurdere om du “passer” som leder, men å utforske hva som faktisk driver deg i lederrollen, hvilke typer ansvar du trekkes mot, og hvordan motivasjonen din påvirker måten du leder på.",
          "type": "intro"
        },
        {
          "cards": [
            {
              "body": "I hvilken grad liker du faktisk å lede, påvirke og ta ansvar for andre mennesker?",
              "title": "Affektiv ledermotivasjon"
            },
            {
              "body": "I hvilken grad opplever du ledelse som et ansvar, en forventning eller en plikt?",
              "title": "Sosial-normativ ledermotivasjon"
            },
            {
              "body": "Hvordan påvirkes motivasjonen din av belastning, risiko, konflikt eller personlig kostnad?",
              "title": "Ikke-kalkulativ ledermotivasjon"
            }
          ],
          "heading": "Ulike former for ledermotivasjon",
          "type": "model_cards"
        },
        {
          "fields": [
            "Hva gir deg energi i lederrollen?",
            "Når kjenner du mest mening eller engasjement?",
            "Hvilke typer ansvar trekkes du mot?"
          ],
          "heading": "Hva motiverer deg ved å lede?",
          "type": "worksheet"
        },
        {
          "fields": [
            "Hva tapper deg mest?",
            "Hvilke sider ved ledelse unngår du helst?",
            "Hvilket ansvar kjenner du motstand mot?"
          ],
          "heading": "Hva oppleves krevende?",
          "type": "worksheet"
        },
        {
          "heading": "Refleksjonsspørsmål",
          "questions": [
            "Hva er det egentlig som driver deg i lederrollen?",
            "Ville du fortsatt ønsket å lede dersom status og tittel forsvant?",
            "Hvilke sider av ledelse gir deg mest mening?",
            "Hvilken type lederansvar passer deg best?",
            "Hva skjer med motivasjonen din under press eller motstand?"
          ],
          "type": "reflection_questions"
        },
        {
          "display_name": "",
          "file_id": "",
          "file_url": "",
          "label": "Toward a theory of individual difference",
          "storage_path": "",
          "type": "download"
        }
      ]
    },
    "expected_hash": "0a3b0b1c50c3bf97bde4fd5892fe0b43"
  },
  {
    "slug": "kubler-ross-endringskurve",
    "changes": {
      "next_step_prompt": "Velg én konkret reaksjon du har observert i en endring. Skill mellom det du vet og det du antar. Spør den det gjelder om hva reaksjonen handler om og hva som trengs nå."
    },
    "expected_hash": "70237c0c8c1bd2980b6e19be31fda2da"
  },
  {
    "slug": "tre-gode-ting",
    "changes": {
      "content_json": [
        {
          "content": "Ved slutten av dagen skriver du ned tre ting som gikk bra. De trenger ikke være store. For hver av dem spør du: Hvorfor skjedde dette?\n\nPoenget er ikke å tenke positivt eller overse det som er vanskelig. Øvelsen trener oppmerksomheten på positive hendelser og hva som faktisk bidrar til dem.",
          "heading": "Oppgave",
          "type": "text"
        },
        {
          "heading": "Refleksjonsspørsmål",
          "questions": [
            "Hva gikk bra i dag?",
            "Hvorfor skjedde det?",
            "Hva gjorde jeg selv som bidro?",
            "Hva eller hvem andre bidro?",
            "Er det noe her jeg kan gjøre mer av?"
          ],
          "type": "reflection_questions"
        }
      ]
    },
    "expected_hash": "e57fc2fcd559f3b588f36e4207cacfc1"
  }
]
$payload$::jsonb;
  item jsonb;
  current_resource public.resources%rowtype;
  revised_resource public.resources%rowtype;
  current_fields jsonb;
  field_name text;
begin
  if jsonb_array_length(batch) <> 12
    or (select count(distinct value->>'slug') from jsonb_array_elements(batch)) <> 12 then
    raise exception 'Editorial batch must contain exactly 12 distinct resources';
  end if;

  -- Lock and check the complete batch before changing any resource.
  for item in select value from jsonb_array_elements(batch) order by value->>'slug'
  loop
    for field_name in select jsonb_object_keys(item->'changes')
    loop
      if field_name <> all (array['summary', 'client_intro', 'content_json', 'basis',
        'next_step_prompt', 'coach_guidance', 'not_for']) then
        raise exception 'Unsupported editorial field: %', field_name;
      end if;
    end loop;

    select * into current_resource from public.resources
    where slug = item->>'slug' for update;
    if not found then
      raise exception 'Editorial resource missing: %', item->>'slug';
    end if;

    select jsonb_object_agg(key, to_jsonb(current_resource)->key)
    into current_fields from jsonb_object_keys(item->'changes') as keys(key);
    if md5(current_fields::text) <> item->>'expected_hash'
      and current_fields is distinct from item->'changes' then
      raise exception 'Editorial resource changed since review: %', item->>'slug';
    end if;
  end loop;

  for item in select value from jsonb_array_elements(batch) order by value->>'slug'
  loop
    select * into current_resource from public.resources where slug = item->>'slug';
    select jsonb_object_agg(key, to_jsonb(current_resource)->key)
    into current_fields from jsonb_object_keys(item->'changes') as keys(key);
    if current_fields = item->'changes' then
      continue;
    end if;
    revised_resource := jsonb_populate_record(current_resource, item->'changes');
    update public.resources set
      summary = revised_resource.summary,
      client_intro = revised_resource.client_intro,
      content_json = revised_resource.content_json,
      basis = revised_resource.basis,
      next_step_prompt = revised_resource.next_step_prompt,
      coach_guidance = revised_resource.coach_guidance,
      not_for = revised_resource.not_for,
      updated_at = now()
    where id = current_resource.id;
  end loop;
end;
$editorial$;
