-- ============================================================
--  SHARDA PALACE — MIGRATION: Site Config + Image Keys
--  Run this AFTER schema.sql, seed.sql, and migration-admin-auth.sql
--
--  What this does:
--  1. Creates site_config table (key-value for Google Maps, contact, etc.)
--  2. Adds image_key column to site_images for named image slots
--  3. Seeds 20+ named image keys (admin can replace URLs)
--  4. Seeds site config (address, phone, map embed, social links)
--  5. RLS: public read, authenticated write
-- ============================================================

-- ─── 1. Site Config Table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS site_config (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key  TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL DEFAULT '',
  label       TEXT,                     -- human-readable label for admin UI
  category    TEXT DEFAULT 'general',   -- grouping: general, contact, social, maps
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_config" ON site_config;
CREATE POLICY "public_read_site_config" ON site_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth_manage_site_config" ON site_config;
CREATE POLICY "auth_manage_site_config" ON site_config FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ─── 2. Add image_key to site_images ────────────────────────
DO $$ BEGIN
  ALTER TABLE site_images ADD COLUMN image_key TEXT UNIQUE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_site_images_key ON site_images(image_key);

-- ─── 3. Seed Site Config ────────────────────────────────────
INSERT INTO site_config (config_key, config_value, label, category) VALUES
  -- General
  ('hotel_name',        'Sharda Palace',                                            'Hotel Name',         'general'),
  ('tagline',           'Where Tradition Meets Luxury',                             'Tagline',            'general'),
  ('description',       'Luxury hotel, restaurant and banquet hall in the heart of Bijnor, Uttar Pradesh.', 'Description', 'general'),

  -- Contact
  ('phone',             '+91 73035 84266',                                          'Phone Number',       'contact'),
  ('email',             'info@shardapalace.in',                                     'Email',              'contact'),
  ('whatsapp',          '917303584266',                                             'WhatsApp Number',    'contact'),
  ('address',           'Behind Patnwar Petrol Pump, Bhabua Road, Bijnor, Uttar Pradesh 246701', 'Address', 'contact'),

  -- Social
  ('facebook_url',      'https://facebook.com',                                     'Facebook URL',       'social'),
  ('instagram_url',     'https://instagram.com',                                    'Instagram URL',      'social'),
  ('youtube_url',       'https://youtube.com',                                      'YouTube URL',        'social'),

  -- Google Maps
  ('google_maps_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55903.63498498846!2d78.09775995!3d29.37220735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390b90495be88267%3A0xdf467da08c1578eb!2sBijnor%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1703500000000!5m2!1sen!2sin', 'Google Maps Embed URL', 'maps'),
  ('google_maps_link',  'https://maps.google.com/?q=Sharda+Palace+Bijnor',         'Google Maps Link',   'maps'),

  -- Timings
  ('restaurant_hours',  '7:00 AM – 11:00 PM',                                      'Restaurant Hours',   'timings'),
  ('reception_hours',   '24 × 7',                                                  'Reception Hours',    'timings'),
  ('checkin_time',      '12:00 Noon',                                               'Check-in Time',      'timings'),
  ('checkout_time',     '11:00 AM',                                                 'Check-out Time',     'timings')
ON CONFLICT (config_key) DO NOTHING;


-- ─── 4. Seed Named Image Keys ──────────────────────────────
-- First clear old category-only images (inserted by migration-admin-auth.sql)
-- Then insert keyed images. Admin replaces URLs via the Images admin page.

DELETE FROM site_images WHERE image_key IS NULL AND category IN ('hero','hotel','restaurant','events','travel','gallery','food','rooms');

INSERT INTO site_images (image_key, url, alt, category, sort_order, is_active) VALUES
  -- Page Heroes
  ('heroHome',        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&q=80', 'Hotel lobby hero',         'hero', 1,  true),
  ('heroHotel',       'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=80',    'Hotel exterior hero',      'hero', 2,  true),
  ('heroRestaurant',  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80', 'Restaurant hero',          'hero', 3,  true),
  ('heroEvents',      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80', 'Events hero',              'hero', 4,  true),
  ('heroTravel',      'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=1920&q=80',    'Travel hero',              'hero', 5,  true),
  ('heroGallery',     'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80', 'Gallery hero',             'hero', 6,  true),
  ('heroMenu',        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80', 'Menu hero',                'hero', 7,  true),
  ('heroBlog',        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&q=80', 'Blog hero',                'hero', 8,  true),

  -- Room Types
  ('roomStandard',    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',  'Standard Room',            'rooms', 10, true),
  ('roomDeluxe',      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',  'Deluxe Room',              'rooms', 11, true),
  ('roomSuite',       'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',  'Suite Room',               'rooms', 12, true),

  -- Services section on homepage
  ('serviceHotel',    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',  'Hotel rooms card',         'services', 13, true),
  ('serviceRestaurant','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', 'Restaurant card',          'services', 14, true),
  ('serviceEvents',   'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80',  'Events card',              'services', 15, true),

  -- About section
  ('aboutImage',      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=80',     'About Sharda Palace',      'about', 16, true),
  ('ctaBanner',       'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=70',  'CTA banner background',    'cta', 17, true),

  -- Restaurant page
  ('cuisineNorthIndian','https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80', 'North Indian cuisine',    'food', 20, true),
  ('cuisineVeg',       'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',    'Vegetarian platter',       'food', 21, true),
  ('cuisineSweets',    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',    'Indian sweets',            'food', 22, true),
  ('restaurantInterior','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',   'Restaurant interior',      'restaurant', 23, true),

  -- Events page
  ('eventWedding',     'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80', 'Wedding ceremony',         'events', 30, true),
  ('eventBirthday',    'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&q=80', 'Birthday party',           'events', 31, true),
  ('eventCorporate',   'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80', 'Corporate event',          'events', 32, true),
  ('eventSeminar',     'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80', 'Seminar workshop',         'events', 33, true),
  ('eventReligious',   'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80', 'Religious event',          'events', 34, true),
  ('eventFamily',      'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80', 'Family function',          'events', 35, true),

  -- Travel page
  ('travelVrindavan',  'https://images.unsplash.com/photo-1581367736476-f4c4e6d6e4ea?w=600&q=80', 'Vrindavan temple',         'travel', 40, true),
  ('travelMathura',    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80', 'Mathura temple',           'travel', 41, true),
  ('travelAgra',       'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80', 'Taj Mahal Agra',           'travel', 42, true),

  -- Gallery photos (admin can add more from admin panel)
  ('gallery1',         'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',    'Hotel exterior',           'gallery', 50, true),
  ('gallery2',         'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', 'Standard room',            'gallery', 51, true),
  ('gallery3',         'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80', 'Deluxe room',              'gallery', 52, true),
  ('gallery4',         'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', 'Restaurant ambiance',      'gallery', 53, true),
  ('gallery5',         'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', 'Banquet hall',             'gallery', 54, true),
  ('gallery6',         'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80', 'Taj Mahal trip',           'gallery', 55, true),
  ('gallery7',         'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', 'Suite bathroom',           'gallery', 56, true),
  ('gallery8',         'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',    'Dining area',              'gallery', 57, true),
  ('gallery9',         'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', 'Thali plate',              'gallery', 58, true),
  ('gallery10',        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', 'Wedding decoration',       'gallery', 59, true),
  ('gallery11',        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',    'Veg cuisine',              'gallery', 60, true),
  ('gallery12',        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80', 'Vrindavan temple',         'gallery', 61, true)
ON CONFLICT (image_key) DO NOTHING;

-- Done! Run this in Supabase SQL Editor.
