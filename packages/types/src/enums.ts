export const ShotType = {
  WIDE: "wide",
  MEDIUM: "medium",
  CLOSE: "close",
  EXTREME_CLOSE: "extreme-close",
  ESTABLISHING: "establishing",
  OVER_SHOULDER: "over-shoulder",
  POV: "pov",
  AERIAL: "aerial",
} as const;
export type ShotType = (typeof ShotType)[keyof typeof ShotType];

export const RenderStatus = {
  QUEUED: "queued",
  PREPARING: "preparing",
  GENERATING: "generating",
  POST_PROCESSING: "post-processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;
export type RenderStatus = (typeof RenderStatus)[keyof typeof RenderStatus];

export const ProviderName = {
  MOCK: "mock",
  LUMA: "luma",
  OPENAI: "openai",
  GOOGLE: "google",
} as const;
export type ProviderName = (typeof ProviderName)[keyof typeof ProviderName];

export const AssetType = {
  VIDEO: "video",
  IMAGE: "image",
  AUDIO: "audio",
  STORYBOARD: "storyboard",
  THUMBNAIL: "thumbnail",
} as const;
export type AssetType = (typeof AssetType)[keyof typeof AssetType];

export const TransitionType = {
  CUT: "cut",
  DISSOLVE: "dissolve",
  FADE_BLACK: "fade-black",
  FADE_WHITE: "fade-white",
} as const;
export type TransitionType = (typeof TransitionType)[keyof typeof TransitionType];

export const SceneRenderStatus = {
  QUEUED: "queued",
  PLANNING: "planning",
  COMPOSING: "composing",
  ENCODING: "encoding",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;
export type SceneRenderStatus = (typeof SceneRenderStatus)[keyof typeof SceneRenderStatus];

export const DirectorInputMode = {
  SCREENPLAY: "screenplay",
  CONCEPT: "concept",
} as const;
export type DirectorInputMode = (typeof DirectorInputMode)[keyof typeof DirectorInputMode];
