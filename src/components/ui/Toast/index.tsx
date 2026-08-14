'use client'

import React, { useEffect, useRef } from 'react'
import { Sheet } from '@silk-hq/components'
import './styles.css'

// ============================================================================
// Root
// ============================================================================

type SheetRootProps = React.ComponentPropsWithoutRef<typeof Sheet.Root>
type ToastRootProps = Omit<SheetRootProps, 'license'> & {
  license?: SheetRootProps['license']
  autoCloseMs?: number
}

const ToastRoot = React.forwardRef<
  React.ComponentRef<typeof Sheet.Root>,
  ToastRootProps
>(({ children, autoCloseMs = 4000, presented, onPresentedChange, ...restProps }, ref) => {
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (presented && autoCloseMs > 0) {
      timeout.current = setTimeout(() => onPresentedChange?.(false), autoCloseMs)
      return () => clearTimeout(timeout.current)
    }
  }, [presented, autoCloseMs, onPresentedChange])

  return (
    <Sheet.Root
      license="commercial"
      presented={presented}
      onPresentedChange={onPresentedChange}
      sheetRole=""
      {...restProps}
      ref={ref}
    >
      {children}
    </Sheet.Root>
  )
})
ToastRoot.displayName = 'Toast.Root'

// ============================================================================
// View
// ============================================================================

const ToastView = React.forwardRef<
  React.ComponentRef<typeof Sheet.View>,
  React.ComponentPropsWithoutRef<typeof Sheet.View>
>(({ children, className, ...restProps }, ref) => (
  <Sheet.View
    className={`Toast-view ${className ?? ''}`.trim()}
    contentPlacement="top"
    inertOutside={false}
    onPresentAutoFocus={{ focus: false }}
    onDismissAutoFocus={{ focus: false }}
    onClickOutside={{
      dismiss: false,
      stopOverlayPropagation: false,
    }}
    onEscapeKeyDown={{
      dismiss: false,
      stopOverlayPropagation: false,
    }}
    {...restProps}
    ref={ref}
  >
    {children}
  </Sheet.View>
))
ToastView.displayName = 'Toast.View'

// ============================================================================
// Content
// ============================================================================

const ToastContent = React.forwardRef<
  React.ComponentRef<typeof Sheet.Content>,
  React.ComponentPropsWithoutRef<typeof Sheet.Content>
>(({ children, className, ...restProps }, ref) => (
  <Sheet.Content
    className={`Toast-content ${className ?? ''}`.trim()}
    {...restProps}
    ref={ref}
  >
    {children}
  </Sheet.Content>
))
ToastContent.displayName = 'Toast.Content'

// ============================================================================
// Re-exports
// ============================================================================

export const Toast = {
  Root: ToastRoot,
  Portal: Sheet.Portal,
  View: ToastView,
  Content: ToastContent,
}
