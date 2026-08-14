# useThemeColorDimmingOverlay

`useThemeColorDimmingOverlay` keeps an overlay element's opacity and the browser `theme-color` dimming in sync. It is mainly useful when building a custom overlay system instead of relying entirely on Silk's built-in backdrop behavior.

## Core rules

- Pass a `dimmingColor` in `rgb(...)` form.
- Optionally pass an `elementRef` if you want the hook to also control a real overlay element's opacity.
- `setDimmingOverlayOpacity` updates opacity immediately.
- `animateDimmingOverlayOpacity` animates opacity and the related theme-color dimming together.

## Repo status

- The repo does not use this hook today.
- Current sheets rely on `Sheet.Backdrop themeColorDimming="auto"`, which already handles browser chrome dimming for normal sheet presentation.
- That means this hook is only relevant if we build a custom overlay outside Silk's default backdrop flow.

## Good fits in this repo

- A custom stack background layer that is not a `Sheet.Backdrop`.
- A custom page overlay that should dim both the app UI and the browser chrome in sync.
- Any non-sheet overlay animation where the visual overlay and `theme-color` need to move together.

## Repo guidance

- Prefer `themeColorDimming="auto"` on `Sheet.Backdrop` for standard sheets.
- Use this hook only when the overlay is custom and Silk cannot infer the correct dimming behavior automatically.
- Keep the overlay element background color exactly aligned with the `dimmingColor` you pass in.
- Reach for this before manually wiring both element opacity and `updateThemeColor` calls yourself.

## Implementation checklist

- Confirm the overlay is custom rather than a normal Silk backdrop.
- Create a ref for the overlay element if the DOM node should fade too.
- Pass the same RGB color string used by the overlay background.
- Use the returned setters instead of updating opacity separately.

## Example shape

```tsx
import { useRef } from 'react'
import { useThemeColorDimmingOverlay } from '@silk-hq/components'

function StackBackground() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const { animateDimmingOverlayOpacity } = useThemeColorDimmingOverlay({
    elementRef: overlayRef,
    dimmingColor: 'rgb(0, 0, 0)',
  })

  return (
    <div
      ref={overlayRef}
      onClick={() =>
        animateDimmingOverlayOpacity({ keyframes: [0, 0.45], duration: 300 })
      }
    />
  )
}
```
