import { getPublicBlogPosts } from '@/lib/supabase-public'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'Blog | Sharda Palace', description: 'Latest news, travel tips, and stories from Sharda Palace, Vrindavan.' }

export default async function BlogPage() {
  const posts = await getPublicBlogPosts().catch(() => [])

  return (
    <>
      <Navbar />
      <main>

        {/* HERO */}
        <section className="relative h-[45vh] min-h-[380px] flex items-end overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&q=80"
            alt="Blog" fill priority className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23] via-black/50 to-black/20" />
          <div className="relative z-10 w-full pb-12 px-4">
            <div className="max-w-7xl mx-auto">
              <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#c9a84c] text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </Link>
              <p className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] mb-2">Stories & Updates</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Our Blog</h1>
              <p className="text-white/50 text-lg mt-3">Travel tips, local stories, and hospitality insights</p>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {posts.length === 0 ? (
              <div className="text-center text-white/30 py-20">
                <p className="text-6xl mb-4">📝</p>
                <p>Blog posts coming soon</p>
                <p className="text-sm mt-2">Add posts from the Admin → Blog section</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(posts as Array<{id:string;slug:string;title:string;excerpt?:string;cover_image?:string;category?:string;published_at:string}>).map(post => (
                  <article key={post.id} className="glass rounded-2xl overflow-hidden hover:border-[#c9a84c]/20 transition-all group hover:-translate-y-1">
                    <div className="aspect-video bg-gradient-to-br from-[#c9a84c]/10 to-transparent relative flex items-center justify-center overflow-hidden">
                      {post.cover_image ? (
                        <Image src={post.cover_image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <span className="text-4xl">📰</span>
                      )}
                    </div>
                    <div className="p-5">
                      {post.category && (
                        <span className="text-[#c9a84c] text-xs tracking-widest uppercase">{post.category}</span>
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
