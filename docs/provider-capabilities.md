# Provider Capabilities

The `@virtue/provider-sdk` package maintains a capability registry that describes what each video generation provider can do. This is the source of truth used by the routing engine for provider selection.

## Capability Schema

Each provider declares capabilities across these dimensions:

### Tier Ratings
| Field | Values | Description |
|---|---|---|
| `qualityTier` | low / medium / high / premium | Overall output quality |
| `speedTier` | slow / medium / fast | Generation turnaround |
| `costTier` | free / low / medium / high | Per-generation cost |

### Feature Flags
| Flag | Description |
|---|---|
| `supportsPhotorealism` | Can produce photorealistic output |
| `supportsStylization` | Can produce stylized/artistic output |
| `supportsCharacterConsistency` | Maintains character appearance across shots |
| `supportsCameraControl` | Offers explicit camera movement control |
| `supportsImageConditioning` | Accepts reference images (img2vid) |
| `supportsAudio` | Generates synchronized audio |
| `supportsLipSync` | Character lip-sync capability |

### Numeric Limits
| Field | Description |
|---|---|
| `maxDurationSec` | Maximum output video length |
| `maxResolution` | Maximum output resolution (e.g., "1080p") |
| `motionQuality` | Motion smoothness rating (0–1) |

## Current Providers

### Mock Provider
- **Quality:** Low | **Speed:** Fast | **Cost:** Free
- Development/testing provider. No real generation.
- Max duration: 10s, 720p

### Luma (Dream Machine)
- **Quality:** High | **Speed:** Medium | **Cost:** Medium
- Strong character consistency, photorealism, image conditioning
- Camera control, good motion quality (0.8)
- Max duration: 10s, 1080p

### OpenAI (Sora)
- **Quality:** Premium | **Speed:** Slow | **Cost:** High
- Best photorealism and stylization
- Character consistency, lip sync, audio
- Highest motion quality (0.95)
- Max duration: 20s, 4K

### Google (Veo)
- **Quality:** High | **Speed:** Fast | **Cost:** Medium
- Fast turnaround with good quality
- Camera control, image conditioning
- Good motion quality (0.85)
- Max duration: 8s, 1080p

## API

```typescript
import {
  getProviderCapabilities,
  getAllProviderCapabilities,
  hasProviderCapabilities,
} from "@virtue/provider-sdk";

// Get one provider
const luma = getProviderCapabilities("luma");

// Get all providers
const all = getAllProviderCapabilities();

// Check if known
const exists = hasProviderCapabilities("openai"); // true
```

## Adding a New Provider

1. Add the provider name to `ProviderName` in `@virtue/types`
2. Add capability entry in `packages/provider-sdk/src/capabilities.ts`
3. Implement the `VideoProvider` interface in a provider adapter
4. Register with `ProviderRegistry` at startup

The routing engine will automatically include new providers in scoring once their capabilities are registered.
