-- Local text polish only; production requires separate approval.
-- See docs/RESOURCE_LIBRARY_EDITORIAL_POLISH_V1.md.
-- Preserve original illustrations, PDFs, tasks, models and publication state.

do $polish$
declare
  batch constant jsonb := $payload$
[
  {
    "slug": "to-minuttersregelen",
    "id": "742e8f85-f140-4d6d-bf5d-a5f52543bc01",
    "status": "published",
    "expected": {
      "basis": "Getting Things Done og forskning på beslutningsfriksjon og oppmerksomhetsstyring."
    },
    "changes": {
      "basis": "David Allen, Getting Things Done (GTD): When to use GTD's Two-Minute Rule (2011), https://gettingthingsdone.com/2011/06/when-to-use-gtds-two-minute-rule/. Regelen brukes ved behandling og avklaring av innkomne oppgaver. Kilden beskriver en praktisk arbeidsmetode, ikke en effektstudie."
    }
  },
  {
    "slug": "aksepter-deg-selv",
    "id": "22ff6c76-dc38-4b7c-8519-19214ac54194",
    "status": "published",
    "expected": {
      "basis": "Selvmedfølelse, emosjonell regulering og psykologisk fleksibilitet."
    },
    "changes": {
      "basis": "Selvmedfølelse, emosjonell regulering og psykologisk fleksibilitet. Tretrinnsøvelsen er en norsk tilpasning av Kristin Neffs Self-Compassion Break: https://self-compassion.org/exercises/exercise-2-self-compassion-break/."
    }
  },
  {
    "slug": "beslutningsprinsipper",
    "id": "fc6a9826-88f8-4f8f-93f4-7ea0d0eea646",
    "status": "published",
    "expected": {
      "suggested_coach_note": "Definer 3–5 prinsipper du ønsker at andre skal kunne kjenne igjen i hvordan du leder, prioriterer og tar beslutninger. Forsøk å formulere dem så konkret at de faktisk kan brukes i praksis, også i situasjoner med press, konflikt eller usikkerhet.\n\nNår du er ferdig, velg ett nylig dilemma eller en beslutning du har stått i, og vurder hvordan disse prinsippene påvirket – eller burde påvirket – handlingene dine."
    },
    "changes": {
      "suggested_coach_note": "Ta utgangspunkt i ett tilbakevendende dilemma eller en beslutning du har stått i. Definer ett prinsipp du ønsker at andre skal kunne kjenne igjen i hvordan du leder, prioriterer og tar beslutninger. Forsøk å formulere det så konkret at det faktisk kan brukes i praksis, også i situasjoner med press, konflikt eller usikkerhet.\n\nPrøv prinsippet mot beslutningen du valgte, og vurder hva det ville betydd for handlingene dine."
    }
  },
  {
    "slug": "tre-gode-ting-kopi-mt71die4",
    "id": "c15aa362-536c-4147-91a2-b5133b2627fc",
    "status": "published",
    "expected": {
      "client_intro": "Det er forskjell på å vite hva du er god på og å faktisk bruke det.\n\nNår du bevisst anvender en av dine sterkeste karakterstyrker i nye situasjoner, utfordrer du etablerte handlingsmønstre og utvider repertoaret ditt. En styrke blir dermed mindre en beskrivelse av hvem du er – og mer en kapasitet du kan bruke med større bevissthet.\n\nI studien identifiserte deltakerne sine fem sterkeste karakterstyrker og brukte én av dem på en ny måte hver dag i én uke. De rapporterte høyere lykke og færre depressive symptomer, med effekter som fortsatt var målbare seks måneder senere. Å bare identifisere styrkene ga derimot ikke samme varige effekt. \n\nInnsikten ligger ikke bare i å kjenne styrkene dine. Verdien oppstår når du bruker dem.",
      "basis": "Seligman, Steen, Park og Peterson (2005), Positive Psychology Progress: Empirical Validation of Interventions, doi:10.1037/0003-066X.60.5.410. Studien undersøkte blant annet daglig bruk av signaturstyrker på nye måter i én uke. Gruppen viste forbedring i selvrapportert lykke og depressive symptomer ved seksmånedersoppfølging. Studien dokumenterer ikke effekt på lederprestasjoner eller behandlingseffekt for denne portalressursen.",
      "summary": "Velg én av dine sterkeste karakterstyrker og finn en ny måte å bruke den på i arbeidshverdagen."
    },
    "changes": {
      "client_intro": "Det er forskjell på å vite hva du er god på og å faktisk bruke det.\n\nNår du bevisst anvender en av dine sterkeste karakterstyrker i nye situasjoner, utfordrer du etablerte handlingsmønstre og utvider repertoaret ditt. En styrke blir dermed mindre en beskrivelse av hvem du er – og mer en kapasitet du kan bruke med større bevissthet.\n\nI Seligman og kollegers studie (2005) identifiserte deltakerne sine fem sterkeste karakterstyrker og brukte én av dem på en ny måte hver dag i én uke. De rapporterte høyere lykke og færre depressive symptomer, med effekter som fortsatt var målbare seks måneder senere. De langsiktige forbedringene i studien var størst hos dem som fortsatte med øvelsene på egen hånd etter den første uken. Å bare identifisere styrkene ga derimot ikke samme varige effekt. \n\nInnsikten ligger ikke bare i å kjenne styrkene dine. Verdien oppstår når du bruker dem.",
      "basis": "Seligman, Steen, Park og Peterson (2005), Positive Psychology Progress: Empirical Validation of Interventions, doi:10.1037/0003-066X.60.5.410. Studien undersøkte blant annet daglig bruk av signaturstyrker på nye måter i én uke. Gruppen viste forbedring i selvrapportert lykke og depressive symptomer ved seksmånedersoppfølging. De langsiktige forbedringene i studien var størst hos dem som fortsatte med øvelsene på egen hånd etter den første uken. Studien dokumenterer ikke effekt på lederprestasjoner eller behandlingseffekt for denne portalressursen.",
      "summary": "Det er forskjell på å vite hva du er god på og å faktisk bruke det.\n\nNår du bevisst anvender en av dine sterkeste karakterstyrker i nye situasjoner, utfordrer du etablerte handlingsmønstre og utvider repertoaret ditt. En styrke blir dermed mindre en beskrivelse av hvem du er – og mer en kapasitet du kan bruke med større bevissthet.\n\nI Seligman og kollegers studie (2005) identifiserte deltakerne sine fem sterkeste karakterstyrker og brukte én av dem på en ny måte hver dag i én uke. De rapporterte høyere lykke og færre depressive symptomer, med effekter som fortsatt var målbare seks måneder senere. De langsiktige forbedringene i studien var størst hos dem som fortsatte med øvelsene på egen hånd etter den første uken. Å bare identifisere styrkene ga derimot ikke samme varige effekt. \n\nInnsikten ligger ikke bare i å kjenne styrkene dine. Verdien oppstår når du bruker dem."
    }
  },
  {
    "slug": "eisenhower-matrisen",
    "id": "1fb8e2e7-d179-4e18-83f9-f2aeafa5a737",
    "status": "published",
    "expected": {
      "content_json": [
        {
          "content": "I en lederhverdag preget av støy og konstant tilgjengelighet, er det lett å bruke mest tid på det som haster – men ikke nødvendigvis det som har størst verdi. \n\nForskning på beslutningstaking og oppmerksomhet viser at vi har en begrenset mengde kognitiv kapasitet hver dag (Kahneman, Thinking, Fast and Slow), og at det er avgjørende å bruke den på det som faktisk betyr noe. \n\nEisenhower-matrisen hjelper deg med å skille mellom ting som er viktige og uviktige, haster og ikke haster – og gir deg et visuelt verktøy for å prioritere og styre tiden mer strategisk.",
          "type": "intro"
        },
        {
          "display_name": "",
          "file_id": "",
          "key": "",
          "storage_path": "",
          "type": "illustration"
        },
        {
          "fields": [
            "Viktig og haster: gjør dette nå",
            "Viktig, men haster ikke: planlegg tid",
            "Ikke viktig, men haster: deleger eller avklar",
            "Ikke viktig og haster ikke: fjern eller nedprioriter"
          ],
          "heading": "Analyser og kategoriser ukens oppgaver",
          "type": "worksheet"
        },
        {
          "questions": [
            "Hvor bruker du mest tid i dag?",
            "Hvilke oppgaver gir mest verdi over tid?",
            "Hva havner alltid i haster-feltet?",
            "Hva får for lite tid fordi det ikke haster?",
            "Hva bør delegeres eller fjernes?"
          ],
          "type": "reflection_questions"
        }
      ]
    },
    "changes": {
      "content_json": [
        {
          "content": "I en lederhverdag preget av støy og konstant tilgjengelighet, er det lett å bruke mest tid på det som haster – men ikke nødvendigvis det som har størst verdi. \n\nVi kan ikke gi alle oppgaver like mye tid og oppmerksomhet. Derfor er det nyttig å være bevisst på hva vi prioriterer. \n\nEisenhower-matrisen hjelper deg med å skille mellom ting som er viktige og uviktige, haster og ikke haster – og gir deg et visuelt verktøy for å prioritere og styre tiden mer strategisk.",
          "type": "intro"
        },
        {
          "display_name": "",
          "file_id": "",
          "key": "",
          "storage_path": "",
          "type": "illustration"
        },
        {
          "fields": [
            "Viktig og haster: gjør dette nå",
            "Viktig, men haster ikke: planlegg tid",
            "Ikke viktig, men haster: deleger eller avklar",
            "Ikke viktig og haster ikke: fjern eller nedprioriter"
          ],
          "heading": "Analyser og kategoriser ukens oppgaver",
          "type": "worksheet"
        },
        {
          "questions": [
            "Hvor bruker du mest tid i dag?",
            "Hvilke oppgaver gir mest verdi over tid?",
            "Hva havner alltid i haster-feltet?",
            "Hva får for lite tid fordi det ikke haster?",
            "Hva bør delegeres eller fjernes?"
          ],
          "type": "reflection_questions"
        }
      ]
    }
  },
  {
    "slug": "fokusblokkering",
    "id": "44f6b8df-675c-4160-a2bc-b06a37a6adfb",
    "status": "published",
    "expected": {
      "content_json": [
        {
          "content": "Hjernen bruker tid på å komme tilbake til fokus etter avbrudd. Derfor kan en enkel blokk med skjermet tid gi uforholdsmessig stor effekt.",
          "type": "intro"
        },
        {
          "content": "Velg én konkret oppgave og én avgrenset tidsperiode.",
          "heading": "Planlegg blokken",
          "type": "text"
        },
        {
          "fields": [
            "Hva skal jeg jobbe med?",
            "Når starter og slutter blokken?",
            "Hva må være lukket eller skrudd av?",
            "Hva er et godt nok resultat?"
          ],
          "type": "worksheet"
        },
        {
          "content": "Bruk ett minutt etter blokken til å vurdere hva som fungerte og hva du vil justere neste gang.",
          "heading": "Evaluer etterpå",
          "type": "text"
        },
        {
          "questions": [
            "Hva gjorde det lettere å holde fokus?",
            "Hva avbrøt deg?",
            "Hva vil du gjøre annerledes i neste blokk?"
          ],
          "type": "reflection_questions"
        }
      ],
      "basis": "Forskning på oppmerksomhet, deep work og kostnaden ved kontekstbytte."
    },
    "changes": {
      "content_json": [
        {
          "content": "Hjernen bruker tid på å komme tilbake til fokus etter avbrudd. En blokk med skjermet tid kan gjøre det lettere å arbeide sammenhengende med én oppgave.",
          "type": "intro"
        },
        {
          "content": "Velg én konkret oppgave og én avgrenset tidsperiode.",
          "heading": "Planlegg blokken",
          "type": "text"
        },
        {
          "fields": [
            "Hva skal jeg jobbe med?",
            "Når starter og slutter blokken?",
            "Hva må være lukket eller skrudd av?",
            "Hva er et godt nok resultat?"
          ],
          "type": "worksheet"
        },
        {
          "content": "Bruk ett minutt etter blokken til å vurdere hva som fungerte og hva du vil justere neste gang.",
          "heading": "Evaluer etterpå",
          "type": "text"
        },
        {
          "questions": [
            "Hva gjorde det lettere å holde fokus?",
            "Hva avbrøt deg?",
            "Hva vil du gjøre annerledes i neste blokk?"
          ],
          "type": "reflection_questions"
        }
      ],
      "basis": "Leroy (2009), Why is it so hard to do my work? The challenge of attention residue when switching between work tasks, Organizational Behavior and Human Decision Processes, 109, 168–181, doi:10.1016/j.obhdp.2009.04.002. Studien belyser oppmerksomhet ved oppgavebytte; den fastsetter ikke en optimal lengde på fokusblokker."
    }
  },
  {
    "slug": "ledermoter",
    "id": "290b0412-697b-4634-833e-a10c378efa41",
    "status": "published",
    "expected": {
      "content_json": [
        {
          "content": "Ledergruppen er en av organisasjonens viktigste beslutningsarenaer. Likevel opplever mange ledere at en betydelig del av møtetiden gir mindre verdi enn ønskelig.\n\nForskning på ledergrupper viser at kvaliteten på ledermøter i stor grad påvirkes av tre faktorer: gode møteforberedelser, tydelige bestillinger og evnen til å holde diskusjonen fokusert på saken som behandles.\n\nDenne guiden samler de viktigste prinsippene.",
          "type": "intro"
        },
        {
          "content": "Effektive møter starter før møtet begynner.",
          "heading": "Gode møteforberedelser",
          "type": "text"
        },
        {
          "cards": [
            {
              "body": "",
              "title": "Fjern saker som kan løses utenfor ledermøtet."
            },
            {
              "body": "",
              "title": "Tilpass antall saker til tilgjengelig tid."
            },
            {
              "body": "",
              "title": "Sørg for at sakene oppleves relevante for hele ledergruppen."
            },
            {
              "body": "",
              "title": "Send agenda og saksunderlag i god tid."
            }
          ],
          "heading": "",
          "type": "model_cards"
        },
        {
          "content": "Mange diskusjoner blir ineffektive fordi gruppen ikke vet hva den skal oppnå.\n\nFor hver sak bør tre spørsmål besvares:",
          "heading": "Klare bestillinger",
          "type": "text"
        },
        {
          "cards": [
            {
              "body": "Informasjon? Drøfting? Beslutning?",
              "title": "Hva skal oppnås?"
            },
            {
              "body": "Diskutere alternativer? Gi innspill? Utfordre forslag? Ta en beslutning?",
              "title": "Hvordan skal gruppen jobbe?"
            },
            {
              "body": "Hvorfor er saken viktig? Hvorfor må ledergruppen bruke tid på den? Hvordan støtter saken ledergruppens oppdrag?",
              "title": "Hvorfor behandles saken?"
            }
          ],
          "heading": "",
          "type": "model_cards"
        },
        {
          "content": "Selv gode saker mister verdi når diskusjonen sporer av.",
          "heading": "Fokusert kommunikasjon",
          "type": "text"
        },
        {
          "cards": [
            {
              "body": "Nye temaer introduseres før det opprinnelige temaet er ferdig behandlet.",
              "title": "Temahopping"
            },
            {
              "body": "Gruppen begynner å diskutere løsninger før problemet er forstått.",
              "title": "Løsningshopping"
            },
            {
              "body": "Diskusjonen blir for generell og teoretisk.",
              "title": "For høyt abstraksjonsnivå"
            },
            {
              "body": "Diskusjonen går seg fast i detaljer.",
              "title": "For lavt abstraksjonsnivå"
            }
          ],
          "heading": "",
          "type": "model_cards"
        },
        {
          "attribution": "— Bill Gates",
          "quote": "\"You have a meeting to make a decision, not to decide on the question.\" ",
          "type": "quote"
        },
        {
          "heading": "Spilleregler for gode ledermøter",
          "questions": [
            "Les saksunderlaget på forhånd.",
            "Hold deg til bestillingen.",
            "Bidra til saken som behandles.",
            "Still spørsmål når målet med saken er uklart.",
            "Hjelp gruppen tilbake på sporet når diskusjonen avspores.",
            "Skill mellom informasjon, drøfting og beslutning."
          ],
          "type": "reflection_questions"
        },
        {
          "heading": "Refleksjonsspørsmål",
          "questions": [
            "Hvilke av disse prinsippene fungerer best hos oss i dag?",
            "Hvor mister vi mest verdi?",
            "Hvilket tiltak vil gi størst effekt de neste tre månedene?"
          ],
          "type": "reflection_questions"
        }
      ],
      "basis": null
    },
    "changes": {
      "content_json": [
        {
          "content": "Ledergruppen er en av organisasjonens viktigste beslutningsarenaer. Likevel opplever mange ledere at en betydelig del av møtetiden gir mindre verdi enn ønskelig.\n\nEn studie av norske ledergrupper fant at tydelige mål for sakene og fokusert kommunikasjon hang sammen med mer effektive møter (Bang og kolleger, 2010).\n\nDenne guiden samler de viktigste prinsippene.",
          "type": "intro"
        },
        {
          "content": "Effektive møter starter før møtet begynner.",
          "heading": "Gode møteforberedelser",
          "type": "text"
        },
        {
          "cards": [
            {
              "body": "",
              "title": "Fjern saker som kan løses utenfor ledermøtet."
            },
            {
              "body": "",
              "title": "Tilpass antall saker til tilgjengelig tid."
            },
            {
              "body": "",
              "title": "Sørg for at sakene oppleves relevante for hele ledergruppen."
            },
            {
              "body": "",
              "title": "Send agenda og saksunderlag i god tid."
            }
          ],
          "heading": "",
          "type": "model_cards"
        },
        {
          "content": "Mange diskusjoner blir ineffektive fordi gruppen ikke vet hva den skal oppnå.\n\nFor hver sak bør tre spørsmål besvares:",
          "heading": "Klare bestillinger",
          "type": "text"
        },
        {
          "cards": [
            {
              "body": "Informasjon? Drøfting? Beslutning?",
              "title": "Hva skal oppnås?"
            },
            {
              "body": "Diskutere alternativer? Gi innspill? Utfordre forslag? Ta en beslutning?",
              "title": "Hvordan skal gruppen jobbe?"
            },
            {
              "body": "Hvorfor er saken viktig? Hvorfor må ledergruppen bruke tid på den? Hvordan støtter saken ledergruppens oppdrag?",
              "title": "Hvorfor behandles saken?"
            }
          ],
          "heading": "",
          "type": "model_cards"
        },
        {
          "content": "Selv gode saker mister verdi når diskusjonen sporer av.",
          "heading": "Fokusert kommunikasjon",
          "type": "text"
        },
        {
          "cards": [
            {
              "body": "Nye temaer introduseres før det opprinnelige temaet er ferdig behandlet.",
              "title": "Temahopping"
            },
            {
              "body": "Gruppen begynner å diskutere løsninger før problemet er forstått.",
              "title": "Løsningshopping"
            },
            {
              "body": "Diskusjonen blir for generell og teoretisk.",
              "title": "For høyt abstraksjonsnivå"
            },
            {
              "body": "Diskusjonen går seg fast i detaljer.",
              "title": "For lavt abstraksjonsnivå"
            }
          ],
          "heading": "",
          "type": "model_cards"
        },
        {
          "attribution": "— Bill Gates",
          "quote": "\"You have a meeting to make a decision, not to decide on the question.\" ",
          "type": "quote"
        },
        {
          "heading": "Spilleregler for gode ledermøter",
          "questions": [
            "Les saksunderlaget på forhånd.",
            "Hold deg til bestillingen.",
            "Bidra til saken som behandles.",
            "Still spørsmål når målet med saken er uklart.",
            "Hjelp gruppen tilbake på sporet når diskusjonen avspores.",
            "Skill mellom informasjon, drøfting og beslutning."
          ],
          "type": "reflection_questions"
        },
        {
          "heading": "Refleksjonsspørsmål",
          "questions": [
            "Hvilke av disse prinsippene fungerer best hos oss i dag?",
            "Hvor mister vi mest verdi?",
            "Hvilket tiltak vil gi størst effekt de neste tre månedene?"
          ],
          "type": "reflection_questions"
        }
      ],
      "basis": "Bang, Fuglesang, Ovesen og Eilertsen (2010), Effectiveness in top management group meetings: The role of goal clarity, focused communication, and learning behavior, Scandinavian Journal of Psychology, 51, 253–261, doi:10.1111/j.1467-9450.2009.00769.x. Studien undersøkte sammenhenger i åtte ledergrupper, ikke effekten av denne guiden."
    }
  },
  {
    "slug": "mitt-lederprosjekt",
    "id": "9c2de68f-bb69-42fe-94dc-b8d0b4a5be43",
    "status": "published",
    "expected": {
      "suggested_coach_note": "Hei! Ref samtale i dag rundt å definere ditt lederprosjekt."
    },
    "changes": {
      "suggested_coach_note": "Hei! Bruk denne ressursen til å reflektere over og definere ditt lederprosjekt."
    }
  },
  {
    "slug": "moteanalyse",
    "id": "590dab7f-c305-4347-ab42-80f43f6f61d0",
    "status": "published",
    "expected": {
      "not_for": [
        "utfordringen primært handler om struktur",
        "agenda eller manglende beslutningsmandat",
        "konfliktnivået er så høyt at observasjon alene ikke er tilstrekkelig",
        "klienten bruker analysen til å evaluere eller diagnostisere enkeltpersoner",
        "det er behov for akutte organisatoriske tiltak fremfor refleksjon"
      ]
    },
    "changes": {
      "not_for": [
        "utfordringen primært handler om struktur, agenda eller manglende beslutningsmandat",
        "konfliktnivået er så høyt at observasjon alene ikke er tilstrekkelig",
        "klienten bruker analysen til å evaluere eller diagnostisere enkeltpersoner",
        "det er behov for akutte organisatoriske tiltak fremfor refleksjon"
      ]
    }
  },
  {
    "slug": "observasjonsoppdrag",
    "id": "4d3694be-8e07-4714-bb61-e0f304c5202f",
    "status": "published",
    "expected": {
      "best_used_when": [
        "klienten skal bli mer bevisst i sanntid",
        "før atferdseksperiment",
        "gamle mønstre skal observeres",
        "møter",
        "beslutninger eller krevende samtaler"
      ]
    },
    "changes": {
      "best_used_when": [
        "klienten skal bli mer bevisst i sanntid",
        "før atferdseksperiment",
        "gamle mønstre skal observeres",
        "møter, beslutninger eller krevende samtaler"
      ]
    }
  },
  {
    "slug": "prioriteringsrammeverk",
    "id": "a87131b9-e70e-4f7b-830c-940ac7e4bd7e",
    "status": "published",
    "expected": {
      "not_for": [
        "som ren organisasjonsanalyse",
        "områder klienten ikke kan påvirke gjennom egen atferd",
        "prioritering eller kommunikasjon"
      ]
    },
    "changes": {
      "not_for": [
        "som ren organisasjonsanalyse",
        "områder klienten ikke kan påvirke gjennom egen atferd, prioritering eller kommunikasjon"
      ]
    }
  },
  {
    "slug": "mindfulness-pusteovelser-stressregulering",
    "id": "0c15448e-1cfa-427e-9cfb-25edf51198d3",
    "status": "published",
    "expected": {
      "suggested_coach_note": "Velg én av teknikkene og test den to ganger denne uken, gjerne før eller etter en situasjon som vanligvis skaper stress."
    },
    "changes": {
      "suggested_coach_note": "Velg én av teknikkene og prøv den først i en rolig situasjon. Test den gjerne to ganger denne uken, før eller etter en situasjon som vanligvis skaper stress."
    }
  },
  {
    "slug": "tre-gode-ting-kopi-mt71die4-kopi-mt71f8lm",
    "id": "99a5d0df-9273-4012-a617-e078d6fad6cf",
    "status": "published",
    "expected": {
      "client_intro": "Mennesker som har hatt betydning for oss, vet ikke nødvendigvis hvilken betydning de faktisk har hatt. Og vi setter heller ikke alltid selv ord på den.\n\nDenne øvelsen gjør en positiv relasjon eksplisitt: Du identifiserer hva et annet menneske har gjort, hvilken betydning det fikk for deg, og kommuniserer det direkte.\n\nI Seligman og kollegers studie var dette intervensjonen som ga den største umiddelbare positive endringen. Deltakerne rapporterte økt lykke og færre depressive symptomer etter øvelsen. Effekten var fortsatt synlig etter én måned, men ikke etter tre måneder.\n\nDet gjør den annerledes enn «Tre gode ting» og styrkeøvelsen: kraftig på kort sikt, men ikke dokumentert med samme varighet.",
      "summary": "Sett ord på betydningen et annet menneske har hatt for deg – og si det til dem."
    },
    "changes": {
      "client_intro": "Mennesker som har hatt betydning for oss, vet ikke nødvendigvis hvilken betydning de faktisk har hatt. Og vi setter heller ikke alltid selv ord på den.\n\nDenne øvelsen gjør en positiv relasjon eksplisitt: Du identifiserer hva et annet menneske har gjort, hvilken betydning det fikk for deg, og kommuniserer det direkte.\n\nI Seligman og kollegers studie var dette intervensjonen som ga den største umiddelbare positive endringen. Deltakerne rapporterte økt lykke og færre depressive symptomer etter øvelsen. Effekten var fortsatt synlig etter én måned, men ikke etter tre måneder.\n\nI denne studien hadde takknemlighetsbesøket altså en tydelig korttidseffekt, men ikke samme varighet som «Tre gode ting» og styrkeøvelsen.",
      "summary": "Mennesker som har hatt betydning for oss, vet ikke nødvendigvis hvilken betydning de faktisk har hatt. Og vi setter heller ikke alltid selv ord på den.\n\nDenne øvelsen gjør en positiv relasjon eksplisitt: Du identifiserer hva et annet menneske har gjort, hvilken betydning det fikk for deg, og kommuniserer det direkte.\n\nI Seligman og kollegers studie var dette intervensjonen som ga den største umiddelbare positive endringen. Deltakerne rapporterte økt lykke og færre depressive symptomer etter øvelsen. Effekten var fortsatt synlig etter én måned, men ikke etter tre måneder.\n\nI denne studien hadde takknemlighetsbesøket altså en tydelig korttidseffekt, men ikke samme varighet som «Tre gode ting» og styrkeøvelsen."
    }
  },
  {
    "slug": "tankefeller",
    "id": "68704fc6-ffab-4e2b-b156-b1753d46ef04",
    "status": "published",
    "expected": {
      "content_json": [
        {
          "content": "Mennesker tolker ikke situasjoner helt objektivt. Vi bruker mentale snarveier for å forstå det som skjer rundt oss, særlig under stress, usikkerhet eller press. Noen av disse tankemønstrene kan være nyttige, mens andre gjør oss mer rigide, selvkritiske eller reaktive enn situasjonen egentlig tilsier.\n\nTankefeller er vanlige kognitive mønstre som kan påvirke hvordan vi tolker oss selv, andre mennesker og ulike situasjoner. Eksempler kan være å tenke i alt eller ingenting, trekke bastante konklusjoner, overfokusere på det negative eller anta at man vet hva andre tenker.\n\nDette verktøyet hjelper deg med å bli mer bevisst på hvilke tankemønstre som går igjen hos deg, og hvordan de påvirker følelser, valg og handlinger i praksis.",
          "type": "intro"
        },
        {
          "display_name": "",
          "file_id": "",
          "key": "",
          "storage_path": "",
          "type": "illustration"
        },
        {
          "content": "Du ser ting i sort-hvitt uten nyanser. Hvis noe ikke lykkes helt, tolkes det som mislykket.",
          "heading": "01. Alt-eller-ingenting-tenkning",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Jeg mislyktes totalt.",
            "Justering: Hva var delvis bra, delvis vanskelig og fortsatt mulig å forbedre?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du trekker brede konklusjoner basert på én hendelse eller et begrenset antall erfaringer. En enkelt situasjon blir tolket som et mønster eller en sannhet.",
          "heading": "02. Overgeneralisering",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Jeg fikk dårlig respons én gang. Jeg er dårlig til dette.",
            "Justering: Hva sier denne ene situasjonen egentlig, og hva blir for bredt å konkludere med?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du legger mest merke til det negative og overser informasjon som nyanserer eller balanserer situasjonen.",
          "heading": "03. Mentalt filter",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Presentasjonen gikk bra, men jeg fokuserer bare på én ting jeg sa feil.",
            "Justering: Hva fungerte faktisk bra, og hva ville en mer balansert vurdering sett ut som?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du avviser positive tilbakemeldinger, resultater eller erfaringer fordi de ikke stemmer med det du allerede tror om deg selv.",
          "heading": "04. Å avvise det positive",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: De sier jeg gjorde en god jobb, men de mener det sikkert ikke egentlig.",
            "Justering: Hva skjer hvis du tar tilbakemeldingen på alvor i stedet for å forklare den bort?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du antar hva andre tenker, eller hva som kommer til å skje, uten tilstrekkelig informasjon.",
          "heading": "05. Å trekke konklusjoner",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Hun svarte kort. Hun må være irritert på meg.",
            "Justering: Hva vet du faktisk, og hva fyller du inn selv?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du tolker følelsene dine som bevis på at noe er sant.",
          "heading": "Emosjonell resonnering",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Jeg føler meg usikker, derfor er jeg sikkert ikke god nok.",
            "Justering: Kan følelsen være forståelig uten at den nødvendigvis beskriver virkeligheten presist?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du stiller rigide krav til deg selv eller andre om hvordan ting burde være.",
          "heading": "Bør-tanker",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Jeg burde alltid ha kontroll.",
            "Justering: Hva er faktisk realistisk å forvente i denne situasjonen?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du setter negative merkelapper på deg selv eller andre basert på enkeltfeil eller situasjoner.",
          "heading": "Merking",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Jeg gjorde en feil. Jeg er udugelig.",
            "Justering: Hvordan kan du beskrive situasjonen uten å definere hele deg selv ut fra den?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du legger hele ansvaret på deg selv eller andre uten å se helheten i situasjonen.",
          "heading": "Skyldplassering",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Alt dette er min feil.",
            "Justering: Hvilke faktorer påvirket situasjonen utover deg alene?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du overdriver betydningen av feil eller problemer, og undervurderer egne styrker eller ressurser.",
          "heading": "Forstørring og forminsking",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Denne feilen ødelegger alt.",
            "Justering: Hvor stor vil denne situasjonen sannsynligvis oppleves om én måned?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "fields": [
            "Velg én tankefelle du vil være oppmerksom på den neste uken."
          ],
          "heading": "Oppgave",
          "type": "worksheet"
        },
        {
          "questions": [
            "Hvilken tankefelle kjenner du oftest igjen?",
            "Hva blir konsekvensen når du tror på den?",
            "Hva er en mer presis og balansert tolkning?"
          ],
          "type": "reflection_questions"
        }
      ]
    },
    "changes": {
      "content_json": [
        {
          "content": "Mennesker tolker ikke situasjoner helt objektivt. Vi bruker mentale snarveier for å forstå det som skjer rundt oss, særlig under stress, usikkerhet eller press. Noen av disse tankemønstrene kan være nyttige, mens andre gjør oss mer rigide, selvkritiske eller reaktive enn situasjonen egentlig tilsier.\n\nTankefeller er vanlige kognitive mønstre som kan påvirke hvordan vi tolker oss selv, andre mennesker og ulike situasjoner. Eksempler kan være å tenke i alt eller ingenting, trekke bastante konklusjoner, overfokusere på det negative eller anta at man vet hva andre tenker.\n\nDette verktøyet hjelper deg med å bli mer bevisst på hvilke tankemønstre som går igjen hos deg, og hvordan de påvirker følelser, valg og handlinger i praksis.",
          "type": "intro"
        },
        {
          "display_name": "",
          "file_id": "",
          "key": "",
          "storage_path": "",
          "type": "illustration"
        },
        {
          "content": "Du ser ting i sort-hvitt uten nyanser. Hvis noe ikke lykkes helt, tolkes det som mislykket.",
          "heading": "01. Alt-eller-ingenting-tenkning",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Jeg mislyktes totalt.",
            "Justering: Hva var delvis bra, delvis vanskelig og fortsatt mulig å forbedre?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du trekker brede konklusjoner basert på én hendelse eller et begrenset antall erfaringer. En enkelt situasjon blir tolket som et mønster eller en sannhet.",
          "heading": "02. Overgeneralisering",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Jeg fikk dårlig respons én gang. Jeg er dårlig til dette.",
            "Justering: Hva sier denne ene situasjonen egentlig, og hva blir for bredt å konkludere med?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du legger mest merke til det negative og overser informasjon som nyanserer eller balanserer situasjonen.",
          "heading": "03. Mentalt filter",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Presentasjonen gikk bra, men jeg fokuserer bare på én ting jeg sa feil.",
            "Justering: Hva fungerte faktisk bra, og hva ville en mer balansert vurdering sett ut som?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du avviser positive tilbakemeldinger, resultater eller erfaringer fordi de ikke stemmer med det du allerede tror om deg selv.",
          "heading": "04. Å avvise det positive",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: De sier jeg gjorde en god jobb, men de mener det sikkert ikke egentlig.",
            "Justering: Hva skjer hvis du tar tilbakemeldingen på alvor i stedet for å forklare den bort?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du antar hva andre tenker, eller hva som kommer til å skje, uten tilstrekkelig informasjon.",
          "heading": "05. Å trekke konklusjoner",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Hun svarte kort. Hun må være irritert på meg.",
            "Justering: Hva vet du faktisk, og hva fyller du inn selv?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du tolker følelsene dine som bevis på at noe er sant.",
          "heading": "06. Emosjonell resonnering",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Jeg føler meg usikker, derfor er jeg sikkert ikke god nok.",
            "Justering: Kan følelsen være forståelig uten at den nødvendigvis beskriver virkeligheten presist?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du stiller rigide krav til deg selv eller andre om hvordan ting burde være.",
          "heading": "07. Bør-tanker",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Jeg burde alltid ha kontroll.",
            "Justering: Hva er faktisk realistisk å forvente i denne situasjonen?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du setter negative merkelapper på deg selv eller andre basert på enkeltfeil eller situasjoner.",
          "heading": "08. Merking",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Jeg gjorde en feil. Jeg er udugelig.",
            "Justering: Hvordan kan du beskrive situasjonen uten å definere hele deg selv ut fra den?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du legger hele ansvaret på deg selv eller andre uten å se helheten i situasjonen.",
          "heading": "09. Skyldplassering",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Alt dette er min feil.",
            "Justering: Hvilke faktorer påvirket situasjonen utover deg alene?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "content": "Du overdriver betydningen av feil eller problemer, og undervurderer egne styrker eller ressurser.",
          "heading": "10. Forstørring og forminsking",
          "type": "text"
        },
        {
          "fields": [
            "Eksempel: Denne feilen ødelegger alt.",
            "Justering: Hvor stor vil denne situasjonen sannsynligvis oppleves om én måned?"
          ],
          "heading": "",
          "type": "worksheet"
        },
        {
          "fields": [
            "Velg én tankefelle du vil være oppmerksom på den neste uken."
          ],
          "heading": "Oppgave",
          "type": "worksheet"
        },
        {
          "questions": [
            "Hvilken tankefelle kjenner du oftest igjen?",
            "Hva blir konsekvensen når du tror på den?",
            "Hva er en mer presis og balansert tolkning?"
          ],
          "type": "reflection_questions"
        }
      ]
    }
  },
  {
    "slug": "tre-gode-ting",
    "id": "fa90d13a-ad12-403f-b690-ec7accb26abd",
    "status": "published",
    "expected": {
      "client_intro": "Oppmerksomheten vår er ikke et nøytralt kamera. Det som går galt, skaper usikkerhet eller krever handling får lett mer plass enn det som faktisk fungerer.\n\nDenne øvelsen flytter oppmerksomheten mot positive hendelser – men stopper ikke der. Når du også undersøker hvorfor noe gikk bra, blir øvelsen en trening i å oppdage mennesker, handlinger og betingelser som bidrar positivt.\n\nI en randomisert, placebokontrollert studie fant Seligman og kolleger at deltakere som skrev ned tre gode ting og årsaken til dem hver dag i én uke, rapporterte høyere grad av lykke og færre depressive symptomer. Effekten var fortsatt målbar seks måneder senere. \n\nPoenget er ikke å overse problemer. Det er å bli bedre til å legge merke til hele bildet.",
      "basis": "I en randomisert, placebokontrollert studie fant Seligman og kolleger at deltakere som skrev ned tre gode ting og årsaken til dem hver dag i én uke, rapporterte høyere grad av lykke og færre depressive symptomer. Effekten var fortsatt målbar seks måneder senere.",
      "summary": "En enkel øvelse for å legge merke til det som faktisk fungerer – og forstå hva som bidrar til det."
    },
    "changes": {
      "client_intro": "Oppmerksomheten vår er ikke et nøytralt kamera. Det som går galt, skaper usikkerhet eller krever handling får lett mer plass enn det som faktisk fungerer.\n\nDenne øvelsen flytter oppmerksomheten mot positive hendelser – men stopper ikke der. Når du også undersøker hvorfor noe gikk bra, blir øvelsen en trening i å oppdage mennesker, handlinger og betingelser som bidrar positivt.\n\nI en randomisert, placebokontrollert studie fant Seligman og kolleger at deltakere som skrev ned tre gode ting og årsaken til dem hver dag i én uke, rapporterte høyere grad av lykke og færre depressive symptomer. Effekten var fortsatt målbar seks måneder senere. De langsiktige forbedringene i studien var størst hos dem som fortsatte med øvelsene på egen hånd etter den første uken.\n\nPoenget er ikke å overse problemer. Det er å bli bedre til å legge merke til hele bildet.",
      "basis": "Seligman, Steen, Park og Peterson (2005), Positive Psychology Progress: Empirical Validation of Interventions, doi:10.1037/0003-066X.60.5.410. I en randomisert, placebokontrollert studie fant Seligman og kolleger at deltakere som skrev ned tre gode ting og årsaken til dem hver dag i én uke, rapporterte høyere grad av lykke og færre depressive symptomer. Effekten var fortsatt målbar seks måneder senere. De langsiktige forbedringene i studien var størst hos dem som fortsatte med øvelsene på egen hånd etter den første uken.",
      "summary": "Oppmerksomheten vår er ikke et nøytralt kamera. Det som går galt, skaper usikkerhet eller krever handling får lett mer plass enn det som faktisk fungerer.\n\nDenne øvelsen flytter oppmerksomheten mot positive hendelser – men stopper ikke der. Når du også undersøker hvorfor noe gikk bra, blir øvelsen en trening i å oppdage mennesker, handlinger og betingelser som bidrar positivt.\n\nI en randomisert, placebokontrollert studie fant Seligman og kolleger at deltakere som skrev ned tre gode ting og årsaken til dem hver dag i én uke, rapporterte høyere grad av lykke og færre depressive symptomer. Effekten var fortsatt målbar seks måneder senere. De langsiktige forbedringene i studien var størst hos dem som fortsatte med øvelsene på egen hånd etter den første uken.\n\nPoenget er ikke å overse problemer. Det er å bli bedre til å legge merke til hele bildet."
    }
  },
  {
    "slug": "vanskelige-samtaler",
    "id": "659bc968-a53e-420f-aab8-b5ad2492c74c",
    "status": "published",
    "expected": {
      "not_for": [
        "konflikten er eskalert og utrygg",
        "situasjonen krever HR-",
        "juridisk eller formell oppfølging",
        "sterke emosjonelle reaksjoner gjør refleksjon vanskelig i øyeblikket",
        "samtalen handler om alvorlige personalsaker som bør håndteres med støtte"
      ],
      "content_json": [
        {
          "content": "Vanskelige samtaler er en naturlig del av ledelse, samarbeid og relasjoner. Likevel bruker mange mye energi på å utsette dem. Vi håper situasjonen går over av seg selv, at den andre personen skal forstå hintene våre, eller at tidspunktet snart blir bedre.\n\nProblemet er at det som ikke blir sagt ofte begynner å påvirke relasjonen indirekte. Irritasjon bygger seg opp, kommunikasjonen blir mer forsiktig eller mer spiss, og tilliten kan gradvis svekkes.\n\nÅ gjennomføre en vanskelig samtale godt handler ikke om å være konfronterende eller konfliktorientert. Det handler om å være tydelig på det som er viktig, samtidig som man forsøker å bevare respekt, kontakt og psykologisk trygghet.\n\nDenne øvelsen hjelper deg med å forberede en krevende samtale mer bevisst, slik at du går inn i den med større klarhet, ro og tilstedeværelse.",
          "type": "intro"
        },
        {
          "heading": "Før samtalen",
          "questions": [
            "Hva må bli tydelig? Hva er det konkret du trenger å ta opp? Ta utgangspunkt i det du faktisk har sett, hørt eller erfart.",
            "Hva kan gjøre samtalen vanskelig? Hva forventer du at den andre kan reagere på? Hva skjer typisk med deg når du møter motstand, uenighet eller sterke reaksjoner?",
            "Hvordan vil du møte reaksjonen? Tenk gjennom hva du skal holde fast i, og hvor du trenger å være åpen, nysgjerrig og villig til å justere egen forståelse."
          ],
          "type": "reflection_questions"
        },
        {
          "content": "Jo vanskeligere temaet er, desto viktigere er det å skille mellom det du faktisk har observert og det du tolker inn i situasjonen.\n\nTolkning:\n«Du tar ikke ansvar.»\n\nObservasjon:\n«De siste tre leveransene har kommet etter avtalt frist, uten at du har varslet meg på forhånd.»\n\nStart med det du vet. Undersøk resten.",
          "heading": "Observasjon ≠ tolkning",
          "tone": "attention",
          "type": "callout"
        },
        {
          "heading": "02 Åpne samtalen",
          "questions": [
            "En tydelig åpning gjør det lettere for begge å forstå hva samtalen handler om.",
            "Hensikt: Hvorfor tar du samtalen?",
            "Observasjon: Hva har du konkret sett eller hørt?",
            "Betydning: Hvorfor er dette viktig?",
            "Invitasjon: Hvordan ser den andre på situasjonen?"
          ],
          "type": "reflection_questions"
        },
        {
          "content": "«Jeg vil gjerne snakke om hvordan vi følger opp avtalte leveranser. De siste ukene har flere frister blitt flyttet uten at jeg har visst om det på forhånd. Det skaper problemer for resten av teamet. Jeg vil gjerne forstå hvordan du ser på situasjonen.»",
          "heading": "Eksempel",
          "tone": "note",
          "type": "callout"
        },
        {
          "heading": "03 Når samtalen blir vanskelig",
          "questions": [
            "Hvis den andre blir defensiv: Gå tilbake til konkrete observasjoner. Unngå å argumentere om personlighet eller intensjoner.",
            "Hvis den andre er uenig: Undersøk hva dere ser forskjellig før du forsøker å overbevise.",
            "Hvis den andre blir stille: Gi rom. Ikke fyll stillheten umiddelbart.",
            "Hvis den andre reagerer sterkt: Anerkjenn reaksjonen uten å trekke budskapet eller forsøke å løse følelsen.",
            "Hvis den andre angriper tilbake: Lytt til det som kommer, men skill deres tilbakemelding fra saken du tok initiativ til å snakke om."
          ],
          "type": "reflection_questions"
        },
        {
          "fields": [
            "Hva har skjedd? Skriv ned det du faktisk har observert – uten tolkninger av motiv eller personlighet.",
            "Hvorfor må jeg ta dette opp? Hva er konsekvensen hvis ingenting endrer seg?",
            "Hva trenger å bli tydelig? Hva skal den andre forstå når samtalen er ferdig?",
            "Hva vet jeg ikke ennå? Hvilke antakelser trenger jeg å undersøke?",
            "Hva kan bli vanskelig for meg? Hva frykter jeg at den andre skal si eller gjøre? Hva kan det få meg til å gjøre?",
            "Hvordan vil jeg åpne samtalen? Skriv de første to–tre setningene.",
            "Hva ønsker jeg at vi går ut av samtalen med? En beslutning, en forventningsavklaring, en avtale eller noe dere må undersøke videre?"
          ],
          "heading": "Arbeidsark",
          "type": "worksheet"
        }
      ]
    },
    "changes": {
      "not_for": [
        "konflikten er eskalert og utrygg",
        "situasjonen krever HR-, juridisk eller formell oppfølging",
        "sterke emosjonelle reaksjoner gjør refleksjon vanskelig i øyeblikket",
        "samtalen handler om alvorlige personalsaker som bør håndteres med støtte"
      ],
      "content_json": [
        {
          "content": "Vanskelige samtaler er en naturlig del av ledelse, samarbeid og relasjoner. Likevel bruker mange mye energi på å utsette dem. Vi håper situasjonen går over av seg selv, at den andre personen skal forstå hintene våre, eller at tidspunktet snart blir bedre.\n\nProblemet er at det som ikke blir sagt ofte begynner å påvirke relasjonen indirekte. Irritasjon bygger seg opp, kommunikasjonen blir mer forsiktig eller mer spiss, og tilliten kan gradvis svekkes.\n\nÅ gjennomføre en vanskelig samtale godt handler ikke om å være konfronterende eller konfliktorientert. Det handler om å være tydelig på det som er viktig, samtidig som man forsøker å bevare respekt, kontakt og psykologisk trygghet.\n\nDenne øvelsen hjelper deg med å forberede en krevende samtale mer bevisst, slik at du går inn i den med større klarhet, ro og tilstedeværelse.",
          "type": "intro"
        },
        {
          "heading": "01 Før samtalen",
          "questions": [
            "Hva må bli tydelig? Hva er det konkret du trenger å ta opp? Ta utgangspunkt i det du faktisk har sett, hørt eller erfart.",
            "Hva kan gjøre samtalen vanskelig? Hva forventer du at den andre kan reagere på? Hva skjer typisk med deg når du møter motstand, uenighet eller sterke reaksjoner?",
            "Hvordan vil du møte reaksjonen? Tenk gjennom hva du skal holde fast i, og hvor du trenger å være åpen, nysgjerrig og villig til å justere egen forståelse."
          ],
          "type": "reflection_questions"
        },
        {
          "content": "Jo vanskeligere temaet er, desto viktigere er det å skille mellom det du faktisk har observert og det du tolker inn i situasjonen.\n\nTolkning:\n«Du tar ikke ansvar.»\n\nObservasjon:\n«De siste tre leveransene har kommet etter avtalt frist, uten at du har varslet meg på forhånd.»\n\nStart med det du vet. Undersøk resten.",
          "heading": "Observasjon ≠ tolkning",
          "tone": "attention",
          "type": "callout"
        },
        {
          "heading": "02 Åpne samtalen",
          "questions": [
            "En tydelig åpning gjør det lettere for begge å forstå hva samtalen handler om.",
            "Hensikt: Hvorfor tar du samtalen?",
            "Observasjon: Hva har du konkret sett eller hørt?",
            "Betydning: Hvorfor er dette viktig?",
            "Invitasjon: Hvordan ser den andre på situasjonen?"
          ],
          "type": "reflection_questions"
        },
        {
          "content": "«Jeg vil gjerne snakke om hvordan vi følger opp avtalte leveranser. De siste ukene har flere frister blitt flyttet uten at jeg har visst om det på forhånd. Det skaper problemer for resten av teamet. Jeg vil gjerne forstå hvordan du ser på situasjonen.»",
          "heading": "Eksempel",
          "tone": "note",
          "type": "callout"
        },
        {
          "heading": "03 Når samtalen blir vanskelig",
          "questions": [
            "Hvis den andre blir defensiv: Gå tilbake til konkrete observasjoner. Unngå å argumentere om personlighet eller intensjoner.",
            "Hvis den andre er uenig: Undersøk hva dere ser forskjellig før du forsøker å overbevise.",
            "Hvis den andre blir stille: Gi rom. Ikke fyll stillheten umiddelbart.",
            "Hvis den andre reagerer sterkt: Anerkjenn reaksjonen uten å trekke budskapet eller forsøke å løse følelsen.",
            "Hvis den andre angriper tilbake: Lytt til det som kommer, men skill deres tilbakemelding fra saken du tok initiativ til å snakke om."
          ],
          "type": "reflection_questions"
        },
        {
          "fields": [
            "Hva har skjedd? Skriv ned det du faktisk har observert – uten tolkninger av motiv eller personlighet.",
            "Hvorfor må jeg ta dette opp? Hva er konsekvensen hvis ingenting endrer seg?",
            "Hva trenger å bli tydelig? Hva skal den andre forstå når samtalen er ferdig?",
            "Hva vet jeg ikke ennå? Hvilke antakelser trenger jeg å undersøke?",
            "Hva kan bli vanskelig for meg? Hva frykter jeg at den andre skal si eller gjøre? Hva kan det få meg til å gjøre?",
            "Hvordan vil jeg åpne samtalen? Skriv de første to–tre setningene.",
            "Hva ønsker jeg at vi går ut av samtalen med? En beslutning, en forventningsavklaring, en avtale eller noe dere må undersøke videre?"
          ],
          "heading": "Arbeidsark",
          "type": "worksheet"
        }
      ]
    }
  }
]
$payload$::jsonb;
  item jsonb;
  current_resource public.resources%rowtype;
  revised_resource public.resources%rowtype;
  current_fields jsonb;
  field_name text;
begin
  if jsonb_array_length(batch) <> 16
    or (select count(distinct value->>'slug') from jsonb_array_elements(batch)) <> 16 then
    raise exception 'Polish batch must contain exactly 16 distinct resources';
  end if;

  -- Validate and lock every resource before making the first update.
  for item in select value from jsonb_array_elements(batch) order by value->>'slug'
  loop
    if (select array_agg(key order by key) from jsonb_object_keys(item->'expected') as keys(key))
      is distinct from
      (select array_agg(key order by key) from jsonb_object_keys(item->'changes') as keys(key)) then
      raise exception 'Polish baseline fields do not match changes: %', item->>'slug';
    end if;
    for field_name in select jsonb_object_keys(item->'changes')
    loop
      if field_name <> all (array['summary', 'client_intro', 'content_json', 'basis',
        'suggested_coach_note', 'not_for', 'best_used_when']) then
        raise exception 'Unsupported polish field: %', field_name;
      end if;
    end loop;

    select * into current_resource from public.resources
    where slug = item->>'slug' for update;
    if not found then
      raise exception 'Polish resource missing: %', item->>'slug';
    end if;
    if current_resource.id::text is distinct from item->>'id'
      or current_resource.status is distinct from item->>'status'
      or current_resource.archived_at is not null then
      raise exception 'Polish resource identity or publication state changed: %', item->>'slug';
    end if;

    select jsonb_object_agg(key, to_jsonb(current_resource)->key)
    into current_fields from jsonb_object_keys(item->'changes') as keys(key);
    if current_fields is distinct from item->'expected'
      and current_fields is distinct from item->'changes' then
      raise exception 'Polish resource changed since review: %', item->>'slug';
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
      suggested_coach_note = revised_resource.suggested_coach_note,
      not_for = revised_resource.not_for,
      best_used_when = revised_resource.best_used_when,
      updated_at = now()
    where id = current_resource.id;
  end loop;
end;
$polish$;
