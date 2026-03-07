# Director Engine

The Director Engine transforms raw screenplay text or concept prompts into structured cinematic production plans — scenes, shot lists, camera setups, and render-ready prompts.

## Architecture

```
packages/director-engine/
├── src/
│   ├── index.ts          # Public exports
│   ├── director.ts       # Top-level buildDirectorPlan()
│   ├── parser.ts         # Script and concept text parser
│   ├── planner.ts        # Shot plan generator (heuristic)
│   └── skill-mapper.ts   # Skill attachment rules
```

## Input Modes

### Screenplay Mode
Expects standard screenplay formatting:

```
INT. LOCATION - TIME OF DAY

Action description. CHARACTER NAME in caps.

CHARACTER
(parenthetical)
Dialogue goes here.
```

The parser detects `INT.` / `EXT.` scene headings and splits the script into structured scenes.

### Concept Mode
Accepts freeform creative text:

```
A lone astronaut discovers a flooded cathedral on a dead planet.
Bioluminescent creatures drift through the submerged nave.
```

The parser splits on paragraph breaks and uses heuristics to infer location, time of day, characters, and mood.

## Deterministic Heuristics

The Director Engine uses no external LLM. All planning is deterministic:

### Scene Density Analysis
Each scene body is analyzed for:
- Word count → sparse / moderate / dense
- Dialogue presence → character cue detection
- Action keywords → run, chase, fight, jump, explode...
- Emotion keywords → tears, joy, grief, fear...
- Environment keywords → rain, fog, fire, neon...
- Movement keywords → walks, drives, floats, wanders...

### Shot Count Rules
| Density | Action? | Dialogue? | Shot Count |
|---------|---------|-----------|------------|
| Dense | Yes | — | 5-6 |
| Dense | No | — | 4 |
| Moderate | — | Yes | 3 |
| Moderate | — | No | 2 |
| Sparse | — | Emotion | 2 |
| Sparse | — | No | 1 |

### Shot Sequence Templates
Shots follow classic film grammar:
1. **Establishing** — wide/aerial to set the scene
2. **Subject** — medium shots for main action
3. **Detail** — close-ups for emotion and texture
4. **Reaction** — character reactions to events
5. **Closing** — wide or close to end the scene

Each template specifies shot type, lens, camera movement, and base duration.

### Camera & Lens Selection
| Shot Role | Shot Type | Lens | Camera |
|-----------|-----------|------|--------|
| Establishing | wide/aerial | 24mm | crane-up/drone-orbit |
| Subject | medium | 50mm | static/slow-push |
| Detail | close | 85mm | static |
| Action | POV/wide | 18-24mm | handheld/tracking |
| Reaction | close | 85mm | static |
| Closing | wide/close | 35-85mm | pull-back/static |

### Location Inference
Pattern matching against 25+ location archetypes:
- Urban → "City"
- Forest → "Forest"
- Space → "Space"
- Rain/storm → "Storm"
- etc.

### Lighting Inference
Based on scene content and time of day:
- Fire/candle → "warm practicals, fire-lit"
- Night → "low-key, moonlight + practicals"
- Dawn/dusk → "golden hour, warm backlight"
- Neon → "neon + volumetric"

## Skill Mapping

Each generated shot is matched to relevant Virtue Skills using rule-based mapping:

| Skill | Triggered By |
|-------|-------------|
| cinematic-direction | establishing/wide/aerial shots, moving camera |
| camera-choreography | any non-static camera, POV, aerial |
| lighting-design | explicit lighting intent beyond "natural" |
| character-performance | shots with characters, close-ups |
| temporal-consistency | close-ups, long-duration shots |
| scene-simulation | environment-heavy, establishing shots |
| physics-engine | action keywords (rain, fire, explosion...) |
| visual-style-engine | stylized atmospherics (neon, noir, cyberpunk...) |
| post-production | closing shots, transitions |
| storyboard-generator | establishing/wide shots |

## Prompt Builder

Each shot gets a render-ready prompt string combining:
1. Shot framing description
2. Camera movement
3. Scene content/action
4. Location context
5. Time of day
6. Lighting style
7. Quality tag ("4K cinematic quality, photorealistic")

Prompts are editable in the UI before rendering.

## API

### `buildDirectorPlan(input: DirectorInput): DirectorOutput`
Main entry point. Takes raw text + mode, returns complete plan.

### `parseScreenplay(text): ParsedScene[]`
Parse screenplay-formatted text into structured scenes.

### `parseConcept(text): ParsedScene[]`
Parse freeform concept text into scenes.

### `generateShotPlan(scene): DirectorShotPlan[]`
Generate shot plans for a single parsed scene.

### `mapSkillsToShot(shot): string[]`
Map relevant skill IDs to a shot based on its properties.

## Future: LLM Enhancement

The architecture isolates all heuristic logic in the planner and parser modules. To add LLM-assisted planning:

1. Add an optional `enhanceWithLLM(plan: DirectorOutput): Promise<DirectorOutput>` function
2. Use the LLM to refine shot descriptions, prompts, and mood analysis
3. Keep the deterministic path as the default fallback
4. Gate LLM usage behind a configuration flag
