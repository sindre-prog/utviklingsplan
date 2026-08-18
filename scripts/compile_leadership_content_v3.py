#!/usr/bin/env python3
"""Compile the reviewed DOCX into an editorial JSON draft.

The current database copy remains the baseline for names, definitions,
relevance, distinctions and practice. The DOCX is only used to add the
missing underuse, miscalibration and barrier material.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from docx import Document


SECTION_KEYS = {
    "Når lykkes du?": "success",
    "Når gjør du for lite?": "underuse",
    "Når gjør du for mye?": "overuse",
    "Hva kan stå i veien?": "barriers",
}

PASSIVE_VERBS = {
    "brukes": "bruker",
    "prioriteres": "prioriterer",
    "behandles": "behandler",
    "undervurderes": "undervurderer",
    "overvurderes": "overvurderer",
    "overses": "overser",
    "utsettes": "utsetter",
    "individualiseres": "individualiserer",
    "tolkes": "tolker",
    "tas": "tar",
    "reduseres": "reduserer",
    "aksepteres": "aksepterer",
    "tolereres": "tolererer",
    "fremstilles": "fremstiller",
    "forfølges": "forfølger",
    "etableres": "etablerer",
    "skaleres": "skalerer",
    "forklares": "forklarer",
    "omtales": "omtaler",
    "kobles": "kobler",
    "holdes": "holder",
    "måles": "måler",
    "samles": "samler",
    "gjøres": "gjør",
    "låses": "låser",
    "avvises": "avviser",
    "presses": "presser",
    "gis": "gir",
    "diskuteres": "diskuterer",
    "styres": "styrer",
    "skyves": "skyver",
    "beskyttes": "beskytter",
    "aktiveres": "aktiverer",
}

CAUSAL_VERBS = {
    "blir": "bli",
    "får": "få",
    "fører": "føre",
    "erstatter": "erstatte",
    "skaper": "skape",
    "stopper": "stoppe",
    "gjør": "gjøre",
    "lever": "leve",
    "forsvinner": "forsvinne",
    "uteblir": "utebli",
    "kommer": "komme",
    "akkumulerer": "akkumulere",
    "undergraver": "undergrave",
    "overskygger": "overskygge",
    "fortrenger": "fortrenge",
    "svekker": "svekke",
}

MANUAL_WHEN_DU = {
    "Når budskap blir uklare, ustrukturerte eller vanskelige å omsette i handling.": "Når du gjør budskapet uklart, ustrukturert eller vanskelig å omsette i handling.",
    "Når detaljert kommunikasjon reduserer andres handlingsrom.": "Når du gir så mye detalj at andres handlingsrom blir mindre.",
    "Når mottakertilpasning går på bekostning av konsistens eller tydelighet.": "Når du tilpasser budskapet så mye at konsistens eller tydelighet svekkes.",
    "Når erfaring gir aktivitet, men lite eksplisitt læring.": "Når du samler erfaringer uten å trekke ut tydelig læring.",
    "Når de samme reaksjonsmønstrene gjentar seg uten å undersøkes.": "Når du gjentar de samme reaksjonsmønstrene uten å undersøke dem.",
    "Når tilbakemeldinger avvises eller forklares bort.": "Når du avviser eller forklarer bort tilbakemeldinger som utfordrer selvbildet ditt.",
    "Når vedvarende belastning får svekke beslutningskvalitet eller relasjoner.": "Når du lar vedvarende belastning svekke beslutningskvalitet eller relasjoner.",
    "Når ideer ikke omsettes til tydelige hypoteser, kundeinnsikt eller handling.": "Når du lar ideer bli værende uten tydelige hypoteser, kundeinnsikt eller handling.",
    "Når for mange initiativer startes samtidig.": "Når du starter flere initiativer enn organisasjonen kan følge opp.",
    "Når ansvar, avhengigheter eller nye arbeidsmåter er uklare.": "Når du ikke avklarer ansvar, avhengigheter eller nye arbeidsmåter.",
    "Når potensial ikke omsettes i reelle muligheter og ansvar.": "Når du ser potensial uten å gi reelle muligheter eller ansvar.",
    "Når mennesker må gjøre behov eksplisitte før du registrerer dem.": "Når du først registrerer behov etter at andre sier dem helt eksplisitt.",
    "Når kolleger må kompensere for at du ikke følger opp.": "Når du lar kolleger kompensere fordi du ikke følger opp.",
    "Når konflikt unngås til den blir personlig eller fastlåst.": "Når du unngår konflikten til den blir personlig eller fastlåst.",
    "Når idéarbeid begrenses av hva som allerede virker realistisk.": "Når du avgrenser idéarbeidet til det som allerede virker realistisk.",
    "Når idéproduksjon fortsetter etter at situasjonen krever valg.": "Når du fortsetter idéarbeidet etter at situasjonen krever et valg.",
    "Når tegn på frakobling først håndteres når prestasjonen faller.": "Når du venter med å håndtere frakobling til prestasjonen faller.",
    "Når engasjement forveksles med trivsel eller konstant entusiasme.": "Når du forveksler engasjement med trivsel eller konstant entusiasme.",
    "Når sikkerhet signaliseres sterkere enn kunnskapsgrunnlaget tilsier.": "Når du fremstår sikrere enn kunnskapsgrunnlaget tilsier.",
    "Når ros ikke sier hva som faktisk bør gjentas.": "Når du roser uten å si hva den andre bør gjenta.",
    "Når små avvik korrigeres uten hensyn til betydning.": "Når du korrigerer små avvik uten å vurdere betydningen.",
    "Når transparens blir deling av informasjon som bør beskyttes.": "Når du deler informasjon som åpenhet, selv om den bør beskyttes.",
    "Når uklart eierskap gjør at saker blir stående.": "Når du lar saker bli stående uten en tydelig beslutningseier.",
    "Når forskjeller tolereres, men ikke brukes som ressurs.": "Når du tolererer forskjeller uten å bruke dem som ressurs.",
    "Når tilbakemeldinger blir sjeldne, generelle eller kun gis ved problemer.": "Når du gir sjeldne eller generelle tilbakemeldinger, eller bare sier fra ved problemer.",
    "Når problemer løftes uten forslag til neste handling.": "Når du løfter problemer uten å foreslå neste handling.",
    "Når organisasjonen forbedrer eksisterende praksis, men sjelden tester nye modeller.": "Når du bare forbedrer eksisterende praksis og sjelden tester nye modeller.",
    "Når læring fra eksperimenter ikke påvirker videre investering.": "Når du lar læring fra eksperimenter stå uten konsekvens for videre investering.",
    "Når ledelsen ber om én kultur, men belønner en annen.": "Når du ber om én kultur, men belønner en annen.",
    "Når ønsket om konsistens undertrykker nødvendig lokal variasjon.": "Når du krever så mye konsistens at nødvendig lokal variasjon forsvinner.",
    "Når formålet finnes i kommunikasjon, men sjelden påvirker valg.": "Når du kommuniserer formålet uten å bruke det i faktiske valg.",
    "Når medarbeidere kjenner målene, men ikke hvorfor arbeidet betyr noe.": "Når du forklarer mål uten å vise hvorfor arbeidet betyr noe.",
    "Når viktige interessenter involveres for sent.": "Når du involverer viktige interessenter for sent.",
    "Når jakten på rotårsak forsinker nødvendig skadebegrensning.": "Når du leter etter rotårsaken så lenge at nødvendig skadebegrensning forsinkes.",
    "Når viktige forbindelser forsømmes mellom leveranser.": "Når du forsømmer viktige forbindelser mellom leveranser.",
    "Når relasjonsarbeid tar plass fra nødvendige beslutninger eller prestasjonskrav.": "Når du bruker så mye tid på relasjoner at nødvendige beslutninger eller prestasjonskrav skyves ut.",
    "Når tilbakeslag generaliseres til hva du eller andre er i stand til.": "Når du tolker ett tilbakeslag som et mål på hva du eller andre kan.",
    "Når tilgjengelige nettverk eller eksisterende løsninger ikke utnyttes.": "Når du overser tilgjengelige nettverk eller eksisterende løsninger.",
    "Når nedsiden bæres av andre uten at den er forstått.": "Når du tar risiko der andre bærer nedsiden uten å forstå den.",
    "Når innsikt ikke omsettes i øvelse.": "Når du får innsikt uten å omsette den i øvelse.",
    "Når enheter optimaliserer egne mål på bekostning av helheten.": "Når du lar enheter optimalisere egne mål på bekostning av helheten.",
    "Når initiativer mangler eierskap, ressurser eller målbar fremdrift.": "Når du starter initiativer uten tydelig eierskap, ressurser eller målbar fremdrift.",
    "Når lokale løsninger flytter problemet til en annen del av systemet.": "Når du velger lokale løsninger som flytter problemet til en annen del av systemet.",
    "Når rekruttering starter med CV-profiler fremfor rollebehov.": "Når du starter rekrutteringen med CV-profiler fremfor rollebehov.",
    "Når teamet fungerer som en samling individuelle leverandører.": "Når du leder teamet som en samling individuelle leverandører.",
    "Når teamprosesser tar mer tid enn oppgaven krever.": "Når du bruker mer tid på teamprosesser enn oppgaven krever.",
    "Når hver ledige flate fylles og ingen buffer finnes.": "Når du fyller alle ledige flater og ikke lar noen buffer stå igjen.",
    "Når analyse eller involvering fortsetter etter at beslutningsgrunnlaget er godt nok.": "Når du fortsetter å analysere eller involvere etter at beslutningsgrunnlaget er godt nok.",
    "Når teamet kjenner mål, men ikke hvilken fremtid dere forsøker å bygge.": "Når du formidler mål uten å beskrive hvilken fremtid dere forsøker å bygge.",
    "Når teamet venter på deg for koordinering, problemløsning eller godkjenning.": "Når du lar teamet vente på deg for koordinering, problemløsning eller godkjenning.",
    "Når global orientering gjør at hjemmemarkedets realiteter undervurderes.": "Når du retter så mye oppmerksomhet globalt at hjemmemarkedets realiteter undervurderes.",
    "Når kultur omtales som verdier, men ikke kobles til hverdagsatferd.": "Når du omtaler kultur som verdier uten å koble dem til hverdagsatferd.",
    "Når systemanalyse blir så omfattende at ingen handling tas.": "Når du analyserer systemet så omfattende at ingen handler.",
    "Når relasjonelle problemer individualiseres i stedet for å behandles som teammønstre.": "Når du behandler relasjonelle problemer som individproblemer fremfor teammønstre.",
    "Når kalenderen primært styres av andres forespørsler.": "Når du lar andres forespørsler styre kalenderen.",
    "Når viktige, ikke-hastende oppgaver stadig skyves.": "Når du stadig skyver viktige oppgaver som ikke haster.",
    "Når effektivitet gjør at relasjonelle eller kreative behov behandles som forstyrrelser.": "Når du behandler relasjonelle eller kreative behov som forstyrrelser i effektivitetens navn.",
    "Når fremtidsbildet er så generelt at det ikke skaper valg.": "Når du beskriver et så generelt fremtidsbilde at det ikke skaper valg.",
    "Når kortsiktige beslutninger ikke kan kobles til retningen.": "Når du ikke kobler kortsiktige beslutninger til retningen.",
    "Når du optimaliserer egen enhet uten å håndtere avhengigheter.": "Når du prioriterer egen enhet uten å håndtere avhengigheter.",
    "Når vekstmuligheter forfølges uten strategisk fit eller lønnsomhet.": "Når du forfølger vekstmuligheter uten strategisk samsvar eller lønnsomhet.",
    "Når tempo prioriteres foran reell adopsjon.": "Når du prioriterer tempo foran at ny praksis faktisk tas i bruk.",
    "Når ideer blir i workshop- eller konseptfasen.": "Når du lar ideer bli værende i idé- eller konseptfasen.",
    "Når lovende konsepter skaleres før de viktigste antakelsene er validert.": "Når du skalerer lovende konsepter før de viktigste antakelsene er testet.",
    "Når tilpasning blir strategisk spill eller people-pleasing.": "Når du tilpasser deg så mye at det blir strategisk spill eller overtilpasning.",
    "Når du optimaliserer avtalen så hardt at gjennomføring eller relasjon blir svak.": "Når du presser avtalen så hardt at gjennomføringen eller relasjonen blir svak.",
    "Når enheter optimaliserer egne mål på bekostning av helheten.": "Når du lar enheter prioritere egne mål på bekostning av helheten.",
    "Når potensial overvurderes på bekostning av dokumentert prestasjon og rollefit.": "Når du overvurderer potensial på bekostning av dokumentert prestasjon og kravene i rollen.",
    "Når avstand fører til informasjonsasymmetri eller svakere relasjoner.": "Når du lar avstand gi ulik tilgang til informasjon eller svekke relasjoner.",
    "Når du løser systemiske kapasitetsproblemer med stadig mer personlig innsats.": "Når du løser kapasitetsproblemer i systemet med stadig mer personlig innsats.",
    "Når du undervurderer hvordan nonverbal atferd og form påvirker tillit.": "Når du undervurderer hvordan tone, kroppsspråk og form påvirker tillit.",
}

MANUAL_BARRIERS = {
    "Jeg forelsker meg i løsningen før behovet er validert.": "Du forelsker deg i løsningen før behovet er testet.",
    "Jeg skaper ikke tydelig nok deadline eller eier.": "Du avklarer ikke frist eller eier tydelig nok.",
    "Jeg søker én rotårsak i problemer som egentlig er systemiske.": "Du søker én rotårsak i problemer som egentlig skapes av flere forhold.",
    "Jeg formulerer mening abstrakt.": "Du formulerer mening med for abstrakte ord.",
    "Jeg unngår eksplisitte bortvalg.": "Du unngår å si tydelig hva som skal velges bort.",
    "Jeg undervurderer hvor avhengig vi er av andre.": "Du undervurderer hvor avhengig egen enhet er av andre.",
    "Du undervurderer hva medarbeiderne dine faktisk kan håndtere.": "Du har for lite innsikt i hva medarbeiderne dine er klare for å eie.",
}

MANUAL_SUCCESS = {
    "Kobler muligheter til strategiske kapabiliteter og økonomisk logikk.": "Når du kobler muligheter til virksomhetens evne til å levere og skape lønnsomhet.",
    "Modellerer endringen og mobiliserer troverdige støttespillere.": "Når du viser endringen gjennom egne valg og mobiliserer troverdige støttespillere.",
    "Regulerer temperaturen uten å fjerne den reelle uenigheten.": "Når du roer ned samspillet uten å fjerne den reelle uenigheten.",
    "Tilpasser synlighet og autoritet uten å miste autentisitet.": "Når du tilpasser synlighet og autoritet uten å virke påtatt.",
    "Ser globale avhengigheter, asymmetrier og andreordenseffekter.": "Når du ser globale avhengigheter, skjevheter og ringvirkninger.",
    "Etablerer eksplisitte normer for kommunikasjon, beslutning og tilgjengelighet.": "Når du etablerer tydelige spilleregler for kommunikasjon, beslutninger og tilgjengelighet.",
    "Observerer verbal og nonverbal respons uten å trekke forhastede konklusjoner.": "Når du observerer ord, tone og kroppsspråk uten å trekke forhastede konklusjoner.",
    "Oversetter ønsket kultur til konkret, situert atferd.": "Når du oversetter ønsket kultur til konkret atferd i hverdagen.",
    "Vurderer oppside, nedside, reversibilitet og kostnaden ved passivitet.": "Når du vurderer mulig gevinst, tap, om valget kan gjøres om og kostnaden ved å vente.",
    "Gjør antakelser og risikoreduserende tiltak eksplisitte.": "Når du gjør antakelser og tiltak som reduserer risiko tydelige.",
    "Tester initiativer og ressursbruk mot eksplisitte strategiske valg.": "Når du tester initiativer og ressursbruk mot tydelige strategiske valg.",
    "Avklarer kritiske avhengigheter og felles styringssignaler.": "Når du avklarer kritiske avhengigheter og felles prioriteringer.",
    "Kartlegger aktører, insentiver, strømmer og gjensidige påvirkninger.": "Når du kartlegger aktører, insentiver, avhengigheter og hvordan de påvirker hverandre.",
    "Undersøker andreordenseffekter og tidsforsinkelser.": "Når du undersøker ringvirkninger og forsinkede effekter.",
    "Håndterer målkonflikter eksplisitt fremfor å late som alle kan maksimeres.": "Når du gjør målkonflikter tydelige fremfor å late som alt kan maksimeres.",
    "Definerer fremtidige kapabilitetsbehov før profil og kandidat.": "Når du avklarer hvilke kompetanser virksomheten trenger før du definerer profil og kandidat.",
    "Vurderer potensial, komplementaritet og dokumentert erfaring strukturert.": "Når du vurderer potensial, dokumentert erfaring og hva kandidaten tilfører teamet.",
    "Bruker utvikling, ledelseskvalitet og arbeidsvilkår aktivt i retensjon.": "Når du bruker utvikling, ledelseskvalitet og arbeidsvilkår aktivt for å beholde talent.",
    "Gjør roller, avhengigheter og grensesnitt tydelige.": "Når du gjør roller, avhengigheter og samarbeidsflater tydelige.",
    "Planlegger høyt verdsatt arbeid før kalenderen fylles.": "Når du planlegger arbeidet med størst verdi før kalenderen fylles.",
    "Samler, forkorter, delegerer eller fjerner lavverdiaktivitet.": "Når du samler, forkorter, delegerer eller fjerner aktiviteter med lav verdi.",
    "Tar reversible steg mens kritisk usikkerhet overvåkes.": "Når du tar steg som kan gjøres om, mens du følger med på kritisk usikkerhet.",
    "Gir handlingsrom gradert etter risiko og følger opp uten skjult kontroll.": "Når du tilpasser handlingsrom og oppfølging til risikoen uten skjult kontroll.",
    "Skiller reell tidskritikalitet fra opplevd travelhet.": "Når du skiller det som faktisk haster fra opplevd travelhet.",
    "Avklarer neste steg, eier og kort beslutningshorisont.": "Når du avklarer neste steg, eier og en nær frist for beslutningen.",
    "Sørger for kapasitet, grensesnitt og tydelige eskaleringspunkter.": "Når du sørger for kapasitet, tydelige samarbeidsflater og avklarte eskaleringspunkter.",
    "Tester om løsningen adresserer årsak og mulige bivirkninger.": "Når du tester om løsningen treffer årsaken og unngår uønskede følger.",
}

MANUAL_DEFINITIONS = {
    "tydelig-ledertilstedevaerelse": "Formidler ro, klarhet, tilgjengelighet og troverdighet gjennom ord, tone og kroppsspråk når lederrollen er særlig synlig.",
    "problemlosning": "Definerer problemer presist, undersøker årsaker og utvikler løsninger som treffer mer enn de synlige symptomene.",
    "strategisk-retning": "Sørger for at mål, prioriteringer, ressurser, oppfølging og avhengigheter trekker i samme strategiske retning.",
}

MANUAL_DISTINCTIONS = {
    "eksterne-partnerskap": "Velg Relasjonsledelse for relasjoner generelt. Eksterne partnerskap krever i tillegg tydelig styring av verdi, risiko, samarbeidsflater og organisatoriske interesser.",
    "globalt-perspektiv": "Velg Lede globale og distribuerte team når utviklingsbehovet gjelder den daglige ledelsen av et geografisk og kulturelt distribuert team.",
    "lede-globale-distribuerte-team": "Velg Teamledelse for teamdynamikk generelt. Denne kompetansen legger særlig vekt på avstand, ulikhet i makt og tilgang på informasjon, lokal kontekst og virtuelle arbeidsformer.",
}

MANUAL_PRACTICE = {
    "tydelig-ledertilstedevaerelse": {
        "experiment": "Film én viktig presentasjon og be to personer gi konkret tilbakemelding på ro, klarhet og kontakt – ikke stilpreferanse.",
        "effect": "Budskapet gjengis korrekt, og tilbakemeldingen viser mer trygghet uten at du virker mindre naturlig.",
    },
}


def clean_sentence(value: str) -> str:
    text = re.sub(r"\s+", " ", value.strip().lstrip("•").strip())
    if not text:
        return ""
    return text if text.endswith((".", "?", "!")) else f"{text}."


def lower_first(value: str) -> str:
    return value[:1].lower() + value[1:] if value else value


def success_sentence(value: str) -> str:
    text = clean_sentence(value)
    if text in MANUAL_SUCCESS:
        return MANUAL_SUCCESS[text]
    if text.startswith("Når du "):
        return text
    return f"Når du {lower_first(text)}"


def when_du_sentence(value: str) -> tuple[str, bool]:
    text = clean_sentence(value)
    if text in MANUAL_WHEN_DU:
        return MANUAL_WHEN_DU[text], False
    if text.startswith("Når du "):
        return text, False
    clause = re.sub(r"^Når\s+", "", text)
    clause = clause[:-1] if clause.endswith(".") else clause

    for passive, active in PASSIVE_VERBS.items():
        match = re.match(rf"^(.+?)\s+{re.escape(passive)}(?:\s+(.*))?$", clause, re.IGNORECASE)
        if match:
            subject, rest = match.group(1), match.group(2) or ""
            suffix = f" {rest}" if rest else ""
            return clean_sentence(f"Når du {active} {lower_first(subject)}{suffix}"), False

    for finite, infinitive in CAUSAL_VERBS.items():
        match = re.match(rf"^(.+?)\s+{re.escape(finite)}(?:\s+(.*))?$", clause, re.IGNORECASE)
        if match:
            subject, rest = match.group(1), match.group(2) or ""
            suffix = f" {rest}" if rest else ""
            return clean_sentence(f"Når du lar {lower_first(subject)} {infinitive}{suffix}"), False

    return clean_sentence(f"Når du bruker kompetansen slik at {lower_first(clause)}"), True


def barrier_sentence(value: str) -> str:
    text = clean_sentence(value)
    if text in MANUAL_BARRIERS:
        return MANUAL_BARRIERS[text]
    replacements = {
        r"\bJeg\b": "Du",
        r"\bjeg\b": "du",
        r"\bmeg\b": "deg",
        r"\bmin\b": "din",
        r"\bmitt\b": "ditt",
        r"\bmine\b": "dine",
    }
    for pattern, replacement in replacements.items():
        text = re.sub(pattern, replacement, text)
    return text


def parse_docx(path: Path) -> dict[str, dict]:
    result: dict[str, dict] = {}
    current: dict | None = None
    section: str | None = None
    paragraphs = Document(path).paragraphs
    for paragraph in paragraphs:
        text = paragraph.text.strip()
        if paragraph.style.name == "Heading 1" and len(text) > 3 and text[:2].isdigit():
            current = {
                "source_title": re.sub(r"^\d{2}\.\s*", "", text),
                "title_en": "",
                "success": [],
                "underuse": [],
                "overuse": [],
                "barriers": [],
            }
            section = None
            continue
        if current is None:
            continue
        if not current["title_en"] and text and paragraph.style.name == "Normal":
            current["title_en"] = text
            result[text] = current
            continue
        if paragraph.style.name == "Heading 2":
            section = SECTION_KEYS.get(text)
            continue
        if section and (text.startswith("•") or paragraph.style.name.startswith("List Bullet")):
            current[section].append(clean_sentence(text))
    return result


def load_current(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))


def compile_content(current_rows: list[dict], qa: dict[str, dict]) -> list[dict]:
    compiled = []
    fallback_lines = []
    for row in current_rows:
        source = qa.get(row["title_en"])
        if not source:
            raise ValueError(f"DOCX has no section matching {row['title_en']}")
        current = row["content_json"]
        current_best = current.get("best_practice", {})
        success_source = source["success"] if row["slug"] == "delegering" else current_best.get("success", [])
        success = [success_sentence(item) for item in success_source]
        underuse = []
        overuse = []
        for key, target in (("underuse", underuse), ("overuse", overuse)):
            for item in source[key]:
                transformed, fallback = when_du_sentence(item)
                target.append(transformed)
                if fallback:
                    fallback_lines.append(f"{row['slug']} | {key} | {item} -> {transformed}")
        barriers = [barrier_sentence(item) for item in source["barriers"]]
        compiled.append({
            "slug": row["slug"],
            "category": row["category"],
            "name_no": row["title_no"],
            "name_en": row["title_en"],
            "definition": MANUAL_DEFINITIONS.get(row["slug"], row["summary"]),
            "relevant_when": current.get("relevant_when") or current.get("choose_when") or "",
            "distinction": MANUAL_DISTINCTIONS.get(row["slug"], current.get("distinction") or ""),
            "best_practice": {
                "success": success,
                "underuse": underuse,
                "overuse": overuse,
            },
            "barriers": barriers,
            "practice": MANUAL_PRACTICE.get(row["slug"], current.get("practice") or {
                "experiment": current.get("experiment", ""),
                "effect": current.get("evidence", ""),
            }),
            "reflection": current.get("reflection") or [],
        })
    if fallback_lines:
        print("\n".join(fallback_lines), file=sys.stderr)
    return compiled


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--docx", type=Path, required=True)
    parser.add_argument("--current-json", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    content = compile_content(load_current(args.current_json), parse_docx(args.docx))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(content)} competencies to {args.output}")


if __name__ == "__main__":
    main()
