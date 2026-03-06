-- ============================================================
--  Migration: POS Summary-Only Sync
--  Run this if you already have the schema deployed.
--  Adds item_count and item_summary columns to pos_orders.
--  pos_order_items table is kept for backward compatibility
--  but won't receive new data from the sync endpoint.
-- ============================================================

-- Add summary columns to pos_orders
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS item_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS item_summary TEXT;
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;

-- Backfill existing orders with item counts from pos_order_items
UPDATE pos_orders SET
  item_count = (SELECT COUNT(*) FROM pos_order_items WHERE order_id = pos_orders.id),
  item_summary = (
    SELECT string_agg(
      item_name || CASE WHEN quantity > 1 THEN ' x' || quantity ELSE '' END,
      ', '
    )
    FROM pos_order_items WHERE order_id = pos_orders.id
  )
WHERE item_count = 0;
