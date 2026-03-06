-- ============================================================
--  SHARDA PALACE — MIGRATION: Admin via Supabase Auth + Bookings
--  Run this AFTER schema.sql and seed.sql in the SQL Editor.
--
--  What this does:
--  1. Creates room_bookings table for availability tracking
--  2. Adds RLS policies so Supabase Auth users (admin) can CRUD all tables
--  3. Seeds 20 hotel rooms (replaces old 8)
--  4. Seeds site_images so admin can swap them for real photos
--  5. Adds sort_order to rooms
--
--  AFTER running this, create an admin user in Supabase Auth:
--    Dashboard → Authentication → Users → Add User
--    Email: admin@shardapalace.in  /  Password: <your choice>
-- ============================================================

-- ─── 1. Room Bookings Table ─────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_bookings_room    ON room_bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_checkin ON room_bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_status  ON room_bookings(status);

-- ─── 2. Venue Bookings (Banquet / Lawn for events) ──────────
CREATE TABLE IF NOT EXISTS venue_bookings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_name  TEXT NOT NULL,              -- 'Banquet-Hall', 'Lawn', etc.
  event_type  TEXT NOT NULL DEFAULT 'wedding',
  client_name TEXT NOT NULL,
  client_phone TEXT,
  event_date  DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'confirmed'
              CHECK (status IN ('confirmed','completed','cancelled')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_bookings_date ON venue_bookings(event_date);

-- ─── 3. Add sort_order to rooms if it doesn't exist ─────────
DO $$ BEGIN
  ALTER TABLE rooms ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ─── 4. RLS for room_bookings & venue_bookings ─────────────
ALTER TABLE room_bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_bookings  ENABLE ROW LEVEL SECURITY;

-- Public can READ bookings (for availability calendar on website)
DROP POLICY IF EXISTS "public_read_bookings"       ON room_bookings;
DROP POLICY IF EXISTS "public_read_venue_bookings" ON venue_bookings;
CREATE POLICY "public_read_bookings"       ON room_bookings  FOR SELECT USING (status IN ('confirmed','checked_in'));
CREATE POLICY "public_read_venue_bookings" ON venue_bookings FOR SELECT USING (status IN ('confirmed'));

-- ─── 5. Auth-user (admin) policies for ALL tables ───────────
-- These allow any Supabase Auth user to do full CRUD.
-- Since only admin staff will have Auth accounts, this is safe.

-- Helper: For each table, add SELECT/INSERT/UPDATE/DELETE for auth users.

-- rooms
DROP POLICY IF EXISTS "auth_manage_rooms" ON rooms;
CREATE POLICY "auth_manage_rooms" ON rooms FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- menu_items
DROP POLICY IF EXISTS "auth_manage_menu" ON menu_items;
CREATE POLICY "auth_manage_menu" ON menu_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- enquiries
DROP POLICY IF EXISTS "auth_manage_enquiries" ON enquiries;
CREATE POLICY "auth_manage_enquiries" ON enquiries FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- room_bookings
DROP POLICY IF EXISTS "auth_manage_bookings" ON room_bookings;
CREATE POLICY "auth_manage_bookings" ON room_bookings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- venue_bookings
DROP POLICY IF EXISTS "auth_manage_venue_bookings" ON venue_bookings;
CREATE POLICY "auth_manage_venue_bookings" ON venue_bookings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- restaurant_tables
DROP POLICY IF EXISTS "auth_manage_tables" ON restaurant_tables;
CREATE POLICY "auth_manage_tables" ON restaurant_tables FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- testimonials
DROP POLICY IF EXISTS "auth_manage_testimonials" ON testimonials;
CREATE POLICY "auth_manage_testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- blog_posts
DROP POLICY IF EXISTS "auth_manage_blog" ON blog_posts;
CREATE POLICY "auth_manage_blog" ON blog_posts FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- travel_packages
DROP POLICY IF EXISTS "auth_manage_travel" ON travel_packages;
CREATE POLICY "auth_manage_travel" ON travel_packages FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- site_images
DROP POLICY IF EXISTS "auth_manage_images" ON site_images;
CREATE POLICY "auth_manage_images" ON site_images FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- admin_users (self-manage)
DROP POLICY IF EXISTS "auth_manage_admin_users" ON admin_users;
CREATE POLICY "auth_manage_admin_users" ON admin_users FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- coin tables
DROP POLICY IF EXISTS "auth_manage_coin_config" ON coin_config;
CREATE POLICY "auth_manage_coin_config" ON coin_config FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "auth_manage_coin_profiles" ON coin_profiles;
CREATE POLICY "auth_manage_coin_profiles" ON coin_profiles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "auth_manage_coin_txn" ON coin_transactions;
CREATE POLICY "auth_manage_coin_txn" ON coin_transactions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- pos tables
DROP POLICY IF EXISTS "auth_manage_pos_orders" ON pos_orders;
CREATE POLICY "auth_manage_pos_orders" ON pos_orders FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "auth_manage_pos_items" ON pos_order_items;
CREATE POLICY "auth_manage_pos_items" ON pos_order_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- ─── 6. Seed 20 Rooms (delete old seed, insert fresh) ──────
DELETE FROM rooms WHERE name IN ('Room 101','Room 102','Room 103','Room 201','Room 202','Room 203','Suite 301','Suite 302');

INSERT INTO rooms (name, type, capacity, price_per_night, status, amenities, image_url, sort_order) VALUES
  -- Standard Rooms (8)
  ('Room 101', 'Standard', 2, 1800, 'available',   ARRAY['AC','Wi-Fi','TV','Geyser'],              NULL, 1),
  ('Room 102', 'Standard', 2, 1800, 'occupied',    ARRAY['AC','Wi-Fi','TV','Geyser'],              NULL, 2),
  ('Room 103', 'Standard', 2, 1800, 'available',   ARRAY['AC','Wi-Fi','TV','Geyser'],              NULL, 3),
  ('Room 104', 'Standard', 2, 1800, 'maintenance', ARRAY['AC','Wi-Fi','TV','Geyser'],              NULL, 4),
  ('Room 105', 'Standard', 3, 2200, 'available',   ARRAY['AC','Wi-Fi','TV','Geyser','Extra Bed'],  NULL, 5),
  ('Room 106', 'Standard', 3, 2200, 'available',   ARRAY['AC','Wi-Fi','TV','Geyser','Extra Bed'],  NULL, 6),
  ('Room 107', 'Standard', 2, 1800, 'cleaning',    ARRAY['AC','Wi-Fi','TV','Geyser'],              NULL, 7),
  ('Room 108', 'Standard', 2, 1800, 'available',   ARRAY['AC','Wi-Fi','TV','Geyser'],              NULL, 8),
  -- Deluxe Rooms (7)
  ('Room 201', 'Deluxe', 2, 3000, 'available',   ARRAY['AC','Wi-Fi','TV','Geyser','Mini Fridge','Room Service'], NULL, 9),
  ('Room 202', 'Deluxe', 2, 3000, 'occupied',    ARRAY['AC','Wi-Fi','TV','Geyser','Mini Fridge','Room Service'], NULL, 10),
  ('Room 203', 'Deluxe', 2, 3000, 'available',   ARRAY['AC','Wi-Fi','TV','Geyser','Mini Fridge','Room Service'], NULL, 11),
  ('Room 204', 'Deluxe', 3, 3500, 'available',   ARRAY['AC','Wi-Fi','TV','Geyser','Mini Fridge','Room Service','Balcony'], NULL, 12),
  ('Room 205', 'Deluxe', 3, 3500, 'occupied',    ARRAY['AC','Wi-Fi','TV','Geyser','Mini Fridge','Room Service','Balcony'], NULL, 13),
  ('Room 206', 'Deluxe', 2, 3000, 'available',   ARRAY['AC','Wi-Fi','TV','Geyser','Mini Fridge','Room Service'], NULL, 14),
  ('Room 207', 'Deluxe', 2, 3000, 'cleaning',    ARRAY['AC','Wi-Fi','TV','Geyser','Mini Fridge','Room Service'], NULL, 15),
  -- Suites (3)
  ('Suite 301', 'Suite', 4, 5500, 'available',  ARRAY['AC','Wi-Fi','TV','Geyser','Mini Fridge','Room Service','Balcony','Living Room','Bathtub'], NULL, 16),
  ('Suite 302', 'Suite', 4, 5500, 'occupied',   ARRAY['AC','Wi-Fi','TV','Geyser','Mini Fridge','Room Service','Balcony','Living Room','Bathtub'], NULL, 17),
  ('Royal Suite', 'Suite', 6, 8500, 'available', ARRAY['AC','Wi-Fi','TV','Geyser','Mini Fridge','Room Service','Balcony','Living Room','Bathtub','Jacuzzi','Butler Service'], NULL, 18),
  -- Conference (1)
  ('Conference Hall', 'Conference', 50, 15000, 'available', ARRAY['AC','Wi-Fi','Projector','Sound System','Whiteboard'], NULL, 19),
  -- Banquet (1)
  ('Grand Banquet', 'Banquet', 500, 50000, 'available', ARRAY['AC','Stage','LED Wall','Sound System','Catering Kitchen','Parking'], NULL, 20)
ON CONFLICT DO NOTHING;


-- ─── 7. Seed Site Images (hero + section images) ────────────
-- These are the default Unsplash images used on the website.
-- Admin can replace the URLs from the Images admin page.
DELETE FROM site_images WHERE category IN ('hero','hotel','restaurant','events','travel','gallery','food','rooms');

INSERT INTO site_images (url, alt, category, sort_order) VALUES
  -- Heroes
  ('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&q=80', 'Hotel lobby hero', 'hero', 1),
  ('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=80', 'Hotel exterior hero', 'hero', 2),
  ('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80', 'Restaurant hero', 'hero', 3),
  ('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80', 'Events hero', 'hero', 4),
  ('https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=1920&q=80', 'Travel hero', 'hero', 5),
  ('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80', 'Gallery hero', 'hero', 6),
  ('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80', 'Menu hero', 'hero', 7),
  ('https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&q=80', 'Blog hero', 'hero', 8),
  -- Rooms (fallback per type)
  ('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', 'Standard Room', 'rooms', 10),
  ('https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80', 'Deluxe Room', 'rooms', 11),
  ('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', 'Suite Room', 'rooms', 12),
  -- Restaurant & Food
  ('https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80', 'North Indian cuisine', 'food', 20),
  ('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', 'Vegetarian platter', 'food', 21),
  ('https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80', 'Indian sweets', 'food', 22),
  ('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', 'Restaurant interior', 'restaurant', 23),
  -- Events
  ('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80', 'Wedding ceremony', 'events', 30),
  ('https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&q=80', 'Birthday party', 'events', 31),
  ('https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80', 'Corporate event', 'events', 32),
  ('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80', 'Seminar', 'events', 33),
  ('https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80', 'Family function', 'events', 34),
  -- Travel
  ('https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80', 'Taj Mahal Agra', 'travel', 40),
  ('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80', 'Mathura temple', 'travel', 41),
  -- Gallery fillers
  ('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80', 'Hotel exterior', 'gallery', 50),
  ('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', 'Standard room', 'gallery', 51),
  ('https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80', 'Deluxe room', 'gallery', 52),
  ('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', 'Restaurant ambiance', 'gallery', 53),
  ('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', 'Banquet hall', 'gallery', 54),
  ('https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80', 'Taj Mahal trip', 'gallery', 55),
  ('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', 'Suite bathroom', 'gallery', 56),
  ('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', 'Dining area', 'gallery', 57),
  ('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80', 'Vrindavan temple', 'gallery', 58),
  ('https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', 'Thali plate', 'gallery', 59),
  ('https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', 'Wedding decoration', 'gallery', 60),
  ('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', 'Veg cuisine', 'gallery', 61)
ON CONFLICT DO NOTHING;


-- ─── 8. Sample Bookings (to show on calendar) ───────────────
INSERT INTO room_bookings (room_id, guest_name, guest_phone, check_in, check_out, status) VALUES
  ((SELECT id FROM rooms WHERE name='Room 102' LIMIT 1), 'Rajesh Gupta',   '9876543210', CURRENT_DATE, CURRENT_DATE + 3, 'checked_in'),
  ((SELECT id FROM rooms WHERE name='Room 202' LIMIT 1), 'Priya Sharma',   '9876543211', CURRENT_DATE, CURRENT_DATE + 2, 'checked_in'),
  ((SELECT id FROM rooms WHERE name='Room 205' LIMIT 1), 'Amit Kumar',     '9876543212', CURRENT_DATE - 1, CURRENT_DATE + 4, 'checked_in'),
  ((SELECT id FROM rooms WHERE name='Suite 302' LIMIT 1), 'Neha Agarwal',  '9876543213', CURRENT_DATE, CURRENT_DATE + 1, 'checked_in'),
  ((SELECT id FROM rooms WHERE name='Room 201' LIMIT 1), 'Suresh Verma',   '9876543214', CURRENT_DATE + 3, CURRENT_DATE + 5, 'confirmed'),
  ((SELECT id FROM rooms WHERE name='Room 101' LIMIT 1), 'Meena Devi',     '9876543215', CURRENT_DATE + 5, CURRENT_DATE + 7, 'confirmed'),
  ((SELECT id FROM rooms WHERE name='Suite 301' LIMIT 1), 'VIP Corporate', '9876543216', CURRENT_DATE + 7, CURRENT_DATE + 10, 'confirmed'),
  ((SELECT id FROM rooms WHERE name='Royal Suite' LIMIT 1), 'Wedding Family','9876543217', CURRENT_DATE + 14, CURRENT_DATE + 17, 'confirmed')
ON CONFLICT DO NOTHING;

-- Sample venue bookings
INSERT INTO venue_bookings (venue_name, event_type, client_name, client_phone, event_date, status) VALUES
  ('Banquet-Hall', 'wedding',    'Sharma Family',  '9876543220', CURRENT_DATE + 10, 'confirmed'),
  ('Lawn',         'reception',  'Gupta Family',   '9876543221', CURRENT_DATE + 10, 'confirmed'),
  ('Banquet-Hall', 'corporate',  'TCS Ltd.',       '9876543222', CURRENT_DATE + 20, 'confirmed'),
  ('Lawn',         'birthday',   'Rahul Mehta',    '9876543223', CURRENT_DATE + 30, 'confirmed')
ON CONFLICT DO NOTHING;

-- Done! Now go to Supabase → Authentication → Users → Add User
-- Email: admin@shardapalace.in  /  Password: <your choice>
