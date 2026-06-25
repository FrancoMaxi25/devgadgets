import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: perfil }, { data: pedidos }] = await Promise.all([
    supabase.from('perfiles').select('*').eq('id', user.id).single(),
    supabase.from('pedidos').select('*, detalle_pedidos(*, productos(nombre))').eq('usuario_id', user.id).order('creado_en', { ascending: false }),
  ])

  const estadoColor: Record<string, string> = {
    pendiente: 'bg-amber-900/50 text-amber-400 border-amber-800',
    pagado: 'bg-blue-900/50 text-blue-400 border-blue-800',
    enviado: 'bg-violet-900/50 text-violet-400 border-violet-800',
    entregado: 'bg-green-900/50 text-green-400 border-green-800',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header perfil */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 flex items-center gap-5">
        {perfil?.avatar ? (
          <img src={perfil.avatar} alt="avatar" className="w-16 h-16 rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-violet-700 flex items-center justify-center text-xl font-semibold text-white">
            {perfil?.nombre?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">{perfil?.nombre ?? 'Usuario'}</h1>
          <p className="text-zinc-500 text-sm">{user.email}</p>
          <Badge className={`mt-2 ${perfil?.rol === 'admin' ? 'bg-violet-900/50 text-violet-400 border-violet-800' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
            {perfil?.rol}
          </Badge>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-red-400 hover:text-red-300 transition-colors">
            Cerrar sesión
          </button>
        </form>
      </div>

      {/* Mis pedidos */}
      <h2 className="text-xl font-semibold text-white mb-5">Mis pedidos</h2>

      {pedidos && pedidos.length > 0 ? (
        <div className="space-y-4">
          {pedidos.map((pedido: any) => (
            <div key={pedido.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-zinc-500 text-xs font-mono">#{pedido.id.slice(0, 12)}...</p>
                  <p className="text-zinc-400 text-sm">{new Date(pedido.creado_en).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <Badge className={estadoColor[pedido.estado] ?? 'bg-zinc-800 text-zinc-400'}>
                    {pedido.estado}
                  </Badge>
                  <p className="text-white font-semibold mt-1">S/ {pedido.total.toFixed(2)}</p>
                </div>
              </div>
              <div className="border-t border-zinc-800 pt-3">
                {pedido.detalle_pedidos?.map((d: any) => (
                  <p key={d.id} className="text-zinc-500 text-sm">
                    {d.productos?.nombre} × {d.cantidad}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-600 mb-3">Aún no tienes pedidos</p>
          <Link href="/productos" className="text-violet-400 hover:text-violet-300 text-sm">
            Explorar productos →
          </Link>
        </div>
      )}
    </div>
  )
}