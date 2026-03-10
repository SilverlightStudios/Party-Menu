import Link from 'next/link'
import styles from './styles.module.scss'

const NAV_ITEMS = [
  { label: 'Party Setup', href: '/admin/setup/party', emoji: '🎉' },
  { label: 'Guests', href: '/admin/setup/guests', emoji: '👥' },
  { label: 'Drinks Menu', href: '/admin/setup/drinks', emoji: '🍹' },
  { label: 'Live Orders', href: '/admin/orders', emoji: '📋' },
  { label: 'Host View', href: '/host', emoji: '📱' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandEmoji}>🎉</span>
          <span className={styles.brandName}>Party Menu</span>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navItem}>
              <span className={styles.navEmoji}>{item.emoji}</span>
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
