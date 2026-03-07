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

export const api = {
  // Projects
  listProjects: () => request<any[]>("/api/projects"),
  getProject: (id: string) => request<any>(`/api/projects/${id}`),
  createProject: (name: string, description?: string) =>
    request<any>("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }),
  addScene: (projectId: string, data: any) =>
    request<any>(`/api/projects/${projectId}/scenes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addShot: (projectId: string, sceneId: string, data: any) =>
    request<any>(`/api/projects/${projectId}/scenes/${sceneId}/shots`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Skills
  listSkills: () => request<any[]>("/api/skills"),
  getSkill: (slug: string) => request<any>(`/api/skills/${slug}`),
  matchSkills: (query: string) =>
    request<any[]>("/api/skills/match", {
      method: "POST",
      body: JSON.stringify({ query }),
    }),

  // Renders
  listRenders: (projectId?: string) =>
    request<any[]>(`/api/renders${projectId ? `?projectId=${projectId}` : ""}`),
  submitRender: (projectId: string, sceneId: string, shotId: string) =>
    request<any>("/api/renders", {
      method: "POST",
      body: JSON.stringify({ projectId, sceneId, shotId }),
    }),
  pollRender: (id: string) =>
    request<any>(`/api/renders/${id}/poll`, { method: "POST" }),
};
