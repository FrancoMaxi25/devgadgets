import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/ProductCard'
import type { Producto } from '@/lib/types'

const CATEGORIAS = [
  { slug: 'teclados',    label: 'Teclados',    emoji: '⌨️', desc: 'Mecánicos y de membrana' },
  { slug: 'mouse',       label: 'Mouse',       emoji: '🖱️', desc: 'Ergonómicos y gaming' },
  { slug: 'soportes',    label: 'Soportes',    emoji: '💻', desc: 'Para laptop y monitor' },
  { slug: 'iluminacion', label: 'Iluminación',  emoji: '💡', desc: 'LED y ambient light' },
  { slug: 'accesorios',  label: 'Accesorios',   emoji: '🎧', desc: 'Todo para tu setup' },
]

export default async function Home() {
  const supabase = await createClient()

  const { data: destacados, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('creado_en', { ascending: false })
    .limit(8)

  console.log('Productos:', destacados?.length, 'Error:', error?.message)

  return (
    <div>
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-black pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-violet-400 text-sm font-medium tracking-widest uppercase mb-6 border border-violet-800 px-4 py-1.5 rounded-full">
            Para desarrolladores
          </span>
          <h1 className="text-5xl md:text-7xl font-semibold text-white leading-tight mb-6">
            Potenciando tu{' '}
            <span className="text-violet-400">productividad</span>,<br />
            un gadget a la vez
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Seleccionamos los mejores gadgets para que tu setup no sea solo bonito — sea eficiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/productos">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-500 text-white px-8">
                Explorar productos
              </Button>
            </Link>
            <Link href="/productos?categoria=teclados">
              <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-900 px-8">
                Ver teclados
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-semibold text-white mb-2">Categorías</h2>
        <p className="text-zinc-500 mb-10">Encuentra lo que tu setup necesita</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIAS.map((cat) => (
            <Link key={cat.slug} href={`/productos?categoria=${cat.slug}`}>
              <div className="group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-violet-800 rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer">
                <span className="text-3xl mb-3 block">{cat.emoji}</span>
                <p className="text-white font-medium text-sm">{cat.label}</p>
                <p className="text-zinc-600 text-xs mt-1">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-semibold text-white mb-2">Destacados</h2>
            <p className="text-zinc-500">Los más recientes en la tienda</p>
          </div>
          <Link href="/productos">
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-900">
              Ver todos →
            </Button>
          </Link>
        </div>

        {destacados && destacados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destacados.map((producto: Producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-600">Aún no hay productos.</p>
            <Link href="/admin" className="text-violet-400 text-sm mt-2 inline-block hover:text-violet-300">
              Agregar desde el panel admin →
            </Link>
          </div>
        )}
      </section>

      {/* Banner para programadores */}
      <section className="border-y border-zinc-800 bg-zinc-950 py-20 px-4 text-center">
        <p className="text-zinc-500 text-sm uppercase tracking-widest mb-4">Para los que viven en la terminal</p>
        <h2 className="text-3xl md:text-4xl font-semibold text-white max-w-2xl mx-auto leading-snug">
          Pasas más de 8 horas frente a la computadora.
          <span className="text-violet-400"> Nosotros nos encargamos del resto.</span>
        </h2>
      </section>
    </div>
  )
}