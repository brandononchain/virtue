import type {
  VirtueProject,
  VirtueRenderJob,
  VirtueSkill,
  SceneTimeline,
  SceneRenderJob,
  VirtueEditorTimeline,
  VirtueExportJob,
} from "@virtue/types";

/**
 * In-memory store for v0.1 development.
 * Replace with database-backed persistence later.
 */
class Store {
  projects = new Map<string, VirtueProject>();
  renderJobs = new Map<string, VirtueRenderJob>();
  skills: VirtueSkill[] = [];
  sceneTimelines = new Map<string, SceneTimeline>();
  sceneRenderJobs = new Map<string, SceneRenderJob>();
  editorTimelines = new Map<string, VirtueEditorTimeline>();
  exportJobs = new Map<string, VirtueExportJob>();

  getProject(id: string) {
    return this.projects.get(id);
  }

  listProjects() {
    return Array.from(this.projects.values());
  }

  saveProject(project: VirtueProject) {
    this.projects.set(project.id, project);
  }

  deleteProject(id: string) {
    this.projects.delete(id);
  }

  saveRenderJob(job: VirtueRenderJob) {
    this.renderJobs.set(job.id, job);
  }

  getRenderJob(id: string) {
    return this.renderJobs.get(id);
  }

  listRenderJobs(projectId?: string) {
    const jobs = Array.from(this.renderJobs.values());
    if (projectId) return jobs.filter((j) => j.projectId === projectId);
    return jobs;
  }

  // Scene timelines
  saveSceneTimeline(timeline: SceneTimeline) {
    this.sceneTimelines.set(timeline.id, timeline);
  }

  getSceneTimeline(id: string) {
    return this.sceneTimelines.get(id);
  }

  getSceneTimelineBySceneId(sceneId: string) {
    const matches = Array.from(this.sceneTimelines.values())
      .filter((t) => t.sceneId === sceneId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return matches[0];
  }

  listSceneTimelines(projectId?: string) {
    const timelines = Array.from(this.sceneTimelines.values());
    if (projectId) return timelines.filter((t) => t.projectId === projectId);
    return timelines;
  }

  // Scene render jobs
  saveSceneRenderJob(job: SceneRenderJob) {
    this.sceneRenderJobs.set(job.id, job);
  }

  getSceneRenderJob(id: string) {
    return this.sceneRenderJobs.get(id);
  }

  listSceneRenderJobs(projectId?: string) {
    const jobs = Array.from(this.sceneRenderJobs.values());
    if (projectId) return jobs.filter((j) => j.projectId === projectId);
    return jobs;
  }

  // Editor timelines
  saveEditorTimeline(timeline: VirtueEditorTimeline) {
    this.editorTimelines.set(timeline.id, timeline);
  }

  getEditorTimeline(id: string) {
    return this.editorTimelines.get(id);
  }

  getEditorTimelineBySceneId(sceneId: string) {
    const matches = Array.from(this.editorTimelines.values())
      .filter((t) => t.sceneId === sceneId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return matches[0];
  }

  // Export jobs
  saveExportJob(job: VirtueExportJob) {
    this.exportJobs.set(job.id, job);
  }

  getExportJob(id: string) {
    return this.exportJobs.get(id);
  }

  listExportJobs(projectId?: string) {
    const jobs = Array.from(this.exportJobs.values());
    if (projectId) return jobs.filter((j) => j.projectId === projectId);
    return jobs;
  }
}

export const store = new Store();
