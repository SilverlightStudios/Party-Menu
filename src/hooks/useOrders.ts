'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/supabase/types'

export function useOrders(partyId: string | null) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!partyId) return

    const supabase = createClient()

    // Initial fetch
    supabase
      .from('orders')
      .select('*, guest:guests(*), drink:drinks(*)')
      .eq('party_id', partyId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as Order[])
        setIsLoading(false)
      })

    // Real-time subscription
    const channel = supabase
      .channel(`orders:${partyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `party_id=eq.${partyId}`,
        },
        async (payload) => {
          // Fetch the full order with joins
          const { data } = await supabase
            .from('orders')
            .select('*, guest:guests(*), drink:drinks(*)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            setOrders((prev) => [data as Order, ...prev])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `party_id=eq.${partyId}`,
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === payload.new.id ? { ...o, ...payload.new } : o
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partyId])

  return { orders, isLoading }
}
