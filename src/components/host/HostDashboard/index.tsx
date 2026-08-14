'use client'

import { PartyIcon } from '@/components/ui/AppIcons'
import { useOrders } from '@/hooks/useOrders'
import OrderFeed from '@/components/host/OrderFeed'
import NotificationToggle from '@/components/host/NotificationToggle'
import type { Party } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  party: Party
}

export default function HostDashboard({ party }: Props) {
  const { orders, isLoading } = useOrders(party.id)
  const pendingCount = orders.filter((o) => o.status === 'pending').length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>
            <PartyIcon size={24} />
            <span>{party.name}</span>
          </h1>
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
          <OrderFeed orders={orders} />
        )}
      </div>
    </div>
  )
}
