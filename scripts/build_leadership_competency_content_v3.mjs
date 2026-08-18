#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const sourcePath = path.resolve(process.argv[2] || "content/leadership_competencies_v3.json");
const outputPath = path.resolve(process.argv[3] || "supabase/migrations/20260818120000_leadership_competency_content_v3.sql");
const competencies = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonLiteral(value) {
  const json = JSON.stringify(value);
  if (json.includes("$competency$")) throw new Error("Ugyldig dollar-quote i innholdet.");
  return `$competency$${json}$competency$::jsonb`;
}

const rows = competencies.map((item) => {
  const payload = {
    schema_version: 3,
    relevant_when: item.relevant_when,
    distinction: item.distinction,
    best_practice: item.best_practice,
    barriers: item.barriers,
    practice: item.practice,
    reflection: item.reflection,
  };
  return `    (${[
    sqlLiteral(item.slug),
    sqlLiteral(item.name_no),
    sqlLiteral(item.name_en),
    sqlLiteral(item.category),
    sqlLiteral(item.definition),
    jsonLiteral(payload),
  ].join(", ")})`;
});

const sql = `-- Complete the 52-competency editorial contract while keeping the established portal copy as baseline.
-- The richer DOCX was used only to QA and complete missing behaviour, miscalibration and barrier content.

with editorial(slug, title_no, title_en, category, summary, payload) as (
  values
${rows.join(",\n")}
)
update public.leadership_competencies competency
set
  title_no = editorial.title_no,
  title_en = editorial.title_en,
  category = editorial.category,
  summary = editorial.summary,
  content_json = competency.content_json || editorial.payload
from editorial
where competency.slug = editorial.slug;

do $$
begin
  if (
    select count(*)
    from public.leadership_competencies
    where is_active
      and coalesce((content_json ->> 'schema_version')::integer, 0) = 3
  ) <> 52 then
    raise exception 'Expected all 52 active leadership competencies to have content schema v3';
  end if;
end
$$;

comment on column public.leadership_competencies.content_json is
  'Versioned competency content. Schema v3 completes distinct success, underuse, miscalibration and barrier arrays while retaining legacy compatibility keys.';
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sql, "utf8");
console.log(`Skrev ${competencies.length} kompetanser til ${outputPath}`);
