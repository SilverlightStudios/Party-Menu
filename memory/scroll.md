# Scroll

Silk's `Scroll` is the advanced version of `overflow: auto`. It is most useful here when a scroll area lives inside or around a sheet, needs better keyboard and focus behavior on mobile, or needs an imperative scroll API.

## Core rules

- The required shape is `Scroll.Root -> Scroll.View -> Scroll.Content`.
- `Scroll.Trigger` is optional and only exists to run a `scroll-to` or `scroll-by` action against the associated scroll instance.
- Use `componentRef` on `Scroll.Root` when code needs `getProgress`, `getDistance`, `scrollTo`, or `scrollBy`.
- If `Scroll.View` sits inside nested flex or grid layouts, make sure the parent chain allows shrinking with `min-height: 0` or `min-width: 0` on the relevant children.
- `pageScroll` and `nativePageScrollReplacement` are only for page-level scrolling. For ordinary panels and sheet bodies, keep `pageScroll={false}`.
- The default `nativeFocusScrollPrevention={true}` plus `onFocusInside` is one of the main reasons to use this primitive around mobile forms.

## Repo status

- We do not use `Scroll` today.
- The repo currently relies on plain `overflow-y: auto` in places like `DrinkMenu`, the guest picker list, `OnboardingStep2`, and some admin shell panels.
- The app layout already sets `suppressHydrationWarning` on `<html>`, so the SSR requirement for `nativePageScrollReplacement` is already covered if we ever use that mode.

## Good fits in this repo

- Long sheet content that mixes scrolling, inputs, and swipe gestures.
- Guest flows where focusing an input should reliably scroll it above the keyboard.
- Page-level mobile views if we later want one API for both page scrolling and panel scrolling.

## Repo guidance

- Keep plain CSS overflow for simple containers that do not need sheet-aware behavior.
- Introduce `Scroll` first inside sheets, where gesture trapping and focus handling matter most.
- Use `scrollGestureTrap` when scroll gestures should not leak into a swipeable sheet or ancestor scroller.
- Use `onScrollStart={{ dismissKeyboard: true }}` for forms where dragging the list should close the keyboard.
- Only use `nativePageScrollReplacement="auto"` for whole-page scroll experiences after verifying that anchor and native text-fragment scrolling are not required.

## Implementation checklist

- Wrap the scroll surface in `Scroll.Root`, `Scroll.View`, and `Scroll.Content`.
- Add `min-height: 0` or `min-width: 0` up the layout tree if scrolling does not activate.
- Keep `pageScroll={false}` unless this scroll instance is intentionally acting as the page.
- Add `onFocusInside` or `onScrollStart` only when keyboard behavior needs to be customized.
- Use `componentRef` instead of manual DOM scroll math when code needs programmatic control.

## Example shape

```tsx
import { Scroll } from '@silk-hq/components'
import { BottomSheet } from '@/components/ui/BottomSheet'

const scrollRef = React.useRef(null)

<BottomSheet.Root presented={showMenu} onPresentedChange={setShowMenu}>
  <BottomSheet.Portal>
    <BottomSheet.View>
      <BottomSheet.Backdrop />
      <BottomSheet.Content>
        <Scroll.Root componentRef={scrollRef}>
          <Scroll.View
            scrollGestureTrap={{ yStart: true, yEnd: true }}
            onFocusInside={{ scrollIntoView: true }}
          >
            <Scroll.Content>{/* long sheet body */}</Scroll.Content>
          </Scroll.View>
        </Scroll.Root>
      </BottomSheet.Content>
    </BottomSheet.View>
  </BottomSheet.Portal>
</BottomSheet.Root>
```
