'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Guest, Party } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  party: Party | null
  guests: Guest[]
}

export default function GuestListManager({ party, guests: initialGuests }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [newName, setNewName] = useState('')
  const [bulkNames, setBulkNames] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [showBulk, setShowBulk] = useState(false)

  if (!party) {
    return (
      <div className={styles.empty}>
        <p>Set up a party first before adding guests.</p>
        <a href="/admin/setup/party" className={styles.link}>→ Go to Party Setup</a>
      </div>
    )
  }

  async function handleAddGuest() {
    if (!newName.trim() || !party) return
    setIsAdding(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('guests')
      .insert({ party_id: party.id, name: newName.trim() })
      .select()
      .single()
    if (data) {
      setGuests((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
    }
    setIsAdding(false)
  }

  async function handleBulkAdd() {
    if (!party) return
    const names = bulkNames
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean)
    if (!names.length) return

    const supabase = createClient()
    const { data } = await supabase
      .from('guests')
      .insert(names.map((name) => ({ party_id: party.id, name })))
      .select()
    if (data) {
      setGuests((prev) => [...prev, ...data].sort((a, b) => a.name.localeCompare(b.name)))
      setBulkNames('')
      setShowBulk(false)
    }
  }

  async function handleRemove(guestId: string) {
    const supabase = createClient()
    await supabase.from('guests').delete().eq('id', guestId)
    setGuests((prev) => prev.filter((g) => g.id !== guestId))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>👥 Guest List</h1>
        <p className={styles.subtitle}>{guests.length} guests for {party.name}</p>
      </div>

      <div className={styles.addSection}>
        <div className={styles.addRow}>
          <input
            className={styles.input}
            placeholder="Guest name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
          />
          <button
            className={styles.addBtn}
            onClick={handleAddGuest}
            disabled={!newName.trim() || isAdding}
          >
            Add
          </button>
        </div>
        <button
          className={styles.bulkToggle}
          onClick={() => setShowBulk(!showBulk)}
        >
          {showBulk ? '− Hide bulk add' : '+ Bulk add (one per line)'}
        </button>
        {showBulk && (
          <div className={styles.bulkArea}>
            <textarea
              className={styles.textarea}
              placeholder={'Alice\nBob\nCharlie'}
              value={bulkNames}
              onChange={(e) => setBulkNames(e.target.value)}
              rows={5}
            />
            <button className={styles.addBtn} onClick={handleBulkAdd}>
              Add All
            </button>
          </div>
        )}
      </div>

      <div className={styles.list}>
        {guests.map((guest) => (
          <div key={guest.id} className={styles.guestRow}>
            <div className={styles.guestInfo}>
              {guest.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.avatar} src={guest.photo_url} alt={guest.name} />
              )}
              <span className={styles.guestName}>{guest.name}</span>
            </div>
            <button
              className={styles.removeBtn}
              onClick={() => handleRemove(guest.id)}
            >
              ✕
            </button>
          </div>
        ))}
        {guests.length === 0 && (
          <p className={styles.emptyText}>No guests yet. Add some above.</p>
        )}
      </div>
    </div>
  )
}
