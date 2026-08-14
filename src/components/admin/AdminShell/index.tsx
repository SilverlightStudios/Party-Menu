import Link from 'next/link'
import {
  DrinkIcon,
  GuestsIcon,
  HostIcon,
  OrdersIcon,
  PartyIcon,
} from '@/components/ui/AppIcons'
import styles from './styles.module.scss'

const NAV_ITEMS = [
  { label: 'Party Setup', href: '/admin/setup/party', icon: PartyIcon },
  { label: 'Guests', href: '/admin/setup/guests', icon: GuestsIcon },
  { label: 'Drinks Menu', href: '/admin/setup/drinks', icon: DrinkIcon },
  { label: 'Live Orders', href: '/admin/orders', icon: OrdersIcon },
  { label: 'Host View', href: '/host', icon: HostIcon },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <PartyIcon className={styles.brandEmoji} size={24} />
          <span className={styles.brandName}>Party Menu</span>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navItem}>
              <item.icon className={styles.navEmoji} size={20} />
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
