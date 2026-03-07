import type {
  VirtueProject,
  VirtueSkill,
  VirtueRenderJob,
  SceneTimeline,
  SceneRenderJob,
  DirectorOutput,
} from "@virtue/types";

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
  ) =>
    request<VirtueRenderJob>("/api/renders", {
      method: "POST",
      body: JSON.stringify({ projectId, sceneId, shotId, provider, prompt }),
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
};
