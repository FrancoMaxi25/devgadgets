'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Check } from 'lucide-react'
import type { Producto } from '@/lib/types'

export default function AgregarCarritoBtn({ producto }: { producto: Producto }) {
  const [estado, setEstado] = useState<'idle' | 'agregando' | 'agregado'>('idle')
  const router = useRouter()
  const supabase = createClient()

  const agregar = async () => {
    setEstado('agregando')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: existente } = await supabase
      .from('carrito')
      .select('id, cantidad')
      .eq('usuario_id', user.id)
      .eq('producto_id', producto.id)
      .single()

    if (existente) {
      await supabase
        .from('carrito')
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
    <Button
      onClick={agregar}
      disabled={estado !== 'idle' || producto.stock === 0}
      size="lg"
      className={`flex-1 gap-2 transition-all ${
        estado === 'agregado'
          ? 'bg-green-600 hover:bg-green-600'
          : 'bg-violet-600 hover:bg-violet-500'
      }`}
    >
      {estado === 'agregado' ? <Check size={18} /> : <ShoppingCart size={18} />}
      {estado === 'idle' && 'Agregar al carrito'}
      {estado === 'agregando' && 'Agregando...'}
      {estado === 'agregado' && '¡Agregado!'}
    </Button>
  )
}