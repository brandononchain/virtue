import type { VideoProvider, GenerationRequest, GenerationResult } from "@virtue/provider-sdk";

/**
 * Google Veo provider adapter. Stub for future integration.
 */
export class GoogleProvider implements VideoProvider {
  name = "google" as const;
  displayName = "Google Veo";

  constructor(private apiKey: string) {}

  async isAvailable(): Promise<boolean> {
    return this.apiKey.length > 0;
  }

  async submit(_request: GenerationRequest): Promise<GenerationResult> {
    throw new Error("Google provider not yet implemented");
  }

  async poll(_jobId: string): Promise<GenerationResult> {
    throw new Error("Google provider not yet implemented");
  }

  async cancel(_jobId: string): Promise<void> {
    throw new Error("Google provider not yet implemented");
  }
}
