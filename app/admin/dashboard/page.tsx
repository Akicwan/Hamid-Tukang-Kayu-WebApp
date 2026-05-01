'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AdminSidebar from '@/components/AdminSidebar'
import { FiBox, FiEye, FiFileText, FiTrendingUp } from 'react-icons/fi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type ChartItem = {
  name: string
  views: number
}

type RankedItem = {
  id: string
  title: string
  image?: string
  views: number
}

export default function AdminDashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'yearly'>('daily')
  const [trafficData, setTrafficData] = useState<ChartItem[]>([])
  const [pageVisits, setPageVisits] = useState<any[]>([])
  const [totalVisitors, setTotalVisitors] = useState(0)
  const [totalProductClicks, setTotalProductClicks] = useState(0)
  const [totalNewsClicks, setTotalNewsClicks] = useState(0)
  const [topProducts, setTopProducts] = useState<RankedItem[]>([])
  const [topNews, setTopNews] = useState<RankedItem[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/admin/login')
      } else {
        setUserEmail(session.user.email ?? null)
        await fetchAnalytics()
        setLoading(false)
      }
    }

    checkAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/admin/login')
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    buildTrafficChart(pageVisits, viewMode)
  }, [viewMode, pageVisits])

  const buildTrafficChart = (visits: any[], mode: 'daily' | 'monthly' | 'yearly') => {
    const grouped: Record<string, number> = {}

    visits.forEach((visit) => {
      const date = new Date(visit.created_at)

      let key = ''

      if (mode === 'daily') {
        key = date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
        })
      }

      if (mode === 'monthly') {
        key = date.toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric',
        })
      }

      if (mode === 'yearly') {
        key = date.getFullYear().toString()
      }

      grouped[key] = (grouped[key] || 0) + 1
    })

    const chart = Object.entries(grouped).map(([name, views]) => ({
      name,
      views,
    }))

    setTrafficData(chart)
  }

  const fetchAnalytics = async () => {

    const { data: visitsData, error: visitsError } = await supabase
  .from('page_visits')
  .select('*')
  .order('created_at', { ascending: true })

const { data: productVisitsData, error: productVisitsError } = await supabase
  .from('product_visits')
  .select('*')

const { data: newsVisitsData, error: newsVisitsError } = await supabase
  .from('news_visits')
  .select('*')

if (visitsError) console.error('Page visits fetch error:', visitsError.message)
if (productVisitsError) console.error('Product visits fetch error:', productVisitsError.message)
if (newsVisitsError) console.error('News visits fetch error:', newsVisitsError.message)


    const { data: productsData } = await supabase
  .from('products')
  .select('id, name, image')

    const { data: newsData } = await supabase
      .from('NewsEvent')
      .select('postID, title')

    const visits = visitsData || []
    const productVisits = productVisitsData || []
    const newsVisits = newsVisitsData || []

    console.log('Analytics data:', {
  visits,
  productVisits,
  newsVisits,
})

    setPageVisits(visits)
    setTotalVisitors(visits.length)
    setTotalProductClicks(productVisits.length)
    setTotalNewsClicks(newsVisits.length)

    buildTrafficChart(visits, viewMode)

    const productCount: Record<string, number> = {}

    productVisits.forEach((visit) => {
      productCount[visit.product_id] = (productCount[visit.product_id] || 0) + 1
    })

    const rankedProducts = Object.entries(productCount)
      .map(([id, views]) => {
        const product = productsData?.find((p) => String(p.id) === String(id))

              return {
          id,
          title: product?.name || 'Unknown Product',
          image: product?.image || '',
          views,
        }
      })
      .sort((a, b) => b.views - a.views)

    setTopProducts(rankedProducts)

    const newsCount: Record<string, number> = {}

    newsVisits.forEach((visit) => {
      newsCount[visit.post_id] = (newsCount[visit.post_id] || 0) + 1
    })

    const rankedNews = Object.entries(newsCount)
      .map(([id, views]) => {
        const post = newsData?.find((n) => n.postID === id)

        return {
          id,
          title: post?.title || 'Unknown News/Event',
          views,
        }
      })
      .sort((a, b) => b.views - a.views)

    setTopNews(rankedNews)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f5efe6] font-serif italic text-amber-900">
        Loading Analytics...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f5efe6] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 md:p-12 overflow-hidden">
        <header className="mb-10">
          <h1 className="text-4xl font-serif font-black text-[#3d2b1f] tracking-tight">
            Management Dashboard
          </h1>
          <p className="text-stone-500 mt-1">
            Logged in as: <span className="text-amber-800 font-bold">{userEmail}</span>
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-amber-100 flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-700 rounded-xl">
              <FiEye size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                Total Visitors
              </p>
              <p className="text-2xl font-serif font-bold text-[#3d2b1f]">
                {totalVisitors}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-amber-100 flex items-center gap-4">
            <div className="p-4 bg-stone-50 text-stone-700 rounded-xl">
              <FiBox size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                Product Clicks
              </p>
              <p className="text-2xl font-serif font-bold text-[#3d2b1f]">
                {totalProductClicks}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-amber-100 flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-xl">
              <FiFileText size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                News/Event Clicks
              </p>
              <p className="text-2xl font-serif font-bold text-[#3d2b1f]">
                {totalNewsClicks}
              </p>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-3xl shadow-md p-8 border border-amber-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#3d2b1f]">
                Visitor Traffic Analysis
              </h2>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                Daily, monthly, and yearly engagement report
              </p>
            </div>

            <div className="flex bg-amber-50 p-1 rounded-xl border border-amber-100">
              {(['daily', 'monthly', 'yearly'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
                    viewMode === mode
                      ? 'bg-[#3d2b1f] text-white shadow'
                      : 'text-amber-900 hover:bg-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 'bold' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a8a29e', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f5efe6' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="views" radius={[6, 6, 0, 0]} barSize={40}>
                  {trafficData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === trafficData.length - 1 ? '#b45309' : '#3d2b1f'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">
          <section className="bg-white rounded-3xl shadow-md p-8 border border-amber-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                <FiTrendingUp />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-[#3d2b1f]">
                  Product Analysis
                </h2>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                  Top 3 most viewed products
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-sm text-stone-400 italic">No product visits recorded yet.</p>
              ) : (
                topProducts.slice(0, 3).map((product, index) => (
                  <div
  key={product.id}
  className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4"
>
  <div className="flex items-center gap-4">
    {/* Rank */}
    <div className="w-10 h-10 rounded-full bg-[#3d2b1f] text-white flex items-center justify-center font-bold text-sm">
      {index + 1}
    </div>

    {/* Image */}
    <img
      src={product.image}
      alt={product.title}
      className="w-12 h-12 object-cover rounded-lg border"
    />

    {/* Text */}
    <div>
      <p className="font-bold text-[#2f241d]">{product.title}</p>
      <p className="text-xs text-stone-400">Product page views</p>
    </div>
  </div>

  {/* Views */}
  <p className="text-lg font-serif font-bold text-amber-700">
    {product.views}
  </p>
</div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-md p-8 border border-amber-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-50 text-green-700 rounded-xl">
                <FiTrendingUp />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-[#3d2b1f]">
                  News & Event Analysis
                </h2>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                  Top 3 most clicked news/events
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {topNews.length === 0 ? (
                <p className="text-sm text-stone-400 italic">No news visits recorded yet.</p>
              ) : (
                topNews.slice(0, 3).map((post, index) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#3d2b1f] text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-[#2f241d]">{post.title}</p>
                        <p className="text-xs text-stone-400">News/Event page clicks</p>
                      </div>
                    </div>

                    <p className="text-lg font-serif font-bold text-amber-700">
                      {post.views}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <footer className="mt-12 text-center text-[9px] text-stone-400 font-bold uppercase tracking-[0.3em]">
          &copy; 2026 Hamid Tukang Kayu &bull; Analytics Reporting Module &bull; Secured with Supabase
        </footer>
      </main>
    </div>
  )
}