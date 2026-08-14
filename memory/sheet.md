# Silk Sheet

Quick reference for `Sheet` from `@silk-hq/components`. Covers the props and behaviors that come up repeatedly in this repo.

## Anatomy

```tsx
<Sheet.Root license="commercial">
  <Sheet.Trigger />
  <Sheet.Outlet />          {/* travel- or stacking-driven animation on a sibling element */}
  <Sheet.Portal>
    <Sheet.View>
      <Sheet.Backdrop />
      <Sheet.Content>
        <Sheet.BleedingBackground />
        <Sheet.Handle />
        <Sheet.Title />
        <Sheet.Description />
      </Sheet.Content>
    </Sheet.View>
  </Sheet.Portal>
</Sheet.Root>
```

## Sheet.Root

| Prop | Default | Notes |
|------|---------|-------|
| `license` | — | Required. Pass `"commercial"` for this repo. |
| `presented` | `undefined` | Controlled mode. Must pair with `onPresentedChange`. |
| `onPresentedChange` | — | Required when `presented` is used. |
| `defaultPresented` | `false` | Uncontrolled initial state. |
| `activeDetent` | `undefined` | Controlled active detent index. Pair with `onActiveDetentChange`. |
| `onActiveDetentChange` | — | Required when `activeDetent` is used. |
| `defaultActiveDetent` | `undefined` | Uncontrolled initial detent. Defaults to index 1 if not set. |
| `sheetRole` | `undefined` | Sets WAI-ARIA role on `Sheet.View`. **Critically changes behavior when `"alertdialog"`** — see below. |
| `componentId` | — | Explicit ID for cross-level targeting. See `create-component-id.md`. |
| `forComponent` | — | Associates this Sheet with a SheetStack. `"closest"` or an explicit `SheetStackId`. |

### sheetRole — behavioral impact

When `sheetRole="alertdialog"`:
- `swipeDismissal` is forced to `false`
- `onClickOutside` is forced to `{ dismiss: false, stopOverlayPropagation: true }`
- `onEscapeKeyDown` is forced to `{ dismiss: false, stopOverlayPropagation: true }`

Use `"alertdialog"` for confirmations that must not be accidentally dismissed.

### Controlled mode critical limitation

> Sheet **cannot be closed when it is not frontmost in a SheetStack** (i.e. a sheet is stacked on top of it). If `presented` is set to `false` during entering, or when not frontmost, **nothing will happen**. Silk calls `onPresentedChange` with the *current* value to prevent mismatch between controlled state and internal state.

Practical impact:
- Never try to close the base sheet while an overlay sheet is stacked on top of it.
- Setting `presented` in the opposite direction during animation is silently ignored.
- Silk fires `onPresentedChange` to sync the controlled state when it ignores a `presented` change.
- The same applies to `activeDetent`: do not step while `travelStatus !== "stepping"` is already occurring.

### Controlled detent pattern (multi-detent sheets)

```tsx
const [detent, setDetent] = useState(1)

<Sheet.Root
  license="commercial"
  presented={show}
  onPresentedChange={setShow}
  activeDetent={detent}
  onActiveDetentChange={setDetent}
>
```

## Sheet.View

| Prop | Default | Notes |
|------|---------|-------|
| `forComponent` | closest Sheet.Root | Associates this view with a specific Sheet when using `componentId`. |
| `contentPlacement` | `"bottom"` | `"top"`, `"left"`, `"right"` also valid. Matches `tracks` if set. |
| `tracks` | `"bottom"` | One or two tracks the content can travel on. `["top", "bottom"]` enables bidirectional. |
| `detents` | `undefined` | String defining one or more intermediate detent positions between dismissed (0) and fully open (n). |
| `inertOutside` | `true` | `true` = modal. `false` = non-modal (see Safari note below). |
| `swipeDismissal` | `true` | `false` keeps sheet swipeable but won't dismiss. Always `false` for `alertdialog`. |
| `swipe` | `true` | `false` disables swipe entirely. Can only update while sheet is resting on a detent. |
| `swipeOvershoot` | `true` | Elastic overshoot on swipe past last detent. Safari + Firefox macOS only. When `false`, `swipeTrap` on travel axis is forced `true`. |
| `swipeTrap` | `true` (Android non-standalone: `{ x: true, y: false }`) | `true` traps swipe on both axes. Object to trap specific axes. |
| `nativeEdgeSwipePrevention` | `false` | Prevents iOS Safari "go back" swipe from left edge via a 28px blocking element. |
| `onClickOutside` | `{ dismiss: true, stopOverlayPropagation: true }` | **Default dismisses on click outside.** |
| `onEscapeKeyDown` | `{ dismiss: true, stopOverlayPropagation: true }` | Default dismisses on Escape. |
| `onTravelStatusChange` | `undefined` | Fires on every travel status change. Values: `"entering" \| "idleInside" \| "stepping" \| "exiting" \| "idleOutside"`. |
| `onTravel` | `undefined` | Fires every frame during travel. `({ progress, range, progressAtDetents }) => void`. |
| `onTravelStart` | `undefined` | Fires when travel begins (before first `onTravel`). |
| `onTravelEnd` | `undefined` | Fires when travel ends (before last `onTravel`). |
| `onTravelRangeChange` | `undefined` | Fires when the active detent range changes. `({ start, end }) => void`. |
| `onPresentAutoFocus` | `{ focus: true }` | Fires after entering animation. `{ focus: false }` to suppress auto-focus. |
| `onDismissAutoFocus` | `{ focus: true }` | Fires after exiting animation. |
| `nativeFocusScrollPrevention` | `true` | Prevents native browser scroll-into-view when an element inside receives focus. |

### onTravelStatusChange — values in order

```
idleOutside → entering → idleInside → [stepping…] → exiting → idleOutside
```

`"idleOutside"` means the sheet is fully dismissed and at rest. Use this to trigger logic after a sheet finishes closing (e.g. GuestApp uses it to commit guest selection after the picker sheet closes).

### onClickOutside — key behaviors

- Default: `{ dismiss: true, stopOverlayPropagation: true }` — sheet dismisses on any outside click.
- `{ dismiss: false }` — never dismisses on outside click. Required for toasts, non-dismissing sidebars, persistent sheets.
- `{ stopOverlayPropagation: false }` — lets the click-outside event fall through to sheets below. Useful for non-modal overlays (toasts, persistent sheets) sitting over another sheet that *should* still dismiss.
- Backdrop clicks count as "outside". `Sheet.View` itself is click-through.

### Non-modal sheets (inertOutside: false) in Safari

When `inertOutside={false}` AND (no `Sheet.Backdrop` OR backdrop has `swipeable={false}`), Safari cannot swipe the sheet. Fix: wrap content in `Sheet.SpecialWrapper`.

```tsx
<Sheet.Content>
  <Sheet.SpecialWrapper.Root>
    <Sheet.SpecialWrapper.Content>
      {/* sheet content */}
    </Sheet.SpecialWrapper.Content>
  </Sheet.SpecialWrapper.Root>
</Sheet.Content>
```

SpecialWrapper limitation: uses `overflow` other than `visible`, so overflowing content is clipped.

## Sheet.Outlet (travel-driven, single-sheet)

`Sheet.Outlet` is a **different component from `SheetStack.Outlet`**. It animates an element based on the travel or stacking of its *associated Sheet* (not the SheetStack). Useful for animating elements outside the portal — e.g. a background behind the trigger.

```tsx
<Sheet.Root>
  <Sheet.Outlet
    travelAnimation={{ opacity: [0, 1] }}
    stackingAnimation={{ scale: ['1', '0.96'] }}
  />
  <Sheet.Portal>...</Sheet.Portal>
</Sheet.Root>
```

`forComponent` — associates the outlet with a specific Sheet when the closest ancestor isn't the right one.

## travelAnimation and stackingAnimation

These props are available on: `Sheet.Outlet`, `Sheet.Trigger`, `Sheet.Handle`, `Sheet.Backdrop`, `Sheet.Content`, `Sheet.BleedingBackground`, `Sheet.Title`, `Sheet.Description`.

### Value types

| Syntax | Example | When to use |
|--------|---------|-------------|
| `[start, end]` array | `['1', '0.96']` | Only for `opacity` and individual transform sub-properties. Linear interpolation between values. |
| `({ progress, tween }) => value` | `({ progress }) => progress * 100 + 'px'` | Any CSS property. Compute value from progress. |
| `string` | `'rgba(0,0,0,0.5)'` | Snaps to value while another sheet is stacked/traveling. |
| `null` / `undefined` | | Removes any animation on that property. |

### Progress ranges

- **`travelAnimation`**: progress goes `0 → 1` (0 = detent 0/dismissed, 1 = last detent/fully open).
- **`stackingAnimation`**: progress goes `0 → n` where **n = number of sheets stacked above**. Not clamped to 1. The function syntax must account for multiple stacked sheets: `({ progress }) => Math.min(progress, 1) * value`.

### Array syntax restriction

Keyframes array `[start, end]` **only works** for `opacity` and individual transform sub-properties:
`translate`, `translateX`, `translateY`, `translateZ`, `scale`, `scaleX`, `scaleY`, `scaleZ`, `rotate`, `rotateX`, `rotateY`, `rotateZ`, `skew`, `skewX`, `skewY`

Does **not** work for: `borderRadius`, `backgroundColor`, `color`, or any other CSS property. Use function syntax for those.

### Special clip properties (travelAnimation only)

Three special properties for clip-based reveal animations:
- `clipBoundary: "layout-viewport"` — clips the element at the layout viewport edge.
- `clipBorderRadius` — border radius for the clip area (use with `clipBoundary`).
- `clipTransformOrigin` — transform origin for the clip (use with `clipBoundary`).

## Sheet.Trigger

```tsx
<Sheet.Trigger
  action="dismiss"
  forComponent={mySheetId}
  onPress={{ forceFocus: false }}
>
```

| Prop | Default | Notes |
|------|---------|-------|
| `action` | `"present"` | `"present"`, `"dismiss"`, `"step"`, or `{ type: "step", direction?: "up"\|"down", detent?: number }`. |
| `forComponent` | closest Sheet.Root | Override to target a specific Sheet by ID. |
| `onPress` | `{ forceFocus: true, runAction: true }` | `forceFocus: true` ensures focus on press in Safari. `runAction: false` fires the handler without running the sheet action. |

`"step"` action cycles through detents in the upward direction. `{ type: "step", direction: "down" }` goes downward. `{ type: "step", detent: 2 }` jumps to a specific detent index.

## Sheet.Handle

Default `action` is **`"step"`** — cycles through detents. The `BottomSheet` wrapper in this repo overrides it to `action="dismiss"`. Accepts `travelAnimation` and `stackingAnimation` like other sub-components.

## Sheet.Backdrop

| Prop | Default | Notes |
|------|---------|-------|
| `swipeable` | `true` | When `false`, swiping over backdrop does not move the sheet. Requires SpecialWrapper in Safari. |
| `themeColorDimming` | `false` | `"auto"` dims the OS status bar (theme-color meta tag) in WebKit to blend with the backdrop. Requires specific setup — see official docs. |

Default `travelAnimation` on backdrop: `({ progress }) => Math.min(progress * 0.33, 0.33)` (auto opacity fade in).
Remove it with `travelAnimation={{ opacity: null }}`.

## Sheet.BleedingBackground

Renders a div that fills `Sheet.Content` and bleeds out in the dismiss direction to cover overshoot gaps. Style it freely.

Performance note: the element is resized during entering/exiting animations. Avoid gradients or images whose size is based on the element's dimensions — use fixed `px`/`svh` values instead to prevent visual shifts.

## Sheet.Portal

| Prop | Default | Notes |
|------|---------|-------|
| `container` | `document.body` | The DOM element to portal into. Override to render the sheet inside a specific container. |

## Animation presets (enteringAnimationSettings / exitingAnimationSettings / steppingAnimationSettings)

All presets are spring-based. Pass as a string shorthand or `{ preset: "..." }`.

| Preset | Feel |
|--------|------|
| `"gentle"` | Slow, soft landing |
| `"smooth"` | Default. Balanced. |
| `"snappy"` | Quick settle |
| `"brisk"` | Faster, lighter |
| `"bouncy"` | Overshoots then settles |
| `"elastic"` | Maximum bounce |

Extra keys available in addition to preset/easing:
- `{ contentMove: false }` — content snaps to destination instantly; other elements animate normally. Useful for stacking-like transitions where content should not slide.
- `{ skip: true }` — animation skipped entirely; sheet jumps to final state.
- `{ track: "top" }` — for two-track sheets, selects which track to travel on.

Custom spring: `{ easing: "spring", stiffness: 560, damping: 68, mass: 1.85 }`.
Custom easing: `{ easing: "ease-out", duration: 300 }`.

Note: `track` and `contentMove` do not apply to `steppingAnimationSettings`.

## Detents

- Index `0`: sheet fully outside view (dismissed/origin).
- Index `1` to `n-1`: intermediate detents declared via `detents` prop on `Sheet.View`.
- Index `n`: sheet fully expanded (last detent).
- Default entry lands on index 1. `defaultActiveDetent={2}` to start on a higher detent.

## Repo conventions

- All sheets use controlled mode (`presented` / `onPresentedChange`).
- Reusable wrappers live in `src/components/ui/`: `BottomSheet`, `PageSheet`, `Toast`.
- `BottomSheet` wrapper sets `license="commercial"` and `nativeEdgeSwipePrevention={true}` automatically.
- Toasts and `PendingOrderSheet` always live **outside** any `SheetStack.Root` — they must never participate in stacking logic.
- For non-modal sheets, `PendingOrderSheet` uses `Sheet` directly (not the `BottomSheet` wrapper) and includes `SpecialWrapper` for Safari.
- `onPresentedChange` may be called with the current value (no change) when Silk rejects a state update. Always mirror Silk's value rather than toggling.
