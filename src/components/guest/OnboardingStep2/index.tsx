'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { usePokes } from '@/hooks/usePokes'
import type { Guest, Party } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  party: Party
  guest: Guest
  allGuests: Guest[]
}

export default function OnboardingStep2({ party, guest, allGuests }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(guest.photo_url)
  const [isUploading, setIsUploading] = useState(false)
  const [showPokeSheet, setShowPokeSheet] = useState(false)
  const [pokeSent, setPokeSent] = useState<string | null>(null)

  const { incomingPoke, dismissPoke } = usePokes(guest.id, party.id)

  // Auto-dismiss poke toast after 4s
  useEffect(() => {
    if (incomingPoke) {
      const t = setTimeout(dismissPoke, 4000)
      return () => clearTimeout(t)
    }
  }, [incomingPoke, dismissPoke])

  function getInitials(name: string) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `guests/${guest.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('party-photos')
      .upload(path, file, { upsert: true })

    if (!uploadError) {
      const { data } = supabase.storage.from('party-photos').getPublicUrl(path)
      const url = data.publicUrl

      await supabase.from('guests').update({ photo_url: url }).eq('id', guest.id)
      setPhotoUrl(url)
    }
    setIsUploading(false)
  }

  async function handlePoke(targetGuest: Guest) {
    const supabase = createClient()
    await supabase.from('pokes').insert({
      party_id: party.id,
      from_guest_id: guest.id,
      to_guest_id: targetGuest.id,
    })
    setPokeSent(targetGuest.name)
    setTimeout(() => setPokeSent(null), 2000)
  }

  const otherGuests = allGuests.filter((g) => g.id !== guest.id)

  return (
    <div className={styles.container}>
      {/* Incoming poke toast */}
      {incomingPoke && (
        <div className={styles.pokeToast} onClick={dismissPoke}>
          <span className={styles.pokeToastEmoji}>🔫</span>
          <span className={styles.pokeToastText}>
            <strong>{incomingPoke.from_guest?.name}</strong> poked you!
          </span>
        </div>
      )}

      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push('/')}>
          ←
        </button>
        <span className={styles.greeting}>Hey, {guest.name.split(' ')[0]}!</span>
      </div>

      <div className={styles.profileSection}>
        <div
          className={styles.avatarWrapper}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.avatar}>
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={guest.name} />
            ) : (
              <span className={styles.avatarInitials}>{getInitials(guest.name)}</span>
            )}
          </div>
          <div className={styles.avatarOverlay}>
            {isUploading ? '⏳' : '📷'}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          style={{ display: 'none' }}
        />

        <p className={styles.photoHint}>
          {photoUrl ? 'Tap to change your photo' : 'Add your photo at the party!'}
        </p>

        <p className={styles.guestName}>{guest.name}</p>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.primaryAction}
          onClick={() => router.push(`/guest/${guest.id}/drinks`)}
        >
          🍹 Order a Drink
        </button>

        <button
          className={styles.secondaryAction}
          onClick={() => setShowPokeSheet(true)}
        >
          🔫 Poke Someone
        </button>
      </div>

      {/* Poke sent confirmation */}
      {pokeSent && (
        <div className={styles.pokeToast}>
          <span className={styles.pokeToastEmoji}>🔫</span>
          <span className={styles.pokeToastText}>You poked <strong>{pokeSent}</strong>!</span>
        </div>
      )}

      {/* Poke sheet */}
      {showPokeSheet && (
        <div
          className={styles.pokeSheetOverlay}
          onClick={(e) => e.target === e.currentTarget && setShowPokeSheet(false)}
        >
          <div className={styles.pokeSheet}>
            <div className={styles.pokeSheetHandle} />
            <p className={styles.pokeSheetTitle}>🔫 Poke a guest</p>
            <div className={styles.pokeList}>
              {otherGuests.map((g) => (
                <div key={g.id} className={styles.pokeItem}>
                  <div className={styles.pokeGuestInfo}>
                    <div className={styles.pokeGuestAvatar}>
                      {g.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.photo_url} alt={g.name} />
                      ) : (
                        getInitials(g.name)
                      )}
                    </div>
                    <span className={styles.pokeGuestName}>{g.name}</span>
                  </div>
                  <button
                    className={styles.pokeButton}
                    onClick={() => handlePoke(g)}
                  >
                    🔫
                  </button>
                </div>
              ))}
              {otherGuests.length === 0 && (
                <p style={{ color: '#888', textAlign: 'center', padding: '16px' }}>
                  No other guests yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
