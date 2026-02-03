# Design Style Guide

This document outlines the visual language and design patterns used across the Outr applications (`apps/main` and `apps/web`). The aesthetic is inspired by modern, premium interfaces (Apple-like), focusing on clarity, softness, and refined typography.

## Core Principles

1.  **Softness & Depth**: Use generous corner radii, subtle borders, and layered backgrounds with backdrop blurs to create a sense of depth without heavy shadows.
2.  **Clarity & Hierarchy**: Use typography (weight, size, casing) to establish clear hierarchy. Uppercase tracking labels for metadata, strong semibold headings for content.
3.  **Breathing Room**: Ample whitespace (padding/margins) to prevent clutter.
4.  **Subtle Interactivity**: Smooth transitions, scale effects on click, and gentle hover states.

## Tokens & Values

### Border Radius
We prefer softer, more friendly shapes.
-   **Base**: `rounded-lg` (0.5rem - 0.75rem) for inputs, buttons, small cards.
-   **Containers**: `rounded-xl` or `rounded-2xl` for main content cards, dialogs, and sections.
-   **Pills/Badges**: `rounded-full` for status indicators and tags.

### Colors & Borders
-   **Borders**: `border-border/40` (approx 10-20% opacity) for a subtle, refined look. Avoid harsh `#e5e7eb` lines.
-   **Backgrounds**:
    -   Page: `bg-background`
    -   Cards: `bg-card` or `bg-card/50` with `backdrop-blur-sm`.
    -   Subtle sections: `bg-muted/20` or `bg-muted/30`.
-   **Accents**: Use `bg-primary/5` or `bg-primary/10` for active states or highlighted areas.

### Typography
-   **Headings**: `font-semibold` or `font-bold` with `tracking-tight`.
-   **Body**: `text-sm` or `text-base` with `leading-relaxed`.
-   **Labels/Metadata**: `text-xs font-medium uppercase tracking-wide text-muted-foreground`.
-   **Monospace**: Used sparingly for data, IDs, and technical specs.

## Components

### Cards
Cards should feel "plucked" from the background.
```tsx
<div className="rounded-xl border border-border/40 bg-card/50 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
  {/* content */}
</div>
```

### Buttons
Buttons use a slightly softer radius and scale effect.
```tsx
// Variant: default
className="rounded-lg shadow-sm active:scale-[0.98] transition-all"
```

### Tables / Lists
-   **Headers**: `text-xs uppercase tracking-wider font-medium text-muted-foreground`.
-   **Rows**: Increased vertical padding (`py-4`) for touch targets and breathing room.
-   **Separators**: `border-b border-border/40`.

### Empty States
Center-aligned, using rounded icons and clear calls to action.
```tsx
<div className="rounded-xl border border-dashed border-border/40 p-12 text-center">
  {/* icon container */}
  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
    <Icon />
  </div>
  {/* text */}
</div>
```

## Layout Patterns

### Page Shell
-   **Width**: `w-full max-w-5xl mx-auto` for readable line lengths.
-   **Padding**: `p-4 md:p-6` to adapt to mobile/desktop.
-   **Headers**: Clean titles with breadcrumbs or actions, no heavy bottom borders unless necessary.

### Section Headers
Used in landing pages and settings.
```tsx
<div className="flex items-center gap-2">
  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
  <span className="text-xs font-medium uppercase tracking-wide text-primary">
    Category
  </span>
</div>
<h2 className="text-3xl font-semibold tracking-tight">Title</h2>
```

## Dos and Don'ts

-   **Do**: Use `border-border/40` for dividers.
-   **Do**: Use `bg-muted/30` for code blocks or secondary areas.
-   **Do**: Use `text-muted-foreground` for description text.
-   **Don't**: Use sharp corners (`rounded-none` or `rounded-sm`) unless specifically intended for a "technical" brutalist segment (though we are moving away from this).
-   **Don't**: Use heavy drop shadows (`shadow-xl`) without good reason. Prefer subtle depth.
