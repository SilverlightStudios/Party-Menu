'use client'

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ComponentPropsWithoutRef,
} from 'react'
import { Sheet, SheetStack, Scroll, VisuallyHidden, AutoFocusTarget, createComponentId } from '@silk-hq/components'
import { useGuest } from '@/hooks/useGuest'
import { useHaptics } from '@/hooks/useHaptics'
import { useTheme } from '@/hooks/useTheme'
import { useGuestOrders } from '@/hooks/useGuestOrders'
import { createClient } from '@/lib/supabase/client'
import { preloadImage } from '@/lib/utils'
import { PartyIcon, SuccessIcon } from '@/components/ui/AppIcons'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Toast } from '@/components/ui/Toast'
import AvatarBadge from '@/components/ui/AvatarBadge'
import Grainient from '@/components/ui/Grainient'
import MainView from '@/components/guest/OnboardingStep2'
import PendingOrderSheet from '@/components/guest/PendingOrderSheet'
import type { Drink, Guest, Party } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  party: Party
  guests: Guest[]
  drinks: Drink[]
}

const onboardingSheetBackgroundStyle: CSSProperties = {
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
}

type SheetStackAnimation = NonNullable<
  ComponentPropsWithoutRef<typeof SheetStack.Outlet>['stackingAnimation']
>

const guestPickerSheetId = createComponentId()

const welcomeStackAnimation: SheetStackAnimation = {
  scale: ['1', '0.968'],
  translateY: ['0px', '-18px'],
  opacity: ['1', '0.9'],
}

const pickerStackAnimation: SheetStackAnimation = {
  scale: ['1', '0.982'],
  translateY: ['0px', '-14px'],
  opacity: ['1', '0.92'],
}

const guestPageRevealDelayMs = 180

export default function GuestApp({ party, guests: initialGuests, drinks }: Props) {
  const { guestId, isLoaded, saveGuest, clearGuest } = useGuest()
  const { trigger } = useHaptics()
  useTheme(party)

  // Local guest list (can grow if a new guest adds themselves)
  const [guests, setGuests] = useState<Guest[]>(initialGuests)

  // Resolve selected guest from prefetched data
  const selectedGuest = useMemo(
    () => (guestId ? guests.find((g) => g.id === guestId) ?? null : null),
    [guestId, guests]
  )

  // Onboarding state
  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingGuest, setPendingGuest] = useState<Guest | null>(null)
  const guestSelectionTimerRef = useRef<number | null>(null)
  const showWelcome = !guestId
  const isTransitioningToGuest = pendingGuest !== null

  const clearGuestSelectionTimer = useCallback(() => {
    if (guestSelectionTimerRef.current === null) return

    window.clearTimeout(guestSelectionTimerRef.current)
    guestSelectionTimerRef.current = null
  }, [])

  useEffect(() => clearGuestSelectionTimer, [clearGuestSelectionTimer])

  // Logout: clear guest and re-show onboarding
  function handleLogout() {
    clearGuestSelectionTimer()
    trigger('nudge')
    setPendingGuest(null)
    setShowAddModal(false)
    setShowGuestPicker(false)
    setSearch('')
    setNewName('')
    clearGuest()
  }

  // Preload images on mount
  useEffect(() => {
    guests.forEach((guest) => preloadImage(guest.photo_url))
    drinks.forEach((drink) => preloadImage(drink.photo_url))
  }, [guests, drinks])

  // Pending orders
  const {
    pendingOrders,
    hasPendingOrders,
    lastFulfilledOrder,
    dismissFulfilled,
    cancellingOrderId,
    cancelPendingOrder,
  } = useGuestOrders(selectedGuest?.id ?? null, party.id)

  // Fulfilled order toast
  const handleFulfilledDismiss = useCallback((presented: boolean) => {
    if (!presented) dismissFulfilled()
  }, [dismissFulfilled])

  useEffect(() => {
    if (lastFulfilledOrder) trigger('success')
  }, [lastFulfilledOrder, trigger])

  // Filtered guests for search
  const filteredGuests = useMemo(
    () =>
      guests.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase())
      ),
    [guests, search]
  )

  const commitGuestSelection = useCallback((guest: Guest) => {
    saveGuest(guest.id, party.id)
  }, [party.id, saveGuest])

  function handleSelectGuest(guest: Guest) {
    clearGuestSelectionTimer()
    trigger('success')
    setPendingGuest(guest)
    setShowAddModal(false)
    setShowGuestPicker(false)
    setSearch('')
  }

  const handleGuestPickerTravelStatusChange = useCallback((status: 'entering' | 'idleInside' | 'stepping' | 'exiting' | 'idleOutside') => {
    if (status !== 'idleOutside' || !pendingGuest) return

    clearGuestSelectionTimer()
    guestSelectionTimerRef.current = window.setTimeout(() => {
      commitGuestSelection(pendingGuest)
      setPendingGuest(null)
      guestSelectionTimerRef.current = null
    }, guestPageRevealDelayMs)
  }, [clearGuestSelectionTimer, commitGuestSelection, pendingGuest])

  async function handleAddSelf() {
    if (!newName.trim() || isSubmitting) return
    setIsSubmitting(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('guests')
      .insert({ party_id: party.id, name: newName.trim() })
      .select()
      .single()

    if (!error && data) {
      const newGuest = data as Guest
      clearGuestSelectionTimer()
      trigger('success')
      setGuests((prev) => [...prev, newGuest])
      setPendingGuest(newGuest)
      setShowAddModal(false)
      setShowGuestPicker(false)
      setSearch('')
      setNewName('')
    }
    setIsSubmitting(false)
  }

  const themeStyle = {
    '--theme-1': party.theme_color1,
    '--theme-2': party.theme_color2,
    '--theme-3': party.theme_color3,
  } as CSSProperties
  const onboardingActive = showWelcome || showGuestPicker || isTransitioningToGuest
  const mainContainerStyle = {
    ...themeStyle,
    ...(onboardingActive ? { pointerEvents: 'none' } : null),
  } as CSSProperties

  // Don't render until we know the guest state from localStorage
  if (!isLoaded) return null

  const fulfilledDrinkName =
    lastFulfilledOrder?.drink?.name ?? lastFulfilledOrder?.custom_request ?? 'Your drink'
  const welcomeViewClassName = [
    styles.welcomeView,
    isTransitioningToGuest ? styles.welcomeViewClosing : null,
  ].filter(Boolean).join(' ')

  return (
    <>
      <Grainient color1={party.theme_color1} color2={party.theme_color2} color3={party.theme_color3} />

      <SheetStack.Root>
        <SheetStack.Outlet
          asChild
          stackingAnimation={{
            scale: ['1', '0.95'],
            translateY: ['0px', '-20px'],
            opacity: ['1', '0.85'],
          }}
        >
          <div className={styles.mainContainer} style={mainContainerStyle}>
            {selectedGuest && (
              <button
                className={styles.logoutButton}
                onClick={handleLogout}
                aria-label="Log out"
              >
                ✕
              </button>
            )}
            {selectedGuest ? (
              <SheetStack.Root>
                <SheetStack.Outlet
                  asChild
                  stackingAnimation={{
                    scale: ['1', '0.97'],
                    translateY: ['0px', '-14px'],
                    opacity: ['1', '0.9'],
                  }}
                >
                  <div className={styles.mainViewWrapper}>
                    <MainView
                      party={party}
                      guest={selectedGuest}
                      allGuests={guests}
                      drinks={drinks}
                    />
                  </div>
                </SheetStack.Outlet>
              </SheetStack.Root>
            ) : (
              pendingGuest ? (
                <div className={styles.loadingShell} role="status" aria-live="polite">
                  <div className={styles.loadingTopBar}>
                    <span className={styles.loadingTopLine} />
                    <span className={styles.loadingTopChip}>{pendingGuest.name}</span>
                  </div>
                  <div className={styles.loadingProfile}>
                    <span className={styles.loadingAvatar} />
                    <span className={styles.loadingName} />
                    <span className={styles.loadingCaption} />
                  </div>
                  <div className={styles.loadingActions}>
                    <span className={styles.loadingActionCard} />
                    <span className={styles.loadingActionCard} />
                  </div>
                  <p className={styles.loadingLabel}>{`Loading ${pendingGuest.name}'s page...`}</p>
                </div>
              ) : (
                <div className={styles.placeholder} />
              )
            )}
          </div>
        </SheetStack.Outlet>

        {/* ============================================================ */}
        {/* Welcome Sheet (full-screen, side-swipe) */}
        {/* ============================================================ */}
        <Sheet.Root
          license="commercial"
          forComponent="closest"
          presented={showWelcome}
          onPresentedChange={(presented) => {
            if (!presented) {
              setShowGuestPicker(false)
              setShowAddModal(false)
            }
          }}
        >
          <Sheet.Portal>
            <Sheet.View
              className={welcomeViewClassName}
              contentPlacement="right"
              swipeDismissal={false}
              nativeEdgeSwipePrevention={true}
              enteringAnimationSettings="smooth"
              exitingAnimationSettings="smooth"
              onClickOutside={{ dismiss: false, stopOverlayPropagation: true }}
              onEscapeKeyDown={{ dismiss: false, stopOverlayPropagation: true }}
            >
              <Sheet.Content className={styles.welcomeSheet} style={themeStyle}>
                <VisuallyHidden.Root asChild>
                  <Sheet.Title>{party.name}</Sheet.Title>
                </VisuallyHidden.Root>
                <Sheet.BleedingBackground
                  className={styles.welcomeSheetBg}
                  style={onboardingSheetBackgroundStyle}
                />
                <SheetStack.Outlet asChild stackingAnimation={welcomeStackAnimation}>
                  <div className={styles.welcomeSheetFrame}>
                    <div className={styles.welcomeContent}>
                      <PartyIcon className={styles.welcomeEmoji} size={64} />
                      <h1 className={styles.welcomeMessage}>
                        {party.welcome_message || party.name}
                      </h1>
                      <p className={styles.welcomeSubtitle}>Tap below to get started</p>
                      <button
                        className={styles.findButton}
                        onClick={() => {
                          trigger('nudge')
                          setShowGuestPicker(true)
                        }}
                      >
                        Find Yourself
                      </button>
                    </div>
                  </div>
                </SheetStack.Outlet>
              </Sheet.Content>
            </Sheet.View>
          </Sheet.Portal>
        </Sheet.Root>

        {/* ============================================================ */}
        {/* Guest Picker Sheet (stacks on welcome with parallax) */}
        {/* ============================================================ */}
        <Sheet.Root
          license="commercial"
          componentId={guestPickerSheetId}
          forComponent="closest"
          presented={showGuestPicker}
          onPresentedChange={setShowGuestPicker}
        >
          <Sheet.Portal>
            <Sheet.View
              className={styles.pickerView}
              contentPlacement="right"
              nativeEdgeSwipePrevention={true}
              enteringAnimationSettings="smooth"
              exitingAnimationSettings="smooth"
              onTravelStatusChange={handleGuestPickerTravelStatusChange}
              onClickOutside={{ dismiss: false, stopOverlayPropagation: true }}
              onEscapeKeyDown={{ dismiss: false, stopOverlayPropagation: true }}
            >
              <Sheet.Content className={styles.pickerSheet} style={themeStyle}>
                <Sheet.BleedingBackground
                  className={styles.pickerSheetBg}
                  style={onboardingSheetBackgroundStyle}
                />
                <SheetStack.Root>
                  <SheetStack.Outlet asChild stackingAnimation={pickerStackAnimation}>
                    <div
                      className={styles.pickerSheetFrame}
                      style={showAddModal ? { pointerEvents: 'none' } : undefined}
                    >
                      <div className={styles.pickerContent}>
                        <div className={styles.pickerHeader}>
                          <Sheet.Title asChild>
                            <p className={styles.pickerTitle}>Who are you?</p>
                          </Sheet.Title>
                          <AutoFocusTarget.Root
                            asChild
                            timing="present"
                            forComponent={guestPickerSheetId}
                          >
                            <input
                              className={styles.searchInput}
                              placeholder="Search your name..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </AutoFocusTarget.Root>
                        </div>

                        <Scroll.Root className={styles.guestList}>
                          <Scroll.View
                            scrollGestureTrap={{ yStart: true, yEnd: true }}
                            onScrollStart={{ dismissKeyboard: true }}
                          >
                            <Scroll.Content className={styles.guestListContent}>
                              {filteredGuests.map((guest) => (
                                <button
                                  key={guest.id}
                                  className={styles.guestItem}
                                  onClick={() => handleSelectGuest(guest)}
                                >
                                  <AvatarBadge
                                    name={guest.name}
                                    photoUrl={guest.photo_url}
                                    seed={guest.id}
                                    className={styles.guestAvatar}
                                  />
                                  <span className={styles.guestName}>{guest.name}</span>
                                </button>
                              ))}

                              {filteredGuests.length === 0 && (
                                <p className={styles.emptyText}>No guests found</p>
                              )}
                            </Scroll.Content>
                          </Scroll.View>
                        </Scroll.Root>

                        <div className={styles.stickyBottom}>
                          <button
                            className={styles.addSelfButton}
                            onClick={() => {
                              trigger('nudge')
                              setShowAddModal(true)
                            }}
                          >
                            Can&apos;t find yourself? Add your name here
                          </button>
                        </div>
                      </div>
                    </div>
                  </SheetStack.Outlet>

                  {/* Nested: Add name modal */}
                  <BottomSheet.Root
                    forComponent="closest"
                    presented={showAddModal}
                    onPresentedChange={setShowAddModal}
                  >
                    <BottomSheet.Portal>
                      <BottomSheet.View className={styles.addModalView}>
                        <BottomSheet.Backdrop />
                        <BottomSheet.Content className={styles.addModalContent}>
                          <BottomSheet.Handle />
                          <BottomSheet.Title asChild>
                            <p className={styles.modalTitle}>What&apos;s your name?</p>
                          </BottomSheet.Title>
                          <input
                            className={styles.nameInput}
                            placeholder="Your name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSelf()}
                            autoFocus
                          />
                          <div className={styles.modalActions}>
                            <button
                              className={styles.cancelBtn}
                              onClick={() => {
                                trigger('nudge')
                                setShowAddModal(false)
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className={styles.submitBtn}
                              onClick={handleAddSelf}
                              disabled={!newName.trim() || isSubmitting}
                            >
                              {isSubmitting ? 'Joining...' : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                  <span>I&apos;m here!</span>
                                  <PartyIcon size={18} />
                                </span>
                              )}
                            </button>
                          </div>
                        </BottomSheet.Content>
                      </BottomSheet.View>
                    </BottomSheet.Portal>
                  </BottomSheet.Root>
                </SheetStack.Root>
              </Sheet.Content>
            </Sheet.View>
          </Sheet.Portal>
        </Sheet.Root>
      </SheetStack.Root>

      {/* Pending order sheet (persistent detent, outside SheetStack) */}
      {hasPendingOrders && (
        <PendingOrderSheet
          pendingOrders={pendingOrders}
          cancellingOrderId={cancellingOrderId}
          onCancelOrder={cancelPendingOrder}
        />
      )}

      {/* Order fulfilled toast */}
      <Toast.Root
        presented={!!lastFulfilledOrder}
        onPresentedChange={handleFulfilledDismiss}
        autoCloseMs={4000}
      >
        <Toast.Portal>
          <Toast.View>
            <Toast.Content>
              <span
                style={{
                  color: '#22c55e',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <SuccessIcon size={16} />
                <span>{fulfilledDrinkName} is ready!</span>
              </span>
            </Toast.Content>
          </Toast.View>
        </Toast.Portal>
      </Toast.Root>
    </>
  )
}
