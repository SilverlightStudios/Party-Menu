'use client'

import { usePushNotifications } from '@/hooks/usePushNotifications'
import styles from './styles.module.scss'

interface Props {
  partyId: string
}

export default function NotificationToggle({ partyId }: Props) {
  const { isSubscribed, isLoading, permission, subscribe, unsubscribe } =
    usePushNotifications(partyId)

  if (permission === 'denied') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.info}>
          <span className={styles.label}>🔔 Notifications blocked</span>
          <span className={styles.sublabel}>Enable in browser settings</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <span className={styles.label}>🔔 Order Notifications</span>
        <span className={styles.sublabel}>
          {isSubscribed
            ? 'You will be notified of new orders'
            : 'Get notified when guests order'}
        </span>
      </div>
      <button
        className={`${styles.button} ${isSubscribed ? styles.active : styles.inactive}`}
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading}
      >
        {isLoading ? '...' : isSubscribed ? 'On' : 'Enable'}
      </button>
    </div>
  )
}
