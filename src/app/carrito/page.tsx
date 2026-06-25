import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CarritoCliente from '@/components/CarritoCliente'

export default async function CarritoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/carrito')

  const { data: items } = await supabase
    .from('carrito')
    .select('*, productos(*)')
    .eq('usuario_id', user.id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-semibold text-white mb-10">Mi carrito</h1>
      <CarritoCliente itemsIniciales={items ?? []} />
    </div>
  )
}