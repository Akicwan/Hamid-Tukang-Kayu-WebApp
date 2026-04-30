'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  sub_category: string
  image: string
  additional_images?: string[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const productsID = params.productsID as string

  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productsID)
        .single()

      if (!error && data) {
        setProduct(data)
        setSelectedImage(data.image)
      }

      setLoading(false)
    }

    if (productsID) fetchProduct()
  }, [productsID])

  if (loading) {
    return (
      <div className="bg-[#fcfaf8] min-h-screen">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-stone-500">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-[#fcfaf8] min-h-screen">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-red-500">Product not found.</p>
        </div>
      </div>
    )
  }

  const allImages = [product.image, ...(product.additional_images || [])].filter(Boolean)

  return (
    <div className="bg-[#fcfaf8] min-h-screen font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-xs text-stone-500 mb-8">
          <Link href="/products" className="hover:text-amber-700">Products</Link>
          <span className="mx-2">›</span>
          <span>{product.category}</span>
          <span className="mx-2">›</span>
          <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.58fr_0.42fr] gap-12">
          <div className="flex gap-6">
            <div className="hidden md:flex flex-col gap-4 w-24">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`border bg-white p-1 ${
                    selectedImage === img ? 'border-[#3d2b1f]' : 'border-stone-200'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="flex-1 bg-white">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-[520px] object-cover"
              />

              <div className="md:hidden grid grid-cols-4 gap-3 mt-4">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`border bg-white p-1 ${
                      selectedImage === img ? 'border-[#3d2b1f]' : 'border-stone-200'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="bg-white border border-stone-200 p-8 h-fit">
            <p className="text-sm text-stone-500 underline mb-5">
              More from {product.category}
            </p>

            <div className="border-b border-stone-200 pb-6 mb-6">
              <h1 className="text-3xl font-serif font-bold text-[#2f241d] mb-2">
                {product.name}
              </h1>

              <p className="text-stone-600 mb-2">
                {product.sub_category || product.category}
              </p>

              <p className="text-3xl font-bold text-[#2f241d]">
                RM{product.price}
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#2f241d] mb-2">
                  Description
                </h3>
                <p className="text-sm leading-7 text-stone-600 whitespace-pre-line">
                  {product.description || 'No description available.'}
                </p>
              </div>

              <div className="border-t border-stone-200 pt-5">
                <h3 className="text-sm font-bold text-[#2f241d] mb-2">
                  Category
                </h3>
                <p className="text-sm text-stone-600">{product.category}</p>
              </div>

              {product.sub_category && (
                <div className="border-t border-stone-200 pt-5">
                  <h3 className="text-sm font-bold text-[#2f241d] mb-2">
                    Sub Category
                  </h3>
                  <p className="text-sm text-stone-600">{product.sub_category}</p>
                </div>
              )}

              <a
                href={`https://wa.me/601111223922?text=${encodeURIComponent(
                  `Hi, I am interested in ${product.name}. Can I know more details?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block w-full text-center rounded-full bg-[#3d2b1f] text-white font-bold py-4 hover:bg-amber-800 transition"
              >
                Contact Us on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}