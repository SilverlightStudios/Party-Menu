'use client'

import { DrinkIcon } from '@/components/ui/AppIcons'
import { useHaptics } from '@/hooks/useHaptics'
import type { Drink } from '@/lib/supabase/types'
import styles from './styles.module.scss'

interface Props {
  drink: Drink
  onClick: (drink: Drink) => void
  transitionDisabled?: boolean
}

export default function DrinkCard({ drink, onClick, transitionDisabled = false }: Props) {
  const { trigger } = useHaptics()
  const imageTransitionName = transitionDisabled ? undefined : `drink-img-${drink.id}`
  const titleTransitionName = transitionDisabled ? undefined : `drink-name-${drink.id}`

  return (
    <div className={styles.card} onClick={() => { trigger('nudge'); onClick(drink) }}>
      <div
        className={styles.imageWrapper}
        style={{ viewTransitionName: imageTransitionName }}
      >
        {drink.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.image} src={drink.photo_url} alt={drink.name} loading="eager" />
        ) : (
          <div className={styles.imagePlaceholder}>
            <DrinkIcon size={40} />
          </div>
        )}
      </div>
      <div className={styles.info}>
        <p
          className={styles.name}
          style={{ viewTransitionName: titleTransitionName }}
        >
          {drink.name}
        </p>
        {drink.description && (
          <p className={styles.description}>{drink.description}</p>
        )}
      </div>
    </div>
  )
}
