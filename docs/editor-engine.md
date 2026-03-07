# Editor Engine

The Editor Engine (`@virtue/editor-engine`) provides editorial controls for Virtue scenes, transforming raw concatenated clips into cinematic sequences with transitions, audio tracks, and pacing adjustments.

## Architecture

The editor engine operates on `VirtueEditorTimeline` objects, which extend the basic scene timeline with:

- **Transitions** between shots (cut, fade, cross-dissolve)
- **Audio tracks** across three lanes: music, voiceover, SFX
- **Pacing controls** including trim points and preset configurations
- **Export planning** that produces an ffmpeg-compatible export plan

## Editor Timeline Structure

```
VirtueEditorTimeline
├── shots: EditorTimelineShot[]
│   ├── shotId, renderAssetId
│   ├── startTime, duration
│   ├── trimStart, trimEnd
│   └── transition: { type, durationSec, easing? }
├── musicTracks: VirtueAudioTrack[]
├── voiceoverTracks: VirtueAudioTrack[]
├── sfxTracks: VirtueAudioTrack[]
├── pacingPreset?: "cinematic" | "slow-burn" | "fast-cut" | "trailer"
└── totalDuration
```

## Core Functions

### Timeline Creation

- `createEditorTimeline(projectId, scene, renderJobs)` — Create from scene data
- `createEditorTimelineFromSceneTimeline(sceneTimeline)` — Create from existing scene timeline

### Transitions

- `addTransition(timeline, shotId, transition)` — Set transition for a shot
- `removeTransition(timeline, shotId)` — Revert to cut
- `setDefaultTransitions(timeline, transition)` — Apply to all shots

### Audio Tracks

- `addMusicTrack(timeline, assetId, startTime, endTime?, options?)` — Add music
- `addVoiceoverTrack(timeline, assetId, startTime, options?)` — Add voiceover
- `addSfxTrack(timeline, assetId, startTime, options?)` — Add sound effect
- `removeAudioTrack(timeline, trackId)` — Remove any audio track
- `updateAudioTrack(timeline, trackId, updates)` — Modify track properties

### Pacing

- `applyPacingPreset(timeline, preset)` — Apply timing preset
- `trimShot(timeline, shotId, trimStart, trimEnd)` — Adjust shot duration
- `reorderEditorShots(timeline, newOrder)` — Reorder shots
- `recalculateTimings(timeline)` — Recalculate start times after changes

### Export

- `buildEditorExportPlan(timeline, assetPathResolver)` — Generate export plan

## Transition Types

| Type | Description | Default Duration |
|------|-------------|------------------|
| `cut` | Hard cut, no effect | 0s |
| `fade` | Fade through black | 1.0s |
| `cross-dissolve` | Blend between shots | 1.5s |

## Pacing Presets

| Preset | Transition | Duration Multiplier |
|--------|-----------|-------------------|
| `cinematic` | Cross-dissolve 1.5s | 1.0x |
| `slow-burn` | Fade 2.0s | 1.3x |
| `fast-cut` | Cut | 0.7x |
| `trailer` | Cut | 0.5x |

## Limitations (v0.6)

- No frame-accurate trimming — duration-based only
- Transition easing metadata is stored but not yet applied
- Audio tracks reference asset IDs, not file paths directly
- No live preview — export required to see final result
