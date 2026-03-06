# Image Strategy — HospiFlow / Sharda Palace

## Decision: **Image URLs** (not file uploads)

### Why URLs over File Uploads?

| Factor | Image URLs ✅ | File Upload ❌ |
|--------|--------------|----------------|
| GitHub Pages compatible | Yes — static export works | No — needs server for upload |
| Complexity | Low — just store a URL string | High — needs storage, resize, CDN |
| Database impact | Tiny — just a TEXT column | Large — binary data or storage refs |
| Speed | Images served from CDN directly | Needs proxy or storage bucket |
| Offline POS | No impact | No impact |
| Cost | Free (use existing hosting) | May need paid storage |

---

## How It Works

### For Admin-Uploaded Images (Menu, Rooms, Gallery, Blog)

**Option A: Supabase Storage (Recommended)**
1. Go to Supabase Dashboard → Storage → Create bucket: `images`
2. Set bucket to **Public** 
3. Upload images via Supabase Dashboard or use the built-in admin image upload
4. Copy the public URL: `https://YOUR_PROJECT.supabase.co/storage/v1/object/public/images/photo.jpg`
5. Paste the URL in admin panel (menu item, room, gallery, etc.)

**Option B: External Hosting (Cloudinary, ImgBB, etc.)**
1. Upload image to any free image host
2. Copy the direct URL
3. Paste in admin panel

**Option C: GitHub Repo (for static assets)**
1. Put images in `public/images/` folder
2. Reference as `/images/photo.jpg`
3. Gets deployed with GitHub Pages automatically

### For Dynamic Images (uploaded by admin at runtime)
- Use **Supabase Storage** — it's included free (1GB on free tier)
- The admin Images page already supports URL input
- For actual file upload, we can add a Supabase Storage upload later if needed

---

## Database Schema (already in place)

```sql
-- All image references are TEXT (URL) columns:
menu_items.image_url    TEXT
rooms.image_url         TEXT  
site_images.url         TEXT
blog_posts.cover_image  TEXT
travel_packages.image_url TEXT
```

---

## Recommended Workflow for Admin

1. **Take/select photo** on phone
2. **Upload to Supabase Storage** (or any image host)
3. **Copy URL** 
4. **Paste in admin panel** when adding/editing menu items, rooms, etc.

This keeps the system simple, fast, and compatible with both GitHub Pages (static) and local server modes.
