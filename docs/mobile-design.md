# Mobile Design System

Virtue Studio is designed mobile-first. The phone experience is primary; desktop expands the layout.

## Design Principles

1. **Mobile primary** — All layouts start at 320px and scale up
2. **Touch-native** — 48px minimum tap targets, swipe-to-dismiss sheets
3. **Dark cinematic** — Dark theme (#0a0a0a bg), glass panels, soft borders
4. **Production clarity** — Status indicators, progress bars, clear hierarchy

## Navigation Architecture

### Bottom Tab Bar
5 tabs at the bottom of the screen on mobile:
- **Home** — Dashboard with stats, projects, render status
- **Projects** — Project list with creation flow
- **Renders** — Render queue with filtering
- **Director** — Script-to-shot planning
- **Studio** — Continuity, intelligence, exports

### Floating Action Button
Fixed bottom-right button opens a creation bottom sheet:
- New Project
- New Scene
- New Shot
- Generate Render

### Bottom Sheets
Replace centered modals on mobile. Used for:
- Create Project form
- Shot detail panel
- Render job detail
- Scene composition controls

Features:
- Slide up from bottom with spring animation
- Swipe down to dismiss (100px threshold)
- 85vh max height with internal scroll
- Backdrop blur overlay

## Responsive Breakpoints

```
Mobile:   < 640px   (sm:)   — Single column, bottom nav
Tablet:   640–1024px (md:)  — Adaptive columns
Desktop:  > 1024px  (lg:)   — Sidebar, split panels
```

## Typography Scale

| Element | Mobile | Desktop |
|---------|--------|---------|
| Page title | 22px | 24px |
| Section header | 11px uppercase | 12px uppercase |
| Body text | 14–15px | 13–14px |
| Metadata | 11–12px | 10–11px |
| Mono/code | 12px | 11px |

## Touch Interaction

### Tap Targets
- All buttons: `min-h-[44px]` minimum
- List items: `py-3.5` on mobile, `py-2.5` on desktop
- Form inputs: `py-2.5` with `text-[14px]` (prevents iOS zoom)

### Gestures
- **Swipe down**: Close bottom sheets
- **Drag**: Reorder shots in timeline/editor
- **Horizontal scroll**: Filter tabs, editor tabs
- **Active press**: `active:scale-[0.98]` feedback on cards/buttons

### CSS Classes
- `touch-manipulation` — Eliminates 300ms tap delay
- `active:bg-zinc-800/40` — Touch feedback on list items
- `active:scale-[0.98]` — Press animation on cards

## Component Reference

### BottomNav (`bottom-nav.tsx`)
Fixed bottom navigation bar with 5 tabs. Shows active indicator dot. Hidden on `lg:` screens.

### FloatingActionButton (`floating-action-button.tsx`)
Fixed position button (bottom-right, above bottom nav). Opens BottomSheet with creation actions. Hidden on `lg:` screens.

### BottomSheet (`bottom-sheet.tsx`)
Slide-up panel replacing modals on mobile. Props:
- `open: boolean` — Visibility state
- `onClose: () => void` — Dismiss handler
- `title?: string` — Optional header
- `children: ReactNode` — Sheet content

Supports touch drag-to-dismiss with velocity detection.

### MobileShotCard (`mobile-shot-card.tsx`)
Touch-friendly shot card for vertical lists. Shows:
- Drag handle with grip dots
- Thumbnail placeholder
- Shot type, duration, description
- Camera/lens metadata
- Render status badge

### RenderProgressCard (`render-progress-card.tsx`)
Animated render job card with:
- Status dot (color-coded, animated for active)
- Prompt preview
- Progress bar with smooth transition
- Status chip

## Performance

- Body overflow locked when bottom sheet is open
- `backdrop-blur-lg` on nav elements for glass effect
- `transition-all` limited to interactive elements
- No-scrollbar utility for horizontal scroll areas
- Safe area insets for notched devices (`env(safe-area-inset-bottom)`)

## PWA Metadata

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#0a0a0a" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```
