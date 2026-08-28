import { LEADERSHIP_COMPETENCY_CATEGORIES } from "../leadership/leadership.constants.js?v=polish-99";

export const RESOURCE_DEVELOPMENT_AREA_TAG_PREFIX = "area:";

export const RESOURCE_DEVELOPMENT_AREA_OPTIONS = Object.freeze(
  Object.entries(LEADERSHIP_COMPETENCY_CATEGORIES)
);

function cleanText(value) {
  const text = String(value ?? "").trim();
  if (!text || text.toLowerCase() === "null" || text.toLowerCase() === "undefined") return "";
  return text;
}

function resourceTags(resourceOrTags) {
  return Array.isArray(resourceOrTags)
    ? resourceOrTags
    : Array.isArray(resourceOrTags?.tags)
      ? resourceOrTags.tags
      : [];
}

export function resourceIntroduction(resource = {}) {
  // client_intro remains first only to preserve existing editorial choices while the fields coexist.
  return cleanText(resource.client_intro) || cleanText(resource.summary);
}

export function resourceDevelopmentArea(resourceOrTags = []) {
  const tag = resourceTags(resourceOrTags).find((value) => (
    String(value || "").startsWith(RESOURCE_DEVELOPMENT_AREA_TAG_PREFIX)
  ));
  const key = String(tag || "").slice(RESOURCE_DEVELOPMENT_AREA_TAG_PREFIX.length);
  return Object.hasOwn(LEADERSHIP_COMPETENCY_CATEGORIES, key) ? key : "";
}

export function resourceDevelopmentAreaLabel(resourceOrTags = []) {
  const key = resourceDevelopmentArea(resourceOrTags);
  return key ? LEADERSHIP_COMPETENCY_CATEGORIES[key] : "Ikke kategorisert";
}

export function resourceTopicTags(resourceOrTags = []) {
  return resourceTags(resourceOrTags).filter((tag) => (
    !String(tag || "").startsWith(RESOURCE_DEVELOPMENT_AREA_TAG_PREFIX)
  ));
}

export function withResourceDevelopmentArea(tags = [], area = "") {
  const topicTags = resourceTopicTags(tags);
  if (!Object.hasOwn(LEADERSHIP_COMPETENCY_CATEGORIES, area)) return topicTags;
  return [...topicTags, `${RESOURCE_DEVELOPMENT_AREA_TAG_PREFIX}${area}`];
}

export function normalizeResourceProductFields(resource = {}) {
  return {
    ...resource,
    introduction: resourceIntroduction(resource),
    development_area: resourceDevelopmentArea(resource),
    development_area_label: resourceDevelopmentAreaLabel(resource),
    topic_tags: resourceTopicTags(resource)
  };
}

export function groupResourcesByDevelopmentArea(resources = []) {
  const groups = new Map();
  RESOURCE_DEVELOPMENT_AREA_OPTIONS.forEach(([key, label]) => groups.set(key, { key, label, resources: [] }));
  groups.set("uncategorized", { key: "uncategorized", label: "Ikke kategorisert", resources: [] });

  (resources || []).forEach((resource) => {
    const key = resourceDevelopmentArea(resource) || "uncategorized";
    groups.get(key)?.resources.push(resource);
  });

  return Array.from(groups.values()).filter((group) => group.resources.length > 0);
}
