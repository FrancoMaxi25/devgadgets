import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import type { Producto } from '@/lib/types'
import { Search } from 'lucide-react'

const CATEGORIAS = [
  { slug: 'todos',       label: 'Todos' },
  { slug: 'teclados',    label: 'Teclados' },
  { slug: 'mouse',       label: 'Mouse' },
  { slug: 'soportes',    label: 'Soportes' },
  { slug: 'iluminacion', label: 'Iluminación' },
  { slug: 'accesorios',  label: 'Accesorios' },
]

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>
}) {
  const params = await searchParams
  const categoriaActiva = params.categoria ?? 'todos'
  const busqueda = params.q ?? ''

  const supabase = await createClient()

  let query = supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('creado_en', { ascending: false })

  if (categoriaActiva !== 'todos') {
    query = query.eq('categoria', categoriaActiva)
  }

  if (busqueda) {
    query = query.ilike('nombre', `%${busqueda}%`)
  }

  const { data: productos } = await query

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-white mb-2">
          {categoriaActiva === 'todos' ? 'Todos los productos' : categoriaActiva.charAt(0).toUpperCase() + categoriaActiva.slice(1)}
        </h1>
        <p className="text-zinc-500 text-sm">
          {productos?.length ?? 0} productos disponibles
        </p>
      </div>

      {/* Barra de búsqueda + filtros en la misma fila */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">

        {/* Buscador */}
        <form method="GET" action="/productos" className="flex-1 max-w-sm">
          {categoriaActiva !== 'todos' && (
            <input type="hidden" name="categoria" value={categoriaActiva} />
          )}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              name="q"
              defaultValue={busqueda}
              placeholder="Buscar productos..."
              className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </form>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map(cat => (
            <a
              key={cat.slug}
              href={`/productos?categoria=${cat.slug}${busqueda ? `&q=${busqueda}` : ''}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                categoriaActiva === cat.slug
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {cat.label}
            </a>
          ))}
        </div>
      </div>

      {/* Grid de productos */}
      {productos && productos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {productos.map((producto: Producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 text-lg mb-2">
            {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay productos en esta categoría'}
          </p>
          <a href="/productos" className="text-violet-400 text-sm hover:text-violet-300 transition-colors">
            Ver todos los productos →
          </a>
        </div>
      )}
    </div>
  )
}