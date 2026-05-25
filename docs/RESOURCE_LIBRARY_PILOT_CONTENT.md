# Ressursbibliotek Pilotinnhold

Dette dokumentet definerer de første pilotressursene for ressursbiblioteket. Innholdet er ikke appkode.

Pilotressursene skal teste:

- native `content_json`
- ressurs uten at fil er primærkilde
- illustrasjon/modell som faglig del av ressursen
- coach preview
- `Send ressurs`
- klientvisning
- privat refleksjon og eksplisitt deling

## ABCDE-modellen

```yaml
title: ABCDE-modellen
slug: abcde-modellen
summary: Et praktisk refleksjonsverktøy for å utforske hvordan tanker påvirker følelser, reaksjoner og handlinger i krevende situasjoner. Ressursen hjelper deg å skille mellom hva som faktisk skjedde, hvordan du tolket situasjonen, og hvordan tolkningen påvirket deg.
type: framework
format: native
phase: reflection
tags:
  - tankefeller
  - emosjonell regulering
  - robusthet
  - stress
  - selvledelse
  - refleksjon
estimated_duration: 20
difficulty: medium
language: no

intended_outcome: Hjelpe klienten å identifisere automatiske tankemønstre og utvikle mer fleksible og konstruktive perspektiver i situasjoner som skaper stress, frustrasjon eller usikkerhet.
best_used_when:
  - klient grubler mye etter situasjoner
  - sterk selvkritikk
  - emosjonelle reaksjoner virker uforholdsmessige
  - klient blir sittende fast i negative tolkninger
  - konflikter eller vanskelige samtaler
  - høyt prestasjonspress
not_for:
  - akutt emosjonell krise
  - alvorlig psykisk sykdom
  - situasjoner der klienten er sterkt aktivert og trenger stabilisering først
coach_guidance: Bruk modellen på én konkret situasjon fra den siste tiden. Unngå abstrakte diskusjoner om personlighet eller "hvem klienten er". Målet er å utforske sammenhengen mellom hendelse, tolkning og konsekvens, ikke å overbevise klienten om "positiv tenkning".
client_intro: Vi reagerer sjelden bare på det som skjer rundt oss. Vi reagerer også på hvordan vi fortolker det som skjer. Denne modellen hjelper deg å utforske hvordan tanker påvirker følelser, handlinger og stressnivå, og hvordan små justeringer i perspektiv kan gi større handlingsrom.
suggested_coach_note: Jeg ønsker at du bruker denne ressursen på en konkret situasjon du har stått i den siste tiden. Ikke tenk for mye på "riktig svar". Målet er å utforske hva som faktisk skjer mellom situasjon, tanke og reaksjon.
default_context_types:
  - reflection
  - session
  - focus_area

content_json:
  - type: intro
    content: ABCDE-modellen hjelper deg å utforske hvordan tanker påvirker følelser og handlinger i krevende situasjoner.
  - type: illustration
    key: abcde_model
  - type: text
    heading: "Steg 1: Beskriv situasjonen"
    content: Beskriv en konkret situasjon fra den siste tiden som skapte stress, frustrasjon eller usikkerhet.
  - type: worksheet
    fields:
      - Hva skjedde?
      - Hvem var involvert?
      - Hva gjorde situasjonen krevende?
  - type: text
    heading: "Steg 2: Utforsk tankene dine"
    content: Hva tenkte du umiddelbart i situasjonen?
  - type: worksheet
    fields:
      - Hva sa du til deg selv?
      - Hva antok du?
      - Hva fryktet du?
  - type: text
    heading: "Steg 3: Reaksjon og konsekvens"
    content: Hvordan påvirket tankene følelsene og handlingene dine?
  - type: worksheet
    fields:
      - Hva følte du?
      - Hva gjorde du?
      - Hva unngikk du?
  - type: reflection_questions
    questions:
      - Hva legger du merke til når du skiller mellom situasjon og tolkning?
      - Hva kunne vært en alternativ og mer balansert forståelse av situasjonen?
      - Hva ville vært en mer konstruktiv respons neste gang?

reflection_prompts:
  - Hva overrasket deg mest i øvelsen?
  - Hvilke tanker påvirket reaksjonen din sterkest?
  - Hva skjer når du utfordrer den første tolkningen din?
  - Hva ville du sagt til en kollega i samme situasjon?
next_step_prompt: Velg én situasjon den neste uken hvor du aktivt skal forsøke å oppdage forskjellen mellom hendelse og tolkning i øyeblikket.

cover_image: abcde-cover.jpg
illustration: abcde-model-diagram.svg
files:
  - abcde-printable.pdf

basis: Kognitiv atferdsterapi (CBT) og forskning på kognitiv restrukturering og emosjonell regulering.
review_status: approved_for_pilot
reviewed_by: Sindre Ræder
last_reviewed_at: 2026-05-25
```

## Kontrollsirkelen

```yaml
title: Kontrollsirkelen
slug: kontrollsirkelen
summary: Et refleksjonsverktøy for å skille mellom det du kan kontrollere, påvirke og ikke kontrollere. Hjelper deg å bruke energi og oppmerksomhet mer presist i situasjoner preget av press, usikkerhet eller frustrasjon.
type: framework
format: native
phase: focus
tags:
  - kontroll
  - stress
  - prioritering
  - robusthet
  - beslutninger
  - aksept
estimated_duration: 15
difficulty: easy
language: no

intended_outcome: Hjelpe klienten å redusere unødvendig mentalt stress ved å tydeliggjøre hvor innsats faktisk har effekt.
best_used_when:
  - klient føler lav kontroll
  - stress og overbelastning
  - organisatorisk usikkerhet
  - frustrasjon rundt andre mennesker
  - høyt mentalt energitap
  - overfokus på forhold utenfor egen påvirkning
not_for:
  - situasjoner som krever akutt problemløsning
  - klienter som allerede bruker unngåelse eller passivitet som strategi
coach_guidance: Vær oppmerksom på om klienten bruker modellen til å trekke seg unna ansvar eller vanskelige samtaler. Målet er ikke passivitet, men å flytte energi mot områder med faktisk påvirkningsmulighet.
client_intro: Mange bruker store mengder mental energi på forhold de verken kan kontrollere eller påvirke. Denne modellen hjelper deg å tydeliggjøre hvor innsatsen din faktisk kan gjøre en forskjell.
suggested_coach_note: Jeg vil at du bruker denne ressursen på noe som tar mye energi akkurat nå. Målet er ikke å "slutte å bry seg", men å bli tydeligere på hvor du faktisk har påvirkningskraft.
default_context_types:
  - focus_area
  - reflection
  - experiment

content_json:
  - type: intro
    content: Kontrollsirkelen hjelper deg å skille mellom det du kan kontrollere, påvirke og ikke kontrollere.
  - type: illustration
    key: control_circle
  - type: text
    heading: "Steg 1: Identifiser energityver"
    content: Skriv ned tre ting som tar mye mental energi akkurat nå.
  - type: worksheet
    fields:
      - Situasjon 1
      - Situasjon 2
      - Situasjon 3
  - type: text
    heading: "Steg 2: Sorter situasjonene"
    content: Marker hva du faktisk kan kontrollere, påvirke eller ikke kontrollere.
  - type: worksheet
    fields:
      - Hva kan jeg kontrollere?
      - Hva kan jeg påvirke?
      - Hva må jeg akseptere?
  - type: reflection_questions
    questions:
      - Hvor bruker du mest energi i dag?
      - Hva overrasker deg når du sorterer dette?
      - Hva kan du gjøre konkret denne uken innenfor din påvirkningssirkel?

reflection_prompts:
  - Hva bruker du mest mental energi på akkurat nå?
  - Hva ligger faktisk innenfor din kontroll?
  - Hvor forsøker du å kontrollere ting som egentlig ikke kan kontrolleres?
  - Hva skjer hvis du flytter fokus mot påvirkning fremfor bekymring?
next_step_prompt: Velg én konkret situasjon denne uken hvor du aktivt skal flytte oppmerksomhet fra bekymring til handling innenfor din påvirkningssirkel.

cover_image: control-circle-cover.jpg
illustration: control-circle-diagram.svg
files:
  - kontrollsirkelen-printable.pdf

basis: Stoisk filosofi, moderne stressforskning og forskning på psykologisk fleksibilitet og locus of control.
review_status: approved_for_pilot
reviewed_by: Sindre Ræder
last_reviewed_at: 2026-05-25
```

## Å akseptere frykt

```yaml
title: Å akseptere frykt
slug: a-akseptere-frykt
summary: En refleksjonsressurs om hvordan frykt påvirker handling, beslutninger og unngåelse. Hjelper deg å forstå at ubehag ofte er en naturlig del av utvikling og endring, ikke nødvendigvis et signal om fare.
type: guided_session
format: native
phase: experiment
tags:
  - frykt
  - usikkerhet
  - mot
  - endring
  - ledelse
  - utvikling
estimated_duration: 25
difficulty: medium
language: no

intended_outcome: Hjelpe klienten å identifisere hvordan frykt påvirker atferd og valg, og utvikle større toleranse for usikkerhet og ubehag i viktige situasjoner.
best_used_when:
  - klient unngår vanskelige beslutninger
  - frykt for feil eller evaluering
  - konfliktunngåelse
  - organisatoriske endringer
  - utviklingsmotstand
  - høyt behov for kontroll
not_for:
  - alvorlig angstproblematikk uten terapeutisk oppfølging
  - situasjoner med reell fare eller utrygghet
  - klienter som er sterkt emosjonelt overveldet
coach_guidance: Normaliser frykt uten å bagatellisere den. Hold fokus på observerbar atferd og valg, ikke bare emosjonell innsikt. Utforsk særlig hva klienten gjør eller unngår når frykten aktiveres.
client_intro: Frykt er ofte en naturlig del av utvikling, ansvar og endring. Mange forsøker å bli kvitt frykten før de handler. I praksis handler utvikling ofte om å lære å bevege seg fremover selv om ubehaget er til stede.
suggested_coach_note: Jeg ønsker at du bruker denne ressursen på en situasjon der du kjenner motstand, usikkerhet eller frykt akkurat nå. Målet er ikke å bli "fryktfri", men å forstå hvordan frykten påvirker handlingene dine.
default_context_types:
  - experiment
  - focus_area
  - reflection

content_json:
  - type: intro
    content: Frykt er ofte et signal om at noe oppleves viktig, usikkert eller eksponerende. Denne ressursen hjelper deg å utforske hvordan frykt påvirker valgene dine.
  - type: illustration
    key: fear_curve
  - type: text
    heading: "Steg 1: Identifiser situasjonen"
    content: Beskriv en situasjon du har utsatt, unngått eller kjent sterk motstand mot.
  - type: worksheet
    fields:
      - Hva er situasjonen?
      - Hva gjør den krevende?
      - Hva frykter du kan skje?
  - type: text
    heading: "Steg 2: Utforsk unngåelse"
    content: Hvordan påvirker frykten handlingene dine?
  - type: worksheet
    fields:
      - Hva gjør du for å redusere ubehaget?
      - Hva unngår du?
      - Hva koster unngåelsen deg over tid?
  - type: reflection_questions
    questions:
      - Hva ville vært et lite, men modig neste steg?
      - Hva skjer hvis du ikke lar frykten bestemme hele responsen?
      - Hvordan kan du handle selv om ubehaget fortsatt er til stede?

reflection_prompts:
  - Hva forsøker du å beskytte deg mot?
  - Hva koster unngåelsen deg?
  - Hva ville du gjort hvis frykten fikk være med, men ikke styre?
  - Hva er ett lite steg du kan ta denne uken?
next_step_prompt: Definer ett konkret steg du er villig til å ta denne uken, selv om situasjonen fortsatt oppleves ubehagelig eller usikker.

cover_image: fear-acceptance-cover.jpg
illustration: fear-curve-diagram.svg
files:
  - fear-reflection-printable.pdf

basis: Acceptance and Commitment Therapy (ACT), eksponeringsteori og forskning på psykologisk fleksibilitet og unngåelsesatferd.
review_status: approved_for_pilot
reviewed_by: Sindre Ræder
last_reviewed_at: 2026-05-25
```
