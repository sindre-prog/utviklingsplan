import { RESOURCE_BLOCK_TYPES } from "./resources.constants.js?v=polish-81";

function assertElementFactory(createElement) {
  if (typeof createElement !== "function") {
    throw new TypeError("renderResourceContentBlocks requires a createElement function.");
  }
}

function textNode(createElement, tag, className, text) {
  return createElement(tag, { class: className, text: text || "" });
}

function textParagraphs(createElement, className, text) {
  const paragraphs = String(text || "")
    .split(/\n{2,}|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) return [textNode(createElement, "p", className, "")];
  return paragraphs.map((paragraph) => textNode(createElement, "p", className, paragraph));
}

function renderList(createElement, className, items = []) {
  return createElement("ul", { class: className }, items.map((item) => (
    createElement("li", { text: item })
  )));
}

export function renderResourceContentBlocks(blocks = [], options = {}) {
  const { createElement = null } = options;
  assertElementFactory(createElement);

  const rendered = [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const nextBlock = blocks[index + 1];
    if (block?.type === RESOURCE_BLOCK_TYPES.text && nextBlock?.type === RESOURCE_BLOCK_TYPES.worksheet) {
      rendered.push(renderResourceStep(block, nextBlock, options));
      index += 1;
    } else {
      rendered.push(renderResourceBlock(block, options));
    }
  }
  return rendered;
}

function renderResourceStep(textBlock, worksheetBlock, options = {}) {
  const { createElement = null } = options;
  assertElementFactory(createElement);

  return createElement("section", { class: "resource-block resource-block--step" }, [
    ...(textBlock.heading ? [textNode(createElement, "h3", "resource-block__heading", textBlock.heading)] : []),
    ...textParagraphs(createElement, "resource-block__content", textBlock.content),
    renderWorksheetFields(createElement, worksheetBlock.fields || [])
  ]);
}

export function renderResourceBlock(block, options = {}) {
  const { createElement = null, resourceFiles = [], onOpenFile = null } = options;
  assertElementFactory(createElement);

  if (!block || typeof block !== "object") {
    return textNode(createElement, "p", "resource-block resource-block--invalid", "");
  }

  switch (block.type) {
    case RESOURCE_BLOCK_TYPES.intro:
      return createElement("section", { class: "resource-block resource-block--intro" }, (
        textParagraphs(createElement, "resource-block__content", block.content)
      ));
    case RESOURCE_BLOCK_TYPES.text:
      return createElement("section", { class: "resource-block resource-block--text" }, [
        ...(block.heading ? [textNode(createElement, "h3", "resource-block__heading", block.heading)] : []),
        ...textParagraphs(createElement, "resource-block__content", block.content)
      ]);
    case RESOURCE_BLOCK_TYPES.illustration:
      {
        const file = findIllustrationFile(block, resourceFiles);
        const label = file?.display_name || block.display_name || illustrationLabel(block.key);
        return createElement("div", {
          class: `resource-block resource-block--illustration ${file ? "has-file" : ""}`,
          "data-illustration-key": block.key || "",
          "data-file-id": file?.id || block.file_id || ""
        }, [
          file?.storage_path
            ? createElement("img", {
              class: "resource-illustration-image",
              alt: label,
              "data-storage-path": file.storage_path
            })
            : createElement("span", { class: "resource-illustration-orb" }),
          file ? null : createElement("p", { text: label }),
          file && onOpenFile ? createElement("button", {
            class: "button ghost resource-file-open",
            type: "button",
            onclick: () => onOpenFile(file)
          }, [createElement("span", { text: "Last ned illustrasjon" })]) : null
        ].filter(Boolean));
      }
    case RESOURCE_BLOCK_TYPES.worksheet:
      return createElement("section", { class: "resource-block resource-block--worksheet" }, [
        ...(block.heading ? [textNode(createElement, "h3", "resource-block__heading", block.heading)] : []),
        renderWorksheetFields(createElement, block.fields || [])
      ]);
    case RESOURCE_BLOCK_TYPES.reflectionQuestions:
      return createElement("section", { class: "resource-block resource-block--reflection-questions" }, [
        renderList(createElement, "resource-block__questions", block.questions || [])
      ]);
    case RESOURCE_BLOCK_TYPES.download:
      return textNode(createElement, "p", "resource-block resource-block--download", block.label);
    default:
      return createElement("div", {
        class: "resource-block resource-block--unsupported",
        "data-block-type": block.type || "unknown"
      });
  }
}

function renderWorksheetFields(createElement, fields = []) {
  const visibleFields = (Array.isArray(fields) ? fields : [])
    .map((field) => String(field || "").trim())
    .filter(Boolean);

  return createElement("div", { class: "resource-block__fields" }, visibleFields.map((field) => (
    createElement("div", { class: "resource-block__field" }, [
      createElement("span", { text: field })
    ])
  )));
}

function findIllustrationFile(block, files = []) {
  if (!block) return null;
  const illustrationFiles = files.filter((file) => file.file_type === "illustration");
  const selectedFile = illustrationFiles.find((file) => (
    file.file_type === "illustration" &&
    (
      (block.file_id && file.id === block.file_id) ||
      (block.storage_path && file.storage_path === block.storage_path)
    )
  ));
  if (selectedFile) return selectedFile;

  const hasExplicitLegacyKey = Boolean(String(block.key || "").trim());
  const hasExplicitFileReference = Boolean(block.file_id || block.storage_path);
  if (!hasExplicitLegacyKey && !hasExplicitFileReference && illustrationFiles.length === 1) {
    return illustrationFiles[0];
  }

  return null;
}

export function renderReflectionPrompts(prompts = [], options = {}) {
  const { createElement = null } = options;
  assertElementFactory(createElement);

  if (!prompts.length) return [];
  return [renderList(createElement, "resource-reflection-prompt-list", prompts)];
}

function illustrationLabel(key) {
  const labels = {
    abcde_model: "ABCDE-modellen",
    control_circle: "Kontrollsirkelen",
    fear_curve: "Fryktkurve"
  };
  return labels[key] || "Illustrasjon";
}
