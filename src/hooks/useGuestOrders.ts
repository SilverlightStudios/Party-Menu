'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/supabase/types'

export type GuestOrder = Order

export function useGuestOrders(guestId: string | null, partyId: string | null) {
  const [pendingOrders, setPendingOrders] = useState<GuestOrder[]>([])
  const [lastFulfilledOrder, setLastFulfilledOrder] = useState<GuestOrder | null>(null)
  const [isLoading, setIsLoading] = useState(!!guestId && !!partyId)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!guestId || !partyId) {
      return
    }

    const supabase = createClient()

    // Initial fetch of pending orders
    supabase
      .from('orders')
      .select('*, drink:drinks(*)')
      .eq('guest_id', guestId)
      .eq('party_id', partyId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPendingOrders(data as GuestOrder[])
        setIsLoading(false)
      })

    // Real-time subscription for this guest's orders
    const channel = supabase
      .channel(`guest-orders:${guestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `guest_id=eq.${guestId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('orders')
            .select('*, drink:drinks(*)')
            .eq('id', payload.new.id)
            .single()
          if (data && data.status === 'pending') {
            setPendingOrders((prev) => [data as GuestOrder, ...prev])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `guest_id=eq.${guestId}`,
        },
        (payload) => {
          if (payload.new.status === 'fulfilled') {
            setPendingOrders((prev) => {
              const fulfilled = prev.find((o) => o.id === payload.new.id)
              if (fulfilled) {
                setLastFulfilledOrder(fulfilled)
              }
              return prev.filter((o) => o.id !== payload.new.id)
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders',
          filter: `guest_id=eq.${guestId}`,
        },
        (payload) => {
          setPendingOrders((prev) => prev.filter((order) => order.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [guestId, partyId])

  const dismissFulfilled = useCallback(() => {
    setLastFulfilledOrder(null)
  }, [])

  const cancelPendingOrder = useCallback(async (orderId: string) => {
    if (!guestId || !partyId || cancellingOrderId) return false

    setCancellingOrderId(orderId)

    try {
      const response = await fetch('/api/orders', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          guest_id: guestId,
          party_id: partyId,
        }),
      })

      if (!response.ok) {
        return false
      }

      setPendingOrders((prev) => prev.filter((order) => order.id !== orderId))
      return true
    } catch {
      return false
    } finally {
      setCancellingOrderId((current) => (current === orderId ? null : current))
    }
  }, [cancellingOrderId, guestId, partyId])

  const latestPendingOrder = pendingOrders[0] ?? null
  const hasPendingOrders = pendingOrders.length > 0

  return {
    pendingOrders,
    latestPendingOrder,
    hasPendingOrders,
    lastFulfilledOrder,
    dismissFulfilled,
    isLoading,
    cancellingOrderId,
    cancelPendingOrder,
  }
}
