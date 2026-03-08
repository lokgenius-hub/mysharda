-- ─────────────────────────────────────────────────────────────────
-- Migration: Fix loyalty coins tables — add RLS policies for admins
-- Run this once in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS admin_manage_coin_config       ON coin_config;
DROP POLICY IF EXISTS admin_manage_coin_profiles     ON coin_profiles;
DROP POLICY IF EXISTS admin_manage_coin_transactions ON coin_transactions;

CREATE POLICY admin_manage_coin_config
  ON coin_config FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY admin_manage_coin_profiles
  ON coin_profiles FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY admin_manage_coin_transactions
  ON coin_transactions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
