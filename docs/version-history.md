# Version History

Virtue tracks meaningful changes to creative assets through lightweight version snapshots.

## What Gets Versioned

Version snapshots can be created for any target type:
- **Projects** — overall project changes
- **Scenes** — scene metadata, context changes
- **Shots** — prompt changes, setting changes
- **Renders** — render configuration changes
- **Timelines** — timeline structure changes
- **Exports** — export settings changes

## Snapshot Model

Each snapshot stores:
- **Target type and ID** — what was changed
- **Summary** — human-readable description of the change
- **Metadata** — serialized blob with before/after data
- **Timestamp** — when the change occurred

## API

```
GET  /api/review/versions/:targetType/:targetId  — list history (newest first)
POST /api/review/versions/snapshot                — create snapshot
```

**Create snapshot:**
```json
{
  "targetType": "shot",
  "targetId": "shot_123",
  "summary": "Updated prompt for better lighting direction",
  "metadata": {
    "previousPrompt": "Cinematic wide shot...",
    "newPrompt": "Cinematic wide shot, golden hour..."
  }
}
```

## Design Notes

This is not a full git-like diffing system. It provides:
- **Traceability** — what changed and when
- **Restore confidence** — see the history of decisions
- **Audit trail** — accountability for creative changes

The metadata blob is schema-free, allowing any serializable data to be captured.

## Future

- Diff visualization for prompts and settings
- Restore from snapshot
- Automated snapshot creation on key events
- Version comparison in the UI
