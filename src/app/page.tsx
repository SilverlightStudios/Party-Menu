import { redirect } from 'next/navigation'
import { PartyIcon } from '@/components/ui/AppIcons'
import { createClient } from '@/lib/supabase/server'
import GuestApp from '@/components/guest/GuestApp'

// Loads the single active party. In production the party ID could come from
// an env var (NEXT_PUBLIC_PARTY_ID) or a dynamic route slug.
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry))
    } else if (value) {
      params.set(key, value)
    }
  }

  if (params.has('code')) {
    if (!params.has('next')) {
      params.set('next', '/admin/setup/party')
    }

    redirect(`/auth/callback?${params.toString()}`)
  }

  const supabase = await createClient()

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!party) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          flexDirection: 'column',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
          background: '#0a0a0a',
          color: '#fff',
        }}
      >
        <PartyIcon size={48} />
        <p style={{ fontSize: '20px', fontWeight: 700 }}>No active party found</p>
        <p style={{ color: '#888', fontSize: '14px' }}>
          Ask the host to set up the party first.
        </p>
      </div>
    )
  }

  const [{ data: guests }, { data: drinks }] = await Promise.all([
    supabase
      .from('guests')
      .select('*')
      .eq('party_id', party.id)
      .order('name'),
    supabase
      .from('drinks')
      .select('*')
      .eq('party_id', party.id)
      .eq('is_available', true)
      .order('display_order'),
  ])

  return <GuestApp party={party} guests={guests ?? []} drinks={drinks ?? []} />
}
