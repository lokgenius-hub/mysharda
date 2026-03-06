import { getPublicBlogPosts } from '@/lib/supabase-public'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = { title: 'Blog | Sharda Palace', description: 'Latest news, travel tips, and stories from Sharda Palace, Vrindavan.' }

export default async function BlogPage() {
  const posts = await getPublicBlogPosts()

  return (
    <main className="pt-20">
      <section className="relative py-24 bg-gradient-to-b from-black to-[#0f0f23] text-center">
        <p className="text-[#c9a84c] text-sm tracking-[0.3em] uppercase mb-3">Stories & Updates</p>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Our Blog</h1>
        <p className="text-white/50 text-lg">Travel tips, local stories, and hospitality insights</p>
      </section>

      <section className="py-16 container mx-auto px-4">
        {posts.length === 0 ? (
          <div className="text-center text-white/30 py-20">
            <p className="text-6xl mb-4">📝</p>
            <p>Blog posts coming soon</p>
            <p className="text-sm mt-2">Add posts from the Admin → Blog section</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(posts as Array<{id:string;slug:string;title:string;excerpt?:string;cover_image?:string;category?:string;published_at:string}>).map(post => (
              <article key={post.id} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-[#c9a84c]/20 transition-all group">
                <div className="aspect-video bg-gradient-to-br from-[#c9a84c]/10 to-transparent relative flex items-center justify-center">
                  {post.cover_image ? (
                    <Image src={post.cover_image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl">📰</span>
                  )}
                </div>
                <div className="p-5">
                  {post.category && (
                    <span className="text-[#c9a84c] text-xs tracking-widest uppercase">{post.category}</span>
                  )}
                  <h2 className="text-white/90 font-serif font-semibold text-lg mt-1 mb-2 line-clamp-2">{post.title}</h2>
                  {post.excerpt && <p className="text-white/40 text-sm line-clamp-3">{post.excerpt}</p>}
                  <p className="text-white/25 text-xs mt-3">{new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
