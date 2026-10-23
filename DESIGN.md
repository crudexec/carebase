---
name: CareBase public landing page
description: Warm blue editorial design for the public home-care management landing route.
colors:
  navy: "#243c64"
  navy-hover: "#3a5684"
  form-primary: "#3d5f98"
  periwinkle: "#cbd9f1"
  mist: "#e8edf7"
  paper: "#fbf9f5"
  muted: "#59667c"
  line: "#ccd3e0"
  field-border: "#bbc6d8"
  field-surface: "#fffdf9"
  placeholder: "#64718a"
  focus: "#5273ad"
  focus-on-navy: "#b4c9ed"
  preview-frame: "#e6ecf6"
  preview-paper: "#fffdf9"
  status-bg: "#e7eef9"
  status-text: "#3b5682"
  status-neutral-bg: "#eeedf2"
  status-neutral-text: "#60687b"
  inverse-copy: "#d3ddef"
  faq-surface: "#eff1f7"
  tab-hover: "#edf1f9"
  error: "#a12725"
  success: "#2e6a3b"
  hero-emphasis: "#5b75a5"
  section-emphasis: "#687b9d"
  nav-rule: "#bdc9df"
  inverse-rule: "#63789a"
  inverse-rule-secondary: "#6b80a1"
  workflow-line: "#8497b8"
  inverse-caption: "#c3cfe5"
  inverse-stage: "#cbd7ed"
  inverse-intro: "#d0daed"
  inverse-list: "#e0e7f5"
  record-icon: "#e5ebf7"
  record-rule: "#e5e9f1"
  faq-rule: "#c1cbe0"
  faq-hover: "#4c69a0"
  demo-copy: "#3f557b"
  demo-rule: "#9dafd1"
typography:
  display:
    fontFamily: Manrope, Arial, sans-serif
    fontSize: clamp(3.5rem, 6.55vw, 6rem)
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: -0.04em
  headline:
    fontFamily: Manrope, Arial, sans-serif
    fontSize: clamp(2.1rem, 4vw, 3.5rem)
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.04em
  feature-title:
    fontFamily: Manrope, Arial, sans-serif
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.025em
  body:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  feature-body:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.8
  button-label:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.5
rounded:
  field: 4px
  control: 6px
  mobile-menu: 8px
  panel: 12px
  circle: 50%
spacing:
  icon-gap: 12px
  control-gap: 16px
  compact-inset: 24px
  medium-inset: 28px
  panel-inset: 36px
  column-gap: 48px
  section: 112px
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.paper}"
    typography: "{typography.button-label}"
    rounded: "{rounded.control}"
    padding: 14px 22px
  button-primary-hover:
    backgroundColor: "{colors.navy-hover}"
  text-link:
    textColor: "{colors.navy}"
    typography: "{typography.button-label}"
  text-field:
    backgroundColor: "{colors.field-surface}"
    textColor: "{colors.navy}"
    rounded: "{rounded.field}"
    padding: 11px 12px
  navigation:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.navy}"
    height: 96px
  status-positive:
    backgroundColor: "{colors.status-bg}"
    textColor: "{colors.status-text}"
    rounded: "{rounded.field}"
    padding: 4px 7px
  status-neutral:
    backgroundColor: "{colors.status-neutral-bg}"
    textColor: "{colors.status-neutral-text}"
    rounded: "{rounded.field}"
    padding: 4px 7px
  preview-card:
    backgroundColor: "{colors.preview-frame}"
    textColor: "{colors.navy}"
    rounded: "{rounded.panel}"
    padding: 18px
  feature-tab:
    textColor: "{colors.muted}"
    padding: 17px 10px
  demo-form-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.navy}"
    rounded: "{rounded.panel}"
    padding: 36px
---

# Design System: CareBase public landing page

## Overview

**Creative North Star: "Community-health editorial campaign"**

This records the implemented visual system for the public `/` route and its marketing components only. Deep navy text, mist and warm-paper fields, periwinkle emphasis, bold Manrope headings, open lists, and fine rules give the page a clear editorial rhythm. Product examples are constructed from HTML, CSS, and SVG; no raster imagery ships in this surface.

The warm blue palette is a confirmed user preference; the surrounding editorial layout records the built direction. Audience and code-first preferences remain assumptions in PRODUCT.md and the surface brief. The authenticated dashboard and other routes retain the existing global Inter/blue system; these landing-page tokens must not become global defaults.

**Key Characteristics:**

- Broad tonal fields and strong heading hierarchy.
- Open capability lists and ruled rows, with rounded containers reserved for functional groups.
- Local Manrope display type paired with inherited Inter body text.
- Visible keyboard focus and reduced-motion support.

Source of truth: `src/app/landing.module.css`, `src/app/page.tsx`, `src/components/marketing/feature-explorer.tsx`, and `src/components/marketing/demo-request-form.tsx`. The frontmatter captures reused production values; CSS remains authoritative for specific responsive overrides. The page composition belongs to `.impeccable/surfaces/src-app-page-tsx.md`.

## Colors

The palette combines deep navy with soft blue fields and warm paper. Frontmatter values are normative; names below explain their use.

### Primary

- **Navy** supplies main text, filled primary actions, selected tabs, and dark section backgrounds. **Navy hover** lightens filled actions on pointer hover.
- **Form primary** is the scoped semantic primary used by form focus borders and secondary success-state actions.
- **Periwinkle** supplies accents on dark sections and the demo section background. It is a field and emphasis color rather than the default text color on paper.
- **Focus** marks keyboard targets; **focus on navy** is the lighter inset outline used by compact selected tabs.

### Neutral

- **Mist** supplies the header and hero field; **paper** is the main page and form-panel surface. **FAQ surface** provides a quieter section change.
- **Muted** supplies supporting copy; **inverse copy** supplies readable supporting text on navy.
- **Line** separates rows and groups. **Field border**, **field surface**, and **placeholder** distinguish editable controls.
- **Preview frame** and **preview paper** create nested illustrative records without shadows.
- **Status positive** and **status neutral** pair tinted backgrounds with darker text. These are compact labels inside examples, not primary controls.
- **Error** and **success** are semantic form feedback colors. Preserve their meaning when rendering the existing submission states.

**The Route Boundary Rule.** Keep the marketing palette and heading font inside the public landing wrapper; preserve the existing dashboard theme.

## Typography

**Display Font:** Manrope, with Arial and sans-serif fallbacks. `next/font/local` loads the bold file at `public/fonts/manrope-bold.ttf`, exposes `--font-marketing`, and applies weight 700 to headings and the brand.

**Body Font:** Inter with the existing platform fallback stack, inherited from `src/app/globals.css`. Controls use this body stack.

The bold, tightly spaced display type carries the hierarchy; paragraph and interface text stay quieter. There is no mono or separate eyebrow type system.

### Hierarchy

- **Display:** hero heading; the frontmatter records desktop sizing. The largest viewport pins it to 96px. Tablet and phone overrides step down fluidly, ending at `clamp(2.7rem, 9.2vw, 3.5rem)` with a 1.12 line-height at the smallest breakpoint.
- **Headline:** section headings; smaller phone sections use 33px. The demo section and FAQ have their own observed heading sizes rather than a single universal scale.
- **Feature title:** the feature-panel heading, with tablet and phone size adjustments.
- **Body:** inherited page baseline. Supporting prose commonly uses 14–16px with generous line-height; feature copy has its own frontmatter role and a 500px maximum width.
- **Button label:** the primary action label. Other compact controls have local responsive sizes; do not copy illustrative record microtext into general controls.

**The Display Face Rule.** Use the locally loaded Manrope 700 for landing headings and the brand; body text and controls inherit the existing Inter stack.

## Layout

The desktop content width is `min(1280px, calc(100% - 112px))`. At 1100px and below, outer gutters become 32px; at 800px and below they become 20px. Section padding steps from 112px to 88px, 72px, and 62px across the same desktop, tablet, and phone ranges.

The page uses asymmetric hero columns, paired content/example columns, and open three-column capability lists. At 800px the hero and team/FAQ layouts stack, the feature tabs become a two-by-two grid, and capability rows reorganize. At 560px the remaining feature and demo pairs stack, and the care-day sequence turns from a horizontal line into a vertical one. Keep explanatory content in the same reading order when stacking.

Navigation is 96px tall on desktop, 80px below 800px, and 76px below 560px. Section links hide below 800px; the mobile disclosure menu replaces the remaining desktop actions below 560px. Forms use paired fields on wide layouts and a single column within the narrower marketing panel.

The main spacing vocabulary is recorded in frontmatter; exact local gaps remain in CSS. Breakpoints in the sidecar are max-width conditions except the 1600px wide-screen rule.

## Elevation & Depth

The landing page is flat and tonal: borders define edges, nested light surfaces frame product records, and navy fields establish contrast. There is no landing shadow vocabulary. The form's inherited submit-button shadows are explicitly removed. Focus outlines provide interaction feedback rather than decorative depth.

**The Tonal Depth Rule.** Use color fields, borders, and nested surfaces to separate content. Landing containers and primary actions do not depend on drop shadows.

## Shapes

Small controls use gentle corners, larger functional panels use broader corners, and circular containers mark care-day steps and record icons. The frontmatter captures the observed radius vocabulary. Thin horizontal rules separate content; the care-day connector is horizontal on desktop and vertical on phones. Avoid interpreting these route-local layouts as a universal dashboard component system.

## Components

### Buttons and text links

Primary links are compact navy rectangles with paper text, a 48px minimum height, and an inline arrow. Hover changes their fill; focus uses a three-pixel outline with a five-pixel offset. Secondary text links retain a 44px minimum height and reveal an underline on hover. Their background and underline transitions last 0.18s. The demo submit action spans the panel; while submitting it uses a waiting cursor, reduced opacity, and a visible loading label.

### Inputs and fields

Inputs, selects, and textareas use light field surfaces, one-pixel borders, visible labels, and the compact field radius. Keyboard focus adds a two-pixel navy outline with a two-pixel offset; the inherited form utilities also adjust the border and ring. Placeholders remain secondary to labels. Required fields retain their native constraints. Submission errors are alerts; successful submission is announced through the existing status region.

### Navigation

The brand pairs the CareBase wordmark with an outlined heart. Desktop links are plain text with hover underlines. The phone menu is a native disclosure containing vertically arranged links on a bordered paper panel. Keep the skip link visible when focused.

### Status labels

Positive and neutral status labels use small, softly rounded tinted rectangles and an inline SVG check. They are informational labels in an illustrative record. Their compact type is not a general label or button scale.

### Cards and containers

Preview records pair a tinted outer frame with a warm inner sheet. The demo form and care-day sequence share the larger panel radius. Functional grouping, not a repeated decorative card grid, explains where these containers appear in the current surface.

### Feature explorer

Four tabs change the capability description and illustrative record together. Desktop selection uses a three-pixel lower rule; compact selection fills the tab with navy and reverses its text. Keyboard arrows, Home, and End move selection through the existing roving tab stops. The associated panel is focusable and properly labelled. Its short reveal animates opacity and clipping over 0.32s with `cubic-bezier(0.16, 1, 0.3, 1)`.

### FAQ disclosure

Native details/summary elements use ruled rows and a chevron that rotates on opening. Hover changes summary text color; keyboard focus uses the route's visible focus treatment.

All landing transitions and animations are disabled under `prefers-reduced-motion: reduce`; scroll behavior is also restored to auto. The sidecar includes standalone visual samples, not replacements for the production React behavior. Its tonal ramps are generated palette-inspection aids, not additional shipped tokens.

## Do's and Don'ts

### Do:

- Do scope this palette and Manrope display face to the public landing route.
- Do retain the CareBase heart mark and use inline SVG for interface icons.
- Do label sample records and care-day data as illustrative.
- Do preserve explicit focus states, tab keyboard navigation, and reduced-motion behavior.
- Do use open lists and fine rules for related information, as in the implemented capability and role sections.

### Don't:

- Don't apply these tokens to the authenticated dashboard or replace its global Inter/blue theme.
- Don't promote compact illustrative-record text into body-copy or interactive-control sizes.
- Don't treat the sidecar’s generated tonal ramps as additional production colors.
- Don't interpret this descriptive system as user confirmation of the inferred audience or workflow preferences.
