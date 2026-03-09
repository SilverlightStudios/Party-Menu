import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createAdminClient()
  const body = await req.json()
  const { party_id, from_guest_id, to_guest_id } = body

  const { data, error } = await supabase
    .from('pokes')
    .insert({ party_id, from_guest_id, to_guest_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
