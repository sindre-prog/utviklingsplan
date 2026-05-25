function requireSupabaseClient(supabaseClient) {
  if (!supabaseClient || typeof supabaseClient.from !== "function") {
    throw new TypeError("A Supabase client is required for resource mutations.");
  }
}

function cleanTags(tags = []) {
  return Array.from(new Set(
    tags
      .map((tag) => String(tag || "").trim().toLowerCase())
      .filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, "no"));
}

async function replaceResourceTags(supabaseClient, resourceId, tags = []) {
  const nextTags = cleanTags(tags);
  const { error: deleteError } = await supabaseClient
    .from("resource_tags")
    .delete()
    .eq("resource_id", resourceId);

  if (deleteError) throw deleteError;
  if (!nextTags.length) return [];

  const { data, error } = await supabaseClient
    .from("resource_tags")
    .insert(nextTags.map((tag) => ({ resource_id: resourceId, tag })))
    .select("tag");

  if (error) throw error;
  return data || [];
}

export async function createResource(supabaseClient, payload) {
  requireSupabaseClient(supabaseClient);

  const { tags = [], ...resourcePayload } = payload;
  const { data, error } = await supabaseClient
    .from("resources")
    .insert(resourcePayload)
    .select("*")
    .single();

  if (error) throw error;
  await replaceResourceTags(supabaseClient, data.id, tags);
  return data;
}

export async function updateResource(supabaseClient, resourceId, payload) {
  requireSupabaseClient(supabaseClient);

  const { tags = [], ...resourcePayload } = payload;
  const { data, error } = await supabaseClient
    .from("resources")
    .update(resourcePayload)
    .eq("id", resourceId)
    .select("*")
    .single();

  if (error) throw error;
  await replaceResourceTags(supabaseClient, resourceId, tags);
  return data;
}

export async function archiveResource(supabaseClient, resourceId) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("resources")
    .update({
      status: "archived",
      archived_at: new Date().toISOString()
    })
    .eq("id", resourceId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function reactivateResource(supabaseClient, resourceId, status = "draft") {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("resources")
    .update({
      status,
      archived_at: null
    })
    .eq("id", resourceId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
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
