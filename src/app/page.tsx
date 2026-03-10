import { createClient } from '@/lib/supabase/server'
import OnboardingStep1 from '@/components/guest/OnboardingStep1'

// Loads the single active party. In production the party ID could come from
// an env var (NEXT_PUBLIC_PARTY_ID) or a dynamic route slug.
export default async function HomePage() {
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
        <p style={{ fontSize: '48px' }}>🎉</p>
        <p style={{ fontSize: '20px', fontWeight: 700 }}>No active party found</p>
        <p style={{ color: '#888', fontSize: '14px' }}>
          Ask the host to set up the party first.
        </p>
      </div>
    )
  }

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('party_id', party.id)
    .order('name')

  return <OnboardingStep1 party={party} guests={guests ?? []} />
}
