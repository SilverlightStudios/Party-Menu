'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export function usePushNotifications(partyId: string | null) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

  const subscribe = useCallback(async () => {
    if (!partyId || !('serviceWorker' in navigator) || !('PushManager' in window)) return

    setIsLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const existingSub = await reg.pushManager.getSubscription()
      if (existingSub) {
        setIsSubscribed(true)
        return
      }

      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const sub = subscription.toJSON()
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('push_subscriptions').upsert({
        host_id: user.id,
        party_id: partyId,
        endpoint: sub.endpoint!,
        p256dh: (sub.keys as Record<string, string>).p256dh,
        auth: (sub.keys as Record<string, string>).auth,
      })

      setIsSubscribed(true)
    } catch (err) {
      console.error('Push subscription failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [partyId])

  const unsubscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await sub.unsubscribe()
      const supabase = createClient()
      await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      setIsSubscribed(false)
    }
  }, [])

  return { isSubscribed, isLoading, permission, subscribe, unsubscribe }
}
