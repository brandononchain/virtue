# Script-to-Shot Pipeline

End-to-end flow from raw text to render-ready shots in Virtue.

## Pipeline Overview

```
Raw Text Input
     │
     ├─ screenplay mode ─→ parseScreenplay()
     │                      ↓ detect INT./EXT. headings
     │                      ↓ extract location, time, characters
     │                      ↓ split body text per scene
     │
     └─ concept mode ────→ parseConcept()
                            ↓ split on paragraph breaks
                            ↓ infer location, time, characters
                            ↓ heuristic scene boundaries
     │
     ↓
ParsedScene[]
     │
     ↓ for each scene:
     │
     ├─ analyzeScene()      word count, dialogue, action, emotion
     ├─ determineShotCount() heuristic shot count
     ├─ selectShotSequence() pick shot templates
     ├─ generateDescriptions() distribute text across shots
     ├─ inferLighting()      match lighting to content
     ├─ buildPromptSeed()    compose render prompt
     │
     ↓
DirectorShotPlan[]
     │
     ↓ mapSkillsToAllShots()
     │
     ↓
DirectorOutput
     │
     ├─ Review in Director UI
     │   ├─ edit prompts
     │   ├─ adjust shot parameters
     │   └─ verify skill attachments
     │
     ↓ "Create Project"
     │
VirtueProject
     ├─ VirtueScene[] (with location, time, mood)
     └─ VirtueShot[] (with prompt, lens, camera, skills)
         │
         ↓ Render individual shots
         │
         ↓ Compose into scene video (timeline engine)
         │
         ↓ Final output
```

## How Render Prompts Are Generated

Each prompt is assembled from structured components:

```
[Shot Framing]     "Cinematic wide shot"
[Camera Movement]  "dolly-forward camera movement"
[Scene Content]    "lone figure crossing vast desert"
[Location]         "set in Saharan desert"
[Time]             "dawn atmosphere"
[Lighting]         "golden hour, warm backlight lighting"
[Quality]          "4K cinematic quality, photorealistic"
```

Result:
```
Cinematic wide shot, dolly-forward camera movement, lone figure
crossing vast desert, set in Saharan desert, dawn atmosphere,
golden hour warm backlight lighting, 4K cinematic quality, photorealistic
```

## How Skills Are Mapped

Skills are attached using deterministic rules, not keyword matching:

1. **Property-based**: shot type, camera move, lighting intent
2. **Content-based**: regex patterns against description text
3. **Role-based**: establishing shots get scene-simulation, close-ups get character-performance

Each shot receives 2-5 skills. The rules are defined in `skill-mapper.ts`.

## Example: Concept Input → Output

**Input:**
```
A lone astronaut discovers a flooded cathedral on a dead planet.
```

**Generated Plan:**
- Scene 1: "Scene 1"
  - Location: Cathedral (inferred from "cathedral")
  - Time: day (default)
  - Shot 1: Establishing wide — "Reveal Cathedral in day setting"
    - Lens: 24mm, Camera: crane-up, Duration: 5s
    - Skills: cinematic-direction, camera-choreography, scene-simulation
  - Shot 2: Subject medium — "Core action and subject"
    - Lens: 50mm, Camera: static, Duration: 4s
    - Skills: character-performance, temporal-consistency

## Extending to Transitions

Future work: the Director Engine can suggest transition types between shots:

| Shot Boundary | Suggested Transition |
|--------------|---------------------|
| establishing → subject | cut |
| subject → detail | cut |
| scene end → scene start | dissolve |
| emotional peak → wide | fade-black |

These would feed into the timeline engine's `transitionType` field.
