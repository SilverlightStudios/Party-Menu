import { useLayoutEffect } from 'react'
import { updateThemeColor } from '@silk-hq/components'
import type { Party } from '@/lib/supabase/types'

export function useTheme(party: Party) {
  useLayoutEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--theme-1', party.theme_color1)
    root.style.setProperty('--theme-2', party.theme_color2)
    root.style.setProperty('--theme-3', party.theme_color3)
    if (party.theme_color1) updateThemeColor(party.theme_color1)
    return () => {
      root.style.removeProperty('--theme-1')
      root.style.removeProperty('--theme-2')
      root.style.removeProperty('--theme-3')
    }
  }, [party.theme_color1, party.theme_color2, party.theme_color3])
}
