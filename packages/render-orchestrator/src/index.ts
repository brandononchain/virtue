import type { VirtueRenderJob, VirtueShot, ProviderName } from "@virtue/types";
import type { VideoProvider } from "@virtue/provider-sdk";
import { createId, nowISO } from "@virtue/validation";

export class RenderOrchestrator {
  private jobs = new Map<string, VirtueRenderJob>();

  constructor(private provider: VideoProvider) {}

  /**
   * Submit a render job for a given shot.
   */
  async submitJob(
    projectId: string,
    shot: VirtueShot
  ): Promise<VirtueRenderJob> {
    const now = nowISO();
    const job: VirtueRenderJob = {
      id: createId(),
      projectId,
      shotId: shot.id,
      provider: this.provider.name,
      status: "queued",
      progress: 0,
      prompt: shot.prompt || shot.description,
      skills: shot.skills,
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(job.id, job);

    const result = await this.provider.submit({
      jobId: job.id,
      prompt: job.prompt,
      durationSec: shot.durationSec,
      resolution: "1080p",
      skills: shot.skills,
      metadata: { shotType: shot.shotType, lens: shot.lens },
    });

    const updated = {
      ...job,
      status: result.status,
      progress: result.progress,
      updatedAt: nowISO(),
    };
    this.jobs.set(job.id, updated);
    return updated;
  }

  /**
   * Poll job status from the provider.
   */
  async pollJob(jobId: string): Promise<VirtueRenderJob | undefined> {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    const result = await this.provider.poll(jobId);
    const updated: VirtueRenderJob = {
      ...job,
      status: result.status,
      progress: result.progress,
      error: result.error,
      output: result.outputUrl
        ? {
            id: createId(),
            projectId: job.projectId,
            type: "video",
            url: result.outputUrl,
            filename: `${job.shotId}.mp4`,
            metadata: {},
            createdAt: nowISO(),
          }
        : undefined,
      updatedAt: nowISO(),
    };
    this.jobs.set(jobId, updated);
    return updated;
  }

  /**
   * Get all jobs.
   */
  getJobs(): VirtueRenderJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get a specific job.
   */
  getJob(jobId: string): VirtueRenderJob | undefined {
    return this.jobs.get(jobId);
  }
}
