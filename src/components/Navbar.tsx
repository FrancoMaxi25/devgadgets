import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { ShoppingCart } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import CartCount from './CartCount'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let perfil = null
  if (user) {
    const { data } = await supabase
      .from('perfiles')
      .select('nombre, rol, avatar')
      .eq('id', user.id)
      .single()
    perfil = data
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="text-xl font-semibold text-white tracking-tight">
            Dev<span className="text-violet-400">Gadgets</span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Inicio
            </Link>
            <Link href="/productos" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Productos
            </Link>
            <Link href="/productos?categoria=teclados" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Teclados
            </Link>
            <Link href="/productos?categoria=mouse" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Mouse
            </Link>
            <Link href="/productos?categoria=accesorios" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Accesorios
            </Link>
          </div>

          {/* Derecha */}
          <div className="flex items-center gap-3">
            <Link href="/carrito" className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <ShoppingCart size={20} />
              {user && <CartCount userId={user.id} />}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-zinc-800 transition-colors">
                    {perfil?.avatar ? (
                      <img src={perfil.avatar} alt="avatar" className="w-7 h-7 rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs text-white font-medium">
                        {perfil?.nombre?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200 w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-white truncate">{perfil?.nombre ?? 'Usuario'}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="cursor-pointer hover:bg-zinc-800">Mi perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/carrito" className="cursor-pointer hover:bg-zinc-800">Mi carrito</Link>
                  </DropdownMenuItem>
                  {perfil?.rol === 'admin' && (
                    <>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-violet-400 hover:bg-zinc-800">
                          Panel admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem asChild>
                    <form action={logout}>
                      <button type="submit" className="w-full text-left text-red-400 hover:bg-zinc-800 px-2 py-1.5 text-sm rounded">
                        Cerrar sesión
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white text-sm">
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}