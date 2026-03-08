import type { VirtueProviderCapabilities, ProviderName } from "@virtue/types";

/**
 * Provider capability definitions — the source of truth for routing decisions.
 * Capabilities are modeled even for providers that aren't fully implemented yet.
 */
const PROVIDER_CAPABILITIES: Record<string, VirtueProviderCapabilities> = {
  mock: {
    provider: "mock",
    displayName: "Mock",
    supportsTextToVideo: true,
    supportsImageToVideo: false,
    supportsReferenceImages: false,
    supportsLongDuration: true,
    supportsHighMotion: true,
    supportsCharacterConsistency: false,
    supportsStylizedOutput: true,
    supportsPhotorealism: false,
    supportsFastTurnaround: true,
    supportsFineCameraControl: false,
    maxDurationSeconds: 30,
    qualityTier: "low",
    speedTier: "fast",
    costTier: "free",
  },
  luma: {
    provider: "luma",
    displayName: "Luma Dream Machine",
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportsReferenceImages: true,
    supportsLongDuration: false,
    supportsHighMotion: true,
    supportsCharacterConsistency: true,
    supportsStylizedOutput: true,
    supportsPhotorealism: true,
    supportsFastTurnaround: false,
    supportsFineCameraControl: true,
    maxDurationSeconds: 10,
    qualityTier: "high",
    speedTier: "medium",
    costTier: "medium",
  },
  openai: {
    provider: "openai",
    displayName: "OpenAI Sora",
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportsReferenceImages: true,
    supportsLongDuration: true,
    supportsHighMotion: true,
    supportsCharacterConsistency: true,
    supportsStylizedOutput: true,
    supportsPhotorealism: true,
    supportsFastTurnaround: false,
    supportsFineCameraControl: true,
    maxDurationSeconds: 20,
    qualityTier: "premium",
    speedTier: "slow",
    costTier: "high",
  },
  google: {
    provider: "google",
    displayName: "Google Veo",
    supportsTextToVideo: true,
    supportsImageToVideo: true,
    supportsReferenceImages: false,
    supportsLongDuration: true,
    supportsHighMotion: true,
    supportsCharacterConsistency: false,
    supportsStylizedOutput: false,
    supportsPhotorealism: true,
    supportsFastTurnaround: true,
    supportsFineCameraControl: false,
    maxDurationSeconds: 15,
    qualityTier: "high",
    speedTier: "fast",
    costTier: "medium",
  },
};

/**
 * Get capabilities for a specific provider.
 */
export function getProviderCapabilities(
  provider: ProviderName,
): VirtueProviderCapabilities | undefined {
  return PROVIDER_CAPABILITIES[provider];
}

/**
 * Get capabilities for all known providers.
 */
export function getAllProviderCapabilities(): VirtueProviderCapabilities[] {
  return Object.values(PROVIDER_CAPABILITIES);
}

/**
 * Check if a provider exists in the capability registry.
 */
export function hasProviderCapabilities(provider: string): boolean {
  return provider in PROVIDER_CAPABILITIES;
}
