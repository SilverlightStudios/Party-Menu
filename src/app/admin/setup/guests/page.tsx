import { createClient } from '@/lib/supabase/server'
import GuestListManager from '@/components/admin/GuestListManager'

export default async function GuestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: guests } = party
    ? await supabase
        .from('guests')
        .select('*')
        .eq('party_id', party.id)
        .order('name')
    : { data: [] }

  return <GuestListManager party={party ?? null} guests={guests ?? []} />
}
