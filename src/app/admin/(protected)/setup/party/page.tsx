import { createClient } from '@/lib/supabase/server'
import PartySetupForm from '@/components/admin/PartySetupForm'

export default async function PartySetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return <PartySetupForm existingParty={party ?? null} hostId={user!.id} />
}
