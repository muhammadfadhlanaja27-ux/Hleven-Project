---
name: H'Leven Design System
colors:
  surface: '#fff8f0'
  surface-dim: '#e0d9d0'
  surface-bright: '#fff8f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf3ea'
  surface-container: '#f4ede4'
  surface-container-high: '#eee7de'
  surface-container-highest: '#e8e2d9'
  on-surface: '#1e1b16'
  on-surface-variant: '#444842'
  inverse-surface: '#33302a'
  inverse-on-surface: '#f7f0e7'
  outline: '#747871'
  outline-variant: '#c4c8bf'
  surface-tint: '#52634f'
  primary: '#50604d'
  on-primary: '#ffffff'
  primary-container: '#687965'
  on-primary-container: '#f7fff1'
  inverse-primary: '#baccb4'
  secondary: '#4c6546'
  on-secondary: '#ffffff'
  secondary-container: '#ceebc4'
  on-secondary-container: '#526b4c'
  tertiary: '#645b4f'
  on-tertiary: '#ffffff'
  tertiary-container: '#7d7366'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e8cf'
  primary-fixed-dim: '#baccb4'
  on-primary-fixed: '#111f10'
  on-primary-fixed-variant: '#3b4b39'
  secondary-fixed: '#ceebc4'
  secondary-fixed-dim: '#b3cea9'
  on-secondary-fixed: '#0a2008'
  on-secondary-fixed-variant: '#354d30'
  tertiary-fixed: '#eee0d1'
  tertiary-fixed-dim: '#d1c5b6'
  on-tertiary-fixed: '#211b11'
  on-tertiary-fixed-variant: '#4e453a'
  background: '#fff8f0'
  on-background: '#1e1b16'
  surface-variant: '#e8e2d9'
  forest-green: '#778873'
  sage-green: '#A1BC98'
  warm-beige: '#DCCFC0'
  off-white: '#FDF6ED'
  text-main: '#2D332C'
  status-success: '#4F6F52'
  status-error: '#A0522D'
typography:
  headline-xl:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
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
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
  section-gap: 5rem
---

## Brand & Style

The brand personality for this design system is **Sophisticated, Trustworthy, and Welcoming**. It is designed for the modern hospitality market, bridging the gap between luxury aesthetics and functional reliability. The UI should evoke a sense of calm and "quiet luxury," making the user feel like their journey has already begun with a seamless booking experience.

The chosen aesthetic is a blend of **Minimalism** and **Corporate Modern**. It utilizes heavy whitespace and a refined color palette to create an air of exclusivity, while maintaining the rigorous structure required for complex data management like room availability and transaction history. Elements are grounded and purposeful, avoiding unnecessary decorative clutter to focus on the content—beautiful hotel imagery and clear pricing data.

## Colors

The palette is rooted in an organic, earth-toned spectrum that suggests natural comfort and professional stability. 

- **Primary (Forest Green):** Used for key brand moments, primary calls to action (CTAs), and high-level navigation active states. It provides the necessary contrast against light backgrounds to ensure accessibility.
- **Secondary (Sage Green):** Applied to secondary interactive elements, highlights, and subtle accents. It softens the interface and adds visual depth without overwhelming the eye.
- **Tertiary (Warm Beige):** Dedicated to surface containers, card backgrounds, and structural dividers. This color provides a softer alternative to pure white, enhancing the "luxury" feel.
- **Neutral (Off-White):** The foundation for all page backgrounds. It ensures a high-contrast environment for readability while maintaining the warmth of the brand.

Color application should follow a 60-30-10 rule to maintain visual balance, where the off-white and beige dominate the layout, while the greens provide focused interaction points.

## Typography

This design system uses a dual-font strategy to balance heritage with modernity:

- **Headings (Libre Caslon Text):** This classic serif evokes the high-end feel of traditional hotel stationery and luxury editorials. It should be used for page titles, hotel names, and section headers. Use tighter letter spacing for large display sizes to maintain a sophisticated silhouette.
- **Body & Interface (Hanken Grotesk):** A sharp, contemporary sans-serif chosen for its exceptional legibility at small sizes. It handles the functional aspects of the platform—booking forms, room details, and dashboard data—with professional clarity.

**Hierarchy Rules:**
- Use `headline-xl` sparingly for hero sections.
- `label-md` should be used for category tags, small buttons, and metadata to provide clear distinction from body text.
- Ensure all body text maintains a minimum 1.5 line-height to support the "welcoming" and "breathable" nature of the brand.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain a premium, composed look, transitioning to a fluid model for mobile devices.

- **Grid:** A 12-column grid system is used for desktop (1280px max width). For mobile, a single-column layout is preferred with increased vertical stacking.
- **Rhythm:** We employ an 8px base scaling unit. Generous white space is a core component of this design system; "Section Gaps" should be utilized to separate distinct phases of the user journey (e.g., separating Search results from Featured Promotions).
- **Responsiveness:**
  - **Desktop (1024px+):** 12 columns, 24px gutters, 40px side margins.
  - **Tablet (768px - 1023px):** 8 columns, 16px gutters, 24px side margins.
  - **Mobile (Up to 767px):** 4 columns (or single stack), 16px gutters, 16px side margins.

## Elevation & Depth

To maintain a sophisticated and organic feel, this design system avoids heavy, artificial shadows. Instead, it uses **Tonal Layers** and **Ambient Shadows**.

- **Surface Tiers:** Use the Tertiary color (`Warm Beige`) for card backgrounds and secondary sections to create a sense of depth without using shadows. 
- **Shadow Character:** When elevation is necessary (e.g., on a floating booking bar or a primary card), use highly diffused, low-opacity shadows. The shadows should be tinted with the Primary `Forest Green` at very low saturation (e.g., `rgba(119, 136, 115, 0.08)`) rather than pure black.
- **Interactivity:** Hover states should involve a slight vertical lift (2-4px) and a subtle increase in shadow spread to provide tactile feedback.

## Shapes

The shape language is defined as **Rounded**, striking a balance between the friendliness of a hospitality brand and the structure of a professional booking tool. 

- **Base Radius (8px):** Applied to standard buttons, input fields, and small cards.
- **Large Radius (16px):** Reserved for primary containers, hotel image galleries, and modal windows.
- **Extra Large Radius (24px):** Used for specialty decorative elements or "Pill" style search bars in hero sections.

This consistent rounding softens the edges of the high-contrast color palette, ensuring the platform feels approachable and modern.

## Components

### Buttons
- **Primary:** Solid `Forest Green` with white text. High emphasis.
- **Secondary:** Outlined `Forest Green` with `Warm Beige` background on hover.
- **Ghost:** Text-only with an underline appearing on hover, used for less critical actions like "View More Details."

### Inputs & Selection
- **Text Fields:** Subtle `Warm Beige` border that shifts to `Forest Green` on focus. Use `Hanken Grotesk` for all user-inputted text.
- **Checkboxes/Radios:** Custom styled using the `Forest Green` brand color for the checked state.
- **Date Pickers:** Should use a clean, minimalist calendar view with `Sage Green` for range selections.

### Cards
- **Hotel Cards:** High-quality image at the top with a 16px top-corner radius. Content area uses `Warm Beige` with `Libre Caslon Text` for the hotel name.
- **Price Tags:** Displayed in `Forest Green` bold text to ensure they are the first thing the eye catches after the image.

### Unique Components
- **Booking QR Code:** Contained within a high-contrast `Off-White` card with a `Forest Green` border to signify its importance for check-in.
- **Status Badges:** Used for booking statuses (e.g., "Paid", "Pending"). Use low-saturation background tints of the status colors for a sophisticated, non-jarring look.