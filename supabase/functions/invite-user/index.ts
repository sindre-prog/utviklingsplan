import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://portal.raederog.no",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InviteRole = "admin" | "coach" | "client";

type InviteBody = {
  email?: string;
  name?: string;
  role?: InviteRole;
  coachIds?: string[];
  jobRole?: string;
  employer?: string;
};

type Profile = {
  id: string;
  role: InviteRole;
};

type ExistingClient = {
  id: string;
  coach_ids: string[] | null;
  role: string | null;
  employer: string | null;
};

type ExistingCoach = {
  id: string;
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

function uniqueIds(ids: unknown) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map((id) => cleanText(id)).filter(Boolean))];
}

function mergeIds(current: string[] | null, next: string[]) {
  return [...new Set([...(current || []), ...next])];
}

function bearerToken(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new Error("Du må være innlogget for å invitere.");
  }
  return token;
}

async function currentProfile(supabaseAdmin: ReturnType<typeof createClient>, req: Request): Promise<Profile> {
  const token = bearerToken(req);
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData.user?.id) throw new Error("Du må være innlogget for å invitere.");

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile?.role) throw new Error("Du har ikke tilgang til å invitere.");
  return profile as Profile;
}

async function coachIdsForClientInvite(
  supabaseAdmin: ReturnType<typeof createClient>,
  profile: Profile,
  requestedCoachIds: string[],
) {
  if (profile.role === "admin") {
    if (!requestedCoachIds.length) throw new Error("Velg minst én coach for klienten.");
    return requestedCoachIds;
  }

  if (profile.role !== "coach") throw new Error("Du har ikke tilgang til å invitere klienter.");

  const { data: coach, error } = await supabaseAdmin
    .from("coaches")
    .select("id")
    .eq("user_id", profile.id)
    .is("archived_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!coach?.id) throw new Error("Du har ikke en aktiv coachprofil.");
  if (requestedCoachIds.length && !requestedCoachIds.includes(coach.id)) {
    throw new Error("Du kan bare invitere klienter til din egen coachprofil.");
  }
  return [coach.id];
}

async function existingClientForInvite(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  email: string,
) {
  const byUser = await supabaseAdmin
    .from("clients")
    .select("id, coach_ids, role, employer")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (byUser.error) throw byUser.error;
  if (byUser.data?.id) return byUser.data as ExistingClient;

  const byEmail = await supabaseAdmin
    .from("clients")
    .select("id, coach_ids, role, employer")
    .ilike("email", email)
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (byEmail.error) throw byEmail.error;
  return (byEmail.data as ExistingClient | null) || null;
}

async function existingCoachForInvite(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  email: string,
) {
  const byUser = await supabaseAdmin
    .from("coaches")
    .select("id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (byUser.error) throw byUser.error;
  if (byUser.data?.id) return byUser.data as ExistingCoach;

  const byEmail = await supabaseAdmin
    .from("coaches")
    .select("id")
    .ilike("email", email)
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (byEmail.error) throw byEmail.error;
  return (byEmail.data as ExistingCoach | null) || null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") throw new Error("Unsupported method.");

    const body = (await req.json()) as InviteBody;
    const email = normalizeEmail(body.email);
    const name = cleanText(body.name);
    const role = body.role;
    const requestedCoachIds = uniqueIds(body.coachIds);

    if (!email || !name || !role) throw new Error("Missing required fields: email, name or role");
    if (!["admin", "coach", "client"].includes(role)) throw new Error(`Unsupported role: ${role}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) throw new Error("Missing Supabase environment variables");

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const profile = await currentProfile(supabaseAdmin, req);
    if ((role === "admin" || role === "coach") && profile.role !== "admin") {
      throw new Error("Bare admin kan invitere coacher.");
    }

    const effectiveCoachIds =
      role === "client"
        ? await coachIdsForClientInvite(supabaseAdmin, profile, requestedCoachIds)
        : [];

    const { data: invited, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (inviteError) throw inviteError;
    if (!invited?.user?.id) throw new Error("No invited user id returned from Supabase Auth");

    const userId = invited.user.id;
    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (targetProfileError) throw targetProfileError;
    if (targetProfile?.role && targetProfile.role !== role) {
      throw new Error("E-posten er allerede koblet til en annen rolletype.");
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, role, name });

    if (profileError) throw profileError;

    if (role === "coach" || role === "admin") {
      const existingCoach = await existingCoachForInvite(supabaseAdmin, userId, email);
      const coachWrite = existingCoach?.id
        ? supabaseAdmin.from("coaches").update({ name, email, user_id: userId }).eq("id", existingCoach.id)
        : supabaseAdmin.from("coaches").insert({ name, email, user_id: userId, code: crypto.randomUUID() });

      const { error: coachError } = await coachWrite;
      if (coachError) throw coachError;
      return jsonResponse({ success: true, userId, coachId: existingCoach?.id, reusedCoach: Boolean(existingCoach?.id) });
    }

    const existingClient = await existingClientForInvite(supabaseAdmin, userId, email);
    if (existingClient?.id) {
      const { error: updateError } = await supabaseAdmin
        .from("clients")
        .update({
          name,
          email,
          user_id: userId,
          coach_ids: mergeIds(existingClient.coach_ids, effectiveCoachIds),
          role: cleanText(body.jobRole) || existingClient.role || "",
          employer: cleanText(body.employer) || existingClient.employer || "",
        })
        .eq("id", existingClient.id);

      if (updateError) throw updateError;
      return jsonResponse({ success: true, userId, clientId: existingClient.id, reusedClient: true });
    }

    const { data: createdClient, error: clientError } = await supabaseAdmin
      .from("clients")
      .insert({
        name,
        email,
        user_id: userId,
        coach_ids: effectiveCoachIds,
        role: cleanText(body.jobRole),
        employer: cleanText(body.employer),
        consent_given: false,
        plan: {},
        code: crypto.randomUUID(),
      })
      .select("id")
      .single();

    if (clientError) throw clientError;
    return jsonResponse({ success: true, userId, clientId: createdClient.id, reusedClient: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log("invite-user error:", message);
    return jsonResponse({ error: message }, 400);
  }
});
