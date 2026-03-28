# DESIGN REFERENCE — aawebtools.com
**Status:** Locked. Do not deviate from this document.  
**For:** GSD + Claude Code  
**Rule:** Every design decision here is final. No creative interpretation allowed.

---

## Design Identity

The design follows a clean, modern, light aesthetic — inspired by the clarity of **Linear.app** and **Vercel.com** but using a white/light background. This is not a corporate site. It is a tool site that feels premium, fast, and trusted.

Before writing any CSS or HTML, inspect these two references for visual patterns:
- https://linear.app (hero section, card components, typography weight)
- https://vercel.com (clean layouts, button styles, card design)

Do not copy their content. Copy only the visual feeling — clean white backgrounds, crisp typography, electric blue accents, subtle shadows.

---

## Color Values — Exact Hex Codes

These are locked. Do not substitute, approximate, or "improve" them.

```
Background primary:    #ffffff
Background secondary:  #f8fafc
Background tertiary:   #f1f5f9
Background card:       #ffffff

Tool interface bg:     #f8fafc
Tool interface secondary: #f1f5f9
Tool interface border: #e2e8f0
Tool interface text:   #0f172a
Tool interface muted:  #64748b

Accent blue:           #4f7fff
Accent blue hover:     #6b94ff
Accent blue glow:      rgba(79, 127, 255, 0.15)
Accent green:          #10b981
Accent red:            #ef4444
Accent yellow:         #f59e0b

Text primary:          #0f172a
Text secondary:        #64748b
Text tertiary:         #94a3b8

Border primary:        #e2e8f0
Border secondary:      #cbd5e1
```

---

## Typography — Exact Specifications

Font: **Inter** from Google Fonts only. No other fonts.
Weights used: 400, 500, 600, 700 only.

```
Hero H1:         60px / 700 / line-height 1.1 / letter-spacing -0.02em
Section H2:      36px / 600 / line-height 1.2 / letter-spacing -0.01em
Card H3:         18px / 600 / line-height 1.3
Body text:       16px / 400 / line-height 1.6
Small text:      14px / 400 / line-height 1.5
Caption:         12px / 500 / line-height 1.4 / letter-spacing 0.05em
Button:          14px / 600 / line-height 1.0 / letter-spacing 0.01em
Section label:   11px / 600 / line-height 1.0 / letter-spacing 0.12em / UPPERCASE

Mobile H1:       36px / 700 / line-height 1.15
Mobile H2:       26px / 600 / line-height 1.25
```

---

## Page Layout — Exact Measurements

```
Max content width:    1200px (centered with auto margin)
Page horizontal pad:  24px mobile / 48px tablet / 80px desktop
Section vertical pad: 80px mobile / 120px desktop
Tool card max-width:  800px (invoice/paystub: 960px)
Tool card padding:    24px mobile / 40px desktop
Tool card radius:     16px
Sidebar ad width:     300px (desktop only, hidden below 1024px)
```

---

## Page Structure — Every Page

Every page has exactly this structure in this order:
1. `<head>` with all meta tags (see PRD Section 3.1 for exact template)
2. `<nav>` sticky navigation
3. `<main>` with page-specific content
4. `<footer>`
5. Ad scripts (last, async)
6. Analytics script (async)

No exceptions to this order.

---

## Hero Section — Exact Spec

```
Background:     var(--bg-primary) with gradient-glow overlay
                gradient-glow = radial-gradient(ellipse at 50% 0%,
                rgba(79,127,255,0.06) 0%, transparent 70%)
Height:         min-height 100vh desktop / auto mobile
Content:        vertically centered using flexbox
Alignment:      center horizontal
```

Content order inside hero (desktop and mobile):
1. Section label (uppercase, accent-blue, letter-spacing wide)
2. H1 (max-width 800px, centered)
3. Subheading paragraph (max-width 600px, centered, color: text-secondary)
4. Button group (flex row, gap 12px, centered)
5. Trust badges row (flex, gap 24px, centered, font-size 13px)

Button group specs:
- Primary button: filled accent-blue, border-radius 999px, padding 14px 28px
- Ghost button: transparent bg, border 1.5px solid border-secondary, same padding
- Gap between buttons: 12px

Trust badges: "✓ No Login" | "✓ Free Forever" | "✓ Works Worldwide"
Color: text-tertiary. Separator: thin vertical line 1px border-secondary.

---

## Navigation — Exact Spec

```
Position:       fixed top 0, full width, z-index 1000
Height:         64px
Background:     rgba(255, 255, 255, 0.90) with backdrop-filter: blur(12px)
Border bottom:  1px solid #e2e8f0
Padding:        0 48px desktop / 0 24px mobile
```

Left: Logo (SVG, dark text "AAWebTools", accent-blue dot before "AA")
Center (desktop only): Navigation links with dropdown
Right: Language toggle (EN | FR pill) + CTA button (small, primary)

Navigation link style:
- Default: color text-secondary, font-size 14px, font-weight 500
- Hover: color text-primary, transition 150ms
- Active page: color accent-blue

Dropdown:
- Background: bg-secondary
- Border: 1px solid border-primary
- Border-radius: 10px
- Padding: 8px
- Box-shadow: 0 8px 32px rgba(0,0,0,0.08)
- Opens on hover (desktop), on click (mobile)

Mobile hamburger:
- Visible below 1024px
- Opens full-width overlay from top
- Background: bg-primary
- All links stacked vertically, 48px each

---

## Tool Cards — Homepage Grid

```
Grid:           3 columns desktop / 2 tablet / 1 mobile
Gap:            20px
Card bg:        bg-secondary
Card border:    1px solid border-primary
Card radius:    16px
Card padding:   24px
Card min-height: 200px
Transition:     all 250ms ease
```

Hover state (EXACT):
```css
transform: translateY(-2px);
border-color: var(--accent-blue);
box-shadow: 0 8px 32px rgba(79, 127, 255, 0.1);
```

Card content order:
1. Top row: Category badge (left) + Tool badge if exists (right)
2. Icon area: 40px × 40px SVG icon, margin-bottom 16px
3. H3 tool title
4. Description paragraph (2 lines max, overflow ellipsis)
5. "Use Tool →" link (accent-blue, bottom of card, font-size 14px)

Category badge style: 
- Background: accent-blue at 10% opacity
- Text: accent-blue
- Border-radius: 999px
- Padding: 3px 10px
- Font-size: 11px
- Font-weight: 600

---

## Tool Interface Card — All Tool Pages

This is the card that contains the actual tool:

```
Background:     #f8fafc
Border:         1px solid #e2e8f0
Border-radius:  16px
Box-shadow:     0 4px 24px rgba(0,0,0,0.06)
Padding:        40px desktop / 24px mobile
Max-width:      800px (invoice/paystub: 960px)
Margin:         0 auto
Position:       relative, sits on page bg
```

The tool card is placed in a section (bg-primary) with 80px vertical padding above and below.

Input fields inside tool card:
```
Background:     #f8fafc
Border:         1.5px solid #e2e8f0
Border-radius:  10px
Padding:        14px 16px
Font-size:      16px
Color:          #0f172a
Width:          100%
Transition:     border-color 150ms ease

Focus state:
  border-color: #4f7fff
  box-shadow: 0 0 0 3px rgba(79,127,255,0.15)
  outline: none
```

Primary button inside tool card:
```
Background:     #4f7fff
Color:          #ffffff
Border-radius:  10px (NOT full pill — square-ish inside cards)
Padding:        14px 24px
Font-size:      16px
Font-weight:    600
Width:          100%
Margin-top:     16px
Transition:     all 150ms ease

Hover:
  background: #6b94ff
  transform: translateY(-1px)
  box-shadow: 0 4px 20px rgba(79,127,255,0.35)
```

---

## Animation Specifications

All animations are CSS-only. Zero JavaScript animation libraries.

**Scroll reveal:**
Elements start at: `opacity: 0; transform: translateY(20px);`
Elements end at: `opacity: 1; transform: translateY(0);`
Transition: `opacity 600ms ease, transform 600ms ease`
Triggered by: Intersection Observer in core.js

Add class `reveal` to any element that should animate on scroll.
core.js adds class `revealed` when element enters viewport.

```css
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 600ms ease, transform 600ms ease;
}
.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
```

**Background floating particles (hero only):**
12 small dots (4px × 4px, border-radius 50%).
Color: rgba(79, 127, 255, 0.08)
Each moves on a slow infinite path using CSS @keyframes.
Movement range: ±30px in any direction.
Duration: 8–15 seconds each (staggered with animation-delay).
Must not cause CLS — use position: absolute, pointer-events: none.
Contained within the hero section (overflow: hidden on hero).

**Loading spinner (tool processing state):**
CSS-only spinner: 24px circle, border 3px solid rgba(79,127,255,0.2), 
border-top-color: #4f7fff, animation: spin 800ms linear infinite.
No GIF. No library.

**Reduced motion rule — MANDATORY:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Footer — Exact Spec

```
Background:     bg-secondary
Border-top:     1px solid border-primary
Padding:        64px 80px 32px (desktop) / 48px 24px 24px (mobile)
```

Three equal columns (desktop) / stacked (mobile):

Column 1:
- Logo (same as nav)
- Tagline: "Free tools for everyone, worldwide" (text-secondary, 14px)
- Copyright: "© 2026 AAWebTools. All rights reserved." (text-tertiary, 12px)

Column 2 heading: "Tools" (text-primary, 13px, font-weight 600, uppercase, letter-spacing 0.1em)
Links: All 6 tool names, text-secondary, 14px, hover: text-primary

Column 3 heading: "Legal" (same style)
Links: Privacy Policy, Terms of Service

Bottom bar (below 3 columns, separated by 1px border-primary):
"Made with ❤️ | Free forever | No signup required"
Centered, text-tertiary, 13px, padding 24px 0 0

---

## 404 Page

Light page (bg-primary). Centered content.

```
"404" text:     120px / 700 / color: accent-blue / opacity 0.3
Heading:        "Page not found" / 32px / 600 / text-primary
Subtext:        "This page doesn't exist. Try one of our free tools:" / text-secondary
Below text:     Tool cards grid (same as homepage grid, show all 6 tools)
```

---

## Icon System

All icons are inline SVGs. No icon library. No FontAwesome. No Heroicons.

Each tool has one icon (32px × 32px SVG):
- TikTok downloader: play arrow inside circle
- Twitter downloader: down arrow with horizontal line
- Invoice generator: document with lines
- AI detector: magnifying glass with circuit pattern
- AI humanizer: text cursor with sparkle
- Pay stub generator: document with dollar sign

Icons are accent-blue (#4f7fff) on tool cards.
Icons are tool-text (#0f172a) inside the white tool cards.

---

## Responsive Breakpoints

```
Mobile:   0–639px
Tablet:   640px–1023px  
Desktop:  1024px+
Large:    1280px+
```

Build mobile-first. All styles default to mobile. Use min-width media queries to add desktop styles.

---

## What NOT to Do

- Do NOT add any design elements not specified in this document
- Do NOT use Bootstrap, Tailwind, or any CSS framework
- Do NOT use gradients anywhere except the hero glow and bg-gradient-hero
- Do NOT add images (photos, illustrations) — icons and CSS shapes only
- Do NOT add any third-party UI components
- Do NOT add scroll progress bars, cursor effects, or particle.js
- Do NOT use box-shadows on more than 3 elements per page
- Do NOT use more than 2 font weights in any single component
- Do NOT add hover animations to text links inside tool cards (only the card itself animates)
