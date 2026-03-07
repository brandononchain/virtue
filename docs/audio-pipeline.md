# Audio Pipeline

Virtue's audio pipeline supports mixing multiple audio tracks (music, voiceover, SFX) with per-track volume, fade in/out, and timing controls.

## Audio Track Types

### Music
- Background score or soundtrack
- Default volume: 70%
- Default fade in: 1s, fade out: 2s
- Supports start/end time for partial playback

### Voiceover
- Narration or dialogue overlay
- Default volume: 100%
- Default fade in: 0.3s, fade out: 0.5s
- Optional transcript metadata for alignment

### Sound Effects (SFX)
- Point-in-time audio events
- Default volume: 80%
- No fade by default
- Positioned at specific start times

## Track Properties

Each audio track includes:

```typescript
{
  id: string;
  type: "music" | "voiceover" | "sfx";
  assetId: string;         // Reference to stored audio asset
  label: string;           // Display name
  startTime: number;       // Offset in seconds from scene start
  endTime?: number;        // Optional end time (defaults to full duration)
  volume: number;          // 0.0 to 1.0
  fadeInSec: number;       // Fade in duration
  fadeOutSec: number;      // Fade out duration
}
```

## ffmpeg Implementation

### Single Track Processing
```
ffmpeg -i track.mp3 -af "volume=0.7,afade=t=in:st=0:d=1,afade=t=out:st=28:d=2" -c:a aac -b:a 192k output.aac
```

### Multi-Track Mixing
Uses ffmpeg filter_complex with:
1. Per-input volume adjustment
2. Per-input fade in/out
3. Per-input delay (adelay) for start time offset
4. `amix` filter to combine all streams

### Video + Audio Mux
```
ffmpeg -i video.mp4 -i mixed_audio.aac -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest output.mp4
```

## Asset Storage

Audio assets are stored using the same `@virtue/asset-storage` system as video assets, with `type: "audio"` and optional metadata:

- `mediaType`: "music" | "voiceover" | "sfx"
- `durationSec`: Duration in seconds
- `transcript`: Optional text transcript (voiceover)

## Limitations (v0.6)

- No real-time audio preview in the editor
- No waveform visualization (metadata field reserved)
- No TTS generation — voiceover files must be uploaded
- Audio normalization is basic (volume-based, not LUFS)
