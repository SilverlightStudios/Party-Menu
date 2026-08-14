# Interactive Islands

Use Silk's `Island` when a presented sheet keeps `inertOutside={true}` but some UI outside that sheet must stay interactive.

## Core rules

- `Island` only matters when an associated sheet uses Silk's inert-outside behavior.
- `Island.Content` is the normal path for React-owned UI. `contentGetter` is the escape hatch for DOM you cannot wrap.
- Scope islands with `forComponent` when only some sheets should honor them.
- `forComponent` can target a specific sheet id, a stack id, or an array of both.
- `Island.Content` traps swipe and scroll gestures inside the island.
- If `disabled` is `true`, the island does nothing.

## Repo status

- We do not use `Island` today.
- Most always-on overlays in this repo avoid the issue by setting `inertOutside={false}` instead, such as `Toast.View` and `PendingOrderSheet`.
- Add `Island` if we want to keep a specific outside control interactive while the rest of the page remains inert.

## Good fits in this repo

- A floating host action bar that should stay clickable while a bottom sheet is open.
- A fixed nav or media control strip that must remain interactive over guest flows.
- A third-party chat launcher that belongs to one sheet stack instead of the whole page.

## Repo guidance

- Prefer `Island.Content` for anything we render in React ourselves.
- Use `contentGetter` only for outside-owned DOM such as plugin containers.
- Pair islands with explicit `componentId` or stack ids when multiple independent sheet regions are on screen.
- Do not use `Island` as a substitute for `inertOutside={false}` when the whole page should remain interactive. In that case, disable inert-outside on the sheet instead.

## Implementation checklist

- Decide whether the sheet should keep inert-outside enabled. If yes, add an island for the exception area.
- Give the relevant sheet or stack a `componentId` if the island should not be global.
- Wrap the interactive region in `Island.Content`.
- Keep the island outside the associated `Sheet.View`.
- If behavior is inconsistent, check that the island is mounted and scoped to the intended sheet or stack.

## Example shape

```tsx
import { Island, createComponentId } from '@silk-hq/components'
import { BottomSheet } from '@/components/ui/BottomSheet'

const menuSheetId = createComponentId()

<>
  <Island.Root forComponent={menuSheetId}>
    <Island.Content>
      <button className="floatingAction">Need help?</button>
    </Island.Content>
  </Island.Root>

  <BottomSheet.Root
    componentId={menuSheetId}
    presented={showMenu}
    onPresentedChange={setShowMenu}
  >
    <BottomSheet.Portal>
      <BottomSheet.View inertOutside={true}>
        <BottomSheet.Content>{/* sheet UI */}</BottomSheet.Content>
      </BottomSheet.View>
    </BottomSheet.Portal>
  </BottomSheet.Root>
</>
```
