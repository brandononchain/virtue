# Approval Workflow

Virtue's approval system lets reviewers mark creative assets through a structured review cycle.

## Approval States

| State | Meaning |
|---|---|
| `pending` | Not yet reviewed |
| `needs_changes` | Reviewed, changes requested |
| `approved` | Approved for production |
| `rejected` | Rejected — requires re-do |

## Targetable Objects

Approvals can be set on:
- **Scenes** — overall scene quality
- **Shots** — individual shot approval
- **Renders** — specific render output
- **Exports** — final exported scene

## API

```
GET  /api/review/approvals/:targetType/:targetId
POST /api/review/approvals
```

**Set approval:**
```json
{
  "targetType": "shot",
  "targetId": "shot_123",
  "state": "approved",
  "reviewerName": "Director",
  "notes": "Color grade is perfect"
}
```

## Production Workflow Stages

Projects and scenes progress through a linear workflow:

```
concept → planning → previz → rendering → review → approved → final_exported → archived
```

The workflow stage is separate from per-asset approval. A project can be in `review` stage while individual shots are still `pending` approval.

```
POST /api/review/workflow/stage     — set stage directly
POST /api/review/workflow/advance   — advance to next stage
GET  /api/review/workflow/stages    — list all stage names
```

## UI Integration

The project detail page shows:
- **Workflow progress bar** — colored segments showing current stage
- **Stage badge** — clickable to advance to next stage
- **Shot approval controls** — 4-button row in the shot detail panel
- **Review notes** — optional text attached to approval state

## Future

- Multi-reviewer support with role-based access
- Approval chains (VFX → Director → Producer)
- Notification hooks on state changes
- Activity timeline / audit log
