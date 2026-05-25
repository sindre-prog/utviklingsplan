export const PILOT_RESOURCE_SLUGS = Object.freeze([
  "abcde-modellen",
  "kontrollsirkelen",
  "a-akseptere-frykt"
]);

export const PILOT_RESOURCE_SOURCE = "docs/RESOURCE_LIBRARY_PILOT_CONTENT.md";

export function getPilotResourceSeedPlan() {
  return {
    source: PILOT_RESOURCE_SOURCE,
    slugs: [...PILOT_RESOURCE_SLUGS],
    strategy: "SQL seed in Batch 1C migration with on conflict (slug) do update"
  };
}
