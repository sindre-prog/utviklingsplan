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
    createElement("span", { class: "badge resource-meta-subtle", text: labelFor(PHASE_LABELS, resource.phase) })
  ];
}

function contextLabel(sharedResource) {
  const labels = {
    program: "Forløp",
    focus_area: "Fokusområde",
    session: "Samtale",
    experiment: "Eksperiment",
    reflection: "Refleksjon"
  };
  return labels[sharedResource.context_type] || "Forløp";
}

function listSection(createElement, title, items = []) {
  if (!items.length) return null;

  return createElement("section", { class: "resource-preview-section resource-preview-section--support" }, [
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
  const { createElement, primaryAction = null } = options;
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
        createElement("div", { class: "meta-row" }, metaPills(createElement, resource)),
        primaryAction ? createElement("div", { class: "resource-preview-actions" }, [
          createElement("button", {
            class: "button primary",
            type: "button",
            onclick: () => primaryAction.onClick?.(resource)
          }, [
            createElement("span", { text: primaryAction.label || "Send ressurs" })
          ])
        ]) : null
      ])
    ]),
    createElement("section", { class: "resource-preview-section resource-preview-section--support" }, [
      createElement("h4", { text: "Hva ressursen skal hjelpe med" }),
      createElement("p", { text: resource.intended_outcome || "Ikke definert ennå." })
    ]),
    listSection(createElement, "Best brukt når", resource.best_used_when || []),
    listSection(createElement, "Ikke egnet når", resource.not_for || []),
    createElement("section", { class: "resource-preview-section resource-preview-section--support" }, [
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
  throw new Error("createSendResourceDrawer is not used in the static app; app.js orchestrates the existing drawer.");
}

export function createClientResourceList(sharedResources = [], options = {}) {
  const { createElement, onOpen, emptyTitle = "Ingen ressurser fra coach ennå", emptyText = "Når coachen sender en ressurs, vises den her." } = options;
  requireCreateElement(createElement);

  if (!sharedResources.length) {
    return createElement("section", { class: "client-resource-list client-resource-list--empty" }, [
      createElement("p", { class: "eyebrow", text: "Ressurser fra coach" }),
      createElement("h3", { text: emptyTitle }),
      createElement("p", { class: "muted", text: emptyText })
    ]);
  }

  return createElement("div", { class: "client-resource-list" }, sharedResources.map((sharedResource) => {
    const resource = sharedResource.resource || {};
    return createElement("article", { class: "client-resource-row" }, [
      createElement("button", {
        class: "client-resource-open",
        type: "button",
        onclick: () => onOpen?.(sharedResource)
      }, [
        createElement("span", { class: "client-resource-main" }, [
          createElement("span", { class: "client-resource-meta" }, [
            createSharedResourceStatus(sharedResource.status, { createElement }),
            createElement("span", { class: "badge", text: contextLabel(sharedResource) }),
            createElement("span", { class: "badge", text: labelFor(TYPE_LABELS, resource.type) }),
            resource.estimated_duration ? createElement("span", { class: "badge", text: `${resource.estimated_duration} min` }) : null
          ].filter(Boolean)),
          createElement("strong", { text: resource.title || "Ressurs" }),
          createElement("span", { class: "client-resource-summary", text: sharedResource.coach_note || resource.summary || "" })
        ]),
        createElement("span", { class: "client-resource-action", text: "Åpne" })
      ])
    ]);
  }));
}

export function createClientResourceView(sharedResource, options = {}) {
  const { createElement, onClose, onSave, readOnly = false } = options;
  requireCreateElement(createElement);

  const resource = sharedResource?.resource || {};
  const privateResponse = readOnly && sharedResource?.client_note_is_private;
  const note = createElement("textarea", {
    class: "ui-edit-control client-resource-note",
    text: sharedResource?.client_note || "",
    placeholder: "Skriv en privat refleksjon. Ingenting deles før du velger det selv.",
    rows: "6",
    disabled: readOnly
  });
  const visibility = createElement("select", { disabled: readOnly }, [
    createElement("option", { value: "private", text: "Privat", selected: sharedResource?.client_visibility !== "shared_with_coach" }),
    createElement("option", { value: "shared_with_coach", text: "Del med coach", selected: sharedResource?.client_visibility === "shared_with_coach" })
  ]);

  return createElement("article", { class: "client-resource-view" }, [
    createElement("header", { class: "client-resource-view-head" }, [
      createElement("div", { class: "resource-preview-cover client-resource-cover" }, [
        createElement("span", { class: "resource-preview-cover__mark" })
      ]),
      createElement("div", { class: "client-resource-view-title" }, [
        createElement("p", { class: "eyebrow", text: "Ressurs fra coach" }),
        createElement("h3", { text: resource.title || "Ressurs" }),
        createElement("p", { text: resource.client_intro || resource.summary || "" }),
        createElement("div", { class: "meta-row" }, [
          createSharedResourceStatus(sharedResource?.status, { createElement }),
          createElement("span", { class: "badge", text: contextLabel(sharedResource || {}) }),
          ...metaPills(createElement, resource)
        ]),
        onClose ? createElement("button", { class: "button ghost", type: "button", text: "Lukk", onclick: onClose }) : null
      ].filter(Boolean))
    ]),
    sharedResource?.coach_note ? createElement("section", { class: "resource-preview-section client-coach-note" }, [
      createElement("h4", { text: "Fra coach" }),
      createElement("p", { text: sharedResource.coach_note })
    ]) : null,
    createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Innhold" }),
      createElement("div", { class: "resource-content" }, renderResourceContentBlocks(resource.content_json || [], { createElement }))
    ]),
    createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Refleksjonsspørsmål" }),
      createElement("div", { class: "resource-reflection-prompts" }, renderReflectionPrompts(resource.reflection_prompts || [], { createElement }))
    ]),
    (resource.files || []).length ? createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Filer" }),
      createElement("ul", { class: "resource-files" }, resource.files.map((file) => createElement("li", {}, [
        createElement("span", { text: file.display_name })
      ])))
    ]) : null,
    createElement("section", { class: "resource-preview-section client-resource-response" }, [
      createElement("h4", { text: readOnly ? "Klientens refleksjon" : "Din refleksjon" }),
      privateResponse ? createElement("p", { class: "muted", text: "Klienten har lagret en privat refleksjon som ikke er delt med coach." }) : note,
      privateResponse ? null : createElement("label", { text: "Synlighet" }, [visibility]),
      readOnly || privateResponse ? null : createElement("div", { class: "toolbar" }, [
        createElement("span", { class: "muted", text: "Privat er standard." }),
        createElement("button", {
          class: "ui-button ui-button-filled",
          type: "button",
          text: "Lagre refleksjon",
          onclick: () => onSave?.(sharedResource, {
            clientNote: note.value || "",
            clientVisibility: visibility.value || "private"
          })
        })
      ])
    ].filter(Boolean))
  ].filter(Boolean));
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
