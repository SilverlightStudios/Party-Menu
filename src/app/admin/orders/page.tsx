import { createClient } from '@/lib/supabase/server'
import AdminOrdersView from '@/components/admin/OrdersBoard'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('host_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return <AdminOrdersView party={party ?? null} />
}
