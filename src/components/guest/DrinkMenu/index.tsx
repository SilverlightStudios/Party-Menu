'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DrinkCard from '@/components/guest/DrinkCard'
import CustomDrinkPanel from '@/components/guest/CustomDrinkPanel'
import type { Drink, Guest, Party } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  party: Party
  guest: Guest
  drinks: Drink[]
}

export default function DrinkMenu({ party, guest, drinks }: Props) {
  const router = useRouter()
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null)
  const [showCustomPanel, setShowCustomPanel] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  useEffect(() => {
    if (successToast) {
      const t = setTimeout(() => setSuccessToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [successToast])

  async function handleOrderDrink(drink: Drink) {
    setIsOrdering(true)
    const supabase = createClient()

    await supabase.from('orders').insert({
      party_id: party.id,
      guest_id: guest.id,
      drink_id: drink.id,
      status: 'pending',
    })

    setSelectedDrink(null)
    setSuccessToast(`${drink.name} ordered! 🎉`)
    setIsOrdering(false)
  }

  async function handleCustomOrder(request: string) {
    const supabase = createClient()
    await supabase.from('orders').insert({
      party_id: party.id,
      guest_id: guest.id,
      drink_id: null,
      custom_request: request,
      status: 'pending',
    })
    setSuccessToast('Custom order sent! 🎉')
    setShowCustomPanel(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.push(`/guest/${guest.id}`)}
        >
          ←
        </button>
        <div className={styles.headerText}>
          <p className={styles.title}>Drinks 🍹</p>
          <p className={styles.subtitle}>{party.name}</p>
        </div>
      </div>

      <div className={styles.grid}>
        {drinks.map((drink) => (
          <DrinkCard
            key={drink.id}
            drink={drink}
            onClick={setSelectedDrink}
          />
        ))}
      </div>

      {/* Sticky footer — custom request */}
      <div className={styles.stickyFooter}>
        <button
          className={styles.customRequestButton}
          onClick={() => setShowCustomPanel(true)}
        >
          ✨ Want something else? Request it
        </button>
      </div>

      {/* Order confirmation sheet */}
      {selectedDrink && (
        <div
          className={styles.confirmOverlay}
          onClick={(e) => e.target === e.currentTarget && setSelectedDrink(null)}
        >
          <div className={styles.confirmSheet}>
            <div className={styles.confirmHandle} />

            <div className={styles.confirmDrinkInfo}>
              <div className={styles.confirmDrinkImage}>
                {selectedDrink.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedDrink.photo_url}
                    alt={selectedDrink.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  '🍹'
                )}
              </div>
              <div>
                <p className={styles.confirmDrinkName}>{selectedDrink.name}</p>
                {selectedDrink.description && (
                  <p className={styles.confirmDrinkDesc}>{selectedDrink.description}</p>
                )}
              </div>
            </div>

            <button
              className={styles.confirmButton}
              onClick={() => handleOrderDrink(selectedDrink)}
              disabled={isOrdering}
            >
              {isOrdering ? 'Ordering...' : 'Order this drink 🎉'}
            </button>
          </div>
        </div>
      )}

      {/* Custom drink panel */}
      {showCustomPanel && (
        <CustomDrinkPanel
          onSubmit={handleCustomOrder}
          onClose={() => setShowCustomPanel(false)}
        />
      )}

      {/* Success toast */}
      {successToast && (
        <div className={styles.successToast}>{successToast}</div>
      )}
    </div>
  )
}
