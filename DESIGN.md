# Design Brief

## Direction

Memory Assistant — Learning-focused productivity UI with spaced repetition scheduling, forgetting curve analytics, and progress tracking.

## Tone

Refined minimalism executed with surgical precision; clean editorial aesthetic inspired by Linear/Vercel emphasizing data clarity and learning journey visibility.

## Differentiation

Animated forgetting curve visualization with real-time progress indicators dominate the interface; every screen surface signals learning momentum and achievement.

## Color Palette

| Token      | OKLCH             | Role                                  |
|------------|-------------------|---------------------------------------|
| background | 0.145 0.014 260   | Dark base (dark mode primary)         |
| foreground | 0.95 0.01 260     | Text/content on dark backgrounds      |
| card       | 0.18 0.014 260    | Elevated surface for study items      |
| primary    | 0.75 0.15 190     | Teal accent (memory recall focus)     |
| accent     | 0.75 0.15 85      | Warm amber (achievements/milestones)  |
| muted      | 0.22 0.02 260     | Secondary UI elements, dividers       |

## Typography

- Display: Space Grotesk — navigation, section headings, study streak badge, hero text
- Body: DM Sans — card labels, queue items, settings, body copy
- Scale: hero `text-5xl md:text-6xl font-bold`, h2 `text-3xl font-semibold`, label `text-sm font-medium uppercase`, body `text-base`

## Elevation & Depth

Surface hierarchy via card elevation: study queue cards elevated with shadow-elevated, sidebar and header with subtle shadow-subtle, analytics dashboard flat on background with muted borders.

## Structural Zones

| Zone    | Background         | Border         | Notes                                |
|---------|-------------------|----------------|--------------------------------------|
| Header  | card (0.18)       | border-subtle  | Profile, streak badge, items-due    |
| Sidebar | sidebar (0.16)    | sidebar-border | Navigation with teal active states  |
| Content | background (0.145) | —             | Study queue and collections         |
| Analytics | background (0.145) | border-subtle | Dashboard with muted chart palette  |
| Footer  | muted (0.22)      | border-subtle  | Settings, theme toggle              |

## Spacing & Rhythm

Compact vertical rhythm (8px/16px/24px) for dense information; study queue items gap-4, analytics chart sections gap-6, sidebar padding 12px consistent with content margins. Micro-spacing 2px for chart interactions.

## Component Patterns

- Buttons: Teal primary `bg-primary text-primary-foreground`, amber ghost `text-accent border-accent` for achievements, destructive `bg-destructive` for archive
- Cards: `rounded-sm` (4px), `shadow-elevated`, `bg-card border-b border-muted/10`
- Badges: Study streak `bg-accent/20 text-accent rounded-full`, items-due `bg-primary/20 text-primary`

## Motion

- Entrance: Fade in with `fade-in` utility (0.3s ease-out), cascading card entrance via stagger
- Hover: Button `hover:bg-primary/90 transition-smooth`, card `hover:shadow-elevated transition-smooth`
- Decorative: Forgetting curve animates on load (line stroke animation), progress bar fills on review completion

## Constraints

- No full-page gradients; use solid dark base only
- Avoid bright accent overuse; teal primary only on active states and key CTAs
- Chart colors use muted chart palette (chart-1 through chart-5) exclusively
- Sidebar max-width 240px; responsive collapse under md breakpoint

## Signature Detail

Animated forgetting curve with decay gradient and milestone markers dominating analytics dashboard—signals learning science foundation with visual precision.
