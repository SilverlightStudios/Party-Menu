# Visually Hidden

Silk's `VisuallyHidden` hides content visually while keeping it available to assistive technology. It is mainly useful here for accessible labels, hidden titles, and descriptions that should stay in the component tree.

## Core rules

- `VisuallyHidden.Root` can be used anywhere.
- The default underlying element is a `span`.
- Use `asChild` when the hidden content must keep a specific semantic element instead of the default `span`.
- This is for accessibility text, not for content that should be conditionally absent from the accessibility tree.

## Repo status

- We do not use Silk's `VisuallyHidden` today.
- The repo already has a global `.visually-hidden` utility in `src/styles/globals.scss`.
- That utility is still fine for plain markup. The Silk primitive becomes useful when hidden text should compose cleanly with other Silk sub-components such as `Sheet.Title` or `Sheet.Description`.

## Good fits in this repo

- Giving a sheet an accessible title when the visual design does not show one.
- Adding screen-reader-only helper text to icon-only buttons.
- Supplying hidden descriptions for toasts, dialogs, or sheet content without relying on a global class.

## Repo guidance

- Keep the existing `.visually-hidden` class for simple static markup.
- Prefer `VisuallyHidden.Root` inside reusable React components or Silk component trees where local composition is cleaner than a utility class.
- Use it with `Sheet.Title` and `Sheet.Description` when the UI needs accessible naming but the visible chrome should stay minimal.
- Do not use it to hide interactive controls that sighted users still need to discover.

## Implementation checklist

- Decide whether the existing `.visually-hidden` utility is already enough.
- Use `VisuallyHidden.Root` when the hidden text belongs inside a component abstraction.
- Wrap only the text or semantic node that should remain accessible.
- If semantics matter, use `asChild` so the original element type is preserved.

## Example shape

```tsx
import { Sheet, VisuallyHidden } from '@silk-hq/components'

<Sheet.Content>
  <VisuallyHidden.Root asChild>
    <Sheet.Title>Drink details</Sheet.Title>
  </VisuallyHidden.Root>

  <VisuallyHidden.Root asChild>
    <Sheet.Description>
      Review the drink and confirm whether you want to place the order.
    </Sheet.Description>
  </VisuallyHidden.Root>

  {/* visual UI */}
</Sheet.Content>
```
