# animate

Silk's `animate` helper runs a WAAPI animation and persists the final styles inline when the animation finishes. It is useful when a one-off imperative animation is simpler than introducing CSS keyframes or a larger animation library.

## Core rules

- Pass the target `HTMLElement` or `null`.
- Pass keyframes as an object where each key maps to a two-value tuple.
- Duration and easing are optional.
- The helper persists the final visual state as inline styles after the animation completes.
- If the element is `null`, treat it as a no-op path and call it defensively.

## Repo status

- The repo does not use Silk's `animate` helper today.
- Current motion is mostly handled by CSS and Silk's built-in sheet animations.

## Good fits in this repo

- Small imperative reveals or fades tied to a specific event.
- Animations on custom overlay layers that are not worth moving into CSS.
- Cases where preserving the final inline styles is useful and intentional.

## Repo guidance

- Prefer CSS or Silk's declarative animation props when the motion is part of normal component behavior.
- Use `animate` for isolated imperative transitions, especially on refs you already own.
- Be aware that final styles remain inline, so do not use this helper where those inline styles would fight the component's normal styling model.
- If the animation is part of a reusable component contract, declarative motion is usually cleaner.

## Implementation checklist

- Confirm imperative animation is actually the simpler option.
- Animate a ref-owned element, not a queried node when possible.
- Make sure the final inline styles are acceptable after the animation ends.
- Guard against `null` refs if the animation can fire during mount or teardown.

## Example shape

```tsx
import { useRef } from 'react'
import { animate } from '@silk-hq/components'

function Notice() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      onMouseEnter={() =>
        animate(ref.current, { opacity: [0.7, 1] }, { duration: 180, easing: 'ease' })
      }
    >
      Hover me
    </div>
  )
}
```
