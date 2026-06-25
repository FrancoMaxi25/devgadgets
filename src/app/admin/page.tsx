import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  // Verificar sesión normal
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar rol
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfil?.rol !== 'admin') redirect('/')

  // Cliente admin que bypasea RLS completamente
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: productos },
    { data: pedidosRaw },
    { data: usuarios },
  ] = await Promise.all([
    admin.from('productos').select('*').order('creado_en', { ascending: false }),
    admin.from('pedidos').select('*').order('creado_en', { ascending: false }),
    admin.from('perfiles').select('*').order('creado_en', { ascending: false }),
  ])

  // Debug
  console.log('Admin - productos:', productos?.length)
  console.log('Admin - pedidosRaw:', pedidosRaw?.length)
  console.log('Admin - usuarios:', usuarios?.length)
  console.log('IDs usuarios:', usuarios?.map(u => u.id))
  console.log('IDs pedidos usuario_id:', pedidosRaw?.map(p => p.usuario_id))

  // Enriquecer pedidos con nombre de usuario
  const pedidos = (pedidosRaw ?? []).map(pedido => {
    const usuario = (usuarios ?? []).find(u => u.id === pedido.usuario_id)
    console.log(`Pedido ${pedido.id} → usuario_id: ${pedido.usuario_id} → encontrado: ${!!usuario}`)
    return { ...pedido, usuario: usuario ?? null }
  })

  console.log('Admin - pedidos enriquecidos:', pedidos.length)

  return (
    <AdminDashboard
      productos={productos ?? []}
      pedidos={pedidos}
      usuarios={usuarios ?? []}
    />
  )
}