'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '../components/Navbar'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import Slideshow from '../components/Slideshow'
import Link from 'next/link'
import Footer from '../components/Footer'

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface NewsEvent {
  postID: string;
  title: string;
  content: string;
  date: string;
  fb_link?: string;
}

const categories = ['Dining Room', 'Living Room', 'Bedroom', 'Cabinet']

export default function Home() {
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({})
  const [announcements, setAnnouncements] = useState<NewsEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      const { data: productData } = await supabase
        .from('products')
        .select('id, name, price, category, image')

      const { data: newsData } = await supabase
        .from('NewsEvent')
        .select('postID, title, content, date, fb_link')
        .order('date', { ascending: false })
        .limit(3)

      if (productData) {
        const grouped = productData.reduce((acc: Record<string, Product[]>, product: Product) => {
          if (!acc[product.category]) acc[product.category] = []
          acc[product.category].push(product)
          return acc
        }, {})
        setProductsByCategory(grouped)
      }

      if (newsData) {
        setAnnouncements(newsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    // Background updated to #f5efe6 to match Admin Page
    <div className="min-h-screen font-sans bg-gradient-to-b from-[#f8f3ec] via-[#f5efe6] to-[#f2eadf]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 space-y-16 md:space-y-24">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2rem] shadow-[0_20px_60px_rgba(61,43,31,0.18)] border border-white/20">
          <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center" aria-hidden="true" />
          <div className="relative bg-gradient-to-br from-[#2d1e15]/90 via-[#3d2b1f]/85 to-[#4d3627]/80 p-8 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center text-white backdrop-blur-sm">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold leading-[1.05] text-white tracking-tight">
                Hamid Tukang Kayu.<br/>
                <span className="text-amber-400 font-serif">WoodWork With Class.</span>
              </h2>
              <p className="text-stone-200/95 text-base md:text-lg leading-relaxed max-w-xl">
                Founded in 1952 by Tuan Haji Abdul Hamid Bin Ahmad, we are Batu Pahat's 
                premier Bumiputra-owned furniture workshop.
              </p>
              <div className="w-20 h-1 bg-amber-500 rounded-full" />
              <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-500 text-[#2d1e15] font-bold text-sm uppercase tracking-wider hover:bg-amber-400 transition-all shadow-md"
            >
              Explore Products
            </Link>
            <Link
              href="/news-events"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 bg-white/10 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/15 transition-all"
            >
              Latest Updates
            </Link>
            </div>
            </div>
            <div className="rounded-[1.75rem] overflow-hidden shadow-2xl ring-1 ring-white/20 bg-white/5 backdrop-blur-sm">
              <Slideshow />
            </div>
          </div>
        </section>

        {/* News & Events Section (Text-Focused) */}
        <section>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-8 border-b border-[#3d2b1f]/10 pb-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#3d2b1f] uppercase tracking-wider">
                News & Events
              </h2>
              <p className="text-stone-500 text-sm italic font-medium">Stay updated with our latest craftsmanship projects</p>
            </div>
            <Link 
              href="/news-events" 
              className="text-sm font-bold text-amber-800 hover:text-amber-900 transition-colors uppercase tracking-widest"
            >
              All News &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-56 bg-white/60 rounded-3xl animate-pulse border border-amber-100" />)
            ) : announcements.length > 0 ? (
              announcements.map((news) => (
                <div key={news.postID} className="bg-white/95 backdrop-blur-sm p-7 rounded-3xl shadow-sm border border-amber-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                   <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-3">
                     {new Date(news.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                   </p>
                   <h3 className="text-xl font-serif font-bold text-[#3d2b1f] mb-3 line-clamp-2 leading-snug">{news.title}</h3>
                   <p className="text-stone-500 text-sm leading-relaxed line-clamp-4 mb-5 font-medium">{news.content}</p>
                   <div className="flex flex-wrap gap-3 pt-1">
                    <Link
                      href="/news-events"
                      className="text-[10px] font-black text-[#3d2b1f] uppercase tracking-tighter hover:text-amber-700 transition-colors"
                    >
                      Read Details
                    </Link>

                    {news.fb_link && (
                      <a
                        href={news.fb_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline"
                      >
                        View on Facebook
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-stone-400 italic col-span-full text-center py-14 font-medium bg-white/70 rounded-3xl border border-amber-100">
                No recent updates available.
              </p>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-white/85 backdrop-blur-md p-8 md:p-10 rounded-[2rem] border border-amber-100 shadow-sm">
          <h2 className="text-xl font-serif font-bold text-[#3d2b1f] mb-8 uppercase text-center tracking-widest">
            Browse by Collection
          </h2>
          <p className="text-center text-stone-500 text-sm md:text-base max-w-2xl mx-auto mb-8">
            Discover handcrafted collections tailored for every space, from classic dining sets to bespoke cabinetry.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map(cat => (
              <CategoryCard key={cat} name={cat} />
            ))}
          </div>
        </section>

        {/* Product Previews */}
        <div className="space-y-16 pb-20">
          {categories.map(category => {
            const categoryProducts = productsByCategory[category] || []
            if (categoryProducts.length === 0 && !loading) return null

            return (
              <section key={category} className="group bg-white/55 backdrop-blur-sm rounded-[2rem] border border-amber-100 p-6 md:p-8 shadow-sm">
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-8 border-b border-[#3d2b1f]/10 pb-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#3d2b1f] tracking-tight">
                      {category}
                    </h2>
                    <p className="text-stone-500 text-sm md:text-base italic font-medium">
                      Curated {category.toLowerCase()} masterpieces
                    </p>
                  </div>
                  <Link 
                    href={`/products?category=${category}`}
                    className="text-sm font-bold text-amber-800 hover:text-amber-900 transition-colors uppercase tracking-widest"
                  >
                    View Collection &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryProducts.slice(0, 3).map(product => (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      price={product.price}
                      image={product.image}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </main>
      <Footer />
    </div>
  )
}