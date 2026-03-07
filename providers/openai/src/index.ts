import type { VideoProvider, GenerationRequest, GenerationResult } from "@virtue/provider-sdk";

/**
 * OpenAI Sora provider adapter. Stub for future integration.
 */
export class OpenAIProvider implements VideoProvider {
  name = "openai" as const;
  displayName = "OpenAI Sora";

  constructor(private apiKey: string) {}

  async isAvailable(): Promise<boolean> {
    return this.apiKey.length > 0;
  }

  async submit(_request: GenerationRequest): Promise<GenerationResult> {
    throw new Error("OpenAI provider not yet implemented");
  }

  async poll(_jobId: string): Promise<GenerationResult> {
    throw new Error("OpenAI provider not yet implemented");
  }

  async cancel(_jobId: string): Promise<void> {
    throw new Error("OpenAI provider not yet implemented");
  }
}
