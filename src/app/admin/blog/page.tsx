'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { BookOpen, Plus, Pencil, X, Save, Eye, EyeOff, Upload, Image as ImageIcon } from 'lucide-react'
import { adminListAll, adminInsert, adminUpdate, getSupabaseAdmin } from '@/lib/supabase-admin-client'

interface BlogPost { id: string; title: string; slug: string; excerpt?: string; content?: string; cover_image?: string; category?: string; status: 'draft'|'published'; published_at?: string; created_at: string }
const blank = (): Partial<BlogPost> => ({ title: '', slug: '', excerpt: '', content: '', cover_image: '', category: 'news', status: 'draft' })

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imgUploading, setImgUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const uploadCoverImage = async (file: File) => {
    setImgUploading(true)
    try {
      const sb = getSupabaseAdmin()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `blog-${Date.now()}.${ext}`
      const { error } = await sb.storage.from('site-images').upload(filename, file, { contentType: file.type, upsert: true })
      if (error) throw error
      const { data } = sb.storage.from('site-images').getPublicUrl(filename)
      setEditing(p => ({ ...p, cover_image: data.publicUrl }))
    } catch (e) { alert('Upload failed: ' + (e instanceof Error ? e.message : 'Unknown')) }
    setImgUploading(false)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminListAll('blog_posts', 'created_at')
      setPosts(data as BlogPost[])
    } catch { /* empty */ }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const save = async () => {
    if (!editing) return; setSaving(true)
    const payload = { ...editing, published_at: editing.status === 'published' ? new Date().toISOString() : null }
    try {
      if (isNew) {
        await adminInsert('blog_posts', payload)
      } else {
        await adminUpdate('blog_posts', editing.id as string, payload)
      }
    } catch { /* empty */ }
    setSaving(false); setEditing(null); load()
  }

  const togglePublish = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    try { await adminUpdate('blog_posts', post.id, { status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null }) } catch { /* empty */ }
    load()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-[var(--primary)]" /> Blog Posts</h1>
        <button onClick={() => { setEditing(blank()); setIsNew(true) }} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black rounded-xl text-sm font-semibold hover:bg-[#d4af5a] transition-colors">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>
      {loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
        <div className="space-y-2">
          {posts.map(p => (
            <div key={p.id} className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              {p.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover_image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0 border border-white/10" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5 text-white/20" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-white/90 font-medium text-sm">{p.title}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${p.status === 'published' ? 'bg-green-500/15 text-green-400' : 'bg-white/10 text-white/40'}`}>{p.status}</span>
                </div>
                <p className="text-white/30 text-xs">/{p.slug} · {p.category} · {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => togglePublish(p)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg">
                  {p.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { setEditing({ ...p }); setIsNew(false) }} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {!posts.length && <div className="text-white/30 text-center py-10">No posts yet. Write your first one!</div>}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-5 w-full max-w-2xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">{isNew ? 'New Post' : 'Edit Post'}</h2>
              <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <input value={editing.title ?? ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value, slug: isNew ? autoSlug(e.target.value) : p?.slug }))} placeholder="Post Title"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
            <input value={editing.slug ?? ''} onChange={e => setEditing(p => ({ ...p, slug: e.target.value }))} placeholder="URL Slug (e.g. my-post-title)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
            <input value={editing.excerpt ?? ''} onChange={e => setEditing(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short excerpt (shown in cards)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />

            {/* Cover Image */}
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Cover Image</label>
              {editing.cover_image && (
                <div className="relative mb-2 rounded-xl overflow-hidden" style={{ height: '140px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editing.cover_image} alt="cover" className="w-full h-full object-cover" />
                  <button onClick={() => setEditing(p => ({ ...p, cover_image: '' }))}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white/70 hover:text-white flex items-center justify-center text-xs">✕</button>
                </div>
              )}
              <div className="flex gap-2">
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadCoverImage(f) }} />
                <button onClick={() => fileRef.current?.click()} disabled={imgUploading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-xl text-xs hover:text-white hover:border-white/25 transition-colors disabled:opacity-50">
                  {imgUploading ? <><span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</> : <><Upload className="w-3.5 h-3.5" /> Upload Image</>}
                </button>
                <input value={editing.cover_image ?? ''} onChange={e => setEditing(p => ({ ...p, cover_image: e.target.value }))}
                  placeholder="Or paste image URL…"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none" />
              </div>
            </div>
            <textarea value={editing.content ?? ''} onChange={e => setEditing(p => ({ ...p, content: e.target.value }))} placeholder="Full article content..."
              rows={8} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none resize-none" />
            <div className="flex gap-3">
              <input value={editing.category ?? ''} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))} placeholder="Category"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
              <select value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value as 'draft'|'published' }))} className="bg-[var(--bg-card)] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
