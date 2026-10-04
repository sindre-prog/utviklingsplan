const SUPABASE_URL = "https://upuffmfgsxlzybifxveg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YLVxFqksi1wCmh-jF14mLA_0AGV03Gq";
const CONSENT_VERSION = "coaching-portal-v1";

const ACTIVE_COMPETENCY_RECOMMENDATION = "Tre lederkompetanser samtidig er ofte nok til å holde fokus og prøve dem i praksis. Du kan likevel legge til flere.";
const EXPERIMENT_STATUS = {
  planned: "Planlagt",
  active: "Prøves ut",
  reviewed: "Prøvd og reflektert",
  continued: "Videreført",
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
const RESOURCE_PHASE_OPTIONS = [
  ["direction", "Forløpet"],
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
  ["cover_image", "Forsidebilde"],
  ["illustration", "Bilde / illustrasjon"],
  ["printable", "Print/PDF"],
  ["attachment", "Vedlegg"],
  ["audio", "Lyd"],
  ["video", "Video"]
];
const RESOURCE_BLOCK_TYPE_LABELS = {
  intro: "Innledning i innholdet",
  text: "Tekst",
  callout: "Fremhevet tekst",
  model_cards: "Kort/modell",
  quote: "Sitat",
  worksheet: "Arbeidsfelt",
  reflection_questions: "Spørsmål",
  illustration: "Bilde / illustrasjon",
  download: "PDF/vedlegg"
};
const RESOURCE_BLOCK_TYPE_DESCRIPTIONS = {
  text: "Overskrift og vanlig tekst.",
  reflection_questions: "Spørsmål som vises som en enkel punktliste.",
  worksheet: "Arbeidsfelt klienten kan bruke som støtte.",
  model_cards: "Korte kort for modeller, begreper eller valg.",
  callout: "Et uthevet felt for viktige poeng eller coach-kommentar.",
  quote: "Sitat eller nøkkelsetning med valgfri kilde.",
  illustration: "Viser et opplastet bilde eller en illustrasjon der blokken står.",
  download: "Legger inn et vedlegg der blokken står. Primær PDF løftes automatisk frem øverst.",
  intro: "Kort innledning til selve faginnholdet, etter ressursens introduksjon."
};
const RESOURCE_BLOCK_ADD_TYPES = ["text", "reflection_questions", "worksheet", "model_cards", "callout", "quote", "illustration", "download", "intro"];
const RESOURCE_CALLOUT_TONES = [
  ["note", "Nøytral"],
  ["coach", "Coach-kommentar"],
  ["attention", "Viktig"]
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
  saveStatusTimer: null,
  modal: null,
  drawer: null,
  confirmResolve: null,
  messageResolve: null,
  inlineEditKey: null,
  selectedFocusIndex: 0,
  selectedSessionIndex: 0,
  resourceCache: null,
  selectedResourceSlug: null,
  resourceLibraryDetail: false,
  selectedSharedResourceId: null,
  selectedSharedResourceProgramId: null,
  sharedResourceQuery: "",
  resourceLibraryPromise: null,
  leadershipLibraryPromise: null,
  selectedCompetencyId: null,
  focusView: "assignments",
  experimentView: "active",
  experimentFilter: "all",
  previewCompetencyId: null,
  competencyChooserQuery: "",
  competencyChooserCategory: "all",
  passwordSessionUserId: null,
  justActivated: false
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
  children
    .filter((child) => child !== null && child !== undefined && child !== false)
    .forEach((child) => node.append(child));
  return node;
}

function icon(name) {
  return el("i", { "data-lucide": name });
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

// Designsystem (ds): byggeklossene i design-system.css. Tekster sendes alltid inn av den som
// bruker byggeklossen, slik at ingen ord oppstår her. Se docs/DESIGNSYSTEM_PLAN_V1.md.

function dsClass(...names) {
  return names.filter(Boolean).join(" ");
}

function dsButton(label, { variant = "secondary", iconName = "", onClick, type = "button", ariaLabel, disabled = false, className = "" } = {}) {
  return el("button", {
    class: dsClass("ds-button", variant !== "secondary" && `ds-button--${variant}`, className),
    type,
    "aria-label": ariaLabel,
    disabled,
    onclick: onClick
  }, [iconName ? icon(iconName) : null, el("span", { text: label })]);
}

function dsStatus(label, tone = "neutral") {
  return el("span", { class: "ds-status", "data-tone": tone, text: label });
}

function dsPage({ title, intro = "", read = false, className = "", actions = [] } = {}, children = []) {
  return el("section", { class: dsClass("ds-page", read && "ds-page--read", className) }, [
    title || intro || actions.length ? el("header", { class: dsClass("ds-page-head", actions.length && "ds-page-head--actions") }, [
      el("div", {}, [
        title ? el("h1", { class: "ds-page-title", text: title }) : null,
        intro ? el("p", { class: "ds-page-intro", text: intro }) : null
      ]),
      actions.length ? el("div", { class: "ds-object-actions" }, actions) : null
    ]) : null,
    ...children
  ]);
}

function dsSheet(children = [], { list = null, className = "" } = {}) {
  return el("div", { class: dsClass("ds-sheet", list && "ds-sheet--split", className) }, [
    list,
    el("div", { class: "ds-sheet-body" }, children)
  ]);
}

function dsSection({ title, intro = "", actions = [], headingLevel = 3, className = "" } = {}, children = []) {
  return el("section", { class: dsClass("ds-section", className) }, [
    el("div", { class: "ds-section-head" }, [
      el("div", {}, [
        el(`h${headingLevel}`, { class: "ds-section-title", text: title }),
        intro ? el("p", { class: "ds-section-intro", text: intro }) : null
      ]),
      actions.length ? el("div", { class: "ds-object-actions" }, actions) : null
    ]),
    ...children
  ]);
}

function dsList({ title = "", label = "", rows = [], foot = null } = {}) {
  return el("nav", { class: "ds-list", "aria-label": label || title || undefined }, [
    title ? el("p", { class: "ds-list-title", text: title }) : null,
    ...rows,
    foot ? el("div", { class: "ds-list-foot" }, [foot]) : null
  ]);
}

function dsRow({ title, meta = "", selected = false, onClick } = {}) {
  return el("button", {
    class: "ds-row",
    type: "button",
    "aria-current": selected ? "true" : undefined,
    onclick: onClick
  }, [
    el("span", { class: "ds-row-title", text: title }),
    meta ? el("span", { class: "ds-row-meta", text: meta }) : null
  ]);
}

function dsSteps(steps = [], { label } = {}) {
  return el("nav", { class: "ds-steps", "aria-label": label }, steps.map((step) => el("button", {
    class: "ds-step",
    type: "button",
    "data-step": step.id,
    "aria-current": step.current ? "step" : undefined,
    onclick: step.onClick
  }, [
    el("span", { class: "ds-step-title", text: step.title }),
    step.hint ? el("span", { class: "ds-step-hint", text: step.hint }) : null
  ])));
}

function dsMenu(items = [], { label } = {}) {
  const menu = el("details", { class: "ds-menu" });
  const close = () => menu.removeAttribute("open");
  menu.append(
    el("summary", { class: "ds-menu-trigger", "aria-label": label, title: label }, [icon("ellipsis")]),
    el("div", { class: "ds-menu-list" }, items.filter(Boolean).map((item) => el("button", {
      class: dsClass("ds-menu-item", item.danger && "ds-menu-item--danger", item.className),
      type: "button",
      onclick: (event) => {
        close();
        item.onClick?.(event);
      }
    }, [item.iconName ? icon(item.iconName) : null, el("span", { text: item.label })])))
  );
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
      menu.querySelector("summary")?.focus();
    }
  });
  menu.addEventListener("focusout", (event) => {
    if (!menu.contains(event.relatedTarget)) close();
  });
  return menu;
}

function dsObjectHead({ kicker = "", title, lead = "", actions = [], menu = null, headingLevel = 2 } = {}) {
  return el("header", { class: "ds-object-head" }, [
    el("div", {}, [
      kicker ? el("p", { class: "ds-object-kicker", text: kicker }) : null,
      el(`h${headingLevel}`, { class: "ds-object-title", text: title }),
      lead ? el("p", { class: "ds-object-lead", text: lead }) : null
    ]),
    actions.length || menu ? el("div", { class: "ds-object-actions" }, [...actions, menu]) : null
  ]);
}

function dsQuestion({ eyebrow = "", question, help = "", answer = "", done = false, number = null, field = null, side = null, foot = [], headingLevel = 4 } = {}) {
  const hasAnswer = Boolean(String(answer || "").trim());
  return el("div", { class: "ds-qa" }, [
    el("span", { class: dsClass("ds-qa-mark", done && "is-done"), "aria-hidden": "true" }, [done ? icon("check") : number === null ? null : String(number)]),
    el("div", { class: "ds-qa-main" }, [
      eyebrow ? el("p", { class: "ds-qa-eyebrow", text: eyebrow }) : null,
      el(`h${headingLevel}`, { class: "ds-qa-question", text: question }),
      help && !hasAnswer ? el("p", { class: "ds-qa-help", text: help }) : null,
      hasAnswer && !field ? el("p", { class: "ds-qa-answer", text: answer }) : null,
      field,
      foot.length ? el("div", { class: "ds-qa-foot" }, foot) : null
    ]),
    side ? el("div", { class: "ds-qa-side" }, [side]) : null
  ]);
}

function dsField({ value = "", placeholder = "", label, rows = 3, onInput, onBlur } = {}) {
  const field = el("textarea", { class: "ds-qa-field", rows, placeholder, "aria-label": label, oninput: onInput, onblur: onBlur });
  field.value = value || "";
  return field;
}

function dsAutoField({ value = "", placeholder = "", label, id, onChange, onCommit } = {}) {
  const field = el("textarea", { class: "ds-qa-field ds-qa-auto", rows: 2, placeholder, "aria-label": label, id });
  field.value = value || "";
  const fit = () => {
    if (CSS.supports?.("field-sizing", "content") || !field.offsetParent) return;
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight + 2}px`;
  };
  const settle = () => field.classList.toggle("is-filled", Boolean(field.value.trim()));
  settle();
  field.addEventListener("input", () => {
    fit();
    onChange?.(field.value);
  });
  field.addEventListener("focus", fit);
  field.addEventListener("blur", () => {
    settle();
    onCommit?.(field.value);
  });
  requestAnimationFrame(() => field.isConnected && fit());
  return field;
}

function setDsQaDone(qa, done, number = null) {
  const mark = qa?.querySelector(".ds-qa-mark");
  if (!mark || mark.classList.contains("is-done") === done) return;
  mark.classList.toggle("is-done", done);
  mark.replaceChildren(...(done ? [icon("check")] : number === null ? [] : [document.createTextNode(String(number))]));
  if (done) refreshIcons();
}

function setDsSectionStatus(node, status) {
  const current = node?.closest(".ds-section")?.querySelector(".ds-section-head .ds-status");
  if (!current || !status) return;
  current.textContent = status.label;
  current.dataset.tone = status.ready ? "done" : "neutral";
}

function dsAutoQuestion({ number = null, eyebrow = "", label, help = "", value = "", emptyText = "", editable = false, onChange, onCommit, foot = [] } = {}) {
  const text = (value || "").trim();
  if (!editable) return dsQuestion({ eyebrow, question: label, number, done: Boolean(text), answer: text, help: emptyText });
  let qa = null;
  const field = dsAutoField({
    value: text,
    placeholder: emptyText,
    label,
    onChange: (next) => {
      setDsQaDone(qa, Boolean(next.trim()), number);
      onChange?.(next, qa);
    },
    onCommit
  });
  qa = dsQuestion({ eyebrow, question: label, number, done: Boolean(text), help: text ? "" : help, field, foot: foot.filter(Boolean) });
  return qa;
}

function dsNext({ label, title, text = "", action = null } = {}) {
  return el("section", { class: "ds-next" }, [
    el("div", {}, [
      el("p", { class: "ds-next-label", text: label }),
      el("strong", { class: "ds-next-title", text: title }),
      text ? el("p", { class: "ds-next-text", text }) : null
    ]),
    action
  ]);
}

function dsProgress({ title, text = "", done = 0, total = 0, label, action = null } = {}) {
  return el("section", { class: "ds-progress", "aria-label": label }, [
    el("div", { class: "ds-progress-copy" }, [
      el("strong", { class: "ds-progress-title", text: title }),
      text ? el("p", { class: "ds-progress-text", text }) : null,
      total ? el("div", { class: "ds-progress-bar", "aria-hidden": "true" }, Array.from({ length: total }, (_, index) => (
        el("span", { "data-done": index < done ? "true" : undefined })
      ))) : null
    ]),
    action
  ]);
}

function dsContext({ label, text, action = null } = {}) {
  return el("div", { class: "ds-context" }, [
    el("div", {}, [
      el("p", { class: "ds-context-label", text: label }),
      el("p", { class: "ds-context-text", text, title: text })
    ]),
    action
  ]);
}

function dsDisclosure(summary, children = [], { open = false } = {}) {
  return el("details", { class: "ds-disclosure", open }, [
    el("summary", { text: summary }),
    el("div", { class: "ds-disclosure-body" }, children)
  ]);
}

function dsChoice({ label, options = [], value, help = "", onChange } = {}) {
  const checkedKey = options.some(([key]) => key === value) ? value : options[0]?.[0];
  const select = (key, focus = false) => {
    buttons.forEach((button) => {
      const checked = button.dataset.value === key;
      button.setAttribute("aria-checked", checked ? "true" : "false");
      button.tabIndex = checked ? 0 : -1;
      if (checked && focus) button.focus();
    });
    onChange?.(key);
  };
  const buttons = options.map(([key, text], index) => el("button", {
    class: "ds-segmented-option",
    type: "button",
    role: "radio",
    "data-value": key,
    "aria-checked": key === value ? "true" : "false",
    tabindex: key === checkedKey ? "0" : "-1",
    text,
    onclick: () => select(key),
    onkeydown: (event) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      select(options[(index + step + options.length) % options.length][0], true);
    }
  }));
  return el("div", { class: "ds-choice" }, [
    el("p", { class: "ds-choice-label", text: label }),
    el("div", { class: "ds-segmented", role: "radiogroup", "aria-label": label }, buttons),
    help ? el("p", { class: "ds-choice-help", text: help }) : null
  ]);
}

function dsEmpty(text, action = null) {
  return el("div", { class: "ds-empty" }, [el("p", { class: "ds-empty-text", text }), action]);
}

function dsFigures(items, { label = "Nøkkeltall" } = {}) {
  return el("div", { class: "ds-figures", role: "list", "aria-label": label }, items.map(([value, name, hint]) => el("p", { class: "ds-figure", role: "listitem" }, [
    el("span", { class: "ds-figure-value", text: value }),
    el("span", { class: "ds-figure-label", text: name }),
    hint ? el("span", { class: "ds-figure-hint", text: hint }) : null
  ])));
}

function dsTools(children = []) {
  return el("div", { class: "ds-tools" }, children);
}

function dsSearch(placeholder, { onInput, ariaLabel } = {}) {
  return el("input", {
    class: "ds-search",
    type: "search",
    placeholder,
    "aria-label": ariaLabel || placeholder,
    oninput: (event) => onInput?.(event.target.value)
  });
}

function dsSelect(options, value = "", { ariaLabel, onChange } = {}) {
  const node = el("select", {
    class: "ds-select",
    "aria-label": ariaLabel,
    onchange: (event) => onChange?.(event.target.value)
  }, options.map(([key, text]) => el("option", { value: key, text, selected: key === value })));
  node.value = value;
  return node;
}

function dsTable({ columns, head = [], rows = [], label = "" } = {}) {
  return el("div", { class: "ds-table", role: "table", "aria-label": label || undefined, style: columns ? `--ds-table-columns: ${columns}` : undefined }, [
    head.length ? el("div", { class: "ds-table-head", role: "row" }, head.map((text) => el("span", { role: "columnheader", text }))) : null,
    ...rows
  ]);
}

function dsTableRow(cells, { link = false, muted = false, onClick } = {}) {
  const open = () => onClick?.();
  return el("div", {
    class: dsClass("ds-table-row", link && "is-link", muted && "is-muted"),
    role: "row",
    tabindex: link && onClick ? "0" : undefined,
    onclick: onClick ? (event) => {
      if (event.target.closest("button, .ds-menu, a, input, select, textarea")) return;
      open();
    } : undefined,
    onkeydown: link && onClick ? (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest("button, .ds-menu, a, input, select, textarea")) return;
      event.preventDefault();
      open();
    } : undefined
  }, cells);
}

function dsTableCell(children, { label = "", extra = false } = {}) {
  return el("div", { class: dsClass("ds-table-cell", extra && "is-extra"), role: "cell" }, [
    label ? el("span", { class: "ds-table-label", text: label }) : null,
    ...(Array.isArray(children) ? children : [children])
  ]);
}

function dsPersonCell(title, meta = "") {
  return dsTableCell([
    el("span", { class: "ds-row-title", text: title || "Uten navn" }),
    meta ? el("span", { class: "ds-row-meta", text: meta }) : null
  ]);
}

function dsTextCell(label, value, extra = false) {
  return dsTableCell([el("span", { text: value })], { label, extra });
}

function dsSaved() {
  return el("span", { class: "ds-saved", role: "status", "aria-live": "polite" });
}

function focusIfLost(target) {
  const node = typeof target === "string" ? $(target) : target;
  const active = document.activeElement;
  if (node?.isConnected && (!active || active === document.body)) node.focus();
}

function setDsSaved(node, state, text) {
  if (!node) return;
  node.dataset.state = state;
  node.textContent = text || "";
}

function setScreen(name) {
  $$("[data-screen]").forEach((screen) => screen.classList.toggle("hidden", screen.dataset.screen !== name));
}

function setMessage(id, text, type = "") {
  const msg = $(id);
  msg.textContent = text || "";
  msg.dataset.tone = type;
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

  state.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  state.sb.auth.onAuthStateChange((event, session) => {
    if (event === "TOKEN_REFRESHED" && session?.user) {
      state.user = session.user;
    }
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
    state.justActivated = false;
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
    state.justActivated = true;
    await state.sb
      .from("clients")
      .update({ account_activated_at: new Date().toISOString() })
      .eq("user_id", state.user.id);
    window.history.replaceState(null, "", window.location.pathname);
    await bootstrapApp();
  });

  $("#logout-button").addEventListener("click", logout);
  $("#reconnect-button").addEventListener("click", resumeAuthenticatedApp);
  $("#reconnect-logout").addEventListener("click", logout);
  $("#brand-home")?.addEventListener("click", navigateHome);
  window.addEventListener("beforeunload", (event) => {
    if (!hasPendingChanges()) return;
    flushPendingChanges();
    event.preventDefault();
    event.returnValue = "";
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && hasPendingChanges()) flushPendingChanges();
  });
}

async function resumeAuthenticatedApp() {
  setMessage("#reconnect-status", "Kobler til...");
  const { data: { session }, error } = await state.sb.auth.getSession();
  if (error || !session?.user) {
    state.user = null;
    state.profile = null;
    setScreen("login");
    setMessage("#login-message", "Økten er avsluttet. Logg inn på nytt.");
    return;
  }
  state.user = session.user;
  await bootstrapApp();
}

async function loadProfileWithSessionRecovery() {
  const loadProfile = () => state.sb.from("profiles").select("*").eq("id", state.user.id).maybeSingle();
  let profileResult = await loadProfile();
  if (!profileResult.error && profileResult.data) {
    return { profile: profileResult.data, sessionAvailable: true, error: null };
  }

  const { data: { session }, error: sessionError } = await state.sb.auth.getSession();
  if (sessionError || !session?.user) {
    return { profile: null, sessionAvailable: false, error: sessionError || profileResult.error };
  }

  state.user = session.user;
  const { data: refreshed, error: refreshError } = await state.sb.auth.refreshSession();
  if (!refreshError && refreshed?.session?.user) {
    state.user = refreshed.session.user;
    profileResult = await loadProfile();
  }

  return {
    profile: profileResult.data || null,
    sessionAvailable: true,
    error: profileResult.error || refreshError || null
  };
}

function showSessionRecovery(error = null) {
  if (error) console.error("Could not restore authenticated portal state", error);
  $("#reconnect-message").textContent = "Innloggingen din er bevart. Prøv å koble til på nytt.";
  setMessage("#reconnect-status", "");
  setScreen("reconnect");
  refreshIcons();
}

async function bootstrapApp() {
  const { profile, sessionAvailable, error } = await loadProfileWithSessionRecovery();
  if (!sessionAvailable) {
    state.user = null;
    state.profile = null;
    setScreen("login");
    setMessage("#login-message", "Økten er avsluttet. Logg inn på nytt.");
    return;
  }
  if (!profile) {
    showSessionRecovery(error);
    return;
  }
  state.profile = profile;
  try {
    await loadReferenceData();
  } catch (loadError) {
    showSessionRecovery(loadError);
    return;
  }
  setScreen("app");
  renderShell();
  $("#view-kicker").textContent = "Klientforløp";
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
      state.justActivated = true;
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
    loadActiveSummaryRows("shared_resources", "id, program_id, status, shared_at, viewed_at, responded_at, created_at, updated_at, archived_at", "id, program_id, status, shared_at, viewed_at, responded_at", programIds)
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
    registerSummaryActivity(summary, action, ["updated_at", "created_at"], "Eksperiment endret");
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
    registerSummaryActivity(summary, resource, ["responded_at", "viewed_at", "updated_at", "shared_at", "created_at"], resource.responded_at ? "Ressurs besvart" : resource.viewed_at ? "Ressurs åpnet" : "Ressurs delt");
    if (resource.status === "assigned" && !resource.viewed_at && !resource.responded_at) {
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
  $(".app-shell")?.classList.toggle("is-client-workspace", state.profile.role === "client");
  const nav = [
    state.profile.role !== "client" && ["clients", "users", "Klienter"],
    state.profile.role !== "client" && ["resources", "library", "Ressurser"],
    state.profile.role === "admin" && ["admin", "shield-check", "Administrasjon"]
  ].filter(Boolean);
  const navList = $("#nav-list");
  navList.hidden = nav.length === 0;
  navList.replaceChildren(...nav.map(([view, iconName, label]) => {
    return el("button", { class: "ds-appbar-link", type: "button", "data-view": view, onclick: () => navigate(view), text: label });
  }));
  refreshIcons();
}

function navigateHome() {
  if (state.profile?.role === "client") {
    navigate("plan", state.client?.id);
    return;
  }
  navigate("clients");
}

function navigate(view, clientId = null, activePane = null) {
  if (hasPendingChanges()) flushPendingChanges();
  state.view = view;
  if (view !== "plan") {
    $("#appbar-tabs")?.replaceChildren();
    $("#appbar-status")?.replaceChildren();
  }
  if (clientId) state.selectedClientId = clientId;
  $$("#nav-list [data-view]").forEach((item) => {
    const active = item.dataset.view === view || (view === "plan" && item.dataset.view === "clients");
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  const routes = {
    clients: renderClients,
    plan: renderPlan,
    resources: renderResources,
    admin: renderAdmin
  };
  if (view === "plan") renderPlan(activePane);
  else (routes[view] || renderClients)();
  refreshIcons();
}

function setHeader(kicker, title, actions = [], description = "") {
  $("#appbar-tabs")?.replaceChildren();
  $("#appbar-status")?.replaceChildren();
  $("#view-kicker").textContent = kicker;
  $("#view-title").textContent = title;
  const descriptionNode = $("#view-description");
  if (descriptionNode) {
    descriptionNode.textContent = description;
    descriptionNode.hidden = !description;
  }
  $("#topline-actions").replaceChildren(...actions);
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

function renderCoachPage({ title, intro = "", actions = [] }, children) {
  setHeader("", title, [], intro);
  $("#content").replaceChildren(dsPage({ title, intro, actions, className: "ds-coach-page" }, [
    dsSheet(children.filter(Boolean))
  ]));
}

function isCompact() {
  return window.matchMedia("(max-width: 700px)").matches;
}

function dsIconButton(iconName, { onClick, disabled = false, label } = {}) {
  return el("button", {
    class: "ds-icon-button",
    type: "button",
    "aria-label": label,
    title: label,
    disabled,
    onclick: onClick
  }, [icon(iconName)]);
}

function resourceKicker(resource) {
  return [
    resourceLabel(RESOURCE_TYPE_OPTIONS, resource?.type),
    resource?.estimated_duration ? `${resource.estimated_duration} min` : ""
  ].filter(Boolean).join(" · ");
}

function resourceGuidanceGroup(title, items) {
  if (Array.isArray(items)) {
    if (!items.length) return null;
    return el("section", { class: "ds-guidance-group" }, [
      el("h3", { class: "ds-guidance-title", text: title }),
      el("ul", { class: "ds-guidance-list" }, items.map((item) => el("li", { text: item })))
    ]);
  }
  return el("section", { class: "ds-guidance-group" }, [
    el("h3", { class: "ds-guidance-title", text: title }),
    el("p", { text: items || "Ikke definert ennå." })
  ]);
}

function resourceClientContent(resource) {
  const library = getResourceLibrary();
  if (!library?.renderResourceContentBlocks) return el("div", { class: "ds-content ds-resource-content" });
  return el("div", { class: "ds-content ds-resource-content" }, [
    ...library.renderResourceContentBlocks(resource?.content_json || [], {
      createElement: el,
      createIcon: icon,
      resourceFiles: resource?.files || [],
      onOpenFile: openResourceFile
    }),
    resource?.next_step_prompt ? el("h4", { class: "ds-content-heading", text: "Neste steg" }) : null,
    resource?.next_step_prompt ? el("p", { text: resource.next_step_prompt }) : null
  ]);
}

function resourceDetail(resource, { admin = false, back = false, guidanceOpen = false, onBack } = {}) {
  if (!resource) {
    return dsEmpty("Velg en ressurs i listen.");
  }
  const shareable = getVisibleClients().filter((client) => canShareResourceToClient(client));
  const canSend = canShareResources();
  const help = canSend
    ? (shareable.length
      ? "Velg Send ressurs når du har vurdert at den passer klienten."
      : "Du har ingen klienter med åpne forløp som kan motta ressurser ennå.")
    : "";
  return el("article", { class: "ds-detail" }, [
    back ? dsButton("Til biblioteket", { variant: "text", iconName: "arrow-left", className: "ds-back", onClick: onBack }) : null,
    dsObjectHead({
      kicker: resourceKicker(resource),
      title: resource.title || "Ressurs",
      lead: getResourceLibrary()?.resourceIntroduction?.(resource) || resource.introduction || "",
      actions: [
        admin ? dsButton("Rediger ressurs", { onClick: () => openResourceAdminEditor(resource) }) : null,
        canSend ? dsButton("Send ressurs", {
          variant: "primary",
          disabled: !shareable.length,
          onClick: () => openSendResourceDrawer(resource)
        }) : null
      ].filter(Boolean)
    }),
    help ? el("p", { class: "ds-library-help", text: help }) : null,
    el("details", { class: "ds-disclosure ds-disclosure--block", open: guidanceOpen }, [
      el("summary", {}, [el("span", {}, [
        el("span", { class: "ds-disclosure-title", text: "Før du deler" }),
        el("span", { class: "ds-disclosure-hint", text: "Vurdering og veiledning for coach" })
      ])]),
      el("div", { class: "ds-disclosure-body ds-guidance-grid" }, [
        resourceGuidanceGroup("Hva ressursen skal hjelpe med", resource.intended_outcome || "Ikke definert ennå."),
        resourceGuidanceGroup("Best brukt når", resource.best_used_when || []),
        resourceGuidanceGroup("Veiledning til coach", resource.coach_guidance || "Ingen veiledning lagt inn ennå."),
        resourceGuidanceGroup("Ikke egnet når", resource.not_for || [])
      ].filter(Boolean))
    ]),
    dsSection({ title: "Dette ser klienten" }, [resourceClientContent(resource)])
  ]);
}

function employerLine(client) {
  return [client.employer, client.role].filter(Boolean).join(" · ") || "Arbeidsgiver ikke satt";
}

function clientReadyStatus(client) {
  const ready = isClientActivated(client) && hasClientConsent(client);
  const text = isClientActivated(client) ? (hasClientConsent(client) ? "Klar" : "Mangler samtykke") : "Venter på aktivering";
  return dsStatus(text, ready ? "done" : "neutral");
}

function clientNextSessionLabel(client) {
  const date = state.programSummaries[client.id]?.nextSessionDate;
  return date ? formatDate(date) : "Ikke planlagt";
}

function clientLastActivityLabel(client) {
  const date = state.programSummaries[client.id]?.lastActivityAt;
  return date ? formatRelativeDate(date) : "Ingen aktivitet";
}

function clientSessionCountLabel(client) {
  const count = state.programSummaries[client.id]?.sessionCount || 0;
  return count === 1 ? "1 samtale" : `${count} samtaler`;
}

function showCoachOwnershipOrientation(clients) {
  if (!canInviteClient()) return false;
  return !clientActivityItems(clients).length && !clients.some((client) => hasProgramContent(state.programSummaries[client.id]));
}

function clientSortOptions() {
  return [
    ["name", "Navn A-Å"],
    ["recent-activity", "Sist aktivitet"],
    ["next-session", "Neste samtale"],
    ["created-desc", "Opprettet nyest"],
    ["created-asc", "Opprettet eldst"]
  ];
}

function clientOverviewTable(clients) {
  if (!clients.length) return dsEmpty("Ingen klienter å vise ennå.");
  return dsTable({
    columns: "minmax(0, 2fr) repeat(2, minmax(0, 1fr)) minmax(0, 1.2fr)",
    label: "Klientoversikt",
    head: ["Klient", "Sist aktivitet", "Neste samtale", "Status"],
    rows: clients.map((client) => {
      const canOpen = canOpenClient(client);
      return dsTableRow([
        dsPersonCell(client.name, employerLine(client)),
        dsTextCell("Sist aktivitet", clientLastActivityLabel(client), true),
        dsTextCell("Neste samtale", clientNextSessionLabel(client), true),
        dsTableCell([clientReadyStatus(client), el("span", { class: "ds-row-meta", text: clientSessionCountLabel(client) })])
      ], { link: canOpen, onClick: canOpen ? () => openClientPlan(client) : null });
    })
  });
}

function clientActivityTable(items) {
  return dsTable({
    columns: "minmax(0, 2fr) minmax(0, 1.4fr) minmax(0, 1fr)",
    label: "Nylige oppdateringer",
    head: ["Klient", "Sist aktivitet", "Neste samtale"],
    rows: items.slice(0, 4).map(({ client, activity }) => {
      const canOpen = canOpenClient(client);
      return dsTableRow([
        dsPersonCell(client.name, employerLine(client)),
        dsTableCell([
          el("span", { class: "ds-row-title", text: activity.label }),
          el("span", { class: "ds-row-meta", text: activity.detail })
        ], { label: "Sist aktivitet" }),
        dsTextCell("Neste samtale", clientNextSessionLabel(client), true)
      ], { link: canOpen, onClick: canOpen ? () => openClientPlan(client) : null });
    })
  });
}

function renderClients() {
  if (state.profile.role === "client") return navigate("plan", state.client?.id, initialWorkspacePane());
  const visibleClients = getVisibleClients();
  const filterCoaches = state.profile.role === "admin" ? state.coaches : (state.coach ? [state.coach] : []);
  const activity = clientActivityItems(visibleClients);
  const upcoming = visibleClients.filter((client) => state.programSummaries[client.id]?.nextSessionDate).length;
  const gettingStarted = showCoachOwnershipOrientation(visibleClients);
  const results = el("div");
  const renderTable = () => {
    const filtered = sortClients(filterClients(visibleClients, search.value, coachFilter.value), sortFilter.value);
    results.replaceChildren(clientOverviewTable(filtered));
  };
  const search = dsSearch("Søk etter navn, e-post, coach eller arbeidsgiver", { onInput: renderTable });
  const coachFilter = dsSelect(
    [["all", "Alle coacher"], ...filterCoaches.map((coach) => [coach.id, coach.name || "Uten navn"])],
    "all",
    { ariaLabel: "Filtrer på coach", onChange: renderTable }
  );
  const sortFilter = dsSelect(clientSortOptions(), "name", { ariaLabel: "Sorter klienter", onChange: renderTable });
  renderCoachPage({
    title: "Klienter",
    intro: "Se status, siste aktivitet og åpne klientplaner når du trenger kontekst.",
    actions: canInviteClient() ? [dsButton("Inviter klient", { variant: "primary", onClick: () => openClientInvite() })] : []
  }, [
    gettingStarted
      ? dsObjectHead({
        kicker: "Kom i gang",
        title: "Klienten eier utviklingsløpet",
        lead: "Portalen skal hjelpe klienten å samle og følge egen utvikling. Som coach støtter du med samtaler, spørsmål og relevante ressurser uten å overta arbeidet."
      })
      : dsFigures([
        [String(activity.length), "Nylig aktivitet", "siste 14 dager"],
        [String(visibleClients.length), "Klienter", "aktive i oversikten"],
        [String(upcoming), "Kommende samtaler", "dato satt i planen"]
      ]),
    !gettingStarted && activity.length ? dsSection({
      title: "Nylige oppdateringer",
      intro: "Klienter der noe er lagt til eller endret de siste 14 dagene."
    }, [clientActivityTable(activity)]) : null,
    dsSection({
      title: "Klientoversikt",
      intro: "Åpne en klient for å se mål og rammer for forløpet, utviklingsfokus, samtaler, refleksjoner og ressurser."
    }, [
      gettingStarted ? null : dsTools([search, coachFilter, sortFilter]),
      results
    ])
  ]);
  if (gettingStarted) results.replaceChildren(clientOverviewTable(sortClients(visibleClients, "name")));
  else renderTable();
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

function renderAdmin() {
  const coachTableSlot = el("div");
  const clientTableSlot = el("div");
  const resourceAdminSlot = el("div");
  const coachSearch = dsSearch("Søk coach", { onInput: () => renderCoaches() });
  const clientSearch = dsSearch("Søk klient, coach eller arbeidsgiver", { onInput: () => renderClientsTable() });
  const adminCoachFilter = dsSelect(
    [["all", "Alle coacher"], ...state.coaches.map((coach) => [coach.id, coach.name || "Uten navn"])],
    "all",
    { ariaLabel: "Filtrer klienter på coach", onChange: () => renderClientsTable() }
  );
  const adminSortFilter = dsSelect(
    [["name", "Navn A-Å"], ["next-session", "Neste samtale"], ["created-desc", "Opprettet nyest"], ["created-asc", "Opprettet eldst"]],
    "name",
    { ariaLabel: "Sorter klienter", onChange: () => renderClientsTable() }
  );
  const renderCoaches = () => {
    const query = coachSearch.value.trim().toLowerCase();
    const coaches = state.coaches.filter((coach) => [coach.name, coach.email].filter(Boolean).join(" ").toLowerCase().includes(query));
    coachTableSlot.replaceChildren(coaches.length ? dsTable({
      columns: "minmax(0, 1.4fr) minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, .6fr) 112px",
      label: "Coacher",
      head: ["Navn", "E-post", "Status", "Klienter", ""],
      rows: coaches.map((coach) => dsTableRow([
        dsPersonCell(coach.name),
        dsTextCell("E-post", coach.email || "Ikke registrert"),
        dsTableCell([dsStatus(coach.user_id ? "Innlogget" : "Ikke innlogget", coach.user_id ? "done" : "neutral")]),
        dsTextCell("Klienter", String(state.clients.filter((client) => (client.coach_ids || []).includes(coach.id)).length), true),
        el("div", { class: "ds-table-actions" }, [
          dsMenu([
            { label: "Rediger", onClick: () => openCoachEdit(coach) },
            { label: "Arkiver", onClick: () => deleteCoach(coach) }
          ], { label: `Valg for ${coach.name || "coach"}` })
        ])
      ]))
    }) : dsEmpty("Ingen rader ennå."));
    refreshIcons();
  };
  const renderClientsTable = () => {
    const clients = sortClients(filterClients(state.clients, clientSearch.value, adminCoachFilter.value), adminSortFilter.value);
    clientTableSlot.replaceChildren(clients.length ? dsTable({
      columns: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.6fr) minmax(0, 1fr) 112px",
      label: "Klienter",
      head: ["Navn", "Coach", "Status", "Tilgang", ""],
      rows: clients.map((client) => dsTableRow([
        dsPersonCell(client.name),
        dsTextCell("Coach", coachNames(client) || "-"),
        dsTextCell("Status", clientStatusLabel(client), true),
        dsTextCell("Tilgang", canOpenClient(client) ? "Kan åpnes" : "Kun oversikt", true),
        el("div", { class: "ds-table-actions" }, [
          canOpenClient(client) ? dsButton("Åpne", { variant: "text", onClick: () => openClientPlan(client) }) : null,
          dsMenu([
            { label: "Rediger", onClick: () => openClientEdit(client) },
            { label: "Arkiver", onClick: () => deleteClient(client) }
          ], { label: `Valg for ${client.name || "klient"}` })
        ])
      ], { muted: !canOpenClient(client) }))
    }) : dsEmpty("Ingen rader ennå."));
    refreshIcons();
  };
  renderCoachPage({
    title: "Administrasjon",
    intro: "Administrer mennesker, tilganger og innhold uten å åpne fortrolig klientarbeid."
  }, [
    dsFigures([
      [String(state.coaches.length), "Coacher", "med plattformtilgang"],
      [String(state.clients.length), "Klienter", "registrert"]
    ]),
    dsSection({ title: "Coacher", actions: [dsButton("Inviter coach", { onClick: () => openCoachInvite() })] }, [
      dsTools([coachSearch]),
      coachTableSlot
    ]),
    dsSection({
      title: "Klienter",
      intro: "Admin viser tilgang og status. Forløpsinnhold, notater og refleksjoner kan bare åpnes når du selv er coach for klienten.",
      actions: [dsButton("Inviter klient", { onClick: () => openClientInvite() })]
    }, [
      dsTools([clientSearch, adminCoachFilter, adminSortFilter]),
      clientTableSlot
    ]),
    resourceAdminSlot
  ]);
  renderCoaches();
  renderClientsTable();
  renderResourceAdminSection(resourceAdminSlot);
}

async function renderResourceAdminSection(slot) {
  const section = ({ intro = "", children = [] } = {}) => dsSection({
    title: "Ressurser",
    intro,
    actions: [dsButton("Ny ressurs", { onClick: () => openResourceAdminEditor() })]
  }, children);
  slot.replaceChildren(section({
    intro: "Opprett, kvalitetssikre og publiser innhold som coacher kan dele med klienter.",
    children: [dsEmpty("Henter ressursene …")]
  }));

  const library = await ensureResourceLibrary();
  if (!library?.getAdminResources) {
    slot.replaceChildren(section({ children: [dsEmpty("Ressursene kunne ikke åpnes. Last siden på nytt. Kontakt ansvarlig for portalen hvis problemet fortsetter.")] }));
    return;
  }

  let resources = [];
  try {
    resources = await library.getAdminResources(state.sb);
  } catch (error) {
    console.error("Could not load admin resources", error);
    slot.replaceChildren(section({ children: [dsEmpty("Kunne ikke hente ressurser. Prøv å laste siden på nytt. Kontakt ansvarlig for portalen hvis problemet fortsetter.")] }));
    return;
  }

  const tableSlot = el("div");
  const renderTable = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = resources.filter((resource) => {
      const matchesStatus = statusFilter.value === "all" || resource.status === statusFilter.value;
      const haystack = [
        resource.title,
        resource.slug,
        resource.introduction,
        resource.type,
        resource.phase,
        resource.status,
        resource.development_area_label,
        ...(resource.topic_tags || [])
      ].filter(Boolean).join(" ").toLowerCase();
      return matchesStatus && (!query || haystack.includes(query));
    });
    tableSlot.replaceChildren(filtered.length ? dsTable({
      columns: "minmax(0, 2.4fr) minmax(0, 1.2fr) 160px",
      label: "Ressurser",
      head: ["Ressurs", "Før publisering", ""],
      rows: filtered.map((resource) => {
        const missing = resourceReadinessItems(resource).filter((item) => item.group === "minimum" && !item.done).length;
        return dsTableRow([
          dsTableCell([
            el("span", { class: "ds-row-title", text: resource.title || "Uten tittel" }),
            el("span", { class: "ds-row-meta", text: [
              resourceLabel(RESOURCE_STATUS_OPTIONS, resource.status),
              resourceLabel(RESOURCE_TYPE_OPTIONS, resource.type),
              resource.development_area_label || "Ikke kategorisert"
            ].join(" · ") }),
            el("span", { class: "ds-table-text", text: resource.introduction || "Kort introduksjon mangler." })
          ]),
          dsTableCell([dsStatus(
            missing ? `${missing} obligatoriske felt mangler` : "Klar til publisering",
            missing ? "next" : "done"
          )]),
          el("div", { class: "ds-table-actions" }, [
            resource.status === "draft" ? dsButton("Publiser", { onClick: () => publishResource(resource) }) : null,
            dsButton(resource.status === "archived" ? "Reaktiver" : "Arkiver", { variant: "text", onClick: () => toggleResourceArchive(resource) })
          ])
        ], { link: true, muted: resource.status === "archived", onClick: () => openResourceAdminEditor(resource) });
      })
    }) : dsEmpty("Ingen ressurser funnet. Prøv et annet søk eller en annen status."));
    refreshIcons();
  };
  const search = dsSearch("Søk ressurs, område eller type", { onInput: renderTable });
  const statusFilter = dsSelect(
    [["all", "Alle statuser"], ...RESOURCE_STATUS_OPTIONS],
    "all",
    { ariaLabel: "Filtrer ressurser på status", onChange: renderTable }
  );

  slot.replaceChildren(section({
    intro: "Opprett, kvalitetssikre og publiser innhold som coacher kan dele med klienter.",
    children: [dsTools([search, statusFilter]), tableSlot]
  }));
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
    hidden: true,
    text: jsonText(blocks),
    "aria-hidden": "true",
    tabindex: "-1"
  });
  const list = el("div");
  const addSelect = el("select", { class: "ds-select" });
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
  const blockTypeGuide = dsDisclosure("Hva blokkene brukes til", RESOURCE_BLOCK_ADD_TYPES.map((type) => el("p", {}, [
    el("strong", { text: RESOURCE_BLOCK_TYPE_LABELS[type] || type }),
    el("span", { text: ` ${RESOURCE_BLOCK_TYPE_DESCRIPTIONS[type] || ""}` })
  ])));

  const renderBlockControls = (block, index) => {
    if (block.type === "intro") {
      return [el("textarea", { class: "ds-qa-field", rows: "3", text: block.content || "", placeholder: "Kort intro til ressursen", oninput: (event) => patchBlock(index, { content: event.target.value }) })];
    }
    if (block.type === "worksheet") {
      return [
        el("input", { class: "ds-input", type: "text", value: block.heading || "", placeholder: "Overskrift, f.eks. Arbeidsark", oninput: (event) => patchBlock(index, { heading: event.target.value }) }),
        el("textarea", { class: "ds-qa-field", rows: "4", text: (block.fields || []).join("\n"), placeholder: "Ett felt per linje", oninput: (event) => patchBlock(index, { fields: lineArray(event.target.value) }) })
      ];
    }
    if (block.type === "callout") {
      const toneSelect = el("select", { class: "ds-select", value: block.tone || "note", onchange: (event) => patchBlock(index, { tone: event.target.value }) });
      RESOURCE_CALLOUT_TONES.forEach(([value, label]) => {
        toneSelect.append(el("option", { value, text: label, selected: (block.tone || "note") === value }));
      });
      return [
        el("input", { class: "ds-input", type: "text", value: block.heading || "", placeholder: "Overskrift, f.eks. Merk", oninput: (event) => patchBlock(index, { heading: event.target.value }) }),
        el("textarea", { class: "ds-qa-field", rows: "4", text: block.content || "", placeholder: "Kort tekst som skal løftes frem", oninput: (event) => patchBlock(index, { content: event.target.value }) }),
        toneSelect
      ];
    }
    if (block.type === "model_cards") {
      return [
        el("input", { class: "ds-input", type: "text", value: block.heading || "", placeholder: "Valgfri overskrift", oninput: (event) => patchBlock(index, { heading: event.target.value }) }),
        el("textarea", {
          class: "ds-qa-field",
          rows: "5",
          text: modelCardsToText(block.cards || []),
          placeholder: "Ett kort per linje: Tittel | Forklaring",
          oninput: (event) => patchBlock(index, { cards: textToModelCards(event.target.value) })
        }),
        el("p", { class: "ds-form-help", text: "Bruk 2-4 kort. Eksempel: Affektiv motivasjon | Lede fordi det gir mening og energi." })
      ];
    }
    if (block.type === "quote") {
      return [
        el("textarea", { class: "ds-qa-field", rows: "3", text: block.quote || "", placeholder: "Sitat eller setning som skal løftes frem", oninput: (event) => patchBlock(index, { quote: event.target.value }) }),
        el("input", { class: "ds-input", type: "text", value: block.attribution || "", placeholder: "Valgfri kilde eller kontekst", oninput: (event) => patchBlock(index, { attribution: event.target.value }) })
      ];
    }
    if (block.type === "reflection_questions") {
      return [
        el("input", { class: "ds-input", type: "text", value: block.heading || "Refleksjonsspørsmål", placeholder: "Overskrift", oninput: (event) => patchBlock(index, { heading: event.target.value }) }),
        el("textarea", { class: "ds-qa-field", rows: "4", text: (block.questions || []).join("\n"), placeholder: "Ett spørsmål per linje", oninput: (event) => patchBlock(index, { questions: lineArray(event.target.value) }) })
      ];
    }
    if (block.type === "illustration") {
      const illustrations = (getFiles() || []).filter((file) => file.file_type === "illustration");
      const explicitValue = block.file_id || block.storage_path || "";
      const selectedValue = explicitValue || (illustrations.length === 1 ? illustrations[0].id || illustrations[0].storage_path : "");
      const select = el("select", {
        class: "ds-select",
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
          ? el("p", { class: "ds-form-help", text: "Én illustrasjon er lastet opp og brukes automatisk i preview. Blokken kan flyttes til ønsket plassering i innholdet." })
          : illustrations.length
            ? el("p", { class: "ds-form-help", text: "Velg hvilket opplastet bilde blokken skal vise, og flytt blokken til ønsket plassering med pilene over." })
            : el("p", { class: "ds-form-help", text: "Last opp en fil med type Bilde / illustrasjon under Filer og bilder, og velg den her etterpå." }),
        dsDisclosure("Avansert: bruk gammel illustrasjonsnøkkel", [
          el("input", {
            class: "ds-input",
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
        class: "ds-select",
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
        el("input", { class: "ds-input", type: "text", value: block.label || "", placeholder: "Lenketekst", oninput: (event) => patchBlock(index, { label: event.target.value }) }),
        select,
        downloadableFiles.length
          ? el("p", { class: "ds-form-help", text: "Nedlastingsblokker vises i klientressursen der blokken ligger." })
          : el("p", { class: "ds-form-help", text: "Last opp en fil med type Print/PDF eller Vedlegg under Filer og bilder først." })
      ];
    }
    return [
      el("input", { class: "ds-input", type: "text", value: block.heading || "", placeholder: "Overskrift", oninput: (event) => patchBlock(index, { heading: event.target.value }) }),
      el("textarea", { class: "ds-qa-field", rows: "4", text: block.content || "", placeholder: "Tekst", oninput: (event) => patchBlock(index, { content: event.target.value }) })
    ];
  };

  const render = (highlightIndex = -1) => {
    serialize();
    list.replaceChildren(...blocks.map((block, index) => el("section", { class: "ds-block" }, [
      el("div", { class: "ds-block-head" }, [
        el("h4", { class: "ds-block-title", text: RESOURCE_BLOCK_TYPE_LABELS[block.type] || "Blokk" }),
        el("div", { class: "ds-block-tools" }, [
          dsIconButton("arrow-up", { label: "Flytt opp", disabled: index === 0, onClick: () => preserveScroll(() => { [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]]; render(index - 1); }) }),
          dsIconButton("arrow-down", { label: "Flytt ned", disabled: index === blocks.length - 1, onClick: () => preserveScroll(() => { [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]]; render(index + 1); }) }),
          dsIconButton("trash-2", { label: "Slett blokk", onClick: () => preserveScroll(() => { blocks.splice(index, 1); render(); }) })
        ])
      ]),
      ...renderBlockControls(block, index),
      el("div", {}, [dsButton("Legg til under", { variant: "text", iconName: "plus", onClick: () => addBlockAfter(index) })])
    ])));
    if (highlightIndex >= 0) {
      list.children[highlightIndex]?.scrollIntoView({ block: "nearest" });
    }
    refreshIcons();
  };

  const editor = el("div", {}, [
    hidden,
    blockTypeGuide,
    list,
    el("div", { class: "ds-block-add" }, [
      addSelect,
      dsButton("Legg til nederst", { iconName: "plus", onClick: () => addBlockAfter(blocks.length - 1) })
    ])
  ]);
  editor.refresh = render;
  render();
  return editor;
}

function createResourceAdminPreview(library, getResourceDraft) {
  const previewSlot = el("div");
  const renderPreview = () => {
    try {
      const draft = getResourceDraft();
      previewSlot.replaceChildren(dsSheet([
        el("article", { class: "ds-detail" }, [
          dsObjectHead({
            kicker: resourceKicker(draft),
            title: draft.title || "Ny ressurs",
            lead: library.resourceIntroduction?.(draft) || draft.introduction || ""
          }),
          dsSection({ title: "Innhold" }, [resourceClientContent(draft)])
        ])
      ]));
      hydrateResourceMedia(previewSlot);
      refreshIcons();
    } catch (error) {
      previewSlot.replaceChildren(el("p", { class: "ds-empty-text", text: userFacingError(error, "Kunne ikke vise forhåndsvisningen.") }));
    }
  };
  const wrapper = el("aside", { class: "ds-editor-preview" }, [
    el("div", { class: "ds-editor-preview-head" }, [
      el("div", {}, [
        el("p", { class: "ds-form-section-title", text: "Forhåndsvisning" }),
        el("p", { class: "ds-form-help", text: "Viser ressursen med samme design som klient og coach møter." })
      ]),
      dsButton("Oppdater", { variant: "text", onClick: renderPreview })
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
    const shouldDownload = ["printable", "attachment", "illustration"].includes(file.file_type);
    const url = await library.getResourceFileUrl(state.sb, file.storage_path, 3600, { download: shouldDownload });
    if (shouldDownload) {
      const link = el("a", { href: url, download: "" });
      document.body.append(link);
      link.click();
      link.remove();
      return;
    }
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

function resourceUploadKind(file) {
  const mimeType = String(file?.type || "").toLowerCase();
  const fileName = String(file?.name || "").toLowerCase();
  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) return "pdf";
  if (mimeType.startsWith("image/") || /\.(avif|gif|jpe?g|png|svg|webp)$/.test(fileName)) return "image";
  if (mimeType.startsWith("audio/") || /\.(aac|m4a|mp3|ogg|wav)$/.test(fileName)) return "audio";
  if (mimeType.startsWith("video/") || /\.(m4v|mov|mp4|webm)$/.test(fileName)) return "video";
  return "other";
}

function inferredResourceFileType(file) {
  const kind = resourceUploadKind(file);
  if (kind === "pdf") return "printable";
  if (kind === "image") return "illustration";
  if (kind === "audio") return "audio";
  if (kind === "video") return "video";
  return "attachment";
}

function resourceFileTypeError(file, fileType) {
  const kind = resourceUploadKind(file);
  if (["cover_image", "illustration"].includes(fileType) && kind !== "image") {
    return "Forsidebilde og illustrasjon må være en bildefil. Velg Print/PDF for en klientrettet PDF, eller Vedlegg for et supplerende dokument.";
  }
  if (fileType === "printable" && kind !== "pdf") {
    return "Print/PDF må være en PDF-fil.";
  }
  if (fileType === "audio" && kind !== "audio") {
    return "Lyd må være en lydfil.";
  }
  if (fileType === "video" && kind !== "video") {
    return "Video må være en videofil.";
  }
  return "";
}

function createResourceFileManager(resource, library, options = {}) {
  const { onFilesChange = null } = options;
  if (!resource?.id) {
    return el("p", { class: "ds-empty-text", text: "Lagre ressursen først. Deretter kan du laste opp illustrasjoner, PDF-er og andre vedlegg." });
  }

  const fileList = el("div");
  const fileInput = el("input", { class: "ds-input", type: "file" });
  const fileType = el("select", { class: "ds-select" });
  RESOURCE_FILE_TYPE_OPTIONS.forEach(([value, label]) => fileType.append(el("option", { value, text: label })));
  fileType.value = "attachment";
  const displayName = el("input", { class: "ds-input", type: "text", placeholder: "Visningsnavn, valgfritt" });
  const message = el("p", { class: "ds-form-message", role: "status" });
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    fileType.value = inferredResourceFileType(file);
    message.textContent = "";
  });

  const renderFiles = () => {
    const files = resource.files || [];
    const fileRow = (file) => el("div", { class: "ds-file-row" }, [
      el("div", {}, [
        el("strong", { text: file.display_name }),
        el("span", { text: resourceLabel(RESOURCE_FILE_TYPE_OPTIONS, file.file_type) || file.file_type }),
        el("small", { text: file.file_type === "printable"
          ? "Løftes automatisk frem som PDF-versjon øverst i ressursen."
          : file.file_type === "cover_image"
            ? "Vises sammen med den fremhevede PDF-versjonen."
            : file.file_type === "attachment"
              ? "Kan legges inn som vedlegg der det passer i innholdet."
              : file.file_type === "illustration"
                ? "Kan plasseres fritt med en Bilde / illustrasjon-blokk."
                : "Lagret som ressursfil." })
      ]),
      dsButton("Fjern", { variant: "text", onClick: async () => {
        if (!await confirmDelete(`Fjerne "${file.display_name}" fra ressursen?`, { danger: true })) return;
        await library.archiveResourceFile(state.sb, file.id);
        resource.files = files.filter((item) => item.id !== file.id);
        onFilesChange?.(resource.files);
        renderFiles();
      } })
    ]);
    const covers = files.filter((file) => file.file_type === "cover_image");
    const illustrations = files.filter((file) => file.file_type === "illustration");
    const printables = files.filter((file) => file.file_type === "printable");
    const attachments = files.filter((file) => file.file_type === "attachment");
    const otherFiles = files.filter((file) => !["cover_image", "illustration", "printable", "attachment"].includes(file.file_type));
    const groups = [
      ["Forsidebilder", "Brukes i den fremhevede PDF-flaten når ressursen har en PDF-versjon.", covers],
      ["Bilder og illustrasjoner", "Plasseres fritt i innholdet med Bilde / illustrasjon-blokker.", illustrations],
      ["PDF-versjoner", "Første PDF løftes automatisk frem øverst i ressursen.", printables],
      ["Vedlegg", "Kan plasseres i innholdet med en PDF/vedlegg-blokk.", attachments],
      ["Andre filer", "Lyd, video og andre vedlegg.", otherFiles]
    ].filter(([, , groupFiles]) => groupFiles.length);
    fileList.replaceChildren(...groups.map(([title, help, groupFiles]) => el("section", {}, [
      el("p", { class: "ds-form-label", text: title }),
      el("p", { class: "ds-form-help", text: help }),
      ...groupFiles.map(fileRow)
    ])));
    if (!files.length) fileList.replaceChildren(el("p", { class: "ds-empty-text", text: "Ingen filer lagt til ennå." }));
    refreshIcons();
  };
  renderFiles();

  return el("div", {}, [
    fileList,
    el("div", { class: "ds-form-row" }, [
      dsFormField("Fil", fileInput),
      dsFormField("Filtype", fileType)
    ]),
    el("div", { class: "ds-form-row" }, [
      dsFormField("Visningsnavn", displayName),
      el("div", { class: "ds-form-field", style: "align-self: end" }, [
        dsButton("Last opp", { iconName: "upload", onClick: async () => {
        const file = fileInput.files?.[0];
        if (!file) {
          message.textContent = "Velg en fil først.";
          return;
        }
        const fileTypeError = resourceFileTypeError(file, fileType.value);
        if (fileTypeError) {
          message.textContent = fileTypeError;
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
          fileType.value = "attachment";
          displayName.value = "";
          message.textContent = "Fil lastet opp.";
          renderFiles();
        } catch (error) {
          message.textContent = userFacingError(error, "Kunne ikke laste opp filen.");
        }
        } })
      ])
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
  const library = getResourceLibrary();
  const missing = [];
  if (!payload.title) missing.push("tittel");
  if (!library?.resourceIntroduction?.(payload)) missing.push("kort introduksjon");
  if (!payload.type) missing.push("type");
  if (!payload.phase) missing.push("fase");
  if (!hasPublishableContent(payload, files)) missing.push("minst én innholdsblokk, fil eller illustrasjon");
  if (missing.length) {
    throw new Error(`Mangler: ${missing.join(", ")}.`);
  }
}

function resourceReadinessItems(payload) {
  const library = getResourceLibrary();
  const files = payload.files || [];
  const items = [
    ["minimum", "Tittel", Boolean(payload.title)],
    ["minimum", "Type", Boolean(payload.type)],
    ["minimum", "Fase", Boolean(payload.phase)],
    ["minimum", "Kort introduksjon", Boolean(library?.resourceIntroduction?.(payload))],
    ["minimum", "Innhold, fil eller illustrasjon", hasPublishableContent(payload, files)],
    ["recommended", "Utviklingsområde", Boolean(library?.resourceDevelopmentArea?.(payload))],
    ["recommended", "Hva ressursen skal hjelpe med", Boolean(payload.intended_outcome)],
    ["recommended", "Best brukt når", Array.isArray(payload.best_used_when) && payload.best_used_when.length > 0],
    ["recommended", "Ikke egnet når", Array.isArray(payload.not_for) && payload.not_for.length > 0],
    ["recommended", "Veiledning til coach", Boolean(payload.coach_guidance)],
    ["recommended", "Forslag til sendemelding", Boolean(payload.suggested_coach_note)],
    ["quality", "Faglig vurdering", payload.review_status && payload.review_status !== "draft"],
    ["quality", "Faglig grunnlag", Boolean(payload.basis)]
  ];
  return items.map(([group, label, done]) => ({ group, label, done }));
}

function createResourceReadinessPanel(getDraftResource) {
  const list = el("ul", { class: "ds-ready-list" });
  const summary = el("p", { class: "ds-context-text" });
  const panel = el("section", { class: "ds-ready" }, [
    el("div", { class: "ds-context ds-context--note" }, [el("div", {}, [
      el("p", { class: "ds-context-label", text: "Før publisering" }),
      summary,
      list
    ])])
  ]);

  const refresh = () => {
    try {
      const draft = getDraftResource();
      const items = resourceReadinessItems(draft);
      const minimumMissing = items.filter((item) => item.group === "minimum" && !item.done);
      const recommendedMissing = items.filter((item) => item.group === "recommended" && !item.done);
      const qualityMissing = items.filter((item) => item.group === "quality" && !item.done);
      summary.textContent = minimumMissing.length
        ? "Fyll ut disse feltene før ressursen kan publiseres."
        : recommendedMissing.length || qualityMissing.length
          ? "Kan publiseres. Dette kan styrke kvaliteten før deling."
          : "Klar til publisering.";
      const visibleItems = minimumMissing.length
        ? minimumMissing
        : [...recommendedMissing, ...qualityMissing].slice(0, 6);
      list.replaceChildren(...(visibleItems.length ? visibleItems.map((item) => el("li", {}, [
        dsStatus(item.group === "minimum" ? item.label : `Anbefalt: ${item.label}`, "next")
      ])) : [
        el("li", {}, [dsStatus("Klar", "done")])
      ]));
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
  const library = getResourceLibrary();
  const valueText = (key) => String(values?.[key] ?? "").trim();
  const title = valueText("title");
  const slug = valueText("slug") || resourceSlug(title);
  if (!title && validatePublished) throw new Error("Tittel må fylles ut.");
  if (!slug && validatePublished) throw new Error("Slug må fylles ut.");

  const estimatedDuration = values.estimated_duration ? Number(values.estimated_duration) : null;
  if (estimatedDuration !== null && (!Number.isInteger(estimatedDuration) || estimatedDuration <= 0)) {
    throw new Error("Varighet må være et positivt heltall.");
  }

  const status = values.status || currentResource?.status || "draft";
  const introduction = String(values.short_intro ?? library?.resourceIntroduction?.(currentResource) ?? "").trim();
  const developmentArea = values.development_area || library?.resourceDevelopmentArea?.(currentResource) || "";
  const reviewStatus = values.review_status || currentResource?.review_status || "approved_for_pilot";
  const reviewCompleted = ["approved_for_pilot", "reviewed"].includes(reviewStatus);
  const reviewChanged = reviewCompleted && reviewStatus !== currentResource?.review_status;
  const reviewer = state.profile?.name || state.user?.email || "";

  const payload = {
    title,
    slug,
    summary: introduction,
    type: values.type || "framework",
    format: values.format || "native",
    phase: values.phase || "reflection",
    visibility: values.visibility || "client_assignable",
    status,
    archived_at: status === "archived" ? (currentResource?.archived_at || new Date().toISOString()) : null,
    review_status: reviewStatus,
    language: currentResource?.language || "no",
    estimated_duration: estimatedDuration,
    difficulty: currentResource?.difficulty || null,
    intended_outcome: valueText("intended_outcome") || null,
    best_used_when: textLines(values.best_used_when),
    not_for: textLines(values.not_for),
    coach_guidance: valueText("coach_guidance") || null,
    client_intro: introduction || null,
    suggested_coach_note: valueText("suggested_coach_note") || null,
    default_context_types: Array.isArray(values.default_context_types) ? values.default_context_types : textLines(values.default_context_types),
    content_json: parseJsonArray(values.content_json, "Content JSON"),
    reflection_prompts: currentResource?.reflection_prompts || [],
    next_step_prompt: valueText("next_step_prompt") || null,
    basis: valueText("basis") || null,
    reviewed_by: reviewChanged ? reviewer : currentResource?.reviewed_by || null,
    last_reviewed_at: reviewChanged ? new Date().toISOString().slice(0, 10) : currentResource?.last_reviewed_at || null,
    tags: library?.withResourceDevelopmentArea?.(currentResource?.tags || [], developmentArea) || currentResource?.tags || []
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
      short_intro: library.resourceIntroduction(resource) || "Ikke fylt ut ennå.",
      content_json: jsonText(resource?.content_json || [])
    };
    return {
      ...resource,
      ...parseResourceAdminPayload(values, resource, { validatePublished: false }),
      files: resource?.files || []
    };
  };

  const duplicateResource = async () => {
    if (!library?.duplicateResource || !resource?.id) return;
    $("#drawer-message").textContent = "Dupliserer...";
    await library.duplicateResource(state.sb, resource.id);
    $("#entity-drawer").close();
    await renderAdmin();
  };

  let blockEditor = null;
  const refreshBlocks = () => blockEditor?.refresh?.();
  const editorBlocks = [...(resource?.content_json || [])];
  const legacyReflectionPrompts = resource?.reflection_prompts || [];
  if (legacyReflectionPrompts.length && !editorBlocks.some((block) => block?.type === "reflection_questions")) {
    editorBlocks.push({
      type: "reflection_questions",
      heading: "Refleksjonsspørsmål",
      questions: legacyReflectionPrompts
    });
  }
  blockEditor = createResourceBlockEditor(editorBlocks, {
    getFiles: () => resource?.files || [],
    onChange: () => {}
  });

  const fieldNames = [
    "title", "short_intro", "slug", "content_json", "next_step_prompt",
    "intended_outcome", "best_used_when", "not_for", "coach_guidance",
    "suggested_coach_note", "development_area", "type", "format", "phase", "estimated_duration",
    "default_context_types", "status", "visibility", "review_status", "basis"
  ];
  const field = (spec) => spec instanceof Node ? spec : renderSpec(spec);
  const editorMain = el("div", { class: "ds-editor-form ds-form" }, [
    createResourceReadinessPanel(getDraftResource),
    renderSpec(sectionSpec("Start her", "Gi ressursen en tydelig tittel, inngang og anbefalt neste steg.")),
    field(inputSpec("title", "Tittel", "text", resource?.title || "")),
    field(textareaSpec("short_intro", "Kort introduksjon", library.resourceIntroduction(resource), { rows: "3", placeholder: "Hva er ressursen, og hvorfor er den relevant? Vises i biblioteket og øverst i ressursen." })),
    field(textareaSpec("next_step_prompt", "Anbefalt neste steg", resource?.next_step_prompt || "", { rows: "2", placeholder: "Hva kan klienten gjøre etter å ha brukt ressursen?" })),
    renderSpec(sectionSpec("Faglig plassering", "Gjør ressursen enkel å finne og vurdere i biblioteket.")),
    el("div", { class: "ds-form-row" }, [
      field(selectSpec("development_area", "Utviklingsområde", [
        ["", "Velg utviklingsområde"],
        ...library.RESOURCE_DEVELOPMENT_AREA_OPTIONS
      ], library.resourceDevelopmentArea(resource))),
      field(selectSpec("type", "Ressurstype", RESOURCE_TYPE_OPTIONS, resource?.type || "framework"))
    ]),
    el("div", { class: "ds-form-row" }, [
      field(inputSpec("estimated_duration", "Tidsbruk i minutter", "number", resource?.estimated_duration || "", { min: "1" })),
      field(selectSpec("phase", "Brukes typisk i", RESOURCE_PHASE_OPTIONS, resource?.phase || "reflection"))
    ]),
    renderSpec(sectionSpec("Innhold", "Bygg opp leseflyten med korte, tydelige innholdsblokker.")),
    blockEditor,
    renderSpec(sectionSpec("Filer og bilder", "Filer lagres privat og blir bare tilgjengelige for brukere med riktig tilgang. Ressursen fungerer også uten filer.")),
    createResourceFileManager(resource, library, { onFilesChange: refreshBlocks }),
    dsFormDisclosure("For coach og deling", "Hjelper coachen å vurdere når ressursen passer og hva som bør sendes med.", [
      field(textareaSpec("intended_outcome", "Hva ressursen skal hjelpe med", resource?.intended_outcome || "", { rows: "3" })),
      field(textareaSpec("best_used_when", "Best brukt når", (resource?.best_used_when || []).join("\n"), { rows: "3", placeholder: "Ett punkt per linje" })),
      field(textareaSpec("not_for", "Ikke egnet når", (resource?.not_for || []).join("\n"), { rows: "3", placeholder: "Ett punkt per linje" })),
      field(textareaSpec("coach_guidance", "Veiledning til coach", resource?.coach_guidance || "", { rows: "4" })),
      field(textareaSpec("suggested_coach_note", "Forslag til sendemelding", resource?.suggested_coach_note || "", { rows: "3", placeholder: "Coachen kan redigere teksten før sending." })),
      field(checkboxGroupSpec("default_context_types", "Kan knyttes til", RESOURCE_CONTEXT_OPTIONS, resource?.default_context_types || ["program"]))
    ], { open: true }),
    dsFormDisclosure("Publisering og kvalitet", "Styr synlighet og dokumenter faglig kvalitetssikring.", [
      el("div", { class: "ds-form-row" }, [
        field(selectSpec("status", "Status", RESOURCE_STATUS_OPTIONS, resource?.status || "draft")),
        field(selectSpec("visibility", "Synlighet", RESOURCE_VISIBILITY_OPTIONS, resource?.visibility || "client_assignable"))
      ]),
      field(selectSpec("review_status", "Faglig vurdering", RESOURCE_REVIEW_STATUS_OPTIONS, resource?.review_status || "draft")),
      resource?.reviewed_by || resource?.last_reviewed_at ? el("p", {
        class: "ds-form-help",
        text: `Sist vurdert${resource?.reviewed_by ? ` av ${resource.reviewed_by}` : ""}${resource?.last_reviewed_at ? ` ${formatDate(resource.last_reviewed_at)}` : ""}. Oppdateres automatisk når faglig vurdering godkjennes.`
      }) : null,
      field(textareaSpec("basis", "Faglig grunnlag", resource?.basis || "", { rows: "3" })),
      el("input", { type: "hidden", name: "slug", value: resource?.slug || "" }),
      el("input", { type: "hidden", name: "format", value: resource?.format || "native" })
    ].filter(Boolean))
  ]);
  const editorWorkspace = el("div", { class: "ds-editor" }, [
    editorMain,
    createResourceAdminPreview(library, getDraftResource)
  ]);
  specs = [customSpec(fieldNames, editorWorkspace)];
  const returnView = state.view;
  const renderAfterResourceEdit = async () => {
    if (returnView === "resources") await renderResources();
    else await renderAdmin();
  };
  openEntityDrawer(isNew ? "Ny ressurs" : resource.title, "Fagbibliotek", specs, async (values) => {
    const payload = parseResourceAdminPayload(values, resource);
    if (isNew) await library.createResource(state.sb, payload);
    else await library.updateResource(state.sb, resource.id, payload);
    await renderAfterResourceEdit();
  }, {
    size: "workspace",
    saveLabel: isNew || resource?.status === "draft" ? "Lagre utkast" : "Lagre endringer",
    startActions: resource?.id ? [dsButton("Dupliser", { variant: "text", onClick: duplicateResource })] : [],
    ...(resource?.id ? {
    dangerLabel: resource.status === "archived" ? "Reaktiver" : "Arkiver",
    onDanger: async () => {
      if (resource.status === "archived") await library.reactivateResource(state.sb, resource.id, "draft");
      else await library.archiveResource(state.sb, resource.id);
      await renderAfterResourceEdit();
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
  } else if (await confirmDelete(`Arkivere "${resource.title}"?`, { confirmLabel: "Arkiver" })) {
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

  const intro = "Finn, vurder og del faglige ressurser som støtter arbeidet mellom samtalene.";
  const showPage = (children) => {
    setHeader("", "Ressurser", [], intro);
    $("#content").replaceChildren(dsPage({ title: "Ressurser", intro, className: "ds-coach-page" }, children));
  };
  showPage([dsSheet([dsEmpty("Finner ressursene dine …")])]);

  const library = await ensureResourceLibrary();
  if (!library) {
    showPage([dsSheet([dsEmpty("Ressursene kunne ikke åpnes. Prøv å laste siden på nytt. Kontakt ansvarlig for portalen hvis problemet fortsetter.")])]);
    return;
  }

  let resources = [];
  try {
    resources = await library.getPublishedResources(state.sb);
  } catch (error) {
    console.error("Could not load published resources", error);
    showPage([dsSheet([dsEmpty("Kunne ikke hente ressursene. Prøv å laste siden på nytt. Kontakt ansvarlig for portalen hvis problemet fortsetter.")])]);
    return;
  }

  state.resourceCache = resources;
  if (!state.selectedResourceSlug || !resources.some((resource) => resource.slug === state.selectedResourceSlug)) {
    const hadSelection = Boolean(state.selectedResourceSlug);
    state.selectedResourceSlug = resources[0]?.slug || null;
    if (hadSelection) state.resourceLibraryDetail = false;
  }

  const search = dsSearch("Søk etter tema eller ressurs", { onInput: () => render() });
  const developmentAreaFilter = dsSelect(
    [["all", "Alle utviklingsområder"], ...library.RESOURCE_DEVELOPMENT_AREA_OPTIONS, ["uncategorized", "Ikke kategorisert"]],
    "all",
    { ariaLabel: "Filtrer på utviklingsområde", onChange: () => render() }
  );
  const typeFilter = dsSelect(
    [["all", "Alle typer"], ["framework", "Rammeverk"], ["guided_session", "Veiledet økt"], ["exercise", "Øvelse"], ["worksheet", "Arbeidsark"]],
    "all",
    { ariaLabel: "Filtrer på type", onChange: () => render() }
  );
  const tools = el("div", { class: "ds-chooser-tools" }, [
    search,
    developmentAreaFilter,
    typeFilter,
    el("p", { class: "ds-list-note", text: `${resources.length} ressurser tilgjengelig for vurdering og deling.` })
  ]);
  const groupsSlot = el("div");
  const list = el("nav", { class: "ds-list ds-chooser-list", "aria-label": "Ressurser" }, [tools, groupsSlot]);
  const detailSlot = el("div", { class: "ds-sheet-body" });
  const sheet = el("div", { class: "ds-sheet ds-library" });
  const admin = state.profile.role === "admin";
  let lastMobileDetail = null;

  const selectResource = (resource) => {
    state.selectedResourceSlug = resource.slug;
    if (isCompact()) state.resourceLibraryDetail = true;
    render();
  };

  const render = () => {
    const compact = isCompact();
    const filtered = filterResourceList(resources, {
      query: search.value,
      developmentArea: developmentAreaFilter.value,
      type: typeFilter.value
    });
    if (!filtered.some((resource) => resource.slug === state.selectedResourceSlug)) {
      state.selectedResourceSlug = filtered[0]?.slug || resources[0]?.slug || null;
      if (!filtered.length) state.resourceLibraryDetail = false;
    }
    const selected = filtered.find((resource) => resource.slug === state.selectedResourceSlug) || filtered[0] || null;
    const groups = library.groupResourcesByDevelopmentArea(filtered);
    groupsSlot.replaceChildren(
      ...(filtered.length
        ? groups.map((group) => el("section", { class: "ds-chooser-group" }, [
          el("p", { class: "ds-list-title", text: group.label }),
          ...group.resources.map((resource) => dsRow({
            title: resource.title,
            meta: resourceKicker(resource),
            selected: !compact && resource.slug === selected?.slug,
            onClick: () => selectResource(resource)
          }))
        ]))
        : [dsEmpty("Ingen ressurser funnet. Prøv et annet søk eller fjern filtrene.")])
    );
    const showDetail = !compact || state.resourceLibraryDetail;
    detailSlot.replaceChildren(resourceDetail(selected, {
      admin,
      back: compact,
      onBack: () => {
        state.resourceLibraryDetail = false;
        render();
      }
    }));
    sheet.className = dsClass("ds-sheet ds-library", !compact && "ds-sheet--split");
    sheet.replaceChildren(...(compact ? [showDetail ? detailSlot : list] : [list, detailSlot]));
    if (!$(".ds-coach-page")) showPage([sheet]);
    hydrateResourceMedia(detailSlot);
    refreshIcons();
    if (compact && showDetail && lastMobileDetail !== selected?.slug) $(".ds-back")?.focus();
    lastMobileDetail = compact && showDetail ? selected?.slug : null;
  };

  showPage([sheet]);
  render();
}

function getResourceLibrary() {
  return window.RaederResourceLibrary || null;
}

async function ensureResourceLibrary() {
  const loaded = getResourceLibrary();
  if (loaded) return loaded;

  if (!state.resourceLibraryPromise) {
    state.resourceLibraryPromise = import("./js/resources/resources.api.js?v=design-system-184")
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
    state.leadershipLibraryPromise = import("./js/leadership/leadership.api.js?v=polish-148")
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
  return Boolean(
    state.coach?.id
    && ["coach", "admin"].includes(state.profile?.role)
  );
}

function openSendResourceDrawer(resource) {
  if (!resource || !canShareResources()) return;
  const library = getResourceLibrary();
  const clients = getVisibleClients().filter((client) => canShareResourceToClient(client));
  if (!clients.length) {
    showAppMessage("Ingen klienter å sende til", "Du har ingen klienter med åpne forløp som kan motta ressurser ennå.", { kicker: "Ressurser" });
    return;
  }

  const resourceSummary = el("div", { class: "ds-context ds-context--note" }, [el("div", {}, [
    el("p", { class: "ds-context-label", text: "Ressursen klienten mottar" }),
    el("p", { class: "ds-form-label", text: resource.title }),
    el("p", { class: "ds-context-text", text: library?.resourceIntroduction?.(resource) || "" })
  ])]);
  openEntityDrawer(`Del ressurs`, "Fagbibliotek", [
    customSpec("send_resource_summary", resourceSummary),
    customSpec("send_resource_basis", createSendResourceBasis(resource)),
    sectionSpec("Mottaker og plassering", "Velg hvem som skal få ressursen og hvor den hører hjemme i forløpet."),
    selectSpec("clientId", "Klient", clients.map((client) => [client.id, client.name || client.email || "Uten navn"]), clients[0]?.id || ""),
    customSpec(["contextType", "contextId", "existingSharedResourceId"], createResourceContextPicker(resource, clients)),
    sectionSpec("Personlig melding", "Forklar kort hvorfor du sender ressursen. Denne teksten vises tydelig for klienten."),
    textareaSpec("coachNote", "Melding fra deg", resource.suggested_coach_note || "", {
      rows: "4",
      placeholder: "Skriv kort hvorfor du sender ressursen, og hva klienten bør bruke den til."
    })
  ], async (values) => {
    await sendResourceToClient(resource, values);
  }, {
    saveLabel: "Send ressurs"
  });
}

function createSendResourceBasis(resource) {
  return dsFormDisclosure("Vurdering for coach", "Når ressursen passer og ikke passer", [
    resource.intended_outcome ? el("p", { text: resource.intended_outcome }) : null,
    resourceGuidanceGroup("Best brukt når", resource.best_used_when || []),
    resourceGuidanceGroup("Ikke egnet når", resource.not_for || [])
  ].filter(Boolean));
}

function resourceDefaultContextTypes(resource) {
  const values = Array.isArray(resource?.default_context_types) && resource.default_context_types.length
    ? resource.default_context_types
    : ["program"];
  return new Set(["program", ...values]);
}

function findExistingSharedResourceForContext(sharedResources = [], resource, contextType, contextId) {
  const normalizedContextType = contextType || "program";
  const normalizedContextId = contextId || "";
  return (sharedResources || []).find((item) => {
    const itemContextType = item.context_type || "program";
    const itemContextId = item.context_id || "";
    const itemResourceId = item.resource_id || item.resource?.id;
    return itemResourceId === resource?.id
      && itemContextType === normalizedContextType
      && itemContextId === normalizedContextId
      && item.status !== "archived"
      && !item.archived_at;
  }) || null;
}

function createResourceContextPicker(resource, clients) {
  const allowed = resourceDefaultContextTypes(resource);
  const contextType = el("input", { type: "hidden", name: "contextType", value: "program" });
  const contextId = el("input", { type: "hidden", name: "contextId", value: "" });
  const existingSharedResourceId = el("input", { type: "hidden", name: "existingSharedResourceId", value: "" });
  const picker = el("select", { class: "ds-select" });
  const field = dsFormField("Hvor skal ressursen ligge?", picker, {
    help: "Velg en konkret plassering hvis det gjør ressursen lettere å forstå for klienten."
  });
  const message = field.querySelector(".ds-form-help");
  const resendMessage = el("p", { class: "ds-form-help", text: "Det sendes også en e-post til klientens registrerte adresse." });
  const wrapper = el("div", { style: "display: contents" }, [
    field,
    contextType,
    contextId,
    existingSharedResourceId,
    resendMessage
  ]);

  const option = (type, id, label, disabled = false, existingShareId = "") => ({ type, id, label, disabled, existingShareId });
  const buildOptions = (data) => {
    const options = [option(
      "program",
      "",
      "Hele forløpet",
      false,
      findExistingSharedResourceForContext(data?.sharedResources, resource, "program", "")?.id || ""
    )];
    if (allowed.has("focus_area")) {
      (data?.areas || []).forEach((area) => {
        options.push(option(
          "focus_area",
          area.id,
          `Fokusoppdrag: ${area.title || "Uten tittel"}`,
          !area.id,
          findExistingSharedResourceForContext(data?.sharedResources, resource, "focus_area", area.id)?.id || ""
        ));
      });
    }
    if (allowed.has("session")) {
      (data?.sessions || []).forEach((session) => {
        options.push(option(
          "session",
          session.id,
          `Samtale: ${session.focus || formatDate(session.session_date) || "Uten tittel"}`,
          !session.id,
          findExistingSharedResourceForContext(data?.sharedResources, resource, "session", session.id)?.id || ""
        ));
      });
    }
    if (allowed.has("experiment")) {
      (data?.actions || []).forEach((action) => {
        options.push(option(
          "experiment",
          action.id,
          `Eksperiment: ${action.title || "Uten tittel"}`,
          !action.id,
          findExistingSharedResourceForContext(data?.sharedResources, resource, "experiment", action.id)?.id || ""
        ));
      });
    }
    if (allowed.has("reflection")) {
      (data?.reflections || []).forEach((reflection) => {
        const text = (reflection.body || "").trim();
        options.push(option(
          "reflection",
          reflection.id,
          `Refleksjon: ${text ? text.slice(0, 48) : formatDate(reflection.created_at) || "Uten tittel"}`,
          !reflection.id,
          findExistingSharedResourceForContext(data?.sharedResources, resource, "reflection", reflection.id)?.id || ""
        ));
      });
    }
    return options;
  };

  const syncValue = () => {
    const selected = picker.selectedOptions[0];
    contextType.value = selected?.dataset.contextType || "program";
    contextId.value = selected?.value || "";
    existingSharedResourceId.value = selected?.dataset.existingShareId || "";
    const isResend = Boolean(existingSharedResourceId.value);
    const saveLabel = $("#drawer-save span");
    if (saveLabel) saveLabel.textContent = isResend ? "Send på nytt" : "Send ressurs";
    resendMessage.textContent = isResend
      ? "Denne ressursen er allerede delt her. Sender du nå, sender portalen en ny e-post, og tidligere respons bevares."
      : "Det sendes også en e-post til klientens registrerte adresse.";
  };

  const renderOptions = (options) => {
    picker.replaceChildren(...options.map((item) => el("option", {
      value: item.id,
      text: item.label,
      disabled: item.disabled,
      "data-context-type": item.type,
      "data-existing-share-id": item.existingShareId || ""
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
  if (!client || !canShareResources()) return false;
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

  const sharedResource = await library.shareResourceWithClient(state.sb, {
    resourceId: resource.id,
    clientId: client.id,
    programId: program.id,
    contextType: values.contextType || "program",
    contextId: values.contextId || null,
    coachNote: values.coachNote
  });
  delete state.programCache[client.id];

  let emailError = null;
  try {
    if (!library?.sendSharedResourceEmail) throw new Error("E-postfunksjonen er ikke tilgjengelig.");
    await library.sendSharedResourceEmail(state.sb, sharedResource.id);
  } catch (error) {
    emailError = error;
    console.error("Could not send resource email", error);
  }

  setTimeout(() => {
    const recipient = client.name || client.email || "klienten";
    const isResend = Boolean(values.existingSharedResourceId);
    const message = emailError
      ? `${resource.title} er sendt til ${recipient}, men e-post ble ikke sendt: ${userFacingError(emailError, "Prøv å sende på nytt senere.")}`
      : isResend
        ? `${resource.title} er sendt på nytt til ${recipient}. E-post er sendt til klientens registrerte adresse.`
        : `${resource.title} er sendt til ${recipient}. E-post er sendt til klientens registrerte adresse.`;
    showAppMessage(isResend ? "Ressurs sendt på nytt" : "Ressurs sendt", message, { kicker: "Ressurser" });
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
      resource.introduction,
      resource.intended_outcome,
      ...(resource.topic_tags || [])
    ].filter(Boolean).join(" ").toLowerCase().includes(query);
    const resourceArea = resource.development_area || "uncategorized";
    const matchesDevelopmentArea = filters.developmentArea === "all" || resourceArea === filters.developmentArea;
    const matchesType = filters.type === "all" || resource.type === filters.type;
    return matchesQuery && matchesDevelopmentArea && matchesType;
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
    isClientWorkspace ? "Din utviklingsportal" : "Klientforløp",
    isClientWorkspace ? `${state.justActivated ? "Velkommen" : "Velkommen tilbake"}${clientFirstName ? `, ${clientFirstName}` : ""}` : client.name || "Klient",
    headerActions,
    isClientWorkspace ? "Hold oversikt over det du jobber med nå, følg utviklingen din og forbered deg til neste samtale." : ""
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
    if (event.target.closest(".ui-inline-editor, .ds-qa, .ds-title-editor, .ds-composer, .ds-note, .ds-resource-response")) return;
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
    if (event.target.closest(".ui-inline-editor, .ds-qa, .ds-title-editor, .ds-composer, .ds-note, .ds-resource-response")) return;
    markDirty();
  });
  $("#content").replaceChildren(el("div", { class: "plan-layout" }, [form]));
  if (!editable) setFormReadonly(form);
  setupWorkspaceTabs();
  refreshIcons();
}

function workspacePaneContent(pane, client, data, plan) {
  const content = {
    now: () => nowWorkspace(client, data, plan),
    direction: () => directionWorkspace(client, plan, data),
    work: () => workWorkspace(client, data, plan),
    sessions: () => sessionsWorkspace(plan.sessions, data),
    reflections: () => reflectionsWorkspace(data),
    resources: () => coachResourcesWorkspace(data)
  }[pane];
  return content ? content() : null;
}

function renderProgramPane(activePane, { preserveScroll = true } = {}) {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  const data = client ? state.programCache[client.id] : null;
  const pane = $(`.workspace-pane[data-pane='${activePane}']`);
  if (!client || !data || !pane) {
    renderCachedProgram(activePane);
    return;
  }
  const scrollY = window.scrollY;
  const content = workspacePaneContent(activePane, client, data, programToFormState(data));
  if (!content) return;
  pane.replaceChildren(content);
  if (!canEditProgram(client)) setFormReadonly(pane);
  refreshIcons();
  if (preserveScroll) requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: "auto" }));
}

function renderConsentGate(client) {
  state.selectedClientId = client.id;
  setHeader("Velkommen", "Før vi starter", []);
  const accepted = el("input", { type: "checkbox", id: "consent-accepted" });
  const message = el("p", { class: "ds-form-message", role: "status" });
  const startButton = dsButton("Samtykk og åpne portalen", { variant: "primary", disabled: true, onClick: async () => {
    if (!accepted.checked) return;
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
  } });
  accepted.addEventListener("change", () => {
    startButton.disabled = !accepted.checked;
  });
  const points = [
    ["Konfidensielt", "Innholdet brukes i coachingforløpet og behandles konfidensielt."],
    ["Tilgang for coach", "Coachen kan lese og arbeide med planen. Private refleksjoner deles bare når du velger det."],
    ["Lagret trygt", "Data lagres i EU med tilgangsstyring. Du kan be coachen om innsyn, retting eller sletting."]
  ];

  $("#content").replaceChildren(dsPage({ title: "Før vi starter", read: true, className: "ds-consent" }, [
    dsSheet([
      dsObjectHead({
        kicker: "Samtykke",
        title: "Slik brukes innholdet i portalen",
        lead: "Før du starter, bekrefter du hvem som kan lese det du skriver, og hvordan innholdet lagres."
      }),
      el("dl", { class: "ds-facts" }, points.flatMap(([title, text]) => [el("dt", { text: title }), el("dd", { text })])),
      el("label", { class: "ds-check" }, [
        accepted,
        el("span", { text: "Jeg forstår rammene og samtykker til at portalen brukes som arbeidsflate i coachingforløpet." })
      ]),
      el("div", { class: "ds-section-foot" }, [startButton, message])
    ])
  ]));
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
    hasNowTab && ["now", "Akkurat nå", "house"],
    ["direction", "Forløpet", "route"],
    ["work", "Utviklingsfokus", "target", "Utviklings\u00ADfokus"],
    ["sessions", "Samtaler", "messages-square"],
    ["reflections", "Refleksjon", "notebook-pen"],
    ["resources", "Ressurser", "book-open"]
  ].filter(Boolean);
  const inAppbar = state.profile?.role === "client";
  const tabs = el("div", { class: dsClass("ds-tabs", !inAppbar && "ds-tabs--page"), role: "tablist", "aria-label": "Utviklingsplan" }, items.map(([pane, label, iconName, visibleLabel = label]) => {
    const showResourceCount = pane === "resources" && resourceCount > 0;
    const resourceLabel = showResourceCount
      ? `Ressurser, ${resourceCount} ${resourceCount === 1 ? "ressurs" : "ressurser"}${newResourceCount ? state.profile?.role === "client" ? `, ${newResourceCount} ${newResourceCount === 1 ? "ny" : "nye"}` : `, ${newResourceCount} ikke åpnet av klienten` : ""}`
      : label;
    return el("button", {
      class: "ds-tab",
      type: "button",
      role: "tab",
      id: `workspace-tab-${pane}`,
      "aria-controls": `workspace-pane-${pane}`,
      "data-tab": pane,
      "aria-label": resourceLabel,
      "aria-selected": pane === resolvedPane ? "true" : "false"
    }, [
      el("span", { class: "ds-tab-icon", "aria-hidden": "true" }, [icon(iconName)]),
      el("span", { class: "ds-tab-label", text: visibleLabel }),
      showResourceCount ? el("span", { class: "ds-tab-count", "data-new": newResourceCount ? "true" : undefined, "aria-hidden": "true", text: String(resourceCount) }) : null
    ].filter(Boolean));
  }));
  const saveState = el("span", { class: "ds-saved", id: "workspace-save-state", "data-state": "clean", role: "status", "aria-live": "polite", "aria-hidden": "true" }, [
    el("span", { id: "save-status", text: "Lagret" })
  ]);
  $("#appbar-status")?.replaceChildren(saveState);
  if (inAppbar) {
    $("#appbar-tabs")?.replaceChildren(tabs);
    return null;
  }
  $("#appbar-tabs")?.replaceChildren();
  return tabs;
}

function setupWorkspaceTabs() {
  const tabs = $$("[role='tab'][data-tab]");
  const activate = async (tab) => {
      if (state.inlineEditKey) {
        await showAppMessage("Lagre eller avbryt først", "Du har et åpent felt. Lagre eller avbryt før du går videre.");
        return false;
      }
      tabs.forEach((item) => {
        const active = item === tab;
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
    tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
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
  const ready = directionSpecs.every(directionSpecHasValue);
  const groups = [
    ["Mål for forløpet", "Hva skal utviklingsløpet bidra til?", directionSpecs.slice(0, 2)],
    ["Samarbeid", "Hva skal dere kunne forvente av hverandre?", directionSpecs.slice(2, 4)],
    ["Rammer", "Hva må være avklart rundt arbeidet?", directionSpecs.slice(4)]
  ];
  return dsPage({
    title: "Mål og rammer for utviklingsforløpet",
    intro: ready ? "" : "Avklar hvorfor forløpet er viktig, hva som skal bli annerledes, hvordan du vil merke fremgang og hvordan du og ledercoachen din skal samarbeide.",
    read: true
  }, [
    directionProgressCard(plan, editable),
    dsSheet([
      ...groups.map(([title, intro, specs]) => dsSection({ title, intro }, [
        el("div", { class: "ds-qa-list" }, specs.map((spec) => directionQuestion(spec, editable)))
      ])),
      coachingFrame()
    ])
  ]);
}

function directionProgressCard(plan, editable) {
  const directionSpecs = getDirectionSpecs(plan);
  const completed = directionSpecs.filter(directionSpecHasValue).length;
  const ready = completed === directionSpecs.length;
  return dsProgress({
    title: ready ? "Mål og rammer er klare til bruk" : `${completed} av ${directionSpecs.length} avklaringer på plass`,
    text: directionStatus(plan).text,
    done: completed,
    total: directionSpecs.length,
    label: "Status for mål og rammer",
    action: ready && editable ? dsButton("Velg ytre prosjekt", { variant: "primary", onClick: () => openNowFocusAssignment(null) }) : null
  });
}

function refreshDirectionProgress() {
  const current = $("#workspace-pane-direction .ds-progress");
  const data = currentProgramData();
  if (!current || !data) return;
  current.replaceWith(directionProgressCard(programToFormState(data), true));
}

function changeDirectionAnswer(key, value) {
  changeDirectionField(key, value);
  refreshDirectionProgress();
}

function directionQuestion(spec, editable) {
  const emptyText = spec.placeholder || spec.helper;
  if (!editable) {
    const hasValue = Boolean(directionSpecPreview(spec).trim());
    return dsQuestion({
      eyebrow: spec.subhead,
      question: spec.label,
      done: directionSpecHasValue(spec),
      answer: spec.fields ? "" : spec.value,
      help: hasValue ? "" : emptyText,
      field: hasValue && spec.fields ? directionValueContent(spec) : null
    });
  }
  if (!spec.fields) {
    return dsAutoQuestion({
      eyebrow: spec.subhead,
      label: spec.label,
      help: spec.helper,
      value: spec.value,
      emptyText,
      editable,
      onChange: (value) => changeDirectionAnswer(spec.key, value),
      onCommit: commitPlanChanges,
      foot: [(spec.value || "").trim() ? null : directionExample(spec.examples)]
    });
  }
  let qa = null;
  const values = Object.fromEntries(spec.fields.map((field) => [field.key, field.value || ""]));
  const editor = el("div", { class: "ds-qa-fields" }, spec.fields.map((field) => {
    const id = `direction-field-${field.key}`;
    return el("div", { class: "ds-qa-subfield" }, [
      el("label", { class: "ds-qa-sublabel", for: id, text: field.label }),
      dsAutoField({
        id,
        value: field.value || "",
        placeholder: field.placeholder || emptyText,
        label: field.label,
        onChange: (value) => {
          values[field.key] = value;
          setDsQaDone(qa, Object.values(values).every((item) => item.trim()));
          changeDirectionAnswer(field.key, value);
        },
        onCommit: commitPlanChanges
      }),
      (field.value || "").trim() ? null : directionExample(field.examples)
    ].filter(Boolean));
  }));
  qa = dsQuestion({
    eyebrow: spec.subhead,
    question: spec.label,
    done: directionSpecHasValue(spec),
    help: directionSpecPreview(spec).trim() ? "" : spec.helper,
    field: editor
  });
  return qa;
}

function directionExample(examples) {
  if (!examples?.length) return null;
  return dsDisclosure("Se eksempel", examples.map((example) => el("p", { class: "ds-example" }, [
    example.label ? el("strong", { text: example.label }) : null,
    el("span", { text: example.text })
  ].filter(Boolean))));
}

function activateWorkspacePane(paneName) {
  const tab = $(`[role='tab'][data-tab='${paneName}']`);
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
      placeholder: "Beskriv hva du vil oppnå.",
      examples: [{
        text: "Jeg vil lukke de viktigste utviklingsgapene som 360-evalueringen og medarbeiderundersøkelsen har synliggjort, slik at måten jeg leder på i større grad samsvarer med det medarbeiderne og virksomheten trenger."
      }]
    },
    {
      key: "c_success",
      iconName: "activity",
      label: "Hvordan vil du merke fremgang?",
      subhead: "Tegn på endring",
      valueLabel: "Hva vil du, coachen din eller andre merke hvis dette begynner å virke?",
      value: plan.c_success,
      helper: "Hva vil du, coachen din eller andre merke hvis dette begynner å virke?",
      placeholder: "Beskriv hva du eller andre vil legge merke til.",
      examples: [{
        text: "Jeg vil merke fremgang ved at medarbeiderne opplever tydeligere retning, bedre støtte og større handlingsrom, tar mer ansvar og får brukt kompetansen sin bedre. Det bør etter hvert også vise seg i tilbakemeldinger, samarbeid og resultater."
      }]
    },
    {
      key: "c_expect_client",
      iconName: "user-check",
      label: "Hvordan vil du holde fokus mellom samtalene?",
      subhead: "Din arbeidsform",
      valueLabel: "Hvordan vil du sikre at utviklingsarbeidet får plass og oppmerksomhet i hverdagen?",
      value: plan.c_expect_client,
      helper: "Hvordan vil du sikre at utviklingsarbeidet får plass og oppmerksomhet i hverdagen?",
      placeholder: "Beskriv når og hvordan du vil stoppe opp, fange opp observasjoner og forberede deg til neste samtale.",
      examples: [{
        text: "Jeg setter av 20 minutter hver fredag til å stoppe opp, notere hva jeg har lagt merke til og forberede det jeg vil ta med inn i neste samtale."
      }]
    },
    {
      key: "c_expect_coach",
      iconName: "messages-square",
      label: "Hva trenger du fra ledercoachen din?",
      subhead: "Ledercoachens bidrag",
      valueLabel: "Hva trenger du at ledercoachen din bidrar med, utfordrer deg på eller følger opp?",
      value: plan.c_expect_coach,
      helper: "Hva trenger du at ledercoachen din bidrar med, utfordrer deg på eller følger opp?",
      placeholder: "Beskriv hva du trenger fra ledercoachen din.",
      examples: [{
        text: "Jeg trenger at ledercoachen min utfordrer antakelsene mine, hjelper meg å se mønstre og følger opp det vi blir enige om."
      }]
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
          placeholder: "Hva bør være avklart om tid og rolle?",
          examples: [{
            text: "Vi møtes hver tredje uke i 60 minutter, og jeg setter av tid før samtalene til å samle det jeg vil arbeide med."
          }]
        },
        {
          key: "c_confidentiality",
          label: "Konfidensialitet",
          value: plan.c_confidentiality,
          placeholder: "Hva skal være privat, delt eller utenfor coachingens mandat?",
          examples: [{
            text: "Det som deles i samtalene er konfidensielt. Eventuell deling med arbeidsgiver avtales med meg på forhånd."
          }]
        }
      ],
      examples: [
        {
          label: "Praktiske rammer",
          text: "Vi møtes hver tredje uke i 60 minutter, og jeg setter av tid før samtalene til å samle det jeg vil arbeide med."
        },
        {
          label: "Konfidensialitet",
          text: "Det som deles i samtalene er konfidensielt. Eventuell deling med arbeidsgiver avtales med meg på forhånd."
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
      placeholder: "Beskriv hvem eller hva som påvirker arbeidet.",
      examples: [{
        text: "Min leder forventer raskere fremdrift, ledergruppen må samle seg om tydeligere prioriteringer, og teamet trenger mer forutsigbarhet."
      }]
    }
  ];
}

function directionStatus(plan) {
  if (!plan.c_purpose || !plan.c_success) {
    return {
      tone: "missing",
      label: "Ikke utfylt ennå",
      text: "Start med hva utviklingsforløpet skal bidra til, og hvordan du vil merke at det gjør en forskjell.",
      action: "Sett mål"
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
      action: "Fullfør rammene"
    };
  }
  return {
    tone: "ready",
    label: "Mål og rammer avklart",
    text: "Bruk forløpets mål til å velge et ytre prosjekt.",
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
  return el("dl", { class: "ds-qa-subvalues" }, spec.fields.flatMap((field) => [
    el("dt", { text: field.label }),
    el("dd", { class: dsClass(!(field.value || "").trim() && "is-empty"), text: field.value || "Ikke satt ennå." })
  ]));
}

function coachingFrame() {
  const items = [
    ["Konfidensialitet", "Det du deler i coachingrommet behandles konfidensielt."],
    ["Rolleavklaring", "Coaching er ikke terapi. Ved psykiske helseutfordringer bør du kontakte kvalifisert helsepersonell."],
    ["Ansvar", "Du eier egne mål, valg og handlinger. Coachen hjelper deg å tenke tydeligere, prioritere og holde fremdrift."]
  ];
  return el("section", { class: "ds-section" }, [
    el("details", { class: "ds-disclosure ds-disclosure--block" }, [
      el("summary", {}, [
        el("span", {}, [
          el("strong", { class: "ds-disclosure-title", text: "Rammene for coaching" }),
          el("span", { class: "ds-disclosure-hint", text: "Konfidensialitet, roller og ansvar" })
        ])
      ]),
      el("div", { class: "ds-disclosure-body" }, items.map(([title, text]) => el("section", { class: "ds-guidance-group" }, [
        el("h4", { class: "ds-guidance-title", text: title }),
        el("p", { text })
      ])))
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
  if (!data.competenciesAvailable) {
    return dsPage({ title: "Fra ambisjon til praksis", intro: focusItems.length ? "" : focusHubIntroText(), className: "focus-hub" }, [
      focusWorkbench(focusItems, data, editable),
      areasEditor(plan.areas)
    ]);
  }
  return focusHubWorkspace(data, plan, focusItems, editable);
}

function focusHubIntroText() {
  return "Ta utgangspunkt i det du må lykkes med i din lederjobb, velg hva du trenger å utvikle, og planlegg hva du konkret vil prøve i praksis.";
}


function dsPlanSection({ title, description, status, steps }) {
  return dsSection({
    title,
    intro: description,
    actions: status ? [dsStatus(status.label, status.ready ? "done" : "neutral")] : []
  }, [el("div", { class: "ds-qa-list" }, steps)]);
}


function dsTitleEditor({ title, empty = false, editable = true, editKey, value = "", placeholder = "", onSave, pane = "work" }) {
  if (editable && state.inlineEditKey === editKey) {
    const input = el("input", { class: "ds-title-input", value, placeholder, "aria-label": placeholder });
    requestAnimationFrame(() => input.isConnected && input.focus());
    return el("div", { class: "ds-title-editor" }, [
      input,
      el("div", { class: "ds-qa-foot" }, [
        dsButton("Avbryt", { onClick: () => {
          state.inlineEditKey = null;
          renderCachedProgram(pane);
        } }),
        dsButton("Lagre", { variant: "primary", onClick: () => onSave(input.value) })
      ])
    ]);
  }
  return el("h2", { class: dsClass("ds-object-title", empty && "is-empty"), text: title });
}


function dsExperimentRow(action, data, editable) {
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
  const reviewed = isExperimentReviewed(action.status);
  const preview = reviewed && learning ? `Læring: ${learning}` : (parsed.observation || parsed.action || parsed.hypothesis || "").trim();
  const effect = effectLabel(parsed.effect);
  return el("button", {
    class: "ds-entry",
    type: "button",
    onclick: editable ? () => editAction(action, data) : undefined,
    disabled: !editable
  }, [
    el("span", { class: "ds-entry-main" }, [
      el("span", { class: "ds-entry-title", text: action.title || "Eksperiment uten tittel" }),
      el("span", { class: "ds-entry-status" }, [
        dsStatus(phaseLabel(action.status), reviewed ? "done" : "neutral"),
        effect ? el("span", { class: "ds-entry-meta", text: effect }) : null
      ].filter(Boolean)),
      preview ? el("span", { class: "ds-entry-text", text: preview }) : null,
      meta ? el("span", { class: "ds-entry-meta", text: meta }) : null
    ].filter(Boolean)),
    editable ? icon("chevron-right") : null
  ].filter(Boolean));
}


function focusHubWorkspace(data, plan, focusItems, editable) {
  const activeView = ["assignments", "competencies", "experiments"].includes(state.focusView) ? state.focusView : "assignments";
  const isEmpty = !focusItems.length && !(data.programCompetencies || []).some((item) => item.status === "active");
  const panel = (view, content) => el("section", {
    class: "ds-panel",
    id: `focus-panel-${view}`,
    role: "tabpanel",
    "aria-labelledby": `focus-tab-${view}`,
    hidden: activeView !== view
  }, activeView === view ? [content()] : []);
  return dsPage({ title: "Fra ambisjon til praksis", intro: isEmpty ? focusHubIntroText() : "", className: "focus-hub" }, [
    focusViewTabs(activeView, data, focusItems),
    panel("assignments", () => focusWorkbench(focusItems, data, editable)),
    panel("competencies", () => leadershipWorkbench(data, editable)),
    panel("experiments", () => experimentHubWorkspace(data, editable)),
    areasEditor(plan.areas)
  ]);
}



function focusViewTabs(activeView, data = {}, focusItems = []) {
  const activeCompetencies = (data.programCompetencies || []).filter((item) => item.status === "active").length;
  const outerFocusItems = focusItems.filter((item) => item.area?.projectType === "outer");
  const activeExperiments = (data.actions || []).filter((action) => isExperimentActive(action.status)).length;
  const items = [
    ["assignments", "Ytre prosjekt", "Fokusoppdrag", outerFocusItems.length],
    ["competencies", "Indre prosjekt", "Lederkompetanser", activeCompetencies],
    ["experiments", "Prøv i praksis", "Eksperiment", activeExperiments]
  ];
  const activate = (value, { focus = false } = {}) => {
    state.focusView = value;
    state.inlineEditKey = null;
    renderCachedProgram("work");
    if (focus) requestAnimationFrame(() => document.getElementById(`focus-tab-${value}`)?.focus());
  };
  return el("div", { class: "ds-steps", role: "tablist", "aria-label": "Ytre prosjekt, indre prosjekt og praksis" }, items.map(([value, label, typeLabel, count], index) => el("button", {
    class: "ds-step",
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
  }, [
    el("span", { class: "ds-step-title", text: label }),
    el("span", { class: "ds-step-hint", text: count ? `${typeLabel} · ${count}` : typeLabel })
  ])));
}


function leadershipWorkbench(data, editable) {
  const selectedItems = (data.programCompetencies || []).filter((item) => item.status === "active");
  const suggestions = (data.programCompetencies || []).filter((item) => item.status === "suggested");
  if (!selectedItems.length && !suggestions.length) {
    return dsSheet([leadershipEmptyState(data, editable)]);
  }
  const selected = selectedItems.find((item) => item.id === state.selectedCompetencyId) || selectedItems[0];
  state.selectedCompetencyId = selected?.id || null;
  const detail = el("div", { class: "ds-detail-slot" }, [
    selected ? leadershipDetail(selected, data, editable) : leadershipEmptyState(data, editable)
  ]);
  return dsSheet([detail], { list: leadershipSelectedList(selectedItems, suggestions, detail, data, editable) });
}


function leadershipSuggestionRow(item, data, editable) {
  const clientOwnsChoice = isClientCompetencyOwner();
  return el("div", { class: "ds-suggestion" }, [
    el("p", { class: "ds-suggestion-title", text: item.title || "Lederkompetanse" }),
    el("p", { class: "ds-suggestion-text", text: clientOwnsChoice ? "Du bestemmer om lederkompetansen skal bli aktiv og om den skal prioriteres nå." : "Forslaget blir ikke aktivt før klienten velger det." }),
    clientOwnsChoice && editable ? el("div", { class: "ds-qa-foot" }, [
      dsButton("Aktiver forslag", { onClick: () => activateSuggestedCompetency(data, item) }),
      dsButton("Skjul", { variant: "text", onClick: () => removeLeadershipCompetency(item) })
    ]) : null
  ].filter(Boolean));
}


function leadershipSelectedList(items, suggestions, detail, data, editable) {
  const clientOwnsChoice = isClientCompetencyOwner();
  const rows = items.map((item) => dsRow({
    title: item.title || "Lederkompetanse",
    meta: competencyStatusLabel(item),
    selected: item.id === state.selectedCompetencyId,
    onClick: (event) => {
      state.selectedCompetencyId = item.id;
      $$(".ds-row", event.currentTarget.closest(".ds-list")).forEach((node) => {
        if (node === event.currentTarget) node.setAttribute("aria-current", "true");
        else node.removeAttribute("aria-current");
      });
      detail.replaceChildren(leadershipDetail(item, data, editable));
      refreshIcons();
    }
  }));
  return dsList({
    title: `Lederkompetanser · ${items.length} aktive`,
    label: "Lederkompetanser",
    rows: [
      ...rows,
      suggestions.length ? el("p", { class: "ds-list-title ds-list-group", text: "Foreslått av coach" }) : null,
      ...suggestions.map((item) => leadershipSuggestionRow(item, data, editable))
    ].filter(Boolean),
    foot: editable || (clientOwnsChoice && items.length >= 3) ? el("div", { class: "ds-list-foot-stack" }, [
      editable ? dsButton(clientOwnsChoice ? "Legg til lederkompetanse" : "Foreslå lederkompetanse", { variant: "text", iconName: "plus", onClick: () => openCompetencyChooser(data) }) : null,
      clientOwnsChoice && items.length >= 3 ? el("p", { class: "ds-list-note", text: ACTIVE_COMPETENCY_RECOMMENDATION }) : null
    ].filter(Boolean)) : null
  });
}


function leadershipDetail(item, data, editable) {
  const content = item.competency?.content || {};
  const actions = data.actions.filter((action) => action.program_competency_id === item.id);
  const planStatus = leadershipPlanStatus(item);
  const canManage = editable && isClientCompetencyOwner();
  return el("article", { class: "ds-detail" }, [
    dsObjectHead({
      kicker: `Indre prosjekt · ${Number(item.priority) === 1 ? "Prioritert nå" : "Aktiv lederkompetanse"}`,
      title: item.title || "Lederkompetanse",
      lead: item.summary || "",
      menu: canManage ? dsMenu([
        Number(item.priority) !== 1 ? { label: "Prioriter denne nå", onClick: () => makeLeadershipCompetencyPrimary(item) } : null,
        { label: "Arkiver", iconName: "archive", danger: true, onClick: () => removeLeadershipCompetency(item) }
      ], { label: "Flere valg" }) : null
    }),
    dsPlanSection({
      title: "Plan for utvikling av kompetansen",
      description: "Avklar hvorfor kompetansen er viktig nå, hva du vil gjøre annerledes og hva som kan stå i veien.",
      status: planStatus,
      steps: [
        leadershipPlanStep(item, 1, "", "Hvorfor nå?", item.why_now, "Knytt kompetansen til det som faktisk krever noe annet av deg nå.", "why_now", editable),
        leadershipPlanStep(item, 2, "", "Hva vil du gjøre annerledes?", item.desired_behavior, "Beskriv konkret, observerbar lederatferd.", "desired_behavior", editable),
        leadershipPlanStep(item, 3, "", "Hva gjør du i dag?", item.current_pattern, "Beskriv den typiske responsen eller vanen du vil undersøke.", "current_pattern", editable),
        leadershipPlanStep(item, 4, "", "Hva kan stå i veien?", item.obstacles, "Hva kan gjøre det vanskelig å handle annerledes?", "obstacles", editable)
      ]
    }),
    relatedExperiments({ actions, data, editable, onCreate: () => createCompetencyAction(data, item) }),
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

function leadershipGuidance(content = {}, title = "kompetansen") {
  const signals = content.best_practice?.success || content.signals || [];
  const underuse = content.best_practice?.underuse || content.underuse || [];
  const overuse = content.best_practice?.overuse || content.overuse || [];
  const barriers = content.barriers || content.obstacles || [];
  const experiment = content.practice?.experiment || content.experiment || "";
  if (!signals.length && !underuse.length && !overuse.length && !barriers.length && !experiment) return null;
  const list = (sectionTitle, items) => items.length ? el("section", { class: "ds-guidance-group" }, [
    el("h4", { class: "ds-guidance-title", text: sectionTitle }),
    el("ul", { class: "ds-guidance-list" }, items.map((item) => el("li", { text: item })))
  ]) : null;
  return el("section", { class: "ds-section" }, [
    el("details", { class: "ds-disclosure ds-disclosure--block" }, [
      el("summary", {}, [
        el("span", {}, [
          el("strong", { class: "ds-disclosure-title", text: "Se mer" }),
          el("span", { class: "ds-disclosure-hint", text: `Gode grep, mulige feilgrep og barrierer for ${String(title || "kompetansen").toLowerCase()}` })
        ])
      ]),
      el("div", { class: "ds-disclosure-body" }, [
        list("Når lykkes du?", signals),
        list("Når du bruker kompetansen for lite", underuse),
        list("Når du bruker kompetansen for mye eller i feil situasjon", overuse),
        list("Hva kan stå i veien?", barriers),
        experiment ? el("section", { class: "ds-guidance-group" }, [
          el("h4", { class: "ds-guidance-title", text: "Foreslått startforsøk" }),
          el("p", { text: experiment })
        ]) : null
      ].filter(Boolean))
    ])
  ]);
}


function leadershipPlanStep(item, number, eyebrow, label, value, emptyText, fieldKey, editable = false) {
  return dsAutoQuestion({
    number, eyebrow, label, value, emptyText, editable,
    onChange: (nextValue, qa) => {
      changeLeadershipCompetencyField(item, fieldKey, nextValue);
      setDsSectionStatus(qa, leadershipPlanStatus(item));
    },
    onCommit: () => flushLeadershipCompetencyField(item.id, fieldKey)
  });
}


function leadershipExperimentStep(item, data, actions, editable) {
  return workspaceExperimentStep({ number: 4, actions, data, editable, onCreate: () => createCompetencyAction(data, item) });
}

function leadershipEmptyState(data, editable) {
  const clientOwnsChoice = isClientCompetencyOwner();
  return el("div", { class: "ds-detail" }, [
    dsObjectHead({
      kicker: "Indre prosjekt · Lederkompetanser",
      title: clientOwnsChoice ? "Velg ditt første indre prosjekt" : "Klienten har ikke valgt",
      lead: clientOwnsChoice ? "Start med én lederkompetanse du vil utvikle i måten du leder på." : "Forslaget blir ikke aktivt før klienten velger det."
    }),
    editable ? el("div", { class: "ds-section-foot" }, [
      dsButton(clientOwnsChoice ? "Legg til lederkompetanse" : "Foreslå lederkompetanse", { variant: "primary", iconName: "plus", onClick: () => openCompetencyChooser(data) })
    ]) : null
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

  content.replaceChildren(competencyChooserLayout(data, competencies, $("#competency-chooser-foot")));
  $("#competency-chooser-close").onclick = () => dialog.close();
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

function competencyChooserLayout(data, competencies, foot) {
  const selectedItems = (data.programCompetencies || []).filter((item) => item.status === "active");
  const selectedCount = selectedItems.length;
  const hasPrimary = selectedItems.some((item) => Number(item.priority) === 1);
  const selectionSummary = selectedCount
    ? `${selectedCount} aktive${hasPrimary ? " · én prioritert nå" : ""}`
    : "Ingen aktive valgt";
  const categoryOrder = ["foundation", "self_capacity", "relationships_influence", "team_people", "execution_decisions", "strategy_business_change", "derailer"];
  const categoryOptions = [["all", "Alle utviklingsområder"], ...Array.from(new Map(competencies.map((item) => [item.category, item.categoryLabel || "Andre"])).entries())
    .sort(([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b))];
  const groupsNode = el("div", { class: "ds-chooser-groups" });
  const detail = el("div", { class: "ds-chooser-detail" });
  const count = el("p", { class: "ds-list-note" });
  const search = el("input", {
    class: "ds-search",
    type: "search",
    value: state.competencyChooserQuery,
    placeholder: "Søk etter lederkompetanse",
    "aria-label": "Søk i biblioteket for lederkompetanser"
  });
  const categorySelect = el("select", {
    class: "ds-select",
    "aria-label": "Filtrer etter utviklingsområde"
  }, categoryOptions.map(([value, label]) => el("option", { value, text: label })));
  categorySelect.value = state.competencyChooserCategory;
  const reset = () => {
    state.competencyChooserQuery = "";
    state.competencyChooserCategory = "all";
    search.value = "";
    categorySelect.value = "all";
    paint();
    search.focus();
  };
  const resetButton = dsButton("Nullstill", { variant: "text", onClick: reset });
  const layout = el("div", { class: "ds-chooser" }, [
    el("div", { class: "ds-chooser-list" }, [
      el("div", { class: "ds-chooser-tools" }, [search, categorySelect, el("div", { class: "ds-chooser-count" }, [count, resetButton])]),
      groupsNode
    ]),
    detail
  ]);
  const showList = () => {
    layout.classList.remove("is-preview");
    requestAnimationFrame(() => $(".ds-chooser-row[aria-current='true']", layout)?.focus());
  };

  const paint = () => {
    const query = normalizeCompetencySearch(state.competencyChooserQuery);
    const filtered = competencies.filter((item) => {
      const matchesCategory = state.competencyChooserCategory === "all" || item.category === state.competencyChooserCategory;
      return matchesCategory && (!query || competencySearchText(item).includes(query));
    });
    const current = filtered.find((item) => item.id === state.previewCompetencyId) || filtered[0] || null;
    if (current) state.previewCompetencyId = current.id;

    count.textContent = `${filtered.length} av ${competencies.length} lederkompetanser · ${selectionSummary}`;
    resetButton.hidden = !query && state.competencyChooserCategory === "all";

    const programCompetencyFor = (competencyId) => (data.programCompetencies || [])
      .find((item) => item.competency_id === competencyId && ["active", "suggested"].includes(item.status));
    const groups = new Map();
    filtered
      .slice()
      .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))
      .forEach((competency) => {
        const key = competency.category || "other";
        if (!groups.has(key)) groups.set(key, { label: competency.categoryLabel || "Andre", items: [] });
        groups.get(key).items.push(competency);
      });
    groupsNode.replaceChildren(...(filtered.length
      ? Array.from(groups.values()).map((group) => el("section", { class: "ds-chooser-group" }, [
        el("h3", { class: "ds-list-title", text: group.label }),
        ...group.items.map((competency) => competencyBrowserRow(competency, programCompetencyFor(competency.id), current?.id === competency.id, () => {
          state.previewCompetencyId = competency.id;
          layout.classList.add("is-preview");
          paint();
          detail.scrollTop = 0;
          if (window.matchMedia("(max-width: 700px)").matches) {
            layout.closest(".ds-dialog-body").scrollTop = 0;
            requestAnimationFrame(() => $(".ds-back", detail)?.focus());
          }
        }))
      ]))
      : [el("div", { class: "ds-empty" }, [
        el("p", { class: "ds-empty-title", text: "Ingen lederkompetanser passer filteret" }),
        el("p", { class: "ds-empty-text", text: "Prøv et annet søk eller nullstill filteret." }),
        dsButton("Nullstill", { onClick: reset })
      ])]));

    detail.replaceChildren(current
      ? competencyPreview(current, data, showList)
      : el("div", { class: "ds-empty" }, [
        el("p", { class: "ds-empty-title", text: "Velg en lederkompetanse i listen" }),
        el("p", { class: "ds-empty-text", text: "Informasjonen vises her før du bestemmer deg." })
      ]));
    foot.replaceChildren(...(current ? competencyChooserFoot(current, data, selectedCount) : []));
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

function competencyStatusLabel(programCompetency) {
  if (!programCompetency) return "";
  if (programCompetency.status === "suggested") return "Foreslått av coach";
  if (programCompetency.status !== "active") return "";
  return Number(programCompetency.priority) === 1 ? "Prioritert nå" : "Aktiv";
}

function competencyBrowserRow(competency, programCompetency, active, onOpen) {
  const statusLabel = competencyStatusLabel(programCompetency);
  return el("button", {
    class: "ds-row ds-chooser-row",
    type: "button",
    "aria-current": active ? "true" : "false",
    onclick: onOpen
  }, [
    el("span", { class: "ds-chooser-row-head" }, [
      el("span", { class: "ds-row-title", text: competency.title || "Lederkompetanse" }),
      statusLabel ? dsStatus(statusLabel) : null
    ]),
    el("span", { class: "ds-row-meta ds-chooser-row-text", text: competency.summary || "Les mer om lederkompetansen." })
  ]);
}

function competencyChooserFoot(competency, data, selectedCount) {
  const selectedItem = (data.programCompetencies || []).find((item) => item.competency_id === competency.id);
  const selected = selectedItem?.status === "active";
  const suggested = selectedItem?.status === "suggested";
  const clientOwnsSelection = isClientCompetencyOwner();
  const canActivateSuggestion = suggested && clientOwnsSelection;
  const clientSelectionLabel = "Velg denne kompetansen";
  const label = selected ? "Allerede aktiv" : suggested && canActivateSuggestion ? clientSelectionLabel : suggested ? "Foreslått for klienten" : clientOwnsSelection ? clientSelectionLabel : "Foreslå for klienten";
  const note = selected
    ? "Denne lederkompetansen er aktiv i utviklingsplanen."
    : suggested ? "Coachen har foreslått lederkompetansen; klienten eier aktiveringen."
      : clientOwnsSelection && selectedCount >= 3 ? ACTIVE_COMPETENCY_RECOMMENDATION : "Valget kan endres senere.";
  return [
    el("p", { class: "ds-dialog-note", text: note }),
    dsButton(label, {
      variant: "primary",
      disabled: selected || (suggested && !canActivateSuggestion),
      onClick: () => selectLeadershipCompetency(data, competency, { closeChooser: true })
    })
  ];
}

function competencyPreview(competency, data, onBack) {
  const content = competency.content || {};
  const list = (title, items) => items?.length ? el("section", { class: "ds-guidance-group" }, [
    el("h4", { class: "ds-guidance-title", text: title }),
    el("ul", { class: "ds-guidance-list" }, items.map((item) => el("li", { text: item })))
  ]) : null;
  const fact = (title, children) => el("section", {}, [el("h3", { class: "ds-guidance-title", text: title }), el("p", {}, children)]);
  const experiment = content.practice?.experiment || content.experiment || (content.practices?.length ? content.practices.join(" ") : "");
  const evidence = content.practice?.effect || content.evidence;
  return el("div", { class: "ds-detail" }, [
    dsButton("Til biblioteket", { variant: "text", iconName: "arrow-left", className: "ds-back", onClick: onBack }),
    dsObjectHead({ kicker: competency.categoryLabel || "Lederkompetanse", title: competency.title || "Lederkompetanse" }),
    competency.title_en ? el("p", { class: "ds-chooser-english", text: competency.title_en }) : null,
    competency.summary ? el("p", { class: "ds-object-lead", text: competency.summary }) : null,
    content.choose_when || content.distinction ? el("div", { class: "ds-chooser-facts" }, [
      content.choose_when ? fact("Relevant når", [content.choose_when]) : null,
      content.distinction ? fact("Skille mot nærliggende kompetanser", competencyNameNodes(content.distinction, data.leadershipCompetencies || [])) : null
    ]) : null,
    el("details", { class: "ds-disclosure ds-disclosure--block" }, [
      el("summary", {}, [el("span", {}, [
        el("span", { class: "ds-disclosure-title", text: "Se mer" }),
        el("span", { class: "ds-disclosure-hint", text: "Gode grep, mulige feilgrep og barrierer" })
      ])]),
      el("div", { class: "ds-disclosure-body" }, [
        list("Når lykkes du?", content.best_practice?.success || content.signals),
        list("Når du bruker kompetansen for lite", content.best_practice?.underuse || content.underuse),
        list("Når du bruker kompetansen for mye eller i feil situasjon", content.best_practice?.overuse || content.overuse),
        list("Hva kan stå i veien?", content.barriers || []),
        experiment ? el("section", { class: "ds-guidance-group" }, [
          el("h4", { class: "ds-guidance-title", text: "Foreslått startforsøk" }),
          el("p", { text: experiment }),
          evidence ? el("p", {}, [el("strong", { text: "Tegn på effekt: " }), el("span", { text: evidence })]) : null
        ]) : null,
        list("Refleksjonsspørsmål", content.reflection),
        el("section", { class: "ds-guidance-group" }, [
          el("h4", { class: "ds-guidance-title", text: "Om rammen for lederkompetanser" }),
          el("p", { text: "Kompetanserammen tar utgangspunkt i CCL Compass. Norske beskrivelser og utviklingsgrep er selvstendig bearbeidet med støtte i forskning og praksis innen lederutvikling. Dette er et utviklingskart, ikke et psykometrisk verktøy." })
        ])
      ])
    ])
  ]);
}

async function selectLeadershipCompetency(data, competency, { closeChooser = false } = {}) {
  const library = await ensureLeadershipLibrary();
  if (!library?.selectProgramCompetency) return;
  const selectedItems = (data.programCompetencies || []).filter((item) => item.status === "active");
  const existing = (data.programCompetencies || []).find((item) => item.competency_id === competency.id);
  if (existing?.status === "active") return;
  const finish = () => {
    if (closeChooser) $("#competency-chooser")?.close();
    state.focusView = "competencies";
  };
  if (!isClientCompetencyOwner()) {
    if (!library.suggestProgramCompetency || existing?.status === "suggested") return;
    try {
      await library.suggestProgramCompetency(state.sb, data.program.id, competency.id);
    } catch (error) {
      await showAppMessage("Kunne ikke lagre kompetansen", userFacingError(error, "Prøv igjen."));
      return;
    }
    finish();
    await reloadProgramAndRender("work");
    return;
  }
  const usedPriorities = new Set(selectedItems.map((item) => Number(item.priority)));
  let nextPriority = 1;
  while (usedPriorities.has(nextPriority)) nextPriority += 1;
  let created = null;
  try {
    created = await library.selectProgramCompetency(state.sb, data.program.id, competency.id, nextPriority);
  } catch (error) {
    await showAppMessage("Kunne ikke lagre kompetansen", userFacingError(error, "Prøv igjen."));
    return;
  }
  state.selectedCompetencyId = created?.id || null;
  finish();
  await reloadProgramAndRender("work");
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
    await showAppMessage("Kunne ikke endre prioritering", userFacingError(error, "Prøv igjen."));
  }
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
    .filter((item) => hasAreaContent(item.area) && item.area.projectType === "outer" && !isPlaceholderFocusAssignment(item.area))
    .sort((a, b) => a.index - b.index);
}

function nowDraftFocusAssignment(plan) {
  return (plan.areas || [])
    .map((area, index) => ({ area: normalizeArea(area), index }))
    .find((item) => item.area.projectType === "outer" && isPlaceholderFocusAssignment(item.area)) || null;
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

function nowActionItems({ data, plan }) {
  const activeActions = (data.actions || []).filter((action) => isExperimentActive(action.status));
  const datedAction = activeActions.find((action) => action.due_date && action.due_date <= localIsoDate() && hasNowActionContent(action));
  const resource = latestRelevantResource(data);
  const relevant = relevantSession(plan);
  const session = relevant?.session || null;
  const reflection = latestReflection(data);
  const items = [];

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
      kicker: "Eksperiment",
      title: datedAction.title || "Eksperiment",
      description: summary || `Dato satt til ${formatDate(datedAction.due_date)}.`,
      iconName: "calendar-clock",
      ctaLabel: "Følg opp eksperiment",
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

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

function nowWorkspace(client, data, plan) {
  const editable = canEditProgram(client);
  const actions = nowActionItems({ data, plan });
  const focusItems = nowFocusAssignments(plan);
  const setup = nowSetupSection({ data, plan, editable });
  const primary = setup ? null : actions[0] || null;
  const supporting = setup ? actions : actions.slice(1);
  return dsPage({ className: "ds-now" }, [
    primary ? nowPrimaryAction(primary, editable) : null,
    dsSheet([
      setup || nowFocusOverview({ focusItems, activeCompetencies: activeLeadershipCompetencies(data), actions: data.actions || [] }),
      nowActionList(supporting, editable)
    ]),
    setup ? null : nowProgressStrip({ sessions: plan.sessions || [], resources: data.sharedResources || [] })
  ]);
}

function nowFocusOverview({ focusItems, activeCompetencies, actions }) {
  const openExperiments = actions.filter((action) => isExperimentActive(action.status));
  const openExperimentsView = () => {
    state.focusView = "experiments";
    renderCachedProgram("work");
  };
  const group = ({ label, objectLabel, items, emptyText }) => el("section", { class: "ds-group" }, [
    el("h3", { class: "ds-group-label" }, [
      el("span", { class: "ds-group-name", text: label }),
      el("span", { class: "ds-group-object", text: objectLabel })
    ]),
    items.length
      ? el("ul", { class: "ds-link-rows" }, items.map((item) => el("li", {}, [
        el("button", { class: "ds-link-row", type: "button", onclick: item.onAction }, [
          el("span", { class: "ds-link-row-title", text: item.title }),
          item.status ? dsStatus(item.status, item.tone) : null,
          icon("chevron-right")
        ].filter(Boolean))
      ])))
      : el("p", { class: "ds-group-empty", text: emptyText })
  ]);

  return el("section", { class: "ds-section", "aria-labelledby": "now-focus-overview-title" }, [
    el("div", { class: "ds-section-head" }, [
      el("h2", { class: "ds-section-title", id: "now-focus-overview-title", text: state.profile?.role === "client" ? "Det du jobber med" : "Det klienten jobber med" })
    ]),
    el("div", { class: "ds-groups" }, [
      group({
        label: "Ytre prosjekt",
        objectLabel: "Fokusoppdrag",
        emptyText: "Ikke valgt ennå",
        items: focusItems.map((item) => {
          const status = focusPlanStatus(item.area);
          return {
            title: item.area.title || "Fokusoppdrag",
            status: status.label,
            tone: status.ready ? "done" : "neutral",
            onAction: () => openNowFocusAssignment(item)
          };
        })
      }),
      group({
        label: "Indre prosjekt",
        objectLabel: "Lederkompetanser",
        emptyText: "Ikke valgt ennå",
        items: activeCompetencies.map((item) => ({
          title: item.title || "Lederkompetanse",
          status: competencyStatusLabel(item),
          onAction: () => openNowCompetency(item)
        }))
      }),
      group({
        label: "Prøv i praksis",
        objectLabel: "Eksperiment",
        emptyText: "Ingen åpne eksperimenter",
        items: openExperiments.map((action) => ({
          title: action.title || "Eksperiment",
          status: [experimentStatusLabel(action.status), action.due_date ? formatDate(action.due_date) : ""].filter(Boolean).join(" · "),
          onAction: openExperimentsView
        }))
      })
    ])
  ]);
}

function nowSetupSection({ data, plan, editable }) {
  const direction = nowDirectionSummary(plan);
  const outerFocus = nowFocusAssignments(plan)[0] || null;
  const draftOuterFocus = nowDraftFocusAssignment(plan);
  const activeCompetencies = activeLeadershipCompetencies(data);
  const primaryCompetency = activeCompetencies[0] || null;
  const openExperiments = (data.actions || []).filter((action) => isExperimentActive(action.status));
  const directionComplete = Boolean((plan.c_purpose || "").trim());
  if (directionComplete && outerFocus && primaryCompetency && openExperiments.length) return null;

  const suggestions = (data.programCompetencies || []).filter((item) => item.status === "suggested");
  const clientOwnsChoice = state.profile.role === "client";
  let firstMissingKey = "experiment";
  if (!directionComplete) firstMissingKey = "direction";
  else if (!outerFocus) firstMissingKey = "outer";
  else if (!primaryCompetency) firstMissingKey = "inner";

  let directionStatus = "Avklart";
  if (direction.completed === 0) directionStatus = "Ikke avklart";
  else if (!directionComplete || direction.completed < direction.total) directionStatus = `${direction.completed} av ${direction.total} avklaringer`;

  let innerStatus = activeCompetencies.map((item) => item.title || "Lederkompetanse").join(" · ") || "Valgt";
  if (!primaryCompetency && suggestions.length) innerStatus = clientOwnsChoice ? "Forslag fra coach" : "Forslag sendt til klienten";
  else if (!primaryCompetency) innerStatus = clientOwnsChoice ? "Ikke valgt ennå" : "Klienten har ikke valgt";

  const innerAction = editable ? { label: "Åpne indre prosjekter", onAction: () => openNowCompetency(primaryCompetency) } : null;
  const rows = [
    {
      key: "direction",
      label: "Mål og rammer",
      objectLabel: "",
      question: "Hva skal utviklingsløpet bidra til?",
      value: directionStatus,
      complete: directionComplete,
      action: editable ? { label: "Åpne forløpet", onAction: () => activateWorkspacePane("direction") } : null
    },
    {
      key: "outer",
      label: "Ytre prosjekt",
      objectLabel: "Fokusoppdrag",
      question: "Hva er viktigst å lykkes med i jobben nå?",
      value: outerFocus?.area?.title || (draftOuterFocus ? "Ikke ferdigstilt" : "Ikke valgt ennå"),
      complete: Boolean(outerFocus),
      action: editable ? {
        label: "Åpne ytre prosjekter",
        onAction: () => openNowFocusAssignment(outerFocus || draftOuterFocus)
      } : null
    },
    {
      key: "inner",
      label: "Indre prosjekt",
      objectLabel: "Lederkompetanser",
      question: "Hva må du utvikle for å lykkes bedre med det?",
      value: innerStatus,
      complete: Boolean(primaryCompetency),
      action: innerAction
    },
    {
      key: "experiment",
      label: "Prøv i praksis",
      objectLabel: "Eksperiment",
      question: "Hva vil du prøve i praksis?",
      value: openExperiments.length
        ? openExperiments.map((action) => action.title || "Eksperiment").join(" · ")
        : "Ingen åpne eksperimenter",
      complete: openExperiments.length > 0,
      action: editable ? {
        label: "Se alle eksperimenter",
        onAction: () => {
          state.focusView = "experiments";
          renderCachedProgram("work");
        }
      } : null
    }
  ];

  return dsSection({
    title: "Sett grunnlaget for forløpet",
    intro: "Avklar hva forløpet skal bidra til, hvor utviklingen skal merkes og hva du vil utvikle.",
    headingLevel: 2
  }, [
    nowSetupGroup("Forløpet", rows.slice(0, 1), 0, firstMissingKey),
    nowSetupGroup("Utviklingsfokus", rows.slice(1), 1, firstMissingKey)
  ]);
}

function nowSetupGroup(title, rows, startIndex, firstMissingKey) {
  return el("section", { class: "ds-setup-group" }, [
    el("h3", { class: "ds-group-title", text: title }),
    el("div", { class: "ds-qa-list" }, rows.map((row, index) => nowSetupRow(row, startIndex + index, firstMissingKey)))
  ]);
}

function nowSetupRow(row, index, firstMissingKey) {
  return dsQuestion({
    eyebrow: [row.label, row.objectLabel].filter(Boolean).join(" · "),
    question: row.question,
    number: index + 1,
    done: row.complete,
    answer: row.complete ? row.value : "",
    help: row.complete ? "" : row.value,
    side: row.action ? dsButton(row.action.label, { variant: row.key === firstMissingKey ? "primary" : "secondary", onClick: row.action.onAction }) : null,
    headingLevel: 4
  });
}

function nowPrimaryAction(item, editable) {
  return dsNext({
    label: `Anbefalt neste steg · ${item.kicker}`,
    title: item.title,
    text: item.description,
    action: editable && item.onAction ? dsButton(item.ctaLabel || "Åpne", { variant: "primary", onClick: item.onAction }) : null
  });
}

function nowActionList(items = [], editable) {
  if (!items.length) return null;
  return dsSection({ title: "Mest relevant nå", headingLevel: 2 }, [
    el("div", { class: "ds-entries" }, items.map((item) => el("button", {
      class: "ds-entry",
      type: "button",
      disabled: !editable || !item.onAction,
      onclick: item.onAction
    }, [
      el("span", { class: "ds-entry-main" }, [
        el("span", { class: "ds-entry-meta", text: item.kicker }),
        el("span", { class: "ds-entry-title", text: item.title }),
        item.description ? el("span", { class: "ds-entry-text", text: item.description }) : null
      ].filter(Boolean)),
      icon("chevron-right")
    ])))
  ]);
}

function nowProgressStrip({ sessions, resources }) {
  return el("section", { class: "ds-metrics", "aria-label": "Status i utviklingsforløpet" }, [
    nowProgressMetric("Samtaler", String(sessions.length || 0), () => activateWorkspacePane("sessions")),
    nowProgressMetric("Ressurser", String(resources.length || 0), () => activateWorkspacePane("resources"))
  ]);
}

function nowProgressMetric(label, value, onAction) {
  return el("button", { class: "ds-metric", type: "button", onclick: onAction }, [
    el("span", { class: "ds-metric-label", text: label }),
    el("strong", { class: "ds-metric-value", text: value })
  ]);
}

function focusWorkbench(items, data, editable) {
  if (!items.length) return dsSheet([focusEmptyState(editable)]);
  const selectedItemIndex = Math.max(0, Math.min(state.selectedFocusIndex || 0, items.length - 1));
  const selected = items[selectedItemIndex] || items[0] || null;
  const showList = items.length > 1;
  const detail = el("div", { class: "ds-detail-slot" }, [focusDetail(selected, data, editable, { showAdd: !showList })]);
  return dsSheet([detail], { list: showList ? focusList(items, editable, data, detail) : null });
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

function relatedExperiments({ actions = [], data, editable = false, onCreate }) {
  const active = actions.filter((action) => isExperimentActive(action.status));
  const history = actions.filter((action) => isExperimentReviewed(action.status));
  const foot = [
    editable ? dsButton("Legg til eksperiment", { iconName: "plus", onClick: onCreate }) : null,
    actions.length ? dsButton("Se alle eksperimenter", { variant: "text", onClick: () => {
      state.focusView = "experiments";
      renderCachedProgram("work");
    } }) : null
  ].filter(Boolean);
  return dsSection({
    title: "Prøv i praksis · Eksperiment",
    intro: "Prøv → observer → lær → juster. Samle det du prøver, hva du observerer og hva du vil justere."
  }, [
    active.length
      ? el("div", { class: "ds-entries" }, active.map((action) => dsExperimentRow(action, data, editable)))
      : dsEmpty("Ingen åpne eksperimenter."),
    history.length ? dsDisclosure(`Historikk · ${history.length}`, [
      el("div", { class: "ds-entries" }, history.map((action) => dsExperimentRow(action, data, editable)))
    ]) : null,
    foot.length ? el("div", { class: "ds-section-foot" }, foot) : null
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
    class: "ds-select",
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

  return dsSheet([
    el("article", { class: "ds-detail" }, [
      dsObjectHead({
        kicker: "Eksperimenter",
        title: "Alle eksperimenter",
        lead: "Prøv noe nytt, observer hva som skjer og bruk læringen til å justere.",
        actions: editable ? [dsButton("Legg til eksperiment", { iconName: "plus", onClick: () => createAction(data) })] : []
      }),
      el("div", { class: "ds-toolbar" }, [
        el("div", { class: "ds-segmented", role: "tablist", "aria-label": "Eksperimentstatus" }, [
          ["active", `Åpne · ${actions.filter((action) => isExperimentActive(action.status)).length}`],
          ["history", `Historikk · ${actions.filter((action) => isExperimentReviewed(action.status)).length}`]
        ].map(([value, label]) => el("button", {
          class: "ds-segmented-option",
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
        ? el("div", { class: "ds-entries" }, visible.map((action) => dsExperimentRow(action, data, editable)))
        : el("div", { class: "ds-empty" }, [
          el("p", { class: "ds-empty-title", text: state.experimentView === "history" ? "Ingen historikk med dette filteret" : "Ingen åpne eksperimenter med dette filteret" }),
          el("p", { class: "ds-empty-text", text: "Opprett et lite forsøk eller velg en annen kobling." })
        ])
    ])
  ]);
}


function focusList(items, editable, data, detail) {
  return dsList({
    title: `Ytre prosjekter · ${items.length}`,
    label: "Ytre prosjekter",
    rows: items.map(({ area, index }, itemIndex) => dsRow({
      title: area.title || "Fokusoppdrag uten tittel",
      meta: focusPlanStatus(area).label,
      selected: itemIndex === (state.selectedFocusIndex || 0),
      onClick: (event) => selectFocusCard(event.currentTarget, { area, index, itemIndex }, data, editable, detail)
    })),
    foot: editable ? dsButton("Nytt fokusoppdrag", { variant: "text", iconName: "plus", onClick: () => addFocusArea() }) : null
  });
}


function selectFocusCard(buttonNode, item, data, editable, detail) {
  state.selectedFocusIndex = item.itemIndex || 0;
  $$(".ds-row", buttonNode.closest(".ds-list")).forEach((node) => {
    if (node === buttonNode) node.setAttribute("aria-current", "true");
    else node.removeAttribute("aria-current");
  });
  detail.replaceChildren(focusDetail(item, data, editable));
  refreshIcons();
}


function focusDetail({ area, index }, data, editable, { showAdd = false } = {}) {
  const actions = data.actions.filter((action) => action.development_area_id === area.id);
  const activeActions = actions.filter((action) => isExperimentActive(action.status));
  const activeCompetencies = (data.programCompetencies || []).filter((item) => item.status === "active");
  const planStatus = focusPlanStatus(area);
  const needsInnerProject = area.projectType === "outer" && !activeCompetencies.length;
  let nextStep = activeActions.length
    ? { label: "Følg opp eksperimentet", helper: "Åpne eksperimentet og noter hva du observerte.", actionLabel: "Følg opp eksperiment", onAction: () => editAction(activeActions[0], data) }
    : { label: "Planlegg første eksperiment", helper: "Gjør neste steg lite nok til å prøve i en faktisk arbeidssituasjon.", actionLabel: "Legg til eksperiment", onAction: () => createAction(data, area.id) };
  if (needsInnerProject) {
    nextStep = {
      label: "Velg hva du trenger å utvikle",
      helper: "Velg en lederkompetanse som kan styrke deg i dette ytre prosjektet.",
      actionLabel: "Gå til indre prosjekt",
      onAction: () => {
        state.focusView = "competencies";
        renderCachedProgram("work");
      }
    };
  }
  const titleKey = `focus:${index}:title`;
  const purpose = (data.program?.purpose || "").trim();
  return el("article", { class: "ds-detail" }, [
    el("header", { class: "ds-object-head" }, [
      el("div", {}, [
        el("p", { class: "ds-object-kicker", text: area.projectType === "outer" ? "Ytre prosjekt · Fokusoppdrag" : "Tidligere fokusområde" }),
        dsTitleEditor({
          title: area.title || "Gi fokusoppdraget et navn",
          empty: !area.title,
          editable,
          editKey: titleKey,
          value: area.title || "",
          placeholder: "Gi fokusoppdraget et kort navn.",
          onSave: async (nextValue) => saveFocusField(index, "title", nextValue)
        })
      ]),
      editable ? el("div", { class: "ds-object-actions" }, [
        showAdd ? dsButton("Nytt fokusoppdrag", { variant: "text", iconName: "plus", className: "ds-hide-mobile", onClick: () => addFocusArea() }) : null,
        dsMenu([
          showAdd ? { label: "Nytt fokusoppdrag", iconName: "plus", className: "ds-only-mobile", onClick: () => addFocusArea() } : null,
          { label: area.title ? "Rediger tittel" : "Legg til tittel", iconName: "pencil", onClick: () => {
            state.inlineEditKey = titleKey;
            renderCachedProgram("work");
          } },
          { label: "Arkiver", iconName: "archive", danger: true, onClick: () => deleteFocusArea(index) }
        ], { label: "Flere valg" })
      ].filter(Boolean)) : null
    ].filter(Boolean)),
    area.projectType === "outer" ? dsContext({
      label: "Forløpets mål",
      text: purpose || "Hva skal utviklingsløpet bidra til?",
      action: dsButton("Åpne forløpet", { variant: "text", onClick: () => activateWorkspacePane("direction") })
    }) : null,
    editable ? dsNext({
      label: "Anbefalt neste steg",
      title: nextStep.label,
      text: nextStep.helper,
      action: dsButton(nextStep.actionLabel, { variant: "primary", onClick: nextStep.onAction })
    }) : null,
    dsPlanSection({
      title: "Arbeidsplan for fokusoppdraget",
      description: "Gjør oppdraget konkret nok til å kunne prioriteres, prøves og følges opp.",
      status: planStatus,
      steps: [
        focusPlanStep(area, index, 1, "Målbilde", "Hva skal du oppnå – eller hva skal bli annerledes?", area.movement || area.description, "Beskriv utfallet eller forskjellen du vil skape.", "movement", editable),
        focusPlanStep(area, index, 2, "Arbeidsarena", "Hvor skal forskjellen merkes – og for hvem?", area.typicalSituations, "Velg situasjonen, leveransen, møtet eller relasjonen der forskjellen skal bli tydelig.", "typicalSituations", editable),
        focusPlanStep(area, index, 3, "Tegn på fremgang", "Hva vil vise at du er på rett vei?", area.progressSigns, "Velg ett konkret tegn du kan følge med på.", "progressSigns", editable)
      ]
    }),
    relatedExperiments({ actions, data, editable, onCreate: () => createAction(data, area.id) })
  ].filter(Boolean));
}


function focusPlanStatus(area) {
  const count = [area.movement || area.description, area.typicalSituations, area.progressSigns].filter((value) => (value || "").trim()).length;
  if (count === 3) return { key: "ready", label: "Klar til å prøves", ready: true };
  if (count > 0) return { key: "working", label: "Under arbeid", ready: false };
  return { key: "not-started", label: "Ikke påbegynt", ready: false };
}

function focusPlanStep(area, index, number, eyebrow, label, value, emptyText, fieldKey, editable) {
  return dsAutoQuestion({
    number, eyebrow, label, value, emptyText, editable,
    onChange: (nextValue, qa) => {
      const next = changeFocusField(index, fieldKey, nextValue);
      setDsSectionStatus(qa, focusPlanStatus(next));
    },
    onCommit: commitPlanChanges
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
  return el("div", { class: "ds-detail" }, [
    dsObjectHead({
      kicker: "Ytre prosjekt · Fokusoppdrag",
      title: "Velg ditt første ytre prosjekt",
      lead: "Start med et konkret prosjekt, en leveranse eller situasjon der utviklingen skal gjøre en forskjell."
    }),
    editable ? el("div", { class: "ds-section-foot" }, [
      dsButton("Nytt fokusoppdrag", { variant: "primary", iconName: "plus", onClick: () => addFocusArea() })
    ]) : null
  ].filter(Boolean));
}

function addAction(label, handler) {
  return el("button", { class: "ui-add-action", type: "button", onclick: handler }, [
    el("span", { class: "ui-add-icon" }, [icon("plus")]),
    el("span", { text: label })
  ]);
}

function sessionsWorkspace(sessions, data) {
  const editable = canEditProgram(getCurrentClient());
  if (!sessions.length) {
    return dsPage({ title: "Forbered og følg opp", intro: "Samle det viktigste før, under og etter samtalene.", className: "sessions-page" }, [
      sessionEmptyState(editable),
      sessionsEditor(sessions)
    ]);
  }
  const selectedIndex = Math.max(0, Math.min(state.selectedSessionIndex || 0, sessions.length - 1));
  state.selectedSessionIndex = selectedIndex;
  const showList = sessions.length > 1;
  const detail = el("div", { class: "ds-detail-slot" }, [sessionDetail(sessions[selectedIndex], selectedIndex, editable, data, { showAdd: !showList })]);
  return dsPage({ title: "Forbered og følg opp", className: "sessions-page" }, [
    dsSheet([detail], { list: showList ? sessionList(sessions, editable, data, detail) : null }),
    sessionsEditor(sessions)
  ]);
}

function sessionList(sessions, editable, data, detail) {
  return dsList({
    title: `Samtaler · ${sessions.length}`,
    label: "Samtaler",
    rows: sessions.map((session, index) => {
      const progress = sessionProgress(session, sessionActions(session, data));
      return dsRow({
        title: session.focus || "Samtale uten tittel",
        meta: [session.date ? formatDate(session.date) : `Samtale ${index + 1}`, sessionPlanStatus(progress).label].join(" · "),
        selected: index === state.selectedSessionIndex,
        onClick: (event) => selectSession(event.currentTarget, index, editable, data, detail)
      });
    }),
    foot: editable ? dsButton("Opprett samtale", { variant: "text", iconName: "plus", onClick: () => addSession() }) : null
  });
}

// Samtalen leses fra skjemaet, slik at det som er skrevet siden siste tegning av siden, kommer med.
function selectSession(buttonNode, index, editable, data, detail) {
  state.selectedSessionIndex = index;
  $$(".ds-row", buttonNode.closest(".ds-list")).forEach((node) => {
    if (node === buttonNode) node.setAttribute("aria-current", "true");
    else node.removeAttribute("aria-current");
  });
  detail.replaceChildren(sessionDetail(getSessions()[index], index, editable, data));
  refreshIcons();
}

function sessionActions(session, data) {
  return session?.id ? (data?.actions || []).filter((action) => action.session_id === session.id) : [];
}

function sessionDetail(session, index, editable, data = null, { showAdd = false } = {}) {
  const linkedActions = sessionActions(session, data);
  const activeLinkedActions = linkedActions.filter((action) => isExperimentActive(action.status));
  const progress = sessionProgress(session, linkedActions);
  const nextField = sessionNextField(session);
  const next = nextField
    ? { label: nextField.label, helper: nextField.helper, actionLabel: nextField.actionLabel, onAction: () => openSessionField(index, nextField.key) }
    : !activeLinkedActions.length
      ? { label: "Gjør neste steg om til et lite eksperiment", helper: "Knytt handlingen til en situasjon og bestem hva du vil se etter.", actionLabel: "Legg til eksperiment", onAction: () => createActionFromSessionNextStep(index, session.actions || "") }
      : { label: "Følg opp eksperimentet", helper: "Åpne eksperimentet og noter hva du observerte.", actionLabel: "Følg opp eksperiment", onAction: () => editAction(activeLinkedActions[0], data) };
  return el("article", { class: "ds-detail" }, [
    el("header", { class: "ds-object-head" }, [
      el("div", {}, [
        el("p", { class: "ds-object-kicker", text: [`Samtale ${index + 1}`, session.date ? formatDate(session.date) : ""].filter(Boolean).join(" · ") }),
        dsTitleEditor({
          title: session.focus || "Gi samtalen en tittel",
          empty: !session.focus,
          editable,
          editKey: `session:${index}:focus`,
          value: session.focus || "",
          placeholder: "Gi samtalen en kort tittel.",
          pane: "sessions",
          onSave: async (nextValue) => saveSessionField(index, "focus", nextValue)
        })
      ]),
      editable ? el("div", { class: "ds-object-actions" }, [
        showAdd ? dsButton("Opprett samtale", { variant: "text", iconName: "plus", className: "ds-hide-mobile", onClick: () => addSession() }) : null,
        dsMenu([
          showAdd ? { label: "Opprett samtale", iconName: "plus", className: "ds-only-mobile", onClick: () => addSession() } : null,
          { label: session.focus ? "Rediger tittel" : "Legg til tittel", iconName: "pencil", onClick: () => openSessionField(index, "focus") },
          { label: "Arkiver samtale", iconName: "archive", danger: true, onClick: () => deleteSession(index) }
        ], { label: "Flere valg" })
      ].filter(Boolean)) : null
    ].filter(Boolean)),
    editable ? dsNext({
      label: "Anbefalt neste steg",
      title: next.label,
      text: next.helper,
      action: dsButton(next.actionLabel, { variant: "primary", onClick: next.onAction })
    }) : null,
    dsPlanSection({
      title: "Samtaleplan",
      description: "Avklar hva samtalen skal hjelpe med. Etterpå samler du det som ble tydelig og det du vil prøve.",
      status: sessionPlanStatus(progress),
      steps: [
        sessionPlanStep(session, index, 1, "Før samtalen", "Hva skal samtalen hjelpe med?", "Hva håper dere å forstå, avklare eller komme videre på?", "goal", editable, linkedActions),
        sessionPlanStep(session, index, 2, "Etter samtalen", "Hva ble tydelig?", "Noter det viktigste mens det er ferskt.", "notes", editable, linkedActions),
        sessionPlanStep(session, index, 3, "Til neste gang", "Hva vil du prøve eller følge opp?", "Beskriv én konkret handling.", "actions", editable, linkedActions),
        sessionPlanStep(session, index, 4, "Ta med videre", "Hva vil du huske til neste samtale?", "Noter det du vil vende tilbake til.", "reflection", editable, linkedActions),
        sessionExperimentStep(session, index, linkedActions, data, editable)
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
  if (fieldKey === "focus") {
    state.inlineEditKey = `session:${index}:focus`;
    renderCachedProgram("sessions");
    return;
  }
  const field = $(`#session-field-${fieldKey}`);
  field?.scrollIntoView({ block: "center", behavior: "smooth" });
  field?.focus({ preventScroll: true });
}

function sessionPlanStep(session, index, number, eyebrow, label, emptyText, fieldKey, editable, linkedActions) {
  const value = session[fieldKey] || "";
  let experimentAction = null;
  if (fieldKey === "actions" && editable) {
    experimentAction = dsButton("Gjør til eksperiment", {
      variant: "text",
      iconName: "flask-conical",
      onClick: () => createActionFromSessionNextStep(index, getSessions()[index]?.actions || "")
    });
  }
  const qa = dsAutoQuestion({
    number, eyebrow, label, value, emptyText, editable,
    onChange: (nextValue, node) => {
      const next = changeSessionField(index, fieldKey, nextValue);
      setDsSectionStatus(node, sessionPlanStatus(sessionProgress(next, linkedActions)));
      if (experimentAction) experimentAction.parentElement.hidden = !nextValue.trim();
    },
    onCommit: commitPlanChanges,
    foot: [experimentAction]
  });
  $(".ds-qa-field", qa)?.setAttribute("id", `session-field-${fieldKey}`);
  if (experimentAction) experimentAction.parentElement.hidden = !value.trim();
  return qa;
}

function sessionExperimentStep(session, index, linkedActions, data, editable) {
  return dsQuestion({
    number: 5,
    eyebrow: "Eksperiment",
    question: linkedActions.length ? "Eksperimenter fra samtalen" : "Planlegg første forsøk",
    help: linkedActions.length ? "" : "Gjør neste steg lite nok til å prøve i en konkret situasjon.",
    done: Boolean(linkedActions.length),
    field: linkedActions.length ? el("div", { class: "ds-entries" }, linkedActions.map((action) => dsExperimentRow(action, data, editable))) : null,
    foot: editable ? [dsButton("Legg til eksperiment", { iconName: "plus", onClick: () => createActionFromSessionNextStep(index, getSessions()[index]?.actions || "") })] : []
  });
}

// Endringen skrives til skjemaet og cachen med en gang og lagres samlet med kort forsinkelse, som i Forløpet.
function changeSessionField(index, fieldKey, value) {
  const card = $(`#sessions-editor [data-session='${index}']`);
  const control = card && $(`[name='session.${fieldKey}']`, card);
  if (control) control.value = value || "";
  const session = getSessions()[index] || {};
  const column = { goal: "conversation_goal", notes: "insights", actions: "decisions", reflection: "client_notes" }[fieldKey];
  const cached = session.id ? (currentProgramData()?.sessions || []).find((item) => item.id === session.id) : null;
  if (cached && column) cached[column] = value || "";
  markDirty();
  return session;
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

function currentProgramData() {
  const client = getCurrentClient();
  return client ? state.programCache[client.id] || null : null;
}

const focusFieldColumns = { movement: "movement", typicalSituations: "typical_situations", progressSigns: "progress_signs" };
const directionFieldColumns = {
  c_purpose: "purpose",
  c_success: "success_criteria",
  c_expect_client: "expectations_client",
  c_expect_coach: "expectations_coach",
  c_practical: "practical_frame",
  c_confidentiality: "confidentiality",
  c_context: "context"
};

// Endringer skrives til cachen med en gang, slik at en ny tegning av siden før lagringen er ferdig viser det som er skrevet.
function changeFocusField(index, fieldKey, value) {
  const areas = getAreas();
  const area = normalizeArea(areas[index]);
  const next = { ...area, [fieldKey]: value || "", description: fieldKey === "movement" ? value || "" : area.description };
  areas[index] = next;
  setAreas(areas);
  const cached = currentProgramData()?.areas?.[index];
  if (cached) {
    cached[focusFieldColumns[fieldKey]] = value || "";
    if (fieldKey === "movement") cached.description = value || "";
  }
  markDirty();
  return next;
}

function changeDirectionField(key, value) {
  setPlanValue(key, value);
  const program = currentProgramData()?.program;
  if (program && directionFieldColumns[key]) program[directionFieldColumns[key]] = value || "";
  markDirty();
}

function commitPlanChanges() {
  if (state.dirty) savePlan();
}

function changeLeadershipCompetencyField(item, fieldKey, value) {
  item[fieldKey] = value || "";
  const cached = (currentProgramData()?.programCompetencies || []).find((entry) => entry.id === item.id);
  if (cached && cached !== item) cached[fieldKey] = value || "";
  const key = `${item.id}:${fieldKey}`;
  state.competencyPending ||= {};
  clearTimeout(state.competencyPending[key]?.timer);
  state.competencyPending[key] = {
    id: item.id,
    fieldKey,
    value: value || "",
    timer: setTimeout(() => flushLeadershipCompetencyField(item.id, fieldKey), 1200)
  };
  setSaveState("dirty");
}

function flushLeadershipCompetencyField(id, fieldKey) {
  const key = `${id}:${fieldKey}`;
  const pending = state.competencyPending?.[key];
  if (!pending) return state.competencySaveChain || Promise.resolve();
  clearTimeout(pending.timer);
  delete state.competencyPending[key];
  state.competencySaveChain = (state.competencySaveChain || Promise.resolve()).then(async () => {
    const library = await ensureLeadershipLibrary();
    if (!library?.updateProgramCompetency) return;
    setSaveState("saving");
    const { error } = await state.sb.from("program_competencies").update({ [fieldKey]: pending.value }).eq("id", id);
    if (error) {
      setSaveState("error");
      await showAppMessage("Kunne ikke lagre kompetansen", userFacingError(error, "Prøv igjen."));
      return;
    }
    if (!Object.keys(state.competencyPending || {}).length) {
      setSaveState("saved", `Lagret ${new Date().toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
    }
  });
  return state.competencySaveChain;
}

function flushPendingChanges() {
  Object.values(state.competencyPending || {}).forEach((pending) => flushLeadershipCompetencyField(pending.id, pending.fieldKey));
  commitPlanChanges();
}

async function settlePendingChanges() {
  flushPendingChanges();
  await Promise.all([state.planSaveChain, state.competencySaveChain].filter(Boolean));
}

function hasPendingChanges() {
  return state.dirty || Object.keys(state.competencyPending || {}).length > 0;
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
  markDirty();
  const saved = await savePlan();
  if (!saved) return;
  state.inlineEditKey = null;
  renderProgramPane("work");
}

async function saveSessionField(index, fieldKey, value) {
  const sessions = getSessions();
  const session = sessions[index] || {};
  const next = [...sessions];
  next[index] = { ...session, [fieldKey]: value || "" };
  setSessions(next.filter((item) => item.date || item.focus || item.goal || item.notes || item.actions || item.reflection));
  markDirty();
  const saved = await savePlan();
  if (!saved) return;
  state.inlineEditKey = null;
  renderProgramPane("sessions");
}

function sessionEmptyState(editable) {
  return dsSheet([el("div", { class: "ds-detail" }, [
    dsObjectHead({
      kicker: "Samtaler",
      title: "Planlegg første coachingsamtale",
      lead: "Start med hva samtalen skal hjelpe med. Etterpå kan du samle det som ble tydelig og hva du vil prøve videre."
    }),
    editable ? el("div", { class: "ds-section-foot" }, [
      dsButton("Opprett samtale", { variant: "primary", iconName: "plus", onClick: () => addSession() })
    ]) : null
  ].filter(Boolean))]);
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
  const reflections = canWriteReflection ? data.reflections : data.reflections.filter((item) => item.visibility !== "private");
  if (!canWriteReflection) {
    return dsPage({ title: "Det klienten har valgt å dele", intro: "Her vises bare refleksjoner klienten aktivt har delt i coachingforløpet.", className: "reflections-page" }, [
      dsSheet([dsSection({ title: reflections.length ? `Delte refleksjoner · ${reflections.length}` : "Delte refleksjoner", headingLevel: 2 }, [
        reflections.length
          ? reflectionNotes(reflections, data)
          : reflectionEmpty("Ingen delte refleksjoner ennå", "Del refleksjoner når det er noe du ønsker å utforske videre sammen.")
      ])])
    ]);
  }
  return dsPage({
    title: "Refleksjoner underveis",
    intro: reflections.length ? "" : "Ta vare på observasjoner og læring. Du bestemmer hva du deler.",
    className: "reflections-page"
  }, [
    dsSheet([
      reflectionComposer(data),
      dsSection({ title: reflections.length ? `Dine refleksjoner · ${reflections.length}` : "Dine refleksjoner", headingLevel: 2 }, [
        reflections.length
          ? reflectionNotes(reflections, data)
          : reflectionEmpty("Ingen refleksjoner ennå", "Skriv når noe blir tydelig eller du vil huske det senere.")
      ])
    ])
  ]);
}

function reflectionEmpty(title, text) {
  return el("div", { class: "ds-empty" }, [
    el("p", { class: "ds-empty-title", text: title }),
    el("p", { class: "ds-empty-text", text })
  ]);
}

function reflectionVisibilityChoice(value, onChange, help) {
  return dsChoice({
    label: "Hvem kan lese?",
    value,
    options: [["private", "Privat"], ["shared_with_coach", "Del med coach"]],
    help,
    onChange
  });
}

function reflectionLinkFields(data, { areaId = "", competencyId = "", ids = false, priorityLabels = false } = {}) {
  const activeCompetencies = (data.programCompetencies || []).filter((item) => item.status === "active" || item.id === competencyId);
  const area = el("select", { class: "ds-select", id: ids ? "reflection-area" : undefined }, [
    el("option", { value: "", text: "Ikke knyttet", selected: !areaId }),
    ...data.areas.map((item) => el("option", { value: item.id, text: item.title || "Fokusoppdrag", selected: item.id === areaId }))
  ]);
  const competency = el("select", { class: "ds-select", id: ids ? "reflection-competency" : undefined }, [
    el("option", { value: "", text: "Ikke knyttet", selected: !competencyId }),
    ...activeCompetencies.map((item) => el("option", {
      value: item.id,
      text: priorityLabels ? `${Number(item.priority) === 1 ? "Prioritert nå" : "Aktiv"}: ${item.title || "Lederkompetanse"}` : item.title || "Lederkompetanse",
      selected: item.id === competencyId
    }))
  ]);
  return {
    area,
    competency,
    node: el("div", { class: "ds-link-fields" }, [
      el("label", { text: "Fokusoppdrag" }, [area]),
      el("label", { text: "Lederkompetanse" }, [competency])
    ])
  };
}

function coachResourcesWorkspace(data) {
  const canWriteReflection = state.profile.role === "client";
  const hasResources = Boolean((data.sharedResources || []).length);
  return dsPage({
    title: canWriteReflection ? "Dine ressurser" : "Det som er delt i forløpet",
    intro: canWriteReflection
      ? (hasResources ? "" : "Her finner du ressursene coachen har valgt ut for deg.")
      : "Se hva klienten har fått, hvorfor det ble sendt og hvordan ressursene blir brukt.",
    className: "resources-page"
  }, [resourcesFromCoachSection(data, canWriteReflection)].filter(Boolean));
}

// På mobil åpnes ingen ressurs automatisk, fordi åpning registreres som «Åpnet» hos coachen.
function resourcesFromCoachSection(data, canWriteReflection) {
  const library = getResourceLibrary();
  if (!library?.createClientResourceView) return null;

  const sharedResources = data.sharedResources || [];
  if (state.selectedSharedResourceProgramId !== data.program?.id) {
    state.selectedSharedResourceProgramId = data.program?.id || null;
    state.selectedSharedResourceId = null;
    state.sharedResourceQuery = "";
  }
  const section = el("div", { class: "ds-resources" });
  const renderSection = (focus = null) => {
    const query = String(state.sharedResourceQuery || "").trim().toLocaleLowerCase("nb-NO");
    const visibleResources = sharedResources.filter((item) => !query || [
      item.resource?.title,
      item.resource?.introduction,
      item.resource?.type,
      item.coach_note,
      ...(item.resource?.topic_tags || [])
    ].filter(Boolean).join(" ").toLocaleLowerCase("nb-NO").includes(query));
    const compactLayout = window.matchMedia?.("(max-width: 700px)")?.matches;
    let selected = visibleResources.find((item) => item.id === state.selectedSharedResourceId) || null;
    let autoSelected = false;
    if (!selected && !compactLayout && visibleResources.length) {
      selected = visibleResources[0];
      state.selectedSharedResourceId = selected.id;
      autoSelected = true;
    }
    const assignedLabel = canWriteReflection ? "Ny" : "Ikke åpnet";
    const list = visibleResources.length ? dsList({
      title: `${canWriteReflection ? "Delt med deg" : "Delt med klient"} · ${visibleResources.length}${query ? ` av ${sharedResources.length}` : ""}`,
      label: "Ressurser",
      rows: visibleResources.map((item) => {
        const row = dsRow({
          title: item.resource?.title || "Ressurs",
          meta: library.sharedResourceMeta(item, { assignedLabel }),
          selected: item.id === selected?.id,
          onClick: () => openSharedResource(item, canWriteReflection, renderSection)
        });
        row.dataset.sharedResourceId = item.id;
        return row;
      })
    }) : null;
    const detail = selected ? library.createClientResourceView(selected, {
      createElement: el,
      createIcon: icon,
      readOnly: !canWriteReflection,
      onOpenFile: openResourceFile,
      onSave: (resource, values) => saveSharedResourceReflection(resource, values, renderSection)
    }) : null;
    const empty = el("div", { class: "ds-detail" }, [
      dsObjectHead({
        kicker: "Ressurser",
        title: query ? "Ingen ressurser funnet" : "Ingen ressurser ennå",
        lead: query
          ? "Prøv et annet søk."
          : canWriteReflection ? "Når coachen sender en ressurs, vises den her." : "Ingen ressurser er sendt i dette forløpet ennå."
      })
    ]);
    const back = dsButton("Tilbake til ressurser", { variant: "text", iconName: "arrow-left", className: "ds-back", onClick: () => {
      const id = state.selectedSharedResourceId;
      state.selectedSharedResourceId = null;
      renderSection({ id });
    } });
    const sheet = !visibleResources.length
      ? dsSheet([empty])
      : compactLayout
        ? (selected ? dsSheet([back, detail]) : dsSheet([], { list, className: "ds-sheet--list-only" }))
        : dsSheet([detail], { list });
    const search = sharedResources.length > 5 ? el("input", {
      class: "ds-search",
      type: "search",
      value: state.sharedResourceQuery,
      placeholder: "Søk i ressurser",
      "aria-label": "Søk i ressurser",
      oninput: (event) => {
        const cursor = event.currentTarget.selectionStart;
        state.sharedResourceQuery = event.currentTarget.value;
        renderSection();
        requestAnimationFrame(() => {
          const nextSearch = $(".ds-search", section);
          nextSearch?.focus();
          if (Number.isInteger(cursor)) nextSearch?.setSelectionRange(cursor, cursor);
        });
      }
    }) : null;
    section.replaceChildren(...[search ? el("div", { class: "ds-toolbar" }, [search]) : null, sheet].filter(Boolean));
    hydrateResourceMedia(section);
    refreshIcons();
    if (focus) focusSharedResource(section, focus);
    if (autoSelected && canWriteReflection && selected?.status === "assigned") {
      setTimeout(() => openSharedResource(selected, canWriteReflection, renderSection), 0);
    }
  };

  renderSection();
  return section;
}

function focusSharedResource(root, { id, save = false } = {}) {
  const target = save
    ? $(".ds-resource-response .ds-button--primary", root)
    : $(".ds-back", root) || $$(".ds-row", root).find((row) => row.dataset.sharedResourceId === id);
  requestAnimationFrame(() => focusIfLost(target));
}

async function openSharedResource(sharedResource, canWriteReflection, renderSection = null) {
  state.selectedSharedResourceId = sharedResource.id;
  renderSection?.({ id: sharedResource.id });

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
      focusSharedResource($("#workspace-pane-resources"), { id: sharedResource.id });
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
    renderSection?.({ id: sharedResource.id, save: true });
  } catch (error) {
    await showAppMessage("Kunne ikke lagre refleksjonen", userFacingError(error, "Prøv igjen."));
    throw error;
  }
}

function reflectionComposer(data) {
  const body = dsField({ placeholder: "Skriv det du vil huske …", label: "Hva vil du ta vare på?", rows: 4 });
  body.id = "reflection-body";
  const visibility = el("input", { id: "reflection-visibility", type: "hidden", value: "private" });
  const save = dsButton("Lagre refleksjon", { variant: "primary", disabled: true, onClick: () => createReflection(data.program.id) });
  body.addEventListener("input", () => {
    save.disabled = !body.value.trim();
  });
  return dsSection({ title: "Hva vil du ta vare på?", headingLevel: 2, className: "ds-composer" }, [
    el("p", { class: "ds-qa-help", text: "Hva skjedde? Hva overrasket deg? Hva vil du prøve videre?" }),
    body,
    visibility,
    reflectionVisibilityChoice("private", (value) => {
      visibility.value = value;
    }, "Bare du kan lese før du velger å dele."),
    dsDisclosure("Knytt refleksjonen til arbeidet · Valgfritt", [reflectionLinkFields(data, { ids: true, priorityLabels: true }).node]),
    el("div", { class: "ds-section-foot" }, [
      save,
      el("span", { class: "ds-saved", id: "reflection-status", role: "status", "aria-live": "polite" })
    ])
  ]);
}

function reflectionNotes(reflections, data) {
  return el("div", { class: "ds-notes" }, reflections.map((reflection) => {
    const editable = reflection.created_by === state.user?.id;
    if (editable && state.inlineEditKey === `reflection:${reflection.id}`) return reflectionEditor(reflection, data);
    return reflectionNote(reflection, data, editable);
  }));
}

function reflectionMeta(reflection, data) {
  const area = (data.areas || []).find((item) => item.id === reflection.development_area_id);
  const competency = (data.programCompetencies || []).find((item) => item.id === reflection.program_competency_id);
  return el("p", { class: "ds-note-meta" }, [
    dsStatus(reflection.visibility === "private" ? "Privat" : "Delt med coach"),
    el("span", { class: "ds-note-date", text: [
      formatDate(reflection.created_at),
      competency ? `Lederkompetanse: ${competency.title || "Lederkompetanse"}` : "",
      area ? `Fokusoppdrag: ${area.title || "Fokusoppdrag"}` : ""
    ].filter(Boolean).join(" · ") })
  ]);
}

function reflectionNote(reflection, data, editable) {
  return el("article", { class: "ds-note", "data-reflection-id": reflection.id }, [
    el("div", {}, [
      reflectionMeta(reflection, data),
      el("p", { class: "ds-note-text", text: (reflection.body || "").trim() || "Tom refleksjon." })
    ]),
    editable ? dsMenu([
      { label: "Rediger refleksjon", iconName: "pencil", onClick: () => startReflectionEdit(reflection.id) }
    ], { label: "Flere valg" }) : null
  ].filter(Boolean));
}

function focusReflectionNote(id) {
  focusIfLost($$(".ds-note", $("#workspace-pane-reflections")).find((note) => note.dataset.reflectionId === id)?.querySelector(".ds-menu-trigger"));
}

function startReflectionEdit(id) {
  state.inlineEditKey = `reflection:${id}`;
  renderCachedProgram("reflections");
}

function reflectionEditor(reflection, data) {
  const body = dsField({ value: reflection.body || "", placeholder: "Skriv en kort refleksjon …", label: "Rediger refleksjon", rows: 4 });
  requestAnimationFrame(() => body.isConnected && body.focus());
  let visibility = reflection.visibility === "shared_with_coach" ? "shared_with_coach" : "private";
  const links = reflectionLinkFields(data, { areaId: reflection.development_area_id || "", competencyId: reflection.program_competency_id || "" });
  const hasLinks = Boolean(reflection.development_area_id || reflection.program_competency_id);
  return el("article", { class: "ds-note" }, [
    el("div", {}, [
      reflectionMeta(reflection, data),
      body,
      reflectionVisibilityChoice(visibility, (value) => {
        visibility = value;
      }, "Privat: Bare du kan lese. Del med coach: Coachen kan lese teksten i forløpet."),
      dsDisclosure("Knytt refleksjonen til arbeidet · Valgfritt", [links.node], { open: hasLinks }),
      el("div", { class: "ds-section-foot" }, [
        dsButton("Avbryt", { onClick: () => {
          state.inlineEditKey = null;
          renderCachedProgram("reflections");
          focusReflectionNote(reflection.id);
        } }),
        dsButton("Lagre", { variant: "primary", onClick: async () => {
          setSaveState("saving");
          const { error } = await state.sb.from("client_reflections").update({
            body: body.value || "",
            visibility,
            development_area_id: links.area.value || null,
            program_competency_id: links.competency.value || null
          }).eq("id", reflection.id);
          if (error) {
            setSaveState("error");
            await showAppMessage("Kunne ikke lagre refleksjonen", userFacingError(error, "Prøv igjen."));
            return;
          }
          state.inlineEditKey = null;
          await reloadProgramAndRender("reflections");
          focusReflectionNote(reflection.id);
          setSaveState("saved");
        } })
      ])
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
  }, { saveLabel: "Opprett eksperiment" });
}

function experimentContextSpec(data, presetAreaId = "", presetCompetencyId = "") {
  const activeCompetencies = (data.programCompetencies || []).filter((item) => item.status === "active" || item.id === presetCompetencyId);
  const area = dsFormSelect("areaId", [
    ["", "Ikke knyttet til fokusoppdrag"],
    ...data.areas.map((item) => [item.id, item.title || "Fokusoppdrag"])
  ], presetAreaId);
  const competency = dsFormSelect("competencyId", [
    ["", "Ikke knyttet til lederkompetanse"],
    ...activeCompetencies.map((item) => [item.id, `${Number(item.priority) === 1 ? "Prioritert nå" : "Aktiv"}: ${item.title || "Lederkompetanse"}`])
  ], presetCompetencyId);
  const selectedArea = data.areas.find((item) => item.id === presetAreaId);
  const selectedCompetency = activeCompetencies.find((item) => item.id === presetCompetencyId);
  const connection = [selectedArea?.title, selectedCompetency?.title].filter(Boolean).join(" · ");
  return customSpec(["areaId", "competencyId"], dsFormDisclosure(
    connection ? "Knyttet til utviklingsarbeidet" : "Knytt til utviklingsarbeidet",
    connection || "Valgfritt",
    [el("div", { class: "ds-link-fields" }, [dsFormField("Fokusoppdrag", area), dsFormField("Lederkompetanse", competency)])]
  ));
}

function experimentEditorSpecs(data, values = {}, action = null) {
  const parsed = values.parsed || {};
  const statusValue = normalizeExperimentStatus(values.status || action?.status || "planned");
  const coreFields = el("div", { class: "ds-form" }, [
    renderSpec(inputSpec("title", "Navn på eksperimentet", "text", values.title || "", {
      placeholder: "Et kort navn du kjenner igjen",
      required: true,
      maxlength: 80,
      autocomplete: "off"
    })),
    renderSpec({
      ...textareaSpec("action", "Hva vil du prøve?", values.action || parsed.action || "", {
        placeholder: "Én konkret atferd eller handling...",
        required: true
      }),
      help: "Gjør forsøket lite nok til å prøve i en faktisk situasjon."
    }),
    el("div", { class: "ds-form-row" }, [
      renderSpec(inputSpec("arena", "Hvor skal du prøve det?", "text", values.arena || parsed.arena || "", {
        placeholder: "Et møte eller en samtale"
      })),
      renderSpec(inputSpec("dueDate", "Når vil du se tilbake?", "date", values.dueDate || ""))
    ]),
    action ? el("div", { class: "ds-form-row" }, [renderSpec(selectSpec("status", "Status", EXPERIMENT_STATUS_OPTIONS, statusValue))]) : null,
    renderSpec(textareaSpec("signals", "Hva skal du se etter?", values.signals || parsed.signals || "", {
      placeholder: "Et observerbart tegn på effekt eller respons..."
    }))
  ]);
  return [
    customSpec(["title", "action", "arena", "dueDate", ...(action ? ["status"] : []), "signals"], coreFields),
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
    selectSpec("effect", "Hvilken effekt la du merke til?", [["", "Ikke vurdert"], ["low", "Lite"], ["some", "Noe"], ["clear", "Tydelig"]], parsed.effect || ""),
    textareaSpec("learning", "Hva lærte du?", parsed.learning, { placeholder: "Hva forstår du bedre nå?" }),
    textareaSpec("nextStep", "Hva vil du justere neste gang?", parsed.nextStep, { placeholder: "Behold, endre eller prøv noe nytt..." })
  ];
  return customSpec(["observation", "effect", "learning", "nextStep"], dsFormDisclosure(
    "Se tilbake og juster",
    hasReview ? "Observasjon, læring og neste justering" : "Åpne når du har prøvd",
    [
      ...fields.map(renderSpec),
      !isHistory ? el("div", {}, [dsButton("Avslutt eksperiment", { variant: "text", onClick: () => handleDrawerDanger() })]) : null
    ],
    { open: hasReview }
  ));
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
  await reloadProgramAndRender("reflections");
  focusIfLost("#reflection-body");
  setSaveState("saved");
}

async function reloadProgramAndRender(activePane = null) {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  if (!client) return;
  await settlePendingChanges();
  const scrollY = window.scrollY;
  delete state.programCache[client.id];
  const data = await loadClientProgram(client);
  if (!data) {
    await showAppMessage("Kunne ikke oppdatere visningen", "Endringen kan være lagret. Last siden på nytt for å kontrollere.");
    return;
  }
  renderProgramPane(activePane || defaultWorkspacePane(), { preserveScroll: false });
  requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: "auto" }));
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
    if (control.closest(".ds-composer")) return;
    control.disabled = true;
  });
  $$(".section-card button, .document-panel button", form).forEach((control) => {
    if (control.closest(".ds-composer")) return;
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
  const row = $("#workspace-save-state");
  const values = {
    clean: "Lagret",
    dirty: "Endringer lagres …",
    saving: "Lagrer …",
    saved: "Lagret",
    error: "Lagring feilet"
  };
  const statusText = values[mode] || values.clean;
  if (status) status.textContent = mode === "saved" && text ? text : statusText;
  if (!row) return;
  clearTimeout(state.saveStatusTimer);
  row.dataset.state = mode;
  row.setAttribute("aria-hidden", mode === "clean" ? "true" : "false");
  if (mode === "saved") {
    state.saveStatusTimer = setTimeout(() => {
      row.dataset.state = "clean";
      row.setAttribute("aria-hidden", "true");
    }, 2500);
  }
}

// Lagringer går én om gangen. Planen sendes i sin helhet, og fokusoppdrag uten id opprettes på nytt ved hver lagring.
// Planen leses også ved kallet, slik at en lagring som starter rett før man bytter visning, ikke mister teksten.
function savePlan() {
  const client = state.clients.find((item) => item.id === state.selectedClientId) || state.client;
  const snapshot = client && $("#plan-form") ? { client, plan: collectPlan() } : null;
  const run = (state.planSaveChain || Promise.resolve()).then(() => savePlanNow(snapshot));
  state.planSaveChain = run.catch(() => false);
  return run;
}

async function savePlanNow(snapshot) {
  if (!snapshot) return false;
  const { client } = snapshot;
  const formIsCurrent = () => Boolean($("#plan-form")) && (state.clients.find((item) => item.id === state.selectedClientId) || state.client)?.id === client.id;
  if (!canOpenClient(client)) return;
  clearTimeout(state.saveTimer);
  const status = $("#save-status");
  setSaveState("saving");
  try {
    const current = state.programCache[client.id] || await loadClientProgram(client);
    if (!current) throw new Error("Klientforløpet kunne ikke åpnes. Last siden på nytt og prøv igjen.");
    const plan = formIsCurrent() ? collectPlan() : snapshot.plan;
    state.dirty = false;
    await savePlanTransactionally(current.program.id, plan);
    const createdAreas = plan.areas.some((area) => !area.id && hasAreaContent(area));
    if (createdAreas && formIsCurrent()) await adoptCreatedAreaIds(client, plan);
    applyPlanToProgramCache(state.programCache[client.id] || current, formIsCurrent() ? collectPlan() : plan);
    if (state.dirty) setSaveState("dirty");
    else setSaveState("saved", `Lagret ${new Date().toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
    loadProgramSummaries().catch((summaryError) => console.warn("Kunne ikke oppdatere klientoversikten etter lagring", summaryError));
    return true;
  } catch (error) {
    state.dirty = true;
    console.error("Kunne ikke lagre utviklingsplan", error);
    setSaveState("error");
    if (status) status.textContent = "Lagring feilet";
    await showAppMessage("Kunne ikke lagre", userFacingError(error, "Prøv igjen."));
    return false;
  }
}

async function adoptCreatedAreaIds(client, plan) {
  const programId = state.programCache[client.id]?.program?.id;
  if (!programId) return;
  const { data: rows, error } = await state.sb.from("development_areas").select("id, sort_order, archived_at").eq("program_id", programId);
  if (error || !rows) return;
  const known = new Set(plan.areas.map((area) => area.id).filter(Boolean));
  const cards = $$("#areas-editor [data-area]");
  const cached = state.programCache[client.id]?.areas || [];
  plan.areas.forEach((area, index) => {
    if (area.id || !hasAreaContent(area)) return;
    const created = rows.find((row) => !row.archived_at && !known.has(row.id) && Number(row.sort_order) === index);
    if (!created) return;
    known.add(created.id);
    const idInput = cards[index] && $("[name='area.id']", cards[index]);
    if (idInput && !idInput.value) idInput.value = created.id;
    if (cached[index] && !cached[index].id) cached[index].id = created.id;
  });
}

function applyPlanToProgramCache(current, plan) {
  const programId = current.program.id;
  const programValues = programValuesFromPlan(plan);
  const areaRows = areaRowsForSave(programId, plan.areas);
  const sessionRows = sessionRowsForSave(programId, plan.sessions);
  const currentAreas = current.areas || [];
  const currentSessions = current.sessions || [];

  current.program = { ...current.program, ...programValues };
  current.areas = areaRows.map((row) => {
    const existing = currentAreas.find((item) => item.id === row.id) || {};
    return { ...existing, ...row };
  });
  current.sessions = sessionRows.map((row) => {
    const existing = currentSessions.find((item) => item.id === row.id) || {};
    return { ...existing, ...row };
  }).reverse();
  current.evaluation = { ...(current.evaluation || {}), ...evaluationPayloadForSave(programId, plan) };
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
    outer: "Fokusoppdrag",
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

function isPlaceholderFocusAssignment(area) {
  const item = normalizeArea(area);
  return item.title.toLocaleLowerCase("nb-NO") === "nytt fokusoppdrag";
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
    rowSpec([inputSpec("role", "Stilling"), inputSpec("employer", "Arbeidsgiver")]),
    checkboxGroupSpec("coachIds", "Coach(er)", coachOptions, defaultCoachIds)
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
    rowSpec([inputSpec("role", "Stilling", "text", client.role || ""), inputSpec("employer", "Arbeidsgiver", "text", client.employer || "")]),
    checkboxGroupSpec("coachIds", "Coach(er)", state.coaches.map((coach) => [coach.id, coach.name]), client.coach_ids || [])
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
  return customSpec(null, el("div", { class: "ds-form-section" }, [
    el("h3", { class: "ds-form-section-title", text: "Tilgang" }),
    el("p", { class: "ds-form-help", text: "Tilgangen er ikke aktivert ennå." }),
    dsButton("Send tilgangslenke på nytt", { onClick: () => resendClientInviteFromModal(client) })
  ]));
}

const FORM_DIALOGS = {
  modal: { dialog: "#entity-modal", prefix: "modal", onDanger: () => handleModalDanger() },
  drawer: { dialog: "#entity-drawer", prefix: "drawer", onDanger: () => handleDrawerDanger() }
};

function openFormDialog(kind, title, kicker, specs, onSave, options = {}) {
  const { dialog, prefix, onDanger } = FORM_DIALOGS[kind];
  state[kind] = { specs, onSave, ...options };
  const node = $(dialog);
  node.classList.toggle("ds-dialog--workspace", options.size === "workspace");
  $(`#${prefix}-kicker`).textContent = kicker || "";
  $(`#${prefix}-title`).textContent = title;
  $(`#${prefix}-message`).textContent = "";
  $(`#${prefix}-fields`).replaceChildren(...specs.map(renderSpec));
  $(`#${prefix}-save span`).textContent = options.saveLabel || "Lagre";
  const showDanger = options.onDanger && options.dangerPlacement !== "inline";
  $(`#${prefix}-danger-slot`).replaceChildren(...[
    showDanger ? dsButton(options.dangerLabel || "Slett", { onClick: onDanger }) : null,
    ...(options.startActions || [])
  ].filter(Boolean));
  node.showModal();
  node.querySelector(".ds-dialog-body").scrollTop = 0;
  refreshIcons();
  if (typeof options.afterOpen === "function") requestAnimationFrame(options.afterOpen);
}

function openEntityModal(title, kicker, specs, onSave, options = {}) {
  openFormDialog("modal", title, kicker, specs, onSave, options);
}

function openEntityDrawer(title, kicker, specs, onSave, options = {}) {
  openFormDialog("drawer", title, kicker, specs, onSave, options);
}

function inputSpec(name, label, type = "text", value = "", attrs = {}) {
  return { kind: "input", name, label, type, value, attrs };
}

function textareaSpec(name, label, value = "", attrs = {}) {
  return { kind: "textarea", name, label, value, attrs };
}

function selectSpec(name, label, options, value = "") {
  return { kind: "select", name, label, options, value };
}

function checkboxGroupSpec(name, label, options, value = []) {
  return { kind: "checkbox-group", name, label, options, value: Array.isArray(value) ? value : [value].filter(Boolean) };
}

function customSpec(name, node) {
  return Array.isArray(name)
    ? { kind: "custom", names: name, node }
    : { kind: "custom", name, node };
}

function rowSpec(specs) {
  return { kind: "row", specs };
}

function sectionSpec(title, text = "") {
  return { kind: "section", title, text };
}

let formFieldCount = 0;

function dsFormField(label, control, { help = "", className = "" } = {}) {
  const helpId = help ? `form-help-${++formFieldCount}` : "";
  if (helpId) control.setAttribute("aria-describedby", helpId);
  return el("label", { class: dsClass("ds-form-field", className) }, [
    el("span", { class: "ds-form-label", text: label }),
    help ? el("span", { class: "ds-form-help", id: helpId, text: help }) : null,
    control
  ]);
}

function dsFormSelect(name, options, value = "") {
  return el("select", { class: "ds-select", name }, options.map(([key, label]) => el("option", { value: key, text: label, selected: key === value })));
}

function dsFormDisclosure(title, hint, children, { open = false } = {}) {
  return el("details", { class: "ds-disclosure ds-disclosure--block ds-form-disclosure", open }, [
    el("summary", {}, [
      el("span", {}, [
        el("span", { class: "ds-disclosure-title", text: title }),
        el("span", { class: "ds-disclosure-hint", text: hint })
      ])
    ]),
    el("div", { class: "ds-disclosure-body" }, children)
  ]);
}

function renderSpec(spec) {
  if (spec.kind === "custom") return spec.node;
  if (spec.kind === "row") return el("div", { class: "ds-form-row" }, spec.specs.map(renderSpec));
  if (spec.kind === "section") {
    return el("div", { class: "ds-form-section" }, [
      el("h3", { class: "ds-form-section-title", text: spec.title }),
      spec.text ? el("p", { class: "ds-form-help", text: spec.text }) : null
    ]);
  }
  if (spec.kind === "select") {
    return dsFormField(spec.label, dsFormSelect(spec.name, spec.options, spec.value), { help: spec.help });
  }
  if (spec.kind === "checkbox-group") {
    return el("fieldset", { class: "ds-form-field ds-form-fieldset" }, [
      el("legend", { class: "ds-form-label", text: spec.label }),
      el("div", { class: "ds-check-list" }, spec.options.map(([value, label]) => el("label", { class: "ds-check" }, [
        el("input", { type: "checkbox", name: spec.name, value, checked: spec.value.includes(value) }),
        el("span", { text: label })
      ])))
    ]);
  }
  if (spec.kind === "textarea") {
    return dsFormField(spec.label, el("textarea", { class: "ds-qa-field", name: spec.name, text: spec.value, ...(spec.attrs || {}) }), { help: spec.help });
  }
  return dsFormField(spec.label, el("input", {
    class: "ds-input",
    name: spec.name,
    type: spec.type,
    value: spec.value,
    required: spec.name === "name" || spec.name === "email",
    ...(spec.attrs || {})
  }), { help: spec.help });
}

function collectSpecValues(specs, form) {
  const values = {};
  specs.forEach((spec) => {
    if (spec.kind === "section") return;
    if (spec.kind === "row") {
      Object.assign(values, collectSpecValues(spec.specs, form));
      return;
    }
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
    } else {
      values[spec.name] = control.value.trim();
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
    if (result.emailSent === false) {
      const emailError = userFacingError(
        { message: result.emailError },
        "Velkomstmailen ble ikke sendt."
      );
      showAppMessage("Klienten er opprettet", `${emailError} Tilgangslenken kan sendes på nytt fra Rediger klient når e-postoppsettet er rettet.`);
      return;
    }
    showAppMessage("Invitasjon sendt", "Klienten er opprettet med et utviklingsforløp. Invitasjonen kan sendes på nytt fra Rediger klient frem til tilgangen er aktivert.");
  }, 0);
}

async function resendClientInviteFromModal(client) {
  try {
    $("#modal-message").textContent = "Sender tilgangslenke...";
    await resendClientInvite(client);
    if ($("#entity-modal")?.open) $("#entity-modal").close();
    await reloadAndRender();
    setTimeout(() => {
      showAppMessage("Tilgangslenke sendt", "Klienten kan bruke den nye lenken for å aktivere tilgangen.");
    }, 0);
  } catch (error) {
    $("#modal-message").textContent = userFacingError(error, "Kunne ikke sende tilgangslenken. Prøv igjen.");
  }
}

async function resendClientInvite(client) {
  if (!canResendClientInvite(client)) throw new Error("Tilgangslenken kan bare sendes før klienten har aktivert tilgangen.");
  const coachIds = client.coach_ids?.length ? client.coach_ids : state.coach?.id ? [state.coach.id] : [];
  if (!coachIds.length) throw new Error("Klienten mangler coach.");
  await callInviteUser({
    mode: "resend",
    email: client.email,
    name: client.name,
    role: "client",
    coachIds,
    jobRole: client.role || "",
    employer: client.employer || ""
  });
  return client;
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
  await settlePendingChanges();
  await state.sb.auth.signOut();
  state.user = null;
  state.profile = null;
  state.clients = [];
  state.coaches = [];
  state.selectedClientId = null;
  state.passwordSessionUserId = null;
  state.justActivated = false;
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

function initialWorkspacePane() {
  const searchParams = new URLSearchParams(window.location.search || "");
  const hashParams = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
  const pane = searchParams.get("pane") || hashParams.get("pane") || "";
  return ["now", "direction", "work", "sessions", "reflections", "resources"].includes(pane) ? pane : null;
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
  return Boolean(client?.account_activated_at || client?.consent_date);
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

function statusLabel(status) {
  return { draft: "Utkast", active: "Aktivt forløp", completed: "Fullført", archived: "Arkivert" }[status] || "Utkast";
}

function confirmDelete(message, options = {}) {
  const dialog = $("#confirm-dialog");
  if (!dialog) return Promise.resolve(false);
  $("#confirm-kicker").textContent = options.kicker || "";
  $("#confirm-title").textContent = options.title || "Er du sikker?";
  $("#confirm-message").textContent = message;
  const action = $("#confirm-action");
  action.querySelector("span").textContent = options.confirmLabel || "Slett";
  action.classList.toggle("ds-button--danger", Boolean(options.danger));
  if (dialog.open) dialog.close();
  dialog.showModal();
  return new Promise((resolve) => {
    state.confirmResolve = resolve;
  });
}

function showAppMessage(title, message, options = {}) {
  const dialog = $("#message-dialog");
  if (!dialog) return Promise.resolve(false);
  $("#message-kicker").textContent = options.kicker || "";
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
