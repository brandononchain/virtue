# Routing Engine

The `@virtue/routing-engine` package provides deterministic provider selection for video generation shots. It analyzes shot metadata, scores all available providers, and recommends the best match based on a configurable routing policy.

## Architecture

```
Shot Metadata → analyzeShotRequirements() → VirtueShotRequirements
                                                     ↓
                                          scoreProviderForShot() × N providers
                                                     ↓
                                          buildRoutingDecision()
                                                     ↓
                                          VirtueRoutingDecision
                                          (selected provider + rationale)
```

## Shot Analysis (`analyze.ts`)

`analyzeShotRequirements(shot, sceneContext?)` examines shot metadata and derives 16 normalized requirement dimensions:

| Dimension | Range | Derived From |
|---|---|---|
| `realismLevel` | 0–1 | Keywords: photoreal, cinematic, realistic |
| `stylizationLevel` | 0–1 | Keywords: surreal, abstract, painterly, anime |
| `actionComplexity` | 0–1 | Keywords: chase, explosion, fight + camera move |
| `characterComplexity` | 0–1 | Character count from scene context |
| `environmentComplexity` | 0–1 | Environment presence + keyword analysis |
| `continuityCritical` | bool | Multi-character + reference assets |
| `dialogueCloseup` | bool | Close-up shot type + character present |
| `wideCinematicScene` | bool | Wide/establishing + cinematic keywords |
| `imageConditioningNeeded` | bool | Reference assets in scene context |
| `turnaroundPriority` | 0–1 | Duration-based (shorter = higher priority) |
| `costSensitivity` | 0–1 | Default 0.5 |

## Scoring (`scoring.ts`)

`scoreProviderForShot(capabilities, requirements, policy)` produces a weighted score across three dimensions:

### Quality Score (8 sub-dimensions)
- Photorealism match
- Stylization match
- Character consistency
- Camera control
- Motion quality
- Image conditioning support
- Duration support
- Environment quality

### Speed Score
- Mapped from provider speed tier (fast=1.0, medium=0.6, slow=0.3)

### Cost Score
- Mapped from provider cost tier (free=1.0, low=0.8, medium=0.5, high=0.2)

### Final Score
```
totalScore = (qualityAvg × policy.qualityWeight)
           + (speedScore × policy.speedWeight)
           + (costScore × policy.costWeight)
```

## Recommendation (`recommend.ts`)

`recommendProvider(shot, context?)` is the main entry point:

1. Analyzes shot requirements
2. Scores all known providers
3. Filters to available providers (from the live registry)
4. Selects the highest-scoring available provider
5. Generates a human-readable rationale

The rationale includes:
- Selected provider name
- Shot trait summary (e.g., "wide cinematic, photoreal")
- Top scoring factors
- Policy influence
- Score margin over runner-up

## Policies (`policies.ts`)

Pre-defined weight distributions:

| Policy | Quality | Speed | Cost |
|---|---|---|---|
| `balanced` | 0.5 | 0.25 | 0.25 |
| `auto_quality` | 0.8 | 0.1 | 0.1 |
| `auto_speed` | 0.2 | 0.6 | 0.2 |
| `auto_cost` | 0.2 | 0.2 | 0.6 |

## Usage

```typescript
import { recommendProvider } from "@virtue/routing-engine";

const decision = recommendProvider(shot, {
  policy: ROUTING_POLICIES.balanced,
  availableProviders: ["luma", "google", "openai"],
  sceneContext: { characterCount: 2, hasEnvironment: true },
});

console.log(decision.selectedProvider); // "luma"
console.log(decision.rationale);       // "Selected Luma for this dialogue close-up, ..."
console.log(decision.scores);          // Full scored list
```

## API Endpoints

See [Auto-Routing](./auto-routing.md) for the REST API surface.
