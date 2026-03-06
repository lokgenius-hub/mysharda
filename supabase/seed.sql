-- ============================================================
--  SHARDA PALACE — SEED DATA
--  Run AFTER schema.sql. Creates superadmin + sample content.
-- ============================================================

-- ─── Superadmin User ────────────────────────────────────────
-- SECURITY: No default password is stored here.
-- After running this seed, generate a real hash by starting the local server and running:
--
--   node -e "
--     const crypto = require('crypto');
--     const salt = crypto.randomBytes(16).toString('hex');
--     const hash = crypto.createHash('sha256').update(salt + ':' + 'YOUR_CHOSEN_PASSWORD').digest('hex');
--     console.log(salt + ':' + hash);
--   "
--
-- Then run in SQL Editor:
--   UPDATE admin_users SET password_hash = '<output above>' WHERE username = 'superadmin';
--
-- Until you do this, the superadmin account is LOCKED (placeholder hash will never match).
INSERT INTO admin_users (username, display_name, password_hash, role) VALUES
  ('superadmin', 'Super Admin', 'CHANGE_ME:0000000000000000000000000000000000000000000000000000000000000000', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- ─── Sample Menu Items ──────────────────────────────────────
INSERT INTO menu_items (name, category, price, is_veg, tax_rate, sort_order) VALUES
  ('Paneer Tikka',        'Starters',       280, TRUE,  5,  1),
  ('Chicken Tikka',       'Starters',       320, FALSE, 5,  2),
  ('Veg Spring Rolls',    'Starters',       200, TRUE,  5,  3),
  ('Fish Fingers',        'Starters',       350, FALSE, 5,  4),
  ('Dal Makhani',         'Main Course',    240, TRUE,  5,  5),
  ('Butter Chicken',      'Main Course',    340, FALSE, 5,  6),
  ('Paneer Butter Masala','Main Course',    280, TRUE,  5,  7),
  ('Mutton Rogan Josh',   'Main Course',    420, FALSE, 5,  8),
  ('Veg Biryani',         'Rice & Biryani', 260, TRUE,  5,  9),
  ('Chicken Biryani',     'Rice & Biryani', 320, FALSE, 5, 10),
  ('Garlic Naan',         'Breads',          60, TRUE,  5, 11),
  ('Butter Roti',         'Breads',          30, TRUE,  5, 12),
  ('Gulab Jamun',         'Desserts',        80, TRUE,  5, 13),
  ('Rasgulla',            'Desserts',        60, TRUE,  5, 14),
  ('Lassi',               'Beverages',       80, TRUE,  0, 15),
  ('Cold Coffee',         'Beverages',      120, TRUE, 18, 16),
  ('Masala Chai',         'Beverages',       40, TRUE,  0, 17),
  ('Fresh Lime Soda',     'Beverages',       70, TRUE,  0, 18)
ON CONFLICT DO NOTHING;

-- ─── Sample Rooms ───────────────────────────────────────────
INSERT INTO rooms (name, type, capacity, price_per_night, status) VALUES
  ('Room 101', 'Standard', 2, 2500, 'available'),
  ('Room 102', 'Standard', 2, 2500, 'available'),
  ('Room 103', 'Standard', 3, 2800, 'available'),
  ('Room 201', 'Deluxe',   2, 3500, 'available'),
  ('Room 202', 'Deluxe',   2, 3500, 'available'),
  ('Room 203', 'Deluxe',   3, 4000, 'available'),
  ('Suite 301','Suite',    4, 6500, 'available'),
  ('Suite 302','Suite',    4, 6500, 'available')
ON CONFLICT DO NOTHING;

-- ─── Sample Testimonials (pre-approved) ─────────────────────
INSERT INTO testimonials (name, designation, rating, review, is_approved) VALUES
  ('Rajesh Kumar',  'Business Traveller', 5, 'Excellent hospitality and amazing food. The rooms are spacious and staff very helpful. Highly recommended!', TRUE),
  ('Priya Sharma',  'Wedding Guest',       5, 'We held our wedding reception here. The banquet hall was beautifully decorated and the catering was superb.', TRUE),
  ('Amit Singh',    'Family Vacation',     4, 'Great location, clean rooms, and delicious North Indian food. Will definitely come back!', TRUE)
ON CONFLICT DO NOTHING;

-- ─── Sample Travel Packages ─────────────────────────────────
INSERT INTO travel_packages (title, description, price, duration, is_active, sort_order) VALUES
  ('Golden Triangle Tour',   'Delhi - Agra - Jaipur classic tour with hotel stay and sightseeing', 12999, '4N/5D', TRUE, 1),
  ('Rajasthan Heritage Tour', 'Jaipur - Jodhpur - Udaipur with palace visits and cultural experiences', 18999, '6N/7D', TRUE, 2),
  ('Mathura Vrindavan Darshan','Day trip to Krishna birthplace with temple visits and prasad', 2499, '1D', TRUE, 3)
ON CONFLICT DO NOTHING;
