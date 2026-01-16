'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AdminSidebar from '@/components/AdminSidebar'
import { FiBox, FiUsers, FiTrendingUp } from 'react-icons/fi'
// Import chart components (Ensure you have installed: npm install recharts)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Mock data reflecting the "regional market engagement" goals in the SRS
const trafficData = [
  { name: 'Mon', views: 400 },
  { name: 'Tue', views: 300 },
  { name: 'Wed', views: 600 },
  { name: 'Thu', views: 800 },
  { name: 'Fri', views: 500 },
  { name: 'Sat', views: 900 },
  { name: 'Sun', views: 700 },
];

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/admin/login')
      } else {
        setUserEmail(session.user.email ?? null)
        setLoading(false)
      }
    }

    checkAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/admin/login')
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  if (loading) return <div className="flex justify-center items-center h-screen bg-[#f5efe6] font-serif italic text-amber-900">Loading Analytics...</div>

  return (
    <div className="flex min-h-screen bg-[#f5efe6] font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 md:p-12 overflow-hidden">
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-4xl font-serif font-black text-[#3d2b1f] tracking-tight">Management Dashboard</h1>
          <p className="text-stone-500 mt-1">
            Logged in as: <span className="text-amber-800 font-bold">{userEmail}</span>
          </p>
        </header>

        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-amber-100 flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-700 rounded-xl"><FiBox size={24} /></div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active Products</p>
              <p className="text-2xl font-serif font-bold text-[#3d2b1f]">0</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-amber-100 flex items-center gap-4">
            <div className="p-4 bg-stone-50 text-stone-700 rounded-xl"><FiUsers size={24} /></div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Customers</p>
              <p className="text-2xl font-serif font-bold text-[#3d2b1f]">0</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-amber-100 flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-xl"><FiTrendingUp size={24} /></div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Weekly Growth</p>
              <p className="text-2xl font-serif font-bold text-[#3d2b1f]">+12%</p>
            </div>
          </div>
        </div>

        {/* UC09: Website Traffic Analytics Graph */}
        <section className="bg-white rounded-3xl shadow-md p-8 border border-amber-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#3d2b1f]">Visitor Traffic Analysis</h2>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Weekly Engagement Report</p>
            </div>
            <div className="px-4 py-1 bg-amber-50 text-amber-800 text-[10px] font-black rounded-full border border-amber-200 uppercase">
              Live Data
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
                  tick={{fill: '#a8a29e', fontSize: 12, fontWeight: 'bold'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#a8a29e', fontSize: 12}}
                />
                <Tooltip 
                  cursor={{fill: '#f5efe6'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="views" 
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#b45309' : '#3d2b1f'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <footer className="mt-12 text-center text-[9px] text-stone-400 font-bold uppercase tracking-[0.3em]">
          &copy; 2026 Hamid Tukang Kayu &bull; Analytics Reporting Module &bull; Secured with Supabase
        </footer>
      </main>
    </div>
  )
}