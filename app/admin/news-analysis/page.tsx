'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AdminSidebar from '@/components/AdminSidebar'
import { FiEye, FiFileText, FiTrendingUp } from 'react-icons/fi'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

type NewsPost = {
  postID: string
  title: string
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

export default function NewsAnalysisPage() {
  const [loading, setLoading] = useState(true)

  const [posts, setPosts] = useState<NewsPost[]>([])
  const [newsVisits, setNewsVisits] = useState<any[]>([])

  const [selectedPost, setSelectedPost] = useState('')
  const [viewMode, setViewMode] = useState<
    'daily' | 'monthly' | 'yearly'
  >('daily')

  const [chartData, setChartData] = useState<ChartItem[]>([])
  const [topNews, setTopNews] = useState<RankedItem[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedPost) {
      buildChart()
    }
  }, [selectedPost, viewMode, newsVisits])

  const fetchData = async () => {
    const { data: newsData } = await supabase
      .from('NewsEvent')
      .select('postID,title')

    const { data: visitsData } = await supabase
      .from('news_visits')
      .select('*')
      .order('created_at', { ascending: true })

    setPosts(newsData || [])
    setNewsVisits(visitsData || [])

    if (newsData && newsData.length > 0) {
      setSelectedPost(String(newsData[0].postID))
    }

    const counts: Record<string, number> = {}

    visitsData?.forEach((visit) => {
      counts[visit.post_id] =
        (counts[visit.post_id] || 0) + 1
    })

    const ranked = Object.entries(counts)
      .map(([id, views]) => ({
        id,
        title:
          newsData?.find(
            (n) => String(n.postID) === String(id)
          )?.title || 'Unknown News/Event',
        views,
      }))
      .sort((a, b) => b.views - a.views)

    setTopNews(ranked)

    setLoading(false)
  }

  const buildChart = () => {
    const filtered = newsVisits.filter(
      (visit) =>
        String(visit.post_id) === selectedPost
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

  const totalViews = newsVisits.filter(
    (visit) =>
      String(visit.post_id) === selectedPost
  ).length

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f5efe6]">
      <AdminSidebar />

      <main className="flex-1 p-8 md:p-12">

        <header className="mb-10">
          <h1 className="text-4xl font-serif font-black text-[#3d2b1f]">
            News & Event Analytics
          </h1>

          <p className="text-stone-500 mt-2">
            Detailed news engagement analysis
          </p>
        </header>

        {/* Cards */}

        <div className="grid md:grid-cols-2 gap-6 mb-10">

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 flex gap-4 items-center">
            <div className="p-4 bg-green-50 rounded-xl text-green-700">
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
            <div className="p-4 bg-green-50 rounded-xl text-green-700">
              <FiFileText size={24} />
            </div>

            <div>
              <p className="text-xs uppercase text-stone-400 font-bold">
                Selected News/Event
              </p>

              <p className="font-serif font-bold text-xl text-[#3d2b1f]">
                {
                  posts.find(
                    (p) =>
                      String(p.postID) === selectedPost
                  )?.title
                }
              </p>
            </div>
          </div>

        </div>

        {/* Chart Section */}

        <section className="bg-white rounded-3xl shadow-md p-8 border border-amber-100">

          <div className="flex justify-between items-center mb-8">

            <select
              value={selectedPost}
              onChange={(e) =>
                setSelectedPost(e.target.value)
              }
              className="border rounded-xl px-4 py-3"
            >
              {posts.map((post) => (
                <option
                  key={post.postID}
                  value={post.postID}
                >
                  {post.title}
                </option>
              ))}
            </select>

            <div className="inline-flex bg-green-50 p-1 rounded-xl border">

              {(
                ['daily', 'monthly', 'yearly'] as const
              ).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
                    viewMode === mode
                      ? 'bg-green-700 text-white'
                      : 'hover:bg-white'
                  }`}
                >
                  {mode}
                </button>
              ))}

            </div>

          </div>

          <div className="h-[400px]">

            <ResponsiveContainer width="100%" height="100%">
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
                  stroke="#15803d"
                  strokeWidth={4}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                  animationDuration={500}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>

        </section>

        {/* Top News */}

        <section className="bg-white rounded-3xl shadow-md p-8 border border-amber-100 mt-10">

          <div className="flex items-center gap-3 mb-6">

            <div className="p-3 bg-green-50 rounded-xl text-green-700">
              <FiTrendingUp />
            </div>

            <div>
              <h2 className="text-xl font-serif font-bold text-[#3d2b1f]">
                Top Viewed News & Events
              </h2>

              <p className="text-xs text-stone-400 uppercase font-bold">
                Complete ranking
              </p>
            </div>

          </div>

          <div className="space-y-4">

            {topNews.map((post, index) => (

              <div
                key={post.id}
                className="flex justify-between items-center border-b pb-4"
              >

                <div className="flex gap-4 items-center">

                  <div className="w-10 h-10 rounded-full bg-green-700 text-white flex justify-center items-center font-bold">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-bold text-[#3d2b1f]">
                      {post.title}
                    </p>

                    <p className="text-xs text-stone-400">
                      News/Event page views
                    </p>
                  </div>

                </div>

                <p className="text-xl font-serif font-bold text-green-700">
                  {post.views}
                </p>

              </div>

            ))}

          </div>

        </section>

      </main>
    </div>
  )
}