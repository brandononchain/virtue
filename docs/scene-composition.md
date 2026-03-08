# Scene Composition

Scene composition assembles multiple rendered shot videos into a single continuous scene video.

## How Shots Become Scenes

```
Individual Shots          Timeline              Composed Scene
┌──────────┐
│ Shot 1   │─rendered─┐
│ aerial   │          │   ┌────────────────┐    ┌──────────────────┐
│ 6s       │          ├──▶│ Scene Timeline │───▶│ scene-output.mp4 │
└──────────┘          │   │ Shot 1 → 2 → 3│    │ 13s total        │
┌──────────┐          │   └────────────────┘    └──────────────────┘
│ Shot 2   │─rendered─┤
│ wide     │          │
│ 4s       │          │
└──────────┘          │
┌──────────┐          │
│ Shot 3   │─rendered─┘
│ close    │
│ 3s       │
└──────────┘
```

## ffmpeg Composition

The current implementation uses ffmpeg's **concat demuxer** for zero-re-encoding concatenation:

### Concat file format

```
file '/path/to/shot1.mp4'
file '/path/to/shot2.mp4'
file '/path/to/shot3.mp4'
```

### ffmpeg command

```bash
ffmpeg -f concat -safe 0 -i concat.txt -c copy -movflags +faststart -y output.mp4
```

Key flags:
- `-f concat` — use the concat demuxer
- `-safe 0` — allow absolute paths in the concat file
- `-c copy` — stream copy (no re-encoding, fast)
- `-movflags +faststart` — optimize for web playback
- `-y` — overwrite output

### Limitations

- All input videos must have the same codec, resolution, and frame rate
- No transitions between shots (hard cuts only)
- No audio mixing

## Mock Composer

For development without ffmpeg installed, the `MockComposer` simulates the composition pipeline:

1. **planning** (15%) — analyzing inputs
2. **composing** (50%) — concatenating shots
3. **encoding** (80%) — finalizing output
4. **completed** (100%) — creates a placeholder file

Each `poll` call advances one stage, matching the pattern used by the mock video provider.

## Scene Render Job Lifecycle

```
queued → planning → composing → encoding → completed
                                         → failed
```

| Status | Description |
|--------|-------------|
| queued | Job submitted, waiting to start |
| planning | Analyzing timeline, gathering assets |
| composing | Running ffmpeg / mock composition |
| encoding | Finalizing output format |
| completed | Scene video ready |
| failed | Error occurred |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scenes/:projectId/:sceneId/timeline` | Get or auto-create timeline |
| POST | `/api/scenes/:projectId/:sceneId/timeline` | Refresh timeline from current state |
| POST | `/api/scenes/:projectId/:sceneId/timeline/reorder` | Reorder shots |
| POST | `/api/scenes/:projectId/:sceneId/compose` | Start scene composition |
| POST | `/api/scenes/compose/:jobId/poll` | Advance composition job |
| GET | `/api/scenes/compose/:jobId` | Get composition job status |
| GET | `/api/scenes/:projectId/jobs` | List all scene render jobs |

## Extending to Transitions

Future work to add dissolves, fades, and other transitions:

1. Replace concat demuxer with ffmpeg filter_complex
2. Generate crossfade filters between segments
3. Example for 1-second dissolve:
   ```
   ffmpeg -i shot1.mp4 -i shot2.mp4 \
     -filter_complex "[0][1]xfade=transition=dissolve:duration=1:offset=5" \
     -y output.mp4
   ```
4. Update `buildSceneRenderPlan()` to include transition timing
5. Add transition picker UI to the timeline page
