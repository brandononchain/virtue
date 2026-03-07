import type { ProviderName, RenderStatus } from "@virtue/types";

export interface GenerationRequest {
  jobId: string;
  prompt: string;
  durationSec: number;
  resolution: string;
  skills: string[];
  metadata: Record<string, unknown>;
}

export interface GenerationResult {
  jobId: string;
  status: RenderStatus;
  progress: number;
  outputUrl?: string;
  error?: string;
}

/**
 * Interface that all video generation providers must implement.
 */
export interface VideoProvider {
  name: ProviderName;
  displayName: string;

  /** Check if this provider is configured and available. */
  isAvailable(): Promise<boolean>;

  /** Submit a generation job. Returns immediately with initial status. */
  submit(request: GenerationRequest): Promise<GenerationResult>;

  /** Poll for job status. */
  poll(jobId: string): Promise<GenerationResult>;

  /** Cancel a running job. */
  cancel(jobId: string): Promise<void>;
}
