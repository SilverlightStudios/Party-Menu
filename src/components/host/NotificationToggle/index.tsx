'use client'

import { AlertIcon, NotificationIcon } from '@/components/ui/AppIcons'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useHaptics } from '@/hooks/useHaptics'
import styles from './styles.module.scss'

interface Props {
  partyId: string
}

export default function NotificationToggle({ partyId }: Props) {
  const { trigger } = useHaptics()
  const { isSubscribed, isLoading, permission, subscribe, unsubscribe } =
    usePushNotifications(partyId)

  if (permission === 'denied') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.info}>
          <span className={styles.label}>
            <AlertIcon size={16} />
            <span>Notifications blocked</span>
          </span>
          <span className={styles.sublabel}>Enable in browser settings</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <span className={styles.label}>
          <NotificationIcon size={16} />
          <span>Order Notifications</span>
        </span>
        <span className={styles.sublabel}>
          {isSubscribed
            ? 'You will be notified of new orders'
            : 'Get notified when guests order'}
        </span>
      </div>
      <button
        className={`${styles.button} ${isSubscribed ? styles.active : styles.inactive}`}
        onClick={() => { trigger('nudge'); (isSubscribed ? unsubscribe : subscribe)() }}
        disabled={isLoading}
      >
        {isLoading ? '...' : isSubscribed ? 'On' : 'Enable'}
      </button>
    </div>
  )
}
