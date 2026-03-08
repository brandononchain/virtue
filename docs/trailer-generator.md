# Trailer Generator

Virtue can automatically generate trailer sequences from project content by extracting highlights and arranging them for cinematic impact.

## Pipeline

```
Project Scenes
  → Extract highlights from each scene
  → Score and rank by visual/emotional/action content
  → Select top clips (up to 30 seconds)
  → Reorder for trailer arc
  → Output trailer plan
```

## Highlight Scoring

Each shot is scored across three keyword categories:

### Action Keywords (base: 0.3, +0.1 per hit)
explosion, chase, fight, crash, run, jump, fall, fire, battle, attack, strike, impact

### Emotional Keywords (base: 0.25, +0.1 per hit)
tears, cry, smile, laugh, embrace, kiss, whisper, scream, shock, reveal, confront

### Visual Keywords (base: 0.2, +0.08 per hit)
aerial, sunset, sunrise, panorama, landscape, silhouette, reflection, fog, rain, snow, golden hour, neon

### Bonuses
- Establishing/aerial shots: +0.15
- Close-up/extreme close-up: +0.1
- Non-static camera: +0.1

Threshold: only shots scoring >= 0.3 are included.

## Trailer Arc

Highlights are reordered into a cinematic flow:

1. **Visual/cinematic openers** — establishing shots, landscapes
2. **Character moments** — intimate close-ups
3. **Action climax** — spectacle and intensity
4. **Emotional closer** — payoff moment

## Constraints

- Maximum trailer duration: 30 seconds
- Maximum clips: 12
- Clip duration capped at 2.5 seconds (trailer pacing)
- Pacing preset: "trailer" (fast cuts)

## API

```
POST /api/autonomous/generate-trailer
{
  "projectId": "proj_123",
  "title": "My Trailer"  // optional
}
```

Returns a `VirtueTrailerPlan` with ordered highlights, total duration, and pacing preset.

## Future

- Audio track auto-selection for trailers
- Beat-synchronized cuts
- Title card insertion
- Export to video via the editor pipeline
