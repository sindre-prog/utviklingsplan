const SUPABASE_URL = "https://upuffmfgsxlzybifxveg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YLVxFqksi1wCmh-jF14mLA_0AGV03Gq";
const CONSENT_VERSION = "coaching-portal-v1";

const EXPERIMENT_STATUS = {
  planned: "Planlagt",
  active: "I gang",
  reviewed: "Prøvd og reflektert",
  continued: "Videreføres",
  closed: "Avsluttet"
};
const EXPERIMENT_STATUS_OPTIONS = Object.entries(EXPERIMENT_STATUS);

const EXPERIMENT_STATUS_LEGACY_MAP = {
  todo: "planned",
  doing: "active",
  testing: "active",
  done: "reviewed",
  dropped: "closed"
};

const RESOURCE_TYPE_OPTIONS = [
  ["article", "Artikkel"],
  ["exercise", "Øvelse"],
  ["reflection", "Refleksjon"],
  ["worksheet", "Arbeidsark"],
  ["assessment", "Kartlegging"],
  ["audio", "Lyd"],
  ["video", "Video"],
  ["framework", "Rammeverk"],
  ["template", "Mal"],
  ["guided_session", "Veiledet økt"]
];
const RESOURCE_FORMAT_OPTIONS = [
  ["native", "Native"],
  ["pdf", "PDF"],
  ["audio", "Lyd"],
  ["video", "Video"],
  ["link", "Lenke"],
  ["mixed", "Blandet"]
];
const RESOURCE_PHASE_OPTIONS = [
  ["direction", "Retning"],
  ["focus", "Utviklingsfokus"],
  ["experiment", "Eksperiment"],
  ["observation", "Observasjon"],
  ["session", "Samtale"],
  ["reflection", "Refleksjon"],
  ["adjustment", "Justering"]
];
const RESOURCE_STATUS_OPTIONS = [
  ["draft", "Utkast"],
  ["published", "Publisert"],
  ["archived", "Arkivert"]
];
const RESOURCE_VISIBILITY_OPTIONS = [
  ["admin", "Kun admin"],
  ["coach", "Coach"],
  ["client_assignable", "Kan sendes til klient"]
];
const RESOURCE_REVIEW_STATUS_OPTIONS = [
  ["draft", "Utkast"],
  ["approved_for_pilot", "Faglig godkjent"],
  ["reviewed", "Vurdert"],
  ["needs_revision", "Må revideres"]
];
const RESOURCE_FILE_TYPE_OPTIONS = [
  ["illustration", "Illustrasjon"],
  ["printable", "Print/PDF"],
  ["attachment", "Vedlegg"],
  ["audio", "Lyd"],
  ["video", "Video"]
];
const RESOURCE_BLOCK_TYPE_LABELS = {
  intro: "Intro",
  text: "Tekstseksjon",
  callout: "Callout",
  model_cards: "Modellkort",
  quote: "Sitat",
  worksheet: "Arbeidsfelt i ressursen",
  reflection_questions: "Refleksjonsspørsmål",
  illustration: "Illustrasjon",
  download: "Nedlasting"
};
const RESOURCE_BLOCK_ADD_TYPES = ["intro", "text", "callout", "model_cards", "quote", "worksheet", "reflection_questions", "illustration", "download"];
const RESOURCE_CALLOUT_TONES = [
  ["note", "Nøytral"],
  ["coach", "Coach-kommentar"],
  ["attention", "Viktig"]
];
const RESOURCE_DIFFICULTY_OPTIONS = [
  ["", "Ikke satt"],
  ["easy", "Enkel"],
  ["medium", "Middels"],
  ["advanced", "Avansert"]
];
const RESOURCE_CONTEXT_OPTIONS = [
  ["program", "Forløp"],
  ["focus_area", "Fokusoppdrag"],
  ["session", "Samtale"],
  ["experiment", "Eksperiment"],
  ["reflection", "Refleksjon"]
];

const state = {
  sb: null,
  user: null,
  profile: null,
  coach: null,
  client: null,
  coaches: [],
  clients: [],
  programSummaries: {},
  programCache: {},
  view: "clients",
  selectedClientId: null,
  dirty: false,
  saveTimer: null,
  modal: null,
  drawer: null,
  confirmResolve: null,
  messageResolve: null,
  inlineEditKey: null,
  selectedFocusIndex: 0,
  selectedSessionIndex: 0,
  resourceCache: null,
  selectedResourceSlug: null,
  selectedSharedResourceId: null,
  selectedSharedResourceProgramId: null,
  sharedResourceQuery: "",
  resourceLibraryPromise: null,
  leadershipLibraryPromise: null,
  selectedCompetencyId: null,
  focusView: "competencies",
  experimentView: "active",
  experimentFilter: "all",
  reflectionComposerOpen: false,
  previewCompetencyId: null,
  competencyChooserQuery: "",
  competencyChooserCategory: "all",
  passwordSessionUserId: null
};

const planFields = [
  ["c_purpose", "Mål", "textarea"],
  ["c_success", "Tegn på bevegelse", "textarea"],
  ["c_expect_client", "Forventninger til klient", "textarea"],
  ["c_expect_coach", "Forventninger til coach", "textarea"],
  ["c_practical", "Praktiske rammer", "textarea"],
  ["c_confidentiality", "Konfidensialitet", "textarea"],
  ["c_context", "Interessenter og kontekst", "textarea"]
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function normalizeExperimentStatus(status) {
  const value = status || "planned";
  return EXPERIMENT_STATUS[value] ? value : EXPERIMENT_STATUS_LEGACY_MAP[value] || "planned";
}

function experimentStatusLabel(status) {
  return EXPERIMENT_STATUS[normalizeExperimentStatus(status)];
}

function isExperimentClosed(status) {
  return normalizeExperimentStatus(status) === "closed";
}

function isExperimentReviewed(status) {
  return ["reviewed", "continued", "closed"].includes(normalizeExperimentStatus(status));
}

function isExperimentActive(status) {
  return !isExperimentReviewed(status);
}

function userFacingError(error, fallback = "Noe gikk galt. Prøv igjen.") {
  const message = String(error?.message || "").trim();
  if (error) console.error(error);
  if (!message) return fallback;
  const technical = /supabase|postgres|postgrest|\brls\b|row.level|relation |column |constraint|schema|migration|seed|\brpc\b|\bquery\b|jwt|auth\.|permission denied|duplicate key|violates|module/i;
  return technical.test(message) ? fallback : message;
}

function isClientCompetencyOwner() {
  return state.profile?.role === "client";
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value === null || value === undefined) return;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value === true ? "" : value);
  });
  children.forEach((child) => node.append(child));
  return node;
}

function icon(name) {
  return el("i", { "data-lucide": name });
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function setScreen(name) {
  $$("[data-screen]").forEach((screen) => screen.classList.toggle("hidden", screen.dataset.screen !== name));
}

function setMessage(id, text, type = "") {
  const msg = $(id);
  msg.textContent = text || "";
  msg.className = "form-message" + (type ? ` ${type}` : "");
}

async function init() {
  const initialHash = window.location.hash || "";
  const initialSearch = window.location.search || "";
  const urlParams = new URLSearchParams(initialSearch);
  const hashParams = new URLSearchParams(initialHash.replace(/^#/, ""));
  const authType = urlParams.get("type") || hashParams.get("type");
  const authCode = urlParams.get("code");
  const tokenHash = urlParams.get("token_hash") || hashParams.get("token_hash");
  const accessToken = hashParams.get("access_token") || urlParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token") || urlParams.get("refresh_token");
  const hasAuthTokens = Boolean(accessToken || refreshToken);
  const isPasswordFlow = ["invite", "recovery"].includes(authType) || Boolean(authCode) || Boolean(tokenHash) || hasAuthTokens;
  const hasAuthCallback = Boolean(authCode) || Boolean(tokenHash) || hasAuthTokens;

  state.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  state.sb.auth.onAuthStateChange((event, session) => {
    if ((event === "PASSWORD_RECOVERY" || (isPasswordFlow && event === "SIGNED_IN")) && session?.user) {
      state.user = session.user;
      state.passwordSessionUserId = session.user.id;
      setScreen("password");
      refreshIcons();
    }
  });
  bindAuth();
  let authError = null;
  if (isPasswordFlow && hasAuthCallback) {
    await state.sb.auth.signOut({ scope: "local" }).catch(() => {});
    state.user = null;
    state.profile = null;
    state.passwordSessionUserId = null;
  }
  if (tokenHash && ["invite", "recovery"].includes(authType)) {
    const { error } = await state.sb.auth.verifyOtp({ token_hash: tokenHash, type: authType });
    authError = error;
    window.history.replaceState(null, "", window.location.pathname);
  } else if (authCode) {
    const { error } = await state.sb.auth.exchangeCodeForSession(authCode);
    authError = error;
    window.history.replaceState(null, "", window.location.pathname);
  } else if (accessToken && refreshToken) {
    const { error } = await state.sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    authError = error;
    window.history.replaceState(null, "", window.location.pathname);
  }
  const { data: { session } } = await state.sb.auth.getSession();
  if (session && isPasswordFlow) {
    state.user = session.user;
    state.passwordSessionUserId = session.user.id;
    setScreen("password");
  } else if (session) {
    state.user = session.user;
    await bootstrapApp();
  } else {
    setScreen("login");
    if (authError) {
      setMessage("#login-message", `Aktiveringslenken kunne ikke åpnes: ${authError.message}`);
    } else if (isPasswordFlow) {
      setMessage("#login-message", "Aktiveringslenken kunne ikke åpnes. Be coachen sende en ny invitasjon.");
    }
  }
  refreshIcons();
}

function bindAuth() {
  $("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("#login-message", "Logger inn...");
    const email = $("#login-email").value.trim();
    const password = $("#login-password").value;
    const { data, error } = await state.sb.auth.signInWithPassword({ email, password });
    if (error) return setMessage("#login-message", "Feil e-post eller passord.");
    state.user = data.user;
    setMessage("#login-message", "");
    await bootstrapApp();
  });

  $("#forgot-password").addEventListener("click", async () => {
    const email = $("#login-email").value.trim();
    if (!email) return setMessage("#login-message", "Skriv inn e-postadressen din først.");
    const { error } = await state.sb.auth.resetPasswordForEmail(email, { redirectTo: "https://portal.raederog.no" });
    setMessage("#login-message", error ? "Noe gikk galt. Prøv igjen." : "Sjekk e-posten din for tilbakestillingslenke.", error ? "" : "success");
  });

  $("#password-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = $("#new-password").value;
    const confirm = $("#confirm-password").value;
    if (password.length < 8) return setMessage("#password-message", "Passordet må være minst 8 tegn.");
    if (password !== confirm) return setMessage("#password-message", "Passordene er ikke like.");
    setMessage("#password-message", "Setter passord...");
    const { data: { session } } = await state.sb.auth.getSession();
    if (!session?.user?.id) return setMessage("#password-message", "Aktiveringssesjonen mangler. Åpne invitasjonslenken på nytt.");
    if (state.passwordSessionUserId && session.user.id !== state.passwordSessionUserId) {
      await state.sb.auth.signOut({ scope: "local" }).catch(() => {});
      return setMessage("#password-message", "Aktiveringssesjonen stemmer ikke. Åpne invitasjonslenken på nytt.");
    }
    state.user = session.user;
    const { error } = await state.sb.auth.updateUser({ password });
    if (error) return setMessage("#password-message", `Feil: ${error.message}`);
    state.passwordSessionUserId = null;
    await state.sb
      .from("clients")
      .update({ account_activated_at: new Date().toISOString() })
      .eq("user_id", state.user.id);
    window.history.replaceState(null, "", window.location.pathname);
    await bootstrapApp();
  });

  $("#logout-button").addEventListener("click", logout);
  window.addEventListener("beforeunload", (event) => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

async function bootstrapApp() {
  const { data: profile, error } = await state.sb.from("profiles").select("*").eq("id", state.user.id).single();
  if (error || !profile) {
    await state.sb.auth.signOut();
    setScreen("login");
    return;
  }
  state.profile = profile;
  await loadReferenceData();
  setScreen("app");
  renderShell();
  $("#view-kicker").textContent = "Utviklingsplaner";
  $("#view-title").textContent = "Klienter";
  navigate(initialView());
}

async function loadReferenceData() {
  state.coach = null;
  state.client = null;
  const role = state.profile.role;
  if (role === "admin" || role === "coach") {
    const { data } = await state.sb.from("coaches").select("*").eq("user_id", state.user.id).maybeSingle();
    state.coach = isActiveRecord(data) ? data : null;
  }
  if (role === "client") {
    const { data } = await state.sb.from("clients").select("*").eq("user_id", state.user.id).maybeSingle();
    state.client = isActiveRecord(data) ? data : null;
    if (state.client && !isClientActivated(state.client)) {
      const activatedAt = new Date().toISOString();
      await state.sb
        .from("clients")
        .update({ account_activated_at: activatedAt })
        .eq("id", state.client.id);
      state.client = { ...state.client, account_activated_at: activatedAt };
    }
  }
  const { data: coaches } = await state.sb.from("coaches").select("*").order("name");
  state.coaches = (coaches || []).filter(isActiveRecord);
  let clients = [];
  if (state.profile.role === "client") {
    clients = state.client ? [state.client] : [];
  } else if (state.profile.role === "coach") {
    const query = state.coach?.id
      ? state.sb.from("clients").select("*").contains("coach_ids", [state.coach.id]).order("name")
      : Promise.resolve({ data: [] });
    const { data } = await query;
    clients = data || [];
  } else {
    const { data, error } = await state.sb.rpc("get_admin_client_overview");
    if (error && !isMissingFunctionError(error)) throw error;
    if (!error) {
      clients = data || [];
    } else {
      clients = await loadAdminClientFallback();
    }
  }
  state.clients = (clients || []).filter(isActiveRecord);
  await loadProgramSummaries();
}

async function loadAdminClientFallback() {
  const columns = "id, created_at, name, code, consent_given, consent_date, account_activated_at, consent_version, coach_ids, role, employer, user_id, email";
  const { data, error } = await state.sb
    .from("clients")
    .select(`${columns}, archived_at`)
    .order("name");
  if (!error) return data || [];
  if (!isMissingColumnError(error)) return [];
  const { data: fallbackData } = await state.sb
    .from("clients")
    .select(columns)
    .order("name");
  return fallbackData || [];
}

async function loadProgramSummaries() {
  state.programSummaries = {};
  const ids = state.clients.map((client) => client.id);
  if (!ids.length) return;
  const { data: programs } = await state.sb
    .from("coaching_programs")
    .select("id, client_id, status, start_date, end_date, purpose, success_criteria")
    .in("client_id", ids);
  (programs || []).forEach((program) => {
    state.programSummaries[program.client_id] = { ...program, sessionCount: 0, areaCount: 0, nextSessionDate: null };
  });
  const programIds = (programs || []).map((program) => program.id);
  if (!programIds.length) return;
  const [sessions, areas, competencies, actions, reflections, sharedResources] = await Promise.all([
    loadActiveSummaryRows("coaching_sessions", "id, program_id, session_date, created_at, updated_at, archived_at", "id, program_id, session_date", programIds),
    loadActiveSummaryRows("development_areas", "id, program_id, created_at, updated_at, archived_at", "id, program_id", programIds),
    loadActiveSummaryRows("program_competencies", "id, program_id, status, created_at, updated_at, archived_at", "id, program_id, status", programIds),
    loadActiveSummaryRows("session_actions", "id, program_id, status, due_date, created_at, updated_at, archived_at", "id, program_id, status, due_date", programIds),
    loadActiveSummaryRows("client_reflections", "id, program_id, visibility, created_at", "id, program_id, visibility, created_at", programIds),
    loadActiveSummaryRows("shared_resources", "id, program_id, status, shared_at, viewed_at, reflected_at, created_at, updated_at, archived_at", "id, program_id, status, viewed_at, reflected_at", programIds)
  ]);
  (sessions || []).forEach((session) => {
    const summary = Object.values(state.programSummaries).find((item) => item.id === session.program_id);
    if (summary) {
      summary.sessionCount += 1;
      registerSummaryActivity(summary, session, ["updated_at", "created_at"], "Samtalenotat endret");
      if (session.session_date) {
        const sessionTime = new Date(session.session_date).getTime();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (sessionTime >= today.getTime()) {
          const currentTime = summary.nextSessionDate ? new Date(summary.nextSessionDate).getTime() : Number.POSITIVE_INFINITY;
          if (sessionTime < currentTime) summary.nextSessionDate = session.session_date;
        }
      }
    }
  });
  (areas || []).forEach((area) => {
    const summary = Object.values(state.programSummaries).find((item) => item.id === area.program_id);
    if (summary) {
      summary.areaCount += 1;
      registerSummaryActivity(summary, area, ["updated_at", "created_at"], "Fokus endret");
    }
  });
  (competencies || []).forEach((competency) => {
    const summary = Object.values(state.programSummaries).find((item) => item.id === competency.program_id);
    if (!summary) return;
    if (competency.status === "active") summary.activeCompetencyCount = (summary.activeCompetencyCount || 0) + 1;
    if (competency.status === "suggested") summary.suggestedCompetencyCount = (summary.suggestedCompetencyCount || 0) + 1;
    registerSummaryActivity(summary, competency, ["updated_at", "created_at"], competency.status === "suggested" ? "Fokus foreslått" : "Lederkompetanse endret");
  });
  (actions || []).forEach((action) => {
    const summary = Object.values(state.programSummaries).find((item) => item.id === action.program_id);
    if (!summary) return;
    registerSummaryActivity(summary, action, ["updated_at", "created_at"], "Arbeidsnotat endret");
    if (isExperimentActive(action.status)) {
      summary.activeExperimentCount = (summary.activeExperimentCount || 0) + 1;
      if (action.due_date && action.due_date < localIsoDate()) summary.overdueExperimentCount = (summary.overdueExperimentCount || 0) + 1;
    } else {
      summary.reviewedExperimentCount = (summary.reviewedExperimentCount || 0) + 1;
    }
  });
  (reflections || []).forEach((reflection) => {
    const summary = Object.values(state.programSummaries).find((item) => item.id === reflection.program_id);
    if (!summary) return;
    if (reflection.visibility === "shared_with_coach") summary.sharedReflectionCount = (summary.sharedReflectionCount || 0) + 1;
    registerSummaryActivity(summary, reflection, ["created_at"], reflection.visibility === "shared_with_coach" ? "Refleksjon delt" : "Refleksjon opprettet");
  });
  (sharedResources || []).forEach((resource) => {
    const summary = Object.values(state.programSummaries).find((item) => item.id === resource.program_id);
    if (!summary) return;
    summary.sharedResourceCount = (summary.sharedResourceCount || 0) + 1;
    registerSummaryActivity(summary, resource, ["reflected_at", "viewed_at", "updated_at", "shared_at", "created_at"], resource.reflected_at ? "Ressurs besvart" : resource.viewed_at ? "Ressurs åpnet" : "Ressurs delt");
    if (resource.status === "assigned" && !resource.viewed_at && !resource.reflected_at) {
      summary.newSharedResourceCount = (summary.newSharedResourceCount || 0) + 1;
    }
  });
}

function registerSummaryActivity(summary, record, fields, label) {
  const timestamp = fields
    .map((field) => record?.[field])
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => Number.isFinite(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  if (!timestamp) return;
  const current = summary.lastActivityAt ? new Date(summary.lastActivityAt) : null;
  if (!current || timestamp.getTime() > current.getTime()) {
    summary.lastActivityAt = timestamp.toISOString();
    summary.lastActivityLabel = label;
  }
}

async function loadActiveSummaryRows(tableName, columns, fallbackColumns, programIds) {
  const { data, error } = await state.sb
    .from(tableName)
    .select(columns)
    .in("program_id", programIds);
  if (!error) return (data || []).filter(isActiveRecord);
  if (!isMissingColumnError(error)) return [];
  const { data: fallbackData } = await state.sb
    .from(tableName)
    .select(fallbackColumns)
    .in("program_id", programIds);
  return fallbackData || [];
}

function isActiveRecord(record) {
  return !record?.archived_at;
}

function renderShell() {
  $("#user-name").textContent = state.user.email || state.profile.name || "Bruker";
  const nav = [
    ["clients", state.profile.role === "client" ? "file-text" : "users", "Klienter"],
    state.profile.role !== "client" && ["resources", "library", "Ressurser"],
    state.profile.role === "admin" && ["admin", "shield-check", "Administrasjon"]
  ].filter(Boolean);
  const navList = $("#nav-list");
  navList.replaceChildren(...nav.map(([view, iconName, label]) => {
    return el("button", { class: "nav-item", "data-view": view, onclick: () => navigate(view), text: label });
  }));
  refreshIcons();
}

function navigate(view, clientId = null) {
  state.view = view;
  if (clientId) state.selectedClientId = clientId;
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view || (view === "plan" && item.dataset.view === "clients")));
  const routes = {
    clients: renderClients,
    plan: renderPlan,
    resources: renderResources,
    admin: renderAdmin
  };
  (routes[view] || renderClients)();
  refreshIcons();
}

function setHeader(kicker, title, actions = [], description = "") {
  $("#view-kicker").textContent = kicker;
  $("#view-title").textContent = title;
  const descriptionNode = $("#view-description");
  if (descriptionNode) {
    descriptionNode.textContent = description;
    descriptionNode.hidden = !description;
  }
  $("#topline-actions").replaceChildren(...actions);
}

function metric(label, value, iconName, help) {
  const tone = label.toLowerCase().replaceAll(" ", "-");
  return el("div", { class: `panel metric-card metric-card--${tone}` }, [
    el("div", { class: "meta-row" }, [el("span", { class: "badge", text: label }), icon(iconName)]),
    el("h2", { text: value }),
    el("p", { class: "muted", text: help })
  ]);
}

function mainStat(label, value, detail, iconName) {
  return el("div", { class: "main-stat" }, [
    el("span", { class: "main-stat-icon", "aria-hidden": "true" }, [icon(iconName)]),
    el("div", { class: "main-stat-copy" }, [
      el("strong", { text: value }),
      el("span", { text: label }),
      el("small", { text: detail })
    ])
  ]);
}

function filterMenu(options, initialValue, ariaLabel, onChange) {
  const current = el("span", { class: "filter-menu-current" });
  const menu = el("div", { class: "filter-menu-list", role: "listbox", hidden: true });
  const trigger = el("button", {
    class: "filter-menu-button",
    type: "button",
    "aria-haspopup": "listbox",
    "aria-expanded": "false",
    "aria-label": ariaLabel
  }, [current, icon("chevron-down")]);
  const root = el("div", { class: "filter-menu" }, [trigger, menu]);
  root.value = initialValue;

  const close = () => {
    root.classList.remove("open");
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    $$(".filter-menu.open").forEach((item) => {
      if (item !== root) item.querySelector(".filter-menu-button")?.click();
    });
    root.classList.add("open");
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  };
  const sync = () => {
    const selected = options.find((option) => option.value === root.value) || options[0];
    root.value = selected.value;
    current.textContent = selected.label;
    menu.replaceChildren(...options.map((option) => {
      const active = option.value === root.value;
      return el("button", {
        class: `filter-menu-option ${active ? "active" : ""}`,
        type: "button",
        role: "option",
        "aria-selected": active ? "true" : "false",
        onclick: (event) => {
          event.stopPropagation();
          root.value = option.value;
          sync();
          close();
          onChange?.(root.value);
        }
      }, [
        el("span", { class: "filter-menu-check", text: active ? "✓" : "" }),
        el("span", { text: option.label })
      ]);
    }));
    refreshIcons();
  };

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    if (root.classList.contains("open")) close();
    else open();
  });
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      open();
      menu.querySelector(".filter-menu-option")?.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) close();
  });
  sync();
  return root;
}

function renderClients() {
  if (state.profile.role === "client") return navigate("plan", state.client?.id);
  const createInviteAction = (variant = "primary") => button("Inviter klient", variant === "ghost" ? "mail-plus" : "user-plus", () => openClientInvite(), variant);
  setHeader(
    "Klientarbeid",
    "Klienter",
    canInviteClient() ? [createInviteAction()] : [],
    "Se status, siste aktivitet og åpne klientplaner når du trenger kontekst."
  );
  const content = $("#content");
  const visibleClients = getVisibleClients();
  const filterCoaches = state.profile.role === "admin" ? state.coaches : (state.coach ? [state.coach] : []);
  const recentActivityCount = clientActivityItems(visibleClients).length;
  const upcomingSessionCount = visibleClients.filter((client) => state.programSummaries[client.id]?.nextSessionDate).length;
  const search = el("input", { class: "search", placeholder: "Søk etter navn, e-post, coach eller arbeidsgiver" });
  const results = el("div");
  const render = () => {
    const filtered = sortClients(filterClients(visibleClients, search.value, coachFilter.value), sortFilter.value);
    results.replaceChildren(clientGrid(filtered));
  };
  const coachFilter = filterMenu([
    { value: "all", label: "Alle coacher" },
    ...filterCoaches.map((coach) => ({ value: coach.id, label: coach.name || "Uten navn" }))
  ], "all", "Filtrer på coach", render);
  const sortFilter = filterMenu([
    { value: "name", label: "Navn A-Å" },
    { value: "recent-activity", label: "Sist aktivitet" },
    { value: "next-session", label: "Neste samtale" },
    { value: "created-desc", label: "Opprettet nyest" },
    { value: "created-asc", label: "Opprettet eldst" }
  ], "name", "Sorter klienter", render);
  search.addEventListener("input", render);
  content.replaceChildren(
    el("main", { class: "main-area main-clients-area" }, [
      el("section", { class: "main-summary-strip", "aria-label": "Nøkkeltall" }, [
        mainStat("Nylig aktivitet", String(recentActivityCount), "siste 14 dager", "activity"),
        mainStat("Klienter", String(visibleClients.length), "aktive i oversikten", "users"),
        mainStat("Kommende samtaler", String(upcomingSessionCount), "dato satt i planen", "calendar-days")
      ]),
      clientActivitySection(visibleClients),
      el("section", { class: "panel list-panel main-section main-client-section" }, [
        el("div", { class: "toolbar main-section-head" }, [
          el("div", {}, [
            el("p", { class: "eyebrow", text: "Utviklingsforløp" }),
            el("h2", { text: "Klientoversikt" }),
            el("p", { class: "muted", text: "Åpne en klient for å se dokumentert retning, fokus, samtaler, refleksjoner og ressurser." })
          ]),
          el("span", { class: "ui-meta", text: `${visibleClients.length} totalt` })
        ]),
        el("div", { class: "main-control-bar" }, [
          el("div", { class: "filter-row client-filter-row" }, [search, coachFilter, sortFilter])
        ]),
        results
      ]),
    ].filter(Boolean))
  );
  render();
}

function clientActivitySection(clients) {
  const items = clientActivityItems(clients);
  if (!items.length) return null;
  return el("section", { class: "client-activity main-section", "aria-label": "Siste klientaktivitet" }, [
    el("div", { class: "client-activity-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Siste aktivitet" }),
        el("h2", { text: "Nylige oppdateringer" }),
        el("p", { class: "muted", text: "Klienter der noe er lagt til eller endret de siste 14 dagene." })
      ]),
      el("span", { class: "ui-status-pill", text: `${items.length} nylig oppdatert${items.length === 1 ? "" : "e"}` })
    ]),
    el("div", { class: "client-activity-grid" }, items.slice(0, 4).map((item) => clientActivityCard(item)))
  ]);
}

function clientActivityItems(clients) {
  return clients
    .map((client) => ({ client, activity: clientActivitySignal(client) }))
    .filter((item) => item.activity.recent)
    .sort((a, b) => b.activity.time - a.activity.time || (a.client.name || "").localeCompare(b.client.name || "", "nb", { sensitivity: "base" }));
}

function clientActivitySignal(client) {
  const program = state.programSummaries[client.id];
  const activityTime = program?.lastActivityAt ? new Date(program.lastActivityAt).getTime() : 0;
  if (activityTime) {
    return {
      time: activityTime,
      tone: "recent",
      iconName: "activity",
      label: program.lastActivityLabel || "Plan oppdatert",
      detail: formatRelativeDate(program.lastActivityAt),
      meta: program.nextSessionDate ? `Neste samtale ${formatDate(program.nextSessionDate)}` : "Neste samtale ikke planlagt",
      recent: isRecentDate(program.lastActivityAt)
    };
  }
  if (!isClientActivated(client)) {
    return {
      time: 0,
      tone: "quiet",
      iconName: "user-round-clock",
      label: "Venter på aktivering",
      detail: "Ingen aktivitet registrert ennå.",
      meta: "Tilgang sendt",
      recent: false
    };
  }
  if (!hasClientConsent(client)) {
    return {
      time: 0,
      tone: "quiet",
      iconName: "shield-alert",
      label: "Mangler samtykke",
      detail: "Klienten har ikke gitt samtykke i portalen.",
      meta: "Avventer",
      recent: false
    };
  }
  return {
    time: 0,
    tone: "quiet",
    iconName: "circle-check",
    label: "Ingen ny aktivitet",
    detail: hasProgramContent(program) ? "Ingen endringer de siste 14 dagene." : "Ingen aktivitet registrert ennå.",
    meta: program?.nextSessionDate ? `Neste samtale ${formatDate(program.nextSessionDate)}` : "Ingen dato",
    recent: false
  };
}

function clientActivityCard({ client, activity }) {
  const name = client.name || "Uten navn";
  const canOpen = canOpenClient(client);
  return el("button", {
    class: `client-activity-card is-${activity.tone} ${canOpen ? "" : "is-locked"}`,
    type: "button",
    disabled: !canOpen,
    onclick: () => openClientPlan(client)
  }, [
    el("span", { class: "client-activity-icon", "aria-hidden": "true" }, [icon(activity.iconName)]),
    el("span", { class: "client-activity-copy" }, [
      el("strong", { text: name }),
      el("small", { text: [client.employer, client.role].filter(Boolean).join(" · ") || "Arbeidsgiver ikke satt" }),
      el("span", { class: "client-activity-signal", text: activity.label }),
      el("span", { class: "client-activity-detail", text: activity.detail })
    ]),
    el("span", { class: "client-activity-meta" }, [
      el("small", { text: activity.meta }),
      el("span", { text: canOpen ? "Åpne" : "Kun oversikt" })
    ]),
    icon("chevron-right")
  ]);
}

function clientGrid(clients) {
  if (!clients.length) return el("p", { class: "muted", text: "Ingen klienter å vise ennå." });
  return el("div", { class: "client-list" }, clients.map((client) => {
    const program = state.programSummaries[client.id];
    const canOpen = canOpenClient(client);
    const activated = isClientActivated(client);
    const hasConsent = hasClientConsent(client);
    const name = client.name || "Uten navn";
    const nextSession = program?.nextSessionDate ? formatDate(program.nextSessionDate) : "Ikke planlagt";
    const activityLabel = program?.lastActivityAt ? formatRelativeDate(program.lastActivityAt) : "Ingen aktivitet";
    return el("button", {
      class: `client-list-row ${canOpen ? "" : "is-locked"}`,
      disabled: !canOpen,
      title: canOpen ? "Åpne utviklingsplan" : "Kun oversikt. Du er ikke coach for denne klienten.",
      onclick: () => openClientPlan(client)
    }, [
      el("span", { class: "client-list-avatar", text: name.slice(0, 1).toUpperCase() }),
      el("span", { class: "client-list-primary" }, [
        el("strong", { text: name }),
        el("small", { text: [client.employer, client.role].filter(Boolean).join(" · ") || "Arbeidsgiver ikke satt" })
      ]),
      el("span", { class: "client-list-detail" }, [
        el("small", { text: "Sist aktivitet" }),
        el("strong", { text: activityLabel })
      ]),
      el("span", { class: "client-list-detail" }, [
        el("small", { text: "Neste samtale" }),
        el("strong", { text: nextSession })
      ]),
      el("span", { class: "client-list-status" }, [
        el("span", { class: `status-dot ${activated && hasConsent ? "is-ready" : "is-pending"}` }),
        el("span", { text: activated ? (hasConsent ? "Klar" : "Mangler samtykke") : "Venter på aktivering" }),
        el("small", { text: program?.sessionCount === 1 ? "1 samtale" : `${program?.sessionCount || 0} samtaler` })
      ]),
      icon("chevron-right")
    ]);
  }));
}

function renderAdmin() {
  setHeader("Plattform", "Administrasjon", [
    button("Inviter coach", "user-round-plus", () => openCoachInvite()),
    button("Inviter klient", "user-plus", () => openClientInvite(), "ghost")
  ], "Administrer mennesker, tilganger og innhold uten å åpne fortrolig klientarbeid.");
  const coachSearch = el("input", { class: "search", placeholder: "Søk coach" });
  const clientSearch = el("input", { class: "search", placeholder: "Søk klient, coach eller arbeidsgiver" });
  const coachTableSlot = el("div");
  const clientTableSlot = el("div");
  const resourceAdminSlot = el("div");
  const renderCoaches = () => {
    const q = coachSearch.value.trim().toLowerCase();
    const coaches = state.coaches.filter((coach) => [coach.name, coach.email].filter(Boolean).join(" ").toLowerCase().includes(q));
    coachTableSlot.replaceChildren(adminTable("Coacher", ["Navn", "E-post", "Status", "Klienter", ""], coaches.map((coach) => [
      coach.name || "-", coach.email || "Ikke registrert", coach.user_id ? "Innlogget" : "Ikke innlogget", String(state.clients.filter((client) => (client.coach_ids || []).includes(coach.id)).length),
      actionGroup([["Rediger", () => openCoachEdit(coach)], ["Arkiver", () => deleteCoach(coach)]])
    ])));
  };
  const renderClientsTable = () => {
    const clients = sortClients(filterClients(state.clients, clientSearch.value, adminCoachFilter.value), adminSortFilter.value);
    clientTableSlot.replaceChildren(adminTable("Alle klienter", ["Navn", "Coach", "Status", "Tilgang", ""], clients.map((client) => [
      client.name || "-", coachNames(client) || "-", clientStatusLabel(client),
      canOpenClient(client) ? "Kan åpnes" : "Kun oversikt",
      actionGroup([
        ["Åpne", () => openClientPlan(client), !canOpenClient(client)],
        ["Rediger", () => openClientEdit(client)],
        ["Arkiver", () => deleteClient(client)]
      ])
    ])));
  };
  const adminCoachFilter = filterMenu([
    { value: "all", label: "Alle coacher" },
    ...state.coaches.map((coach) => ({ value: coach.id, label: coach.name || "Uten navn" }))
  ], "all", "Filtrer klienter på coach", renderClientsTable);
  const adminSortFilter = filterMenu([
    { value: "name", label: "Navn A-Å" },
    { value: "next-session", label: "Neste samtale" },
    { value: "created-desc", label: "Opprettet nyest" },
    { value: "created-asc", label: "Opprettet eldst" }
  ], "name", "Sorter klienter", renderClientsTable);
  coachSearch.addEventListener("input", renderCoaches);
  clientSearch.addEventListener("input", renderClientsTable);
  $("#content").replaceChildren(el("main", { class: "main-area admin-area" }, [
    el("section", { class: "main-summary-strip", "aria-label": "Administrasjonsoversikt" }, [
      mainStat("Coacher", String(state.coaches.length), "med plattformtilgang", "user-round-check"),
      mainStat("Klienter", String(state.clients.length), "registrert", "users"),
      mainStat("Tilgang", "Rollebasert", "fortrolig innhold er skjermet", "shield-check")
    ]),
    el("section", { class: "panel list-panel main-section admin-section" }, [
      el("div", { class: "toolbar main-section-head" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "Team" }), el("h3", { text: "Coacher" })]),
        el("div", { class: "toolbar-actions" }, [
          button("Inviter coach", "mail-plus", () => openCoachInvite(), "ghost")
        ])
      ]),
      el("div", { class: "filter-row admin-filter-row" }, [coachSearch]),
      coachTableSlot
    ]),
    el("section", { class: "panel list-panel main-section admin-section" }, [
      el("div", { class: "toolbar main-section-head" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "Tilgang" }), el("h3", { text: "Klienter" })]),
        el("div", { class: "toolbar-actions" }, [
          button("Inviter klient", "mail-plus", () => openClientInvite(), "ghost")
        ])
      ]),
      el("p", { class: "muted", text: "Admin viser tilgang og status. Forløpsinnhold, notater og refleksjoner kan bare åpnes når du selv er coach for klienten." }),
      el("div", { class: "filter-row admin-filter-row" }, [clientSearch, adminCoachFilter, adminSortFilter]),
      clientTableSlot
    ]),
    resourceAdminSlot
  ]));
  renderCoaches();
  renderClientsTable();
  renderResourceAdminSection(resourceAdminSlot);
}

function adminTable(title, headers, rows) {
  return el("div", { class: "table-wrap", "aria-label": title }, [
    el("table", {}, [
      el("thead", {}, [el("tr", {}, headers.map((head) => el("th", { text: head })))]),
      el("tbody", {}, rows.length ? rows.map((row) => el("tr", {}, row.map((cell, index) => {
        const td = el("td", { "data-label": headers[index] || "Handlinger" });
        if (cell instanceof Node) td.append(cell);
        else td.textContent = cell;
        return td;
      }))) : [el("tr", {}, [el("td", { text: "Ingen rader ennå.", colspan: String(headers.length) })])])
    ])
  ]);
}

function actionGroup(actions) {
  return el("div", { class: "row-actions" }, actions.map(([label, handler, disabled = false]) => {
    const tone = ["Slett", "Arkiver"].includes(label) ? "destructive" : "ghost";
    return el("button", { class: `button ${tone}`, disabled, onclick: disabled ? null : handler, text: label });
  }));
}

async function renderResourceAdminSection(slot) {
  slot.replaceChildren(el("section", { class: "panel list-panel main-section admin-section" }, [
    el("div", { class: "toolbar main-section-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Fagbibliotek" }),
        el("h3", { text: "Ressurser" }),
        el("p", { class: "muted", text: "Opprett, kvalitetssikre og publiser innhold som kan deles med klienter." })
      ]),
      button("Ny ressurs", "plus", () => openResourceAdminEditor(), "ghost")
    ]),
    el("p", { class: "muted", text: "Henter ressursene …" })
  ]));

  const library = await ensureResourceLibrary();
  if (!library?.getAdminResources) {
    slot.replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Ressurser" }),
      el("h3", { text: "Ressursene kunne ikke åpnes" }),
      el("p", { class: "muted", text: "Last siden på nytt. Kontakt ansvarlig for portalen hvis problemet fortsetter." })
    ]));
    return;
  }

  let resources = [];
  try {
    resources = await library.getAdminResources(state.sb);
  } catch (error) {
    console.error("Could not load admin resources", error);
    slot.replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Ressurser" }),
      el("h3", { text: "Kunne ikke hente ressurser" }),
      el("p", { class: "muted", text: "Prøv å laste siden på nytt. Kontakt ansvarlig for portalen hvis problemet fortsetter." })
    ]));
    return;
  }

  const search = el("input", { class: "search", placeholder: "Søk ressurs, type eller tag" });
  const tableSlot = el("div", { class: "resource-admin-list" });
  const statusFilter = filterMenu([
    { value: "all", label: "Alle statuser" },
    { value: "draft", label: "Utkast" },
    { value: "published", label: "Publisert" },
    { value: "archived", label: "Arkivert" }
  ], "all", "Filtrer ressurser på status", () => renderTable());

  const renderTable = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = resources.filter((resource) => {
      const matchesStatus = statusFilter.value === "all" || resource.status === statusFilter.value;
      const haystack = [
        resource.title,
        resource.slug,
        resource.summary,
        resource.type,
        resource.phase,
        resource.status,
        ...(resource.tags || [])
      ].filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && (!query || haystack.includes(query));
    });
    tableSlot.replaceChildren(...(filtered.length ? filtered.map((resource) => {
      const readiness = resourceReadinessItems(resource);
      const missing = readiness.filter((item) => item.group === "minimum" && !item.done).length;
      const statusLabel = resourceLabel(RESOURCE_STATUS_OPTIONS, resource.status);
      return el("article", { class: `resource-admin-row status-${resource.status || "draft"}` }, [
        el("button", { class: "resource-admin-row-main", type: "button", onclick: () => openResourceAdminEditor(resource) }, [
          el("span", { class: "resource-admin-row-icon" }, [icon(resource.type === "worksheet" ? "clipboard-list" : "book-open")]),
          el("span", { class: "resource-admin-row-copy" }, [
            el("span", { class: "resource-admin-row-title", text: resource.title || "Uten tittel" }),
            el("span", { class: "resource-admin-row-summary", text: resource.summary || "Kort beskrivelse mangler." }),
            el("span", { class: "resource-admin-row-meta" }, [
              el("span", { class: `resource-status-pill status-${resource.status || "draft"}`, text: statusLabel }),
              el("span", { text: resourceLabel(RESOURCE_TYPE_OPTIONS, resource.type) }),
              el("span", { text: resourceLabel(RESOURCE_PHASE_OPTIONS, resource.phase) })
            ])
          ]),
          el("span", { class: `resource-readiness-compact ${missing ? "is-missing" : "is-ready"}` }, [
            icon(missing ? "circle-alert" : "circle-check"),
            el("span", { text: missing ? `${missing} obligatoriske felt mangler` : "Klar til publisering" })
          ]),
          icon("chevron-right")
        ]),
        el("div", { class: "resource-admin-row-actions" }, [
          ...(resource.status === "draft" ? [button("Publiser", "send", () => publishResource(resource), "secondary")] : []),
          el("button", {
            class: "icon-button",
            type: "button",
            title: resource.status === "archived" ? "Reaktiver" : "Arkiver",
            onclick: () => toggleResourceArchive(resource)
          }, [icon(resource.status === "archived" ? "rotate-ccw" : "archive")])
        ])
      ]);
    }) : [el("section", { class: "empty-state resource-admin-empty" }, [
      el("h3", { text: "Ingen ressurser funnet" }),
      el("p", { class: "muted", text: "Prøv et annet søk eller en annen status." })
    ])]));
    refreshIcons();
  };

  search.addEventListener("input", renderTable);
  slot.replaceChildren(el("section", { class: "panel list-panel main-section admin-section" }, [
    el("div", { class: "toolbar main-section-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Fagbibliotek" }),
        el("h3", { text: "Ressurser" }),
        el("p", { class: "muted", text: "Opprett, kvalitetssikre og publiser innhold som coacher kan dele med klienter." })
      ]),
      button("Ny ressurs", "plus", () => openResourceAdminEditor(), "ghost")
    ]),
    el("div", { class: "filter-row admin-filter-row" }, [search, statusFilter]),
    tableSlot
  ]));
  renderTable();
}

function resourceLabel(options, value) {
  return options.find(([optionValue]) => optionValue === value)?.[1] || value || "-";
}

function resourceSlug(title = "") {
  return title
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function textLines(value = "") {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function jsonText(value, fallback = []) {
  return JSON.stringify(value ?? fallback, null, 2);
}

function createResourceBlock(type = "text") {
  if (type === "intro") return { type: "intro", content: "" };
  if (type === "callout") return { type: "callout", tone: "note", heading: "Merk", content: "" };
  if (type === "model_cards") return { type: "model_cards", heading: "", cards: [{ title: "", body: "" }, { title: "", body: "" }] };
  if (type === "quote") return { type: "quote", quote: "", attribution: "" };
  if (type === "worksheet") return { type: "worksheet", heading: "Arbeidsark", fields: [""] };
  if (type === "reflection_questions") return { type: "reflection_questions", heading: "Refleksjonsspørsmål", questions: [""] };
  if (type === "illustration") return { type: "illustration", file_id: "", storage_path: "", display_name: "", key: "" };
  if (type === "download") return { type: "download", label: "", file_url: "" };
  return { type: "text", heading: "", content: "" };
}

function normalizeResourceBlocks(blocks = []) {
  return (Array.isArray(blocks) ? blocks : []).map((block) => {
    if (!block || typeof block !== "object") return createResourceBlock("text");
    const type = block.type || "text";
    if (type === "intro") return { type, content: block.content || "" };
    if (type === "callout") return { type, tone: block.tone || "note", heading: block.heading || "", content: block.content || "" };
    if (type === "model_cards") return {
      type,
      heading: block.heading || "",
      cards: normalizeModelCards(block.cards)
    };
    if (type === "quote") return { type, quote: block.quote || block.content || "", attribution: block.attribution || "" };
    if (type === "worksheet") return { type, heading: block.heading || "", fields: Array.isArray(block.fields) ? block.fields : [] };
    if (type === "reflection_questions") return { type, heading: block.heading || "Refleksjonsspørsmål", questions: Array.isArray(block.questions) ? block.questions : [] };
    if (type === "illustration") return {
      type,
      file_id: block.file_id || "",
      storage_path: block.storage_path || "",
      display_name: block.display_name || "",
      key: block.key || ""
    };
    if (type === "download") return {
      type,
      label: block.label || "",
      file_url: block.file_url || "",
      file_id: block.file_id || "",
      storage_path: block.storage_path || "",
      display_name: block.display_name || ""
    };
    return { type: "text", heading: block.heading || "", content: block.content || "" };
  });
}

function lineArray(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeModelCards(cards = []) {
  return (Array.isArray(cards) ? cards : [])
    .map((card) => ({
      title: String(card?.title || "").trim(),
      body: String(card?.body || card?.content || "").trim()
    }))
    .filter((card) => card.title || card.body)
    .slice(0, 4);
}

function modelCardsToText(cards = []) {
  return normalizeModelCards(cards)
    .map((card) => `${card.title}${card.title && card.body ? " | " : ""}${card.body}`)
    .join("\n");
}

function textToModelCards(value = "") {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...bodyParts] = line.split("|");
      return {
        title: (title || "").trim(),
        body: bodyParts.join("|").trim()
      };
    })
    .filter((card) => card.title || card.body)
    .slice(0, 4);
}

function createResourceBlockEditor(initialBlocks = [], options = {}) {
  const { getFiles = () => [], onChange = null } = options;
  let blocks = normalizeResourceBlocks(initialBlocks);
  const hidden = el("textarea", {
    name: "content_json",
    class: "resource-admin-hidden-json",
    text: jsonText(blocks),
    "aria-hidden": "true",
    tabindex: "-1"
  });
  const list = el("div", { class: "resource-block-editor-list" });
  const addSelect = el("select", { class: "resource-admin-compact-select" });
  RESOURCE_BLOCK_ADD_TYPES.forEach((value) => {
    const label = RESOURCE_BLOCK_TYPE_LABELS[value] || value;
    addSelect.append(el("option", { value, text: label }));
  });

  const serialize = () => {
    hidden.value = jsonText(blocks);
    onChange?.(blocks);
  };
  const patchBlock = (index, patch) => {
    blocks[index] = { ...blocks[index], ...patch };
    serialize();
  };
  const preserveScroll = (callback) => {
    const scrollTop = window.scrollY;
    callback();
    requestAnimationFrame(() => window.scrollTo({ top: scrollTop }));
  };
  const addBlockAfter = (index, type = addSelect.value) => {
    preserveScroll(() => {
      blocks.splice(index + 1, 0, createResourceBlock(type));
      render(index + 1);
    });
  };

  const renderBlockControls = (block, index) => {
    if (block.type === "intro") {
      return [el("textarea", { rows: "3", text: block.content || "", placeholder: "Kort intro til ressursen", oninput: (event) => patchBlock(index, { content: event.target.value }) })];
    }
    if (block.type === "worksheet") {
      return [
        el("input", { type: "text", value: block.heading || "", placeholder: "Overskrift, f.eks. Arbeidsark", oninput: (event) => patchBlock(index, { heading: event.target.value }) }),
        el("textarea", { rows: "4", text: (block.fields || []).join("\n"), placeholder: "Ett felt per linje", oninput: (event) => patchBlock(index, { fields: lineArray(event.target.value) }) })
      ];
    }
    if (block.type === "callout") {
      const toneSelect = el("select", { value: block.tone || "note", onchange: (event) => patchBlock(index, { tone: event.target.value }) });
      RESOURCE_CALLOUT_TONES.forEach(([value, label]) => {
        toneSelect.append(el("option", { value, text: label, selected: (block.tone || "note") === value }));
      });
      return [
        el("input", { type: "text", value: block.heading || "", placeholder: "Overskrift, f.eks. Merk", oninput: (event) => patchBlock(index, { heading: event.target.value }) }),
        el("textarea", { rows: "4", text: block.content || "", placeholder: "Kort tekst som skal løftes frem", oninput: (event) => patchBlock(index, { content: event.target.value }) }),
        toneSelect
      ];
    }
    if (block.type === "model_cards") {
      return [
        el("input", { type: "text", value: block.heading || "", placeholder: "Valgfri overskrift", oninput: (event) => patchBlock(index, { heading: event.target.value }) }),
        el("textarea", {
          rows: "5",
          text: modelCardsToText(block.cards || []),
          placeholder: "Ett kort per linje: Tittel | Forklaring",
          oninput: (event) => patchBlock(index, { cards: textToModelCards(event.target.value) })
        }),
        el("p", { class: "resource-admin-inline-help", text: "Bruk 2-4 kort. Eksempel: Affektiv motivasjon | Lede fordi det gir mening og energi." })
      ];
    }
    if (block.type === "quote") {
      return [
        el("textarea", { rows: "3", text: block.quote || "", placeholder: "Sitat eller setning som skal løftes frem", oninput: (event) => patchBlock(index, { quote: event.target.value }) }),
        el("input", { type: "text", value: block.attribution || "", placeholder: "Valgfri kilde eller kontekst", oninput: (event) => patchBlock(index, { attribution: event.target.value }) })
      ];
    }
    if (block.type === "reflection_questions") {
      return [
        el("input", { type: "text", value: block.heading || "Refleksjonsspørsmål", placeholder: "Overskrift", oninput: (event) => patchBlock(index, { heading: event.target.value }) }),
        el("textarea", { rows: "4", text: (block.questions || []).join("\n"), placeholder: "Ett spørsmål per linje", oninput: (event) => patchBlock(index, { questions: lineArray(event.target.value) }) })
      ];
    }
    if (block.type === "illustration") {
      const illustrations = (getFiles() || []).filter((file) => file.file_type === "illustration");
      const explicitValue = block.file_id || block.storage_path || "";
      const selectedValue = explicitValue || (illustrations.length === 1 ? illustrations[0].id || illustrations[0].storage_path : "");
      const select = el("select", {
        value: selectedValue,
        onchange: (event) => {
          const file = illustrations.find((item) => item.id === event.target.value || item.storage_path === event.target.value);
          patchBlock(index, file ? {
            file_id: file.id || "",
            storage_path: file.storage_path || "",
            display_name: file.display_name || "",
            key: ""
          } : {
            file_id: "",
            storage_path: "",
            display_name: "",
            key: block.key || ""
          });
        }
      });
      select.append(el("option", { value: "", text: illustrations.length ? "Velg illustrasjon" : "Ingen illustrasjoner lastet opp ennå" }));
      illustrations.forEach((file) => {
        select.append(el("option", {
          value: file.id || file.storage_path,
          text: file.display_name,
          selected: selectedValue && (selectedValue === file.id || selectedValue === file.storage_path)
        }));
      });
      return [
        select,
        illustrations.length === 1 && !explicitValue
          ? el("p", { class: "resource-admin-inline-help", text: "Én illustrasjon er lastet opp og brukes automatisk i preview. Velg den her hvis du vil lagre koblingen eksplisitt." })
          : illustrations.length
            ? el("p", { class: "resource-admin-inline-help", text: "Velg hvilken opplastet illustrasjon denne blokken skal vise. Nye illustrasjoner legges til under Filer og bilder." })
          : el("p", { class: "resource-admin-inline-help", text: "Last opp en fil med type Illustrasjon under Filer og bilder, og velg den her etterpå." }),
        el("details", { class: "resource-admin-advanced" }, [
          el("summary", { text: "Avansert: bruk gammel illustrasjonsnøkkel" }),
          el("input", {
            type: "text",
            value: block.key || "",
            placeholder: "f.eks. control_circle",
            oninput: (event) => patchBlock(index, {
              key: event.target.value,
              file_id: "",
              storage_path: "",
              display_name: ""
            })
          })
        ])
      ];
    }
    if (block.type === "download") {
      const downloadableFiles = (getFiles() || []).filter((file) => ["printable", "attachment"].includes(file.file_type));
      const selectedValue = block.file_id || block.storage_path || "";
      const select = el("select", {
        value: selectedValue,
        onchange: (event) => {
          const file = downloadableFiles.find((item) => item.id === event.target.value || item.storage_path === event.target.value);
          patchBlock(index, file ? {
            file_id: file.id || "",
            storage_path: file.storage_path || "",
            display_name: file.display_name || "",
            label: block.label || (file.file_type === "printable" ? "Last ned PDF" : "Last ned vedlegg")
          } : {
            file_id: "",
            storage_path: "",
            display_name: ""
          });
        }
      });
      select.append(el("option", { value: "", text: downloadableFiles.length ? "Velg nedlastbar fil" : "Ingen PDF-er eller vedlegg lastet opp ennå" }));
      downloadableFiles.forEach((file) => {
        select.append(el("option", {
          value: file.id || file.storage_path,
          text: `${file.display_name} (${resourceLabel(RESOURCE_FILE_TYPE_OPTIONS, file.file_type)})`,
          selected: selectedValue && (selectedValue === file.id || selectedValue === file.storage_path)
        }));
      });
      return [
        el("input", { type: "text", value: block.label || "", placeholder: "Lenketekst", oninput: (event) => patchBlock(index, { label: event.target.value }) }),
        select,
        downloadableFiles.length
          ? el("p", { class: "resource-admin-inline-help", text: "Nedlastingsblokker vises i klientressursen der blokken ligger." })
          : el("p", { class: "resource-admin-inline-help", text: "Last opp en fil med type Print/PDF eller Vedlegg under Filer og bilder først." })
      ];
    }
    return [
      el("input", { type: "text", value: block.heading || "", placeholder: "Overskrift", oninput: (event) => patchBlock(index, { heading: event.target.value }) }),
      el("textarea", { rows: "4", text: block.content || "", placeholder: "Tekst", oninput: (event) => patchBlock(index, { content: event.target.value }) })
    ];
  };

  const render = (highlightIndex = -1) => {
    serialize();
    list.replaceChildren(...blocks.map((block, index) => el("article", { class: "resource-block-editor-card" }, [
      el("div", { class: "resource-block-editor-head" }, [
        el("strong", { text: RESOURCE_BLOCK_TYPE_LABELS[block.type] || "Blokk" }),
        el("div", { class: "resource-block-editor-actions" }, [
          el("button", { class: "button ghost", type: "button", disabled: index === 0, title: "Flytt opp", onclick: () => preserveScroll(() => { [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]]; render(index - 1); }) }, [icon("arrow-up")]),
          el("button", { class: "button ghost", type: "button", disabled: index === blocks.length - 1, title: "Flytt ned", onclick: () => preserveScroll(() => { [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]]; render(index + 1); }) }, [icon("arrow-down")]),
          el("button", { class: "button ghost", type: "button", title: "Slett blokk", onclick: () => preserveScroll(() => { blocks.splice(index, 1); render(); }) }, [icon("trash-2")])
        ])
      ]),
      el("div", { class: "resource-block-editor-fields" }, renderBlockControls(block, index)),
      el("div", { class: "resource-block-editor-insert" }, [
        el("button", { class: "button ghost", type: "button", onclick: () => addBlockAfter(index) }, [
          icon("plus"),
          el("span", { text: "Legg til under" })
        ])
      ])
    ])));
    if (highlightIndex >= 0) {
      list.children[highlightIndex]?.classList.add("resource-block-editor-card--new");
    }
    refreshIcons();
  };

  const editor = el("div", { class: "resource-block-editor" }, [
    hidden,
    el("div", { class: "resource-admin-helper-card" }, [
      el("strong", { text: "Innholdsblokker" }),
      el("p", { text: "Bygg ressursen med enkle blokker. Dette lagres strukturert, men du slipper å skrive JSON." })
    ]),
    list,
    el("div", { class: "resource-block-editor-add" }, [
      addSelect,
      el("button", { class: "button secondary", type: "button", onclick: () => addBlockAfter(blocks.length - 1) }, [
        icon("plus"),
        el("span", { text: "Legg til nederst" })
      ])
    ])
  ]);
  editor.refresh = render;
  render();
  return editor;
}

function createResourceAdminPreview(library, getResourceDraft) {
  const previewSlot = el("div", { class: "resource-admin-preview-slot" });
  const renderPreview = () => {
    try {
      previewSlot.replaceChildren(library.createResourcePreview(getResourceDraft(), {
        createElement: el,
        createIcon: icon,
        onOpenFile: openResourceFile,
        audience: "client"
      }));
      hydrateResourceMedia(previewSlot);
      refreshIcons();
    } catch (error) {
      previewSlot.replaceChildren(el("p", { class: "muted", text: userFacingError(error, "Kunne ikke vise forhåndsvisningen.") }));
    }
  };
  const wrapper = el("section", { class: "resource-admin-preview" }, [
    el("div", { class: "resource-admin-preview-head" }, [
      el("div", {}, [
        el("strong", { text: "Dette ser klienten" }),
        el("p", { text: "Forhåndsvisningen oppdateres mens du skriver." })
      ]),
      el("button", { class: "button secondary", type: "button", onclick: renderPreview }, [
        icon("refresh-cw"),
        el("span", { text: "Oppdater" })
      ])
    ]),
    previewSlot
  ]);
  setTimeout(() => {
    let timer = null;
    const schedulePreview = () => {
      clearTimeout(timer);
      timer = setTimeout(renderPreview, 180);
    };
    const form = $("#drawer-form");
    if (form?._resourcePreviewHandler) {
      form.removeEventListener("input", form._resourcePreviewHandler);
      form.removeEventListener("change", form._resourcePreviewHandler);
    }
    if (form) form._resourcePreviewHandler = schedulePreview;
    form?.addEventListener("input", schedulePreview);
    form?.addEventListener("change", schedulePreview);
    renderPreview();
  }, 0);
  return wrapper;
}

async function openResourceFile(file) {
  const library = await ensureResourceLibrary();
  if (!library?.getResourceFileUrl || !file?.storage_path) return;
  try {
    const url = await library.getResourceFileUrl(state.sb, file.storage_path);
    const opened = window.open(url, "_blank", "noopener");
    if (!opened) window.location.href = url;
  } catch (error) {
    await showAppMessage("Kunne ikke åpne fil", userFacingError(error, "Prøv igjen."));
  }
}

async function hydrateResourceMedia(root) {
  const library = await ensureResourceLibrary();
  if (!library?.getResourceFileUrl || !root) return;
  const images = $$("img[data-storage-path]", root);
  await Promise.all(images.map(async (image) => {
    if (image.dataset.loaded === "true") return;
    try {
      image.src = await library.getResourceFileUrl(state.sb, image.dataset.storagePath);
      image.dataset.loaded = "true";
    } catch {
      image.replaceWith(el("p", { class: "muted", text: "Kunne ikke laste illustrasjonen." }));
    }
  }));
}

function createResourceFileManager(resource, library, options = {}) {
  const { onFilesChange = null } = options;
  if (!resource?.id) {
    return el("section", { class: "resource-admin-files" }, [
      el("div", { class: "resource-admin-helper-card" }, [
        el("strong", { text: "Filer og bilder" }),
        el("p", { text: "Lagre ressursen først. Deretter kan du laste opp illustrasjoner, PDF-er og andre vedlegg." })
      ])
    ]);
  }

  const fileList = el("div", { class: "resource-admin-file-list" });
  const fileInput = el("input", { type: "file" });
  const fileType = el("select", {});
  RESOURCE_FILE_TYPE_OPTIONS.forEach(([value, label]) => fileType.append(el("option", { value, text: label })));
  const displayName = el("input", { type: "text", placeholder: "Visningsnavn, valgfritt" });
  const message = el("p", { class: "form-message", role: "status" });

  const renderFiles = () => {
    const files = resource.files || [];
    const fileRow = (file) => el("div", { class: "resource-admin-file-row" }, [
      el("div", {}, [
        el("strong", { text: file.display_name }),
        el("span", { text: resourceLabel(RESOURCE_FILE_TYPE_OPTIONS, file.file_type) || file.file_type }),
        el("small", { text: ["printable", "attachment"].includes(file.file_type)
          ? "Kan velges i en nedlastingsblokk og vises for klient."
          : file.file_type === "illustration"
            ? "Kan velges i en illustrasjonsblokk."
            : "Lagret som ressursfil." })
      ]),
      el("button", { class: "button ghost", type: "button", onclick: async () => {
        if (!await confirmDelete(`Fjerne "${file.display_name}" fra ressursen?`)) return;
        await library.archiveResourceFile(state.sb, file.id);
        resource.files = files.filter((item) => item.id !== file.id);
        onFilesChange?.(resource.files);
        renderFiles();
      } }, [icon("trash-2"), el("span", { text: "Fjern" })])
    ]);
    const illustrations = files.filter((file) => file.file_type === "illustration");
    const downloads = files.filter((file) => ["printable", "attachment"].includes(file.file_type));
    const otherFiles = files.filter((file) => !["illustration", "printable", "attachment"].includes(file.file_type));
    const groups = [
      ["Illustrasjoner", "Brukes i illustrasjonsblokker inne i ressursen.", illustrations],
      ["Nedlastbare filer for klient", "PDF-er og vedlegg vises når de velges i en nedlastingsblokk.", downloads],
      ["Andre filer", "Lyd, video og andre vedlegg.", otherFiles]
    ].filter(([, , groupFiles]) => groupFiles.length);
    fileList.replaceChildren(...groups.map(([title, help, groupFiles]) => el("section", { class: "resource-admin-file-group" }, [
      el("div", {}, [
        el("strong", { text: title }),
        el("p", { text: help })
      ]),
      ...groupFiles.map(fileRow)
    ])));
    if (!files.length) fileList.replaceChildren(el("p", { class: "muted", text: "Ingen filer lagt til ennå." }));
    refreshIcons();
  };
  renderFiles();

  return el("section", { class: "resource-admin-files" }, [
    el("div", { class: "resource-admin-helper-card" }, [
      el("strong", { text: "Filer og bilder" }),
      el("p", { text: "Filer lagres privat og blir bare tilgjengelige for brukere med riktig tilgang. Ressursen fungerer også uten filer." })
    ]),
    fileList,
    el("div", { class: "resource-admin-upload" }, [
      fileInput,
      fileType,
      displayName,
      el("button", { class: "button secondary", type: "button", onclick: async () => {
        const file = fileInput.files?.[0];
        if (!file) {
          message.textContent = "Velg en fil først.";
          return;
        }
        message.textContent = "Laster opp...";
        try {
          const uploaded = await library.uploadResourceFile(state.sb, resource.id, file, {
            fileType: fileType.value,
            displayName: displayName.value.trim() || file.name,
            sortOrder: (resource.files || []).length
          });
          resource.files = [...(resource.files || []), uploaded];
          onFilesChange?.(resource.files);
          fileInput.value = "";
          displayName.value = "";
          message.textContent = "Fil lastet opp.";
          renderFiles();
        } catch (error) {
          message.textContent = userFacingError(error, "Kunne ikke laste opp filen.");
        }
      } }, [icon("upload"), el("span", { text: "Last opp" })])
    ]),
    message
  ]);
}

function parseJsonArray(value, fieldName) {
  const text = String(value || "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error("not-array");
    return parsed;
  } catch {
    throw new Error(`${fieldName} må være gyldig JSON-array.`);
  }
}

function hasPublishableContent(payload, files = []) {
  return (Array.isArray(payload.content_json) && payload.content_json.length > 0) ||
    (Array.isArray(files) && files.some((file) => !file.archived_at));
}

function validateResourceForPublish(payload, files = []) {
  const missing = [];
  if (!payload.title) missing.push("tittel");
  if (!payload.summary) missing.push("kort beskrivelse");
  if (!payload.type) missing.push("type");
  if (!payload.phase) missing.push("fase");
  if (!payload.client_intro) missing.push("intro til klient");
  if (!hasPublishableContent(payload, files)) missing.push("minst én innholdsblokk, fil eller illustrasjon");
  if (missing.length) {
    throw new Error(`Mangler: ${missing.join(", ")}.`);
  }
}

function resourceReadinessItems(payload) {
  const files = payload.files || [];
  const items = [
    ["minimum", "Tittel", Boolean(payload.title)],
    ["minimum", "Type", Boolean(payload.type)],
    ["minimum", "Fase", Boolean(payload.phase)],
    ["minimum", "Kort beskrivelse", Boolean(payload.summary)],
    ["minimum", "Intro til klient", Boolean(payload.client_intro)],
    ["minimum", "Innhold, fil eller illustrasjon", hasPublishableContent(payload, files)],
    ["recommended", "Hva ressursen skal hjelpe med", Boolean(payload.intended_outcome)],
    ["recommended", "Best brukt når", Array.isArray(payload.best_used_when) && payload.best_used_when.length > 0],
    ["recommended", "Ikke egnet når", Array.isArray(payload.not_for) && payload.not_for.length > 0],
    ["recommended", "Veiledning til coach", Boolean(payload.coach_guidance)],
    ["recommended", "Forslag til sendemelding", Boolean(payload.suggested_coach_note)],
    ["recommended", "Tags", Array.isArray(payload.tags) && payload.tags.length > 0],
    ["quality", "Faglig vurdering", payload.review_status && payload.review_status !== "draft"],
    ["quality", "Faglig grunnlag", Boolean(payload.basis)]
  ];
  return items.map(([group, label, done]) => ({ group, label, done }));
}

function createResourceReadinessPanel(getDraftResource) {
  const list = el("div", { class: "resource-readiness-list" });
  const summary = el("p", { class: "resource-admin-inline-help" });
  const panel = el("section", { class: "resource-admin-helper-card resource-readiness-panel" }, [
    el("strong", { text: "Publiseringsklar?" }),
    summary,
    list
  ]);

  const refresh = () => {
    try {
      const draft = getDraftResource();
      const items = resourceReadinessItems(draft);
      const minimumMissing = items.filter((item) => item.group === "minimum" && !item.done);
      const recommendedMissing = items.filter((item) => item.group === "recommended" && !item.done);
      const qualityMissing = items.filter((item) => item.group === "quality" && !item.done);
      summary.textContent = minimumMissing.length
        ? `Kan ikke publiseres ennå. Mangler: ${minimumMissing.map((item) => item.label).join(", ")}.`
        : recommendedMissing.length || qualityMissing.length
          ? "Kan publiseres. Noe anbefalt innhold og faglig metadata mangler fortsatt."
          : "Klar til publisering og godt utfylt.";
      list.replaceChildren(...items.map((item) => el("span", {
        class: `resource-readiness-item resource-readiness-item--${item.group} ${item.done ? "is-done" : "is-missing"}`,
        text: `${item.done ? "OK" : item.group === "minimum" ? "Mangler" : "Anbefalt"}: ${item.label}`
      })));
    } catch (error) {
      summary.textContent = userFacingError(error, "Fyll ut feltene for å se hva som mangler.");
      list.replaceChildren();
    }
  };
  setTimeout(() => {
    const form = $("#drawer-form");
    if (form?._resourceReadinessHandler) {
      form.removeEventListener("input", form._resourceReadinessHandler);
      form.removeEventListener("change", form._resourceReadinessHandler);
    }
    if (form) form._resourceReadinessHandler = refresh;
    form?.addEventListener("input", refresh);
    form?.addEventListener("change", refresh);
    refresh();
  }, 0);
  return panel;
}

function parseResourceAdminPayload(values, currentResource = null, options = {}) {
  const { validatePublished = true } = options;
  const title = values.title.trim();
  const slug = (values.slug.trim() || resourceSlug(title));
  if (!title) throw new Error("Tittel må fylles ut.");
  if (!slug) throw new Error("Slug må fylles ut.");

  const estimatedDuration = values.estimated_duration ? Number(values.estimated_duration) : null;
  if (estimatedDuration !== null && (!Number.isInteger(estimatedDuration) || estimatedDuration <= 0)) {
    throw new Error("Varighet må være et positivt heltall.");
  }

  const status = values.status || currentResource?.status || "draft";

  const payload = {
    title,
    slug,
    summary: values.summary.trim(),
    type: values.type || "framework",
    format: values.format || "native",
    phase: values.phase || "reflection",
    visibility: values.visibility || "client_assignable",
    status,
    archived_at: status === "archived" ? (currentResource?.archived_at || new Date().toISOString()) : null,
    review_status: values.review_status || "approved_for_pilot",
    language: values.language.trim() || "no",
    estimated_duration: estimatedDuration,
    difficulty: values.difficulty || null,
    intended_outcome: values.intended_outcome.trim() || null,
    best_used_when: textLines(values.best_used_when),
    not_for: textLines(values.not_for),
    coach_guidance: values.coach_guidance.trim() || null,
    client_intro: values.client_intro.trim() || null,
    suggested_coach_note: values.suggested_coach_note.trim() || null,
    default_context_types: Array.isArray(values.default_context_types) ? values.default_context_types : textLines(values.default_context_types),
    content_json: parseJsonArray(values.content_json, "Content JSON"),
    reflection_prompts: textLines(values.reflection_prompts || ""),
    next_step_prompt: values.next_step_prompt.trim() || null,
    basis: values.basis.trim() || null,
    reviewed_by: values.reviewed_by.trim() || null,
    last_reviewed_at: values.last_reviewed_at || null,
    tags: textLines(values.tags)
  };
  if (validatePublished && payload.status === "published") validateResourceForPublish(payload, currentResource?.files || []);
  return payload;
}

async function openResourceAdminEditor(resource = null) {
  if (state.profile?.role !== "admin") return;
  const library = await ensureResourceLibrary();
  if (!library?.createResource || !library?.updateResource) {
    await showAppMessage("Ressursen kan ikke redigeres", "Last siden på nytt. Kontakt ansvarlig for portalen hvis problemet fortsetter.");
    return;
  }

  const isNew = !resource?.id;
  let specs = [];
  const getDraftResource = () => {
    const form = $("#drawer-form");
    const values = form ? collectSpecValues(specs, form) : {
      title: resource?.title || "Ny ressurs",
      slug: resource?.slug || "ny-ressurs",
      summary: resource?.summary || "Ikke fylt ut ennå.",
      content_json: jsonText(resource?.content_json || [])
    };
    return {
      ...resource,
      ...parseResourceAdminPayload(values, resource, { validatePublished: false }),
      files: resource?.files || []
    };
  };

  const duplicateAction = resource?.id ? el("section", { class: "resource-admin-actions resource-admin-secondary-action" }, [
    el("div", {}, [
      el("strong", { text: "Lag variant" }),
      el("p", { text: "Dupliser når du vil lage en variant med samme struktur uten å skrive alt på nytt." })
    ]),
    el("button", {
      class: "button secondary",
      type: "button",
      onclick: async () => {
        if (!library?.duplicateResource) return;
        $("#drawer-message").textContent = "Dupliserer...";
        await library.duplicateResource(state.sb, resource.id);
        $("#entity-drawer").close();
        await renderAdmin();
      }
    }, [icon("copy"), el("span", { text: "Dupliser" })])
  ]) : null;

  let blockEditor = null;
  const refreshBlocks = () => blockEditor?.refresh?.();
  blockEditor = createResourceBlockEditor(resource?.content_json || [], {
    getFiles: () => resource?.files || [],
    onChange: () => {}
  });

  const fieldNames = [
    "title", "summary", "slug", "content_json", "next_step_prompt", "reflection_prompts",
    "intended_outcome", "best_used_when", "not_for", "coach_guidance", "client_intro",
    "suggested_coach_note", "type", "format", "phase", "estimated_duration", "difficulty",
    "default_context_types", "status", "visibility", "review_status", "language", "basis",
    "reviewed_by", "last_reviewed_at", "tags"
  ];
  const editorSection = (title, text, fields, options = {}) => {
    const body = el("div", { class: "resource-editor-section-body" }, fields.map((field) => field instanceof Node ? field : renderSpec(field)));
    if (options.collapsible) {
      return el("details", { class: "resource-editor-section resource-editor-section--details", open: options.open }, [
        el("summary", {}, [
          el("span", {}, [el("strong", { text: title }), el("small", { text })]),
          icon("chevron-down")
        ]),
        body
      ]);
    }
    return el("section", { class: "resource-editor-section" }, [
      el("div", { class: "resource-editor-section-head" }, [el("strong", { text: title }), el("p", { text })]),
      body
    ]);
  };
  const editorMain = el("div", { class: "resource-editor-main" }, [
    createResourceReadinessPanel(getDraftResource),
    editorSection("Det klienten ser", "Gi ressursen en tydelig inngang og et konkret neste steg.", [
      inputSpec("title", "Tittel", "text", resource?.title || ""),
      textareaSpec("summary", "Kort beskrivelse", resource?.summary || "", { rows: "2", placeholder: "Én kort setning som gjør ressursen lett å velge." }),
      textareaSpec("client_intro", "Introduksjon til klient", resource?.client_intro || "", { rows: "3", placeholder: "Hvorfor er dette relevant, og hvordan bør ressursen brukes?" }),
      textareaSpec("next_step_prompt", "Anbefalt neste steg", resource?.next_step_prompt || "", { rows: "2", placeholder: "Hva bør klienten gjøre etter å ha lest?" }),
      textareaSpec("reflection_prompts", "Refleksjonsspørsmål", (resource?.reflection_prompts || []).join("\n"), { rows: "3", placeholder: "Ett spørsmål per linje" })
    ]),
    editorSection("Innhold", "Bygg opp leseflyten med korte, tydelige innholdsblokker.", [
      customSpec("content_json", blockEditor),
      customSpec("resource_files", createResourceFileManager(resource, library, { onFilesChange: refreshBlocks }))
    ]),
    editorSection("Bruk i coaching", "Dette er arbeidsinformasjon for coachen og vises ikke til klienten.", [
      textareaSpec("intended_outcome", "Hva ressursen skal hjelpe med", resource?.intended_outcome || "", { rows: "3" }),
      textareaSpec("best_used_when", "Best brukt når", (resource?.best_used_when || []).join("\n"), { rows: "3", placeholder: "Ett punkt per linje" }),
      textareaSpec("not_for", "Ikke egnet når", (resource?.not_for || []).join("\n"), { rows: "3", placeholder: "Ett punkt per linje" }),
      textareaSpec("coach_guidance", "Veiledning til coach", resource?.coach_guidance || "", { rows: "4" }),
      textareaSpec("suggested_coach_note", "Forslag til sendemelding", resource?.suggested_coach_note || "", { rows: "3", placeholder: "Coachen kan redigere teksten før sending." })
    ], { collapsible: true, open: true }),
    editorSection("Publisering og metadata", "Brukes til filtrering, kvalitetssikring og synlighet.", [
      el("div", { class: "resource-editor-field-grid" }, [
        renderSpec(selectSpec("type", "Type", RESOURCE_TYPE_OPTIONS, resource?.type || "framework")),
        renderSpec(selectSpec("phase", "Fase", RESOURCE_PHASE_OPTIONS, resource?.phase || "reflection")),
        renderSpec(selectSpec("status", "Status", RESOURCE_STATUS_OPTIONS, resource?.status || "draft")),
        renderSpec(selectSpec("visibility", "Synlighet", RESOURCE_VISIBILITY_OPTIONS, resource?.visibility || "client_assignable")),
        renderSpec(inputSpec("estimated_duration", "Varighet i minutter", "number", resource?.estimated_duration || "", { min: "1" })),
        renderSpec(selectSpec("difficulty", "Vanskelighetsgrad", RESOURCE_DIFFICULTY_OPTIONS, resource?.difficulty || ""))
      ]),
      checkboxGroupSpec("default_context_types", "Kan knyttes til", RESOURCE_CONTEXT_OPTIONS, resource?.default_context_types || ["program"]),
      textareaSpec("tags", "Tags", (resource?.tags || []).join(", "), { rows: "2" }),
      el("div", { class: "resource-editor-field-grid" }, [
        renderSpec(selectSpec("review_status", "Faglig vurdering", RESOURCE_REVIEW_STATUS_OPTIONS, resource?.review_status || "draft")),
        renderSpec(inputSpec("reviewed_by", "Vurdert av", "text", resource?.reviewed_by || "")),
        renderSpec(inputSpec("last_reviewed_at", "Sist vurdert", "date", resource?.last_reviewed_at || "")),
        renderSpec(inputSpec("language", "Språk", "text", resource?.language || "no"))
      ]),
      textareaSpec("basis", "Faglig grunnlag", resource?.basis || "", { rows: "3" }),
      inputSpec("slug", "Slug", "text", resource?.slug || "", { placeholder: "Genereres automatisk fra tittelen" }),
      el("input", { type: "hidden", name: "format", value: resource?.format || "native" })
    ], { collapsible: true }),
    duplicateAction
  ].filter(Boolean));
  const editorWorkspace = el("div", { class: "resource-editor-workspace" }, [
    editorMain,
    el("aside", { class: "resource-editor-preview" }, [createResourceAdminPreview(library, getDraftResource)])
  ]);
  specs = [customSpec(fieldNames, editorWorkspace)];
  openEntityDrawer(isNew ? "Ny ressurs" : resource.title, "Fagbibliotek", specs, async (values) => {
    const payload = parseResourceAdminPayload(values, resource);
    if (isNew) await library.createResource(state.sb, payload);
    else await library.updateResource(state.sb, resource.id, payload);
    await renderAdmin();
  }, {
    panelClass: "resource-editor-drawer",
    saveLabel: isNew || resource?.status === "draft" ? "Lagre utkast" : "Lagre endringer",
    ...(resource?.id ? {
    dangerLabel: resource.status === "archived" ? "Reaktiver" : "Arkiver",
    onDanger: async () => {
      if (resource.status === "archived") await library.reactivateResource(state.sb, resource.id, "draft");
      else await library.archiveResource(state.sb, resource.id);
      await renderAdmin();
      return true;
    }
    } : {})
  });
}

async function publishResource(resource) {
  const library = await ensureResourceLibrary();
  if (!library?.updateResource) return;
  const payload = {
    ...resource,
    status: "published",
    visibility: resource.visibility || "client_assignable",
    review_status: resource.review_status || "approved_for_pilot",
    archived_at: null,
    tags: resource.tags || []
  };
  validateResourceForPublish(payload, resource.files || []);
  await library.updateResource(state.sb, resource.id, {
    status: payload.status,
    visibility: payload.visibility,
    review_status: payload.review_status,
    archived_at: payload.archived_at,
    tags: payload.tags
  });
  await renderAdmin();
}

async function toggleResourceArchive(resource) {
  const library = await ensureResourceLibrary();
  if (!library?.archiveResource || !library?.reactivateResource) return;
  if (resource.status === "archived") {
    await library.reactivateResource(state.sb, resource.id, "draft");
  } else if (await confirmDelete(`Arkivere "${resource.title}"?`)) {
    await library.archiveResource(state.sb, resource.id);
  } else {
    return;
  }
  await renderAdmin();
}

async function renderResources() {
  if (state.profile.role === "client") {
    navigate("plan", state.client?.id);
    return;
  }

  setHeader(
    "Fagbibliotek",
    "Ressurser",
    [],
    "Finn, vurder og del faglige ressurser som støtter arbeidet mellom samtalene."
  );
  const content = $("#content");
  content.replaceChildren(el("section", { class: "panel portal-loading-state", role: "status", "aria-live": "polite" }, [
    el("span", { class: "sr-only", text: "Finner ressursene dine …" }),
    el("div", { class: "loading-skeleton-line is-short" }),
    el("div", { class: "loading-skeleton-line is-title" }),
    el("div", { class: "loading-skeleton-line" })
  ]));

  const library = await ensureResourceLibrary();
  if (!library) {
    content.replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Ressurser" }),
      el("h3", { text: "Ressursene kunne ikke åpnes" }),
      el("p", { class: "muted", text: "Prøv å laste siden på nytt. Kontakt ansvarlig for portalen hvis problemet fortsetter." })
    ]));
    return;
  }

  let resources = [];
  try {
    resources = await library.getPublishedResources(state.sb);
  } catch (error) {
    console.error("Could not load published resources", error);
    content.replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Ressurser" }),
      el("h3", { text: "Kunne ikke hente ressursene" }),
      el("p", { class: "muted", text: "Prøv å laste siden på nytt. Kontakt ansvarlig for portalen hvis problemet fortsetter." })
    ]));
    return;
  }

  state.resourceCache = resources;
  if (!state.selectedResourceSlug || !resources.some((resource) => resource.slug === state.selectedResourceSlug)) {
    state.selectedResourceSlug = resources[0]?.slug || null;
  }

  const search = el("input", { class: "search", placeholder: "Søk etter tema, ressurs eller tag" });
  const listSlot = el("div", { class: "resource-list" });
  const previewSlot = el("div", { class: "resource-preview-slot" });
  const mobilePicker = el("select", {
    class: "resource-mobile-picker",
    "aria-label": "Velg ressurs",
    onchange: (event) => {
      const resource = resources.find((item) => item.slug === event.target.value);
      if (resource) selectResource(resource);
    }
  });

  const phaseFilter = filterMenu([
    { value: "all", label: "Alle faser" },
    { value: "direction", label: "Retning" },
    { value: "focus", label: "Fokus" },
    { value: "experiment", label: "Eksperiment" },
    { value: "session", label: "Samtale" },
    { value: "reflection", label: "Refleksjon" }
  ], "all", "Filtrer på fase", () => render());

  const typeFilter = filterMenu([
    { value: "all", label: "Alle typer" },
    { value: "framework", label: "Rammeverk" },
    { value: "guided_session", label: "Veiledet økt" },
    { value: "exercise", label: "Øvelse" },
    { value: "worksheet", label: "Arbeidsark" }
  ], "all", "Filtrer på type", () => render());

  const selectResource = (resource) => {
    state.selectedResourceSlug = resource.slug;
    render();
  };

  const render = () => {
    const filtered = filterResourceList(resources, {
      query: search.value,
      phase: phaseFilter.value,
      type: typeFilter.value
    });
    if (!filtered.some((resource) => resource.slug === state.selectedResourceSlug)) {
      state.selectedResourceSlug = filtered[0]?.slug || resources[0]?.slug || null;
    }
    const selected = resources.find((resource) => resource.slug === state.selectedResourceSlug) || filtered[0] || null;
    mobilePicker.replaceChildren(...filtered.map((resource) => el("option", {
      value: resource.slug,
      text: resource.title,
      selected: selected?.slug === resource.slug
    })));
    listSlot.replaceChildren(
      filtered.length
        ? el("div", { class: "resource-card-list" }, filtered.map((resource) => library.createResourceCard(resource, {
          createElement: el,
          selected: selected?.slug === resource.slug,
          onSelect: selectResource
        })))
        : el("section", { class: "panel empty-state resource-empty" }, [
          el("p", { class: "eyebrow", text: "Søk" }),
          el("h3", { text: "Ingen ressurser funnet" }),
          el("p", { class: "muted", text: "Prøv et annet søk eller fjern filtrene." })
        ])
    );
    const shareableClients = getVisibleClients().filter((client) => canShareResourceToClient(client));
    previewSlot.replaceChildren(library.createResourcePreview(selected, {
      createElement: el,
      createIcon: icon,
      onOpenFile: openResourceFile,
      primaryAction: canShareResources() ? {
        label: "Send ressurs",
        disabled: shareableClients.length === 0,
        helpText: shareableClients.length
          ? "Velg Send ressurs når du har vurdert at den passer klienten."
          : "Du har ingen klienter med åpne forløp som kan motta ressurser ennå.",
        onClick: openSendResourceDrawer
      } : null
    }));
    hydrateResourceMedia(previewSlot);
    refreshIcons();
  };

  search.addEventListener("input", render);

  content.replaceChildren(el("main", { class: "main-area resources-area" }, [
    el("section", { class: "resource-library main-section" }, [
    el("div", { class: "resource-library-head main-section-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Publisert innhold" }),
        el("h2", { text: "Bibliotek" }),
        el("p", { class: "muted", text: `${resources.length} ressurser tilgjengelig for vurdering og deling.` })
      ])
    ]),
    el("div", { class: "main-control-bar" }, [
      el("div", { class: "filter-row resource-filter-row" }, [search, phaseFilter, typeFilter, mobilePicker])
    ]),
    el("div", { class: "resource-library-grid" }, [
      el("aside", { class: "resource-library-list-panel" }, [listSlot]),
      previewSlot
    ])
  ])]));
  render();
}

function getResourceLibrary() {
  return window.RaederResourceLibrary || null;
}

async function ensureResourceLibrary() {
  const loaded = getResourceLibrary();
  if (loaded) return loaded;

  if (!state.resourceLibraryPromise) {
    state.resourceLibraryPromise = import("./js/resources/resources.api.js?v=polish-105")
      .then((library) => {
        window.RaederResourceLibrary = library;
        return library;
      })
      .catch((error) => {
        console.error("Could not load resource library module", error);
        state.resourceLibraryPromise = null;
        return null;
      });
  }

  return state.resourceLibraryPromise;
}

function getLeadershipLibrary() {
  return window.RaederLeadershipLibrary || null;
}

async function ensureLeadershipLibrary() {
  const loaded = getLeadershipLibrary();
  if (loaded) return loaded;

  if (!state.leadershipLibraryPromise) {
    state.leadershipLibraryPromise = import("./js/leadership/leadership.api.js?v=polish-128")
      .then((library) => {
        window.RaederLeadershipLibrary = library;
        return library;
      })
      .catch((error) => {
        console.error("Could not load leadership library module", error);
        state.leadershipLibraryPromise = null;
        return null;
      });
  }

  return state.leadershipLibraryPromise;
}

function canShareResources() {
  return state.profile?.role === "coach";
}

function openSendResourceDrawer(resource) {
  if (!resource || !canShareResources()) return;
  const clients = getVisibleClients().filter((client) => canShareResourceToClient(client));
  if (!clients.length) {
    showAppMessage("Ingen klienter å sende til", "Du har ingen klienter med åpne forløp som kan motta ressurser ennå.", { kicker: "Ressurser" });
    return;
  }

  const resourceSummary = el("section", { class: "send-resource-summary" }, [
    el("span", { class: "send-resource-summary-icon" }, [icon("book-open")]),
    el("div", {}, [
      el("span", { class: "eyebrow", text: "Ressursen klienten mottar" }),
      el("strong", { text: resource.title }),
      el("p", { text: resource.client_intro || resource.summary || "" })
    ])
  ]);
  openEntityDrawer(`Del ressurs`, "Fagbibliotek", [
    customSpec("send_resource_summary", resourceSummary),
    customSpec("send_resource_basis", createSendResourceBasis(resource)),
    sectionSpec("Mottaker og plassering", "Velg hvem som skal få ressursen og hvor den hører hjemme i forløpet."),
    selectSpec("clientId", "Klient", clients.map((client) => [client.id, client.name || client.email || "Uten navn"]), clients[0]?.id || ""),
    customSpec(["contextType", "contextId"], createResourceContextPicker(resource, clients)),
    sectionSpec("Personlig melding", "Forklar kort hvorfor du sender ressursen. Denne teksten vises tydelig for klienten."),
    textareaSpec("coachNote", "Melding fra deg", resource.suggested_coach_note || "", {
      placeholder: "Skriv kort hvorfor du sender ressursen, og hva klienten bør bruke den til."
    })
  ], async (values) => {
    await sendResourceToClient(resource, values);
  }, {
    panelClass: "send-resource-drawer",
    saveLabel: "Send ressurs"
  });
}

function createSendResourceBasis(resource) {
  const list = (title, items = []) => items.length ? el("div", { class: "send-resource-basis-list" }, [
    el("strong", { text: title }),
    el("ul", {}, items.map((item) => el("li", { text: item })))
  ]) : null;

  return el("details", { class: "send-resource-basis" }, [
    el("summary", {}, [
      el("span", {}, [
        el("strong", { text: "Vurdering for coach" }),
        el("small", { text: "Når ressursen passer og ikke passer" })
      ]),
      icon("chevron-down")
    ]),
    el("div", { class: "send-resource-basis-body" }, [
      resource.intended_outcome ? el("p", { text: resource.intended_outcome }) : null,
      list("Best brukt når", resource.best_used_when || []),
      list("Ikke egnet når", resource.not_for || [])
    ].filter(Boolean))
  ]);
}

function resourceDefaultContextTypes(resource) {
  const values = Array.isArray(resource?.default_context_types) && resource.default_context_types.length
    ? resource.default_context_types
    : ["program"];
  return new Set(["program", ...values]);
}

function createResourceContextPicker(resource, clients) {
  const allowed = resourceDefaultContextTypes(resource);
  const contextType = el("input", { type: "hidden", name: "contextType", value: "program" });
  const contextId = el("input", { type: "hidden", name: "contextId", value: "" });
  const picker = el("select", { class: "resource-admin-compact-select" });
  const message = el("p", { class: "resource-admin-inline-help", text: "Velg hvor ressursen skal lande hos klienten. Bruk Hele forløpet når ressursen ikke hører til én konkret samtale eller øvelse." });
  const wrapper = el("section", { class: "resource-admin-helper-card" }, [
    el("strong", { text: "Hvor skal ressursen ligge?" }),
    picker,
    contextType,
    contextId,
    message
  ]);

  const option = (type, id, label, disabled = false) => ({ type, id, label, disabled });
  const buildOptions = (data) => {
    const options = [option("program", "", "Hele forløpet")];
    if (allowed.has("focus_area")) {
      (data?.areas || []).forEach((area) => {
        options.push(option("focus_area", area.id, `Fokusoppdrag: ${area.title || "Uten tittel"}`, !area.id));
      });
    }
    if (allowed.has("session")) {
      (data?.sessions || []).forEach((session) => {
        options.push(option("session", session.id, `Samtale: ${session.focus || formatDate(session.session_date) || "Uten tittel"}`, !session.id));
      });
    }
    if (allowed.has("experiment")) {
      (data?.actions || []).forEach((action) => {
        options.push(option("experiment", action.id, `Eksperiment: ${action.title || "Uten tittel"}`, !action.id));
      });
    }
    if (allowed.has("reflection")) {
      (data?.reflections || []).forEach((reflection) => {
        const text = (reflection.body || "").trim();
        options.push(option("reflection", reflection.id, `Refleksjon: ${text ? text.slice(0, 48) : formatDate(reflection.created_at) || "Uten tittel"}`, !reflection.id));
      });
    }
    return options;
  };

  const syncValue = () => {
    const selected = picker.selectedOptions[0];
    contextType.value = selected?.dataset.contextType || "program";
    contextId.value = selected?.value || "";
  };

  const renderOptions = (options) => {
    picker.replaceChildren(...options.map((item) => el("option", {
      value: item.id,
      text: item.label,
      disabled: item.disabled,
      "data-context-type": item.type
    })));
    syncValue();
  };

  const refresh = async () => {
    const selectedClientId = $("[name='clientId']", $("#drawer-form"))?.value || clients[0]?.id;
    const client = clients.find((item) => item.id === selectedClientId);
    if (!client) {
      renderOptions([option("program", "", "Forløp")]);
      return;
    }
    message.textContent = "Gjør klart relevante plasseringer …";
    try {
      const data = await loadClientProgram(client);
      renderOptions(buildOptions(data));
      message.textContent = picker.options.length > 1
        ? "Velg en konkret plassering hvis det gjør ressursen lettere å forstå for klienten."
        : "Denne ressursen sendes på forløpsnivå.";
    } catch (error) {
      renderOptions([option("program", "", "Hele forløpet")]);
      message.textContent = userFacingError(error, "Kunne ikke hente plasseringene. Ressursen kan fortsatt sendes på forløpsnivå.");
    }
  };

  picker.addEventListener("change", syncValue);
  setTimeout(() => {
    const clientSelect = $("[name='clientId']", $("#drawer-form"));
    clientSelect?.addEventListener("change", refresh);
    refresh();
  }, 0);

  renderOptions([option("program", "", "Hele forløpet")]);
  return wrapper;
}

function canShareResourceToClient(client) {
  if (!client) return false;
  const coachId = state.coach?.id;
  return Boolean(coachId && (client.coach_ids || []).includes(coachId));
}

async function sendResourceToClient(resource, values) {
  const library = await ensureResourceLibrary();
  if (!library?.shareResourceWithClient) throw new Error("Ressursen kan ikke deles akkurat nå. Last siden på nytt og prøv igjen.");

  const client = state.clients.find((item) => item.id === values.clientId);
  if (!client) throw new Error("Velg en klient.");

  const program = await ensureClientProgram(client);
  if (!program?.id) throw new Error("Klienten mangler coachingforløp.");

  await library.shareResourceWithClient(state.sb, {
    resourceId: resource.id,
    clientId: client.id,
    programId: program.id,
    contextType: values.contextType || "program",
    contextId: values.contextId || null,
    coachNote: values.coachNote
  });
  delete state.programCache[client.id];

  setTimeout(() => {
    showAppMessage("Ressurs sendt", `${resource.title} er sendt til ${client.name || client.email || "klienten"}.`, { kicker: "Ressurser" });
  }, 0);
}

async function ensureClientProgram(client) {
  const cached = state.programCache[client.id];
  if (cached?.program) return cached.program;

  const { data, error } = await state.sb
    .from("coaching_programs")
    .select("*")
    .eq("client_id", client.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

function filterResourceList(resources, filters) {
  const query = (filters.query || "").trim().toLowerCase();
  return resources.filter((resource) => {
    const matchesQuery = !query || [
      resource.title,
      resource.summary,
      resource.intended_outcome,
      ...(resource.tags || [])
    ].filter(Boolean).join(" ").toLowerCase().includes(query);
    const matchesPhase = filters.phase === "all" || resource.phase === filters.phase;
    const matchesType = filters.type === "all" || resource.type === filters.type;
    return matchesQuery && matchesPhase && matchesType;
  });
}

async function renderPlan(activePane = null) {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  if (!client) {
    setHeader("Plan", "Ingen klient funnet");
    $("#content").replaceChildren(el("p", { class: "muted", text: "Fant ikke klientdata for denne brukeren." }));
    return;
  }
  if (!canOpenClient(client)) {
    setHeader("Klienter", "Kun oversikt");
    $("#content").replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Tilgang" }),
      el("h3", { text: "Du kan se klienten i oversikt, men ikke åpne planen." }),
      el("p", { class: "muted", text: "Adminrollen viser alle klienter, men planinnsyn er begrenset til klienter der du selv er registrert som coach." }),
      button("Tilbake til klienter", "arrow-left", () => navigate("clients"), "ghost")
    ]));
    return;
  }
  if (state.profile.role === "client" && !hasClientConsent(client)) {
    renderConsentGate(client);
    return;
  }
  state.selectedClientId = client.id;
  const headerActions = [
    state.profile.role !== "client" ? button("Tilbake", "arrow-left", () => navigate("clients"), "ghost") : null,
    button("Book coachingsamtale", "calendar-plus", () => window.open("https://raederog.no/book-time", "_blank"), "ghost")
  ].filter(Boolean);
  const isClientWorkspace = state.profile.role === "client";
  const clientFirstName = (client.name || "").trim().split(/\s+/)[0] || "";
  setHeader(
    isClientWorkspace ? "Din utviklingsplan" : "Utviklingsplan",
    isClientWorkspace ? `Velkommen tilbake${clientFirstName ? `, ${clientFirstName}` : ""}` : client.name || "Klient",
    headerActions,
    isClientWorkspace ? "Her finner du planen din og det du arbeider med mellom samtalene." : ""
  );
  $("#content").replaceChildren(el("section", { class: "panel portal-loading-state", role: "status", "aria-live": "polite" }, [
    el("span", { class: "sr-only", text: "Henter utviklingsplanen …" }),
    el("div", { class: "loading-skeleton-line is-short" }),
    el("div", { class: "loading-skeleton-line is-title" }),
    el("div", { class: "loading-skeleton-line" }),
    el("div", { class: "loading-skeleton-card" })
  ]));

  const data = await loadClientProgram(client);
  if (!data) {
    $("#content").replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Forløp" }),
      el("h3", { text: "Utviklingsplanen er ikke tilgjengelig" }),
      el("p", { class: "muted", text: "Gå tilbake og prøv igjen. Kontakt ansvarlig for portalen hvis det skjer på nytt." })
    ]));
    return;
  }
  const plan = programToFormState(data);
  const resolvedPane = activePane || defaultWorkspacePane();

  const form = el("form", { class: "client-workspace", id: "plan-form" }, [
    hiddenPlanState(plan),
    clientWorkspaceTabs(data, resolvedPane),
    el("section", { class: `workspace-pane ${resolvedPane === "now" ? "active" : ""}`, id: "workspace-pane-now", role: "tabpanel", "aria-labelledby": "workspace-tab-now", "aria-hidden": resolvedPane === "now" ? "false" : "true", "data-pane": "now" }, [
      nowWorkspace(client, data, plan)
    ]),
    el("section", { class: `workspace-pane ${resolvedPane === "direction" ? "active" : ""}`, id: "workspace-pane-direction", role: "tabpanel", "aria-labelledby": "workspace-tab-direction", "aria-hidden": resolvedPane === "direction" ? "false" : "true", "data-pane": "direction" }, [
      directionWorkspace(client, plan, data)
    ]),
    el("section", { class: `workspace-pane ${resolvedPane === "work" ? "active" : ""}`, id: "workspace-pane-work", role: "tabpanel", "aria-labelledby": "workspace-tab-work", "aria-hidden": resolvedPane === "work" ? "false" : "true", "data-pane": "work" }, [
      workWorkspace(client, data, plan)
    ]),
    el("section", { class: `workspace-pane ${resolvedPane === "sessions" ? "active" : ""}`, id: "workspace-pane-sessions", role: "tabpanel", "aria-labelledby": "workspace-tab-sessions", "aria-hidden": resolvedPane === "sessions" ? "false" : "true", "data-pane": "sessions" }, [
      sessionsWorkspace(plan.sessions, data)
    ]),
    el("section", { class: `workspace-pane ${resolvedPane === "reflections" ? "active" : ""}`, id: "workspace-pane-reflections", role: "tabpanel", "aria-labelledby": "workspace-tab-reflections", "aria-hidden": resolvedPane === "reflections" ? "false" : "true", "data-pane": "reflections" }, [
      reflectionsWorkspace(data)
    ]),
    el("section", { class: `workspace-pane ${resolvedPane === "resources" ? "active" : ""}`, id: "workspace-pane-resources", role: "tabpanel", "aria-labelledby": "workspace-tab-resources", "aria-hidden": resolvedPane === "resources" ? "false" : "true", "data-pane": "resources" }, [
      coachResourcesWorkspace(data)
    ])
  ].filter(Boolean));

  const editable = canEditProgram(client);
  if (editable) form.addEventListener("input", (event) => {
    if (event.target.closest(".ui-inline-editor")) return;
    markDirty();
  });
  $("#content").replaceChildren(el("div", { class: "plan-layout" }, [form]));
  if (!editable) setFormReadonly(form);
  setupWorkspaceTabs();
  refreshIcons();
}

function renderCachedProgram(activePane = null) {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  const data = client ? state.programCache[client.id] : null;
  const resolvedPane = activePane || defaultWorkspacePane();
  if (!client || !data) {
    reloadProgramAndRender(resolvedPane);
    return;
  }
  const plan = programToFormState(data);
  const form = el("form", { class: "client-workspace", id: "plan-form" }, [
    hiddenPlanState(plan),
    clientWorkspaceTabs(data, resolvedPane),
    el("section", { class: `workspace-pane ${resolvedPane === "now" ? "active" : ""}`, id: "workspace-pane-now", role: "tabpanel", "aria-labelledby": "workspace-tab-now", "aria-hidden": resolvedPane === "now" ? "false" : "true", "data-pane": "now" }, [
      nowWorkspace(client, data, plan)
    ]),
    el("section", { class: `workspace-pane ${resolvedPane === "direction" ? "active" : ""}`, id: "workspace-pane-direction", role: "tabpanel", "aria-labelledby": "workspace-tab-direction", "aria-hidden": resolvedPane === "direction" ? "false" : "true", "data-pane": "direction" }, [
      directionWorkspace(client, plan, data)
    ]),
    el("section", { class: `workspace-pane ${resolvedPane === "work" ? "active" : ""}`, id: "workspace-pane-work", role: "tabpanel", "aria-labelledby": "workspace-tab-work", "aria-hidden": resolvedPane === "work" ? "false" : "true", "data-pane": "work" }, [
      workWorkspace(client, data, plan)
    ]),
    el("section", { class: `workspace-pane ${resolvedPane === "sessions" ? "active" : ""}`, id: "workspace-pane-sessions", role: "tabpanel", "aria-labelledby": "workspace-tab-sessions", "aria-hidden": resolvedPane === "sessions" ? "false" : "true", "data-pane": "sessions" }, [
      sessionsWorkspace(plan.sessions, data)
    ]),
    el("section", { class: `workspace-pane ${resolvedPane === "reflections" ? "active" : ""}`, id: "workspace-pane-reflections", role: "tabpanel", "aria-labelledby": "workspace-tab-reflections", "aria-hidden": resolvedPane === "reflections" ? "false" : "true", "data-pane": "reflections" }, [
      reflectionsWorkspace(data)
    ]),
    el("section", { class: `workspace-pane ${resolvedPane === "resources" ? "active" : ""}`, id: "workspace-pane-resources", role: "tabpanel", "aria-labelledby": "workspace-tab-resources", "aria-hidden": resolvedPane === "resources" ? "false" : "true", "data-pane": "resources" }, [
      coachResourcesWorkspace(data)
    ])
  ].filter(Boolean));
  const editable = canEditProgram(client);
  if (editable) form.addEventListener("input", (event) => {
    if (event.target.closest(".ui-inline-editor")) return;
    markDirty();
  });
  $("#content").replaceChildren(el("div", { class: "plan-layout" }, [form]));
  if (!editable) setFormReadonly(form);
  setupWorkspaceTabs();
  refreshIcons();
}

function renderConsentGate(client) {
  state.selectedClientId = client.id;
  setHeader("Velkommen", "Før vi starter", []);
  const accepted = el("input", { type: "checkbox", id: "consent-accepted" });
  const message = el("p", { class: "form-message", role: "status" });
  const startButton = button("Samtykk og åpne portalen", "check", async () => {
    if (!accepted.checked) {
      message.textContent = "Du må bekrefte punktene før du kan starte.";
      return;
    }
    startButton.disabled = true;
    message.textContent = "Lagrer samtykke...";
    const consentDate = new Date().toISOString();
    const payload = {
      consent_given: true,
      consent_date: consentDate,
      consent_version: CONSENT_VERSION,
      account_activated_at: client.account_activated_at || consentDate
    };
    const { error } = await state.sb.from("clients").update(payload).eq("id", client.id).eq("user_id", state.user.id);
    if (error) {
      startButton.disabled = false;
      message.textContent = "Kunne ikke lagre samtykket. Prøv igjen.";
      return;
    }
    const updatedClient = { ...client, ...payload };
    state.client = updatedClient;
    state.clients = state.clients.map((item) => item.id === client.id ? updatedClient : item);
    await renderPlan(state.profile.role === "client" ? "now" : "direction");
  }, "primary");

  $("#content").replaceChildren(el("section", { class: "consent-panel" }, [
    el("div", { class: "consent-copy" }, [
      el("p", { class: "eyebrow", text: "Samtykke" }),
      el("h3", { text: "Slik brukes innholdet i portalen" }),
      el("p", { class: "muted", text: "Før du starter, bekrefter du hvem som kan lese det du skriver, og hvordan innholdet lagres." })
    ]),
    el("div", { class: "consent-grid" }, [
      consentPoint("lock-keyhole", "Konfidensielt", "Innholdet brukes i coachingforløpet og behandles konfidensielt."),
      consentPoint("users", "Tilgang for coach", "Coachen kan lese og arbeide med planen. Private refleksjoner deles bare når du velger det."),
      consentPoint("database", "Lagret trygt", "Data lagres i EU med tilgangsstyring. Du kan be coachen om innsyn, retting eller sletting.")
    ]),
    el("label", { class: "consent-check" }, [
      accepted,
      el("span", { text: "Jeg forstår rammene og samtykker til at portalen brukes som arbeidsflate i coachingforløpet." })
    ]),
    el("div", { class: "consent-actions" }, [startButton, message])
  ]));
  refreshIcons();
}

function consentPoint(iconName, title, text) {
  return el("article", { class: "consent-point" }, [
    icon(iconName),
    el("div", {}, [
      el("strong", { text: title }),
      el("p", { text })
    ])
  ]);
}

async function loadClientProgram(client) {
  if (state.programCache[client.id]) return state.programCache[client.id];
  const { data: program, error } = await state.sb
    .from("coaching_programs")
    .select("*")
    .eq("client_id", client.id)
    .maybeSingle();
  if (error || !program) return null;
  const library = await ensureResourceLibrary();
  const leadership = await ensureLeadershipLibrary();
  const sharedResourcesPromise = library?.getSharedResourcesForProgram
    ? library.getSharedResourcesForProgram(state.sb, program.id, { viewerRole: state.profile?.role }).catch(() => [])
    : Promise.resolve([]);
  const competenciesPromise = leadership?.getLeadershipCompetencies && leadership?.getProgramCompetencies
    ? Promise.all([
      leadership.getLeadershipCompetencies(state.sb),
      leadership.getProgramCompetencies(state.sb, program.id)
    ]).then(([competencies, selected]) => ({
      available: true,
      competencies,
      selected
    })).catch((competencyError) => {
      console.warn("Leadership competencies unavailable", competencyError);
      return { available: false, competencies: [], selected: [] };
    })
    : Promise.resolve({ available: false, competencies: [], selected: [] });
  const [{ data: areas }, { data: sessions }, { data: actions }, { data: reflections }, { data: evaluations }, sharedResources, competenciesState] = await Promise.all([
    state.sb.from("development_areas").select("*").eq("program_id", program.id).order("sort_order"),
    state.sb.from("coaching_sessions").select("*").eq("program_id", program.id).order("session_date", { ascending: false }),
    state.sb.from("session_actions").select("*").eq("program_id", program.id).order("created_at", { ascending: false }),
    state.sb.from("client_reflections").select("*").eq("program_id", program.id).order("created_at", { ascending: false }),
    state.sb.from("program_evaluations").select("*").eq("program_id", program.id).limit(1),
    sharedResourcesPromise,
    competenciesPromise
  ]);
  const payload = {
    program,
    areas: (areas || []).filter(isActiveRecord),
    sessions: (sessions || []).filter(isActiveRecord),
    actions: actions || [],
    reflections: reflections || [],
    evaluation: evaluations?.[0] || null,
    sharedResources: sharedResources || [],
    competenciesAvailable: Boolean(competenciesState?.available),
    leadershipCompetencies: competenciesState?.competencies || [],
    programCompetencies: competenciesState?.selected || []
  };
  state.programCache[client.id] = payload;
  return payload;
}

function programToFormState(data) {
  return {
    c_purpose: data.program.purpose || "",
    c_success: data.program.success_criteria || "",
    c_expect_coach: data.program.expectations_coach || "",
    c_expect_client: data.program.expectations_client || "",
    c_confidentiality: data.program.confidentiality || "",
    c_practical: data.program.practical_frame || "",
    c_context: data.program.context || "",
    c_start: data.program.start_date || "",
    c_end: data.program.end_date || "",
    c_sessions: data.program.session_count || "",
    c_duration: data.program.session_duration || "",
    areas: data.areas.length ? data.areas.map((area) => ({
      id: area.id || "",
      title: area.title || "",
      description: area.description || "",
      projectType: area.project_type || "inner",
      movement: area.movement || area.description || "",
      typicalSituations: area.typical_situations || "",
      progressSigns: area.progress_signs || "",
      nextPractice: area.next_practice || ""
    })) : [{ id: "", title: "", description: "", projectType: "inner", movement: "", typicalSituations: "", progressSigns: "", nextPractice: "" }],
    sessions: data.sessions.map((session) => ({
      id: session.id || "",
      date: session.session_date || "",
      focus: session.focus || "",
      goal: session.conversation_goal || "",
      notes: session.insights || "",
      actions: session.decisions || "",
      reflection: session.client_notes || ""
    })).reverse(),
    eval_achieved: data.evaluation?.achieved || "",
    eval_reflection: data.evaluation?.reflection || "",
    eval_next: data.evaluation?.next_steps || ""
  };
}

function defaultWorkspacePane() {
  return "now";
}

function clientWorkspaceTabs(data = {}, activePane = null) {
  const resolvedPane = activePane || defaultWorkspacePane();
  const hasNowTab = true;
  const clientResources = (data.sharedResources || []).filter((item) => item.status !== "archived");
  const resourceCount = clientResources.length;
  const newResourceCount = clientResources.filter((item) => item.status === "assigned").length;
  const items = [
    hasNowTab && ["now", "Akkurat nå"],
    ["direction", "Retning"],
    ["work", "Utviklingsfokus"],
    ["sessions", "Samtaler"],
    ["reflections", "Refleksjon"],
    ["resources", "Ressurser"]
  ].filter(Boolean);
  return el("div", { class: `workspace-tabs ${hasNowTab ? "has-now" : ""}`.trim() }, [
    el("div", { class: "workspace-tab-group workspace-tab-group-main", role: "tablist", "aria-label": "Utviklingsplan" }, items.map(([pane, label]) => {
      const showResourceCount = pane === "resources" && resourceCount > 0;
      const resourceLabel = showResourceCount
        ? `Ressurser, ${resourceCount} ${resourceCount === 1 ? "ressurs" : "ressurser"}${newResourceCount ? state.profile?.role === "client" ? `, ${newResourceCount} ${newResourceCount === 1 ? "ny" : "nye"}` : `, ${newResourceCount} ikke åpnet av klienten` : ""}`
        : label;
      return el("button", {
        class: `workspace-tab ${pane === resolvedPane ? "active" : ""} ${pane === "resources" && newResourceCount ? "has-new-resource" : ""}`.trim(),
        type: "button",
        role: "tab",
        id: `workspace-tab-${pane}`,
        "aria-controls": `workspace-pane-${pane}`,
        "data-tab": pane,
        "aria-label": resourceLabel,
        "aria-selected": pane === resolvedPane ? "true" : "false"
      }, [
        el("span", { text: label }),
        showResourceCount ? el("span", { class: `workspace-tab-count ${newResourceCount ? "has-new" : ""}`.trim(), "aria-hidden": "true" }, [
          el("span", { text: String(resourceCount) }),
          newResourceCount ? el("span", { class: "workspace-tab-new-dot" }) : null
        ].filter(Boolean)) : null
      ].filter(Boolean));
    }))
  ]);
}

function setupWorkspaceTabs() {
  const tabs = $$(".workspace-tab");
  const activate = async (tab) => {
      if (state.inlineEditKey) {
        await showAppMessage("Lagre eller avbryt først", "Du har et åpent felt. Lagre eller avbryt før du går videre.");
        return false;
      }
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
        item.tabIndex = active ? 0 : -1;
      });
      $$(".workspace-pane").forEach((pane) => {
        const active = pane.dataset.pane === tab.dataset.tab;
        pane.classList.toggle("active", active);
        pane.setAttribute("aria-hidden", active ? "false" : "true");
      });
      return true;
  };
  tabs.forEach((tab, index) => {
    tab.tabIndex = tab.classList.contains("active") ? 0 : -1;
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", async (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      if (await activate(tabs[nextIndex])) tabs[nextIndex].focus();
    });
  });
}

function hiddenPlanState(plan) {
  return el("div", { class: "hidden-editor", id: "plan-state" }, [
    ...planFields.map(([key]) => el("textarea", { name: key, text: plan[key] || "" })),
    ...["c_start", "c_end", "c_sessions", "c_duration", "eval_achieved", "eval_reflection", "eval_next"].map((key) => {
      return el("input", { name: key, value: plan[key] || "" });
    })
  ]);
}

function directionWorkspace(client, plan) {
  const editable = canEditProgram(client);
  const directionSpecs = getDirectionSpecs(plan);
  const status = directionStatus(plan);
  const completed = directionSpecs.filter(directionSpecHasValue).length;
  const nextSpec = directionSpecs.find((spec) => !directionSpecHasValue(spec)) || null;
  const groups = [
    ["Retning", "Hva skal bli annerledes?", directionSpecs.slice(0, 2)],
    ["Samarbeid", "Hva skal dere kunne forvente av hverandre?", directionSpecs.slice(2, 4)],
    ["Rammer", "Hva må være avklart rundt arbeidet?", directionSpecs.slice(4)]
  ];
  return el("section", { class: "platform-page ui-workspace direction-simple" }, [
    pageIntro("Retning", "Hva skal utviklingen føre til?", "Avklar hva du vil oppnå, hvordan du vil merke fremgang og hva dere skal forvente av hverandre."),
    el("section", { class: "direction-overview", "aria-label": "Status for retningen" }, [
      el("div", { class: "direction-progress-copy" }, [
        el("strong", { text: nextSpec ? `${completed} av ${directionSpecs.length} avklaringer på plass` : "Retningen er klar til bruk" }),
        el("span", { text: status.text })
      ]),
      editable ? el("button", {
        class: "ui-button ui-button-filled direction-next-action",
        type: "button",
        text: nextSpec ? (status.tone === "ready" ? "Fullfør retningen" : status.action) : "Velg lederkompetanser",
        onclick: () => nextSpec ? activateDirectionEdit(nextSpec) : activateWorkspacePane("work")
      }) : null
    ].filter(Boolean)),
    el("section", { class: "direction-plan platform-surface" }, [
      ...groups.map(([label, helper, specs]) => el("section", { class: "direction-plan-group" }, [
        el("header", { class: "direction-plan-group-head" }, [
          el("p", { class: "eyebrow", text: label }),
          el("p", { text: helper })
        ]),
        el("div", { class: "direction-plan-rows" }, specs.map((spec) => directionCard(spec, editable)))
      ]))
    ]),
    coachingFrame()
  ].filter(Boolean));
}

function directionCard(spec, editable) {
  const value = directionSpecPreview(spec);
  const isEditing = state.inlineEditKey === `direction:${spec.key}`;
  if (isEditing) return directionInlineEditor(spec);
  return el("article", {
    class: `direction-plan-row direction-field ${value ? "has-value" : "is-empty"}`,
    "data-direction-key": spec.key
  }, [
    el("span", { class: "direction-row-status", "aria-hidden": "true" }, [icon(value ? "check" : spec.iconName || "circle")]),
    el("div", { class: "direction-row-copy" }, [
      el("div", { class: "direction-row-title" }, [
        el("h3", { text: spec.label }),
        el("span", { text: spec.subhead || "" })
      ]),
      value ? directionValueContent(spec) : el("p", { class: "direction-row-empty", text: spec.placeholder || spec.helper })
    ]),
    editable ? el("button", {
      class: "ui-field-action direction-edit-trigger",
      type: "button",
      text: value ? "Rediger" : "Fyll ut",
      onclick: () => activateDirectionEdit(spec)
    }) : null
  ]);
}

function directionInlineEditor(spec) {
  const fields = spec.fields || [spec];
  const controls = fields.map((field) => el("textarea", {
    class: "ui-edit-control",
    "data-direction-control": field.key,
    rows: spec.fields ? "4" : "6",
    text: field.value || "",
    placeholder: field.placeholder || spec.placeholder || spec.helper
  }));
  return el("article", { class: "ui-inline-editor direction-plan-row direction-plan-editor is-editing" }, [
    el("div", { class: "direction-editor-head" }, [
      el("span", { class: "direction-row-status", "aria-hidden": "true" }, [icon(spec.iconName || "circle")]),
      el("div", {}, [
        el("h3", { text: spec.label }),
        el("p", { text: spec.helper || spec.valueLabel || "" })
      ])
    ]),
    el("div", { class: "direction-edit-fields" }, controls.map((control, index) => el("label", { text: fields[index].label || spec.valueLabel || spec.label }, [control]))),
    el("div", { class: "ui-inline-editor-actions" }, [
      el("button", { class: "ui-button ui-button-tonal", type: "button", text: "Avbryt", onclick: () => {
        state.inlineEditKey = null;
        renderCachedProgram("direction");
      }}),
      el("button", { class: "ui-button ui-button-filled", type: "button", text: "Lagre", onclick: async () => {
        fields.forEach((field, index) => setPlanValue(field.key, controls[index].value || ""));
        state.inlineEditKey = null;
        markDirty();
        const saved = await savePlan();
        if (saved) await reloadProgramAndRender("direction");
      }})
    ])
  ]);
}

function activateFirstMissingDirectionField(specs) {
  const target = specs.find((spec) => !directionSpecHasValue(spec)) || specs[0];
  if (target) activateDirectionEdit(target);
}

function activateWorkspacePane(paneName) {
  const tab = $(`.workspace-tab[data-tab='${paneName}']`);
  if (tab) tab.click();
}

function getDirectionSpecs(plan) {
  return [
    {
      key: "c_purpose",
      iconName: "target",
      label: "Hva vil du oppnå?",
      subhead: "Det viktigste målet",
      valueLabel: "Hva ønsker du at coachingforløpet skal hjelpe deg med?",
      value: plan.c_purpose,
      helper: "Hva ønsker du at coachingforløpet skal hjelpe deg med?",
      placeholder: "Beskriv hva du vil oppnå."
    },
    {
      key: "c_success",
      iconName: "activity",
      label: "Hvordan vil du merke fremgang?",
      subhead: "Tegn på endring",
      valueLabel: "Hva vil du, coachen din eller andre merke hvis dette begynner å virke?",
      value: plan.c_success,
      helper: "Hva vil du, coachen din eller andre merke hvis dette begynner å virke?",
      placeholder: "Beskriv hva du eller andre vil legge merke til."
    },
    {
      key: "c_expect_client",
      iconName: "user-check",
      label: "Hva vil du gjøre mellom samtalene?",
      subhead: "Din innsats",
      valueLabel: "Hva vil du prøve, observere eller forberede mellom samtalene?",
      value: plan.c_expect_client,
      helper: "Hva vil du prøve, observere eller forberede mellom samtalene?",
      placeholder: "Beskriv hva du vil prøve, observere eller forberede."
    },
    {
      key: "c_expect_coach",
      iconName: "messages-square",
      label: "Hva trenger du fra coachen?",
      subhead: "Coachens bidrag",
      valueLabel: "Hva trenger du at coachen bidrar med, utfordrer deg på eller følger opp?",
      value: plan.c_expect_coach,
      helper: "Hva trenger du at coachen bidrar med, utfordrer deg på eller følger opp?",
      placeholder: "Beskriv hva du trenger fra coachen."
    },
    {
      key: "frame",
      iconName: "shield-check",
      label: "Rammer for samarbeidet",
      subhead: "Praktiske rammer og konfidensialitet",
      valueLabel: "Hva bør være avklart om tid, rolle, konfidensialitet og hva som ligger utenfor coachingens mandat?",
      helper: "Hva bør være avklart om tid, rolle, konfidensialitet og hva som ligger utenfor coachingens mandat?",
      fields: [
        {
          key: "c_practical",
          label: "Praktiske rammer",
          value: plan.c_practical,
          placeholder: "Hva bør være avklart om tid og rolle?"
        },
        {
          key: "c_confidentiality",
          label: "Konfidensialitet",
          value: plan.c_confidentiality,
          placeholder: "Hva skal være privat, delt eller utenfor coachingens mandat?"
        }
      ]
    },
    {
      key: "c_context",
      iconName: "network",
      label: "Hvem og hva påvirker forløpet?",
      subhead: "Arbeidshverdagen rundt deg",
      valueLabel: "Hvilke personer, roller, team eller forventninger påvirker det du jobber med?",
      value: plan.c_context,
      helper: "Hvilke personer, roller, team eller forventninger påvirker det du jobber med?",
      placeholder: "Beskriv hvem eller hva som påvirker arbeidet."
    }
  ];
}

function directionStatus(plan) {
  if (!plan.c_purpose || !plan.c_success) {
    return {
      tone: "missing",
      label: "Ikke utfylt ennå",
      text: "Start med hva du vil oppnå og hvordan du vil merke fremgang.",
      action: "Sett retning"
    };
  }
  if (!plan.c_expect_client || !plan.c_expect_coach) {
    return {
      tone: "partial",
      label: "Delvis utfylt",
      text: "Avklar hva du vil gjøre mellom samtalene, og hva du trenger fra coachen.",
      action: "Avklar forventninger"
    };
  }
  if (!plan.c_practical || !plan.c_confidentiality || !plan.c_context) {
    return {
      tone: "partial",
      label: "Nesten klar",
      text: "Avklar praktiske rammer, konfidensialitet og hvem som påvirker arbeidet.",
      action: "Fullfør retningen"
    };
  }
  return {
    tone: "ready",
    label: "Retning avklart",
    text: "Du kan nå velge lederkompetanser og fokusoppdrag.",
    action: "Gå videre"
  };
}

function directionSpecHasValue(spec) {
  if (spec.fields) return spec.fields.every((field) => (field.value || "").trim());
  return Boolean((spec.value || "").trim());
}

function directionSpecPreview(spec) {
  if (spec.fields) {
    const values = spec.fields.filter((field) => (field.value || "").trim());
    if (!values.length) return "";
    return values.map((field) => `${field.label}: ${field.value}`).join("\n\n");
  }
  return spec.value || "";
}

function directionValueContent(spec) {
  if (spec.fields) {
    return el("div", { class: "direction-subvalues" }, spec.fields.map((field) => (
      el("div", {}, [
        el("strong", { text: field.label }),
        el("p", { text: field.value || "Ikke satt ennå." })
      ])
    )));
  }
  return el("p", { text: spec.value });
}

function coachingFrame() {
  const items = [
    ["lock-keyhole", "Konfidensialitet", "Det du deler i coachingrommet behandles konfidensielt."],
    ["heart-handshake", "Rolleavklaring", "Coaching er ikke terapi. Ved psykiske helseutfordringer bør du kontakte kvalifisert helsepersonell."],
    ["compass", "Ansvar", "Du eier egne mål, valg og handlinger. Coachen hjelper deg å tenke tydeligere, prioritere og holde fremdrift."]
  ];
  return el("details", { class: "platform-reference coaching-frame" }, [
    el("summary", {}, [
      el("span", { class: "platform-reference-icon", "aria-hidden": "true" }, [icon("shield-check")]),
      el("span", {}, [
        el("strong", { text: "Rammene for coaching" }),
        el("small", { text: "Konfidensialitet, roller og ansvar" })
      ]),
      icon("chevron-down")
    ]),
    el("div", { class: "coaching-frame-body" }, items.map(([iconName, title, text]) => el("article", {}, [
      icon(iconName),
      el("div", {}, [
        el("strong", { text: title }),
        el("p", { text })
      ])
    ])))
  ]);
}

function activateDirectionEdit(spec) {
  state.inlineEditKey = `direction:${spec.key}`;
  renderCachedProgram("direction");
  requestAnimationFrame(() => {
    const firstField = $("[data-direction-control]");
    firstField?.focus();
    firstField?.setSelectionRange(firstField.value.length, firstField.value.length);
  });
}

function setPlanValue(name, value) {
  const control = $(`[name='${name}']`, $("#plan-form"));
  if (control) control.value = value || "";
}

function cardIcon(name) {
  return el("span", { class: "card-icon" }, [icon(name)]);
}

function contentPreview(value, emptyText, lines = 5) {
  const text = (value || "").trim();
  return el("span", {
    class: `content-card-body ${text ? "" : "is-empty"}`,
    style: `--preview-lines:${lines}`,
    text: text || emptyText
  });
}

function workWorkspace(client, data, plan) {
  const focusItems = plan.areas
    .map((area, index) => ({ area: normalizeArea(area), index }))
    .filter((item) => hasAreaContent(item.area));
  const editable = canEditProgram(client);
  if (!data.competenciesAvailable) {
    return el("div", { class: "platform-page work-stack focus-hub" }, [
      focusHubIntro(editable, data, focusItems.length, false),
      focusWorkbench(focusItems, data, editable),
      areasEditor(plan.areas)
    ]);
  }
  return focusHubWorkspace(data, plan, focusItems, editable);
}

function focusHubWorkspace(data, plan, focusItems, editable) {
  const selectedItems = (data.programCompetencies || []).filter((item) => item.status === "active");
  const activeView = ["competencies", "assignments", "experiments"].includes(state.focusView) ? state.focusView : "competencies";
  const viewCopy = focusViewDescription(activeView);
  return el("div", { class: "platform-page work-stack focus-hub" }, [
    focusHubIntro(editable, data, activeView === "competencies" ? selectedItems.length : activeView === "assignments" ? focusItems.length : data.actions.length, true),
    el("div", { class: "focus-navigation-row" }, [
      focusViewTabs(activeView, data),
      el("div", { class: "focus-view-description" }, [
        el("strong", { text: viewCopy.question }),
        el("p", { text: viewCopy.description })
      ])
    ]),
    el("section", { class: `focus-hub-panel ${activeView === "competencies" ? "active" : ""}`, id: "focus-panel-competencies", role: "tabpanel", "aria-labelledby": "focus-tab-competencies", "aria-hidden": activeView === "competencies" ? "false" : "true" }, [
      activeView === "competencies" ? leadershipWorkbench(data, editable) : null
    ].filter(Boolean)),
    el("section", { class: `focus-hub-panel ${activeView === "assignments" ? "active" : ""}`, id: "focus-panel-assignments", role: "tabpanel", "aria-labelledby": "focus-tab-assignments", "aria-hidden": activeView === "assignments" ? "false" : "true" }, [
      activeView === "assignments" ? focusWorkbench(focusItems, data, editable) : null
    ].filter(Boolean)),
    el("section", { class: `focus-hub-panel ${activeView === "experiments" ? "active" : ""}`, id: "focus-panel-experiments", role: "tabpanel", "aria-labelledby": "focus-tab-experiments", "aria-hidden": activeView === "experiments" ? "false" : "true" }, [
      activeView === "experiments" ? experimentHubWorkspace(data, editable) : null
    ].filter(Boolean)),
    areasEditor(plan.areas)
  ]);
}

function focusViewDescription(activeView) {
  const descriptions = {
    competencies: {
      question: "Hva vil du bli bedre på?",
      description: "Den indre utviklingslinjen: atferd og ferdigheter du utvikler i måten du leder deg selv og andre på."
    },
    assignments: {
      question: "Hvor skal utviklingen merkes?",
      description: "Den ytre utviklingslinjen: Fokusoppdrag er konkrete strategiske prioriteringer, situasjoner eller oppgaver der utviklingen skal merkes. De kan legges til, justeres eller avsluttes underveis."
    },
    experiments: {
      question: "Hva vil du prøve i praksis?",
      description: "Små atferdsforsøk du prøver, observerer og justerer."
    }
  };
  return descriptions[activeView] || descriptions.competencies;
}

function focusHubIntro(editable, data, itemCount = 0, hasCompetencies = true) {
  const competenciesActive = hasCompetencies && state.focusView === "competencies";
  const action = competenciesActive && editable && itemCount
    ? addAction("Endre prioritering", () => openCompetencyChooser(data))
    : null;
  return workspaceIntro("Utviklingsfokus", "Hva skal du utvikle?", "Velg tre lederkompetanser som gir retning for utviklingen. Én kan være hovedfokus nå.", [action].filter(Boolean));
}

function focusViewTabs(activeView, data = {}) {
  const activeExperiments = (data.actions || []).filter((action) => isExperimentActive(action.status)).length;
  const items = [
    ["competencies", "Lederkompetanser", ""],
    ["assignments", "Fokusoppdrag", ""],
    ["experiments", "Eksperimenter", activeExperiments ? String(activeExperiments) : ""]
  ];
  const activate = (value, { focus = false } = {}) => {
    state.focusView = value;
    state.inlineEditKey = null;
    renderCachedProgram("work");
    if (focus) requestAnimationFrame(() => document.getElementById(`focus-tab-${value}`)?.focus());
  };
  const tabs = items.map(([value, label, count], index) => el("button", {
    class: `focus-view-tab ${activeView === value ? "active" : ""}`,
    type: "button",
    role: "tab",
    id: `focus-tab-${value}`,
    "aria-controls": `focus-panel-${value}`,
    "aria-selected": activeView === value ? "true" : "false",
    tabindex: activeView === value ? "0" : "-1",
    onclick: () => activate(value),
    onkeydown: (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
      activate(items[nextIndex][0], { focus: true });
    }
  }, [el("span", { text: label }), count ? el("small", { text: count }) : null].filter(Boolean)));
  return el("div", { class: "focus-view-tabs", role: "tablist", "aria-label": "Velg arbeidsflate" }, tabs);
}

function leadershipWorkbench(data, editable) {
  const selectedItems = (data.programCompetencies || []).filter((item) => item.status === "active");
  const suggestions = (data.programCompetencies || []).filter((item) => item.status === "suggested");
  if (!selectedItems.length) {
    return el("div", { class: "leadership-workspace-stack" }, [
      leadershipSuggestions(suggestions, data, editable),
      el("div", { class: "platform-surface leadership-workbench leadership-workbench-empty" }, [
        el("div", { class: "leadership-master" }, [
          leadershipEmptyState(data, editable)
        ])
      ])
    ].filter(Boolean));
  }

  const selected = selectedItems.find((item) => item.id === state.selectedCompetencyId) || selectedItems[0];
  state.selectedCompetencyId = selected?.id || null;
  const detail = el("aside", { class: "leadership-detail" }, [
    leadershipDetail(selected, data, editable)
  ]);
  return el("div", { class: "leadership-workspace-stack" }, [
    leadershipSuggestions(suggestions, data, editable),
    el("div", { class: "platform-surface leadership-workbench workspace-split-view" }, [
      leadershipSelectedList(selectedItems, detail, data, editable),
      el("div", { class: "leadership-detail-wrap" }, [detail])
    ])
  ].filter(Boolean));
}

function leadershipSuggestions(items, data, editable) {
  if (!items.length) return null;
  const clientOwnsChoice = isClientCompetencyOwner();
  return el("section", { class: "competency-suggestions" }, [
    el("div", { class: "competency-suggestions-copy" }, [
      el("span", { class: "workspace-kicker", text: "Forslag fra coach" }),
      el("strong", { text: items.length === 1 ? "Én lederkompetanse er foreslått" : `${items.length} lederkompetanser er foreslått` }),
      el("p", { text: clientOwnsChoice ? "Du bestemmer om forslaget skal bli hovedfokus eller en støttende lederkompetanse." : "Forslaget blir ikke aktivt før klienten velger det." })
    ]),
    el("div", { class: "competency-suggestion-list" }, items.map((item) => el("article", {}, [
      el("div", {}, [
        el("strong", { text: item.title || "Lederkompetanse" }),
        el("small", { text: item.categoryLabel || "Lederkompetanse" })
      ]),
      clientOwnsChoice && editable ? el("div", { class: "competency-suggestion-actions" }, [
        el("button", {
          class: "ui-button ui-button-tonal",
          type: "button",
          text: "Aktiver forslag",
          onclick: () => activateSuggestedCompetency(data, item)
        }),
        el("button", {
          class: "ui-button ui-button-outlined",
          type: "button",
          text: "Skjul",
          onclick: () => removeLeadershipCompetency(item)
        })
      ]) : null
    ].filter(Boolean))))
  ]);
}

function leadershipSelectedList(items, detail, data, editable) {
  const rows = items.map((item, index) => {
    const active = item.id === state.selectedCompetencyId || (!state.selectedCompetencyId && index === 0);
    const planStatus = leadershipPlanStatus(item);
    const note = item.desired_behavior || item.competency?.summary || item.summary || "Ikke påbegynt";
    return el("article", { class: `leadership-track-row workspace-master-row ${active ? "active" : ""}` }, [
      el("button", {
        class: "leadership-track-open workspace-master-button",
        type: "button",
        onclick: (event) => {
          state.selectedCompetencyId = item.id;
          $$(".leadership-track-row", event.currentTarget.closest(".leadership-track-list")).forEach((node) => {
            node.classList.toggle("active", node === event.currentTarget.closest(".leadership-track-row"));
          });
          detail.replaceChildren(leadershipDetail(item, data, editable));
          refreshIcons();
        }
      }, [
        el("span", { class: "leadership-track-index", "aria-hidden": "true" }, [icon(planStatus.ready ? "check" : "compass")]),
        el("span", { class: "leadership-track-main" }, [
          el("span", { class: "leadership-track-heading" }, [
            el("strong", { text: item.title || "Lederkompetanse" }),
            el("small", { text: item.roleLabel || (item.priority === 1 ? "Hovedfokus" : "Støttende kompetanse") })
          ]),
          contentPreview(note, "Hva vil du utvikle?", 2)
        ]),
        icon("chevron-right")
      ])
    ]);
  });
  return el("div", { class: "leadership-master leadership-track-list workspace-master-rail" }, [
    el("div", { class: "leadership-track-head workspace-master-head" }, [
      el("strong", { text: "Aktive lederkompetanser" }),
      el("span", { text: `${items.length} aktive` })
    ]),
    ...rows
  ]);
}

function leadershipDetail(item, data, editable) {
  const content = item.competency?.content || {};
  const actions = data.actions.filter((action) => action.program_competency_id === item.id);
  const activeActions = actions.filter((action) => isExperimentActive(action.status));
  const planStatus = leadershipPlanStatus(item);
  const missingStep = [
    ["why_now", "Avklar hvorfor kompetansen er viktig nå", "Skriv hvorfor nå"],
    ["desired_behavior", "Beskriv hva du vil gjøre annerledes", "Beskriv ønsket atferd"],
    ["current_pattern", "Beskriv hva du gjør i dag", "Beskriv nåmønsteret"],
    ["obstacles", "Undersøk hva som kan stå i veien", "Utforsk barrierene"]
  ].find(([fieldKey]) => !(item[fieldKey] || "").trim());
  const nextLabel = missingStep?.[1] || (!activeActions.length ? "Planlegg første eksperiment" : "Følg opp eksperimentet");
  const nextHandler = missingStep
    ? () => openLeadershipFieldEditor(item, missingStep[0])
    : !activeActions.length
      ? () => createCompetencyAction(data, item)
      : () => editAction(activeActions[0], data);

  return el("section", { class: "leadership-detail-card competency-workspace workspace-detail-surface" }, [
    el("header", { class: "competency-workspace-head" }, [
      el("div", { class: "competency-workspace-heading" }, [
        el("span", { class: "competency-context" }, [
          el("span", { class: "workspace-kicker", text: item.roleLabel || "Valgt lederkompetanse" }),
          item.categoryLabel ? el("span", { class: "ui-meta type-chip", text: item.categoryLabel }) : null
        ].filter(Boolean)),
        el("h3", { text: item.title || "Lederkompetanse" }),
        item.summary ? el("p", { class: "muted leadership-summary", text: item.summary }) : null
      ]),
      editable && isClientCompetencyOwner() ? el("div", { class: "competency-heading-actions" }, [
        item.priority !== 1 ? el("button", { class: "ui-button ui-button-tonal", type: "button", text: "Gjør til hovedfokus", onclick: () => makeLeadershipCompetencyPrimary(item) }) : null,
        iconAction("Arkiver lederkompetanse", "archive", () => removeLeadershipCompetency(item), "danger")
      ].filter(Boolean)) : null
    ].filter(Boolean)),
    workspaceNextStep({
      complete: planStatus.ready,
      label: nextLabel,
      helper: planStatus.ready ? "Du har det du trenger for å prøve noe i arbeidshverdagen." : "Avklar neste del av planen.",
      actionLabel: missingStep?.[2] || (!activeActions.length ? "Legg til eksperiment" : "Følg opp eksperiment"),
      onAction: nextHandler,
      editable
    }),
    workspacePlan({
      title: "Plan for utvikling av kompetansen",
      description: "Avklar hvorfor kompetansen er viktig nå, hva du vil gjøre annerledes og hva som kan stå i veien.",
      status: planStatus,
      steps: [
        leadershipPlanStep(item, 1, "Hvorfor nå?", "Hvorfor er akkurat denne kompetansen viktig nå?", item.why_now, "Knytt kompetansen til det som faktisk krever noe annet av deg nå.", "why_now", editable),
        leadershipPlanStep(item, 2, "Ønsket atferd", "Hva vil du gjøre annerledes?", item.desired_behavior, "Beskriv konkret, observerbar lederatferd.", "desired_behavior", editable),
        leadershipPlanStep(item, 3, "Nåmønster", "Hva gjør du i dag?", item.current_pattern, "Beskriv den typiske responsen eller vanen du vil undersøke.", "current_pattern", editable),
        leadershipPlanStep(item, 4, "Mulige barrierer", "Hva kan stå i veien?", item.obstacles, "Hva kan gjøre det vanskelig å handle annerledes?", "obstacles", editable)
      ]
    }),
    relatedExperiments({ actions, data, editable, onCreate: () => createCompetencyAction(data, item), contextLabel: item.title || "kompetansen" }),
    leadershipGuidance(content, item.title)
  ].filter(Boolean));
}

function leadershipPlanStatus(item) {
  const planFields = [item.why_now, item.desired_behavior, item.current_pattern, item.obstacles];
  const completed = planFields.filter((value) => (value || "").trim()).length;
  const any = completed > 0;
  if (completed === planFields.length) return { key: "ready", label: "Klar til å prøves", ready: true };
  if (any) return { key: "working", label: "Under arbeid", ready: false };
  return { key: "not-started", label: "Ikke påbegynt", ready: false };
}

function workspaceNextStep({ complete = false, label, helper = "", actionLabel = "Åpne feltet", onAction = null, editable = false }) {
  return el("section", { class: "competency-next-step workspace-next-step" }, [
    el("span", { class: "competency-next-icon", "aria-hidden": "true" }, [icon(complete ? "circle-check" : "arrow-right")]),
    el("div", {}, [
      el("span", { class: "workspace-kicker", text: complete ? "Planen er klar" : "Anbefalt neste steg" }),
      el("strong", { text: label }),
      helper ? el("p", { class: "workspace-next-helper", text: helper }) : null
    ].filter(Boolean)),
    editable && onAction ? el("button", { class: "ui-button ui-button-filled", type: "button", text: actionLabel, onclick: onAction }) : null
  ].filter(Boolean));
}

function workspacePlan({ title, description, status, steps, className = "" }) {
  return el("section", { class: `competency-plan workspace-plan ${className}`.trim() }, [
    el("header", { class: "competency-plan-head" }, [
      el("div", {}, [
        el("h4", { text: title }),
        el("p", { text: description })
      ]),
      status ? el("span", { class: `plan-status-chip ${status.key || "working"}`, text: status.label || "Under arbeid" }) : null
    ].filter(Boolean)),
    el("div", { class: "competency-plan-list workspace-plan-list" }, steps)
  ]);
}

function workspacePlanStep({ number, eyebrow, label, value = "", emptyText, editable = false, isEditing = false, onEdit = null, onCancel = null, onSave = null, secondaryAction = null }) {
  const text = (value || "").trim();
  if (editable && isEditing) {
    const textarea = el("textarea", { class: "ui-edit-control competency-step-textarea", text, placeholder: emptyText });
    return el("article", { class: "competency-plan-step workspace-plan-step is-editing" }, [
      el("span", { class: "competency-step-marker", text: String(number) }),
      el("div", { class: "competency-step-content" }, [
        el("span", { class: "workspace-kicker", text: eyebrow }),
        el("strong", { text: label }),
        textarea,
        el("div", { class: "ui-inline-editor-actions" }, [
          el("button", { class: "ui-button ui-button-tonal", type: "button", text: "Avbryt", onclick: () => onCancel?.() }),
          el("button", { class: "ui-button ui-button-filled", type: "button", text: "Lagre", onclick: () => onSave?.(textarea.value) })
        ])
      ])
    ]);
  }
  return el("article", { class: `competency-plan-step workspace-plan-step ${text ? "is-complete" : "is-empty"}` }, [
    el("span", { class: "competency-step-marker", "aria-hidden": "true" }, [text ? icon("check") : el("span", { text: String(number) })]),
    el("div", { class: "competency-step-content" }, [
      el("span", { class: "workspace-kicker", text: eyebrow }),
      el("strong", { text: label }),
      el("p", { text: text || emptyText })
    ]),
    editable ? el("div", { class: "workspace-step-actions" }, [
      secondaryAction && text ? el("button", { class: "competency-step-action", type: "button", onclick: secondaryAction.onClick }, [
        el("span", { text: secondaryAction.label }), icon(secondaryAction.icon || "flask-conical")
      ]) : null,
      el("button", { class: "competency-step-action", type: "button", onclick: () => onEdit?.() }, [
        el("span", { text: text ? "Rediger" : "Legg til" }), icon(text ? "pencil" : "plus")
      ])
    ].filter(Boolean)) : null
  ].filter(Boolean));
}

function workspaceExperimentStep({ number, actions = [], data, editable = false, onCreate, emptyLabel = "Planlegg første forsøk", completeLabel = "Prøv det i praksis", emptyText = "Gjør et lite atferdsforsøk i en konkret arbeidssituasjon." }) {
  return el("article", { class: `competency-plan-step workspace-plan-step competency-experiment-step ${actions.length ? "is-complete" : "is-empty"}` }, [
    el("span", { class: "competency-step-marker", "aria-hidden": "true" }, [actions.length ? icon("check") : el("span", { text: String(number) })]),
    el("div", { class: "competency-step-content" }, [
      el("span", { class: "workspace-kicker", text: "Eksperiment" }),
      el("strong", { text: actions.length ? completeLabel : emptyLabel }),
      actions.length
        ? el("div", { class: "experiment-list competency-experiment-list" }, actions.map((action) => experimentRow(action, data, editable)))
        : el("p", { text: emptyText })
    ]),
    editable ? el("button", { class: "competency-step-action", type: "button", onclick: onCreate }, [
      el("span", { text: actions.length ? "Nytt" : "Legg til" }), icon("plus")
    ]) : null
  ].filter(Boolean));
}

function openLeadershipFieldEditor(item, fieldKey) {
  state.inlineEditKey = `competency:${item.id}:${fieldKey}`;
  state.selectedCompetencyId = item.id;
  renderCachedProgram("work");
}

function leadershipGuidance(content = {}, title = "kompetansen") {
  const signals = content.best_practice?.success || content.signals || [];
  const underuse = content.best_practice?.underuse || content.underuse || [];
  const overuse = content.best_practice?.overuse || content.overuse || [];
  const barriers = content.barriers || content.obstacles || [];
  const experiment = content.practice?.experiment || content.experiment || "";
  if (!signals.length && !underuse.length && !overuse.length && !barriers.length && !experiment) return null;
  const list = (sectionTitle, iconName, items) => items.length ? el("section", {}, [
    el("div", { class: "competency-reference-title" }, [icon(iconName), el("h4", { text: sectionTitle })]),
    el("ul", {}, items.map((item) => el("li", { text: item })))
  ]) : null;
  return el("details", { class: "competency-reference" }, [
    el("summary", {}, [
      el("span", { class: "competency-reference-icon", "aria-hidden": "true" }, [icon("book-open")]),
      el("span", {}, [
        el("strong", { text: "Se mer" }),
        el("small", { text: `Gode grep, mulige feilgrep og barrierer for ${String(title || "kompetansen").toLowerCase()}` })
      ]),
      icon("chevron-down")
    ]),
    el("div", { class: "leadership-guidance" }, [
      list("Når lykkes du?", "gauge", signals),
      list("Når du bruker kompetansen for lite", "arrow-down", underuse),
      list("Når du bruker kompetansen for mye eller i feil situasjon", "arrow-up", overuse),
      list("Hva kan stå i veien?", "triangle-alert", barriers),
      experiment ? el("section", {}, [
        el("div", { class: "competency-reference-title" }, [icon("sparkles"), el("h4", { text: "Foreslått startforsøk" })]),
        el("p", { text: experiment })
      ]) : null
    ].filter(Boolean))
  ]);
}

function leadershipPlanStep(item, number, eyebrow, label, value, emptyText, fieldKey, editable = false) {
  const editKey = `competency:${item.id}:${fieldKey}`;
  return workspacePlanStep({
    number, eyebrow, label, value, emptyText, editable,
    isEditing: state.inlineEditKey === editKey,
    onEdit: () => openLeadershipFieldEditor(item, fieldKey),
    onCancel: () => {
      state.inlineEditKey = null;
      renderCachedProgram("work");
    },
    onSave: (nextValue) => updateLeadershipCompetencyField(item.id, fieldKey, nextValue)
  });
}

function leadershipExperimentStep(item, data, actions, editable) {
  return workspaceExperimentStep({ number: 4, actions, data, editable, onCreate: () => createCompetencyAction(data, item) });
}

function leadershipEmptyState(data, editable) {
  return el("section", { class: "focus-empty-state leadership-empty-state" }, [
    el("span", { class: "empty-state-icon", "aria-hidden": "true" }, [icon("compass")]),
    el("div", { class: "leadership-empty-copy" }, [
      el("p", { class: "eyebrow", text: "Bibliotek for lederkompetanser" }),
      el("h3", { text: "Velg hva du vil bli bedre på" }),
      el("p", { class: "muted", text: "Start med én lederkompetanse som vil gjøre størst forskjell i rollen din nå." })
    ]),
    editable ? addAction("Velg lederkompetanse", () => openCompetencyChooser(data)) : null
  ].filter(Boolean));
}

function openCompetencyChooser(data) {
  const dialog = $("#competency-chooser");
  const content = $("#competency-chooser-content");
  if (!dialog || !content) return;

  const competencies = data.leadershipCompetencies || [];
  const selectedItems = data.programCompetencies || [];
  const selectedIds = new Set(selectedItems.filter((item) => ["active", "suggested"].includes(item.status)).map((item) => item.competency_id));
  const availableCategories = new Set(competencies.map((item) => item.category));
  if (state.competencyChooserCategory !== "all" && !availableCategories.has(state.competencyChooserCategory)) {
    state.competencyChooserCategory = "all";
  }
  const firstPreview = competencies.find((item) => item.id === state.previewCompetencyId)
    || competencies.find((item) => !selectedIds.has(item.id))
    || competencies[0];
  state.previewCompetencyId = firstPreview?.id || null;

  content.replaceChildren(competencyChooserLayout(data, competencies, selectedIds));
  const closeButton = $("#competency-chooser-close");
  closeButton.onclick = () => dialog.close();
  dialog.onclick = (event) => {
    if (event.target === dialog) dialog.close();
  };
  if (!dialog.open) dialog.showModal();
  refreshIcons();
}

function normalizeCompetencySearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function competencySearchText(competency) {
  const flatten = (value) => {
    if (Array.isArray(value)) return value.flatMap(flatten);
    if (value && typeof value === "object") return Object.values(value).flatMap(flatten);
    return typeof value === "string" ? [value] : [];
  };
  const contentValues = flatten(competency.content || {});
  return normalizeCompetencySearch([
    competency.title,
    competency.title_en,
    competency.summary,
    competency.categoryLabel,
    ...contentValues
  ].filter(Boolean).join(" "));
}

function competencyNameNodes(copy, competencies = []) {
  const aliases = ["Ledelse gjennom andre", "Risikovilje"];
  const names = Array.from(new Set([
    ...competencies.flatMap((item) => [item.title, item.name_no, item.title_no]),
    ...aliases
  ].filter((value) => typeof value === "string" && value.trim().length > 3)))
    .sort((a, b) => b.length - a.length);
  if (!copy || !names.length) return [document.createTextNode(copy || "")];
  const escaped = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const matcher = new RegExp(`(${escaped.join("|")})`, "giu");
  const lookup = new Set(names.map((name) => name.toLocaleLowerCase("nb-NO")));
  return String(copy).split(matcher).filter(Boolean).map((part) => lookup.has(part.toLocaleLowerCase("nb-NO"))
    ? el("strong", { text: part })
    : document.createTextNode(part));
}

function competencyChooserLayout(data, competencies, selectedIds) {
  const selectedItems = (data.programCompetencies || []).filter((item) => item.status === "active");
  const selectedCount = selectedItems.length;
  const hasPrimary = selectedItems.some((item) => Number(item.priority) === 1);
  const supportingCount = selectedItems.filter((item) => Number(item.priority) !== 1).length;
  const selectionSummary = selectedCount
    ? `${hasPrimary ? "Hovedfokus valgt" : "Velg hovedfokus"}${supportingCount ? ` · ${supportingCount} støttende` : ""}`
    : "Velg hovedfokus";
  const categoryOrder = ["foundation", "self_capacity", "relationships_influence", "team_people", "execution_decisions", "strategy_business_change", "derailer"];
  const categoryOptions = [["all", "Alle utviklingsområder"], ...Array.from(new Map(competencies.map((item) => [item.category, item.categoryLabel || "Andre"])).entries())
    .sort(([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b))];
  const list = el("div", { class: "competency-browser-list" });
  const preview = el("aside", { class: "competency-browser-preview" });
  const resultCount = el("span", { text: `${competencies.length} lederkompetanser` });
  const search = el("input", {
    class: "competency-search",
    type: "search",
    value: state.competencyChooserQuery,
    placeholder: "Søk etter lederkompetanse",
    "aria-label": "Søk i biblioteket for lederkompetanser"
  });
  const categorySelect = el("select", {
    class: "competency-category-select",
    "aria-label": "Filtrer etter utviklingsområde"
  }, categoryOptions.map(([value, label]) => el("option", { value, text: label })));
  categorySelect.value = state.competencyChooserCategory;
  const resetButton = el("button", {
    class: "competency-filter-reset",
    type: "button",
    title: "Nullstill søk og filter",
    onclick: () => {
      state.competencyChooserQuery = "";
      state.competencyChooserCategory = "all";
      search.value = "";
      categorySelect.value = "all";
      paint();
      search.focus();
    }
  }, [icon("rotate-ccw"), el("span", { text: "Nullstill" })]);
  const browser = el("section", { class: "competency-browser" }, [
    el("div", { class: "competency-browser-tools" }, [
      el("div", { class: "competency-search-wrap" }, [icon("search"), search]),
      el("div", { class: "competency-filter-controls" }, [
        el("label", { class: "competency-category-field" }, [
          el("span", { text: "Utviklingsområde" }),
          el("div", { class: "competency-category-select-wrap" }, [categorySelect, icon("chevron-down")])
        ]),
        resetButton
      ])
    ]),
    el("div", { class: "competency-browser-count" }, [
      resultCount,
      el("span", { class: "ui-meta", text: selectionSummary })
    ]),
    list
  ]);
  const layout = el("div", { class: "competency-chooser-layout" }, [browser, preview]);

  const paint = () => {
    const query = normalizeCompetencySearch(state.competencyChooserQuery);
    const filtered = competencies.filter((item) => {
      const matchesCategory = state.competencyChooserCategory === "all" || item.category === state.competencyChooserCategory;
      return matchesCategory && (!query || competencySearchText(item).includes(query));
    });
    const current = filtered.find((item) => item.id === state.previewCompetencyId) || filtered[0] || null;
    if (current) state.previewCompetencyId = current.id;

    resultCount.textContent = `${filtered.length} av ${competencies.length} lederkompetanser`;
    resetButton.hidden = !query && state.competencyChooserCategory === "all";

    list.replaceChildren(...(filtered.length
      ? filtered.map((competency) => competencyBrowserRow(competency, selectedIds, current?.id === competency.id, () => {
        state.previewCompetencyId = competency.id;
        layout.classList.add("show-preview");
        paint();
      }))
      : [el("div", { class: "competency-browser-empty" }, [
        icon("search-x"),
        el("strong", { text: "Ingen lederkompetanser passer filteret" }),
        el("p", { class: "muted", text: "Prøv et annet søk eller nullstill filteret." }),
        el("button", {
          class: "ui-button ui-button-outlined",
          type: "button",
          text: "Nullstill",
          onclick: () => resetButton.click()
        })
      ])]));

    preview.replaceChildren(current
      ? competencyPreview(current, data, selectedIds, selectedCount, () => layout.classList.remove("show-preview"))
      : el("div", { class: "competency-preview-empty" }, [
        el("h3", { text: "Velg en lederkompetanse i listen" }),
        el("p", { class: "muted", text: "Informasjonen vises her før du bestemmer deg." })
      ]));
    refreshIcons();
  };

  search.addEventListener("input", () => {
    state.competencyChooserQuery = search.value;
    paint();
  });
  categorySelect.addEventListener("change", () => {
    state.competencyChooserCategory = categorySelect.value;
    paint();
  });
  paint();

  return layout;
}

function competencyBrowserRow(competency, selectedIds, active, onOpen) {
  const selected = selectedIds.has(competency.id);
  return el("button", {
    class: `competency-browser-row ${active ? "active" : ""} ${selected ? "selected" : ""}`,
    type: "button",
    "aria-current": active ? "true" : "false",
    onclick: onOpen
  }, [
    el("span", { class: "competency-row-icon", "aria-hidden": "true" }, [icon(selected ? "check" : "compass")]),
    el("span", { class: "competency-row-copy" }, [
      el("span", { class: "competency-row-category", text: competency.categoryLabel || "Lederkompetanse" }),
      el("span", { class: "competency-row-title" }, [
        el("strong", { text: competency.title || "Lederkompetanse" }),
        selected ? el("small", { text: "Valgt" }) : null
      ].filter(Boolean)),
      el("span", { text: competency.summary || "Les mer om lederkompetansen." })
    ]),
    icon("chevron-right")
  ]);
}

function competencyPreview(competency, data, selectedIds, selectedCount, onBack) {
  const content = competency.content || {};
  const selectedItem = (data.programCompetencies || []).find((item) => item.competency_id === competency.id);
  const selected = selectedItem?.status === "active";
  const suggested = selectedItem?.status === "suggested";
  const clientOwnsSelection = isClientCompetencyOwner();
  const canActivateSuggestion = suggested && clientOwnsSelection;
  const maxReached = clientOwnsSelection && selectedCount >= 3 && !selected;
  const previewList = (title, iconName, items, tone = "") => items?.length ? el("section", { class: `competency-preview-section ${tone}`.trim() }, [
    el("div", { class: "competency-preview-section-title" }, [icon(iconName), el("h4", { text: title })]),
    el("ul", {}, items.map((item) => el("li", { text: item })))
  ]) : null;
  const contextBlock = (title, iconName, copy, emphasizeCompetencies = false) => copy ? el("section", { class: "competency-context-block" }, [
    el("div", { class: "competency-context-label" }, [icon(iconName), el("h4", { text: title })]),
    emphasizeCompetencies
      ? el("p", { class: "competency-inline-names" }, competencyNameNodes(copy, data.leadershipCompetencies || []))
      : el("p", { text: copy })
  ]) : null;
  const secondaryPracticeSections = [
    previewList("Når du bruker kompetansen for lite", "arrow-down", content.best_practice?.underuse || content.underuse, "underuse"),
    previewList("Når du bruker kompetansen for mye eller i feil situasjon", "arrow-up", content.best_practice?.overuse || content.overuse, "overuse"),
    previewList("Hva kan stå i veien?", "triangle-alert", content.barriers || [], "barriers")
  ].filter(Boolean);
  const clientSelectionLabel = selectedCount === 0 ? "Velg som hovedfokus" : "Legg til som støttende kompetanse";
  const chooseAction = () => el("button", {
    class: "ui-button ui-button-filled competency-select-action",
    type: "button",
    disabled: selected || (suggested && !canActivateSuggestion) || (maxReached && !canActivateSuggestion),
    onclick: async () => {
      await selectLeadershipCompetency(data, competency, { keepChooserOpen: true });
    }
  }, [icon(selected || suggested ? "check" : "plus"), el("span", { text: selected ? "Allerede aktiv" : suggested && canActivateSuggestion ? clientSelectionLabel : suggested ? "Foreslått for klienten" : maxReached ? "Hovedfokus og to støttende er valgt" : clientOwnsSelection ? clientSelectionLabel : "Foreslå for klienten" })]);

  return el("article", { class: "competency-preview-card" }, [
    el("button", { class: "competency-preview-back mobile-only", type: "button", onclick: onBack }, [icon("arrow-left"), el("span", { text: "Til biblioteket" })]),
    el("header", { class: "competency-preview-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: competency.categoryLabel || "Lederkompetanse" }),
        el("h2", { text: competency.title || "Lederkompetanse" }),
        competency.title_en ? el("p", { class: "competency-english-title", text: competency.title_en }) : null
      ]),
      chooseAction()
    ]),
    competency.summary ? el("p", { class: "competency-preview-summary", text: competency.summary }) : null,
    el("div", { class: "competency-context-grid" }, [
      contextBlock("Relevant når", "target", content.choose_when),
      contextBlock("Skille mot nærliggende kompetanser", "split", content.distinction, true)
    ].filter(Boolean)),
    el("div", { class: "competency-preview-sections" }, [
      previewList("Når lykkes du?", "gauge", content.best_practice?.success || content.signals, "good-practice"),
      secondaryPracticeSections.length ? el("details", { class: "competency-preview-more" }, [
        el("summary", {}, [
          el("span", { class: "competency-more-label" }, [
            el("strong", { text: "Se mer" }),
            el("small", { text: "Gode grep, mulige feilgrep og barrierer" })
          ]),
          icon("chevron-down")
        ]),
        el("div", { class: "competency-preview-more-body" }, secondaryPracticeSections)
      ]) : null
    ].filter(Boolean)),
    content.practice?.experiment || content.experiment || content.practices?.length ? el("section", { class: "competency-practice-block" }, [
      el("span", { class: "competency-practice-icon", "aria-hidden": "true" }, [icon("sparkles")]),
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Prøv i praksis" }),
        el("p", { class: "competency-practice-copy", text: content.practice?.experiment || content.experiment || content.practices.join(" ") }),
        content.practice?.effect || content.evidence ? el("p", { class: "competency-evidence" }, [el("strong", { text: "Tegn på effekt: " }), el("span", { text: content.practice?.effect || content.evidence })]) : null
      ].filter(Boolean))
    ]) : null,
    content.reflection?.length ? el("details", { class: "competency-preview-reflection" }, [
      el("summary", {}, [el("span", { text: "Refleksjonsspørsmål" }), icon("chevron-down")]),
      previewList("Reflekter", "message-circle-question", content.reflection, "reflection")
    ]) : null,
    el("details", { class: "competency-source-note" }, [
      el("summary", {}, [icon("info"), el("strong", { text: "Om rammen for lederkompetanser" }), icon("chevron-down")]),
      el("p", {}, [
        document.createTextNode("Kompetanserammen tar utgangspunkt i CCL Compass. Norske beskrivelser og utviklingsgrep er selvstendig bearbeidet med støtte i forskning og praksis innen lederutvikling. Dette er et utviklingskart, ikke et psykometrisk verktøy.")
      ])
    ]),
    el("footer", { class: "competency-preview-footer" }, [
      el("span", { class: "muted", text: selected ? "Denne lederkompetansen er aktiv i utviklingsplanen." : suggested && maxReached ? "Forslaget er ikke aktivt. Arkiver en aktiv lederkompetanse før du kan aktivere det." : suggested ? "Coachen har foreslått lederkompetansen; klienten eier aktiveringen." : maxReached ? "Arkiver en aktiv lederkompetanse for å gjøre plass." : "Valget kan endres senere." }),
      chooseAction()
    ])
  ].filter(Boolean));
}

async function selectLeadershipCompetency(data, competency, { keepChooserOpen = false } = {}) {
  const library = await ensureLeadershipLibrary();
  if (!library?.selectProgramCompetency) return;
  const selectedItems = (data.programCompetencies || []).filter((item) => item.status === "active");
  const existing = (data.programCompetencies || []).find((item) => item.competency_id === competency.id);
  if (existing?.status === "active") return;
  if (!isClientCompetencyOwner()) {
    if (!library.suggestProgramCompetency || existing?.status === "suggested") return;
    await library.suggestProgramCompetency(state.sb, data.program.id, competency.id);
    await reloadProgramAndRender("work");
    if (keepChooserOpen) reopenCompetencyChooserFromCache();
    return;
  }
  if (selectedItems.length >= 3) {
    await showAppMessage("Velg maks tre aktive kompetanser", "Du kan ha ett hovedfokus og inntil to støttende kompetanser. Arkiver en aktiv kompetanse før du legger til en ny.");
    return;
  }
  const usedPriorities = new Set(selectedItems.map((item) => Number(item.priority)));
  const nextPriority = [1, 2, 3].find((priority) => !usedPriorities.has(priority));
  if (!nextPriority) return;
  const created = await library.selectProgramCompetency(state.sb, data.program.id, competency.id, nextPriority);
  state.selectedCompetencyId = created?.id || null;
  await reloadProgramAndRender("work");
  if (keepChooserOpen) reopenCompetencyChooserFromCache();
}

function reopenCompetencyChooserFromCache() {
  const client = getCurrentClient();
  const latest = client ? state.programCache[client.id] : null;
  if (latest && $("#competency-chooser")?.open) openCompetencyChooser(latest);
}

async function activateSuggestedCompetency(data, item) {
  if (!isClientCompetencyOwner()) return;
  await selectLeadershipCompetency(data, item.competency || { id: item.competency_id });
}

async function makeLeadershipCompetencyPrimary(item) {
  const library = await ensureLeadershipLibrary();
  if (!isClientCompetencyOwner() || !library?.setPrimaryProgramCompetency) return;
  try {
    await library.setPrimaryProgramCompetency(state.sb, item.id);
    state.selectedCompetencyId = item.id;
    await reloadProgramAndRender("work");
  } catch (error) {
    await showAppMessage("Kunne ikke endre hovedfokus", userFacingError(error, "Prøv igjen."));
  }
}

async function updateLeadershipCompetencyField(programCompetencyId, fieldKey, value) {
  const library = await ensureLeadershipLibrary();
  if (!library?.updateProgramCompetency) return;
  const { error } = await state.sb.from("program_competencies").update({ [fieldKey]: value || "" }).eq("id", programCompetencyId);
  if (error) {
    await showAppMessage("Kunne ikke lagre kompetansen", userFacingError(error, "Prøv igjen."));
    return;
  }
  state.inlineEditKey = null;
  state.selectedCompetencyId = programCompetencyId;
  await reloadProgramAndRender("work");
}

async function removeLeadershipCompetency(item) {
  if (!isClientCompetencyOwner()) return false;
  const message = item.status === "suggested"
    ? "Skjule coachens forslag? Det blir ikke aktivert."
    : "Arkivere denne kompetansen? Eksperimenter og læringshistorikk blir bevart.";
  if (!(await confirmDelete(message, {
    kicker: "Lederkompetanse",
    title: item.status === "suggested" ? "Skjul forslag?" : "Arkiver lederkompetanse?",
    confirmLabel: item.status === "suggested" ? "Skjul" : "Arkiver"
  }))) return false;
  const library = await ensureLeadershipLibrary();
  if (!library?.removeProgramCompetency) return false;
  try {
    await library.removeProgramCompetency(state.sb, item.id);
  } catch (error) {
    await showAppMessage("Kunne ikke fjerne kompetansen", userFacingError(error, "Prøv igjen."));
    return false;
  }
  state.selectedCompetencyId = null;
  await reloadProgramAndRender("work");
  return true;
}

function createCompetencyAction(data, item) {
  createAction(data, "", item.id, "", { title: `Nytt eksperiment for ${item.title || "kompetansen"}` });
}

function pageIntro(kicker, title, text, actions = [], tone = "") {
  return el("header", { class: "ui-page-intro workspace-intro" }, [
    el("div", {}, [
      tone
        ? el("span", { class: `ui-status-pill ${tone}`, text: kicker })
        : el("p", { class: "workspace-kicker", text: kicker }),
      el("h2", { text: title }),
      el("p", { class: "muted", text })
    ]),
    actions.length ? el("div", { class: "ui-page-actions workspace-intro-actions" }, actions) : null
  ].filter(Boolean));
}

function workspaceIntro(kicker, title, text, actions = []) {
  return pageIntro(kicker, title, text, actions);
}

function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function newestFirst(a, b, field = "created_at") {
  const bTime = new Date(b?.[field] || 0).getTime();
  const aTime = new Date(a?.[field] || 0).getTime();
  return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
}

function primaryLeadershipCompetency(data) {
  return (data.programCompetencies || [])
    .filter((item) => item.status === "active")
    .slice()
    .sort((a, b) => Number(a.priority || 99) - Number(b.priority || 99) || newestFirst(a, b))[0] || null;
}

function activeLeadershipCompetencies(data) {
  return (data.programCompetencies || [])
    .filter((item) => item.status === "active")
    .slice()
    .sort((a, b) => Number(a.priority || 99) - Number(b.priority || 99) || newestFirst(a, b));
}

function nowFocusAssignments(plan) {
  return (plan.areas || [])
    .map((area, index) => ({ area: normalizeArea(area), index }))
    .filter((item) => hasAreaContent(item.area))
    .sort((a, b) => Number(b.area.projectType === "outer") - Number(a.area.projectType === "outer") || a.index - b.index);
}

function latestRelevantResource(data) {
  const resources = (data.sharedResources || []).slice().sort((a, b) => newestFirst(a, b, "shared_at"));
  return resources.find((item) => item.status === "assigned") || resources[0] || null;
}

function relevantSession(plan) {
  const sessions = (plan.sessions || [])
    .filter((session) => session.date || session.focus || session.goal || session.notes || session.actions || session.reflection)
    .slice();
  const today = localIsoDate();
  const upcoming = sessions
    .filter((session) => session.date && session.date >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;
  if (upcoming) return { session: upcoming, upcoming: true };
  const latest = sessions.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())[0] || null;
  return latest ? { session: latest, upcoming: false } : null;
}

function nowSessionContext(plan, relevant) {
  const session = relevant?.session || null;
  if (!session) return "";
  const sessions = plan.sessions || [];
  const index = sessions.indexOf(session);
  const ordinal = index >= 0 ? `Samtale ${index + 1}` : "Samtale";
  const date = session.date ? formatDate(session.date) : "";
  return [ordinal, date].filter(Boolean).join(" · ");
}

function latestReflection(data) {
  return (data.reflections || []).slice().sort((a, b) => newestFirst(a, b))[0] || null;
}

function hasActionReviewContent(action) {
  const parsed = parseActionDescription(action.description || "");
  return Boolean(parsed.observation || parsed.effect || parsed.learning || parsed.nextStep);
}

async function openNowResource(resource, data) {
  state.selectedSharedResourceProgramId = data.program?.id || null;
  state.selectedSharedResourceId = resource.id;
  state.sharedResourceQuery = "";
  renderCachedProgram("resources");
  if (state.profile.role === "client" && resource.status === "assigned") {
    await openSharedResource(resource, true);
    renderCachedProgram("resources");
  }
}

function openNowCompetency(item) {
  state.focusView = "competencies";
  state.selectedCompetencyId = item?.id || null;
  renderCachedProgram("work");
}

function openNowFocusAssignment(item) {
  state.focusView = "assignments";
  state.selectedFocusIndex = item?.index || 0;
  renderCachedProgram("work");
}

function openNowReflection() {
  state.reflectionComposerOpen = true;
  renderCachedProgram("reflections");
  requestAnimationFrame(() => $("#reflection-body")?.focus());
}

function createNowAction({ key, priority, kicker, title, description, iconName, ctaLabel, onAction }) {
  return { key, priority, kicker, title, description, iconName, ctaLabel, onAction };
}

function nowActionSummary(action) {
  const parsed = parseActionDescription(action?.description || "");
  return parsed.action || parsed.hypothesis || parsed.observation || parsed.learning || parsed.nextStep || parsed.signals || "";
}

function contentPreviewText(value, maxLength = 120) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function hasNowActionContent(action) {
  return Boolean((action?.title || "").trim() || nowActionSummary(action));
}

function nowDirectionSummary(plan) {
  const specs = getDirectionSpecs(plan);
  const completed = specs.filter(directionSpecHasValue).length;
  return { completed, total: specs.length };
}

function nowActionItems({ data, plan, editable }) {
  const direction = nowDirectionSummary(plan);
  const primary = primaryLeadershipCompetency(data);
  const activeActions = (data.actions || []).filter((action) => isExperimentActive(action.status));
  const datedAction = activeActions.find((action) => action.due_date && action.due_date <= localIsoDate() && hasNowActionContent(action));
  const resource = latestRelevantResource(data);
  const relevant = relevantSession(plan);
  const session = relevant?.session || null;
  const reflection = latestReflection(data);
  const items = [];

  if (direction.completed < direction.total) {
    items.push(createNowAction({
      key: "direction",
      priority: 10,
      kicker: "Retning",
      title: direction.completed === 0 ? "Retning er ikke satt ennå" : "Retningen er delvis utfylt",
      description: direction.completed === 0
        ? "Legg inn retning når dere vil samle mål, forventninger og rammer her."
        : `${direction.completed} av ${direction.total} deler er fylt ut.`,
      iconName: "target",
      ctaLabel: "Åpne retning",
      onAction: () => activateWorkspacePane("direction")
    }));
  }

  if (!primary) {
    items.push(createNowAction({
      key: "competency",
      priority: 20,
      kicker: "Fokus",
      title: "Hovedfokus er ikke valgt",
      description: "Velg én lederkompetanse hvis dere vil samle forløpet rundt et tydelig tema.",
      iconName: "compass",
      ctaLabel: "Velg lederkompetanse",
      onAction: () => openCompetencyChooser(data)
    }));
  }

  if (resource?.status === "assigned") {
    items.push(createNowAction({
      key: "resource",
      priority: 30,
      kicker: "Ressurs",
      title: resource.resource?.title || "Ressurs fra coach",
      description: resource.coach_note || resource.resource?.summary || "Coachen har delt en ressurs med deg.",
      iconName: "book-open",
      ctaLabel: "Åpne ressurs",
      onAction: () => openNowResource(resource, data)
    }));
  }

  if (session) {
    const sessionContext = nowSessionContext(plan, relevant);
    items.push(createNowAction({
      key: "session",
      priority: relevant.upcoming ? 35 : 60,
      kicker: relevant.upcoming ? "Neste samtale" : "Siste samtale",
      title: session.focus || session.goal || sessionContext || "Samtale",
      description: sessionContext,
      iconName: "messages-square",
      ctaLabel: "Åpne samtaler",
      onAction: () => activateWorkspacePane("sessions")
    }));
  }

  if (datedAction) {
    const summary = nowActionSummary(datedAction);
    items.push(createNowAction({
      key: "action-note",
      priority: 50,
      kicker: "Arbeidsnotat",
      title: datedAction.title || "Notat med tilbakeblikkdato",
      description: summary || (datedAction.due_date ? `Dato satt til ${formatDate(datedAction.due_date)}.` : "Dette notatet kan åpnes hvis du vil oppdatere det."),
      iconName: "calendar-clock",
      ctaLabel: "Åpne notat",
      onAction: () => editAction(datedAction, data)
    }));
  }

  if (reflection) {
    items.push(createNowAction({
      key: "reflection",
      priority: 70,
      kicker: "Refleksjon",
      title: reflection.visibility === "shared_with_coach" ? "Delt refleksjon" : "Privat refleksjon",
      description: reflection.body ? contentPreviewText(reflection.body, 120) : "Refleksjonen er lagret i historikken.",
      iconName: "message-square-text",
      ctaLabel: "Åpne refleksjon",
      onAction: () => activateWorkspacePane("reflections")
    }));
  }

  if (resource && resource.status !== "assigned") {
    items.push(createNowAction({
      key: "resource-history",
      priority: 80,
      kicker: "Ressurs",
      title: resource.resource?.title || "Ressurs i planen",
      description: resource.resource?.summary || "Ressursen er tilgjengelig når du trenger den.",
      iconName: "book-open",
      ctaLabel: "Åpne ressurs",
      onAction: () => openNowResource(resource, data)
    }));
  }

  if (!items.length && editable) {
    items.push(createNowAction({
      key: "start",
      priority: 100,
      kicker: "Oversikt",
      title: "Ingenting krever oppfølging nå",
      description: "Bruk retning, fokus, samtaler og ressurser når de er nyttige i forløpet.",
      iconName: "file-text",
      ctaLabel: "Start i retning",
      onAction: () => activateWorkspacePane("direction")
    }));
  }

  if (!items.length && !editable) {
    items.push(createNowAction({
      key: "overview",
      priority: 100,
      kicker: "Oversikt",
      title: "Ingenting krever oppfølging nå",
      description: "Her vises retning, fokus, samtaler og ressurser når de er lagt inn.",
      iconName: "file-text",
      ctaLabel: "",
      onAction: null
    }));
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

function nowWorkspace(client, data, plan) {
  const editable = canEditProgram(client);
  const actions = nowActionItems({ data, plan, editable });
  const primary = actions[0] || null;
  const supporting = actions.slice(1);
  const primaryCompetency = primaryLeadershipCompetency(data);
  const focusItems = nowFocusAssignments(plan);
  return el("div", { class: "platform-page now-workspace now-workspace-v2" }, [
    pageIntro("Akkurat nå", "Oversikt akkurat nå", "Her ser du det som er lagt inn akkurat nå."),
    primary ? nowPrimaryAction(primary, editable) : nowEmptyState(editable),
    nowActionGrid(supporting, editable),
    nowProgressStrip({ primaryCompetency, focusItems, actions: data.actions || [], sessions: plan.sessions || [], resources: data.sharedResources || [] })
  ].filter(Boolean));
}

function nowPrimaryAction(item, editable) {
  return el("section", { class: "now-primary-action", "aria-labelledby": "now-primary-title" }, [
    el("span", { class: "now-primary-icon", "aria-hidden": "true" }, [icon(item.iconName || "arrow-right")]),
    el("div", { class: "now-primary-copy" }, [
      el("span", { class: "workspace-kicker", text: item.kicker }),
      el("h3", { id: "now-primary-title", text: item.title }),
      el("p", { text: item.description })
    ].filter(Boolean)),
    editable && item.onAction ? el("button", { class: "ui-button ui-button-filled now-primary-cta", type: "button", text: item.ctaLabel || "Åpne", onclick: item.onAction }) : null
  ].filter(Boolean));
}

function nowActionGrid(items = [], editable) {
  if (!items.length) return null;
  return el("section", { class: "now-action-section", "aria-labelledby": "now-action-title" }, [
    el("div", { class: "now-section-heading" }, [
      el("span", { class: "workspace-kicker", text: "Aktuelt" }),
      el("h3", { id: "now-action-title", text: "Mest relevant nå" })
    ]),
    el("div", { class: "now-action-grid" }, items.map((item) => el("button", { class: "now-action-card", type: "button", disabled: !editable || !item.onAction, onclick: item.onAction }, [
      el("span", { class: "now-action-icon", "aria-hidden": "true" }, [icon(item.iconName || "arrow-right")]),
      el("span", { class: "now-action-copy" }, [
        el("span", { class: "workspace-kicker", text: item.kicker }),
        el("strong", { text: item.title }),
        item.description ? el("small", { text: item.description }) : null
      ].filter(Boolean)),
      icon("chevron-right")
    ])))
  ]);
}

function nowProgressStrip({ primaryCompetency, focusItems, actions, sessions, resources }) {
  return el("section", { class: "now-progress-strip", "aria-label": "Status i utviklingsforløpet" }, [
    nowProgressMetric("Hovedfokus", primaryCompetency?.title || "Ikke valgt", "compass", () => primaryCompetency ? openNowCompetency(primaryCompetency) : activateWorkspacePane("work")),
    nowProgressMetric("Fokusoppdrag", focusItems.length ? String(focusItems.length) : "Ingen", "briefcase-business", () => activateWorkspacePane("work")),
    nowProgressMetric("Samtaler", String(sessions.length || 0), "messages-square", () => activateWorkspacePane("sessions")),
    nowProgressMetric("Ressurser", String(resources.length || 0), "book-open", () => activateWorkspacePane("resources")),
    nowProgressMetric("Arbeidsnotater", String(actions.length || 0), "file-text", () => {
      state.focusView = "experiments";
      renderCachedProgram("work");
    })
  ]);
}

function nowProgressMetric(label, value, iconName, onAction) {
  return el("button", { class: "now-progress-metric", type: "button", onclick: onAction }, [
    el("span", { class: "now-progress-icon", "aria-hidden": "true" }, [icon(iconName)]),
    el("span", {}, [
      el("small", { text: label }),
      el("strong", { text: value })
    ])
  ]);
}

function nowEmptyState(editable) {
  return el("section", { class: "now-primary-action now-empty-action", "aria-labelledby": "now-empty-title" }, [
    el("span", { class: "now-primary-icon", "aria-hidden": "true" }, [icon("file-text")]),
    el("div", { class: "now-primary-copy" }, [
      el("span", { class: "workspace-kicker", text: "Oversikt" }),
      el("h3", { id: "now-empty-title", text: "Planen er tom foreløpig" }),
      el("p", { text: "Fyll ut retning, fokus eller samtalenotater når det gir verdi i forløpet." }),
      el("small", { text: "Portalen kan brukes som enkel dokumentasjon. Det er ikke meningen at alt skal fylles ut." })
    ]),
    editable ? el("button", { class: "ui-button ui-button-filled now-primary-cta", type: "button", text: "Start i retning", onclick: () => activateWorkspacePane("direction") }) : null
  ].filter(Boolean));
}

function focusWorkbench(items, data, editable) {
  if (!items.length) {
    return el("div", { class: "focus-workspace-stack" }, [
      el("div", { class: "focus-workbench focus-workbench-empty" }, [
        el("div", { class: "focus-master" }, [
          focusEmptyState(editable)
        ])
      ])
    ]);
  }

  const selectedItemIndex = Math.max(0, Math.min(state.selectedFocusIndex || 0, items.length - 1));
  const selected = items[selectedItemIndex] || items[0] || null;
  const detail = el("aside", { class: "focus-detail" }, [
    focusDetail(selected, data, editable)
  ]);
  const grid = focusList(items, editable, data, detail);
  return el("div", { class: "focus-workspace-stack" }, [
    el("div", { class: "focus-workbench workspace-split-view" }, [
      el("div", { class: "focus-master" }, [
        grid
      ]),
      el("div", { class: "focus-detail-wrap" }, [detail])
    ])
  ]);
}

function focusIntro(editable = false) {
  return workspaceIntro("Fokusoppdrag", "Hvor skal utviklingen merkes?", "Legg til konkrete prosjekter, leveranser eller situasjoner der du vil gjøre en forskjell.", [
    editable ? addAction("Nytt fokusoppdrag", () => addFocusArea()) : null
  ].filter(Boolean));
}

function freeExperimentSection(actions, data, editable) {
  if (!actions.length && !editable) return null;
  return el("section", { class: "ui-section-card free-experiments" }, [
    el("div", { class: "experiment-section-head" }, [
      el("div", {}, [
        el("h4", { text: "Eksperimenter på tvers" }),
        el("p", { text: "Ting du vil prøve uten å knytte dem til ett bestemt fokusoppdrag." })
      ]),
      editable ? addAction("Legg til eksperiment", () => createAction(data, "")) : null
    ].filter(Boolean)),
    actions.length ? el("div", { class: "experiment-list" }, actions.map((action) => experimentRow(action, data, editable))) : null
  ].filter(Boolean));
}

function relatedExperiments({ actions = [], data, editable = false, onCreate, contextLabel = "dette arbeidet" }) {
  const active = actions.filter((action) => isExperimentActive(action.status));
  const history = actions.filter((action) => isExperimentReviewed(action.status));
  return el("section", { class: "related-experiments" }, [
    el("div", { class: "experiment-section-head" }, [
      el("div", {}, [
        el("span", { class: "workspace-kicker", text: "I praksis" }),
        el("h4", { text: "Eksperimenter" }),
        el("p", { text: "Prøv → observer → lær → juster. Samle det du prøver, hva du observerer og hva du vil justere." })
      ]),
      editable ? addAction("Legg til eksperiment", onCreate) : null
    ].filter(Boolean)),
    active.length ? el("div", { class: "related-experiment-group" }, [
      el("strong", { text: `Åpne · ${active.length}` }),
      el("div", { class: "experiment-list" }, active.map((action) => experimentRow(action, data, editable)))
    ]) : el("p", { class: "muted related-experiment-empty", text: "Ingen åpne eksperimenter." }),
    history.length ? el("details", { class: "experiment-history-group" }, [
      el("summary", {}, [el("span", { text: `Historikk · ${history.length}` }), icon("chevron-down")]),
      el("div", { class: "experiment-list" }, history.map((action) => experimentRow(action, data, editable)))
    ]) : null,
    actions.length ? el("button", {
      class: "ui-button ui-button-outlined related-experiment-all",
      type: "button",
      text: "Se alle eksperimenter",
      onclick: () => {
        state.focusView = "experiments";
        renderCachedProgram("work");
      }
    }) : null
  ].filter(Boolean));
}

function experimentHubWorkspace(data, editable) {
  const actions = data.actions || [];
  const visible = actions.filter((action) => {
    const matchesState = state.experimentView === "history" ? isExperimentReviewed(action.status) : isExperimentActive(action.status);
    if (!matchesState) return false;
    if (state.experimentFilter === "competency") return Boolean(action.program_competency_id);
    if (state.experimentFilter === "assignment") return Boolean(action.development_area_id);
    if (state.experimentFilter === "both") return Boolean(action.program_competency_id && action.development_area_id);
    if (state.experimentFilter === "unlinked") return !action.program_competency_id && !action.development_area_id;
    return true;
  });
  const filter = el("select", {
    class: "experiment-hub-filter",
    "aria-label": "Filtrer eksperimenter",
    onchange: (event) => {
      state.experimentFilter = event.currentTarget.value;
      renderCachedProgram("work");
    }
  }, [
    ["all", "Alle koblinger"],
    ["competency", "Knyttet til lederkompetanse"],
    ["assignment", "Knyttet til fokusoppdrag"],
    ["both", "Knyttet til begge"],
    ["unlinked", "Uten kobling"]
  ].map(([value, label]) => el("option", { value, text: label })));
  filter.value = state.experimentFilter;

  return el("section", { class: "experiment-hub-workspace platform-surface" }, [
    el("header", { class: "experiment-hub-head" }, [
      el("div", {}, [
        el("span", { class: "workspace-kicker", text: "Eksperimenter" }),
        el("h3", { text: "Alle eksperimenter" }),
        el("p", { text: "Prøv noe nytt, observer hva som skjer og bruk læringen til å justere." })
      ]),
      editable ? addAction("Legg til eksperiment", () => createAction(data)) : null
    ].filter(Boolean)),
    el("div", { class: "experiment-hub-tools" }, [
      el("div", { class: "experiment-state-tabs", role: "tablist", "aria-label": "Eksperimentstatus" }, [
        ["active", `Åpne · ${actions.filter((action) => isExperimentActive(action.status)).length}`],
        ["history", `Historikk · ${actions.filter((action) => isExperimentReviewed(action.status)).length}`]
      ].map(([value, label]) => el("button", {
        class: state.experimentView === value ? "active" : "",
        type: "button",
        role: "tab",
        "aria-selected": state.experimentView === value ? "true" : "false",
        text: label,
        onclick: () => {
          state.experimentView = value;
          renderCachedProgram("work");
        }
      }))),
      filter
    ]),
    visible.length
      ? el("div", { class: "experiment-list experiment-hub-list" }, visible.map((action) => experimentRow(action, data, editable)))
      : emptyState(state.experimentView === "history" ? "Ingen historikk med dette filteret" : "Ingen åpne eksperimenter med dette filteret", "Opprett et lite forsøk eller velg en annen kobling.")
  ]);
}

function focusList(items, editable, data, detail) {
  return el("div", { class: "focus-picker workspace-master-rail" }, [
    el("div", { class: "focus-picker-head workspace-master-head" }, [
      el("strong", { text: "Fokusoppdrag" }),
      el("span", { class: "ui-meta", text: String(items.length) })
    ]),
    ...items.map(({ area, index }, itemIndex) => el("article", { class: `focus-nav-item workspace-master-row ${itemIndex === (state.selectedFocusIndex || 0) ? "active" : ""}` }, [
      el("button", { class: "focus-nav-button workspace-master-button", type: "button", onclick: (event) => selectFocusCard(event.currentTarget, { area, index, itemIndex }, data, editable, detail) }, [
        el("span", { class: "leadership-track-index workspace-master-marker", "aria-hidden": "true" }, [icon("briefcase-business")]),
        el("span", { class: "leadership-track-main workspace-master-main" }, [
          el("span", { class: "leadership-track-heading workspace-master-heading" }, [
            el("strong", { text: area.title || "Fokusoppdrag uten tittel" }),
            el("small", { text: focusPlanStatus(area).label })
          ]),
          el("span", { class: "workspace-master-meta" }, [
            el("span", { class: `ui-meta type-chip ${projectTypeClass(area.projectType)}`, text: projectTypeLabel(area.projectType) })
          ]),
          contentPreview(area.movement || area.description, "Hva vil du rette oppmerksomheten mot?", 2)
        ]),
        icon("chevron-right")
      ])
    ].filter(Boolean))),
    editable ? el("button", { class: "ui-add-row focus-add-card", type: "button", onclick: () => addFocusArea() }, [
      el("span", { class: "ui-add-icon add-orb" }, [icon("plus")]),
      el("strong", { text: "Nytt fokusoppdrag" })
    ]) : null,
    !items.length && !editable ? emptyState("Ingen fokusoppdrag ennå", "Fokusoppdrag blir synlige her når de er lagt inn.") : null
  ].filter(Boolean));
}

function selectFocusCard(buttonNode, item, data, editable, detail) {
  const card = buttonNode.closest(".focus-nav-item");
  state.selectedFocusIndex = item.itemIndex || 0;
  $$(".focus-nav-item", card.parentElement).forEach((node) => node.classList.toggle("active", node === card));
  detail.replaceChildren(focusDetail(item, data, editable));
  refreshIcons();
}

function focusDetail({ area, index }, data, editable) {
  const actions = data.actions.filter((action) => action.development_area_id === area.id);
  const activeActions = actions.filter((action) => isExperimentActive(action.status));
  const planStatus = focusPlanStatus(area);
  const missingStep = [
    ["movement", "Beskriv ønsket utfall", "Hva skal du oppnå – eller hva skal bli annerledes?", "Beskriv ønsket utfall"],
    ["typicalSituations", "Velg hvor forskjellen skal merkes", "Hvilken situasjon, leveranse, møte eller relasjon er viktigst – og for hvem?", "Velg arbeidsarena"],
    ["progressSigns", "Velg et tegn på fremgang", "Hva vil vise at arbeidet er på rett vei?", "Velg tegn på fremgang"]
  ].find(([fieldKey]) => !((fieldKey === "movement" ? area.movement || area.description : area[fieldKey]) || "").trim());
  const nextLabel = missingStep?.[1] || (!activeActions.length ? "Planlegg første eksperiment" : "Følg opp eksperimentet");
  const nextHelper = missingStep?.[2] || (!activeActions.length ? "Gjør neste steg lite nok til å prøve i en faktisk arbeidssituasjon." : "Åpne eksperimentet og noter hva du observerte.");
  const nextHandler = missingStep
    ? () => openFocusField(index, missingStep[0])
    : !activeActions.length
      ? () => createAction(data, area.id)
      : () => editAction(activeActions[0], data);
  return el("section", { class: "focus-detail-card competency-workspace workspace-detail-surface" }, [
    el("header", { class: "competency-workspace-head" }, [
      el("div", { class: "competency-workspace-heading" }, [
        el("span", { class: "competency-context" }, [
          el("span", { class: "workspace-kicker", text: area.projectType === "outer" ? `Fokusoppdrag ${index + 1}` : "Tidligere fokusområde" }),
          area.projectType === "outer" ? el("span", { class: `ui-meta type-chip ${projectTypeClass(area.projectType)}`, text: projectTypeLabel(area.projectType) }) : null
        ].filter(Boolean)),
        editableTitle({
          className: "focus-title-edit",
          title: area.title || "Gi fokusoppdraget et navn",
          empty: !area.title,
          editable,
          editKey: `focus:${index}:title`,
          value: area.title || "",
          placeholder: "Gi fokusoppdraget et kort navn.",
          onSave: async (nextValue) => saveFocusField(index, "title", nextValue)
        })
      ]),
      editable ? iconAction("Arkiver fokusoppdrag", "archive", () => deleteFocusArea(index), "danger") : null
    ].filter(Boolean)),
    workspaceNextStep({
      complete: planStatus.ready,
      label: nextLabel,
      helper: nextHelper,
      actionLabel: missingStep?.[3] || (!activeActions.length ? "Legg til eksperiment" : "Følg opp eksperiment"),
      onAction: nextHandler,
      editable
    }),
    workspacePlan({
      className: "focus-assignment-plan",
      title: "Arbeidsplan for fokusoppdraget",
      description: "Gjør oppdraget konkret nok til å kunne prioriteres, prøves og følges opp.",
      status: planStatus,
      steps: [
        focusPlanStep(area, index, 1, "Målbilde", "Hva skal du oppnå – eller hva skal bli annerledes?", area.movement || area.description, "Beskriv utfallet eller forskjellen du vil skape.", "movement", editable),
        focusPlanStep(area, index, 2, "Arbeidsarena", "Hvor skal forskjellen merkes – og for hvem?", area.typicalSituations, "Velg situasjonen, leveransen, møtet eller relasjonen der forskjellen skal bli tydelig.", "typicalSituations", editable),
        focusPlanStep(area, index, 3, "Tegn på fremgang", "Hva vil vise at du er på rett vei?", area.progressSigns, "Velg ett konkret tegn du kan følge med på.", "progressSigns", editable)
      ]
    }),
    relatedExperiments({ actions, data, editable, onCreate: () => createAction(data, area.id), contextLabel: area.title || "fokusoppdraget" })
  ]);
}

function focusPlanStatus(area) {
  const count = [area.movement || area.description, area.typicalSituations, area.progressSigns].filter((value) => (value || "").trim()).length;
  if (count === 3) return { key: "ready", label: "Klar til å prøves", ready: true };
  if (count > 0) return { key: "working", label: "Under arbeid", ready: false };
  return { key: "not-started", label: "Ikke påbegynt", ready: false };
}

function openFocusField(index, fieldKey) {
  state.inlineEditKey = `focus:${index}:${fieldKey}`;
  state.selectedFocusIndex = index;
  renderCachedProgram("work");
}

function focusPlanStep(area, index, number, eyebrow, label, value, emptyText, fieldKey, editable) {
  const editKey = `focus:${index}:${fieldKey}`;
  return workspacePlanStep({
    number, eyebrow, label, value, emptyText, editable,
    isEditing: state.inlineEditKey === editKey,
    onEdit: () => openFocusField(index, fieldKey),
    onCancel: () => {
      state.inlineEditKey = null;
      renderCachedProgram("work");
    },
    onSave: (nextValue) => saveFocusField(index, fieldKey, nextValue)
  });
}

function focusDetailWorkspace(area, index, editable) {
  return el("div", { class: "focus-detail-workspace" }, [
    focusDetailBlock("Hva ønsker du skal bli annerledes?", area.movement || area.description, "Hva ønsker du skal bli annerledes?", "movement", area, index, editable, "primary"),
    el("div", { class: "focus-detail-support" }, [
      focusDetailBlock("Når merker du dette mest?", area.typicalSituations, "Hvilke situasjoner, relasjoner eller møter gjør dette tydeligst?", "typicalSituations", area, index, editable),
      focusDetailBlock("Hvordan vil du merke fremgang?", area.progressSigns, "Hvordan vil du merke fremgang?", "progressSigns", area, index, editable)
    ])
  ]);
}

function focusDetailBlock(label, value, emptyText, fieldKey = "", area = null, index = 0, editable = false, variant = "") {
  const text = (value || "").trim();
  const editKey = `focus:${index}:${fieldKey}`;
  if (editable && state.inlineEditKey === editKey) {
    return inlineTextAreaBlock({
      className: `focus-detail-block ${variant}`,
      label,
      value: text,
      placeholder: emptyText,
      onCancel: () => {
        state.inlineEditKey = null;
        renderCachedProgram("work");
      },
      onSave: async (nextValue) => {
        await saveFocusField(index, fieldKey, nextValue);
      }
    });
  }
  return el("article", { class: `ui-field-card focus-detail-block ${variant} ${text ? "" : "is-empty"}` }, [
    el("p", { class: "focus-detail-label", text: label }),
    el("p", { class: "focus-detail-text", text: text || emptyText }),
    editable && fieldKey ? el("button", {
      class: "ui-field-action field-inline-action",
      type: "button",
      text: text ? "Rediger" : "Legg til",
      onclick: () => {
        state.inlineEditKey = editKey;
        renderCachedProgram("work");
      }
    }) : null
  ].filter(Boolean));
}

function focusEmptyState(editable) {
  return el("section", { class: "focus-empty-state" }, [
    el("p", { class: "eyebrow", text: "Fokusoppdrag" }),
    el("h3", { text: "Legg til første fokusoppdrag" }),
    el("p", { class: "muted", text: "Start med prosjektet, leveransen eller situasjonen som krever mest oppmerksomhet nå." }),
    editable ? addAction("Nytt fokusoppdrag", () => addFocusArea()) : null
  ].filter(Boolean));
}

function emptyState(title, text) {
  return el("div", { class: "empty-inline" }, [
    el("strong", { text: title }),
    el("p", { class: "muted", text })
  ]);
}

function addAction(label, handler) {
  return el("button", { class: "ui-add-action", type: "button", onclick: handler }, [
    el("span", { class: "ui-add-icon" }, [icon("plus")]),
    el("span", { text: label })
  ]);
}

function editableTitle({ className = "", title, empty = false, editable = true, editKey, value = "", placeholder = "", onSave }) {
  if (!editable) {
    return el("div", { class: `ui-editable-title ${className}` }, [
      el("h3", { class: empty ? "is-empty" : "", text: title })
    ]);
  }
  if (state.inlineEditKey === editKey) {
    const input = el("input", { class: "ui-title-input", value, placeholder });
    return el("div", { class: `ui-title-editor ${className}` }, [
      input,
      el("div", { class: "ui-inline-editor-actions" }, [
        el("button", { class: "ui-button ui-button-tonal", type: "button", text: "Avbryt", onclick: async () => {
          state.inlineEditKey = null;
          renderCachedProgram(editKey.startsWith("session:") ? "sessions" : "work");
        }}),
        el("button", { class: "ui-button ui-button-filled", type: "button", text: "Lagre", onclick: async () => onSave(input.value) })
      ])
    ]);
  }
  return el("div", { class: `ui-editable-title ${className}` }, [
    el("h3", { class: empty ? "is-empty" : "", text: title }),
    el("button", { class: "ui-title-action", type: "button", text: empty ? "Legg til tittel" : "Rediger tittel", onclick: () => {
      state.inlineEditKey = editKey;
      renderCachedProgram(editKey.startsWith("session:") ? "sessions" : "work");
    }})
  ]);
}

function sessionsWorkspace(sessions, data) {
  const editable = canEditProgram(getCurrentClient());
  return el("section", { class: "platform-page sessions-stack" }, [
    workspaceIntro("Samtaler", "Forbered og følg opp", "Samle det viktigste før, under og etter samtalene.", [
      editable ? addAction("Opprett samtale", () => addSession()) : null
    ].filter(Boolean)),
    sessions.length ? sessionsWorkbench(sessions, data, editable) : sessionEmptyState(editable),
    sessionsEditor(sessions)
  ]);
}

function sessionsWorkbench(sessions, data, editable) {
  const selectedIndex = Math.max(0, Math.min(state.selectedSessionIndex || 0, sessions.length - 1));
  const detail = el("aside", { class: "session-detail" }, [
    sessionDetail(sessions[selectedIndex], selectedIndex, editable, data)
  ]);
  return el("section", { class: "sessions-workbench workspace-split-view" }, [
    sessionRail(sessions, detail, editable, data),
    el("div", { class: "session-detail-wrap" }, [detail])
  ]);
}

function sessionRail(sessions, detail, editable, data) {
  const mobilePicker = el("select", {
    class: "session-mobile-picker-select",
    "aria-label": "Velg samtale",
    onchange: (event) => {
      const index = Number(event.currentTarget.value);
      selectSessionCard(sessions[index], index, detail, editable, data);
    }
  }, sessions.map((session, index) => el("option", {
    value: String(index),
    selected: index === (state.selectedSessionIndex || 0),
    text: `${session.date ? formatDate(session.date) : `Samtale ${index + 1}`} - ${session.focus || "Samtale uten tittel"}`
  })));
  return el("div", { class: "session-rail workspace-master-rail" }, [
    el("header", { class: "session-rail-head workspace-master-head" }, [
      el("strong", { text: "Samtaler" }),
      el("span", { class: "ui-meta", text: `${sessions.length} ${sessions.length === 1 ? "samtale" : "samtaler"}` })
    ]),
    el("label", { class: "session-mobile-picker", text: "Velg samtale" }, [mobilePicker]),
    el("div", { class: "session-rail-list" }, sessions.map((session, index) => {
      const linkedActions = (data?.actions || []).filter((action) => action.session_id === session.id);
      const progress = sessionProgress(session, linkedActions);
      return el("article", { class: `session-nav-item workspace-master-row ${index === (state.selectedSessionIndex || 0) ? "active" : ""}` }, [
        el("button", { class: "session-nav-button workspace-master-button", type: "button", onclick: () => selectSessionCard(session, index, detail, editable, data) }, [
          el("span", { class: "leadership-track-index workspace-master-marker", "aria-hidden": "true" }, [icon("messages-square")]),
          el("span", { class: "leadership-track-main workspace-master-main" }, [
            el("span", { class: "leadership-track-heading workspace-master-heading" }, [
              el("strong", { text: session.focus || "Samtale uten tittel" }),
              el("small", { text: sessionPlanStatus(progress).label })
            ]),
            el("span", { class: "workspace-master-meta" }, [
              el("span", { text: session.date ? formatDate(session.date) : `Samtale ${index + 1}` })
            ]),
            contentPreview(session.goal, "Hva skal samtalen hjelpe med?", 2)
          ]),
          icon("chevron-right")
        ])
      ]);
    }))
  ]);
}

function selectSessionCard(session, index, detail, editable, data) {
  const cards = $$(".session-nav-item", detail.closest(".sessions-workbench"));
  state.selectedSessionIndex = index;
  cards.forEach((node, itemIndex) => node.classList.toggle("active", itemIndex === index));
  const mobilePicker = $(".session-mobile-picker-select", detail.closest(".sessions-workbench"));
  if (mobilePicker) mobilePicker.value = String(index);
  detail.replaceChildren(sessionDetail(session, index, editable, data));
  refreshIcons();
}

function sessionDetail(session, index, editable, data = null) {
  const linkedActions = (data?.actions || []).filter((action) => action.session_id === session.id);
  const activeLinkedActions = linkedActions.filter((action) => isExperimentActive(action.status));
  const progress = sessionProgress(session, linkedActions);
  const nextField = sessionNextField(session);
  const nextLabel = nextField?.label || (!activeLinkedActions.length ? "Gjør neste steg om til et lite eksperiment" : "Følg opp eksperimentet");
  const nextHelper = nextField?.helper || (!activeLinkedActions.length ? "Knytt handlingen til en situasjon og bestem hva du vil se etter." : "Åpne eksperimentet og noter hva du observerte.");
  const nextHandler = nextField
    ? () => openSessionField(index, nextField.key)
    : !activeLinkedActions.length
      ? () => createActionFromSessionNextStep(index, session.actions || "")
      : () => editAction(activeLinkedActions[0], data);
  return el("section", { class: "session-detail-card competency-workspace workspace-detail-surface" }, [
    el("header", { class: "competency-workspace-head" }, [
      el("div", { class: "competency-workspace-heading" }, [
        el("span", { class: "competency-context" }, [
          el("span", { class: "workspace-kicker", text: `Samtale ${index + 1}` }),
          session.date ? el("span", { class: "ui-meta type-chip", text: formatDate(session.date) }) : null
        ].filter(Boolean)),
        editableTitle({
          className: "session-title-edit",
          title: session.focus || "Gi samtalen en tittel",
          empty: !session.focus,
          editable,
          editKey: `session:${index}:focus`,
          value: session.focus || "",
          placeholder: "Gi samtalen en kort tittel.",
          onSave: async (nextValue) => saveSessionField(index, "focus", nextValue)
        })
      ]),
      editable ? iconAction("Arkiver samtale", "archive", () => deleteSession(index), "danger") : null
    ].filter(Boolean)),
    workspaceNextStep({
      complete: progress.completed === 5,
      label: nextLabel,
      helper: nextHelper,
      actionLabel: nextField?.actionLabel || (!activeLinkedActions.length ? "Legg til eksperiment" : "Følg opp eksperiment"),
      onAction: nextHandler,
      editable
    }),
    workspacePlan({
      className: "session-conversation-plan",
      title: "Samtaleplan",
      description: "Avklar hva samtalen skal hjelpe med. Etterpå samler du det som ble tydelig og det du vil prøve.",
      status: sessionPlanStatus(progress),
      steps: [
        sessionPlanStep(session, index, 1, "Før samtalen", "Hva skal samtalen hjelpe med?", session.goal, "Hva håper dere å forstå, avklare eller komme videre på?", "goal", editable),
        sessionPlanStep(session, index, 2, "Etter samtalen", "Hva ble tydelig?", session.notes, "Noter det viktigste mens det er ferskt.", "notes", editable),
        sessionPlanStep(session, index, 3, "Til neste gang", "Hva vil du prøve eller følge opp?", session.actions, "Beskriv én konkret handling.", "actions", editable, {
          label: "Gjør til eksperiment",
          icon: "flask-conical",
          onClick: () => createActionFromSessionNextStep(index, session.actions || "")
        }),
        sessionPlanStep(session, index, 4, "Ta med videre", "Hva vil du huske til neste samtale?", session.reflection, "Noter det du vil vende tilbake til.", "reflection", editable),
        workspaceExperimentStep({
          number: 5,
          actions: linkedActions,
          data,
          editable,
          onCreate: () => createActionFromSessionNextStep(index, session.actions || ""),
          emptyLabel: "Planlegg første forsøk",
          completeLabel: "Eksperimenter fra samtalen",
          emptyText: "Gjør neste steg lite nok til å prøve i en konkret situasjon."
        })
      ]
    })
  ].filter(Boolean));
}

function sessionProgress(session = {}, linkedActions = []) {
  const values = [session.goal, session.notes, session.actions, session.reflection];
  const completed = values.filter((value) => (value || "").trim()).length + (linkedActions.length ? 1 : 0);
  return { completed, percent: Math.round((completed / 5) * 100) };
}

function sessionPlanStatus(progress = {}) {
  if (Number(progress.completed) >= 5) return { key: "ready", label: "Samtalen er fulgt opp", ready: true };
  if (Number(progress.completed) > 0) return { key: "working", label: "Under arbeid", ready: false };
  return { key: "not-started", label: "Ikke påbegynt", ready: false };
}

function sessionNextField(session = {}) {
  return [
    { key: "focus", value: session.focus, label: "Gi samtalen en tydelig tittel", helper: "En kort tittel gjør samtalen lett å finne igjen.", actionLabel: "Skriv tittel" },
    { key: "goal", value: session.goal, label: "Avklar hva samtalen skal hjelpe med", helper: "Hva bør være tydeligere når samtalen er ferdig?", actionLabel: "Beskriv formålet" },
    { key: "notes", value: session.notes, label: "Noter det som ble tydelig", helper: "Hva la du særlig merke til i samtalen?", actionLabel: "Skriv notat" },
    { key: "actions", value: session.actions, label: "Velg hva du vil prøve eller følge opp", helper: "Hva skal skje i praksis?", actionLabel: "Beskriv neste handling" },
    { key: "reflection", value: session.reflection, label: "Noter det du vil huske", helper: "Hva bør du vende tilbake til i neste samtale?", actionLabel: "Skriv det du vil huske" }
  ].find((item) => !(item.value || "").trim()) || null;
}

function openSessionField(index, fieldKey) {
  state.inlineEditKey = `session:${index}:${fieldKey}`;
  renderCachedProgram("sessions");
}

function sessionPlanStep(session, index, number, eyebrow, label, value, emptyText, fieldKey, editable, secondaryAction = null) {
  const editKey = `session:${index}:${fieldKey}`;
  return workspacePlanStep({
    number, eyebrow, label, value, emptyText, editable, secondaryAction,
    isEditing: state.inlineEditKey === editKey,
    onEdit: () => openSessionField(index, fieldKey),
    onCancel: () => {
      state.inlineEditKey = null;
      renderCachedProgram("sessions");
    },
    onSave: (nextValue) => saveSessionField(index, fieldKey, nextValue)
  });
}

function sessionDetailBlock(label, value, emptyText, fieldKey = "", index = 0, editable = false, variant = "") {
  const text = (value || "").trim();
  const editKey = `session:${index}:${fieldKey}`;
  if (editable && state.inlineEditKey === editKey) {
    return inlineTextAreaBlock({
      className: `session-detail-block ${variant}`,
      label,
      value: text,
      placeholder: emptyText,
      onCancel: () => {
        state.inlineEditKey = null;
        renderCachedProgram("sessions");
      },
      onSave: async (nextValue) => {
        await saveSessionField(index, fieldKey, nextValue);
      }
    });
  }
  return el("article", { class: `session-detail-block ${variant} ${text ? "" : "is-empty"}` }, [
    el("p", { class: "session-detail-label", text: label }),
    el("p", { class: "session-detail-text", text: text || emptyText }),
    editable && fieldKey ? el("div", { class: "field-inline-row" }, [
      fieldKey === "actions" && text ? el("button", {
        class: "ui-field-action field-inline-action",
        type: "button",
        text: "Gjør til eksperiment",
        onclick: () => createActionFromSessionNextStep(index, text)
      }) : null,
      el("button", {
        class: "ui-field-action field-inline-action",
        type: "button",
        text: text ? "Rediger" : "Legg til",
        onclick: () => {
          state.inlineEditKey = editKey;
          renderCachedProgram("sessions");
        }
      })
    ].filter(Boolean)) : null
  ].filter(Boolean));
}

function inlineTextAreaBlock({ className, label, value, placeholder, onCancel, onSave }) {
  const textarea = el("textarea", { class: "ui-edit-control inline-textarea", text: value || "", placeholder });
  return el("article", { class: `ui-inline-editor ${className} is-editing` }, [
    el("p", { class: "focus-detail-label", text: label }),
    textarea,
    el("div", { class: "ui-inline-editor-actions inline-edit-actions" }, [
      el("button", { class: "ui-button ui-button-tonal", type: "button", text: "Avbryt", onclick: async () => onCancel() }),
      el("button", { class: "ui-button ui-button-filled", type: "button", text: "Lagre", onclick: async () => onSave(textarea.value) })
    ])
  ]);
}

async function saveFocusField(index, fieldKey, value) {
  const areas = getAreas();
  const area = normalizeArea(areas[index]);
  const next = [...areas];
  next[index] = {
    ...area,
    [fieldKey]: value || "",
    description: fieldKey === "movement" ? value || "" : area.description
  };
  setAreas(next.filter(hasAreaContent));
  state.inlineEditKey = null;
  markDirty();
  const saved = await savePlan();
  if (!saved) return;
  await reloadProgramAndRender("work");
}

async function saveSessionField(index, fieldKey, value) {
  const sessions = getSessions();
  const session = sessions[index] || {};
  const next = [...sessions];
  next[index] = { ...session, [fieldKey]: value || "" };
  setSessions(next.filter((item) => item.date || item.focus || item.goal || item.notes || item.actions || item.reflection));
  state.inlineEditKey = null;
  markDirty();
  const saved = await savePlan();
  if (!saved) return;
  await reloadProgramAndRender("sessions");
}

function sessionEmptyState(editable) {
  return el("section", { class: "focus-empty-state session-empty-state" }, [
    el("p", { class: "eyebrow", text: "Samtaler" }),
    el("h3", { text: "Planlegg første coachingsamtale" }),
    el("p", { class: "muted", text: "Start med hva samtalen skal hjelpe med. Etterpå kan du samle det som ble tydelig og hva du vil prøve videre." }),
    editable ? addAction("Opprett samtale", () => addSession()) : null
  ].filter(Boolean));
}

function areasEditor(areas) {
  const wrap = el("div", { class: "hidden-editor", id: "areas-editor" });
  const render = (items) => {
    wrap.replaceChildren(...items.map((area) => {
      const item = normalizeArea(area);
      return el("div", { "data-area": "" }, [
        el("input", { name: "area.id", value: item.id }),
        el("input", { name: "area.title", value: item.title }),
        el("input", { name: "area.projectType", value: item.projectType }),
        el("textarea", { name: "area.description", text: item.description }),
        el("textarea", { name: "area.movement", text: item.movement }),
        el("textarea", { name: "area.typicalSituations", text: item.typicalSituations }),
        el("textarea", { name: "area.progressSigns", text: item.progressSigns }),
        el("textarea", { name: "area.nextPractice", text: item.nextPractice })
      ]);
    }));
  };
  render(areas);
  return wrap;
}

function addFocusArea() {
  const next = [...getAreas().filter(hasAreaContent), { title: "Nytt fokusoppdrag", description: "", projectType: "outer", movement: "", typicalSituations: "", progressSigns: "", nextPractice: "" }];
  setAreas(next);
  state.selectedFocusIndex = next.length - 1;
  state.inlineEditKey = `focus:${next.length - 1}:title`;
  markDirty();
  savePlan().then((saved) => {
    if (saved) reloadProgramAndRender("work");
  });
}

async function deleteFocusArea(index) {
  if (!(await confirmDelete("Arkivere dette fokusoppdraget? Eksperimenter, refleksjoner og delte ressurser bevares i historikken.", {
    kicker: "Fokusoppdrag",
    title: "Arkiver fokusoppdrag?",
    confirmLabel: "Arkiver"
  }))) return false;
  const areas = getAreas();
  const area = areas[index];
  if (area?.id) {
    const archived = await archiveRecord("development_areas", area.id, "fokusoppdraget");
    if (!archived) return false;
  }
  setAreas(areas.filter((_, itemIndex) => itemIndex !== index));
  markDirty();
  const saved = await savePlan();
  if (!saved) return false;
  await reloadProgramAndRender("work");
  return true;
}

function setAreas(values) {
  const editor = $("#areas-editor");
  if (!editor) return;
  editor.replaceChildren(...values.map((area) => {
    const item = normalizeArea(area);
    return el("div", { "data-area": "" }, [
      el("input", { name: "area.id", value: item.id }),
      el("input", { name: "area.title", value: item.title }),
      el("input", { name: "area.projectType", value: item.projectType }),
      el("textarea", { name: "area.description", text: item.description }),
      el("textarea", { name: "area.movement", text: item.movement }),
      el("textarea", { name: "area.typicalSituations", text: item.typicalSituations }),
      el("textarea", { name: "area.progressSigns", text: item.progressSigns }),
      el("textarea", { name: "area.nextPractice", text: item.nextPractice })
    ]);
  }));
}

function sessionsEditor(sessions) {
  const wrap = el("div", { class: "hidden-editor", id: "sessions-editor" });
  const render = (items) => {
    wrap.replaceChildren(...items.map((session, index) => sessionHiddenFields(session, index)));
  };
  render(sessions);
  return wrap;
}

function sessionHiddenFields(session, index) {
  return el("div", { "data-session": String(index) }, [
    el("input", { name: "session.id", value: session.id || "" }),
    el("input", { name: "session.date", value: session.date || "" }),
    el("textarea", { name: "session.focus", text: session.focus || "" }),
    el("textarea", { name: "session.goal", text: session.goal || "" }),
    el("textarea", { name: "session.notes", text: session.notes || "" }),
    el("textarea", { name: "session.actions", text: session.actions || "" }),
    el("textarea", { name: "session.reflection", text: session.reflection || "" })
  ]);
}

function addSession() {
  const sessions = getSessions();
  const nextIndex = sessions.length;
  setSessions([...sessions, { date: new Date().toISOString().slice(0, 10), focus: "Ny samtale", goal: "", notes: "", actions: "", reflection: "" }]);
  state.selectedSessionIndex = nextIndex;
  state.inlineEditKey = `session:${nextIndex}:focus`;
  markDirty();
  savePlan().then((saved) => {
    if (saved) reloadProgramAndRender("sessions");
  });
}

async function deleteSession(index) {
  if (!(await confirmDelete("Arkivere denne samtalen? Eksperimenter, refleksjoner og delte ressurser bevares i historikken.", {
    kicker: "Samtale",
    title: "Arkiver samtale?",
    confirmLabel: "Arkiver"
  }))) return false;
  const sessions = getSessions();
  const session = sessions[index];
  if (session?.id) {
    const archived = await archiveRecord("coaching_sessions", session.id, "samtalen");
    if (!archived) return false;
  }
  setSessions(sessions.filter((_, itemIndex) => itemIndex !== index));
  markDirty();
  const saved = await savePlan();
  if (!saved) return false;
  await reloadProgramAndRender("sessions");
  return true;
}

async function archiveRecord(tableName, id, label) {
  const { error } = await state.sb
    .from(tableName)
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (!error) return true;
  if (isMissingColumnError(error)) {
    await showAppMessage("Arkivering er ikke aktivert ennå", "Databaseoppdateringen må kjøres før dette kan arkiveres trygt.");
    return false;
  }
  await showAppMessage(`Kunne ikke arkivere ${label}`, userFacingError(error, "Prøv igjen."));
  return false;
}

function setSessions(values) {
  const editor = $("#sessions-editor");
  if (!editor) return;
  editor.replaceChildren(...values.map((session, index) => sessionHiddenFields(session, index)));
}

function reflectionsWorkspace(data) {
  const canWriteReflection = state.profile.role === "client";
  const intro = canWriteReflection
    ? workspaceIntro("Refleksjon", "Refleksjoner underveis", "Ta vare på observasjoner og læring. Du bestemmer hva du deler.")
    : workspaceIntro("Refleksjon", "Det klienten har valgt å dele", "Her vises bare refleksjoner klienten aktivt har delt i coachingforløpet.");
  const log = el("section", { class: "reflection-log-section" }, [
    el("div", { class: "reflection-log-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: canWriteReflection ? "Tidligere" : "Delt med coach" }),
        el("h3", { text: canWriteReflection ? "Dine refleksjoner" : "Delte refleksjoner" }),
        el("p", { class: "muted", text: canWriteReflection
          ? "Se tilbake på det du har lagt merke til."
          : "Refleksjoner klienten ønsker å utforske sammen." })
      ]),
      el("span", { class: "reflection-count", text: String(data.reflections.length) })
    ]),
    reflectionsList(data.reflections, data, canWriteReflection)
  ]);
  return el("div", { class: "platform-page reflection-space" }, [
    intro,
    el("div", { class: `reflection-workspace-stack ${canWriteReflection ? "" : "is-readonly"}` }, [
      canWriteReflection ? (state.reflectionComposerOpen ? reflectionComposer(data) : reflectionComposerLauncher()) : null,
      log
    ].filter(Boolean))
  ].filter(Boolean));
}

function reflectionComposerLauncher() {
  return el("section", { class: "reflection-launcher" }, [
    el("span", { class: "reflection-launcher-icon", "aria-hidden": "true" }, [icon("notebook-pen")]),
    el("div", {}, [
      el("h3", { text: "Hva vil du ta vare på?" }),
      el("p", { class: "muted", text: "Skriv noen få setninger mens observasjonen er fersk." })
    ]),
    el("button", {
      class: "ui-button ui-button-filled",
      type: "button",
      text: "Skriv refleksjon",
      onclick: () => {
        state.reflectionComposerOpen = true;
        renderCachedProgram("reflections");
        requestAnimationFrame(() => $("#reflection-body")?.focus());
      }
    })
  ]);
}

function coachResourcesWorkspace(data) {
  const canWriteReflection = state.profile.role === "client";
  const intro = canWriteReflection
    ? workspaceIntro("Ressurser", "Dine ressurser", "Her finner du ressursene coachen har valgt ut for deg.")
    : workspaceIntro("Ressurser", "Det som er delt i forløpet", "Se hva klienten har fått, hvorfor det ble sendt og hvordan ressursene blir brukt.");
  return el("div", { class: "platform-page client-resource-space resource-workspace-v2" }, [
    intro,
    resourcesFromCoachSection(data, canWriteReflection)
  ].filter(Boolean));
}

function resourcesFromCoachSection(data, canWriteReflection) {
  const library = getResourceLibrary();
  if (!library?.createClientResourceList) return null;

  const sharedResources = data.sharedResources || [];
  if (state.selectedSharedResourceProgramId !== data.program?.id) {
    state.selectedSharedResourceProgramId = data.program?.id || null;
    state.selectedSharedResourceId = null;
    state.sharedResourceQuery = "";
  }
  const section = el("section", { class: "client-resources-section" });
  const renderSection = () => {
    const query = String(state.sharedResourceQuery || "").trim().toLocaleLowerCase("nb-NO");
    const visibleResources = sharedResources.filter((item) => !query || [
      item.resource?.title,
      item.resource?.summary,
      item.resource?.type,
      item.coach_note,
      ...(item.resource?.tags || [])
    ].filter(Boolean).join(" ").toLocaleLowerCase("nb-NO").includes(query));
    const compactLayout = window.matchMedia?.("(max-width: 700px)")?.matches;
    let selected = visibleResources.find((item) => item.id === state.selectedSharedResourceId) || null;
    let autoSelected = false;
    if (!selected && !compactLayout && visibleResources.length) {
      selected = visibleResources[0];
      state.selectedSharedResourceId = selected.id;
      autoSelected = true;
    }
    section.className = `client-resources-section ${selected ? "has-selection" : ""}`.trim();
    const list = library.createClientResourceList(visibleResources, {
      createElement: el,
      createIcon: icon,
      selectedId: selected?.id || null,
      assignedLabel: canWriteReflection ? "Ny" : "Ikke åpnet",
      onOpen: (sharedResource) => openSharedResource(sharedResource, canWriteReflection, renderSection),
      emptyTitle: query ? "Ingen ressurser funnet" : "Ingen ressurser ennå",
      emptyText: canWriteReflection
        ? (query ? "Prøv et annet søk." : "Når coachen sender en ressurs, vises den her.")
        : (query ? "Prøv et annet søk." : "Ingen ressurser er sendt i dette forløpet ennå.")
    });
    const detail = selected ? el("div", { class: "client-resource-detail-stack" }, [
      el("button", { class: "client-resource-back", type: "button", onclick: () => {
        state.selectedSharedResourceId = null;
        renderSection();
      }}, [icon("arrow-left"), el("span", { text: "Tilbake til ressurser" })]),
      library.createClientResourceView(selected, {
        createElement: el,
        createIcon: icon,
        readOnly: !canWriteReflection,
        onOpenFile: openResourceFile,
        onSave: (resource, values) => saveSharedResourceReflection(resource, values, renderSection)
      })
    ]) : el("section", { class: "client-resource-detail-empty" }, [
      el("span", { class: "client-resource-detail-empty-icon" }, [icon("book-open")]),
      el("div", {}, [
        el("h3", { text: visibleResources.length ? "Velg en ressurs" : query ? "Ingen ressurser funnet" : "Ingen ressurser ennå" }),
        el("p", { class: "muted", text: visibleResources.length
          ? "Se innholdet, coachens kommentar og eventuelle spørsmål."
          : canWriteReflection ? "Når coachen deler noe med deg, samles det her." : "Ingen ressurser er sendt i dette forløpet." })
      ])
    ]);
    const search = sharedResources.length > 5 ? el("input", {
      class: "client-resource-search",
      type: "search",
      value: state.sharedResourceQuery,
      placeholder: "Søk i ressurser",
      "aria-label": "Søk i ressurser",
      oninput: (event) => {
        const cursor = event.currentTarget.selectionStart;
        state.sharedResourceQuery = event.currentTarget.value;
        renderSection();
        requestAnimationFrame(() => {
          const nextSearch = $(".client-resource-search", section);
          nextSearch?.focus();
          if (Number.isInteger(cursor)) nextSearch?.setSelectionRange(cursor, cursor);
        });
      }
    }) : null;
    section.replaceChildren(
      el("div", { class: "client-resources-head" }, [
        el("div", { class: "client-resources-summary" }, [
          el("strong", { text: canWriteReflection ? "Delt med deg" : "Delt med klient" }),
          el("span", { class: "muted", text: `${visibleResources.length}${query ? ` av ${sharedResources.length}` : ""} ${visibleResources.length === 1 && !query ? "ressurs" : "ressurser"}` })
        ]),
        search
      ].filter(Boolean)),
      el("div", { class: `client-resource-workbench ${selected ? "has-selection" : ""}` }, [
        el("aside", { class: "client-resource-rail" }, [list]),
        el("div", { class: "client-resource-detail" }, [detail])
      ])
    );
    hydrateResourceMedia(section);
    refreshIcons();
    if (autoSelected && canWriteReflection && selected?.status === "assigned") {
      setTimeout(() => openSharedResource(selected, canWriteReflection, renderSection), 0);
    }
  };

  renderSection();
  return section;
}

async function openSharedResource(sharedResource, canWriteReflection, renderSection = null) {
  state.selectedSharedResourceId = sharedResource.id;
  renderSection?.();

  if (canWriteReflection && sharedResource.status === "assigned") {
    const library = await ensureResourceLibrary();
    try {
      await library.updateSharedResourceStatus(state.sb, sharedResource.id, {
        status: "viewed",
        viewed_at: new Date().toISOString()
      });
      sharedResource.status = "viewed";
      sharedResource.viewed_at = new Date().toISOString();
      renderCachedProgram("resources");
    } catch (error) {
      await showAppMessage("Kunne ikke oppdatere status", userFacingError(error, "Ressursen kan fortsatt åpnes."));
    }
  }
}

async function saveSharedResourceReflection(sharedResource, values, renderSection = null) {
  const library = await ensureResourceLibrary();
  if (!library?.saveClientResourceReflection) {
    await showAppMessage("Kunne ikke lagre", "Last siden på nytt og prøv igjen.");
    throw new Error("Kunne ikke lagre refleksjonen.");
  }

  try {
    const saved = await library.saveClientResourceReflection(state.sb, sharedResource.id, {
      clientNote: values.clientNote,
      clientVisibility: values.clientVisibility || "private",
      status: "responded"
    });
    sharedResource.client_note = saved?.client_note ?? values.clientNote ?? "";
    sharedResource.client_visibility = saved?.client_visibility ?? values.clientVisibility ?? "private";
    sharedResource.status = saved?.status || "responded";
    sharedResource.responded_at = saved?.responded_at || new Date().toISOString();
    renderSection?.();
  } catch (error) {
    await showAppMessage("Kunne ikke lagre refleksjonen", userFacingError(error, "Prøv igjen."));
    throw error;
  }
}

function reflectionComposer(data) {
  const visibilityValue = el("input", { id: "reflection-visibility", type: "hidden", value: "private" });
  const setReflectionVisibility = (value, buttons) => {
    visibilityValue.value = value;
    buttons.forEach((button) => button.classList.toggle("active", button.dataset.value === value));
  };
  const visibilityButtons = [];
  const activeCompetencies = (data.programCompetencies || []).filter((item) => item.status === "active");
  const visibilityButton = (value, label) => {
    const button = el("button", {
      class: `visibility-choice ${value === "private" ? "active" : ""}`,
      type: "button",
      "data-value": value,
      onclick: () => setReflectionVisibility(value, visibilityButtons)
    }, [el("span", { text: label })]);
    visibilityButtons.push(button);
    return button;
  };

  return el("section", { class: "reflection-composer" }, [
    el("div", { class: "reflection-composer-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Ny refleksjon" }),
        el("h3", { text: "Hva vil du ta vare på?" }),
        el("p", { class: "muted", text: "Noter det mens det er ferskt." })
      ]),
      el("button", {
        class: "icon-button reflection-composer-close",
        type: "button",
        title: "Lukk",
        onclick: () => {
          state.reflectionComposerOpen = false;
          renderCachedProgram("reflections");
        }
      }, [icon("x")])
    ]),
    el("div", { class: "reflection-prompts", "aria-label": "Forslag til refleksjon" }, [
      el("span", { text: "Hva skjedde?" }),
      el("span", { text: "Hva overrasket deg?" }),
      el("span", { text: "Hva vil du prøve videre?" })
    ]),
    el("textarea", { class: "ui-edit-control", id: "reflection-body", placeholder: "Skriv det du vil huske …" }),
    visibilityValue,
    el("div", { class: "reflection-settings" }, [
      el("div", { class: "visibility-control" }, [
        el("p", { text: "Hvem kan lese?" }),
        el("div", { class: "visibility-choice-row" }, [
          visibilityButton("private", "Privat"),
          visibilityButton("shared_with_coach", "Del med coach")
        ])
      ]),
      el("details", { class: "reflection-link-settings" }, [
        el("summary", {}, [
          el("span", {}, [
            el("strong", { text: "Knytt refleksjonen til arbeidet" }),
            el("small", { text: "Valgfritt" })
          ]),
          icon("chevron-down")
        ]),
        el("div", { class: "reflection-link-grid" }, [
          el("label", { text: "Fokusoppdrag" }, [
            el("select", { id: "reflection-area" }, [
              el("option", { value: "", text: "Ikke knyttet" }),
              ...data.areas.map((area) => el("option", { value: area.id, text: area.title || "Fokusoppdrag" }))
            ])
          ]),
          el("label", { text: "Lederkompetanse" }, [
            el("select", { id: "reflection-competency" }, [
              el("option", { value: "", text: "Ikke knyttet" }),
              ...activeCompetencies.map((item) => el("option", { value: item.id, text: `${item.roleLabel || "Lederkompetanse"}: ${item.title || "Lederkompetanse"}` }))
            ])
          ])
        ])
      ])
    ]),
    el("div", { class: "toolbar reflection-toolbar" }, [
      el("span", { class: "muted", id: "reflection-status", text: "Bare du kan lese før du velger å dele." }),
      el("button", { class: "ui-button ui-button-filled", type: "button", text: "Lagre refleksjon", onclick: () => createReflection(data.program.id) })
    ])
  ]);
}

function reflectionCoachNote() {
  return el("section", { class: "panel document-panel reflection-note" }, [
    workspaceIntro("Delt med coach", "Refleksjoner som er delt", "Her vises kun refleksjoner som aktivt er delt i coachingforløpet.")
  ]);
}

function reflectionsList(reflections, data, canWriteReflection = false) {
  if (!reflections.length) {
    return canWriteReflection
      ? emptyState("Ingen refleksjoner ennå", "Skriv når noe blir tydelig eller du vil huske det senere.")
      : emptyState("Ingen delte refleksjoner ennå", "Del refleksjoner når det er noe du ønsker å utforske videre sammen.");
  }
  return el("div", { class: "reflection-list" }, reflections.map((reflection) => {
    const editable = reflection.created_by === state.user?.id;
    const area = (data.areas || []).find((item) => item.id === reflection.development_area_id);
    const competency = (data.programCompetencies || []).find((item) => item.id === reflection.program_competency_id);
    if (editable && state.inlineEditKey === `reflection:${reflection.id}`) return reflectionInlineCard(reflection, data);
    return el("article", { class: "reflection-card editable-row" }, [
      el("button", {
        class: "row-open",
        type: "button",
        onclick: editable ? () => startReflectionEdit(reflection.id) : undefined,
        disabled: editable ? undefined : true
      }, [
        el("span", { class: "reflection-date-mark", "aria-hidden": "true" }, [icon("notebook-pen")]),
        el("span", { class: "row-main" }, [
          el("span", { class: "reflection-card-meta" }, [
            el("span", { class: `ui-meta ${reflection.visibility === "private" ? "private" : ""}`, text: reflection.visibility === "private" ? "Privat" : "Delt med coach" }),
            competency ? el("span", { class: "ui-meta", text: competency.title || "Lederkompetanse" }) : null,
            area ? el("span", { class: "ui-meta", text: area.title || "Fokus" }) : null,
            el("small", { class: "content-card-meta", text: formatDate(reflection.created_at) })
          ].filter(Boolean)),
          contentPreview(reflection.body, "Tom refleksjon.", 4)
        ])
      ]),
      editable ? el("span", { class: "row-tools" }, [
        iconAction("Rediger refleksjon", "pencil", () => startReflectionEdit(reflection.id))
      ]) : null
    ].filter(Boolean));
  }));
}

function startReflectionEdit(id) {
  state.inlineEditKey = `reflection:${id}`;
  renderCachedProgram("reflections");
}

function reflectionInlineCard(reflection, data) {
  const body = el("textarea", { class: "ui-edit-control inline-textarea", text: reflection.body || "", placeholder: "Skriv en kort refleksjon …" });
  let visibility = reflection.visibility === "shared_with_coach" ? "shared_with_coach" : "private";
  const visibilityButtons = [];
  const setVisibility = (value) => {
    visibility = value;
    visibilityButtons.forEach((button) => button.classList.toggle("active", button.dataset.value === visibility));
  };
  const visibilityButton = (value, label) => {
    const button = el("button", {
      class: `visibility-choice ${visibility === value ? "active" : ""}`,
      type: "button",
      "data-value": value,
      onclick: () => setVisibility(value)
    }, [el("span", { text: label })]);
    visibilityButtons.push(button);
    return button;
  };
  const area = el("select", {}, [
    el("option", { value: "", text: "Ikke knyttet", selected: !reflection.development_area_id }),
    ...data.areas.map((item) => el("option", { value: item.id, text: item.title || "Fokusoppdrag", selected: reflection.development_area_id === item.id }))
  ]);
  const activeCompetencies = (data.programCompetencies || []).filter((item) => item.status === "active" || item.id === reflection.program_competency_id);
  const competency = el("select", {}, [
    el("option", { value: "", text: "Ikke knyttet", selected: !reflection.program_competency_id }),
    ...activeCompetencies.map((item) => el("option", { value: item.id, text: item.title || "Lederkompetanse", selected: reflection.program_competency_id === item.id }))
  ]);
  return el("article", { class: "ui-inline-editor content-card reflection-card reflection-card-edit" }, [
    el("div", { class: "field-pair" }, [
      el("div", { class: "visibility-control" }, [
        el("p", { text: "Privat: Bare du kan lese. Del med coach: Coachen kan lese teksten i forløpet." }),
        el("div", { class: "visibility-choice-row" }, [
          visibilityButton("private", "Privat"),
          visibilityButton("shared_with_coach", "Del med coach")
        ])
      ]),
      el("div", { class: "reflection-link-grid" }, [
        el("label", { text: "Fokusoppdrag" }, [area]),
        el("label", { text: "Lederkompetanse" }, [competency])
      ])
    ]),
    body,
    el("div", { class: "ui-inline-editor-actions inline-edit-actions" }, [
      el("button", { class: "ui-button ui-button-tonal", type: "button", text: "Avbryt", onclick: async () => {
        state.inlineEditKey = null;
        renderCachedProgram("reflections");
      }}),
      el("button", { class: "ui-button ui-button-filled", type: "button", text: "Lagre", onclick: async () => {
        const { error } = await state.sb.from("client_reflections").update({
          body: body.value || "",
          visibility,
          development_area_id: area.value || null,
          program_competency_id: competency.value || null
        }).eq("id", reflection.id);
        if (error) {
          await showAppMessage("Kunne ikke lagre refleksjonen", userFacingError(error, "Prøv igjen."));
          return;
        }
        state.inlineEditKey = null;
        await reloadProgramAndRender("reflections");
      }})
    ])
  ]);
}

function createAction(data, presetAreaId = "", presetCompetencyId = "", presetAction = "", options = {}) {
  const specs = experimentEditorSpecs(data, {
    action: presetAction,
    areaId: presetAreaId,
    competencyId: presetCompetencyId
  });
  openEntityDrawer(options.title || "Nytt eksperiment", options.kicker || "Prøv i arbeidet", specs, async (values) => {
    if (!(values.title || "").trim()) throw new Error("Gi eksperimentet et navn.");
    if (!(values.action || "").trim()) throw new Error("Beskriv hva du skal prøve.");
    const title = values.title.trim().slice(0, 80);
    const { error } = await state.sb.from("session_actions").insert({
      program_id: data.program.id,
      session_id: options.sessionId || null,
      development_area_id: values.areaId || null,
      program_competency_id: values.competencyId || null,
      title,
      description: actionDescription(values),
      due_date: values.dueDate || null,
      status: normalizeExperimentStatus(values.status || "planned")
    });
    if (error) throw error;
    if (presetCompetencyId) state.selectedCompetencyId = presetCompetencyId;
    await reloadProgramAndRender(options.returnPane || "work");
  }, { panelClass: "experiment-editor-drawer", saveLabel: "Opprett eksperiment" });
}

function experimentContextSpec(data, presetAreaId = "", presetCompetencyId = "") {
  const area = el("select", { name: "areaId" }, [
    el("option", { value: "", text: "Ikke knyttet til fokusoppdrag", selected: !presetAreaId }),
    ...data.areas.map((item) => el("option", { value: item.id, text: item.title || "Fokusoppdrag", selected: item.id === presetAreaId }))
  ]);
  const activeCompetencies = (data.programCompetencies || []).filter((item) => item.status === "active" || item.id === presetCompetencyId);
  const competency = el("select", { name: "competencyId" }, [
    el("option", { value: "", text: "Ikke knyttet til lederkompetanse", selected: !presetCompetencyId }),
    ...activeCompetencies.map((item) => el("option", {
      value: item.id,
      text: `${item.roleLabel || "Lederkompetanse"}: ${item.title || "Lederkompetanse"}`,
      selected: item.id === presetCompetencyId
    }))
  ]);
  const selectedArea = data.areas.find((item) => item.id === presetAreaId);
  const selectedCompetency = activeCompetencies.find((item) => item.id === presetCompetencyId);
  const connection = [selectedArea?.title, selectedCompetency?.title].filter(Boolean).join(" · ");
  return customSpec(["areaId", "competencyId"], el("details", { class: "experiment-context-details" }, [
    el("summary", {}, [
      el("span", {}, [
        el("strong", { text: connection ? "Knyttet til utviklingsarbeidet" : "Knytt til utviklingsarbeidet" }),
        el("small", { text: connection || "Valgfritt" })
      ]),
      icon("chevron-down")
    ]),
    el("div", { class: "experiment-context-fields" }, [
      el("label", { text: "Fokusoppdrag" }, [area]),
      el("label", { text: "Lederkompetanse" }, [competency])
    ])
  ]));
}

function experimentEditorSpecs(data, values = {}, action = null) {
  const parsed = values.parsed || {};
  const statusValue = normalizeExperimentStatus(values.status || action?.status || "planned");
  const coreFields = el("div", { class: "experiment-core-fields" }, [
    renderSpec(inputSpec("title", "Navn på eksperimentet", "text", values.title || "", {
      placeholder: "Et kort navn du kjenner igjen",
      required: true,
      maxlength: 80,
      autocomplete: "off"
    })),
    el("div", { class: "experiment-practice-field" }, [
      renderSpec(textareaSpec("action", "Hva vil du prøve?", values.action || parsed.action || "", {
        placeholder: "Én konkret atferd eller handling...",
        required: true
      })),
      el("p", { class: "experiment-field-help", text: "Gjør forsøket lite nok til å prøve i en faktisk situasjon." })
    ]),
    el("div", { class: "field-pair experiment-field-pair experiment-field-triple" }, [
      renderSpec(inputSpec("arena", "Hvor skal du prøve det?", "text", values.arena || parsed.arena || "", {
        placeholder: "Et møte eller en samtale"
      })),
      renderSpec(inputSpec("dueDate", "Når vil du se tilbake?", "date", values.dueDate || "")),
      renderSpec(selectSpec("status", "Status", EXPERIMENT_STATUS_OPTIONS, statusValue, false))
    ]),
    renderSpec(textareaSpec("signals", "Hva skal du se etter?", values.signals || parsed.signals || "", {
      placeholder: "Et observerbart tegn på effekt eller respons..."
    }))
  ]);
  return [
    customSpec(["title", "action", "arena", "dueDate", "status", "signals"], coreFields),
    experimentContextSpec(data, values.areaId || "", values.competencyId || ""),
    action ? experimentReviewSpec(action, parsed) : null
  ].filter(Boolean);
}

function createActionFromSessionNextStep(sessionIndex, nextStepText) {
  const client = getCurrentClient();
  const data = client ? state.programCache[client.id] : null;
  const session = getSessions()[sessionIndex] || {};
  if (!data) return;
  const primaryCompetency = (data.programCompetencies || [])
    .filter((item) => item.status === "active")
    .sort((a, b) => Number(a.priority || 99) - Number(b.priority || 99))[0];
  createAction(data, "", primaryCompetency?.id || "", nextStepText, {
    title: "Gjør til eksperiment",
    kicker: "Fra samtalen",
    sessionId: session.id || null,
    returnPane: "sessions"
  });
}

function experimentReviewSpec(action, parsed) {
  const normalized = normalizeExperimentStatus(action.status);
  const hasReview = Boolean(parsed.observation || parsed.effect || parsed.learning || parsed.nextStep || isExperimentReviewed(normalized));
  const isHistory = isExperimentReviewed(normalized);
  const fields = [
    textareaSpec("observation", "Hva observerte du?", parsed.observation, { placeholder: "Hva skjedde, og hvordan responderte andre?" }),
    selectSpec("effect", "Hvilken effekt la du merke til?", [["", "Ikke vurdert"], ["low", "Lite"], ["some", "Noe"], ["clear", "Tydelig"]], parsed.effect || "", false),
    textareaSpec("learning", "Hva lærte du?", parsed.learning, { placeholder: "Hva forstår du bedre nå?" }),
    textareaSpec("nextStep", "Hva vil du justere neste gang?", parsed.nextStep, { placeholder: "Behold, endre eller prøv noe nytt..." })
  ];
  return customSpec(["observation", "effect", "learning", "nextStep"], el("details", { class: "experiment-review-details", open: hasReview }, [
    el("summary", {}, [
      el("span", {}, [
        el("strong", { text: "Se tilbake og juster" }),
        el("small", { text: hasReview ? "Observasjon, læring og neste justering" : "Åpne når du har prøvd" })
      ]),
      icon("chevron-down")
    ]),
    el("div", { class: "experiment-review-fields" }, [
      ...fields.map(renderSpec),
      !isHistory ? el("div", { class: "experiment-review-actions" }, [
        el("button", { class: "button ghost experiment-finish-button", type: "button", onclick: handleDrawerDanger }, [
          icon("circle-stop"),
          el("span", { text: "Avslutt eksperiment" })
        ])
      ]) : null
    ].filter(Boolean))
  ]));
}

function editAction(action, data) {
  const parsed = parseActionDescription(action.description || "");
  const specs = experimentEditorSpecs(data, {
    title: action.title || "",
    dueDate: action.due_date || "",
    status: action.status || "planned",
    areaId: action.development_area_id || "",
    competencyId: action.program_competency_id || "",
    parsed
  }, action);
  const persist = async (values, statusOverride = null) => {
    if (!(values.title || "").trim()) throw new Error("Gi eksperimentet et navn.");
    if (!(values.action || "").trim()) throw new Error("Beskriv hva du skal prøve.");
    const { error } = await state.sb.from("session_actions").update({
      development_area_id: values.areaId || null,
      program_competency_id: values.competencyId || null,
      title: values.title.trim().slice(0, 80),
      description: actionDescription({ ...values, hypothesis: parsed.hypothesis, _raw: parsed._raw }),
      due_date: values.dueDate || null,
      status: normalizeExperimentStatus(statusOverride || values.status || action.status)
    }).eq("id", action.id);
    if (error) throw error;
    await reloadProgramAndRender("work");
  };
  const isHistory = isExperimentReviewed(action.status);
  openEntityDrawer("Rediger eksperiment", "Eksperiment", specs, async (values) => {
    await persist(values);
  }, {
    panelClass: "experiment-editor-drawer",
    saveLabel: isHistory ? "Lagre endringer" : "Lagre og fortsett",
    ...(!isHistory ? {
      dangerLabel: "Avslutt eksperiment",
      dangerIcon: "circle-stop",
      dangerPlacement: "inline",
      onDanger: async (values) => {
        if (!(await confirmDelete("Eksperimentet blir liggende i historikken sammen med observasjonene og læringen din.", {
          kicker: "Eksperiment",
          title: "Avslutt eksperiment?",
          confirmLabel: "Avslutt"
        }))) return false;
        await persist(values, "closed");
        return true;
      }
    } : {})
  });
}

function actionDescription(values) {
  const payload = {
    ...(values._raw && typeof values._raw === "object" ? values._raw : {}),
    version: 3,
    hypothesis: values.hypothesis || "",
    action: values.action || "",
    arena: values.arena || "",
    signals: values.signals || "",
    observation: values.observation || "",
    effect: values.effect || "",
    learning: values.learning || "",
    nextStep: values.nextStep || ""
  };
  return Object.values(payload).some(Boolean) ? JSON.stringify(payload) : null;
}

function actionMeta(action, data) {
  const parsed = parseActionDescription(action.description || "");
  const area = data.areas.find((item) => item.id === action.development_area_id);
  const competency = (data.programCompetencies || []).find((item) => item.id === action.program_competency_id);
  const rows = [
    area && ["Fokusoppdrag", area.title || "Fokusoppdrag"],
    competency && ["Lederkompetanse", competency.title || "Lederkompetanse"],
    parsed.hypothesis && ["Hypotese", parsed.hypothesis],
    parsed.action && ["Handling", parsed.action],
    parsed.arena && ["Arena", parsed.arena],
    parsed.signals && ["Tegn", parsed.signals],
    parsed.observation && ["Underveis", parsed.observation],
    parsed.learning && ["Læring", parsed.learning],
    parsed.nextStep && ["Neste justering", parsed.nextStep]
  ].filter(Boolean);
  if (!rows.length) return contentPreview("", action.due_date ? `Se tilbake ${formatDate(action.due_date)}` : "Beskriv hva du vil prøve og se etter.", 3);
  return el("div", { class: "action-meta" }, rows.map(([label, value]) => el("div", {}, [
    el("span", { text: label }),
    contentPreview(value, "", 3)
  ])));
}

function effectLabel(value) {
  return { low: "Lite effekt", some: "Noe effekt", clear: "Tydelig effekt" }[value] || "";
}

function phaseLabel(status) {
  return experimentStatusLabel(status);
}

function experimentStateClass(action, parsed) {
  const status = normalizeExperimentStatus(action.status);
  if (status === "closed") return "is-reviewed";
  if (status === "continued") return "has-effect";
  if (status === "reviewed") return "is-reviewed";
  if (status === "active") return "is-testing";
  if (status === "planned") return "is-planned";
  if (parsed.effect === "clear" || parsed.effect === "some") return "has-effect";
  if (parsed.effect || parsed.learning || parsed.nextStep) return "is-reviewed";
  if (parsed.observation || parsed.action || parsed.signals) return "is-testing";
  return "is-planned";
}

async function deleteAction(id) {
  if (!(await confirmDelete("Eksperimentet blir liggende i historikken. Observasjoner og læring bevares.", {
    kicker: "Eksperiment",
    title: "Avslutt eksperiment?",
    confirmLabel: "Avslutt"
  }))) return false;
  const { error } = await state.sb.from("session_actions").update({ status: "closed" }).eq("id", id);
  if (error) {
    await showAppMessage("Kunne ikke avslutte eksperimentet", userFacingError(error, "Prøv igjen."));
    return false;
  }
  await reloadProgramAndRender("work");
  return true;
}

function parseActionDescription(description) {
  const values = { hypothesis: "", action: "", arena: "", signals: "", observation: "", effect: "", learning: "", nextStep: "", situation: "", response: "", observe: "", _raw: {} };
  if (!description) return values;
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed === "object") {
      return {
        ...values,
        _raw: parsed,
        hypothesis: parsed.hypothesis || "",
        action: parsed.action || "",
        arena: parsed.arena || "",
        signals: parsed.signals || "",
        observation: parsed.observation || "",
        effect: parsed.effect || "",
        learning: parsed.learning || "",
        nextStep: parsed.nextStep || ""
      };
    }
  } catch (_) {
    // Older experiments used labelled plain text.
  }
  const sections = [
    ["situation", "Situasjon:"],
    ["response", "Prøve:"],
    ["observe", "Observere:"]
  ];
  sections.forEach(([key, label]) => {
    const start = description.indexOf(label);
    if (start === -1) return;
    const afterLabel = start + label.length;
    const nextStarts = sections
      .map(([, otherLabel]) => description.indexOf(otherLabel, afterLabel))
      .filter((position) => position > -1);
    const end = nextStarts.length ? Math.min(...nextStarts) : description.length;
    values[key] = description.slice(afterLabel, end).trim();
  });
  values.hypothesis = values.situation;
  values.action = values.response;
  values.signals = values.observe;
  if (!values.situation && !values.response && !values.observe) {
    values.action = description.trim();
    values.response = description.trim();
  }
  return values;
}

async function createReflection(programId) {
  const body = $("#reflection-body")?.value.trim();
  const status = $("#reflection-status");
  if (!body) {
    if (status) status.textContent = "Skriv en refleksjon først";
    return;
  }
  if (status) status.textContent = "Lagrer...";
  const { error } = await state.sb.from("client_reflections").insert({
    program_id: programId,
    body,
    visibility: $("#reflection-visibility")?.value || "private",
    development_area_id: $("#reflection-area")?.value || null,
    program_competency_id: $("#reflection-competency")?.value || null
  });
  if (error) {
    if (status) status.textContent = "Kunne ikke lagre";
    return;
  }
  state.reflectionComposerOpen = false;
  await reloadProgramAndRender("reflections");
}

async function reloadProgramAndRender(activePane = null) {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  if (client) delete state.programCache[client.id];
  await renderPlan(activePane);
}

function experimentRow(action, data, editable) {
  const parsed = parseActionDescription(action.description || "");
  const area = data.areas.find((item) => item.id === action.development_area_id);
  const competency = (data.programCompetencies || []).find((item) => item.id === action.program_competency_id);
  const dueDateLabel = action.due_date
    ? `${isExperimentActive(action.status) && action.due_date < localIsoDate() ? "Du ville se tilbake" : "Se tilbake"} ${formatDate(action.due_date)}`
    : "";
  const meta = [
    competency?.title && `Lederkompetanse: ${competency.title}`,
    area?.title && `Fokusoppdrag: ${area.title}`,
    parsed.arena,
    dueDateLabel
  ].filter(Boolean).join(" · ");
  const learning = (parsed.learning || "").trim();
  const emphasizedLearning = isExperimentReviewed(action.status) && learning;
  const preview = parsed.observation || parsed.action || parsed.hypothesis || "Hva skal prøves i praksis?";
  const effect = effectLabel(parsed.effect);
  const stage = el("span", { class: "experiment-stage-row" }, [
    el("small", { class: "phase-chip", text: phaseLabel(action.status) }),
    effect ? el("small", { class: "effect-chip", text: effect }) : null
  ].filter(Boolean));
  const summary = emphasizedLearning
    ? [
        el("strong", { text: action.title || "Eksperiment uten tittel" }),
        meta ? el("small", { class: "content-card-meta", text: meta }) : null,
        el("p", { class: "experiment-learning-preview" }, [
          el("strong", { text: "Læring:" }),
          el("span", { text: learning })
        ]),
        stage
      ]
    : [
        stage,
        el("strong", { text: action.title || "Eksperiment uten tittel" }),
        meta ? el("small", { class: "content-card-meta", text: meta }) : null,
        contentPreview(preview, "Beskriv hva du skal prøve.", 2)
      ];
  return el("article", { class: `experiment-row ${experimentStateClass(action, parsed)}` }, [
    el("button", {
      class: "experiment-open",
      type: "button",
      onclick: editable ? () => editAction(action, data) : undefined,
      disabled: editable ? undefined : true
    }, [
      el("span", {}, summary),
      icon("chevron-right")
    ].filter(Boolean))
  ].filter(Boolean));
}

function setFormReadonly(form) {
  $$("input, textarea, select", form).forEach((control) => {
    if (control.closest(".reflection-composer")) return;
    control.disabled = true;
  });
  $$(".section-card button, .document-panel button", form).forEach((control) => {
    if (control.closest(".reflection-composer")) return;
    if (!control.classList.contains("section-toggle")) control.disabled = true;
  });
}

function markDirty() {
  state.dirty = true;
  setSaveState("dirty");
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => savePlan(), 1800);
}

function setSaveState(mode, text = "") {
  const status = $("#save-status");
  const values = {
    clean: "Lagret",
    dirty: "Endringer lagres...",
    saving: "Lagrer...",
    saved: "Lagret",
    error: "Lagring feilet"
  };
  const statusText = values[mode] || values.clean;
  if (status) status.textContent = mode === "saved" && text ? text : statusText;
}

async function savePlan() {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  if (!client || !$("#plan-form")) return false;
  if (!canOpenClient(client)) return;
  clearTimeout(state.saveTimer);
  const status = $("#save-status");
  setSaveState("saving");
  try {
    const current = state.programCache[client.id] || await loadClientProgram(client);
    if (!current) throw new Error("Klientforløpet kunne ikke åpnes. Last siden på nytt og prøv igjen.");
    const plan = collectPlan();
    await savePlanTransactionally(current.program.id, plan);
    delete state.programCache[client.id];
    await loadProgramSummaries();
    state.dirty = false;
    setSaveState("saved", `Lagret ${new Date().toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
    return true;
  } catch (error) {
    console.error("Kunne ikke lagre utviklingsplan", error);
    setSaveState("error");
    if (status) status.textContent = "Lagring feilet";
    await showAppMessage("Kunne ikke lagre", userFacingError(error, "Prøv igjen."));
    return false;
  }
}

function programValuesFromPlan(plan) {
  const values = {
    purpose: plan.c_purpose,
    success_criteria: plan.c_success,
    expectations_coach: plan.c_expect_coach,
    expectations_client: plan.c_expect_client,
    confidentiality: plan.c_confidentiality,
    practical_frame: plan.c_practical,
    start_date: plan.c_start || null,
    end_date: plan.c_end || null,
    session_count: plan.c_sessions ? Number(plan.c_sessions) : null,
    session_duration: plan.c_duration || null,
    status: "active"
  };
  if ("c_context" in plan) values.context = plan.c_context || null;
  return values;
}

function areaRowsForSave(programId, areas) {
  return areas
    .map((area, index) => ({ ...normalizeArea(area), index }))
    .map((area) => ({
      id: area.id || "",
      program_id: programId,
      title: area.title,
      description: area.movement || area.description || null,
      project_type: area.projectType || "inner",
      movement: area.movement || null,
      typical_situations: area.typicalSituations || null,
      progress_signs: area.progressSigns || null,
      next_practice: null,
      sort_order: area.index
    }))
    .filter((row) => row.title || row.description || row.movement || row.typical_situations || row.progress_signs);
}

function sessionRowsForSave(programId, sessions) {
  return sessions.map((session, index) => ({
    id: session.id || "",
    program_id: programId,
    session_number: index + 1,
    session_date: session.date || null,
    focus: session.focus || null,
    conversation_goal: session.goal || null,
    insights: session.notes || null,
    decisions: session.actions || null,
    client_notes: session.reflection || null
  })).filter((session) => session.session_date || session.focus || session.conversation_goal || session.insights || session.decisions || session.client_notes);
}

function evaluationPayloadForSave(programId, plan) {
  return {
    program_id: programId,
    achieved: plan.eval_achieved || null,
    reflection: plan.eval_reflection || null,
    next_steps: plan.eval_next || null
  };
}

async function savePlanTransactionally(programId, plan) {
  const programValues = programValuesFromPlan(plan);
  const areas = areaRowsForSave(programId, plan.areas);
  const sessions = sessionRowsForSave(programId, plan.sessions);
  const evaluation = evaluationPayloadForSave(programId, plan);
  const { error } = await state.sb.rpc("save_development_plan_safe", {
    p_program_id: programId,
    p_program: programValues,
    p_areas: areas,
    p_sessions: sessions,
    p_evaluation: evaluation
  });
  if (!error) return;
  if (!isMissingFunctionError(error)) throw error;
  await savePlanLegacy(programId, plan, programValues, areas, sessions, evaluation);
}

async function savePlanLegacy(programId, plan, programValues = programValuesFromPlan(plan), areas = areaRowsForSave(programId, plan.areas), sessions = sessionRowsForSave(programId, plan.sessions), evaluation = evaluationPayloadForSave(programId, plan)) {
  const { error: programError } = await state.sb.from("coaching_programs").update(programValues).eq("id", programId);
  if (programError) throw programError;
  await saveAreaRows(areas);
  await saveSessionRows(sessions);
  await saveEvaluationPayload(evaluation);
}

function collectPlan() {
  const form = $("#plan-form");
  const data = {};
  $$("input[name], textarea[name], select[name]", form).forEach((control) => {
    if (control.type === "checkbox") {
      data[control.name] = control.checked ? control.value : "";
    } else if (control.multiple) {
      data[control.name] = Array.from(control.selectedOptions).map((option) => option.value);
    } else if (!(control.name in data)) {
      data[control.name] = control.value || "";
    }
  });
  const plan = {};
  planFields.forEach(([key]) => plan[key] = data[key] || "");
  ["c_start", "c_end", "c_sessions", "c_duration", "eval_achieved", "eval_reflection", "eval_next"].forEach((key) => plan[key] = data[key] || "");
  plan.areas = getAreas();
  plan.sessions = getSessions();
  return plan;
}

function getAreas() {
  return $$("#areas-editor [data-area]").map((card) => ({
    id: $("[name='area.id']", card).value.trim(),
    title: $("[name='area.title']", card).value.trim(),
    projectType: $("[name='area.projectType']", card).value.trim() || "inner",
    description: $("[name='area.description']", card).value.trim(),
    movement: $("[name='area.movement']", card).value.trim(),
    typicalSituations: $("[name='area.typicalSituations']", card)?.value.trim() || "",
    progressSigns: $("[name='area.progressSigns']", card).value.trim(),
    nextPractice: $("[name='area.nextPractice']", card).value.trim()
  }));
}

function normalizeProjectType(value) {
  return ["inner", "outer", "both"].includes(value) ? value : "inner";
}

function projectTypeLabel(value) {
  return {
    inner: "Tidligere fokusområde",
    outer: "Arbeidsoppdrag",
    both: "Tidligere fokusområde"
  }[normalizeProjectType(value)];
}

function projectTypeClass(value) {
  return normalizeProjectType(value) === "outer" ? "outer" : "inner";
}

function normalizeArea(area) {
  if (!area) return { id: "", title: "", description: "", projectType: "inner", movement: "", typicalSituations: "", progressSigns: "", nextPractice: "" };
  if (typeof area === "string") return { id: "", title: area.trim(), description: "", projectType: "inner", movement: "", typicalSituations: "", progressSigns: "", nextPractice: "" };
  const movement = (area.movement || area.description || "").trim();
  return {
    id: area.id || "",
    title: (area.title || "").trim(),
    description: (area.description || movement).trim(),
    projectType: normalizeProjectType(area.projectType || area.project_type),
    movement,
    typicalSituations: (area.typicalSituations || area.typical_situations || "").trim(),
    progressSigns: (area.progressSigns || area.progress_signs || "").trim(),
    nextPractice: (area.nextPractice || area.next_practice || "").trim()
  };
}

function hasAreaContent(area) {
  const item = normalizeArea(area);
  return Boolean(item.title || item.description || item.movement || item.typicalSituations || item.progressSigns);
}

function getSessions() {
  return $$("#sessions-editor [data-session]").map((card) => ({
    id: $("[name='session.id']", card).value,
    date: $("[name='session.date']", card).value,
    focus: $("[name='session.focus']", card).value,
    goal: $("[name='session.goal']", card).value,
    notes: $("[name='session.notes']", card).value,
    actions: $("[name='session.actions']", card).value,
    reflection: $("[name='session.reflection']", card).value
  }));
}

async function saveAreas(programId, areas) {
  const rows = areaRowsForSave(programId, areas);
  await saveAreaRows(rows);
}

async function saveAreaRows(rows) {
  for (const row of rows) {
    if (row.id) await updateArea(row);
    else await insertArea(row);
  }
}

async function insertArea(row) {
  const { id, ...insertRow } = row;
  const { error } = await state.sb.from("development_areas").insert(insertRow);
  if (!error) return;
  if (!isMissingColumnError(error)) throw error;
  const { error: legacyError } = await state.sb.from("development_areas").insert(legacyAreaRow(row));
  if (legacyError) throw legacyError;
}

async function updateArea(row) {
  const { id, program_id, ...values } = row;
  const { error } = await state.sb.from("development_areas").update(values).eq("id", id).eq("program_id", program_id);
  if (!error) return;
  if (!isMissingColumnError(error)) throw error;
  const { program_id: _programId, ...legacyValues } = legacyAreaRow(row);
  const { error: legacyError } = await state.sb.from("development_areas").update(legacyValues).eq("id", id).eq("program_id", program_id);
  if (legacyError) throw legacyError;
}

function legacyAreaRow(row) {
  return {
    program_id: row.program_id,
    title: row.title,
    description: row.description,
    sort_order: row.sort_order
  };
}

async function saveSessions(programId, sessions) {
  const rows = sessionRowsForSave(programId, sessions);
  await saveSessionRows(rows);
}

async function saveSessionRows(rows) {
  for (const row of rows) {
    if (row.id) await updateSession(row);
    else await insertSession(row);
  }
}

async function insertSession(row) {
  const { id, ...insertRow } = row;
  const { error } = await state.sb.from("coaching_sessions").insert(insertRow);
  if (!error) return;
  if (!isMissingColumnError(error)) throw error;
  const { error: legacyError } = await state.sb.from("coaching_sessions").insert(legacySessionRow(insertRow));
  if (legacyError) throw legacyError;
}

async function updateSession(row) {
  const { id, program_id, ...values } = row;
  const { error } = await state.sb.from("coaching_sessions").update(values).eq("id", id).eq("program_id", program_id);
  if (!error) return;
  if (!isMissingColumnError(error)) throw error;
  const { program_id: _programId, ...legacyValues } = legacySessionRow(row);
  const { error: legacyError } = await state.sb.from("coaching_sessions").update(legacyValues).eq("id", id).eq("program_id", program_id);
  if (legacyError) throw legacyError;
}

function legacySessionRow(row) {
  const { id, conversation_goal, ...legacyRow } = row;
  return legacyRow;
}

async function saveEvaluation(programId, plan) {
  const payload = evaluationPayloadForSave(programId, plan);
  await saveEvaluationPayload(payload);
}

async function saveEvaluationPayload(payload) {
  const hasEvaluation = payload.achieved || payload.reflection || payload.next_steps;
  if (!hasEvaluation) return;
  const { error } = await state.sb.from("program_evaluations").upsert(payload, { onConflict: "program_id" });
  if (error) throw error;
}

function isMissingColumnError(error) {
  const text = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
  return text.includes("pgrst204") || text.includes("column") || text.includes("schema cache");
}

function isMissingFunctionError(error) {
  const text = `${error?.code || ""} ${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return text.includes("pgrst202") || text.includes("function") || text.includes("schema cache");
}

function openClientInvite() {
  const coachOptions = state.profile.role === "coach" && state.coach
    ? [[state.coach.id, state.coach.name || state.user?.email || "Din coachprofil"]]
    : state.coaches.map((coach) => [coach.id, coach.name]);
  const defaultCoachIds = state.profile.role === "coach" && state.coach
    ? [state.coach.id]
    : [];
  openEntityModal("Inviter klient", "Tilgang", [
    inputSpec("name", "Navn"),
    inputSpec("email", "E-post", "email"),
    inputSpec("role", "Stilling"),
    inputSpec("employer", "Arbeidsgiver"),
    selectSpec("coachIds", "Coach(er)", coachOptions, defaultCoachIds, true)
  ], inviteClient);
}

function openCoachInvite() {
  openEntityModal("Inviter coach", "Tilgang", [
    inputSpec("name", "Navn"),
    inputSpec("email", "E-post", "email")
  ], inviteCoach);
}

function openCoachEdit(coach) {
  openEntityModal("Rediger coach", "Team", [
    inputSpec("name", "Navn", "text", coach.name || ""),
    inputSpec("email", "E-post", "email", coach.email || "")
  ], async (values) => {
    await updatePersonEmailIfChanged("coach", coach, values.email);
    const { error } = await state.sb.from("coaches").update({ name: values.name }).eq("id", coach.id);
    if (error) throw error;
    if (coach.user_id) {
      const { error: profileError } = await state.sb.from("profiles").update({ name: values.name }).eq("id", coach.user_id);
      if (profileError) throw profileError;
    }
    await reloadAndRender();
  });
}

function openClientEdit(client) {
  const specs = [
    inputSpec("name", "Navn", "text", client.name || ""),
    inputSpec("email", "E-post", "email", client.email || ""),
    inputSpec("role", "Stilling", "text", client.role || ""),
    inputSpec("employer", "Arbeidsgiver", "text", client.employer || ""),
    selectSpec("coachIds", "Coach(er)", state.coaches.map((coach) => [coach.id, coach.name]), client.coach_ids || [], true)
  ];
  if (canResendClientInvite(client)) {
    specs.push(clientAccessSpec(client));
  }
  openEntityModal("Rediger klient", "Klient", [
    ...specs
  ], async (values) => {
    await updatePersonEmailIfChanged("client", client, values.email);
    const { error } = await state.sb.from("clients").update({ name: values.name, role: values.role, employer: values.employer, coach_ids: values.coachIds }).eq("id", client.id);
    if (error) throw error;
    await reloadAndRender();
  });
}

function clientAccessSpec(client) {
  return customSpec(null, el("div", { class: "modal-section access-section" }, [
    el("strong", { text: "Invitasjon" }),
    el("p", { text: "Klienten har ikke aktivert tilgangen ennå." }),
    el("button", {
      class: "button ghost",
      type: "button",
      onclick: () => resendClientInviteFromModal(client)
    }, [
      icon("mail-plus"),
      el("span", { text: "Send invitasjon på nytt" })
    ])
  ]));
}

function openEntityModal(title, kicker, specs, onSave, options = {}) {
  state.modal = { specs, onSave, ...options };
  const modalPanel = $("#entity-form");
  modalPanel.className = `modal-panel ${options.panelClass || ""}`.trim();
  $("#modal-title").textContent = title;
  $("#modal-kicker").textContent = kicker;
  $("#modal-message").textContent = "";
  $("#modal-fields").replaceChildren(...specs.map(renderSpec));
  const dangerSlot = $("#modal-danger-slot");
  if (dangerSlot) {
    if (options.onDanger) {
      dangerSlot.replaceChildren(el("button", { class: "button modal-danger-button", type: "button", onclick: handleModalDanger }, [
        icon(options.dangerIcon || "trash-2"),
        el("span", { text: options.dangerLabel || "Slett" })
      ]));
    } else {
      dangerSlot.replaceChildren();
    }
  }
  $("#entity-modal").showModal();
  refreshIcons();
  if (typeof options.afterOpen === "function") requestAnimationFrame(options.afterOpen);
}

function openEntityDrawer(title, kicker, specs, onSave, options = {}) {
  state.drawer = { specs, onSave, ...options };
  const drawerPanel = $("#drawer-form");
  drawerPanel.className = `drawer-panel ${options.panelClass || ""}`.trim();
  $("#drawer-title").textContent = title;
  $("#drawer-kicker").textContent = kicker;
  $("#drawer-message").textContent = "";
  $("#drawer-fields").replaceChildren(...specs.map(renderSpec));
  const saveLabel = $("#drawer-save span");
  if (saveLabel) saveLabel.textContent = options.saveLabel || "Lagre";
  const dangerSlot = $("#drawer-danger-slot");
  if (dangerSlot) {
    if (options.onDanger && options.dangerPlacement !== "inline") {
      dangerSlot.replaceChildren(el("button", { class: "button modal-danger-button", type: "button", onclick: handleDrawerDanger }, [
        icon(options.dangerIcon || "trash-2"),
        el("span", { text: options.dangerLabel || "Slett" })
      ]));
    } else {
      dangerSlot.replaceChildren();
    }
  }
  $("#entity-drawer").showModal();
  refreshIcons();
  if (typeof options.afterOpen === "function") requestAnimationFrame(options.afterOpen);
}

function inputSpec(name, label, type = "text", value = "", attrs = {}) {
  return { kind: "input", name, label, type, value, attrs };
}

function textareaSpec(name, label, value = "", attrs = {}) {
  return { kind: "textarea", name, label, value, attrs };
}

function selectSpec(name, label, options, value = [], multiple = false) {
  return { kind: "select", name, label, options, value, multiple };
}

function checkboxGroupSpec(name, label, options, value = []) {
  return { kind: "checkbox-group", name, label, options, value: Array.isArray(value) ? value : [value].filter(Boolean) };
}

function customSpec(name, node) {
  return Array.isArray(name)
    ? { kind: "custom", names: name, node }
    : { kind: "custom", name, node };
}

function choiceSpec(name, label, options, value = "") {
  return { kind: "choice", name, label, options, value };
}

function sectionSpec(title, text = "") {
  return { kind: "section", title, text };
}

function renderSpec(spec) {
  if (spec.kind === "custom") return spec.node;
  if (spec.kind === "section") {
    return el("div", { class: "modal-section" }, [
      el("strong", { text: spec.title }),
      spec.text ? el("p", { text: spec.text }) : null
    ].filter(Boolean));
  }
  if (spec.kind === "select") {
    const select = el("select", { name: spec.name, multiple: spec.multiple });
    spec.options.forEach(([value, label]) => {
      const selected = Array.isArray(spec.value) ? spec.value.includes(value) : spec.value === value;
      select.append(el("option", { value, text: label, selected }));
    });
    return el("label", { text: spec.label }, [select]);
  }
  if (spec.kind === "checkbox-group") {
    return el("fieldset", { class: "choice-field checkbox-group-field" }, [
      el("legend", { text: spec.label }),
      el("div", { class: "checkbox-pill-row" }, spec.options.map(([value, label]) => el("label", { class: "checkbox-pill" }, [
        el("input", { type: "checkbox", name: spec.name, value, checked: spec.value.includes(value) }),
        el("span", { text: label })
      ])))
    ]);
  }
  if (spec.kind === "choice") {
    return el("fieldset", { class: "choice-field" }, [
      el("legend", { text: spec.label }),
      el("div", { class: "choice-row" }, spec.options.map(([value, label]) => el("label", { class: "choice-pill" }, [
        el("input", { type: "radio", name: spec.name, value, checked: spec.value === value }),
        el("span", { text: label })
      ])))
    ]);
  }
  if (spec.kind === "textarea") {
    return el("label", { text: spec.label }, [el("textarea", { name: spec.name, text: spec.value, ...(spec.attrs || {}) })]);
  }
  return el("label", { text: spec.label }, [el("input", { name: spec.name, type: spec.type, value: spec.value, required: spec.name === "name" || spec.name === "email", ...(spec.attrs || {}) })]);
}

function collectSpecValues(specs, form) {
  const values = {};
  specs.forEach((spec) => {
    if (spec.kind === "section") return;
    if (spec.kind === "custom") {
      if (Array.isArray(spec.names)) {
        spec.names.forEach((name) => {
          const controls = $$(`[name='${name}']`, form);
          if (!controls.length) return;
          if (controls.some((control) => control.type === "checkbox")) {
            values[name] = controls.filter((control) => control.checked).map((control) => control.value);
          } else {
            values[name] = controls[0].value.trim();
          }
        });
        return;
      }
      const control = spec.name ? $(`[name='${spec.name}']`, form) : null;
      if (control) values[spec.name] = control.value.trim();
      return;
    }
    const control = $(`[name='${spec.name}']`, form);
    if (spec.kind === "checkbox-group") {
      values[spec.name] = $$(`[name='${spec.name}']:checked`, form).map((item) => item.value);
    } else if (spec.kind === "choice") {
      values[spec.name] = $(`[name='${spec.name}']:checked`, form)?.value || "";
    } else {
      values[spec.name] = spec.multiple ? Array.from(control.selectedOptions).map((option) => option.value) : control.value.trim();
    }
  });
  return values;
}

$("#entity-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") {
    $("#entity-modal").close();
    return;
  }
  const values = collectSpecValues(state.modal.specs, $("#entity-form"));
  try {
    $("#modal-message").textContent = "Lagrer...";
    await state.modal.onSave(values);
    $("#entity-modal").close();
  } catch (error) {
    $("#modal-message").textContent = userFacingError(error, "Kunne ikke lagre. Prøv igjen.");
  }
});

$("#drawer-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") {
    $("#entity-drawer").close();
    return;
  }
  const values = collectSpecValues(state.drawer.specs, $("#drawer-form"));
  try {
    $("#drawer-message").textContent = "Lagrer...";
    await state.drawer.onSave(values);
    $("#entity-drawer").close();
  } catch (error) {
    $("#drawer-message").textContent = userFacingError(error, "Kunne ikke lagre. Prøv igjen.");
  }
});

async function handleModalDanger() {
  if (!state.modal?.onDanger) return;
  try {
    $("#modal-message").textContent = "";
    const deleted = await state.modal.onDanger();
    if (deleted !== false) $("#entity-modal").close();
  } catch (error) {
    $("#modal-message").textContent = userFacingError(error, "Kunne ikke fullføre handlingen. Prøv igjen.");
  }
}

async function handleDrawerDanger() {
  if (!state.drawer?.onDanger) return;
  try {
    $("#drawer-message").textContent = "";
    const values = collectSpecValues(state.drawer.specs, $("#drawer-form"));
    const deleted = await state.drawer.onDanger(values);
    if (deleted !== false) $("#entity-drawer").close();
  } catch (error) {
    $("#drawer-message").textContent = userFacingError(error, "Kunne ikke fullføre handlingen. Prøv igjen.");
  }
}

$("#confirm-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const confirmed = event.submitter?.value === "confirm";
  $("#confirm-dialog").close();
  state.confirmResolve?.(confirmed);
  state.confirmResolve = null;
});

$("#confirm-dialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  $("#confirm-dialog").close();
  state.confirmResolve?.(false);
  state.confirmResolve = null;
});

$("#message-form").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#message-dialog").close();
  state.messageResolve?.(true);
  state.messageResolve = null;
});

$("#message-dialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  $("#message-dialog").close();
  state.messageResolve?.(false);
  state.messageResolve = null;
});

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

async function callInviteUser(values) {
  const email = normalizeEmail(values.email);
  if (!values.name?.trim()) throw new Error("Navn må fylles ut.");
  if (!email) throw new Error("E-post må fylles ut.");
  if (values.role === "coach" && state.profile?.role !== "admin") throw new Error("Bare admin kan invitere coacher.");
  if (values.role === "client" && !canInviteClient()) throw new Error("Du har ikke tilgang til å invitere klienter.");
  const { data: { session } } = await state.sb.auth.getSession();
  if (!session?.access_token) throw new Error("Du må være innlogget for å invitere.");
  const res = await fetch(`${SUPABASE_URL}/functions/v1/invite-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ ...values, email })
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok || result.error) throw new Error(result.error || "Invitasjonen feilet.");
  return { ...result, email };
}

async function callUpdateUserEmail(values) {
  const email = normalizeEmail(values.email);
  if (!email) throw new Error("E-post må fylles ut.");
  if (!["coach", "client"].includes(values.entityType)) throw new Error("Ugyldig rolletype.");
  if (!values.entityId) throw new Error("Mangler person.");
  if (state.profile?.role !== "admin") throw new Error("Bare admin kan endre e-postadresser.");
  const { data: { session } } = await state.sb.auth.getSession();
  if (!session?.access_token) throw new Error("Du må være innlogget som admin.");
  const res = await fetch(`${SUPABASE_URL}/functions/v1/update-user-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({
      entityType: values.entityType,
      entityId: values.entityId,
      email
    })
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok || result.error) throw new Error(result.error || "Kunne ikke endre e-postadresse.");
  return { ...result, email };
}

async function updatePersonEmailIfChanged(entityType, person, email) {
  const nextEmail = normalizeEmail(email);
  const currentEmail = normalizeEmail(person.email || "");
  if (!nextEmail) throw new Error("E-post må fylles ut.");
  if (nextEmail === currentEmail) return { email: nextEmail, changed: false };
  return callUpdateUserEmail({ entityType, entityId: person.id, email: nextEmail });
}

async function verifyInvitedClient(email) {
  const client = await findClientForInviteVerification(email);
  if (!client?.id) throw new Error("Invitasjonen ble sendt, men klientraden ble ikke opprettet.");
  if (!client.user_id) throw new Error("Invitasjonen ble sendt, men brukerkontoen ble ikke koblet til. Prøv igjen eller kontakt ansvarlig for portalen.");
  if (state.profile.role === "coach" && state.coach?.id && !(client.coach_ids || []).includes(state.coach.id)) {
    throw new Error("Klienten ble opprettet, men ble ikke koblet til din coachprofil.");
  }
  await verifyVisibleProfileRole(client.user_id, "client", "Klienten");
  return client;
}

async function findClientForInviteVerification(email) {
  if (state.profile?.role === "admin") {
    const { data, error } = await state.sb.rpc("get_admin_client_overview");
    if (error && !isMissingFunctionError(error)) throw error;
    if (!error) return (data || []).find((client) => normalizeEmail(client.email) === email) || null;
  }

  const { data: client, error } = await state.sb
    .from("clients")
    .select("id, user_id, email, coach_ids")
    .ilike("email", email)
    .maybeSingle();
  if (error) throw error;
  return client;
}

async function ensureInvitedClientProgram(clientId) {
  if (state.profile?.role === "admin") {
    const { data, error } = await state.sb.rpc("ensure_admin_client_program", { p_client_id: clientId });
    if (error && !isMissingFunctionError(error)) throw error;
    if (!error && data) return { id: data };
  }

  const { data: existingProgram, error } = await state.sb
    .from("coaching_programs")
    .select("id")
    .eq("client_id", clientId)
    .maybeSingle();
  if (error) throw error;
  if (existingProgram?.id) return existingProgram;

  const { data: createdProgram, error: insertError } = await state.sb
    .from("coaching_programs")
    .insert({ client_id: clientId, status: "draft" })
    .select("id")
    .single();
  if (insertError) throw insertError;
  if (!createdProgram?.id) throw new Error("Klienten ble opprettet, men coachingforløpet kunne ikke bekreftes.");
  return createdProgram;
}

async function verifyInvitedCoach(email) {
  const { data: coach, error } = await state.sb
    .from("coaches")
    .select("id, user_id, email")
    .ilike("email", email)
    .maybeSingle();
  if (error) throw error;
  if (!coach?.id) throw new Error("Invitasjonen ble sendt, men coachraden ble ikke opprettet.");
  if (!coach.user_id) throw new Error("Invitasjonen ble sendt, men brukerkontoen ble ikke koblet til. Prøv igjen eller kontakt ansvarlig for portalen.");
  await verifyVisibleProfileRole(coach.user_id, "coach", "Coachen");
}

async function verifyVisibleProfileRole(userId, expectedRole, label) {
  const { data: profile, error: profileError } = await state.sb
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw profileError;
  if (profile?.role && profile.role !== expectedRole) {
    throw new Error(`${label} ble opprettet, men profilrollen er ikke ${expectedRole}.`);
  }
}

async function inviteClient(values) {
  const coachIds = values.coachIds?.length ? values.coachIds : state.coach?.id ? [state.coach.id] : [];
  if (!coachIds.length) throw new Error("Velg minst én coach for klienten.");
  const result = await callInviteUser({
    email: values.email,
    name: values.name,
    role: "client",
    coachIds,
    jobRole: values.role,
    employer: values.employer
  });
  const client = await verifyInvitedClient(result.email);
  await ensureInvitedClientProgram(client.id);
  await reloadAndRender();
  setTimeout(() => {
    showAppMessage("Invitasjon sendt", "Klienten er opprettet med et utviklingsforløp. Invitasjonen kan sendes på nytt fra Rediger klient frem til tilgangen er aktivert.");
  }, 0);
}

async function resendClientInviteFromModal(client) {
  try {
    $("#modal-message").textContent = "Sender invitasjon...";
    await resendClientInvite(client);
    if ($("#entity-modal")?.open) $("#entity-modal").close();
    await reloadAndRender();
    setTimeout(() => {
      showAppMessage("Invitasjon sendt på nytt", "Klienten kan bruke den nye lenken for å aktivere tilgangen.");
    }, 0);
  } catch (error) {
    $("#modal-message").textContent = userFacingError(error, "Kunne ikke sende invitasjonen på nytt. Prøv igjen.");
  }
}

async function resendClientInvite(client) {
  if (!canResendClientInvite(client)) throw new Error("Invitasjon kan bare sendes på nytt før klienten har aktivert tilgangen.");
  const coachIds = client.coach_ids?.length ? client.coach_ids : state.coach?.id ? [state.coach.id] : [];
  if (!coachIds.length) throw new Error("Klienten mangler coach.");
  const result = await callInviteUser({
    email: client.email,
    name: client.name,
    role: "client",
    coachIds,
    jobRole: client.role || "",
    employer: client.employer || ""
  });
  const verifiedClient = await verifyInvitedClient(result.email);
  await ensureInvitedClientProgram(verifiedClient.id);
  return verifiedClient;
}

async function inviteCoach(values) {
  const result = await callInviteUser({
    email: values.email,
    name: values.name,
    role: "coach"
  });
  await verifyInvitedCoach(result.email);
  await reloadAndRender();
}

async function deleteCoach(coach) {
  if (!(await confirmDelete(`Arkivere coach "${coach.name}"? Klientenes planer beholdes, men coachen fjernes fra aktive admin- og coachlister.`, {
    kicker: "Coach",
    title: "Arkiver coach?",
    confirmLabel: "Arkiver"
  }))) return;
  const archived = await archiveRecord("coaches", coach.id, "coachen");
  if (!archived) return;
  await reloadAndRender();
}

async function deleteClient(client) {
  if (!(await confirmDelete(`Arkivere klient "${client.name}"? Utviklingsplan, refleksjoner og koblinger bevares, men klienten fjernes fra aktive lister.`, {
    kicker: "Klient",
    title: "Arkiver klient?",
    confirmLabel: "Arkiver"
  }))) return;
  const archived = await archiveRecord("clients", client.id, "klienten");
  if (!archived) return;
  await reloadAndRender();
}

async function reloadAndRender() {
  await loadReferenceData();
  navigate(state.view === "plan" ? "clients" : state.view);
}

async function logout() {
  await state.sb.auth.signOut();
  state.user = null;
  state.profile = null;
  state.clients = [];
  state.coaches = [];
  state.selectedClientId = null;
  state.passwordSessionUserId = null;
  state.dirty = false;
  setScreen("login");
}

function getVisibleClients() {
  if (state.profile.role === "admin") return state.clients;
  if (state.profile.role === "coach") {
    const coachId = state.coach?.id;
    return state.clients.filter((client) => (client.coach_ids || []).includes(coachId));
  }
  return state.client ? [state.client] : [];
}

function initialView() {
  return state.profile.role === "client" ? "clients" : "clients";
}

function openClientPlan(client) {
  if (!canOpenClient(client)) return;
  navigate("plan", client.id);
}

function canOpenClient(client) {
  if (!client || !state.profile) return false;
  if (state.profile.role === "client") return client.user_id === state.user?.id;
  const coachId = state.coach?.id;
  if (!coachId) return false;
  return (client.coach_ids || []).includes(coachId);
}

function canInviteClient() {
  if (!state.profile) return false;
  if (state.profile.role === "admin") return true;
  return Boolean(state.profile.role === "coach" && state.coach?.id);
}

function canEditProgram(client) {
  if (!client || !state.profile) return false;
  if (state.profile.role === "client") return client.user_id === state.user?.id && hasClientConsent(client);
  const coachId = state.coach?.id;
  return Boolean(coachId && (client.coach_ids || []).includes(coachId));
}

function getCurrentClient() {
  return state.clients.find((item) => item.id === state.selectedClientId) || state.client;
}

function isClientActivated(client) {
  return Boolean(client?.account_activated_at || client?.user_id || client?.consent_date);
}

function hasClientConsent(client) {
  return Boolean(client?.consent_given && client?.consent_date);
}

function canResendClientInvite(client) {
  return Boolean(client?.email && canInviteClient() && !client.account_activated_at && !client.consent_date);
}

function clientStatusLabel(client) {
  if (!isClientActivated(client)) return "Ikke aktivert";
  return hasClientConsent(client) ? "Aktivert · samtykke gitt" : "Aktivert · mangler samtykke";
}

function filterClients(clients, query, coachId = "all", status = "all") {
  const q = query.trim().toLowerCase();
  return clients.filter((client) => {
    const program = state.programSummaries[client.id];
    const matchesQuery = !q || [client.name, client.email, client.role, client.employer, coachNames(client)].filter(Boolean).join(" ").toLowerCase().includes(q);
    const matchesCoach = coachId === "all" || (client.coach_ids || []).includes(coachId);
    const matchesStatus =
      status === "all" ||
      (status === "active" && isClientActivated(client)) ||
      (status === "pending" && !isClientActivated(client)) ||
      (status === "sessions" && (program?.sessionCount || 0) > 0) ||
      (status === "missing-plan" && !hasProgramContent(program));
    return matchesQuery && matchesCoach && matchesStatus;
  });
}

function sortClients(clients, sortBy = "name") {
  const byName = (a, b) => (a.name || "").localeCompare(b.name || "", "nb", { sensitivity: "base" });
  const createdTime = (client) => client.created_at ? new Date(client.created_at).getTime() : 0;
  const nextSessionTime = (client) => {
    const date = state.programSummaries[client.id]?.nextSessionDate;
    return date ? new Date(date).getTime() : Number.POSITIVE_INFINITY;
  };
  const activityTime = (client) => {
    const date = state.programSummaries[client.id]?.lastActivityAt;
    return date ? new Date(date).getTime() : 0;
  };
  return [...clients].sort((a, b) => {
    if (sortBy === "created-desc") return createdTime(b) - createdTime(a) || byName(a, b);
    if (sortBy === "created-asc") return createdTime(a) - createdTime(b) || byName(a, b);
    if (sortBy === "next-session") return nextSessionTime(a) - nextSessionTime(b) || byName(a, b);
    if (sortBy === "recent-activity") return activityTime(b) - activityTime(a) || byName(a, b);
    return byName(a, b);
  });
}

function hasProgramContent(program) {
  return Boolean(
    program?.purpose ||
    program?.success_criteria ||
    program?.start_date ||
    (program?.areaCount || 0) > 0 ||
    (program?.sessionCount || 0) > 0
  );
}

function coachNames(client) {
  return (client.coach_ids || [])
    .map((id) => state.coaches.find((coach) => coach.id === id)?.name)
    .filter(Boolean)
    .join(", ");
}

function button(label, iconName, handler, variant = "primary") {
  return el("button", { class: `button ${variant}`, type: "button", onclick: handler }, [icon(iconName), el("span", { text: label })]);
}

function iconAction(label, iconName, handler, tone = "") {
  return el("button", {
    class: `icon-button action-icon ${tone ? `is-${tone}` : ""}`,
    type: "button",
    title: label,
    "aria-label": label,
    onclick: handler
  }, [icon(iconName)]);
}

function statusLabel(status) {
  return { draft: "Utkast", active: "Aktivt forløp", completed: "Fullført", archived: "Arkivert" }[status] || "Utkast";
}

function confirmDelete(message, options = {}) {
  const dialog = $("#confirm-dialog");
  if (!dialog) return Promise.resolve(false);
  $("#confirm-kicker").textContent = options.kicker || "Bekreft sletting";
  $("#confirm-title").textContent = options.title || "Er du sikker?";
  $("#confirm-message").textContent = message;
  const action = $("#confirm-action");
  action.querySelector("span").textContent = options.confirmLabel || "Slett";
  if (dialog.open) dialog.close();
  dialog.showModal();
  refreshIcons();
  return new Promise((resolve) => {
    state.confirmResolve = resolve;
  });
}

function showAppMessage(title, message, options = {}) {
  const dialog = $("#message-dialog");
  if (!dialog) return Promise.resolve(false);
  $("#message-kicker").textContent = options.kicker || "Status";
  $("#message-title").textContent = title;
  $("#message-text").textContent = message;
  if (dialog.open) dialog.close();
  dialog.showModal();
  return new Promise((resolve) => {
    state.messageResolve = resolve;
  });
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("no-NO", { day: "numeric", month: "short", year: "numeric" });
}

function daysSinceDate(iso) {
  if (!iso) return null;
  const source = new Date(iso);
  if (Number.isNaN(source.getTime())) return null;
  const today = new Date();
  source.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - source.getTime()) / 86400000);
}

function isRecentDate(iso, days = 14) {
  const elapsed = daysSinceDate(iso);
  return elapsed !== null && elapsed >= 0 && elapsed <= days;
}

function formatRelativeDate(iso) {
  const elapsed = daysSinceDate(iso);
  if (elapsed === null) return "";
  if (elapsed === 0) return "I dag";
  if (elapsed === 1) return "I går";
  if (elapsed > 1 && elapsed <= 14) return `For ${elapsed} dager siden`;
  return formatDate(iso);
}

function daysUntilDate(iso) {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function formatRelativeDays(days) {
  if (days === 0) return "i dag";
  if (days === 1) return "i morgen";
  if (days < 0) return "har passert";
  return `om ${days} dager`;
}

init();
