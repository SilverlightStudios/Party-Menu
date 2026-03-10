'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './styles.module.scss'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendLink() {
    if (!email.trim()) return
    setIsLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    })

    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
    setIsLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.emoji}>🎉</p>
        <h1 className={styles.title}>Host Login</h1>
        <p className={styles.subtitle}>
          Enter your email to receive a magic link
        </p>

        {sent ? (
          <div className={styles.sentMessage}>
            <p className={styles.sentEmoji}>📬</p>
            <p className={styles.sentText}>Magic link sent!</p>
            <p className={styles.sentHint}>Check your email and click the link to log in.</p>
          </div>
        ) : (
          <>
            <input
              className={styles.input}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendLink()}
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
            <button
              className={styles.button}
              onClick={handleSendLink}
              disabled={!email.trim() || isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
