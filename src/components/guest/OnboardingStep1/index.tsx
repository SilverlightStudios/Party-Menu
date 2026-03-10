'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGuest } from '@/hooks/useGuest'
import type { Guest, Party } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  party: Party
  guests: Guest[]
}

export default function OnboardingStep1({ party, guests }: Props) {
  const router = useRouter()
  const { saveGuest } = useGuest()

  const [showSheet, setShowSheet] = useState(false)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredGuests = useMemo(
    () =>
      guests.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase())
      ),
    [guests, search]
  )

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  function handleSelectGuest(guest: Guest) {
    saveGuest(guest.id, party.id)
    router.push(`/guest/${guest.id}`)
  }

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
      saveGuest(data.id, party.id)
      router.push(`/guest/${data.id}`)
    }
    setIsSubmitting(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.emoji}>🎉</div>

        <h1 className={styles.welcomeMessage}>{party.welcome_message || party.name}</h1>

        <p className={styles.subtitle}>Tap below to get started</p>

        <button
          className={styles.findButton}
          onClick={() => setShowSheet(true)}
        >
          Find Yourself
        </button>
      </div>

      {/* Guest selector sheet */}
      {showSheet && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && setShowSheet(false)}
        >
          <div
            className={styles.modalCard}
            style={{ maxHeight: '80dvh', display: 'flex', flexDirection: 'column', padding: 0 }}
          >
            <div className={styles.sheetHeader}>
              <p className={styles.sheetTitle}>Who are you?</p>
              <input
                className={styles.searchInput}
                placeholder="Search your name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.guestList}>
              {filteredGuests.map((guest) => (
                <button
                  key={guest.id}
                  className={styles.guestItem}
                  onClick={() => handleSelectGuest(guest)}
                >
                  <div className={styles.guestAvatar}>
                    {guest.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={guest.photo_url} alt={guest.name} />
                    ) : (
                      getInitials(guest.name)
                    )}
                  </div>
                  <span className={styles.guestName}>{guest.name}</span>
                </button>
              ))}

              {filteredGuests.length === 0 && (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '16px' }}>
                  No guests found
                </p>
              )}
            </div>

            <div className={styles.stickyBottom}>
              <button
                className={styles.addSelfButton}
                onClick={() => {
                  setShowSheet(false)
                  setShowAddModal(true)
                }}
              >
                Can&apos;t find yourself? Add your name here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add self modal */}
      {showAddModal && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className={styles.modalCard}>
            <p className={styles.modalTitle}>What&apos;s your name?</p>
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
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleAddSelf}
                disabled={!newName.trim() || isSubmitting}
              >
                {isSubmitting ? 'Joining...' : "I'm here! 🎉"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
