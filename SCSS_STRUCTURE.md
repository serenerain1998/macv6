# SCSS Structure Documentation

## Overview

This project now uses a well-organized SCSS architecture that compiles to CSS files. The SCSS files are organized using the **7-1 Pattern** (7 folders, 1 file) for maintainability and scalability.

## Directory Structure

```
scss/
├── abstracts/          # Variables, functions, mixins
│   ├── _variables.scss
│   ├── _functions.scss
│   ├── _mixins.scss
│   └── _abstracts.scss
├── base/               # Reset, typography, base styles
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _base.scss
├── components/         # Reusable UI components
│   ├── _buttons.scss
│   ├── _cards.scss
│   ├── _navigation.scss
│   ├── _modals.scss
│   └── _components.scss
├── layout/             # Layout-specific styles
│   ├── _hero.scss
│   ├── _sections.scss
│   └── _layout.scss
├── pages/              # Page-specific styles (future use)
├── themes/             # Theme variations (future use)
├── utilities/          # Utility classes and helpers
│   ├── _utilities.scss
│   ├── _animations.scss
│   ├── _responsive.scss
│   └── _utilities.scss
├── main.scss           # Main stylesheet (compiles to css/main.css)
└── styles.scss         # Additional stylesheet (compiles to css/styles.css)
```

## File Organization

### Abstracts (`scss/abstracts/`)
Contains all the tools and helpers used across the project:
- **Variables**: Colors, typography, spacing, breakpoints, etc.
- **Functions**: Helper functions for accessing variables
- **Mixins**: Reusable style patterns

### Base (`scss/base/`)
Contains the foundational styles:
- **Reset**: CSS reset and normalize
- **Typography**: Base typography styles

### Components (`scss/components/`)
Contains all the UI components:
- **Buttons**: Button styles and variants
- **Cards**: Card components and project cards
- **Navigation**: Navbar and navigation styles
- **Modals**: Modal components (password modal, etc.)

### Layout (`scss/layout/`)
Contains layout-specific styles:
- **Hero**: Hero section layout
- **Sections**: Main content sections (projects, about, contact, footer)

### Utilities (`scss/utilities/`)
Contains utility classes and helpers:
- **Utilities**: Utility classes
- **Animations**: Keyframe animations
- **Responsive**: Responsive design utilities

## Compilation

### NPM Scripts

```bash
# Compile SCSS to CSS (production)
npm run build:css

# Watch SCSS files for changes (development)
npm run watch:css

# Build everything (includes CSS compilation)
npm run build
```

### Output Files

- `scss/main.scss` → `css/main.css`
- `scss/styles.scss` → `css/styles.css`

Both CSS files are compressed for production use.

## Design System

The SCSS uses a comprehensive design system with:

### Color System
- Primary colors (main, light, dark, contrast)
- Secondary colors
- Background colors (primary, secondary, tertiary, elevated)
- Text colors (primary, secondary, muted, disabled)
- Status colors (success, warning, error, info)
- Border colors
- Overlay colors

### Typography Scale
- Font families (primary, mono, display)
- Font sizes (xs to 6xl)
- Font weights (light to extrabold)
- Line heights (tight, normal, relaxed)

### Spacing Scale
- Material Design 8dp grid system
- Consistent spacing from xs (4px) to 5xl (128px)

### Breakpoints
- Mobile-first responsive design
- xs: 0, sm: 480px, md: 768px, lg: 1024px, xl: 1280px, xxl: 1440px

## Usage Guidelines

### Adding New Styles

1. **Components**: Add new component styles to `scss/components/`
2. **Layout**: Add layout-specific styles to `scss/layout/`
3. **Utilities**: Add utility classes to `scss/utilities/`
4. **Variables**: Add new variables to `scss/abstracts/_variables.scss`

### Best Practices

1. **Use Functions**: Use the provided functions (`color()`, `font-size()`, `spacing()`) instead of direct map access
2. **Use Mixins**: Use mixins for common patterns (`@include button-base`, `@include flex-center`)
3. **Mobile-First**: Write responsive styles using the `@include breakpoint()` mixin
4. **Consistent Naming**: Follow BEM methodology for class naming
5. **No Direct CSS**: Don't edit the compiled CSS files directly

### Example Usage

```scss
// Using variables and functions
.my-component {
  background: color(background, tertiary);
  padding: spacing(lg);
  font-size: font-size(base);
  border-radius: map-get($radius, lg);
}

// Using mixins
.my-button {
  @include button-base;
  background: color(primary);
  color: color(text, inverse);
}

// Using responsive mixins
.my-responsive-element {
  width: 100%;
  
  @include breakpoint(md) {
    width: 50%;
  }
}
```

## Migration Notes

- The original CSS files (`css/main.css` and `css/styles.css`) are now generated from SCSS
- All styles have been reorganized into logical SCSS partials
- Duplicate styles have been consolidated
- The design system provides consistency across all components
- Responsive design is now more maintainable with the breakpoint mixin

## Development Workflow

1. **Development**: Use `npm run watch:css` to automatically compile SCSS changes
2. **Production**: Use `npm run build:css` to compile optimized CSS
3. **Deployment**: The build process automatically compiles SCSS to CSS

This structure makes the CSS more maintainable, scalable, and easier to work with for future development.
