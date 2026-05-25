function requireSupabaseClient(supabaseClient) {
  if (!supabaseClient || typeof supabaseClient.from !== "function") {
    throw new TypeError("A Supabase client is required for resource queries.");
  }
}

function notImplemented(name) {
  throw new Error(`${name} is not implemented before resource library Batch 1B/2.`);
}

export async function getPublishedResources(supabaseClient, filters = {}) {
  requireSupabaseClient(supabaseClient);
  void filters;
  notImplemented("getPublishedResources");
}

export async function getResourceBySlug(supabaseClient, slug) {
  requireSupabaseClient(supabaseClient);
  void slug;
  notImplemented("getResourceBySlug");
}

export async function getResourceById(supabaseClient, resourceId) {
  requireSupabaseClient(supabaseClient);
  void resourceId;
  notImplemented("getResourceById");
}

export async function getSharedResourcesForClient(supabaseClient, clientId) {
  requireSupabaseClient(supabaseClient);
  void clientId;
  notImplemented("getSharedResourcesForClient");
}

export async function getSharedResourcesForProgram(supabaseClient, programId) {
  requireSupabaseClient(supabaseClient);
  void programId;
  notImplemented("getSharedResourcesForProgram");
}

