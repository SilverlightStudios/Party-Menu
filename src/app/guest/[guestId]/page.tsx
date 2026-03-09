import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingStep2 from '@/components/guest/OnboardingStep2'

interface Props {
  params: Promise<{ guestId: string }>
}

export default async function GuestPage({ params }: Props) {
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

  const { data: allGuests } = await supabase
    .from('guests')
    .select('*')
    .eq('party_id', party.id)
    .order('name')

  return (
    <OnboardingStep2
      party={party}
      guest={guest}
      allGuests={allGuests ?? []}
    />
  )
}
