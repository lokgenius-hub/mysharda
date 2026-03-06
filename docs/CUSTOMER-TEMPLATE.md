# Customer Template — HospiFlow Onboarding Guide

> Reference document to create a new customer project quickly using the Sharda Palace codebase as a template.

---

## Quick Start: Clone for New Customer

### Step 1: Copy the Template
```powershell
# From the customers/ directory
Copy-Item -Recurse .\sharda\ .\NEW_CUSTOMER_NAME\
cd .\NEW_CUSTOMER_NAME\
```

### Step 2: Customize the Basics

#### A. Update `package.json`
```json
{
  "name": "new-customer-name",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev --port 3002",   // Change port per customer
    "start": "next start --port 3002"
  }
}
```

#### B. Update `.env.local`
```env
# New Supabase project for this customer
NEXT_PUBLIC_SUPABASE_URL=https://NEW_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...NEW_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJ...NEW_SERVICE_KEY
SESSION_SECRET=NEW_RANDOM_32_CHAR_STRING

# Customer info
NEXT_PUBLIC_HOTEL_PHONE=9876543210
NEXT_PUBLIC_HOTEL_WHATSAPP=919876543210
NEXT_PUBLIC_HOTEL_EMAIL=info@newcustomer.com
NEXT_PUBLIC_HOTEL_ADDRESS=Customer Address Here

# Port must be unique
PORT=3002
```

#### C. Update Branding (search & replace)
| Find | Replace With |
|------|-------------|
| `Sharda Palace` | New Business Name |
| `Bijnor, UP` | New City, State |
| `shardapalace` | new-customer-domain |
| `#c9a84c` | Customer's gold/accent color |
| `#0f0f23` | Customer's dark/background color |
| `Playfair Display` | Customer's heading font (or keep) |

**Key files to update:**
- `src/app/layout.tsx` — Title, meta, description
- `src/app/page.tsx` — Hero text, taglines, service descriptions
- `src/components/Navbar.tsx` — Logo text, nav links
- `src/components/Footer.tsx` — Address, phone, social links
- `src/app/api/chat/route.ts` — System prompt (hotel details)

### Step 3: Set Up Supabase
1. Create new project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in SQL editor
3. Run `supabase/seed.sql` if exists
4. Copy API keys to `.env.local`

### Step 4: Create Admin User
```sql
-- Run in Supabase SQL editor
INSERT INTO admin_users (username, display_name, password_hash, role) VALUES
  ('admin', 'Admin', 'SALT:HASH', 'superadmin');
```
Or use the seed script that auto-creates default admin.

### Step 5: Test
```powershell
npm install
npm run dev
# Open http://localhost:3002
```

---

## Customer Types & Feature Toggle

### Full Hotel + Restaurant (like Sharda Palace)
Keep everything — all pages and features are used.

### Restaurant Only
Remove these folders/files:
```
src/app/hotel/           — Hotel page
src/app/travel/          — Travel page
src/app/events/          — Events page (or keep for banquet)
src/app/admin/rooms/     — Room management
src/app/admin/travel/    — Travel packages
src/app/api/admin/rooms/ — Room API
src/app/api/admin/travel/ — Travel API
```

Remove from `src/components/Navbar.tsx`:
- Hotel link
- Travel link

Remove from `src/app/admin/layout.tsx`:
- Rooms sidebar item
- Travel sidebar item

Remove from `supabase/schema.sql`:
- `rooms` table
- `travel_packages` table
- Related RLS policies and indexes

**Keep these (essential for restaurant):**
- Menu management + POS
- Tables
- Enquiries
- Testimonials
- Blog
- Coins/Loyalty
- Gallery/Images
- Admin auth

### Banquet/Event Only
Similar to restaurant, but:
- Keep Events page
- Remove Menu + POS (or keep if they have catering)
- Remove Tables management

---

## Color Scheme Reference

### Default (Sharda Palace — Dark Luxury)
```css
--gold: #c9a84c        /* Primary accent */
--gold-dark: #a88a3a   /* Darker gold */
--bg-dark: #0f0f23     /* Deep navy background */
--bg-card: #1a1a2e     /* Card/panel background */
--text: #ffffff         /* White text */
--text-muted: rgba(255,255,255,0.5)
```

### Alternative Themes (for future customers)
```css
/* Warm Brown */
--accent: #8B4513; --bg: #1a0f0a;

/* Royal Blue */  
--accent: #4169E1; --bg: #0a0f1a;

/* Emerald Green */
--accent: #2ecc71; --bg: #0a1a0f;

/* Rose Gold */
--accent: #B76E79; --bg: #1a0f14;
```

---

## File Structure Summary

```
customers/CUSTOMER_NAME/
├── .env.local              ← Customer-specific config
├── .env.local.example      ← Template for reference
├── package.json            ← Unique name + port
├── next.config.ts          ← Static/server mode toggle
├── supabase/
│   ├── schema.sql          ← Full DB schema
│   └── seed.sql            ← Initial data
├── src/
│   ├── app/
│   │   ├── layout.tsx      ← Brand name, meta tags
│   │   ├── page.tsx        ← Homepage content
│   │   ├── admin/          ← Admin dashboard
│   │   └── api/            ← Backend APIs
│   ├── components/
│   │   ├── Navbar.tsx      ← Navigation
│   │   ├── Footer.tsx      ← Footer info
│   │   └── ChatBot.tsx     ← AI concierge
│   └── lib/
│       ├── supabase-public.ts  ← Public data (works on GitHub Pages)
│       ├── supabase-server.ts  ← Server-side (admin APIs)
│       ├── auth.ts             ← Session auth
│       └── email.ts            ← Email notifications
├── startup/
│   ├── start-CUSTOMER.bat  ← One-click startup
│   └── add-startup.ps1     ← Auto-start on boot
└── .github/
    └── workflows/
        └── deploy-pages.yml ← GitHub Pages CD
```

---

## Checklist for New Customer Onboarding

- [ ] Copy template folder
- [ ] Update package.json (name, port)
- [ ] Create Supabase project + run schema
- [ ] Update .env.local with new keys
- [ ] Search-replace business name, phone, address
- [ ] Update homepage hero + service sections
- [ ] Customize colors if needed
- [ ] Remove unused feature pages (if restaurant-only etc.)
- [ ] Update Navbar/Footer links
- [ ] Update AI chatbot system prompt
- [ ] Update email notification "from" name
- [ ] Create startup batch file
- [ ] Set up GitHub repo + Pages workflow
- [ ] Create initial admin user
- [ ] Add menu items / rooms / content
- [ ] Test full flow: website → enquiry → admin → WhatsApp → email
