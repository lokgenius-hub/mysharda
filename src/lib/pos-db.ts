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
  synced: 0 | 1   // 0 = not synced, 1 = synced  (boolean caused Dexie index mismatch)
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
    // Use tenant-specific DB name so different tenants on same browser don't share data
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || 'default'
    super(`POS_${tenantId}`)
    this.version(1).stores({
      orders: '++id,status,synced,created_at',
      menuCache: 'id',
    })
    // Version 2: migrate synced boolean → 0|1 (Dexie .equals(0) doesn't match boolean false)
    this.version(2).stores({
      orders: '++id,status,synced,created_at',
      menuCache: 'id',
    }).upgrade(tx => {
      return tx.table('orders').toCollection().modify(order => {
        if (order.synced === false || order.synced === 0) order.synced = 0
        else if (order.synced === true || order.synced === 1) order.synced = 1
      })
    })
  }
}

// Singleton — shared across all pages that import this module
export const posDb = new PosDB()

/** Force-mark all paid orders as unsynced so the next sync picks them up */
export async function resetSyncFlags() {
  await posDb.orders.where('status').equals('paid').modify({ synced: 0 })
}
