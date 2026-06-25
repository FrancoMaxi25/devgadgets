'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CartCount({ userId }: { userId: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    const fetchCount = async () => {
      const { data } = await supabase
        .from('carrito')
        .select('cantidad')
        .eq('usuario_id', userId)

      const total = data?.reduce((acc, item) => acc + item.cantidad, 0) ?? 0
      setCount(total)
    }

    fetchCount()

    // Suscripción realtime — se actualiza al agregar/quitar del carrito
    const channel = supabase
      .channel('carrito-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'carrito',
        filter: `usuario_id=eq.${userId}`,
      }, fetchCount)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  if (count === 0) return null

  return (
    <span className="absolute -top-0.5 -right-0.5 bg-violet-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  )
}