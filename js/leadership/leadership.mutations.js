function requireSupabaseClient(supabaseClient) {
  if (!supabaseClient || typeof supabaseClient.from !== "function") {
    throw new TypeError("A Supabase client is required for leadership mutations.");
  }
}

export async function selectProgramCompetency(supabaseClient, programId, competencyId, priority = 0) {
  requireSupabaseClient(supabaseClient);
  if (!programId) throw new Error("Mangler program.");
  if (!competencyId) throw new Error("Velg en kompetanse.");

  const { data, error } = await supabaseClient
    .from("program_competencies")
    .upsert({
      program_id: programId,
      competency_id: competencyId,
      status: "active",
      priority
    }, { onConflict: "program_id,competency_id" })
    .select("*, leadership_competencies(*)")
    .single();

  if (error) throw error;
  return data;
}

export async function updateProgramCompetency(supabaseClient, programCompetencyId, values = {}) {
  requireSupabaseClient(supabaseClient);
  if (!programCompetencyId) throw new Error("Mangler valgt kompetanse.");

  const { data, error } = await supabaseClient
    .from("program_competencies")
    .update(values)
    .eq("id", programCompetencyId)
    .select("*, leadership_competencies(*)")
    .single();

  if (error) throw error;
  return data;
}

export async function removeProgramCompetency(supabaseClient, programCompetencyId) {
  requireSupabaseClient(supabaseClient);
  if (!programCompetencyId) throw new Error("Mangler valgt kompetanse.");

  const { error } = await supabaseClient
    .from("program_competencies")
    .delete()
    .eq("id", programCompetencyId);

  if (error) throw error;
  return true;
}
