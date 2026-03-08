# Auto-Routing

Virtue's auto-routing system selects the best video generation provider for each shot without manual intervention. This document covers the REST API and Studio UI integration.

## Routing Modes

| Mode | Behavior |
|---|---|
| `balanced` | Equal weight to quality, speed, and cost |
| `auto_quality` | Prioritizes output quality above all else |
| `auto_speed` | Prioritizes fast turnaround |
| `auto_cost` | Prioritizes lowest cost |
| `manual` | User selects provider directly (no routing) |

## REST API

### Recommend Provider
```
POST /api/routing/recommend
```

**Body (by shot ID):**
```json
{
  "projectId": "proj_123",
  "sceneId": "scene_456",
  "shotId": "shot_789",
  "policy": "balanced"
}
```

**Body (inline shot):**
```json
{
  "shot": {
    "shotType": "close-up",
    "description": "Character dialogue scene",
    "durationSec": 6,
    "cameraMove": "slow_push",
    "characterIds": ["elena", "marcus"]
  },
  "policy": "auto_quality"
}
```

**Response:**
```json
{
  "selectedProvider": "luma",
  "policy": "balanced",
  "rationale": "Selected Luma for this dialogue close-up, character-heavy shot due to strong character consistency, photorealism scores — scored 12pts above Google Veo.",
  "scores": [
    {
      "provider": "luma",
      "displayName": "Luma",
      "totalScore": 0.72,
      "available": true,
      "breakdown": { ... }
    }
  ],
  "requirements": { ... },
  "manualOverride": false,
  "createdAt": "2026-03-08T..."
}
```

### Provider Capabilities
```
GET /api/routing/providers/capabilities
```
Returns all providers with their capabilities and live availability status.

```
GET /api/routing/providers/capabilities/:provider
```
Returns capabilities for a single provider.

### Routing Policies
```
GET /api/routing/policies
```
Returns all available routing policy definitions with their weight distributions.

### Render Routing Decision
```
GET /api/routing/renders/:id
```
Returns the routing decision that was used for a specific render job. If the job was submitted manually, returns a stub decision with `manualOverride: true`.

## Render Pipeline Integration

When submitting a render via `POST /api/renders`, include a `routingMode` field:

```json
{
  "projectId": "proj_123",
  "sceneId": "scene_456",
  "shotId": "shot_789",
  "routingMode": "balanced"
}
```

The render pipeline will:
1. Analyze the shot requirements
2. Score available providers
3. Select the best provider
4. Attach the routing decision as metadata on the render job
5. Submit to the selected provider

Omitting `routingMode` or setting it to `"manual"` requires a `provider` field for direct provider selection.

## Studio UI

The project detail page includes routing controls:

- **Mode selector:** Toggle between Balanced, Quality, Speed, Cost, and Manual
- **Recommendation display:** Shows the recommended provider with rationale when a shot is selected in auto modes
- **Score list:** Shows all scored providers ranked by score
- **Manual override:** Clicking an alternative provider switches to manual mode
- **Submit integration:** Render submission uses the routed provider in auto modes

## Test Cases

Example routing scenarios are available in `examples/routing-cases/`:

- `dialogue-closeup.json` — Character consistency priority
- `action-chase.json` — Motion quality and dynamic camera
- `surreal-dream.json` — Stylization priority
- `wide-establishing.json` — Environment and cinematic scale
- `product-commercial.json` — Speed-optimized iteration
- `image-conditioned-character.json` — Reference image matching
