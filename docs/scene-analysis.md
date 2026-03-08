# Scene Analysis

Virtue's scene analysis examines the composition of a scene and provides scored metrics, pattern detection, and actionable suggestions.

## Metrics

| Metric | Range | Description |
|---|---|---|
| `totalDuration` | seconds | Sum of all shot durations |
| `shotCount` | integer | Number of shots in the scene |
| `avgShotDuration` | seconds | Mean shot duration |
| `cameraVariety` | 0-1 | Ratio of unique camera moves to total shots |
| `visualDiversity` | 0-1 | Ratio of unique shot types (capped at 6 types) |
| `pacingScore` | 0-1 | Composite score based on duration distribution |
| `continuityCoverage` | 0-1 | Character reference consistency across shots |

## Pacing Score

The pacing score combines two factors:

1. **Average duration penalty** — ideal range is 3-5 seconds per shot
   - <2s: 0.6 (too fast)
   - 6-8s: 0.7 (getting slow)
   - >8s: 0.5 (too slow)

2. **Variance penalty** — some variation is desired
   - StdDev < 0.5: 0.7 (too uniform / monotonous)
   - StdDev > 4: 0.6 (too erratic)

## Suggestion Types

| Type | When Triggered |
|---|---|
| `add_shot` | Missing establishing shot, no close-ups with characters, repetitive types, scene too short |
| `trim_shot` | Shot duration exceeds 8 seconds |
| `pacing_adjustment` | Low camera movement variety |

Each suggestion includes a priority level (high/medium/low), title, and description.

## UI Integration

The autonomous page displays:
- **Metric cards** for duration, shot count, and averages
- **Score bars** for pacing, visual diversity, and continuity
- **Shot type distribution** badges
- **Suggestion cards** with priority badges and descriptions
