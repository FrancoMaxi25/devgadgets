'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import type { ItemCarrito } from '@/lib/types'
import Link from 'next/link'

export default function CarritoCliente({ itemsIniciales }: { itemsIniciales: ItemCarrito[] }) {
  const [items, setItems] = useState(itemsIniciales)
  const [checkout, setCheckout] = useState(false)
  const [metodoPago, setMetodoPago] = useState<string>('')
  const [procesando, setProcesando] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const total = items.reduce((acc, item) => acc + (item.productos?.precio ?? 0) * item.cantidad, 0)

  const cambiarCantidad = async (item: ItemCarrito, delta: number) => {
    const nuevaCantidad = item.cantidad + delta
    if (nuevaCantidad < 1) { eliminar(item); return }
    await supabase.from('carrito').update({ cantidad: nuevaCantidad }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, cantidad: nuevaCantidad } : i))
  }

  const eliminar = async (item: ItemCarrito) => {
    await supabase.from('carrito').delete().eq('id', item.id)
    setItems(prev => prev.filter(i => i.id !== item.id))
  }

  const realizarPedido = async () => {
    if (!metodoPago) return
    setProcesando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Crear pedido
    const { data: pedido } = await supabase
      .from('pedidos')
      .insert({ usuario_id: user.id, total, metodo_pago: metodoPago, estado: 'pendiente' })
      .select()
      .single()

    if (pedido) {
      // Insertar detalle
      await supabase.from('detalle_pedidos').insert(
        items.map(item => ({
          pedido_id: pedido.id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unit: item.productos?.precio ?? 0,
        }))
      )

      // Vaciar carrito
      await supabase.from('carrito').delete().eq('usuario_id', user.id)
      setItems([])
      setProcesando(false)
      router.push(`/checkout/confirmacion?pedido=${pedido.id}`)
    }
  }

  if (items.length === 0 && !procesando) {
    return (
      <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl">
        <ShoppingBag size={40} className="text-zinc-700 mx-auto mb-4" />
        <p className="text-zinc-500 text-lg mb-2">Tu carrito está vacío</p>
        <Link href="/productos" className="text-violet-400 hover:text-violet-300 text-sm">
          Explorar productos →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-4 items-center">
            <div className="w-20 h-20 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
              {item.productos?.imagen_url
                ? <img src={item.productos.imagen_url} alt={item.productos.nombre} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium line-clamp-1">{item.productos?.nombre}</p>
              <p className="text-zinc-500 text-sm capitalize">{item.productos?.categoria}</p>
              <p className="text-violet-400 font-semibold mt-1">S/ {item.productos?.precio.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => cambiarCantidad(item, -1)}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <Minus size={13} />
              </button>
              <span className="text-white font-medium w-6 text-center">{item.cantidad}</span>
              <button onClick={() => cambiarCantidad(item, 1)}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <Plus size={13} />
              </button>
            </div>
            <button onClick={() => eliminar(item)} className="text-zinc-600 hover:text-red-400 transition-colors ml-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="lg:col-span-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24">
          <h2 className="text-lg font-semibold text-white mb-6">Resumen</h2>

          <div className="space-y-3 mb-6">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-zinc-400 line-clamp-1 flex-1 mr-2">{item.productos?.nombre} x{item.cantidad}</span>
                <span className="text-white flex-shrink-0">S/ {((item.productos?.precio ?? 0) * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800 pt-4 mb-6">
            <div className="flex justify-between">
              <span className="text-zinc-400">Envío</span>
              <span className="text-green-400 text-sm">Gratis</span>
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-white font-semibold">Total</span>
              <span className="text-white font-semibold text-xl">S/ {total.toFixed(2)}</span>
            </div>
          </div>

          {!checkout ? (
            <Button onClick={() => setCheckout(true)}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white">
              Proceder al pago
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm font-medium">Método de pago:</p>
              {['Yape', 'Plin', 'Tarjeta de crédito/débito'].map(m => (
                <button key={m} onClick={() => setMetodoPago(m)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                    metodoPago === m
                      ? 'border-violet-500 bg-violet-950 text-violet-300'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}>
                  {m === 'Yape' && '💜 '}{m === 'Plin' && '💚 '}{m === 'Tarjeta de crédito/débito' && '💳 '}
                  {m}
                </button>
              ))}
              <Button
                onClick={realizarPedido}
                disabled={!metodoPago || procesando}
                className="w-full bg-violet-600 hover:bg-violet-500 mt-2">
                {procesando ? 'Procesando...' : 'Confirmar pedido'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}