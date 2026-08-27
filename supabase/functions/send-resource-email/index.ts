import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://portal.raederog.no",
  "http://localhost:8027",
  "http://localhost:8000",
]);

type Profile = {
  id: string;
  role: "admin" | "coach" | "client";
  name: string | null;
};

type ResourceEmailBody = {
  sharedResourceId?: string;
};

type SharedResourceRow = {
  id: string;
  coach_note: string | null;
  clients: {
    id: string;
    name: string | null;
    email: string | null;
    coach_ids: string[] | null;
  } | null;
  resources: {
    id: string;
    title: string | null;
  } | null;
};

type CoachRow = {
  id: string;
  name: string | null;
};

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://portal.raederog.no",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function jsonResponse(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function normalizeEmail(value = "") {
  return cleanText(value).toLowerCase();
}

function relationRow<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] || null : value;
}

function firstName(name = "", email = "") {
  const fromName = cleanText(name).split(/\s+/)[0];
  if (fromName) return fromName;
  return normalizeEmail(email).split("@")[0] || "";
}

function bearerToken(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new Error("Du må være innlogget for å sende ressursvarsel.");
  }
  return token;
}

async function currentProfile(supabaseAdmin: ReturnType<typeof createClient>, req: Request): Promise<Profile> {
  const token = bearerToken(req);
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData.user?.id) throw new Error("Du må være innlogget for å sende ressursvarsel.");

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, role, name")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile?.role) throw new Error("Du har ikke tilgang til å sende ressursvarsel.");
  return profile as Profile;
}

async function currentCoach(supabaseAdmin: ReturnType<typeof createClient>, profile: Profile) {
  if (!["coach", "admin"].includes(profile.role)) return null;
  const { data, error } = await supabaseAdmin
    .from("coaches")
    .select("id, name")
    .eq("user_id", profile.id)
    .is("archived_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id && profile.role === "coach") throw new Error("Du har ikke en aktiv coachprofil.");
  if (!data?.id) return null;
  return data as CoachRow;
}

async function loadSharedResource(
  supabaseAdmin: ReturnType<typeof createClient>,
  sharedResourceId: string,
) {
  const { data, error } = await supabaseAdmin
    .from("shared_resources")
    .select("id, coach_note, clients(id, name, email, coach_ids), resources(id, title)")
    .eq("id", sharedResourceId)
    .is("archived_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) throw new Error("Fant ikke ressursdelingen.");
  const row = data as SharedResourceRow & {
    clients: SharedResourceRow["clients"] | SharedResourceRow["clients"][];
    resources: SharedResourceRow["resources"] | SharedResourceRow["resources"][];
  };
  return {
    ...row,
    clients: relationRow(row.clients),
    resources: relationRow(row.resources),
  };
}

function assertCanSend(profile: Profile, coach: CoachRow | null, sharedResource: SharedResourceRow) {
  if (!["coach", "admin"].includes(profile.role) || !coach?.id) {
    throw new Error("Du har ikke tilgang til å sende ressursvarsel.");
  }
  if (!(sharedResource.clients?.coach_ids || []).includes(coach.id)) {
    throw new Error("Du kan bare sende ressursvarsel til egne klienter.");
  }
}

function escapeHtml(value = "") {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function greeting(clientFirstName: string) {
  return clientFirstName ? `Hei ${clientFirstName},` : "Hei,";
}

function resourcePortalUrl() {
  const configuredUrl = cleanText(Deno.env.get("PORTAL_URL") || "https://portal.raederog.no");
  try {
    const url = new URL(configuredUrl);
    if (!url.searchParams.has("pane")) url.searchParams.set("pane", "resources");
    return url.toString();
  } catch (_) {
    return configuredUrl;
  }
}

function textWithCoachNote(clientFirstName: string, coachName: string, resourceTitle: string, coachNote: string, portalUrl: string) {
  const coachNoteBlock = coachNote
    ? `Melding fra ${coachName}:\n\n${coachNote}`
    : "Coachen din har valgt ressursen som støtte i utviklingsarbeidet ditt.";

  return [
    greeting(clientFirstName),
    "",
    `${coachName} har delt en ressurs med deg i utviklingsportalen:`,
    "",
    resourceTitle,
    "",
    coachNoteBlock,
    "",
    "Du kan åpne ressursen når det passer. Hvis du ønsker, kan du skrive en egen refleksjon i portalen. Den er privat med mindre du selv velger å dele den med coach.",
    "",
    `Åpne ressursen: ${portalUrl}`,
    "",
    "Du får denne e-posten fordi du deltar i et coachingforløp hos Ræder&.",
  ].join("\n");
}

function htmlWithCoachNote(clientFirstName: string, coachName: string, resourceTitle: string, coachNote: string, portalUrl: string) {
  const escapedCoachName = escapeHtml(coachName);
  const coachNoteBlock = coachNote
    ? `<p><strong>Melding fra ${escapedCoachName}:</strong></p><p>${escapeHtml(coachNote).replaceAll("\n", "<br>")}</p>`
    : "<p>Coachen din har valgt ressursen som støtte i utviklingsarbeidet ditt.</p>";

  return `<!doctype html>
<html lang="no">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Din ledercoach har delt en ressurs med deg</title>
  </head>
  <body style="margin:0;background:#f7f7f7;color:#111;font-family:Arial,sans-serif;">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">Du finner ressursen i utviklingsportalen.</div>
    <main style="max-width:640px;margin:0 auto;padding:32px 20px;">
      <section style="background:#fff;border:1px solid #e4e4e4;border-radius:8px;padding:28px;">
        <p>${escapeHtml(greeting(clientFirstName))}</p>
        <p>${escapedCoachName} har delt en ressurs med deg i utviklingsportalen:</p>
        <p><strong>${escapeHtml(resourceTitle)}</strong></p>
        ${coachNoteBlock}
        <p>Du kan åpne ressursen når det passer. Hvis du ønsker, kan du skrive en egen refleksjon i portalen. Den er privat med mindre du selv velger å dele den med coach.</p>
        <p style="margin:28px 0;">
          <a href="${escapeHtml(portalUrl)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;border-radius:6px;padding:12px 18px;font-weight:700;">Åpne ressursen</a>
        </p>
        <p style="color:#666;font-size:13px;line-height:1.5;">Du får denne e-posten fordi du deltar i et coachingforløp hos Ræder&amp;.</p>
      </section>
    </main>
  </body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  try {
    if (req.method !== "POST") throw new Error("Unsupported method.");

    const body = (await req.json()) as ResourceEmailBody;
    const sharedResourceId = cleanText(body.sharedResourceId);
    if (!sharedResourceId) throw new Error("Mangler ressursdeling.");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESOURCE_EMAIL_FROM");
    const portalUrl = resourcePortalUrl();

    if (!supabaseUrl || !serviceKey) throw new Error("Missing Supabase environment variables.");
    if (!resendApiKey || !fromEmail) throw new Error("E-post er ikke konfigurert.");

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const profile = await currentProfile(supabaseAdmin, req);
    const [coach, sharedResource] = await Promise.all([
      currentCoach(supabaseAdmin, profile),
      loadSharedResource(supabaseAdmin, sharedResourceId),
    ]);
    assertCanSend(profile, coach, sharedResource);

    const clientEmail = normalizeEmail(sharedResource.clients?.email || "");
    const resourceTitle = cleanText(sharedResource.resources?.title || "Ressurs");
    if (!clientEmail) throw new Error("Klienten mangler e-postadresse.");

    const coachName = cleanText(coach?.name || profile.name || "") || "Ledercoachen din";
    const clientFirstName = firstName(sharedResource.clients?.name || "", clientEmail);
    const coachNote = cleanText(sharedResource.coach_note || "");

    const payload = {
      from: fromEmail,
      to: [clientEmail],
      subject: "Din ledercoach har delt en ressurs med deg",
      html: htmlWithCoachNote(clientFirstName, coachName, resourceTitle, coachNote, portalUrl),
      text: textWithCoachNote(clientFirstName, coachName, resourceTitle, coachNote, portalUrl),
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      const message = typeof result?.message === "string" ? result.message : "Kunne ikke sende e-post.";
      throw new Error(message);
    }

    return jsonResponse(req, { success: true, emailSent: true, id: result?.id || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunne ikke sende ressursvarsel.";
    console.log("send-resource-email error:", message);
    return jsonResponse(req, { error: message, emailSent: false }, 400);
  }
});
