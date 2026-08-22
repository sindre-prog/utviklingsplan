import { RESOURCE_BLOCK_TYPES } from "./resources.constants.js?v=polish-107";

function assertElementFactory(createElement) {
  if (typeof createElement !== "function") {
    throw new TypeError("renderResourceContentBlocks requires a createElement function.");
  }
}

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  if (!text || text.toLowerCase() === "null" || text.toLowerCase() === "undefined") return fallback;
  return text;
}

function textNode(createElement, tag, className, text) {
  return createElement(tag, { class: className, text: cleanText(text) });
}

function textParagraphs(createElement, className, text) {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const paragraphs = cleaned
    .split(/\n{2,}|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph) => textNode(createElement, "p", className, paragraph));
}

function visibleTextItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function renderList(createElement, className, items = []) {
  const visibleItems = visibleTextItems(items);

  return createElement("ul", { class: className }, visibleItems.map((item) => (
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
  return rendered.filter(Boolean);
}

function renderResourceStep(textBlock, worksheetBlock, options = {}) {
  const { createElement = null } = options;
  assertElementFactory(createElement);
  const heading = cleanText(textBlock.heading);
  const paragraphs = textParagraphs(createElement, "resource-block__content", textBlock.content);
  const fields = visibleTextItems(worksheetBlock.fields || []);

  if (!heading && !paragraphs.length && !fields.length) return null;

  return createElement("section", { class: "resource-block resource-block--step" }, [
    ...(heading ? [textNode(createElement, "h3", "resource-block__heading", heading)] : []),
    ...paragraphs,
    renderWorksheetFields(createElement, fields)
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
      {
        const paragraphs = textParagraphs(createElement, "resource-block__content", block.content);
        if (!paragraphs.length) return null;
        return createElement("section", { class: "resource-block resource-block--intro" }, paragraphs);
      }
    case RESOURCE_BLOCK_TYPES.text:
      {
        const heading = cleanText(block.heading);
        const paragraphs = textParagraphs(createElement, "resource-block__content", block.content);
        if (!heading && !paragraphs.length) return null;
        return createElement("section", { class: "resource-block resource-block--text" }, [
          ...(heading ? [textNode(createElement, "h3", "resource-block__heading", heading)] : []),
          ...paragraphs
        ]);
      }
    case RESOURCE_BLOCK_TYPES.callout:
      {
        const heading = cleanText(block.heading);
        const paragraphs = textParagraphs(createElement, "resource-block__content", block.content);
        if (!heading && !paragraphs.length) return null;
        return createElement("section", { class: `resource-block resource-block--callout resource-block--callout-${block.tone || "note"}` }, [
          ...(heading ? [textNode(createElement, "h3", "resource-block__heading", heading)] : []),
          ...paragraphs
        ]);
      }
    case RESOURCE_BLOCK_TYPES.modelCards:
      {
        const heading = cleanText(block.heading);
        const cards = normalizeCards(block.cards);
        if (!heading && !cards.length) return null;
        return createElement("section", { class: "resource-block resource-block--model-cards" }, [
          ...(heading ? [textNode(createElement, "h3", "resource-block__heading", heading)] : []),
          createElement("div", { class: "resource-model-card-grid" }, cards.map((card) => (
            createElement("article", { class: "resource-model-card" }, [
              ...(card.title ? [createElement("h4", { text: card.title })] : []),
              ...(card.body ? textParagraphs(createElement, "resource-block__content", card.body) : [])
            ])
          )))
        ]);
      }
    case RESOURCE_BLOCK_TYPES.quote:
      {
        const quote = cleanText(block.quote);
        const attribution = cleanText(block.attribution);
        if (!quote && !attribution) return null;
        return createElement("figure", { class: "resource-block resource-block--quote" }, [
          quote ? createElement("blockquote", { text: quote }) : null,
          attribution ? createElement("figcaption", { text: attribution }) : null
        ].filter(Boolean));
      }
    case RESOURCE_BLOCK_TYPES.illustration:
      {
        const file = findIllustrationFile(block, resourceFiles);
        const label = cleanText(file?.display_name || block.display_name, illustrationLabel(block.key));
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
      {
        const heading = cleanText(block.heading);
        const fields = visibleTextItems(block.fields || []);
        if (!heading && !fields.length) return null;
        return createElement("section", { class: "resource-block resource-block--worksheet" }, [
          ...(heading ? [textNode(createElement, "h3", "resource-block__heading", heading)] : []),
          renderWorksheetFields(createElement, fields)
        ]);
      }
    case RESOURCE_BLOCK_TYPES.reflectionQuestions:
      {
        const questions = visibleTextItems(block.questions || []);
        if (!questions.length) return null;
        return createElement("section", { class: "resource-block resource-block--reflection-questions" }, [
          textNode(createElement, "h3", "resource-block__heading", cleanText(block.heading, "Refleksjonsspørsmål")),
          renderList(createElement, "resource-block__questions", questions)
        ]);
      }
    case RESOURCE_BLOCK_TYPES.download:
      {
        const file = findDownloadFile(block, resourceFiles);
        const label = cleanText(block.label || file?.display_name || block.display_name, "Last ned fil");
        return createElement("section", { class: "resource-block resource-block--download" }, [
          createElement("div", { class: "resource-download-card" }, [
            createElement("div", {}, [
              createElement("span", { class: "resource-download-kicker", text: file?.file_type === "attachment" ? "Vedlegg" : "PDF" }),
              createElement("h3", { class: "resource-block__heading", text: label })
            ]),
            onOpenFile && file ? createElement("button", {
              class: "button ghost resource-file-open",
              type: "button",
              onclick: () => onOpenFile(file)
            }, [
              createElement("span", { text: file.file_type === "printable" ? "Last ned PDF" : "Last ned vedlegg" })
            ]) : null
          ].filter(Boolean))
        ]);
      }
    default:
      return createElement("div", {
        class: "resource-block resource-block--unsupported",
        "data-block-type": block.type || "unknown"
      });
  }
}

function renderWorksheetFields(createElement, fields = []) {
  const visibleFields = visibleTextItems(fields);

  return createElement("div", { class: "resource-block__fields" }, visibleFields.map((field) => (
    createElement("div", { class: "resource-block__field" }, [
      createElement("span", { text: field })
    ])
  )));
}

function normalizeCards(cards = []) {
  return (Array.isArray(cards) ? cards : [])
    .map((card) => ({
      title: cleanText(card?.title),
      body: cleanText(card?.body || card?.content)
    }))
    .filter((card) => card.title || card.body)
    .slice(0, 4);
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

function findDownloadFile(block, files = []) {
  if (!block) return null;
  const downloadableFiles = files.filter((file) => ["printable", "attachment"].includes(file.file_type));
  return downloadableFiles.find((file) => (
    (block.file_id && file.id === block.file_id) ||
    (block.storage_path && file.storage_path === block.storage_path) ||
    (block.file_url && file.storage_path === block.file_url) ||
    (block.display_name && file.display_name === block.display_name) ||
    (block.label && file.display_name === block.label)
  )) || null;
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
