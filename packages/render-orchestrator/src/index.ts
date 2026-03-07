import type { VirtueRenderJob, VirtueShot, ProviderName } from "@virtue/types";
import type { VideoProvider } from "@virtue/provider-sdk";
import { ProviderRegistry } from "@virtue/provider-sdk";
import { createId, nowISO } from "@virtue/validation";

export type JobUpdateCallback = (job: VirtueRenderJob) => void;

export class RenderOrchestrator {
  private jobs = new Map<string, VirtueRenderJob>();
  private pollingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private onUpdate: JobUpdateCallback | undefined;

  constructor(
    private registry: ProviderRegistry,
    private defaultProvider: ProviderName = "mock",
  ) {}

  setUpdateCallback(cb: JobUpdateCallback): void {
    this.onUpdate = cb;
  }

  private getProvider(name: ProviderName): VideoProvider {
    const provider = this.registry.get(name);
    if (!provider) throw new Error(`Provider "${name}" not registered`);
    return provider;
  }

  async submitJob(
    projectId: string,
    shot: VirtueShot,
    providerName?: ProviderName,
    prompt?: string,
  ): Promise<VirtueRenderJob> {
    const pName = providerName || this.defaultProvider;
    const provider = this.getProvider(pName);
    const now = nowISO();
    const job: VirtueRenderJob = {
      id: createId(),
      projectId,
      shotId: shot.id,
      provider: pName,
      status: "queued",
      progress: 0,
      prompt: prompt || shot.prompt || shot.description,
      skills: shot.skills,
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(job.id, job);

    const result = await provider.submit({
      jobId: job.id,
      prompt: job.prompt,
      durationSec: shot.durationSec,
      resolution: "1080p",
      skills: shot.skills,
      metadata: { shotType: shot.shotType, lens: shot.lens },
    });

    const updated: VirtueRenderJob = {
      ...job,
      status: result.status,
      progress: result.progress,
      error: result.error,
      updatedAt: nowISO(),
    };
    this.jobs.set(job.id, updated);
    this.notify(updated);

    if (!this.isTerminal(updated.status)) {
      this.startPolling(job.id, pName);
    }

    return updated;
  }

  async pollJob(jobId: string): Promise<VirtueRenderJob | undefined> {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    const provider = this.getProvider(job.provider);
    const result = await provider.poll(jobId);
    const updated: VirtueRenderJob = {
      ...job,
      status: result.status,
      progress: result.progress,
      error: result.error,
      output: result.outputUrl
        ? {
            id: job.output?.id || createId(),
            projectId: job.projectId,
            type: "video",
            url: result.outputUrl,
            filename: `${job.shotId}.mp4`,
            metadata: {},
            createdAt: job.output?.createdAt || nowISO(),
          }
        : job.output,
      updatedAt: nowISO(),
    };
    this.jobs.set(jobId, updated);
    this.notify(updated);

    if (this.isTerminal(updated.status)) {
      this.stopPolling(jobId);
    }

    return updated;
  }

  getJobs(): VirtueRenderJob[] {
    return Array.from(this.jobs.values());
  }

  getJob(jobId: string): VirtueRenderJob | undefined {
    return this.jobs.get(jobId);
  }

  importJob(job: VirtueRenderJob): void {
    this.jobs.set(job.id, job);
  }

  private startPolling(jobId: string, providerName: ProviderName): void {
    if (this.pollingTimers.has(jobId)) return;
    const interval = providerName === "mock" ? 2000 : 10000;
    const tick = async () => {
      try {
        const updated = await this.pollJob(jobId);
        if (updated && !this.isTerminal(updated.status)) {
          this.pollingTimers.set(jobId, setTimeout(tick, interval));
        }
      } catch {
        this.pollingTimers.set(jobId, setTimeout(tick, interval * 3));
      }
    };
    this.pollingTimers.set(jobId, setTimeout(tick, interval));
  }

  private stopPolling(jobId: string): void {
    const timer = this.pollingTimers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.pollingTimers.delete(jobId);
    }
  }

  private isTerminal(status: string): boolean {
    return status === "completed" || status === "failed";
  }

  private notify(job: VirtueRenderJob): void {
    this.onUpdate?.(job);
  }
}
