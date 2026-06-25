import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AgregarCarritoBtn from '@/components/AgregarCarritoBtn'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }> // ← Promise en Next.js 15
}) {
  // Desestructuramos el id después de resolver la promesa params
  const { id } = await params 
  const supabase = await createClient()

  const { data: producto } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single()

  if (!producto) notFound()

  // Productos relacionados (misma categoría)
  const { data: relacionados } = await supabase
    .from('productos')
    .select('*')
    .eq('categoria', producto.categoria)
    .eq('activo', true)
    .neq('id', producto.id)
    .limit(4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-600 mb-10">
        <Link href="/" className="hover:text-zinc-400">Inicio</Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-zinc-400">Productos</Link>
        <span>/</span>
        <Link href={`/productos?categoria=${producto.categoria}`} className="hover:text-zinc-400 capitalize">
          {producto.categoria}
        </Link>
        <span>/</span>
        <span className="text-zinc-400 line-clamp-1">{producto.nombre}</span>
      </div>

      {/* Producto principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

        {/* Imagen */}
        <div className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <Badge variant="outline" className="w-fit text-zinc-500 border-zinc-700 mb-4 capitalize">
            {producto.categoria}
          </Badge>

          <h1 className="text-3xl font-semibold text-white mb-4">{producto.nombre}</h1>

          <p className="text-zinc-400 leading-relaxed mb-6">{producto.descripcion}</p>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-semibold text-white">S/ {producto.precio.toFixed(2)}</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`w-2 h-2 rounded-full ${producto.stock > 0 ? 'bg-green-400' : 'bg-red-500'}`} />
            <span className="text-sm text-zinc-400">
              {producto.stock > 0 ? `${producto.stock} unidades disponibles` : 'Sin stock'}
            </span>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <AgregarCarritoBtn producto={producto} />
          </div>

          {/* Features */}
          <div className="mt-10 pt-8 border-t border-zinc-800 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: '🚚', label: 'Envío gratis', sub: 'En pedidos +S/200' },
              { icon: '🔒', label: 'Pago seguro', sub: 'Yape, Plin, tarjeta' },
              { icon: '↩️', label: 'Devolución', sub: '30 días garantía' },
            ].map(f => (
              <div key={f.label}>
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-white text-xs font-medium">{f.label}</p>
                <p className="text-zinc-600 text-xs">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Relacionados */}
      {relacionados && relacionados.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">También te puede interesar</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {relacionados.map(p => (
              <Link key={p.id} href={`/productos/${p.id}`}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-colors group">
                <div className="aspect-square bg-zinc-800 overflow-hidden">
                  {p.imagen_url
                    ? <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                  }
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium line-clamp-1">{p.nombre}</p>
                  <p className="text-zinc-400 text-sm mt-1">S/ {p.precio.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}