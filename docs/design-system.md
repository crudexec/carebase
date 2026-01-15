# Design System

## Overview

CareBase follows a minimalist design philosophy inspired by Apple's Human Interface Guidelines, emphasizing clarity, deference, and depth.

---

## Design Principles

1. **Clarity** - Text is legible, icons are precise, adornments are subtle
2. **Deference** - UI helps users understand and interact with content
3. **Depth** - Visual layers and realistic motion convey hierarchy

---

## Typography

### Font Stack

```css
font-family:
  "Inter",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  sans-serif;
```

Inter is used as the primary typeface - it closely mirrors SF Pro's characteristics with excellent legibility and a clean, modern feel.

### Type Scale

| Name       | Size            | Weight | Line Height | Usage                      |
| ---------- | --------------- | ------ | ----------- | -------------------------- |
| Display    | 36px / 2.25rem  | 600    | 1.2         | Page titles, hero text     |
| Heading 1  | 30px / 1.875rem | 600    | 1.3         | Section headers            |
| Heading 2  | 24px / 1.5rem   | 600    | 1.35        | Card titles, modal headers |
| Heading 3  | 20px / 1.25rem  | 500    | 1.4         | Subsections                |
| Body Large | 18px / 1.125rem | 400    | 1.6         | Important body text        |
| Body       | 16px / 1rem     | 400    | 1.6         | Default body text          |
| Body Small | 14px / 0.875rem | 400    | 1.5         | Secondary text, captions   |
| Caption    | 12px / 0.75rem  | 400    | 1.4         | Labels, timestamps         |

### Font Weights

- **Regular (400)** - Body text
- **Medium (500)** - Emphasis, subheadings
- **Semibold (600)** - Headings, buttons

---

## Color Palette

### Base Colors (Light Mode)

```css
/* Background */
--background: #fafafa; /* Main background */
--background-secondary: #f5f5f7; /* Cards, sections */
--background-tertiary: #ffffff; /* Elevated surfaces */

/* Text */
--text-primary: #1d1d1f; /* Primary text */
--text-secondary: #6e6e73; /* Secondary text */
--text-tertiary: #86868b; /* Placeholder, disabled */

/* Borders */
--border: #e5e5ea; /* Default borders */
--border-light: #f2f2f7; /* Subtle dividers */
```

### Pastel Accent Colors

```css
/* Primary - Soft Blue */
--primary: #a8d4f0; /* Primary actions */
--primary-hover: #8ec5e8; /* Hover state */
--primary-foreground: #1d1d1f; /* Text on primary */

/* Success - Soft Green */
--success: #b8e6c1; /* Success states */
--success-hover: #9fdaab;
--success-foreground: #1d1d1f;

/* Warning - Soft Amber */
--warning: #f9e4b7; /* Warning states */
--warning-hover: #f5d89a;
--warning-foreground: #1d1d1f;

/* Error - Soft Rose */
--error: #f5c6c6; /* Error states */
--error-hover: #f0abab;
--error-foreground: #1d1d1f;

/* Info - Soft Purple */
--info: #d4c5f0; /* Info states */
--info-hover: #c4b0e8;
--info-foreground: #1d1d1f;
```

### Role-Specific Accent Colors

```css
/* For visual distinction in dashboards */
--role-admin: #e8d5f0; /* Soft lavender */
--role-ops-manager: #d5e8f0; /* Soft sky */
--role-clinical: #d5f0e8; /* Soft mint */
--role-staff: #f0e8d5; /* Soft cream */
--role-supervisor: #f0d5e8; /* Soft pink */
--role-carer: #d5f0d8; /* Soft sage */
--role-sponsor: #f0f0d5; /* Soft butter */
```

### Severity Colors (Incidents)

```css
--severity-low: #d5e8d5; /* Soft green */
--severity-medium: #f0e8d5; /* Soft amber */
--severity-high: #f0d5d5; /* Soft coral */
--severity-critical: #e8d5d5; /* Soft rose */
```

---

## Spacing

Based on 4px grid system (Apple-style):

| Name | Value | Usage            |
| ---- | ----- | ---------------- |
| xs   | 4px   | Tight spacing    |
| sm   | 8px   | Related elements |
| md   | 16px  | Default spacing  |
| lg   | 24px  | Section spacing  |
| xl   | 32px  | Large gaps       |
| 2xl  | 48px  | Page sections    |
| 3xl  | 64px  | Major sections   |

---

## Border Radius

| Name | Value  | Usage                          |
| ---- | ------ | ------------------------------ |
| sm   | 6px    | Small elements (badges, chips) |
| md   | 10px   | Buttons, inputs                |
| lg   | 14px   | Cards, modals                  |
| xl   | 20px   | Large cards, panels            |
| full | 9999px | Pills, avatars                 |

---

## Shadows

Subtle, layered shadows for depth:

```css
/* Elevation 1 - Cards */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);

/* Elevation 2 - Dropdowns */
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);

/* Elevation 3 - Modals */
--shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.08);

/* Elevation 4 - Popovers */
--shadow-xl: 0 24px 60px rgba(0, 0, 0, 0.1);
```

---

## Components

### Buttons

**Primary Button**

- Background: `var(--primary)`
- Text: `var(--primary-foreground)`
- Border radius: 10px
- Padding: 12px 24px
- Font weight: 500
- Transition: all 0.2s ease

**Secondary Button**

- Background: transparent
- Border: 1px solid `var(--border)`
- Text: `var(--text-primary)`

**Ghost Button**

- Background: transparent
- Text: `var(--text-secondary)`
- Hover: light background tint

### Cards

- Background: `var(--background-tertiary)`
- Border: 1px solid `var(--border-light)`
- Border radius: 14px
- Shadow: `var(--shadow-sm)`
- Padding: 24px

### Inputs

- Background: `var(--background-secondary)`
- Border: 1px solid `var(--border)`
- Border radius: 10px
- Padding: 12px 16px
- Focus: 2px ring with `var(--primary)`

### Badges / Status Pills

- Border radius: full (pill shape)
- Padding: 4px 12px
- Font size: 12px
- Font weight: 500
- Use pastel backgrounds with dark text

---

## Motion

Subtle, purposeful animations:

```css
/* Default transition */
transition: all 0.2s ease;

/* Hover lift effect */
transform: translateY(-1px);

/* Modal entrance */
animation:
  fadeIn 0.2s ease,
  slideUp 0.25s ease;
```

---

## Icons

Use **Lucide React** icons:

- Stroke width: 1.5px
- Size: 20px default, 16px small, 24px large
- Color: inherit from text color

---

## Accessibility

- Minimum contrast ratio: 4.5:1 for text
- Focus states visible on all interactive elements
- Touch targets minimum 44x44px on mobile
- Reduced motion support via `prefers-reduced-motion`

---

## Dark Mode (Future)

Design system supports dark mode extension. Light mode is primary for initial release.

---

**Last Updated:** 2026-01-13
