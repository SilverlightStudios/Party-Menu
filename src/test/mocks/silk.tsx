import React, {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type TravelStatus = 'idleInside' | 'idleOutside'

interface StackRegistryEntry {
  id: string
  order: number
  presented: boolean
}

interface StackContextValue {
  topmostId: string | null
  register: (id: string, presented: boolean) => void
  unregister: (id: string) => void
  update: (id: string, presented: boolean) => void
}

interface SheetInstanceContextValue {
  registerTravelStatusHandler: (handler: ((status: TravelStatus) => void) | null) => void
}

const StackContext = createContext<StackContextValue | null>(null)
const SheetInstanceContext = createContext<SheetInstanceContextValue | null>(null)

function renderSlot(
  children: ReactNode,
  asChild?: boolean,
  extraProps?: Record<string, unknown>
) {
  if (asChild && isValidElement(children)) {
    return cloneElement(children, extraProps)
  }

  return <div {...extraProps}>{children}</div>
}

function SheetStackRoot({ children }: { children: ReactNode }) {
  const orderRef = useRef(0)
  const [entries, setEntries] = useState<StackRegistryEntry[]>([])

  const register = useCallback((id: string, presented: boolean) => {
    setEntries((current) => {
      if (current.some((entry) => entry.id === id)) {
        return current
      }

      const order = orderRef.current
      orderRef.current += 1
      return [...current, { id, order, presented }]
    })
  }, [])

  const unregister = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id))
  }, [])

  const update = useCallback((id: string, presented: boolean) => {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, presented } : entry))
    )
  }, [])

  const topmostId = useMemo(
    () =>
      entries
        .filter((entry) => entry.presented)
        .sort((left, right) => left.order - right.order)
        .at(-1)?.id ?? null,
    [entries]
  )

  const value = useMemo<StackContextValue>(() => ({
    topmostId,
    register,
    unregister,
    update,
  }), [register, topmostId, unregister, update])

  return <StackContext.Provider value={value}>{children}</StackContext.Provider>
}

function SheetStackOutlet({
  children,
  asChild,
}: {
  children: ReactNode
  asChild?: boolean
}) {
  return <>{renderSlot(children, asChild)}</>
}

function SheetRoot({
  children,
  presented = false,
}: {
  children: ReactNode
  presented?: boolean
}) {
  const stack = useContext(StackContext)
  const register = stack?.register
  const unregister = stack?.unregister
  const update = stack?.update
  const sheetId = useId()
  const [initialPresented] = useState(() => Boolean(presented))
  const previousPresented = useRef(Boolean(presented))
  const travelStatusHandler = useRef<((status: TravelStatus) => void) | null>(null)
  const [stuckVisible, setStuckVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(Boolean(presented))

  useEffect(() => {
    register?.(sheetId, initialPresented)

    return () => {
      unregister?.(sheetId)
    }
  }, [initialPresented, register, sheetId, unregister])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (presented) {
      setShouldRender(true)
      setStuckVisible(false)
      travelStatusHandler.current?.('idleInside')
      previousPresented.current = true
      return
    }

    if (!previousPresented.current) {
      return
    }

    const dismissedUnderAnotherSheet =
      stack?.topmostId != null && stack.topmostId !== sheetId

    if (dismissedUnderAnotherSheet) {
      // Reproduces the documented Silk limitation: dismissing a non-frontmost
      // sheet in a stack can leave its content stranded until it becomes
      // frontmost and is dismissed again.
      setStuckVisible(true)
      previousPresented.current = false
      return
    }

    setStuckVisible(false)
    travelStatusHandler.current?.('idleOutside')
    setShouldRender(false)
    previousPresented.current = false
  }, [presented, sheetId, stack?.topmostId])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    update?.(sheetId, Boolean(presented))
  }, [presented, sheetId, update])

  const rendered = shouldRender || presented || stuckVisible

  if (!rendered) {
    return null
  }

  return (
    <SheetInstanceContext.Provider
      value={{
        registerTravelStatusHandler(handler) {
          travelStatusHandler.current = handler
        },
      }}
    >
      <div data-sheet-visible={presented || stuckVisible ? 'true' : 'false'}>{children}</div>
    </SheetInstanceContext.Provider>
  )
}

function SheetPortal({ children }: { children: ReactNode }) {
  return <>{children}</>
}

function SheetView({
  children,
  onTravelStatusChange,
  className,
}: {
  children: ReactNode
  onTravelStatusChange?: (status: TravelStatus) => void
  className?: string
}) {
  const sheet = useContext(SheetInstanceContext)

  useEffect(() => {
    sheet?.registerTravelStatusHandler(onTravelStatusChange ?? null)

    return () => {
      sheet?.registerTravelStatusHandler(null)
    }
  }, [onTravelStatusChange, sheet])

  return <div className={className}>{children}</div>
}

function SheetContent({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}

function SheetTitle({
  children,
  asChild,
}: {
  children: ReactNode
  asChild?: boolean
}) {
  return renderSlot(children, asChild, { 'data-sheet-title': true })
}

function SheetDescription({
  children,
  asChild,
}: {
  children: ReactNode
  asChild?: boolean
}) {
  return renderSlot(children, asChild, { 'data-sheet-description': true })
}

function SheetBackdrop({ className }: { className?: string }) {
  return <div aria-hidden="true" className={className} />
}

function SheetBleedingBackground({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return <div aria-hidden="true" className={className} style={style} />
}

function SheetHandle({ className }: { className?: string }) {
  return <div aria-hidden="true" className={className} />
}

function VisuallyHiddenRoot({
  children,
  asChild,
}: {
  children: ReactNode
  asChild?: boolean
}) {
  return renderSlot(children, asChild)
}

function AutoFocusTargetRoot({
  children,
  asChild,
}: {
  children: ReactNode
  asChild?: boolean
}) {
  return renderSlot(children, asChild)
}

function ScrollRoot({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

function ScrollView({
  children,
}: {
  children: ReactNode
}) {
  return <div>{children}</div>
}

function ScrollContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

let componentIdCount = 0

function createComponentId() {
  componentIdCount += 1
  return `mock-component-${componentIdCount}`
}

export const SheetStack = {
  Root: SheetStackRoot,
  Outlet: SheetStackOutlet,
}

export const Sheet = {
  Root: SheetRoot,
  Portal: SheetPortal,
  View: SheetView,
  Content: SheetContent,
  Title: SheetTitle,
  Description: SheetDescription,
  Backdrop: SheetBackdrop,
  BleedingBackground: SheetBleedingBackground,
  Handle: SheetHandle,
  Trigger: ({ children }: { children: ReactNode }) => <>{children}</>,
}

export const Scroll = {
  Root: ScrollRoot,
  View: ScrollView,
  Content: ScrollContent,
}

export const VisuallyHidden = {
  Root: VisuallyHiddenRoot,
}

export const AutoFocusTarget = {
  Root: AutoFocusTargetRoot,
}

export { createComponentId }
