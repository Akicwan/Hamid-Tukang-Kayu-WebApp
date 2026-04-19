'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '../../../components/Navbar'
import { FiCalendar, FiArrowLeft, FiExternalLink, FiSearch } from 'react-icons/fi'

interface NewsEvent {
  postID: string
  title: string
  content: string
  date: string
  fb_link?: string
  image_urls?: string[]
  created_at?: string
}

export default function NewsDetailPage() {
  const params = useParams()
  const postID = params.postID as string

  const [post, setPost] = useState<NewsEvent | null>(null)
  const [recentPosts, setRecentPosts] = useState<NewsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!postID) return

    async function fetchData() {
      setLoading(true)

      const { data: postData, error: postError } = await supabase
        .from('NewsEvent')
        .select('*')
        .eq('postID', postID)
        .single()

      const { data: recentData } = await supabase
        .from('NewsEvent')
        .select('*')
        .order('date', { ascending: false })

      if (!postError && postData) setPost(postData)
      if (recentData) setRecentPosts(recentData)

      setLoading(false)
    }

    fetchData()
  }, [postID])

  const filteredRecentPosts = recentPosts
    .filter((item) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q)
      )
    })
    .filter((item) => item.postID !== postID)
    .slice(0, 5)

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
                {filteredRecentPosts.map((item) => (
                  <li key={item.postID}>
                    <Link
                      href={`/news/${item.postID}`}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-all"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1">
            {loading ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-stone-100 p-10">
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-stone-100 rounded w-2/3"></div>
                  <div className="h-5 bg-stone-100 rounded w-1/4"></div>
                  <div className="h-96 bg-stone-100 rounded-2xl"></div>
                  <div className="h-4 bg-stone-100 rounded"></div>
                  <div className="h-4 bg-stone-100 rounded"></div>
                  <div className="h-4 bg-stone-100 rounded w-5/6"></div>
                </div>
              </div>
            ) : !post ? (
              <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-stone-100">
                <p className="text-stone-400 font-serif italic">Post not found.</p>
              </div>
            ) : (
              <article className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm">
                {post.image_urls && post.image_urls.length > 0 ? (
                  <div className="overflow-hidden">
                    <img
                      src={post.image_urls[0]}
                      alt={post.title}
                      className="w-full h-[320px] md:h-[460px] object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[320px] md:h-[460px] bg-stone-100 flex items-center justify-center text-stone-400 text-sm">
                    No image available
                  </div>
                )}

                <div className="p-6 md:p-10">
                  <Link
                    href="/news"
                    className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-amber-700 transition mb-6"
                  >
                    <FiArrowLeft size={16} />
                    Back to News
                  </Link>

                  <div className="flex items-center gap-2 text-stone-400 text-[11px] font-bold uppercase tracking-widest mb-4">
                    <FiCalendar />
                    {new Date(post.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>

                  <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#3d2b1f] mb-6 leading-tight">
                    {post.title}
                  </h1>

                  <div className="text-stone-700 leading-8 whitespace-pre-line text-[15px] md:text-base">
                    {post.content}
                  </div>

                  {post.image_urls && post.image_urls.length > 1 && (
                    <div className="mt-10">
                      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">
                        Gallery
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {post.image_urls.slice(1).map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`${post.title} ${index + 2}`}
                            className="w-full h-64 object-cover rounded-2xl border border-stone-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {post.fb_link && (
                    <div className="mt-10 pt-6 border-t border-stone-100">
                      <a
                        href={post.fb_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border border-stone-700 px-5 py-2 text-xs uppercase tracking-widest hover:bg-stone-800 hover:text-white transition"
                      >
                        View Facebook Post
                        <FiExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>
              </article>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}