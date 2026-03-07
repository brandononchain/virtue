import { z } from "zod";

// ─── Skill ───────────────────────────────────────────────
export const VirtueSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  purpose: z.string(),
  responsibilities: z.array(z.string()).default([]),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  examples: z.array(z.string()).default([]),
  raw: z.string().optional(),
});
export type VirtueSkill = z.infer<typeof VirtueSkillSchema>;

// ─── Asset ───────────────────────────────────────────────
export const VirtueAssetSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: z.enum(["video", "image", "audio", "storyboard", "thumbnail"]),
  url: z.string(),
  filename: z.string(),
  mimeType: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
});
export type VirtueAsset = z.infer<typeof VirtueAssetSchema>;

// ─── Character ───────────────────────────────────────────
export const VirtueCharacterSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().default(""),
  appearance: z.string().default(""),
  clothing: z.string().default(""),
  age: z.string().default(""),
  gender: z.string().default(""),
  ethnicity: z.string().optional(),
  voiceNotes: z.string().default(""),
  visualReferenceAssets: z.array(z.string()).default([]),
  styleTags: z.array(z.string()).default([]),
});
export type VirtueCharacter = z.infer<typeof VirtueCharacterSchema>;

// ─── Environment ────────────────────────────────────────
export const VirtueEnvironmentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().default(""),
  locationType: z.string().default(""),
  timeOfDay: z.string().default("day"),
  weather: z.string().default(""),
  lightingStyle: z.string().default(""),
  colorPalette: z.array(z.string()).default([]),
  visualReferenceAssets: z.array(z.string()).default([]),
});
export type VirtueEnvironment = z.infer<typeof VirtueEnvironmentSchema>;

// ─── Prop ───────────────────────────────────────────────
export const VirtuePropSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().default(""),
  material: z.string().default(""),
  condition: z.string().default(""),
  usageNotes: z.string().default(""),
  visualReferenceAssets: z.array(z.string()).default([]),
});
export type VirtueProp = z.infer<typeof VirtuePropSchema>;

// ─── Scene Context ──────────────────────────────────────
export const SceneContextSchema = z.object({
  environmentId: z.string().optional(),
  activeCharacterIds: z.array(z.string()).default([]),
  activePropIds: z.array(z.string()).default([]),
  lightingIntent: z.string().default(""),
  moodIntent: z.string().default(""),
});
export type SceneContext = z.infer<typeof SceneContextSchema>;

// ─── Shot ────────────────────────────────────────────────
export const VirtueShotSchema = z.object({
  id: z.string(),
  sceneId: z.string(),
  order: z.number().int().min(0),
  shotType: z.enum([
    "wide", "medium", "close", "extreme-close",
    "establishing", "over-shoulder", "pov", "aerial",
  ]),
  description: z.string(),
  prompt: z.string().default(""),
  durationSec: z.number().positive().default(4),
  cameraMove: z.string().default("static"),
  lens: z.string().default("50mm"),
  lighting: z.string().default("natural"),
  skills: z.array(z.string()).default([]),
  characterIds: z.array(z.string()).default([]),
  propIds: z.array(z.string()).default([]),
  continuityOverride: z.string().optional(),
  renderJobId: z.string().optional(),
});
export type VirtueShot = z.infer<typeof VirtueShotSchema>;

// ─── Scene ───────────────────────────────────────────────
export const VirtueSceneSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  order: z.number().int().min(0),
  title: z.string(),
  description: z.string().default(""),
  location: z.string().default(""),
  timeOfDay: z.string().default("day"),
  mood: z.string().default(""),
  shots: z.array(VirtueShotSchema).default([]),
  characters: z.array(z.string()).default([]),
  context: SceneContextSchema.optional(),
});
export type VirtueScene = z.infer<typeof VirtueSceneSchema>;

// ─── Render Job ──────────────────────────────────────────
export const VirtueRenderJobSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  shotId: z.string(),
  provider: z.enum(["mock", "luma", "openai", "google"]),
  status: z.enum([
    "queued", "preparing", "generating",
    "post-processing", "completed", "failed",
  ]),
  progress: z.number().min(0).max(100).default(0),
  prompt: z.string(),
  skills: z.array(z.string()).default([]),
  output: VirtueAssetSchema.optional(),
  error: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type VirtueRenderJob = z.infer<typeof VirtueRenderJobSchema>;

// ─── Timeline (legacy multi-track) ──────────────────────
export const VirtueTimelineSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  tracks: z.array(z.object({
    id: z.string(),
    label: z.string(),
    clips: z.array(z.object({
      shotId: z.string(),
      startSec: z.number(),
      durationSec: z.number(),
      assetId: z.string().optional(),
    })),
  })).default([]),
});
export type VirtueTimeline = z.infer<typeof VirtueTimelineSchema>;

// ─── Scene Timeline ─────────────────────────────────────
export const TimelineShotSchema = z.object({
  shotId: z.string(),
  renderAssetId: z.string().optional(),
  startTime: z.number().min(0),
  duration: z.number().positive(),
  transitionType: z.enum(["cut", "dissolve", "fade-black", "fade-white"]).default("cut"),
  transitionDuration: z.number().min(0).default(0),
});
export type TimelineShot = z.infer<typeof TimelineShotSchema>;

export const SceneTimelineSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sceneId: z.string(),
  shots: z.array(TimelineShotSchema).default([]),
  totalDuration: z.number().min(0).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type SceneTimeline = z.infer<typeof SceneTimelineSchema>;

// ─── Scene Render Job ───────────────────────────────────
export const SceneRenderJobSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sceneId: z.string(),
  timelineId: z.string(),
  status: z.enum(["queued", "planning", "composing", "encoding", "completed", "failed"]),
  progress: z.number().min(0).max(100).default(0),
  shotCount: z.number().int().min(0).default(0),
  output: VirtueAssetSchema.optional(),
  error: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type SceneRenderJob = z.infer<typeof SceneRenderJobSchema>;

// ─── Project ─────────────────────────────────────────────
export const VirtueProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  screenplay: z.string().default(""),
  scenes: z.array(VirtueSceneSchema).default([]),
  characters: z.array(VirtueCharacterSchema).default([]),
  environments: z.array(VirtueEnvironmentSchema).default([]),
  props: z.array(VirtuePropSchema).default([]),
  assets: z.array(VirtueAssetSchema).default([]),
  timeline: VirtueTimelineSchema.optional(),
  provider: z.enum(["mock", "luma", "openai", "google"]).default("mock"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type VirtueProject = z.infer<typeof VirtueProjectSchema>;

// ─── Director ───────────────────────────────────────────
export const DirectorInputSchema = z.object({
  text: z.string().min(1),
  mode: z.enum(["screenplay", "concept"]).default("concept"),
  projectName: z.string().optional(),
});
export type DirectorInput = z.infer<typeof DirectorInputSchema>;

export const DirectorShotPlanSchema = z.object({
  shotTitle: z.string(),
  shotType: z.enum([
    "wide", "medium", "close", "extreme-close",
    "establishing", "over-shoulder", "pov", "aerial",
  ]),
  description: z.string(),
  lens: z.string(),
  cameraMove: z.string(),
  estimatedDuration: z.number().positive(),
  visualIntent: z.string(),
  lightingIntent: z.string(),
  environmentNotes: z.string().default(""),
  characterNotes: z.string().default(""),
  promptSeed: z.string(),
  attachedSkills: z.array(z.string()).default([]),
});
export type DirectorShotPlan = z.infer<typeof DirectorShotPlanSchema>;

export const DirectorScenePlanSchema = z.object({
  sceneNumber: z.number().int().min(1),
  title: z.string(),
  location: z.string(),
  timeOfDay: z.string(),
  mood: z.string(),
  description: z.string(),
  characters: z.array(z.string()).default([]),
  shots: z.array(DirectorShotPlanSchema).default([]),
});
export type DirectorScenePlan = z.infer<typeof DirectorScenePlanSchema>;

export const DirectorOutputSchema = z.object({
  id: z.string(),
  input: DirectorInputSchema,
  projectName: z.string(),
  synopsis: z.string(),
  scenes: z.array(DirectorScenePlanSchema),
  totalShots: z.number().int().min(0),
  estimatedDuration: z.number().min(0),
  createdAt: z.string().datetime(),
});
export type DirectorOutput = z.infer<typeof DirectorOutputSchema>;

// ─── Provider ────────────────────────────────────────────
export const VirtueProviderSchema = z.object({
  name: z.enum(["mock", "luma", "openai", "google"]),
  displayName: z.string(),
  capabilities: z.array(z.string()).default([]),
  maxDurationSec: z.number().positive().default(10),
  supportedResolutions: z.array(z.string()).default(["1080p"]),
  enabled: z.boolean().default(false),
});
export type VirtueProvider = z.infer<typeof VirtueProviderSchema>;
