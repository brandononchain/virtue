import type { VirtueProject, VirtueRenderJob, VirtueSkill } from "@virtue/types";

/**
 * In-memory store for v0.1 development.
 * Replace with database-backed persistence later.
 */
class Store {
  projects = new Map<string, VirtueProject>();
  renderJobs = new Map<string, VirtueRenderJob>();
  skills: VirtueSkill[] = [];

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
}

export const store = new Store();
