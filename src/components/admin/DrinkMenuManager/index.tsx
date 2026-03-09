'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Drink, Party } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  party: Party | null
  drinks: Drink[]
}

export default function DrinkMenuManager({ party, drinks: initialDrinks }: Props) {
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!party) {
    return (
      <div className={styles.empty}>
        <p>Set up a party first before adding drinks.</p>
        <a href="/admin/setup/party" className={styles.link}>→ Go to Party Setup</a>
      </div>
    )
  }

  function openAdd() {
    setName('')
    setDescription('')
    setPhotoFile(null)
    setEditingId(null)
    setIsAdding(true)
  }

  function openEdit(drink: Drink) {
    setName(drink.name)
    setDescription(drink.description ?? '')
    setPhotoFile(null)
    setEditingId(drink.id)
    setIsAdding(true)
  }

  async function handleSave() {
    if (!name.trim() || !party) return
    setIsSaving(true)
    const supabase = createClient()

    let photoUrl: string | null = null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `drinks/${party.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('party-photos').upload(path, photoFile)
      if (!error) {
        photoUrl = supabase.storage.from('party-photos').getPublicUrl(path).data.publicUrl
      }
    }

    if (editingId) {
      const update: Partial<Drink> = { name, description: description || null }
      if (photoUrl) update.photo_url = photoUrl

      const { data } = await supabase
        .from('drinks')
        .update(update)
        .eq('id', editingId)
        .select()
        .single()

      if (data) {
        setDrinks((prev) => prev.map((d) => (d.id === editingId ? data : d)))
      }
    } else {
      const { data } = await supabase
        .from('drinks')
        .insert({
          party_id: party.id,
          name,
          description: description || null,
          photo_url: photoUrl,
          display_order: drinks.length,
        })
        .select()
        .single()

      if (data) setDrinks((prev) => [...prev, data])
    }

    setIsAdding(false)
    setIsSaving(false)
  }

  async function handleToggleAvailability(drink: Drink) {
    const supabase = createClient()
    const { data } = await supabase
      .from('drinks')
      .update({ is_available: !drink.is_available })
      .eq('id', drink.id)
      .select()
      .single()
    if (data) {
      setDrinks((prev) => prev.map((d) => (d.id === drink.id ? data : d)))
    }
  }

  async function handleDelete(drinkId: string) {
    const supabase = createClient()
    await supabase.from('drinks').delete().eq('id', drinkId)
    setDrinks((prev) => prev.filter((d) => d.id !== drinkId))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🍹 Drink Menu</h1>
          <p className={styles.subtitle}>{drinks.length} drinks for {party.name}</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          + Add Drink
        </button>
      </div>

      {/* Add/Edit form */}
      {isAdding && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{editingId ? 'Edit Drink' : 'New Drink'}</h2>

          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              className={styles.input}
              placeholder="e.g. Gin & Tonic"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description (optional)</label>
            <input
              className={styles.input}
              placeholder="e.g. Refreshing with a twist of lime"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Photo</label>
            <button
              className={styles.photoPickerBtn}
              onClick={() => fileRef.current?.click()}
            >
              {photoFile ? `📷 ${photoFile.name}` : '📷 Choose photo'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={!name.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : editingId ? 'Update' : 'Add Drink'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.drinkGrid}>
        {drinks.map((drink) => (
          <div key={drink.id} className={`${styles.drinkCard} ${!drink.is_available ? styles.unavailable : ''}`}>
            <div className={styles.drinkImage}>
              {drink.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={drink.photo_url} alt={drink.name} />
              ) : (
                <span>🍹</span>
              )}
            </div>
            <div className={styles.drinkInfo}>
              <p className={styles.drinkName}>{drink.name}</p>
              {drink.description && (
                <p className={styles.drinkDesc}>{drink.description}</p>
              )}
            </div>
            <div className={styles.drinkActions}>
              <button
                className={`${styles.availabilityBtn} ${drink.is_available ? styles.available : styles.hidden}`}
                onClick={() => handleToggleAvailability(drink)}
              >
                {drink.is_available ? 'Available' : 'Hidden'}
              </button>
              <button className={styles.editBtn} onClick={() => openEdit(drink)}>Edit</button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(drink.id)}>✕</button>
            </div>
          </div>
        ))}
        {drinks.length === 0 && !isAdding && (
          <p className={styles.emptyText}>No drinks yet. Add your first one above.</p>
        )}
      </div>
    </div>
  )
}
