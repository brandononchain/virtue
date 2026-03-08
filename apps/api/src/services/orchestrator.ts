import { RenderOrchestrator } from "@virtue/render-orchestrator";
import { MockProvider } from "@virtue/provider-mock";
import { LumaProvider } from "@virtue/provider-luma";
import { ProviderRegistry } from "@virtue/provider-sdk";
import { config } from "@virtue/config";
import { store } from "./store.js";
import type { ProviderName } from "@virtue/types";

export const registry = new ProviderRegistry();

// Always register mock
registry.register(new MockProvider());

// Register Luma if API key is present
const lumaKey = config.providers.luma.apiKey;
if (lumaKey) {
  registry.register(new LumaProvider(lumaKey));
  console.log("  Luma provider: enabled");
} else {
  console.log("  Luma provider: disabled (no LUMA_API_KEY)");
}

const defaultProvider = (lumaKey && config.providers.default === "luma"
  ? "luma"
  : "mock") as ProviderName;

export const orchestrator = new RenderOrchestrator(registry, defaultProvider);

// Sync orchestrator state back to the store on every update
orchestrator.setUpdateCallback((job) => {
  store.saveRenderJob(job);
});
