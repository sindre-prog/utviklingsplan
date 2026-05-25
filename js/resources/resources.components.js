import { renderReflectionPrompts, renderResourceContentBlocks } from "./resources.renderer.js";

const TYPE_LABELS = Object.freeze({
  article: "Artikkel",
  exercise: "Øvelse",
  reflection: "Refleksjon",
  worksheet: "Arbeidsark",
  assessment: "Kartlegging",
  audio: "Lyd",
  video: "Video",
  framework: "Rammeverk",
  template: "Mal",
  guided_session: "Veiledet økt"
});

const PHASE_LABELS = Object.freeze({
  direction: "Retning",
  focus: "Fokus",
  experiment: "Eksperiment",
  observation: "Observasjon",
  session: "Samtale",
  reflection: "Refleksjon",
  adjustment: "Justering"
});

function requireCreateElement(createElement) {
  if (typeof createElement !== "function") {
    throw new TypeError("Resource components require a createElement function.");
  }
}

function labelFor(map, value) {
  return map[value] || value || "";
}

function metaPills(createElement, resource) {
  return [
    createElement("span", { class: "badge", text: labelFor(TYPE_LABELS, resource.type) }),
    createElement("span", { class: "badge", text: `${resource.estimated_duration || "?"} min` }),
    createElement("span", { class: "badge ok", text: labelFor(PHASE_LABELS, resource.phase) })
  ];
}

function listSection(createElement, title, items = []) {
  if (!items.length) return null;

  return createElement("section", { class: "resource-preview-section" }, [
    createElement("h4", { text: title }),
    createElement("ul", {}, items.map((item) => createElement("li", { text: item })))
  ]);
}

export function createResourceCard(resource, options = {}) {
  const { createElement, onSelect, selected = false } = options;
  requireCreateElement(createElement);

  return createElement("button", {
    class: `resource-card ${selected ? "active" : ""}`,
    type: "button",
    onclick: () => onSelect?.(resource)
  }, [
    createElement("span", { class: "resource-card__meta" }, metaPills(createElement, resource)),
    createElement("strong", { class: "resource-card__title", text: resource.title }),
    createElement("span", { class: "resource-card__summary", text: resource.summary || "" }),
    createElement("span", { class: "resource-card__tags" }, (resource.tags || []).slice(0, 4).map((tag) => (
      createElement("span", { class: "resource-tag", text: tag })
    )))
  ]);
}

export function createResourcePreview(resource, options = {}) {
  const { createElement } = options;
  requireCreateElement(createElement);

  if (!resource) {
    return createElement("section", { class: "resource-preview empty-state" }, [
      createElement("p", { class: "eyebrow", text: "Ressurs" }),
      createElement("h3", { text: "Velg en ressurs" }),
      createElement("p", { class: "muted", text: "Velg en ressurs i listen for å se innhold, veiledning og refleksjonsspørsmål." })
    ]);
  }

  return createElement("article", { class: "resource-preview" }, [
    createElement("header", { class: "resource-preview-head" }, [
      createElement("div", { class: "resource-preview-cover" }, [
        createElement("span", { class: "resource-preview-cover__mark" })
      ]),
      createElement("div", { class: "resource-preview-title" }, [
        createElement("p", { class: "eyebrow", text: "Ressurs" }),
        createElement("h3", { text: resource.title }),
        createElement("p", { text: resource.client_intro || resource.summary || "" }),
        createElement("div", { class: "meta-row" }, metaPills(createElement, resource))
      ])
    ]),
    createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Hva ressursen skal hjelpe med" }),
      createElement("p", { text: resource.intended_outcome || "Ikke definert ennå." })
    ]),
    listSection(createElement, "Best brukt når", resource.best_used_when || []),
    listSection(createElement, "Ikke egnet når", resource.not_for || []),
    createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Veiledning til coach" }),
      createElement("p", { text: resource.coach_guidance || "Ingen veiledning lagt inn ennå." })
    ]),
    createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Innhold" }),
      createElement("div", { class: "resource-content" }, renderResourceContentBlocks(resource.content_json || [], { createElement }))
    ]),
    createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Refleksjonsspørsmål" }),
      createElement("div", { class: "resource-reflection-prompts" }, renderReflectionPrompts(resource.reflection_prompts || [], { createElement }))
    ]),
    createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Filer og illustrasjoner" }),
      (resource.files || []).length
        ? createElement("ul", { class: "resource-files" }, resource.files.map((file) => (
          createElement("li", {}, [
            createElement("span", { text: file.display_name }),
            createElement("small", { text: file.storage_path })
          ])
        )))
        : createElement("p", { class: "muted", text: "Ingen filer registrert." })
    ])
  ].filter(Boolean));
}

export function createSendResourceDrawer() {
  throw new Error("createSendResourceDrawer is not implemented before resource library Batch 3.");
}

export function createClientResourceList() {
  throw new Error("createClientResourceList is not implemented before resource library Batch 4.");
}

export function createClientResourceView() {
  throw new Error("createClientResourceView is not implemented before resource library Batch 4.");
}

export function createSharedResourceStatus(status, options = {}) {
  const { createElement } = options;
  requireCreateElement(createElement);

  const labels = {
    assigned: "Sendt",
    viewed: "Åpnet",
    responded: "Svart",
    archived: "Arkivert"
  };

  return createElement("span", { class: "badge", text: labels[status] || status || "Sendt" });
}
