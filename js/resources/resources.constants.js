export const RESOURCE_TYPES = Object.freeze({
  article: "article",
  exercise: "exercise",
  reflection: "reflection",
  worksheet: "worksheet",
  assessment: "assessment",
  audio: "audio",
  video: "video",
  framework: "framework",
  template: "template",
  guidedSession: "guided_session"
});

export const RESOURCE_FORMATS = Object.freeze({
  native: "native",
  pdf: "pdf",
  audio: "audio",
  video: "video",
  link: "link",
  mixed: "mixed"
});

export const RESOURCE_PHASES = Object.freeze({
  direction: "direction",
  focus: "focus",
  experiment: "experiment",
  observation: "observation",
  session: "session",
  reflection: "reflection",
  adjustment: "adjustment"
});

export const RESOURCE_VISIBILITIES = Object.freeze({
  admin: "admin",
  coach: "coach",
  clientAssignable: "client_assignable"
});

export const RESOURCE_STATUSES = Object.freeze({
  draft: "draft",
  published: "published",
  archived: "archived"
});

export const RESOURCE_REVIEW_STATUSES = Object.freeze({
  draft: "draft",
  approvedForPilot: "approved_for_pilot",
  reviewed: "reviewed",
  needsRevision: "needs_revision"
});

export const RESOURCE_CONTEXT_TYPES = Object.freeze({
  program: "program",
  focusArea: "focus_area",
  session: "session",
  experiment: "experiment",
  reflection: "reflection"
});

export const SHARED_RESOURCE_STATUSES = Object.freeze({
  assigned: "assigned",
  viewed: "viewed",
  responded: "responded",
  archived: "archived"
});

export const CLIENT_VISIBILITIES = Object.freeze({
  private: "private",
  sharedWithCoach: "shared_with_coach"
});

export const RESOURCE_BLOCK_TYPES = Object.freeze({
  intro: "intro",
  text: "text",
  illustration: "illustration",
  worksheet: "worksheet",
  reflectionQuestions: "reflection_questions",
  download: "download"
});

export const RESOURCE_FILE_TYPES = Object.freeze({
  coverImage: "cover_image",
  illustration: "illustration",
  printable: "printable",
  attachment: "attachment",
  audio: "audio",
  video: "video"
});

export const RESOURCE_LIBRARY_GLOBAL = "RaederResourceLibrary";

