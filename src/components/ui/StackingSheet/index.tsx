'use client'

import React from 'react'
import { Sheet, SheetStack } from '@silk-hq/components'
import './styles.css'

// ============================================================================
// Types
// ============================================================================

type SheetStackRootProps = React.ComponentPropsWithoutRef<typeof SheetStack.Root>
type SheetStackOutletProps = React.ComponentPropsWithoutRef<typeof SheetStack.Outlet>
type SheetRootProps = React.ComponentPropsWithoutRef<typeof Sheet.Root>

// ============================================================================
// Root
// ============================================================================

const StackingSheetRoot = React.forwardRef<
  React.ComponentRef<typeof SheetStack.Root>,
  SheetStackRootProps
>(({ children, ...restProps }, ref) => (
  <SheetStack.Root {...restProps} ref={ref}>
    {children}
  </SheetStack.Root>
))
StackingSheetRoot.displayName = 'StackingSheet.Root'

// ============================================================================
// Outlet
// Animates the wrapped element as sheets stack above the base layer.
// forComponent="closest" targets the nearest StackingSheet.Root ancestor via
// React context — this works correctly even when placed inside a portal.
// ============================================================================

const DEFAULT_STACKING_ANIMATION: SheetStackOutletProps['stackingAnimation'] = {
  scale: ['1', '0.96'],
  translateY: ['0px', '-18px'],
  opacity: ['1', '0.9'],
}

const StackingSheetOutlet = React.forwardRef<
  React.ComponentRef<typeof SheetStack.Outlet>,
  SheetStackOutletProps
>(({ stackingAnimation = DEFAULT_STACKING_ANIMATION, ...restProps }, ref) => (
  <SheetStack.Outlet
    forComponent="closest"
    stackingAnimation={stackingAnimation}
    {...restProps}
    ref={ref}
  />
))
StackingSheetOutlet.displayName = 'StackingSheet.Outlet'

// ============================================================================
// Layer (Sheet.Root)
// Each Layer is a sheet that joins the nearest StackingSheet.Root stack.
// license and forComponent are baked in; all other Sheet.Root props pass through.
// ============================================================================

type StackingSheetLayerRootProps = Omit<SheetRootProps, 'license'> & {
  license?: SheetRootProps['license']
}

const StackingSheetLayerRoot = React.forwardRef<
  React.ComponentRef<typeof Sheet.Root>,
  StackingSheetLayerRootProps
>(({ children, ...restProps }, ref) => (
  <Sheet.Root
    license="commercial"
    forComponent="closest"
    {...restProps}
    ref={ref}
  >
    {children}
  </Sheet.Root>
))
StackingSheetLayerRoot.displayName = 'StackingSheet.Layer'

// ============================================================================
// Layer.View
// ============================================================================

const StackingSheetLayerView = React.forwardRef<
  React.ComponentRef<typeof Sheet.View>,
  React.ComponentPropsWithoutRef<typeof Sheet.View>
>(({ children, className, ...restProps }, ref) => (
  <Sheet.View
    className={`StackingSheet-layerView ${className ?? ''}`.trim()}
    nativeEdgeSwipePrevention={true}
    {...restProps}
    ref={ref}
  >
    {children}
  </Sheet.View>
))
StackingSheetLayerView.displayName = 'StackingSheet.Layer.View'

// ============================================================================
// Layer.Backdrop
// ============================================================================

const StackingSheetLayerBackdrop = React.forwardRef<
  React.ComponentRef<typeof Sheet.Backdrop>,
  React.ComponentPropsWithoutRef<typeof Sheet.Backdrop>
>(({ className, ...restProps }, ref) => (
  <Sheet.Backdrop
    className={className}
    themeColorDimming="auto"
    {...restProps}
    ref={ref}
  />
))
StackingSheetLayerBackdrop.displayName = 'StackingSheet.Layer.Backdrop'

// ============================================================================
// Layer.Content
// BleedingBackground is included automatically — backdrop-filter applied via
// inline style to bypass PostCSS autoprefixer stripping -webkit- prefix.
// ============================================================================

const bleedingBgStyle: React.CSSProperties = {
  backdropFilter: 'blur(22px) saturate(180%)',
  WebkitBackdropFilter: 'blur(22px) saturate(180%)',
}

const StackingSheetLayerContent = React.forwardRef<
  React.ComponentRef<typeof Sheet.Content>,
  React.ComponentPropsWithoutRef<typeof Sheet.Content>
>(({ children, className, stackingAnimation = DEFAULT_STACKING_ANIMATION, ...restProps }, ref) => (
  <Sheet.Content
    className={`StackingSheet-layerContent ${className ?? ''}`.trim()}
    stackingAnimation={stackingAnimation}
    {...restProps}
    ref={ref}
  >
    <Sheet.BleedingBackground
      className="StackingSheet-layerBleedingBackground"
      style={bleedingBgStyle}
    />
    {children}
  </Sheet.Content>
))
StackingSheetLayerContent.displayName = 'StackingSheet.Layer.Content'

// ============================================================================
// Layer.Handle
// ============================================================================

const StackingSheetLayerHandle = React.forwardRef<
  React.ComponentRef<typeof Sheet.Handle>,
  React.ComponentPropsWithoutRef<typeof Sheet.Handle>
>(({ className, ...restProps }, ref) => (
  <Sheet.Handle
    className={`StackingSheet-layerHandle ${className ?? ''}`.trim()}
    action="dismiss"
    {...restProps}
    ref={ref}
  />
))
StackingSheetLayerHandle.displayName = 'StackingSheet.Layer.Handle'

// ============================================================================
// Layer — compound component (Root + sub-components)
// ============================================================================

const StackingSheetLayer = Object.assign(StackingSheetLayerRoot, {
  Portal: Sheet.Portal,
  View: StackingSheetLayerView,
  Backdrop: StackingSheetLayerBackdrop,
  Content: StackingSheetLayerContent,
  Handle: StackingSheetLayerHandle,
  Trigger: Sheet.Trigger,
  Title: Sheet.Title,
  Description: Sheet.Description,
})

// ============================================================================
// Re-exports
// ============================================================================

export const StackingSheet = {
  Root: StackingSheetRoot,
  Outlet: StackingSheetOutlet,
  Layer: StackingSheetLayer,
}
