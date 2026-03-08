# Autonomous Production Engine

The `@virtue/autonomous-engine` package provides AI-assisted production intelligence for Virtue. It analyzes scenes, suggests improvements, and generates highlights and trailers — all deterministically, without requiring external AI services.

## Architecture

```
autonomous-engine/
├── analyze.ts         # Scene composition analysis
├── suggest-shots.ts   # Additional shot recommendations
├── prompt-improve.ts  # Prompt enhancement and retry strategies
├── pacing.ts          # Pacing optimization
├── highlights.ts      # Highlight extraction
├── trailer.ts         # Automatic trailer generation
└── index.ts           # Public API
```

## Modules

### Scene Analysis (`analyzeScene`)

Analyzes a scene's composition across multiple dimensions:

- **Total duration and shot count**
- **Shot type distribution** — counts per shot type
- **Camera variety** — ratio of unique camera moves
- **Visual diversity** — ratio of unique shot types
- **Pacing score** — based on duration distribution
- **Continuity coverage** — character reference consistency

Returns scored metrics plus actionable suggestions like "add establishing shot" or "trim long shots."

### Shot Suggestions (`suggestAdditionalShots`)

Recommends new shots based on gaps in scene composition:

| Gap Detected | Suggested Shot |
|---|---|
| No establishing/wide shot | Opening establishing shot |
| Characters but no close-ups | Reaction close-up |
| 3+ shots, no variety | POV insert/cutaway |
| Ends on close-up | Closing wide pull-back |
| Multi-character, no OTS | Over-shoulder dialogue shot |

Each suggestion includes shot type, prompt, duration, camera move, and rationale.

### Prompt Improvement (`suggestPromptImprovements`)

Enhances generation prompts by adding missing cinematic markers:

- Cinematic quality prefix
- Lens specification
- Lighting direction
- Depth of field for close-ups
- Camera movement descriptors
- Photorealism tags for environment shots

### Render Retry (`suggestRetryStrategies`)

When renders fail, suggests recovery strategies:

- Improved prompt wording
- Provider switching (e.g., OpenAI → Google for faster turnaround)
- Duration reduction for timeout errors
- Prompt simplification for complexity issues

### Pacing Optimization (`optimizeScenePacing`)

Analyzes shot duration patterns and suggests adjustments:

- Trims overly long shots (>8s)
- Extends too-brief shots (<2s)
- Detects monotonous pacing (low variance)
- Suggests building pace (long → short arc)

### Highlight Extraction (`extractHighlights`)

Scores shots using keyword-based analysis across three categories:

- **Action** — explosions, chases, fights
- **Emotional** — tears, embraces, reveals
- **Visual** — aerials, sunsets, silhouettes

Plus shot type and camera movement bonuses. Only shots scoring above 0.3 threshold are returned.

### Trailer Generation (`generateTrailer`)

Assembles a trailer from project highlights:

1. Extracts highlights from all scenes
2. Selects top-scoring clips up to 30s
3. Reorders for cinematic flow: visual openers → character moments → action climax → emotional closer
4. Returns a trailer plan with pacing preset

## API Endpoints

```
POST /api/autonomous/analyze-scene       { projectId, sceneId }
POST /api/autonomous/suggest-shots       { projectId, sceneId }
POST /api/autonomous/improve-prompt      { projectId, sceneId, shotId }
POST /api/autonomous/retry-render        { projectId, sceneId, shotId, renderId? }
POST /api/autonomous/optimize-pacing     { projectId, sceneId }
POST /api/autonomous/extract-highlights  { projectId, sceneId }
POST /api/autonomous/generate-trailer    { projectId, title? }
```

## Constraints

- All analysis is deterministic — no LLM calls required
- User remains in control — suggestions are advisory, not automatic
- Modular architecture — each module operates independently
- No external service dependencies
