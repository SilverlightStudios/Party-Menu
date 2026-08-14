# updateThemeColor

`updateThemeColor` changes the page's `theme-color` meta tag on the client. In this repo, that mainly matters for browser chrome color while sheets and backdrops are active.

## Core rules

- Call it with a hex, `rgb()`, or `rgba()` color string.
- It updates the `theme-color` meta tag in place.
- If a `Sheet.Backdrop` with `themeColorDimming="auto"` is active, Silk preserves the visual dimming and only updates the underlying base theme color.

## Repo status

- The repo does not call `updateThemeColor` today.
- The current base theme color comes from Next metadata in [layout.tsx](/Users/nicholaswillette/Repos/Party-Menu/src/app/layout.tsx#L16).
- `BottomSheet` and `PageSheet` backdrops already use `themeColorDimming="auto"` in [BottomSheet/index.tsx](/Users/nicholaswillette/Repos/Party-Menu/src/components/ui/BottomSheet/index.tsx#L49) and [PageSheet/index.tsx](/Users/nicholaswillette/Repos/Party-Menu/src/components/ui/PageSheet/index.tsx#L51).

## Good fits in this repo

- Matching browser chrome to the active party theme after the guest app loads.
- Switching the theme color during full-screen flows or immersive overlays.
- Adjusting the base color dynamically while still letting Silk dim it for presented backdrops.

## Repo guidance

- Keep the static default in Next metadata.
- Use `updateThemeColor` only for runtime changes after hydration.
- If the goal is only sheet backdrop dimming, the current `themeColorDimming="auto"` setup already handles that.
- If you derive the color from party data, keep it in sync with the CSS theme variables but treat it as a separate concern from `useTheme`.

## Implementation checklist

- Keep the static fallback theme color in metadata.
- Call `updateThemeColor` only in client code.
- Choose a base color that still looks correct when Silk dims it.
- If the color is party-driven, update it when the active party changes.

## Example shape

```tsx
import { useEffect } from 'react'
import { updateThemeColor } from '@silk-hq/components'

function PartyThemeChrome({ color }: { color: string }) {
  useEffect(() => {
    updateThemeColor(color)
  }, [color])

  return null
}
```
