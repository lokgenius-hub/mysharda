import Dexie, { type Table } from 'dexie'

export interface IOrderItem {
  item_id: string
  item_name: string
  price: number
  quantity: number
  tax_rate: number
  category: string
}

export interface ILocalOrder {
  id?: number
  order_number: string
  order_type: 'dine-in' | 'takeaway' | 'delivery'
  table_name?: string
  items: IOrderItem[]
  subtotal: number
  cgst: number
  sgst: number
  total: number
  payment_mode: string
  status: 'pending' | 'paid' | 'cancelled'
  created_at: string
  synced: boolean
}

export interface IMenuItem {
  id: string
  name: string
  price: number
  category: string
  is_veg: boolean
  tax_rate: number
  is_active: boolean
}

class PosDB extends Dexie {
  orders!: Table<ILocalOrder>
  menuCache!: Table<IMenuItem>
  constructor() {
    super('ShardaPOS')
    this.version(1).stores({
      orders: '++id,status,synced,created_at',
      menuCache: 'id',
    })
  }
}

// Singleton — shared across all pages that import this module
export const posDb = new PosDB()
