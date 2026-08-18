import { LEADERSHIP_COMPETENCY_CATEGORIES, PROGRAM_COMPETENCY_ROLES } from "./leadership.constants.js?v=polish-99";

function requireSupabaseClient(supabaseClient) {
  if (!supabaseClient || typeof supabaseClient.from !== "function") {
    throw new TypeError("A Supabase client is required for leadership queries.");
  }
}

function normalizeContentJson(value) {
  const asArray = (candidate) => Array.isArray(candidate)
    ? candidate.filter((item) => typeof item === "string" && item.trim())
    : typeof candidate === "string" && candidate.trim()
      ? [candidate]
      : [];
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const bestPractice = source.best_practice && typeof source.best_practice === "object" ? source.best_practice : {};
  const practice = source.practice && typeof source.practice === "object" ? source.practice : {};
  const relevantWhen = typeof source.relevant_when === "string" ? source.relevant_when : source.choose_when || "";
  const success = asArray(bestPractice.success).length ? asArray(bestPractice.success) : asArray(source.signals);
  const underuse = asArray(bestPractice.underuse).length ? asArray(bestPractice.underuse) : asArray(source.underuse);
  const overuse = asArray(bestPractice.overuse).length ? asArray(bestPractice.overuse) : asArray(source.overuse);
  const barriers = asArray(source.barriers).length ? asArray(source.barriers) : asArray(source.obstacles);
  const experiment = typeof practice.experiment === "string" ? practice.experiment : source.experiment || "";
  const effect = typeof practice.effect === "string" ? practice.effect : source.evidence || "";

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      schema_version: 2,
      relevant_when: "",
      choose_when: "",
      distinction: "",
      best_practice: { success: [], underuse: [], overuse: [] },
      barriers: [],
      practice: { experiment: "", effect: "" },
      reflection: [],
      signals: [],
      obstacles: [],
      practices: [],
      underuse: [],
      overuse: [],
      experiment: "",
      evidence: ""
    };
  }
  return {
    ...source,
    schema_version: Number(source.schema_version) || 1,
    relevant_when: relevantWhen,
    choose_when: relevantWhen,
    distinction: typeof source.distinction === "string" ? source.distinction : "",
    best_practice: { success, underuse, overuse },
    barriers,
    practice: { experiment, effect },
    reflection: asArray(source.reflection),
    // Stable compatibility aliases for screens that have not moved to v2 yet.
    signals: success,
    obstacles: barriers,
    practices: asArray(source.practices),
    underuse,
    overuse,
    experiment,
    evidence: effect
  };
}

export function normalizeCompetency(row) {
  if (!row) return null;
  return {
    ...row,
    name_no: row.name_no || row.title_no || "",
    name_en: row.name_en || row.title_en || "",
    title: row.title_no || row.title_en || "",
    definition: row.summary || "",
    categoryLabel: LEADERSHIP_COMPETENCY_CATEGORIES[row.category] || row.category || "",
    content: normalizeContentJson(row.content_json)
  };
}

export function normalizeProgramCompetency(row) {
  if (!row) return null;
  const competency = normalizeCompetency(row.leadership_competencies || row.competency || null);
  return {
    ...row,
    competency,
    title: competency?.title || "Kompetanse",
    role: row.status === "suggested" ? "suggested" : Number(row.priority) === 1 ? "primary" : "supporting",
    roleLabel: row.status === "suggested"
      ? PROGRAM_COMPETENCY_ROLES.suggested
      : Number(row.priority) === 1
        ? PROGRAM_COMPETENCY_ROLES.primary
        : PROGRAM_COMPETENCY_ROLES.supporting,
    categoryLabel: competency?.categoryLabel || "",
    summary: competency?.summary || ""
  };
}

export async function getLeadershipCompetencies(supabaseClient) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("leadership_competencies")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("title_no", { ascending: true });

  if (error) throw error;
  return (data || []).map(normalizeCompetency).filter(Boolean);
}

export async function getProgramCompetencies(supabaseClient, programId) {
  requireSupabaseClient(supabaseClient);
  if (!programId) return [];

  const { data, error } = await supabaseClient
    .from("program_competencies")
    .select("*, leadership_competencies(*)")
    .eq("program_id", programId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || [])
    .map(normalizeProgramCompetency)
    .filter(Boolean)
    .sort((a, b) => {
      const aSuggested = a.status === "suggested" ? 1 : 0;
      const bSuggested = b.status === "suggested" ? 1 : 0;
      return aSuggested - bSuggested || Number(a.priority || 99) - Number(b.priority || 99) || String(a.created_at).localeCompare(String(b.created_at));
    });
}
