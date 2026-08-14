# usePageScrollData

`usePageScrollData` tells you whether Silk is replacing native page scroll with a `Scroll.View`, and which element currently acts as the page scroll container.

## Core rules

- On first render, both values can be `undefined`.
- After hydration, `nativePageScrollReplaced` becomes either `true` or `false`.
- When `nativePageScrollReplaced` is `true`, `pageScrollContainer` is the active scroll container element.
- When `nativePageScrollReplaced` is `false`, `pageScrollContainer` is `document.body`.
- This hook only matters when the app uses `Scroll.View` with `pageScroll` and potentially `nativePageScrollReplacement`.

## Repo status

- The repo does not use `Scroll` for page scrolling today.
- Because of that, `usePageScrollData` is not currently needed.
- The app layout already has `suppressHydrationWarning` on `<html>`, so the SSR requirement is already in place if we ever adopt native page scroll replacement.

## Good fits in this repo

- Adapting travel or clip animations depending on whether native page scroll is replaced.
- Wiring scroll-driven libraries to the correct container when the page scroller stops being `document.body`.
- Any component that needs to know which element is effectively the page scroller before measuring offsets.

## Repo guidance

- Ignore this hook unless we intentionally adopt `Scroll.View pageScroll`.
- If we do adopt page scroll replacement, use this hook instead of hardcoding `window` or `document.body`.
- Guard logic for the initial `undefined` state during hydration.
- Pair it with [scroll.md](/Users/nicholaswillette/Repos/Party-Menu/memory/scroll.md), not with ordinary panel-level scrolling.

## Implementation checklist

- Confirm the page actually uses `Scroll.View pageScroll`.
- Read `nativePageScrollReplaced` before assuming the correct scroll container.
- Use `pageScrollContainer` when integrating scroll-driven animation or measurements.
- Handle the pre-hydration `undefined` state safely.

## Example shape

```tsx
import { usePageScrollData } from '@silk-hq/components'

function ScrollAwarePanel() {
  const { pageScrollContainer, nativePageScrollReplaced } = usePageScrollData()

  if (nativePageScrollReplaced === undefined) return null

  return (
    <div data-scroll-root={nativePageScrollReplaced ? 'silk' : 'native'}>
      {pageScrollContainer ? 'ready' : 'loading'}
    </div>
  )
}
```
