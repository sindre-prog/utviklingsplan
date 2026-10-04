import { renderResourceContentBlocks } from "./resources.renderer.js?v=design-system-197";
import { resourceIntroduction } from "./resources.model.js?v=polish-155";

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
    resource.type ? createElement("span", { class: "badge resource-meta-pill resource-meta-pill--type", text: labelFor(TYPE_LABELS, resource.type) }) : null,
    resource.estimated_duration ? createElement("span", { class: "badge resource-meta-pill resource-meta-pill--duration", text: `${resource.estimated_duration} min` }) : null
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

function contentHasBlock(resource, type) {
  return (resource?.content_json || []).some((block) => block?.type === type);
}

function fileReferences(file) {
  return [file?.id, file?.storage_path, file?.display_name].filter(Boolean);
}

function sameResourceFile(first, second) {
  if (!first || !second) return false;
  const secondReferences = new Set(fileReferences(second));
  return fileReferences(first).some((value) => secondReferences.has(value));
}

function firstResourceFile(resource, fileType) {
  return (resource?.files || [])
    .filter((file) => file?.file_type === fileType)
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0] || null;
}

function blockReferencesFile(block, file) {
  if (!block || !file) return false;
  const references = new Set([
    block.file_id,
    block.storage_path,
    block.file_url,
    block.display_name
  ].filter(Boolean));
  return fileReferences(file).some((value) => references.has(value));
}

function contentWithoutPrimaryDownload(resource, primaryPrintable) {
  return (resource?.content_json || []).filter((block) => (
    block?.type !== "download" || !blockReferencesFile(block, primaryPrintable)
  ));
}

function visibleResourceFiles(resource, excludedFiles = []) {
  const referencedDownloads = new Set((resource.content_json || [])
    .filter((block) => block?.type === "download")
    .flatMap((block) => [block.file_id, block.storage_path, block.file_url, block.display_name, block.label].filter(Boolean)));
  return (resource.files || []).filter((file) => (
    !["cover_image", "illustration"].includes(file.file_type) &&
    !excludedFiles.some((excludedFile) => sameResourceFile(file, excludedFile)) &&
    !referencedDownloads.has(file.id) &&
    !referencedDownloads.has(file.storage_path) &&
    !referencedDownloads.has(file.display_name)
  ));
}

function listSection(createElement, title, items = [], extraClass = "") {
  const visibleItems = (Array.isArray(items) ? items : [])
    .map((item) => displayText(item))
    .filter(Boolean);
  if (!visibleItems.length) return null;

  return createElement("section", { class: `resource-preview-section resource-preview-section--support ${extraClass}`.trim() }, [
    createElement("h4", { text: title }),
    createElement("ul", {}, visibleItems.map((item) => createElement("li", { text: item })))
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

function createPrimaryPrintableSection(createElement, resource, options = {}) {
  const { createIcon = null, onOpenFile = null, primaryPrintable = null } = options;
  if (!primaryPrintable) return null;
  const cover = firstResourceFile(resource, "cover_image");

  return createElement("section", { class: `resource-primary-download ${cover ? "has-cover" : ""}` }, [
    cover ? createElement("div", { class: "resource-primary-download-media" }, [
      createElement("img", {
        class: "resource-primary-download-cover",
        alt: displayText(cover.display_name, `${displayText(resource.title, "Ressurs")} – forside`),
        "data-storage-path": cover.storage_path
      })
    ]) : createElement("span", { class: "resource-primary-download-icon", "aria-hidden": "true" }, [
      createIcon ? createIcon("file-text") : createElement("span", { text: "PDF" })
    ]),
    createElement("div", { class: "resource-primary-download-copy" }, [
      createElement("span", { class: "resource-primary-download-kicker", text: "PDF-versjon" }),
      createElement("h4", { text: "Ta med deg PDF-versjonen" }),
      createElement("p", { text: "Arbeid videre i dokumentet, skriv det ut eller del det med andre." })
    ]),
    onOpenFile ? createElement("button", {
      class: "button primary resource-primary-download-action",
      type: "button",
      onclick: () => onOpenFile(primaryPrintable)
    }, [
      createIcon ? createIcon("download") : null,
      createElement("span", { text: "Last ned PDF" })
    ].filter(Boolean)) : null
  ].filter(Boolean));
}

function createResourceContentSections(createElement, resource, options = {}) {
  const {
    createIcon = null,
    onOpenFile = null,
    primaryPrintable = null,
    legacyPromptTitle = "Tenk videre"
  } = options;
  const files = visibleResourceFiles(resource, [primaryPrintable].filter(Boolean));
  const showLegacyReflectionPrompts = !contentHasBlock(resource, "reflection_questions") && (resource?.reflection_prompts || []).length;

  return [
    createElement("section", { class: "resource-preview-section resource-native-content" }, [
      createElement("h4", { text: "Innhold" }),
      createElement("div", { class: "resource-content" }, renderResourceContentBlocks(
        contentWithoutPrimaryDownload(resource, primaryPrintable),
        {
          createElement,
          createIcon,
          resourceFiles: resource.files || [],
          onOpenFile
        }
      ))
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
          }, [
            createIcon ? createIcon("download") : null,
            createElement("span", { text: fileActionLabel(file) })
          ].filter(Boolean)) : createElement("small", { text: file.storage_path })
        ])
      )))
    ]) : null,
    createResourceNextStep(createElement, resource, createIcon),
    showLegacyReflectionPrompts ? listSection(createElement, legacyPromptTitle, resource.reflection_prompts) : null
  ].filter(Boolean);
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
    createElement("strong", { class: "resource-card__title", text: displayText(resource.title, "Ressurs") }),
    createElement("span", { class: "resource-card__summary", text: resourceIntroduction(resource) })
  ]);
}

export function createResourcePreview(resource, options = {}) {
  const { createElement, createIcon = null, primaryAction = null, secondaryAction = null, onOpenFile = null, audience = "coach" } = options;
  requireCreateElement(createElement);
  const primaryPrintable = firstResourceFile(resource, "printable");

  if (!resource) {
    return createElement("section", { class: "resource-preview empty-state" }, [
      createElement("p", { class: "eyebrow", text: "Ressurs" }),
      createElement("h3", { text: "Velg en ressurs" }),
      createElement("p", { class: "muted", text: "Se innhold, veiledning og spørsmål." })
    ]);
  }

  return createElement("article", { class: "resource-preview client-resource-view" }, [
    createElement("header", { class: "resource-preview-head client-resource-view-head" }, [
      createElement("div", { class: "resource-preview-title client-resource-view-title" }, [
        createElement("p", { class: "eyebrow", text: "Ressurs" }),
        createElement("h3", { text: displayText(resource.title, "Ressurs") }),
        ...paragraphs(createElement, "resource-preview-lead client-resource-view-lead", resourceIntroduction(resource)),
        createElement("div", { class: "meta-row" }, metaPills(createElement, resource)),
        primaryAction || secondaryAction ? createElement("div", { class: "resource-preview-actions" }, [
          primaryAction ? createElement("button", {
            class: "button primary",
            type: "button",
            disabled: primaryAction.disabled,
            onclick: () => primaryAction.onClick?.(resource)
          }, [
            createElement("span", { text: primaryAction.label || "Send ressurs" })
          ]) : null,
          secondaryAction ? createElement("button", {
            class: "button secondary",
            type: "button",
            disabled: secondaryAction.disabled,
            onclick: () => secondaryAction.onClick?.(resource)
          }, [
            createElement("span", { text: secondaryAction.label || "Åpne" })
          ]) : null,
          primaryAction?.helpText ? createElement("p", { class: "resource-preview-action-help", text: primaryAction.helpText }) : null
        ].filter(Boolean)) : null
      ].filter(Boolean))
    ]),
    audience === "coach" ? createElement("details", { class: "resource-coach-guidance" }, [
      createElement("summary", {}, [
        createElement("span", {}, [
          createElement("strong", { text: "Før du deler" }),
          createElement("small", { text: "Vurdering og veiledning for coach" })
        ])
      ]),
      createElement("div", { class: "resource-coach-guidance-grid" }, [
        createElement("section", { class: "resource-preview-section resource-preview-section--support resource-coach-guidance-primary" }, [
          createElement("h4", { text: "Hva ressursen skal hjelpe med" }),
          ...paragraphs(createElement, "", resource.intended_outcome, "Ikke definert ennå.")
        ]),
        listSection(createElement, "Best brukt når", resource.best_used_when || [], "resource-coach-guidance-fit"),
        createElement("section", { class: "resource-preview-section resource-preview-section--support resource-coach-guidance-advice" }, [
          createElement("h4", { text: "Veiledning til coach" }),
          ...paragraphs(createElement, "", resource.coach_guidance, "Ingen veiledning lagt inn ennå.")
        ]),
        listSection(createElement, "Ikke egnet når", resource.not_for || [], "resource-coach-guidance-caution")
      ].filter(Boolean))
    ]) : null,
    audience === "coach" ? createElement("div", { class: "resource-client-preview-label" }, [
      createElement("span", { text: "Dette ser klienten" })
    ]) : null,
    createPrimaryPrintableSection(createElement, resource, { createIcon, onOpenFile, primaryPrintable }),
    ...createResourceContentSections(createElement, resource, {
      createIcon,
      onOpenFile,
      primaryPrintable,
      legacyPromptTitle: "Tenk videre"
    })
  ].filter(Boolean));
}

export function createSendResourceDrawer() {
  throw new Error("createSendResourceDrawer is not used in the static app; app.js orchestrates the existing drawer.");
}

export function sharedResourceStatusLabel(status, assignedLabel = "Ny") {
  const labels = {
    assigned: assignedLabel,
    viewed: "Åpnet",
    responded: "Refleksjon lagret",
    archived: "Arkivert"
  };
  return labels[status] || status || "Sendt";
}

export function sharedResourceMeta(sharedResource, options = {}) {
  const { assignedLabel = "Ny" } = options;
  const resource = sharedResource?.resource || {};
  return [
    resource.type ? labelFor(TYPE_LABELS, resource.type) : "",
    resource.estimated_duration ? `${resource.estimated_duration} min` : "",
    sharedResourceStatusLabel(sharedResource?.status, assignedLabel)
  ].filter(Boolean).join(" · ");
}

function dsButtonNode(createElement, createIcon, label, { variant = "", iconName = "", onClick, disabled = false } = {}) {
  return createElement("button", {
    class: variant ? `ds-button ds-button--${variant}` : "ds-button",
    type: "button",
    disabled,
    onclick: onClick
  }, [
    iconName && createIcon ? createIcon(iconName) : null,
    createElement("span", { text: label })
  ].filter(Boolean));
}

function dsSectionNode(createElement, title, children = [], className = "") {
  return createElement("section", { class: `ds-section ${className}`.trim() }, [
    createElement("div", { class: "ds-section-head" }, [
      createElement("div", {}, [createElement("h3", { class: "ds-section-title", text: title })])
    ]),
    ...children
  ]);
}

function createVisibilityChoice(createElement, value, onChange) {
  const options = [["private", "Privat"], ["shared_with_coach", "Del med coach"]];
  const checkedKey = options.some(([key]) => key === value) ? value : options[0][0];
  const select = (key, focus = false) => {
    buttons.forEach((button) => {
      const checked = button.dataset.value === key;
      button.setAttribute("aria-checked", checked ? "true" : "false");
      button.tabIndex = checked ? 0 : -1;
      if (checked && focus) button.focus();
    });
    onChange(key);
  };
  const buttons = options.map(([key, text], index) => createElement("button", {
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
  return createElement("div", { class: "ds-choice" }, [
    createElement("p", { class: "ds-choice-label", text: "Hvem kan lese?" }),
    createElement("div", { class: "ds-segmented", role: "radiogroup", "aria-label": "Hvem kan lese?" }, buttons),
    createElement("p", { class: "ds-choice-help", text: "Privat: Bare du kan lese. Del med coach: Coachen kan lese teksten i forløpet." })
  ]);
}

export function createClientResourceView(sharedResource, options = {}) {
  const { createElement, createIcon = null, onSave, onOpenFile = null, readOnly = false } = options;
  requireCreateElement(createElement);

  const resource = sharedResource?.resource || {};
  const introduction = resourceIntroduction(resource);
  const primaryPrintable = firstResourceFile(resource, "printable");
  const files = visibleResourceFiles(resource, [primaryPrintable].filter(Boolean));
  const coachNote = displayText(sharedResource?.coach_note);
  const showCoachNote = Boolean(coachNote) && !sameVisibleText(coachNote, introduction);
  const privateResponse = readOnly && sharedResource?.client_note_is_private;
  const clientNoteText = displayText(sharedResource?.client_note);
  const hasClientNote = Boolean(clientNoteText);
  const showLegacyReflectionPrompts = !contentHasBlock(resource, "reflection_questions") && (resource?.reflection_prompts || []).length;
  const kicker = [
    "Ressurs fra coach",
    resource.type ? labelFor(TYPE_LABELS, resource.type) : "",
    resource.estimated_duration ? `${resource.estimated_duration} min` : "",
    resourceContextText(sharedResource)
  ].filter(Boolean).join(" · ");

  const content = createElement("div", { class: "ds-content ds-resource-content" }, [
    ...renderResourceContentBlocks(contentWithoutPrimaryDownload(resource, primaryPrintable), {
      createElement,
      createIcon,
      resourceFiles: resource.files || [],
      onOpenFile
    }),
    resource.next_step_prompt ? createElement("h4", { class: "ds-content-heading", text: "Neste steg" }) : null,
    ...(resource.next_step_prompt ? paragraphs(createElement, "", resource.next_step_prompt) : []),
    showLegacyReflectionPrompts ? createElement("h4", { class: "ds-content-heading", text: "Spørsmål å tenke videre på" }) : null,
    showLegacyReflectionPrompts ? createElement("ul", { class: "ds-content-list" }, resource.reflection_prompts
      .map((item) => displayText(item))
      .filter(Boolean)
      .map((item) => createElement("li", { text: item }))) : null
  ].filter(Boolean));

  return createElement("article", { class: "ds-detail" }, [
    createElement("header", { class: "ds-object-head" }, [
      createElement("div", {}, [
        createElement("p", { class: "ds-object-kicker", text: kicker }),
        createElement("h2", { class: "ds-object-title", text: displayText(resource.title, "Ressurs") }),
        ...paragraphs(createElement, "ds-object-lead", introduction)
      ]),
      primaryPrintable && onOpenFile ? createElement("div", { class: "ds-object-actions" }, [
        dsButtonNode(createElement, createIcon, "Last ned PDF", { iconName: "download", onClick: () => onOpenFile(primaryPrintable) })
      ]) : null
    ].filter(Boolean)),
    showCoachNote ? createElement("div", { class: "ds-context ds-context--note" }, [
      createElement("div", {}, [
        createElement("p", { class: "ds-context-label", text: "Fra coach" }),
        createElement("p", { class: "ds-context-text", text: coachNote })
      ])
    ]) : null,
    dsSectionNode(createElement, "Innhold", [content]),
    files.length ? dsSectionNode(createElement, "Filer", [
      createElement("ul", { class: "ds-files" }, files.map((file) => createElement("li", {}, [
        createElement("span", { text: file.display_name }),
        onOpenFile ? dsButtonNode(createElement, createIcon, fileActionLabel(file), { variant: "text", iconName: "download", onClick: () => onOpenFile(file) }) : null
      ].filter(Boolean))))
    ]) : null,
    createResponseSection(createElement, sharedResource, { onSave, readOnly, privateResponse, clientNoteText, hasClientNote })
  ].filter(Boolean));
}

function createResponseSection(createElement, sharedResource, { onSave, readOnly, privateResponse, clientNoteText, hasClientNote }) {
  if (readOnly) {
    const text = privateResponse
      ? "Klienten har lagret en privat refleksjon som ikke er delt med coach."
      : hasClientNote ? "" : "Ingen refleksjon delt ennå.";
    return dsSectionNode(createElement, "Klientens refleksjon", [
      text
        ? createElement("p", { class: "ds-empty-text", text })
        : createElement("p", { class: "ds-note-text", text: clientNoteText })
    ]);
  }

  let clientVisibility = sharedResource?.client_visibility === "shared_with_coach" ? "shared_with_coach" : "private";
  const note = createElement("textarea", {
    class: "ds-qa-field",
    placeholder: "Hva vil du ta med deg?",
    rows: "4",
    "aria-label": "Din refleksjon"
  });
  note.value = clientNoteText;
  const savedText = (visibility) => (visibility === "shared_with_coach" ? "Lagret og delt med coach" : "Lagret privat");
  const status = createElement("span", { class: "ds-saved", role: "status", "aria-live": "polite", "data-state": hasClientNote ? "saved" : "clean", text: hasClientNote ? savedText(clientVisibility) : "" });
  const save = dsButtonNode(createElement, null, "Lagre refleksjon", {
    variant: "primary",
    disabled: !hasClientNote,
    onClick: async () => {
      if (!onSave) return;
      save.disabled = true;
      status.dataset.state = "saving";
      status.textContent = "Lagrer …";
      try {
        await onSave(sharedResource, { clientNote: note.value || "", clientVisibility });
        status.dataset.state = "saved";
        status.textContent = savedText(clientVisibility);
      } catch (error) {
        status.dataset.state = "error";
        status.textContent = "Kunne ikke lagre";
      } finally {
        save.disabled = false;
      }
    }
  });
  note.addEventListener("input", () => {
    save.disabled = !note.value.trim() && !hasClientNote;
  });
  return dsSectionNode(createElement, "Din refleksjon", [
    note,
    createVisibilityChoice(createElement, clientVisibility, (value) => {
      clientVisibility = value;
    }),
    createElement("div", { class: "ds-section-foot" }, [save, status])
  ], "ds-resource-response");
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
