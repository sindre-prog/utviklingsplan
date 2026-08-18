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

if (/Samtalegrunnlag|sessionConversationReview/.test(app)) errors.push("Den overflødige toppseksjonen for samtalegrunnlag er fortsatt med.");
requireText(app, /function createActionFromSessionNextStep[\s\S]*primaryCompetency[\s\S]*createAction\(data, "", primaryCompetency\?\.id/, "Eksperiment fra samtale forhåndsvelger ikke Hovedfokus.");

requireText(app, /from\("session_actions"\)\.insert\(\{[\s\S]*session_id:[\s\S]*development_area_id:[\s\S]*program_competency_id:/, "Felles eksperimentopprettelse mangler en eller flere tillatte koblinger.");
requireText(app, /function focusViewTabs[\s\S]*\["competencies", "(?:Lederkompetanser|Kompetanser)"[\s\S]*\["assignments", "Fokusoppdrag"[\s\S]*\["experiments", "Eksperimenter"/, "Fokus mangler én samlet navigasjon for lederkompetanser, fokusoppdrag og eksperimenter.");
requireText(app, /function experimentReviewSpec[\s\S]*el\("details", \{ class: "experiment-review-details"[\s\S]*"Se tilbake og lær"/, "Eksperimentrefleksjonen vises ikke progressivt etter opprettelse.");
requireText(app, /function createAction\([\s\S]*Hva skal du prøve\?[\s\S]*Hvor skal du prøve det\?[\s\S]*Hva skal du se etter\?[\s\S]*Når vil du se tilbake\?[\s\S]*experimentContextSpec/, "Felles eksperimentopprettelse følger ikke den avtalte, lette rekkefølgen.");
requireText(app, /function focusViewDescription[\s\S]*Lederkompetanser er måter å lede på[\s\S]*Fokusoppdrag er konkrete prosjekter[\s\S]*Eksperimenter er små atferdsforsøk/, "Fokusbegrepene mangler korte forklaringer.");
requireText(app, /function projectTypeLabel[\s\S]*"Tidligere fokusområde"/, "Legacy-fokusområder mangler et tydelig, ikke-konverterende navn.");
requireText(app, /function directionWorkspace[\s\S]*"Retningen er klar til bruk"/, "Retning viser ikke planstatus uten utviklingsprosent.");
requireText(app, /function leadershipPlanStatus[\s\S]*item\.why_now[\s\S]*item\.desired_behavior[\s\S]*item\.current_pattern[\s\S]*item\.obstacles[\s\S]*completed === planFields\.length/, "Kompetanseplanen kan bli klar uten alle fire delene i utviklingshypotesen.");
if (/direction-progress-track[\s\S]*role: "progressbar"/.test(app)) errors.push("Retning fremstilles fortsatt som prosentvis utviklingsprogresjon.");
if (/function experimentHubLink/.test(app)) errors.push("Eksperimenter ligger fortsatt som en separat verktøylenke fremfor en felles arbeidsflate.");
requireText(app, /from\("client_reflections"\)\.insert\(\{[\s\S]*development_area_id:[\s\S]*program_competency_id:/, "Refleksjoner kan ikke kobles til både Fokusoppdrag og kompetanse.");
if (/from\("(?:competency_experiments|focus_experiments|conversation_experiments)"\)/.test(app)) {
  errors.push("Det finnes en parallell eksperimentstruktur i klientkoden.");
}
requireText(reflectionIntegrity, /foreign key \(program_competency_id, program_id\)[\s\S]*references public\.program_competencies\(id, program_id\)[\s\S]*not valid/, "Refleksjon og kompetanse er ikke avgrenset til samme program.");
requireText(reflectionIntegrity, /foreign key \(development_area_id, program_id\)[\s\S]*references public\.development_areas\(id, program_id\)[\s\S]*not valid/, "Refleksjon og Fokusoppdrag er ikke avgrenset til samme program.");

requireText(css, /\.reflection-link-grid[\s\S]*grid-template-columns: repeat\(2,[\s\S]*@media \(max-width: 700px\)[\s\S]*\.reflection-link-grid[\s\S]*grid-template-columns: minmax\(0, 1fr\)/, "Refleksjonskoblinger mangler eksplisitt desktop-/mobiltilpasning.");
requireText(css, /\.focus-view-tabs[\s\S]*grid-template-columns: repeat\(3,[\s\S]*@media \(max-width: 700px\)[\s\S]*\.focus-view-tabs[\s\S]*repeat\(3,/, "De tre fokusarbeidsflatene er ikke eksplisitt tilpasset desktop og mobil.");
requireText(css, /\.client-resource-workbench\.has-selection \.client-resource-rail[\s\S]*display: none[\s\S]*\.client-resource-workbench\.has-selection \.client-resource-detail[\s\S]*display: block/, "Ressursene mangler en eksplisitt liste–detalj-flyt på mobil.");
requireText(css, /\.experiment-review-details[\s\S]*\.experiment-review-fields/, "Progressiv eksperimentrefleksjon mangler visuell kontrakt.");

if (/Ressursmodulen mangler|Supabase er ikke koblet|Sjekker mot Supabase|radnivåpolicy/.test(app)) {
  errors.push("Brukerflaten inneholder fortsatt teknisk pilot- eller plattformtekst.");
}

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

console.log("Godkjent: innholdsoverskrifter, personvernfilter, felles eksperimentkoblinger, forenklet samtaleflyt og responsive grenser.");
