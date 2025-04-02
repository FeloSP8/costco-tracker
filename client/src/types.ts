export interface Product {
  id: number;
  nombre: string;
  nombre_busqueda?: string;
  codigo?: string;
  imagen?: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceHistoryPoint {
  id: number;
  producto_id: number;
  supermercado_id: number;
  precio: number;
  fecha: string;
  createdAt: string;
  updatedAt: string;
  supermercado?: {
    id: number;
    nombre: string;
    logo?: string;
  };
}

export interface Supermarket {
  id: number;
  nombre: string;
  url?: string;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductSupermarket {
  id: number;
  producto_id: number;
  supermercado_id: number;
  precio?: number;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
  supermercado?: Supermarket;
  producto?: Product;
}

export interface Ticket {
  id: number;
  fecha: string;
  total: number;
  imagen?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  productos?: TicketProduct[];
}

export interface TicketProduct {
  id: number;
  ticket_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  createdAt: string;
  updatedAt: string;
  producto?: Product;
}