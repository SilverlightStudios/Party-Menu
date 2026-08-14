'use client'

import { useState } from 'react'
import { Scroll, Sheet, VisuallyHidden } from '@silk-hq/components'
import { AlertIcon, CloseIcon, DrinkIcon, PendingIcon } from '@/components/ui/AppIcons'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { useHaptics } from '@/hooks/useHaptics'
import type { GuestOrder } from '@/hooks/useGuestOrders'
import type React from 'react'
import styles from './styles.module.scss'

const bleedingBgStyle: React.CSSProperties = {
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)',
}

const collapsedDetent = 'calc(88px + env(safe-area-inset-bottom))'
const expandedDetent = 'min(58vh, 420px)'

interface Props {
  pendingOrders: GuestOrder[]
  cancellingOrderId: string | null
  onCancelOrder: (orderId: string) => Promise<boolean>
}

function formatElapsed(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins === 1) return '1 min ago'
  return `${mins} min ago`
}

function getOrderLabel(order: GuestOrder): string {
  return order.drink?.name ?? order.custom_request ?? 'Custom drink'
}

export default function PendingOrderSheet({
  pendingOrders,
  cancellingOrderId,
  onCancelOrder,
}: Props) {
  const { trigger } = useHaptics()
  const latest = pendingOrders[0]
  const [isSheetPresented, setIsSheetPresented] = useState(true)
  const [activeDetent, setActiveDetent] = useState(1)
  const [orderToCancelId, setOrderToCancelId] = useState<string | null>(null)
  const contentStyle = {
    '--pending-sheet-peek-height': collapsedDetent,
  } as React.CSSProperties
  const isExpanded = activeDetent > 1
  const orderToCancel = pendingOrders.find((order) => order.id === orderToCancelId) ?? null
  const summaryText =
    pendingOrders.length === 1
      ? '1 drink in progress'
      : `${pendingOrders.length} drinks in progress`

  function handleExpand() {
    trigger('nudge')
    setActiveDetent(2)
  }

  function handlePromptCancel(order: GuestOrder) {
    trigger('nudge')
    setOrderToCancelId(order.id)
  }

  async function handleConfirmCancel() {
    if (!orderToCancel) return

    const didCancel = await onCancelOrder(orderToCancel.id)
    if (!didCancel) return

    trigger('success')
    if (pendingOrders.length <= 1) {
      setActiveDetent(1)
    }
    setOrderToCancelId(null)
  }

  return (
    <>
      <Sheet.Root
        license="commercial"
        presented={isSheetPresented}
        onPresentedChange={setIsSheetPresented}
        activeDetent={activeDetent}
        onActiveDetentChange={setActiveDetent}
      >
        <Sheet.Portal>
          <Sheet.View
            contentPlacement="bottom"
            detents={[collapsedDetent, expandedDetent]}
            swipeDismissal={false}
            inertOutside={false}
            onClickOutside={{ dismiss: false, stopOverlayPropagation: false }}
            onEscapeKeyDown={{ dismiss: false, stopOverlayPropagation: false }}
            onPresentAutoFocus={{ focus: false }}
            onDismissAutoFocus={{ focus: false }}
          >
            <Sheet.SpecialWrapper.Root>
              <Sheet.SpecialWrapper.Content>
                <Sheet.Content className={styles.content} style={contentStyle}>
                  <VisuallyHidden.Root asChild>
                    <Sheet.Title>Pending orders</Sheet.Title>
                  </VisuallyHidden.Root>
                  <Sheet.BleedingBackground className={styles.bleedingBg} style={bleedingBgStyle} />
                  <Sheet.Handle className={styles.handle} />

                  {!isExpanded && latest && (
                    <div className={styles.peekRow}>
                      <button
                        type="button"
                        className={styles.peekButton}
                        onClick={handleExpand}
                        aria-expanded={false}
                        aria-label="View in-progress drinks"
                      >
                        <div className={styles.drinkIcon}>
                          {latest.drink?.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={latest.drink.photo_url}
                              alt={latest.drink.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <DrinkIcon size={24} />
                          )}
                        </div>
                        <div className={styles.orderInfo}>
                          <p className={styles.drinkName}>{getOrderLabel(latest)}</p>
                          <p className={styles.waitingText}>
                            <PendingIcon size={14} />
                            <span>{summaryText}</span>
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={styles.cancelOrderButton}
                        onClick={() => handlePromptCancel(latest)}
                        aria-label={`Cancel ${getOrderLabel(latest)}`}
                        disabled={cancellingOrderId === latest.id}
                      >
                        <CloseIcon size={16} />
                      </button>
                    </div>
                  )}

                  <div className={styles.expandedPanel}>
                    <div className={styles.expandedHeader}>
                      <div>
                        <p className={styles.expandedTitle}>In progress</p>
                        <p className={styles.expandedSubtitle}>{summaryText}</p>
                      </div>
                    </div>

                    <Scroll.Root className={styles.ordersScroll}>
                      <Scroll.View scrollGestureTrap={{ yStart: true, yEnd: true }}>
                        <Scroll.Content className={styles.ordersScrollContent}>
                          {pendingOrders.map((order) => (
                            <div key={order.id} className={styles.orderCard}>
                              <div className={styles.orderRowIcon}>
                                {order.drink?.photo_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={order.drink.photo_url}
                                    alt={order.drink.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <DrinkIcon size={20} />
                                )}
                              </div>

                              <div className={styles.orderRowInfo}>
                                <p className={styles.orderRowName}>{getOrderLabel(order)}</p>
                                <p className={styles.orderRowTime}>
                                  <PendingIcon size={13} />
                                  <span>{formatElapsed(order.created_at)}</span>
                                </p>
                              </div>

                              <button
                                type="button"
                                className={styles.cancelOrderButton}
                                onClick={() => handlePromptCancel(order)}
                                aria-label={`Cancel ${getOrderLabel(order)}`}
                                disabled={cancellingOrderId === order.id}
                              >
                                <CloseIcon size={16} />
                              </button>
                            </div>
                          ))}
                        </Scroll.Content>
                      </Scroll.View>
                    </Scroll.Root>
                  </div>
                </Sheet.Content>
              </Sheet.SpecialWrapper.Content>
            </Sheet.SpecialWrapper.Root>
          </Sheet.View>
        </Sheet.Portal>
      </Sheet.Root>

      <BottomSheet.Root
        sheetRole="dialog"
        presented={!!orderToCancel}
        onPresentedChange={(nextPresented) => {
          if (!nextPresented && !cancellingOrderId) {
            setOrderToCancelId(null)
          }
        }}
      >
        <BottomSheet.Portal>
          <BottomSheet.View>
            <BottomSheet.Backdrop />
            <BottomSheet.Content className={styles.confirmContent}>
              <BottomSheet.Handle />
              <BottomSheet.Title asChild>
                <p className={styles.confirmTitle}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <AlertIcon size={18} />
                    <span>Cancel this drink?</span>
                  </span>
                </p>
              </BottomSheet.Title>
              <BottomSheet.Description asChild>
                <p className={styles.confirmDescription}>
                  Are you sure? This order will be removed from the in-progress queue.
                </p>
              </BottomSheet.Description>

              {orderToCancel && (
                <div className={styles.confirmCard}>
                  <div className={styles.orderRowIcon}>
                    {orderToCancel.drink?.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={orderToCancel.drink.photo_url}
                        alt={orderToCancel.drink.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <DrinkIcon size={20} />
                    )}
                  </div>
                  <div className={styles.orderRowInfo}>
                    <p className={styles.orderRowName}>{getOrderLabel(orderToCancel)}</p>
                    <p className={styles.orderRowTime}>
                      <PendingIcon size={13} />
                      <span>{formatElapsed(orderToCancel.created_at)}</span>
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmKeepButton}
                  onClick={() => {
                    trigger('nudge')
                    setOrderToCancelId(null)
                  }}
                  disabled={!!cancellingOrderId}
                >
                  Keep order
                </button>
                <button
                  type="button"
                  className={styles.confirmCancelButton}
                  onClick={handleConfirmCancel}
                  disabled={!orderToCancel || !!cancellingOrderId}
                >
                  {cancellingOrderId ? 'Cancelling...' : 'Cancel drink'}
                </button>
              </div>
            </BottomSheet.Content>
          </BottomSheet.View>
        </BottomSheet.Portal>
      </BottomSheet.Root>
    </>
  )
}
