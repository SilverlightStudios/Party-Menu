'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MailboxIcon, PartyIcon } from '@/components/ui/AppIcons'
import { createClient } from '@/lib/supabase/client'
import styles from './styles.module.scss'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(
    callbackError === 'auth'
      ? 'Login failed. The link may have expired — please try again.'
      : ''
  )

  async function handleSendLink() {
    if (!email.trim()) return
    setIsLoading(true)
    setError('')

    const emailRedirectUrl = new URL('/auth/callback', window.location.origin)
    emailRedirectUrl.searchParams.set('next', '/admin/setup/party')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: emailRedirectUrl.toString(),
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
    <div className={styles.card}>
      <PartyIcon className={styles.emoji} size={48} />
      <h1 className={styles.title}>Host Login</h1>
      <p className={styles.subtitle}>
        Enter your email to receive a magic link
      </p>

      {sent ? (
        <div className={styles.sentMessage}>
          <MailboxIcon className={styles.sentEmoji} size={48} />
          <p className={styles.sentText}>Magic link sent!</p>
          <p className={styles.sentHint}>Check your email and click the link to log in.</p>
        </div>
      ) : (
        <>
          {error && <p className={styles.error}>{error}</p>}
          <input
            className={styles.input}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendLink()}
            autoFocus
          />
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
  )
}

export default function AdminLoginPage() {
  return (
    <div className={styles.page}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
