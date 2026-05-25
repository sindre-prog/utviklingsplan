import { RESOURCE_BLOCK_TYPES } from "./resources.constants.js";

function assertElementFactory(createElement) {
  if (typeof createElement !== "function") {
    throw new TypeError("renderResourceContentBlocks requires a createElement function.");
  }
}

function textNode(createElement, tag, className, text) {
  return createElement(tag, { class: className, text: text || "" });
}

function renderList(createElement, className, items = []) {
  return createElement("ul", { class: className }, items.map((item) => (
    createElement("li", { text: item })
  )));
}

export function renderResourceContentBlocks(blocks = [], options = {}) {
  const { createElement = null } = options;
  assertElementFactory(createElement);

  return blocks.map((block) => renderResourceBlock(block, options));
}

export function renderResourceBlock(block, options = {}) {
  const { createElement = null } = options;
  assertElementFactory(createElement);

  if (!block || typeof block !== "object") {
    return textNode(createElement, "p", "resource-block resource-block--invalid", "");
  }

  switch (block.type) {
    case RESOURCE_BLOCK_TYPES.intro:
      return textNode(createElement, "p", "resource-block resource-block--intro", block.content);
    case RESOURCE_BLOCK_TYPES.text:
      return createElement("section", { class: "resource-block resource-block--text" }, [
        ...(block.heading ? [textNode(createElement, "h3", "resource-block__heading", block.heading)] : []),
        textNode(createElement, "p", "resource-block__content", block.content)
      ]);
    case RESOURCE_BLOCK_TYPES.illustration:
      return createElement("div", {
        class: "resource-block resource-block--illustration",
        "data-illustration-key": block.key || ""
      }, [
        createElement("span", { class: "resource-illustration-orb" }),
        createElement("p", { text: illustrationLabel(block.key) })
      ]);
    case RESOURCE_BLOCK_TYPES.worksheet:
      return createElement("div", { class: "resource-block resource-block--worksheet" }, [
        renderList(createElement, "resource-block__fields", block.fields || [])
      ]);
    case RESOURCE_BLOCK_TYPES.reflectionQuestions:
      return createElement("div", { class: "resource-block resource-block--reflection-questions" }, [
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

export function renderReflectionPrompts(prompts = [], options = {}) {
  const { createElement = null } = options;
  assertElementFactory(createElement);

  return prompts.map((prompt) => textNode(createElement, "p", "resource-reflection-prompt", prompt));
}

function illustrationLabel(key) {
  const labels = {
    abcde_model: "ABCDE-modellen",
    control_circle: "Kontrollsirkelen",
    fear_curve: "Fryktkurve"
  };
  return labels[key] || "Illustrasjon";
}
