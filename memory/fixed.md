# Fixed

Silk's `Fixed` is for viewport-pinned UI that still needs to behave correctly around sheet transforms and temporary page-scroll locking. It is not a blanket replacement for every `position: fixed` rule in the app.

## Core rules

- The required shape is `Fixed.Root -> Fixed.Content`.
- Use it when a fixed layer might live inside a transformed `Sheet.Outlet` or `SheetStack.Outlet` and must keep its visual position stable.
- `Fixed` traps scroll gestures when the pointer is over it, which helps prevent accidental page scrolling behind overlays.
- If the fixed element uses `bottom` without `top`, or `right` without `left`, declare `--silk-fixed-side` so Silk can preserve its position correctly.
- Do not put your own transform styles on the `Fixed.Root` element itself. Apply them to a child instead.

## Repo status

- We do not use `Fixed` today.
- The repo currently uses plain `position: fixed` for global layers such as `Toast` and `Grainient`.
- Those current cases are simple top-level layers, so plain CSS is still the right default there.

## Good fits in this repo

- A floating button or control that sits inside content animated by `SheetStack.Outlet`.
- Fixed UI inside a sheet hierarchy where page-scroll locking would otherwise cause visible drift.
- Viewport-pinned controls that should trap scroll gestures instead of letting the page move behind them.

## Repo guidance

- Keep plain `position: fixed` for simple app-wide layers that are already mounted near the root.
- Reach for `Fixed` when the element is nested inside transformed sheet content or needs Silk to account for collapsed scrollbar thickness.
- If the element is part of the sheet chrome itself, check whether `Sheet.View` already covers the need before introducing another wrapper.
- When a bottom-right or bottom-only fixed control looks offset after scroll locking, add `--silk-fixed-side` before debugging anything else.

## Implementation checklist

- Start with `Fixed.Root` and `Fixed.Content`.
- Keep transforms on descendants, not on `Fixed.Root`.
- Add `--silk-fixed-side` if the positioning uses `bottom` or `right` without the opposite side.
- Prefer this primitive only when plain `position: fixed` breaks because of transforms or scroll locking.

## Example shape

```tsx
import { Fixed } from '@silk-hq/components'

<SheetStack.Outlet asChild stackingAnimation={{ scale: ['1', '0.96'] }}>
  <div>
    <Fixed.Root className="floatingHelp">
      <Fixed.Content>
        <button className="floatingHelpButton">Help</button>
      </Fixed.Content>
    </Fixed.Root>
  </div>
</SheetStack.Outlet>
```

```css
.floatingHelp {
  position: fixed;
  right: 16px;
  bottom: 16px;
  --silk-fixed-side: bottom right;
}
```
