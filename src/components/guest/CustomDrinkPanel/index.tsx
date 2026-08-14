'use client'

import { useState } from 'react'
import { SparklesIcon } from '@/components/ui/AppIcons'
import { useHaptics } from '@/hooks/useHaptics'
import { BottomSheet } from '@/components/ui/BottomSheet'
import styles from './styles.module.scss'

interface Props {
  presented: boolean
  onPresentedChange: (presented: boolean) => void
  onSubmit: (request: string) => void
}

export default function CustomDrinkPanel({ presented, onPresentedChange, onSubmit }: Props) {
  const { trigger } = useHaptics()
  const [request, setRequest] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    if (!request.trim() || isSubmitting) return
    setIsSubmitting(true)
    await onSubmit(request.trim())
    trigger('success')
    setRequest('')
    setIsSubmitting(false)
  }

  return (
    <BottomSheet.Root
      forComponent="closest"
      presented={presented}
      onPresentedChange={onPresentedChange}
    >
      <BottomSheet.Portal>
        <BottomSheet.View>
          <BottomSheet.Backdrop />
          <BottomSheet.Content className={styles.content}>
            <BottomSheet.Handle />
            <BottomSheet.Title asChild>
              <p className={styles.title}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <SparklesIcon size={18} />
                  <span>Custom Request</span>
                </span>
              </p>
            </BottomSheet.Title>
            <BottomSheet.Description asChild>
              <p className={styles.subtitle}>What would you like? The host will see this.</p>
            </BottomSheet.Description>
            <textarea
              className={styles.textarea}
              placeholder="e.g. Moscow Mule, extra lime, no ice..."
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              autoFocus
            />
            <div className={styles.actions}>
              <button
                className={styles.cancelBtn}
                onClick={() => { trigger('nudge'); onPresentedChange(false) }}
              >
                Cancel
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={!request.trim() || isSubmitting}
              >
                {isSubmitting ? 'Sending...' : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <SparklesIcon size={18} />
                    <span>Send Request</span>
                  </span>
                )}
              </button>
            </div>
          </BottomSheet.Content>
        </BottomSheet.View>
      </BottomSheet.Portal>
    </BottomSheet.Root>
  )
}
