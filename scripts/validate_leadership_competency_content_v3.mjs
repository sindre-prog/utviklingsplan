#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const sourcePath = path.resolve(process.argv[2] || "content/leadership_competencies_v3.json");
const competencies = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const errors = [];
const bannedUiWords = /\b(?:adopsjon|andreordenseffekter|asymmetri|beslutningshorisont|deadline|kapabilitet(?:er|sbehov)?|komplementaritet|nonverbal|people-pleasing|retensjon|reversibilitet|rollefit|situert|styringssignaler?|systemisk(?:e)?|tidskritikalitet|validert|workshop)\b/i;

function fail(slug, message) {
  errors.push(`${slug}: ${message}`);
}

function words(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function normalized(value) {
  return String(value || "").toLocaleLowerCase("nb-NO").replace(/[^a-zæøå0-9]+/g, " ").trim();
}

function meaningTokens(value) {
  const stopWords = new Set(["når", "du", "deg", "din", "ditt", "dine", "den", "det", "de", "en", "et", "og", "eller", "som", "for", "til", "av", "på", "i", "med", "uten", "at", "blir", "lar"]);
  return new Set(normalized(value).split(" ").filter((token) => token.length > 2 && !stopWords.has(token)));
}

function overlap(left, right) {
  const leftTokens = meaningTokens(left);
  const rightTokens = meaningTokens(right);
  const shared = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const total = new Set([...leftTokens, ...rightTokens]).size;
  return { shared, ratio: total ? shared / total : 0 };
}

function validateBullets(slug, label, values, prefix, { min = 3, max = 10 } = {}) {
  if (!Array.isArray(values)) {
    fail(slug, `${label} må være en array`);
    return;
  }
  if (values.length < min || values.length > max) {
    fail(slug, `${label} må ha ${min}–${max} faglig nødvendige punkter, fikk ${values.length}`);
  }
  const seen = new Set();
  for (const [index, value] of values.entries()) {
    if (typeof value !== "string" || !value.trim()) {
      fail(slug, `${label}[${index}] er tomt eller ikke tekst`);
      continue;
    }
    if (!value.startsWith(prefix)) fail(slug, `${label}[${index}] må begynne med «${prefix.trim()}»`);
    if (!/[.!?]$/.test(value)) fail(slug, `${label}[${index}] mangler slutttegn`);
    if (value.includes(";")) fail(slug, `${label}[${index}] rommer sannsynligvis mer enn ett poeng`);
    if (words(value) < 5 || words(value) > 24) fail(slug, `${label}[${index}] har ${words(value)} ord; forventet 5–24`);
    if (bannedUiWords.test(value)) fail(slug, `${label}[${index}] inneholder unødvendig fagspråk`);
    if (/Når du bruker kompetansen slik at/i.test(value)) fail(slug, `${label}[${index}] bruker en generisk reserveformulering`);
    const key = normalized(value);
    if (seen.has(key)) fail(slug, `${label}[${index}] dupliserer et annet punkt i seksjonen`);
    seen.add(key);
  }
}

if (!Array.isArray(competencies)) throw new TypeError("Innholdskilden må være en array.");
if (competencies.length !== 52) fail("bibliotek", `forventet 52 kompetanser, fikk ${competencies.length}`);

const slugs = new Set();
const sectionLengths = new Set();
for (const competency of competencies) {
  const slug = competency?.slug || "ukjent";
  if (slugs.has(slug)) fail(slug, "duplisert slug");
  slugs.add(slug);
  for (const field of ["category", "name_no", "name_en", "definition", "relevant_when", "distinction"]) {
    if (typeof competency?.[field] !== "string" || !competency[field].trim()) fail(slug, `${field} mangler`);
  }
  if (bannedUiWords.test(competency.definition)) fail(slug, "definition inneholder unødvendig fagspråk");
  const best = competency.best_practice || {};
  validateBullets(slug, "success", best.success, "Når du ");
  validateBullets(slug, "underuse", best.underuse, "Når du ");
  validateBullets(slug, "overuse", best.overuse, "Når du ");
  validateBullets(slug, "barriers", competency.barriers, "Du ");
  const behaviorSections = [
    ["success", best.success || []],
    ["underuse", best.underuse || []],
    ["overuse", best.overuse || []],
    ["barriers", competency.barriers || []]
  ];
  const behaviorPoints = behaviorSections.flatMap(([label, values]) => values.map((value) => ({ label, value })));
  for (let leftIndex = 0; leftIndex < behaviorPoints.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < behaviorPoints.length; rightIndex += 1) {
      const left = behaviorPoints[leftIndex];
      const right = behaviorPoints[rightIndex];
      const similarity = overlap(left.value, right.value);
      if (normalized(left.value) === normalized(right.value) || (similarity.shared >= 5 && similarity.ratio >= 0.8)) {
        fail(slug, `${left.label} og ${right.label} overlapper for mye: «${left.value}» / «${right.value}»`);
      }
    }
  }
  for (const [index, value] of (competency.barriers || []).entries()) {
    if (/\b(?:jeg|meg|min|mitt|mine|vi|oss|vår|vårt|våre)\b/i.test(value)) {
      fail(slug, `barriers[${index}] skal skrives konsekvent til lederen med «du»`);
    }
  }
  sectionLengths.add(`${best.success?.length}/${best.underuse?.length}/${best.overuse?.length}/${competency.barriers?.length}`);
  if (!competency.practice || !String(competency.practice.experiment || "").trim() || !String(competency.practice.effect || "").trim()) {
    fail(slug, "practice.experiment og practice.effect må være utfylt");
  }
  if (!Array.isArray(competency.reflection)) fail(slug, "reflection må være en array");
}

if (sectionLengths.size < 2) fail("bibliotek", "alle seksjoner har lik lengde; arrays skal kunne følge faglig behov");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const totals = competencies.reduce((sum, item) => {
  sum.success += item.best_practice.success.length;
  sum.underuse += item.best_practice.underuse.length;
  sum.overuse += item.best_practice.overuse.length;
  sum.barriers += item.barriers.length;
  return sum;
}, { success: 0, underuse: 0, overuse: 0, barriers: 0 });

console.log(`Godkjent: ${competencies.length} kompetanser, ${totals.success} praksispunkter, ${totals.underuse} underbruk, ${totals.overuse} feilkalibreringer og ${totals.barriers} barrierer.`);
