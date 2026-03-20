'use client'

import { useState, useEffect } from 'react'
import { getPublicBlogPosts } from '@/lib/supabase-public'
import { useSiteImages } from '@/lib/use-site-images'
import Image from 'next/image'
import EditableImage from '@/components/EditableImage'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronLeft } from 'lucide-react'

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt?: string
  cover_image?: string
  category?: string
  published_at: string
}

export default function BlogPage() {
  const { images } = useSiteImages()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicBlogPosts()
      .then((data) => setPosts(data as BlogPost[]))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

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
                  <article key={post.id} className="glass rounded-2xl overflow-hidden hover:border-[var(--primary)]/20 transition-all group hover:-translate-y-1">
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
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
