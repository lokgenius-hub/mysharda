-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION: Add items JSONB column to pos_orders
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────
-- The POS Terminal stores order items as a JSON array directly on the order row.
-- This migration adds that column so the sync from browser to Supabase works.

ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Confirm it worked
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pos_orders'
ORDER BY ordinal_position;
