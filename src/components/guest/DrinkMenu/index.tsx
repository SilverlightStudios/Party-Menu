'use client'

import { useState } from 'react'
import { Scroll } from '@silk-hq/components'
import { SparklesIcon } from '@/components/ui/AppIcons'
import { createClient } from '@/lib/supabase/client'
import { useHaptics } from '@/hooks/useHaptics'
import DrinkCard from '@/components/guest/DrinkCard'
import CustomDrinkPanel from '@/components/guest/CustomDrinkPanel'
import type { Drink, Guest, Party } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  party: Party
  guest: Guest
  drinks: Drink[]
  onDrinkSelect: (drink: Drink) => void
  selectedDrinkId?: Drink['id'] | null
  onOrderPlaced?: () => void
  onOrderSuccess?: (message: string) => void
}

export default function DrinkMenu({
  party,
  guest,
  drinks,
  onDrinkSelect,
  selectedDrinkId = null,
  onOrderPlaced,
  onOrderSuccess,
}: Props) {
  const { trigger } = useHaptics()
  const [showCustomPanel, setShowCustomPanel] = useState(false)

  async function handleCustomOrder(request: string) {
    const supabase = createClient()
    await supabase.from('orders').insert({
      party_id: party.id,
      guest_id: guest.id,
      drink_id: null,
      custom_request: request,
      status: 'pending',
    })
    onOrderSuccess?.('Custom order sent!')
    setShowCustomPanel(false)
    onOrderPlaced?.()
  }

  return (
    <>
      <Scroll.Root className={styles.page}>
        <Scroll.View scrollGestureTrap={{ yStart: true, yEnd: true }}>
          <Scroll.Content>
            <div className={styles.grid}>
              {drinks.map((drink) => (
                <DrinkCard
                  key={drink.id}
                  drink={drink}
                  onClick={onDrinkSelect}
                  transitionDisabled={selectedDrinkId === drink.id}
                />
              ))}
            </div>
          </Scroll.Content>
        </Scroll.View>
      </Scroll.Root>

      <div className={styles.footer}>
        <button
          className={styles.customRequestButton}
          onClick={() => { trigger('nudge'); setShowCustomPanel(true) }}
        >
          <SparklesIcon size={18} />
          <span>Want something else? Request it</span>
        </button>
      </div>

      <CustomDrinkPanel
        presented={showCustomPanel}
        onPresentedChange={setShowCustomPanel}
        onSubmit={handleCustomOrder}
      />
    </>
  )
}
