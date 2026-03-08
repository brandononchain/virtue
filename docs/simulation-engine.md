# Simulation Engine

The `@virtue/simulation-engine` package provides persistent world state tracking for Virtue projects. Characters, environments, props, and story conditions evolve across scenes, enabling narrative continuity in AI-generated cinematic content.

## Architecture

The engine consists of three modules:

### World Store (`world-store.ts`)
In-memory Map-based storage for world state, keyed by `projectId`.

- `createWorld(projectId)` — Initialize an empty world
- `getWorldState(projectId)` — Retrieve current world state
- `saveWorldState(world)` — Persist updated state
- `updateCharacterState(projectId, characterId, updates)` — Modify a character
- `updateEnvironmentState(projectId, environmentId, updates)` — Modify an environment
- `updatePropState(projectId, propId, updates)` — Modify a prop
- `addStoryEvent(projectId, event)` — Record a narrative event
- `setActiveConditions(projectId, conditions)` — Set active world conditions
- `advanceTimeline(projectId, steps?)` — Move timeline forward

### Simulate (`simulate.ts`)
Deterministic keyword-based scene impact analysis.

- `simulateSceneImpact(project, scene)` — Analyze all shots in a scene, infer state changes from descriptions using keyword maps (injury, emotion, damage, weather, time keywords), and apply them to the world state
- `initializeWorldFromProject(project)` — Bootstrap world state from project continuity data (characters, environments, props)

### Context (`context.ts`)
Prompt enrichment from world state.

- `getSimulationContext(project, scene)` — Gather relevant character, environment, and prop states for the active scene
- `buildSimulationPromptFragment(ctx)` — Generate a `[World State]` text block suitable for prepending to generation prompts

## Data Flow

```
Project Continuity Data
        │
        ▼
  initializeWorldFromProject()
        │
        ▼
   World State (in-memory)
        │
        ├── simulateSceneImpact() ──► Updated World State
        │
        └── getSimulationContext() ──► Prompt Fragment
```

## Keyword Inference

The simulation engine uses deterministic keyword matching on shot descriptions and prompts to infer world state changes. No external AI services are required.

| Category | Example Keywords | Effect |
|----------|-----------------|--------|
| Injury | wound, hurt, bleed, collapse | Physical condition changes |
| Emotion | angry, sad, happy, terrified | Emotional state changes |
| Damage | destroy, explode, burn, shatter | Environment damage state |
| Weather | rain, storm, snow, fog | Environment weather |
| Time | dawn, dusk, night, sunset | Environment time of day |

## Dependencies

- `@virtue/types` — Zod schemas for world state, character state, environment state, prop state, story events, and simulation context
