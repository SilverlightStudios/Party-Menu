# External Overlays

Use Silk's `ExternalOverlay` when a non-Silk overlay appears on top of the app while Silk sheets are also active. It tells Silk whether that outside overlay should join the inert-outside model or whether sheets should stand down to avoid fighting it.

## Core rules

- `ExternalOverlay.Root` should mount, or switch `disabled` to `false`, at the same time the real overlay appears.
- The default `selfManagedInertOutside={true}` means the foreign overlay manages outside interaction on its own, so Silk sheets should disable their inert-outside behavior.
- Set `selfManagedInertOutside={false}` when the external overlay does not manage inert-outside itself and just needs to be treated as interactive content.
- Use `contentGetter` only when the overlay DOM is created outside React.
- If `disabled` is `true`, Silk ignores it.

## Repo status

- This repo does not use `ExternalOverlay` today.
- Most current overlays are Silk sheets or toasts, so `ExternalOverlay` would be the wrong abstraction for them.
- It becomes relevant if we embed a vendor modal, support widget, or payment or verification UI that inserts DOM outside our sheet tree.

## Repo guidance

- Prefer Silk primitives first: use `Sheet` or `BottomSheet` for our overlays and `Island` for small interactive escape hatches.
- Reach for `ExternalOverlay` only when the overlay is not controlled by Silk.
- If the vendor component already makes the rest of the page inert, leave `selfManagedInertOutside` at `true`.
- If the vendor component is only a floating bubble or panel and does not block the page, set `selfManagedInertOutside={false}` so Silk keeps its normal behavior.

## Implementation checklist

- Confirm the overlay is truly external to Silk.
- Mount `ExternalOverlay.Root` in sync with the third-party overlay.
- Choose the correct `selfManagedInertOutside` mode.
- Use `children` for React-owned overlay wrappers and `contentGetter` for plugin DOM.
- If sheets stop responding correctly, check for timing conflicts caused by both systems mutating inert state in layout effects.

## Example shape

```tsx
import { ExternalOverlay } from '@silk-hq/components'

{showSupportWidget && (
  <ExternalOverlay.Root
    contentGetter="#support-widget-root"
    selfManagedInertOutside={true}
  />
)}
```
