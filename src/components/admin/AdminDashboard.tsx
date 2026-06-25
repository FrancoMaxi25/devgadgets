'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Producto, Pedido, Perfil } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Package, ShoppingBag, Users, Plus, Pencil, Trash2, X } from 'lucide-react'

type Tab = 'productos' | 'pedidos' | 'usuarios'

const CATEGORIAS = ['teclados', 'mouse', 'soportes', 'iluminacion', 'accesorios']

const productoVacio = {
  nombre: '', descripcion: '', precio: 0,
  imagen_url: '', stock: 0, categoria: 'teclados', activo: true,
}

export default function AdminDashboard({
  productos: inicial, pedidos, usuarios,
}: {
  productos: Producto[], pedidos: any[], usuarios: Perfil[]
}) {
  const [tab, setTab] = useState<Tab>('productos')
  const [productos, setProductos] = useState(inicial)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [form, setForm] = useState(productoVacio)
  const [guardando, setGuardando] = useState(false)

  const supabase = createClient()

  const abrirCrear = () => { setEditando(null); setForm(productoVacio); setModal(true) }
const abrirEditar = (p: Producto) => {
  setEditando(p);

  setForm({
    nombre: p.nombre,
    descripcion: p.descripcion ?? '',
    precio: p.precio,
    imagen_url: p.imagen_url ?? '',
    stock: p.stock,
    categoria: p.categoria as any,
    activo: p.activo,
  });

  setModal(true);
}
  const guardar = async () => {
    setGuardando(true)
    if (editando) {
      const { data } = await supabase.from('productos').update(form).eq('id', editando.id).select().single()
      if (data) setProductos(prev => prev.map(p => p.id === data.id ? data : p))
    } else {
      const { data } = await supabase.from('productos').insert(form).select().single()
      if (data) setProductos(prev => [data, ...prev])
    }
    setModal(false)
    setGuardando(false)
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('productos').delete().eq('id', id)
    setProductos(prev => prev.filter(p => p.id !== id))
  }

  const tabs = [
    { id: 'productos', label: 'Productos', icon: Package, count: productos.length },
    { id: 'pedidos',   label: 'Pedidos',   icon: ShoppingBag, count: pedidos.length },
    { id: 'usuarios',  label: 'Usuarios',  icon: Users, count: usuarios.length },
  ] as const

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Panel Admin</h1>
            <p className="text-zinc-500 text-sm mt-1">DevGadgets Store</p>
          </div>
          {tab === 'productos' && (
            <Button onClick={abrirCrear} className="bg-violet-600 hover:bg-violet-500 gap-2">
              <Plus size={16} /> Nuevo producto
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Productos', value: productos.length, color: 'text-violet-400' },
            { label: 'Pedidos', value: pedidos.length, color: 'text-green-400' },
            { label: 'Usuarios', value: usuarios.length, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-sm">{s.label}</p>
              <p className={`text-3xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-6 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                tab === t.id ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <t.icon size={15} />
              {t.label}
              <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded-full">{t.count}</span>
            </button>
          ))}
        </div>

        {/* Tabla productos */}
        {tab === 'productos' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Producto</th>
                  <th className="text-left px-5 py-3">Categoría</th>
                  <th className="text-left px-5 py-3">Precio</th>
                  <th className="text-left px-5 py-3">Stock</th>
                  <th className="text-left px-5 py-3">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.imagen_url && (
                          <img src={p.imagen_url} alt={p.nombre} className="w-9 h-9 rounded-lg object-cover bg-zinc-700" />
                        )}
                        <span className="font-medium text-white line-clamp-1">{p.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-zinc-400">{p.categoria}</td>
                    <td className="px-5 py-3 text-white font-medium">S/ {p.precio.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={p.stock > 0 ? 'text-green-400' : 'text-red-400'}>{p.stock}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={p.activo ? 'bg-green-900/50 text-green-400 border-green-800' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => abrirEditar(p)} className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => eliminar(p.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabla pedidos */}
        {tab === 'pedidos' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {pedidos.length === 0 ? (
              <div className="text-center py-16 text-zinc-600">Aún no hay pedidos</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">ID</th>
                    <th className="text-left px-5 py-3">Usuario</th>
                    <th className="text-left px-5 py-3">Total</th>
                    <th className="text-left px-5 py-3">Estado</th>
                    <th className="text-left px-5 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map(p => (
                    <tr key={p.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="px-5 py-3 font-mono text-zinc-500 text-xs">{p.id.slice(0, 8)}...</td>
                      <td className="px-5 py-3 text-zinc-300">{p.usuario?.nombre ?? '—'}</td>
                      <td className="px-5 py-3 text-white font-medium">S/ {p.total.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">{p.estado}</Badge>
                      </td>
                      <td className="px-5 py-3 text-zinc-500">{new Date(p.creado_en).toLocaleDateString('es-PE')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tabla usuarios */}
        {tab === 'usuarios' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Usuario</th>
                  <th className="text-left px-5 py-3">Rol</th>
                  <th className="text-left px-5 py-3">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img src={u.avatar} className="w-7 h-7 rounded-full" alt="" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-violet-800 flex items-center justify-center text-xs font-medium">
                            {u.nombre?.[0]?.toUpperCase() ?? '?'}
                          </div>
                        )}
                        <span className="text-white">{u.nombre ?? 'Sin nombre'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={u.rol === 'admin' ? 'bg-violet-900/50 text-violet-400 border-violet-800' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}>
                        {u.rol}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-zinc-500">{new Date(u.creado_en).toLocaleDateString('es-PE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar producto */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{editando ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={() => setModal(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-zinc-400 text-sm">Nombre</Label>
                <Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-sm">Descripción</Label>
                <textarea value={form.descripcion ?? ''} onChange={e => setForm({...form, descripcion: e.target.value})}
                  rows={2} className="w-full mt-1 bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-violet-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400 text-sm">Precio (S/)</Label>
                  <Input type="number" value={form.precio} onChange={e => setForm({...form, precio: parseFloat(e.target.value)})}
                    className="bg-zinc-800 border-zinc-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">Stock</Label>
                  <Input type="number" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value)})}
                    className="bg-zinc-800 border-zinc-700 text-white mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-zinc-400 text-sm">Categoría</Label>
                <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value as any})}
                  className="w-full mt-1 bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-violet-500">
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-zinc-400 text-sm">URL de imagen</Label>
                <Input value={form.imagen_url ?? ''} onChange={e => setForm({...form, imagen_url: e.target.value})}
                  placeholder="https://images.unsplash.com/..." className="bg-zinc-800 border-zinc-700 text-white mt-1" />
                {form.imagen_url && (
                  <img src={form.imagen_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg bg-zinc-800" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="activo" checked={form.activo} onChange={e => setForm({...form, activo: e.target.checked})}
                  className="accent-violet-500" />
                <Label htmlFor="activo" className="text-zinc-400 text-sm cursor-pointer">Producto activo</Label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => setModal(false)} variant="outline" className="flex-1 border-zinc-700 text-zinc-400">
                Cancelar
              </Button>
              <Button onClick={guardar} disabled={guardando} className="flex-1 bg-violet-600 hover:bg-violet-500">
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}