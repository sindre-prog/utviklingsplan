-- Local review only. Production needs explicit approval and verified asset upload.
-- See docs/RESOURCE_LIBRARY_EDITORIAL_QA_V2.md. Do not rewrite earlier migrations.
-- Only named fields change; newer edits abort the entire transaction.
do $editorial$
declare
  batch constant jsonb := $payload$
{
  "resources": [
    {
      "id": "742e8f85-f140-4d6d-bf5d-a5f52543bc01",
      "slug": "to-minuttersregelen",
      "expected": {
        "content_json": [
          {
            "content": "Hvis en oppgave tar under to minutter og faktisk bør gjøres av deg, gjør den med en gang.",
            "type": "intro"
          },
          {
            "content": "Gå gjennom små oppgaver eller meldinger. Spør: tar dette under to minutter, og er det riktig at jeg gjør det nå?",
            "heading": "Slik bruker du regelen",
            "type": "text"
          },
          {
            "cards": [
              {
                "body": "Tar det under to minutter? Gjør det.",
                "title": "Gjør nå"
              },
              {
                "body": "Bør noen andre gjøre det? Send det videre.",
                "title": "Deleger"
              },
              {
                "body": "Tar det mer tid? Bestem når du skal gjøre det.",
                "title": "Planlegg"
              },
              {
                "body": "Trenger det egentlig å gjøres? Hvis ikke, la det gå.",
                "title": "Slett eller ignorer"
              }
            ],
            "heading": "",
            "type": "model_cards"
          },
          {
            "heading": "Refleksjonsspørsmål",
            "questions": [
              "Hva skaper unødvendig mental støy akkurat nå?",
              "Hvilke småting utsetter du selv om de kunne vært håndtert raskt?",
              "Når blir 2-minuttersregelen nyttig, og når blir den bare en distraksjon?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Getting Things Done og forskning på beslutningsfriksjon og oppmerksomhetsstyring."
      },
      "changes": {
        "content_json": [
          {
            "content": "Når du går gjennom innkomne oppgaver: Hvis noe tar under to minutter og faktisk bør gjøres av deg, kan du gjøre det med en gang. Regelen gjelder denne avklaringen, ikke hvert avbrudd gjennom arbeidsdagen.",
            "type": "intro"
          },
          {
            "content": "Gå gjennom små oppgaver eller meldinger. Spør: tar dette under to minutter, og er det riktig at jeg gjør det nå?",
            "heading": "Slik bruker du regelen",
            "type": "text"
          },
          {
            "cards": [
              {
                "body": "Tar det under to minutter? Gjør det.",
                "title": "Gjør nå"
              },
              {
                "body": "Bør noen andre gjøre det? Send det videre.",
                "title": "Deleger"
              },
              {
                "body": "Tar det mer tid? Bestem når du skal gjøre det.",
                "title": "Planlegg"
              },
              {
                "body": "Trenger det egentlig å gjøres? Hvis ikke, la det gå.",
                "title": "Slett eller ignorer"
              }
            ],
            "heading": "",
            "type": "model_cards"
          },
          {
            "heading": "Refleksjonsspørsmål",
            "questions": [
              "Hva skaper unødvendig mental støy akkurat nå?",
              "Hvilke småting utsetter du selv om de kunne vært håndtert raskt?",
              "Når blir 2-minuttersregelen nyttig, og når blir den bare en distraksjon?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "David Allen: Getting Things Done. Praktisk regel for avklaring av innkomne oppgaver, ikke en dokumentert optimal tidsgrense. Se When to use GTD's Two-Minute Rule: https://gettingthingsdone.com/2011/06/when-to-use-gtds-two-minute-rule/."
      }
    },
    {
      "id": "493d641d-506a-409b-8a26-7d5435da58de",
      "slug": "a-akseptere-frykt",
      "expected": {
        "basis": "Acceptance and Commitment Therapy (ACT), eksponeringsteori og forskning på psykologisk fleksibilitet og unngåelsesatferd."
      },
      "changes": {
        "basis": "Praktisk lederrefleksjon med utgangspunkt i aksept og verdibasert handling i Acceptance and Commitment Therapy (ACT). Association for Contextual Behavioral Science: The Six Core Processes of ACT, https://contextualscience.org/six_core_processes_act. Oppgaven er en redaksjonell tilpasning, ikke et opplegg for eksponeringsbehandling."
      }
    },
    {
      "id": "22ff6c76-dc38-4b7c-8519-19214ac54194",
      "slug": "aksepter-deg-selv",
      "expected": {
        "content_json": [
          {
            "content": "Denne øvelsen er laget for å brukes på egen hånd når du går gjennom en vanskelig periode.",
            "type": "intro"
          },
          {
            "content": "Tenk på en utfordrende situasjon du står i akkurat nå. Legg merke til følelsene og ubehaget som oppstår, uten å dømme dem.",
            "heading": "Steg 1: Legg merke til øyeblikket",
            "type": "text"
          },
          {
            "fields": [
              "Dette er et øyeblikk med lidelse.",
              "Hva kjenner jeg i kroppen?",
              "Hva er den mest presise følelsen akkurat nå?"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "content": "Minn deg selv på at lidelse, feil og usikkerhet er en del av livet. Du er ikke alene om å ha vanskelige perioder.",
            "heading": "Steg 2: Normaliser ubehaget",
            "type": "text"
          },
          {
            "fields": [
              "Lidelse er en del av livet.",
              "Andre mennesker opplever dette også.",
              "Dette gjør meg ikke svak."
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "content": "Spør hva du ville sagt til en god venn i samme situasjon, og prøv å rette noe av den samme omsorgen mot deg selv.",
            "heading": "Steg 3: Møt deg selv vennlig",
            "type": "text"
          },
          {
            "fields": [
              "Kan jeg være god mot meg selv?",
              "Hva trenger jeg akkurat nå?",
              "Hva er én raus og sann setning jeg kan si til meg selv?"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "questions": [
              "Hva skjer med deg når du møter situasjonen med mindre selvkritikk?",
              "Hva ville du sagt til en god venn i samme situasjon?",
              "Hva trenger du å minne deg selv på akkurat nå?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Selvmedfølelse, emosjonell regulering og psykologisk fleksibilitet."
      },
      "changes": {
        "content_json": [
          {
            "content": "En kort, norsk tilpasning av Kristin Neffs Self-Compassion Break. Bruk den når du merker hard selvkritikk i en krevende situasjon.",
            "type": "intro"
          },
          {
            "content": "Tenk på en utfordrende situasjon du står i akkurat nå. Legg merke til følelsene og ubehaget som oppstår, uten å dømme dem. Du kan sette ord på det slik: «Dette er vanskelig for meg akkurat nå.»",
            "heading": "Steg 1: Legg merke til øyeblikket",
            "type": "text"
          },
          {
            "fields": [
              "Hva kjenner jeg i kroppen?",
              "Hva er den mest presise følelsen akkurat nå?"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "content": "Minn deg selv på at lidelse, feil og usikkerhet er en del av livet. Du er ikke alene om å ha vanskelige perioder. Prøv å finne en påminnelse du tror på, for eksempel: «Også andre strever når de står i noe vanskelig.»",
            "heading": "Steg 2: Normaliser ubehaget",
            "type": "text"
          },
          {
            "type": "text",
            "content": "Du trenger ikke sammenligne hvor vanskelig andre har det, eller bagatellisere din egen situasjon."
          },
          {
            "content": "Spør hva du ville sagt til en god venn i samme situasjon, og prøv å rette noe av den samme omsorgen mot deg selv.",
            "heading": "Steg 3: Møt deg selv vennlig",
            "type": "text"
          },
          {
            "fields": [
              "Kan jeg være god mot meg selv?",
              "Hva trenger jeg akkurat nå?",
              "Hva er én raus og sann setning jeg kan si til meg selv?"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "questions": [
              "Hva skjer med deg når du møter situasjonen med mindre selvkritikk?",
              "Hva ville du sagt til en god venn i samme situasjon?",
              "Hva trenger du å minne deg selv på akkurat nå?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Norsk tilpasning av Kristin Neffs Self-Compassion Break: https://self-compassion.org/exercises/exercise-2-self-compassion-break/. Bygger på oppmerksomt nærvær, felles menneskelighet og vennlighet mot seg selv. Refleksjonsspørsmålene er lagt til for bruk i coaching."
      }
    },
    {
      "id": "fc6a9826-88f8-4f8f-93f4-7ea0d0eea646",
      "slug": "beslutningsprinsipper",
      "expected": {
        "suggested_coach_note": "Definer 3–5 prinsipper du ønsker at andre skal kunne kjenne igjen i hvordan du leder, prioriterer og tar beslutninger. Forsøk å formulere dem så konkret at de faktisk kan brukes i praksis, også i situasjoner med press, konflikt eller usikkerhet.\n\nNår du er ferdig, velg ett nylig dilemma eller en beslutning du har stått i, og vurder hvordan disse prinsippene påvirket – eller burde påvirket – handlingene dine.",
        "basis": "Prinsippstyrt ledelse og beslutningskvalitet."
      },
      "changes": {
        "suggested_coach_note": "Velg én tilbakevendende beslutning der to hensyn trekker i hver sin retning. Bruk oppgaven til å formulere ett prinsipp, og prøv det mot en konkret sak og en situasjon der det blir vanskelig å følge.",
        "basis": "Praktisk arbeidsark for å avklare beslutningsprinsipper. Dilemma, eksempel og spørsmål er redaksjonelt utformet for lederarbeid; dette er ikke et standardisert måleinstrument."
      }
    },
    {
      "id": "c15aa362-536c-4147-91a2-b5133b2627fc",
      "slug": "tre-gode-ting-kopi-mt71die4",
      "expected": {
        "summary": "Velg én av dine sterkeste karakterstyrker og finn en ny måte å bruke den på i arbeidshverdagen.",
        "client_intro": "Det er forskjell på å vite hva du er god på og å faktisk bruke det.\n\nNår du bevisst anvender en av dine sterkeste karakterstyrker i nye situasjoner, utfordrer du etablerte handlingsmønstre og utvider repertoaret ditt. En styrke blir dermed mindre en beskrivelse av hvem du er – og mer en kapasitet du kan bruke med større bevissthet.\n\nI studien identifiserte deltakerne sine fem sterkeste karakterstyrker og brukte én av dem på en ny måte hver dag i én uke. De rapporterte høyere lykke og færre depressive symptomer, med effekter som fortsatt var målbare seks måneder senere. Å bare identifisere styrkene ga derimot ikke samme varige effekt. \n\nInnsikten ligger ikke bare i å kjenne styrkene dine. Verdien oppstår når du bruker dem.",
        "content_json": [
          {
            "content": "Å kjenne egne styrker er én ting. Å bruke dem aktivt er noe annet.\n\nVelg én av dine signaturstyrker fra VIA-kartleggingen. Finn deretter en situasjon der du kan bruke denne styrken på en måte du vanligvis ikke gjør.\n\nEksempel: Hvis nysgjerrighet er en styrke, kan du bruke den i et møte der du vanligvis argumenterer raskt for ditt eget syn. Hvis mot er en styrke, kan du bruke den til å ta opp noe du har unngått.",
            "heading": "Oppgave",
            "type": "text"
          },
          {
            "heading": "Refleksjonsspørsmål",
            "questions": [
              "Hvilken styrke vil jeg bruke?",
              "Hvordan bruker jeg den vanligvis?",
              "Hvor kunne den vært nyttig akkurat nå?",
              "Hva ville vært en ny måte å bruke den på?",
              "Hva skal jeg konkret gjøre?",
              "Hva la jeg merke til etterpå?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Seligman, Steen, Park og Peterson (2005), Positive Psychology Progress: Empirical Validation of Interventions, doi:10.1037/0003-066X.60.5.410. Studien undersøkte blant annet daglig bruk av signaturstyrker på nye måter i én uke. Gruppen viste forbedring i selvrapportert lykke og depressive symptomer ved seksmånedersoppfølging. Studien dokumenterer ikke effekt på lederprestasjoner eller behandlingseffekt for denne portalressursen."
      },
      "changes": {
        "summary": "Det er forskjell på å kjenne styrkene dine og å bruke dem bevisst. Velg én styrke og finn en ny måte å bruke den på i arbeidshverdagen. Legg merke til hva den bidrar med, og når du trenger en annen tilnærming.",
        "client_intro": "Det er forskjell på å kjenne styrkene dine og å bruke dem bevisst. Velg én styrke og finn en ny måte å bruke den på i arbeidshverdagen. Legg merke til hva den bidrar med, og når du trenger en annen tilnærming.",
        "content_json": [
          {
            "content": "Velg én karakterstyrke du kjenner igjen fra VIA-kartleggingen, dersom du har gjort den. Uten kartlegging kan du ta utgangspunkt i en egenskap andre har gitt deg konkrete tilbakemeldinger på. Dette er da din egen vurdering, ikke et VIA-resultat.\n\nFinn en situasjon der du kan bruke styrken på en ny måte. Nysgjerrighet kan for eksempel bety å undersøke en kollegas begrunnelse i et møte der du vanligvis argumenterer raskt for ditt eget syn. Mot kan være å ta opp en vanskelig sak du har utsatt.\n\nSett av omtrent fem minutter daglig til å velge anvendelse og reflektere etterpå. Eventuell førstegangskartlegging kommer i tillegg.",
            "heading": "Oppgave",
            "type": "text"
          },
          {
            "heading": "Refleksjonsspørsmål",
            "questions": [
              "Hvilken styrke vil jeg bruke?",
              "Hvordan bruker jeg den vanligvis?",
              "Hvor kunne den vært nyttig akkurat nå?",
              "Hva ville vært en ny måte å bruke den på?",
              "Hva skal jeg konkret gjøre?",
              "Hva la jeg merke til etterpå?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Seligman, Steen, Park og Peterson (2005), Positive Psychology Progress: Empirical Validation of Interventions. https://doi.org/10.1037/0003-066X.60.5.410. Studien undersøkte daglig bruk av VIA-signaturstyrker på nye måter i én uke. Forbedring i selvrapportert lykke og depressive symptomer ble målt ved seks måneder; langtidseffektene var mest uttalt hos dem som fortsatte. Lederoppgaven her er tilpasset, ikke en effektprøvd intervensjon."
      }
    },
    {
      "id": "6080f5e7-d25a-4401-b910-ba612d196d29",
      "slug": "tre-gode-ting-kopi-mt71die4-kopi-mt71f8lm-kopi-mt71h9cy",
      "expected": {
        "basis": "Inspirert av You at your best i Seligman, Steen, Park og Peterson (2005), doi:10.1037/0003-066X.60.5.410. Deltakerne beskrev en god erfaring og reflekterte over styrkene i den. Studien viste ikke tilsvarende varige resultater som for Tre gode ting. Portalversjonen er en tilpasset lederrefleksjon, ikke en dokumentert metode for varig økning i lykke eller lederprestasjon."
      },
      "changes": {
        "basis": "Seligman, Steen, Park og Peterson (2005), Positive Psychology Progress: Empirical Validation of Interventions. https://doi.org/10.1037/0003-066X.60.5.410. Inspirert av øvelsen You at your best. Norske spørsmål og koblingen til lederarbeid er redaksjonelle tilpasninger. Studien dokumenterer ikke varig effekt av denne portaløvelsen."
      }
    },
    {
      "id": "1fb8e2e7-d179-4e18-83f9-f2aeafa5a737",
      "slug": "eisenhower-matrisen",
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
        ],
        "basis": "Eisenhower-matrisen og prinsipper for prioritering, selvledelse og beslutningstaking."
      },
      "changes": {
        "content_json": [
          {
            "content": "En kort frist kan gjøre en oppgave påtrengende uten at den er viktigst. Matrisen hjelper deg å vurdere to forskjellige spørsmål: Hvilken betydning har oppgaven, og hvor raskt må den håndteres?\n\nVurder betydningen ut fra ansvar, mål, mennesker og risiko. At noe kan vente, betyr ikke at det kan forsømmes. Avklar hvem som bør eie oppgaven før du delegerer.",
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
        ],
        "basis": "Eisenhower-matrisen: praktisk sortering etter betydning og hastegrad. Arbeidsarket og eksemplene er redaksjonelle tilpasninger. Det legges ikke til grunn en fast daglig kvote for kognitiv kapasitet eller en dokumentert effekt av denne portaløvelsen."
      }
    },
    {
      "id": "721d5fb0-82d6-4ef4-b98d-5cb4e3573f6d",
      "slug": "etterkritikk-debrief",
      "expected": {
        "summary": "En strukturert metode for læring etter viktige situasjoner, møter eller prestasjoner.",
        "client_intro": "Mange går videre til neste oppgave uten å stoppe opp og lære systematisk av det som nettopp skjedde.\n\nDebrief brukes i alt fra eliteidrett og beredskap til spesialstyrker og toppledelse fordi små refleksjoner over tid kan gi stor utvikling.",
        "basis": "Debrief, læring og prestasjonsutvikling.",
        "next_step_prompt": "",
        "not_for": []
      },
      "changes": {
        "summary": "Stopp opp etter en leveranse, et møte eller en annen avgrenset arbeidssituasjon. Sammenlign det dere ønsket å få til med det som faktisk skjedde, og velg hva dere vil videreføre eller justere.",
        "client_intro": "Stopp opp etter en leveranse, et møte eller en annen avgrenset arbeidssituasjon. Sammenlign det dere ønsket å få til med det som faktisk skjedde, og velg hva dere vil videreføre eller justere.",
        "basis": "Praktisk debrief for læring etter en avgrenset arbeidssituasjon. Spørsmålene er redaksjonelt utformet; ressursen er ikke et opplegg for psykologisk debrief etter traumatiske hendelser.",
        "next_step_prompt": "Velg én justering til en lignende situasjon, og avtal når dere skal se på hvordan den fungerte.",
        "not_for": [
          "Bearbeiding av traumatiske hendelser eller akutte krisereaksjoner."
        ]
      }
    },
    {
      "id": "44f6b8df-675c-4160-a2bc-b06a37a6adfb",
      "slug": "fokusblokkering",
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
        "coach_guidance": "Start lavterskel: én blokk på 23-50 minutter. Avklar hva som skal skjermes, og hva som likevel kan avbryte.",
        "basis": "Forskning på oppmerksomhet, deep work og kostnaden ved kontekstbytte."
      },
      "changes": {
        "content_json": [
          {
            "content": "Når du bytter oppgave, kan oppmerksomheten henge igjen i det du forlot. Skjermet tid gir deg anledning til å arbeide sammenhengende med én oppgave. Prøv en avgrenset blokk og vurder hva som fungerer i din hverdag.",
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
        "coach_guidance": "Start med én avgrenset blokk, for eksempel 25 minutter. Tiden er et utgangspunkt som tilpasses oppgaven og arbeidsdagen, ikke en optimal forskningsdose. Avklar hva som skal skjermes, og hvilke hendelser som likevel må kunne avbryte.",
        "basis": "Leroy (2009), Why is it so hard to do my work? The challenge of attention residue when switching between work tasks. https://doi.org/10.1016/j.obhdp.2009.04.002. Relevant bakgrunn om oppmerksomhet ved oppgavebytte. Tidsavgrensningen og arbeidsarket er praktiske forslag, ikke testet i denne studien."
      }
    },
    {
      "id": "c20708df-1c38-460f-8af0-c32fb6a959ec",
      "slug": "karrieregrafen",
      "expected": {
        "content_json": [
          {
            "content": "Gå gjennom hvert område og vurder hvor fornøyd du er akkurat nå på en skala fra 1 til 10.",
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
              "Karriereprogresjon",
              "Inntekt",
              "Work/life balance",
              "Beliggenhet",
              "Bedriftskultur",
              "Muligheter for utvikling",
              "Frynsegoder",
              "Emosjonell tilknytning"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "questions": [
              "Hva forteller fordelingen deg om hvor du står i dag?",
              "Hvilke områder ønsker du å prioritere høyere fremover?",
              "Hvilket lite skritt kan du ta denne uken for å forbedre ett område?"
            ],
            "type": "reflection_questions"
          },
          {
            "questions": [
              "Hva scorer høyest og hvorfor?",
              "Hva scorer lavest og hvorfor?",
              "Hva ville gjort størst positiv forskjell akkurat nå?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Karriererefleksjon, livsdesign og coachingbasert mål- og verdikartlegging."
      },
      "changes": {
        "content_json": [
          {
            "content": "Vurder hvor fornøyd du er med hvert område akkurat nå: 1 betyr svært misfornøyd og 10 svært fornøyd. Skriv en kort begrunnelse. Figuren viser et oppdiktet eksempel, ikke en vurdering av deg. Skalaen er en samtalestarter, ikke en standardisert test.",
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
              "Karriereprogresjon",
              "Inntekt",
              "Work/life balance",
              "Beliggenhet",
              "Bedriftskultur",
              "Muligheter for utvikling",
              "Frynsegoder",
              "Tilhørighet til arbeidsplassen"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "questions": [
              "Hva forteller fordelingen deg om hvor du står i dag?",
              "Hvilke områder ønsker du å prioritere høyere fremover?",
              "Hvilket lite skritt kan du ta denne uken for å forbedre ett område?"
            ],
            "type": "reflection_questions"
          },
          {
            "questions": [
              "Hva scorer høyest og hvorfor?",
              "Hva scorer lavest og hvorfor?",
              "Hva ville gjort størst positiv forskjell akkurat nå?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Praktisk arbeidsark for karriererefleksjon. Områder og skala er redaksjonelt valgt og skal ikke tolkes som en validert test. Tallene i figuren er kun et illustrerende eksempel."
      }
    },
    {
      "id": "6c5a4520-d9c5-4066-8d21-152d5e29039b",
      "slug": "kontrollsirkelen",
      "expected": {
        "content_json": [
          {
            "content": "Kontrollsirkelen hjelper deg med å skille mellom det du faktisk kan kontrollere, det du kan påvirke, og det som ligger utenfor din kontroll.\n\nI perioder med stress, usikkerhet eller høyt press bruker mange ledere store mengder mental energi på forhold de i praksis ikke får gjort noe med. Over tid kan dette skape frustrasjon, handlingslammelse og opplevelse av redusert mestring.\n\nVed å tydeliggjøre hva som faktisk ligger innenfor eget handlingsrom, blir det ofte lettere å prioritere energi, ta bedre beslutninger og handle mer bevisst i krevende situasjoner.",
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
            "content": "Skriv ned tre ting som tar mye mental energi akkurat nå.",
            "heading": "Steg 1: Identifiser energityver",
            "type": "text"
          },
          {
            "fields": [
              "Situasjon 1",
              "Situasjon 2",
              "Situasjon 3"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "content": "Marker hva du faktisk kan kontrollere, påvirke eller ikke kontrollere.",
            "heading": "Steg 2: Sorter situasjonene",
            "type": "text"
          },
          {
            "fields": [
              "Hva kan jeg kontrollere?",
              "Hva kan jeg påvirke?",
              "Hva må jeg akseptere?"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "content": "Hvor bruker du mest energi i dag?\nHva overrasker deg når du sorterer dette?\nHvor forsøker du å kontrollere ting som egentlig ikke kan kontrolleres?\nHva skjer hvis du flytter fokus mot påvirkning fremfor bekymring?\nHva kan du gjøre konkret denne uken innenfor din påvirkningssirkel?",
            "heading": "Refleksjon",
            "type": "text"
          },
          {
            "content": "Velg én konkret situasjon denne uken hvor du aktivt skal flytte oppmerksomhet fra bekymring til handling innenfor din påvirkningssirkel.",
            "heading": "Oppgave",
            "type": "text"
          }
        ],
        "basis": "Stoisk filosofi, moderne stressforskning og forskning på psykologisk fleksibilitet og locus of control."
      },
      "changes": {
        "content_json": [
          {
            "content": "Skill mellom det du selv kan velge, det du kan påvirke sammen med andre, og forhold du ikke får endret nå. En situasjon kan inneholde alle tre deler.\n\nDu kan ikke alltid velge hvilke tanker, følelser eller kroppslige reaksjoner som dukker opp. Se etter hva du kan gjøre når de oppstår. Å erkjenne en begrensning betyr heller ikke å godta urett eller slutte å undersøke handlingsrommet ditt.",
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
            "content": "Skriv ned tre ting som tar mye mental energi akkurat nå.",
            "heading": "Steg 1: Identifiser energityver",
            "type": "text"
          },
          {
            "fields": [
              "Situasjon 1",
              "Situasjon 2",
              "Situasjon 3"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "content": "Marker hva du faktisk kan kontrollere, påvirke eller ikke kontrollere.",
            "heading": "Steg 2: Sorter situasjonene",
            "type": "text"
          },
          {
            "fields": [
              "Hva kan jeg kontrollere?",
              "Hva kan jeg påvirke?",
              "Hva må jeg akseptere?"
            ],
            "heading": "",
            "type": "worksheet",
            "content": "Sorter de ulike delene av hver situasjon. Skill det du selv kan velge fra det du bare kan påvirke. Undersøk om handlingsrommet endres med støtte, mandat eller samarbeid."
          },
          {
            "content": "Hvor bruker du mest energi i dag?\nHva overrasker deg når du sorterer dette?\nHvor forsøker du å kontrollere ting som egentlig ikke kan kontrolleres?\nHva skjer hvis du flytter fokus mot påvirkning fremfor bekymring?\nHva kan du gjøre konkret denne uken innenfor din påvirkningssirkel?",
            "heading": "Refleksjon",
            "type": "text",
            "fields": [
              "Hva kan jeg selv velge å gjøre?",
              "Hva kan jeg påvirke, og hvem trenger jeg med?",
              "Hva får jeg ikke endret nå, og hvordan vil jeg forholde meg til det?"
            ]
          },
          {
            "content": "Velg én konkret situasjon denne uken hvor du aktivt skal flytte oppmerksomhet fra bekymring til handling innenfor din påvirkningssirkel.",
            "heading": "Oppgave",
            "type": "text"
          }
        ],
        "basis": "Redaksjonelt refleksjonsverktøy for eget handlingsrom. De tre sirklene er en praktisk sortering, ikke en måling av kontroll. Skillet mellom indre reaksjoner og valgt handling har bakgrunn i ACT: Association for Contextual Behavioral Science, https://contextualscience.org/six_core_processes_act. Figuren er vår egen illustrasjon; ACT er ikke opphav til denne konkrete sirkelmodellen."
      }
    },
    {
      "id": "2c5b1234-df3a-477d-8c52-b61820dac29c",
      "slug": "kubler-ross-endringskurve",
      "expected": {
        "content_json": [
          {
            "content": "Endringskurven brukes til å beskrive hvordan mennesker kan reagere emosjonelt og atferdsmessig når noe kjent forsvinner eller endres.\n\nModellen forbindes med psykiateren Elisabeth Kübler-Ross, som i On Death and Dying (1969) beskrev fem reaksjoner knyttet til døende menneskers møte med egen forestående død: denial, anger, bargaining, depression og acceptance.\n\nModellen ble altså ikke utviklet som en modell for organisatorisk endring. Senere har tankegangen blitt overført til arbeidsliv og endringsledelse som det som ofte omtales som «Kübler-Ross Change Curve».\n\nDet gjør modellen nyttig som et språk for mulige reaksjoner – men ikke som en universell eller lineær beskrivelse av hvordan mennesker faktisk går gjennom endring.",
            "heading": "Hva er endringskurven?",
            "type": "text"
          },
          {
            "display_name": "",
            "file_id": "",
            "key": "",
            "storage_path": "",
            "type": "illustration"
          },
          {
            "content": "«Dette kommer sikkert ikke til å påvirke oss så mye.»\n\nNår en endring blir kjent, kan den første reaksjonen være å distansere seg fra betydningen av den. Informasjon kan avvises, nedtones eller være vanskelig å ta inn.",
            "heading": "01 Fornektelse",
            "type": "text"
          },
          {
            "heading": "Som leder: ",
            "questions": [
              "Gjør endringen konkret. Gjenta relevant informasjon og skap rom for spørsmål uten å forvente umiddelbar aksept."
            ],
            "type": "reflection_questions"
          },
          {
            "content": "«Hvorfor skal dette skje? Dette gir ingen mening.»\n\nNår konsekvensene blir tydeligere, kan reaksjonen være frustrasjon, irritasjon eller motstand. Reaksjonen kan rette seg mot selve endringen, beslutningen eller menneskene som representerer den.",
            "heading": "02 Sinne",
            "type": "text"
          },
          {
            "heading": "Som leder: ",
            "questions": [
              "Ikke behandle enhver negativ reaksjon som et problem som må fjernes. Lytt etter hva reaksjonen forteller om tap, bekymringer eller konsekvenser."
            ],
            "type": "reflection_questions"
          },
          {
            "content": "«Kunne vi ikke gjort det på en annen måte?»\n\nMennesker kan forsøke å finne løsninger som reduserer konsekvensene eller bevarer deler av det gamle. Det kan komme forslag, kompromisser eller forsøk på å påvirke retningen.",
            "heading": "03 Forhandling",
            "type": "text"
          },
          {
            "heading": "Som leder:",
            "questions": [
              "Skill mellom det som faktisk kan påvirkes og det som allerede er besluttet. Gi reell innflytelse der handlingsrommet finnes."
            ],
            "type": "reflection_questions"
          },
          {
            "content": "«Jeg ser ikke helt hvordan dette skal fungere.»\n\nNår det blir tydelig at det gamle ikke kommer tilbake, kan energi og motivasjon falle. Endringen kan oppleves som et tap før det nye ennå oppleves som meningsfullt eller håndterbart.",
            "heading": "04 Nedstemthet",
            "type": "text"
          },
          {
            "heading": "Som leder: ",
            "questions": [
              "Vær tydelig på forventninger, men anerkjenn samtidig at omstilling kan koste energi. Prioriter, støtt og gjør neste steg håndterbart."
            ],
            "type": "reflection_questions"
          },
          {
            "content": "«Ok. Hvordan får vi dette til?»\n\nAksept betyr ikke nødvendigvis at man liker endringen. Det betyr at oppmerksomheten i større grad kan flyttes fra det som var, til hvordan man skal forholde seg til den nye situasjonen.",
            "heading": "05 Aksept",
            "type": "text"
          },
          {
            "heading": "Som leder: ",
            "questions": [
              "Flytt samtalen mot handling, læring og mestring. Hva trenger mennesker for å lykkes i den nye virkeligheten?"
            ],
            "type": "reflection_questions"
          },
          {
            "content": "Det er fristende å lese modellen som fem trinn alle mennesker må gjennom i riktig rekkefølge. Det bør du ikke gjøre.\n\nMennesker reagerer forskjellig på endring. Noen beveger seg raskt mot handling, andre opplever sterkere tapsreaksjoner. Reaksjoner kan overlappe, komme i annen rekkefølge eller dukke opp igjen når nye konsekvenser blir tydelige.\n\nBruk derfor modellen til å stille bedre spørsmål – ikke til å diagnostisere mennesker:\n\nHva ser jeg akkurat nå?\nHva kan reaksjonen være et uttrykk for?\nHva trenger denne personen eller gruppen fra meg nå?",
            "heading": "Kurven er ikke en oppskrift",
            "type": "text"
          }
        ],
        "basis": null
      },
      "changes": {
        "content_json": [
          {
            "content": "Elisabeth Kübler-Ross beskrev i On Death and Dying (1969) fem reaksjoner i møte med egen forestående død: fornektelse, sinne, forhandling, depresjon og aksept. Boken handlet ikke om organisatorisk endring.\n\nHer brukes reaksjonene som spørsmål til lederrefleksjon. «Nedstemthet» er en bevisst tilpasning av ordet depression, ikke en diagnose. Eksemplene fra arbeidslivet er våre egne. Reaksjoner kan overlappe, komme tilbake eller utebli.\n\nSelv om navnet endringskurve er mye brukt, viser illustrasjonen ingen tidsakse eller målt gjennomføringsevne. Den sier ikke hvordan endring vil utvikle seg for en bestemt person.",
            "heading": "Hva er endringskurven?",
            "type": "text"
          },
          {
            "display_name": "",
            "file_id": "",
            "key": "",
            "storage_path": "",
            "type": "illustration"
          },
          {
            "content": "«Dette kommer sikkert ikke til å påvirke oss så mye.»\n\nNår en endring blir kjent, kan den første reaksjonen være å distansere seg fra betydningen av den. Informasjon kan avvises, nedtones eller være vanskelig å ta inn.",
            "heading": "Fornektelse",
            "type": "text"
          },
          {
            "heading": "Som leder",
            "type": "text",
            "content": "Gjør endringen konkret. Gjenta relevant informasjon og skap rom for spørsmål uten å forvente umiddelbar aksept."
          },
          {
            "content": "«Hvorfor skal dette skje? Dette gir ingen mening.»\n\nNår konsekvensene blir tydeligere, kan reaksjonen være frustrasjon, irritasjon eller motstand. Reaksjonen kan rette seg mot selve endringen, beslutningen eller menneskene som representerer den.",
            "heading": "Sinne",
            "type": "text"
          },
          {
            "heading": "Som leder",
            "type": "text",
            "content": "Ikke behandle enhver negativ reaksjon som et problem som må fjernes. Lytt etter hva reaksjonen forteller om tap, bekymringer eller konsekvenser."
          },
          {
            "content": "«Kunne vi ikke gjort det på en annen måte?»\n\nMennesker kan forsøke å finne løsninger som reduserer konsekvensene eller bevarer deler av det gamle. Det kan komme forslag, kompromisser eller forsøk på å påvirke retningen.",
            "heading": "Forhandling",
            "type": "text"
          },
          {
            "heading": "Som leder",
            "type": "text",
            "content": "Skill mellom det som faktisk kan påvirkes og det som allerede er besluttet. Gi reell innflytelse der handlingsrommet finnes."
          },
          {
            "content": "«Jeg ser ikke helt hvordan dette skal fungere.»\n\nNår det blir tydelig at det gamle ikke kommer tilbake, kan energi og motivasjon falle. Endringen kan oppleves som et tap før det nye ennå oppleves som meningsfullt eller håndterbart.",
            "heading": "Nedstemthet",
            "type": "text"
          },
          {
            "heading": "Som leder",
            "type": "text",
            "content": "Vær tydelig på forventninger, men anerkjenn samtidig at omstilling kan koste energi. Prioriter, støtt og gjør neste steg håndterbart."
          },
          {
            "content": "«Ok. Hvordan får vi dette til?»\n\nAksept betyr ikke nødvendigvis at man liker endringen. Det betyr at oppmerksomheten i større grad kan flyttes fra det som var, til hvordan man skal forholde seg til den nye situasjonen.",
            "heading": "Aksept",
            "type": "text"
          },
          {
            "heading": "Som leder",
            "type": "text",
            "content": "Flytt samtalen mot handling, læring og mestring. Hva trenger mennesker for å lykkes i den nye virkeligheten?"
          },
          {
            "content": "Det er fristende å lese modellen som fem trinn alle mennesker må gjennom i riktig rekkefølge. Det bør du ikke gjøre.\n\nMennesker reagerer forskjellig på endring. Noen beveger seg raskt mot handling, andre opplever sterkere tapsreaksjoner. Reaksjoner kan overlappe, komme i annen rekkefølge eller dukke opp igjen når nye konsekvenser blir tydelige.\n\nBruk derfor modellen til å stille bedre spørsmål – ikke til å diagnostisere mennesker:\n\nHva ser jeg akkurat nå?\nHva kan reaksjonen være et uttrykk for?\nHva trenger denne personen eller gruppen fra meg nå?",
            "heading": "Kurven er ikke en oppskrift",
            "type": "text"
          }
        ],
        "basis": "Elisabeth Kübler-Ross (1969), On Death and Dying. Boken beskriver reaksjoner hos døende, ikke en modell for organisatorisk endring. Portaltekst, eksempler og femfeltsfigur er redaksjonelle tilpasninger. De skal ikke brukes som en måling av fremdrift, som diagnose eller som en fast rekkefølge alle må gjennom."
      }
    },
    {
      "id": "290b0412-697b-4634-833e-a10c378efa41",
      "slug": "ledermoter",
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
            "content": "Bruk ledermøtet til saker som trenger gruppens felles vurdering. Avklar hva dere skal oppnå med hver sak, gjør det mulig å forberede seg, og hjelp hverandre å holde diskusjonen relevant.\n\nRådene nedenfor er praktiske forslag. Velg ett område dere trenger å forbedre, og vurder det sammen etter møtet.",
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
        "basis": "Bang, Fuglesang, Ovesen og Eilertsen (2010), Effectiveness in top management group meetings: The role of goal clarity, focused communication, and learning behavior. https://doi.org/10.1111/j.1467-9450.2009.00769.x. Studien undersøkte sammenhenger mellom disse forholdene og møteeffektivitet. Rådene i ressursen er en praktisk sammenstilling, ikke studiens nøyaktige modell eller et validert møteopplegg."
      }
    },
    {
      "id": "9c2de68f-bb69-42fe-94dc-b8d0b4a5be43",
      "slug": "mitt-lederprosjekt",
      "expected": {
        "suggested_coach_note": "Hei! Ref samtale i dag rundt å definere ditt lederprosjekt."
      },
      "changes": {
        "suggested_coach_note": "Bruk spørsmålene til å sette ord på hva du ønsker å få til gjennom lederrollen din. Ta med refleksjonen når du avklarer eller videreutvikler det ytre prosjektet."
      }
    },
    {
      "id": "590dab7f-c305-4347-ab42-80f43f6f61d0",
      "slug": "moteanalyse",
      "expected": {
        "content_json": [
          {
            "content": "Møter er et av stedene ledelse blir mest synlig i praksis. Det er her prioriteringer tydeliggjøres, relasjoner formes, beslutninger tas og psykologisk trygghet enten styrkes eller svekkes. Likevel reflekterer få systematisk over hva som faktisk skjer i møtene de deltar i eller leder.\n\nMøteanalyse hjelper deg med å observere dynamikk, kommunikasjon og egen lederatferd mer bevisst. Målet er ikke å evaluere mennesker, men å få øye på mønstre som påvirker samarbeid, involvering, kvaliteten på beslutninger og hvordan teamet fungerer over tid.",
            "type": "intro"
          },
          {
            "fields": [
              "Hvem snakket mest?",
              "Hvem sa lite?",
              "Hvor oppsto energi eller motstand?",
              "Ble beslutninger tydelige?",
              "Hva gjorde du som leder?",
              "Hva burde vært gjort annerledes?"
            ],
            "heading": "Arbeidsark",
            "type": "worksheet"
          },
          {
            "questions": [
              "Hvem får mest plass?",
              "Hva blir ikke sagt?",
              "Hvordan påvirker du dynamikken?",
              "Hvilke mønstre gjentar seg?"
            ],
            "type": "reflection_questions"
          }
        ],
        "not_for": [
          "utfordringen primært handler om struktur",
          "agenda eller manglende beslutningsmandat",
          "konfliktnivået er så høyt at observasjon alene ikke er tilstrekkelig",
          "klienten bruker analysen til å evaluere eller diagnostisere enkeltpersoner",
          "det er behov for akutte organisatoriske tiltak fremfor refleksjon"
        ],
        "next_step_prompt": null
      },
      "changes": {
        "content_json": [
          {
            "content": "Velg ett møte du deltar i eller leder. Noter konkrete observasjoner før du tolker hva de betyr: Hvem bidrar, hvilke spørsmål blir stilt, og hvordan avklares beslutninger?\n\nAt noen sier lite, forteller ikke alene om de er utrygge eller uengasjerte. Undersøk perspektivet deres. Målet er å forstå samspillet og din egen rolle, ikke å bedømme enkeltpersoner.",
            "type": "intro"
          },
          {
            "fields": [
              "Hvem snakket mest?",
              "Hvem sa lite?",
              "Hvor oppsto energi eller motstand?",
              "Ble beslutninger tydelige?",
              "Hva gjorde du som leder?",
              "Hva burde vært gjort annerledes?"
            ],
            "heading": "Arbeidsark",
            "type": "worksheet"
          },
          {
            "questions": [
              "Hvem får mest plass?",
              "Hva blir ikke sagt?",
              "Hvordan påvirker du dynamikken?",
              "Hvilke mønstre gjentar seg?"
            ],
            "type": "reflection_questions"
          }
        ],
        "not_for": [
          "Konfliktnivået er så høyt at observasjon alene ikke er tilstrekkelig.",
          "Analysen brukes til å evaluere eller diagnostisere enkeltpersoner.",
          "Situasjonen krever akutte organisatoriske tiltak."
        ],
        "next_step_prompt": "Velg én konkret endring i hvordan du leder neste møte. Avklar med deltakerne hva de la merke til, og hva som bør justeres videre."
      }
    },
    {
      "id": "0edab4f3-85dd-4e70-b2d9-9f99a422c29a",
      "slug": "omvend-din-indre-kritiker",
      "expected": {
        "content_json": [
          {
            "content": "Mange mennesker har en indre stemme som kommenterer, vurderer og kritiserer dem gjennom dagen. For noen fungerer denne stemmen som en drivkraft. For andre blir den så hard, konstant eller negativ at den begynner å påvirke selvfølelse, prestasjonsevne og trygghet i møte med andre.\n\nIndre selvkritikk oppstår ofte som et forsøk på å beskytte oss mot feil, avvisning eller nederlag. Problemet er at den samme stemmen over tid også kan bidra til stress, perfeksjonisme, unngåelse og redusert mestringsfølelse.\n\nMålet med denne øvelsen er ikke å fjerne all selvkritikk, men å bli mer bevisst på hvordan du snakker til deg selv, og undersøke om den indre dialogen faktisk hjelper deg slik den er i dag. Målet er å utvikle en indre stemme som både kan være ærlig, tydelig og støttende samtidig.",
            "type": "intro"
          },
          {
            "content": "Skriv ned en situasjon der du har følt deg usikker, kritisert deg selv eller vært redd for å mislykkes.",
            "heading": "1. Identifiser din indre kritiker",
            "type": "text"
          },
          {
            "fields": [
              "Hva sa din indre stemme?",
              "Hvilke ord eller fraser brukte den?",
              "Hvordan påvirket tankene følelsene og handlingene dine?"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "content": "Stopp opp og still noen kritiske spørsmål til tanken.",
            "heading": "2. Utfordre den indre kritikeren",
            "type": "text"
          },
          {
            "fields": [
              "Er dette en objektiv sannhet eller en subjektiv tolkning?",
              "Hva prøver denne tanken å beskytte meg mot?",
              "Hvilke bevis taler imot tanken?"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "content": "Formuler den negative tanken om til en mer konstruktiv og støttende tanke.",
            "heading": "3. Skap din indre støttespiller",
            "type": "text"
          },
          {
            "fields": [
              "Hva ville en god venn sagt?",
              "Hva er sant, men mer hjelpsomt?",
              "Hvilken setning kan hjelpe meg å handle klokere?"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "questions": [
              "Hva sier den indre kritikeren oftest?",
              "Hva forsøker den å beskytte deg mot?",
              "Hva blir mulig når du svarer den på en mer støttende måte?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Kognitiv restrukturering, selvmedfølelse og prestasjonspsykologi."
      },
      "changes": {
        "content_json": [
          {
            "content": "Legg merke til hva du sier til deg selv når noe blir vanskelig. Undersøk hva som er en presis vurdering, og hva som er en hard konklusjon om deg som person.\n\nSelvkritikk kan henge sammen med et ønske om å unngå feil eller avvisning, men du trenger ikke finne én forklaring på hvorfor tanken oppstår. Spør heller om den er godt begrunnet og hjelper deg å møte situasjonen.",
            "type": "intro"
          },
          {
            "content": "Skriv ned en situasjon der du har følt deg usikker, kritisert deg selv eller vært redd for å mislykkes.",
            "heading": "1. Identifiser din indre kritiker",
            "type": "text"
          },
          {
            "fields": [
              "Hva sa din indre stemme?",
              "Hvilke ord eller fraser brukte den?",
              "Hvordan påvirket tankene følelsene og handlingene dine?"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "content": "Stopp opp og still noen kritiske spørsmål til tanken.",
            "heading": "2. Utfordre den indre kritikeren",
            "type": "text"
          },
          {
            "fields": [
              "Hva vet jeg, og hva tolker jeg?",
              "Hva støtter tanken, og hva taler imot den?",
              "Hva ville en mer nyansert vurdering ta hensyn til?"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "content": "Formuler en vurdering som tar både fakta og utfordringer på alvor, og som hjelper deg å handle. Du trenger ikke gjøre tanken positiv eller late som problemet er borte.",
            "heading": "3. Skap din indre støttespiller",
            "type": "text"
          },
          {
            "fields": [
              "Hva ville en god venn sagt?",
              "Hva er sant, men mer hjelpsomt?",
              "Hvilken setning kan hjelpe meg å handle klokere?"
            ],
            "heading": "",
            "type": "worksheet"
          },
          {
            "questions": [
              "Hva sier den indre kritikeren oftest?",
              "Når blir selvkritikken nyttig, og når blir den for hard eller upresis?",
              "Hva blir mulig når du svarer den på en mer støttende måte?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Praktisk tilpasning av kognitiv undersøkelse og selvmedfølelse. Beck Institute: Testing Your Thoughts, https://beckinstitute.org/wp-content/uploads/2021/08/Testing-Your-Thoughts-Worksheet.pdf. Kristin Neff: Self-Compassion Break, https://self-compassion.org/exercises/exercise-2-self-compassion-break/. Arbeidsarket er redaksjonelt utformet for lederrefleksjon, ikke behandling."
      }
    },
    {
      "id": "86a43744-7ba5-494e-904e-cd09e6de21af",
      "slug": "pareto-prinsippet",
      "expected": {
        "content_json": [
          {
            "content": "I mange arbeidshverdager behandles oppgaver som om de har omtrent samme verdi. I praksis stemmer det sjelden. Noen få aktiviteter, beslutninger eller relasjoner står ofte for en uforholdsmessig stor del av resultatene vi skaper.\n\nPareto-prinsippet, ofte omtalt som 80/20-regelen, beskriver denne skjevheten: En relativt liten andel av innsatsen vår bidrar ofte til en stor andel av effekten. Prinsippet brukes i alt fra strategi og produktivitet til økonomi og ledelse, og handler i bunn og grunn om å identifisere hva som faktisk driver verdi.\n\nFor ledere betyr dette ofte å stille vanskeligere spørsmål: Hva er det egentlig som flytter organisasjonen fremover? Hvilke oppgaver gir mest effekt? Hvor brukes tid og energi uten tilsvarende verdi?\n\nMålet med denne øvelsen er ikke å gjøre mer på kortere tid. Det er å bli mer bevisst på hvor innsatsen din faktisk har størst betydning.",
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
            "content": "Gå gjennom oppgaver, møter og beslutninger fra den siste uken. Marker hvilke aktiviteter som faktisk skapte mest verdi, fremdrift eller effekt, og hvilke som først og fremst tok tid og oppmerksomhet.\n\nMålet er å identifisere hvilke 20 % av innsatsen som gir størst resultat, og hvilke aktiviteter som kan reduseres, delegeres eller fjernes.",
            "heading": "Øvelse",
            "type": "text"
          },
          {
            "fields": [
              "Hva i kalenderen skaper mest verdi? Hvilke 20 % av aktivitetene dine bidro mest til resultatene?",
              "Hva skaper mest støy? Hvilke oppgaver tok mye tid, men ga lite effekt?",
              "Hva kan du velge bort uten stor konsekvens?",
              "Hva bør stoppes, delegeres eller automatiseres?"
            ],
            "heading": "Refleksjonsspørsmål",
            "type": "worksheet"
          },
          {
            "questions": [
              "Velg én lavverdiaktivitet du skal redusere neste uke."
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Pareto-prinsippet og praktisk prioriteringsarbeid i ledelse og produktivitet."
      },
      "changes": {
        "content_json": [
          {
            "content": "Noen oppgaver og beslutninger kan ha større betydning enn andre. Pareto-prinsippet, ofte kalt 80/20-regelen, brukes som en påminnelse om å undersøke denne forskjellen.\n\n80 og 20 er ikke en fasit for kalenderen din. Fordelingen må undersøkes i den konkrete situasjonen. Nødvendig oppfølging, vedlikehold og risikohåndtering kan ha stor verdi selv om resultatet ikke er lett å måle.",
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
            "content": "Se på oppgaver, møter og beslutninger fra den siste uken. Hvilke bidro mest til det du skulle få til? Hvilke tok mer tid enn verdien forsvarte?\n\nVelg noen få aktiviteter du vil undersøke nærmere. Ikke let etter nøyaktig 20 prosent, og vurder ansvar og risiko før du reduserer, delegerer eller fjerner noe.",
            "heading": "Øvelse",
            "type": "text"
          },
          {
            "fields": [
              "Hvilke aktiviteter bidro mest til det du skulle få til? Hva bygger du vurderingen på?",
              "Hva skaper mest støy? Hvilke oppgaver tok mye tid, men ga lite effekt?",
              "Hva kan du velge bort uten stor konsekvens?",
              "Hva bør stoppes, delegeres eller automatiseres?"
            ],
            "heading": "Refleksjonsspørsmål",
            "type": "worksheet"
          },
          {
            "questions": [
              "Velg én lavverdiaktivitet du skal redusere neste uke."
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Pareto-prinsippet brukt som en praktisk tommelfingerregel for prioritering. 80/20-figuren er en prinsippskisse, ikke målte resultater eller en universell fordeling. Arbeidsarket er redaksjonelt utformet."
      }
    },
    {
      "id": "a87131b9-e70e-4f7b-830c-940ac7e4bd7e",
      "slug": "prioriteringsrammeverk",
      "expected": {
        "not_for": [
          "som ren organisasjonsanalyse",
          "områder klienten ikke kan påvirke gjennom egen atferd",
          "prioritering eller kommunikasjon"
        ],
        "next_step_prompt": "Velg maksimalt tre utviklingsområder som skal inn i utviklingsplanen."
      },
      "changes": {
        "not_for": [
          "som ren organisasjonsanalyse",
          "områder klienten ikke kan påvirke gjennom egen atferd"
        ],
        "next_step_prompt": "Bruk prioriteringen til å velge inntil tre lederkompetanser i Indre prosjekt under Utviklingsfokus. Knytt valget til hva du trenger å lykkes med i det ytre prosjektet."
      }
    },
    {
      "id": "0c15448e-1cfa-427e-9cfb-25edf51198d3",
      "slug": "mindfulness-pusteovelser-stressregulering",
      "expected": {
        "suggested_coach_note": "Velg én av teknikkene og test den to ganger denne uken, gjerne før eller etter en situasjon som vanligvis skaper stress."
      },
      "changes": {
        "suggested_coach_note": "Velg én øvelse og prøv den først når du sitter rolig og har litt tid. Hold pusten uanstrengt, og stopp hvis du blir svimmel eller mer urolig. Vurder etterpå om øvelsen kan passe som en kort pause i arbeidshverdagen."
      }
    },
    {
      "id": "f67b6409-4d39-4788-be66-38a5d66ae3f0",
      "slug": "skap-gjennomslag-uten-formell-myndighet",
      "expected": {
        "basis": "Kilder til sosial makt og situasjonstilpassede påvirkningstaktikker. French og Raven (1959); Yukl, Guinan og Sottolano (1995)."
      },
      "changes": {
        "basis": "French og Raven (1959), The Bases of Social Power, i Studies in Social Power. https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Power/French_%26_Raven_Studies_Social_Power_ch9_pp150-167.pdf. Bakgrunn om kilder til sosial makt. Kortene Kunnskap, Troverdighet, Relasjon og Gjensidighet er vår praktiske sammenstilling, ikke de fem maktbasene i originalmodellen. For situasjonsavhengige påvirkningstaktikker: Yukl og Falbe (1990), Influence Tactics and Objectives in Upward, Downward, and Lateral Influence Attempts, https://doi.org/10.1037/0021-9010.75.2.132. Samtaleopplegget er en redaksjonell tilpasning."
      }
    },
    {
      "id": "99a5d0df-9273-4012-a617-e078d6fad6cf",
      "slug": "tre-gode-ting-kopi-mt71die4-kopi-mt71f8lm",
      "expected": {
        "summary": "Sett ord på betydningen et annet menneske har hatt for deg – og si det til dem.",
        "client_intro": "Mennesker som har hatt betydning for oss, vet ikke nødvendigvis hvilken betydning de faktisk har hatt. Og vi setter heller ikke alltid selv ord på den.\n\nDenne øvelsen gjør en positiv relasjon eksplisitt: Du identifiserer hva et annet menneske har gjort, hvilken betydning det fikk for deg, og kommuniserer det direkte.\n\nI Seligman og kollegers studie var dette intervensjonen som ga den største umiddelbare positive endringen. Deltakerne rapporterte økt lykke og færre depressive symptomer etter øvelsen. Effekten var fortsatt synlig etter én måned, men ikke etter tre måneder.\n\nDet gjør den annerledes enn «Tre gode ting» og styrkeøvelsen: kraftig på kort sikt, men ikke dokumentert med samme varighet.",
        "content_json": [
          {
            "content": "Tenk på en person som har gjort noe viktig eller godt for deg, men som du aldri har takket ordentlig.\n\nSkriv et kort brev der du beskriver:\n\n* hva personen gjorde\n* hvorfor det betydde noe for deg\n* hvilken betydning det har hatt siden\n\nHvis det passer, avtal å møte personen og les brevet for dem.",
            "heading": "Oppgave",
            "type": "text"
          },
          {
            "heading": "Refleksjonsspørsmål",
            "questions": [
              "Hva var lett eller vanskelig å sette ord på?",
              "Hva la du merke til hos den andre?",
              "Hva gjorde samtalen med relasjonen?",
              "Er det andre mennesker du tar betydningen av litt for gitt?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Seligman, Steen, Park og Peterson (2005), Positive Psychology Progress: Empirical Validation of Interventions, doi:10.1037/0003-066X.60.5.410. Takknemlighetsbesøket ga i studien forbedring i selvrapportert lykke og depressive symptomer gjennom én måned, men ikke ved tre måneder. Resultatet fra Tre gode ting skal ikke overføres til denne øvelsen. Her brukes besøket til å uttrykke takknemlighet, ikke som behandling."
      },
      "changes": {
        "summary": "Mennesker som har hatt betydning for oss, vet ikke alltid hva de har bidratt med. Sett ord på hva en person gjorde og hva det betydde for deg. Du bestemmer selv om og hvordan du vil dele det.",
        "client_intro": "Mennesker som har hatt betydning for oss, vet ikke alltid hva de har bidratt med. Sett ord på hva en person gjorde og hva det betydde for deg. Du bestemmer selv om og hvordan du vil dele det.",
        "content_json": [
          {
            "content": "Tenk på en person som har gjort noe viktig eller godt for deg, men som du aldri har takket ordentlig.\n\nSkriv et kort brev der du beskriver:\n\n* hva personen gjorde\n* hvorfor det betydde noe for deg\n* hvilken betydning det har hatt siden\n\nHvis det passer, avtal å møte personen og les brevet for dem.",
            "heading": "Oppgave",
            "type": "text"
          },
          {
            "heading": "Refleksjonsspørsmål",
            "questions": [
              "Hva var lett eller vanskelig å sette ord på?",
              "Hva ble tydeligere for deg da du skrev brevet?",
              "Hvis du delte det: Hva la du merke til i samtalen?",
              "Er det andre mennesker du ønsker å takke mer konkret?"
            ],
            "type": "reflection_questions"
          }
        ],
        "basis": "Seligman, Steen, Park og Peterson (2005), Positive Psychology Progress: Empirical Validation of Interventions. https://doi.org/10.1037/0003-066X.60.5.410. Takknemlighetsbesøket ga i denne studien bedring i selvrapportert lykke og depressive symptomer til og med én måned, men ikke ved tre måneder. Portalversjonen lar deltakeren velge om brevet deles; dette er ikke identisk med studieopplegget."
      }
    },
    {
      "id": "68704fc6-ffab-4e2b-b156-b1753d46ef04",
      "slug": "tankefeller",
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
        ],
        "basis": "Kognitiv atferdsterapi og forskning på kognitive forvrengninger."
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
        ],
        "basis": "Praktisk oversikt over vanlige tankemønstre fra kognitiv terapi. Spørsmålene skal brukes til å undersøke tolkninger, ikke til å sette merkelapper på mennesker. Metodebakgrunn: Beck Institute, Testing Your Thoughts, https://beckinstitute.org/wp-content/uploads/2021/08/Testing-Your-Thoughts-Worksheet.pdf. Norske kategorinavn og eksempler er redaksjonelle tilpasninger."
      }
    },
    {
      "id": "fa90d13a-ad12-403f-b690-ec7accb26abd",
      "slug": "tre-gode-ting",
      "expected": {
        "summary": "En enkel øvelse for å legge merke til det som faktisk fungerer – og forstå hva som bidrar til det.",
        "client_intro": "Oppmerksomheten vår er ikke et nøytralt kamera. Det som går galt, skaper usikkerhet eller krever handling får lett mer plass enn det som faktisk fungerer.\n\nDenne øvelsen flytter oppmerksomheten mot positive hendelser – men stopper ikke der. Når du også undersøker hvorfor noe gikk bra, blir øvelsen en trening i å oppdage mennesker, handlinger og betingelser som bidrar positivt.\n\nI en randomisert, placebokontrollert studie fant Seligman og kolleger at deltakere som skrev ned tre gode ting og årsaken til dem hver dag i én uke, rapporterte høyere grad av lykke og færre depressive symptomer. Effekten var fortsatt målbar seks måneder senere. \n\nPoenget er ikke å overse problemer. Det er å bli bedre til å legge merke til hele bildet.",
        "basis": "I en randomisert, placebokontrollert studie fant Seligman og kolleger at deltakere som skrev ned tre gode ting og årsaken til dem hver dag i én uke, rapporterte høyere grad av lykke og færre depressive symptomer. Effekten var fortsatt målbar seks måneder senere."
      },
      "changes": {
        "summary": "Legg merke til tre ting som gikk bra, og undersøk hva som bidro. Det kan være en liten handling, hjelp fra en annen eller forhold som gjorde arbeidet lettere. Du trenger ikke overse det som var vanskelig for å se hva som fungerte.",
        "client_intro": "Legg merke til tre ting som gikk bra, og undersøk hva som bidro. Det kan være en liten handling, hjelp fra en annen eller forhold som gjorde arbeidet lettere. Du trenger ikke overse det som var vanskelig for å se hva som fungerte.",
        "basis": "Seligman, Steen, Park og Peterson (2005), Positive Psychology Progress: Empirical Validation of Interventions. https://doi.org/10.1037/0003-066X.60.5.410. Øvelsen ble prøvd daglig i én uke. Gruppen rapporterte bedring ved seks måneder; langtidseffektene var mest uttalt hos dem som fortsatte. Det er ikke grunnlag for å love at én uke alene gir varig effekt."
      }
    },
    {
      "id": "659bc968-a53e-420f-aab8-b5ad2492c74c",
      "slug": "vanskelige-samtaler",
      "expected": {
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
        ],
        "not_for": [
          "konflikten er eskalert og utrygg",
          "situasjonen krever HR-",
          "juridisk eller formell oppfølging",
          "sterke emosjonelle reaksjoner gjør refleksjon vanskelig i øyeblikket",
          "samtalen handler om alvorlige personalsaker som bør håndteres med støtte"
        ]
      },
      "changes": {
        "content_json": [
          {
            "content": "Velg én samtale du trenger å ta. Bruk oppgaven til å skille observasjoner fra tolkninger, avklare budskapet og forberede deg på å høre den andres perspektiv.",
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
              "Hvis den andre reagerer sterkt: Anerkjenn reaksjonen og vurder om dere trenger en pause. Undersøk nye opplysninger og korriger egne feil. Ikke trekk et nødvendig budskap bare for å slippe ubehaget.",
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
        ],
        "not_for": [
          "Konflikten er eskalert og utrygg.",
          "Situasjonen krever HR-, juridisk eller annen formell oppfølging.",
          "Sterke emosjonelle reaksjoner gjør refleksjon vanskelig i øyeblikket.",
          "Samtalen handler om alvorlige personalsaker som bør håndteres med støtte."
        ]
      }
    }
  ],
  "files": [
    {
      "id": "ca47d699-e686-4f71-913d-d1ea06779d54",
      "resource_id": "aef2057c-3416-4011-a7e0-145dbec315a7",
      "resource_slug": "abcde-modellen",
      "local_file": "abcde-modellen.svg",
      "expected": {
        "storage_path": "aef2057c-3416-4011-a7e0-145dbec315a7/1779829605262-abcde-modellen.svg",
        "display_name": "ABCDE modellen.svg",
        "file_type": "illustration",
        "archived_at": null
      },
      "changes": {
        "storage_path": "aef2057c-3416-4011-a7e0-145dbec315a7/editorial-v2/abcde-modellen.svg",
        "display_name": "abcde-modellen.svg",
        "file_type": "illustration",
        "archived_at": null
      }
    },
    {
      "id": "dd109fd4-962f-4e07-b276-f3dd5c8ceef3",
      "resource_id": "1fb8e2e7-d179-4e18-83f9-f2aeafa5a737",
      "resource_slug": "eisenhower-matrisen",
      "local_file": "eisenhower-matrisen.svg",
      "expected": {
        "storage_path": "1fb8e2e7-d179-4e18-83f9-f2aeafa5a737/1779787582499-eisenhower-matrix.svg",
        "display_name": "Eisenhower matrix.svg",
        "file_type": "illustration",
        "archived_at": null
      },
      "changes": {
        "storage_path": "1fb8e2e7-d179-4e18-83f9-f2aeafa5a737/editorial-v2/eisenhower-matrisen.svg",
        "display_name": "eisenhower-matrisen.svg",
        "file_type": "illustration",
        "archived_at": null
      }
    },
    {
      "id": "610418a5-f1e6-489b-8b64-66026a6e1e05",
      "resource_id": "c20708df-1c38-460f-8af0-c32fb6a959ec",
      "resource_slug": "karrieregrafen",
      "local_file": "karrieregrafen.svg",
      "expected": {
        "storage_path": "c20708df-1c38-460f-8af0-c32fb6a959ec/1779805404980-karrieregrafen.svg",
        "display_name": "Karrieregrafen.svg",
        "file_type": "illustration",
        "archived_at": null
      },
      "changes": {
        "storage_path": "c20708df-1c38-460f-8af0-c32fb6a959ec/editorial-v2/karrieregrafen.svg",
        "display_name": "karrieregrafen.svg",
        "file_type": "illustration",
        "archived_at": null
      }
    },
    {
      "id": "0433829c-9f28-4976-8c42-1f1ed31e5555",
      "resource_id": "6c5a4520-d9c5-4066-8d21-152d5e29039b",
      "resource_slug": "kontrollsirkelen",
      "local_file": "kontrollsirkelen.svg",
      "expected": {
        "storage_path": "6c5a4520-d9c5-4066-8d21-152d5e29039b/1779805134636-kontrollsirkelen.svg",
        "display_name": "Kontrollsirkelen.svg",
        "file_type": "illustration",
        "archived_at": null
      },
      "changes": {
        "storage_path": "6c5a4520-d9c5-4066-8d21-152d5e29039b/editorial-v2/kontrollsirkelen.svg",
        "display_name": "kontrollsirkelen.svg",
        "file_type": "illustration",
        "archived_at": null
      }
    },
    {
      "id": "08863c39-f2d1-4913-92fe-7469e97c6c0d",
      "resource_id": "2c5b1234-df3a-477d-8c52-b61820dac29c",
      "resource_slug": "kubler-ross-endringskurve",
      "local_file": "kubler-ross-reaksjoner.svg",
      "expected": {
        "storage_path": "2c5b1234-df3a-477d-8c52-b61820dac29c/1788855580082-kubler-ross.png",
        "display_name": "Kübler Ross.png",
        "file_type": "illustration",
        "archived_at": null
      },
      "changes": {
        "storage_path": "2c5b1234-df3a-477d-8c52-b61820dac29c/editorial-v2/kubler-ross-reaksjoner.svg",
        "display_name": "kubler-ross-reaksjoner.svg",
        "file_type": "illustration",
        "archived_at": null
      }
    },
    {
      "id": "3de003b0-22e2-476d-abc8-e217a75fec8e",
      "resource_id": "2c5b1234-df3a-477d-8c52-b61820dac29c",
      "resource_slug": "kubler-ross-endringskurve",
      "local_file": "kubler-ross-reaksjoner.pdf",
      "expected": {
        "storage_path": "2c5b1234-df3a-477d-8c52-b61820dac29c/1788855597625-kubler-ross.pdf",
        "display_name": "Kübler Ross.pdf",
        "file_type": "printable",
        "archived_at": null
      },
      "changes": {
        "storage_path": "2c5b1234-df3a-477d-8c52-b61820dac29c/editorial-v2/kubler-ross-reaksjoner.pdf",
        "display_name": "kubler-ross-reaksjoner.pdf",
        "file_type": "printable",
        "archived_at": null
      }
    },
    {
      "id": "e9cd2d59-3f34-4b8c-80b1-5b9307c69412",
      "resource_id": "86a43744-7ba5-494e-904e-cd09e6de21af",
      "resource_slug": "pareto-prinsippet",
      "local_file": "pareto-prinsippet.svg",
      "expected": {
        "storage_path": "86a43744-7ba5-494e-904e-cd09e6de21af/1779804408096-paretoprinsippet.svg",
        "display_name": "Paretoprinsippet.svg",
        "file_type": "illustration",
        "archived_at": null
      },
      "changes": {
        "storage_path": "86a43744-7ba5-494e-904e-cd09e6de21af/editorial-v2/pareto-prinsippet.svg",
        "display_name": "pareto-prinsippet.svg",
        "file_type": "illustration",
        "archived_at": null
      }
    },
    {
      "id": "e4bd6514-aafc-4e0d-9a85-ca50269a2ad0",
      "resource_id": "68704fc6-ffab-4e2b-b156-b1753d46ef04",
      "resource_slug": "tankefeller",
      "local_file": "tankefeller.svg",
      "expected": {
        "storage_path": "68704fc6-ffab-4e2b-b156-b1753d46ef04/1779831043011-tankefeller.svg",
        "display_name": "Tankefeller.svg",
        "file_type": "illustration",
        "archived_at": null
      },
      "changes": {
        "storage_path": "68704fc6-ffab-4e2b-b156-b1753d46ef04/editorial-v2/tankefeller.svg",
        "display_name": "tankefeller.svg",
        "file_type": "illustration",
        "archived_at": null
      }
    }
  ]
}
$payload$::jsonb;
  item jsonb;
  current_resource public.resources%rowtype;
  revised_resource public.resources%rowtype;
  current_file public.resource_files%rowtype;
  current_fields jsonb;
  field_name text;
begin
  if jsonb_array_length(batch->'resources') <> 24
    or (select count(distinct value->>'slug') from jsonb_array_elements(batch->'resources')) <> 24
    or jsonb_array_length(batch->'files') <> 8
    or (select count(distinct value->>'id') from jsonb_array_elements(batch->'files')) <> 8 then
    raise exception 'Editorial QA V2 must contain 24 resource edits and 8 file replacements';
  end if;

  for item in select value from jsonb_array_elements(batch->'resources') order by value->>'slug'
  loop
    for field_name in select jsonb_object_keys(item->'changes')
    loop
      if field_name <> all (array['summary', 'client_intro', 'content_json', 'basis',
        'next_step_prompt', 'coach_guidance', 'not_for', 'suggested_coach_note']) then
        raise exception 'Unsupported editorial field: %', field_name;
      end if;
    end loop;
    select * into current_resource from public.resources where slug = item->>'slug' for update;
    if not found or current_resource.id <> (item->>'id')::uuid
      or current_resource.status <> 'published' or current_resource.archived_at is not null then
      raise exception 'Editorial resource identity or publication changed: %', item->>'slug';
    end if;
    select jsonb_object_agg(key, to_jsonb(current_resource)->key)
    into current_fields from jsonb_object_keys(item->'changes') as keys(key);
    if current_fields is distinct from item->'expected' and current_fields is distinct from item->'changes' then
      raise exception 'Editorial resource changed since QA: %', item->>'slug';
    end if;
  end loop;

  -- Check every replacement before changing either text or file references.
  for item in select value from jsonb_array_elements(batch->'files') order by value->>'id'
  loop
    select * into current_resource from public.resources where id = (item->>'resource_id')::uuid for update;
    if not found or current_resource.slug <> item->>'resource_slug'
      or current_resource.status <> 'published' or current_resource.archived_at is not null then
      raise exception 'Illustration resource changed: %', item->>'resource_slug';
    end if;
    select * into current_file from public.resource_files where id = (item->>'id')::uuid for update;
    if not found or current_file.resource_id <> (item->>'resource_id')::uuid then
      raise exception 'Editorial file missing or moved: %', item->>'id';
    end if;
    select jsonb_object_agg(key, to_jsonb(current_file)->key)
    into current_fields from jsonb_object_keys(item->'changes') as keys(key);
    if current_fields is distinct from item->'expected' and current_fields is distinct from item->'changes' then
      raise exception 'Editorial file changed since QA: %', item->>'id';
    end if;
    if not exists (select 1 from storage.objects
      where bucket_id = 'resource-assets' and name = item->'changes'->>'storage_path') then
      raise exception 'Upload and verify editorial asset first: %', item->'changes'->>'storage_path';
    end if;
  end loop;

  for item in select value from jsonb_array_elements(batch->'resources') order by value->>'slug'
  loop
    select * into current_resource from public.resources where id = (item->>'id')::uuid;
    select jsonb_object_agg(key, to_jsonb(current_resource)->key)
    into current_fields from jsonb_object_keys(item->'changes') as keys(key);
    if current_fields = item->'changes' then continue; end if;
    revised_resource := jsonb_populate_record(current_resource, item->'changes');
    update public.resources set
      summary = revised_resource.summary, client_intro = revised_resource.client_intro,
      content_json = revised_resource.content_json, basis = revised_resource.basis,
      next_step_prompt = revised_resource.next_step_prompt, coach_guidance = revised_resource.coach_guidance,
      not_for = revised_resource.not_for, suggested_coach_note = revised_resource.suggested_coach_note,
      updated_at = now()
    where id = current_resource.id;
  end loop;
  for item in select value from jsonb_array_elements(batch->'files') order by value->>'id'
  loop
    select * into current_file from public.resource_files where id = (item->>'id')::uuid;
    if current_file.storage_path = item->'changes'->>'storage_path'
      and current_file.display_name = item->'changes'->>'display_name' then continue; end if;
    update public.resource_files set
      storage_path = item->'changes'->>'storage_path',
      display_name = item->'changes'->>'display_name',
      updated_at = now()
    where id = current_file.id;
  end loop;
end;
$editorial$;
