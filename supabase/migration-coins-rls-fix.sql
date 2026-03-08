-- ─────────────────────────────────────────────────────────────────
-- Migration: Fix loyalty coins tables — add RLS policies for admins
-- Run this once in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- Allow authenticated (logged-in admin) users to fully manage coin tables
DROP POLICY IF EXISTS "admin_manage_coin_config"       ON coin_config;
DROP POLICY IF EXISTS "admin_manage_coin_profiles"     ON coin_profiles;
DROP POLICY IF EXISTS "admin_manage_coin_transactions" ON coin_transactions;

CREATE POLICY "admin_manage_coin_config"
  ON coin_config FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "admin_manage_coin_profiles"
  ON coin_profiles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_manage_coin_transactions"
  ON coin_transactions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
