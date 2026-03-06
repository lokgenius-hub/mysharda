-- ============================================================
--  SHARDA PALACE — SUPABASE CLOUD SCHEMA
--  Paste this in Supabase SQL editor and run it once.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Admin Users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT,
  password_hash TEXT NOT NULL,          -- "salt:sha256hash"
  role         TEXT NOT NULL DEFAULT 'staff'
               CHECK (role IN ('superadmin','admin','manager','staff','waiter')),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  last_login   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Menu Items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Starters',
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  is_veg      BOOLEAN NOT NULL DEFAULT TRUE,
  tax_rate    NUMERIC(5,2) NOT NULL DEFAULT 5,  -- GST %
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Enquiries ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  enquiry_type   TEXT NOT NULL DEFAULT 'general'
                 CHECK (enquiry_type IN ('hotel','event','restaurant','travel','general')),
  message        TEXT,
  preferred_date DATE,
  guests         INTEGER,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','contacted','confirmed','cancelled')),
  is_read        BOOLEAN NOT NULL DEFAULT FALSE,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Rooms ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  type             TEXT NOT NULL DEFAULT 'Standard',
  capacity         INTEGER NOT NULL DEFAULT 2,
  price_per_night  NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'available'
                   CHECK (status IN ('available','occupied','maintenance','cleaning')),
  amenities        TEXT[],
  image_url        TEXT,
  description      TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Restaurant Tables ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  capacity   INTEGER NOT NULL DEFAULT 4,
  status     TEXT NOT NULL DEFAULT 'available'
             CHECK (status IN ('available','occupied','reserved','cleaning')),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── POS Orders ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pos_orders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  order_type   TEXT NOT NULL DEFAULT 'dine-in'
               CHECK (order_type IN ('dine-in','takeaway','delivery')),
  table_name   TEXT,
  customer_name TEXT,
  subtotal     NUMERIC(10,2) NOT NULL DEFAULT 0,
  cgst         NUMERIC(10,2) NOT NULL DEFAULT 0,
  sgst         NUMERIC(10,2) NOT NULL DEFAULT 0,
  total        NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_mode TEXT NOT NULL DEFAULT 'Cash',
  status       TEXT NOT NULL DEFAULT 'paid'
               CHECK (status IN ('pending','paid','cancelled')),
  item_count   INTEGER NOT NULL DEFAULT 0,
  item_summary TEXT,             -- compact text e.g. "Butter Chicken x2, Naan x4"
  notes        TEXT,
  synced_at    TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── POS Order Items ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pos_order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES pos_orders(id) ON DELETE CASCADE,
  item_id     UUID,
  item_name   TEXT NOT NULL,
  category    TEXT,
  price       NUMERIC(10,2) NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  tax_rate    NUMERIC(5,2) NOT NULL DEFAULT 5,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Testimonials ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  designation  TEXT,
  rating       INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review       TEXT NOT NULL,
  is_approved  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Blog Posts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  excerpt      TEXT,
  content      TEXT,
  cover_image  TEXT,
  category     TEXT DEFAULT 'news',
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Travel Packages ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS travel_packages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration    TEXT,           -- e.g. "3N/4D"
  inclusions  TEXT[],
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Site Images (Gallery) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS site_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url        TEXT NOT NULL,
  alt        TEXT,
  category   TEXT DEFAULT 'general',
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Coin Config (Loyalty) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS coin_config (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spend_per_coin  NUMERIC(10,2) NOT NULL DEFAULT 100,  -- ₹100 = 1 coin
  coin_value      NUMERIC(10,2) NOT NULL DEFAULT 1,    -- 1 coin = ₹1
  min_redeem      INTEGER NOT NULL DEFAULT 10,         -- min coins to redeem
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coin_profiles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone      TEXT UNIQUE NOT NULL,
  name       TEXT,
  balance    INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coin_transactions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES coin_profiles(id),
  type       TEXT NOT NULL CHECK (type IN ('credit','debit')),
  coins      INTEGER NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_enquiries_status    ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created   ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pos_orders_created  ON pos_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pos_order_items     ON pos_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_blog_slug           ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_coin_profiles_phone ON coin_profiles(phone);

-- ─── Row Level Security ─────────────────────────────────────
-- Allow public read on specific tables (for GitHub Pages website)
ALTER TABLE menu_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_packages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images      ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries        ENABLE ROW LEVEL SECURITY;
-- Admin-only tables (service role bypasses RLS automatically)
ALTER TABLE admin_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables   ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_config         ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions   ENABLE ROW LEVEL SECURITY;

-- Public read policies (anon key can read these)
-- DROP before CREATE so this script is safely re-runnable on Supabase (PostgreSQL 15)
DROP POLICY IF EXISTS "public_read_menu"          ON menu_items;
DROP POLICY IF EXISTS "public_read_testimonials"  ON testimonials;
DROP POLICY IF EXISTS "public_read_travel"        ON travel_packages;
DROP POLICY IF EXISTS "public_read_images"        ON site_images;
DROP POLICY IF EXISTS "public_read_blog"          ON blog_posts;
DROP POLICY IF EXISTS "public_read_rooms"         ON rooms;
DROP POLICY IF EXISTS "public_insert_enquiry"     ON enquiries;
DROP POLICY IF EXISTS "public_insert_testimonial" ON testimonials;

CREATE POLICY "public_read_menu"          ON menu_items       FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_testimonials"  ON testimonials     FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "public_read_travel"        ON travel_packages  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_images"        ON site_images      FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_blog"          ON blog_posts       FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_rooms"         ON rooms            FOR SELECT USING (is_active = TRUE);

-- Public can insert enquiries (for GitHub Pages contact form)
CREATE POLICY "public_insert_enquiry"     ON enquiries        FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "public_insert_testimonial" ON testimonials     FOR INSERT WITH CHECK (TRUE);

-- ─── Initial Seed Data ──────────────────────────────────────
-- Default coin config
INSERT INTO coin_config (spend_per_coin, coin_value, min_redeem)
VALUES (100, 1, 10)
ON CONFLICT DO NOTHING;

-- Sample restaurant tables
INSERT INTO restaurant_tables (name, capacity) VALUES
  ('T-1', 2), ('T-2', 2), ('T-3', 4), ('T-4', 4),
  ('T-5', 6), ('T-6', 6), ('T-7', 8), ('T-8', 8),
  ('VIP-1', 4), ('VIP-2', 6),
  ('Banquet-Hall', 200), ('Lawn', 500)
ON CONFLICT DO NOTHING;
