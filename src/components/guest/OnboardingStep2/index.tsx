'use client'

import { useState, useCallback, useEffect, type CSSProperties } from 'react'
import { SheetStack, Scroll, VisuallyHidden, createComponentId } from '@silk-hq/components'
import {
  DrinkIcon,
  PendingIcon,
  PhotoIcon,
  PokeIcon,
  SuccessIcon,
} from '@/components/ui/AppIcons'
import { usePokes } from '@/hooks/usePokes'
import { useHaptics } from '@/hooks/useHaptics'
import AvatarBadge from '@/components/ui/AvatarBadge'
import { preloadImage } from '@/lib/utils'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Toast } from '@/components/ui/Toast'
import DrinkMenu from '@/components/guest/DrinkMenu'
import { createClient } from '@/lib/supabase/client'
import type { Drink, Guest, Party } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  party: Party
  guest: Guest
  allGuests: Guest[]
  drinks: Drink[]
  onOrderPlaced?: () => void
}

const drinkFlowStackId = createComponentId()

function runViewTransition(update: () => void) {
  if (typeof document !== 'undefined') {
    const transitioningDocument = document as Document & {
      startViewTransition: (callback: () => void) => unknown
    }
    if (typeof transitioningDocument.startViewTransition === 'function') {
      transitioningDocument.startViewTransition(update)
      return
    }
  }

  update()
}

export default function MainView({ party, guest, allGuests, drinks, onOrderPlaced }: Props) {
  const { trigger } = useHaptics()
  const [photoUrl, setPhotoUrl] = useState<string | null>(guest.photo_url)
  const [isUploading, setIsUploading] = useState(false)
  const [showPokeSheet, setShowPokeSheet] = useState(false)
  const [showDrinks, setShowDrinks] = useState(false)
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null)
  const [isOrdering, setIsOrdering] = useState(false)
  const [pokeSent, setPokeSent] = useState<string | null>(null)
  const [orderSuccessToast, setOrderSuccessToast] = useState<string | null>(null)

  const { incomingPoke, dismissPoke } = usePokes(guest.id, party.id)

  useEffect(() => {
    if (incomingPoke) trigger('error')
  }, [incomingPoke, trigger])

  useEffect(() => {
    allGuests.forEach((person) => preloadImage(person.photo_url))
    drinks.forEach((drink) => preloadImage(drink.photo_url))
  }, [allGuests, drinks])

  const handleIncomingPokeDismiss = useCallback((presented: boolean) => {
    if (!presented) dismissPoke()
  }, [dismissPoke])

  const handlePokeSentDismiss = useCallback((presented: boolean) => {
    if (!presented) setPokeSent(null)
  }, [])

  const handleOrderSuccessDismiss = useCallback((presented: boolean) => {
    if (!presented) setOrderSuccessToast(null)
  }, [])

  const handleDrinksPresentedChange = useCallback((presented: boolean) => {
    setShowDrinks(presented)

    if (presented || !selectedDrink) return
    setSelectedDrink(null)
  }, [selectedDrink])

  const handleDrinkSelect = useCallback((drink: Drink) => {
    runViewTransition(() => setSelectedDrink(drink))
  }, [])

  const handleSelectedDrinkPresentedChange = useCallback((presented: boolean) => {
    if (presented) return
    runViewTransition(() => setSelectedDrink(null))
  }, [])

  async function handleOrderDrink(drink: Drink) {
    setIsOrdering(true)
    const supabase = createClient()

    await supabase.from('orders').insert({
      party_id: party.id,
      guest_id: guest.id,
      drink_id: drink.id,
      status: 'pending',
    })

    trigger('success')
    runViewTransition(() => setSelectedDrink(null))
    setOrderSuccessToast(`${drink.name} ordered!`)
    setIsOrdering(false)
    onOrderPlaced?.()
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('guestId', guest.id)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      const { url } = await response.json() as { url: string }
      setPhotoUrl(url)
      trigger('success')
    }

    e.target.value = ''
    setIsUploading(false)
  }

  async function handlePoke(targetGuest: Guest) {
    const supabase = createClient()
    await supabase.from('pokes').insert({
      party_id: party.id,
      from_guest_id: guest.id,
      to_guest_id: targetGuest.id,
    })
    trigger('nudge')
    setPokeSent(targetGuest.name)
  }

  const otherGuests = allGuests.filter((g) => g.id !== guest.id)
  const themeStyle = {
    '--theme-1': party.theme_color1,
    '--theme-2': party.theme_color2,
    '--theme-3': party.theme_color3,
  } as CSSProperties
  const selectedDrinkId = selectedDrink?.id ?? null

  return (
    <>
      <div className={styles.container} style={themeStyle}>
        <div className={styles.header}>
          <span className={styles.greeting}>Hey, {guest.name.split(' ')[0]}!</span>
        </div>

        <div className={styles.profileSection}>
          <label className={styles.avatarWrapper} aria-label="Upload your party photo">
            <VisuallyHidden.Root asChild>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </VisuallyHidden.Root>
            <AvatarBadge
              name={guest.name}
              photoUrl={photoUrl}
              seed={guest.id}
              className={styles.avatar}
              initialsClassName={styles.avatarInitials}
            />
            <div className={styles.avatarOverlay}>
              {isUploading ? <PendingIcon size={18} /> : <PhotoIcon size={18} />}
            </div>
          </label>

          <p className={styles.photoHint}>
            {photoUrl ? 'Tap to change your photo' : 'Add your photo from your library or camera'}
          </p>

          <p className={styles.guestName}>{guest.name}</p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.primaryAction}
            onClick={() => { trigger('nudge'); setShowDrinks(true) }}
          >
            <DrinkIcon size={20} />
            <span>Order a Drink</span>
          </button>

          <button
            className={styles.secondaryAction}
            onClick={() => { trigger('nudge'); setShowPokeSheet(true) }}
          >
            <PokeIcon size={20} />
            <span>Poke Someone</span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* Drink flow: SheetStack wraps both sheets so confirmation stacks  */}
      {/* over the drink list instead of replacing it.                     */}
      {/* ================================================================ */}
      <SheetStack.Root componentId={drinkFlowStackId}>
        {/* Drinks list sheet — base layer of the stack */}
        <BottomSheet.Root
          forComponent={drinkFlowStackId}
          presented={showDrinks}
          onPresentedChange={handleDrinksPresentedChange}
        >
          <BottomSheet.Portal>
            <BottomSheet.View>
              <BottomSheet.Backdrop />
              <BottomSheet.Content className={styles.drinksSheetContent}>
                {/* Outlet animates this frame when confirmation sheet stacks above */}
                <SheetStack.Outlet
                  asChild
                  stackingAnimation={{
                    scale: ['1', '0.96'],
                    translateY: ['0px', '-18px'],
                    opacity: ['1', '0.9'],
                  }}
                >
                  <div className={styles.drinksSheetFrame}>
                    <BottomSheet.Handle />
                    <div className={styles.drinksSheetHeader}>
                      <BottomSheet.Title asChild>
                        <p className={styles.drinksSheetTitle}>Drinks</p>
                      </BottomSheet.Title>
                      <BottomSheet.Description asChild>
                        <p className={styles.drinksSheetSubtitle}>{party.name}</p>
                      </BottomSheet.Description>
                    </div>
                    <div className={styles.drinksSheetBody}>
                      <DrinkMenu
                        party={party}
                        guest={guest}
                        drinks={drinks}
                        onDrinkSelect={handleDrinkSelect}
                        selectedDrinkId={selectedDrinkId}
                        onOrderPlaced={onOrderPlaced}
                        onOrderSuccess={setOrderSuccessToast}
                      />
                    </div>
                  </div>
                </SheetStack.Outlet>
              </BottomSheet.Content>
            </BottomSheet.View>
          </BottomSheet.Portal>
        </BottomSheet.Root>

        {/* Drink confirmation sheet — sibling in SheetStack, stacks over drink list */}
        <BottomSheet.Root
          forComponent={drinkFlowStackId}
          presented={!!selectedDrink}
          onPresentedChange={handleSelectedDrinkPresentedChange}
        >
          <BottomSheet.Portal>
            <BottomSheet.View>
              <BottomSheet.Backdrop />
              <BottomSheet.Content className={styles.confirmContent}>
                <BottomSheet.Handle />
                {selectedDrink && (
                  <>
                    <VisuallyHidden.Root asChild>
                      <BottomSheet.Title>{selectedDrink.name}</BottomSheet.Title>
                    </VisuallyHidden.Root>
                    <VisuallyHidden.Root asChild>
                      <BottomSheet.Description>
                        Review and confirm your drink order.
                      </BottomSheet.Description>
                    </VisuallyHidden.Root>

                    <div className={styles.confirmDrinkInfo}>
                      <div
                        className={styles.confirmDrinkImage}
                        style={{ viewTransitionName: `drink-img-${selectedDrink.id}` }}
                      >
                        {selectedDrink.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={selectedDrink.photo_url}
                            alt={selectedDrink.name}
                            loading="eager"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <DrinkIcon size={32} />
                        )}
                      </div>
                      <div>
                        <p
                          className={styles.confirmDrinkName}
                          style={{ viewTransitionName: `drink-name-${selectedDrink.id}` }}
                        >
                          {selectedDrink.name}
                        </p>
                        {selectedDrink.description && (
                          <p className={styles.confirmDrinkDesc}>{selectedDrink.description}</p>
                        )}
                      </div>
                    </div>

                    {selectedDrink.pdp_description && (
                      <div className={styles.detailSection}>
                        <p className={styles.detailLabel}>About</p>
                        <p className={styles.detailText}>{selectedDrink.pdp_description}</p>
                      </div>
                    )}

                    {selectedDrink.ingredients.length > 0 && (
                      <div className={styles.detailSection}>
                        <p className={styles.detailLabel}>Ingredients</p>
                        <ul className={styles.ingredientsList}>
                          {selectedDrink.ingredients.map((ingredient) => (
                            <li key={ingredient} className={styles.ingredientChip}>
                              {ingredient}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedDrink.fun_fact && (
                      <div className={styles.detailSection}>
                        <p className={styles.detailLabel}>Fun fact</p>
                        <p className={styles.detailText}>{selectedDrink.fun_fact}</p>
                      </div>
                    )}

                    <button
                      className={styles.confirmButton}
                      onClick={() => handleOrderDrink(selectedDrink)}
                      disabled={isOrdering}
                    >
                      {isOrdering ? 'Ordering...' : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <DrinkIcon size={18} />
                          <span>Order this drink</span>
                        </span>
                      )}
                    </button>
                  </>
                )}
              </BottomSheet.Content>
            </BottomSheet.View>
          </BottomSheet.Portal>
        </BottomSheet.Root>
      </SheetStack.Root>

      {/* Poke sheet */}
      <BottomSheet.Root
        forComponent="closest"
        presented={showPokeSheet}
        onPresentedChange={setShowPokeSheet}
      >
        <BottomSheet.Portal>
          <BottomSheet.View>
            <BottomSheet.Backdrop />
            <BottomSheet.Content className={styles.pokeSheetContent}>
              <BottomSheet.Handle />
              <BottomSheet.Title asChild>
                <p className={styles.pokeSheetTitle}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <PokeIcon size={18} />
                    <span>Poke a guest</span>
                  </span>
                </p>
              </BottomSheet.Title>
              <Scroll.Root className={styles.pokeList}>
                <Scroll.View scrollGestureTrap={{ yStart: true, yEnd: true }}>
                  <Scroll.Content className={styles.pokeListContent}>
                    {otherGuests.map((person) => (
                      <div key={person.id} className={styles.pokeItem}>
                        <div className={styles.pokeGuestInfo}>
                          <AvatarBadge
                            name={person.name}
                            photoUrl={person.photo_url}
                            seed={person.id}
                            className={styles.pokeGuestAvatar}
                          />
                          <span className={styles.pokeGuestName}>{person.name}</span>
                        </div>
                        <button
                          className={styles.pokeButton}
                          onClick={() => handlePoke(person)}
                        >
                          <PokeIcon size={20} />
                        </button>
                      </div>
                    ))}
                    {otherGuests.length === 0 && (
                      <p className={styles.emptyText}>
                        No other guests yet
                      </p>
                    )}
                  </Scroll.Content>
                </Scroll.View>
              </Scroll.Root>
            </BottomSheet.Content>
          </BottomSheet.View>
        </BottomSheet.Portal>
      </BottomSheet.Root>

      {/* Incoming poke toast */}
      <Toast.Root
        presented={!!incomingPoke}
        onPresentedChange={handleIncomingPokeDismiss}
        autoCloseMs={4000}
      >
        <Toast.Portal>
          <Toast.View>
            <Toast.Content>
              <div className={styles.toastInner}>
                <PokeIcon className={styles.toastEmoji} size={32} />
                <span className={styles.toastText}>
                  <strong>{incomingPoke?.from_guest?.name}</strong> poked you!
                </span>
              </div>
            </Toast.Content>
          </Toast.View>
        </Toast.Portal>
      </Toast.Root>

      {/* Poke sent confirmation toast */}
      <Toast.Root
        presented={!!pokeSent}
        onPresentedChange={handlePokeSentDismiss}
        autoCloseMs={2000}
      >
        <Toast.Portal>
          <Toast.View>
            <Toast.Content>
              <div className={styles.toastInner}>
                <PokeIcon className={styles.toastEmoji} size={32} />
                <span className={styles.toastText}>
                  You poked <strong>{pokeSent}</strong>!
                </span>
              </div>
            </Toast.Content>
          </Toast.View>
        </Toast.Portal>
      </Toast.Root>

      {/* Order success toast */}
      <Toast.Root
        presented={!!orderSuccessToast}
        onPresentedChange={handleOrderSuccessDismiss}
        autoCloseMs={3000}
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
                <span>{orderSuccessToast}</span>
              </span>
            </Toast.Content>
          </Toast.View>
        </Toast.Portal>
      </Toast.Root>
    </>
  )
}
