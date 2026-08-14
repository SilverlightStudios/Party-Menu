'use client'

import React from 'react'
import { Sheet } from '@silk-hq/components'
import './styles.css'

// ============================================================================
// Root
// ============================================================================

type SheetRootProps = React.ComponentPropsWithoutRef<typeof Sheet.Root>
type BottomSheetRootProps = Omit<SheetRootProps, 'license'> & {
  license?: SheetRootProps['license']
}

const BottomSheetRoot = React.forwardRef<
  React.ComponentRef<typeof Sheet.Root>,
  BottomSheetRootProps
>(({ children, ...restProps }, ref) => (
  <Sheet.Root license="commercial" {...restProps} ref={ref}>
    {children}
  </Sheet.Root>
))
BottomSheetRoot.displayName = 'BottomSheet.Root'

// ============================================================================
// View
// ============================================================================

const BottomSheetView = React.forwardRef<
  React.ComponentRef<typeof Sheet.View>,
  React.ComponentPropsWithoutRef<typeof Sheet.View>
>(({ children, className, ...restProps }, ref) => (
  <Sheet.View
    className={`BottomSheet-view ${className ?? ''}`.trim()}
    nativeEdgeSwipePrevention={true}
    {...restProps}
    ref={ref}
  >
    {children}
  </Sheet.View>
))
BottomSheetView.displayName = 'BottomSheet.View'

// ============================================================================
// Backdrop
// ============================================================================

const BottomSheetBackdrop = React.forwardRef<
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
BottomSheetBackdrop.displayName = 'BottomSheet.Backdrop'

// ============================================================================
// Content
// ============================================================================

const bleedingBgStyle: React.CSSProperties = {
  backdropFilter: 'blur(22px) saturate(180%)',
  WebkitBackdropFilter: 'blur(22px) saturate(180%)',
}

const BottomSheetContent = React.forwardRef<
  React.ComponentRef<typeof Sheet.Content>,
  React.ComponentPropsWithoutRef<typeof Sheet.Content>
>(({ children, className, ...restProps }, ref) => (
  <Sheet.Content
    className={`BottomSheet-content ${className ?? ''}`.trim()}
    {...restProps}
    ref={ref}
  >
    <Sheet.BleedingBackground
      className="BottomSheet-bleedingBackground"
      style={bleedingBgStyle}
    />
    {children}
  </Sheet.Content>
))
BottomSheetContent.displayName = 'BottomSheet.Content'

// ============================================================================
// Handle
// ============================================================================

const BottomSheetHandle = React.forwardRef<
  React.ComponentRef<typeof Sheet.Handle>,
  React.ComponentPropsWithoutRef<typeof Sheet.Handle>
>(({ className, ...restProps }, ref) => (
  <Sheet.Handle
    className={`BottomSheet-handle ${className ?? ''}`.trim()}
    action="dismiss"
    {...restProps}
    ref={ref}
  />
))
BottomSheetHandle.displayName = 'BottomSheet.Handle'

// ============================================================================
// Re-exports
// ============================================================================

export const BottomSheet = {
  Root: BottomSheetRoot,
  Portal: Sheet.Portal,
  View: BottomSheetView,
  Backdrop: BottomSheetBackdrop,
  Content: BottomSheetContent,
  Handle: BottomSheetHandle,
  Trigger: Sheet.Trigger,
  Title: Sheet.Title,
  Description: Sheet.Description,
}
