function requireSupabaseClient(supabaseClient) {
  if (!supabaseClient || typeof supabaseClient.from !== "function") {
    throw new TypeError("A Supabase client is required for resource queries.");
  }
}

function normalizeResource(row) {
  if (!row) return null;
  return {
    ...row,
    tags: (row.resource_tags || []).map((tag) => tag.tag).filter(Boolean).sort((a, b) => a.localeCompare(b, "no")),
    files: (row.resource_files || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  };
}

function applyResourceFilters(resources, filters = {}) {
  const query = (filters.query || "").trim().toLowerCase();
  const phase = filters.phase || "all";
  const type = filters.type || "all";

  return resources.filter((resource) => {
    const matchesQuery = !query || [
      resource.title,
      resource.summary,
      resource.intended_outcome,
      ...(resource.tags || [])
    ].filter(Boolean).join(" ").toLowerCase().includes(query);
    const matchesPhase = phase === "all" || resource.phase === phase;
    const matchesType = type === "all" || resource.type === type;

    return matchesQuery && matchesPhase && matchesType;
  });
}

export async function getPublishedResources(supabaseClient, filters = {}) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("resources")
    .select(`
      *,
      resource_tags(tag),
      resource_files(id, file_type, storage_path, display_name, sort_order)
    `)
    .eq("status", "published")
    .order("title", { ascending: true });

  if (error) throw error;

  return applyResourceFilters((data || []).map(normalizeResource), filters);
}

export async function getResourceBySlug(supabaseClient, slug) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("resources")
    .select(`
      *,
      resource_tags(tag),
      resource_files(id, file_type, storage_path, display_name, sort_order)
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;

  return normalizeResource(data);
}

export async function getResourceById(supabaseClient, resourceId) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("resources")
    .select(`
      *,
      resource_tags(tag),
      resource_files(id, file_type, storage_path, display_name, sort_order)
    `)
    .eq("id", resourceId)
    .maybeSingle();

  if (error) throw error;

  return normalizeResource(data);
}

export async function getSharedResourcesForClient(supabaseClient, clientId) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("shared_resources")
    .select(`
      *,
      resources(*, resource_tags(tag), resource_files(id, file_type, storage_path, display_name, sort_order))
    `)
    .eq("client_id", clientId)
    .is("archived_at", null)
    .order("shared_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    ...row,
    resource: normalizeResource(row.resources)
  }));
}

export async function getSharedResourcesForProgram(supabaseClient, programId) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("shared_resources")
    .select(`
      *,
      resources(*, resource_tags(tag), resource_files(id, file_type, storage_path, display_name, sort_order))
    `)
    .eq("program_id", programId)
    .is("archived_at", null)
    .order("shared_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    ...row,
    resource: normalizeResource(row.resources)
  }));
}
