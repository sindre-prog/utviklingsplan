import { renderResourceContentBlocks } from "./resources.renderer.js?v=polish-103";

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
  focus: "Utviklingsfokus",
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

function displayText(value, fallback = "") {
  const text = String(value ?? "").trim();
  if (!text || text.toLowerCase() === "null" || text.toLowerCase() === "undefined") return fallback;
  return text;
}

function metaPills(createElement, resource) {
  return [
    resource.type ? createElement("span", { class: "badge", text: labelFor(TYPE_LABELS, resource.type) }) : null,
    resource.estimated_duration ? createElement("span", { class: "badge", text: `${resource.estimated_duration} min` }) : null
  ].filter(Boolean);
}

function contextLabel(sharedResource) {
  const labels = {
    program: "Forløp",
    focus_area: "Fokusoppdrag",
    session: "Samtale",
    experiment: "Eksperiment",
    reflection: "Refleksjon"
  };
  return labels[sharedResource.context_type] || "Forløp";
}

function resourceContextText(sharedResource) {
  if (!sharedResource?.context_type || sharedResource.context_type === "program") return "";
  return `Knyttet til ${contextLabel(sharedResource).toLowerCase()}`;
}

function visibleResourceFiles(resource) {
  const referencedDownloads = new Set((resource.content_json || [])
    .filter((block) => block?.type === "download")
    .flatMap((block) => [block.file_id, block.storage_path, block.file_url, block.display_name].filter(Boolean)));
  return (resource.files || []).filter((file) => (
    !["cover_image", "illustration"].includes(file.file_type) &&
    !referencedDownloads.has(file.id) &&
    !referencedDownloads.has(file.storage_path) &&
    !referencedDownloads.has(file.display_name)
  ));
}

function listSection(createElement, title, items = []) {
  if (!items.length) return null;

  return createElement("section", { class: "resource-preview-section resource-preview-section--support" }, [
    createElement("h4", { text: title }),
    createElement("ul", {}, items.map((item) => createElement("li", { text: item })))
  ]);
}

function paragraphs(createElement, className, value, fallback = "") {
  const text = displayText(value, fallback);
  const lines = text
    .split(/\n{2,}|\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (lines.length ? lines : [fallback].filter(Boolean)).map((line) => (
    createElement("p", { class: className, text: line })
  ));
}

function normalizeComparableText(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function sameVisibleText(first = "", second = "") {
  const a = normalizeComparableText(first);
  const b = normalizeComparableText(second);
  return Boolean(a && b && a === b);
}

function fileActionLabel(file) {
  if (file?.file_type === "illustration") return "Last ned illustrasjon";
  if (file?.file_type === "printable") return "Last ned PDF";
  if (file?.file_type === "attachment") return "Last ned vedlegg";
  return "Åpne";
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
    createElement("span", { class: "resource-card__summary", text: resource.summary || "" })
  ]);
}

export function createResourcePreview(resource, options = {}) {
  const { createElement, createIcon = null, primaryAction = null, onOpenFile = null, audience = "coach" } = options;
  requireCreateElement(createElement);
  const files = visibleResourceFiles(resource || {});

  if (!resource) {
    return createElement("section", { class: "resource-preview empty-state" }, [
      createElement("p", { class: "eyebrow", text: "Ressurs" }),
      createElement("h3", { text: "Velg en ressurs" }),
      createElement("p", { class: "muted", text: "Se innhold, veiledning og spørsmål." })
    ]);
  }

  return createElement("article", { class: "resource-preview" }, [
    createElement("header", { class: "resource-preview-head" }, [
      createElement("div", { class: "resource-preview-title" }, [
        createElement("p", { class: "eyebrow", text: "Ressurs" }),
        createElement("h3", { text: resource.title }),
        ...paragraphs(createElement, "resource-preview-lead", resource.client_intro || resource.summary || ""),
        createElement("div", { class: "meta-row" }, metaPills(createElement, resource)),
        primaryAction ? createElement("div", { class: "resource-preview-actions" }, [
          createElement("button", {
            class: "button primary",
            type: "button",
            disabled: primaryAction.disabled,
            onclick: () => primaryAction.onClick?.(resource)
          }, [
            createElement("span", { text: primaryAction.label || "Send ressurs" })
          ]),
          primaryAction.helpText ? createElement("p", { class: "resource-preview-action-help", text: primaryAction.helpText }) : null
        ]) : null
      ])
    ]),
    audience === "coach" ? createElement("details", { class: "resource-coach-guidance", open: true }, [
      createElement("summary", {}, [
        createElement("span", {}, [
          createElement("strong", { text: "Før du deler" }),
          createElement("small", { text: "Vurdering og veiledning for coach" })
        ])
      ]),
      createElement("div", { class: "resource-coach-guidance-grid" }, [
        createElement("section", { class: "resource-preview-section resource-preview-section--support" }, [
          createElement("h4", { text: "Hva ressursen skal hjelpe med" }),
          ...paragraphs(createElement, "", resource.intended_outcome, "Ikke definert ennå.")
        ]),
        listSection(createElement, "Best brukt når", resource.best_used_when || []),
        listSection(createElement, "Ikke egnet når", resource.not_for || []),
        createElement("section", { class: "resource-preview-section resource-preview-section--support" }, [
          createElement("h4", { text: "Veiledning til coach" }),
          ...paragraphs(createElement, "", resource.coach_guidance, "Ingen veiledning lagt inn ennå.")
        ])
      ].filter(Boolean))
    ]) : null,
    audience === "coach" ? createElement("div", { class: "resource-client-preview-label" }, [
      createElement("span", { text: "Dette ser klienten" })
    ]) : null,
    createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Innhold" }),
      createElement("div", { class: "resource-content" }, renderResourceContentBlocks(resource.content_json || [], {
        createElement,
        resourceFiles: resource.files || [],
        onOpenFile
      }))
    ]),
    files.length ? createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Filer" }),
      createElement("ul", { class: "resource-files" }, files.map((file) => (
        createElement("li", {}, [
          createElement("span", { text: file.display_name }),
          onOpenFile ? createElement("button", {
            class: "button ghost resource-file-open",
            type: "button",
            onclick: () => onOpenFile(file)
          }, [createElement("span", { text: fileActionLabel(file) })]) : createElement("small", { text: file.storage_path })
        ])
      )))
    ]) : null,
    createResourceNextStep(createElement, resource, createIcon),
    (resource.reflection_prompts || []).length ? listSection(createElement, "Tenk videre", resource.reflection_prompts) : null
  ].filter(Boolean));
}

export function createSendResourceDrawer() {
  throw new Error("createSendResourceDrawer is not used in the static app; app.js orchestrates the existing drawer.");
}

export function createClientResourceList(sharedResources = [], options = {}) {
  const {
    createElement,
    onOpen,
    renderSelected,
    createIcon = null,
    selectedId = null,
    assignedLabel = "Ny",
    emptyTitle = "Ingen ressurser fra coach ennå",
    emptyText = "Når coachen sender en ressurs, vises den her."
  } = options;
  requireCreateElement(createElement);

  if (!sharedResources.length) {
    return createElement("section", { class: "client-resource-list client-resource-list--empty" }, [
      createElement("p", { class: "eyebrow", text: "Ressurser" }),
      createElement("h3", { text: emptyTitle }),
      createElement("p", { class: "muted", text: emptyText })
    ]);
  }

  return createElement("div", { class: "client-resource-list" }, sharedResources.map((sharedResource) => {
    const resource = sharedResource.resource || {};
    const selected = selectedId === sharedResource.id;
    const contextText = resourceContextText(sharedResource);
    return createElement("article", { class: `client-resource-row ${selected ? "is-open" : ""}` }, [
      createElement("button", {
        class: `client-resource-open ${selected ? "active" : ""}`,
        type: "button",
        "aria-expanded": selected ? "true" : "false",
        "aria-label": `Åpne ressurs: ${displayText(resource.title, "Ressurs")}`,
        onclick: (event) => {
          event.preventDefault();
          onOpen?.(sharedResource);
        }
      }, [
        createElement("span", { class: "client-resource-marker", "aria-hidden": "true" }, [
          createIcon ? createIcon("book-open") : createElement("span", { text: "" })
        ]),
        createElement("span", { class: "client-resource-main" }, [
          createElement("span", { class: "client-resource-meta" }, metaPills(createElement, resource)),
          createElement("strong", { text: displayText(resource.title, "Ressurs") }),
          createElement("span", { class: "client-resource-summary", text: displayText(resource.summary || resource.client_intro, "") }),
          createElement("span", { class: "client-resource-footer" }, [
            contextText ? createElement("span", { class: "client-resource-context", text: contextText }) : null,
            createSharedResourceStatus(sharedResource.status, { createElement, assignedLabel })
          ].filter(Boolean))
        ].filter(Boolean)),
        createElement("span", { class: "client-resource-action", title: selected ? "Valgt ressurs" : "Åpne ressurs" }, [
          createIcon ? createIcon("chevron-right") : createElement("span", { text: "›" })
        ])
      ].filter(Boolean)),
      selected && typeof renderSelected === "function" ? renderSelected(sharedResource) : null
    ].filter(Boolean));
  }));
}

export function createClientResourceView(sharedResource, options = {}) {
  const { createElement, createIcon = null, onSave, onOpenFile = null, readOnly = false } = options;
  requireCreateElement(createElement);

  const resource = sharedResource?.resource || {};
  const files = visibleResourceFiles(resource);
  const coachNote = displayText(sharedResource?.coach_note);
  const showCoachNote = Boolean(coachNote) &&
    !sameVisibleText(coachNote, resource.client_intro) &&
    !sameVisibleText(coachNote, resource.summary);
  const privateResponse = readOnly && sharedResource?.client_note_is_private;
  let clientVisibility = sharedResource?.client_visibility === "shared_with_coach" ? "shared_with_coach" : "private";
  let saveStatus = null;
  let saveButton = null;
  const note = createElement("textarea", {
    class: "ui-edit-control client-resource-note",
    text: displayText(sharedResource?.client_note),
    placeholder: "Hva vil du ta med deg?",
    rows: "6",
    disabled: readOnly
  });
  const visibilityButtons = [];
  const setVisibility = (value) => {
    clientVisibility = value;
    visibilityButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.value === clientVisibility);
    });
  };
  const createVisibilityButton = (value, label) => {
    const button = createElement("button", {
      class: `visibility-choice ${clientVisibility === value ? "active" : ""}`,
      type: "button",
      "data-value": value,
      onclick: () => setVisibility(value)
    }, [
      createElement("span", { text: label })
    ]);
    visibilityButtons.push(button);
    return button;
  };

  return createElement("article", { class: "client-resource-view" }, [
    createElement("header", { class: "client-resource-view-head" }, [
      createElement("div", { class: "client-resource-view-title" }, [
        createElement("p", { class: "eyebrow", text: "Ressurs fra coach" }),
        createElement("h3", { text: displayText(resource.title, "Ressurs") }),
        ...paragraphs(createElement, "client-resource-view-lead", resource.client_intro, displayText(resource.summary)),
        createElement("div", { class: "meta-row" }, metaPills(createElement, resource))
      ].filter(Boolean))
    ]),
    showCoachNote ? createElement("section", { class: "resource-preview-section client-coach-note" }, [
      createElement("h4", { text: "Fra coach" }),
      ...paragraphs(createElement, "", coachNote)
    ]) : null,
    createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Innhold" }),
      createElement("div", { class: "resource-content" }, renderResourceContentBlocks(resource.content_json || [], {
        createElement,
        resourceFiles: resource.files || [],
        onOpenFile
      }))
    ]),
    files.length ? createElement("section", { class: "resource-preview-section" }, [
      createElement("h4", { text: "Filer" }),
      createElement("ul", { class: "resource-files" }, files.map((file) => createElement("li", {}, [
        createElement("span", { text: file.display_name }),
        onOpenFile ? createElement("button", {
          class: "button ghost resource-file-open",
          type: "button",
          onclick: () => onOpenFile(file)
        }, [createElement("span", { text: fileActionLabel(file) })]) : null
      ])))
    ]) : null,
    createResourceNextStep(createElement, resource, createIcon),
    (resource.reflection_prompts || []).length ? listSection(createElement, "Spørsmål å tenke videre på", resource.reflection_prompts) : null,
    createElement("section", { class: "resource-preview-section client-resource-response" }, [
      createElement("h4", { text: readOnly ? "Klientens refleksjon" : "Din refleksjon" }),
      privateResponse ? createElement("p", { class: "muted", text: "Klienten har lagret en privat refleksjon som ikke er delt med coach." }) : note,
      readOnly || privateResponse ? null : createElement("div", { class: "visibility-control" }, [
        createElement("p", { text: "Privat: Bare du kan lese. Del med coach: Coachen kan lese teksten i forløpet." }),
        createElement("div", { class: "visibility-choice-row" }, [
          createVisibilityButton("private", "Privat"),
          createVisibilityButton("shared_with_coach", "Del med coach")
        ])
      ]),
      readOnly || privateResponse ? null : createElement("div", { class: "toolbar" }, [
        saveStatus = createElement("span", { class: "muted client-resource-save-status", text: sharedResource?.client_note ? "Lagret" : "Ikke lagret" }),
        saveButton = createElement("button", {
          class: "ui-button ui-button-filled",
          type: "button",
          text: "Lagre refleksjon",
          onclick: async () => {
            if (!onSave) return;
            saveButton.disabled = true;
            saveStatus.textContent = "Lagrer...";
            try {
              await onSave(sharedResource, {
                clientNote: note.value || "",
                clientVisibility
              });
              saveStatus.textContent = clientVisibility === "shared_with_coach" ? "Lagret og delt med coach" : "Lagret privat";
            } catch (error) {
              saveStatus.textContent = "Kunne ikke lagre";
            } finally {
              saveButton.disabled = false;
            }
          }
        })
      ])
    ].filter(Boolean))
  ].filter(Boolean));
}

function createResourceNextStep(createElement, resource, createIcon = null) {
  if (!resource?.next_step_prompt) return null;

  return createElement("section", { class: "resource-next-step" }, [
    createElement("span", { class: "resource-next-step-icon", "aria-hidden": "true" }, [
      createIcon ? createIcon("arrow-right") : createElement("span", { text: "→" })
    ]),
    createElement("div", { class: "resource-next-step-copy" }, [
      createElement("strong", { text: "Neste steg" }),
      ...paragraphs(createElement, "", resource.next_step_prompt)
    ])
  ]);
}

export function createSharedResourceStatus(status, options = {}) {
  const { createElement, assignedLabel = "Ny" } = options;
  requireCreateElement(createElement);

  const labels = {
    assigned: assignedLabel,
    viewed: "Åpnet",
    responded: "Refleksjon lagret",
    archived: "Arkivert"
  };

  return createElement("span", { class: `badge shared-resource-status status-${status || "sent"}`, text: labels[status] || status || "Sendt" });
}
