#!/usr/bin/env node

import fs from "node:fs";

const app = fs.readFileSync("app.js", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const reflectionIntegrity = fs.readFileSync("supabase/migrations/20260818123000_reflection_competency_link_integrity.sql", "utf8");
const errors = [];

function requireText(source, pattern, message) {
  if (!pattern.test(source)) errors.push(message);
}

requireText(app, /list\("Når lykkes du\?"[\s\S]*list\("Når du bruker kompetansen for lite"[\s\S]*list\("Når du bruker kompetansen for mye eller i feil situasjon"[\s\S]*list\("Hva kan stå i veien\?"/, "Kompetansearbeidsflaten mangler avtalte innholdsoverskrifter.");
requireText(app, /el\("strong", \{ text: "Se mer" \}\)/, "Progressiv inngang skal hete «Se mer».");
requireText(app, /function competencyNameNodes[\s\S]*el\("strong", \{ text: part \}\)/, "Nærliggende kompetansenavn fremheves ikke sikkert som tekstnoder.");
requireText(app, /Kompetanserammen tar utgangspunkt i CCL Compass\.[\s\S]*ikke et psykometrisk verktøy/, "Nøktern kilde- og bruksnote mangler.");

requireText(app, /function sessionConversationReview[\s\S]*reflection\.visibility === "shared_with_coach"/, "Samtalegrunnlaget filtrerer ikke eksplisitt på delte refleksjoner.");
requireText(app, /function sessionConversationReview[\s\S]*programCompetencies[\s\S]*priority/, "Samtalegrunnlaget viser ikke prioriterte, aktive kompetanser.");
requireText(app, /function createActionFromSessionNextStep[\s\S]*primaryCompetency[\s\S]*createAction\(data, "", primaryCompetency\?\.id/, "Eksperiment fra samtale forhåndsvelger ikke Hovedfokus.");

requireText(app, /from\("session_actions"\)\.insert\(\{[\s\S]*session_id:[\s\S]*development_area_id:[\s\S]*program_competency_id:/, "Felles eksperimentopprettelse mangler en eller flere tillatte koblinger.");
requireText(app, /function focusViewTabs[\s\S]*\["competencies", "Lederkompetanser"[\s\S]*\["assignments", "Fokusoppdrag"[\s\S]*\["experiments", "Eksperimenter"/, "Fokus mangler én samlet navigasjon for lederkompetanser, fokusoppdrag og eksperimenter.");
requireText(app, /function experimentReviewSpec[\s\S]*el\("details", \{ class: "experiment-review-details"[\s\S]*"Se tilbake og lær"/, "Eksperimentrefleksjonen vises ikke progressivt etter opprettelse.");
requireText(app, /function projectTypeLabel[\s\S]*"Tidligere fokusområde"/, "Legacy-fokusområder mangler et tydelig, ikke-konverterende navn.");
requireText(app, /function directionWorkspace[\s\S]*"Klar til bruk"[\s\S]*"Retningen er tydelig nok til å brukes"/, "Retning viser ikke planstatus uten utviklingsprosent.");
requireText(app, /function leadershipPlanStatus[\s\S]*item\.why_now[\s\S]*item\.desired_behavior[\s\S]*item\.current_pattern[\s\S]*item\.obstacles[\s\S]*completed === planFields\.length/, "Kompetanseplanen kan bli klar uten alle fire delene i utviklingshypotesen.");
if (/direction-progress-track[\s\S]*role: "progressbar"/.test(app)) errors.push("Retning fremstilles fortsatt som prosentvis utviklingsprogresjon.");
if (/function experimentHubLink/.test(app)) errors.push("Eksperimenter ligger fortsatt som en separat verktøylenke fremfor en felles arbeidsflate.");
requireText(app, /from\("client_reflections"\)\.insert\(\{[\s\S]*development_area_id:[\s\S]*program_competency_id:/, "Refleksjoner kan ikke kobles til både Fokusoppdrag og kompetanse.");
if (/from\("(?:competency_experiments|focus_experiments|conversation_experiments)"\)/.test(app)) {
  errors.push("Det finnes en parallell eksperimentstruktur i klientkoden.");
}
requireText(reflectionIntegrity, /foreign key \(program_competency_id, program_id\)[\s\S]*references public\.program_competencies\(id, program_id\)[\s\S]*not valid/, "Refleksjon og kompetanse er ikke avgrenset til samme program.");
requireText(reflectionIntegrity, /foreign key \(development_area_id, program_id\)[\s\S]*references public\.development_areas\(id, program_id\)[\s\S]*not valid/, "Refleksjon og Fokusoppdrag er ikke avgrenset til samme program.");

requireText(css, /\.conversation-review-grid[\s\S]*grid-template-columns: repeat\(2,[\s\S]*@media \(max-width: 700px\)[\s\S]*\.conversation-review-grid,[\s\S]*grid-template-columns: minmax\(0, 1fr\)/, "Samtalegrunnlaget mangler eksplisitt desktop-/mobiltilpasning.");
requireText(css, /\.reflection-link-grid[\s\S]*grid-template-columns: repeat\(2,[\s\S]*@media \(max-width: 700px\)[\s\S]*\.reflection-link-grid[\s\S]*grid-template-columns: minmax\(0, 1fr\)/, "Refleksjonskoblinger mangler eksplisitt desktop-/mobiltilpasning.");
requireText(css, /\.focus-view-tabs[\s\S]*grid-template-columns: repeat\(3,[\s\S]*@media \(max-width: 700px\)[\s\S]*\.focus-view-tabs[\s\S]*display: flex[\s\S]*overflow-x: auto/, "De tre fokusarbeidsflatene er ikke eksplisitt tilpasset desktop og mobil.");
requireText(css, /\.client-resource-workbench\.has-selection \.client-resource-rail[\s\S]*display: none[\s\S]*\.client-resource-workbench\.has-selection \.client-resource-detail[\s\S]*display: block/, "Ressursene mangler en eksplisitt liste–detalj-flyt på mobil.");
requireText(css, /\.experiment-review-details[\s\S]*\.experiment-review-fields/, "Progressiv eksperimentrefleksjon mangler visuell kontrakt.");

if (/Ressursmodulen mangler|Supabase er ikke koblet|Sjekker mot Supabase|radnivåpolicy/.test(app)) {
  errors.push("Brukerflaten inneholder fortsatt teknisk pilot- eller plattformtekst.");
}

requireText(app, /pageIntro\("Retning", "Hva skal utviklingen føre til\?", "Sett retning for utviklingen og gjør ønsket effekt tydelig\."\)/, "Retning bruker ikke låst hovedtekst.");
requireText(app, /workspaceIntro\("Fokus", "Hva skal du utvikle\?", "Velg lederkompetanser og fokusoppdrag, og prøv ny atferd i praksis\."/, "Fokus bruker ikke låst hovedtekst.");
requireText(app, /workspaceIntro\("Samtaler", "Forbered og følg opp", "Samle det viktigste før, under og etter samtalene\."/, "Samtaler bruker ikke låst hovedtekst.");
requireText(app, /workspaceIntro\("Refleksjon", "Refleksjoner underveis", "Ta vare på observasjoner og læring\. Du bestemmer hva du deler\."\)/, "Refleksjon bruker ikke låst hovedtekst.");
requireText(app, /workspaceIntro\("Ressurser", "Dine ressurser", "Ressurser coachen har valgt ut for utviklingen din\."\)/, "Ressurser bruker ikke låst hovedtekst.");
requireText(app, /function reflectionComposerLauncher[\s\S]*"Skriv en refleksjon"/, "Refleksjonsflaten åpner ikke med en lett, progressiv inngang.");

const versionPatterns = [
  /styles\.css\?v=polish-(\d+)/,
  /app\.js\?v=polish-(\d+)/,
  /leadership\.api\.js\?v=polish-(\d+)/
];
const versions = versionPatterns.map((pattern) => `${index}\n${app}`.match(pattern)?.[1]).filter(Boolean);
if (versions.length !== versionPatterns.length || new Set(versions).size !== 1) errors.push(`Ulike cache-versjoner for kompetanseflaten: ${[...new Set(versions)].join(", ") || "ingen"}.`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Godkjent: innholdsoverskrifter, personvernfilter, felles eksperimentkoblinger, samtaleintegrasjon og responsive grenser.");
