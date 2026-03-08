import type {
  VirtueProject,
  VirtueSkill,
  VirtueRenderJob,
  SceneTimeline,
  SceneRenderJob,
  DirectorOutput,
  VirtueCharacter,
  VirtueEnvironment,
  VirtueProp,
  SceneContext,
  VirtueEditorTimeline,
  VirtueExportJob,
  VirtueTransition,
  VirtueRoutingDecision,
  VirtueProviderCapabilities,
  VirtueRoutingPolicy,
  VirtueComment,
  VirtueApproval,
  VirtueAlternateTake,
  VirtueVersionSnapshot,
  VirtueCompareSession,
  VirtueWorkflowStatus,
  VirtueSceneAnalysis,
  VirtueShotSuggestion,
  VirtuePromptImprovement,
  VirtueHighlight,
  VirtueTrailerPlan,
  VirtueWorldState,
  VirtueSimulationContext,
} from "@virtue/types";

interface EnrichmentResult {
  enrichedPrompt: string;
  originalPrompt: string;
  continuityFragment: string;
}

interface ResolvedContext {
  context: SceneContext | undefined;
  resolved: {
    environment: VirtueEnvironment | undefined;
    characters: VirtueCharacter[];
    props: VirtueProp[];
    lightingIntent: string;
    moodIntent: string;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export interface StudioStats {
  projects: number;
  scenes: number;
  shots: number;
  renders: {
    total: number;
    completed: number;
    active: number;
    queued: number;
    failed: number;
  };
  skills: number;
}

export const api = {
  // Stats
  getStats: () => request<StudioStats>("/api/stats"),

  // Projects
  listProjects: () => request<VirtueProject[]>("/api/projects"),
  getProject: (id: string) => request<VirtueProject>(`/api/projects/${id}`),
  createProject: (name: string, description?: string) =>
    request<VirtueProject>("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }),
  deleteProject: (id: string) =>
    request<{ ok: boolean }>(`/api/projects/${id}`, { method: "DELETE" }),
  addScene: (
    projectId: string,
    data: {
      title: string;
      description?: string;
      location?: string;
      timeOfDay?: string;
      mood?: string;
    }
  ) =>
    request<VirtueProject>(`/api/projects/${projectId}/scenes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addShot: (
    projectId: string,
    sceneId: string,
    data: {
      shotType: string;
      description: string;
      prompt?: string;
      durationSec?: number;
      cameraMove?: string;
      lens?: string;
      lighting?: string;
    }
  ) =>
    request<VirtueProject>(
      `/api/projects/${projectId}/scenes/${sceneId}/shots`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  // Skills
  listSkills: () => request<VirtueSkill[]>("/api/skills"),
  getSkill: (slug: string) => request<VirtueSkill>(`/api/skills/${slug}`),
  matchSkills: (query: string) =>
    request<VirtueSkill[]>("/api/skills/match", {
      method: "POST",
      body: JSON.stringify({ query }),
    }),

  // Renders
  listRenders: (projectId?: string) =>
    request<VirtueRenderJob[]>(
      `/api/renders${projectId ? `?projectId=${projectId}` : ""}`
    ),
  getRender: (id: string) =>
    request<VirtueRenderJob>(`/api/renders/${id}`),
  submitRender: (
    projectId: string,
    sceneId: string,
    shotId: string,
    provider?: string,
    prompt?: string,
    routingMode?: string,
  ) =>
    request<VirtueRenderJob>("/api/renders", {
      method: "POST",
      body: JSON.stringify({ projectId, sceneId, shotId, provider, prompt, routingMode }),
    }),
  pollRender: (id: string) =>
    request<VirtueRenderJob>(`/api/renders/${id}/poll`, { method: "POST" }),
  listProviders: () =>
    request<{ name: string; displayName: string; available: boolean }[]>(
      "/api/renders/providers"
    ),

  // Scene Timeline & Composition
  getSceneTimeline: (projectId: string, sceneId: string) =>
    request<SceneTimeline>(`/api/scenes/${projectId}/${sceneId}/timeline`),
  createSceneTimeline: (projectId: string, sceneId: string) =>
    request<SceneTimeline>(`/api/scenes/${projectId}/${sceneId}/timeline`, {
      method: "POST",
    }),
  reorderTimeline: (projectId: string, sceneId: string, order: string[]) =>
    request<SceneTimeline>(
      `/api/scenes/${projectId}/${sceneId}/timeline/reorder`,
      {
        method: "POST",
        body: JSON.stringify({ order }),
      },
    ),
  composeScene: (projectId: string, sceneId: string) =>
    request<SceneRenderJob>(`/api/scenes/${projectId}/${sceneId}/compose`, {
      method: "POST",
    }),
  pollSceneComposition: (jobId: string) =>
    request<SceneRenderJob>(`/api/scenes/compose/${jobId}/poll`, {
      method: "POST",
    }),
  getSceneRenderJob: (jobId: string) =>
    request<SceneRenderJob>(`/api/scenes/compose/${jobId}`),
  listSceneRenderJobs: (projectId: string) =>
    request<SceneRenderJob[]>(`/api/scenes/${projectId}/jobs`),

  // Director
  generatePlan: (text: string, mode: "screenplay" | "concept", projectName?: string) =>
    request<DirectorOutput>("/api/director/plan", {
      method: "POST",
      body: JSON.stringify({ text, mode, projectName }),
    }),
  getPlan: (id: string) =>
    request<DirectorOutput>(`/api/director/plans/${id}`),
  createProjectFromPlan: (planId: string) =>
    request<VirtueProject>(`/api/director/plans/${planId}/create-project`, {
      method: "POST",
    }),
  directorCreateProject: (text: string, mode: "screenplay" | "concept", projectName?: string) =>
    request<{ plan: DirectorOutput; project: VirtueProject }>(
      "/api/director/create-project",
      {
        method: "POST",
        body: JSON.stringify({ text, mode, projectName }),
      },
    ),

  // ─── Continuity ─────────────────────────────────────────

  // Characters
  listCharacters: (projectId: string) =>
    request<VirtueCharacter[]>(`/api/continuity/${projectId}/characters`),
  createCharacter: (projectId: string, data: Omit<VirtueCharacter, "id" | "projectId">) =>
    request<VirtueCharacter>(`/api/continuity/${projectId}/characters`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCharacter: (projectId: string, charId: string, data: Partial<VirtueCharacter>) =>
    request<VirtueCharacter>(`/api/continuity/${projectId}/characters/${charId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCharacter: (projectId: string, charId: string) =>
    request<{ ok: boolean }>(`/api/continuity/${projectId}/characters/${charId}`, {
      method: "DELETE",
    }),

  // Environments
  listEnvironments: (projectId: string) =>
    request<VirtueEnvironment[]>(`/api/continuity/${projectId}/environments`),
  createEnvironment: (projectId: string, data: Omit<VirtueEnvironment, "id" | "projectId">) =>
    request<VirtueEnvironment>(`/api/continuity/${projectId}/environments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateEnvironment: (projectId: string, envId: string, data: Partial<VirtueEnvironment>) =>
    request<VirtueEnvironment>(`/api/continuity/${projectId}/environments/${envId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteEnvironment: (projectId: string, envId: string) =>
    request<{ ok: boolean }>(`/api/continuity/${projectId}/environments/${envId}`, {
      method: "DELETE",
    }),

  // Props
  listProps: (projectId: string) =>
    request<VirtueProp[]>(`/api/continuity/${projectId}/props`),
  createProp: (projectId: string, data: Omit<VirtueProp, "id" | "projectId">) =>
    request<VirtueProp>(`/api/continuity/${projectId}/props`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProp: (projectId: string, propId: string, data: Partial<VirtueProp>) =>
    request<VirtueProp>(`/api/continuity/${projectId}/props/${propId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProp: (projectId: string, propId: string) =>
    request<{ ok: boolean }>(`/api/continuity/${projectId}/props/${propId}`, {
      method: "DELETE",
    }),

  // Scene Context
  getSceneContext: (projectId: string, sceneId: string) =>
    request<ResolvedContext>(`/api/continuity/${projectId}/scenes/${sceneId}/context`),
  updateSceneContext: (projectId: string, sceneId: string, context: SceneContext) =>
    request<ResolvedContext>(`/api/continuity/${projectId}/scenes/${sceneId}/context`, {
      method: "PUT",
      body: JSON.stringify(context),
    }),

  // Prompt enrichment preview
  getEnrichedPrompt: (projectId: string, sceneId: string, shotId: string) =>
    request<EnrichmentResult>(
      `/api/continuity/${projectId}/scenes/${sceneId}/shots/${shotId}/enriched-prompt`,
    ),

  // ─── Editor ──────────────────────────────────────────────

  getEditorTimeline: (projectId: string, sceneId: string) =>
    request<VirtueEditorTimeline>(`/api/editor/scenes/${projectId}/${sceneId}`),
  createEditorTimeline: (projectId: string, sceneId: string) =>
    request<VirtueEditorTimeline>(`/api/editor/scenes/${projectId}/${sceneId}`, {
      method: "POST",
    }),
  saveEditorTimeline: (projectId: string, sceneId: string, timeline: Partial<VirtueEditorTimeline>) =>
    request<VirtueEditorTimeline>(`/api/editor/scenes/${projectId}/${sceneId}`, {
      method: "PUT",
      body: JSON.stringify(timeline),
    }),
  addEditorTransition: (projectId: string, sceneId: string, shotId: string, transition: VirtueTransition) =>
    request<VirtueEditorTimeline>(`/api/editor/scenes/${projectId}/${sceneId}/transition`, {
      method: "POST",
      body: JSON.stringify({ shotId, transition }),
    }),
  removeEditorTransition: (projectId: string, sceneId: string, shotId: string) =>
    request<VirtueEditorTimeline>(`/api/editor/scenes/${projectId}/${sceneId}/transition/${shotId}`, {
      method: "DELETE",
    }),
  addAudioTrack: (
    projectId: string,
    sceneId: string,
    data: {
      type: "music" | "voiceover" | "sfx";
      assetId: string;
      startTime: number;
      endTime?: number;
      label?: string;
      volume?: number;
    },
  ) =>
    request<VirtueEditorTimeline>(`/api/editor/scenes/${projectId}/${sceneId}/audio`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeAudioTrack: (projectId: string, sceneId: string, trackId: string) =>
    request<VirtueEditorTimeline>(`/api/editor/scenes/${projectId}/${sceneId}/audio/${trackId}`, {
      method: "DELETE",
    }),
  updateAudioTrack: (projectId: string, sceneId: string, trackId: string, updates: Record<string, unknown>) =>
    request<VirtueEditorTimeline>(`/api/editor/scenes/${projectId}/${sceneId}/audio/${trackId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  applyPacingPreset: (projectId: string, sceneId: string, preset: string) =>
    request<VirtueEditorTimeline>(`/api/editor/scenes/${projectId}/${sceneId}/pacing`, {
      method: "POST",
      body: JSON.stringify({ preset }),
    }),
  reorderEditorShots: (projectId: string, sceneId: string, order: string[]) =>
    request<VirtueEditorTimeline>(`/api/editor/scenes/${projectId}/${sceneId}/reorder`, {
      method: "POST",
      body: JSON.stringify({ order }),
    }),
  trimEditorShot: (projectId: string, sceneId: string, shotId: string, trimStart: number, trimEnd: number) =>
    request<VirtueEditorTimeline>(`/api/editor/scenes/${projectId}/${sceneId}/trim`, {
      method: "POST",
      body: JSON.stringify({ shotId, trimStart, trimEnd }),
    }),

  // Export
  exportScene: (projectId: string, sceneId: string) =>
    request<VirtueExportJob>(`/api/editor/scenes/${projectId}/${sceneId}/export`, {
      method: "POST",
    }),
  listExports: (projectId?: string) =>
    request<VirtueExportJob[]>(`/api/editor/exports${projectId ? `?projectId=${projectId}` : ""}`),
  getExport: (id: string) =>
    request<VirtueExportJob>(`/api/editor/exports/${id}`),
  pollExport: (id: string) =>
    request<VirtueExportJob>(`/api/editor/exports/${id}/poll`, { method: "POST" }),

  // ─── Routing ──────────────────────────────────────────────

  recommendProvider: (data: {
    projectId?: string;
    sceneId?: string;
    shotId?: string;
    policy?: string;
    shot?: { shotType: string; description: string; prompt?: string; durationSec?: number; cameraMove?: string; characterIds?: string[] };
  }) =>
    request<VirtueRoutingDecision>("/api/routing/recommend", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getProviderCapabilities: () =>
    request<(VirtueProviderCapabilities & { registered: boolean; available: boolean })[]>(
      "/api/routing/providers/capabilities",
    ),
  getRoutingPolicies: () =>
    request<Record<string, VirtueRoutingPolicy>>("/api/routing/policies"),
  getRenderRouting: (renderJobId: string) =>
    request<VirtueRoutingDecision>(`/api/routing/renders/${renderJobId}`),

  // ─── Review & Collaboration ────────────────────────────

  // Comments
  listComments: (targetType: string, targetId: string) =>
    request<VirtueComment[]>(`/api/review/comments/${targetType}/${targetId}`),
  addComment: (data: { targetType: string; targetId: string; body: string; authorName?: string; parentCommentId?: string }) =>
    request<VirtueComment>("/api/review/comments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resolveComment: (commentId: string) =>
    request<VirtueComment>(`/api/review/comments/${commentId}/resolve`, { method: "POST" }),
  reopenComment: (commentId: string) =>
    request<VirtueComment>(`/api/review/comments/${commentId}/reopen`, { method: "POST" }),

  // Approvals
  getApproval: (targetType: string, targetId: string) =>
    request<VirtueApproval>(`/api/review/approvals/${targetType}/${targetId}`),
  setApproval: (data: { targetType: string; targetId: string; state: string; reviewerName?: string; notes?: string }) =>
    request<VirtueApproval>("/api/review/approvals", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Alternate Takes
  listTakes: (shotId: string) =>
    request<VirtueAlternateTake[]>(`/api/review/shots/${shotId}/takes`),
  createTake: (shotId: string, data: { renderJobId: string; provider: string; promptVersion: string; label?: string }) =>
    request<VirtueAlternateTake>(`/api/review/shots/${shotId}/takes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  selectTake: (shotId: string, takeId: string) =>
    request<VirtueAlternateTake>(`/api/review/shots/${shotId}/takes/${takeId}/select`, { method: "POST" }),
  favoriteTake: (shotId: string, takeId: string) =>
    request<VirtueAlternateTake>(`/api/review/shots/${shotId}/takes/${takeId}/favorite`, { method: "POST" }),
  archiveTake: (shotId: string, takeId: string) =>
    request<VirtueAlternateTake>(`/api/review/shots/${shotId}/takes/${takeId}/archive`, { method: "POST" }),

  // Version History
  listVersions: (targetType: string, targetId: string) =>
    request<VirtueVersionSnapshot[]>(`/api/review/versions/${targetType}/${targetId}`),
  createVersionSnapshot: (data: { targetType: string; targetId: string; summary: string; metadata?: Record<string, unknown> }) =>
    request<VirtueVersionSnapshot>("/api/review/versions/snapshot", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Compare
  createCompareSession: (data: { renderIds: string[]; notes?: string }) =>
    request<VirtueCompareSession>("/api/review/compare", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getCompareSession: (id: string) =>
    request<VirtueCompareSession>(`/api/review/compare/${id}`),
  selectCompareWinner: (id: string, winnerId: string) =>
    request<VirtueCompareSession>(`/api/review/compare/${id}/winner`, {
      method: "POST",
      body: JSON.stringify({ winnerId }),
    }),

  // Workflow
  getWorkflowStage: (targetType: string, targetId: string) =>
    request<VirtueWorkflowStatus>(`/api/review/workflow/${targetType}/${targetId}`),
  setWorkflowStage: (data: { targetType: string; targetId: string; stage: string }) =>
    request<VirtueWorkflowStatus>("/api/review/workflow/stage", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  advanceWorkflow: (data: { targetType: string; targetId: string }) =>
    request<VirtueWorkflowStatus>("/api/review/workflow/advance", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ─── Autonomous Engine ─────────────────────────────────

  analyzeScene: (projectId: string, sceneId: string) =>
    request<VirtueSceneAnalysis>("/api/autonomous/analyze-scene", {
      method: "POST",
      body: JSON.stringify({ projectId, sceneId }),
    }),
  suggestShots: (projectId: string, sceneId: string) =>
    request<VirtueShotSuggestion[]>("/api/autonomous/suggest-shots", {
      method: "POST",
      body: JSON.stringify({ projectId, sceneId }),
    }),
  improvePrompt: (projectId: string, sceneId: string, shotId: string) =>
    request<VirtuePromptImprovement>("/api/autonomous/improve-prompt", {
      method: "POST",
      body: JSON.stringify({ projectId, sceneId, shotId }),
    }),
  retryRender: (projectId: string, sceneId: string, shotId: string, renderId?: string) =>
    request<{ improvedPrompt: VirtuePromptImprovement; suggestedProvider?: string; suggestedDuration?: number }>(
      "/api/autonomous/retry-render",
      { method: "POST", body: JSON.stringify({ projectId, sceneId, shotId, renderId }) },
    ),
  optimizePacing: (projectId: string, sceneId: string) =>
    request<{ sceneId: string; currentAvgDuration: number; targetAvgDuration: number; overallPacingScore: number; adjustments: { shotId: string; currentDuration: number; suggestedDuration: number; reason: string }[]; reorderSuggestion: string | null }>(
      "/api/autonomous/optimize-pacing",
      { method: "POST", body: JSON.stringify({ projectId, sceneId }) },
    ),
  extractHighlights: (projectId: string, sceneId: string) =>
    request<VirtueHighlight[]>("/api/autonomous/extract-highlights", {
      method: "POST",
      body: JSON.stringify({ projectId, sceneId }),
    }),
  generateTrailer: (projectId: string, title?: string) =>
    request<VirtueTrailerPlan>("/api/autonomous/generate-trailer", {
      method: "POST",
      body: JSON.stringify({ projectId, title }),
    }),

  // ─── Simulation Engine ─────────────────────────────────

  getWorldState: (projectId: string) =>
    request<VirtueWorldState>(`/api/simulation/world/${projectId}`),
  initializeWorld: (projectId: string) =>
    request<VirtueWorldState>(`/api/simulation/world/${projectId}/initialize`, { method: "POST" }),
  updateWorldState: (projectId: string, data: {
    characters?: { characterId: string; [key: string]: unknown }[];
    environments?: { environmentId: string; [key: string]: unknown }[];
    props?: { propId: string; [key: string]: unknown }[];
    conditions?: string[];
  }) =>
    request<VirtueWorldState>(`/api/simulation/world/${projectId}/update`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  simulateScene: (projectId: string, sceneId: string) =>
    request<VirtueWorldState>("/api/simulation/simulate/scene", {
      method: "POST",
      body: JSON.stringify({ projectId, sceneId }),
    }),
  getSimulationContext: (projectId: string, sceneId: string) =>
    request<VirtueSimulationContext & { promptFragment: string }>(
      `/api/simulation/context/${projectId}/${sceneId}`,
    ),
  addStoryEvent: (projectId: string, data: { sceneId?: string; description: string; affectedCharacters?: string[]; affectedEnvironments?: string[]; affectedProps?: string[] }) =>
    request<VirtueWorldState>(`/api/simulation/world/${projectId}/event`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
