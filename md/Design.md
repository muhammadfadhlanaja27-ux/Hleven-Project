---
name: Heritage Hospitality Admin
colors:
  surface: '#fcf9f5'
  surface-dim: '#dcdad6'
  surface-bright: '#fcf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ef'
  surface-container: '#f0ede9'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e5e2de'
  on-surface: '#1c1c1a'
  on-surface-variant: '#444840'
  inverse-surface: '#31302e'
  inverse-on-surface: '#f3f0ec'
  outline: '#757870'
  outline-variant: '#c4c8be'
  surface-tint: '#53634a'
  primary: '#506147'
  on-primary: '#ffffff'
  primary-container: '#69795f'
  on-primary-container: '#f8ffee'
  inverse-primary: '#baccad'
  secondary: '#52634e'
  on-secondary: '#ffffff'
  secondary-container: '#d2e5cb'
  on-secondary-container: '#566752'
  tertiary: '#8f482c'
  on-tertiary: '#ffffff'
  tertiary-container: '#ad6042'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e8c8'
  primary-fixed-dim: '#baccad'
  on-primary-fixed: '#111f0b'
  on-primary-fixed-variant: '#3b4b33'
  secondary-fixed: '#d5e8cd'
  secondary-fixed-dim: '#b9ccb2'
  on-secondary-fixed: '#101f0f'
  on-secondary-fixed-variant: '#3a4b38'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370d00'
  on-tertiary-fixed-variant: '#743419'
  background: '#fcf9f5'
  on-background: '#1c1c1a'
  surface-variant: '#e5e2de'
  sidebar-bg: '#2D312C'
  sidebar-text: '#D1D5D1'
  cream-surface: '#F2EBE1'
  text-main: '#2D312C'
  text-muted: '#6B6E6A'
  border-subtle: '#E5E1DA'
  status-success: '#6D7E63'
  status-warning: '#D48C45'
  status-error: '#9B5235'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base-unit: 4px
  container-margin: 32px
  gutter-lg: 24px
  gutter-md: 16px
  card-padding: 24px
  sidebar-width: 260px
  sidebar-collapsed: 80px
---

## Brand & Style

This design system is built for the **H'Leven Admin Hotel dashboard**, a tool designed for operational excellence in hospitality management. The brand personality is **sophisticated, organic, and authoritative**. It balances the high-end boutique feel of a luxury hotel with the precise, functional requirements of an administrative powerhouse.

The visual style is a blend of **Minimalism and Tonal Layering**. It leverages a high-end editorial aesthetic through classical serif typography and a nature-inspired color palette. The UI avoids harsh digital blacks, opting instead for deep charcoals and warm creams to create a calm, professional environment that reduces eye strain during long operational shifts.

**Design Principles:**
- **Refinement over Flash:** Use subtle depth and intentional white space rather than aggressive gradients or animations.
- **Trust through Clarity:** Information hierarchy is strictly enforced through typographic scale.
- **Tactile Softness:** Elements feel approachable with soft radii, mimicking the physical comfort of a hotel environment.

## Colors

The palette is anchored in **Olive Green (#6D7E63)** and **Warm Cream (#F8F5F1)**. This combination provides a premium, "heritage" aesthetic that differentiates the dashboard from standard SaaS blues.

- **Primary (Olive):** Used for primary actions, active navigation states, and success indicators.
- **Secondary (Sage):** Used for hover states, secondary badges, and subtle UI accents.
- **Tertiary (Terracotta):** Reserved for destructive actions and critical warnings, providing a warm but urgent contrast.
- **Neutral (Cream/Beige):** The foundational background color. It is warmer than pure white, providing a sophisticated, paper-like quality.
- **Sidebar (Charcoal):** A deep, desaturated green-black creates a strong structural anchor for the navigation, ensuring it feels distinct from the content area.

## Typography

This system uses a **dual-font strategy** to balance character with legibility.

- **Headlines (Newsreader):** A sophisticated serif used for page titles, section headers, and high-level summaries. It evokes the feeling of a premium guest directory or editorial publication.
- **UI & Data (Inter):** A neutral, highly legible sans-serif used for all functional elements, table data, and form labels. It ensures that complex hotel metrics remain clear and accessible.

**Usage Notes:**
- Use `display-lg` exclusively for dashboard "Hero" stats (e.g., Total Revenue).
- `label-md` should be used in ALL-CAPS for table headers and small metadata tags to enhance structural clarity.
- Maintain a generous line-height for body text to ensure readability during data entry.

## Layout & Spacing

The design system utilizes a **Fixed Grid System** for desktop layouts to maintain a "contained" and organized professional feel.

- **Grid:** 12-column layout with a 24px gutter.
- **Margins:** 32px safe-area margins for desktop; 16px for mobile.
- **Sidebar:** A fixed-width left navigation bar. On mobile, this transitions into a bottom-sheet or full-screen overlay drawer.
- **Content Blocks:** Information is grouped into cards that follow the 8px spacing rhythm. Vertical spacing between logical sections (e.g., Header to Table) is consistently 32px or 48px.

## Elevation & Depth

Hierarchy is achieved primarily through **Tonal Layering** and **Subtle Ambient Shadows**.

- **Surface Levels:** 
  - **Level 0 (Background):** Neutral Cream (#F8F5F1).
  - **Level 1 (Cards/Panels):** Pure White (#FFFFFF) or light Cream Surface (#F2EBE1).
- **Shadows:** Avoid heavy dropshadows. Use "Elevated Softness"—a multi-layered shadow with 4% opacity and a high blur radius (16px to 24px) to make cards appear to float gently above the cream background.
- **Outlines:** Use a 1px border (#E5E1DA) on all cards and input fields to maintain definition without relying on high-contrast shadows.

## Shapes

The shape language is **Soft and Approachable**. 

- **Cards & Modals:** Use `rounded-lg` (16px) to create a modern, premium aesthetic.
- **Buttons & Inputs:** Use `rounded` (8px) for a more structured, functional feel.
- **Status Badges:** Use `rounded-full` (Pill-shaped) to distinguish them from interactive buttons.
- **Avatar:** Always circular.

## Components

### Buttons
- **Primary:** Solid Olive Green (#6D7E63) with white text. High-contrast, for main actions like "Save Room."
- **Secondary:** Outlined with a 1px Olive Green border. Used for "Cancel" or "Edit."
- **Destructive:** Solid Terracotta (#9B5235) with white text. Reserved for "Delete" or "Reject."

### Cards
- Cards must have a subtle 1px border (#E5E1DA) and a soft ambient shadow. 
- Dashboard cards should include a small icon in the top right (24px, muted olive) to aid visual scanning.

### Tables
- **Header:** Background of #F2EBE1 with bold, all-caps Inter labels.
- **Rows:** Alternating rows are not required; use subtle dividers instead. 
- **States:** Hovering over a row should apply a light Sage (#A8BBA2) tint at 10% opacity.

### Forms
- Inputs utilize a light background (#FBFBFB) with an 8px radius.
- Focus state is indicated by a 2px Olive Green border.
- Floating labels or clear top-aligned labels are required for accessibility.

### Sidebar
- Background: Dark Charcoal (#2D312C).
- Active Item: Olive Green background with a left-edge accent bar.
- Text: Muted Sage-Grey (#D1D5D1) for inactive; Pure White for active.

### Status Badges
- Use desaturated, low-contrast variants of the status colors for the background with high-contrast text. (e.g., Success is light sage background with dark olive text).