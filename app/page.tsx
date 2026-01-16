'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '../components/Navbar'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import Slideshow from '../components/Slideshow'
import Link from 'next/link'

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
        .select('postID, title, content, date')
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
    <div className="bg-[#f5efe6] min-h-screen font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-20">

        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center" aria-hidden="true" />
          <div className="relative bg-[#3d2b1f]/80 p-10 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-white backdrop-blur-sm">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-white">
                Hamid Tukang Kayu.<br/>
                <span className="text-amber-400 font-serif">WoodWork With Class.</span>
              </h2>
              <p className="text-stone-200 text-lg leading-relaxed max-w-lg">
                Founded in 1952 by Tuan Haji Abdul Hamid Bin Ahmad, we are Batu Pahat's 
                premier Bumiputra-owned furniture workshop.
              </p>
              <div className="w-20 h-1 bg-amber-500 rounded-full" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl ring-8 ring-white/10">
              <Slideshow />
            </div>
          </div>
        </section>

        {/* News & Events Section (Text-Focused) */}
        <section>
          <div className="flex justify-between items-end mb-8 border-b border-[#3d2b1f]/10 pb-4">
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
              [1, 2, 3].map(i => <div key={i} className="h-48 bg-white/50 rounded-2xl animate-pulse" />)
            ) : announcements.length > 0 ? (
              announcements.map((news) => (
                <div key={news.postID} className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
                   <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-3">
                     {new Date(news.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                   </p>
                   <h3 className="text-lg font-serif font-bold text-[#3d2b1f] mb-3 line-clamp-2 leading-tight">{news.title}</h3>
                   <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 mb-5 font-medium">{news.content}</p>
                   <Link href="/news-events" className="text-[10px] font-black text-[#3d2b1f] uppercase tracking-tighter hover:text-amber-700 transition-colors">
                     Read Details
                   </Link>
                </div>
              ))
            ) : (
              <p className="text-stone-400 italic col-span-full text-center py-10 font-medium">No recent updates available.</p>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-white/80 backdrop-blur-sm p-10 rounded-3xl border border-amber-100 shadow-sm">
          <h2 className="text-xl font-serif font-bold text-[#3d2b1f] mb-8 uppercase text-center tracking-widest">
            Browse by Collection
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
              <section key={category} className="group">
                <div className="flex justify-between items-end mb-8 border-b border-[#3d2b1f]/10 pb-4">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#3d2b1f]">{category}</h2>
                    <p className="text-stone-500 text-sm italic font-medium">Curated {category.toLowerCase()} masterpieces</p>
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
    </div>
  )
}