import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HostDashboard from '@/components/host/HostDashboard'

export default async function HostPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('host_id', user.id)
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
        <p style={{ fontSize: '20px', fontWeight: 700 }}>No active party</p>
        <a href="/admin/setup/party" style={{ color: '#ff4d6d', fontSize: '14px' }}>
          Set up your party →
        </a>
      </div>
    )
  }

  return <HostDashboard party={party} />
}
