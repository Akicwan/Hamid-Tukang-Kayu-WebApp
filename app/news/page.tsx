'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { FiSearch, FiFileText } from 'react-icons/fi'
import Footer from '../../components/Footer'

interface NewsEvent {
  postID: string
  title: string
  content: string
  date: string
  fb_link?: string
  image_urls?: string[]
  created_at?: string
}

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsEvent[]>([])
  const [filteredPosts, setFilteredPosts] = useState<NewsEvent[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)

      const { data, error } = await supabase
        .from('NewsEvent')
        .select('*')
        .order('date', { ascending: false })

      if (data) {
        setPosts(data)
        setFilteredPosts(data)
      }

      if (error) {
        console.error(error.message)
      }

      setLoading(false)
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    let result = posts

    if (searchQuery) {
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPosts(result)
  }, [searchQuery, posts])

  const recentPosts = posts.slice(0, 5)

  return (
    <div className="bg-[#fcfaf8] min-h-screen font-sans">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#3d2b1f] py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">News & Events</h1>
          <p className="text-amber-200/80 italic font-light tracking-widest uppercase text-xs">
            Stories, Updates & Highlights from Hamid Tukang Kayu
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">
                Search
              </h3>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Find a post..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:border-amber-700 outline-none transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">
                Recent Posts
              </h3>
              <ul className="space-y-2">
                {recentPosts.map((post) => (
                  <li key={post.postID}>
                    <Link
                      href={`/news/${post.postID}`}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-all"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* News List */}
          <section className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <p className="text-stone-400 text-sm font-medium">
                Showing <span className="text-[#3d2b1f] font-bold">{filteredPosts.length}</span> results
              </p>
              <div className="flex items-center gap-2 text-stone-500">
                <FiFileText size={14} />
                <span className="text-xs font-bold uppercase tracking-tighter">Latest Articles</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-96 bg-stone-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-stone-100">
                <p className="text-stone-400 font-serif italic">No news found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
                {filteredPosts.map((post) => (
                  <article
                    key={post.postID}
                    className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <Link href={`/news/${post.postID}`}>
                      <div className="overflow-hidden">
                        {post.image_urls && post.image_urls.length > 0 ? (
                          <img
                            src={post.image_urls[0]}
                            alt={post.title}
                            className="w-full h-64 object-cover hover:scale-[1.03] transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-64 bg-stone-100 flex items-center justify-center text-stone-400 text-sm">
                            No image available
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-6">
                      <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-3 font-bold">
                        {new Date(post.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>

                      <Link href={`/news/${post.postID}`}>
                        <h2 className="text-2xl font-serif font-bold text-[#3d2b1f] mb-3 hover:text-amber-700 transition">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="text-stone-600 text-sm leading-7 mb-6">
                        {post.content.length > 180
                          ? `${post.content.slice(0, 180)}...`
                          : post.content}
                      </p>

                      <Link
                        href={`/news/${post.postID}`}
                        className="inline-block border border-stone-700 px-5 py-2 text-xs uppercase tracking-widest hover:bg-stone-800 hover:text-white transition"
                      >
                        Read More
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}