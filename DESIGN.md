---
name: HorizonPay
description: Verified receivables funding marketplace on Stellar - Cold, luminous, credible financial interface
colors:
  primary: "#5cf6ff"
  primary-deep: "#0087b7"
  secondary: "#d8ff8f"
  background: "#030706"
  background-elevated: "#05100f"
  background-glass: "#040e0f"
  foreground: "#f4fff8"
  foreground-muted: "#ffffff52"
  foreground-subtle: "#ffffff36"
  glass-border: "#ffffff1f"
  cyan-subtle: "#00d2ef"
  lime-subtle: "#9de500"
  rose-accent: "#ff667f"
  amber-accent: "#fcbb00"
  emerald-accent: "#00d294"
  red-accent: "#ff6568"
typography:
  fontFamily: "Manrope, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif"
  fontFamilyMono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace"
  display:
    fontFamily: "Manrope"
    fontSize: "clamp(2.5rem, 6vw + 1rem, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Manrope"
    fontSize: "clamp(2rem, 5vw + 0.5rem, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Manrope"
    fontSize: "clamp(1.5rem, 4vw + 0.25rem, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.1
  body:
    fontFamily: "Manrope"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.005em"
  label:
    fontFamily: "Manrope"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.18em"
    textTransform: "uppercase"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  2xl: "1.5rem"
  card: "28px"
spacing:
  xs: "0.75rem"
  sm: "0.875rem"
  base: "1rem"
  lg: "1.125rem"
  xl: "1.25rem"
  2xl: "1.5rem"
  3xl: "1.875rem"
  4xl: "2.25rem"
  5xl: "3rem"
  6xl: "3.75rem"
  7xl: "4.5rem"
  8xl: "6rem"
shadows:
  glass: "inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 8px 16px rgba(0, 0, 0, 0.46), 0 0 8px rgba(43, 210, 255, 0.08)"
  glow: "0 0 8px rgba(92, 246, 255, 0.15)"
  deep: "0 18px 70px rgba(0, 0, 0, 0.58), 0 0 56px rgba(43, 210, 255, 0.1)"
components:
  card-glass:
    backgroundColor: "{colors.background-glass}"
    borderColor: "{colors.glass-border}"
    borderRadius: "{rounded.card}"
    padding: "1.5rem"
    backdropFilter: "blur(16px) saturate(140%)"
    boxShadow: "{shadows.glass}"
  card-solid:
    backgroundColor: "{colors.background-elevated}"
    borderRadius: "{rounded.card}"
    padding: "1.5rem"
  section-label:
    backgroundColor: "transparent"
    textColor: "{colors.cyan-subtle}"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.18em"
    textTransform: "uppercase"
    padding: "0.5rem 1rem"
    borderRadius: "9999px"
    border: "1px solid {colors.glass-border}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    fontWeight: 600
    padding: "0.75rem 1.5rem"
    borderRadius: "{rounded.lg}"
    transition: "all 0.2s ease"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    border: "1px solid {colors.glass-border}"
    fontWeight: 600
    padding: "0.75rem 1.5rem"
    borderRadius: "{rounded.lg}"
  input:
    backgroundColor: "{colors.background-elevated}"
    borderColor: "{colors.glass-border}"
    textColor: "{colors.foreground}"
    borderRadius: "{rounded.lg}"
    padding: "0.75rem 1rem"
---

## Overview

HorizonPay establishes a cold, luminous, credible financial interface with a glacier/galaxy aesthetic. The design system uses near-black backgrounds (#030706) with cyan (#5cf6ff) and lime (#d8ff8f) accents, evoking both the vastness of space and the clarity of ice. Glassmorphism is used with restraint through backdrop-blur panels with subtle borders, creating depth without visual clutter.

The interface prioritizes verification and trust: every surface communicates that businesses, debtors, and investors are verified. Product-specific visuals (Offer cards, terminal objects, orbital networks) map directly to actual product mechanics rather than abstract decoration.

## Colors

### Palette Strategy: Committed

The HorizonPay palette uses a **Committed** strategy where cyan (#5cf6ff) carries 30-60% of the accent surface area, supported by lime (#d8ff8f) for secondary emphasis. The near-black background (#030706) provides maximum contrast for the luminous accents.

| Role | Color | Usage |
|------|-------|-------|
| Primary (Ice Cyan) | `#5cf6ff` | CTAs, highlights, interactive states |
| Primary Deep | `#0087b7` | Hover states, borders |
| Secondary (Ice Lime) | `#d8ff8f` | Secondary highlights, success states |
| Background | `#030706` | Page canvas |
| Background Elevated | `#05100f` | Cards, surfaces |
| Background Glass | `#040e0f` | Glass panels (with opacity) |
| Foreground | `#f4fff8` | Body text |
| Foreground Muted | `#ffffff52` | Secondary text, placeholders |
| Foreground Subtle | `#ffffff36` | Tertiary text, hints |

### Glass Surfaces

Glass panels use layered backgrounds:
- Base: `rgba(4, 14, 15, 0.64)` with `backdrop-filter: blur(16px) saturate(140%)`
- Gradient overlay: `linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.025))`
- Border: `1px solid rgba(255, 255, 255, 0.12)`
- Shadow: Three-layer shadow for depth

### Color Usage Rules

- **Never** use warm colors (orange, brown, gold) - explicitly rejected in anti-references
- **Never** use purple/pink gradient crypto themes
- **Avoid** generic SaaS cream/beige
- Cyan and lime are the only accent colors
- Glass surfaces must maintain 4.5:1 contrast ratio for text

## Typography

### Font Stack

Primary typeface: **Manrope** - A distinctive geometric sans-serif that replaces the overused Inter. Manrope provides excellent readability at all sizes with a technical, slightly condensed feel that matches the "cold, luminous, credible" brand personality.

```
--font-sans: var(--font-manrope, ui-sans-serif, system-ui, -apple-system, ...)
--font-mono: var(--font-geist-mono)
```

### Type Scale

| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Display (H1) | `clamp(2.5rem, 6vw + 1rem, 4.5rem)` | 600 | 1.1 | -0.02em | Hero headings |
| Headline (H2) | `clamp(2rem, 5vw + 0.5rem, 3.5rem)` | 600 | 1.1 | -0.02em | Section headings |
| Title (H3) | `clamp(1.5rem, 4vw + 0.25rem, 2.25rem)` | 600 | 1.1 | normal | Subsection headings |
| Body | `1rem` | 400 | 1.6 | 0.005em | Paragraphs |
| Lead | `1.25rem` | 400 | 1.5 | normal | Intro text |
| Label | `0.75rem` | 700 | 1 | 0.18em | Section labels, badges |
| Small | `0.875rem` | 400 | 1.5 | normal | Captions |

### Special Text Treatments

- **Section Labels**: Uppercase, tracked at 0.18em, cyan color (#00d2ef at 60-100% opacity)
- **Ice Gradient (deprecated)**: Previously used cyan-to-lime gradient text, now replaced with solid `#5cf6ff` with subtle text-shadow
- **Code/Monospace**: Geist Mono for technical content

### Readability

- Light text on dark backgrounds uses slightly increased line-height (1.6 for body)
- Body text max-width: 65ch for optimal readability
- `text-wrap: balance` on h1-h3 for even line lengths
- `text-wrap: pretty` on long prose to reduce orphans

## Elevation

HorizonPay uses **glassmorphism + layered shadows** for elevation, not traditional z-index stacking or drop shadows alone.

### Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Glass Shadow | `inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 8px 16px rgba(0, 0, 0, 0.46), 0 0 8px rgba(43, 210, 255, 0.08)` | Glass panels |
| Glow Shadow | `0 0 8px rgba(92, 246, 255, 0.15)` | Hover states |
| Deep Shadow | `0 18px 70px rgba(0, 0, 0, 0.58), 0 0 56px rgba(43, 210, 255, 0.1)` | Sticky navigation |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| Cards | `28px` | All card components |
| Large | `1rem` | Modals, large containers |
| Medium | `0.75rem` | Inputs, buttons |
| Small | `0.5rem` | Badges, small elements |
| Tiny | `0.375rem` | Subtle rounding |

**Note**: The 28px card radius is intentional for the brand aesthetic, exceeding the typical 12-16px recommendation because it supports the "cold, luminous" glass/galaxy concept.

### Z-Index Scale (Semantic)

| Layer | Value | Usage |
|-------|-------|-------|
| Background | 0 | Galaxy, aurora fields |
| Content | 2 | Main content sections |
| Navigation | 50 | Sticky nav shell |
| Dropdown | 100 | Modal backdrops |
| Modal | 101 | Modal content |
| Toast | 102 | Notifications |
| Tooltip | 103 | Tooltips |

## Components

### Card System

**Glass Card** (primary variant):
- Background: Glass panel with blur backdrop
- Border: 1px solid rgba(255, 255, 255, 0.12)
- Radius: 28px
- Shadow: Glass shadow
- Padding: Responsive (p-4 sm:p-5, p-6 sm:p-8, p-6 sm:p-8 lg:p-10)

**Solid Card**:
- Background: Elevated background (#05100f)
- Radius: 28px
- No border

### Border Glow

Interactive card wrapper with animated mesh gradient borders:
- Default colors: Purple (#c084fc), Pink (#f472b6), Blue (#38bdf8)
- Hover-triggered conical gradient reveal
- Outer glow with HSL-based box-shadow
- Customizable: glowColor, glowRadius, glowIntensity, colors

### Section Label

Standardized section header:
- Text: 11px, bold (700), uppercase
- Tracking: 0.18em
- Color: Cyan (#00d2ef) at 60-100% opacity
- Background: Transparent with subtle border
- Padding: 0.5rem 1rem
- Radius: Full pill (9999px)

### Button Variants

**Primary**: Cyan background (#5cf6ff), black text (#03100e)
**Secondary**: Transparent with glass border
**Ghost**: Text only with hover state

### Status Badges

- Onchain: Cyan variants
- Network: Network-specific colors
- Wallet Address: Truncated with copy button

### Navigation

Sticky glass navigation with:
- Glass panel background on scroll
- Site mark (cyan border, cyan-ice background)
- Site name with normal letter-spacing
- Links with cyan-ice color at 62% opacity

## Do's and Don'ts

### Do

✅ **Use Manrope** - The distinctive typeface that replaces Inter
✅ **Use cyan and lime only** - These are the brand's cold, luminous accents
✅ **Use glassmorphism purposefully** - With restraint, for depth and credibility
✅ **Product-specific visuals** - Every decorative element should map to real product mechanics (Offers, verification, repayment)
✅ **Maintain 4.5:1 contrast** - Especially on glass surfaces with backdrop blur
✅ **Use fluid typography** - clamp() for responsive heading scales
✅ **Use semantic z-index** - Never arbitrary values like 999 or 9999
✅ **Respect reduced motion** - All animations must have prefers-reduced-motion alternatives

### Don't

❌ **Use Inter** - Replaced with Manrope to avoid AI convergence
❌ **Use gradient text** - Replaced with solid cyan (#5cf6ff) or lime (#d8ff8f) colors
❌ **Use warm colors** - No orange, brown, gold - explicitly anti-reference
❌ **Use purple/pink gradients** - Anti-reference for crypto clichés
❌ **Use side-stripe borders** - No colored left/right borders on cards
❌ **Use ghost-card pattern** - Don't combine 1px border with 16px+ blur shadow
❌ **Use over-rounded cards** - 28px is the max for this brand (intentional exception)
❌ **Use sketchy illustrations** - All decorative objects should be product-mechanic based

### Component-Specific

❌ **Don't use border-b-2** on rounded elements - use 1px borders or background accents
✅ **Do use Card component** - Instead of raw divs with glass classes
✅ **Do use SectionLabel** - For consistent section headers
✅ **Do use BorderGlow** - For interactive cards with animated borders
