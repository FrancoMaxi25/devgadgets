export type Rol = 'cliente' | 'admin'
export type EstadoPedido = 'pendiente' | 'pagado' | 'enviado' | 'entregado'
export type Categoria = 'teclados' | 'mouse' | 'soportes' | 'iluminacion' | 'accesorios'

export interface Perfil {
  id: string
  nombre: string | null
  avatar: string | null
  rol: Rol
  creado_en: string
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  imagen_url: string | null
  stock: number
  categoria: Categoria
  activo: boolean
  creado_en: string
}

export interface ItemCarrito {
  id: string
  usuario_id: string
  producto_id: string
  cantidad: number
  productos?: Producto   // join al hacer SELECT
}

export interface Pedido {
  id: string
  usuario_id: string
  total: number
  estado: EstadoPedido
  metodo_pago: string | null
  creado_en: string
}

export interface DetallePedido {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unit: number
  productos?: Producto
}

export interface ItemWishlist {
  usuario_id: string
  producto_id: string
  productos?: Producto
}