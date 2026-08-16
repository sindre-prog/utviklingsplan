import { LEADERSHIP_COMPETENCY_CATEGORIES } from "./leadership.constants.js?v=polish-86";

function requireSupabaseClient(supabaseClient) {
  if (!supabaseClient || typeof supabaseClient.from !== "function") {
    throw new TypeError("A Supabase client is required for leadership queries.");
  }
}

function normalizeContentJson(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { signals: [], obstacles: [], practices: [] };
  }
  return {
    ...value,
    signals: Array.isArray(value.signals) ? value.signals : [],
    obstacles: Array.isArray(value.obstacles) ? value.obstacles : [],
    practices: Array.isArray(value.practices) ? value.practices : []
  };
}

export function normalizeCompetency(row) {
  if (!row) return null;
  return {
    ...row,
    title: row.title_no || row.title_en || "",
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
    .neq("status", "archived")
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(normalizeProgramCompetency).filter(Boolean);
}
