# createComponentId

`createComponentId` is Silk's escape hatch for targeting a specific component instance when nested roots make "closest" ambiguous.

## Core rules

- Call `createComponentId()` once at **module scope**, never inside a component render (HMR and re-renders make inside-render IDs fragile).
- Pass the result to the relevant root via `componentId`.
- Pass that same id to sub-components or related components through `forComponent`.
- Only descendants in the **same React virtual tree** under that root can be linked to the id. DOM location does not matter — React context flows through portals.
- Use it when a sub-component should target a specific root instead of the nearest one.

## What accepts componentId / forComponent

| Component | `componentId` | `forComponent` |
|-----------|--------------|----------------|
| `Sheet.Root` | ✓ (defines a SheetId) | ✓ (targets a SheetStack) |
| `Sheet.Trigger` | — | ✓ (targets a Sheet) |
| `Sheet.Handle` | — | ✓ (targets a Sheet) |
| `Sheet.View` | — | ✓ (targets a Sheet) |
| `Sheet.Outlet` | — | ✓ (targets a Sheet) |
| `SheetStack.Root` | ✓ (defines a SheetStackId) | — |
| `SheetStack.Outlet` | — | ✓ (targets a SheetStack; default = closest ancestor) |
| `AutoFocusTarget.Root` | — | ✓ (targets a Sheet) |
| `Island.Root` | — | ✓ (targets a Sheet or SheetStack) |

## Repo status

- `guestPickerSheetId` — used in `GuestApp` to connect `AutoFocusTarget` (inside picker content) to the picker `Sheet.Root` (its ancestor), skipping the inner `SheetStack.Root`.
- `drinkFlowStackId` — used in `OnboardingStep2` to explicitly connect the drink list and drink detail `BottomSheet.Root` instances to the drink flow `SheetStack.Root`. Using `"closest"` would work equally here since those sheets are direct children of the stack — the explicit id is kept for clarity.

## Good fits in this repo

- When a `Sheet.Trigger` or `Sheet.Handle` inside nested content should control an outer sheet.
- When `AutoFocusTarget` or `Island` should attach to one specific sheet rather than the nearest ancestor.
- When multiple sheet stacks exist in the same subtree and `"closest"` would find the wrong one.

## Repo guidance

- Prefer `forComponent="closest"` until it actually breaks down.
- Introduce `createComponentId` only when there is real ambiguity or a cross-level target.
- Keep ids in module scope near the component that owns them.

## Implementation checklist

- Create the id at module scope.
- Put it on the owning root's `componentId` prop.
- Use the same id in `forComponent` wherever targeting must skip the default.
- If targeting still fails, verify the linked component is actually rendered **under** that root in the React virtual tree.

## Example — Sheet trigger inside nested content targeting outer sheet

```tsx
import { Sheet, createComponentId } from '@silk-hq/components'

const welcomeSheetId = createComponentId()

<Sheet.Root componentId={welcomeSheetId} presented={showWelcome}>
  <Sheet.Portal>
    <Sheet.View>
      <Sheet.Content>
        <Sheet.Root presented={showNested}>
          <Sheet.Portal>
            <Sheet.View>
              <Sheet.Content>
                {/* This trigger lives inside the nested sheet but dismisses the outer one */}
                <Sheet.Trigger forComponent={welcomeSheetId} action="dismiss">
                  Close welcome
                </Sheet.Trigger>
              </Sheet.Content>
            </Sheet.View>
          </Sheet.Portal>
        </Sheet.Root>
      </Sheet.Content>
    </Sheet.View>
  </Sheet.Portal>
</Sheet.Root>
```

## Example — SheetStack with explicit id

```tsx
import { SheetStack, Sheet, createComponentId } from '@silk-hq/components'

const myStackId = createComponentId()

<SheetStack.Root componentId={myStackId}>
  {/* Outlet targets the stack explicitly — same as "closest" here, but unambiguous */}
  <SheetStack.Outlet forComponent={myStackId} asChild stackingAnimation={…}>
    <div>background content</div>
  </SheetStack.Outlet>

  <Sheet.Root forComponent={myStackId} presented={showBase}>…</Sheet.Root>
  <Sheet.Root forComponent={myStackId} presented={showOverlay}>…</Sheet.Root>
</SheetStack.Root>
```
