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

function safeFileName(name = "asset") {
  return String(name || "asset")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "asset";
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

  const shouldReplaceTags = Object.prototype.hasOwnProperty.call(payload, "tags");
  const { tags = [], ...resourcePayload } = payload;
  const { data, error } = await supabaseClient
    .from("resources")
    .update(resourcePayload)
    .eq("id", resourceId)
    .select("*")
    .single();

  if (error) throw error;
  if (shouldReplaceTags) {
    await replaceResourceTags(supabaseClient, resourceId, tags);
  }
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

export async function duplicateResource(supabaseClient, resourceId) {
  requireSupabaseClient(supabaseClient);

  const { data: source, error: sourceError } = await supabaseClient
    .from("resources")
    .select("*, resource_tags(tag)")
    .eq("id", resourceId)
    .single();

  if (sourceError) throw sourceError;

  const { id, created_at, updated_at, created_by, updated_by, archived_at, resource_tags: resourceTags = [], ...resourcePayload } = source;
  const timestamp = Date.now().toString(36);
  const copyPayload = {
    ...resourcePayload,
    title: `${source.title} kopi`,
    slug: `${source.slug}-kopi-${timestamp}`,
    status: "draft",
    archived_at: null,
    review_status: source.review_status || "draft"
  };

  return createResource(supabaseClient, {
    ...copyPayload,
    tags: resourceTags.map((tag) => tag.tag)
  });
}

export async function uploadResourceFile(supabaseClient, resourceId, file, values = {}) {
  requireSupabaseClient(supabaseClient);
  if (!supabaseClient.storage?.from) {
    throw new TypeError("Supabase Storage support is required for resource uploads.");
  }
  if (!resourceId) throw new Error("Ressurs må lagres før filer kan lastes opp.");
  if (!file) throw new Error("Velg en fil først.");

  const fileName = safeFileName(file.name);
  const storagePath = `${resourceId}/${Date.now()}-${fileName}`;
  const bucket = supabaseClient.storage.from("resource-assets");
  const { error: uploadError } = await bucket.upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (uploadError) throw uploadError;

  const { data, error } = await supabaseClient
    .from("resource_files")
    .insert({
      resource_id: resourceId,
      file_type: values.fileType || "attachment",
      storage_path: storagePath,
      display_name: values.displayName || file.name || fileName,
      sort_order: Number.isInteger(values.sortOrder) ? values.sortOrder : 0
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function archiveResourceFile(supabaseClient, fileId) {
  requireSupabaseClient(supabaseClient);

  const { data, error } = await supabaseClient
    .from("resource_files")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", fileId)
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

export async function sendSharedResourceEmail(supabaseClient, sharedResourceId) {
  requireSupabaseClient(supabaseClient);

  if (!supabaseClient.functions?.invoke) {
    throw new TypeError("Supabase Functions support is required for resource email.");
  }
  if (!sharedResourceId) throw new Error("Mangler ressursdeling.");

  const { data, error } = await supabaseClient.functions.invoke("send-resource-email", {
    body: { sharedResourceId }
  });

  if (error) {
    const details = await error.context?.json?.().catch(() => null);
    if (details?.error) throw new Error(details.error);
    throw error;
  }
  if (data?.error) throw new Error(data.error);

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
