function requireSupabaseClient(supabaseClient) {
  if (!supabaseClient || typeof supabaseClient.from !== "function") {
    throw new TypeError("A Supabase client is required for resource mutations.");
  }
}

function notImplemented(name) {
  throw new Error(`${name} is not implemented before resource library Batch 1B/3.`);
}

export async function shareResourceWithClient(supabaseClient, payload) {
  requireSupabaseClient(supabaseClient);
  void payload;
  notImplemented("shareResourceWithClient");
}

export async function updateSharedResourceStatus(supabaseClient, sharedResourceId, values) {
  requireSupabaseClient(supabaseClient);
  void sharedResourceId;
  void values;
  notImplemented("updateSharedResourceStatus");
}

export async function saveClientResourceReflection(supabaseClient, sharedResourceId, values) {
  requireSupabaseClient(supabaseClient);
  void sharedResourceId;
  void values;
  notImplemented("saveClientResourceReflection");
}

