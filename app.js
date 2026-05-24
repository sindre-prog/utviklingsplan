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
  directionEditKey: null,
  inlineEditKey: null,
  selectedFocusIndex: 0,
  selectedSessionIndex: 0
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
  const hasAuthTokens = hashParams.has("access_token") || hashParams.has("refresh_token") || urlParams.has("access_token") || urlParams.has("refresh_token");
  const isPasswordFlow = ["invite", "recovery"].includes(authType) || Boolean(authCode) || Boolean(tokenHash) || hasAuthTokens;

  state.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  state.sb.auth.onAuthStateChange((event, session) => {
    if ((event === "PASSWORD_RECOVERY" || (isPasswordFlow && event === "SIGNED_IN")) && session?.user) {
      state.user = session.user;
      setScreen("password");
      refreshIcons();
    }
  });
  bindAuth();
  let authError = null;
  if (tokenHash && ["invite", "recovery"].includes(authType)) {
    const { error } = await state.sb.auth.verifyOtp({ token_hash: tokenHash, type: authType });
    authError = error;
    window.history.replaceState(null, "", window.location.pathname);
  } else if (authCode) {
    const { error } = await state.sb.auth.exchangeCodeForSession(authCode);
    authError = error;
    window.history.replaceState(null, "", window.location.pathname);
  }
  const { data: { session } } = await state.sb.auth.getSession();
  if (session && isPasswordFlow) {
    state.user = session.user;
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
    const { error } = await state.sb.auth.updateUser({ password });
    if (error) return setMessage("#password-message", `Feil: ${error.message}`);
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
    const { data } = await state.sb.from("clients").select("*").order("name");
    clients = data || [];
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
  return el("div", { class: "panel" }, [
    el("div", { class: "meta-row" }, [el("span", { class: "badge", text: label }), icon(iconName)]),
    el("h2", { text: value, style: "margin-top:16px" }),
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
  setHeader("Utviklingsplaner", "Klienter", [button("Inviter klient", "user-plus", () => openClientInvite())]);
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
        el("div", {}, [el("p", { class: "eyebrow", text: "Arbeidsflate" }), el("h3", { text: "Klientoversikt" })])
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
    button("Inviter klient", "user-plus", () => openClientInvite())
  ]);
  const coachSearch = el("input", { class: "search", placeholder: "Søk coach" });
  const clientSearch = el("input", { class: "search", placeholder: "Søk klient, coach eller arbeidsgiver" });
  const coachTableSlot = el("div");
  const clientTableSlot = el("div");
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
        el("div", {}, [el("p", { class: "eyebrow", text: "Team" }), el("h3", { text: "Coacher" })])
      ]),
      el("div", { class: "filter-row admin-filter-row" }, [coachSearch]),
      coachTableSlot
    ]),
    el("section", { class: "panel list-panel" }, [
      el("div", { class: "toolbar" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "Tilgang" }), el("h3", { text: "Klienter" })])
      ]),
      el("div", { class: "filter-row admin-filter-row" }, [clientSearch, adminCoachFilter, adminSortFilter]),
      clientTableSlot
    ])
  );
  renderCoaches();
  renderClientsTable();
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
    return el("button", { class: "button ghost", disabled, onclick: disabled ? null : handler, text: label });
  }));
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
  if (editable) form.addEventListener("input", () => markDirty());
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
  const [{ data: areas }, { data: sessions }, { data: actions }, { data: reflections }, { data: evaluations }] = await Promise.all([
    state.sb.from("development_areas").select("*").eq("program_id", program.id).order("sort_order"),
    state.sb.from("coaching_sessions").select("*").eq("program_id", program.id).order("session_date", { ascending: false }),
    state.sb.from("session_actions").select("*").eq("program_id", program.id).order("created_at", { ascending: false }),
    state.sb.from("client_reflections").select("*").eq("program_id", program.id).order("created_at", { ascending: false }),
    state.sb.from("program_evaluations").select("*").eq("program_id", program.id).limit(1)
  ]);
  const payload = {
    program,
    areas: areas || [],
    sessions: sessions || [],
    actions: actions || [],
    reflections: reflections || [],
    evaluation: evaluations?.[0] || null
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
      if (state.directionEditKey) {
        await showAppMessage("Lagre eller avbryt først", "Du har et åpent Retning-felt. Lagre eller avbryt før du går videre.");
        return;
      }
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
  return el("section", { class: "direction-simple" }, [
    el("div", { class: "direction-simple-head" }, [
      el("div", { class: "direction-simple-copy" }, [
        el("p", { class: "eyebrow", text: "Retning" }),
        el("h3", { text: `Hei ${firstName}, la oss gjøre dette konkret.` }),
        el("p", { class: "muted", text: "Avklar hva dere jobber mot, hva som skal merkes i praksis, og hvilke rammer som gjør samarbeidet nyttig." })
      ]),
      el("div", { class: "workspace-inline-actions" }, [
        el("span", { class: `direction-status ${status.tone}`, text: status.label }),
        editable ? button(status.action || "Rediger retning", "pencil", () => activateFirstMissingDirectionField(directionSpecs), "ghost") : null
      ].filter(Boolean))
    ]),
    el("div", { class: "direction-card-grid" }, [
      directionCard("Mål og bevegelse", "Hva forløpet skal hjelpe frem, og hvordan dere ser at noe faktisk flytter seg.", directionSpecs.slice(0, 2), editable, client),
      directionCard("Samarbeid", "Hva klient og coach kan forvente av hverandre mellom og i samtalene.", directionSpecs.slice(2, 4), editable, client),
      directionCard("Rammer", "Praktiske grenser, konfidensialitet og konteksten coachingarbeidet skjer i.", directionSpecs.slice(4), editable, client, "wide")
    ])
  ]);
}

function directionCard(title, text, specs, editable, client, variant = "") {
  return el("article", { class: `workspace-card direction-workspace-card ${variant}` }, [
    el("div", { class: "workspace-card-head" }, [
      el("div", {}, [
        el("h3", { text: title }),
        el("p", { text })
      ])
    ]),
    el("div", { class: "direction-list" }, [
      ...specs.map((spec) => directionInlineField(spec, editable, client))
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
      label: "Mål",
      value: plan.c_purpose,
      helper: "Hva skal dette coachingforløpet hjelpe deg å bevege, avklare eller utvikle?",
      placeholder: "Eksempel: Bli tryggere i prioritering og tydeligere i lederrollen når presset øker."
    },
    {
      key: "c_success",
      label: "Tegn på bevegelse",
      value: plan.c_success,
      helper: "Hva vil du, coach eller andre kunne legge merke til hvis arbeidet begynner å virke?",
      placeholder: "Eksempel: Færre omstarter, raskere beslutninger og tydeligere forventningsavklaringer."
    },
    {
      key: "c_expect_client",
      label: "Forventninger til klient",
      value: plan.c_expect_client,
      helper: "Hva tar klienten ansvar for å prøve, observere eller forberede mellom samtalene?",
      placeholder: "Eksempel: Teste små grep i arbeidshverdagen og notere korte observasjoner mens de er ferske."
    },
    {
      key: "c_expect_coach",
      label: "Forventninger til coach",
      value: plan.c_expect_coach,
      helper: "Hva skal coach bidra med, utfordre, holde fast i eller følge opp?",
      placeholder: "Eksempel: Hjelpe med presisering, utfordre antakelser og holde tråden fra samtale til praksis."
    },
    {
      key: "frame",
      label: "Rammer og konfidensialitet",
      helper: "Hva er den praktiske rammen, og hva skal være privat, delt eller utenfor coachingens mandat?",
      fields: [
        {
          key: "c_practical",
          label: "Praktiske rammer",
          value: plan.c_practical,
          placeholder: "Eksempel: Seks samtaler annenhver uke. Mellom samtalene testes små praksiseksperimenter."
        },
        {
          key: "c_confidentiality",
          label: "Konfidensialitet",
          value: plan.c_confidentiality,
          placeholder: "Eksempel: Refleksjoner er private med mindre klient velger å dele. Coaching erstatter ikke helsehjelp."
        }
      ]
    },
    {
      key: "c_context",
      label: "Interessenter og kontekst",
      value: plan.c_context,
      helper: "Hvilke personer, team, roller eller organisatoriske forventninger påvirker arbeidet?",
      placeholder: "Eksempel: Ledergruppen, nærmeste leder og teamet som trenger tydeligere prioriteringer."
    }
  ];
}

function directionStatus(plan) {
  if (!plan.c_purpose || !plan.c_success) {
    return {
      tone: "missing",
      label: "Mangler retning",
      text: "Start med mål og tegn på bevegelse før dere velger fokusområder.",
      action: "Sett retning"
    };
  }
  if (!plan.c_expect_client || !plan.c_expect_coach) {
    return {
      tone: "partial",
      label: "Mangler avtale",
      text: "Gjør forventningene tydelige, så klient og coach vet hva de skal holde fast i.",
      action: "Avklar forventninger"
    };
  }
  return {
    tone: "ready",
    label: "Retning satt",
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
      text: value ? "Rediger" : "Legg til",
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

async function activateDirectionEdit(spec) {
  if (state.directionEditKey && state.directionEditKey !== spec.key) {
    await showAppMessage("Lagre eller avbryt først", "Bare ett Retning-felt kan redigeres om gangen.");
    return;
  }
  const field = $(`[data-direction-key='${spec.key}']`);
  if (!field) return;
  state.directionEditKey = spec.key;
  field.classList.add("is-editing");
  field.replaceChildren(directionEditContent(spec));
  refreshIcons();
}

function directionEditContent(spec) {
  const fields = spec.fields || [spec];
  return el("div", { class: "direction-edit" }, [
    el("div", { class: "direction-field-label" }, [
      el("h4", { text: spec.label }),
      el("p", { text: spec.helper })
    ]),
    el("div", { class: "direction-edit-fields" }, fields.map((field) => (
      el("label", { text: field.label || spec.label }, [
        el("textarea", {
          name: `inline-${field.key}`,
          text: field.value || "",
          placeholder: field.placeholder || spec.placeholder || spec.helper
        })
      ])
    ))),
    el("div", { class: "direction-edit-actions" }, [
      button("Avbryt", "x", async () => {
        state.directionEditKey = null;
        await reloadProgramAndRender("direction");
      }, "ghost"),
      button("Lagre", "save", async () => {
        fields.forEach((field) => {
          setPlanValue(field.key, $(`[name='inline-${field.key}']`)?.value || "");
        });
        state.directionEditKey = null;
        markDirty();
        const saved = await savePlan();
        if (!saved) return;
        await reloadProgramAndRender("direction");
      }, "primary")
    ])
  ]);
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

function workspaceIntro(kicker, title, text, actions = []) {
  return el("header", { class: "workspace-intro" }, [
    el("div", {}, [
      el("p", { class: "eyebrow", text: kicker }),
      el("h3", { text: title }),
      el("p", { class: "muted", text })
    ]),
    actions.length ? el("div", { class: "workspace-intro-actions" }, actions) : null
  ].filter(Boolean));
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
  return workspaceIntro("Fokusområder", "Prioriter utviklingssporene.", "Velg få fokusområder og gjør dem tydelige nok til at de kan øves på i konkrete situasjoner.", [
    editable ? iconAction("Legg til fokusområde", "plus", () => addFocusArea()) : null
  ].filter(Boolean));
}

function freeExperimentSection(actions, data, editable) {
  if (!actions.length && !editable) return null;
  return el("section", { class: "free-experiments" }, [
    el("div", { class: "experiment-section-head" }, [
      el("div", {}, [
        el("h4", { text: "Frie eksperimenter" }),
        el("p", { text: "Brukes når noe skal testes uten å knyttes til et bestemt fokusområde." })
      ]),
      editable ? el("button", { class: "icon-button", type: "button", title: "Nytt eksperiment uten fokusområde", onclick: () => createAction(data, "") }, [icon("plus")]) : null
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
          el("span", { class: "focus-nav-label", text: `Fokus ${index + 1}` }),
          el("strong", { class: "focus-nav-title", text: area.title || "Bevegelsesønske" }),
          contentPreview(area.movement || area.description, "Hva vil du rette oppmerksomheten mot?", 3)
        ])
      ])
    ].filter(Boolean))),
    editable ? el("button", { class: "focus-add-card", type: "button", onclick: () => addFocusArea() }, [
      el("span", { class: "add-orb" }, [icon("plus")]),
      el("strong", { text: "Legg til fokusområde" })
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
  return el("section", { class: "content-card focus-detail-card" }, [
    el("div", { class: "focus-detail-titlebar" }, [
      el("div", { class: "focus-detail-heading" }, [
        el("span", { class: "focus-detail-meta" }, [
          el("span", { class: "eyebrow", text: `Fokus ${index + 1}` }),
          el("span", { class: `ui-meta type-chip ${projectTypeClass(area.projectType)}`, text: projectTypeLabel(area.projectType) })
        ]),
        el("h3", { text: area.title || "Bevegelsesønske" })
      ]),
      editable ? el("span", { class: "row-tools" }, [
        iconAction("Slett fokus", "trash-2", () => deleteFocusArea(index), "danger")
      ]) : null
    ].filter(Boolean)),
    focusDetailWorkspace(area, index, editable),
    el("div", { class: "detail-divider" }),
    el("div", { class: "experiment-section-head" }, [
      el("div", {}, [
        el("h4", { text: "Eksperimenter for dette fokuset" }),
        el("p", { text: "Konkrete ting du vil teste, observere og lære av i praksis." })
      ]),
      editable ? el("button", { class: "icon-button", type: "button", title: "Nytt eksperiment", onclick: () => createAction(data, area.id) }, [icon("plus")]) : null
    ].filter(Boolean)),
    actions.length ? el("div", { class: "experiment-list" }, actions.map((action) => experimentRow(action, data, editable))) :
      el("p", { class: "content-card-body is-empty", text: "Ingen eksperimenter knyttet til dette fokuset ennå." })
  ]);
}

function focusDetailWorkspace(area, index, editable) {
  return el("div", { class: "focus-detail-workspace" }, [
    focusDetailBlock("Ønsket bevegelse", area.movement || area.description, "Hva skal dette fokuset hjelpe deg å bevege, endre eller oppnå?", "movement", area, index, editable, "primary"),
    el("div", { class: "focus-detail-support" }, [
      focusDetailBlock("Tittel", area.title, "Gi fokusområdet et kort navn.", "title", area, index, editable),
      focusDetailBlock("Typiske situasjoner", area.typicalSituations, "Hvor viser dette mønsteret seg oftest?", "typicalSituations", area, index, editable),
      focusDetailBlock("Tegn på fremgang", area.progressSigns, "Hvordan vil du merke at noe faktisk er i bevegelse?", "progressSigns", area, index, editable)
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
        reloadProgramAndRender("work");
      },
      onSave: async (nextValue) => {
        await saveFocusField(index, fieldKey, nextValue);
      }
    });
  }
  return el("article", { class: `focus-detail-block ${variant} ${text ? "" : "is-empty"}` }, [
    el("p", { class: "focus-detail-label", text: label }),
    el("p", { class: "focus-detail-text", text: text || emptyText }),
    editable && fieldKey ? el("button", {
      class: "field-inline-action",
      type: "button",
      text: text ? "Rediger" : "Legg til",
      onclick: () => {
        state.inlineEditKey = editKey;
        reloadProgramAndRender("work");
      }
    }) : null
  ].filter(Boolean));
}

function focusEmptyState(editable) {
  return el("section", { class: "focus-empty-state" }, [
    el("p", { class: "eyebrow", text: "Fokusområder" }),
    el("h3", { text: "Legg til første fokusområde" }),
    el("p", { class: "muted", text: "Start med ett område dere vil undersøke, forstå bedre eller bevege. Eksperimenter kan kobles på etterpå." }),
    editable ? button("Legg til fokusområde", "plus", () => addFocusArea(), "ghost") : null
  ].filter(Boolean));
}

function emptyState(title, text) {
  return el("div", { class: "empty-inline" }, [
    el("strong", { text: title }),
    el("p", { class: "muted", text })
  ]);
}

function sessionsWorkspace(sessions, data) {
  const editable = canEditProgram(getCurrentClient());
  return el("section", { class: "panel document-panel sessions-stack" }, [
    workspaceIntro("Samtaler", "Forbered og land coaching-samtaler.", "Behold samtalens viktigste felter, og bruk dem til å koble innsikt tilbake til praksis.", [
      editable ? iconAction("Ny samtale", "plus", () => addSession()) : null
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
        el("small", { text: session.goal || "Mål ikke satt ennå" })
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
  return el("section", { class: "content-card session-detail-card" }, [
    el("div", { class: "session-detail-titlebar" }, [
      el("div", { class: "session-detail-heading" }, [
        el("span", { class: "session-detail-meta" }, [
          el("span", { class: "eyebrow", text: `Samtale ${index + 1}` }),
          session.date ? el("span", { class: "ui-meta", text: formatDate(session.date) }) : null
        ].filter(Boolean)),
        el("h3", { text: session.focus || "Samtale uten tittel" })
      ]),
      editable ? el("span", { class: "row-tools" }, [
        iconAction("Slett samtale", "trash-2", () => deleteSession(index), "danger")
      ]) : null
    ].filter(Boolean)),
    el("div", { class: "session-detail-workspace" }, [
      sessionDetailBlock("Tittel", session.focus, "Gi samtalen en kort tittel.", "focus", index, editable),
      sessionDetailBlock("Mål med samtalen", session.goal, "Hva skal denne samtalen hjelpe dere å avklare, forstå eller bevege?", "goal", index, editable, "primary"),
      el("div", { class: "session-detail-grid" }, [
        sessionDetailBlock("Innsikt", session.notes, "Hva ble tydeligere, viktigere eller annerledes?", "notes", index, editable),
        sessionDetailBlock("Mulig neste steg", session.actions, "Hva velger dere å prøve, undersøke eller følge opp?", "actions", index, editable)
      ]),
      sessionDetailBlock("Tas videre", session.reflection, "Hva skal klienten huske, bruke eller komme tilbake til?", "reflection", index, editable)
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
        reloadProgramAndRender("sessions");
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
        class: "field-inline-action",
        type: "button",
        text: "Gjør til eksperiment",
        onclick: () => createActionFromSessionNextStep(index, text)
      }) : null,
      el("button", {
        class: "field-inline-action",
        type: "button",
        text: text ? "Rediger" : "Legg til",
        onclick: () => {
          state.inlineEditKey = editKey;
          reloadProgramAndRender("sessions");
        }
      })
    ].filter(Boolean)) : null
  ].filter(Boolean));
}

function inlineTextAreaBlock({ className, label, value, placeholder, onCancel, onSave }) {
  const textarea = el("textarea", { class: "inline-textarea", text: value || "", placeholder });
  return el("article", { class: `${className} is-editing` }, [
    el("p", { class: "focus-detail-label", text: label }),
    textarea,
    el("div", { class: "inline-edit-actions" }, [
      button("Avbryt", "x", async () => onCancel(), "ghost"),
      button("Lagre", "save", async () => onSave(textarea.value), "primary")
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
    el("p", { class: "muted", text: "Start med et samtalemål. Etterpå kan dere samle innsikt, beslutninger og hva klienten tar med seg videre." }),
    editable ? button("Ny samtale", "plus", () => addSession(), "ghost") : null
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
  return el("div", { class: "reflection-space" }, [
    workspaceIntro("Refleksjon", "Skriv ned det du legger merke til.", "Privat er standard. Del bare med coach når det faktisk hjelper samtalen videre."),
    canWriteReflection ? reflectionComposer(data) : reflectionCoachNote(),
    el("section", { class: "panel document-panel reflection-log-section" }, [
      el("p", { class: "eyebrow", text: "Logg" }),
      el("h3", { class: "section-title", text: "Refleksjoner" }),
      reflectionsList(data.reflections, data)
    ])
  ].filter(Boolean));
}

function reflectionComposer(data) {
  return el("section", { class: "panel document-panel reflection-composer" }, [
    el("div", { class: "reflection-composer-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Ny refleksjon" }),
        el("h3", { text: "Hva skjedde?" }),
        el("p", { class: "muted", text: "Skriv kort. Du kan beholde refleksjonen privat eller dele den med coach." })
      ])
    ]),
    el("textarea", { id: "reflection-body", placeholder: "Hva skjedde? Hva gjorde du? Hva la du merke til hos deg selv eller andre?" }),
    el("div", { class: "field-pair" }, [
      el("label", { text: "Synlighet" }, [
        el("select", { id: "reflection-visibility" }, [
          el("option", { value: "private", text: "Privat" }),
          el("option", { value: "shared_with_coach", text: "Del med coach" })
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
      button("Lagre refleksjon", "notebook-pen", () => createReflection(data.program.id))
    ])
  ]);
}

function reflectionCoachNote() {
  return el("section", { class: "panel document-panel reflection-note" }, [
    workspaceIntro("Refleksjon", "Dette er klientens rom for refleksjon.", "Som coach ser du refleksjoner som er delt med deg. Private refleksjoner blir ikke synlige her.")
  ]);
}

function reflectionsList(reflections, data) {
  if (!reflections.length) return emptyState("Ingen refleksjoner ennå", "Skriv korte notater når noe blir tydeligere, flytter seg eller bør tas med videre.");
  return el("div", { class: "reflection-list" }, reflections.map((reflection) => {
    const editable = reflection.created_by === state.user?.id;
    const area = (data.areas || []).find((item) => item.id === reflection.development_area_id);
    if (editable && state.inlineEditKey === `reflection:${reflection.id}`) return reflectionInlineCard(reflection, data);
    return el("article", { class: "content-card reflection-card editable-row" }, [
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
  reloadProgramAndRender("reflections");
}

function reflectionInlineCard(reflection, data) {
  const body = el("textarea", { class: "inline-textarea", text: reflection.body || "", placeholder: "Skriv en kort refleksjon..." });
  const visibility = el("select", {}, [
    el("option", { value: "private", text: "Privat", selected: reflection.visibility === "private" }),
    el("option", { value: "shared_with_coach", text: "Del med coach", selected: reflection.visibility === "shared_with_coach" })
  ]);
  const area = el("select", {}, [
    el("option", { value: "", text: "Hele forløpet", selected: !reflection.development_area_id }),
    ...data.areas.map((item) => el("option", { value: item.id, text: item.title || "Utviklingsområde", selected: reflection.development_area_id === item.id }))
  ]);
  return el("article", { class: "content-card reflection-card reflection-card-edit" }, [
    el("div", { class: "field-pair" }, [
      el("label", { text: "Synlighet" }, [visibility]),
      el("label", { text: "Knytt til" }, [area])
    ]),
    body,
    el("div", { class: "inline-edit-actions" }, [
      button("Avbryt", "x", async () => {
        state.inlineEditKey = null;
        await reloadProgramAndRender("reflections");
      }, "ghost"),
      button("Lagre", "save", async () => {
        const { error } = await state.sb.from("client_reflections").update({
          body: body.value || "",
          visibility: visibility.value || "private",
          development_area_id: area.value || null
        }).eq("id", reflection.id);
        if (error) {
          await showAppMessage("Kunne ikke lagre refleksjonen", error.message || "Prøv igjen.");
          return;
        }
        state.inlineEditKey = null;
        await reloadProgramAndRender("reflections");
      }, "primary")
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

function openClientInvite() {
  openEntityModal("Inviter klient", "Tilgang", [
    inputSpec("name", "Navn"),
    inputSpec("email", "E-post", "email"),
    inputSpec("role", "Stilling"),
    inputSpec("employer", "Arbeidsgiver"),
    selectSpec("coachIds", "Coach(er)", state.coaches.map((coach) => [coach.id, coach.name]), state.coach ? [state.coach.id] : [], true)
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

function choiceSpec(name, label, options, value = "") {
  return { kind: "choice", name, label, options, value };
}

function sectionSpec(title, text = "") {
  return { kind: "section", title, text };
}

function renderSpec(spec) {
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
    const control = $(`[name='${spec.name}']`, form);
    if (spec.kind === "choice") {
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

async function inviteClient(values) {
  const { data: { session } } = await state.sb.auth.getSession();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/invite-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email: values.email, name: values.name, role: "client", coachIds: values.coachIds || [], jobRole: values.role, employer: values.employer })
  });
  const result = await res.json();
  if (!res.ok || result.error) throw new Error(result.error || "Invitasjonen feilet.");
  const { data: client } = await state.sb.from("clients").select("id").eq("email", values.email).maybeSingle();
  if (client?.id) {
    const { data: existingProgram } = await state.sb.from("coaching_programs").select("id").eq("client_id", client.id).maybeSingle();
    if (!existingProgram) await state.sb.from("coaching_programs").insert({ client_id: client.id, status: "draft" });
  }
  await reloadAndRender();
}

async function inviteCoach(values) {
  const { data: { session } } = await state.sb.auth.getSession();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/invite-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email: values.email, name: values.name, role: "coach" })
  });
  const result = await res.json();
  if (!res.ok || result.error) throw new Error(result.error || "Invitasjonen feilet.");
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
