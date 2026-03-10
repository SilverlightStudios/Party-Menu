'use client'

import { useState } from 'react'
import { useOrders } from '@/hooks/useOrders'
import OrderFeed from '@/components/host/OrderFeed'
import NotificationToggle from '@/components/host/NotificationToggle'
import type { Party, Order } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  party: Party
}

export default function HostDashboard({ party }: Props) {
  const { orders, isLoading } = useOrders(party.id)
  const [localOrders, setLocalOrders] = useState<Order[]>([])

  const displayOrders = orders.length > 0 ? orders : localOrders
  const pendingCount = displayOrders.filter((o) => o.status === 'pending').length

  function handleFulfill(orderId: string) {
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'fulfilled' as const } : o))
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>🎉 {party.name}</h1>
          <p className={styles.subtitle}>
            {isLoading
              ? 'Loading...'
              : pendingCount > 0
              ? `${pendingCount} pending order${pendingCount === 1 ? '' : 's'}`
              : 'All caught up!'}
          </p>
        </div>
        <a href="/admin/orders" className={styles.adminLink}>
          Admin
        </a>
      </div>

      <NotificationToggle partyId={party.id} />

      <div className={styles.feedSection}>
        <p className={styles.sectionLabel}>Orders</p>
        {isLoading ? (
          <div className={styles.loading}>Loading orders...</div>
        ) : (
          <OrderFeed orders={displayOrders} onFulfill={handleFulfill} />
        )}
      </div>
    </div>
  )
}
