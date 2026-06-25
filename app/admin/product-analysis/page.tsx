'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AdminSidebar from '@/components/AdminSidebar'
import { FiBox, FiTrendingUp, FiEye } from 'react-icons/fi'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

type Product = {
  id: string
  name: string
  image?: string
  category: string
  sub_category: string
}
type ChartItem = {
  name: string
  views: number
}

type RankedItem = {
  id: string
  title: string
  views: number
}

export default function ProductAnalysisPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [products, setProducts] = useState<Product[]>([])
  const [productVisits, setProductVisits] = useState<any[]>([])

  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
const [selectedSubCategory, setSelectedSubCategory] = useState('all')
  const [viewMode, setViewMode] = useState<
    'daily' | 'monthly' | 'yearly'
  >('daily')

  const [chartData, setChartData] = useState<ChartItem[]>([])
  const [topProducts, setTopProducts] = useState<RankedItem[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      buildChart()
    }
  }, [selectedProduct, viewMode, productVisits])

  const fetchData = async () => {
const { data: productsData } = await supabase
  .from('products')
  .select('id,name,image,category,sub_category')

    const { data: visitsData } = await supabase
      .from('product_visits')
      .select('*')
      .order('created_at', { ascending: true })

    setProducts(productsData || [])
    setProductVisits(visitsData || [])

    if (productsData && productsData.length > 0) {
      setSelectedProduct(String(productsData[0].id))
    }

    const counts: Record<string, number> = {}

    visitsData?.forEach((visit) => {
      counts[visit.product_id] =
        (counts[visit.product_id] || 0) + 1
    })

    const ranked = Object.entries(counts)
      .map(([id, views]) => ({
        id,
        title:
          productsData?.find(
            (p) => String(p.id) === String(id)
          )?.name || 'Unknown Product',
        views,
      }))
      .sort((a, b) => b.views - a.views)

    setTopProducts(ranked)

    setLoading(false)
  }

  const buildChart = () => {
    const filtered = productVisits.filter(
      (visit) =>
        String(visit.product_id) === selectedProduct
    )

    const grouped: Record<string, number> = {}

    filtered.forEach((visit) => {
      const date = new Date(visit.created_at)

      let key = ''

      if (viewMode === 'daily') {
        key = date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
        })
      }

      if (viewMode === 'monthly') {
        key = date.toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric',
        })
      }

      if (viewMode === 'yearly') {
        key = date.getFullYear().toString()
      }

      grouped[key] = (grouped[key] || 0) + 1
    })

    setChartData(
      Object.entries(grouped).map(([name, views]) => ({
        name,
        views,
      }))
    )
  }

  const totalViews = productVisits.filter(
    (visit) =>
      String(visit.product_id) === selectedProduct
  ).length

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        Loading...
      </div>
    )
  }

  const categories = [
  ...new Set(products.map((p) => p.category))
]

const subCategories = [
  ...new Set(
    products
      .filter(
        (p) =>
          selectedCategory === 'all' ||
          p.category === selectedCategory
      )
      .map((p) => p.sub_category)
  ),
]

const filteredProducts = products.filter((product) => {
  const categoryMatch =
    selectedCategory === 'all' ||
    product.category === selectedCategory

  const subCategoryMatch =
    selectedSubCategory === 'all' ||
    product.sub_category === selectedSubCategory

  return categoryMatch && subCategoryMatch
})

  return (
    <div className="flex min-h-screen bg-[#f5efe6]">
      <AdminSidebar />

      <main className="flex-1 p-8 md:p-12">

        <header className="mb-10">
          <h1 className="text-4xl font-serif font-black text-[#3d2b1f]">
            Product Analytics
          </h1>

          <p className="text-stone-500 mt-2">
            Detailed product engagement analysis
          </p>
        </header>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 flex gap-4 items-center">
            <div className="p-4 bg-amber-50 rounded-xl text-amber-700">
              <FiEye size={24} />
            </div>

            <div>
              <p className="text-xs uppercase text-stone-400 font-bold">
                Total Views
              </p>

              <p className="text-3xl font-serif font-bold text-[#3d2b1f]">
                {totalViews}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 flex gap-4 items-center">
            <div className="p-4 bg-stone-50 rounded-xl text-stone-700">
              <FiBox size={24} />
            </div>

            <div>
              <p className="text-xs uppercase text-stone-400 font-bold">
                Category Selected
              </p>

              <p className="font-serif font-bold text-xl text-[#3d2b1f]">
                {
                  products.find(
                    (p) =>
                      String(p.id) === selectedProduct
                  )?.name
                }
              </p>
            </div>
          </div>

        </div>

        {/* Chart Section */}

        <section className="bg-white rounded-3xl shadow-md p-8 border border-amber-100">

         <div className="flex flex-col gap-4 mb-8">

            <div className="space-y-6">

  {/* Category Buttons */}

  <div>
    <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
      Category
    </p>

    <div className="flex flex-wrap gap-2">

      <button
        onClick={() => {
          setSelectedCategory('all')
          setSelectedSubCategory('all')
        }}
        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
          selectedCategory === 'all'
            ? 'bg-[#3d2b1f] text-white'
            : 'bg-amber-50 hover:bg-white'
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => {
            setSelectedCategory(category)
            setSelectedSubCategory('all')

            const firstProduct = products.find(
              (p) => p.category === category
            )

            if (firstProduct) {
              setSelectedProduct(String(firstProduct.id))
            }
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            selectedCategory === category
              ? 'bg-[#3d2b1f] text-white'
              : 'bg-amber-50 hover:bg-white'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </div>

  {/* Sub Categories */}

  <div>
    <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
      Sub Category
    </p>

    <div className="flex flex-wrap gap-2">

      <button
        onClick={() => setSelectedSubCategory('all')}
        className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
          selectedSubCategory === 'all'
            ? 'bg-[#3d2b1f] text-white'
            : 'bg-stone-100 hover:bg-white'
        }`}
      >
        All
      </button>

      {subCategories.map((sub) => (
        <button
          key={sub}
          onClick={() => {
            setSelectedSubCategory(sub)

            const firstProduct = filteredProducts.find(
              (p) => p.sub_category === sub
            )

            if (firstProduct) {
              setSelectedProduct(String(firstProduct.id))
            }
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            selectedSubCategory === sub
              ? 'bg-[#3d2b1f] text-white'
              : 'bg-stone-100 hover:bg-white'
          }`}
        >
          {sub}
        </button>
      ))}

    </div>
  </div>

  {/* Product Dropdown */}

  <select
    value={selectedProduct}
    onChange={(e) =>
      setSelectedProduct(e.target.value)
    }
    className="border rounded-xl px-4 py-3 w-full"
  >
    {filteredProducts.map((product) => (
      <option
        key={product.id}
        value={product.id}
      >
        {product.name}
      </option>
    ))}
  </select>

</div>

          <div className="flex justify-end w-full">
            <div className="inline-flex bg-amber-50 p-1 rounded-xl border border-amber-100">

              {(
                ['daily', 'monthly', 'yearly'] as const
              ).map((mode) => (
                <button
                  key={mode}
                  onClick={() =>
                    setViewMode(mode)
                  }
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
                    viewMode === mode
                      ? 'bg-[#3d2b1f] text-white'
                      : 'hover:bg-white'
                  }`}
                >
                  {mode}
                </button>
              ))}

            </div>
            </div>

          </div>

          <div className="h-[400px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Line
            type="linear"
            dataKey="views"
            stroke="#92400e"
            strokeWidth={4}
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
            animationDuration={500}
            />

              </LineChart>
            </ResponsiveContainer>

          </div>

        </section>

        {/* Top products */}

        <section className="bg-white rounded-3xl shadow-md p-8 border border-amber-100 mt-10">

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
              <FiTrendingUp />
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-[#3d2b1f]">
                Top Viewed Products
              </h2>

              <p className="text-xs text-stone-400 uppercase font-bold">
                Complete ranking
              </p>
            </div>
          </div>

          <div className="space-y-4">

            {topProducts.map((product, index) => (

              <div
                key={product.id}
                className="flex justify-between items-center border-b pb-4"
              >

                <div className="flex gap-4 items-center">

                  <div className="w-10 h-10 rounded-full bg-[#3d2b1f] text-white flex justify-center items-center font-bold">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-bold text-[#3d2b1f]">
                      {product.title}
                    </p>

                    <p className="text-xs text-stone-400">
                      Product page views
                    </p>
                  </div>

                </div>

                <p className="text-xl font-serif font-bold text-amber-700">
                  {product.views}
                </p>

              </div>

            ))}

          </div>

        </section>

      </main>
    </div>
  )
}