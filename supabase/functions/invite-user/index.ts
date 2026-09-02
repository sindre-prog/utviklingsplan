import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { classifyResendFailure } from "../_shared/resend-errors.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://portal.raederog.no",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InviteRole = "admin" | "coach" | "client";

type InviteBody = {
  mode?: "invite" | "resend";
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
  user_id: string | null;
  name: string | null;
  email: string | null;
  coach_ids: string[] | null;
  role: string | null;
  employer: string | null;
  account_activated_at: string | null;
  consent_date: string | null;
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

function firstName(name = "", email = "") {
  const fromName = cleanText(name).split(/\s+/)[0];
  if (fromName) return fromName;
  return normalizeEmail(email).split("@")[0] || "";
}

function escapeHtml(value = "") {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function portalUrl() {
  return cleanText(Deno.env.get("PORTAL_URL") || "https://portal.raederog.no");
}

function accessEmailText(clientFirstName: string, actionLink: string) {
  const greeting = clientFirstName ? `Hei ${clientFirstName},` : "Hei,";
  return [
    greeting,
    "",
    "Her er en ny tilgangslenke til Ræder& utviklingsportal. Bruk lenken under for å opprette passord og åpne utviklingsløpet ditt.",
    "",
    `Opprett passord og åpne portalen: ${actionLink}`,
    "",
    "Lenken er personlig og utløper av sikkerhetshensyn. Hvis du ikke forventet denne e-posten, kan du se bort fra den.",
    "",
    "Hilsen Ræder&",
  ].join("\n");
}

function accessEmailHtml(clientFirstName: string, actionLink: string) {
  const greeting = clientFirstName ? `Hei ${clientFirstName},` : "Hei,";
  return `<!doctype html>
<html lang="no">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ny tilgangslenke til Ræder&amp; utviklingsportal</title>
  </head>
  <body style="margin:0;background:#f7f7f7;color:#111;font-family:Arial,sans-serif;">
    <main style="max-width:640px;margin:0 auto;padding:32px 20px;">
      <section style="background:#fff;border:1px solid #e4e4e4;border-radius:8px;padding:28px;">
        <p>${escapeHtml(greeting)}</p>
        <p>Her er en ny tilgangslenke til Ræder&amp; utviklingsportal. Bruk lenken under for å opprette passord og åpne utviklingsløpet ditt.</p>
        <p style="margin:28px 0;">
          <a href="${escapeHtml(actionLink)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;border-radius:6px;padding:12px 18px;font-weight:700;">Opprett passord og åpne portalen</a>
        </p>
        <p style="color:#666;font-size:13px;line-height:1.5;">Lenken er personlig og utløper av sikkerhetshensyn. Hvis du ikke forventet denne e-posten, kan du se bort fra den.</p>
        <p>Hilsen Ræder&amp;</p>
      </section>
    </main>
  </body>
</html>`;
}

function welcomeEmailText(clientFirstName: string, actionLink: string) {
  const greeting = clientFirstName ? `Hei ${clientFirstName},` : "Hei,";
  return [
    greeting,
    "",
    "Du har fått tilgang til din personlige utviklingsportal hos Ræder&.",
    "",
    "Her samler du det som gir retning i utviklingsløpet ditt: mål og rammer, utviklingsfokus, samtaler, egne refleksjoner og ressurser fra coachen din.",
    "",
    "Portalen er din. Du eier utviklingsløpet og velger selv hva du vil arbeide med, og hvilke refleksjoner du eventuelt vil dele med coachen.",
    "",
    `Opprett passord og åpne portalen: ${actionLink}`,
    "",
    "Lenken er personlig og utløper av sikkerhetshensyn. Hvis du ikke forventet denne e-posten, kan du se bort fra den.",
    "",
    "Hilsen Ræder&",
  ].join("\n");
}

function welcomeEmailHtml(clientFirstName: string, actionLink: string) {
  const greeting = clientFirstName ? `Hei ${clientFirstName},` : "Hei,";
  return `<!doctype html>
<html lang="no">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Velkommen til din personlige utviklingsportal</title>
  </head>
  <body style="margin:0;background:#f7f7f7;color:#111;font-family:Arial,sans-serif;">
    <main style="max-width:640px;margin:0 auto;padding:32px 20px;">
      <section style="background:#fff;border:1px solid #e4e4e4;border-radius:8px;padding:28px;">
        <p>${escapeHtml(greeting)}</p>
        <p>Du har fått tilgang til din personlige utviklingsportal hos Ræder&amp;.</p>
        <p>Her samler du det som gir retning i utviklingsløpet ditt: mål og rammer, utviklingsfokus, samtaler, egne refleksjoner og ressurser fra coachen din.</p>
        <p>Portalen er din. Du eier utviklingsløpet og velger selv hva du vil arbeide med, og hvilke refleksjoner du eventuelt vil dele med coachen.</p>
        <p style="margin:28px 0;">
          <a href="${escapeHtml(actionLink)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;border-radius:6px;padding:12px 18px;font-weight:700;">Opprett passord og åpne portalen</a>
        </p>
        <p style="color:#666;font-size:13px;line-height:1.5;">Lenken er personlig og utløper av sikkerhetshensyn. Hvis du ikke forventet denne e-posten, kan du se bort fra den.</p>
        <p>Hilsen Ræder&amp;</p>
      </section>
    </main>
  </body>
</html>`;
}

async function sendPortalEmail({
  to,
  subject,
  html,
  text,
  errorMessage,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  errorMessage: string;
}) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESOURCE_EMAIL_FROM");
  if (!resendApiKey || !fromEmail) throw new Error("E-post er ikke konfigurert.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: fromEmail, to: [to], subject, html, text }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const failure = classifyResendFailure(result, response.status, errorMessage);
    console.log("portal email error:", failure.providerMessage);
    throw new Error(failure.userMessage);
  }
  return result?.id || null;
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
    .select("id, user_id, name, email, coach_ids, role, employer, account_activated_at, consent_date")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (byUser.error) throw byUser.error;
  if (byUser.data?.id) return byUser.data as ExistingClient;

  const byEmail = await supabaseAdmin
    .from("clients")
    .select("id, user_id, name, email, coach_ids, role, employer, account_activated_at, consent_date")
    .ilike("email", email)
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (byEmail.error) throw byEmail.error;
  return (byEmail.data as ExistingClient | null) || null;
}

async function existingClientForResend(
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string,
) {
  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("id, user_id, name, email, coach_ids, role, employer, account_activated_at, consent_date")
    .ilike("email", email)
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) throw new Error("Fant ingen aktiv klient med denne e-postadressen.");
  return data as ExistingClient;
}

async function resendClientAccess(
  supabaseAdmin: ReturnType<typeof createClient>,
  profile: Profile,
  effectiveCoachIds: string[],
  email: string,
) {
  const client = await existingClientForResend(supabaseAdmin, email);
  if (profile.role !== "admin" && !effectiveCoachIds.some((coachId) => (client.coach_ids || []).includes(coachId))) {
    throw new Error("Du kan bare sende tilgangslenke til egne klienter.");
  }
  if (client.account_activated_at || client.consent_date) {
    throw new Error("Klienten har allerede aktivert tilgangen.");
  }
  if (!client.user_id) {
    throw new Error("Klienten mangler en tilknyttet brukerkonto. Kontakt ansvarlig for portalen.");
  }

  const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", client.user_id)
    .maybeSingle();

  if (targetProfileError) throw targetProfileError;
  if (targetProfile?.role !== "client") {
    throw new Error("Brukerkontoen er ikke koblet til riktig rolletype.");
  }

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: portalUrl() },
  });
  if (linkError) {
    console.log("access link generation error:", linkError.message);
    throw new Error("Kunne ikke opprette en ny tilgangslenke. Kontakt ansvarlig for portalen.");
  }

  const actionLink = linkData?.properties?.action_link;
  if (!actionLink) throw new Error("Kunne ikke opprette en ny tilgangslenke.");

  const clientFirstName = firstName(client.name || "", email);
  const emailId = await sendPortalEmail({
    to: email,
    subject: "Ny tilgangslenke til Ræder& utviklingsportal",
    html: accessEmailHtml(clientFirstName, actionLink),
    text: accessEmailText(clientFirstName, actionLink),
    errorMessage: "Kunne ikke sende tilgangslenken. Prøv igjen.",
  });

  return { clientId: client.id, userId: client.user_id, emailSent: true, emailId };
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
    const mode = body.mode || "invite";
    const email = normalizeEmail(body.email);
    const name = cleanText(body.name);
    const role = body.role;
    const requestedCoachIds = uniqueIds(body.coachIds);

    if (!email || !name || !role) throw new Error("Missing required fields: email, name or role");
    if (!["admin", "coach", "client"].includes(role)) throw new Error(`Unsupported role: ${role}`);
    if (!["invite", "resend"].includes(mode)) throw new Error(`Unsupported invite mode: ${mode}`);

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

    if (mode === "resend") {
      if (role !== "client") throw new Error("Tilgangslenke kan bare sendes på nytt til klienter.");
      const result = await resendClientAccess(supabaseAdmin, profile, effectiveCoachIds, email);
      return jsonResponse({ success: true, ...result });
    }

    const isClientInvite = role === "client";
    let userId = "";
    let actionLink: string | null = null;
    if (isClientInvite) {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo: portalUrl(), data: { name } },
      });
      if (linkError) throw linkError;
      if (!linkData?.user?.id) throw new Error("No invited user id returned from Supabase Auth");
      userId = linkData.user.id;
      actionLink = linkData.properties?.action_link || null;
      if (!actionLink) throw new Error("Kunne ikke opprette invitasjonslenken.");
    } else {
      const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      if (inviteError) throw inviteError;
      if (!invited?.user?.id) throw new Error("No invited user id returned from Supabase Auth");
      userId = invited.user.id;
    }
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
    let clientId = existingClient?.id || null;
    let reusedClient = Boolean(existingClient?.id);
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
    } else {
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
      clientId = createdClient.id;
      reusedClient = false;
    }

    try {
      const clientFirstName = firstName(name, email);
      const emailId = await sendPortalEmail({
        to: email,
        subject: "Velkommen til din personlige utviklingsportal",
        html: welcomeEmailHtml(clientFirstName, actionLink as string),
        text: welcomeEmailText(clientFirstName, actionLink as string),
        errorMessage: "Kunne ikke sende velkomstmailen.",
      });
      return jsonResponse({ success: true, userId, clientId, reusedClient, emailSent: true, emailId });
    } catch (emailError) {
      const emailMessage = emailError instanceof Error ? emailError.message : "Kunne ikke sende velkomstmailen.";
      console.log("client created without welcome email:", emailMessage);
      return jsonResponse({ success: true, userId, clientId, reusedClient, emailSent: false, emailError: emailMessage });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log("invite-user error:", message);
    return jsonResponse({ error: message }, 400);
  }
});
