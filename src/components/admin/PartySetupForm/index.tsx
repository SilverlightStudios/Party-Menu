'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Party } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  existingParty: Party | null
  hostId: string
}

export default function PartySetupForm({ existingParty, hostId }: Props) {
  const [name, setName] = useState(existingParty?.name ?? '')
  const [welcomeMessage, setWelcomeMessage] = useState(existingParty?.welcome_message ?? '')
  const [isActive, setIsActive] = useState(existingParty?.is_active ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    const supabase = createClient()

    if (existingParty) {
      await supabase
        .from('parties')
        .update({ name, welcome_message: welcomeMessage, is_active: isActive })
        .eq('id', existingParty.id)
    } else {
      await supabase.from('parties').insert({
        name,
        welcome_message: welcomeMessage,
        host_id: hostId,
        is_active: isActive,
      })
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setIsSaving(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎉 Party Setup</h1>
        <p className={styles.subtitle}>
          Configure how your party appears to guests
        </p>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Party Name</label>
          <input
            className={styles.input}
            placeholder="e.g. Michelle's Birthday Bash"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Welcome Message</label>
          <input
            className={styles.input}
            placeholder="e.g. Happy Birthday Michelle! 🎂"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
          />
          <p className={styles.hint}>
            This is the headline guests see when they first open the app
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Party Status</label>
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>
              {isActive ? '🟢 Active — guests can join' : '🔴 Inactive — guests cannot join'}
            </span>
            <button
              className={`${styles.toggle} ${isActive ? styles.toggleOn : styles.toggleOff}`}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
          >
            {saved ? '✅ Saved!' : isSaving ? 'Saving...' : 'Save Party'}
          </button>
        </div>

        {existingParty && (
          <div className={styles.qrSection}>
            <p className={styles.qrLabel}>Guest QR Code URL</p>
            <div className={styles.qrUrl}>
              {typeof window !== 'undefined' ? window.location.origin : ''}
            </div>
            <p className={styles.hint}>
              Share this URL or generate a QR code pointing here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
