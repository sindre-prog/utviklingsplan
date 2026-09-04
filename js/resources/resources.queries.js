import { normalizeResourceProductFields } from "./resources.model.js?v=polish-155";

function requireSupabaseClient(supabaseClient) {
  if (!supabaseClient || typeof supabaseClient.from !== "function") {
    throw new TypeError("A Supabase client is required for resource queries.");
  }
}

function normalizeResource(row) {
  if (!row) return null;
  return normalizeResourceProductFields({
    ...row,
    tags: (row.resource_tags || []).map((tag) => tag.tag).filter(Boolean).sort((a, b) => a.localeCompare(b, "no")),
    files: (row.resource_files || [])
      .filter((file) => !file.archived_at)
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  });
}

function normalizeSharedResource(row, options = {}) {
  const viewerRole = options.viewerRole || "coach";
  const clientNoteIsVisible = viewerRole === "client" || row.client_visibility === "shared_with_coach";

  return {
    ...row,
    client_note: clientNoteIsVisible ? row.client_note : "",
    client_note_is_private: Boolean(row.client_note_is_private) || (!clientNoteIsVisible && Boolean(row.client_note)),
    resource: normalizeResource(row.resources || row.resource)
  };
}

function applyResourceFilters(resources, filters = {}) {
  const query = (filters.query || "").trim().toLowerCase();
  const developmentArea = filters.developmentArea || "all";
  const phase = filters.phase || "all";
  const type = filters.type || "all";

  return resources.filter((resource) => {
    const matchesQuery = !query || [
      resource.title,
      resource.introduction,
      resource.intended_outcome,
      ...(resource.topic_tags || [])
    ].filter(Boolean).join(" ").toLowerCase().includes(query);
    const resourceArea = resource.development_area || "uncategorized";
    const matchesDevelopmentArea = developmentArea === "all" || resourceArea === developmentArea;
    const matchesPhase = phase === "all" || resource.phase === phase;
    const matchesType = type === "all" || resource.type === type;

    return matchesQuery && matchesDevelopmentArea && matchesPhase && matchesType;
  });
}

export async function getPublishedResources(supabaseClient, filters = {}) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("resources")
    .select(`
      *,
      resource_tags(tag),
      resource_files(id, file_type, storage_path, display_name, sort_order, archived_at)
    `)
    .eq("status", "published")
    .order("title", { ascending: true });

  if (error) throw error;

  return applyResourceFilters((data || []).map(normalizeResource), filters);
}

export async function getAdminResources(supabaseClient, filters = {}) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("resources")
    .select(`
      *,
      resource_tags(tag),
      resource_files(id, file_type, storage_path, display_name, sort_order, archived_at)
    `)
    .order("updated_at", { ascending: false });

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
      resource_files(id, file_type, storage_path, display_name, sort_order, archived_at)
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
      resource_files(id, file_type, storage_path, display_name, sort_order, archived_at)
    `)
    .eq("id", resourceId)
    .maybeSingle();

  if (error) throw error;

  return normalizeResource(data);
}

export async function getSharedResourcesForClient(supabaseClient, clientId, options = {}) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("shared_resources")
    .select(`
      *,
      resources(*, resource_tags(tag), resource_files(id, file_type, storage_path, display_name, sort_order, archived_at))
    `)
    .eq("client_id", clientId)
    .is("archived_at", null)
    .order("shared_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => normalizeSharedResource(row, options));
}

export async function getSharedResourcesForProgram(supabaseClient, programId, options = {}) {
  requireSupabaseClient(supabaseClient);

  if (options.viewerRole !== "client" && typeof supabaseClient.rpc === "function") {
    const { data, error } = await supabaseClient
      .rpc("get_shared_resources_for_program_safe", { p_program_id: programId });

    if (error) throw error;

    return (data || []).map((row) => normalizeSharedResource(row, options));
  }

  const { data, error } = await supabaseClient
    .from("shared_resources")
    .select(`
      *,
      resources(*, resource_tags(tag), resource_files(id, file_type, storage_path, display_name, sort_order, archived_at))
    `)
    .eq("program_id", programId)
    .is("archived_at", null)
    .order("shared_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => normalizeSharedResource(row, options));
}

export async function getResourceFileUrl(supabaseClient, storagePath, expiresIn = 3600, options = {}) {
  requireSupabaseClient(supabaseClient);
  if (!storagePath) return "";
  if (!supabaseClient.storage?.from) {
    throw new TypeError("Supabase Storage support is required for resource file URLs.");
  }

  const signedUrlOptions = options.download ? { download: true } : undefined;
  const { data, error } = await supabaseClient
    .storage
    .from("resource-assets")
    .createSignedUrl(storagePath, expiresIn, signedUrlOptions);

  if (error) throw error;
  return data?.signedUrl || "";
}
