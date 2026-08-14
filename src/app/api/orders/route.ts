import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createAdminClient()
  const body = await req.json()
  const { party_id, guest_id, drink_id, custom_request } = body

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      party_id,
      guest_id,
      drink_id: drink_id ?? null,
      custom_request: custom_request ?? null,
      status: 'pending',
    })
    .select('*, guest:guests(*), drink:drinks(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send push notifications only if VAPID keys are configured
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY

  if (vapidPublic && vapidPrivate) {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('party_id', party_id)

    if (subs?.length) {
      // Dynamically import to avoid module-level VAPID initialization during build
      const webpush = await import('web-push')
      webpush.default.setVapidDetails(
        'mailto:' + (process.env.VAPID_EMAIL ?? 'host@partymenu.app'),
        vapidPublic,
        vapidPrivate
      )

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderData = order as any
      const drinkLabel = orderData.drink?.name ?? (custom_request ? 'Custom request' : 'Drink')
      const guestName = orderData.guest?.name ?? 'A guest'

      await Promise.allSettled(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (subs as any[]).map((sub) =>
          webpush.default.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({
              title: `New order from ${guestName}`,
              body: drinkLabel,
              tag: orderData.id,
            })
          )
        )
      )
    }
  }

  return NextResponse.json(order)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createAdminClient()
  const body = await req.json().catch(() => null)

  const orderId = typeof body?.order_id === 'string' ? body.order_id : null
  const guestId = typeof body?.guest_id === 'string' ? body.guest_id : null
  const partyId = typeof body?.party_id === 'string' ? body.party_id : null

  if (!orderId || !guestId || !partyId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: deletedOrder, error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)
    .eq('guest_id', guestId)
    .eq('party_id', partyId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!deletedOrder) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(deletedOrder)
}
