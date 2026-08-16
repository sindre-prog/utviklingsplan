-- Expand the leadership library to the full 52-competency editorial model.
-- Existing slugs are reused where possible so selected program competencies keep their references.

alter table public.leadership_competencies
  drop constraint if exists leadership_competencies_category_check;

insert into public.leadership_competencies (
  slug,
  title_no,
  title_en,
  category,
  summary,
  source,
  sort_order,
  content_json
)
values
  (
    'kommunikasjon',
    'Kommunikasjon',
    'Communication',
    'foundation',
    'Gjør budskap, retning og forventninger forståelige for bestemte mottakere, og bruker lytting til å sikre felles forståelse.',
    'raeder-editorial-ccl-mapped',
    10,
    jsonb_build_object(
      'choose_when', 'Andre er usikre på hva du mener, hvorfor noe er viktig eller hva som forventes; budskapet blir tolket ulikt; du gir mye informasjon uten at det skaper klarhet.',
      'distinction', 'Velg Påvirkning når budskapet forstås, men oppslutningen mangler. Velg Tydelig ledertilstedeværelse når innholdet er godt, men fremføringen svekker trygghet eller oppmerksomhet.',
      'signals', jsonb_build_array('Starter med hensikt, hovedbudskap og ønsket neste steg.', 'Tilpasser språk, detaljnivå og kanal til mottaker og situasjon.', 'Lytter, undersøker reaksjoner og kontrollerer faktisk forståelse.'),
      'underuse', 'Uklart hovedpoeng, for mye detalj, enveiskommunikasjon eller sprik mellom muntlige og skriftlige budskap.',
      'overuse', 'Overforenkler, gjentar budskapet mekanisk eller bruker kommunikasjon som erstatning for reell involvering.',
      'experiment', 'I tre viktige møter: innled med hovedbudskapet i én setning og be en mottaker oppsummere beslutning og neste steg.',
      'evidence', 'Færre oppklaringsrunder og mer samsvar i det deltakerne oppfatter.'
    )
  ),
  (
    'pavirkning',
    'Påvirkning',
    'Influence',
    'foundation',
    'Skaper oppslutning ved å forstå interesser, bygge troverdighet og tilpasse påvirkningsformen uten å lene seg bare på formell autoritet.',
    'raeder-editorial-ccl-mapped',
    20,
    jsonb_build_object(
      'choose_when', 'Gode forslag får lite gjennomslag; viktige interessenter kommer sent inn; du argumenterer mer når andre er skeptiske.',
      'distinction', 'Velg Kommunikasjon når problemet først og fremst er forståelse. Velg Organisasjonsforståelse når du ikke vet hvem eller hva som faktisk påvirker beslutningen. Velg Forhandling når partene må bytte verdi og inngå en konkret avtale.',
      'signals', jsonb_build_array('Kartlegger interesser, bekymringer og beslutningskriterier før saken presenteres.', 'Bruker relasjon, logikk, involvering og formål situasjonstilpasset.', 'Bygger støtte før formelle beslutningsøyeblikk.'),
      'underuse', 'Samme argumentasjon til alle, for sen involvering eller overdreven avhengighet av mandat og posisjon.',
      'overuse', 'Blir taktisk, manipulerende eller mer opptatt av gjennomslag enn av kvaliteten på beslutningen.',
      'experiment', 'Kartlegg tre nøkkelinteressenter i én sak, test forståelsen av deres interesser og tilpass inngangen.',
      'evidence', 'Interessentene bidrar tidligere, og motforestillinger blir kjent før beslutningsmøtet.'
    )
  ),
  (
    'laeringssmidighet',
    'Læringssmidighet',
    'Learning Agility',
    'foundation',
    'Trekker læring ut av erfaring og bruker den fleksibelt i nye, krevende eller uklare situasjoner.',
    'raeder-editorial-ccl-mapped',
    30,
    jsonb_build_object(
      'choose_when', 'Tidligere styrker ikke lenger gir samme effekt; du gjentar mønstre etter tilbakeslag; en ny rolle krever at du lærer raskere enn du kan planlegge.',
      'distinction', 'Velg Egenutvikling når utfordringen er å prioritere og følge opp en langsiktig utviklingsplan. Velg Tilpasse seg endring når den primære utfordringen er reaksjonen på en konkret endring.',
      'signals', jsonb_build_array('Oppsøker erfaringer som utfordrer egne antakelser og vaner.', 'Reflekterer systematisk over både gode og svake resultater.', 'Prøver ny atferd og overfører læring mellom situasjoner.'),
      'underuse', 'Forsvarer eksisterende praksis, søker lite feedback eller går videre uten å bearbeide erfaring.',
      'overuse', 'Jakter stadig nye erfaringer uten fordypning, eller endrer kurs før læringen er testet godt nok.',
      'experiment', 'Gjennomfør en kort etteranalyse etter tre krevende hendelser: forventning, faktisk resultat, forklaring og neste forsøk.',
      'evidence', 'Minst én konkret endring blir prøvd i neste sammenlignbare situasjon.'
    )
  ),
  (
    'selvinnsikt',
    'Selvinnsikt',
    'Self-Awareness',
    'foundation',
    'Forstår egne mønstre, drivere, styrker, begrensninger og virkningen egen atferd har på andre.',
    'raeder-editorial-ccl-mapped',
    40,
    jsonb_build_object(
      'choose_when', 'Du får overraskende eller gjentakende feedback; intensjonen din og andres opplevelse spriker; bestemte situasjoner utløser lite hensiktsmessige reaksjoner.',
      'distinction', 'Selvinnsikt er ofte en forutsetning for andre mål, men bør bare velges som primær kompetanse når manglende forståelse av egne mønstre er selve flaskehalsen.',
      'signals', jsonb_build_array('Har et realistisk bilde av styrker, begrensninger og ledervirkning.', 'Gjenkjenner triggere og automatiske reaksjonsmønstre.', 'Søker og tåler informasjon som utfordrer selvbildet.'),
      'underuse', 'Forklarer problemer hovedsakelig med andre, undervurderer egen effekt eller søker lite ærlig feedback.',
      'overuse', 'Blir selvopptatt, overanalyserende eller så opptatt av egen virkning at spontanitet og handling svekkes.',
      'experiment', 'Be tre personer beskrive én situasjon der du virker på ditt beste og én der effekten blir svakere.',
      'evidence', 'Du kan formulere ett mønster og teste en alternativ respons i en reell situasjon.'
    )
  ),
  (
    'baerekraftig-kapasitet',
    'Bærekraftig kapasitet og prioritering',
    'Balance',
    'self_capacity',
    'Forvalter krav, grenser og energi slik at viktige forpliktelser kan ivaretas med kvalitet over tid.',
    'raeder-editorial-ccl-mapped',
    50,
    jsonb_build_object(
      'choose_when', 'Belastningen er vedvarende; alt oppleves like viktig; arbeidspress svekker dømmekraft, relasjoner eller restitusjon.',
      'distinction', 'Velg Tidsstyring når kalender, arbeidsflyt og prioriteringspraksis er hovedproblemet. Velg Motstandskraft når utfordringen er å fungere og hente seg inn under belastning eller etter tilbakeslag.',
      'signals', jsonb_build_array('Prioriterer eksplisitt mellom konkurrerende krav.', 'Setter grenser og beskytter nødvendig restitusjon.', 'Justerer belastning før kapasiteten er vesentlig svekket.'),
      'underuse', 'Kronisk overforpliktelse, uklare grenser og vedvarende drift på høy intensitet.',
      'overuse', 'Bruker balanse som begrunnelse for å unngå nødvendige topper, krevende ansvar eller kortvarig strekk.',
      'experiment', 'Gjennomgå de neste fire ukene mot tre viktigste forpliktelser og fjern, flytt eller deleger minst to aktiviteter.',
      'evidence', 'Mer beskyttet tid til kjernearbeid og en merkbar reduksjon i uplanlagt overtid.'
    )
  ),
  (
    'grensekryssende-samarbeid',
    'Grensekryssende samarbeid',
    'Boundary Spanning',
    'strategy_business_change',
    'Skaper felles forståelse, tillit og handling på tvers av organisatoriske, faglige, geografiske eller sosiale grenser.',
    'raeder-editorial-ccl-mapped',
    60,
    jsonb_build_object(
      'choose_when', 'Siloer, ulike profesjoner eller enheter hindrer en felles leveranse; kunnskap og ressurser forblir adskilt; lokale mål konkurrerer.',
      'distinction', 'Velg Relasjonsledelse for en bredere, løpende relasjonsevne. Velg Strategisk samordning når hovedproblemet er at mål, ressurser og prioriteringer ikke peker samme vei.',
      'signals', jsonb_build_array('Bygger trygghet og relasjon mellom grupper før konflikten tilspisser seg.', 'Finner felles interesser uten å skjule reelle forskjeller.', 'Skaper nye koblinger mellom mennesker, kunnskap og ressurser.'),
      'underuse', 'Lokal optimalisering, homogent nettverk og lav investering i aktører utenfor eget område.',
      'overuse', 'Søker samarbeid overalt, gjør ansvar uklart eller bruker så mye tid på brobygging at beslutninger forsinkes.',
      'experiment', 'Velg én kritisk grense og samle partene om felles leveranse, avhengigheter og én gjensidig forpliktelse.',
      'evidence', 'Et konkret informasjons- eller arbeidsbrudd blir redusert.'
    )
  ),
  (
    'forretningsutvikling',
    'Forretningsutvikling',
    'Business Development',
    'strategy_business_change',
    'Oppdager og utvikler muligheter som kobler reelle behov med virksomhetens evne til å skape varig verdi.',
    'raeder-editorial-ccl-mapped',
    70,
    jsonb_build_object(
      'choose_when', 'Rollen har ansvar for vekst, nye tjenester, markeder eller verdiforslag; dagens leveranser tar all oppmerksomhet; kundesignaler omsettes sjelden til nye muligheter.',
      'distinction', 'Velg Innovasjon når utfordringen er å realisere nye løsninger bredere enn kommersiell vekst. Velg Forretnings- og fagforståelse når kunnskapsgrunnlaget, ikke mulighetsutviklingen, er flaskehalsen.',
      'signals', jsonb_build_array('Utforsker behov og endringer uten å starte med egen løsning.', 'Kobler muligheter til strategiske kapabiliteter og økonomisk logikk.', 'Tester antakelser før større investeringer.'),
      'underuse', 'Sterkt internt fokus, svak markedskontakt og ideer uten validering.',
      'overuse', 'Jakter stadig nye muligheter, undervurderer drift eller sprer ressursene over for mange initiativer.',
      'experiment', 'Gjennomfør fem utforskende samtaler om ett behov og formuler en testbar verdihypotese.',
      'evidence', 'Minst én sentral antakelse blir bekreftet, avkreftet eller vesentlig presisert.'
    )
  ),
  (
    'forretnings-og-fagforstaelse',
    'Forretnings- og fagforståelse',
    'Business and Professional Knowledge',
    'strategy_business_change',
    'Bruker relevant fagkunnskap og forståelse av virksomhetens økonomiske og operative logikk i beslutninger.',
    'raeder-editorial-ccl-mapped',
    80,
    jsonb_build_object(
      'choose_when', 'Beslutninger tas med for smalt funksjonsperspektiv; rollen har vokst raskere enn forretningsforståelsen; fagkunnskap eller markedsinnsikt er blitt utdatert.',
      'distinction', 'Velg Organisasjonsforståelse når du forstår virksomheten, men ikke hvordan beslutninger og innflytelse faktisk fungerer. Velg Globalt perspektiv når utfordringen gjelder markeder, kulturer og internasjonale avhengigheter.',
      'signals', jsonb_build_array('Holder kritisk fag- og markedsinnsikt oppdatert.', 'Forstår økonomiske, operative og kundemessige drivere.', 'Kobler eget fagområde til virksomheten som helhet.'),
      'underuse', 'Smal ekspertidentitet, foreldet kunnskap eller beslutninger uten forståelse for økonomiske og operative konsekvenser.',
      'overuse', 'Bruker ekspertise som autoritet, overkompliserer eller avviser nye perspektiver fordi de ikke passer etablert fagkunnskap.',
      'experiment', 'Følg én leveranse på tvers av kunde, drift og økonomi, og forklar verdiskapingen tilbake til en kollega.',
      'evidence', 'Du identifiserer minst én avhengighet eller konsekvens du tidligere overså.'
    )
  ),
  (
    'mobilisere-for-endring',
    'Mobilisere for endring',
    'Champion Change',
    'strategy_business_change',
    'Skaper forståelse, energi og oppslutning rundt hvorfor en endring er nødvendig og verdt å bidra til.',
    'raeder-editorial-ccl-mapped',
    90,
    jsonb_build_object(
      'choose_when', 'Endringen har en plan, men lav støtte; behovet oppleves uklart; ledere kommuniserer endringen uten selv å modellere den.',
      'distinction', 'Velg Gjennomføre endring når oppslutningen finnes, men ny praksis ikke fester seg. Velg Tilpasse seg endring når det er din egen respons på endring som er utviklingsbehovet.',
      'signals', jsonb_build_array('Forklarer behov, retning og konsekvenser ærlig.', 'Anerkjenner tap, motstand og legitime bekymringer.', 'Modellerer endringen og mobiliserer troverdige støttespillere.'),
      'underuse', 'Løsningskommunikasjon før behovet er forstått, undervurdert motstand og avstand mellom ord og handling.',
      'overuse', 'Skaper kunstig entusiasme, marginaliserer kritikk eller selger endringen hardere enn kunnskapsgrunnlaget tåler.',
      'experiment', 'Test endringsfortellingen med én støttespiller, én usikker og én skeptiker før bred kommunikasjon.',
      'evidence', 'Du kan gjengi deres tap og bekymringer og justere minst ett element i tilnærmingen.'
    )
  ),
  (
    'tilpasse-seg-endring',
    'Tilpasse seg endring',
    'Change Acceptance',
    'self_capacity',
    'Møter endrede rammer konstruktivt, bearbeider egen reaksjon og justerer praksis når situasjonen krever det.',
    'raeder-editorial-ccl-mapped',
    100,
    jsonb_build_object(
      'choose_when', 'Du holder fast ved tidligere løsninger, bruker mye energi på det som ikke kan reverseres eller reagerer defensivt på endrede rammer.',
      'distinction', 'Velg Fleksibilitet når behovet er å variere stil eller arbeidsmåte i en løpende situasjon. Velg Navigere i usikkerhet når problemet er manglende informasjon, ikke endringen i seg selv.',
      'signals', jsonb_build_array('Gjenkjenner og bearbeider egen første reaksjon.', 'Skiller legitim kritikk fra motstand mot å gi slipp.', 'Tester ny praksis og justerer ut fra erfaring.'),
      'underuse', 'Forsvarer fortiden, passiv motstand eller langvarig fokus på tap av kontroll og status.',
      'overuse', 'Aksepterer endringer ukritisk, skifter retning for raskt eller unnlater å utfordre svakt begrunnede beslutninger.',
      'experiment', 'Velg én endring du misliker, noter hva som faktisk er fast og påvirkbart, og test én ny arbeidsmåte i to uker.',
      'evidence', 'Vurderingen blir basert på erfaring fremfor første reaksjon.'
    )
  ),
  (
    'endringsledelse',
    'Gjennomføre endring',
    'Change Implementation',
    'strategy_business_change',
    'Omsetter endringsretning til ny atferd, arbeidspraksis, struktur og oppfølging som varer.',
    'raeder-editorial-ccl-mapped',
    110,
    jsonb_build_object(
      'choose_when', 'Endringen stopper ved presentasjoner og planer; ansvar og ønsket atferd er uklart; ny praksis brukes bare sporadisk.',
      'distinction', 'Velg Mobilisere for endring når forståelse og oppslutning mangler. Velg Strategisk planlegging og gjennomføring for en bredere portefølje av strategiske initiativer.',
      'signals', jsonb_build_array('Oversetter mål til konkret atferd, ansvar og milepæler.', 'Fjerner strukturelle og praktiske hindringer.', 'Måler faktisk bruk og effekt, ikke bare aktivitet.'),
      'underuse', 'Uklare eiere, manglende støtte i systemer og oppfølging som avsluttes for tidlig.',
      'overuse', 'Gjør endringen rigid, måler mekanisk eller presser standardisering der lokal tilpasning er nødvendig.',
      'experiment', 'Definer tre observerbare atferder og én strukturell forutsetning for en aktuell endring; følg opp etter 30 dager.',
      'evidence', 'Andelen som faktisk bruker ny praksis øker.'
    )
  ),
  (
    'utvikle-andre',
    'Utvikle andre',
    'Coach and Develop Others',
    'team_people',
    'Hjelper andre å bygge kapasitet gjennom refleksjon, utfordrende erfaringer, støtte og ansvar.',
    'raeder-editorial-ccl-mapped',
    120,
    jsonb_build_object(
      'choose_when', 'Du løser problemer for andre; medarbeidere får lite strekk eller utviklingsretning; levering vinner over læring hver gang.',
      'distinction', 'Velg Feedback når behovet primært er å gjøre virkningen av konkret atferd tydelig. Velg Delegering når problemet er overføring av ansvar og mandat.',
      'signals', jsonb_build_array('Tilpasser utvikling til person, rolle og situasjon.', 'Stiller spørsmål som fremmer refleksjon og eierskap.', 'Kombinerer utfordrende oppgaver med relevant støtte og oppfølging.'),
      'underuse', 'Gir løsningene selv, tilbyr lite strekk eller bruker samme utviklingstilnærming til alle.',
      'overuse', 'Coacher når tydelig instruksjon eller beslutning trengs, eller gjør enhver oppgave til en utviklingsøvelse.',
      'experiment', 'I fire samtaler: still tre utforskende spørsmål før du gir råd, og avtal ett selvvalgt neste steg.',
      'evidence', 'Medarbeideren formulerer mer av problemet og løsningen selv.'
    )
  ),
  (
    'empati-og-omtanke',
    'Empati og omtanke',
    'Compassion and Sensitivity',
    'relationships_influence',
    'Forstår hvordan andre opplever en situasjon og møter behov, reaksjoner og belastninger med respekt uten å oppheve ansvar.',
    'raeder-editorial-ccl-mapped',
    130,
    jsonb_build_object(
      'choose_when', 'Du går raskt til løsning; andre opplever deg som lite tilgjengelig eller hard; viktige menneskelige konsekvenser kommer sent inn i vurderingene.',
      'distinction', 'Velg Mellommenneskelig teft når behovet er å lese og tilpasse samspillet bredere. Velg Bygge tillit når relasjonens forutsigbarhet og trygghet er hovedproblemet.',
      'signals', jsonb_build_array('Undersøker andres perspektiv før vurdering eller løsning.', 'Anerkjenner følelser og konsekvenser uten å overta ansvaret.', 'Kombinerer omtanke med tydelige og rettferdige forventninger.'),
      'underuse', 'Instrumentelt oppgavefokus, antakelser om andres reaksjoner eller lav oppfølging etter belastende hendelser.',
      'overuse', 'Unngår krav og ubehag, overidentifiserer seg eller tar ansvar som bør ligge hos den andre.',
      'experiment', 'I en krevende samtale: oppsummer den andres perspektiv og spør om du har forstått før du foreslår løsning.',
      'evidence', 'Den andre korrigerer eller bekrefter forståelsen og deltar mer aktivt i neste steg.'
    )
  ),
  (
    'konflikthandtering',
    'Konflikthåndtering',
    'Conflict Resolution',
    'relationships_influence',
    'Tar tak i uenighet tidlig, reduserer personangrep og bruker forskjeller til å avklare interesser og finne en farbar vei videre.',
    'raeder-editorial-ccl-mapped',
    140,
    jsonb_build_object(
      'choose_when', 'Uenighet unngås eller blir personlig; de samme konfliktene gjentar seg; harmoni prioriteres foran nødvendig avklaring.',
      'distinction', 'Velg Forhandling når partene primært skal inngå en avtale om knappe goder eller forpliktelser. Velg Håndtere prestasjons- og atferdsutfordringer når en leder må følge opp brudd på forventet standard.',
      'signals', jsonb_build_array('Tar opp saken tidlig og skiller person, atferd, posisjon og interesse.', 'Regulerer temperaturen uten å fjerne den reelle uenigheten.', 'Avklarer ansvar og løsning partene faktisk kan stå i.'),
      'underuse', 'Unngåelse, indirekte kommunikasjon eller symptomløsninger.',
      'overuse', 'Gjør enhver forskjell til en prosess, presser frem forsoning eller overdriver verdien av konflikt.',
      'experiment', 'Ta opp én mindre uenighet tidligere enn vanlig og oppsummer begge parters interesser før løsningsforslag.',
      'evidence', 'Partene kan beskrive uenigheten uten å tillegge hverandre motiv.'
    )
  ),
  (
    'prestasjons-og-atferdsutfordringer',
    'Håndtere prestasjons- og atferdsutfordringer',
    'Confronting Problem Employees',
    'team_people',
    'Følger tydelig, rettferdig og rettidig opp prestasjon eller atferd som ikke møter avtalte krav.',
    'raeder-editorial-ccl-mapped',
    150,
    jsonb_build_object(
      'choose_when', 'Problemer får vare; forventninger formidles indirekte; teamet bærer kostnaden ved manglende oppfølging.',
      'distinction', 'Velg Feedback for løpende korrigering og læring. Denne kompetansen gjelder vedvarende eller vesentlige avvik som krever tydelig ledelsesoppfølging.',
      'signals', jsonb_build_array('Undersøker forventning, kapasitet, ressurser, system og atferd før konklusjon.', 'Beskriver fakta, effekt, krav og støtte tydelig.', 'Dokumenterer avtaler og følger opp på et bestemt tidspunkt.'),
      'underuse', 'Utsettelse, vaghet, forskjellsbehandling eller overtakelse av den andres ansvar.',
      'overuse', 'Går for raskt til individforklaring, bruker formell prosess som trussel eller gir for lite rom for forklaring og forbedring.',
      'experiment', 'Forbered én samtale med observerbare fakta, forventet standard, mulige systemforhold og dato for oppfølging.',
      'evidence', 'Begge parter kan gjengi hva som må endres, hvilken støtte som gis og hvordan fremgang vurderes.'
    )
  ),
  (
    'mot',
    'Mot',
    'Courage',
    'self_capacity',
    'Sier fra og handler i tråd med faglige eller etiske vurderinger når det innebærer reell sosial, personlig eller organisatorisk risiko.',
    'raeder-editorial-ccl-mapped',
    160,
    jsonb_build_object(
      'choose_when', 'Du holder tilbake viktig informasjon, utsetter vanskelige samtaler eller lar hensynet til egen trygghet dominere.',
      'distinction', 'Velg Risikovilje når usikkerheten primært gjelder resultat eller investering. Velg Initiativ når utfordringen er å starte uten å bli bedt, ikke å tåle personlig risiko.',
      'signals', jsonb_build_array('Synliggjør risikoen og handler etter en bevisst vurdering.', 'Tar opp vanskelige saker med tydelighet og respekt.', 'Står for prinsipper uten å gjøre motstand til identitet.'),
      'underuse', 'Overdreven konsensussøking, taushet eller venting på perfekte betingelser.',
      'overuse', 'Blir konfronterende, søker helterollen eller tar unødvendig risiko uten hensyn til timing og allianser.',
      'experiment', 'Velg én sak du har holdt tilbake, avklar risiko og formuler budskap, hensikt og ønsket dialog før du tar den opp.',
      'evidence', 'Saken blir reelt behandlet uten at respekten i relasjonen bryter sammen.'
    )
  ),
  (
    'kreativitet',
    'Kreativitet',
    'Creativity',
    'execution_decisions',
    'Utvikler flere og mer originale muligheter ved å utfordre antakelser og kombinere perspektiver.',
    'raeder-editorial-ccl-mapped',
    170,
    jsonb_build_object(
      'choose_when', 'Teamet hopper til første løsning; alternativer ligner hverandre; etablerte antakelser snevrer inn handlingsrommet.',
      'distinction', 'Velg Innovasjon når ideene finnes, men ikke blir testet eller realisert. Velg Problemløsning når hovedbehovet er å forstå årsak og velge en robust løsning.',
      'signals', jsonb_build_array('Skiller idéskaping fra evaluering.', 'Henter perspektiver som bryter med det etablerte.', 'Utforsker flere problemformuleringer og løsningsretninger.'),
      'underuse', 'Første plausible løsning, homogen idétilførsel eller tidlig kritikk.',
      'overuse', 'Produserer ideer uten prioritering, undervurderer begrensninger eller søker originalitet fremfor verdi.',
      'experiment', 'Generer minst ti alternativer med to personer utenfor fagområdet før kriterier brukes.',
      'evidence', 'Minst ett levedyktig alternativ bryter tydelig med den opprinnelige løsningsretningen.'
    )
  ),
  (
    'troverdighet-og-integritet',
    'Troverdighet og integritet',
    'Credibility and Integrity',
    'self_capacity',
    'Handler konsistent med uttalte verdier og forpliktelser, også når åpenhet eller prinsippfasthet har en kostnad.',
    'raeder-editorial-ccl-mapped',
    180,
    jsonb_build_object(
      'choose_when', 'Det er avstand mellom ord og handling; du lover mer enn du følger opp; vurderingsgrunnlag eller feil skjules.',
      'distinction', 'Velg Bygge tillit når utviklingsbehovet gjelder den bredere, gjensidige relasjonen. Integritet er et sentralt grunnlag for tillit, men tillit påvirkes også av kompetanse, omtanke og forutsigbarhet.',
      'signals', jsonb_build_array('Holder eller reforhandler forpliktelser før de brytes.', 'Forklarer vurderinger, usikkerhet og interessekonflikter åpent.', 'Handler i tråd med prinsipper under press.'),
      'underuse', 'Selektiv åpenhet, opportunistiske prinsipper eller bortforklaring av feil.',
      'overuse', 'Blir rigid, moraliserende eller bruker «autentisitet» som begrunnelse for å si alt uten situasjonsforståelse.',
      'experiment', 'Lukk eller reforhandle én uavklart forpliktelse og forklar én krevende beslutning med kriterier og usikkerhet.',
      'evidence', 'Berørte parter vet hva de kan forvente og hvorfor.'
    )
  ),
  (
    'beslutningstaking',
    'Beslutningstaking',
    'Decision Making',
    'execution_decisions',
    'Velger og forplikter seg til en retning på riktig tidspunkt, med relevant informasjon, tydelige kriterier og passende involvering.',
    'raeder-editorial-ccl-mapped',
    190,
    jsonb_build_object(
      'choose_when', 'Beslutninger tas for sent, for tidlig eller med uklar beslutningseier; konsensus blir standard; alternativer vurderes uten kriterier.',
      'distinction', 'Velg Problemløsning når problemforståelsen og analysen er svak. Velg Navigere i usikkerhet når ubehaget ved manglende informasjon hindrer funksjon bredere enn selve beslutningen.',
      'signals', jsonb_build_array('Avklarer beslutning, eier, kriterier og frist.', 'Involverer dem som øker kvalitet eller er nødvendige for gjennomføring.', 'Beslutter med eksplisitte antakelser når informasjonen er ufullstendig.'),
      'underuse', 'Overanalyse, utydelig eierskap eller unødvendig konsensus.',
      'overuse', 'For rask lukking, symbolsk involvering eller overdreven identitet som «beslutningssterk».',
      'experiment', 'Bruk et beslutningsnotat med spørsmål, kriterier, alternativer, antakelser, eier og frist på én aktuell sak.',
      'evidence', 'Beslutningen tas innen fristen og kan etterprøves uten å rekonstruere prosessen.'
    )
  ),
  (
    'delegering',
    'Delegering',
    'Delegating',
    'team_people',
    'Overfører et avgrenset ansvar med tydelig resultat, mandat, rammer og oppfølging.',
    'raeder-editorial-ccl-mapped',
    200,
    jsonb_build_object(
      'choose_when', 'Du gjør arbeid andre kan eie; oppgaver delegeres uten myndighet; du tar arbeidet tilbake ved første problem.',
      'distinction', 'Velg Lede gjennom andre når hele organiseringen av arbeid og beslutninger gjør deg til flaskehals. Delegering gjelder en konkret overføring; ledelse gjennom andre gjelder systemet rundt flere leveranser.',
      'signals', jsonb_build_array('Delegerer resultatansvar, ikke bare aktivitet.', 'Avklarer handlingsrom, begrensninger og beslutningsmyndighet.', 'Følger opp på avtalte milepæler uten detaljstyring.'),
      'underuse', 'Oppgavebevaring, uklart mandat eller løpende kontroll.',
      'overuse', 'Skyver ansvar ned uten ressurser, støtte eller rimelig vurdering av kapasitet.',
      'experiment', 'Deleger én viktig leveranse med skriftlig avklaring av resultat, mandat, rammer og to milepæler.',
      'evidence', 'Den andre tar selvstendige beslutninger innenfor mandatet, og du griper ikke inn mellom milepælene.'
    )
  ),
  (
    'inkluderende-ledelse',
    'Inkluderende ledelse',
    'Difference, Diversity, Inclusion',
    'relationships_influence',
    'Skaper beslutnings- og samarbeidsprosesser hvor ulike erfaringer, perspektiver og identiteter får reell innflytelse.',
    'raeder-editorial-ccl-mapped',
    210,
    jsonb_build_object(
      'choose_when', 'De samme stemmene dominerer; representasjon finnes uten innflytelse; beslutninger overser systematiske forskjeller i vilkår eller konsekvenser.',
      'distinction', 'Velg Empati og omtanke når behovet først og fremst gjelder forståelse av enkeltmenneskers opplevelse. Inkluderende ledelse gjelder også strukturer, makt og beslutningsprosesser.',
      'signals', jsonb_build_array('Undersøker hvem som er representert, hørt og faktisk påvirker.', 'Utfordrer egne og gruppens antakelser med relevante motperspektiver.', 'Endrer prosesser som systematisk gir noen mindre tilgang eller innflytelse.'),
      'underuse', 'Homogene nettverk, symbolsk involvering eller antakelsen om at lik behandling alltid er rettferdig.',
      'overuse', 'Reduserer mennesker til gruppeidentitet, inviterer perspektiver uten beslutningsrelevans eller bruker inkludering som ren legitimering.',
      'experiment', 'Kartlegg taletid, forslag og påvirkning i tre møter, og endre én møtepraksis.',
      'evidence', 'Flere relevante perspektiver påvirker beslutningen, ikke bare samtalen.'
    )
  ),
  (
    'engasjement-og-eierskap',
    'Skape engasjement og eierskap',
    'Engagement',
    'team_people',
    'Former mening, autonomi, mestring og tilhørighet slik at mennesker ønsker og evner å bidra.',
    'raeder-editorial-ccl-mapped',
    220,
    jsonb_build_object(
      'choose_when', 'Innsatsen er mekanisk; eierskapet er lavt; medarbeidere ser liten sammenheng mellom oppgaver og det som betyr noe.',
      'distinction', 'Velg Lede med formål når utfordringen er den overordnede meningen og retningen. Velg Utvikle andre når læring og vekst er hovedbehovet.',
      'signals', jsonb_build_array('Forstår hva som gir og tapper energi for ulike mennesker.', 'Kobler oppgaver til tydelig verdi og relevant helhet.', 'Gir reelt handlingsrom, mestringsstøtte og anerkjennelse.'),
      'underuse', 'Kontroll, standardiserte motivatorer eller oppgaver uten sammenheng og tilbakemelding.',
      'overuse', 'Gjør trivsel til mål i seg selv, lover medbestemmelse der rammene er faste eller forventer permanent entusiasme.',
      'experiment', 'Spør hver medarbeider hva som gir energi, tapper energi og hvilket handlingsrom som vil hjelpe; endre ett forhold.',
      'evidence', 'Medarbeideren tar mer initiativ eller rapporterer bedre sammenheng mellom ansvar og motivasjon.'
    )
  ),
  (
    'tydelig-ledertilstedevaerelse',
    'Tydelig ledertilstedeværelse',
    'Executive Image',
    'self_capacity',
    'Formidler ro, klarhet, tilgjengelighet og troverdighet gjennom verbal og nonverbal atferd i situasjoner hvor lederrollen blir særlig synlig.',
    'raeder-editorial-ccl-mapped',
    230,
    jsonb_build_object(
      'choose_when', 'Kompetansen din kommer ikke tydelig frem; du blir for tilbaketrukket, urolig eller dominerende under press; fremføringen svekker budskapet.',
      'distinction', 'Velg Kommunikasjon når innhold, struktur eller mottakertilpasning er problemet. Målet her er ikke å ligne en stereotyp leder, men å øke samsvaret mellom hensikt, rolle og virkning.',
      'signals', jsonb_build_array('Bevarer ro, kontakt og tydelighet under press.', 'Bruker stemme, tempo, pauser og kroppsspråk bevisst.', 'Tilpasser synlighet og autoritet uten å miste autentisitet.'),
      'underuse', 'Lav synlighet, utydelig stemme, defensivt kroppsspråk eller liten kontakt med rommet.',
      'overuse', 'Iscenesettelse, dominans, overdreven polering eller normpress på andres personlighet og uttrykk.',
      'experiment', 'Film én viktig presentasjon og be to personer gi feedback på ro, klarhet og kontakt, ikke stilpreferanse.',
      'evidence', 'Budskapet gjengis korrekt og feedbacken peker på mer trygghet uten mindre autentisitet.'
    )
  ),
  (
    'eksterne-partnerskap',
    'Eksterne partnerskap',
    'External Partnership Management',
    'strategy_business_change',
    'Bygger og forvalter gjensidig verdiskapende relasjoner med eksterne aktører over tid.',
    'raeder-editorial-ccl-mapped',
    240,
    jsonb_build_object(
      'choose_when', 'Leveranser avhenger av kunder, leverandører, myndigheter eller partnere; relasjonen er transaksjonell; forventninger og avhengigheter er uklare.',
      'distinction', 'Velg Relasjonsledelse for relasjoner generelt. Eksterne partnerskap krever i tillegg tydelig styring av verdi, risiko, grensesnitt og organisatoriske interesser.',
      'signals', jsonb_build_array('Forstår begge parters mål, begrensninger og alternativer.', 'Investerer i relasjonen før kritiske behov oppstår.', 'Avklarer forventninger, styring, risiko og gjensidige forpliktelser.'),
      'underuse', 'Kontakt bare ved behov, ensidig verdiperspektiv eller uklare grensesnitt.',
      'overuse', 'Prioriterer relasjonen over egne legitime interesser, gjør uformelle bånd uoversiktlige eller unngår nødvendig reforhandling.',
      'experiment', 'Gjennomfør en partnersamtale om mål, verdi, risiko og én uavklart forventning.',
      'evidence', 'Partene dokumenterer minst én gjensidig forpliktelse eller korrigert antakelse.'
    )
  ),
  (
    'feedback',
    'Feedback',
    'Feedback',
    'relationships_influence',
    'Gir, innhenter og bruker konkret informasjon om atferd og virkning for å støtte læring og forbedring.',
    'raeder-editorial-ccl-mapped',
    250,
    jsonb_build_object(
      'choose_when', 'Tilbakemeldinger kommer sent eller generelt; mennesker blir overrasket over vurderinger; du får lite ærlig informasjon om egen virkning.',
      'distinction', 'Velg Utvikle andre for et bredere utviklingsansvar. Velg Håndtere prestasjons- og atferdsutfordringer ved vedvarende avvik som krever formell og tydelig oppfølging.',
      'signals', jsonb_build_array('Beskriver tidsnær observasjon, virkning og ønsket retning.', 'Skiller data, tolkning og vurdering.', 'Ber om spesifikk feedback og viser hvordan den brukes.'),
      'underuse', 'Vag ros, forsinket korrigering, tolkning fremstilt som fakta eller defensiv mottakelse.',
      'overuse', 'Kontinuerlig evaluering, overdreven detaljfeedback eller feedback uten relasjon, hensikt og mottakelighet.',
      'experiment', 'Gi én konkret feedback og be om én konkret feedback hver uke i fire uker.',
      'evidence', 'Minst én observerbar atferd justeres, og den andre kan gjengi hva som var nyttig.'
    )
  ),
  (
    'fleksibilitet',
    'Fleksibilitet',
    'Flexibility',
    'self_capacity',
    'Varierer tilnærming, lederstil og arbeidsform når mennesker, oppgaver eller situasjoner krever det, uten å miste målet.',
    'raeder-editorial-ccl-mapped',
    260,
    jsonb_build_object(
      'choose_when', 'Du bruker samme stil med alle; planen blir viktigere enn situasjonen; andre trenger en annen grad av støtte, involvering eller tydelighet.',
      'distinction', 'Velg Tilpasse seg endring når reaksjonen på endrede rammer er problemet. Velg Navigere i usikkerhet når du må fungere uten klare svar.',
      'signals', jsonb_build_array('Leser hva oppgave, person og kontekst trenger.', 'Endrer virkemiddel samtidig som hensikt og rammer er tydelige.', 'Forklarer kursendringer slik at fleksibilitet ikke oppleves som vilkårlighet.'),
      'underuse', 'Rigid metode, lav mottakertilpasning eller frustrasjon ved avvik fra plan.',
      'overuse', 'Blir uforutsigbar, skifter standpunkt etter press eller tilpasser seg så mye at prinsipper og retning forsvinner.',
      'experiment', 'Velg én person eller situasjon hvor standardstilen din virker svakt, test en bevisst annen tilnærming og be om respons.',
      'evidence', 'Samarbeidet eller oppgaveløsningen forbedres uten at forventningene blir mindre klare.'
    )
  ),
  (
    'globalt-perspektiv',
    'Globalt perspektiv',
    'Global Perspective',
    'strategy_business_change',
    'Forstår hvordan markeder, institusjoner, kulturer og internasjonale avhengigheter påvirker virksomhetens valg og konsekvenser.',
    'raeder-editorial-ccl-mapped',
    270,
    jsonb_build_object(
      'choose_when', 'Rollen påvirkes av flere land eller markeder; egne normer behandles som universelle; lokale beslutninger får globale følger som overses.',
      'distinction', 'Velg Lede globale team når utviklingsbehovet gjelder den daglige ledelsen av et geografisk og kulturelt distribuert team.',
      'signals', jsonb_build_array('Undersøker lokal kontekst uten å redusere mennesker til kulturelle stereotyper.', 'Ser globale avhengigheter, asymmetrier og andreordenseffekter.', 'Involverer lokale perspektiver før beslutning, ikke bare etterpå.'),
      'underuse', 'Hjemmemarkedsbias, begrenset eksponering eller standardisering uten kontekstforståelse.',
      'overuse', 'Overdriver kulturelle forskjeller, blir relativistisk eller gjør globale hensyn så brede at ansvar og valg blir uklare.',
      'experiment', 'Test én viktig beslutning med to personer fra berørte markeder og be dem identifisere lokale antakelser og konsekvenser.',
      'evidence', 'Minst én beslutningspremiss eller gjennomføringsmåte blir justert.'
    )
  ),
  (
    'lede-globale-distribuerte-team',
    'Lede globale og distribuerte team',
    'Global Team Management',
    'team_people',
    'Skaper retning, tilhørighet og rettferdige arbeidsmåter i team på tvers av geografi, kultur og tidssoner.',
    'raeder-editorial-ccl-mapped',
    280,
    jsonb_build_object(
      'choose_when', 'Hovedkontoret dominerer; fjernmedlemmer har mindre innflytelse; avstand og ulik kontekst skaper misforståelser eller svak tilhørighet.',
      'distinction', 'Velg Teamledelse for teamdynamikk generelt. Denne kompetansen legger særlig vekt på avstand, asymmetri, lokal kontekst og virtuelle arbeidsformer.',
      'signals', jsonb_build_array('Etablerer eksplisitte normer for kommunikasjon, beslutning og tilgjengelighet.', 'Fordeler belastning, taletid og innflytelse mer rettferdig.', 'Bygger relasjon og tilhørighet utover formelle videomøter.'),
      'underuse', 'Sentral dominans, samme møtebelastning for noen hele tiden eller lite uformell kontakt.',
      'overuse', 'Gjør alle forskjeller kulturelle, lager for mange prosedyrer eller bruker konsensus for å kompensere for avstand.',
      'experiment', 'Roter møtetid, møteleder og rekkefølge på innspill i fire møter.',
      'evidence', 'Deltakelse og beslutningspåvirkning blir jevnere fordelt.'
    )
  ),
  (
    'initiativ',
    'Initiativ',
    'Initiative',
    'self_capacity',
    'Oppdager behov og tar et ansvarlig første steg uten å vente på unødvendig styring.',
    'raeder-editorial-ccl-mapped',
    290,
    jsonb_build_object(
      'choose_when', 'Problemer blir stående fordi ingen eier dem; du venter på full avklaring eller tillatelse innenfor et allerede rimelig mandat.',
      'distinction', 'Velg Skape nødvendig fremdrift når saken er startet, men tempoet er for lavt. Velg Mot når sosial eller personlig risiko, ikke passivitet, er hovedbarrieren.',
      'signals', jsonb_build_array('Ser muligheter og problemer tidlig.', 'Kobler problemforståelse til et ansvarlig neste steg.', 'Avklarer grensene for mandatet når risikoen tilsier det.'),
      'underuse', 'Venting, ren problemrapportering eller snever tolkning av rolle.',
      'overuse', 'Starter for mye, går rundt nødvendige beslutningseiere eller påfører andre arbeid uten forankring.',
      'experiment', 'Velg ett uavklart problem, formuler anbefaling, første steg og mandatgrense, og start innen én uke.',
      'evidence', 'Saken beveger seg uten at ansvar eller styring blir uklart.'
    )
  ),
  (
    'innovasjon',
    'Innovasjon',
    'Innovation',
    'execution_decisions',
    'Gjør nye ideer om til testede løsninger som skaper dokumenterbar verdi.',
    'raeder-editorial-ccl-mapped',
    300,
    jsonb_build_object(
      'choose_when', 'Ideer blir i presentasjoner; organisasjonen krever høy sikkerhet før små tester; læring fra forsøk brukes lite.',
      'distinction', 'Velg Kreativitet når mangelen på nye ideer og perspektiver er flaskehalsen. Innovasjon omfatter prioritering, eksperimentering, læring og implementering.',
      'signals', jsonb_build_array('Definerer ønsket verdi og kritiske antakelser.', 'Tester tidlig, avgrenset og reversibelt.', 'Bruker resultater til å stoppe, endre eller skalere.'),
      'underuse', 'Perfeksjonskrav, lav toleranse for informativ feil eller drift som alltid fortrenger utforskning.',
      'overuse', 'Eksperimenterer uten strategisk retning, feirer aktivitet fremfor verdi eller skalerer før læringen er robust.',
      'experiment', 'Test den mest usikre antakelsen i én idé med minst mulig ressursbruk.',
      'evidence', 'Testen gir et tydelig grunnlag for å stoppe, endre eller gå videre.'
    )
  ),
  (
    'mellommenneskelig-teft',
    'Mellommenneskelig teft',
    'Interpersonal Savvy',
    'relationships_influence',
    'Leser sosiale signaler, forstår hvordan ulike mennesker virker sammen og tilpasser eget samspill med presisjon.',
    'raeder-editorial-ccl-mapped',
    310,
    jsonb_build_object(
      'choose_when', 'Du overser reaksjoner i rommet; samme stil fungerer svært ulikt med forskjellige mennesker; oppgavefokus svekker relasjonen.',
      'distinction', 'Velg Relasjonsledelse når hovedbehovet er å bygge og vedlikeholde et strategisk relasjonsnettverk. Mellommenneskelig teft gjelder kvaliteten i selve samspillet.',
      'signals', jsonb_build_array('Observerer verbal og nonverbal respons uten å trekke forhastede konklusjoner.', 'Tilpasser kontaktform, tempo og direktehet.', 'Tester egne fortolkninger gjennom spørsmål.'),
      'underuse', 'Lav sensitivitet for signaler, samme samspillsstil med alle eller begrenset perspektivtaking.',
      'overuse', 'Overfortolker signaler, blir sosialt taktisk eller tilpasser seg så mye at eget standpunkt blir uklart.',
      'experiment', 'Observer reaksjoner i ett krevende møte, noter to hypoteser og test dem med åpne spørsmål.',
      'evidence', 'Minst én antakelse blir korrigert før du handler på den.'
    )
  ),
  (
    'lede-kultur',
    'Lede kultur',
    'Leading the Culture',
    'strategy_business_change',
    'Former felles normer gjennom det lederen modellerer, prioriterer, belønner, organiserer og tolererer.',
    'raeder-editorial-ccl-mapped',
    320,
    jsonb_build_object(
      'choose_when', 'Uttalte verdier og faktisk praksis spriker; uønsket atferd tolereres; kultur behandles som kommunikasjon fremfor et ledelsesansvar.',
      'distinction', 'Velg Lede med formål når meningen og hvorfor-et er uklart. Velg Gjennomføre endring når en definert ny arbeidspraksis skal innføres; kulturledelse gjelder de bredere normene som oppstår over tid.',
      'signals', jsonb_build_array('Oversetter ønsket kultur til konkret, situert atferd.', 'Samordner egen modellering, systemer, belønning og konsekvenser.', 'Undersøker faktisk praksis, også der budskapet er ubehagelig.'),
      'underuse', 'Verdiplakater, inkonsekvent reaksjon eller manglende forståelse av lederens symbolske effekt.',
      'overuse', 'Forsøker å styre enhver norm, gjør kultur ensartet eller bruker kultur som forklaring på alle problemer.',
      'experiment', 'Velg én ønsket norm, identifiser hva som belønner og undergraver den, og endre én lederpraksis.',
      'evidence', 'Medarbeidere kan beskrive en konkret forskjell i hva som nå forventes eller tolereres.'
    )
  ),
  (
    'lede-med-formal',
    'Lede med formål',
    'Leading with Purpose',
    'strategy_business_change',
    'Knytter arbeid og prioriteringer til en troverdig forklaring på hvorfor virksomheten eller oppgaven betyr noe.',
    'raeder-editorial-ccl-mapped',
    330,
    jsonb_build_object(
      'choose_when', 'Arbeidet oppleves fragmentert eller meningsløst; ledelsen snakker mest om leveranser; formålet har liten konsekvens for prioriteringer.',
      'distinction', 'Velg Visjon når det mangler et konkret bilde av ønsket fremtid. Formål handler om hvorfor arbeidet er verdt å gjøre; visjon handler om hvor man skal.',
      'signals', jsonb_build_array('Formulerer meningen konkret og uten abstrakt organisasjonsspråk.', 'Kobler daglige valg og ressursbruk til formålet.', 'Er åpen om spenninger mellom formål og andre hensyn.'),
      'underuse', 'Tomme formuleringer, ensidig oppgavekommunikasjon eller prioriteringer som motsier budskapet.',
      'overuse', 'Moraliserer, bruker formål til å legitimere urimelige krav eller overvurderer mening som erstatning for lønn, kapasitet og gode rammer.',
      'experiment', 'Forklar én prioritering gjennom hvem den skaper verdi for, hvorfor det betyr noe og hva dere derfor velger bort.',
      'evidence', 'Teamet kan knytte egne oppgaver og ett konkret bortvalg til samme formål.'
    )
  ),
  (
    'forhandling',
    'Forhandling',
    'Negotiating',
    'relationships_influence',
    'Utvikler og inngår holdbare avtaler mellom parter med delvis sammenfallende og delvis motstridende interesser.',
    'raeder-editorial-ccl-mapped',
    340,
    jsonb_build_object(
      'choose_when', 'Ressurser, pris, ansvar eller vilkår skal avtales; du gir for lett etter eller låser deg til posisjon; alternativer er uklare.',
      'distinction', 'Velg Konflikthåndtering når relasjonell eller saklig konflikt må bearbeides før avtale. Velg Påvirkning når den andre skal støtte en retning uten et tydelig bytteforhold.',
      'signals', jsonb_build_array('Forbereder interesser, prioriteringer, alternativer og grenser.', 'Utforsker før første løsning eller krav låses.', 'Bytter verdi på tvers av ulike prioriteringer og dokumenterer avtalen.'),
      'underuse', 'Posisjonskamp, svak forberedelse eller raske innrømmelser for å bevare relasjon.',
      'overuse', 'Gjør samarbeid transaksjonelt, forhandler om småting eller bruker taktikk som svekker langsiktig tillit.',
      'experiment', 'Forbered neste forhandling med egne og antatte interesser, beste alternativ, grense og tre mulige bytter.',
      'evidence', 'Avtalen ivaretar de viktigste interessene uten unødvendige innrømmelser.'
    )
  ),
  (
    'organisasjonsforstaelse',
    'Organisasjonsforståelse',
    'Organizational Savvy',
    'strategy_business_change',
    'Forstår hvordan formell myndighet, uformell innflytelse, interesser og beslutningsprosesser faktisk virker i organisasjonen.',
    'raeder-editorial-ccl-mapped',
    350,
    jsonb_build_object(
      'choose_when', 'Gode saker stopper av uklare grunner; du involverer feil personer eller for sent; organisasjonskartet brukes som beslutningskart.',
      'distinction', 'Velg Påvirkning når aktørene og dynamikken er forstått, men du trenger større oppslutning. Velg Forretnings- og fagforståelse når det er virksomhetslogikken, ikke makt- og beslutningsdynamikken, som mangler.',
      'signals', jsonb_build_array('Kartlegger formelle beslutningseiere og uformelle påvirkere.', 'Forstår interesser og historikk uten å bli kynisk.', 'Bygger legitime relasjoner før støtte er nødvendig.'),
      'underuse', 'Naiv prosessforståelse, ignorering av politikk eller kontakt først når noe trengs.',
      'overuse', 'Blir opportunistisk, overtolker skjulte agendaer eller prioriterer posisjonering foran sak og integritet.',
      'experiment', 'Kartlegg beslutningseier, påvirkere, interesser og mulige motforestillinger i én sak; test kartet med en erfaren kollega.',
      'evidence', 'En viktig aktør involveres tidligere eller på en mer relevant måte.'
    )
  ),
  (
    'problemlosning',
    'Problemløsning',
    'Problem Solving',
    'execution_decisions',
    'Definerer problemer presist, undersøker årsaker og utvikler løsninger som adresserer mer enn synlige symptomer.',
    'raeder-editorial-ccl-mapped',
    360,
    jsonb_build_object(
      'choose_when', 'Teamet hopper til løsning; samme problem vender tilbake; data brukes til å bekrefte første hypotese.',
      'distinction', 'Velg Beslutningstaking når alternativene er gode nok, men valg og forpliktelse svikter. Velg Løsningskraft under begrensninger når problemet er kjent, men ressurser eller tilgang er hovedbarrieren.',
      'signals', jsonb_build_array('Skiller fakta, symptomer, årsaker og problemformulering.', 'Bruker relevante data og motstridende perspektiver.', 'Tester om løsningen adresserer årsak og mulige bivirkninger.'),
      'underuse', 'Løsningshopp, bekreftelsesbias eller behandling av problemet slik det først ble presentert.',
      'overuse', 'Analyse uten handling, unødvendig kompleksitet eller søken etter grunnårsak der pragmatisk håndtering er tilstrekkelig.',
      'experiment', 'Formuler én utfordring på tre måter, identifiser data som kan avkrefte hver formulering og test den mest kritiske antakelsen.',
      'evidence', 'Problemdefinisjonen endres eller styrkes før løsning velges.'
    )
  ),
  (
    'relasjonsledelse',
    'Relasjonsledelse',
    'Relationship Management',
    'relationships_influence',
    'Bygger, vedlikeholder og reparerer arbeidsrelasjoner som er nødvendige for samarbeid og resultater over tid.',
    'raeder-editorial-ccl-mapped',
    370,
    jsonb_build_object(
      'choose_when', 'Kontakten er behovsstyrt; kritiske relasjoner forsømmes; små brudd eller uavklarte forventninger svekker samarbeid.',
      'distinction', 'Velg Mellommenneskelig teft når utfordringen er kvaliteten på det konkrete samspillet. Velg Eksterne partnerskap for strategiske relasjoner mellom organisasjoner.',
      'signals', jsonb_build_array('Prioriterer relasjoner ut fra betydning og gjensidig verdi.', 'Følger opp kontakt, forpliktelser og uavklarte spenninger.', 'Reparerer brudd uten å late som uenighet ikke finnes.'),
      'underuse', 'Kontakt bare ved behov, svak oppfølging eller konsekvent oppgaveprioritering.',
      'overuse', 'Nettverksaktivitet uten dybde, konfliktskyhet eller favorisering av relasjon fremfor sak og rettferdighet.',
      'experiment', 'Velg én kritisk forsømt relasjon, ta kontakt uten bestilling og avklar hva et bedre samarbeid krever fra begge.',
      'evidence', 'En konkret gjensidig forventning eller arbeidsform blir forbedret.'
    )
  ),
  (
    'motstandskraft',
    'Motstandskraft',
    'Resilience',
    'self_capacity',
    'Bevarer eller gjenoppretter regulering, perspektiv og funksjon under press, usikkerhet og tilbakeslag.',
    'raeder-editorial-ccl-mapped',
    380,
    jsonb_build_object(
      'choose_when', 'Stress snevrer inn dømmekraften; du bruker lang tid på å hente deg inn; tilbakeslag blir tolket som varige nederlag.',
      'distinction', 'Velg Bærekraftig kapasitet og prioritering når vedvarende belastningsdesign og grenser er hovedproblemet. Motstandskraft gjelder respons og restitusjon når belastning faktisk oppstår.',
      'signals', jsonb_build_array('Gjenkjenner tidlige tegn på redusert kapasitet.', 'Regulerer intensitet og bruker støtte og restitusjon aktivt.', 'Trekker læring uten å romantisere belastningen.'),
      'underuse', 'Vedvarende alarmberedskap, isolasjon, redusert perspektiv eller langsom tilbakekomst.',
      'overuse', 'Normaliserer skadelige rammer, dyrker utholdenhet som identitet eller forventer at andre skal tåle systemproblemer.',
      'experiment', 'Definer egne tidlige tegn, to reguleringsgrep og én person du kontakter i en krevende periode; bruk planen bevisst.',
      'evidence', 'Du oppdager kapasitetsfall tidligere og gjenoppretter funksjon raskere.'
    )
  ),
  (
    'losningskraft-under-begrensninger',
    'Løsningskraft under begrensninger',
    'Resourcefulness',
    'execution_decisions',
    'Mobiliserer tilgjengelige mennesker, kunnskap og ressurser for å skape praktisk fremdrift når rammene er ufullstendige.',
    'raeder-editorial-ccl-mapped',
    390,
    jsonb_build_object(
      'choose_when', 'Arbeid stopper fordi ønskede ressurser mangler; du forsøker å løse alt alene; muligheter i eksisterende nettverk og ressurser overses.',
      'distinction', 'Velg Problemløsning når årsaksforståelsen er svak. Velg Initiativ når barrieren er å ta første steg, ikke å finne alternative midler.',
      'signals', jsonb_build_array('Avklarer hva som er godt nok til neste steg.', 'Finner og kombinerer ressurser utover egen enhet.', 'Skaper midlertidige, ansvarlige løsninger uten å skjule langsiktig behov.'),
      'underuse', 'Ressursventing, fastlåsthet eller overdreven selvhjulpenhet.',
      'overuse', 'Improviserer permanent, omgår nødvendige kvalitetskrav eller tapper andres kapasitet gjennom uformelle løsninger.',
      'experiment', 'Velg én blokkert sak og kartlegg hva dere har, hvem som kan bidra og minste forsvarlige neste steg.',
      'evidence', 'Saken beveger seg uten ny hovedressurs og uten brudd på kritiske krav.'
    )
  ),
  (
    'gjennomtenkt-risikovilje',
    'Gjennomtenkt risikovilje',
    'Risk Taking',
    'self_capacity',
    'Tar bevisst risiko når mulig verdi forsvarer usikkerheten, og begrenser konsekvensene der det er mulig.',
    'raeder-editorial-ccl-mapped',
    400,
    jsonb_build_object(
      'choose_when', 'Kravet om sikkerhet hindrer læring eller muligheter; kostnaden ved å ikke handle overses; reversible valg behandles som irreversible.',
      'distinction', 'Velg Mot når den sentrale risikoen er sosial, etisk eller knyttet til egen posisjon. Velg Beslutningstaking når prosessen for valg generelt er problemet.',
      'signals', jsonb_build_array('Vurderer oppside, nedside, reversibilitet og kostnaden ved passivitet.', 'Gjør antakelser og risikoreduserende tiltak eksplisitte.', 'Skiller intelligent risiko fra uforsiktighet.'),
      'underuse', 'Overdreven sikkerhetssøking, tapsskjevhet eller passivitet forkledd som grundighet.',
      'overuse', 'Spenningssøking, undervurderte følgevirkninger eller risiko som bæres av andre uten deres innflytelse.',
      'experiment', 'Velg én reversibel beslutning, beskriv beste, verste og mest sannsynlige utfall samt stoppsignal, og ta den raskere.',
      'evidence', 'Læring eller verdi oppstår tidligere, mens nedsiden forblir innen avtalt grense.'
    )
  ),
  (
    'egenutvikling',
    'Egenutvikling',
    'Self-Development',
    'self_capacity',
    'Tar langsiktig ansvar for å utvikle kapasitet som nåværende og fremtidige roller krever.',
    'raeder-editorial-ccl-mapped',
    410,
    jsonb_build_object(
      'choose_when', 'Utvikling blir tilfeldig eller utsettes; du har mange mål uten praksis; innsikt samles uten endret atferd.',
      'distinction', 'Velg Læringssmidighet når behovet er å lære bedre fra løpende erfaring og overføre læringen. Egenutvikling gjelder retning, prioritering og vedvarende oppfølging av egen utvikling.',
      'signals', jsonb_build_array('Prioriterer få utviklingsmål ut fra rolle og fremtidige krav.', 'Bruker arbeidserfaring, feedback, refleksjon og faglig input sammen.', 'Følger opp faktisk endring over tid.'),
      'underuse', 'Utvikling bare når tid finnes, kursinnsamling eller mange parallelle mål.',
      'overuse', 'Konstant selvoptimalisering, utvikling uten tydelig rollebehov eller utilfredshet med stabil, god praksis.',
      'experiment', 'Velg én atferd for de neste åtte ukene, én treningsarena og to feedbackpersoner.',
      'evidence', 'Feedbackpersonene kan beskrive en konkret forskjell ved periodens slutt.'
    )
  ),
  (
    'strategisk-retning',
    'Strategisk samordning',
    'Strategic Alignment',
    'strategy_business_change',
    'Sørger for at mål, prioriteringer, ressurser, styringssignaler og avhengigheter trekker i samme strategiske retning.',
    'raeder-editorial-ccl-mapped',
    420,
    jsonb_build_object(
      'choose_when', 'Alt er prioritert; lokale mål motvirker helheten; strategien har liten konsekvens for ressursbruk og daglige valg.',
      'distinction', 'Velg Strategisk planlegging og gjennomføring når retningen må omsettes til initiativer, ansvar og milepæler. Samordning handler særlig om konsistens på tvers.',
      'signals', jsonb_build_array('Tester initiativer og ressursbruk mot eksplisitte strategiske valg.', 'Synliggjør og håndterer målkonflikter mellom enheter.', 'Avklarer kritiske avhengigheter og felles styringssignaler.'),
      'underuse', 'Strategi som tillegg, konkurrerende mål eller manglende bortvalg.',
      'overuse', 'Tvinger frem likhet, sentraliserer unødvendig eller reduserer lokal tilpasning og utforskning.',
      'experiment', 'Kartlegg fem større aktiviteter mot tre strategiske prioriteringer og stopp, endre eller nedprioriter minst én.',
      'evidence', 'Ressurser flyttes faktisk, ikke bare etikettene.'
    )
  ),
  (
    'strategisk-planlegging-og-gjennomforing',
    'Strategisk planlegging og gjennomføring',
    'Strategic Planning and Implementation',
    'strategy_business_change',
    'Oversetter langsiktig retning til få prioriteringer, sammenhengende initiativer, ansvar og lærende gjennomføring.',
    'raeder-editorial-ccl-mapped',
    430,
    jsonb_build_object(
      'choose_when', 'Strategien blir aktivitetsliste; gjennomføringen er svakere enn planleggingen; for mange initiativer konkurrerer om kapasitet.',
      'distinction', 'Velg Visjon når ønsket fremtid er uklar. Velg Strategisk samordning når planene finnes, men mål og ressurser trekker i ulike retninger.',
      'signals', jsonb_build_array('Gjør eksplisitte valg om hva som skal og ikke skal gjøres.', 'Kobler ønsket effekt til initiativer, eiere, ressurser og milepæler.', 'Reviderer antakelser og plan når omgivelsene endrer seg.'),
      'underuse', 'For mange prioriteringer, uklare effekter eller oppfølging bare på aktivitet.',
      'overuse', 'Planleggingsperfeksjon, falsk presisjon eller rigiditet når læring tilsier kursendring.',
      'experiment', 'Reduser én plan til tre avgjørende valg, ønsket effekt, eier, tidlig indikator og eksplisitt bortvalg.',
      'evidence', 'Teamet kan prioritere en ny forespørsel uten å eskalere fordi valgene er klare.'
    )
  ),
  (
    'systemtenkning',
    'Systemtenkning',
    'Systems Thinking',
    'strategy_business_change',
    'Ser mønstre, tilbakekoblinger, avhengigheter, forsinkelser og målkonflikter som former resultatene i et større system.',
    'raeder-editorial-ccl-mapped',
    440,
    jsonb_build_object(
      'choose_when', 'Lokale forbedringer skaper problemer andre steder; komplekse utfordringer behandles lineært; utilsiktede konsekvenser gjentar seg.',
      'distinction', 'Velg Problemløsning for et mer avgrenset problem med identifiserbare årsaker. Systemtenkning er særlig relevant når årsak og virkning er spredt over tid, nivåer og aktører.',
      'signals', jsonb_build_array('Kartlegger aktører, insentiver, strømmer og gjensidige påvirkninger.', 'Undersøker andreordenseffekter og tidsforsinkelser.', 'Håndterer målkonflikter eksplisitt fremfor å late som alle kan maksimeres.'),
      'underuse', 'Lokal optimalisering, enkel årsakslogikk eller ignorering av avhengigheter.',
      'overuse', 'Gjør alt komplekst, bruker helheten til å unngå lokalt ansvar eller analyserer systemet uten et mulig inngrepspunkt.',
      'experiment', 'Tegn systemet rundt én gjentakende utfordring og identifiser én tilbakekobling, én forsinkelse og ett mulig inngrepspunkt.',
      'evidence', 'Tiltaket retter seg mot en mekanisme, ikke bare et symptom.'
    )
  ),
  (
    'rekruttere-og-beholde-talent',
    'Rekruttere og beholde talent',
    'Talent Recruitment and Retention',
    'team_people',
    'Bygger den kapasiteten virksomheten trenger ved å tiltrekke, velge, utvikle og beholde relevante mennesker over tid.',
    'raeder-editorial-ccl-mapped',
    450,
    jsonb_build_object(
      'choose_when', 'Teamet mangler fremtidig kapasitet; rekruttering gjentar samme profil; nøkkelpersoner forlater uten at årsakene er forstått.',
      'distinction', 'Velg Utvikle andre når behovet primært gjelder vekst hos nåværende medarbeidere. Denne kompetansen omfatter den bredere talentporteføljen og arbeidsmiljøets attraktivitet.',
      'signals', jsonb_build_array('Definerer fremtidige kapabilitetsbehov før profil og kandidat.', 'Vurderer potensial, komplementaritet og dokumentert erfaring strukturert.', 'Bruker utvikling, ledelseskvalitet og arbeidsvilkår aktivt i retensjon.'),
      'underuse', 'Kopier av tidligere profiler, reaktiv retensjon eller talent som rent HR-ansvar.',
      'overuse', 'Overfokus på «talenter», intern konkurranse eller urealistiske løfter for å beholde enkeltpersoner.',
      'experiment', 'Gjennomfør tre stay-samtaler og kartlegg ett fremtidig kompetansegap uten å starte med dagens stillinger.',
      'evidence', 'Ett konkret tiltak endres i arbeidsmiljø, utvikling eller bemanningsplan.'
    )
  ),
  (
    'teamledelse',
    'Teamledelse',
    'Team Leadership',
    'team_people',
    'Leder teamet som et gjensidig avhengig system med felles retning, tydelige roller og arbeidsmåter som støtter samlet prestasjon.',
    'raeder-editorial-ccl-mapped',
    460,
    jsonb_build_object(
      'choose_when', 'Du leder enkeltpersoner, men ikke samspillet; roller og avhengigheter er uklare; harmoni skjuler svak koordinering eller nødvendig uenighet.',
      'distinction', 'Velg Lede gjennom andre når hele arbeidsorganiseringen og beslutningsfordelingen gjør lederen til flaskehals. Velg Lede globale og distribuerte team når avstand og lokal kontekst er den særskilte utfordringen.',
      'signals', jsonb_build_array('Etablerer felles leveranse, beslutningsmåte og gjensidige forpliktelser.', 'Gjør roller, avhengigheter og grensesnitt tydelige.', 'Arbeider med samspillsmønstre, ikke bare enkeltprestasjoner.'),
      'underuse', 'Individledelse, uklare normer eller toleranse for samarbeidsproblemer.',
      'overuse', 'Overprosesserer teamet, søker kollektiv involvering i alle spørsmål eller svekker individuelt ansvar.',
      'experiment', 'La teamet kartlegge viktigste felles leveranse, tre avhengigheter og ett mønster som hemmer dem.',
      'evidence', 'Teamet endrer én arbeidsmåte og kan vise bedre koordinering i en konkret leveranse.'
    )
  ),
  (
    'tidsstyring',
    'Tidsstyring',
    'Time Management',
    'self_capacity',
    'Bruker oppmerksomhet og tid i tråd med viktigste ansvar, og designer arbeidsflyten for konsentrasjon og fremdrift.',
    'raeder-editorial-ccl-mapped',
    470,
    jsonb_build_object(
      'choose_when', 'Innboks og møter styrer dagen; kjernearbeid skyves; kalenderen gjenspeiler ikke prioriteringene.',
      'distinction', 'Velg Bærekraftig kapasitet og prioritering når utfordringen også omfatter grenser, vedvarende belastning og restitusjon. Tidsstyring er mer operativt.',
      'signals', jsonb_build_array('Planlegger høyt verdsatt arbeid før kalenderen fylles.', 'Samler, forkorter, delegerer eller fjerner lavverdiaktivitet.', 'Beskytter konsentrasjon og har en realistisk buffer.'),
      'underuse', 'Reaktiv arbeidsdag, møtetetthet eller aktivitet som mål på fremdrift.',
      'overuse', 'Rigid kalender, overdreven produktivitetsoptimalisering eller for lite tilgjengelighet for uforutsette menneskelige behov.',
      'experiment', 'Kod to kalenderuker etter strategisk verdi, drift og friksjon; flytt minst ti prosent til viktig kjernearbeid.',
      'evidence', 'En definert kjerneleveranse får mer sammenhengende tid og færre utsettelser.'
    )
  ),
  (
    'tvetydighet',
    'Navigere i usikkerhet',
    'Tolerating Ambiguity',
    'self_capacity',
    'Bevarer nysgjerrighet, vurderingsevne og handlingskraft når informasjon, retning eller utfall ikke er entydig.',
    'raeder-editorial-ccl-mapped',
    480,
    jsonb_build_object(
      'choose_when', 'Du søker premature svar; blir passiv uten full informasjon; låser deg raskt til én fortolkning for å redusere ubehag.',
      'distinction', 'Velg Tilpasse seg endring når rammene faktisk er endret og reaksjonen gjelder tap eller overgang. Velg Beslutningstaking når det gjelder en konkret beslutningsprosess.',
      'signals', jsonb_build_array('Holder flere plausible forklaringer åpne.', 'Skiller hva som må avklares nå fra hva som kan forbli uavklart.', 'Tar reversible steg mens kritisk usikkerhet overvåkes.'),
      'underuse', 'Prematur sikkerhet, handlingslammelse eller overdreven kontrollsøking.',
      'overuse', 'Romantiserer uklarhet, unnlater å skape nødvendig retning eller lar beslutninger flyte når avklaring er mulig.',
      'experiment', 'Beskriv tre plausible scenarioer, felles robuste handlinger og ett signal som utløser kursendring.',
      'evidence', 'Arbeidet beveger seg uten at usikkerheten skjules eller må løses kunstig.'
    )
  ),
  (
    'tillit',
    'Bygge tillit',
    'Trust',
    'relationships_influence',
    'Skaper trygghet for samarbeid gjennom pålitelighet, åpenhet, kompetanse, omtanke og ansvarlig tillit til andre.',
    'raeder-editorial-ccl-mapped',
    490,
    jsonb_build_object(
      'choose_when', 'Informasjon holdes tilbake; mennesker kontrollerer hverandre unødvendig; forpliktelser eller intensjoner blir møtt med skepsis.',
      'distinction', 'Velg Troverdighet og integritet når avstanden mellom egne prinsipper, ord og handling er hovedproblemet. Tillit er en relasjonell vurdering og kan ikke kreves ensidig.',
      'signals', jsonb_build_array('Holder, avklarer eller reforhandler forpliktelser.', 'Deler relevant informasjon og begrunnelse innen forsvarlige rammer.', 'Gir handlingsrom gradert etter risiko og følger opp uten skjult kontroll.'),
      'underuse', 'Uforutsigbarhet, unødvendig hemmelighold eller krav om tillit uten å gi den.',
      'overuse', 'Naiv tillit, uklar kontroll ved høy risiko eller åpenhet som bryter konfidensialitet.',
      'experiment', 'Spør én viktig relasjon hva som ville gjort samarbeidet mer forutsigbart og trygt; avtal én gjensidig praksis.',
      'evidence', 'Mindre dobbeltkontroll, raskere informasjonsdeling eller tidligere varsling av problemer.'
    )
  ),
  (
    'skape-nodvendig-fremdrift',
    'Skape nødvendig fremdrift',
    'Urgency',
    'self_capacity',
    'Øker tempoet i viktige saker når timing har verdi, uten å gjøre konstant hastverk til normaltilstand.',
    'raeder-editorial-ccl-mapped',
    500,
    jsonb_build_object(
      'choose_when', 'Saker driver uten eier eller frist; reversible beslutninger behandles langsomt; perfeksjon forsinker læring eller resultat.',
      'distinction', 'Velg Initiativ når saken ikke er startet. Velg Tidsstyring når personlig arbeidsflyt og kalender er hovedproblemet. Fremdrift gjelder tempoet i en konkret viktig sak.',
      'signals', jsonb_build_array('Skiller reell tidskritikalitet fra opplevd travelhet.', 'Avklarer neste steg, eier og kort beslutningshorisont.', 'Fjerner venting og unødvendige overleveringer.'),
      'underuse', 'Drift, uklare frister eller perfeksjonisme på reversible valg.',
      'overuse', 'Falsk hast, kronisk stress, omarbeid eller prioriteringer som stadig endres etter siste signal.',
      'experiment', 'Velg én treg sak, kartlegg ventetid og reduser én godkjenning eller overlevering; sett eier og frist.',
      'evidence', 'Gjennomløpstiden faller uten økning i feil eller uklarhet.'
    )
  ),
  (
    'visjon',
    'Visjon',
    'Vision',
    'strategy_business_change',
    'Formulerer et konkret, troverdig og attraktivt bilde av en ønsket fremtid som gir retning til valg i dag.',
    'raeder-editorial-ccl-mapped',
    510,
    jsonb_build_object(
      'choose_when', 'Målene er tall uten fremtidsbilde; mennesker forstår ikke hvor organisasjonen skal; prioriteringer mangler en samlende retning.',
      'distinction', 'Velg Lede med formål når hvorfor-et og meningen er uklart. Velg Strategisk planlegging og gjennomføring når fremtidsbildet finnes, men veien, valgene og ansvaret mangler.',
      'signals', jsonb_build_array('Beskriver en ønsket fremtid konkret nok til at forskjellen fra i dag er synlig.', 'Forbinder fremtidsbildet med behov, identitet og realistiske muligheter.', 'Bruker visjonen som beslutningskriterium, ikke bare kommunikasjon.'),
      'underuse', 'Generelle ambisjoner, mål uten mening eller visjon uten konsekvens for valg.',
      'overuse', 'Storslått retorikk, undervurdering av begrensninger eller hyppig utskifting av fremtidsbilder.',
      'experiment', 'Beskriv ønsket fremtid på én side med tre observerbare forskjeller fra i dag og tre valg den krever nå.',
      'evidence', 'Medarbeidere kan gjenfortelle retningen og bruke den i et reelt prioriteringsvalg.'
    )
  ),
  (
    'lede-gjennom-andre',
    'Lede gjennom andre',
    'Working through Others',
    'team_people',
    'Organiserer ansvar, beslutninger, kapasitet og oppfølging slik at resultater skapes gjennom et fungerende system, ikke lederens egen produksjon.',
    'raeder-editorial-ccl-mapped',
    520,
    jsonb_build_object(
      'choose_when', 'Arbeid stopper når du er borte; for mange beslutninger samles hos deg; teamet er avhengig av din detaljinvolvering.',
      'distinction', 'Velg Delegering for én konkret overføring av ansvar. Velg Teamledelse når teamets felles mål og samspill er hovedproblemet. Lede gjennom andre gjelder lederens samlede arbeidsmodell.',
      'signals', jsonb_build_array('Plasserer ansvar og beslutningsmyndighet nær relevant kunnskap.', 'Sørger for kapasitet, grensesnitt og tydelige eskaleringspunkter.', 'Følger opp resultater og system, ikke alle detaljer.'),
      'underuse', 'Lederen som flaskehals, detaljkontroll eller beslutninger som unødvendig trekkes oppover.',
      'overuse', 'Blir fjern, delegerer systemansvar uten støtte eller mister kontakt med kvalitet, mennesker og virkelighet.',
      'experiment', 'Kartlegg hva som stopper ved to ukers fravær, flytt én beslutning og definer ramme og eskalering.',
      'evidence', 'Arbeidet fortsetter med forsvarlig kvalitet uten lederens løpende godkjenning.'
    )
  )
on conflict (slug) do update
set
  title_no = excluded.title_no,
  title_en = excluded.title_en,
  category = excluded.category,
  summary = excluded.summary,
  source = excluded.source,
  sort_order = excluded.sort_order,
  content_json = excluded.content_json,
  is_active = true,
  updated_at = now();

alter table public.leadership_competencies
  add constraint leadership_competencies_category_check check (category = any (array[
    'foundation'::text,
    'self_capacity'::text,
    'relationships_influence'::text,
    'team_people'::text,
    'execution_decisions'::text,
    'strategy_business_change'::text,
    'derailer'::text
  ]));
