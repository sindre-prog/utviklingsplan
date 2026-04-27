const SUPABASE_URL = "https://upuffmfgsxlzybifxveg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YLVxFqksi1wCmh-jF14mLA_0AGV03Gq";

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
  modal: null
};

const planFields = [
  ["c_purpose", "Arbeidshypotese: hva tror vi dette forløpet egentlig handler om?", "textarea"],
  ["c_success", "Tegn på bevegelse: hva vil være annerledes i praksis?", "textarea"],
  ["c_expect_coach", "Hva trenger du fra coach for at dette skal bli nyttig?", "textarea"],
  ["c_expect_client", "Hva vil du utforske eller teste mellom samtalene?", "textarea"],
  ["c_confidentiality", "Hva skal holdes privat, og hva kan deles i samtalene?", "textarea"],
  ["c_practical", "Rammer for samarbeidet", "textarea"]
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

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
    state.programSummaries[program.client_id] = { ...program, sessionCount: 0, areaCount: 0 };
  });
  const programIds = (programs || []).map((program) => program.id);
  if (!programIds.length) return;
  const [{ data: sessions }, { data: areas }] = await Promise.all([
    state.sb.from("coaching_sessions").select("id, program_id").in("program_id", programIds),
    state.sb.from("development_areas").select("id, program_id").in("program_id", programIds)
  ]);
  (sessions || []).forEach((session) => {
    const summary = Object.values(state.programSummaries).find((item) => item.id === session.program_id);
    if (summary) summary.sessionCount += 1;
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

function renderClients() {
  if (state.profile.role === "client") return navigate("plan", state.client?.id);
  setHeader("Utviklingsplaner", "Klienter", [button("Inviter klient", "user-plus", () => openClientInvite())]);
  const content = $("#content");
  const visibleClients = getVisibleClients();
  const active = visibleClients.filter((client) => client.consent_given).length;
  const pending = visibleClients.length - active;
  const filterCoaches = state.profile.role === "admin" ? state.coaches : (state.coach ? [state.coach] : []);
  const search = el("input", { class: "search", placeholder: "Søk etter navn, e-post, coach eller arbeidsgiver" });
  const coachFilter = el("select", { class: "filter-select", "aria-label": "Filtrer på coach" }, [
    el("option", { value: "all", text: "Alle coacher" }),
    ...filterCoaches.map((coach) => el("option", { value: coach.id, text: coach.name || "Uten navn" }))
  ]);
  const statusFilter = el("select", { class: "filter-select", "aria-label": "Filtrer på status" }, [
    el("option", { value: "all", text: "Alle statuser" }),
    el("option", { value: "active", text: "Aktive" }),
    el("option", { value: "pending", text: "Ikke innlogget" }),
    el("option", { value: "sessions", text: "Har sesjoner" }),
    el("option", { value: "missing-plan", text: "Mangler plan" })
  ]);
  const results = el("div");
  const render = () => {
    const filtered = filterClients(visibleClients, search.value, coachFilter.value, statusFilter.value);
    results.replaceChildren(clientGrid(filtered));
  };
  search.addEventListener("input", render);
  coachFilter.addEventListener("change", render);
  statusFilter.addEventListener("change", render);
  content.replaceChildren(
    el("div", { class: "grid three summary-grid page-summary" }, [
      metric("Klienter", String(visibleClients.length), "users", state.profile.role === "admin" ? "Alle forløp i oversikt" : "Dine klientforløp"),
      metric("Aktive", String(active), "activity", "Har logget inn"),
      metric("Ikke innlogget", String(pending), "mail-warning", "Invitert, men ikke aktivert konto")
    ]),
    el("div", { class: "panel list-panel" }, [
      el("div", { class: "toolbar" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "Arbeidsflate" }), el("h3", { text: "Klientoversikt" })])
      ]),
      el("div", { class: "filter-row client-filter-row" }, [search, coachFilter, statusFilter]),
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
        el("span", { class: `badge ${client.consent_given ? "ok" : "warn"}`, text: client.consent_given ? "Aktiv" : "Ikke innlogget" }),
        el("span", { class: "badge", text: program?.sessionCount === 1 ? "1 sesjon" : `${program?.sessionCount || 0} sesjoner` }),
        el("span", { class: "badge", text: program?.start_date ? formatDate(program.start_date) : "Uten startdato" })
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
  const adminCoachFilter = el("select", { class: "filter-select", "aria-label": "Filtrer klienter på coach" }, [
    el("option", { value: "all", text: "Alle coacher" }),
    ...state.coaches.map((coach) => el("option", { value: coach.id, text: coach.name || "Uten navn" }))
  ]);
  const adminStatusFilter = el("select", { class: "filter-select", "aria-label": "Filtrer klienter på status" }, [
    el("option", { value: "all", text: "Alle statuser" }),
    el("option", { value: "active", text: "Aktive" }),
    el("option", { value: "pending", text: "Ikke innlogget" }),
    el("option", { value: "sessions", text: "Har sesjoner" }),
    el("option", { value: "missing-plan", text: "Mangler plan" })
  ]);
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
    const clients = filterClients(state.clients, clientSearch.value, adminCoachFilter.value, adminStatusFilter.value);
    clientTableSlot.replaceChildren(adminTable("Alle klienter", ["Navn", "Coach", "Status", "Tilgang", ""], clients.map((client) => [
      client.name || "-", coachNames(client) || "-", client.consent_given ? "Aktiv" : "Ikke innlogget",
      canOpenClient(client) ? "Kan åpnes" : "Kun oversikt",
      actionGroup([
        ["Åpne", () => openClientPlan(client), !canOpenClient(client)],
        ["Rediger", () => openClientEdit(client)],
        ["Slett", () => deleteClient(client)]
      ])
    ])));
  };
  coachSearch.addEventListener("input", renderCoaches);
  clientSearch.addEventListener("input", renderClientsTable);
  adminCoachFilter.addEventListener("change", renderClientsTable);
  adminStatusFilter.addEventListener("change", renderClientsTable);
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
      el("div", { class: "filter-row admin-filter-row" }, [clientSearch, adminCoachFilter, adminStatusFilter]),
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
  state.selectedClientId = client.id;
  const headerActions = [
    state.profile.role !== "client" ? button("Tilbake", "arrow-left", () => navigate("clients"), "ghost") : null,
    button("Book coachingtime", "calendar-plus", () => window.open("https://raederog.no/book-time", "_blank"), "ghost")
  ].filter(Boolean);
  setHeader("Klienter", client.name || "Klient", headerActions);
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
      directionWorkspace(client, plan)
    ]),
    el("section", { class: `workspace-pane ${activePane === "work" ? "active" : ""}`, "data-pane": "work" }, [
      workWorkspace(client, data, plan)
    ]),
    el("section", { class: `workspace-pane ${activePane === "sessions" ? "active" : ""}`, "data-pane": "sessions" }, [
      sessionsWorkspace(plan.sessions)
    ]),
    el("section", { class: `workspace-pane ${activePane === "reflections" ? "active" : ""}`, "data-pane": "reflections" }, [
      reflectionsWorkspace(data)
    ])
  ]);

  const editable = canEditProgram(client);
  if (editable) form.addEventListener("input", () => markDirty());
  const rail = planRail(client, plan, data);
  $("#content").replaceChildren(el("div", { class: "plan-layout" }, [form, rail]), ...(editable ? [saveStrip(true)] : []));
  if (!editable) setFormReadonly(form);
  setupWorkspaceTabs();
  refreshIcons();
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
    c_start: data.program.start_date || "",
    c_end: data.program.end_date || "",
    c_sessions: data.program.session_count || "",
    c_duration: data.program.session_duration || "",
    areas: data.areas.length ? data.areas.map((area) => ({
      title: area.title || "",
      description: area.description || ""
    })) : [{ title: "", description: "" }],
    sessions: data.sessions.map((session) => ({
      date: session.session_date || "",
      focus: session.focus || "",
      notes: session.insights || "",
      actions: session.decisions || "",
      reflection: session.client_notes || ""
    })).reverse(),
    eval_achieved: data.evaluation?.achieved || "",
    eval_reflection: data.evaluation?.reflection || "",
    eval_next: data.evaluation?.next_steps || ""
  };
}

function clientWorkspaceTabs(data, activePane = "direction") {
  const items = [
    ["direction", "Retning", data.program.purpose || data.program.success_criteria ? 1 : 0],
    ["work", "Arbeid", data.actions.filter((action) => action.status !== "done").length],
    ["sessions", "Samtaler", data.sessions.length],
    ["reflections", "Refleksjon", data.reflections.length]
  ];
  return el("div", { class: "workspace-tabs" }, items.map(([pane, label, count]) => el("button", {
    class: `workspace-tab ${pane === activePane ? "active" : ""}`,
    type: "button",
    "data-tab": pane
  }, [
    el("span", { text: label }),
    el("em", { text: String(count) })
  ])));
}

function setupWorkspaceTabs() {
  $$(".workspace-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
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
  return el("div", { class: "direction-stack" }, [
    el("section", { class: "panel document-panel" }, [
      el("div", { class: "workspace-head" }, [
        el("div", {}, [
          el("p", { class: "eyebrow", text: "Retning" }),
          el("h3", { text: "Hva skal dette coachingforløpet gjøre?" })
        ]),
        canEditProgram(client) ? button("Rediger retning", "pencil", () => editDirection(plan), "ghost") : null
      ].filter(Boolean)),
      el("div", { class: "document-list" }, [
        documentBlock("Arbeidshypotese", plan.c_purpose, "Hva er det viktigste du ønsker å bevege? Hva er ditt utviklingsmål?"),
        documentBlock("Tegn på bevegelse", plan.c_success, "Hvordan merker du at noe faktisk flytter seg?"),
        documentBlock("Samarbeid", plan.c_practical, "Hva gjør samarbeidet med coach nyttig? Hvordan ønsker du at vi jobber sammen?")
      ])
    ])
  ]);
}

function editDirection(plan) {
  openEntityModal("Rediger retning", "Retning", [
    textareaSpec("c_purpose", "Arbeidshypotese", plan.c_purpose || ""),
    textareaSpec("c_success", "Tegn på bevegelse", plan.c_success || ""),
    textareaSpec("c_practical", "Samarbeid", plan.c_practical || "")
  ], async (values) => {
    setPlanValue("c_purpose", values.c_purpose);
    setPlanValue("c_success", values.c_success);
    setPlanValue("c_practical", values.c_practical);
    markDirty();
    await savePlan();
    await reloadProgramAndRender("direction");
  });
}

function setPlanValue(name, value) {
  const control = $(`[name='${name}']`, $("#plan-form"));
  if (control) control.value = value || "";
}

function documentBlock(label, value, emptyText) {
  return el("article", { class: "document-block" }, [
    el("p", { class: "eyebrow", text: label }),
    el("p", { class: value ? "" : "muted", text: value || emptyText })
  ]);
}

function workWorkspace(client, data, plan) {
  const openActions = data.actions.filter((action) => action.status !== "done");
  const focusItems = plan.areas
    .map((area, index) => ({ area: normalizeArea(area), index }))
    .filter((item) => item.area.title || item.area.description);
  return el("div", { class: "work-stack" }, [
    el("section", { class: "panel document-panel" }, [
      el("div", { class: "workspace-head" }, [
        el("div", {}, [
          el("p", { class: "eyebrow", text: "Fokus" }),
          el("h3", { text: "Hva ønsker du å rette oppmerksomheten mot?" }),
          el("p", { class: "muted", text: "Dette er fokusområdene, eller utviklingsmålene, dine. De skal bevege deg i riktig retning, og kan justeres når hverdagen eller samtalene viser noe nytt." })
        ]),
        canEditProgram(client) ? button("Nytt fokus", "plus", () => addFocusArea(), "ghost") : null
      ].filter(Boolean)),
      focusItems.length ? focusList(focusItems) : emptyState("Ingen fokus ennå", "Legg inn ett fokus når dere har en tydelig bevegelse å undersøke."),
      areasEditor(plan.areas)
    ]),
    el("section", { class: "panel document-panel" }, [
      el("div", { class: "workspace-head" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "Eksperimenter" }), el("h3", { text: openActions.length ? `${openActions.length} aktive` : "Ingen aktive" })]),
        canEditProgram(client) ? button("Nytt eksperiment", "plus", () => createAction(data), "ghost") : null
      ].filter(Boolean)),
      actionList(data.actions)
    ])
  ]);
}

function focusList(items) {
  return el("div", { class: "focus-list" }, items.map(({ area, index }) => el("article", { class: "focus-row editable-row" }, [
    el("button", { class: "row-open", type: "button", onclick: () => editFocusArea(index) }, [
      el("span", { class: "row-index", text: String(index + 1).padStart(2, "0") }),
      el("span", { class: "row-main" }, [
        el("strong", { text: area.title || "Uten tittel" }),
        el("small", { text: area.description || "Klikk for å legge til beskrivelse" })
      ])
    ]),
    el("span", { class: "row-tools" }, [
      el("button", { class: "text-button", type: "button", onclick: () => editFocusArea(index), text: "Rediger" }),
      el("button", { class: "text-button danger-text", type: "button", onclick: () => deleteFocusArea(index), text: "Slett" })
    ])
  ])));
}

function emptyState(title, text) {
  return el("div", { class: "empty-inline" }, [
    el("strong", { text: title }),
    el("p", { class: "muted", text })
  ]);
}

function sessionsWorkspace(sessions) {
  return el("section", { class: "panel document-panel" }, [
    el("div", { class: "workspace-head" }, [
      el("div", {}, [
        el("p", { class: "eyebrow", text: "Samtaler" }),
        el("h3", { text: "Motoren i utvikling?" }),
        el("p", { class: "muted", text: "Hver samtale skal fange innsikt, merforståelse, valg og hva som skal prøves videre. Den kan kobles til fokusområdene dine, men trenger ikke." })
      ]),
      canEditProgram(getCurrentClient()) ? button("Ny samtale", "plus", () => addSession(), "ghost") : null
    ].filter(Boolean)),
    sessions.length ? sessionList(sessions) : emptyState("Ingen samtaler ennå", "Legg inn en samtale når dere vil samle innsikt og neste bevegelse."),
    sessionsEditor(sessions)
  ]);
}

function sessionList(sessions) {
  return el("div", { class: "focus-list session-list" }, sessions.map((session, index) => el("article", { class: "focus-row editable-row" }, [
    el("button", { class: "row-open", type: "button", onclick: () => editSession(index) }, [
      el("span", { class: "row-index", text: String(index + 1).padStart(2, "0") }),
      el("span", { class: "row-main" }, [
        el("strong", { text: session.focus || "Uten tittel" }),
        el("small", { text: [session.date && formatDate(session.date), session.notes || session.actions || "Klikk for å legge inn innsikt"].filter(Boolean).join(" · ") })
      ])
    ]),
    el("span", { class: "row-tools" }, [
      el("button", { class: "text-button", type: "button", onclick: () => editSession(index), text: "Rediger" }),
      el("button", { class: "text-button danger-text", type: "button", onclick: () => deleteSession(index), text: "Slett" })
    ])
  ])));
}

function areaPills(areas) {
  const items = areas.map(normalizeArea).filter((area) => area.title || area.description);
  if (!items.length) return el("p", { class: "muted", text: "Ingen områder satt ennå." });
  return el("div", { class: "area-pills" }, items.map((area, index) => el("span", { text: area.title || `Område ${index + 1}` })));
}

function section(title, description, iconName, children, open = false) {
  const body = el("div", { class: `section-body ${open ? "open" : ""}` }, children);
  return el("section", { class: "panel section-card" }, [
    el("button", { class: "section-toggle", type: "button", onclick: () => body.classList.toggle("open") }, [
      el("div", {}, [el("strong", { text: title }), el("span", { text: description })]),
      el("span", { class: "section-arrow", text: "⌄" })
    ]),
    body
  ]);
}

function field(name, label, value, type = "text") {
  const control = type === "textarea"
    ? el("textarea", { name, text: value })
    : el("input", { name, type, value });
  return el("label", { text: label }, [control]);
}

function areasEditor(areas) {
  const wrap = el("div", { class: "hidden-editor", id: "areas-editor" });
  const render = (items) => {
    wrap.replaceChildren(...items.map((area) => {
      const item = normalizeArea(area);
      return el("div", { "data-area": "" }, [
        el("input", { name: "area.title", value: item.title }),
        el("textarea", { name: "area.description", text: item.description })
      ]);
    }));
  };
  render(areas);
  return wrap;
}

function addFocusArea() {
  const next = [...getAreas().filter((area) => area.title || area.description), { title: "", description: "" }];
  setAreas(next);
  editFocusArea(next.length - 1);
}

function editFocusArea(index) {
  const areas = getAreas();
  const area = normalizeArea(areas[index]);
  openEntityModal(index >= areas.length || !(area.title || area.description) ? "Legg til fokus" : "Rediger fokus", "Arbeid", [
    inputSpec("title", "Kort tittel", "text", area.title, { maxlength: 64, placeholder: "Maks 6-8 ord" }),
    textareaSpec("description", "Beskrivelse", area.description, { placeholder: "Hva er bevegelsesønsket, og hvorfor er det viktig akkurat nå?" })
  ], async (values) => {
    const next = [...areas];
    next[index] = { title: values.title || "", description: values.description || "" };
    setAreas(next.filter((item) => item.title || item.description));
    markDirty();
    await savePlan();
    await reloadProgramAndRender("work");
  });
}

async function deleteFocusArea(index) {
  if (!confirmDelete("Slette dette fokuset?")) return;
  setAreas(getAreas().filter((_, itemIndex) => itemIndex !== index));
  markDirty();
  await savePlan();
  await reloadProgramAndRender("work");
}

function setAreas(values) {
  const editor = $("#areas-editor");
  if (!editor) return;
  editor.replaceChildren(...values.map((area) => {
    const item = normalizeArea(area);
    return el("div", { "data-area": "" }, [
      el("input", { name: "area.title", value: item.title }),
      el("textarea", { name: "area.description", text: item.description })
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
    el("input", { name: "session.date", value: session.date || "" }),
    el("textarea", { name: "session.focus", text: session.focus || "" }),
    el("textarea", { name: "session.notes", text: session.notes || "" }),
    el("textarea", { name: "session.actions", text: session.actions || "" }),
    el("textarea", { name: "session.reflection", text: session.reflection || "" })
  ]);
}

function addSession() {
  const sessions = getSessions();
  setSessions([...sessions, { date: new Date().toISOString().slice(0, 10), focus: "", notes: "", actions: "", reflection: "" }]);
  editSession(sessions.length);
}

function editSession(index) {
  const sessions = getSessions();
  const session = sessions[index] || { date: "", focus: "", notes: "", actions: "", reflection: "" };
  openEntityModal(index >= sessions.length ? "Ny samtale" : "Rediger samtale", "Samtaler", [
    inputSpec("date", "Dato", "date", session.date || ""),
    inputSpec("focus", "Tittel", "text", session.focus || "", { maxlength: 72, placeholder: "Kort navn på samtalen" }),
    textareaSpec("notes", "Ny innsikt", session.notes || ""),
    textareaSpec("actions", "Hva skal prøves videre?", session.actions || ""),
    textareaSpec("reflection", "Din take-away", session.reflection || "")
  ], async (values) => {
    const next = [...sessions];
    next[index] = {
      date: values.date || "",
      focus: values.focus || "",
      notes: values.notes || "",
      actions: values.actions || "",
      reflection: values.reflection || ""
    };
    setSessions(next.filter((item) => item.date || item.focus || item.notes || item.actions || item.reflection));
    markDirty();
    await savePlan();
    await reloadProgramAndRender("sessions");
  });
}

async function deleteSession(index) {
  if (!confirmDelete("Slette denne samtalen?")) return;
  setSessions(getSessions().filter((_, itemIndex) => itemIndex !== index));
  markDirty();
  await savePlan();
  await reloadProgramAndRender("sessions");
}

function setSessions(values) {
  const editor = $("#sessions-editor");
  if (!editor) return;
  editor.replaceChildren(...values.map((session, index) => sessionHiddenFields(session, index)));
}

function actionsPreview(actions) {
  if (!actions.length) return el("p", { class: "muted", text: "Ingen handlinger registrert ennå. I neste batch gjør vi dette til en egen, mer elegant arbeidsflate." });
  return el("div", { class: "compact-list" }, actions.slice(0, 5).map((action) => el("div", { class: "compact-item" }, [
    el("strong", { text: action.title || "Handling uten tittel" }),
    el("span", { text: action.status || "todo" })
  ])));
}

function actionList(actions) {
  if (!actions.length) return el("p", { class: "muted", text: "Ingen eksperimenter ennå." });
  return el("div", { class: "action-list" }, actions.map((action) => el("article", { class: `action-card ${action.status}` }, [
    el("div", {}, [
      el("strong", { text: action.title || "Handling uten tittel" }),
      action.description ? el("p", { class: "muted", text: action.description }) : el("p", { class: "muted", text: action.due_date ? `Frist ${formatDate(action.due_date)}` : "Uten frist" })
    ]),
    el("div", { class: "action-status" }, [
      statusButton(action, "todo", "Planlagt"),
      statusButton(action, "doing", "Testes"),
      statusButton(action, "done", "Lært")
    ])
  ])));
}

function statusButton(action, status, label) {
  return el("button", {
    class: `status-chip ${action.status === status ? "active" : ""}`,
    type: "button",
    onclick: () => updateActionStatus(action, status),
    text: label
  });
}

function reflectionsPreview(reflections) {
  if (!reflections.length) return el("p", { class: "muted", text: "Ingen refleksjoner ennå. Private refleksjoner forblir private i Supabase-policyene." });
  return el("div", { class: "compact-list" }, reflections.slice(0, 5).map((reflection) => el("div", { class: "compact-item" }, [
    el("strong", { text: reflection.prompt || (reflection.visibility === "private" ? "Privat refleksjon" : "Delt refleksjon") }),
    el("span", { text: reflection.visibility === "private" ? "Privat" : "Delt med coach" })
  ])));
}

function reflectionsWorkspace(data) {
  const canWriteReflection = state.profile.role === "client";
  return el("div", { class: "reflection-space" }, [
    canWriteReflection ? el("section", { class: "panel document-panel reflection-composer" }, [
      el("p", { class: "eyebrow", text: "Ny refleksjon" }),
      el("h3", { text: "Skriv for å forstå mer" }),
      el("p", { class: "muted reflection-helper", text: "Refleksjoner gjør erfaringer tydeligere. Noter hva du legger merke til, hva som flytter seg, eller hva du vil ta med inn i neste samtale." }),
      el("textarea", { id: "reflection-body", placeholder: "Skriv en kort refleksjon..." }),
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
    ]) : el("section", { class: "panel document-panel reflection-note" }, [
      el("p", { class: "eyebrow", text: "Refleksjon" }),
      el("h3", { text: "Dette er ditt rom når du er klient." }),
      el("p", { class: "muted", text: "Som coach ser du refleksjoner som er delt med deg. Private refleksjoner blir ikke synlige her." })
    ]),
    el("section", { class: "panel document-panel" }, [
      el("p", { class: "eyebrow", text: "Logg" }),
      reflectionsList(data.reflections)
    ])
  ].filter(Boolean));
}

function reflectionsList(reflections) {
  if (!reflections.length) return el("p", { class: "muted", text: "Ingen refleksjoner ennå." });
  return el("div", { class: "reflection-list" }, reflections.map((reflection) => el("article", { class: "reflection-card" }, [
    el("div", { class: "reflection-meta" }, [
      el("span", { text: reflection.visibility === "private" ? "Privat" : "Delt med coach" }),
      el("span", { text: formatDate(reflection.created_at) })
    ]),
    el("p", { text: reflection.body || "" }),
    reflection.created_by === state.user?.id ? el("div", { class: "row-actions inline-actions" }, [
      el("button", { class: "text-button danger-text", type: "button", onclick: () => deleteReflection(reflection.id), text: "Slett" })
    ]) : null
  ].filter(Boolean))));
}

function createAction(data) {
  openEntityModal("Nytt eksperiment", "Arbeid", [
    inputSpec("title", "Kort navn"),
    selectSpec("areaId", "Knytt til fokus", [["", "Fritt eksperiment"], ...data.areas.map((area) => [area.id, area.title || "Fokus"])], [], false),
    textareaSpec("situation", "Situasjon: hvor skal dette prøves?"),
    textareaSpec("response", "Hva skal du gjøre annerledes?"),
    textareaSpec("observe", "Hva skal du legge merke til?"),
    inputSpec("dueDate", "Når sjekker vi læringen?", "date")
  ], async (values) => {
    await state.sb.from("session_actions").insert({
      program_id: data.program.id,
      development_area_id: values.areaId || null,
      title: values.title,
      description: actionDescription(values),
      due_date: values.dueDate || null,
      status: "todo"
    });
    await reloadProgramAndRender("work");
  });
}

function actionDescription(values) {
  return [
    values.situation && `Situasjon: ${values.situation}`,
    values.response && `Prøve: ${values.response}`,
    values.observe && `Observere: ${values.observe}`
  ].filter(Boolean).join("\n\n") || null;
}

async function updateActionStatus(action, status) {
  await state.sb.from("session_actions").update({ status }).eq("id", action.id);
  await reloadProgramAndRender("work");
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
  if (!confirmDelete("Slette denne refleksjonen?")) return;
  const { error } = await state.sb.from("client_reflections").delete().eq("id", id);
  if (error) {
    alert("Kunne ikke slette refleksjonen.");
    return;
  }
  await reloadProgramAndRender("reflections");
}

async function reloadProgramAndRender(activePane = "direction") {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  if (client) delete state.programCache[client.id];
  await renderPlan(activePane);
}

function planRail(client, plan, data) {
  const areaCount = (plan.areas || []).map(normalizeArea).filter((area) => area.title || area.description).length;
  const checks = [
    ["Retning", Boolean(plan.c_purpose && plan.c_success)],
    ["Fokusområder", areaCount >= 2],
    ["Eksperimenter", (data.actions || []).length > 0],
    ["Samtaler", (plan.sessions || []).length > 0]
  ];
  return el("aside", { class: "plan-rail" }, [
    el("section", { class: "panel" }, [
      el("p", { class: "eyebrow", text: "Klient" }),
      el("h3", { text: client.name || "Uten navn" }),
      el("p", { class: "muted", text: [client.role, client.employer, coachNames(client)].filter(Boolean).join(" · ") })
    ]),
    el("section", { class: "panel" }, [
      el("p", { class: "eyebrow", text: "Fremdrift" }),
      el("div", { class: "progress-list" }, checks.map(([label, done]) => el("div", { class: "progress-item" }, [
        el("span", { text: label }),
        el("span", { class: `progress-dot ${done ? "done" : ""}` })
      ])))
    ]),
    el("section", { class: "panel" }, [
      el("p", { class: "eyebrow", text: "Status" }),
      el("h3", { text: statusLabel(data.program.status) }),
      el("p", { class: "muted", text: data.program.updated_at ? `Sist oppdatert ${formatDate(data.program.updated_at)}` : "Ikke oppdatert ennå" })
    ])
  ]);
}

function saveStrip(editable = true) {
  const items = [el("span", { class: "muted", id: "save-status", text: editable ? "Ingen endringer" : "Lesetilgang" })];
  if (editable) items.push(button("Lagre", "save", savePlan));
  return el("div", { class: "save-strip" }, items);
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
  const status = $("#save-status");
  if (status) status.textContent = "Ikke lagret";
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(savePlan, 1800);
}

async function savePlan() {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  if (!client || !$("#plan-form")) return;
  if (!canOpenClient(client)) return;
  const status = $("#save-status");
  if (status) status.textContent = "Lagrer...";
  const current = state.programCache[client.id] || await loadClientProgram(client);
  if (!current) {
    if (status) status.textContent = "Mangler programrad";
    return;
  }
  const plan = collectPlan();
  const { error: programError } = await state.sb.from("coaching_programs").update({
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
  }).eq("id", current.program.id);
  if (programError) {
    if (status) status.textContent = "Lagring feilet";
    return;
  }
  await replaceAreas(current.program.id, plan.areas);
  await replaceSessions(current.program.id, plan.sessions);
  await saveEvaluation(current.program.id, plan);
  delete state.programCache[client.id];
  await loadProgramSummaries();
  state.dirty = false;
  if (status) status.textContent = `Lagret ${new Date().toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`;
}

function collectPlan() {
  const form = $("#plan-form");
  const data = Object.fromEntries(new FormData(form).entries());
  const plan = {};
  planFields.forEach(([key]) => plan[key] = data[key] || "");
  ["c_start", "c_end", "c_sessions", "c_duration", "eval_achieved", "eval_reflection", "eval_next"].forEach((key) => plan[key] = data[key] || "");
  plan.areas = getAreas();
  plan.sessions = getSessions();
  return plan;
}

function getAreas() {
  return $$("#areas-editor [data-area]").map((card) => ({
    title: $("[name='area.title']", card).value.trim(),
    description: $("[name='area.description']", card).value.trim()
  }));
}

function normalizeArea(area) {
  if (!area) return { title: "", description: "" };
  if (typeof area === "string") return { title: area.trim(), description: "" };
  return {
    title: (area.title || "").trim(),
    description: (area.description || "").trim()
  };
}

function getSessions() {
  return $$("#sessions-editor [data-session]").map((card) => ({
    date: $("[name='session.date']", card).value,
    focus: $("[name='session.focus']", card).value,
    notes: $("[name='session.notes']", card).value,
    actions: $("[name='session.actions']", card).value,
    reflection: $("[name='session.reflection']", card).value
  })).reverse();
}

async function replaceAreas(programId, areas) {
  await state.sb.from("development_areas").delete().eq("program_id", programId);
  const rows = areas
    .map((area, index) => ({ ...normalizeArea(area), index }))
    .map((area) => ({ program_id: programId, title: area.title, description: area.description || null, sort_order: area.index }))
    .filter((row) => row.title || row.description);
  if (rows.length) await state.sb.from("development_areas").insert(rows);
}

async function replaceSessions(programId, sessions) {
  await state.sb.from("coaching_sessions").delete().eq("program_id", programId);
  const rows = sessions.map((session, index) => ({
    program_id: programId,
    session_number: index + 1,
    session_date: session.date || null,
    focus: session.focus || null,
    insights: session.notes || null,
    decisions: session.actions || null,
    client_notes: session.reflection || null
  })).filter((session) => session.session_date || session.focus || session.insights || session.decisions || session.client_notes);
  if (rows.length) await state.sb.from("coaching_sessions").insert(rows);
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
  await state.sb.from("program_evaluations").upsert(payload, { onConflict: "program_id" });
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
    await state.sb.from("coaches").update({ name: values.name, email: values.email }).eq("id", coach.id);
    if (coach.user_id) await state.sb.from("profiles").update({ name: values.name }).eq("id", coach.user_id);
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
    await state.sb.from("clients").update({ name: values.name, role: values.role, employer: values.employer, coach_ids: values.coachIds }).eq("id", client.id);
    await reloadAndRender();
  });
}

function openEntityModal(title, kicker, specs, onSave) {
  state.modal = { specs, onSave };
  $("#modal-title").textContent = title;
  $("#modal-kicker").textContent = kicker;
  $("#modal-message").textContent = "";
  $("#modal-fields").replaceChildren(...specs.map(renderSpec));
  $("#entity-modal").showModal();
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

function renderSpec(spec) {
  if (spec.kind === "select") {
    const select = el("select", { name: spec.name, multiple: spec.multiple });
    spec.options.forEach(([value, label]) => {
      const selected = Array.isArray(spec.value) ? spec.value.includes(value) : spec.value === value;
      select.append(el("option", { value, text: label, selected }));
    });
    return el("label", { text: spec.label }, [select]);
  }
  if (spec.kind === "textarea") {
    return el("label", { text: spec.label }, [el("textarea", { name: spec.name, text: spec.value, ...(spec.attrs || {}) })]);
  }
  return el("label", { text: spec.label }, [el("input", { name: spec.name, type: spec.type, value: spec.value, required: spec.name === "name" || spec.name === "email", ...(spec.attrs || {}) })]);
}

$("#entity-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") {
    $("#entity-modal").close();
    return;
  }
  const values = {};
  state.modal.specs.forEach((spec) => {
    const control = $(`[name='${spec.name}']`, $("#entity-form"));
    values[spec.name] = spec.multiple ? Array.from(control.selectedOptions).map((option) => option.value) : control.value.trim();
  });
  try {
    $("#modal-message").textContent = "Lagrer...";
    await state.modal.onSave(values);
    $("#entity-modal").close();
  } catch (error) {
    $("#modal-message").textContent = error.message || "Kunne ikke lagre.";
  }
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
  if (!confirm(`Slett coach "${coach.name}"? Klientenes planer beholdes.`)) return;
  await state.sb.from("coaches").delete().eq("id", coach.id);
  if (coach.user_id) await state.sb.from("profiles").delete().eq("id", coach.user_id);
  await reloadAndRender();
}

async function deleteClient(client) {
  if (!confirm(`Slett klient "${client.name}"? All plandata slettes permanent i dagens datamodell.`)) return;
  await state.sb.from("clients").delete().eq("id", client.id);
  if (client.user_id) await state.sb.from("profiles").delete().eq("id", client.user_id);
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
  if (state.profile.role === "client") return client.user_id === state.user?.id;
  const coachId = state.coach?.id;
  return Boolean(coachId && (client.coach_ids || []).includes(coachId));
}

function getCurrentClient() {
  return state.clients.find((item) => item.id === state.selectedClientId) || state.client;
}

function filterClients(clients, query, coachId = "all", status = "all") {
  const q = query.trim().toLowerCase();
  return clients.filter((client) => {
    const program = state.programSummaries[client.id];
    const matchesQuery = !q || [client.name, client.email, client.role, client.employer, coachNames(client)].filter(Boolean).join(" ").toLowerCase().includes(q);
    const matchesCoach = coachId === "all" || (client.coach_ids || []).includes(coachId);
    const matchesStatus =
      status === "all" ||
      (status === "active" && client.consent_given) ||
      (status === "pending" && !client.consent_given) ||
      (status === "sessions" && (program?.sessionCount || 0) > 0) ||
      (status === "missing-plan" && !hasProgramContent(program));
    return matchesQuery && matchesCoach && matchesStatus;
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

function greeting() {
  const first = (state.profile.name || "").split(" ")[0] || "hei";
  if (state.profile.role === "client") return `Hei, ${first}`;
  if (state.profile.role === "admin") return "Administrativ oversikt";
  return `Hei, ${first}`;
}

function roleLabel(role) {
  return { admin: "Admin", coach: "Coach", client: "Klient" }[role] || role;
}

function statusLabel(status) {
  return { draft: "Utkast", active: "Aktivt forløp", completed: "Fullført", archived: "Arkivert" }[status] || "Utkast";
}

function confirmDelete(message) {
  return window.confirm(message);
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("no-NO", { day: "numeric", month: "short", year: "numeric" });
}

init();
