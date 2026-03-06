# 🏨 Sharda Palace — Website + POS System

> A modern hotel management system with:
> - **Public website** on GitHub Pages (free, fast CDN)
> - **Admin panel + POS** running locally on your laptop
> - **Supabase cloud** as the database (free tier)

---

## 🚀 Quick Start (First Time Setup)

### Step 1: Create Supabase Project (FREE)

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Create a new project: **"sharda-palace"**
3. Wait ~2 minutes for setup
4. Go to **Project → SQL Editor**
5. Copy-paste the contents of `supabase/schema.sql` → Click **Run**
6. Copy-paste the contents of `supabase/seed.sql` → Click **Run**
7. Go to **Project → Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Configure Environment

```bash
cd customers\sharda
copy .env.local.example .env.local
```

Open `.env.local` in Notepad and fill in your Supabase keys + a random session secret.

Generate a session secret (open PowerShell):
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Step 3: Install & Start

Double-click `startup\start-sharda.bat`

OR in terminal:
```bash
cd customers\sharda
npm install
npm run dev
```

Visit: http://localhost:3001/admin  
Login: `superadmin` / `sharda@super`

**⚠️ Change the password immediately after first login!**

---

## 🏠 Auto-Start on Windows Boot

Run once as Administrator:
```powershell
cd customers\sharda\startup
.\add-startup.ps1
```

The server will start automatically every time you log into Windows.

---

## 🌐 Publish to GitHub Pages (FREE website)

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) → New repository
2. Name it: `shardapalace` (or your choice)
3. Make it **Public** (required for free Pages)
4. Don't initialize with README (you already have code)

### Step 2: Push Code

```bash
cd customers\sharda
git init
git add .
git commit -m "Initial Sharda Palace website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shardapalace.git
git push -u origin main
```

### Step 3: Add Secrets to GitHub

Go to GitHub → Your Repo → **Settings → Secrets → Actions**:

| Secret Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon/public key |

Optional (go to Variables tab):
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_HOTEL_PHONE` | `7303584266` |
| `NEXT_PUBLIC_BASE_PATH` | Leave blank OR `/shardapalace` if using `username.github.io/shardapalace` |

### Step 4: Enable GitHub Pages

Go to: **Settings → Pages → Source → GitHub Actions**

### Step 5: Deploy!

Push any change to `main` branch — GitHub automatically builds and deploys.
Or go to **Actions → "Deploy Sharda Palace..." → Run workflow**.

Your site will be live at: `https://YOUR_USERNAME.github.io/shardapalace`

### Step 6: Custom Domain (Optional)

Add a `CNAME` file in the repo root with your domain:
```
www.shardapalace.in
```

Then in your domain DNS, add:
```
CNAME www  YOUR_USERNAME.github.io
```

---

## 📊 Admin Features

| Feature | URL | Description |
|---|---|---|
| Dashboard | `/admin` | Stats, enquiries, quick actions |
| POS Terminal | `/admin/pos` | Full POS with offline support |
| Menu | `/admin/menu` | Add/edit/delete menu items |
| Rooms | `/admin/rooms` | Room status management |
| Tables | `/admin/tables` | Restaurant table management |
| Enquiries | `/admin/enquiries` | View & respond to enquiries |
| Testimonials | `/admin/testimonials` | Approve/reject reviews |
| Users | `/admin/users` | Add staff accounts |

---

## 💻 POS System

- Works **offline** — orders saved in browser IndexedDB (Dexie.js)
- **Auto-syncs** to Supabase when internet is back
- GST calculation (CGST + SGST)
- Payment modes: Cash, UPI, Card, Split, Credit/Room
- Print bill via browser print dialog
- Order types: Dine-in, Takeaway, Delivery

---

## 🔐 Security

| Key | Where | Safe? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser (GitHub Pages) | ✅ Yes — read-only via RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (local laptop) | ✅ Never in browser |
| `SESSION_SECRET` | Server only | ✅ Never in browser |

---

## 📁 Project Structure

```
customers/sharda/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Homepage
│   │   ├── contact/          # Enquiry form (works on GitHub Pages)
│   │   ├── hotel/            # Rooms & rates
│   │   ├── restaurant/       # Menu
│   │   ├── events/           # Banquets
│   │   ├── travel/           # Travel packages
│   │   ├── gallery/          # Photo gallery
│   │   ├── blog/             # Blog posts
│   │   ├── admin/            # Admin panel (runs locally)
│   │   └── api/              # API routes (runs locally)
│   ├── lib/
│   │   ├── supabase-public.ts  # ANON key — browser safe
│   │   ├── supabase-server.ts  # SERVICE ROLE — server only
│   │   └── auth.ts             # HMAC session auth
│   └── middleware.ts           # Route protection
├── supabase/
│   ├── schema.sql            # DB schema
│   └── seed.sql              # Seed data
├── startup/
│   ├── start-sharda.bat      # Windows double-click start
│   └── add-startup.ps1       # Register Windows startup
├── .github/workflows/
│   └── deploy-pages.yml      # Auto GitHub Pages deploy
└── .env.local.example        # Environment template
```

---

## 🛠️ Development Commands

```bash
npm run dev          # Local development server (port 3001, hot reload)
npm run build        # Build for local production
npm start            # Start local production server (port 3001)
npm run build:static # Build for GitHub Pages (static export)
npm run lint         # Run ESLint
```

---

## 🆘 Troubleshooting

**"Cannot connect to Supabase"**
→ Check `.env.local` — make sure URL and keys are correct, no extra spaces

**"Session expired" / keeps logging out**
→ `SESSION_SECRET` must be the same before and after server restart

**POS not syncing**
→ Check if server is running on port 3001; check browser console for errors

**GitHub Pages 404**
→ Make sure `NEXT_PUBLIC_BASE_PATH` matches your repo name if using `username.github.io/reponame`

**Admin login fails**
→ Make sure you ran `seed.sql` in Supabase. Password is `sharda@super` for superadmin.

---

## 📞 Support

Built by HospiFlow Platform  
For help: contact your platform admin
