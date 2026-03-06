# Installation & Deployment Guide — Sharda Palace

Complete step-by-step guide to install, configure, and deploy the Sharda Palace project.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Supabase Cloud Setup](#3-supabase-cloud-setup)
4. [Environment Configuration](#4-environment-configuration)
5. [Create Admin User](#5-create-admin-user)
6. [Run Locally](#6-run-locally)
7. [Deploy to GitHub Pages](#7-deploy-to-github-pages)
8. [Auto-Start on Boot (Windows)](#8-auto-start-on-boot-windows)
9. [AI Chatbot Setup](#9-ai-chatbot-setup)
10. [Email Notifications Setup](#10-email-notifications-setup)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

### Install Node.js
1. Download Node.js **v18+** from [nodejs.org](https://nodejs.org/)
2. Run installer, check "Add to PATH"
3. Verify:
   ```powershell
   node --version   # Should show v18.x or v20.x or v22.x
   npm --version    # Should show 9.x or 10.x
   ```

### Install Git (optional, for deployment)
1. Download from [git-scm.com](https://git-scm.com/)
2. Verify: `git --version`

### Install VS Code (optional, recommended)
- Download from [code.visualstudio.com](https://code.visualstudio.com/)

---

## 2. Local Development Setup

```powershell
# Navigate to the project folder
cd C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda

# Install dependencies
npm install

# This will create node_modules/ folder (takes 1-2 minutes)
```

---

## 3. Supabase Cloud Setup

### A. Create a Supabase Account
1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `sharda-palace`
   - **Database Password**: Save this! (not used in code, but needed for direct DB access)
   - **Region**: Choose closest (e.g., Mumbai for India)
4. Wait 2-3 minutes for project to initialize

### B. Get Your API Keys
1. In Supabase Dashboard → **Settings** (gear icon) → **API**
2. Copy these 3 values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...` (safe for browser)
   - **service_role key**: `eyJhbGciOi...` (**keep secret!**)

### C. Run the Database Schema
1. In Supabase Dashboard → **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open `supabase/schema.sql` from your project
4. Copy ALL content and paste into the SQL editor
5. Click **"Run"** (green button)
6. Should see "Success. No rows returned" — this is correct!

### D. Run Seed Data (Optional)
1. If `supabase/seed.sql` exists:
2. Open it, copy content, paste in SQL Editor, Run

### E. If You Already Have Schema Deployed
Run migration files in order:
- `supabase/migration-pos-summary.sql` — Adds POS summary columns

---

## 4. Environment Configuration

### Copy the Example File
```powershell
# In the project folder
Copy-Item .env.local.example .env.local
```

### Edit `.env.local`
Open `.env.local` in any text editor and fill in:

```env
# ── Supabase (from Step 3B) ──────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...YOUR_SERVICE_ROLE_KEY

# ── Session Security ─────────────────────────────
# Generate a random 32+ char string:
# PowerShell: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }) -as [byte[]])
SESSION_SECRET=PASTE_YOUR_RANDOM_STRING_HERE

# ── Hotel Info ───────────────────────────────────
NEXT_PUBLIC_HOTEL_PHONE=7303584266
NEXT_PUBLIC_HOTEL_WHATSAPP=917303584266
NEXT_PUBLIC_HOTEL_EMAIL=info@shardapalace.in
NEXT_PUBLIC_HOTEL_ADDRESS=Bijnor, Uttar Pradesh

# ── Port ─────────────────────────────────────────
PORT=3001
```

> **IMPORTANT**: Never commit `.env.local` to git! It's already in `.gitignore`.

---

## 5. Create Admin User

### Option A: Using the Seed Script
If `supabase/seed.sql` creates a default admin, just run it.

Default login: `superadmin` / `sharda@super`

### Option B: Manual SQL
In Supabase SQL Editor, run:

```sql
-- First, generate a password hash.
-- The format is: salt:sha256hash
-- For password "sharda@super" with salt "abc123":
-- sha256("abc123sharda@super") = computed_hash

-- Use the app's /api/admin/users endpoint or run this:
INSERT INTO admin_users (username, display_name, password_hash, role)
VALUES (
  'superadmin',
  'Super Admin',
  -- This is the hash for "sharda@super" — change after first login!
  'a1b2c3:COMPUTED_HASH_HERE',
  'superadmin'
);
```

> **TIP**: The easiest way is to start the app and use the admin API to create users, or use the existing seed that was run during initial setup.

---

## 6. Run Locally

### Development Mode (with hot reload)
```powershell
npm run dev
```
- Opens at: **http://localhost:3001**
- Admin panel: **http://localhost:3001/admin**
- Changes auto-reload

### Production Mode
```powershell
npm run build
npm start
```
- Faster, optimized build
- Same URL: **http://localhost:3001**

---

## 7. Deploy to GitHub Pages

GitHub Pages hosts the **public website for free** (static HTML). The admin panel and API routes need the local server running.

### A. Create GitHub Repository
1. Go to [github.com](https://github.com) → Sign in
2. Click **"New repository"**
3. Name: `sharda-palace` (or any name)
4. Set to **Public** (required for free GitHub Pages)
5. Do NOT initialize with README (we already have one)

### B. Push Code to GitHub
```powershell
cd C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda

git init
git add .
git commit -m "Initial commit: Sharda Palace website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sharda-palace.git
git push -u origin main
```

### C. Enable GitHub Pages
1. Go to your repo on GitHub
2. **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. The workflow file `.github/workflows/deploy-pages.yml` is already included!

### D. Set Repository Secrets
1. In GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** for each:

| Secret Name | Value |
|------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `NEXT_PUBLIC_HOTEL_PHONE` | `7303584266` |
| `NEXT_PUBLIC_HOTEL_WHATSAPP` | `917303584266` |
| `NEXT_PUBLIC_HOTEL_EMAIL` | `info@shardapalace.in` |

> Note: Only `NEXT_PUBLIC_*` variables are needed for the static site. Server-side keys (SUPABASE_SERVICE_ROLE_KEY, SESSION_SECRET) are NOT needed for GitHub Pages.

### E. Trigger Deployment
```powershell
git add .
git commit -m "Deploy to GitHub Pages"
git push
```
- Go to repo → **Actions** tab → watch the build
- Once green ✅, your site is live at: `https://YOUR_USERNAME.github.io/sharda-palace/`

### F. Custom Domain (Optional)
1. In GitHub repo → **Settings** → **Pages**
2. Under "Custom domain", enter: `www.shardapalace.in`
3. Add DNS records at your domain registrar:
   ```
   Type: CNAME
   Name: www
   Value: YOUR_USERNAME.github.io
   ```
4. Wait for DNS propagation (can take up to 24 hours)
5. Enable "Enforce HTTPS" checkbox

---

## 8. Auto-Start on Boot (Windows)

### Method A: Startup Batch File
The project includes `startup/start-sharda.bat`:

```powershell
# Add to Windows Startup folder:
.\startup\add-startup.ps1

# Or manually:
# 1. Press Win+R → type: shell:startup
# 2. Copy start-sharda.bat to that folder
```

### Method B: Task Scheduler (Recommended)
```powershell
# Create a scheduled task that runs on login
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c cd /d C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda && npm start"
$trigger = New-ScheduledTaskTrigger -AtLogon
Register-ScheduledTask -TaskName "ShardaPalace" -Action $action -Trigger $trigger -Description "Start Sharda Palace server"
```

---

## 9. AI Chatbot Setup

The chatbot uses free AI APIs. You need ONE of these keys:

### Option 1: Groq (Recommended — Fastest)
1. Go to [console.groq.com](https://console.groq.com/)
2. Sign up (free, no credit card)
3. Go to **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_`)
5. Add to `.env.local`:
   ```
   GROQ_API_KEY=gsk_YOUR_KEY_HERE
   ```

### Option 2: Google Gemini
1. Go to [aistudio.google.com](https://aistudio.google.com/)
2. Click **"Get API Key"** → **"Create API Key"**
3. Add to `.env.local`:
   ```
   GOOGLE_AI_API_KEY=YOUR_KEY_HERE
   ```

### Option 3: OpenRouter
1. Go to [openrouter.ai](https://openrouter.ai/)
2. Sign up → **Keys** → **Create Key**
3. Add to `.env.local`:
   ```
   OPENROUTER_API_KEY=sk-or-YOUR_KEY_HERE
   ```

### No API Key?
If no key is configured, the chatbot still works with pre-defined fallback responses (FAQ-style). No errors, just less intelligent.

> **Note**: The chatbot only works when the local server is running (it uses `/api/chat` which is a server-side route). On GitHub Pages (static), the chat button won't appear or will show fallback responses.

---

## 10. Email Notifications Setup

When someone submits an enquiry, an email is sent to the admin.

### Using Resend (Recommended — Free Tier)
1. Go to [resend.com](https://resend.com/) → Sign up (free, 100 emails/day)
2. Go to **API Keys** → **Create API Key**
3. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_YOUR_KEY_HERE
   ADMIN_EMAIL=info@shardapalace.in
   ```

### Using Custom Domain Email (Optional)
1. In Resend, go to **Domains** → Add your domain
2. Add DNS records as instructed
3. Update the `from` field in `src/lib/email.ts`:
   ```typescript
   from: 'Sharda Palace <noreply@shardapalace.in>'
   ```

### Without Email Setup
If not configured, enquiries still save to Supabase — you just won't get email alerts. You can check the admin panel manually.

---

## 11. Troubleshooting

### "Port 3001 already in use"
```powershell
# Find what's using port 3001
netstat -ano | findstr :3001
# Kill the process
taskkill /PID <PID_NUMBER> /F
```

### "Module not found" errors
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Build fails with TypeScript errors
```powershell
# Check for errors
npm run lint
# Try building with verbose output
npx next build 2>&1 | Select-Object -Last 50
```

### Supabase connection fails
1. Check `.env.local` has correct URL and keys
2. Check the Supabase project is active (free tier pauses after 1 week of inactivity)
3. Go to Supabase Dashboard → check project status

### GitHub Pages shows 404
1. Check **Settings** → **Pages** → Source is "GitHub Actions"
2. Check **Actions** tab for build errors
3. Make sure the repo has the workflow file at `.github/workflows/deploy-pages.yml`
4. If using `basePath`, set `NEXT_PUBLIC_BASE_PATH=/repo-name` in GitHub Secrets

### Admin login doesn't work
1. Check there's an admin user in the database:
   ```sql
   SELECT username, role, is_active FROM admin_users;
   ```
2. Ensure the user's `is_active` is `true`
3. Check `SESSION_SECRET` is set in `.env.local`

### Chatbot not responding
1. Check if `GROQ_API_KEY` (or alternatives) is set in `.env.local`
2. Restart the server after changing env vars
3. Check browser console for errors
4. The chatbot requires the local server running — doesn't work on static GitHub Pages

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     GITHUB PAGES (Free)                      │
│  Static website: Homepage, Menu, Gallery, Blog, Contact      │
│  → Reads data directly from Supabase (anon key)             │
│  → Enquiry form writes directly to Supabase                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Both use
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE CLOUD (Free)                      │
│  PostgreSQL database — all data lives here                   │
│  RLS policies: public can read menu/rooms/blog               │
│  Public can insert enquiries + testimonials                  │
│  Service role for admin operations                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Service role key
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               LOCAL SERVER (Your Laptop)                     │
│  Next.js on port 3001 — admin panel + APIs                  │
│  POS (offline-first with IndexedDB + sync)                  │
│  AI Chatbot, Email notifications                            │
│  Auto-starts on boot via startup script                     │
└─────────────────────────────────────────────────────────────┘
```

### What Works Without the Local Server?
| Feature | Without Server | With Server |
|---------|---------------|-------------|
| Public website | ✅ GitHub Pages | ✅ localhost:3001 |
| View menu/rooms/blog | ✅ Direct from Supabase | ✅ |
| Submit enquiry | ✅ Writes to Supabase directly | ✅ + email alert |
| Submit testimonial | ✅ Direct insert | ✅ |
| Admin panel | ❌ Needs server | ✅ |
| POS | ❌ Needs server | ✅ (offline-capable) |
| AI chatbot | ❌ Needs API route | ✅ |
| WhatsApp message | ✅ Client-side link | ✅ |
