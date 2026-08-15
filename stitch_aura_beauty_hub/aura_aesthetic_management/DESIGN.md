---
name: Aura Aesthetic Management
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#4f4542'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#807471'
  outline-variant: '#d2c3c0'
  surface-tint: '#6c5a56'
  primary: '#6c5a56'
  on-primary: '#ffffff'
  primary-container: '#f4dcd6'
  on-primary-container: '#71605b'
  inverse-primary: '#d8c2bc'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#4c6455'
  on-tertiary: '#ffffff'
  tertiary-container: '#cde8d5'
  on-tertiary-container: '#51695a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f5ddd7'
  primary-fixed-dim: '#d8c2bc'
  on-primary-fixed: '#251915'
  on-primary-fixed-variant: '#53433f'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#cee9d6'
  tertiary-fixed-dim: '#b2cdbb'
  on-tertiary-fixed: '#082014'
  on-tertiary-fixed-variant: '#344c3e'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system is built for the premium aesthetic medicine space. It balances clinical precision with a boutique, high-end hospitality feel. The personality is **sophisticated, trustworthy, and calming**, moving away from "sterile" medical interfaces toward a "wellness sanctuary" experience.

The visual style is **Soft Minimalist Glassmorphism**. It utilizes generous whitespace (negative space) to reduce cognitive load for practitioners while maintaining a premium "airy" aesthetic. Layouts should feel light, using translucent layers and soft blurs to create depth without visual clutter. The target audience is high-end clinic owners, practitioners, and their affluent clientele, demanding an interface that feels as refined as the treatments they provide.

## Colors

The palette is rooted in a "Skin & Nature" philosophy.
- **Primary (Soft Pink/Nude):** Used for primary surfaces and brand accents. It evokes skin health and warmth.
- **Secondary (Champagne Gold):** Reserved for high-priority CTAs, icons of excellence, and premium feature markers. Use sparingly to maintain its "jewelry" effect.
- **Tertiary (Sage Green):** Applied to success states, health-tracking metrics, and botanical accents. It provides a calming counterpoint to the warmer tones.
- **Neutral (Ivory/Bone):** The foundation of the UI. Avoid pure white (#FFFFFF) in favor of Ivory to reduce eye strain and feel more organic.

## Typography

The typography system relies on a high-contrast pairing:
1. **Headings:** Use **Playfair Display**. This serif font conveys authority and timeless elegance. Use it for page titles, section headers, and featured quotes. Keep tracking tight on larger sizes.
2. **UI & Body:** Use **Inter**. A highly legible sans-serif that brings the "technologically advanced" aspect to the brand. It handles data-heavy tables and clinical notes with precision.

**Hierarchy Note:** Use the `label-md` style for small sub-headers or category tags, always with the defined uppercase transformation and letter spacing to distinguish from body text.

## Layout & Spacing

The layout philosophy is **"Aperture"**—creating a sense of openness. 
- **Grid:** Use a 12-column grid for desktop with 24px gutters. Elements should often span 6 or 8 columns to leave ample side margins, preventing the "edge-to-edge" industrial look.
- **Rhythm:** Use an 8px base unit. Component internal padding should be generous (typically 16px or 24px) to ensure no element feels "cramped."
- **Mobile:** Transition to a 4-column grid. Prioritize vertical stacking with significant bottom margins (32px+) between cards to maintain the airy feel on small screens.

## Elevation & Depth

This system uses **Tonal Layering** and **Glassmorphism** instead of traditional heavy shadows.

- **Level 0 (Base):** The Ivory background.
- **Level 1 (Cards/Containers):** White with 40% opacity and a 20px background blur (backdrop-filter). Use a 1px solid white border at 50% opacity to define the edge.
- **Level 2 (Floating/Modals):** Soft, diffused shadows. Shadow color should be a tint of the Primary color (e.g., `rgba(244, 220, 214, 0.3)`) rather than black or grey. This maintains the "warm" glow.
- **Level 3 (Popovers):** Higher blur radius (40px) and a subtle gold inner-border (0.5px) to denote premium interaction.

## Shapes

The shape language is **organic and soft**. 
- **Standard UI (Buttons/Inputs):** Use the `rounded` setting (0.5rem) to maintain a modern software feel.
- **Feature Cards & Modals:** Use `rounded-xl` (1.5rem) to emphasize the "comfort" and "feminine" aspect of the brand.
- **Avatars & Status Tags:** Should be fully rounded (pill-shaped) to contrast against the structured grid.

## Components

- **Buttons:** Primary buttons use a Champagne Gold gradient or solid Soft Pink. Text is always high-contrast. Use a subtle lift on hover (elevation level 2).
- **Inputs:** Fields should have a soft ivory fill and a subtle bottom-border only, or a very light 1px stroke. Focus states should use a Sage Green glow.
- **Chips/Tags:** Used for "Treatment Types" or "Status." These should be pill-shaped with low-opacity fills of the primary or tertiary colors (e.g., a light sage background with dark sage text).
- **Cards:** The hallmark of the system. Use the Glassmorphism effect described in the Elevation section. Cards should never have sharp corners.
- **Calendar/Scheduler:** Use Sage Green for "Available" slots and Soft Pink for "Booked" appointments. Ensure the typography remains Inter for maximum legibility in dense views.
- **Progress Bars:** Use a thin, elegant line with a gold "bead" indicator for a high-end feel during multi-step booking processes.