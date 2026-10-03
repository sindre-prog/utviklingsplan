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

async function boot() {
  await loadPortal();
  state.sb = offlineSupabase();

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
      sharedResources: [{ id: "sr1", status: "assigned", shared_at: "2026-09-29T08:00:00Z", coach_note: "Les denne før neste samtale.", resource: { title: "Tydelig kommunikasjon", summary: "" } }]
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

  setScreen("app");
  renderShell();
  setHeader("Din utviklingsportal", "Velkommen tilbake, Kari", [], "");
  const pane = params.get("pane") || (scene.startsWith("chooser") || scene === "workspace" || scene.startsWith("focus") ? "work" : scene.startsWith("direction") ? "direction" : "now");
  renderCachedProgram(pane);
  activateWorkspacePane?.(pane);
  if (params.get("edit")) {
    state.inlineEditKey = params.get("edit");
    renderCachedProgram(pane);
  }
  if (scene.startsWith("chooser")) {
    openCompetencyChooser(state.programCache[client.id]);
    if (params.get("mobilepreview")) document.querySelector(".competency-chooser-layout")?.classList.add("show-preview");
  }
  refreshIcons();
  if (document.fonts?.ready) await document.fonts.ready;
  document.body.dataset.ready = "1";
}

boot().catch((error) => {
  document.body.dataset.ready = "error";
  console.error(error);
});
