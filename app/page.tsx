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
  id: string
  name: string
  price: number
  category: string
  image: string
}

interface NewsEvent {
  postID: string
  title: string
  content: string
  date: string
  fb_link?: string
}

const categories = ['Dining Room', 'Living Room', 'Bedroom', 'Cabinet']

export default function Home() {
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({})
  const [announcements, setAnnouncements] = useState<NewsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [heroImages, setHeroImages] = useState<string[]>([])

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

        if (productData) {
        const grouped = productData.reduce((acc: Record<string, Product[]>, product: Product) => {
          if (!acc[product.category]) acc[product.category] = []
          acc[product.category].push(product)
          return acc
        }, {})
        setProductsByCategory(grouped)
      }

      setHeroImages([
        '/heropic1.png',
        '/heropic2.png',
        '/heropic3.png',
      ])

      if (newsData) {
        setAnnouncements(newsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#2f241d] font-sans">
      <Navbar />

      <main>
        {/* HERO - FULL SCREEN */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-[#2e2118]">
  <div className="absolute inset-0">
    <Slideshow images={heroImages} />
  </div>

  <div className="absolute inset-0 bg-gradient-to-r from-[#2e2118]/78 via-[#3a2a1d]/65 to-[#2e2118]/30" />

  <div className="relative max-w-7xl mx-auto px-6 md:px-10 w-full">
    <div className="max-w-3xl text-white pt-24 md:pt-16">
      <p className="text-[11px] md:text-xs uppercase tracking-[0.35em] text-amber-200/90 font-semibold mb-5">
        Traditional Woodcraft Heritage Since 1952
      </p>

      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.02] tracking-tight mb-6">
        Hamid Tukang Kayu.
        <br />
        Woodcraft with
        <br />
        lasting value.
      </h1>

      <p className="max-w-2xl text-sm md:text-lg leading-8 text-stone-200/95 mb-8">
        Perusahaan Tukang Kayu A. Hamid Sdn. Bhd. brings the heritage of Malay
        craftsmanship into every piece — from living and dining furniture to
        bespoke creations shaped with precision, tradition, and timeless character.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full bg-[#d4a15d] px-6 py-3 text-sm font-bold text-[#2f241d] hover:bg-[#deae70] transition"
        >
          Explore Collection
        </Link>

        <Link
          href="/news"
          className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/15 transition"
        >
          News & Events
        </Link>
      </div>
    </div>
  </div>
</section>

        {/* INTRO */}
     <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 min-h-[500px]">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    
    {/* LEFT SIDE (TEXT) */}
    <div>
      <p className="text-[11px] uppercase tracking-[0.35em] text-[#9b7b5f] font-semibold mb-3">
        About Us
      </p>

      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-5 text-[#2f241d]">
        Traditional beauty
        <br />
        in a simple form
      </h2>

      <p className="text-sm md:text-base leading-8 text-[#6d5a4c] mb-5">
        Founded by Tuan Haji Abdul Hamid Bin Ahmad, the company stands among the
        earliest Bumiputra furniture makers in Batu Pahat. Every design is shaped
        with the spirit of Malay heritage — emphasizing balance, refined finishing,
        and long-lasting quality.
      </p>

      <p className="text-sm md:text-base leading-8 text-[#6d5a4c] mb-8">
        We believe furniture should do more than fill a space. It should create a home
        that feels calm, graceful, and full of meaning.
      </p>

      {/* BUTTON */}
      <Link
        href="/about"
        className="inline-flex items-center justify-center rounded-full border border-[#2f241d] px-6 py-3 text-sm font-semibold hover:bg-[#2f241d] hover:text-white transition"
      >
        Read More →
      </Link>
    </div>

    {/* RIGHT SIDE (FOUNDER IMAGE) */}
    <div className="relative w-full h-full">
  {/* Image */}
  <img
    src="/founder.jpg"
    alt="Allahyarham Tuan Hj Abdul Hamid"
    className="w-full h-full object-cover"
  />

  {/* Bottom gradient (for readability) */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

  {/* Caption */}
  <div className="absolute bottom-4 left-4 right-4 text-white">
    <p className="text-sm md:text-base font-semibold">
      Allahyarham Tuan Hj Abdul Hamid
    </p>
    <p className="text-xs md:text-sm text-white/80">
      Founder of Hamid Tukang Kayu
    </p>
  </div>
</div>

  </div>
</section>

{/* WHAT WE DO */}
<section className="bg-[#f8f2ea] border-y border-[#e2d4c6]">
  <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
  <div className="mb-14">
    <p className="text-[11px] uppercase tracking-[0.35em] text-[#9b7b5f] font-semibold mb-3">
      What We Do
    </p>
    <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2f241d]">
      Craftsmanship for every space
    </h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-14 gap-y-16">
    {[
      {
        title: 'Dining Room',
        desc: 'We create dining room sets for the perfect dining ambience you have always wanted. Our dining sets give you comfort while sharing food, laughter, and memories with family and friends.',
        link: '/products?category=Dining%20Room',
      },
      {
        title: 'Living Room',
        desc: 'Create the perfect haven for precious time together with your loved ones. Our living room furniture captures your home’s unique character with warmth and comfort.',
        link: '/products?category=Living%20Room',
      },
      {
        title: 'Bedroom',
        desc: 'Turn your bedroom into a peaceful and meaningful space. Find pieces that bring calmness, elegance, and comfort into your personal retreat.',
        link: '/products?category=Bedroom',
      },
      {
        title: 'Cabinet',
        desc: 'A cabinet is a perfect way to keep precious items visible yet protected. Our cabinet pieces combine storage, organization, and traditional charm.',
        link: '/products?category=Cabinet',
      },
      {
        title: 'Masjid',
        desc: 'From delicate mimbars to sturdy portable rehals, we provide careful workmanship for masjid and surau furniture with durability, respect, and purpose.',
        link: '/products?category=Masjid',
      },
      {
        title: 'Others',
        desc: 'We also produce custom woodwork products including baby cots, foldable rehals, Yasin storage, special projects, and other bespoke furniture pieces.',
        link: '/products?category=Special%20Projects',
      },
    ].map((item, index) => (
      <div
        key={item.title}
       
       className="group relative bg-[#f8f2ea] text-[#2f241d] px-7 py-8 border border-[#e2d4c6] shadow-md transition-all duration-500 hover:bg-[#3d2b1f] hover:text-white hover:-translate-y-2 hover:shadow-2xl"
      >
      <div className="absolute -top-4 left-6 w-12 h-12 bg-[#e2d4c6] group-hover:bg-[#5a4233] transition-colors duration-300 shadow-md" />

        <div className="relative">
         <p className="text-xs text-[#9b7b5f] group-hover:text-amber-300 font-bold tracking-[0.25em] mb-4 transition-colors duration-300">
            0{index + 1}
          </p>

         <h3 className="text-xl font-serif font-bold uppercase mb-4 transition-colors">
            {item.title}
          </h3>

          <p className="text-sm leading-8 text-[#6d5a4c] group-hover:text-stone-200 mb-8 transition-colors duration-300">
            {item.desc}
          </p>

          <Link
            href={item.link}
           className="text-xs font-bold uppercase tracking-[0.25em] text-[#c8752a] group-hover:text-amber-300 transition-colors duration-300"
          >
            Learn More →
          </Link>
        </div>
      </div>
    ))}
  </div>
  </div>
</section>

        {/* FEATURED PRODUCTS */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 space-y-16">
          {categories.map((category) => {
            const categoryProducts = productsByCategory[category] || []
            if (categoryProducts.length === 0 && !loading) return null

            return (
              <section key={category}>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 border-b border-[#d9c8b8] pb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#9b7b5f] font-semibold mb-2">
                      Featured Space
                    </p>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2f241d]">
                      {category}
                    </h2>
                  </div>

                  <Link
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className="text-sm font-semibold text-[#2f241d] hover:text-[#9b7b5f] transition"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {loading
                    ? [1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-80 rounded-[2rem] bg-white animate-pulse border border-[#eaded2]"
                        />
                      ))
                    : categoryProducts
                        .slice(0, 3)
                        .map((product) => (
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
        </section>

        {/* NEWS */}
        <section className="bg-[#f8f2ea] border-y border-[#e2d4c6]">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#9b7b5f] font-semibold mb-3">
                Latest News
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2f241d]">
                Stories, projects, and recent updates
              </h2>
              </div>

              <Link
                href="/news"
                className="text-sm font-semibold text-[#2f241d] hover:text-[#9b7b5f] transition"
              >
                All News →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-[2rem] bg-white animate-pulse border border-[#eaded2]"
                  />
                ))
              ) : announcements.length > 0 ? (
                announcements.map((news) => (
                  <article
                    key={news.postID}
                    className="rounded-[2rem] border border-[#e2d4c6] bg-white p-7 shadow-sm hover:shadow-md transition"
                  >
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#9b7b5f] font-semibold mb-4">
                      {new Date(news.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>

                    <h3 className="text-2xl font-serif font-bold leading-snug text-[#2f241d] mb-3 line-clamp-2">
                      {news.title}
                    </h3>

                    <p className="text-sm leading-7 text-[#6d5a4c] line-clamp-4 mb-6">
                      {news.content}
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <Link
                        href={`/news/${news.postID}`}
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f241d] hover:text-[#9b7b5f] transition"
                      >
                        Read More
                      </Link>

                      {news.fb_link && (
                        <a
                          href={news.fb_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b7b5f] hover:underline"
                        >
                          Facebook
                        </a>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-full rounded-[2rem] border border-[#e2d4c6] bg-white px-6 py-16 text-center text-[#8b7562] italic">
                  No recent updates available at the moment.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}