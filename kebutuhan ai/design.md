---
name: H'Leven Authority
colors:
  surface: '#f8faf8'
  surface-dim: '#d9dad9'
  surface-bright: '#f8faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f2'
  surface-container: '#edeeec'
  surface-container-high: '#e7e8e7'
  surface-container-highest: '#e1e3e1'
  on-surface: '#191c1b'
  on-surface-variant: '#434842'
  inverse-surface: '#2e3130'
  inverse-on-surface: '#eff1ef'
  outline: '#747872'
  outline-variant: '#c4c8c0'
  surface-tint: '#526351'
  primary: '#4f604f'
  on-primary: '#ffffff'
  primary-container: '#677967'
  on-primary-container: '#f7fff2'
  inverse-primary: '#b9ccb6'
  secondary: '#4e644b'
  on-secondary: '#ffffff'
  secondary-container: '#d1eac9'
  on-secondary-container: '#546a50'
  tertiary: '#625b51'
  on-tertiary: '#ffffff'
  tertiary-container: '#7c7369'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e8d2'
  primary-fixed-dim: '#b9ccb6'
  on-primary-fixed: '#101f11'
  on-primary-fixed-variant: '#3a4b3b'
  secondary-fixed: '#d1eac9'
  secondary-fixed-dim: '#b5cdae'
  on-secondary-fixed: '#0c200c'
  on-secondary-fixed-variant: '#374c34'
  tertiary-fixed: '#ece1d4'
  tertiary-fixed-dim: '#cfc5b9'
  on-tertiary-fixed: '#201b13'
  on-tertiary-fixed-variant: '#4d463d'
  background: '#f8faf8'
  on-background: '#191c1b'
  surface-variant: '#e1e3e1'
  surface-warm: '#F9F6F1'
  surface-white: '#FFFFFF'
  status-pending: '#DED3C7'
  status-active: '#768875'
  status-error: '#A65A3D'
  border-subtle: '#E5E0D8'
typography:
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  button-text:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 24px
  gutter: 24px
  card-padding: 24px
  sidebar-width: 260px
  header-height: 72px
  section-gap: 32px
  component-gap: 16px
---

## Brand & Style

This design system is engineered for the **H'Leven Super Admin portal**, targeting high-level hospitality executives and system administrators. The brand personality is **distinguished, architectural, and authoritative**. It balances the premium nature of luxury hospitality with the rigorous organizational needs of enterprise management.

The visual style is a hybrid of **Corporate Modern** and **Minimalist Editorial**. It utilizes a sophisticated "Quiet Luxury" aesthetic—relying on generous whitespace, high-quality serif typography, and a nature-inspired palette to evoke a sense of calm control. The interface should feel less like a dense software tool and more like a digital concierge for the entire hotel network.

Key pillars include:
- **Trust:** Established through sturdy serif headings and a grounded charcoal foundation.
- **Clarity:** Achieved via strict grid alignment and prioritized information density.
- **Sophistication:** Conveyed through muted, harmonious color transitions and soft elevation.

## Colors

The palette is derived from natural, organic tones that suggest stability and premium quality.

- **Primary (#768875):** A muted sage green used for primary actions, success states, and brand reinforcement.
- **Secondary (#A2BA9C):** A softer green for supportive UI elements, hover states, and iconography backgrounds.
- **Tertiary/Accents (#DED3C7):** A warm taupe used for subtle badges, secondary surfaces, and non-critical status indicators.
- **Neutral (#2F3231):** A deep charcoal for high-contrast typography and navigation backgrounds.
- **Backgrounds:** The interface uses an off-white warm wash (`#F9F6F1`) to reduce eye strain and provide a more "literary" feel than pure white. Content resides on pure white cards.

## Typography

This system employs a high-contrast typographic pairing to signal the "Super Admin" hierarchy.

- **Headlines:** Use **Newsreader**. This serif font provides a literary, authoritative feel to the dashboard. Headlines should have tighter letter-spacing to maintain a modern editorial look.
- **Body & UI:** Use **Hanken Grotesk**. A sharp, contemporary sans-serif that ensures maximum legibility for data tables, form inputs, and small labels.
- **Utility:** Use uppercase labels with increased tracking (letter spacing) for table headers and section overlines to differentiate them from interactive body text.

## Layout & Spacing

The layout uses a **fixed-fluid hybrid grid** model optimized for high-resolution administrative workflows.

- **Structure:** A fixed left sidebar (deep charcoal) and a fixed top header (warm taupe/white) frame the content area.
- **Grid:** A 12-column system is used within the main content area. Standard dashboard cards should span 3 columns (quarter-width) or 6 columns (half-width). Large data tables and charts span the full 12 columns.
- **Spacing Rhythm:** A base-8 unit is used. Standard padding for cards and sections is **24px** (3 units), ensuring a generous, airy feel that prevents information overload.
- **Responsive Behavior:** 
  - **Desktop (1200px+):** Full 12-column grid.
  - **Tablet (768px - 1199px):** Sidebar collapses to icons only; 24px margins remain.
  - **Mobile (<767px):** Sidebar moves to a hidden "hamburger" menu; layout becomes a single-column stack with 16px horizontal margins.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**.

- **Level 0 (Background):** `#F9F6F1` (Warm wash).
- **Level 1 (Main Cards):** Pure `#FFFFFF` surfaces. These utilize a very soft, diffused shadow: `0 4px 20px rgba(47, 50, 49, 0.06)`.
- **Level 2 (Modals/Overlays):** Pure `#FFFFFF` surfaces with a more pronounced shadow: `0 12px 40px rgba(47, 50, 49, 0.12)`.
- **Interactions:** Buttons shift elevation on hover, increasing shadow depth slightly or darkening the primary color by 10%.

Avoid heavy borders; use light shadows or the `#E5E0D8` border color for separation between data table rows and input fields.

## Shapes

The shape language is **refined and approachable**.

- **Cards & Containers:** Use a consistent `0.5rem` (8px) radius for a professional, "modern corporate" look.
- **Buttons & Inputs:** Align with the `0.5rem` radius for a cohesive rectangular language.
- **Badges/Chips:** Use **Pill-shaped** (fully rounded) corners. This distinguishes them as non-structural, purely informational status indicators.
- **Icon Containers:** Use `rounded-lg` (16px) or circles to soften the technical nature of data cards.

## Components

### Buttons
- **Primary:** Background `#768875`, text `#FFFFFF`, 8px radius. High-emphasis actions.
- **Secondary:** Transparent background, Border `1px solid #768875`, text `#768875`.
- **Ghost/Tertiary:** No border, text `#2F3231` with subtle grey hover state.

### Cards
- **Structure:** White background, 24px padding, 8px radius, subtle shadow.
- **Header:** Include a Newsreader Headline (sm) and often a small icon in the top right for summary cards.

### Badges (Status)
- **Pill-shaped.** Use background tints of the status color (e.g., light green background with dark green text for "Active").
- **Font:** `label-md` (All caps, small).

### Inputs & Tables
- **Inputs:** 1px border (`#E5E0D8`), white background, 8px radius. Labels in `label-md` placed above the input.
- **Tables:** No vertical borders. Horizontal dividers only (`#E5E0D8`). Header row uses `label-md` typography and a light taupe background (`#F9F6F1`).

### Navigation
- **Sidebar:** Deep charcoal (`#2F3231`) background. Active links use a left-edge green accent line and white text. Inactive links use 60% opacity white.