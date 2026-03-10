'use client'

import { createClient } from '@/lib/supabase/client'
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

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function OrderFeed({ orders, onFulfill }: Props) {
  async function handleFulfill(orderId: string) {
    const supabase = createClient()
    await supabase.from('orders').update({ status: 'fulfilled' }).eq('id', orderId)
    onFulfill?.(orderId)
  }

  if (orders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyEmoji}>🍹</span>
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
          <div className={styles.guestAvatar}>
            {order.guest?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={order.guest.photo_url} alt={order.guest.name} />
            ) : (
              getInitials(order.guest?.name ?? '?')
            )}
          </div>

          <div className={styles.cardBody}>
            <p className={styles.guestName}>{order.guest?.name}</p>
            <p className={styles.drinkName}>
              {order.drink?.name ?? '✨ Custom request'}
            </p>
            {order.custom_request && (
              <p className={styles.customRequest}>"{order.custom_request}"</p>
            )}
            <p className={styles.time}>{formatTime(order.created_at)}</p>
          </div>

          <div className={styles.cardActions}>
            <span className={`${styles.statusBadge} ${styles[order.status]}`}>
              {order.status === 'pending' ? '⏳ Pending' : '✅ Done'}
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
