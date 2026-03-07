import type { VideoProvider, GenerationRequest, GenerationResult } from "@virtue/provider-sdk";
import type { RenderStatus } from "@virtue/types";

const MOCK_STAGES: { status: RenderStatus; progress: number }[] = [
  { status: "queued", progress: 0 },
  { status: "preparing", progress: 15 },
  { status: "generating", progress: 40 },
  { status: "generating", progress: 65 },
  { status: "post-processing", progress: 85 },
  { status: "completed", progress: 100 },
];

/**
 * Mock video generation provider for development.
 * Simulates a generation pipeline with staged progress.
 */
export class MockProvider implements VideoProvider {
  name = "mock" as const;
  displayName = "Mock Provider";

  private jobs = new Map<string, { stageIndex: number; request: GenerationRequest }>();

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async submit(request: GenerationRequest): Promise<GenerationResult> {
    this.jobs.set(request.jobId, { stageIndex: 0, request });
    return {
      jobId: request.jobId,
      status: "queued",
      progress: 0,
    };
  }

  async poll(jobId: string): Promise<GenerationResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return { jobId, status: "failed", progress: 0, error: "Job not found" };
    }

    // Advance one stage per poll
    if (job.stageIndex < MOCK_STAGES.length - 1) {
      job.stageIndex++;
    }

    const stage = MOCK_STAGES[job.stageIndex];
    return {
      jobId,
      status: stage.status,
      progress: stage.progress,
      outputUrl:
        stage.status === "completed"
          ? `https://mock.virtue.dev/renders/${jobId}.mp4`
          : undefined,
    };
  }

  async cancel(jobId: string): Promise<void> {
    this.jobs.delete(jobId);
  }
}
