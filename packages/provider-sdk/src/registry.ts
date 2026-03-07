import type { ProviderName } from "@virtue/types";
import type { VideoProvider } from "./provider.js";

export class ProviderRegistry {
  private providers = new Map<string, VideoProvider>();

  register(provider: VideoProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: ProviderName): VideoProvider | undefined {
    return this.providers.get(name);
  }

  list(): VideoProvider[] {
    return Array.from(this.providers.values());
  }

  has(name: string): boolean {
    return this.providers.has(name);
  }
}
