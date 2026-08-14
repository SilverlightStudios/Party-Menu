import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createAdminClient()
  const formData = await req.formData()
  const file = formData.get('file') as File
  const guestId = formData.get('guestId') as string

  if (!file || !guestId) {
    return NextResponse.json({ error: 'Missing file or guestId' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are supported' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be 10MB or smaller' }, { status: 400 })
  }

  const { data: guest } = await supabase
    .from('guests')
    .select('id')
    .eq('id', guestId)
    .single()

  if (!guest) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }

  const extension = file.name.split('.').pop()?.toLowerCase()?.replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `guests/${guestId}/${Date.now()}-${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from('party-photos').upload(path, file, {
    upsert: false,
    cacheControl: '3600',
    contentType: file.type,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabase.storage.from('party-photos').getPublicUrl(path)
  const photoUrl = data.publicUrl

  const { error: updateError } = await supabase
    .from('guests')
    .update({ photo_url: photoUrl })
    .eq('id', guestId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ url: photoUrl })
}
