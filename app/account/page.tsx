import { getProfile } from '@/lib/action/user'
import AccountForm from './account-form'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Mendefinisikan tipe data untuk order
interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export default async function Account() {
  const { user } = await getProfile()
  const supabase = await createServerSupabaseClient()
  
  // Mengambil riwayat pesanan pengguna dari database
  let orders: Order[] = []
  
  if (user) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        payment_status,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching orders:', error)
    } else {
      orders = data || []
    }
  }

  return <AccountForm user={user} orders={orders} />
}