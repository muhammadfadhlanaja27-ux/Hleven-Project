---
name: H'leven
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
  on-surface-variant: '#434842'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#747871'
  outline-variant: '#c4c8bf'
  surface-tint: '#526350'
  primary: '#4f604d'
  on-primary: '#ffffff'
  primary-container: '#687965'
  on-primary-container: '#f7fff1'
  inverse-primary: '#b9ccb4'
  secondary: '#4c6549'
  on-secondary: '#ffffff'
  secondary-container: '#cce7c4'
  on-secondary-container: '#50694d'
  tertiary: '#8b4b2a'
  on-tertiary: '#ffffff'
  tertiary-container: '#a96240'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e8cf'
  primary-fixed-dim: '#b9ccb4'
  on-primary-fixed: '#101f10'
  on-primary-fixed-variant: '#3a4b39'
  secondary-fixed: '#ceeac7'
  secondary-fixed-dim: '#b3ceac'
  on-secondary-fixed: '#0a200a'
  on-secondary-fixed-variant: '#354d33'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb694'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#713618'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: Work Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-md:
    fontFamily: Work Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-margin: 40px
  gutter: 24px
---

## Brand & Style

This design system embodies a **Modern-Classical** aesthetic, blending the authority and timelessness of luxury hospitality with the functional efficiency of a professional SaaS platform. It is designed for internal super-admins who manage high-value hospitality partnerships, requiring a UI that feels calm, trustworthy, and sophisticated.

The style leverages **Minimalism** with a touch of **Tactile** warmth. It avoids the coldness of standard enterprise tools by utilizing a rich, organic color palette and high-contrast typography. The visual mood is editorial yet functional, prioritizing clarity and ease of use through generous whitespace and a clear structural hierarchy.

## Colors

The palette is rooted in earth-toned sophistication:
- **Primary (Sage):** Used for key actions, brand elements, and primary buttons. It evokes growth and stability.
- **Secondary (Soft Mint):** Used for subtle backgrounds, secondary container states, and hover effects.
- **Tertiary (Terracotta):** Reserved for warning states, critical alerts, and specific "Issue" actions to provide warmth without the aggression of pure red.
- **Neutral (Cream/Stone):** The foundation of the UI. `F9F6F1` serves as the primary page background, while slightly darker tones are used for cards and dividers.
- **Text:** Deep charcoal (`2D312C`) ensures high legibility against cream backgrounds, avoiding the harshness of pure black.

## Typography

This system uses a pairing of a literary serif for headers and a functional sans-serif for utility.

- **Libre Caslon Text (Headings):** Provides a premium, editorial feel. Use for page titles, section headers, and major numerical data (stats).
- **Work Sans (Body & Labels):** Offers exceptional legibility at small sizes. Used for all data tables, inputs, descriptions, and navigation elements.
- **Hierarchy:** Maintain a strong contrast between serif titles and sans-serif metadata. Labels should often use uppercase with increased tracking to differentiate from body text.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict side margins to maintain a centered, professional focus.

- **Grid:** 12-column system for desktop, 8-column for tablet, and 4-column for mobile.
- **Rhythm:** An 8px linear scale (base 4px for fine-tuning) governs all padding and margins. 
- **Card Spacing:** Use `md` (24px) or `lg` (32px) padding within cards to maintain the sense of "luxury" through whitespace.
- **Sectioning:** Vertical gaps between major dashboard blocks should use `xl` (48px) to allow the UI to breathe.

## Elevation & Depth

Hierarchy is achieved primarily through **Tonal Layers** and extremely subtle **Ambient Shadows**.

- **Surface Tiers:** The main page background is the lowest level (`Neutral`). Cards and containers sit on top of this, often sharing a similar hue but distinguished by a thin 1px border.
- **Shadows:** Use a "Soft Diffused" shadow: `0 4px 20px rgba(45, 49, 44, 0.04)`. Shadows should be almost imperceptible, felt rather than seen.
- **Interactivity:** On hover, cards may increase their shadow slightly or shift border color to the `Primary` sage tone.
- **Dividers:** Use 1px solid lines in the `Border` color for table rows and list items, ensuring horizontal rhythm without adding visual weight.

## Shapes

The design system utilizes **Soft** roundedness to balance professional rigor with approachability.

- **Standard Elements:** 4px (0.25rem) radius for buttons, input fields, and small tags.
- **Large Containers:** 8px (0.5rem) radius for main dashboard cards and modals.
- **Contextual Radii:** Status badges and "pills" may use a fully rounded (pill-shaped) radius to distinguish them from functional buttons.

## Components

- **Buttons:** 
    - *Primary:* Solid Sage background with white text.
    - *Secondary/Ghost:* Border only (1px Sage) or Transparent background with Sage text.
    - *Warning:* Solid Terracotta background for destructive or critical actions.
- **Input Fields:** Use a subtle Cream background with a 1px border. On focus, the border transitions to Sage. Use `Work Sans` for placeholder and input text.
- **Cards:** White or very light Cream background, 1px border (`E5E0D8`), and 8px corner radius. Headlines inside cards should be Serif.
- **Status Badges:** Use low-saturation background tints (e.g., light sage for "Approve", light amber for "Pending") with darker text of the same hue.
- **Data Tables:** Clear headers in `Label-MD` style. Row height should be generous (min 56px) with 1px dividers.
- **Activity Log:** Uses vertical lines and bullet points to show chronological flow, with a clear distinction between the "actor" (bold) and the "action" (regular).