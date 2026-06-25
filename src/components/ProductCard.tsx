'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, Check } from 'lucide-react'
import type { Producto } from '@/lib/types'

const EMOJI_CATEGORIA: Record<string, string> = {
  teclados: '⌨️', mouse: '🖱️', soportes: '💻',
  iluminacion: '💡', accesorios: '🎧',
}

export default function ProductCard({ producto }: { producto: Producto }) {
  const [estado, setEstado] = useState<'idle' | 'agregando' | 'agregado'>('idle')
  const supabase = createClient()

  const agregarAlCarrito = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEstado('agregando')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { data: existente } = await supabase
      .from('carrito')
      .select('id, cantidad')
      .eq('usuario_id', user.id)
      .eq('producto_id', producto.id)
      .single()

    if (existente) {
      await supabase.from('carrito')
        .update({ cantidad: existente.cantidad + 1 })
        .eq('id', existente.id)
    } else {
      await supabase.from('carrito').insert({
        usuario_id: user.id,
        producto_id: producto.id,
        cantidad: 1,
      })
    }

    setEstado('agregado')
    setTimeout(() => setEstado('idle'), 2000)
  }

  return (
    <Link href={`/productos/${producto.id}`} className="group block">
      <div className="bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-200 h-full flex flex-col">

        {/* Imagen */}
        <div className="aspect-square bg-zinc-800 relative overflow-hidden flex-shrink-0">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {EMOJI_CATEGORIA[producto.categoria] ?? '📦'}
            </div>
          )}
          {producto.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-zinc-400 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                Sin stock
              </span>
            </div>
          )}
          {producto.stock > 0 && producto.stock <= 5 && (
            <div className="absolute top-2 left-2">
              <span className="text-xs bg-amber-900/80 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full">
                Últimas {producto.stock} unidades
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-zinc-600 text-xs capitalize mb-1">{producto.categoria}</p>
          <h3 className="text-white text-sm font-medium leading-snug mb-1 line-clamp-2 flex-1">
            {producto.nombre}
          </h3>
          <p className="text-zinc-500 text-xs mb-3 line-clamp-1">{producto.descripcion}</p>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-white font-semibold text-base">
              S/ {producto.precio.toFixed(2)}
            </span>
            <button
              onClick={agregarAlCarrito}
              disabled={estado !== 'idle' || producto.stock === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                estado === 'agregado'
                  ? 'bg-green-600 text-white'
                  : 'bg-violet-600 hover:bg-violet-500 text-white disabled:bg-zinc-700 disabled:cursor-not-allowed'
              }`}
            >
              {estado === 'agregado'
                ? <><Check size={13} /> Agregado</>
                : <><ShoppingCart size={13} /> Agregar</>
              }
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}