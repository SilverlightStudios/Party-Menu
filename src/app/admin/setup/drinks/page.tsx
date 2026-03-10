import { createClient } from '@/lib/supabase/server'
import DrinkMenuManager from '@/components/admin/DrinkMenuManager'

export default async function DrinksSetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: drinks } = party
    ? await supabase
        .from('drinks')
        .select('*')
        .eq('party_id', party.id)
        .order('display_order')
    : { data: [] }

  return <DrinkMenuManager party={party ?? null} drinks={drinks ?? []} />
}
