import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createAdminClient()
  const formData = await req.formData()
  const file = formData.get('file') as File
  const path = formData.get('path') as string

  if (!file || !path) {
    return NextResponse.json({ error: 'Missing file or path' }, { status: 400 })
  }

  const { error } = await supabase.storage.from('party-photos').upload(path, file, { upsert: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from('party-photos').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
