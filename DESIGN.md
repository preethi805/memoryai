# Design Brief

## Direction

MemoryAI — Futuristic AI-powered memory assistant with deep space aesthetic. Glassmorphism UI with neon glow accents, animated gradient meshes, and polished micro-interactions for engaging learning experience.

## Tone

Premium tech-forward glassmorphism; refined futurism inspired by modern WebGL interfaces. Deep midnight base with electric violet and cyan neon accents create unforgettable visual presence.

## Differentiation

Frosted glass cards with chromatic neon glows (violet/cyan), animated gradient mesh backgrounds, glowing stat counters, and micro-animation tokens (pulse, float, shimmer) create immersive futuristic dashboard with premium tech feel.

## Color Palette

| Token           | OKLCH             | Role                                     |
|-----------------|-------------------|------------------------------------------|
| background      | 0.145 0.014 260   | Deep midnight base (dark mode primary)   |
| foreground      | 0.95 0.01 260     | Text/content on dark backgrounds         |
| card            | 0.18 0.014 260    | Elevated glass surface for cards         |
| primary         | 0.75 0.15 190     | Bright cyan neon accent (interactive)    |
| accent          | 0.75 0.15 85      | Warm amber neon (achievements/badges)    |
| neon-violet     | 0.85 0.28 265     | Electric violet glow (dark mode)         |
| neon-cyan       | 0.8 0.28 165      | Bright cyan glow (dark mode)             |
| muted           | 0.22 0.02 260     | Secondary UI elements, dividers          |

## Typography

Display: Space Grotesk — section headings, memory streak badge, hero text with gradient-text-violet overlay  
Body: DM Sans — card labels, queue items, analytics labels, body copy  
Scale: hero `text-5xl md:text-6xl gradient-text-mesh`, h2 `text-3xl font-semibold`, label `text-sm font-medium uppercase`, body `text-base`

## Elevation & Depth

Glassmorphism hierarchy: `.glass` (soft blur 12px, 50% card opacity) for secondary cards, `.glass-elevated` (blur 20px, 60% opacity) for stat cards with neon glow shadows, solid backgrounds for primary content.

## Structural Zones

| Zone       | Background        | Effect               | Notes                                    |
|------------|-------------------|----------------------|------------------------------------------|
| Header     | glass-elevated    | glow-primary         | Streak badge with neon glow, blur panel  |
| Sidebar    | glass-dark        | subtle border        | Navigation with cyan active states       |
| Content    | gradient-mesh     | animated bg shift    | Dashboard with gradient background       |
| Analytics  | glass-elevated    | glow-violet          | Cards with violet glow, chart overlays   |
| Stat Cards | glass-elevated    | glow-primary/accent  | Counter-animate on load, pulse glow      |

## Spacing & Rhythm

Compact vertical rhythm (8px/16px/24px) for dense information; study queue items gap-4, stat cards gap-6, sidebar padding 12px. Neon glow radius 20-40px extends beyond card bounds for atmospheric effect.

## Component Patterns

Buttons: Cyan primary `bg-primary text-primary-foreground glow-primary`, amber ghost `text-accent border-accent glow-accent` for achievements, glass-dark background for secondary actions  
Cards: `glass` or `glass-elevated` with border gradient, rounded-lg, neon glow shadow based on accent color  
Badges: Streak `bg-accent/20 text-accent rounded-full pulse-glow`, stat counters `counter-animate` on load  
Stat Cards: `glass-elevated glow-violet hover-lift`, number text with `gradient-text-mesh`

## Motion

Entrance: Fade-in cards via `fade-in` (0.3s ease-out), stat counters via `counter-animate` scale-up burst (0.8s)  
Idle: Gradient mesh background `gradient-shift` (8s smooth loop), stat glows `pulse-glow` (2s rhythm), floating icons `float-animate` (3s ease)  
Hover: Card `hover-lift` (4px up, glow-shadow), button `transition-smooth` with glow intensification  
Milestone: Confetti burst via `confetti` animation token on achievement unlock (2s ease-out with rotation)

## Constraints

Glass panels use 12-20px blur only; no backdrop-filter: none. Neon glows max 0.4 opacity at peak; no garish brightness. Gradient mesh only on dashboard background; no full-page saturation. Stat cards use counter-animate sparingly to avoid visual clutter. XP/achievement badges: locked state uses grayscale filter, unlocked uses full saturation + glow-accent. Confetti particles deploy only on milestone unlocks (level-up, achievements), never on routine actions.

## Signature Detail

Neon-glowing stat cards with electric violet/cyan glow shadows, animated number counters, and pulsing background gradient mesh create premium futuristic dashboard. Glassmorphism panels with subtle blur convey depth and sophistication; confetti particle bursts celebrate learning milestones.
