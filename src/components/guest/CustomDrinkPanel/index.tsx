'use client'

import { useState } from 'react'
import styles from './styles.module.scss'

interface Props {
  onSubmit: (request: string) => void
  onClose: () => void
}

export default function CustomDrinkPanel({ onSubmit, onClose }: Props) {
  const [request, setRequest] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    if (!request.trim() || isSubmitting) return
    setIsSubmitting(true)
    await onSubmit(request.trim())
    setIsSubmitting(false)
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <p className={styles.title}>✨ Custom Request</p>
        <p className={styles.subtitle}>What would you like? The host will see this.</p>
        <textarea
          className={styles.textarea}
          placeholder="e.g. Moscow Mule, extra lime, no ice..."
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          autoFocus
        />
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!request.trim() || isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Request 🎉'}
          </button>
        </div>
      </div>
    </div>
  )
}
