'use client'
import { useEffect, useState, useCallback } from 'react'
import { BookOpen, Plus, Pencil, X, Save, Eye, EyeOff } from 'lucide-react'

interface BlogPost { id: string; title: string; slug: string; excerpt?: string; content?: string; category?: string; status: 'draft'|'published'; published_at?: string; created_at: string }
const blank = (): Partial<BlogPost> => ({ title: '', slug: '', excerpt: '', content: '', category: 'news', status: 'draft' })

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/blog')
    if (r.ok) { const d = await r.json(); setPosts(d.posts ?? []) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const save = async () => {
    if (!editing) return; setSaving(true)
    const method = isNew ? 'POST' : 'PUT'
    const body = { ...editing, published_at: editing.status === 'published' ? new Date().toISOString() : null }
    await fetch('/api/admin/blog', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false); setEditing(null); load()
  }

  const togglePublish = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    await fetch('/api/admin/blog', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...post, status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null }) })
    load()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#c9a84c]" /> Blog Posts</h1>
        <button onClick={() => { setEditing(blank()); setIsNew(true) }} className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black rounded-xl text-sm font-semibold hover:bg-[#d4af5a] transition-colors">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>
      {loading ? <div className="text-white/30 text-center py-10">Loading...</div> : (
        <div className="space-y-2">
          {posts.map(p => (
            <div key={p.id} className="flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
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
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 w-full max-w-2xl space-y-3 max-h-[90vh] overflow-y-auto">
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
            <textarea value={editing.content ?? ''} onChange={e => setEditing(p => ({ ...p, content: e.target.value }))} placeholder="Full article content..."
              rows={8} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none resize-none" />
            <div className="flex gap-3">
              <input value={editing.category ?? ''} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))} placeholder="Category"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" />
              <select value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value as 'draft'|'published' }))} className="bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-xl bg-[#c9a84c] text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
