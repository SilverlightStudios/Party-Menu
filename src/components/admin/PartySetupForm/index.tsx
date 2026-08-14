'use client'

import { useState, useEffect } from 'react'
import { AlertIcon, PartyIcon, SuccessIcon } from '@/components/ui/AppIcons'
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
  const [color1, setColor1] = useState(existingParty?.theme_color1 ?? '#FF9FFC')
  const [color2, setColor2] = useState(existingParty?.theme_color2 ?? '#5227FF')
  const [color3, setColor3] = useState(existingParty?.theme_color3 ?? '#B19EEF')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 2500)
    return () => clearTimeout(t)
  }, [saved])

  async function handleSave() {
    setIsSaving(true)
    const supabase = createClient()

    if (existingParty) {
      await supabase
        .from('parties')
        .update({ name, welcome_message: welcomeMessage, is_active: isActive, theme_color1: color1, theme_color2: color2, theme_color3: color3 })
        .eq('id', existingParty.id)
    } else {
      await supabase.from('parties').insert({
        name,
        welcome_message: welcomeMessage,
        host_id: hostId,
        is_active: isActive,
        theme_color1: color1,
        theme_color2: color2,
        theme_color3: color3,
      })
    }

    setSaved(true)
    setIsSaving(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <PartyIcon size={26} />
          <span>Party Setup</span>
        </h1>
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
            placeholder="e.g. Happy Birthday Michelle!"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
          />
          <p className={styles.hint}>
            This is the headline guests see when they first open the app
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Party Theme</label>
          <div className={styles.colorRow}>
            {[
              { label: 'Primary', value: color1, onChange: setColor1 },
              { label: 'Secondary', value: color2, onChange: setColor2 },
              { label: 'Accent', value: color3, onChange: setColor3 },
            ].map(({ label, value, onChange }) => (
              <div key={label} className={styles.colorSwatch}>
                <input
                  type="color"
                  className={styles.colorInput}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                <span className={styles.colorLabel}>{label}</span>
              </div>
            ))}
          </div>
          <p className={styles.hint}>Colors used for the animated background guests see</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Party Status</label>
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>
              {isActive ? (
                <>
                  <SuccessIcon size={16} />
                  <span>Active — guests can join</span>
                </>
              ) : (
                <>
                  <AlertIcon size={16} />
                  <span>Inactive — guests cannot join</span>
                </>
              )}
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
            {saved ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <SuccessIcon size={18} />
                <span>Saved!</span>
              </span>
            ) : isSaving ? 'Saving...' : 'Save Party'}
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
