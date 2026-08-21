import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://portal.raederog.no",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type EntityType = "coach" | "client";

type UpdateEmailBody = {
  entityType?: EntityType;
  entityId?: string;
  email?: string;
};

type Profile = {
  id: string;
  role: string;
};

type PersonRow = {
  id: string;
  email: string | null;
  user_id: string | null;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function tableForEntity(entityType: EntityType) {
  return entityType === "coach" ? "coaches" : "clients";
}

function bearerToken(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new Error("Du må være innlogget som admin for å endre e-post.");
  }
  return token;
}

async function currentProfile(supabaseAdmin: ReturnType<typeof createClient>, req: Request): Promise<Profile> {
  const token = bearerToken(req);
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData.user?.id) throw new Error("Du må være innlogget som admin for å endre e-post.");

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (profile?.role !== "admin") throw new Error("Bare admin kan endre e-postadresser.");
  return profile as Profile;
}

async function findPerson(
  supabaseAdmin: ReturnType<typeof createClient>,
  entityType: EntityType,
  entityId: string,
) {
  const { data, error } = await supabaseAdmin
    .from(tableForEntity(entityType))
    .select("id, email, user_id")
    .eq("id", entityId)
    .is("archived_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) throw new Error(entityType === "coach" ? "Coachen finnes ikke." : "Klienten finnes ikke.");
  return data as PersonRow;
}

async function assertEmailAvailable(
  supabaseAdmin: ReturnType<typeof createClient>,
  entityType: EntityType,
  entityId: string,
  email: string,
) {
  const [{ data: clients, error: clientError }, { data: coaches, error: coachError }] = await Promise.all([
    supabaseAdmin
      .from("clients")
      .select("id")
      .ilike("email", email)
      .is("archived_at", null),
    supabaseAdmin
      .from("coaches")
      .select("id")
      .ilike("email", email)
      .is("archived_at", null),
  ]);

  if (clientError) throw clientError;
  if (coachError) throw coachError;

  const conflictingClient = (clients || []).find((row) => entityType !== "client" || row.id !== entityId);
  const conflictingCoach = (coaches || []).find((row) => entityType !== "coach" || row.id !== entityId);

  if (conflictingClient || conflictingCoach) {
    throw new Error("E-postadressen er allerede brukt på en aktiv coach eller klient.");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") throw new Error("Unsupported method.");

    const body = (await req.json()) as UpdateEmailBody;
    const entityType = body.entityType;
    const entityId = cleanText(body.entityId);
    const email = normalizeEmail(body.email);

    if (!entityType || !["coach", "client"].includes(entityType)) throw new Error("Ugyldig rolletype.");
    if (!entityId) throw new Error("Mangler person.");
    if (!email || !email.includes("@")) throw new Error("Skriv inn en gyldig e-postadresse.");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) throw new Error("Missing Supabase environment variables");

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    await currentProfile(supabaseAdmin, req);

    const target = await findPerson(supabaseAdmin, entityType, entityId);
    const oldEmail = normalizeEmail(target.email || "");
    if (oldEmail === email) {
      return jsonResponse({ success: true, entityType, entityId, email, changed: false, authUpdated: false });
    }

    await assertEmailAvailable(supabaseAdmin, entityType, entityId, email);

    let authUpdated = false;
    if (target.user_id) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(target.user_id, {
        email,
        email_confirm: true,
      });
      if (authError) throw authError;
      authUpdated = true;
    }

    const { error: updateError } = await supabaseAdmin
      .from(tableForEntity(entityType))
      .update({ email })
      .eq("id", entityId);

    if (updateError) {
      if (authUpdated && oldEmail) {
        await supabaseAdmin.auth.admin.updateUserById(target.user_id!, {
          email: oldEmail,
          email_confirm: true,
        }).catch(() => null);
      }
      throw updateError;
    }

    return jsonResponse({ success: true, entityType, entityId, email, changed: true, authUpdated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunne ikke endre e-postadresse.";
    console.log("update-user-email error:", message);
    return jsonResponse({ error: message }, 400);
  }
});
