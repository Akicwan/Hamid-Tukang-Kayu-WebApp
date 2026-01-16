'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AdminSidebar from '@/components/AdminSidebar'
import { FiPlus, FiSearch, FiEdit3, FiTrash2, FiCalendar } from 'react-icons/fi'

interface NewsEvent {
  postID: string;
  title: string;
  content: string;
  date: string;
  created_at?: string;
}

export default function NewsEventsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view')
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<NewsEvent[]>([])
  
  // Modals & Form State
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [editingPost, setEditingPost] = useState<NewsEvent | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const [form, setForm] = useState({ title: '', content: '', date: new Date().toISOString().split('T')[0] })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/admin/login')
      else {
        fetchPosts()
        setLoading(false)
      }
    })
  }, [router])

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('NewsEvent').select('*').order('date', { ascending: false })
    if (data) setPosts(data)
  }

  const resetForm = () => {
    setForm({ title: '', content: '', date: new Date().toISOString().split('T')[0] })
    setErrors([])
  }

  const handleSavePost = async () => {
    const newErrors: string[] = []
    if (!form.title.trim()) newErrors.push('title')
    if (!form.content.trim()) newErrors.push('content')

    if (newErrors.length > 0) { setErrors(newErrors); return; }

    setIsProcessing(true)
    try {
      if (editingPost) {
        const { error } = await supabase.from('NewsEvent').update(form).eq('postID', editingPost.postID)
        if (error) throw error
      } else {
        const { error } = await supabase.from('NewsEvent').insert([form])
        if (error) throw error
      }
      
      fetchPosts()
      setEditingPost(null)
      resetForm()
      setShowSuccessModal(true)
    } catch (err: any) { alert(err.message) } finally { setIsProcessing(false) }
  }

  if (loading) return <div className="p-10 text-center font-bold">Loading Press Room...</div>

  return (
    <div className="flex min-h-screen bg-[#f5efe6]">
      <AdminSidebar />
      <main className="flex-1 p-8">
        
        {/* SUCCESS MODAL */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-amber-100">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">✓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Post Published</h3>
              <div className="flex flex-col gap-3">
                <button onClick={() => { setShowSuccessModal(false); setActiveTab('view'); }} className="bg-amber-700 text-white font-bold py-3 rounded-xl hover:bg-amber-800 transition-all">View All Posts</button>
                <button onClick={() => setShowSuccessModal(false)} className="text-gray-500 font-semibold py-2">Create Another</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 tracking-tight uppercase font-serif">News & Events</h1>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-amber-100">
            <button onClick={() => setActiveTab('view')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'view' ? 'bg-amber-700 text-white shadow-md' : 'text-amber-800 hover:bg-amber-50'}`}>View Posts</button>
            <button onClick={() => { setActiveTab('add'); setEditingPost(null); resetForm(); }} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'add' ? 'bg-amber-700 text-white shadow-md' : 'text-amber-800 hover:bg-amber-50'}`}>New Article</button>
          </div>
        </div>

        {/* VIEW ALL TAB */}
        {activeTab === 'view' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map(post => (
              <div key={post.postID} className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 hover:border-amber-500 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                    <FiCalendar /> {new Date(post.date).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingPost(post); setForm(post); setActiveTab('add'); }} className="text-amber-600 hover:text-amber-800"><FiEdit3 size={18}/></button>
                  </div>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#3d2b1f] mb-3">{post.title}</h3>
                <p className="text-stone-500 text-sm line-clamp-3 leading-relaxed mb-4">{post.content}</p>
                <div className="pt-4 border-t border-stone-50 text-[10px] font-black text-amber-700 uppercase tracking-tighter cursor-pointer">Read Full Article &rarr;</div>
              </div>
            ))}
          </div>
        )}

        {/* ADD / EDIT ARTICLE TAB */}
        {activeTab === 'add' && (
          <div className="bg-white p-8 rounded-2xl shadow-md border border-amber-100 max-w-4xl mx-auto">
             <h2 className="text-2xl font-serif font-bold mb-8 text-amber-900 italic underline underline-offset-8 decoration-amber-100 uppercase">
               {editingPost ? 'Edit Article' : 'Draft New Article'}
             </h2>
             
             <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Headline Title</label>
                  <input 
                    className={`w-full border p-4 rounded-xl mt-2 outline-none border-stone-200 focus:border-amber-700 transition-colors ${errors.includes('title') ? 'border-red-500 bg-red-50' : ''}`}
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="e.g., Completion of Custom Wardrobe Project in Batu Pahat"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Event Date</label>
                  <input 
                    type="date"
                    className="w-full border p-4 rounded-xl mt-2 outline-none border-stone-200 focus:border-amber-700 transition-colors"
                    value={form.date} 
                    onChange={e => setForm({...form, date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Main Content</label>
                  <textarea 
                    className={`w-full border p-4 rounded-xl h-64 mt-2 outline-none border-stone-200 focus:border-amber-700 transition-colors resize-none ${errors.includes('content') ? 'border-red-500 bg-red-50' : ''}`}
                    value={form.content} 
                    onChange={e => setForm({...form, content: e.target.value})}
                    placeholder="Describe the event, project details, or company news..."
                  />
                </div>
             </div>

             <div className="mt-10 pt-6 border-t flex justify-end gap-4">
                <button onClick={() => { setActiveTab('view'); resetForm(); }} className="px-8 py-4 rounded-xl font-bold text-stone-400 hover:bg-stone-50 transition">Discard</button>
                <button 
                  onClick={handleSavePost} 
                  disabled={isProcessing}
                  className={`px-12 py-4 rounded-xl font-bold text-white shadow-xl ${isProcessing ? 'bg-gray-300' : 'bg-[#3d2b1f] hover:bg-stone-800 transition-all'}`}
                >
                  {isProcessing ? 'Publishing...' : (editingPost ? 'Update Article' : 'Publish News')}
                </button>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}