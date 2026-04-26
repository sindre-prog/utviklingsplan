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
  view: "dashboard",
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
  $("#mobile-menu").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
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
  navigate("dashboard");
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
  const [{ data: coaches }, { data: clients }] = await Promise.all([
    state.sb.from("coaches").select("*").order("name"),
    state.profile.role === "client"
      ? Promise.resolve({ data: state.client ? [state.client] : [] })
      : state.sb.from("clients").select("*").order("name")
  ]);
  state.coaches = coaches || [];
  state.clients = clients || [];
}

function renderShell() {
  $("#user-name").textContent = state.profile.name || state.user.email || "Bruker";
  $("#user-role").textContent = roleLabel(state.profile.role);
  const nav = [
    ["dashboard", "layout-dashboard", "Dashboard"],
    ["clients", "users", state.profile.role === "client" ? "Min plan" : "Klienter"],
    state.profile.role === "admin" && ["admin", "shield-check", "Administrasjon"]
  ].filter(Boolean);
  const navList = $("#nav-list");
  navList.replaceChildren(...nav.map(([view, iconName, label]) => {
    return el("button", { class: "button nav-item", "data-view": view, onclick: () => navigate(view) }, [icon(iconName), el("span", { text: label })]);
  }));
  refreshIcons();
}

function navigate(view, clientId = null) {
  state.view = view;
  if (clientId) state.selectedClientId = clientId;
  $(".sidebar").classList.remove("open");
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view || (view === "plan" && item.dataset.view === "clients")));
  const routes = {
    dashboard: renderDashboard,
    clients: renderClients,
    plan: renderPlan,
    admin: renderAdmin
  };
  routes[view]();
  refreshIcons();
}

function navText(view) {
  return { dashboard: "Dashboard", clients: state.profile.role === "client" ? "Min plan" : "Klienter", admin: "Administrasjon" }[view] || "";
}

function setHeader(kicker, title, actions = []) {
  $("#view-kicker").textContent = kicker;
  $("#view-title").textContent = title;
  $("#topline-actions").replaceChildren(...actions);
}

function renderDashboard() {
  const myClients = getVisibleClients();
  const active = myClients.filter((client) => client.consent_given).length;
  setHeader("Oversikt", greeting(), [
    state.profile.role !== "client" ? button("Inviter klient", "user-plus", () => openClientInvite()) : button("Åpne plan", "file-text", () => navigate("plan", state.client?.id))
  ]);
  const content = $("#content");
  content.replaceChildren(
    el("div", { class: "grid three" }, [
      metric("Klienter", String(myClients.length), "users", "Synlige klientforløp"),
      metric("Aktive", String(active), "activity", "Har logget inn"),
      metric("Sesjoner", String(myClients.reduce((sum, client) => sum + ((client.plan?.sessions || []).length), 0)), "calendar-check", "Registrert i planer")
    ]),
    el("div", { class: "panel", style: "margin-top:16px" }, [
      el("div", { class: "toolbar" }, [
        el("div", {}, [el("p", { class: "eyebrow", text: "Neste fokus" }), el("h3", { text: "Klienter som trenger oppfølging" })]),
        button("Se alle", "arrow-right", () => navigate(state.profile.role === "client" ? "plan" : "clients"), "ghost")
      ]),
      clientGrid(myClients.slice(0, 6))
    ])
  );
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
  setHeader("Arbeidsflate", "Klienter", [button("Inviter klient", "user-plus", () => openClientInvite())]);
  const content = $("#content");
  const search = el("input", { class: "search", placeholder: "Søk etter navn, e-post eller arbeidsgiver" });
  const results = el("div");
  const render = () => results.replaceChildren(clientGrid(filterClients(getVisibleClients(), search.value)));
  search.addEventListener("input", render);
  content.replaceChildren(el("div", { class: "toolbar" }, [search]), results);
  render();
}

function clientGrid(clients) {
  if (!clients.length) return el("p", { class: "muted", text: "Ingen klienter å vise ennå." });
  return el("div", { class: "grid three" }, clients.map((client) => {
    const plan = client.plan || {};
    const sessions = plan.sessions || [];
    return el("button", { class: "card", onclick: () => navigate("plan", client.id) }, [
      el("p", { class: "eyebrow", text: client.employer || "Klient" }),
      el("h3", { text: client.name || "Uten navn" }),
      el("p", { class: "muted", text: [client.role, coachNames(client)].filter(Boolean).join(" · ") || client.email || "" }),
      el("div", { class: "meta-row" }, [
        el("span", { class: `badge ${client.consent_given ? "ok" : "warn"}`, text: client.consent_given ? "Aktiv" : "Ikke innlogget" }),
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
  $("#content").replaceChildren(
    adminTable("Coacher", ["Navn", "E-post", "Klienter", ""], state.coaches.map((coach) => [
      coach.name || "-", coach.email || "-", String(state.clients.filter((client) => (client.coach_ids || []).includes(coach.id)).length),
      actionGroup([["Rediger", () => openCoachEdit(coach)], ["Slett", () => deleteCoach(coach)]])
    ])),
    adminTable("Alle klienter", ["Navn", "Coach", "Status", ""], state.clients.map((client) => [
      client.name || "-", coachNames(client) || "-", client.consent_given ? "Aktiv" : "Ikke innlogget",
      actionGroup([["Åpne", () => navigate("plan", client.id)], ["Rediger", () => openClientEdit(client)], ["Slett", () => deleteClient(client)]])
    ]))
  );
}

function adminTable(title, headers, rows) {
  return el("section", { class: "panel", style: "margin-bottom:18px" }, [
    el("div", { class: "toolbar" }, [el("h3", { text: title })]),
    el("div", { class: "table-wrap" }, [
      el("table", {}, [
        el("thead", {}, [el("tr", {}, headers.map((head) => el("th", { text: head })))]),
        el("tbody", {}, rows.length ? rows.map((row) => el("tr", {}, row.map((cell) => {
          const td = el("td");
          if (cell instanceof Node) td.append(cell);
          else td.textContent = cell;
          return td;
        }))) : [el("tr", {}, [el("td", { text: "Ingen rader ennå.", colspan: String(headers.length) })])])
      ])
    ])
  ]);
}

function actionGroup(actions) {
  return el("div", { class: "row-actions" }, actions.map(([label, handler]) => {
    return el("button", { class: "button ghost", onclick: handler, text: label });
  }));
}

function renderPlan() {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  if (!client) {
    setHeader("Plan", "Ingen klient funnet");
    $("#content").replaceChildren(el("p", { class: "muted", text: "Fant ikke klientdata for denne brukeren." }));
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

function filterClients(clients, query) {
  const q = query.trim().toLowerCase();
  if (!q) return clients;
  return clients.filter((client) => [client.name, client.email, client.role, client.employer, coachNames(client)].filter(Boolean).join(" ").toLowerCase().includes(q));
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
