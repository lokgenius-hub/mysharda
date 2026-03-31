'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPublicBlogPosts, getPublicBlogPostBySlug } from '@/lib/supabase-public'
import { useSiteImages } from '@/lib/use-site-images'
import Image from 'next/image'
import EditableImage from '@/components/EditableImage'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronLeft, X, Calendar, Tag } from 'lucide-react'

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt?: string
  content?: string
  cover_image?: string
  category?: string
  published_at: string
}

export default function BlogPage() {
  const { images } = useSiteImages()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activePost, setActivePost] = useState<BlogPost | null>(null)
  const [postLoading, setPostLoading] = useState(false)

  useEffect(() => {
    getPublicBlogPosts()
      .then((data) => setPosts(data as BlogPost[]))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const openPost = useCallback(async (slug: string) => {
    setPostLoading(true)
    setActivePost(null)
    const cached = posts.find(p => p.slug === slug)
    if (cached?.content !== undefined) {
      setActivePost(cached)
      setPostLoading(false)
    } else {
      const full = await getPublicBlogPostBySlug(slug)
      setActivePost(full as BlogPost | null)
      setPostLoading(false)
    }
  }, [posts])

  const closePost = useCallback(() => setActivePost(null), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closePost() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closePost])

  useEffect(() => {
    document.body.style.overflow = (activePost || postLoading) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activePost, postLoading])

  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="relative h-[45vh] min-h-[380px] flex items-end overflow-hidden">
          <EditableImage
            imageKey="heroBlog"
            src={images.heroBlog}
            alt="Blog" fill priority className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-black/50 to-black/20" />
          <div className="relative z-10 w-full pb-12 px-4">
            <div className="max-w-7xl mx-auto">
              <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--primary)] text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </Link>
              <p className="text-[var(--primary)] text-xs uppercase tracking-[0.3em] mb-2">Stories & Updates</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Our Blog</h1>
              <p className="text-white/50 text-lg mt-3">Travel tips, local stories, and hospitality insights</p>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center text-white/30 py-20">
                <p className="text-6xl mb-4">📝</p>
                <p>Blog posts coming soon</p>
                <p className="text-sm mt-2">Add posts from the Admin → Blog section</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                  <article
                    key={post.id}
                    onClick={() => openPost(post.slug)}
                    className="glass rounded-2xl overflow-hidden hover:border-[var(--primary)]/30 transition-all group hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="aspect-video bg-gradient-to-br from-[var(--primary)]/10 to-transparent relative flex items-center justify-center overflow-hidden">
                      {post.cover_image ? (
                        <Image src={post.cover_image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <span className="text-4xl">📰</span>
                      )}
                    </div>
                    <div className="p-5">
                      {post.category && (
                        <span className="text-[var(--primary)] text-xs tracking-widest uppercase">{post.category}</span>
                      )}
                      <h2 className="text-white/90 font-bold text-lg mt-1 mb-2 line-clamp-2" style={{ fontFamily: 'Playfair Display, serif' }}>{post.title}</h2>
                      {post.excerpt && <p className="text-white/40 text-sm line-clamp-3">{post.excerpt}</p>}
                      <p className="text-white/25 text-xs mt-3">{new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="text-[var(--primary)] text-xs mt-2 font-medium">Read more →</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />

      {/* BLOG POST DETAIL OVERLAY */}
      {(postLoading || activePost) && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closePost() }}
        >
          <div className="relative w-full max-w-3xl bg-[var(--bg-card)] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={closePost}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {postLoading ? (
              <div className="flex justify-center items-center py-32">
                <div className="w-10 h-10 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
              </div>
            ) : activePost && (
              <>
                {activePost.cover_image && (
                  <div className="relative w-full" style={{ height: '320px' }}>
                    <Image src={activePost.cover_image} alt={activePost.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
                  </div>
                )}
                <div className="p-6 md:p-10">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {activePost.category && (
                      <span className="flex items-center gap-1 text-[var(--primary)] text-xs tracking-widest uppercase">
                        <Tag className="w-3 h-3" /> {activePost.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-white/30 text-xs">
                      <Calendar className="w-3 h-3" />
                      {new Date(activePost.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {activePost.title}
                  </h1>
                  {activePost.excerpt && (
                    <p className="text-white/60 text-lg leading-relaxed border-l-2 border-[var(--primary)] pl-4 mb-6 italic">
                      {activePost.excerpt}
                    </p>
                  )}
                  {activePost.content ? (
                    <div className="text-white/75 leading-relaxed whitespace-pre-wrap text-base">
                      {activePost.content}
                    </div>
                  ) : (
                    <p className="text-white/30 text-sm italic">No content available for this post.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
