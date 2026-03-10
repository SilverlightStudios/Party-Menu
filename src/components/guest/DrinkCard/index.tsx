'use client'

import type { Drink } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  drink: Drink
  onClick: (drink: Drink) => void
}

export default function DrinkCard({ drink, onClick }: Props) {
  return (
    <div className={styles.card} onClick={() => onClick(drink)}>
      <div className={styles.imageWrapper}>
        {drink.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.image} src={drink.photo_url} alt={drink.name} />
        ) : (
          <div className={styles.imagePlaceholder}>🍹</div>
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{drink.name}</p>
        {drink.description && (
          <p className={styles.description}>{drink.description}</p>
        )}
      </div>
    </div>
  )
}
