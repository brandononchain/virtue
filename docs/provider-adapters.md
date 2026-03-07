# Provider Adapters

## Overview

Virtue abstracts video generation behind the `VideoProvider` interface. This allows the platform to support multiple AI video models while keeping the orchestration layer clean.

## Interface

```typescript
interface VideoProvider {
  name: ProviderName;
  displayName: string;

  isAvailable(): Promise<boolean>;
  submit(request: GenerationRequest): Promise<GenerationResult>;
  poll(jobId: string): Promise<GenerationResult>;
  cancel(jobId: string): Promise<void>;
}
```

## Available Providers

### Mock (Active)
Simulates the full generation pipeline with staged progress:
1. `queued` (0%)
2. `preparing` (15%)
3. `generating` (40% → 65%)
4. `post-processing` (85%)
5. `completed` (100%)

Each call to `poll()` advances the job by one stage.

### Luma Dream Machine (Stub)
Adapter for Luma's video generation API. Requires `LUMA_API_KEY`.

### OpenAI Sora (Stub)
Adapter for OpenAI's video generation. Requires `OPENAI_API_KEY`.

### Google Veo (Stub)
Adapter for Google's video generation. Requires `GOOGLE_AI_API_KEY`.

## Adding a Provider

1. Create a new package in `providers/`
2. Implement the `VideoProvider` interface from `@virtue/provider-sdk`
3. Register it in the API's orchestrator service:

```typescript
import { YourProvider } from "@virtue/provider-your";
registry.register(new YourProvider(apiKey));
```

## Registry

The `ProviderRegistry` class manages provider instances:

```typescript
const registry = new ProviderRegistry();
registry.register(mockProvider);
registry.register(lumaProvider);

const provider = registry.get("luma");
```
