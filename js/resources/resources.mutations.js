function requireSupabaseClient(supabaseClient) {
  if (!supabaseClient || typeof supabaseClient.from !== "function") {
    throw new TypeError("A Supabase client is required for resource mutations.");
  }
}

export async function shareResourceWithClient(supabaseClient, payload) {
  requireSupabaseClient(supabaseClient);

  const existingQuery = supabaseClient
    .from("shared_resources")
    .select("*")
    .eq("resource_id", payload.resourceId)
    .eq("client_id", payload.clientId)
    .eq("context_type", payload.contextType || "program")
    .is("archived_at", null)
    .limit(1);

  if (payload.programId) existingQuery.eq("program_id", payload.programId);
  else existingQuery.is("program_id", null);

  if (payload.contextType && payload.contextType !== "program") existingQuery.eq("context_id", payload.contextId);
  else existingQuery.is("context_id", null);

  const { data: existing, error: existingError } = await existingQuery.maybeSingle();
  if (existingError) throw existingError;

  const row = {
    resource_id: payload.resourceId,
    client_id: payload.clientId,
    program_id: payload.programId || null,
    context_type: payload.contextType || "program",
    context_id: payload.contextType && payload.contextType !== "program" ? payload.contextId : null,
    coach_note: payload.coachNote || null,
    status: "assigned",
    client_visibility: "private"
  };

  if (existing?.id) {
    const { data, error } = await supabaseClient
      .from("shared_resources")
      .update({
        coach_note: row.coach_note,
        status: "assigned"
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;

    return data;
  }

  const { data, error } = await supabaseClient
    .from("shared_resources")
    .insert(row)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function updateSharedResourceStatus(supabaseClient, sharedResourceId, values) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("shared_resources")
    .update(values)
    .eq("id", sharedResourceId)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function saveClientResourceReflection(supabaseClient, sharedResourceId, values) {
  requireSupabaseClient(supabaseClient);

  const payload = {
    client_note: values.clientNote || "",
    client_visibility: values.clientVisibility || "private",
    status: values.status || "responded",
    responded_at: new Date().toISOString()
  };

  const { data, error } = await supabaseClient
    .from("shared_resources")
    .update(payload)
    .eq("id", sharedResourceId)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}
