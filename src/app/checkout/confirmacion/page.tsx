import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string }>
}) {
  const params = await searchParams  // ← await obligatorio en Next.js 16
  const supabase = await createClient()

  const { data: pedido } = params.pedido
    ? await supabase.from('pedidos').select('*').eq('id', params.pedido).single()
    : { data: null }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <h1 className="text-3xl font-semibold text-white mb-3">¡Pedido confirmado!</h1>
        <p className="text-zinc-400 mb-2">Tu pedido fue registrado correctamente.</p>

        {pedido && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 my-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">ID del pedido</span>
              <span className="text-zinc-300 font-mono text-xs">{pedido.id.slice(0, 16)}...</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Método de pago</span>
              <span className="text-zinc-300">{pedido.metodo_pago}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Estado</span>
              <span className="text-amber-400 capitalize">{pedido.estado}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-zinc-800 pt-3">
              <span className="text-zinc-400 font-medium">Total</span>
              <span className="text-white font-semibold text-lg">S/ {pedido.total.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/productos">
            <Button className="bg-violet-600 hover:bg-violet-500">Seguir comprando</Button>
          </Link>
          <Link href="/perfil">
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-900">
              Ver mis pedidos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}