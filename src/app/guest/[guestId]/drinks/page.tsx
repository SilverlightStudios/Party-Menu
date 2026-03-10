import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DrinkMenu from '@/components/guest/DrinkMenu'

interface Props {
  params: Promise<{ guestId: string }>
}

export default async function DrinksPage({ params }: Props) {
  const { guestId } = await params
  const supabase = await createClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('*')
    .eq('id', guestId)
    .single()

  if (!guest) notFound()

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('id', guest.party_id)
    .single()

  if (!party) notFound()

  const { data: drinks } = await supabase
    .from('drinks')
    .select('*')
    .eq('party_id', party.id)
    .eq('is_available', true)
    .order('display_order')

  return <DrinkMenu party={party} guest={guest} drinks={drinks ?? []} />
}
