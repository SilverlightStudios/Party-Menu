'use client'

import { useState } from 'react'
import { useOrders } from '@/hooks/useOrders'
import OrderFeed from '@/components/host/OrderFeed'
import type { Party } from '@/lib/supabase/types'
import styles from './styles.module.scss'

type StatusFilter = 'all' | 'pending' | 'fulfilled'

interface Props {
  party: Party | null
}

export default function AdminOrdersView({ party }: Props) {
  const { orders, isLoading } = useOrders(party?.id ?? null)
  const [filter, setFilter] = useState<StatusFilter>('all')

  if (!party) {
    return (
      <div className={styles.empty}>
        <p>No active party found.</p>
        <a href="/admin/setup/party" className={styles.link}>→ Set up a party</a>
      </div>
    )
  }

  const filteredOrders =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const fulfilledCount = orders.filter((o) => o.status === 'fulfilled').length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>📋 Live Orders</h1>
        <p className={styles.subtitle}>{party.name}</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <p className={styles.statValue}>{orders.length}</p>
          <p className={styles.statLabel}>Total</p>
        </div>
        <div className={styles.stat}>
          <p className={`${styles.statValue} ${styles.pending}`}>{pendingCount}</p>
          <p className={styles.statLabel}>Pending</p>
        </div>
        <div className={styles.stat}>
          <p className={`${styles.statValue} ${styles.fulfilled}`}>{fulfilledCount}</p>
          <p className={styles.statLabel}>Fulfilled</p>
        </div>
      </div>

      <div className={styles.filters}>
        {(['all', 'pending', 'fulfilled'] as StatusFilter[]).map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className={styles.loading}>Loading orders...</p>
      ) : (
        <OrderFeed orders={filteredOrders} />
      )}
    </div>
  )
}
