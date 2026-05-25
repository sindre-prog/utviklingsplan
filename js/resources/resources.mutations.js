function requireSupabaseClient(supabaseClient) {
  if (!supabaseClient || typeof supabaseClient.from !== "function") {
    throw new TypeError("A Supabase client is required for resource mutations.");
  }
}

export async function shareResourceWithClient(supabaseClient, payload) {
  requireSupabaseClient(supabaseClient);

  if (typeof supabaseClient.rpc !== "function") {
    throw new TypeError("Supabase RPC support is required for resource sharing.");
  }

  const { data, error } = await supabaseClient.rpc("share_resource_with_client_safe", {
    p_resource_id: payload.resourceId,
    p_client_id: payload.clientId,
    p_program_id: payload.programId,
    p_context_type: payload.contextType || "program",
    p_context_id: payload.contextType && payload.contextType !== "program" ? payload.contextId : null,
    p_coach_note: payload.coachNote || null
  });

  if (error) throw error;

  return { id: data };
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

  if (typeof supabaseClient.rpc !== "function") {
    throw new TypeError("Supabase RPC support is required for saving resource reflections.");
  }

  const { data, error } = await supabaseClient.rpc("save_client_resource_reflection_safe", {
    p_shared_resource_id: sharedResourceId,
    p_client_note: values.clientNote || "",
    p_client_visibility: values.clientVisibility || "private"
  });

  if (error) throw error;

  return data;
}
