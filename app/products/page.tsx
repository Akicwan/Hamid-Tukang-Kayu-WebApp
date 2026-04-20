'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '../../components/Navbar'
import ProductCard from '../../components/ProductCard'
import { FiSearch, FiFilter } from 'react-icons/fi'
import Footer from '../../components/Footer'

// Define Product structure
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  sub_category: string;
  image: string;
}

const CATEGORIES = ['All', 'Dining Room', 'Living Room', 'Bedroom', 'Cabinet', 'Masjid', 'Special Projects']

export default function ProductCataloguePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) {
        setProducts(data)
        setFilteredProducts(data)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  // Handle Filtering Logic
  useEffect(() => {
    let result = products

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory)
    }

    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProducts(result)
  }, [searchQuery, selectedCategory, products])

  return (
    <div className="bg-[#fcfaf8] min-h-screen font-sans">
      {/* Same Navbar as Homepage for consistency */}
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#3d2b1f] py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Our Masterpieces</h1>
          <p className="text-amber-200/80 italic font-light tracking-widest uppercase text-xs">Handcrafted Heritage from Batu Pahat</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Search</h3>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text"
                  placeholder="Find a piece..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:border-amber-700 outline-none transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Collections</h3>
              <ul className="space-y-2">
                {CATEGORIES.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === cat 
                        ? 'bg-amber-700 text-white shadow-md' 
                        : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <p className="text-stone-400 text-sm font-medium">
                Showing <span className="text-[#3d2b1f] font-bold">{filteredProducts.length}</span> results
              </p>
              <div className="flex items-center gap-2 text-stone-500">
                <FiFilter size={14}/>
                <span className="text-xs font-bold uppercase tracking-tighter">Refine View</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 bg-stone-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-stone-100">
                <p className="text-stone-400 font-serif italic">No pieces found in this collection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                  />
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