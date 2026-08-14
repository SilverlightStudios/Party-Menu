'use client'

import { createClient } from '@/lib/supabase/client'
import { useHaptics } from '@/hooks/useHaptics'
import {
  DrinkIcon,
  PendingIcon,
  SparklesIcon,
  SuccessIcon,
} from '@/components/ui/AppIcons'
import AvatarBadge from '@/components/ui/AvatarBadge'
import type { Order } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  orders: Order[]
  onFulfill?: (orderId: string) => void
}

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function OrderFeed({ orders, onFulfill }: Props) {
  const { trigger } = useHaptics()

  async function handleFulfill(orderId: string) {
    const supabase = createClient()
    await supabase.from('orders').update({ status: 'fulfilled' }).eq('id', orderId)
    trigger('success')
    onFulfill?.(orderId)
  }

  if (orders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <DrinkIcon className={styles.emptyEmoji} size={56} />
        <p className={styles.emptyText}>No orders yet</p>
        <p className={styles.emptySubtext}>Guests will appear here when they order</p>
      </div>
    )
  }

  return (
    <div className={styles.feed}>
      {orders.map((order) => (
        <div
          key={order.id}
          className={`${styles.card} ${order.status === 'fulfilled' ? styles.fulfilled : ''}`}
        >
          <AvatarBadge
            name={order.guest?.name ?? '?'}
            photoUrl={order.guest?.photo_url}
            seed={order.guest?.id ?? order.guest?.name ?? order.id}
            className={styles.guestAvatar}
          />

          <div className={styles.cardBody}>
            <p className={styles.guestName}>{order.guest?.name}</p>
            <p className={styles.drinkName}>
              {order.drink?.name ?? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <SparklesIcon size={16} />
                  <span>Custom request</span>
                </span>
              )}
            </p>
            {order.custom_request && (
              <p className={styles.customRequest}>
                &quot;{order.custom_request}&quot;
              </p>
            )}
            <p className={styles.time}>{formatTime(order.created_at)}</p>
          </div>

          <div className={styles.cardActions}>
            <span className={`${styles.statusBadge} ${styles[order.status]}`}>
              {order.status === 'pending' ? (
                <>
                  <PendingIcon size={12} />
                  <span>Pending</span>
                </>
              ) : (
                <>
                  <SuccessIcon size={12} />
                  <span>Done</span>
                </>
              )}
            </span>
            {order.status === 'pending' && (
              <button
                className={styles.fulfillButton}
                onClick={() => handleFulfill(order.id)}
              >
                Mark done
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
