# Narrative Continuity

Virtue's narrative continuity system ensures that AI-generated cinematic content maintains consistency across scenes. The simulation engine tracks how characters, environments, and props evolve, then enriches generation prompts with relevant world state.

## How It Works

### 1. Initialization
When a project's world is first accessed, `initializeWorldFromProject()` bootstraps the world state from the project's continuity data — characters, environments, and props defined in the Continuity section of the Studio.

### 2. Scene Simulation
When a scene is simulated (`simulateSceneImpact`), the engine:
1. Iterates through all shots in the scene
2. Analyzes shot descriptions and prompts using keyword maps
3. Infers state changes (e.g., "character looks terrified" → emotionalState: "terrified")
4. Applies changes to the persistent world state
5. Records a story event for the scene

### 3. Prompt Enrichment
Before rendering a shot, the system can call `getSimulationContext()` to gather relevant world state, then `buildSimulationPromptFragment()` to generate a text block like:

```
[World State]
Characters: John (location: office, emotion: anxious, condition: normal)
Environment: Office (time: night, weather: clear, damage: intact)
Props: Briefcase (location: desk, condition: intact, visible)
Conditions: power-outage, deadline-approaching
```

This fragment is prepended to the shot's generation prompt, giving the AI renderer context about the current state of the world.

## Integration Points

- **Continuity System** — Characters, environments, and props defined in continuity serve as the initial state for simulation
- **Director** — Scene direction can trigger world state updates
- **Autonomous Engine** — Scene analysis considers world state for better suggestions
- **Render Pipeline** — Prompt fragments enrich generation prompts

## Design Principles

1. **Deterministic** — No external AI calls; all inference is keyword-based
2. **Incremental** — World state evolves scene by scene
3. **Non-destructive** — Original project data is never modified; world state is a separate layer
4. **Transparent** — All state changes are visible in the World page UI
