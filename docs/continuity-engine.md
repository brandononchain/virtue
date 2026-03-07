# Virtue Continuity Engine

The Continuity Engine maintains visual and narrative consistency across shots and scenes in Virtue projects.

## Overview

When generating AI video, each shot is typically rendered independently, leading to inconsistencies in character appearance, environment details, and visual style between shots. The Continuity Engine solves this by tracking identities and automatically enriching render prompts with continuity context.

## Architecture

```
packages/continuity-engine/
├── src/
│   ├── index.ts              # Public API
│   ├── context.ts            # Scene context resolution
│   ├── prompt-enrichment.ts  # Prompt enrichment logic
│   ├── registry.ts           # Entity registration (CRUD)
│   └── scene-context.ts      # Scene context management
```

The engine is a pure TypeScript library with no side effects. It operates on immutable project data and returns updated copies.

## Identity Persistence

### Characters (`VirtueCharacter`)

Characters are defined at the project level and persist across all scenes. Each character has:

- **name** — Display name (e.g., "Detective Marcus")
- **appearance** — Physical description (face, build, hair)
- **clothing** — Default wardrobe
- **age**, **gender**, **ethnicity** — Demographics for visual consistency
- **styleTags** — Visual style tags (e.g., "noir", "cyberpunk")
- **visualReferenceAssets** — Optional reference image IDs

### Environments (`VirtueEnvironment`)

Environments define locations that can be reused across scenes:

- **locationType** — Interior, exterior, urban, etc.
- **timeOfDay** — Day, night, dusk, etc.
- **weather** — Clear, rainy, foggy, etc.
- **lightingStyle** — Neon, moonlight, harsh, etc.
- **colorPalette** — Dominant colors for visual consistency

### Props (`VirtueProp`)

Props are objects that appear across shots:

- **material** — Construction material
- **condition** — Worn, pristine, damaged, etc.
- **usageNotes** — Context for how the prop is used

## Scene Context

Each scene maintains a `SceneContext` that binds entities to the scene:

```typescript
{
  environmentId: string;        // Which environment this scene uses
  activeCharacterIds: string[]; // Characters present in this scene
  activePropIds: string[];      // Props present in this scene
  lightingIntent: string;       // Scene-specific lighting override
  moodIntent: string;           // Scene-specific mood
}
```

## Prompt Enrichment

### How It Works

Before a render job is submitted, the engine:

1. **Resolves** the scene context — looks up all entity IDs to get full data
2. **Builds** continuity fragments — character descriptions, environment details, props
3. **Appends** the fragment to the original prompt with a `[Continuity context]` marker

### Example

**Original prompt:**
```
A detective walks through a neon alley in the rain.
```

**Enriched prompt:**
```
A detective walks through a neon alley in the rain.

[Continuity context] Characters: Marcus, male, mid-40s, gray stubble and sharp jawline, wearing worn dark trench coat. Environment: Kabukicho Alley. urban exterior. neon-lit narrow street with vending machines. rainy. neon lighting. color palette: pink, blue, black. Mood: tense
```

### Reversibility

The enrichment is fully reversible. The `stripContinuityFromPrompt()` function removes the `[Continuity context]` suffix, restoring the original prompt.

### Manual Override

Shots support a `continuityOverride` field. When set, the override text is used as the base prompt instead of the shot's default prompt, allowing per-shot customization while still receiving continuity injection.

Users can also edit the enriched prompt directly in the Studio UI before rendering.

## Render Pipeline Integration

The render flow is:

```
Shot prompt
  → resolveContinuityContext(scene, project)
  → applyContinuityToPrompt(shot, context)
  → enriched prompt
  → provider.submit()
```

If the user provides a custom prompt via the API, it takes precedence over the enriched prompt.

## API Endpoints

All endpoints are under `/api/continuity/:projectId/`:

### Characters
- `GET /characters` — List all characters
- `POST /characters` — Create character
- `PUT /characters/:charId` — Update character
- `DELETE /characters/:charId` — Delete character

### Environments
- `GET /environments` — List all environments
- `POST /environments` — Create environment
- `PUT /environments/:envId` — Update environment
- `DELETE /environments/:envId` — Delete environment

### Props
- `GET /props` — List all props
- `POST /props` — Create prop
- `PUT /props/:propId` — Update prop
- `DELETE /props/:propId` — Delete prop

### Scene Context
- `GET /scenes/:sceneId/context` — Get resolved scene context
- `PUT /scenes/:sceneId/context` — Update scene context

### Prompt Preview
- `GET /scenes/:sceneId/shots/:shotId/enriched-prompt` — Preview enriched prompt

## Studio UI

Three new pages are available under the Continuity section in the sidebar:

- `/studio/characters` — Create and manage character identities
- `/studio/environments` — Create and manage environment definitions
- `/studio/props` — Create and manage props

The project detail page also shows:
- Continuity context badges on scene headers (environment, character count, prop count)
- Enriched prompt preview in the shot detail panel
- Continuity context fragment display

## Reference Asset Support

Characters, environments, and props all support `visualReferenceAssets[]` — an array of asset IDs pointing to reference images stored in the asset storage system. These can optionally be passed to providers that support image-to-video conditioning.

## Future Extensions

### Embedding-Based Consistency
The architecture supports future integration with embedding models:
- Store character/environment embeddings alongside text descriptions
- Use embedding similarity to detect continuity breaks
- Auto-suggest corrections when shots drift from established visual identity

### Cross-Scene Tracking
- Track wardrobe changes across acts (e.g., character changes clothes in scene 5)
- Time-of-day progression across sequential scenes
- Weather transitions and lighting continuity
