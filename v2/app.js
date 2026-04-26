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
  view: "clients",
  selectedClientId: null,
  dirty: false,
  saveTimer: null,
  modal: null
};

const planFields = [
  ["c_purpose", "Hva ønsker du å oppnå gjennom dette coachingforløpet?", "textarea"],
  ["c_success", "Hvordan vil du vite at coachingen har virket?", "textarea"],
  ["c_expect_coach", "Hva forventer du av coach?", "textarea"],
  ["c_expect_client", "Hva kan coach forvente av deg?", "textarea"],
  ["c_confidentiality", "Konfidensialitet: hva deles, med hvem og hvordan?", "textarea"],
  ["c_practical", "Praktiske rammer", "textarea"]
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
  state.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  bindAuth();
  const hash = window.location.hash || "";
  const isPasswordFlow = hash.includes("type=invite") || hash.includes("type=recovery");
  const { data: { session } } = await state.sb.auth.getSession();
  if (session && isPasswordFlow) {
    state.user = session.user;
    setScreen("password");
  } else if (session) {
    state.user = session.user;
    await bootstrapApp();
  } else {
    setScreen("login");
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
}

function renderShell() {
  $("#user-name").textContent = state.user.email || state.profile.name || "Bruker";
  const nav = [
    ["clients", state.profile.role === "client" ? "file-text" : "users", state.profile.role === "client" ? "Min plan" : "Klienter"],
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
  setHeader("Executive Coaching Studio", "Klienter", [button("Inviter klient", "user-plus", () => openClientInvite())]);
  const content = $("#content");
  const visibleClients = getVisibleClients();
  const active = visibleClients.filter((client) => client.consent_given).length;
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
    el("div", { class: "grid three summary-grid" }, [
      metric("Klienter", String(visibleClients.length), "users", state.profile.role === "admin" ? "Alle forløp i oversikt" : "Dine klientforløp"),
      metric("Aktive", String(active), "activity", "Har logget inn"),
      metric("Sesjoner", String(visibleClients.reduce((sum, client) => sum + ((client.plan?.sessions || []).length), 0)), "calendar-check", "Registrert i planer")
    ]),
    el("div", { class: "panel list-panel" }, [
      el("div", { class: "toolbar filters" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "Arbeidsflate" }), el("h3", { text: "Klientoversikt" })]),
        el("div", { class: "filter-row" }, [search, coachFilter, statusFilter])
      ]),
      results
    ])
  );
  render();
}

function clientGrid(clients) {
  if (!clients.length) return el("p", { class: "muted", text: "Ingen klienter å vise ennå." });
  return el("div", { class: "grid three" }, clients.map((client) => {
    const plan = client.plan || {};
    const sessions = plan.sessions || [];
    const canOpen = canOpenClient(client);
    return el("button", {
      class: `card client-card ${canOpen ? "" : "is-locked"}`,
      disabled: !canOpen,
      title: canOpen ? "Åpne utviklingsplan" : "Kun oversikt. Du er ikke coach for denne klienten.",
      onclick: () => openClientPlan(client)
    }, [
      el("p", { class: "eyebrow", text: client.employer || "Klient" }),
      el("h3", { text: client.name || "Uten navn" }),
      el("p", { class: "muted", text: [client.role, coachNames(client)].filter(Boolean).join(" · ") || client.email || "" }),
      el("div", { class: "meta-row" }, [
        el("span", { class: `badge ${client.consent_given ? "ok" : "warn"}`, text: client.consent_given ? "Aktiv" : "Ikke innlogget" }),
        !canOpen ? el("span", { class: "badge lock", text: "Kun oversikt" }) : el("span", { class: "badge", text: "Åpne plan" }),
        el("span", { class: "badge", text: sessions.length === 1 ? "1 sesjon" : `${sessions.length} sesjoner` }),
        el("span", { class: "badge", text: plan.c_start ? formatDate(plan.c_start) : "Uten startdato" })
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
    coachTableSlot.replaceChildren(adminTable("Coacher", ["Navn", "E-post", "Klienter", ""], coaches.map((coach) => [
      coach.name || "-", coach.email || "-", String(state.clients.filter((client) => (client.coach_ids || []).includes(coach.id)).length),
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
      el("div", { class: "toolbar filters" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "Team" }), el("h3", { text: "Coacher" })]),
        el("div", { class: "filter-row" }, [coachSearch])
      ]),
      coachTableSlot
    ]),
    el("section", { class: "panel list-panel" }, [
      el("div", { class: "toolbar filters" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "Tilgang" }), el("h3", { text: "Klienter" })]),
        el("div", { class: "filter-row" }, [clientSearch, adminCoachFilter, adminStatusFilter])
      ]),
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

function renderPlan() {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  if (!client) {
    setHeader("Plan", "Ingen klient funnet");
    $("#content").replaceChildren(el("p", { class: "muted", text: "Fant ikke klientdata for denne brukeren." }));
    return;
  }
  if (!canOpenClient(client)) {
    setHeader("Utviklingsplan", "Kun oversikt");
    $("#content").replaceChildren(el("section", { class: "panel empty-state" }, [
      el("p", { class: "eyebrow", text: "Tilgang" }),
      el("h3", { text: "Du kan se klienten i oversikt, men ikke åpne planen." }),
      el("p", { class: "muted", text: "Adminrollen viser alle klienter, men planinnsyn er begrenset til klienter der du selv er registrert som coach." }),
      button("Tilbake til klienter", "arrow-left", () => navigate("clients"), "ghost")
    ]));
    return;
  }
  state.selectedClientId = client.id;
  setHeader("Utviklingsplan", client.name || "Klient", [
    button("Tilbake", "arrow-left", () => navigate(state.profile.role === "admin" ? "admin" : "clients"), "ghost"),
    button("Book time", "calendar-plus", () => window.open("https://raederog.no/book-time", "_blank"))
  ]);
  const plan = structuredClone(client.plan || {});
  plan.areas = Array.isArray(plan.areas) && plan.areas.length ? plan.areas : ["", ""];
  plan.sessions = Array.isArray(plan.sessions) ? plan.sessions : [];

  const form = el("form", { class: "grid", id: "plan-form" }, [
    section("Contracting", "Avtalen og rammene for forløpet", "file-pen-line", [
      ...planFields.map(([key, label, type]) => field(key, label, plan[key] || "", type)),
      el("div", { class: "field-pair" }, [
        field("c_start", "Startdato", plan.c_start || "", "date"),
        field("c_end", "Sluttdato", plan.c_end || "", "date")
      ]),
      el("div", { class: "field-pair" }, [
        field("c_sessions", "Antall sesjoner", plan.c_sessions || "", "number"),
        field("c_duration", "Sesjonsvarighet", plan.c_duration || "", "text")
      ])
    ], true),
    section("Utviklingsområder", "Velg 2 til 4 områder som gir retning", "target", [areasEditor(plan.areas)], true),
    section("Sesjoner", "Notater, handlinger og refleksjoner", "calendar-days", [sessionsEditor(plan.sessions)], true),
    section("Evaluering", "Avslutning og læring videre", "sparkles", [
      field("eval_achieved", "Hva har du oppnådd?", plan.eval_achieved || "", "textarea"),
      field("eval_reflection", "Din egen vurdering av forløpet", plan.eval_reflection || "", "textarea"),
      field("eval_next", "Hva tar du med deg videre?", plan.eval_next || "", "textarea")
    ])
  ]);

  form.addEventListener("input", () => markDirty());
  const rail = planRail(client, plan);
  $("#content").replaceChildren(el("div", { class: "plan-layout" }, [form, rail]), saveStrip());
  refreshIcons();
}

function section(title, description, iconName, children, open = false) {
  const body = el("div", { class: `section-body ${open ? "open" : ""}` }, children);
  return el("section", { class: "panel section-card" }, [
    el("button", { class: "section-toggle", type: "button", onclick: () => body.classList.toggle("open") }, [
      el("div", {}, [el("strong", { text: title }), el("span", { text: description })]),
      icon(iconName)
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
  const wrap = el("div", { class: "grid", id: "areas-editor" });
  const render = (items) => {
    wrap.replaceChildren(...items.map((value, index) => el("div", { class: "area-row" }, [
      el("div", { class: "area-number", text: String(index + 1) }),
      el("textarea", { name: "area", text: value, placeholder: `Utviklingsområde ${index + 1}` }),
      el("button", { class: "icon-button", type: "button", title: "Fjern område", onclick: () => {
        const next = getAreas().filter((_, areaIndex) => areaIndex !== index);
        render(next.length ? next : [""]);
        markDirty();
      } }, [icon("trash-2")])
    ])), el("button", { class: "button ghost", type: "button", onclick: () => {
      const next = getAreas();
      if (next.length < 5) render([...next, ""]);
      markDirty();
      refreshIcons();
    } }, [icon("plus"), el("span", { text: "Legg til område" })]));
    refreshIcons();
  };
  render(areas);
  return wrap;
}

function sessionsEditor(sessions) {
  const wrap = el("div", { class: "grid", id: "sessions-editor" });
  const render = (items) => {
    wrap.replaceChildren(
      el("button", { class: "button ghost", type: "button", onclick: () => {
        render([...getSessions(), { date: new Date().toISOString().slice(0, 10), focus: "", notes: "", actions: "", reflection: "" }]);
        markDirty();
      } }, [icon("plus"), el("span", { text: "Ny sesjon" })]),
      ...(items.length ? [...items].map((session, index) => sessionCard(session, index)).reverse() : [el("p", { class: "muted", text: "Ingen sesjoner ennå." })])
    );
    refreshIcons();
  };
  render(sessions);
  return wrap;
}

function sessionCard(session, index) {
  return el("div", { class: "panel session-card", "data-session": String(index) }, [
    el("div", { class: "session-head" }, [
      el("div", {}, [el("p", { class: "eyebrow", text: `Sesjon ${index + 1}` }), el("h3", { text: session.date ? formatDate(session.date) : "Dato ikke satt" })]),
      el("button", { class: "icon-button", type: "button", title: "Slett sesjon", onclick: () => {
        const next = getSessions().filter((_, sessionIndex) => sessionIndex !== index);
        $("#sessions-editor").replaceWith(sessionsEditor(next));
        markDirty();
      } }, [icon("trash-2")])
    ]),
    field("session.date", "Dato", session.date || "", "date"),
    field("session.focus", "Fokus for sesjonen", session.focus || "", "textarea"),
    field("session.notes", "Notater og refleksjoner fra sesjonen", session.notes || "", "textarea"),
    field("session.actions", "Handlingsplan før neste sesjon", session.actions || "", "textarea"),
    field("session.reflection", "Klientens refleksjonslogg", session.reflection || "", "textarea")
  ]);
}

function planRail(client, plan) {
  const checks = [
    ["Contracting", Boolean(plan.c_purpose && plan.c_success)],
    ["Utviklingsområder", (plan.areas || []).filter(Boolean).length >= 2],
    ["Sesjoner", (plan.sessions || []).length > 0],
    ["Evaluering", Boolean(plan.eval_achieved || plan.eval_reflection)]
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
    ])
  ]);
}

function saveStrip() {
  return el("div", { class: "save-strip" }, [
    el("span", { class: "muted", id: "save-status", text: "Ingen endringer" }),
    button("Lagre", "save", savePlan)
  ]);
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
  const plan = collectPlan();
  const { error } = await state.sb.from("clients").update({ plan, last_saved: new Date().toISOString() }).eq("id", client.id);
  if (error) {
    if (status) status.textContent = "Lagring feilet";
    return;
  }
  client.plan = plan;
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
  return $$("[name='area']").map((area) => area.value);
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
  openEntityModal("Rediger coach", "Team", [inputSpec("name", "Navn", "text", coach.name || "")], async (values) => {
    await state.sb.from("coaches").update({ name: values.name }).eq("id", coach.id);
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

function inputSpec(name, label, type = "text", value = "") {
  return { kind: "input", name, label, type, value };
}

function selectSpec(name, label, options, value = [], multiple = false) {
  return { kind: "select", name, label, options, value, multiple };
}

function renderSpec(spec) {
  if (spec.kind === "select") {
    const select = el("select", { name: spec.name, multiple: spec.multiple });
    spec.options.forEach(([value, label]) => {
      select.append(el("option", { value, text: label, selected: spec.value.includes(value) }));
    });
    return el("label", { text: spec.label }, [select]);
  }
  return el("label", { text: spec.label }, [el("input", { name: spec.name, type: spec.type, value: spec.value, required: spec.name === "name" || spec.name === "email" })]);
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

function filterClients(clients, query, coachId = "all", status = "all") {
  const q = query.trim().toLowerCase();
  return clients.filter((client) => {
    const plan = client.plan || {};
    const sessions = plan.sessions || [];
    const matchesQuery = !q || [client.name, client.email, client.role, client.employer, coachNames(client)].filter(Boolean).join(" ").toLowerCase().includes(q);
    const matchesCoach = coachId === "all" || (client.coach_ids || []).includes(coachId);
    const matchesStatus =
      status === "all" ||
      (status === "active" && client.consent_given) ||
      (status === "pending" && !client.consent_given) ||
      (status === "sessions" && sessions.length > 0) ||
      (status === "missing-plan" && !hasPlanContent(plan));
    return matchesQuery && matchesCoach && matchesStatus;
  });
}

function hasPlanContent(plan) {
  return Boolean(
    plan.c_purpose ||
    plan.c_success ||
    plan.c_start ||
    (plan.areas || []).some(Boolean) ||
    (plan.sessions || []).length
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

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("no-NO", { day: "numeric", month: "short", year: "numeric" });
}

init();
