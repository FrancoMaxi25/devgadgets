import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-4">Error 404</p>
        <h1 className="text-5xl font-semibold text-white mb-4">Página no encontrada</h1>
        <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button className="bg-violet-600 hover:bg-violet-500">Ir al inicio</Button>
          </Link>
          <Link href="/productos">
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-900">
              Ver productos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}