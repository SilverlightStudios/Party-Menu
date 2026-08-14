'use client'

import React from 'react'
import { Sheet } from '@silk-hq/components'
import './styles.css'

// ============================================================================
// Root
// ============================================================================

type SheetRootProps = React.ComponentPropsWithoutRef<typeof Sheet.Root>
type PageSheetRootProps = Omit<SheetRootProps, 'license'> & {
  license?: SheetRootProps['license']
}

const PageSheetRoot = React.forwardRef<
  React.ComponentRef<typeof Sheet.Root>,
  PageSheetRootProps
>(({ children, ...restProps }, ref) => (
  <Sheet.Root license="commercial" {...restProps} ref={ref}>
    {children}
  </Sheet.Root>
))
PageSheetRoot.displayName = 'PageSheet.Root'

// ============================================================================
// View
// ============================================================================

const PageSheetView = React.forwardRef<
  React.ComponentRef<typeof Sheet.View>,
  React.ComponentPropsWithoutRef<typeof Sheet.View>
>(({ children, className, ...restProps }, ref) => (
  <Sheet.View
    className={`PageSheet-view ${className ?? ''}`.trim()}
    contentPlacement="bottom"
    swipe={false}
    nativeEdgeSwipePrevention={true}
    {...restProps}
    ref={ref}
  >
    {children}
  </Sheet.View>
))
PageSheetView.displayName = 'PageSheet.View'

// ============================================================================
// Backdrop
// ============================================================================

const PageSheetBackdrop = React.forwardRef<
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
PageSheetBackdrop.displayName = 'PageSheet.Backdrop'

// ============================================================================
// Content
// ============================================================================

const contentBlurStyle: React.CSSProperties = {
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)',
}

const PageSheetContent = React.forwardRef<
  React.ComponentRef<typeof Sheet.Content>,
  React.ComponentPropsWithoutRef<typeof Sheet.Content>
>(({ children, className, title, ...restProps }, ref) => (
  <Sheet.Content
    className={`PageSheet-content ${className ?? ''}`.trim()}
    style={contentBlurStyle}
    {...restProps}
    ref={ref}
  >
    <div className="PageSheet-topBar">
      <span className="PageSheet-topBarTitle">{title}</span>
      <Sheet.Trigger className="PageSheet-dismissTrigger" action="dismiss">
        Done
      </Sheet.Trigger>
    </div>
    {children}
  </Sheet.Content>
))
PageSheetContent.displayName = 'PageSheet.Content'

// ============================================================================
// Re-exports
// ============================================================================

export const PageSheet = {
  Root: PageSheetRoot,
  Portal: Sheet.Portal,
  View: PageSheetView,
  Backdrop: PageSheetBackdrop,
  Content: PageSheetContent,
  Trigger: Sheet.Trigger,
  Title: Sheet.Title,
  Description: Sheet.Description,
}
