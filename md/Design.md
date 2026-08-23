---
name: H'Leven
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#444842'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#747871'
  outline-variant: '#c4c8bf'
  surface-tint: '#52634f'
  primary: '#50604d'
  on-primary: '#ffffff'
  primary-container: '#687965'
  on-primary-container: '#f7fff1'
  inverse-primary: '#baccb4'
  secondary: '#4c6549'
  on-secondary: '#ffffff'
  secondary-container: '#cbe7c4'
  on-secondary-container: '#50694d'
  tertiary: '#615b54'
  on-tertiary: '#ffffff'
  tertiary-container: '#7a736c'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e8cf'
  primary-fixed-dim: '#baccb4'
  on-primary-fixed: '#111f10'
  on-primary-fixed-variant: '#3b4b39'
  secondary-fixed: '#ceeac7'
  secondary-fixed-dim: '#b3ceac'
  on-secondary-fixed: '#0a200a'
  on-secondary-fixed-variant: '#354d33'
  tertiary-fixed: '#eae1d8'
  tertiary-fixed-dim: '#cec5bc'
  on-tertiary-fixed: '#1f1b16'
  on-tertiary-fixed-variant: '#4b463f'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is centered on a **Premium Hospitality** narrative, specifically tailored for B2B partner onboarding. The brand personality is welcoming yet authoritative, bridging the gap between high-end aesthetic appeal and professional functional utility. It aims to evoke a sense of trust, tranquility, and exclusivity.

The visual style is a blend of **Modern Corporate** and **Minimalism**. It utilizes expansive whitespace and a nature-inspired palette to create a "breathable" interface. While the consumer-facing side may lean into romantic serifs, this partner portal prioritizes clarity and efficiency through structured layouts and refined sans-serif typography, maintaining luxury through subtle details rather than decorative excess.

## Colors

The palette is derived from an organic, earthy spectrum that signals growth and stability.

- **Primary (Deep Olive):** Used for primary actions, active states, and key navigational elements. It provides the grounding "professional" weight to the UI.
- **Secondary (Sage):** Employed for accents, success states, and illustrative backgrounds.
- **Tertiary (Creamy Beige):** Used for container backgrounds, secondary buttons, and subtle grouping of information.
- **Neutral (Off-white):** The primary canvas color, chosen to be softer on the eyes than pure white, enhancing the premium feel.
- **Status Colors:** Use muted versions of standard status colors (e.g., a dusty terracotta for errors) to ensure they do not clash with the natural palette.

## Typography

Typography balances the geometric strength of **Montserrat** for headings with the contemporary precision of **Hanken Grotesk** for UI and body text. 

- **Headlines:** Set in Montserrat with slightly tighter letter-spacing for a modern, confident look. Use `display-lg` sparingly for hero sections or onboarding welcome screens.
- **Body:** Hanken Grotesk provides high legibility for data-heavy onboarding forms and documentation. 
- **Labels:** Small labels and overlines should use a slightly increased letter-spacing and uppercase styling to provide clear hierarchy in complex forms.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile. 

- **Generous Whitespace:** To maintain the "Luxurious" feel, vertical spacing between major sections (`stack-lg`) is prioritized to prevent the partner portal from feeling like a cluttered administrative tool.
- **Alignment:** Content is typically centered within a max-width container for marketing-style pages, while dashboard views utilize a left-aligned sidebar navigation model with a fluid content area.
- **Gutters:** Standardized 24px gutters ensure breathing room between card-based layouts.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** supplemented by very soft **Ambient Shadows**.

- **Level 0 (Base):** The `neutral-off-white` background.
- **Level 1 (Cards):** Pure white surfaces with a subtle 1px border in `tertiary` or an extremely diffused shadow (0px 4px 20px rgba(0,0,0,0.04)).
- **Level 2 (Dropdowns/Modals):** High-elevation surfaces with more pronounced shadows to indicate they are floating above the workflow.
- **Interaction:** Hover states on interactive cards should see a slight increase in shadow depth and a subtle upward shift (-2px) to provide tactile feedback.

## Shapes

The shape language is consistently **Rounded**, reflecting a friendly and modern hospitality vibe.

- **Standard Radius:** 8px (0.5rem) is the default for input fields, buttons, and small components.
- **Large Radius:** 16px (1rem) is used for main content cards and imagery to soften the overall appearance of the dashboard.
- **Buttons:** Maintain the 8px radius; avoid fully pill-shaped buttons to keep the "Professional B2B" tone, unless used for secondary tags/chips.

## Components

- **Buttons:** 
    - *Primary:* Deep Olive background, white text, 8px radius. High-contrast and bold.
    - *Secondary:* Transparent with Deep Olive border or Creamy Beige background.
- **Input Fields:** 
    - Use "Floating Label" style or clear top-aligned labels. 
    - Backgrounds should be pure white to pop against the off-white page background. 
    - 1px border in `tertiary`, changing to `primary` on focus.
- **Cards:** 
    - White background, 16px corner radius, subtle 1px border. 
    - Used to group onboarding steps, property details, or analytics snippets.
- **Onboarding Progress Bar:** 
    - A thin, elegant tracker using Sage for completed steps and Deep Olive for the active state.
- **Chips/Badges:** 
    - Used for status (e.g., "Pending Approval," "Verified"). 
    - Use low-saturation background tints of the status color with darker text for readability.
- **Lists:**
    - High-density lists should include subtle dividers in `tertiary` and generous horizontal padding (16px-24px).