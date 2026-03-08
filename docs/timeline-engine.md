# Timeline Engine

The timeline engine manages the arrangement of rendered shots within a scene, enabling scene-level video composition.

## Concepts

### Scene Timeline

A `SceneTimeline` represents the ordered arrangement of shots within a single scene. Each timeline belongs to one scene and contains:

- **shots[]** — ordered `TimelineShot` entries
- **totalDuration** — sum of all shot durations (seconds)
- **sceneId** — the parent scene

### TimelineShot

Each entry in a timeline tracks:

| Field | Type | Description |
|-------|------|-------------|
| shotId | string | Reference to the VirtueShot |
| renderAssetId | string? | ID of the completed render asset |
| startTime | number | Start position in seconds |
| duration | number | Duration in seconds |
| transitionType | enum | `cut` (default), `dissolve`, `fade-black`, `fade-white` |
| transitionDuration | number | Transition duration in seconds (0 = hard cut) |

## API

### `createTimeline(projectId, scene, renderJobs)`

Creates a new timeline from a scene's shots. Automatically:
- Orders shots by their scene order
- Calculates sequential start times
- Links completed render jobs to their shots

### `addShotToTimeline(timeline, shotId, duration, renderAssetId?)`

Appends a shot to the end of an existing timeline.

### `reorderShots(timeline, newOrder)`

Reorders shots in a timeline given a new array of shot IDs. Recalculates all start times while preserving individual shot durations.

### `updateShotAsset(timeline, shotId, renderAssetId)`

Links a completed render asset to a shot in the timeline.

### `isTimelineReady(timeline)`

Returns `true` if all shots in the timeline have rendered assets and the timeline is non-empty.

### `buildSceneRenderPlan(timeline)`

Generates a `SceneRenderPlan` containing the ordered list of asset references needed for ffmpeg composition.

## Flow

```
1. User renders individual shots (existing flow)
2. User navigates to scene timeline page
3. Timeline is auto-created from scene shots + completed renders
4. User can drag to reorder shots
5. When all shots are rendered → "Compose Scene" button activates
6. Composition runs through the mock composer (or ffmpeg)
7. Final scene video asset is created
```

## Extending to Transitions

The `transitionType` and `transitionDuration` fields are scaffolded but not yet used in composition. To add transition support:

1. Update `buildSceneRenderPlan()` to include transition metadata
2. Update `media-utils/compose.ts` to generate ffmpeg filter complex commands instead of simple concat
3. Add transition controls to the timeline UI
