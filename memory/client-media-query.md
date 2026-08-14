# useClientMediaQuery

`useClientMediaQuery` is Silk's small client-only hook for turning a CSS media query into React state.

## Core rules

- It returns `false` on the server.
- After hydration, it reflects whether the query currently matches.
- It updates over time if the media query result changes.
- The input is a raw CSS media query string such as `"(min-width: 500px)"`.

## Repo status

- The repo does not use this hook today.
- Current responsive behavior is mostly CSS-driven through SCSS breakpoints, which should remain the default.

## Good fits in this repo

- Switching component behavior, not just styling, based on viewport or capability.
- Enabling or disabling expensive effects for coarse pointers, hover capability, or reduced motion.
- Choosing between two interaction patterns when CSS alone cannot express the difference.

## Repo guidance

- Prefer CSS media queries for layout and styling.
- Use `useClientMediaQuery` only when React logic has to branch.
- Remember the server value is always `false`; avoid rendering logic that would cause a bad hydration mismatch.
- If the behavior matters before hydration, CSS is usually the better solution.

## Implementation checklist

- Start with a CSS solution first.
- Use this hook only if component logic truly depends on the query result.
- Account for the initial server `false` value.
- Keep the query string simple and explicit.

## Example shape

```tsx
import { useClientMediaQuery } from '@silk-hq/components'

function GuestToolbar() {
  const largeViewport = useClientMediaQuery('(min-width: 768px)')

  return largeViewport ? <DesktopActions /> : <MobileActions />
}
```
