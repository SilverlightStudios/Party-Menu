'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Poke } from '@/lib/supabase/types'

export function usePokes(guestId: string | null, partyId: string | null) {
  const [incomingPoke, setIncomingPoke] = useState<Poke | null>(null)

  const dismissPoke = useCallback(() => setIncomingPoke(null), [])

  useEffect(() => {
    if (!guestId || !partyId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`pokes:${guestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pokes',
          filter: `to_guest_id=eq.${guestId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('pokes')
            .select('*, from_guest:guests!from_guest_id(*)')
            .eq('id', payload.new.id)
            .single()
          if (data) setIncomingPoke(data as Poke)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [guestId, partyId])

  return { incomingPoke, dismissPoke }
}
