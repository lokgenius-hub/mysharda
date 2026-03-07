-- ============================================================
--  SHARDA PALACE — COMPLETE DATABASE SETUP
--  ▶ Run this ONE FILE in Supabase → SQL Editor → Run
--  ▶ This replaces all previous migration files.
--  ▶ Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT)
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Admin Users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT,
  password_hash TEXT NOT NULL,
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
  tax_rate    NUMERIC(5,2) NOT NULL DEFAULT 5,
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
  type             TEXT NOT NULL DEFAULT 'Standard'
                   CHECK (type IN ('Standard','Deluxe','Suite','Banquet','Conference')),
  capacity         INTEGER NOT NULL DEFAULT 2,
  price_per_night  NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'available'
                   CHECK (status IN ('available','occupied','maintenance','cleaning')),
  description      TEXT,
  amenities        TEXT[],
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Room Bookings ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS room_bookings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id     UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  guest_name  TEXT NOT NULL,
  guest_phone TEXT,
  check_in    DATE NOT NULL,
  check_out   DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'confirmed'
              CHECK (status IN ('confirmed','checked_in','checked_out','cancelled')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (check_out > check_in)
);

-- ─── Venue Bookings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS venue_bookings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_name   TEXT NOT NULL,
  event_type   TEXT NOT NULL DEFAULT 'Wedding',
  client_name  TEXT NOT NULL,
  client_phone TEXT,
  event_date   DATE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'confirmed'
               CHECK (status IN ('confirmed','cancelled')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
               CHECK (order_type IN ('dine-in','takeaway','delivery','hotel')),
  table_name   TEXT,
  customer_name TEXT,
  items        JSONB NOT NULL DEFAULT '[]'::jsonb,   -- full items array
  subtotal     NUMERIC(10,2) NOT NULL DEFAULT 0,
  cgst         NUMERIC(10,2) NOT NULL DEFAULT 0,
  sgst         NUMERIC(10,2) NOT NULL DEFAULT 0,
  total        NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_mode TEXT NOT NULL DEFAULT 'Cash',
  status       TEXT NOT NULL DEFAULT 'paid'
               CHECK (status IN ('pending','paid','cancelled')),
  item_count   INTEGER NOT NULL DEFAULT 0,
  item_summary TEXT,
  notes        TEXT,
  synced_at    TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── POS Order Items (detailed breakdown) ───────────────────
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
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  excerpt     TEXT,
  content     TEXT,
  category    TEXT DEFAULT 'General',
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft','published')),
  featured_image TEXT,
  author      TEXT DEFAULT 'Admin',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Travel Packages ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS travel_packages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration    TEXT,
  description TEXT,
  inclusions  TEXT[],
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Site Images ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_key  TEXT UNIQUE,
  url        TEXT NOT NULL,
  alt        TEXT,
  category   TEXT DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Add image_key if table pre-existed without it (safe migration)
ALTER TABLE site_images ADD COLUMN IF NOT EXISTS image_key TEXT;
-- Full (non-partial) unique index is required for ON CONFLICT (image_key) to work
DROP INDEX IF EXISTS site_images_image_key_idx;
CREATE UNIQUE INDEX IF NOT EXISTS site_images_image_key_idx
  ON site_images(image_key);

-- ─── Site Config ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_config (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key  TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL DEFAULT '',
  label       TEXT,
  category    TEXT DEFAULT 'general',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Loyalty / Coins ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coin_config (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spend_per_coin NUMERIC(10,2) NOT NULL DEFAULT 100,
  coin_value    NUMERIC(10,2) NOT NULL DEFAULT 1,
  min_redeem    INTEGER NOT NULL DEFAULT 10,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coin_profiles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone          TEXT UNIQUE NOT NULL,
  name           TEXT,
  coins          INTEGER NOT NULL DEFAULT 0,
  total_earned   INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Add columns if table pre-existed without them
ALTER TABLE coin_profiles ADD COLUMN IF NOT EXISTS total_earned   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE coin_profiles ADD COLUMN IF NOT EXISTS total_redeemed INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS coin_transactions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES coin_profiles(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_site_images_key     ON site_images(image_key);

-- ─── Row Level Security ─────────────────────────────────────
ALTER TABLE menu_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_packages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config         ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms               ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_orders          ENABLE ROW LEVEL SECURITY;
-- Allow hotel order_type on existing DBs (safe to run multiple times)
ALTER TABLE pos_orders DROP CONSTRAINT IF EXISTS pos_orders_order_type_check;
ALTER TABLE pos_orders ADD CONSTRAINT  pos_orders_order_type_check
  CHECK (order_type IN ('dine-in','takeaway','delivery','hotel'));
ALTER TABLE pos_order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables   ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_config         ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions   ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "public_read_menu"          ON menu_items;
DROP POLICY IF EXISTS "public_read_testimonials"  ON testimonials;
DROP POLICY IF EXISTS "public_read_travel"        ON travel_packages;
DROP POLICY IF EXISTS "public_read_images"        ON site_images;
DROP POLICY IF EXISTS "public_read_site_config"   ON site_config;
DROP POLICY IF EXISTS "public_read_blog"          ON blog_posts;
DROP POLICY IF EXISTS "public_read_rooms"         ON rooms;
DROP POLICY IF EXISTS "public_read_venue_bookings" ON venue_bookings;
DROP POLICY IF EXISTS "public_insert_enquiry"     ON enquiries;
DROP POLICY IF EXISTS "public_insert_testimonial" ON testimonials;

CREATE POLICY "public_read_menu"          ON menu_items       FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_testimonials"  ON testimonials     FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "public_read_travel"        ON travel_packages  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_images"        ON site_images      FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_site_config"   ON site_config      FOR SELECT USING (true);
CREATE POLICY "public_read_blog"          ON blog_posts       FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_rooms"         ON rooms            FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public_read_venue_bookings" ON venue_bookings  FOR SELECT USING (status = 'confirmed');
CREATE POLICY "public_insert_enquiry"     ON enquiries        FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "public_insert_testimonial" ON testimonials     FOR INSERT WITH CHECK (TRUE);

-- Authenticated (admin) full access policies
DROP POLICY IF EXISTS "auth_manage_menu"          ON menu_items;
DROP POLICY IF EXISTS "auth_manage_enquiries"     ON enquiries;
DROP POLICY IF EXISTS "auth_manage_rooms"         ON rooms;
DROP POLICY IF EXISTS "auth_manage_room_bookings" ON room_bookings;
DROP POLICY IF EXISTS "auth_manage_venue_bookings" ON venue_bookings;
DROP POLICY IF EXISTS "auth_manage_tables"        ON restaurant_tables;
DROP POLICY IF EXISTS "auth_manage_testimonials"  ON testimonials;
DROP POLICY IF EXISTS "auth_manage_blog"          ON blog_posts;
DROP POLICY IF EXISTS "auth_manage_travel"        ON travel_packages;
DROP POLICY IF EXISTS "auth_manage_images"        ON site_images;
DROP POLICY IF EXISTS "auth_manage_site_config"   ON site_config;
DROP POLICY IF EXISTS "auth_manage_pos_orders"    ON pos_orders;
DROP POLICY IF EXISTS "auth_manage_pos_items"     ON pos_order_items;
DROP POLICY IF EXISTS "auth_manage_coins"         ON coin_config;
DROP POLICY IF EXISTS "auth_manage_coin_profiles" ON coin_profiles;
DROP POLICY IF EXISTS "auth_manage_transactions"  ON coin_transactions;
DROP POLICY IF EXISTS "auth_manage_admin_users"   ON admin_users;

CREATE POLICY "auth_manage_menu"          ON menu_items         FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_enquiries"     ON enquiries          FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_rooms"         ON rooms              FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_room_bookings" ON room_bookings      FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_venue_bookings" ON venue_bookings    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_tables"        ON restaurant_tables  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_testimonials"  ON testimonials       FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_blog"          ON blog_posts         FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_travel"        ON travel_packages    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_images"        ON site_images        FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_site_config"   ON site_config        FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_pos_orders"    ON pos_orders         FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_pos_items"     ON pos_order_items    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_coins"         ON coin_config        FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_coin_profiles" ON coin_profiles      FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_transactions"  ON coin_transactions  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_manage_admin_users"   ON admin_users        FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ─── Seed Data ───────────────────────────────────────────────

-- Default coin config
INSERT INTO coin_config (spend_per_coin, coin_value, min_redeem) VALUES (100, 1, 10) ON CONFLICT DO NOTHING;

-- Restaurant tables
INSERT INTO restaurant_tables (name, capacity) VALUES
  ('T-1', 2),('T-2', 2),('T-3', 4),('T-4', 4),('T-5', 6),('T-6', 6),
  ('T-7', 8),('T-8', 8),('VIP-1', 4),('VIP-2', 6),('Banquet-Hall', 200),('Lawn', 500)
ON CONFLICT DO NOTHING;

-- Hotel rooms (20 rooms)
INSERT INTO rooms (name, type, capacity, price_per_night, status, sort_order) VALUES
  ('Room 101','Standard',2,1200,'available',1), ('Room 102','Standard',2,1200,'available',2),
  ('Room 103','Standard',2,1200,'available',3), ('Room 104','Standard',2,1200,'available',4),
  ('Room 105','Standard',2,1200,'available',5), ('Room 106','Standard',3,1400,'available',6),
  ('Room 201','Deluxe',2,1800,'available',7),   ('Room 202','Deluxe',2,1800,'available',8),
  ('Room 203','Deluxe',3,2000,'available',9),   ('Room 204','Deluxe',3,2000,'available',10),
  ('Room 205','Deluxe',2,1800,'available',11),  ('Room 206','Deluxe',4,2200,'available',12),
  ('Room 301','Suite',2,3500,'available',13),   ('Room 302','Suite',3,3800,'available',14),
  ('Room 303','Suite',4,4200,'available',15),   ('Room 304','Suite',2,3500,'available',16),
  ('Room 401','Suite',4,5000,'available',17),   ('Room 402','Suite',4,5500,'available',18),
  ('Bridal Suite','Suite',4,8000,'available',19),('Presidential Suite','Suite',6,12000,'available',20)
ON CONFLICT DO NOTHING;

-- Site config
INSERT INTO site_config (config_key, config_value, label, category) VALUES
  ('hotel_name',        'Sharda Palace',                                 'Hotel Name',        'general'),
  ('tagline',           'Where Tradition Meets Luxury',                  'Tagline',           'general'),
  ('description',       'Luxury hotel, restaurant and banquet hall in Bijnor, Uttar Pradesh, serving guests from Bhabua, Kaimur, Chainpur & Sasaram.', 'Description', 'general'),
  ('phone',             '+91 73035 84266',                               'Phone Number',      'contact'),
  ('email',             'info@shardapalace.in',                          'Email',             'contact'),
  ('whatsapp',          '917303584266',                                  'WhatsApp Number',   'contact'),
  ('address',           'Bhabua Road, Bijnor, Uttar Pradesh 246701',     'Address',           'contact'),
  ('gst_number',        '09XXXXXXXXXXXXX',                               'GST Number',        'contact'),
  ('facebook_url',      'https://facebook.com',                          'Facebook URL',      'social'),
  ('instagram_url',     'https://instagram.com',                         'Instagram URL',     'social'),
  ('youtube_url',       'https://youtube.com',                           'YouTube URL',       'social'),
  ('google_maps_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55903.63498498846!2d78.09775995!3d29.37220735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390b90495be88267%3A0xdf467da08c1578eb!2sBijnor%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1703500000000!5m2!1sen!2sin', 'Google Maps Embed URL', 'maps'),
  ('google_maps_link',  'https://maps.google.com/?q=Sharda+Palace+Bijnor', 'Google Maps Link', 'maps'),
  ('restaurant_hours',  '7:00 AM – 11:00 PM',                           'Restaurant Hours',  'timings'),
  ('reception_hours',   '24 × 7',                                       'Reception Hours',   'timings'),
  ('checkin_time',      '12:00 Noon',                                    'Check-in Time',     'timings'),
  ('checkout_time',     '11:00 AM',                                      'Check-out Time',    'timings')
ON CONFLICT (config_key) DO NOTHING;

-- Named image slots (admin replaces URLs via Images page)
INSERT INTO site_images (image_key, url, alt, category, sort_order, is_active) VALUES
  ('heroHome',           'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&q=80','Hotel hero','hero',1,true),
  ('heroHotel',          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=80','Hotel rooms hero','hero',2,true),
  ('heroRestaurant',     'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80','Restaurant hero','hero',3,true),
  ('heroEvents',         'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80','Events hero','hero',4,true),
  ('heroTravel',         'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80','Travel hero','hero',5,true),
  ('heroGallery',        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80','Gallery hero','hero',6,true),
  ('heroMenu',           'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80','Menu hero','hero',7,true),
  ('heroBlog',           'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1920&q=80','Blog hero','hero',8,true),
  ('roomStandard',       'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80','Standard room','rooms',1,true),
  ('roomDeluxe',         'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80','Deluxe room','rooms',2,true),
  ('roomSuite',          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80','Suite room','rooms',3,true),
  ('serviceHotel',       'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800&q=80','Hotel service','home',1,true),
  ('serviceRestaurant',  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80','Restaurant service','home',2,true),
  ('serviceEvents',      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80','Events service','home',3,true),
  ('aboutImage',         'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80','About hotel','home',4,true),
  ('ctaBanner',          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1920&q=80','CTA banner','home',5,true),
  ('cuisineNorthIndian', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80','North Indian cuisine','food',1,true),
  ('cuisineVeg',         'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80','Veg cuisine','food',2,true),
  ('cuisineSweets',      'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&q=80','Indian sweets','food',3,true),
  ('restaurantInterior', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80','Restaurant interior','food',4,true),
  ('eventWedding',       'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80','Wedding event','events',1,true),
  ('eventBirthday',      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80','Birthday event','events',2,true),
  ('eventCorporate',     'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80','Corporate event','events',3,true),
  ('eventSeminar',       'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80','Seminar event','events',4,true),
  ('eventReligious',     'https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?w=800&q=80','Religious event','events',5,true),
  ('eventFamily',        'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&q=80','Family gathering','events',6,true),
  ('travelVrindavan',    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80','Vrindavan travel','travel',1,true),
  ('travelMathura',      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80','Mathura travel','travel',2,true),
  ('travelAgra',         'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80','Agra travel','travel',3,true),
  ('gallery1',           'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80','Gallery 1','gallery',1,true),
  ('gallery2',           'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80','Gallery 2','gallery',2,true),
  ('gallery3',           'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80','Gallery 3','gallery',3,true),
  ('gallery4',           'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80','Gallery 4','gallery',4,true),
  ('gallery5',           'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80','Gallery 5','gallery',5,true),
  ('gallery6',           'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80','Gallery 6','gallery',6,true),
  ('gallery7',           'https://images.unsplash.com/photo-1482275548304-a58859dc31b7?w=800&q=80','Gallery 7','gallery',7,true),
  ('gallery8',           'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80','Gallery 8','gallery',8,true),
  ('gallery9',           'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800&q=80','Gallery 9','gallery',9,true),
  ('gallery10',          'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80','Gallery 10','gallery',10,true),
  ('gallery11',          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80','Gallery 11','gallery',11,true),
  ('gallery12',          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80','Gallery 12','gallery',12,true)
ON CONFLICT (image_key) DO NOTHING;

-- ─── Done! ───────────────────────────────────────────────────
-- Next step: Go to Supabase → Authentication → Users → Add User
--   Email: admin@shardapalace.in
--   Password: (set your password)
-- Then open the admin panel and you're ready!
SELECT 'Setup complete! All tables created.' AS status;
