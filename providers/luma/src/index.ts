import type { VideoProvider, GenerationRequest, GenerationResult } from "@virtue/provider-sdk";
import type { RenderStatus } from "@virtue/types";

interface LumaGeneration {
  id: string;
  state: "queued" | "dreaming" | "completed" | "failed";
  failure_reason: string | null;
  video: { url: string; download_url: string } | null;
  thumbnail: { url: string } | null;
  created_at: string;
}

function mapLumaState(state: LumaGeneration["state"]): RenderStatus {
  switch (state) {
    case "queued": return "queued";
    case "dreaming": return "generating";
    case "completed": return "completed";
    case "failed": return "failed";
  }
}

function mapLumaProgress(state: LumaGeneration["state"]): number {
  switch (state) {
    case "queued": return 5;
    case "dreaming": return 50;
    case "completed": return 100;
    case "failed": return 0;
  }
}

/**
 * Luma Dream Machine provider.
 * Uses the Luma AI generations API to create videos from text prompts.
 */
export class LumaProvider implements VideoProvider {
  name = "luma" as const;
  displayName = "Luma Dream Machine";

  private baseUrl = "https://api.lumalabs.ai/dream-machine/v1";
  private apiKey: string;
  private jobMap = new Map<string, string>();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const res = await fetch(`${this.baseUrl}/generations?limit=1`, {
        headers: this.headers(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async submit(request: GenerationRequest): Promise<GenerationResult> {
    const body: Record<string, unknown> = {
      prompt: request.prompt,
    };

    if (request.resolution === "720p" || request.resolution === "1080p") {
      body.aspect_ratio = "16:9";
    }

    const res = await fetch(`${this.baseUrl}/generations`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return {
        jobId: request.jobId,
        status: "failed",
        progress: 0,
        error: `Luma API error ${res.status}: ${errBody}`,
      };
    }

    const gen: LumaGeneration = await res.json();
    this.jobMap.set(request.jobId, gen.id);

    return {
      jobId: request.jobId,
      status: mapLumaState(gen.state),
      progress: mapLumaProgress(gen.state),
    };
  }

  async poll(jobId: string): Promise<GenerationResult> {
    const lumaId = this.jobMap.get(jobId);
    if (!lumaId) {
      return { jobId, status: "failed", progress: 0, error: "No Luma generation ID mapped for this job" };
    }

    const res = await fetch(`${this.baseUrl}/generations/${lumaId}`, {
      headers: this.headers(),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return {
        jobId,
        status: "failed",
        progress: 0,
        error: `Luma poll error ${res.status}: ${errBody}`,
      };
    }

    const gen: LumaGeneration = await res.json();

    return {
      jobId,
      status: mapLumaState(gen.state),
      progress: mapLumaProgress(gen.state),
      outputUrl: gen.video?.download_url || gen.video?.url || undefined,
      error: gen.failure_reason || undefined,
    };
  }

  async cancel(jobId: string): Promise<void> {
    const lumaId = this.jobMap.get(jobId);
    if (!lumaId) return;

    await fetch(`${this.baseUrl}/generations/${lumaId}`, {
      method: "DELETE",
      headers: this.headers(),
    }).catch(() => {});

    this.jobMap.delete(jobId);
  }

  private headers(): Record<string, string> {
    return {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
  }
}
