# Export Pipeline

The export pipeline transforms an edited scene (with transitions and audio) into a final video file.

## Export Flow

```
Editor Timeline
    ↓
Build Export Plan
    ↓
1. Video Composition (shots + transitions)
    ↓
2. Audio Mixing (music + voiceover + sfx)
    ↓
3. Mux Video + Audio
    ↓
4. Final Encoding
    ↓
Completed Export (MP4)
```

## Export Job Lifecycle

| Status | Description | Progress |
|--------|-------------|----------|
| `queued` | Job submitted, waiting to start | 0% |
| `planning` | Building export plan from timeline | 10% |
| `composing_video` | Applying transitions between shots | 30% |
| `mixing_audio` | Mixing audio tracks together | 60% |
| `encoding` | Final encode with video + audio | 85% |
| `completed` | Export finished, output available | 100% |
| `failed` | Error occurred during export | varies |

## Video Composition

### Without Transitions (all cuts)
Uses ffmpeg concat demuxer for fast, lossless concatenation:
```
ffmpeg -f concat -safe 0 -i concat.txt -c copy output.mp4
```

### With Transitions (fade, cross-dissolve)
Uses ffmpeg xfade filter for transition effects:
```
ffmpeg -i shot1.mp4 -i shot2.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=1.5:offset=3.5[vout]" \
  -map "[vout]" -c:v libx264 output.mp4
```

Supported transitions:
- **cut**: No filter applied, simple concatenation
- **fade**: `xfade=transition=fadeblack` — fade through black
- **cross-dissolve**: `xfade=transition=fade` — blend between shots

## Audio Pipeline

1. Each audio track is processed independently (volume, fade, trim, delay)
2. All tracks are mixed using `amix` filter
3. Mixed audio is muxed with the composed video

## Mock Export

During development, `MockExporter` simulates the export pipeline:
- Progresses through all 5 stages on successive poll calls
- Creates a placeholder file at `/tmp/virtue-exports/`
- Returns a mock URL for the output asset

## API Endpoints

```
POST /api/editor/scenes/:projectId/:sceneId/export   → Start export
GET  /api/editor/exports                              → List all exports
GET  /api/editor/exports/:id                          → Get export status
POST /api/editor/exports/:id/poll                     → Poll export progress
```

## Limitations (v0.6)

- Mock exporter only — real ffmpeg pipeline exists but requires ffmpeg installation
- No resolution/bitrate configuration (uses sensible defaults)
- No multi-scene export (one scene at a time)
- No background job queue — polling-based progress tracking
- Transition overlap calculation is approximate, not frame-exact
