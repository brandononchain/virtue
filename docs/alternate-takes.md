# Alternate Takes

Virtue supports multiple render takes per shot, allowing creative exploration and comparison before committing to a final version.

## Concept

Each render submitted for a shot automatically creates a new take. Takes capture:
- **Render job ID** — link to the actual render
- **Provider** — which generation provider was used
- **Prompt version** — the exact prompt text at render time
- **Continuity context** — the continuity state when rendered
- **Routing decision** — which provider was recommended and why
- **Status** — active, selected, favorite, or archived

## Take Statuses

| Status | Meaning |
|---|---|
| `active` | Available take, not currently selected |
| `selected` | The active take for this shot (only one at a time) |
| `favorite` | Marked as a preferred option (can coexist with selected) |
| `archived` | Hidden from the active view |

## API

```
GET  /api/review/shots/:shotId/takes              — list takes
POST /api/review/shots/:shotId/takes               — create take
POST /api/review/shots/:shotId/takes/:id/select    — mark as selected
POST /api/review/shots/:shotId/takes/:id/favorite  — mark as favorite
POST /api/review/shots/:shotId/takes/:id/archive   — archive take
```

**Create take:**
```json
{
  "renderJobId": "rj_abc123",
  "provider": "luma",
  "promptVersion": "Cinematic close-up...",
  "label": "Take 3"
}
```

## Compare Mode

When a shot has 2+ takes, the UI offers a "Compare Takes" link that opens a side-by-side comparison view at `/studio/compare/new?renders=id1,id2`.

The compare view shows:
- Side-by-side video players
- Provider and prompt metadata
- "Select as Winner" button per render

## UI Integration

The shot detail panel shows takes below the render result:
- Color-coded status dots (emerald=selected, amber=favorite)
- Click to select as active take
- Provider badge per take
- Compare link when 2+ takes exist

## Version History

Every prompt or setting change can be captured as a version snapshot for traceability. This pairs with takes to provide a complete audit trail of creative decisions.
