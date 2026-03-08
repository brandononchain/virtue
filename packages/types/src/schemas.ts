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

// ─── Editor Transition ──────────────────────────────────
export const VirtueTransitionSchema = z.object({
  type: z.enum(["cut", "fade", "cross-dissolve"]).default("cut"),
  durationSec: z.number().min(0).default(0),
  easing: z.string().optional(),
});
export type VirtueTransition = z.infer<typeof VirtueTransitionSchema>;

// ─── Audio Track ────────────────────────────────────────
export const VirtueAudioTrackSchema = z.object({
  id: z.string(),
  type: z.enum(["music", "voiceover", "sfx"]),
  assetId: z.string(),
  label: z.string().default(""),
  startTime: z.number().min(0).default(0),
  endTime: z.number().min(0).optional(),
  volume: z.number().min(0).max(1).default(1),
  fadeInSec: z.number().min(0).default(0),
  fadeOutSec: z.number().min(0).default(0),
});
export type VirtueAudioTrack = z.infer<typeof VirtueAudioTrackSchema>;

// ─── Editor Timeline Shot ───────────────────────────────
export const EditorTimelineShotSchema = z.object({
  shotId: z.string(),
  renderAssetId: z.string().optional(),
  startTime: z.number().min(0),
  duration: z.number().positive(),
  trimStart: z.number().min(0).default(0),
  trimEnd: z.number().min(0).default(0),
  transition: VirtueTransitionSchema.default({ type: "cut", durationSec: 0 }),
});
export type EditorTimelineShot = z.infer<typeof EditorTimelineShotSchema>;

// ─── Editor Timeline ────────────────────────────────────
export const VirtueEditorTimelineSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sceneId: z.string(),
  shots: z.array(EditorTimelineShotSchema).default([]),
  musicTracks: z.array(VirtueAudioTrackSchema).default([]),
  voiceoverTracks: z.array(VirtueAudioTrackSchema).default([]),
  sfxTracks: z.array(VirtueAudioTrackSchema).default([]),
  pacingPreset: z.enum(["cinematic", "slow-burn", "fast-cut", "trailer"]).optional(),
  totalDuration: z.number().min(0).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type VirtueEditorTimeline = z.infer<typeof VirtueEditorTimelineSchema>;

// ─── Export Plan ────────────────────────────────────────
export const VirtueExportPlanSchema = z.object({
  timelineId: z.string(),
  sceneId: z.string(),
  videoSegments: z.array(z.object({
    shotId: z.string(),
    assetPath: z.string(),
    startTime: z.number(),
    duration: z.number(),
    transition: VirtueTransitionSchema,
  })),
  audioMix: z.array(z.object({
    trackId: z.string(),
    type: z.enum(["music", "voiceover", "sfx"]),
    assetPath: z.string(),
    startTime: z.number(),
    endTime: z.number().optional(),
    volume: z.number(),
    fadeInSec: z.number(),
    fadeOutSec: z.number(),
  })),
  totalDuration: z.number(),
  outputFormat: z.string().default("mp4"),
});
export type VirtueExportPlan = z.infer<typeof VirtueExportPlanSchema>;

// ─── Export Job ─────────────────────────────────────────
export const VirtueExportJobSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sceneId: z.string(),
  timelineId: z.string(),
  status: z.enum([
    "queued", "planning", "composing_video",
    "mixing_audio", "encoding", "completed", "failed",
  ]),
  progress: z.number().min(0).max(100).default(0),
  output: VirtueAssetSchema.optional(),
  error: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type VirtueExportJob = z.infer<typeof VirtueExportJobSchema>;

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

// ─── Routing: Shot Requirements ─────────────────────────
export const VirtueShotRequirementsSchema = z.object({
  shotType: z.string(),
  framing: z.string().default("standard"),
  movement: z.string().default("static"),
  duration: z.number().positive(),
  realismLevel: z.number().min(0).max(1).default(0.7),
  stylizationLevel: z.number().min(0).max(1).default(0.3),
  continuityCritical: z.boolean().default(false),
  referenceAssetsPresent: z.boolean().default(false),
  environmentComplexity: z.number().min(0).max(1).default(0.5),
  characterComplexity: z.number().min(0).max(1).default(0.3),
  actionComplexity: z.number().min(0).max(1).default(0.3),
  dialogueCloseup: z.boolean().default(false),
  wideCinematicScene: z.boolean().default(false),
  imageConditioningNeeded: z.boolean().default(false),
  turnaroundPriority: z.number().min(0).max(1).default(0.5),
  costSensitivity: z.number().min(0).max(1).default(0.5),
});
export type VirtueShotRequirements = z.infer<typeof VirtueShotRequirementsSchema>;

// ─── Routing: Provider Capabilities ─────────────────────
export const VirtueProviderCapabilitiesSchema = z.object({
  provider: z.enum(["mock", "luma", "openai", "google"]),
  displayName: z.string(),
  supportsTextToVideo: z.boolean().default(true),
  supportsImageToVideo: z.boolean().default(false),
  supportsReferenceImages: z.boolean().default(false),
  supportsLongDuration: z.boolean().default(false),
  supportsHighMotion: z.boolean().default(false),
  supportsCharacterConsistency: z.boolean().default(false),
  supportsStylizedOutput: z.boolean().default(false),
  supportsPhotorealism: z.boolean().default(false),
  supportsFastTurnaround: z.boolean().default(false),
  supportsFineCameraControl: z.boolean().default(false),
  maxDurationSeconds: z.number().positive().default(10),
  qualityTier: z.enum(["low", "medium", "high", "premium"]).default("medium"),
  speedTier: z.enum(["slow", "medium", "fast"]).default("medium"),
  costTier: z.enum(["free", "low", "medium", "high"]).default("medium"),
});
export type VirtueProviderCapabilities = z.infer<typeof VirtueProviderCapabilitiesSchema>;

// ─── Routing: Score ─────────────────────────────────────
export const VirtueRoutingScoreSchema = z.object({
  provider: z.enum(["mock", "luma", "openai", "google"]),
  displayName: z.string(),
  totalScore: z.number(),
  breakdown: z.record(z.number()),
  available: z.boolean(),
});
export type VirtueRoutingScore = z.infer<typeof VirtueRoutingScoreSchema>;

// ─── Routing: Decision ──────────────────────────────────
export const VirtueRoutingDecisionSchema = z.object({
  selectedProvider: z.enum(["mock", "luma", "openai", "google"]),
  policy: z.enum(["auto_quality", "auto_speed", "auto_cost", "balanced", "manual"]),
  rationale: z.string(),
  scores: z.array(VirtueRoutingScoreSchema),
  requirements: VirtueShotRequirementsSchema,
  manualOverride: z.boolean().default(false),
  createdAt: z.string().datetime(),
});
export type VirtueRoutingDecision = z.infer<typeof VirtueRoutingDecisionSchema>;

// ─── Routing: Policy ────────────────────────────────────
export const VirtueRoutingPolicySchema = z.object({
  mode: z.enum(["auto_quality", "auto_speed", "auto_cost", "balanced", "manual"]),
  qualityWeight: z.number().min(0).max(1).default(0.4),
  speedWeight: z.number().min(0).max(1).default(0.3),
  costWeight: z.number().min(0).max(1).default(0.3),
  preferredProvider: z.enum(["mock", "luma", "openai", "google"]).optional(),
});
export type VirtueRoutingPolicy = z.infer<typeof VirtueRoutingPolicySchema>;

// ─── Comment ────────────────────────────────────────────
export const VirtueCommentSchema = z.object({
  id: z.string(),
  targetType: z.enum(["project", "scene", "shot", "render", "timeline", "export"]),
  targetId: z.string(),
  authorName: z.string().default("Anonymous"),
  authorId: z.string().optional(),
  body: z.string(),
  parentCommentId: z.string().optional(),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
});
export type VirtueComment = z.infer<typeof VirtueCommentSchema>;

// ─── Approval ───────────────────────────────────────────
export const VirtueApprovalSchema = z.object({
  targetType: z.enum(["project", "scene", "shot", "render", "timeline", "export"]),
  targetId: z.string(),
  state: z.enum(["pending", "needs_changes", "approved", "rejected"]),
  reviewerName: z.string().optional(),
  notes: z.string().optional(),
  updatedAt: z.string().datetime(),
});
export type VirtueApproval = z.infer<typeof VirtueApprovalSchema>;

// ─── Alternate Take ─────────────────────────────────────
export const VirtueAlternateTakeSchema = z.object({
  id: z.string(),
  shotId: z.string(),
  renderJobId: z.string(),
  provider: z.enum(["mock", "luma", "openai", "google"]),
  promptVersion: z.string(),
  continuityContextVersion: z.string().optional(),
  routingDecision: VirtueRoutingDecisionSchema.optional(),
  status: z.enum(["active", "selected", "favorite", "archived"]).default("active"),
  label: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type VirtueAlternateTake = z.infer<typeof VirtueAlternateTakeSchema>;

// ─── Version Snapshot ───────────────────────────────────
export const VirtueVersionSnapshotSchema = z.object({
  id: z.string(),
  targetType: z.enum(["project", "scene", "shot", "render", "timeline", "export"]),
  targetId: z.string(),
  summary: z.string(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
});
export type VirtueVersionSnapshot = z.infer<typeof VirtueVersionSnapshotSchema>;

// ─── Compare Session ────────────────────────────────────
export const VirtueCompareSessionSchema = z.object({
  id: z.string(),
  renderIds: z.array(z.string()).min(2),
  winnerId: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
});
export type VirtueCompareSession = z.infer<typeof VirtueCompareSessionSchema>;

// ─── Workflow Status ────────────────────────────────────
export const VirtueWorkflowStatusSchema = z.object({
  targetType: z.enum(["project", "scene"]),
  targetId: z.string(),
  stage: z.enum([
    "concept", "planning", "previz", "rendering",
    "review", "approved", "final_exported", "archived",
  ]),
  updatedAt: z.string().datetime(),
});
export type VirtueWorkflowStatus = z.infer<typeof VirtueWorkflowStatusSchema>;

// ─── Scene Analysis ────────────────────────────────────
export const VirtueSceneAnalysisSchema = z.object({
  sceneId: z.string(),
  totalDuration: z.number(),
  shotCount: z.number(),
  avgShotDuration: z.number(),
  shotTypeDistribution: z.record(z.number()),
  cameraVariety: z.number().min(0).max(1),
  pacingScore: z.number().min(0).max(1),
  visualDiversity: z.number().min(0).max(1),
  continuityCoverage: z.number().min(0).max(1),
  suggestions: z.array(z.object({
    id: z.string(),
    type: z.enum([
      "add_shot", "trim_shot", "reorder",
      "add_transition", "prompt_improvement",
      "retry_render", "pacing_adjustment",
    ]),
    priority: z.enum(["low", "medium", "high"]),
    title: z.string(),
    description: z.string(),
    metadata: z.record(z.unknown()).default({}),
  })),
  analyzedAt: z.string().datetime(),
});
export type VirtueSceneAnalysis = z.infer<typeof VirtueSceneAnalysisSchema>;

// ─── Shot Suggestion ───────────────────────────────────
export const VirtueShotSuggestionSchema = z.object({
  id: z.string(),
  sceneId: z.string(),
  shotType: z.enum([
    "wide", "medium", "close", "extreme-close",
    "establishing", "over-shoulder", "pov", "aerial",
  ]),
  description: z.string(),
  promptSuggestion: z.string(),
  durationSec: z.number().positive(),
  cameraMove: z.string().default("static"),
  reason: z.string(),
  insertAfterShotId: z.string().optional(),
  recommendedSkills: z.array(z.string()).default([]),
  recommendedProvider: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});
export type VirtueShotSuggestion = z.infer<typeof VirtueShotSuggestionSchema>;

// ─── Prompt Improvement ────────────────────────────────
export const VirtuePromptImprovementSchema = z.object({
  id: z.string(),
  shotId: z.string(),
  originalPrompt: z.string(),
  improvedPrompt: z.string(),
  changes: z.array(z.string()),
  reason: z.string(),
  suggestedProvider: z.string().optional(),
});
export type VirtuePromptImprovement = z.infer<typeof VirtuePromptImprovementSchema>;

// ─── Highlight Clip ────────────────────────────────────
export const VirtueHighlightSchema = z.object({
  id: z.string(),
  sceneId: z.string(),
  shotId: z.string(),
  score: z.number().min(0).max(1),
  reason: z.string(),
  tags: z.array(z.string()).default([]),
  durationSec: z.number(),
});
export type VirtueHighlight = z.infer<typeof VirtueHighlightSchema>;

// ─── Trailer Plan ──────────────────────────────────────
export const VirtueTrailerPlanSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  highlights: z.array(VirtueHighlightSchema),
  totalDuration: z.number(),
  pacingPreset: z.enum(["cinematic", "slow-burn", "fast-cut", "trailer"]).default("trailer"),
  createdAt: z.string().datetime(),
});
export type VirtueTrailerPlan = z.infer<typeof VirtueTrailerPlanSchema>;
