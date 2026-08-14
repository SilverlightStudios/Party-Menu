# Auto-Focus Targets

Use Silk's `AutoFocusTarget` when sheet-driven focus needs an explicit winner. It is the right tool when plain DOM `autoFocus` is not reliable enough across sheet present and dismiss timing.

## Core rules

- `AutoFocusTarget.Root` only matters when Silk-controlled auto-focus runs.
- `timing` is required and can target `"present"`, `"dismiss"`, or both.
- If several matching targets exist, Silk focuses the first one that is actually focusable.
- `forComponent` scopes the target to one sheet. Omit it only when "any sheet on the page" is really the desired behavior.
- The target still has to be focusable at that moment: not disabled, not inert, and not hidden behind another inert-outside boundary.

## Repo guidance

- Prefer plain DOM `autoFocus` for simple one-off inputs. The guest picker search, add-name input, and custom request textarea already work that way today.
- Reach for `AutoFocusTarget` when focus must be restored on dismiss, when nested sheets compete for the same input, or when a wrapper element should win instead of the first tabbable child.
- If you add it to a real flow, give the related sheet a `componentId` first and scope the target with `forComponent`.
- Use `asChild` so the actual input or button becomes the focus target instead of an extra wrapper `div`.

## Good fits in this repo

- Returning focus to a trigger after a sheet closes.
- Guaranteeing the guest search input wins when welcome and picker sheets overlap.
- Restoring focus to the drinks list after a nested confirmation sheet or custom request sheet dismisses.

## Implementation checklist

- Add `componentId` to the sheet if more than one active sheet could compete nearby.
- Wrap the exact button or input that should win focus with `AutoFocusTarget.Root asChild`.
- Pick the correct `timing` for present, dismiss, or both.
- Keep only one obvious target per sheet and timing path when possible.
- If focus still lands elsewhere, check whether the target is disabled, inert, or no longer mounted.

## Example shape

```tsx
import { AutoFocusTarget, createComponentId } from '@silk-hq/components'
import { BottomSheet } from '@/components/ui/BottomSheet'

const guestPickerSheetId = createComponentId()

<BottomSheet.Root
  componentId={guestPickerSheetId}
  presented={showGuestPicker}
  onPresentedChange={setShowGuestPicker}
>
  <BottomSheet.Portal>
    <BottomSheet.View>
      <BottomSheet.Content>
        <AutoFocusTarget.Root
          asChild
          timing="present"
          forComponent={guestPickerSheetId}
        >
          <input placeholder="Search your name..." />
        </AutoFocusTarget.Root>
      </BottomSheet.Content>
    </BottomSheet.View>
  </BottomSheet.Portal>
</BottomSheet.Root>
```
