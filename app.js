const SUPABASE_URL = "https://upuffmfgsxlzybifxveg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YLVxFqksi1wCmh-jF14mLA_0AGV03Gq";
const CONSENT_VERSION = "coaching-portal-v1";

const EXPERIMENT_STATUS = {
  planned: "Planlagt",
  active: "Prøves ut",
  reviewed: "Avlest",
  continued: "Videreført",
  closed: "Avsluttet"
};

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
  ["focus", "Fokus"],
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
  ["approved_for_pilot", "Godkjent pilot"],
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
  worksheet: "Worksheet-felt",
  reflection_questions: "Refleksjonsspørsmål",
  illustration: "Illustrasjon",
  download: "Nedlasting"
};
const RESOURCE_DIFFICULTY_OPTIONS = [
  ["", "Ikke satt"],
  ["easy", "Enkel"],
  ["medium", "Middels"],
  ["advanced", "Avansert"]
];
const RESOURCE_CONTEXT_OPTIONS = [
  ["program", "Forløp"],
  ["focus_area", "Fokusområde"],
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
  resourceLibraryPromise: null,
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
    state.coach = data;
  }
  if (role === "client") {
    const { data } = await state.sb.from("clients").select("*").eq("user_id", state.user.id).maybeSingle();
    state.client = data;
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
  state.coaches = coaches || [];
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
      const { data: fallbackClients } = await state.sb
        .from("clients")
        .select("id, created_at, name, code, consent_given, consent_date, account_activated_at, consent_version, coach_ids, role, employer, user_id, email")
        .order("name");
      clients = fallbackClients || [];
    }
  }
  state.clients = clients || [];
  await loadProgramSummaries();
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
  const [{ data: sessions }, { data: areas }] = await Promise.all([
    state.sb.from("coaching_sessions").select("id, program_id, session_date").in("program_id", programIds),
    state.sb.from("development_areas").select("id, program_id").in("program_id", programIds)
  ]);
  (sessions || []).forEach((session) => {
    const summary = Object.values(state.programSummaries).find((item) => item.id === session.program_id);
    if (summary) {
      summary.sessionCount += 1;
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
    if (summary) summary.areaCount += 1;
  });
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

function setHeader(kicker, title, actions = []) {
  $("#view-kicker").textContent = kicker;
  $("#view-title").textContent = title;
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
  setHeader("Utviklingsplaner", "Klienter", canInviteClient() ? [createInviteAction()] : []);
  const content = $("#content");
  const visibleClients = getVisibleClients();
  const filterCoaches = state.profile.role === "admin" ? state.coaches : (state.coach ? [state.coach] : []);
  const companyCount = new Set(visibleClients
    .map((client) => (client.employer || "").trim().toLowerCase())
    .filter(Boolean)).size;
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
    { value: "next-session", label: "Neste samtale" },
    { value: "created-desc", label: "Opprettet nyest" },
    { value: "created-asc", label: "Opprettet eldst" }
  ], "name", "Sorter klienter", render);
  search.addEventListener("input", render);
  content.replaceChildren(
    el("div", { class: "grid three summary-grid page-summary" }, [
      metric("Klienter", String(visibleClients.length), "users", state.profile.role === "admin" ? "Klienter med utviklingsplaner" : "Dine klientforløp"),
      metric("Coacher", String(filterCoaches.length), "user-round-check", state.profile.role === "admin" ? "Coacher med tilgang til klientforløp" : "Coach knyttet til dine klienter"),
      metric("Selskaper", String(companyCount), "building-2", "Arbeidsgivere registrert på klienter")
    ]),
    el("div", { class: "panel list-panel" }, [
      el("div", { class: "toolbar" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "Arbeidsflate" }), el("h3", { text: "Klientoversikt" })]),
        ...(canInviteClient() ? [createInviteAction("ghost")] : [])
      ]),
      el("div", { class: "filter-row client-filter-row" }, [search, coachFilter, sortFilter]),
      results
    ])
  );
  render();
}

function clientGrid(clients) {
  if (!clients.length) return el("p", { class: "muted", text: "Ingen klienter å vise ennå." });
  return el("div", { class: "grid three" }, clients.map((client) => {
    const program = state.programSummaries[client.id];
    const canOpen = canOpenClient(client);
    const activated = isClientActivated(client);
    const hasConsent = hasClientConsent(client);
    return el("button", {
      class: `card client-card ${canOpen ? "" : "is-locked"}`,
      disabled: !canOpen,
      title: canOpen ? "Åpne utviklingsplan" : "Kun oversikt. Du er ikke coach for denne klienten.",
      onclick: () => openClientPlan(client)
    }, [
      el("p", { class: "eyebrow", text: "Klient" }),
      el("h3", { text: client.name || "Uten navn" }),
      el("p", { class: "muted", text: [client.employer, client.role].filter(Boolean).join(" · ") || "Arbeidsgiver ikke satt" }),
      el("p", { class: "card-subline", text: coachNames(client) ? `Coach: ${coachNames(client)}` : client.email || "" }),
      el("div", { class: "meta-row" }, [
        el("span", { class: `badge ${activated ? "ok" : "warn"}`, text: activated ? "Aktivert" : "Ikke aktivert" }),
        el("span", { class: `badge ${hasConsent ? "ok" : "warn"}`, text: hasConsent ? "Samtykke gitt" : "Mangler samtykke" }),
        el("span", { class: "badge", text: program?.sessionCount === 1 ? "1 samtale" : `${program?.sessionCount || 0} samtaler` })
      ])
    ]);
  }));
}

function renderAdmin() {
  setHeader("Administrasjon", "Team og tilgang", [
    button("Inviter coach", "user-round-plus", () => openCoachInvite()),
    button("Inviter klient", "user-plus", () => openClientInvite()),
    button("Ny ressurs", "plus", () => openResourceAdminEditor(), "ghost")
  ]);
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
      actionGroup([["Rediger", () => openCoachEdit(coach)], ["Slett", () => deleteCoach(coach)]])
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
        ["Slett", () => deleteClient(client)]
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
  $("#content").replaceChildren(
    el("section", { class: "panel list-panel" }, [
      el("div", { class: "toolbar" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "Team" }), el("h3", { text: "Coacher" })]),
        el("div", { class: "toolbar-actions" }, [
          button("Inviter coach", "mail-plus", () => openCoachInvite(), "ghost")
        ])
      ]),
      el("div", { class: "filter-row admin-filter-row" }, [coachSearch]),
      coachTableSlot
    ]),
    el("section", { class: "panel list-panel" }, [
      el("div", { class: "toolbar" }, [
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
  );
  renderCoaches();
  renderClientsTable();
  renderResourceAdminSection(resourceAdminSlot);
}

function adminTable(title, headers, rows) {
  return el("div", { class: "table-wrap", "aria-label": title }, [
    el("table", {}, [
      el("thead", {}, [el("tr", {}, headers.map((head) => el("th", { text: head })))]),
      el("tbody", {}, rows.length ? rows.map((row) => el("tr", {}, row.map((cell) => {
        const td = el("td");
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
  slot.replaceChildren(el("section", { class: "panel list-panel" }, [
    el("div", { class: "toolbar" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Fagbibliotek" }),
        el("h3", { text: "Ressurser" }),
        el("p", { class: "muted", text: "Pilot-admin for native ressurser. Filopplasting og blokkeditor kommer senere." })
      ]),
      button("Ny ressurs", "plus", () => openResourceAdminEditor(), "ghost")
    ]),
    el("p", { class: "muted", text: "Henter ressurser..." })
  ]));

  const library = await ensureResourceLibrary();
  if (!library?.getAdminResources) {
    slot.replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Ressurser" }),
      el("h3", { text: "Adminfunksjonen er ikke lastet" }),
      el("p", { class: "muted", text: "Last siden på nytt. Hvis feilen fortsetter mangler ressursmodulen admin-query." })
    ]));
    return;
  }

  let resources = [];
  try {
    resources = await library.getAdminResources(state.sb);
  } catch (error) {
    slot.replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Ressurser" }),
      el("h3", { text: "Kunne ikke hente ressurser" }),
      el("p", { class: "muted", text: error.message || "Sjekk RLS og resource-migrations." })
    ]));
    return;
  }

  const search = el("input", { class: "search", placeholder: "Søk ressurs, type eller tag" });
  const tableSlot = el("div");
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
    tableSlot.replaceChildren(adminTable("Ressurser", ["Tittel", "Type", "Fase", "Status", "Tags", ""], filtered.map((resource) => [
      resource.title || "-",
      resourceLabel(RESOURCE_TYPE_OPTIONS, resource.type),
      resourceLabel(RESOURCE_PHASE_OPTIONS, resource.phase),
      resourceLabel(RESOURCE_STATUS_OPTIONS, resource.status),
      (resource.tags || []).join(", ") || "-",
      actionGroup([
        ...(resource.status === "draft" ? [["Publiser", () => publishResource(resource)]] : []),
        ["Rediger", () => openResourceAdminEditor(resource)],
        [resource.status === "archived" ? "Reaktiver" : "Arkiver", () => toggleResourceArchive(resource)]
      ])
    ])));
  };

  search.addEventListener("input", renderTable);
  slot.replaceChildren(el("section", { class: "panel list-panel" }, [
    el("div", { class: "toolbar" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Fagbibliotek" }),
        el("h3", { text: "Ressurser" }),
        el("p", { class: "muted", text: "Administrer pilotressurser, innholdsblokker, bilder og filer. Publiserte ressurser vises i Ressurser." })
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
  if (type === "worksheet") return { type: "worksheet", fields: [""] };
  if (type === "reflection_questions") return { type: "reflection_questions", questions: [""] };
  if (type === "illustration") return { type: "illustration", file_id: "", storage_path: "", display_name: "", key: "" };
  if (type === "download") return { type: "download", label: "", file_url: "" };
  return { type: "text", heading: "", content: "" };
}

function normalizeResourceBlocks(blocks = []) {
  return (Array.isArray(blocks) ? blocks : []).map((block) => {
    if (!block || typeof block !== "object") return createResourceBlock("text");
    const type = block.type || "text";
    if (type === "intro") return { type, content: block.content || "" };
    if (type === "worksheet") return { type, fields: Array.isArray(block.fields) ? block.fields : [] };
    if (type === "reflection_questions") return { type, questions: Array.isArray(block.questions) ? block.questions : [] };
    if (type === "illustration") return {
      type,
      file_id: block.file_id || "",
      storage_path: block.storage_path || "",
      display_name: block.display_name || "",
      key: block.key || ""
    };
    if (type === "download") return { type, label: block.label || "", file_url: block.file_url || "" };
    return { type: "text", heading: block.heading || "", content: block.content || "" };
  });
}

function lineArray(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
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
  Object.entries(RESOURCE_BLOCK_TYPE_LABELS).forEach(([value, label]) => {
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

  const renderBlockControls = (block, index) => {
    if (block.type === "intro") {
      return [el("textarea", { rows: "3", text: block.content || "", placeholder: "Kort intro til ressursen", oninput: (event) => patchBlock(index, { content: event.target.value }) })];
    }
    if (block.type === "worksheet") {
      return [el("textarea", { rows: "4", text: (block.fields || []).join("\n"), placeholder: "Ett felt per linje", oninput: (event) => patchBlock(index, { fields: lineArray(event.target.value) }) })];
    }
    if (block.type === "reflection_questions") {
      return [el("textarea", { rows: "4", text: (block.questions || []).join("\n"), placeholder: "Ett spørsmål per linje", oninput: (event) => patchBlock(index, { questions: lineArray(event.target.value) }) })];
    }
    if (block.type === "illustration") {
      const illustrations = (getFiles() || []).filter((file) => file.file_type === "illustration");
      const selectedValue = block.file_id || block.storage_path || "";
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
        illustrations.length
          ? el("p", { class: "resource-admin-inline-help", text: "Velg en opplastet illustrasjon. Nye illustrasjoner legges til under Filer og bilder." })
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
      return [
        el("input", { type: "text", value: block.label || "", placeholder: "Lenketekst", oninput: (event) => patchBlock(index, { label: event.target.value }) }),
        el("input", { type: "text", value: block.file_url || "", placeholder: "Filsti eller URL", oninput: (event) => patchBlock(index, { file_url: event.target.value }) })
      ];
    }
    return [
      el("input", { type: "text", value: block.heading || "", placeholder: "Overskrift", oninput: (event) => patchBlock(index, { heading: event.target.value }) }),
      el("textarea", { rows: "4", text: block.content || "", placeholder: "Tekst", oninput: (event) => patchBlock(index, { content: event.target.value }) })
    ];
  };

  const render = () => {
    serialize();
    list.replaceChildren(...blocks.map((block, index) => el("article", { class: "resource-block-editor-card" }, [
      el("div", { class: "resource-block-editor-head" }, [
        el("strong", { text: RESOURCE_BLOCK_TYPE_LABELS[block.type] || "Blokk" }),
        el("div", { class: "resource-block-editor-actions" }, [
          el("button", { class: "button ghost", type: "button", disabled: index === 0, onclick: () => { [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]]; render(); } }, [icon("arrow-up")]),
          el("button", { class: "button ghost", type: "button", disabled: index === blocks.length - 1, onclick: () => { [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]]; render(); } }, [icon("arrow-down")]),
          el("button", { class: "button ghost", type: "button", onclick: () => { blocks.splice(index, 1); render(); } }, [icon("trash-2")])
        ])
      ]),
      el("div", { class: "resource-block-editor-fields" }, renderBlockControls(block, index))
    ])));
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
      el("button", { class: "button secondary", type: "button", onclick: () => { blocks.push(createResourceBlock(addSelect.value)); render(); } }, [
        icon("plus"),
        el("span", { text: "Legg til blokk" })
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
      previewSlot.replaceChildren(library.createResourcePreview(getResourceDraft(), { createElement: el, onOpenFile: openResourceFile }));
      hydrateResourceMedia(previewSlot);
      refreshIcons();
    } catch (error) {
      previewSlot.replaceChildren(el("p", { class: "muted", text: error.message || "Kunne ikke vise preview." }));
    }
  };
  const wrapper = el("section", { class: "resource-admin-preview" }, [
    el("div", { class: "resource-admin-preview-head" }, [
      el("div", {}, [
        el("strong", { text: "Forhåndsvisning" }),
        el("p", { text: "Viser omtrent hvordan ressursen leses i biblioteket." })
      ]),
      el("button", { class: "button secondary", type: "button", onclick: renderPreview }, [
        icon("refresh-cw"),
        el("span", { text: "Oppdater preview" })
      ])
    ]),
    previewSlot
  ]);
  setTimeout(renderPreview, 0);
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
    await showAppMessage("Kunne ikke åpne fil", error.message || "Prøv igjen.");
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
    fileList.replaceChildren(...files.map((file) => el("div", { class: "resource-admin-file-row" }, [
      el("div", {}, [
        el("strong", { text: file.display_name }),
        el("span", { text: resourceLabel(RESOURCE_FILE_TYPE_OPTIONS, file.file_type) || file.file_type })
      ]),
      el("button", { class: "button ghost", type: "button", onclick: async () => {
        if (!await confirmDelete(`Fjerne "${file.display_name}" fra ressursen?`)) return;
        await library.archiveResourceFile(state.sb, file.id);
        resource.files = files.filter((item) => item.id !== file.id);
        onFilesChange?.(resource.files);
        renderFiles();
      } }, [icon("trash-2"), el("span", { text: "Fjern" })])
    ])));
    if (!files.length) fileList.replaceChildren(el("p", { class: "muted", text: "Ingen filer lagt til ennå." }));
    refreshIcons();
  };
  renderFiles();

  return el("section", { class: "resource-admin-files" }, [
    el("div", { class: "resource-admin-helper-card" }, [
      el("strong", { text: "Filer og bilder" }),
      el("p", { text: "Filer lagres privat i Supabase Storage. Ressursen fungerer fortsatt uten filer." })
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
          message.textContent = error.message || "Kunne ikke laste opp fil.";
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

function validateResourceForPublish(payload) {
  const missing = [];
  if (!payload.title) missing.push("tittel");
  if (!payload.summary) missing.push("kort beskrivelse");
  if (!payload.intended_outcome) missing.push("hva ressursen skal hjelpe med");
  if (!payload.client_intro) missing.push("intro til klient");
  if (!payload.coach_guidance) missing.push("veiledning til coach");
  if (!Array.isArray(payload.content_json) || !payload.content_json.length) missing.push("minst én innholdsblokk");
  if (payload.visibility === "client_assignable" && !payload.suggested_coach_note) missing.push("foreslått instruks fra coach");
  if (payload.review_status === "draft") missing.push("faglig vurdering før publisering");
  if (missing.length) {
    throw new Error(`Mangler: ${missing.join(", ")}.`);
  }
}

function resourceReadinessItems(payload) {
  const items = [
    ["Tittel", Boolean(payload.title)],
    ["Kort beskrivelse", Boolean(payload.summary)],
    ["Hva ressursen skal hjelpe med", Boolean(payload.intended_outcome)],
    ["Intro til klient", Boolean(payload.client_intro)],
    ["Veiledning til coach", Boolean(payload.coach_guidance)],
    ["Innholdsblokk", Array.isArray(payload.content_json) && payload.content_json.length > 0],
    ["Foreslått instruks", payload.visibility !== "client_assignable" || Boolean(payload.suggested_coach_note)],
    ["Faglig vurdering", payload.review_status && payload.review_status !== "draft"]
  ];
  return items.map(([label, done]) => ({ label, done }));
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
      const missing = items.filter((item) => !item.done);
      summary.textContent = missing.length
        ? `Mangler: ${missing.map((item) => item.label).join(", ")}.`
        : "Klar til publisering.";
      list.replaceChildren(...items.map((item) => el("span", {
        class: `resource-readiness-item ${item.done ? "is-done" : "is-missing"}`,
        text: `${item.done ? "OK" : "Mangler"}: ${item.label}`
      })));
    } catch (error) {
      summary.textContent = error.message || "Fyll ut feltene for å se hva som mangler.";
      list.replaceChildren();
    }
  };
  setTimeout(() => {
    $("#drawer-form")?.addEventListener("input", refresh);
    $("#drawer-form")?.addEventListener("change", refresh);
    refresh();
  }, 0);
  return panel;
}

function parseResourceAdminPayload(values, currentResource = null) {
  const title = values.title.trim();
  const slug = (values.slug.trim() || resourceSlug(title));
  if (!title) throw new Error("Tittel må fylles ut.");
  if (!slug) throw new Error("Slug må fylles ut.");
  if (!values.summary.trim()) throw new Error("Summary må fylles ut.");

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
    reflection_prompts: textLines(values.reflection_prompts),
    next_step_prompt: values.next_step_prompt.trim() || null,
    basis: values.basis.trim() || null,
    reviewed_by: values.reviewed_by.trim() || null,
    last_reviewed_at: values.last_reviewed_at || null,
    tags: textLines(values.tags)
  };
  if (payload.status === "published") validateResourceForPublish(payload);
  return payload;
}

async function openResourceAdminEditor(resource = null) {
  if (state.profile?.role !== "admin") return;
  const library = await ensureResourceLibrary();
  if (!library?.createResource || !library?.updateResource) {
    await showAppMessage("Ressursadmin mangler", "Last siden på nytt. Hvis feilen fortsetter mangler mutation-modulen.");
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
      ...parseResourceAdminPayload(values, resource),
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

  specs = [
    sectionSpec("Grunninfo", "Start med det coach og klient faktisk ser først."),
    inputSpec("title", "Tittel", "text", resource?.title || ""),
    textareaSpec("summary", "Kort beskrivelse", resource?.summary || "", { rows: "3" }),
    inputSpec("slug", "Slug", "text", resource?.slug || "", { placeholder: "genereres fra tittel hvis tom" }),
    sectionSpec("Innhold og filer", "Bygg ressursen med lesbare blokker, refleksjon og relevante filer."),
    customSpec("content_json", blockEditor),
    textareaSpec("reflection_prompts", "Refleksjonsspørsmål", (resource?.reflection_prompts || []).join("\n"), { rows: "5" }),
    textareaSpec("next_step_prompt", "Neste steg", resource?.next_step_prompt || "", { rows: "2" }),
    customSpec("resource_files", createResourceFileManager(resource, library, { onFilesChange: refreshBlocks })),
    customSpec("resource_preview", createResourceAdminPreview(library, getDraftResource)),
    sectionSpec("Bruk i coaching", "Hjelper coachen å velge riktig ressurs og bruke den presist."),
    textareaSpec("intended_outcome", "Hva ressursen skal hjelpe med", resource?.intended_outcome || "", { rows: "3" }),
    textareaSpec("best_used_when", "Best brukt når", (resource?.best_used_when || []).join("\n"), { rows: "4" }),
    textareaSpec("not_for", "Ikke egnet når", (resource?.not_for || []).join("\n"), { rows: "4" }),
    textareaSpec("coach_guidance", "Veiledning til coach", resource?.coach_guidance || "", { rows: "4" }),
    textareaSpec("client_intro", "Intro til klient", resource?.client_intro || "", { rows: "4" }),
    textareaSpec("suggested_coach_note", "Foreslått instruks fra coach", resource?.suggested_coach_note || "", { rows: "3" }),
    customSpec("resource_readiness", createResourceReadinessPanel(getDraftResource)),
    sectionSpec("Publisering og metadata", "Velg hvordan ressursen skal finnes og brukes i coachingflyten."),
    selectSpec("type", "Type", RESOURCE_TYPE_OPTIONS, resource?.type || "framework"),
    selectSpec("format", "Format", RESOURCE_FORMAT_OPTIONS, resource?.format || "native"),
    selectSpec("phase", "Fase", RESOURCE_PHASE_OPTIONS, resource?.phase || "reflection"),
    inputSpec("estimated_duration", "Varighet i minutter", "number", resource?.estimated_duration || "", { min: "1" }),
    selectSpec("difficulty", "Vanskelighetsgrad", RESOURCE_DIFFICULTY_OPTIONS, resource?.difficulty || ""),
    checkboxGroupSpec("default_context_types", "Kan knyttes til", RESOURCE_CONTEXT_OPTIONS, resource?.default_context_types || ["program"]),
    selectSpec("status", "Status", RESOURCE_STATUS_OPTIONS, resource?.status || "draft"),
    selectSpec("visibility", "Synlighet", RESOURCE_VISIBILITY_OPTIONS, resource?.visibility || "client_assignable"),
    selectSpec("review_status", "Faglig vurdering", RESOURCE_REVIEW_STATUS_OPTIONS, resource?.review_status || "draft"),
    inputSpec("language", "Språk", "text", resource?.language || "no"),
    textareaSpec("basis", "Faglig grunnlag", resource?.basis || "", { rows: "3" }),
    inputSpec("reviewed_by", "Vurdert av", "text", resource?.reviewed_by || ""),
    inputSpec("last_reviewed_at", "Sist vurdert", "date", resource?.last_reviewed_at || ""),
    textareaSpec("tags", "Tags", (resource?.tags || []).join(", "), { rows: "2" }),
    ...(duplicateAction ? [customSpec("resource_actions", duplicateAction)] : [])
  ];
  openEntityDrawer(isNew ? "Ny ressurs" : resource.title, "Fagbibliotek", specs, async (values) => {
    const payload = parseResourceAdminPayload(values, resource);
    if (isNew) await library.createResource(state.sb, payload);
    else await library.updateResource(state.sb, resource.id, payload);
    await renderAdmin();
  }, resource?.id ? {
    dangerLabel: resource.status === "archived" ? "Reaktiver" : "Arkiver",
    onDanger: async () => {
      if (resource.status === "archived") await library.reactivateResource(state.sb, resource.id, "draft");
      else await library.archiveResource(state.sb, resource.id);
      await renderAdmin();
      return true;
    }
  } : {});
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
  validateResourceForPublish(payload);
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

  setHeader("Ressursbibliotek", "Ressurser", []);
  const content = $("#content");
  content.replaceChildren(el("section", { class: "panel empty-state" }, [
    el("p", { class: "eyebrow", text: "Ressurser" }),
    el("h3", { text: "Henter pilotressurser" }),
    el("p", { class: "muted", text: "Leser publiserte ressurser, tags og filmetadata." })
  ]));

  const library = await ensureResourceLibrary();
  if (!library) {
    content.replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Ressurser" }),
      el("h3", { text: "Ressursmodulen er ikke lastet" }),
      el("p", { class: "muted", text: "Kunne ikke laste ressursmodulen. Prøv å laste siden på nytt." })
    ]));
    return;
  }

  let resources = [];
  try {
    resources = await library.getPublishedResources(state.sb);
  } catch (error) {
    content.replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Ressurser" }),
      el("h3", { text: "Kunne ikke hente ressursene" }),
      el("p", { class: "muted", text: error.message || "Sjekk RLS, migrations og seeddata." })
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

  content.replaceChildren(el("section", { class: "resource-library" }, [
    el("div", { class: "resource-library-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Pilot" }),
        el("h3", { text: "Bibliotek for coach" }),
        el("p", { class: "muted", text: "Finn, vurder og send ressurser som støtte i coachingarbeidet." })
      ])
    ]),
    el("div", { class: "filter-row resource-filter-row" }, [search, phaseFilter, typeFilter]),
    el("div", { class: "resource-library-grid" }, [
      el("aside", { class: "resource-library-list-panel" }, [listSlot]),
      previewSlot
    ])
  ]));
  render();
}

function getResourceLibrary() {
  return window.RaederResourceLibrary || null;
}

async function ensureResourceLibrary() {
  const loaded = getResourceLibrary();
  if (loaded) return loaded;

  if (!state.resourceLibraryPromise) {
    state.resourceLibraryPromise = import("./js/resources/resources.api.js?v=polish-76")
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

function canShareResources() {
  return state.profile?.role === "coach" || state.profile?.role === "admin";
}

function openSendResourceDrawer(resource) {
  if (!resource || !canShareResources()) return;
  const clients = getVisibleClients().filter((client) => canShareResourceToClient(client));
  if (!clients.length) {
    showAppMessage("Ingen klienter å sende til", "Du har ingen klienter med åpne forløp som kan motta ressurser ennå.", { kicker: "Ressurser" });
    return;
  }

  openEntityDrawer(`Send ${resource.title}`, "Ressurs", [
    customSpec("send_resource_basis", createSendResourceBasis(resource)),
    sectionSpec("Send ressurs", "Velg klient, kontekst og en kort instruks. Ressursen legges i klientens coachingforløp."),
    selectSpec("clientId", "Klient", clients.map((client) => [client.id, client.name || client.email || "Uten navn"]), clients[0]?.id || ""),
    customSpec(["contextType", "contextId"], createResourceContextPicker(resource, clients)),
    textareaSpec("coachNote", "Instruks til klient", resource.suggested_coach_note || "", {
      placeholder: "Skriv kort hvorfor du sender ressursen, og hva klienten bør bruke den til."
    })
  ], async (values) => {
    await sendResourceToClient(resource, values);
  });
}

function createSendResourceBasis(resource) {
  const list = (title, items = []) => items.length ? el("div", { class: "send-resource-basis-list" }, [
    el("strong", { text: title }),
    el("ul", {}, items.map((item) => el("li", { text: item })))
  ]) : null;

  return el("section", { class: "resource-admin-helper-card send-resource-basis" }, [
    el("strong", { text: "Vurder før sending" }),
    resource.intended_outcome ? el("p", { text: resource.intended_outcome }) : null,
    list("Best brukt når", resource.best_used_when || []),
    list("Ikke egnet når", resource.not_for || []),
    resource.suggested_coach_note ? el("div", { class: "send-resource-suggested-note" }, [
      el("strong", { text: "Foreslått instruks" }),
      el("p", { text: resource.suggested_coach_note })
    ]) : null
  ].filter(Boolean));
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
        options.push(option("focus_area", area.id, `Fokusområde: ${area.title || "Uten tittel"}`, !area.id));
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
    message.textContent = "Henter kontekst fra klientens forløp...";
    try {
      const data = await loadClientProgram(client);
      renderOptions(buildOptions(data));
      message.textContent = picker.options.length > 1
        ? "Velg en konkret plassering hvis det gjør ressursen lettere å forstå for klienten."
        : "Denne ressursen sendes på forløpsnivå.";
    } catch (error) {
      renderOptions([option("program", "", "Hele forløpet")]);
      message.textContent = error.message || "Kunne ikke hente kontekst. Ressursen kan fortsatt sendes på forløpsnivå.";
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
  if (state.profile.role === "admin") return true;
  const coachId = state.coach?.id;
  return Boolean(coachId && (client.coach_ids || []).includes(coachId));
}

async function sendResourceToClient(resource, values) {
  const library = await ensureResourceLibrary();
  if (!library?.shareResourceWithClient) throw new Error("Ressursmodulen mangler sendefunksjon.");

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

async function renderPlan(activePane = "direction") {
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
    button("Book coachingtime", "calendar-plus", () => window.open("https://raederog.no/book-time", "_blank"), "ghost")
  ].filter(Boolean);
  setHeader("Utviklingsplan", client.name || "Klient", headerActions);
  $("#content").replaceChildren(el("section", { class: "panel empty-state" }, [
    el("p", { class: "eyebrow", text: "Laster" }),
    el("h3", { text: "Henter klientforløp" }),
    el("p", { class: "muted", text: "Kobler til Supabase-tabellene for program, områder, sesjoner og evaluering." })
  ]));

  const data = await loadClientProgram(client);
  if (!data) {
    $("#content").replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Program" }),
      el("h3", { text: "Fant ikke klientforløp" }),
      el("p", { class: "muted", text: "Sjekk at klienten har en rad i coaching_programs." })
    ]));
    return;
  }
  const plan = programToFormState(data);

  const form = el("form", { class: "client-workspace", id: "plan-form" }, [
    hiddenPlanState(plan),
    clientWorkspaceTabs(data, activePane),
    el("section", { class: `workspace-pane ${activePane === "direction" ? "active" : ""}`, "data-pane": "direction" }, [
      directionWorkspace(client, plan, data)
    ]),
    el("section", { class: `workspace-pane ${activePane === "work" ? "active" : ""}`, "data-pane": "work" }, [
      workWorkspace(client, data, plan)
    ]),
    el("section", { class: `workspace-pane ${activePane === "sessions" ? "active" : ""}`, "data-pane": "sessions" }, [
      sessionsWorkspace(plan.sessions, data)
    ]),
    el("section", { class: `workspace-pane ${activePane === "reflections" ? "active" : ""}`, "data-pane": "reflections" }, [
      reflectionsWorkspace(data)
    ])
  ]);

  const editable = canEditProgram(client);
  if (editable) form.addEventListener("input", (event) => {
    if (event.target.closest(".ui-inline-editor")) return;
    markDirty();
  });
  $("#content").replaceChildren(el("div", { class: "plan-layout" }, [form]), ...(editable ? [saveStrip(true)] : []));
  if (!editable) setFormReadonly(form);
  setupWorkspaceTabs();
  refreshIcons();
}

function renderCachedProgram(activePane = "direction") {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  const data = client ? state.programCache[client.id] : null;
  if (!client || !data) {
    reloadProgramAndRender(activePane);
    return;
  }
  const plan = programToFormState(data);
  const form = el("form", { class: "client-workspace", id: "plan-form" }, [
    hiddenPlanState(plan),
    clientWorkspaceTabs(data, activePane),
    el("section", { class: `workspace-pane ${activePane === "direction" ? "active" : ""}`, "data-pane": "direction" }, [
      directionWorkspace(client, plan, data)
    ]),
    el("section", { class: `workspace-pane ${activePane === "work" ? "active" : ""}`, "data-pane": "work" }, [
      workWorkspace(client, data, plan)
    ]),
    el("section", { class: `workspace-pane ${activePane === "sessions" ? "active" : ""}`, "data-pane": "sessions" }, [
      sessionsWorkspace(plan.sessions, data)
    ]),
    el("section", { class: `workspace-pane ${activePane === "reflections" ? "active" : ""}`, "data-pane": "reflections" }, [
      reflectionsWorkspace(data)
    ])
  ]);
  const editable = canEditProgram(client);
  if (editable) form.addEventListener("input", (event) => {
    if (event.target.closest(".ui-inline-editor")) return;
    markDirty();
  });
  $("#content").replaceChildren(el("div", { class: "plan-layout" }, [form]), ...(editable ? [saveStrip(true)] : []));
  if (!editable) setFormReadonly(form);
  setupWorkspaceTabs();
  refreshIcons();
}

function renderConsentGate(client) {
  state.selectedClientId = client.id;
  setHeader("Velkommen", "Før vi starter", []);
  const accepted = el("input", { type: "checkbox", id: "consent-accepted" });
  const message = el("p", { class: "form-message", role: "status" });
  const startButton = button("Jeg samtykker og vil starte", "check", async () => {
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
    await renderPlan("direction");
  }, "primary");

  $("#content").replaceChildren(el("section", { class: "consent-panel" }, [
    el("div", { class: "consent-copy" }, [
      el("p", { class: "eyebrow", text: "Samtykke" }),
      el("h3", { text: "Din utviklingsplan er privat arbeidsmateriale" }),
      el("p", { class: "muted", text: "Før portalen åpnes bekrefter du hvordan innholdet brukes. Dette gjør rammene tydelige før du skriver noe personlig." })
    ]),
    el("div", { class: "consent-grid" }, [
      consentPoint("lock-keyhole", "Konfidensielt", "Plan, samtaler, fokusområder og refleksjoner brukes til å støtte ditt coachingforløp."),
      consentPoint("users", "Delt med coach", "Tildelt coach kan lese og jobbe med innholdet i planen. Private refleksjoner deles bare når du velger det."),
      consentPoint("database", "Lagret trygt", "Data lagres i Supabase. Du kan be coachen om innsyn, retting eller sletting.")
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
  const sharedResourcesPromise = library?.getSharedResourcesForProgram
    ? library.getSharedResourcesForProgram(state.sb, program.id, { viewerRole: state.profile?.role }).catch(() => [])
    : Promise.resolve([]);
  const [{ data: areas }, { data: sessions }, { data: actions }, { data: reflections }, { data: evaluations }, sharedResources] = await Promise.all([
    state.sb.from("development_areas").select("*").eq("program_id", program.id).order("sort_order"),
    state.sb.from("coaching_sessions").select("*").eq("program_id", program.id).order("session_date", { ascending: false }),
    state.sb.from("session_actions").select("*").eq("program_id", program.id).order("created_at", { ascending: false }),
    state.sb.from("client_reflections").select("*").eq("program_id", program.id).order("created_at", { ascending: false }),
    state.sb.from("program_evaluations").select("*").eq("program_id", program.id).limit(1),
    sharedResourcesPromise
  ]);
  const payload = {
    program,
    areas: areas || [],
    sessions: sessions || [],
    actions: actions || [],
    reflections: reflections || [],
    evaluation: evaluations?.[0] || null,
    sharedResources: sharedResources || []
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

function clientWorkspaceTabs(_data, activePane = "direction") {
  const items = [
    ["direction", "Retning"],
    ["work", "Fokusområder"],
    ["sessions", "Samtaler"],
    ["reflections", "Refleksjon"]
  ];
  return el("div", { class: "workspace-tabs" }, items.map(([pane, label]) => el("button", {
    class: `workspace-tab ${pane === activePane ? "active" : ""}`,
    type: "button",
    "data-tab": pane
  }, [el("span", { text: label })])));
}

function setupWorkspaceTabs() {
  $$(".workspace-tab").forEach((tab) => {
    tab.addEventListener("click", async () => {
      if (state.inlineEditKey) {
        await showAppMessage("Lagre eller avbryt først", "Du har et åpent felt. Lagre eller avbryt før du går videre.");
        return;
      }
      $$(".workspace-tab").forEach((item) => item.classList.toggle("active", item === tab));
      $$(".workspace-pane").forEach((pane) => pane.classList.toggle("active", pane.dataset.pane === tab.dataset.tab));
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
  const firstName = (client.name || "du").split(" ")[0];
  const status = directionStatus(plan);
  return el("section", { class: "ui-workspace direction-simple" }, [
    pageIntro(status.label, `Hei, ${firstName}. La oss avklare retningen.`, "Fyll ut det viktigste for coachingforløpet: hva du vil jobbe med, hvordan du merker fremgang, og hva du trenger fra coachen din.", [], status.tone),
    el("div", { class: "ui-card-grid direction-card-grid" }, [
      ...directionSpecs.map((spec, index) => directionCard(spec, editable, client, index))
    ]),
    coachingFrame()
  ].filter(Boolean));
}

function directionCard(spec, editable, client, index = 0) {
  const value = directionSpecPreview(spec);
  const isFrame = Boolean(spec.fields);
  return el("article", {
    class: `ui-field-card direction-field-card direction-field ${value ? "has-value" : "is-empty"} ${isFrame ? "wide" : ""}`,
    "data-direction-key": spec.key,
    style: `--direction-accent:${directionAccent(index)}`
  }, [
    directionFieldContent(spec, value, editable)
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
      subhead: "Retning for forløpet",
      valueLabel: "Hva ønsker du at coachingforløpet skal hjelpe deg med?",
      value: plan.c_purpose,
      helper: "Hva ønsker du at coachingforløpet skal hjelpe deg med?",
      placeholder: "Hva ønsker du at coachingforløpet skal hjelpe deg med?"
    },
    {
      key: "c_success",
      iconName: "activity",
      label: "Hvordan vil du merke fremgang?",
      subhead: "Konkret effekt",
      valueLabel: "Hva vil du, coachen din eller andre merke hvis dette begynner å virke?",
      value: plan.c_success,
      helper: "Hva vil du, coachen din eller andre merke hvis dette begynner å virke?",
      placeholder: "Hva vil du, coachen din eller andre merke hvis dette begynner å virke?"
    },
    {
      key: "c_expect_client",
      iconName: "user-check",
      label: "Hva krever dette av deg?",
      subhead: "Dine egne forpliktelser til prosessen",
      valueLabel: "Hva vil du prøve, observere eller forberede mellom samtalene?",
      value: plan.c_expect_client,
      helper: "Hva vil du prøve, observere eller forberede mellom samtalene?",
      placeholder: "Hva vil du prøve, observere eller forberede mellom samtalene?"
    },
    {
      key: "c_expect_coach",
      iconName: "messages-square",
      label: "Hva trenger du fra coachen?",
      subhead: "Coachens bidrag",
      valueLabel: "Hva trenger du at coachen bidrar med, utfordrer deg på eller følger opp?",
      value: plan.c_expect_coach,
      helper: "Hva trenger du at coachen bidrar med, utfordrer deg på eller følger opp?",
      placeholder: "Hva trenger du at coachen bidrar med, utfordrer deg på eller følger opp?"
    },
    {
      key: "frame",
      iconName: "shield-check",
      label: "Rammer for samarbeidet",
      subhead: "Praktiske og trygge rammer",
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
      subhead: "Kontekst rundt deg",
      valueLabel: "Hvilke personer, roller, team eller forventninger påvirker det du jobber med?",
      value: plan.c_context,
      helper: "Hvilke personer, roller, team eller forventninger påvirker det du jobber med?",
      placeholder: "Hvilke personer, roller, team eller forventninger påvirker det du jobber med?"
    }
  ];
}

function directionStatus(plan) {
  if (!plan.c_purpose || !plan.c_success) {
    return {
      tone: "missing",
      label: "Ikke utfylt ennå",
      text: "Start med mål og tegn på bevegelse før dere velger fokusområder.",
      action: "Sett retning"
    };
  }
  if (!plan.c_expect_client || !plan.c_expect_coach) {
    return {
      tone: "partial",
      label: "Delvis utfylt",
      text: "Gjør forventningene tydelige, så klient og coach vet hva de skal holde fast i.",
      action: "Avklar forventninger"
    };
  }
  return {
    tone: "ready",
    label: "Lagret",
    text: "Kontrakten er tydelig nok til å velge fokusområder og starte praksisarbeidet.",
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

function directionAccent() {
  return "var(--direction-orb-bg)";
}

function directionFieldContent(spec, value, editable) {
  return el("div", { class: "ui-field-card-inner direction-card-inner" }, [
    el("div", { class: "ui-field-card-head direction-card-head" }, [
      el("span", { class: "ui-field-orb direction-card-orb", "aria-hidden": "true" }, [
        icon(spec.iconName || "circle")
      ]),
      el("div", { class: "ui-field-title direction-card-title" }, [
        el("h3", { text: spec.label }),
        el("p", { text: spec.subhead || "Subhead" })
      ])
    ]),
    el("div", { class: "ui-field-body direction-card-body" }, [
      el("span", { class: "ui-field-kicker direction-card-kicker", text: spec.valueLabel || "Din formulering" }),
      value ? directionValueContent(spec) : el("p", { class: "ui-empty-text direction-empty", text: "Ikke fylt ut ennå" })
    ]),
    editable ? el("button", {
      class: "ui-field-action direction-edit-trigger",
      type: "button",
      text: value ? "Rediger" : "Fyll ut",
      onclick: () => activateDirectionEdit(spec)
    }) : null
  ].filter(Boolean));
}

function directionInlineField(spec, editable, client) {
  const value = directionSpecPreview(spec);
  return el("article", { class: `direction-field ${value ? "has-value" : "is-empty"}`, "data-direction-key": spec.key }, [
    el("div", { class: "direction-field-main" }, [
      el("div", { class: "direction-field-label" }, [
        el("h4", { text: spec.label }),
        el("p", { text: spec.helper })
      ]),
      el("div", { class: "direction-field-value" }, [
        value ? directionValueContent(spec) : el("p", { class: "direction-empty", text: spec.placeholder || spec.helper })
      ])
    ]),
    editable ? el("button", {
      class: "direction-edit-trigger",
      type: "button",
      title: `Rediger ${spec.label}`,
      text: value ? "Rediger" : "Fyll ut",
      onclick: () => activateDirectionEdit(spec)
    }) : null
  ].filter(Boolean));
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
  return el("div", { class: "coaching-frame" }, items.map(([iconName, title, text]) => el("article", {}, [
    icon(iconName),
    el("div", {}, [
      el("strong", { text: title }),
      el("p", { text })
    ])
  ])));
}

async function activateDirectionEdit(spec) {
  const fields = spec.fields || [spec];
  openEntityModal(spec.label, "Retning", fields.map((field) => (
    textareaSpec(field.key, spec.fields ? field.label : spec.valueLabel || field.label || spec.label, field.value || "", {
      rows: spec.fields ? "5" : "7",
      placeholder: field.placeholder || spec.placeholder || spec.helper
    })
  )), async (values) => {
    fields.forEach((field) => setPlanValue(field.key, values[field.key] || ""));
    markDirty();
    const saved = await savePlan();
    if (!saved) throw new Error("Kunne ikke lagre retningen.");
    await reloadProgramAndRender("direction");
  }, {
    panelClass: "direction-modal-panel",
    afterOpen: () => {
      const firstField = $("#modal-fields textarea");
      firstField?.focus();
      firstField?.setSelectionRange(firstField.value.length, firstField.value.length);
    }
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
  return el("div", { class: "work-stack" }, [
    el("section", { class: "panel document-panel" }, [
      focusIntro(editable),
      focusWorkbench(focusItems, data, editable),
      areasEditor(plan.areas)
    ])
  ]);
}

function pageIntro(kicker, title, text, actions = [], tone = "") {
  return el("header", { class: "ui-page-intro workspace-intro" }, [
    el("div", {}, [
      el("span", { class: `ui-status-pill ${tone}`, text: kicker }),
      el("h3", { text: title }),
      el("p", { class: "muted", text })
    ]),
    actions.length ? el("div", { class: "ui-page-actions workspace-intro-actions" }, actions) : null
  ].filter(Boolean));
}

function workspaceIntro(kicker, title, text, actions = []) {
  return pageIntro(kicker, title, text, actions);
}

function focusWorkbench(items, data, editable) {
  const freeActions = data.actions.filter((action) => !action.development_area_id && !isExperimentClosed(action.status));
  if (!items.length) {
    return el("div", { class: "focus-workspace-stack" }, [
      el("div", { class: "focus-workbench focus-workbench-empty" }, [
        el("div", { class: "focus-master" }, [
          focusEmptyState(editable)
        ])
      ]),
      freeExperimentSection(freeActions, data, editable)
    ].filter(Boolean));
  }

  const selectedItemIndex = Math.max(0, Math.min(state.selectedFocusIndex || 0, items.length - 1));
  const selected = items[selectedItemIndex] || items[0] || null;
  const detail = el("aside", { class: "focus-detail" }, [
    focusDetail(selected, data, editable)
  ]);
  const grid = focusList(items, editable, data, detail);
  return el("div", { class: "focus-workspace-stack" }, [
    el("div", { class: "focus-workbench" }, [
      el("div", { class: "focus-master" }, [
        grid
      ]),
      el("div", { class: "focus-detail-wrap" }, [detail])
    ]),
    freeExperimentSection(freeActions, data, editable)
  ].filter(Boolean));
}

function focusIntro(editable = false) {
  return workspaceIntro("Fokusområder", "Hva bør du ha fokus på nå?", "Velg 1-4 områder du ønsker å utvikle, endre eller forstå bedre i praksis.", [
    editable ? addAction("Nytt fokusområde", () => addFocusArea()) : null
  ].filter(Boolean));
}

function freeExperimentSection(actions, data, editable) {
  if (!actions.length && !editable) return null;
  return el("section", { class: "ui-section-card free-experiments" }, [
    el("div", { class: "experiment-section-head" }, [
      el("div", {}, [
        el("h4", { text: "Eksperimenter på tvers" }),
        el("p", { text: "Ting du vil prøve uten å knytte dem til ett bestemt fokusområde." })
      ]),
      editable ? addAction("Legg til eksperiment", () => createAction(data, "")) : null
    ].filter(Boolean)),
    actions.length ? el("div", { class: "experiment-list" }, actions.map((action) => experimentRow(action, data, editable))) : null
  ].filter(Boolean));
}

function focusList(items, editable, data, detail) {
  return el("div", { class: "focus-picker" }, [
    ...items.map(({ area, index }, itemIndex) => el("article", { class: `focus-nav-item ${itemIndex === (state.selectedFocusIndex || 0) ? "active" : ""}` }, [
      el("button", { class: "focus-nav-button", type: "button", onclick: (event) => selectFocusCard(event.currentTarget, { area, index, itemIndex }, data, editable, detail) }, [
        el("span", { class: `ui-meta type-chip ${projectTypeClass(area.projectType)}`, text: projectTypeLabel(area.projectType) }),
        el("span", { class: "ui-stack-sm focus-nav-copy" }, [
          el("span", { class: "focus-nav-label", text: `Fokusområde ${index + 1}` }),
          el("strong", { class: "focus-nav-title", text: area.title || "Bevegelsesønske" }),
          contentPreview(area.movement || area.description, "Hva vil du rette oppmerksomheten mot?", 3)
        ])
      ])
    ].filter(Boolean))),
    editable ? el("button", { class: "ui-add-row focus-add-card", type: "button", onclick: () => addFocusArea() }, [
      el("span", { class: "ui-add-icon add-orb" }, [icon("plus")]),
      el("strong", { text: "Nytt fokusområde" })
    ]) : null,
    !items.length && !editable ? emptyState("Ingen fokus ennå", "Fokusområder blir synlige her når de er lagt inn.") : null
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
  const actions = data.actions.filter((action) => action.development_area_id === area.id && !isExperimentClosed(action.status));
  return el("section", { class: "ui-object-card content-card focus-detail-card" }, [
    el("div", { class: "focus-detail-titlebar" }, [
      el("div", { class: "focus-detail-heading" }, [
        el("span", { class: "focus-detail-meta" }, [
          el("span", { class: "eyebrow", text: `Fokusområde ${index + 1}` }),
          el("span", { class: `ui-meta type-chip ${projectTypeClass(area.projectType)}`, text: projectTypeLabel(area.projectType) })
        ]),
        editableTitle({
          className: "focus-title-edit",
          title: area.title || "Gi fokusområdet et navn",
          empty: !area.title,
          editKey: `focus:${index}:title`,
          value: area.title || "",
          placeholder: "Gi fokusområdet et kort navn.",
          onSave: async (nextValue) => saveFocusField(index, "title", nextValue)
        })
      ]),
      editable ? el("span", { class: "row-tools" }, [
        iconAction("Slett fokus", "trash-2", () => deleteFocusArea(index), "danger")
      ]) : null
    ].filter(Boolean)),
    focusDetailWorkspace(area, index, editable),
    el("div", { class: "detail-divider" }),
    el("div", { class: "experiment-section-head" }, [
      el("div", {}, [
        el("h4", { text: "Ting du vil prøve i praksis" }),
        el("p", { text: "Små handlinger eller justeringer du vil teste mellom samtalene." })
      ]),
      editable ? addAction("Legg til eksperiment", () => createAction(data, area.id)) : null
    ].filter(Boolean)),
    actions.length ? el("div", { class: "experiment-list" }, actions.map((action) => experimentRow(action, data, editable))) :
      el("p", { class: "content-card-body is-empty", text: "Ingen eksperimenter lagt til ennå." })
  ]);
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
    el("p", { class: "eyebrow", text: "Fokusområder" }),
    el("h3", { text: "Legg til første fokusområde" }),
    el("p", { class: "muted", text: "Start med ett område du vil undersøke, forstå bedre eller bevege. Eksperimenter kan kobles på etterpå." }),
    editable ? addAction("Nytt fokusområde", () => addFocusArea()) : null
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

function editableTitle({ className = "", title, empty = false, editKey, value = "", placeholder = "", onSave }) {
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
  return el("section", { class: "panel document-panel sessions-stack" }, [
    workspaceIntro("Samtaler", "Forbered og land samtalene.", "Bruk samtalene til å sortere det viktigste, forstå hva som skjer og velge hva du vil gjøre videre.", [
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
  return el("section", { class: "sessions-workbench" }, [
    sessionRail(sessions, detail, editable, data),
    el("div", { class: "session-detail-wrap" }, [detail])
  ]);
}

function sessionRail(sessions, detail, editable, data) {
  return el("div", { class: "session-rail" }, sessions.map((session, index) =>
    el("article", { class: `session-nav-item ${index === (state.selectedSessionIndex || 0) ? "active" : ""}` }, [
      el("button", { class: "session-nav-button", type: "button", onclick: () => selectSessionCard(session, index, detail, editable, data) }, [
        el("span", { class: "session-nav-date", text: session.date ? formatDate(session.date) : `Samtale ${index + 1}` }),
        el("strong", { class: "session-nav-title", text: session.focus || "Samtale uten tittel" }),
        el("small", { text: session.goal || "Ikke definert ennå" })
      ])
    ])
  ));
}

function selectSessionCard(session, index, detail, editable, data) {
  const cards = $$(".session-nav-item", detail.closest(".sessions-workbench"));
  state.selectedSessionIndex = index;
  cards.forEach((node, itemIndex) => node.classList.toggle("active", itemIndex === index));
  detail.replaceChildren(sessionDetail(session, index, editable, data));
  refreshIcons();
}

function sessionDetail(session, index, editable, data = null) {
  const linkedActions = (data?.actions || []).filter((action) => action.session_id === session.id && !isExperimentClosed(action.status));
  return el("section", { class: "ui-object-card content-card session-detail-card" }, [
    el("div", { class: "session-detail-titlebar" }, [
      el("div", { class: "session-detail-heading" }, [
        el("span", { class: "session-detail-meta" }, [
          el("span", { class: "eyebrow", text: `Samtale ${index + 1}` }),
          session.date ? el("span", { class: "ui-meta", text: formatDate(session.date) }) : null
        ].filter(Boolean)),
        editableTitle({
          className: "session-title-edit",
          title: session.focus || "Gi samtalen en tittel",
          empty: !session.focus,
          editKey: `session:${index}:focus`,
          value: session.focus || "",
          placeholder: "Gi samtalen en kort tittel.",
          onSave: async (nextValue) => saveSessionField(index, "focus", nextValue)
        })
      ]),
      editable ? el("span", { class: "row-tools" }, [
        iconAction("Slett samtale", "trash-2", () => deleteSession(index), "danger")
      ]) : null
    ].filter(Boolean)),
    el("div", { class: "session-detail-workspace" }, [
      sessionDetailBlock("Hva er viktig i denne samtalen?", session.goal, "Hva håper dere å forstå, avklare eller komme videre på i denne samtalen?", "goal", index, editable, "primary"),
      el("div", { class: "session-detail-grid" }, [
        sessionDetailBlock("Det som ble tydelig", session.notes, "Hva ble tydeligere i løpet av samtalen?", "notes", index, editable),
        sessionDetailBlock("Neste steg i praksis", session.actions, "Hva skal prøves, undersøkes eller følges opp videre?", "actions", index, editable)
      ]),
      sessionDetailBlock("Viktig å ta med videre", session.reflection, "Hva bør huskes, brukes videre eller tas opp igjen senere?", "reflection", index, editable)
    ]),
    linkedActions.length ? el("div", { class: "detail-divider" }) : null,
    linkedActions.length ? el("div", { class: "experiment-section-head" }, [
      el("div", {}, [
        el("h4", { text: "Eksperimenter fra samtalen" }),
        el("p", { text: "Neste steg som er gjort om til faktisk eksperiment." })
      ])
    ]) : null,
    linkedActions.length ? el("div", { class: "experiment-list" }, linkedActions.map((action) => experimentRow(action, data, editable))) : null
  ].filter(Boolean));
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
  return el("article", { class: `ui-field-card session-detail-block ${variant} ${text ? "" : "is-empty"}` }, [
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
    el("h3", { text: "Planlegg første coachingtime" }),
    el("p", { class: "muted", text: "Start med et samtalemål. Etterpå kan dere samle innsikt, beslutninger og hva du tar med deg videre." }),
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
  const next = [...getAreas().filter(hasAreaContent), { title: "Nytt fokusområde", description: "", projectType: "inner", movement: "", typicalSituations: "", progressSigns: "", nextPractice: "" }];
  setAreas(next);
  state.selectedFocusIndex = next.length - 1;
  state.inlineEditKey = `focus:${next.length - 1}:title`;
  markDirty();
  savePlan().then((saved) => {
    if (saved) reloadProgramAndRender("work");
  });
}

async function deleteFocusArea(index) {
  if (!(await confirmDelete("Slette dette fokuset?"))) return false;
  const areas = getAreas();
  const area = areas[index];
  if (area?.id) {
    const { error } = await state.sb.from("development_areas").delete().eq("id", area.id);
    if (error) throw error;
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
  if (!(await confirmDelete("Slette denne samtalen?"))) return false;
  const sessions = getSessions();
  const session = sessions[index];
  if (session?.id) {
    const { error } = await state.sb.from("coaching_sessions").delete().eq("id", session.id);
    if (error) throw error;
  }
  setSessions(sessions.filter((_, itemIndex) => itemIndex !== index));
  markDirty();
  const saved = await savePlan();
  if (!saved) return false;
  await reloadProgramAndRender("sessions");
  return true;
}

function setSessions(values) {
  const editor = $("#sessions-editor");
  if (!editor) return;
  editor.replaceChildren(...values.map((session, index) => sessionHiddenFields(session, index)));
}

function reflectionsWorkspace(data) {
  const canWriteReflection = state.profile.role === "client";
  const intro = canWriteReflection
    ? workspaceIntro("Arbeid mellom samtalene", "Ressurser og refleksjoner", "Øverst ligger det coachen har sendt til deg. Under kan du skrive egne refleksjoner, som alltid er private til du aktivt deler dem.")
    : workspaceIntro("Oppfølging", "Ressurser og delte refleksjoner", "Øverst ligger ressursene som er sendt. Under vises bare refleksjoner klienten aktivt har delt med coach.");
  return el("div", { class: "reflection-space" }, [
    intro,
    resourcesFromCoachSection(data, canWriteReflection),
    canWriteReflection ? reflectionComposer(data) : null,
    el("section", { class: "panel document-panel reflection-log-section" }, [
      el("div", { class: "reflection-log-head" }, [
        el("p", { class: "eyebrow", text: canWriteReflection ? "Dine refleksjoner" : "Delt med coach" }),
        el("h3", { text: canWriteReflection ? "Refleksjoner du har skrevet" : "Refleksjoner som er delt" }),
        el("p", { class: "muted", text: canWriteReflection
          ? "Her ligger refleksjonene du har skrevet selv. De er private med mindre du velger å dele dem."
          : "Her vises refleksjoner klienten aktivt har delt i coachingforløpet." })
      ]),
      reflectionsList(data.reflections, data, canWriteReflection)
    ])
  ].filter(Boolean));
}

function resourcesFromCoachSection(data, canWriteReflection) {
  const library = getResourceLibrary();
  if (!library?.createClientResourceList) return null;

  const sharedResources = data.sharedResources || [];
  const section = el("section", { class: "ui-section-card panel document-panel client-resources-section" });
  const renderSection = () => {
    const selected = sharedResources.find((item) => item.id === state.selectedSharedResourceId) || null;
    section.replaceChildren(
      el("div", { class: "client-resources-head" }, [
        el("div", {}, [
          el("p", { class: "eyebrow", text: canWriteReflection ? "Fra coachen din" : "Delte ressurser" }),
          el("h3", { text: canWriteReflection ? "Fra coach" : "Fra coach til klient" }),
          el("p", { class: "muted", text: canWriteReflection
            ? "Ressurser coachen har valgt for deg, med kort begrunnelse og eventuell instruks."
            : "Ressurser som er delt i dette coachingforløpet, inkludert instruksen klienten ser." })
        ])
      ]),
      library.createClientResourceList(sharedResources, {
        createElement: el,
        selectedId: selected?.id || null,
        onOpen: (sharedResource) => openSharedResource(sharedResource, canWriteReflection, renderSection),
        renderSelected: (sharedResource) => library.createClientResourceView(sharedResource, {
          createElement: el,
          readOnly: !canWriteReflection,
          onOpenFile: openResourceFile,
          onClose: () => {
            state.selectedSharedResourceId = null;
            renderSection();
          },
          onSave: (resource, values) => saveSharedResourceReflection(resource, values, renderSection)
        }),
        emptyText: canWriteReflection
          ? "Når coachen sender en ressurs, vises den her."
          : "Ingen ressurser er sendt i dette forløpet ennå."
      })
    );
    hydrateResourceMedia(section);
  };

  renderSection();
  return section;
}

async function openSharedResource(sharedResource, canWriteReflection, renderSection = null) {
  if (state.selectedSharedResourceId === sharedResource.id) {
    state.selectedSharedResourceId = null;
    renderSection?.();
    return;
  }

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
    } catch (error) {
      await showAppMessage("Kunne ikke oppdatere status", error.message || "Ressursen kan fortsatt åpnes.");
    }
  }
}

async function saveSharedResourceReflection(sharedResource, values, renderSection = null) {
  const library = await ensureResourceLibrary();
  if (!library?.saveClientResourceReflection) {
    await showAppMessage("Kunne ikke lagre", "Ressursmodulen mangler lagrefunksjon.");
    throw new Error("Ressursmodulen mangler lagrefunksjon.");
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
  } catch (error) {
    await showAppMessage("Kunne ikke lagre refleksjonen", error.message || "Prøv igjen.");
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

  return el("section", { class: "ui-section-card panel document-panel reflection-composer" }, [
    el("div", { class: "reflection-composer-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Ny refleksjon" }),
        el("h3", { text: "Skriv en egen refleksjon" }),
        el("p", { class: "muted", text: "Bruk dette når du vil notere noe fra hverdagen, uavhengig av en bestemt ressurs." })
      ])
    ]),
    el("textarea", { class: "ui-edit-control", id: "reflection-body", placeholder: "Hva skjedde? Hva la du merke til? Hva vil du ta med videre?" }),
    visibilityValue,
    el("div", { class: "field-pair" }, [
      el("div", { class: "visibility-control" }, [
        el("p", { text: "Privat betyr bare deg. Del med coach betyr at coachen kan lese refleksjonen i forløpet." }),
        el("div", { class: "visibility-choice-row" }, [
          visibilityButton("private", "Privat"),
          visibilityButton("shared_with_coach", "Del med coach")
        ])
      ]),
      el("label", { text: "Knytt til" }, [
        el("select", { id: "reflection-area" }, [
          el("option", { value: "", text: "Hele forløpet" }),
          ...data.areas.map((area) => el("option", { value: area.id, text: area.title || "Utviklingsområde" }))
        ])
      ])
    ]),
    el("div", { class: "toolbar" }, [
      el("span", { class: "muted", id: "reflection-status", text: "Ikke lagret" }),
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
      ? emptyState("Ingen refleksjoner ennå", "Skriv korte notater når noe blir tydeligere eller bør tas med videre.")
      : emptyState("Ingen delte refleksjoner ennå", "Del refleksjoner når det er noe du ønsker å utforske videre sammen.");
  }
  return el("div", { class: "reflection-list" }, reflections.map((reflection) => {
    const editable = reflection.created_by === state.user?.id;
    const area = (data.areas || []).find((item) => item.id === reflection.development_area_id);
    if (editable && state.inlineEditKey === `reflection:${reflection.id}`) return reflectionInlineCard(reflection, data);
    return el("article", { class: "ui-list-row content-card reflection-card editable-row" }, [
      el("button", {
        class: "row-open",
        type: "button",
        onclick: editable ? () => startReflectionEdit(reflection.id) : undefined,
        disabled: editable ? undefined : true
      }, [
        cardIcon("notebook-pen"),
        el("span", { class: "row-main" }, [
          el("span", { class: "reflection-card-meta" }, [
            el("span", { class: `ui-meta ${reflection.visibility === "private" ? "private" : ""}`, text: reflection.visibility === "private" ? "Privat" : "Delt med coach" }),
            area ? el("span", { class: "ui-meta", text: area.title || "Fokus" }) : null,
            el("small", { class: "content-card-meta", text: formatDate(reflection.created_at) })
          ].filter(Boolean)),
          contentPreview(reflection.body, "Tom refleksjon.", 4)
        ])
      ]),
      editable ? el("span", { class: "row-tools" }, [
        iconAction("Rediger refleksjon", "pencil", () => startReflectionEdit(reflection.id)),
        iconAction("Slett refleksjon", "trash-2", () => deleteReflection(reflection.id), "danger")
      ]) : null
    ].filter(Boolean));
  }));
}

function startReflectionEdit(id) {
  state.inlineEditKey = `reflection:${id}`;
  renderCachedProgram("reflections");
}

function reflectionInlineCard(reflection, data) {
  const body = el("textarea", { class: "ui-edit-control inline-textarea", text: reflection.body || "", placeholder: "Skriv en kort refleksjon..." });
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
    el("option", { value: "", text: "Hele forløpet", selected: !reflection.development_area_id }),
    ...data.areas.map((item) => el("option", { value: item.id, text: item.title || "Utviklingsområde", selected: reflection.development_area_id === item.id }))
  ]);
  return el("article", { class: "ui-inline-editor content-card reflection-card reflection-card-edit" }, [
    el("div", { class: "field-pair" }, [
      el("div", { class: "visibility-control" }, [
        el("p", { text: "Privat betyr bare deg. Del med coach betyr at coachen kan lese refleksjonen i forløpet." }),
        el("div", { class: "visibility-choice-row" }, [
          visibilityButton("private", "Privat"),
          visibilityButton("shared_with_coach", "Del med coach")
        ])
      ]),
      el("label", { text: "Knytt til" }, [area])
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
          development_area_id: area.value || null
        }).eq("id", reflection.id);
        if (error) {
          await showAppMessage("Kunne ikke lagre refleksjonen", error.message || "Prøv igjen.");
          return;
        }
        state.inlineEditKey = null;
        await reloadProgramAndRender("reflections");
      }})
    ])
  ]);
}

function createAction(data, presetAreaId = "") {
  openEntityDrawer("Nytt eksperiment", "Arbeid", [
    inputSpec("title", "Navn på eksperiment"),
    selectSpec("areaId", "Knytt til fokus", [["", "Fritt eksperiment"], ...data.areas.map((area) => [area.id, area.title || "Fokus"])], presetAreaId || "", false),
    sectionSpec("Før", "Gjør forsøket tydelig før du går ut og tester."),
    textareaSpec("hypothesis", "Hva vil du undersøke?", "", { placeholder: "Jeg vil teste om..." }),
    textareaSpec("action", "Hva skal du gjøre i praksis?", "", { placeholder: "I neste relevante situasjon skal jeg..." }),
    textareaSpec("signals", "Hva vil være tegn på at det virker?", "", { placeholder: "Jeg vil se etter..." }),
    inputSpec("dueDate", "Når vil du se tilbake?", "date"),
    sectionSpec("Under", "Noter raskt hva som faktisk skjedde når du prøvde."),
    textareaSpec("observation", "Hva la du merke til underveis?", "", { placeholder: "Underveis la jeg merke til..." }),
    sectionSpec("Etter", "Fylles ut når forsøket er prøvd."),
    choiceSpec("effect", "I hvilken grad flyttet dette noe?", [["", "Ikke avlest"], ["low", "Lite"], ["some", "Noe"], ["clear", "Tydelig"]], ""),
    textareaSpec("learning", "Hva lærte du?", "", { placeholder: "Det jeg la merke til var..." }),
    textareaSpec("nextStep", "Hva justerer du neste gang?", "", { placeholder: "Neste gang vil jeg..." })
  ], async (values) => {
    await state.sb.from("session_actions").insert({
      program_id: data.program.id,
      development_area_id: values.areaId || null,
      title: values.title,
      description: actionDescription(values),
      due_date: values.dueDate || null,
      status: "planned"
    });
    await reloadProgramAndRender("work");
  });
}

function createActionFromSessionNextStep(sessionIndex, nextStepText) {
  const client = getCurrentClient();
  const data = client ? state.programCache[client.id] : null;
  const session = getSessions()[sessionIndex] || {};
  if (!data) return;
  openEntityDrawer("Gjør til eksperiment", "Samtale", [
    inputSpec("title", "Navn på eksperiment", "text", nextStepText.slice(0, 80)),
    selectSpec("areaId", "Knytt til fokus", [["", "Velg fokus"], ...data.areas.map((area) => [area.id, area.title || "Fokus"])], "", false),
    textareaSpec("action", "Hva skal testes?", nextStepText, { placeholder: "Hva skal klienten prøve i praksis?" }),
    textareaSpec("signals", "Hva skal observeres?", "", { placeholder: "Hva skal klienten se etter?" }),
    inputSpec("dueDate", "Når skal det avleses?", "date")
  ], async (values) => {
    const { error } = await state.sb.from("session_actions").insert({
      program_id: data.program.id,
      session_id: session.id || null,
      development_area_id: values.areaId || null,
      title: values.title || "Eksperiment fra samtale",
      description: actionDescription({
        hypothesis: "",
        action: values.action || "",
        signals: values.signals || "",
        observation: "",
        effect: "",
        learning: "",
        nextStep: ""
      }),
      due_date: values.dueDate || null,
      status: "planned"
    });
    if (error) throw error;
    await reloadProgramAndRender("sessions");
  });
}

function editAction(action, data) {
  const parsed = parseActionDescription(action.description || "");
  openEntityDrawer("Rediger eksperiment", "Arbeid", [
    inputSpec("title", "Navn på eksperiment", "text", action.title || ""),
    selectSpec("areaId", "Knytt til fokus", [["", "Fritt eksperiment"], ...data.areas.map((area) => [area.id, area.title || "Fokus"])], action.development_area_id || "", false),
    sectionSpec("Før", "Hva var planen og antakelsen?"),
    textareaSpec("hypothesis", "Hva vil du undersøke?", parsed.hypothesis),
    textareaSpec("action", "Hva skal du gjøre i praksis?", parsed.action),
    textareaSpec("signals", "Hva vil være tegn på at det virker?", parsed.signals),
    inputSpec("dueDate", "Når vil du se tilbake?", "date", action.due_date || ""),
    sectionSpec("Under", "Hva observerte du mens det skjedde?"),
    textareaSpec("observation", "Hva la du merke til underveis?", parsed.observation),
    sectionSpec("Etter", "Hva skjedde, og hva tar du med videre?"),
    choiceSpec("effect", "I hvilken grad flyttet dette noe?", [["", "Ikke avlest"], ["low", "Lite"], ["some", "Noe"], ["clear", "Tydelig"]], parsed.effect || ""),
    textareaSpec("learning", "Hva lærte du?", parsed.learning),
    textareaSpec("nextStep", "Hva justerer du neste gang?", parsed.nextStep)
  ], async (values) => {
    const { error } = await state.sb.from("session_actions").update({
      development_area_id: values.areaId || null,
      title: values.title,
      description: actionDescription(values),
      due_date: values.dueDate || null
    }).eq("id", action.id);
    if (error) throw error;
    await reloadProgramAndRender("work");
  }, { dangerLabel: "Slett eksperiment", onDanger: () => deleteAction(action.id) });
}

function actionDescription(values) {
  const payload = {
    version: 2,
    hypothesis: values.hypothesis || "",
    action: values.action || "",
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
  const rows = [
    area && ["Fokus", area.title || "Fokusområde"],
    parsed.hypothesis && ["Hypotese", parsed.hypothesis],
    parsed.action && ["Handling", parsed.action],
    parsed.signals && ["Tegn", parsed.signals],
    parsed.observation && ["Underveis", parsed.observation],
    parsed.learning && ["Læring", parsed.learning],
    parsed.nextStep && ["Neste justering", parsed.nextStep]
  ].filter(Boolean);
  if (!rows.length) return contentPreview("", action.due_date ? `Se tilbake ${formatDate(action.due_date)}` : "Legg til hypotese, handling og hva du vil avlese.", 3);
  return el("div", { class: "action-meta" }, rows.map(([label, value]) => el("div", {}, [
    el("span", { text: label }),
    contentPreview(value, "", 3)
  ])));
}

function effectLabel(value) {
  return { low: "Lite effekt", some: "Noe effekt", clear: "Tydelig effekt" }[value] || "";
}

function phaseLabel(status, parsed) {
  const normalized = normalizeExperimentStatus(status);
  if (normalized === "closed") return "Avsluttet";
  if (normalized === "continued") return "Videreført";
  if (normalized === "reviewed" || parsed.effect || parsed.learning || parsed.nextStep) return "Avlest";
  if (normalized === "active" || parsed.action || parsed.signals) return "Prøves ut";
  return "Planlagt";
}

function experimentStateClass(action, parsed) {
  const status = normalizeExperimentStatus(action.status);
  if (status === "closed") return "is-reviewed";
  if (status === "continued") return "has-effect";
  if (status === "reviewed") return "is-reviewed";
  if (status === "active") return "is-testing";
  if (parsed.effect === "clear" || parsed.effect === "some") return "has-effect";
  if (parsed.effect || parsed.learning || parsed.nextStep) return "is-reviewed";
  if (parsed.observation || parsed.action || parsed.signals) return "is-testing";
  return "is-planned";
}

async function deleteAction(id) {
  if (!(await confirmDelete("Slette dette eksperimentet?"))) return false;
  const { error } = await state.sb.from("session_actions").delete().eq("id", id);
  if (error) {
    await showAppMessage("Kunne ikke slette eksperimentet", error.message || "Prøv igjen.");
    return false;
  }
  await reloadProgramAndRender("work");
  return true;
}

function parseActionDescription(description) {
  const values = { hypothesis: "", action: "", signals: "", observation: "", effect: "", learning: "", nextStep: "", situation: "", response: "", observe: "" };
  if (!description) return values;
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed === "object") {
      return {
        ...values,
        hypothesis: parsed.hypothesis || "",
        action: parsed.action || "",
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
    development_area_id: $("#reflection-area")?.value || null
  });
  if (error) {
    if (status) status.textContent = "Kunne ikke lagre";
    return;
  }
  await reloadProgramAndRender("reflections");
}

async function deleteReflection(id) {
  if (!(await confirmDelete("Slette denne refleksjonen?"))) return false;
  const { error } = await state.sb.from("client_reflections").delete().eq("id", id);
  if (error) {
    await showAppMessage("Kunne ikke slette refleksjonen", error.message || "Prøv igjen.");
    return false;
  }
  await reloadProgramAndRender("reflections");
  return true;
}

async function reloadProgramAndRender(activePane = "direction") {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  if (client) delete state.programCache[client.id];
  await renderPlan(activePane);
}

function experimentRow(action, data, editable) {
  const parsed = parseActionDescription(action.description || "");
  const area = data.areas.find((item) => item.id === action.development_area_id);
  const meta = [area?.title, action.due_date && formatDate(action.due_date)].filter(Boolean).join(" · ");
  const preview = parsed.learning || parsed.observation || parsed.action || parsed.hypothesis || "Hva skal prøves i praksis?";
  const effect = effectLabel(parsed.effect);
  return el("article", { class: `experiment-row ${experimentStateClass(action, parsed)}` }, [
    el("button", {
      class: "experiment-open",
      type: "button",
      onclick: editable ? () => editAction(action, data) : undefined,
      disabled: editable ? undefined : true
    }, [
      el("span", {}, [
        el("span", { class: "experiment-stage-row" }, [
          el("small", { class: "phase-chip", text: phaseLabel(action.status, parsed) }),
          effect ? el("small", { class: "effect-chip", text: effect }) : null
        ].filter(Boolean)),
        el("strong", { text: action.title || "Eksperiment uten tittel" }),
        meta ? el("small", { class: "content-card-meta", text: meta }) : null,
        contentPreview(preview, "Legg til hypotese, handling og avlesning.", 2)
      ]),
      icon("chevron-right")
    ].filter(Boolean))
  ].filter(Boolean));
}

function saveStrip(editable = true) {
  return el("div", { class: "save-strip" }, [
    el("span", { class: "save-status", id: "save-status", text: editable ? "Lagret" : "Lesetilgang" })
  ]);
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
    if (!current) throw new Error("Mangler programrad.");
    const plan = collectPlan();
    const programValues = {
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
    if ("c_context" in plan) programValues.context = plan.c_context || null;
    const { error: programError } = await state.sb.from("coaching_programs").update(programValues).eq("id", current.program.id);
    if (programError) throw programError;
    await saveAreas(current.program.id, plan.areas);
    await saveSessions(current.program.id, plan.sessions);
    await saveEvaluation(current.program.id, plan);
    delete state.programCache[client.id];
    await loadProgramSummaries();
    state.dirty = false;
    setSaveState("saved", `Lagret ${new Date().toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
    return true;
  } catch (error) {
    console.error("Kunne ikke lagre utviklingsplan", error);
    setSaveState("error");
    if (status) status.textContent = "Lagring feilet";
    await showAppMessage("Kunne ikke lagre", error.message || "Ukjent feil");
    return false;
  }
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
    inner: "Indre prosjekt",
    outer: "Ytre prosjekt",
    both: "Indre + ytre"
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
  const rows = areas
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
  const rows = sessions.map((session, index) => ({
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
  const payload = {
    program_id: programId,
    achieved: plan.eval_achieved || null,
    reflection: plan.eval_reflection || null,
    next_steps: plan.eval_next || null
  };
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
    const { error } = await state.sb.from("coaches").update({ name: values.name, email: values.email }).eq("id", coach.id);
    if (error) throw error;
    if (coach.user_id) {
      const { error: profileError } = await state.sb.from("profiles").update({ name: values.name }).eq("id", coach.user_id);
      if (profileError) throw profileError;
    }
    await reloadAndRender();
  });
}

function openClientEdit(client) {
  openEntityModal("Rediger klient", "Klient", [
    inputSpec("name", "Navn", "text", client.name || ""),
    inputSpec("role", "Stilling", "text", client.role || ""),
    inputSpec("employer", "Arbeidsgiver", "text", client.employer || ""),
    selectSpec("coachIds", "Coach(er)", state.coaches.map((coach) => [coach.id, coach.name]), client.coach_ids || [], true)
  ], async (values) => {
    const { error } = await state.sb.from("clients").update({ name: values.name, role: values.role, employer: values.employer, coach_ids: values.coachIds }).eq("id", client.id);
    if (error) throw error;
    await reloadAndRender();
  });
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
        icon("trash-2"),
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
  $("#drawer-title").textContent = title;
  $("#drawer-kicker").textContent = kicker;
  $("#drawer-message").textContent = "";
  $("#drawer-fields").replaceChildren(...specs.map(renderSpec));
  const dangerSlot = $("#drawer-danger-slot");
  if (dangerSlot) {
    if (options.onDanger) {
      dangerSlot.replaceChildren(el("button", { class: "button modal-danger-button", type: "button", onclick: handleDrawerDanger }, [
        icon("trash-2"),
        el("span", { text: options.dangerLabel || "Slett" })
      ]));
    } else {
      dangerSlot.replaceChildren();
    }
  }
  $("#entity-drawer").showModal();
  refreshIcons();
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
          const control = $(`[name='${name}']`, form);
          if (control) values[name] = control.value.trim();
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
    $("#modal-message").textContent = error.message || "Kunne ikke lagre.";
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
    $("#drawer-message").textContent = error.message || "Kunne ikke lagre.";
  }
});

async function handleModalDanger() {
  if (!state.modal?.onDanger) return;
  try {
    $("#modal-message").textContent = "";
    const deleted = await state.modal.onDanger();
    if (deleted !== false) $("#entity-modal").close();
  } catch (error) {
    $("#modal-message").textContent = error.message || "Kunne ikke slette.";
  }
}

async function handleDrawerDanger() {
  if (!state.drawer?.onDanger) return;
  try {
    $("#drawer-message").textContent = "";
    const deleted = await state.drawer.onDanger();
    if (deleted !== false) $("#entity-drawer").close();
  } catch (error) {
    $("#drawer-message").textContent = error.message || "Kunne ikke slette.";
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

async function verifyInvitedClient(email) {
  const client = await findClientForInviteVerification(email);
  if (!client?.id) throw new Error("Invitasjonen ble sendt, men klientraden ble ikke opprettet.");
  if (!client.user_id) throw new Error("Invitasjonen ble sendt, men klienten ble ikke koblet til Supabase Auth.");
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
  if (!coach.user_id) throw new Error("Invitasjonen ble sendt, men coachen ble ikke koblet til Supabase Auth.");
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
  if (!(await confirmDelete(`Slett coach "${coach.name}"? Klientenes planer beholdes.`))) return;
  const { error } = await state.sb.from("coaches").delete().eq("id", coach.id);
  if (error) {
    await showAppMessage("Kunne ikke slette coach", error.message || "Prøv igjen.");
    return;
  }
  if (coach.user_id) {
    const { error: profileError } = await state.sb.from("profiles").delete().eq("id", coach.user_id);
    if (profileError) {
      await showAppMessage("Coach ble slettet, men ikke profilen", profileError.message || "Kontroller tilgangene.");
      return;
    }
  }
  await reloadAndRender();
}

async function deleteClient(client) {
  if (!(await confirmDelete(`Slett klient "${client.name}"? All plandata slettes permanent i dagens datamodell.`))) return;
  const { error } = await state.sb.from("clients").delete().eq("id", client.id);
  if (error) {
    await showAppMessage("Kunne ikke slette klient", error.message || "Prøv igjen.");
    return;
  }
  if (client.user_id) {
    const { error: profileError } = await state.sb.from("profiles").delete().eq("id", client.user_id);
    if (profileError) {
      await showAppMessage("Klient ble slettet, men ikke profilen", profileError.message || "Kontroller tilgangene.");
      return;
    }
  }
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
  return [...clients].sort((a, b) => {
    if (sortBy === "created-desc") return createdTime(b) - createdTime(a) || byName(a, b);
    if (sortBy === "created-asc") return createdTime(a) - createdTime(b) || byName(a, b);
    if (sortBy === "next-session") return nextSessionTime(a) - nextSessionTime(b) || byName(a, b);
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

function materialButton(label, handler, variant = "filled") {
  const tag = variant === "outlined" ? "md-outlined-button" : variant === "text" ? "md-text-button" : "md-filled-button";
  return el(tag, { type: "button", onclick: handler }, [el("span", { text: label })]);
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

init();
