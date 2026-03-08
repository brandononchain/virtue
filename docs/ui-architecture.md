# UI Architecture

Virtue Studio uses a mobile-first responsive design that scales from phone to desktop.

## Layout System

### Breakpoints
| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 640px | Single column, bottom nav, FAB |
| Tablet | 640–1024px | Adaptive columns, bottom nav |
| Desktop | > 1024px | Full sidebar, multi-column panels |

### Navigation

- **Mobile**: Bottom tab bar (`BottomNav`) with 5 tabs (Home, Projects, Renders, Director, Studio) + Floating Action Button for creation actions
- **Tablet**: Bottom nav persists, collapsible content areas
- **Desktop**: Full sidebar (`Sidebar`) with categorized sections (Main, Post-Production, Intelligence, Continuity)

### Root Layout (`layout.tsx`)
```
<body>
  <Sidebar />        <!-- hidden on mobile (lg:block) -->
  <main>             <!-- pb-[72px] on mobile for bottom nav -->
    {children}
  </main>
  <BottomNav />       <!-- hidden on desktop (lg:hidden) -->
  <FloatingActionButton />  <!-- hidden on desktop (lg:hidden) -->
</body>
```

## Component Architecture

### Core Navigation Components
| Component | File | Purpose |
|-----------|------|---------|
| `Sidebar` | `components/sidebar.tsx` | Desktop navigation with sections |
| `BottomNav` | `components/bottom-nav.tsx` | Mobile bottom tab bar |
| `FloatingActionButton` | `components/floating-action-button.tsx` | Mobile creation FAB + bottom sheet |
| `BottomSheet` | `components/bottom-sheet.tsx` | Slide-up modal for mobile interactions |

### Shared UI Components
| Component | File | Purpose |
|-----------|------|---------|
| `MobileShotCard` | `components/mobile-shot-card.tsx` | Touch-friendly shot card with drag handles |
| `RenderProgressCard` | `components/render-progress-card.tsx` | Animated render job status card |

## Page Patterns

### Desktop Split Layout → Mobile Stacked
Pages like the Editor, Timeline, and Project Detail use side panels on desktop:
- **Desktop**: `flex` layout with main content + fixed-width right panel
- **Mobile**: Right panel becomes a `BottomSheet` or tab-based view

### Desktop Grid → Mobile Stack
Dashboard and Projects use multi-column grids:
- **Desktop**: `grid-cols-3` or `grid-cols-5`
- **Mobile**: `grid-cols-1` or `grid-cols-2`

### Editor Tabs (Mobile)
Complex editors convert to horizontal tab bars on mobile:
- Scene Editor: Shots | Transitions | Audio | Pacing | Export
- Director: Script Input | Shot Plan

## Touch Targets

- Minimum tap target: 48px (`min-h-[44px]` or `py-3`)
- All interactive elements use `touch-manipulation` for instant response
- Buttons use `active:scale-[0.98]` for tactile feedback
- Form inputs: 14px font on mobile (prevents iOS zoom), 2.5 padding

## CSS Architecture

### Global Utilities (`globals.css`)
- `.studio-panel` — Standard panel styling with backdrop blur
- `.safe-bottom` — Safe area padding for notched devices
- `.touch-target` — Minimum 48px tap target
- `.no-scrollbar` — Hidden scrollbar for horizontal scroll areas
- `.animate-slide-up` — Bottom sheet entrance animation
- `.animate-fade-in` — Overlay fade animation

### Tailwind Theme (`tailwind.config.ts`)
- Custom `virtue` color namespace (bg, surface, border, muted, accent)
- Inter font for UI, JetBrains Mono for code/technical data
