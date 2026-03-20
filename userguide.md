Step-by-step: Create tenant admin in Supabase
Step 1 — Create user in Supabase UI
Go to Supabase Dashboard → Authentication → Users
Click "Add user" → "Create new user"
Fill in:
Email: admin@shardapalace.in
Password: anything you want (e.g. Sharda@2024)
Click Create user
Step 2 — Set the tenant_id for that user (SQL Editor)
Go to Supabase Dashboard → SQL Editor → paste this:


UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object(
  'tenant_id',    'sharda',
  'role',         'admin',
  'display_name', 'sharda'
)
WHERE email = 'admin@shardapalace.in';

for rajdarbar

UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object(
  'tenant_id',    'raj-darbar',
  'role',         'admin',
  'display_name', 'Raj Darbar Admin'
)
WHERE email = 'raj@test.com';