# N2 Design System

> Modern, functional design philosophy from Noisy Neighbor Studio

## Philosophy

**Less AI slop, more thoughtful design.**

We prioritize:
- Clarity over cleverness
- Function over decoration
- Consistency over novelty
- Real user needs over assumed ones

## Brand Voice

- Studio: Noisy Neighbor Studio
- Aesthetic: Modern, clean, functional
- Personality: Professional yet approachable
- Avoid: Generic corporate speak, over-engineered patterns, unnecessary animation

## Typography

### Font Stack

```css
/* Headings */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;

/* Body */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;

/* Code */
font-family: 'SF Mono', Consolas, 'Liberation Mono', Monaco, monospace;
```

### Scale

- H1: 32px / 2rem, weight 600
- H2: 24px / 1.5rem, weight 600
- H3: 20px / 1.25rem, weight 600
- H4: 16px / 1rem, weight 600
- Body: 16px / 1rem, weight 400
- Small: 14px / 0.875rem, weight 400
- Tiny: 12px / 0.75rem, weight 400

### Line Height

- Headings: 1.2
- Body: 1.6
- UI Elements: 1.5

## Color Palette

### Primary Colors

```css
--primary: #0066FF;
--primary-hover: #0052CC;
--primary-active: #003D99;
```

### Neutrals

```css
--background: #FFFFFF;
--surface: #F5F5F5;
--surface-hover: #EBEBEB;
--border: #E0E0E0;
--text: #1A1A1A;
--text-secondary: #666666;
--text-tertiary: #999999;
```

### Semantic Colors

```css
--success: #22C55E;
--success-bg: #F0FDF4;
--error: #EF4444;
--error-bg: #FEF2F2;
--warning: #F59E0B;
--warning-bg: #FFFBEB;
--info: #3B82F6;
--info-bg: #EFF6FF;
```

## Layout

### Grid

- Max content width: 1200px
- Columns: 12 (flexible)
- Gutters: 24px
- Margins: 24px (mobile), 48px (desktop)

### Spacing Scale

Based on 4px grid:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### Border Radius

```css
--radius-sm: 4px;
--radius: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

## Components

### Buttons

**Primary Button**
- Background: `--primary`
- Color: white
- Padding: 8px 16px
- Border radius: `--radius`
- Font weight: 500
- Hover: `--primary-hover`
- Transition: 200ms ease

**Secondary Button**
- Background: white
- Color: `--text`
- Border: 1px solid `--border`
- Hover: `--surface`

**Sizes**
- Small: 6px 12px, 14px font
- Default: 8px 16px, 14px font
- Large: 12px 24px, 16px font

### Cards

- Background: white
- Border: 1px solid `--border`
- Border radius: `--radius-lg`
- Padding: 24px
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Hover: 0 4px 12px rgba(0, 0, 0, 0.1)

### Forms

**Input Fields**
- Border: 1px solid `--border`
- Border radius: `--radius`
- Padding: 8px 12px
- Focus: border `--primary`
- Error: border `--error`

**Labels**
- Font size: 14px
- Font weight: 500
- Margin bottom: 6px

**Validation**
- Inline, immediate feedback
- Helper text: 12px, `--text-secondary`
- Error text: 12px, `--error`

### Navigation

**Top Navigation**
- Height: 64px
- Background: white
- Border bottom: 1px solid `--border`
- Logo on left, actions on right
- Sticky positioning

**Sidebar**
- Width: 250px
- Background: `--surface`
- Border right: 1px solid `--border`

## Interaction Patterns

### Animations

Keep subtle and purposeful:

```css
/* Hover transitions */
transition: all 200ms ease;

/* Loading states */
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

/* Enter/exit */
transition: opacity 300ms ease, transform 300ms ease;
```

### Feedback

- **Immediate**: Visual response within 100ms
- **Informative**: Clear success/error states
- **Helpful**: Actionable error messages

### Loading States

- Prefer skeleton screens over spinners
- Show progress when possible
- Provide cancel option for long operations

## Accessibility

### Contrast

- Text on background: minimum 4.5:1
- Large text (18px+): minimum 3:1
- Interactive elements: clear focus indicators

### Focus

```css
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Motion

Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Best Practices

### Do
- Use consistent spacing from the scale
- Follow the established color palette
- Keep animations subtle and fast
- Write clear, actionable microcopy
- Test on real devices
- Use semantic HTML

### Don't
- Add decoration for decoration's sake
- Use more than 2-3 fonts
- Create slow, flashy animations
- Use generic placeholder text
- Assume screen sizes
- Sacrifice accessibility for aesthetics

## Code Patterns

### CSS Structure

```css
/* Variables first */
:root {
  --primary: #0066FF;
}

/* Base styles */
body {
  font-family: system-ui;
}

/* Components */
.button {
  /* Layout */
  /* Appearance */
  /* Typography */
  /* Interaction */
}
```

### Component Naming

Use clear, descriptive names:
- `button-primary`, not `btn-1`
- `card-product`, not `card-style-a`
- `input-error`, not `input-red`

---

*This design system is a living document. Update it as the project evolves.*
