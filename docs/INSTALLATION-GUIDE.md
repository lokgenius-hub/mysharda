# Installation & Deployment Guide — Sharda Palace

> **Project path**: `C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda`
> **GitHub repo**: https://github.com/lokgenius-hub/mysharda
> **Live site (after deploy)**: https://lokgenius-hub.github.io/mysharda/

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Supabase Cloud Setup](#3-supabase-cloud-setup)
4. [Environment Configuration](#4-environment-configuration)
5. [Create Admin User](#5-create-admin-user)
6. [Run Locally](#6-run-locally)
7. [Deploy to GitHub Pages](#7-deploy-to-github-pages)
8. [Deploy Supabase Edge Functions](#8-deploy-supabase-edge-functions)
9. [Set Up Email Webhook](#9-set-up-email-webhook)
10. [Auto-Start on Boot (Windows)](#10-auto-start-on-boot-windows)
11. [How Frontend works without Backend](#11-how-frontend--supabase-works-no-backend)
12. [Troubleshooting](#12-troubleshooting)

---

## Architecture Overview

```
+------------------------------------------------------------------+
|                 GITHUB PAGES (Free - always on)                   |
|  Static site: Homepage, Menu, Gallery, Blog, Contact, Hotel...   |
|  * Reads menu/rooms/blog -> directly from Supabase (anon key)   |
|  * Enquiry form -> writes directly to Supabase (anon key)       |
|  * AI Chatbot -> calls Supabase Edge Function (key never exposed)|
+-----------------------------+------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|              SUPABASE CLOUD (Free - always on)                    |
|  +----------------------+   +--------------------------------+   |
|  |   PostgreSQL DB       |   |   Edge Functions               |   |
|  |  * menu, rooms, blog  |   |  * chat-ai  (Groq proxy)      |   |
|  |  * enquiries          |   |  * notify-enquiry (email)     |   |
|  |  * pos_orders         |   |                               |   |
|  +----------+-----------+   |  GROQ_API_KEY / RESEND_API_KEY|   |
|             | DB Webhook     |  stored as Supabase Secrets   |   |
|             +--------------->  never in repo or browser      |   |
|                              +--------------------------------+   |
+-----------------------------+------------------------------------+
                              | Service role key (never public)
                              v
+------------------------------------------------------------------+
|          LOCAL SERVER - Your Laptop (optional, for admin)         |
|  Next.js on port 3001                                            |
|  * Admin panel (login, dashboard, manage all content)            |
|  * POS (offline-first IndexedDB + sync to Supabase)             |
|  * Auto-starts on Windows boot via startup script               |
+------------------------------------------------------------------+
```

### What Works Without the Local Server?

| Feature | Backend OFF | Backend ON |
|---------|:-----------:|:----------:|
| Public website | YES | YES |
| View menu / rooms / blog | YES | YES |
| Submit enquiry form | YES | YES |
| AI Chatbot | YES (Edge Function) | YES |
| Email to admin on enquiry | YES (Edge Function) | YES |
| WhatsApp one-click (admin) | YES | YES |
| Admin panel | NO | YES |
| POS | NO | YES |

---

## 1. Prerequisites

### Install Node.js
1. Download Node.js **v20+** from https://nodejs.org/
2. Run installer, check "Add to PATH"
3. Verify:
   ```powershell
   node --version   # v20.x or v22.x
   npm --version    # 9.x or 10.x
   ```

### Install Git
1. Download from https://git-scm.com/
2. Verify: `git --version`

### Install Supabase CLI (for Edge Functions)
```powershell
npm install -g supabase
supabase --version
```

---

## 2. Local Development Setup

```powershell
cd C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda

# Install dependencies (creates node_modules - takes 1-2 min)
npm install
```

---

## 3. Supabase Cloud Setup

### A. Create Project
1. Go to https://supabase.com -> Sign up (free)
2. Click "New Project"
   - Name: `sharda-palace`
   - Region: Asia South (Mumbai)
3. Wait 2-3 minutes

### B. Get API Keys
Go to Settings -> API. Copy:

| Key | Safe to expose? |
|-----|----------------|
| Project URL (`https://xxxxx.supabase.co`) | YES - just a URL |
| `anon` public key (starts `eyJ...`) | YES - designed to be public, RLS protects data |
| `service_role` key (starts `eyJ...`) | NO - only on your laptop, never in GitHub |

### C. Run Database Schema
1. Supabase Dashboard -> SQL Editor -> New Query
2. Open `supabase/schema.sql`, copy all, paste, click Run
3. Output: "Success. No rows returned" = correct

### D. Run Seed Data
Open `supabase/seed.sql`, paste in SQL Editor, Run.
Creates default admin user.

### E. Migration (if schema already deployed before)
Run in SQL Editor:
```sql
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS item_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS item_summary TEXT;
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
```

---

## 4. Environment Configuration

```powershell
cd C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda
Copy-Item .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...YOUR_SERVICE_ROLE_KEY

# Session Security (generate a random 32+ char string)
# PowerShell: [Convert]::ToBase64String((1..32|%{Get-Random -Max 256}) -as [byte[]])
SESSION_SECRET=RANDOM_32_CHAR_STRING_HERE

# Hotel Info
NEXT_PUBLIC_HOTEL_PHONE=7303584266
NEXT_PUBLIC_HOTEL_WHATSAPP=917303584266
NEXT_PUBLIC_HOTEL_EMAIL=info@shardapalace.in
NEXT_PUBLIC_HOTEL_ADDRESS=Bijnor, Uttar Pradesh

# Port
PORT=3001

# DO NOT ADD GROQ_API_KEY or RESEND_API_KEY here
# These go into Supabase Secrets (Step 8) so they are
# never exposed to the browser or pushed to GitHub.
```

> `.env.local` is in `.gitignore` and will NEVER be pushed to GitHub.

---

## 5. Create Admin User

The seed.sql creates the superadmin account with a **locked placeholder hash** — no default password is stored in the public repo.

After running seed.sql, generate a real password hash by running this in PowerShell:

```powershell
node -e "
  const crypto = require('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const pass = 'YOUR_CHOSEN_PASSWORD';
  const hash = crypto.createHash('sha256').update(salt + ':' + pass).digest('hex');
  console.log(salt + ':' + hash);
"
```

Then run in Supabase SQL Editor:

```sql
UPDATE admin_users
SET password_hash = '<output from above>'
WHERE username = 'superadmin';
```

Until you do this, the superadmin account is **locked** and cannot log in (the placeholder hash never matches).

**Username**: `superadmin`
**Password**: whatever you set above

---

## 6. Run Locally

### Development (hot reload)
```powershell
cd C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda
npm run dev
```
Opens at http://localhost:3001

### Production Mode
```powershell
npm run build
npm start
```

### Admin Panel
http://localhost:3001/admin

---

## 7. Deploy to GitHub Pages

Code is already at: https://github.com/lokgenius-hub/mysharda

### A. Set GitHub Secrets (Required for build to work)

Go to: https://github.com/lokgenius-hub/mysharda/settings/secrets/actions

Click "New repository secret" for each:

| Secret Name | Value |
|------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |

Then click "Variables" tab and add:

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_HOTEL_PHONE` | `7303584266` |
| `NEXT_PUBLIC_HOTEL_WHATSAPP` | `917303584266` |
| `NEXT_PUBLIC_HOTEL_EMAIL` | `info@shardapalace.in` |
| `NEXT_PUBLIC_HOTEL_ADDRESS` | `Bijnor, Uttar Pradesh` |
| `NEXT_PUBLIC_BASE_PATH` | `/mysharda` (or blank if custom domain) |

Why only anon key in GitHub Secrets?
The static site never needs service_role. It reads public data and writes enquiries
using the anon key only. RLS policies block everything sensitive.
service_role stays ONLY in .env.local on your laptop.

### B. Enable GitHub Pages

Go to: https://github.com/lokgenius-hub/mysharda/settings/pages
- Source: GitHub Actions
- Save

### C. Trigger First Build

Go to: https://github.com/lokgenius-hub/mysharda/actions
- Click "Deploy Sharda Palace to GitHub Pages"
- Click "Run workflow" -> Run
- Wait ~2 minutes -> green checkmark

Live URL: https://lokgenius-hub.github.io/mysharda/

### D. Push Future Updates
```powershell
cd C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda
git add .
git commit -m "describe what changed"
git push
# GitHub Actions auto-builds and deploys
```

### E. Custom Domain (Optional)
1. GitHub repo -> Settings -> Pages -> Custom domain: `www.shardapalace.in`
2. At your domain registrar add: CNAME `www` -> `lokgenius-hub.github.io`
3. Set `NEXT_PUBLIC_BASE_PATH` variable to blank
4. Enable Enforce HTTPS

---

## 8. Deploy Supabase Edge Functions

**This enables AI Chatbot + Email to work 24/7 without your laptop.**

Both functions are already written in `supabase/functions/`.

### Step 1 - Login and Link
```powershell
cd C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda

# Login (opens browser)
supabase login

# Find project ref: Supabase Dashboard -> Settings -> General -> Reference ID
supabase link --project-ref YOUR_PROJECT_REF_HERE
```

### Step 2 - Deploy Functions
```powershell
supabase functions deploy chat-ai
supabase functions deploy notify-enquiry
```

### Step 3 - Set Secrets (stored securely in Supabase cloud, never in code)
```powershell
# Groq AI key - get free from https://console.groq.com/keys
supabase secrets set GROQ_API_KEY=gsk_YOUR_GROQ_KEY_HERE

# Resend email key - get free from https://resend.com/api-keys (100 emails/day)
supabase secrets set RESEND_API_KEY=re_YOUR_RESEND_KEY_HERE

# Admin email to receive enquiry notifications
supabase secrets set ADMIN_EMAIL=info@shardapalace.in

# Hotel contact (used in email templates and chatbot fallback)
supabase secrets set HOTEL_PHONE=7303584266
supabase secrets set HOTEL_WHATSAPP=917303584266
```

Verify secrets are saved:
```powershell
supabase secrets list
```

### How the Chatbot Calls the Edge Function

```
Browser (ChatBot.tsx on GitHub Pages)
     |
     |  POST https://YOUR_PROJECT.supabase.co/functions/v1/chat-ai
     |  Header: Authorization: Bearer ANON_KEY  <- safe, designed to be public
     |
     v
Supabase Edge Function (chat-ai/index.ts)
     |  reads GROQ_API_KEY from Supabase Secrets <- never leaves Supabase
     |
     v
Groq API -> AI response -> back to browser
```

The GROQ key is NEVER in the browser, NEVER in GitHub repo, NEVER in .env.local (for production).

### Get AI Keys

Groq (Recommended - fastest, most generous free tier):
1. https://console.groq.com -> Sign up free
2. API Keys -> Create API Key (starts with `gsk_`)
3. `supabase secrets set GROQ_API_KEY=gsk_...`

Google Gemini (alternative):
1. https://aistudio.google.com -> Get API Key
2. `supabase secrets set GOOGLE_AI_API_KEY=YOUR_KEY`

OpenRouter (alternative free models):
1. https://openrouter.ai -> Sign up -> Keys
2. `supabase secrets set OPENROUTER_API_KEY=sk-or-YOUR_KEY`

> If no AI key is set, the chatbot shows smart keyword-based answers. No errors to users.

---

## 9. Set Up Email Webhook

This makes Supabase call `notify-enquiry` automatically on every new enquiry insert.
Works even when your laptop is off.

1. Supabase Dashboard -> **Database -> Webhooks**
2. Click "Create a new hook"
3. Fill in:
   - **Name**: `notify-enquiry`
   - **Table**: `enquiries`
   - **Events**: INSERT only (uncheck UPDATE and DELETE)
   - **Type**: Supabase Edge Functions
   - **Edge Function**: `notify-enquiry`
4. Create webhook

Every enquiry from anywhere -> automatic email to admin. Done.

---

## 10. Auto-Start on Boot (Windows)

So admin panel is available whenever you are at the hotel.

### Method A: Built-in script
```powershell
cd C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda
.\startup\add-startup.ps1
```

### Method B: Task Scheduler (more reliable, survives restarts)
```powershell
$action = New-ScheduledTaskAction `
  -Execute "cmd.exe" `
  -Argument '/c cd /d "C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda" && npm start'
$trigger = New-ScheduledTaskTrigger -AtLogon
Register-ScheduledTask `
  -TaskName "ShardaPalace" `
  -Action $action `
  -Trigger $trigger `
  -RunLevel Highest `
  -Description "Sharda Palace admin server"
```

Reboot once to verify it auto-starts. Then check http://localhost:3001

---

## 11. How Frontend <-> Supabase Works (No Backend)

### .env.local is ONLY for your local laptop

```
Your laptop               GitHub Actions build         Visitor's Browser
================          ====================         =================
.env.local                GitHub Secrets               JS bundle (baked in)

NEXT_PUBLIC_SUPABASE_URL ----copied to---> NEXT_PUBLIC_* --build--> hardcoded in JS
NEXT_PUBLIC_ANON_KEY

SERVICE_ROLE_KEY <-- stays here only, never goes to GitHub or browser
SESSION_SECRET   <-- stays here only
GROQ_API_KEY     <-- goes to Supabase Secrets only, NOT here for production
RESEND_API_KEY   <-- goes to Supabase Secrets only, NOT here for production
```

When a visitor opens the GitHub Pages site:
1. Browser downloads static JS/HTML from GitHub Pages
2. The JS already CONTAINS the Supabase URL and anon key (baked in at build time)
3. Browser connects DIRECTLY to https://YOUR_PROJECT.supabase.co
4. Supabase checks RLS policies and returns allowed data
5. Your laptop is NOT in this chain at all

### Why the anon key being public is safe

The anon key is like a library card. The librarian (RLS policies) controls what you see:

```sql
-- Public can read active menu items only
CREATE POLICY "public_read_menu" ON menu_items
  FOR SELECT USING (is_active = TRUE);

-- Public can INSERT enquiries but cannot READ them
CREATE POLICY "public_insert_enquiry" ON enquiries
  FOR INSERT WITH CHECK (TRUE);
-- No SELECT policy = anon key cannot read any enquiry

-- admin_users, pos_orders etc = NO public policy = completely blocked
```

service_role bypasses all RLS = that is why it never leaves your laptop.

---

## 12. Troubleshooting

### Port 3001 already in use
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
npm start
```

### node_modules errors
```powershell
cd C:\Users\suyas\OneDrive\Desktop\Test\customers\sharda
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Build fails
```powershell
npx next build 2>&1 | Select-Object -Last 30
```

### Supabase connection fails (locally)
1. Check .env.local has correct URL and keys (no spaces, no quotes around values)
2. Free tier projects PAUSE after 1 week of no activity
   -> Go to Supabase Dashboard and click "Resume project"
3. Check terminal for [Supabase Server] error messages when running npm run dev

### GitHub Pages shows 404
1. Settings -> Pages -> Source must be "GitHub Actions" (not "Deploy from branch")
2. Actions tab -> look for red X in the build -> click to see error
3. If URL is lokgenius-hub.github.io/mysharda/ then NEXT_PUBLIC_BASE_PATH must be /mysharda
4. If custom domain, NEXT_PUBLIC_BASE_PATH must be blank

### Chatbot not responding on GitHub Pages
```powershell
# Check functions are deployed
supabase functions list

# Check secrets are set
supabase secrets list
```
Also check: Supabase Dashboard -> Edge Functions -> chat-ai -> Logs

### Email not arriving
1. Check webhook: Supabase Dashboard -> Database -> Webhooks
2. Check function logs: Edge Functions -> notify-enquiry -> Logs
3. Check spam folder
4. Verify ADMIN_EMAIL secret is correct: `supabase secrets list`
5. Resend free tier sender is `onboarding@resend.dev` - check if domain is verified

### Admin login does not work
```sql
-- Run in Supabase SQL Editor
SELECT username, role, is_active FROM admin_users;
```
- Ensure is_active = true
- Ensure SESSION_SECRET is in .env.local
- Restart local server after any .env.local change: Ctrl+C then npm start

### Edge Function CORS error
```powershell
supabase functions deploy chat-ai --no-verify-jwt
```
