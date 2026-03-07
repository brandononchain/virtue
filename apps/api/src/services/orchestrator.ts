import { RenderOrchestrator } from "@virtue/render-orchestrator";
import { MockProvider } from "@virtue/provider-mock";
import { ProviderRegistry } from "@virtue/provider-sdk";

const mockProvider = new MockProvider();

export const registry = new ProviderRegistry();
registry.register(mockProvider);

export const orchestrator = new RenderOrchestrator(mockProvider);
