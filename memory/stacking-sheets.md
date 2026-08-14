# Stacking Sheets

This repo uses Silk's `SheetStack` when one sheet should visually react to another sheet opening on top of it. Use it for layered travel and parallax, not for ordinary sheet presentation.

## Sub-components

### SheetStack.Root

| Prop | Default | Notes |
|------|---------|-------|
| `componentId` | — | Explicit SheetStackId. Pass to `SheetStack.Outlet` and `Sheet.Root` `forComponent` to associate them with this exact stack. |
| `asChild` | — | Render the stack root as the passed child element. |

Underlying element: `<div>`. Apply `display: contents` if it should not affect layout.

### SheetStack.Outlet

| Prop | Default | Notes |
|------|---------|-------|
| `stackingAnimation` | — | CSS property animations driven by stacking progress. See below. |
| `forComponent` | Closest `SheetStack.Root` ancestor | Override to target a specific SheetStack by ID when nesting is ambiguous. |
| `asChild` | — | Render the outlet as the passed child element (most common usage). |

Underlying element: `<div>`. Composition: child of `SheetStack.Root` in the React virtual tree — but because Silk resolves `forComponent` via React context (not DOM), the outlet can also live inside a sheet's portal and still find its stack correctly.

## Core rules

- `SheetStack.Root` must wrap the related `Sheet.Root` instances and any `SheetStack.Outlet` tied to that stack.
- The **first sheet associated with a stack** is the base layer. Every stacking animation is measured against sheets traveling above that first sheet.
- `SheetStack.Outlet` is what actually animates. Without an outlet, sheets can share a stack but nothing underneath will visibly shift, scale, or fade.
- Sheets can be **siblings** or **nested** — both patterns work.
- **Current Silk limitation**: only the frontmost sheet in a stack can be dismissed. Attempting to dismiss a non-frontmost sheet while another is stacked above it does nothing.
- Updating `stackingAnimation` does not change the current transition immediately — the new value applies on the next travel.

## stackingAnimation

Animates the outlet element based on the aggregated travel of all sheets stacked above the base sheet in this stack.

```tsx
<SheetStack.Outlet
  asChild
  stackingAnimation={{
    scale: ['1', '0.96'],
    translateY: ['0px', '-18px'],
    opacity: ['1', '0.9'],
  }}
>
  <div>…</div>
</SheetStack.Outlet>
```

### Value types

| Syntax | Example | Notes |
|--------|---------|-------|
| `[start, end]` array | `['1', '0.96']` | Linear interpolation. **Only for `opacity` and individual transform sub-properties.** |
| `({ progress, tween }) => value` | `({ progress }) => progress * 100 + 'px'` | Compute from progress. Works on any CSS property. |
| `string` | `'rgba(0,0,0,0.5)'` | Snaps to value while sheets are stacked. |
| `null` / `undefined` | | Removes animation on that property. |

### Progress range for function syntax

`stackingAnimation` progress goes **`0 → n`** where `n` is the number of sheets currently stacked above the base sheet — **not** clamped to 1. If you want a 0–1 range regardless of how many sheets are stacked, clamp manually:

```tsx
stackingAnimation={{ opacity: ({ progress }) => 1 - Math.min(progress, 1) * 0.1 }}
```

### Array syntax restriction

`[start, end]` keyframes only work for `opacity` and individual transform sub-properties:
`scale`, `scaleX`, `scaleY`, `scaleZ`, `translate`, `translateX`, `translateY`, `translateZ`, `rotate`, `rotateX`, `rotateY`, `rotateZ`, `skew`, `skewX`, `skewY`

Does **not** work for `borderRadius`, `backgroundColor`, or any other CSS property. Use function syntax for those.

### CSS property naming

Use camelCase: e.g. `borderRadius`, not `border-radius`.

## forComponent on Sheet.Root

```tsx
// Option A — no explicit id, use "closest"
<SheetStack.Root>
  <Sheet.Root forComponent="closest">…</Sheet.Root>
  <Sheet.Root forComponent="closest">…</Sheet.Root>
</SheetStack.Root>

// Option B — explicit id (use when multiple stacks are in scope)
const stackId = createComponentId()

<SheetStack.Root componentId={stackId}>
  <Sheet.Root forComponent={stackId}>…</Sheet.Root>
  <Sheet.Root forComponent={stackId}>…</Sheet.Root>
</SheetStack.Root>
```

Use `forComponent="closest"` when the sheet roots are direct children of `SheetStack.Root` — the nearest ancestor is unambiguous. Use an explicit `componentId` + `forComponent` only when several `SheetStack.Root` instances are active in the same subtree and "closest" would find the wrong one.

## Anatomy

### Sibling sheets (most common in this repo)

```tsx
<SheetStack.Root>
  <BottomSheet.Root forComponent="closest" presented={showMenu}>
    <BottomSheet.Portal>
      <BottomSheet.View>
        <BottomSheet.Backdrop />
        <BottomSheet.Content>
          {/* Outlet lives inside the portal content — React context still finds the stack */}
          <SheetStack.Outlet
            asChild
            stackingAnimation={{
              scale: ['1', '0.96'],
              translateY: ['0px', '-18px'],
              opacity: ['1', '0.9'],
            }}
          >
            <div>{/* menu sheet UI */}</div>
          </SheetStack.Outlet>
        </BottomSheet.Content>
      </BottomSheet.View>
    </BottomSheet.Portal>
  </BottomSheet.Root>

  <BottomSheet.Root forComponent="closest" presented={showDetail}>
    {/* detail sheet — stacks over menu */}
  </BottomSheet.Root>
</SheetStack.Root>
```

### Nested sheets

The nested sheet uses `forComponent="closest"` — "closest" resolves via React context through the portal and finds the outer `SheetStack.Root`.

```tsx
<SheetStack.Root>
  <Sheet.Root forComponent="closest" presented={showOuter}>
    <Sheet.Portal>
      <Sheet.View>
        <Sheet.Content>
          {/* Outlet animates this content when inner sheet stacks above */}
          <SheetStack.Outlet asChild stackingAnimation={{ scale: ['1', '0.96'] }}>
            <div>
              outer sheet content

              {/* Nested sheet — joins same SheetStack via "closest" */}
              <Sheet.Root forComponent="closest" presented={showInner}>
                <Sheet.Portal>
                  <Sheet.View>
                    <Sheet.Content>inner sheet content</Sheet.Content>
                  </Sheet.View>
                </Sheet.Portal>
              </Sheet.Root>
            </div>
          </SheetStack.Outlet>
        </Sheet.Content>
      </Sheet.View>
    </Sheet.Portal>
  </Sheet.Root>
</SheetStack.Root>
```

## Repo patterns

Use a dedicated stack for each sheet hierarchy instead of one oversized global stack.

### App shell stack (`GuestApp`)

- Top-level `SheetStack.Root` for the welcome sheet and guest picker.
- The main guest screen sits inside a `SheetStack.Outlet` so the shell scales and shifts while onboarding sheets slide over it.

### Main guest stack (`GuestApp`)

- A second nested `SheetStack.Root` wraps `MainView`.
- That stack is the local stacking context for any sheet flows rendered inside the guest screen (e.g. poke sheet).

### Order flow stack (`OnboardingStep2`)

1. The drinks menu sheet is the **first** sheet in the stack (base layer).
2. The drinks menu content is wrapped by `SheetStack.Outlet` — this is the element that scales back.
3. The drink detail sheet is the **second** sheet — it stacks over the menu.

Produces:
- Opening drinks menu → stacks over the guest home flow.
- Opening a drink detail → stacks over the drinks menu; menu scales/fades back.
- Dismissing detail → menu restores.
- Ordering a drink → detail dismissed programmatically, menu remains until user closes it.

### Independent overlays

- `PendingOrderSheet` stays **outside** any stack — it hovers independently rather than shrinking the active screen.
- `Toast` also stays outside stack logic for the same reason.

## Implementation checklist

- Put `SheetStack.Root` above the sheet roots that should stack together.
- Put `SheetStack.Outlet asChild` around the element that should animate (inside the base sheet's content, or as a direct child of the stack root).
- The **first** sheet associated with the stack becomes the base — order matters.
- Use `forComponent="closest"` on sheet roots unless named stack targeting is required.
- Keep overlays that should not parallax or shrink entirely outside any stack.
- **If stacking appears broken**: first check whether the animated layer is inside an outlet — that is the most common failure mode.
- **If the wrong layer is animating**: check sheet order. The first associated sheet is always the base.
- **Never call `flushSync` or `document.startViewTransition` inside a Silk event callback** (e.g. `onPresentedChange`). Forcing synchronous React renders while Silk is dispatching pointer events corrupts Silk's internal state machine and causes unexpected sheet dismissals.
