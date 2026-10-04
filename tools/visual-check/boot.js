// Skjermbildesett for portalen. Laster index.html og app.js uten init(), fyller state med
// fiktive data og erstatter Supabase med en frakoblet stub, slik at ingenting kan leses fra
// eller skrives til databasen.

const params = new URLSearchParams(location.search);
const scene = params.get("scene") || "now-complete";
const role = params.get("role") || "client";

const CATEGORIES = {
  foundation: "Grunnkompetanser",
  self_capacity: "Selvledelse og kapasitet",
  relationships_influence: "Relasjoner og påvirkning",
  team_people: "Team og medarbeidere",
  execution_decisions: "Beslutninger, problemløsning og innovasjon",
  strategy_business_change: "Strategi, virksomhet og endring",
  derailer: "Mulige avsporere"
};

function offlineSupabase() {
  const result = { data: null, error: { message: "Skjermbildesettet er ikke koblet til databasen." } };
  const chain = new Proxy(function offline() {}, {
    get(_target, prop) {
      if (prop === "then") return (resolve) => resolve(result);
      return chain;
    },
    apply() {
      return chain;
    }
  });
  return chain;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadStylesheet(link) {
  return new Promise((resolve) => {
    const clone = document.createElement("link");
    clone.rel = "stylesheet";
    clone.href = link.getAttribute("href");
    clone.onload = resolve;
    clone.onerror = resolve;
    document.head.appendChild(clone);
  });
}

async function loadPortal() {
  const html = await fetch("index.html", { cache: "no-store" }).then((response) => response.text());
  const portal = new DOMParser().parseFromString(html, "text/html");

  portal.head.querySelectorAll('link[rel="preconnect"]').forEach((link) => document.head.appendChild(link.cloneNode()));
  await Promise.all([...portal.head.querySelectorAll('link[rel="stylesheet"]')].map(loadStylesheet));

  const scripts = [...portal.querySelectorAll("script")];
  const lucide = scripts.find((script) => script.src.includes("lucide"));
  if (lucide) await loadScript(lucide.getAttribute("src"));

  [...portal.body.children]
    .filter((node) => node.tagName !== "SCRIPT")
    .forEach((node) => document.body.appendChild(document.importNode(node, true)));

  scripts
    .filter((script) => script.type === "module" && !script.src)
    .forEach((script) => {
      const module = document.createElement("script");
      module.type = "module";
      module.textContent = script.textContent;
      document.head.appendChild(module);
    });

  const appSrc = scripts.find((script) => /(^|\/)app\.js/.test(script.getAttribute("src") || ""))?.getAttribute("src") || "./app.js";
  const source = await fetch(appSrc, { cache: "no-store" }).then((response) => response.text());
  const app = document.createElement("script");
  app.textContent = source.replace(/\ninit\(\);\s*$/, "\n");
  document.body.appendChild(app);

  const started = Date.now();
  while (!window.RaederResourceLibrary?.getResourceFileUrl && Date.now() - started < 5000) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

function mapCompetency(item) {
  return {
    id: item.slug,
    title: item.name_no,
    title_en: item.name_en,
    summary: item.definition,
    category: item.category,
    categoryLabel: CATEGORIES[item.category] || item.category,
    content: {
      choose_when: item.relevant_when,
      relevant_when: item.relevant_when,
      distinction: item.distinction,
      best_practice: item.best_practice,
      barriers: item.barriers,
      practice: item.practice,
      reflection: item.reflection || []
    }
  };
}

function programCompetency(competency, status, priority, fields = {}) {
  return {
    id: `pc-${competency.id}`,
    competency_id: competency.id,
    status,
    priority,
    title: competency.title,
    summary: competency.summary,
    categoryLabel: competency.categoryLabel,
    competency,
    why_now: "",
    desired_behavior: "",
    current_pattern: "",
    obstacles: "",
    ...fields
  };
}

function visualResourceFileUrl(_sb, path) {
  const value = String(path || "");
  if (value.includes("control-circle") || value.endsWith(".svg")) {
    return "/tools/visual-check/media/kontrollsirkelen.svg";
  }
  return value;
}

function applyVisualResourceLibrary(library = window.RaederResourceLibrary) {
  if (!library) return null;
  window.RaederResourceLibrary = {
    ...library,
    getResourceFileUrl: visualResourceFileUrl
  };
  return window.RaederResourceLibrary;
}

function daysFromNow(days) {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

// Klientene til coachen «Ola Coach» (coach1), pluss én klient som bare admin ser.
function coachClients(client) {
  return {
    coaches: [
      { id: "coach1", name: "Ola Coach", email: "ola@example.com", user_id: "u-coach" },
      { id: "coach2", name: "Siri Coach", email: "siri@example.com", user_id: null }
    ],
    clients: [
      { ...client, email: "kari@example.com", role: "Direktør", employer: "Eksempel AS", created_at: "2026-08-01" },
      { id: "c2", name: "Per Hansen", email: "per@example.com", role: "Avdelingsleder", employer: "Nordlys AS", user_id: "u2", consent_given: true, consent_date: "2026-08-12", account_activated_at: "2026-08-12", coach_ids: ["coach1"], created_at: "2026-08-10" },
      { id: "c3", name: "Ingrid Berg", email: "ingrid@example.com", role: "Teamleder", employer: "Eksempel AS", user_id: null, consent_given: false, consent_date: null, account_activated_at: null, coach_ids: ["coach1"], created_at: "2026-09-28" },
      { id: "c4", name: "Ahmed Ali", email: "ahmed@example.com", role: "Produktsjef", employer: "Havn AS", user_id: "u4", consent_given: false, consent_date: null, account_activated_at: "2026-09-20", coach_ids: ["coach1"], created_at: "2026-09-18" },
      { id: "c5", name: "Lise Moe", email: "lise@example.com", role: "Daglig leder", employer: "Fjell AS", user_id: "u5", consent_given: true, consent_date: "2026-07-01", account_activated_at: "2026-07-01", coach_ids: ["coach2"], created_at: "2026-06-30" }
    ],
    summaries: {
      c1: { id: "p1", purpose: "Bli en tydeligere leder.", sessionCount: 3, areaCount: 1, nextSessionDate: daysFromNow(9).slice(0, 10), lastActivityAt: daysFromNow(-1), lastActivityLabel: "Refleksjon delt" },
      c2: { id: "p2", purpose: "Lede gjennom omstilling.", sessionCount: 1, areaCount: 1, nextSessionDate: null, lastActivityAt: daysFromNow(-6), lastActivityLabel: "Eksperiment endret" },
      c4: { id: "p4", purpose: "", sessionCount: 0, areaCount: 0, nextSessionDate: null },
      c5: { id: "p5", purpose: "Bygge en ny ledergruppe.", sessionCount: 4, areaCount: 2, nextSessionDate: daysFromNow(3).slice(0, 10), lastActivityAt: daysFromNow(-3), lastActivityLabel: "Samtalenotat endret" }
    }
  };
}

// Innhold fra docs/RESOURCE_LIBRARY_PILOT_CONTENT.md, forkortet.
function libraryResources(sharedResource) {
  const control = sharedResource.resource;
  return [
    {
      id: "res1", slug: "kontrollsirkelen", status: "published", type: "framework", phase: "focus", visibility: "client_assignable",
      tags: ["area:self_capacity", "stress", "prioritering"],
      default_context_types: ["focus_area", "reflection", "experiment"], ...control,
      summary: "Et refleksjonsverktøy for å skille mellom det du kan kontrollere, påvirke og ikke kontrollere.",
      intended_outcome: "Hjelpe klienten å redusere unødvendig mentalt stress ved å tydeliggjøre hvor innsats faktisk har effekt.",
      best_used_when: ["klient føler lav kontroll", "stress og overbelastning", "organisatorisk usikkerhet"],
      not_for: ["situasjoner som krever akutt problemløsning"],
      coach_guidance: "Vær oppmerksom på om klienten bruker modellen til å trekke seg unna ansvar eller vanskelige samtaler. Målet er ikke passivitet, men å flytte energi mot områder med faktisk påvirkningsmulighet.",
      updated_at: daysFromNow(-2)
    },
    {
      id: "res2", slug: "abcde-modellen", status: "published", type: "framework", phase: "reflection", visibility: "client_assignable", estimated_duration: 20,
      tags: ["area:self_capacity", "stress", "refleksjon"], title: "ABCDE-modellen",
      client_intro: "Vi reagerer sjelden bare på det som skjer rundt oss. Vi reagerer også på hvordan vi fortolker det som skjer. Denne modellen hjelper deg å utforske hvordan tanker påvirker følelser, handlinger og stressnivå.",
      intended_outcome: "Hjelpe klienten å identifisere automatiske tankemønstre og utvikle mer fleksible og konstruktive perspektiver.",
      best_used_when: ["klient grubler mye etter situasjoner", "sterk selvkritikk"],
      not_for: ["akutt emosjonell krise"],
      coach_guidance: "Bruk modellen på én konkret situasjon fra den siste tiden.",
      content_json: [{ type: "intro", content: "ABCDE-modellen hjelper deg å utforske hvordan tanker påvirker følelser og handlinger i krevende situasjoner." }],
      files: [], updated_at: daysFromNow(-5)
    },
    {
      id: "res3", slug: "a-akseptere-frykt", status: "published", type: "reflection", phase: "reflection", visibility: "client_assignable", estimated_duration: 10,
      tags: ["area:relationships_influence"], title: "Å akseptere frykt",
      client_intro: "Frykt er en naturlig del av å stå i krevende situasjoner. Ressursen hjelper deg å se hvordan frykt påvirker valgene dine.",
      intended_outcome: "Hjelpe klienten å identifisere hvordan frykt påvirker atferd og valg.",
      coach_guidance: "Normaliser frykt uten å bagatellisere den.",
      content_json: [{ type: "intro", content: "Frykt sier noe om hva som står på spill." }],
      files: [], updated_at: daysFromNow(-9)
    },
    {
      id: "res4", slug: "forberede-vanskelig-samtale", status: "draft", type: "worksheet", phase: "session", visibility: "coach",
      tags: [], title: "Forberede en vanskelig samtale", client_intro: "",
      content_json: [], files: [], updated_at: daysFromNow(-1)
    },
    {
      id: "res5", slug: "ukesrefleksjon", status: "archived", type: "reflection", phase: "reflection", visibility: "client_assignable",
      tags: ["area:development_process"], title: "Ukesrefleksjon",
      client_intro: "Fem spørsmål for å se tilbake på uken.",
      content_json: [], files: [], updated_at: daysFromNow(-40)
    }
  ];
}

async function bootCoachPage(page, client, sharedResource) {
  const people = coachClients(client);
  state.coaches = people.coaches;
  state.coach = people.coaches[0];
  state.clients = people.clients;
  state.programSummaries = page === "clients-empty" ? {} : people.summaries;
  if (page === "clients-empty") state.clients = [{ ...people.clients[2] }];
  const library = await ensureResourceLibrary();
  const resources = libraryResources(sharedResource).map((resource) => library.normalizeResourceProductFields(resource));
  window.RaederResourceLibrary = {
    ...applyVisualResourceLibrary(library),
    getPublishedResources: async () => resources.filter((resource) => resource.status === "published"),
    getAdminResources: async () => resources,
    getResourceFileUrl: visualResourceFileUrl
  };
  setScreen("app");
  renderShell();
  if (params.get("mobilepreview")) state.resourceLibraryDetail = true;
  navigate(page === "clients-empty" ? "clients" : page);
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (params.get("dialog") === "resource-new") openResourceAdminEditor();
  if (params.get("dialog") === "resource-edit") {
    const adminResources = await window.RaederResourceLibrary.getAdminResources();
    openResourceAdminEditor(adminResources[0]);
  }
  if (params.get("dialog") === "resource-send") {
    const published = await window.RaederResourceLibrary.getPublishedResources();
    openSendResourceDrawer(published[0]);
  }
}

async function boot() {
  await loadPortal();
  state.sb = offlineSupabase();
  applyVisualResourceLibrary(await ensureResourceLibrary());

  const competencies = (await fetch("content/leadership_competencies_v3.json").then((response) => response.json())).map(mapCompetency);
  const bySlug = (part) => competencies.find((item) => item.id.includes(part)) || competencies[0];
  const communication = bySlug("kommunikasjon");
  const delegation = bySlug("delegering");
  const feedback = bySlug("feedback");
  const suggested = competencies[20];

  const client = {
    id: "c1",
    name: "Kari Nordmann",
    user_id: "u-client",
    consent_given: true,
    consent_date: "2026-08-01",
    account_activated_at: "2026-08-01",
    coach_ids: ["coach1"]
  };
  state.user = { id: role === "client" ? "u-client" : "u-coach", email: "test@example.com" };
  state.profile = { role };
  state.coach = role === "client" ? null : { id: "coach1" };
  state.client = client;
  state.clients = [client];
  state.selectedClientId = client.id;

  const program = {
    id: "p1",
    purpose: "Bli en tydeligere leder for ledergruppen i en periode med endring.",
    success_criteria: "Ledergruppen forstår prioriteringene og tar beslutninger raskere.",
    expectations_client: "Forbereder meg til samtalene og prøver ut det vi blir enige om.",
    expectations_coach: "Stiller gode spørsmål og gir ærlige tilbakemeldinger.",
    practical_frame: "Seks samtaler over et halvt år.",
    confidentiality: "Det vi snakker om, blir mellom oss.",
    context: "Ny i rollen som leder for ledergruppen."
  };
  const area = {
    id: "a1",
    title: "Tydeligere prioritering i ledergruppen",
    project_type: "outer",
    movement: "Fra mange like viktige saker til tre tydelige prioriteringer.",
    typical_situations: "Ledermøter der alt haster.",
    progress_signs: "Kortere møter og færre saker som kommer tilbake."
  };
  const experiment = {
    id: "x1",
    program_id: "p1",
    title: "Innled med hovedbudskapet",
    status: "active",
    description: "",
    program_competency_id: `pc-${communication.id}`,
    due_date: null
  };

  // Innhold fra docs/RESOURCE_LIBRARY_PILOT_CONTENT.md. Status «viewed», fordi «assigned»
  // får portalen til å prøve å skrive «åpnet» til databasen.
  const sharedResource = {
    id: "sr1",
    status: "viewed",
    shared_at: "2026-09-29T08:00:00Z",
    context_type: "focus_area",
    coach_note: "Jeg vil at du bruker denne ressursen på noe som tar mye energi akkurat nå. Målet er ikke å \"slutte å bry seg\", men å bli tydeligere på hvor du faktisk har påvirkningskraft.",
    client_note: "",
    client_visibility: "private",
    resource: {
      title: "Kontrollsirkelen",
      type: "framework",
      estimated_duration: 15,
      client_intro: "Mange bruker store mengder mental energi på forhold de verken kan kontrollere eller påvirke. Denne modellen hjelper deg å tydeliggjøre hvor innsatsen din faktisk kan gjøre en forskjell.",
      content_json: [
        { type: "intro", content: "Kontrollsirkelen hjelper deg å skille mellom det du kan kontrollere, påvirke og ikke kontrollere." },
        { type: "illustration", key: "control_circle", file_id: "f-ill" },
        { type: "text", heading: "Steg 1: Identifiser energityver", content: "Skriv ned tre ting som tar mye mental energi akkurat nå." },
        { type: "worksheet", fields: ["Situasjon 1", "Situasjon 2", "Situasjon 3"] },
        { type: "text", heading: "Steg 2: Sorter situasjonene", content: "Marker hva du faktisk kan kontrollere, påvirke eller ikke kontrollere." },
        { type: "worksheet", fields: ["Hva kan jeg kontrollere?", "Hva kan jeg påvirke?", "Hva må jeg akseptere?"] },
        { type: "reflection_questions", questions: ["Hvor bruker du mest energi i dag?", "Hva overrasker deg når du sorterer dette?", "Hva kan du gjøre konkret denne uken innenfor din påvirkningssirkel?"] }
      ],
      next_step_prompt: "Velg én konkret situasjon denne uken hvor du aktivt skal flytte oppmerksomhet fra bekymring til handling innenfor din påvirkningssirkel.",
      files: [
        { id: "f-ill", file_type: "illustration", storage_path: "resources/kontrollsirkelen/control-circle-diagram.svg", display_name: "Kontrollsirkelen", sort_order: 1 },
        { id: "f-pdf", file_type: "printable", storage_path: "resources/kontrollsirkelen/kontrollsirkelen-printable.pdf", display_name: "Kontrollsirkelen som utskriftsvennlig PDF", sort_order: 2 }
      ]
    }
  };

  const chooserScenes = {
    "chooser-empty": [],
    "chooser-two": [programCompetency(communication, "active", 1), programCompetency(delegation, "active", 2)],
    "chooser-three": [programCompetency(communication, "active", 1), programCompetency(delegation, "active", 2), programCompetency(feedback, "active", 3)]
  };
  const scenes = {
    ...Object.fromEntries(Object.entries(chooserScenes).map(([name, comps]) => [name, { purpose: program.purpose, areas: [area], comps, actions: [] }])),
    "now-empty": { purpose: "", areas: [], comps: [], actions: [] },
    "now-inner-only": { purpose: program.purpose, areas: [], comps: [programCompetency(communication, "active", 1)], actions: [] },
    "now-draft": { purpose: "", areas: [{ id: "a2", title: "Nytt fokusoppdrag", project_type: "outer" }], comps: [], actions: [] },
    "now-complete": {
      purpose: program.purpose,
      areas: [area],
      comps: [programCompetency(communication, "active", 1), programCompetency(delegation, "active", 2)],
      actions: [experiment]
    },
    workspace: {
      purpose: program.purpose,
      areas: [area],
      comps: [
        programCompetency(communication, "active", 1, { why_now: "Budskapet mitt blir tolket ulikt i ledergruppen." }),
        programCompetency(delegation, "active", 2),
        programCompetency(suggested, "suggested", 0)
      ],
      actions: []
    },
    "focus-detail": { purpose: program.purpose, areas: [area], comps: [], actions: [] },
    "focus-many": {
      purpose: program.purpose,
      areas: [area, { id: "a2", title: "Nytt fokusoppdrag", project_type: "outer" }],
      comps: [programCompetency(communication, "active", 1)],
      actions: [{ ...experiment, program_competency_id: null, development_area_id: "a1", status: "planned", description: JSON.stringify({ action: "Starte ledermøtet med de tre viktigste sakene." }) }]
    },
    "now-active": {
      purpose: program.purpose,
      areas: [{ ...area, progress_signs: "" }],
      comps: [programCompetency(communication, "active", 1), programCompetency(delegation, "active", 2)],
      actions: [{ ...experiment, due_date: "2026-09-28", description: JSON.stringify({ action: "Starte ledermøtet med de tre viktigste sakene." }) }],
      sessions: [{ id: "s1", program_id: "p1", session_date: "2099-01-15", focus: "Prioriteringer i ledergruppen" }],
      reflections: [{ id: "r1", body: "Møtet ble kortere da jeg startet med hovedbudskapet.", visibility: "private", created_at: "2026-09-30T08:00:00Z" }],
      sharedResources: [sharedResource]
    },
    rich: {
      purpose: program.purpose,
      areas: [area],
      comps: [programCompetency(communication, "active", 1), programCompetency(delegation, "active", 2)],
      actions: [{ ...experiment, session_id: "s3", description: JSON.stringify({ action: "Starte ledermøtet med de tre viktigste sakene." }) }],
      sessions: [
        {
          id: "s3", program_id: "p1", session_date: "2099-01-15", focus: "Prioriteringer i ledergruppen",
          conversation_goal: "Bli enig om hvilke tre saker ledergruppen skal prioritere dette halvåret.",
          insights: "Jeg bruker mye tid på å forklare bakgrunnen før jeg sier hva jeg vil. Ledergruppen trenger konklusjonen først.",
          decisions: "Starte neste ledermøte med de tre viktigste sakene."
        },
        { id: "s2", program_id: "p1", session_date: "2099-01-02", focus: "Første samtale: Forventninger og rammer", conversation_goal: "Avklare rammene." },
        { id: "s1", program_id: "p1", session_date: "2098-12-12", focus: "Tilbakemelding fra ledergruppen" }
      ],
      reflections: [
        { id: "r3", created_by: "u-client", body: "Møtet ble kortere da jeg startet med hovedbudskapet. To av lederne sa etterpå at de visste hva de skulle gjøre.", visibility: "shared_with_coach", program_competency_id: `pc-${communication.id}`, created_at: "2026-09-30T08:00:00Z" },
        { id: "r2", created_by: "u-client", body: "Jeg merker at jeg tar over når noen nøler. Vil se om jeg kan vente litt lenger neste gang.", visibility: "private", program_competency_id: `pc-${delegation.id}`, created_at: "2026-09-24T08:00:00Z" },
        { id: "r1", created_by: "u-client", body: "Fikk spørsmål om prioriteringene i gangen. Klarte å svare kort.", visibility: "private", development_area_id: "a1", created_at: "2026-09-18T08:00:00Z" }
      ],
      sharedResources: [
        sharedResource,
        { id: "sr2", status: "assigned", shared_at: "2026-09-27T08:00:00Z", context_type: "program", resource: { title: "ABCDE-modellen", type: "exercise", estimated_duration: 20, summary: "En øvelse for å undersøke tanker som styrer reaksjonene dine.", content_json: [], files: [] } },
        { id: "sr3", status: "responded", shared_at: "2026-09-20T08:00:00Z", context_type: "program", client_note: "Jeg kjenner igjen frykten for å miste kontroll.", client_visibility: "shared_with_coach", resource: { title: "Å akseptere frykt", type: "reflection", estimated_duration: 10, summary: "Refleksjon om å stå i usikkerhet.", content_json: [], files: [] } }
      ]
    },
    "direction-partial": {
      purpose: program.purpose,
      program: { success_criteria: "", expectations_client: "", expectations_coach: "", context: "", confidentiality: "" },
      areas: [area],
      comps: [],
      actions: []
    }
  };
  const data = scenes[scene] || scenes["now-complete"];

  program.purpose = data.purpose;
  Object.assign(program, data.program || {});
  state.programCache[client.id] = {
    program,
    areas: data.areas,
    sessions: data.sessions || [],
    actions: data.actions,
    reflections: data.reflections || [],
    evaluation: null,
    sharedResources: data.sharedResources || [],
    competenciesAvailable: true,
    leadershipCompetencies: competencies,
    programCompetencies: data.comps
  };
  state.focusView = params.get("view") || (scene.startsWith("focus") ? "assignments" : "competencies");
  if (params.get("preview")) state.previewCompetencyId = params.get("preview");

  const page = params.get("page");
  if (page) {
    await bootCoachPage(page, client, sharedResource);
    await finishBoot();
    return;
  }

  const screen = params.get("screen");
  if (["login", "password", "reconnect"].includes(screen)) {
    setScreen(screen);
    await finishBoot();
    return;
  }

  setScreen("app");
  renderShell();
  setHeader("Din utviklingsportal", "Velkommen tilbake, Kari", [], "");
  if (screen === "consent") {
    renderConsentGate({ ...client, consent_given: false, consent_date: null });
    await finishBoot();
    return;
  }
  const pane = params.get("pane") || (scene.startsWith("chooser") || scene === "workspace" || scene.startsWith("focus") ? "work" : scene.startsWith("direction") ? "direction" : "now");
  renderCachedProgram(pane);
  activateWorkspacePane?.(pane);
  if (params.get("edit")) {
    state.inlineEditKey = params.get("edit");
    renderCachedProgram(pane);
  }
  if (scene.startsWith("chooser")) {
    if (params.get("query")) state.competencyChooserQuery = params.get("query");
    openCompetencyChooser(state.programCache[client.id]);
    if (params.get("mobilepreview")) document.querySelector(".ds-chooser")?.classList.add("is-preview");
  }
  openDialog(params.get("dialog"), state.programCache[client.id]);
  await finishBoot();
}

function openDialog(name, data) {
  if (name === "experiment-new") createAction(data);
  if (name === "experiment-edit") editAction(data.actions[0], data);
  if (name === "confirm") {
    confirmDelete("Eksperimentet blir liggende i historikken sammen med observasjonene og læringen din.", {
      kicker: "Eksperiment",
      title: "Avslutt eksperiment?",
      confirmLabel: "Avslutt"
    });
  }
  if (name === "experiment-review") {
    const action = {
      ...data.actions[0],
      description: JSON.stringify({ version: 3, action: "Starte ledermøtet med de tre viktigste sakene.", observation: "To av lederne tok ordet tidligere enn vanlig.", effect: "some" })
    };
    editAction(action, data);
    requestAnimationFrame(() => document.querySelector("#entity-drawer details[open]")?.scrollIntoView({ block: "start" }));
  }
  if (name === "confirm-remove") confirmDelete("Fjerne \"Kontrollsirkelen.pdf\" fra ressursen?", { danger: true });
  if (name === "message") showAppMessage("Kunne ikke lagre refleksjonen", "Prøv igjen.");
  if (name === "client-invite") openClientInvite();
  if (name === "client-edit") {
    state.coaches = [{ id: "coach1", name: "Ola Coach" }, { id: "coach2", name: "Siri Coach" }];
    openClientEdit({ ...state.clients[0], email: "kari@example.com", role: "Direktør", employer: "Eksempel AS" });
  }
  if (name === "resource-edit") {
    state.profile.role = "admin";
    openResourceAdminEditor({ id: "r1", status: "published", ...data.sharedResources[0].resource });
  }
  if (name === "resource-send") openSendResourceDrawer({ id: "r1", ...data.sharedResources[0].resource });
}

async function finishBoot() {
  applyVisualResourceLibrary();
  await window.visualCheckAfterBoot?.(params);
  applyVisualResourceLibrary();
  refreshIcons();
  if (typeof hydrateResourceMedia === "function") await hydrateResourceMedia(document.body);
  await Promise.all([...document.images].map((image) => (image.decode ? image.decode() : Promise.resolve()).catch(() => {})));
  if (document.fonts?.ready) await document.fonts.ready;
  document.body.dataset.ready = "1";
}

boot().catch((error) => {
  document.body.dataset.ready = "error";
  console.error(error);
});
