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
  fb_link?: string;
  image_urls?: string[];
  created_at?: string;
}
export default function NewsEventsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view')
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<NewsEvent[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMonth, setFilterMonth] = useState('All')
  
  // Modals & Form State
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [editingPost, setEditingPost] = useState<NewsEvent | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
const [existingImages, setExistingImages] = useState<string[]>([])
const [uploadingImages, setUploadingImages] = useState(false)

const [form, setForm] = useState({
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
  fb_link: ''
})

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
  setForm({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    fb_link: ''
  })
  setSelectedFiles([])
  setExistingImages([])
  setErrors([])
}


  
  const uploadImages = async (files: File[]) => {
  const uploadedUrls: string[] = []

  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `news-events/${fileName}`

    const { error } = await supabase.storage
      .from('news-events')
      .upload(filePath, file)

    if (error) throw error

    const { data } = supabase.storage
      .from('news-events')
      .getPublicUrl(filePath)

    uploadedUrls.push(data.publicUrl)
  }

  return uploadedUrls
}

const handleSavePost = async () => {
  const newErrors: string[] = []
  if (!form.title.trim()) newErrors.push('title')
  if (!form.content.trim()) newErrors.push('content')

  if (newErrors.length > 0) {
    setErrors(newErrors)
    return
  }

  setIsProcessing(true)

  try {
    let uploadedImageUrls: string[] = []

    if (selectedFiles.length > 0) {
      setUploadingImages(true)
      uploadedImageUrls = await uploadImages(selectedFiles)
    }

    const finalImageUrls = [...existingImages, ...uploadedImageUrls]

    if (editingPost) {
      const { error } = await supabase
        .from('NewsEvent')
        .update({
          ...form,
          fb_link: form.fb_link || null,
          image_urls: finalImageUrls
        })
        .eq('postID', editingPost.postID)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('NewsEvent')
        .insert([{
          ...form,
          fb_link: form.fb_link || null,
          image_urls: finalImageUrls
        }])

      if (error) throw error
    }

    await fetchPosts()
    setEditingPost(null)
    resetForm()
    setShowSuccessModal(true)
  } catch (err: any) {
    alert(err.message)
  } finally {
    setUploadingImages(false)
    setIsProcessing(false)
  }
}


const handleDeletePost = async () => {
  if (!editingPost) return

  const confirmDelete = window.confirm(
    `Delete "${editingPost.title}"? This cannot be undone.`
  )

  if (!confirmDelete) return

  try {
    const { error } = await supabase
      .from('NewsEvent')
      .delete()
      .eq('postID', editingPost.postID)

    if (error) throw error

    alert('Post deleted successfully')
    setEditingPost(null)
    fetchPosts()
  } catch (err: any) {
    alert(err.message)
  }
}

const filteredPosts = posts.filter((post) => {
  const matchesSearch =
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())

  const postMonth = new Date(post.date).toLocaleString('en-US', { month: 'long' })
  const matchesMonth = filterMonth === 'All' || postMonth === filterMonth

  return matchesSearch && matchesMonth
})

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

        {editingPost && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-3xl p-8 max-w-4xl w-full relative border border-amber-100 shadow-2xl">
      
      <button
        onClick={() => setEditingPost(null)}
        className="absolute top-4 right-6 text-gray-400 hover:text-red-500 text-3xl"
      >
        &times;
      </button>

      <h2 className="text-2xl font-bold text-amber-900 mb-6 border-b pb-4 uppercase italic">
        Edit Article
      </h2>

      <div className="space-y-6">

  <div>
    <label className="text-xs font-bold text-stone-400 uppercase">Headline Title</label>
    <input
      className="w-full border p-3 rounded-xl mt-1"
      value={form.title}
      onChange={e => setForm({...form, title: e.target.value})}
    />
  </div>

  <div>
    <label className="text-xs font-bold text-stone-400 uppercase">Event Date</label>
    <input
      type="date"
      className="w-full border p-3 rounded-xl mt-1"
      value={form.date}
      onChange={e => setForm({...form, date: e.target.value})}
    />
  </div>

  <div>
    <label className="text-xs font-bold text-stone-400 uppercase">Content</label>
    <textarea
      className="w-full border p-3 rounded-xl h-40 mt-1"
      value={form.content}
      onChange={e => setForm({...form, content: e.target.value})}
    />
  </div>

  <div>
    <label className="text-xs font-bold text-stone-400 uppercase">Facebook Link</label>
    <input
      className="w-full border p-3 rounded-xl mt-1"
      value={form.fb_link || ''}
      onChange={e => setForm({...form, fb_link: e.target.value})}
    />
  </div>

  {/* IMAGE SECTION */}
  <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
    <label className="text-xs font-bold text-amber-800 uppercase block mb-2">
      Upload Images
    </label>

    <input
      type="file"
      multiple
      accept="image/*"
      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
    />

    <div className="grid grid-cols-3 gap-3 mt-4">
      {existingImages.map((img, i) => (
        <img key={i} src={img} className="h-24 object-cover rounded" />
      ))}

      {selectedFiles.map((file, i) => (
        <img key={i} src={URL.createObjectURL(file)} className="h-24 object-cover rounded" />
      ))}
    </div>
  </div>

</div>
      {/* SAME form you already built */}
      
      <div className="mt-8 pt-6 border-t flex justify-between items-center">
        
        {/* DELETE BUTTON */}
        <button
          onClick={handleDeletePost}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition"
        >
          <FiTrash2 /> Delete Post
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => setEditingPost(null)}
            className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSavePost}
            className="px-12 py-3 rounded-xl font-bold text-white bg-amber-700 hover:bg-amber-800"
          >
            Update Article
          </button>
        </div>
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
          <div className="space-y-6">
  <div className="flex flex-col md:flex-row gap-3 items-center w-full">
    <div className="relative flex-1 w-full">
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        type="text"
        placeholder="Search news title or content..."
        className="w-full h-12 pl-11 pr-4 bg-white border border-amber-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    <select
      className="h-12 px-4 border border-amber-100 rounded-xl bg-white text-amber-900 font-semibold outline-none focus:ring-2 focus:ring-amber-500 shadow-sm min-w-[180px]"
      value={filterMonth}
      onChange={(e) => setFilterMonth(e.target.value)}
    >
      <option value="All">All Months</option>
      <option value="January">January</option>
      <option value="February">February</option>
      <option value="March">March</option>
      <option value="April">April</option>
      <option value="May">May</option>
      <option value="June">June</option>
      <option value="July">July</option>
      <option value="August">August</option>
      <option value="September">September</option>
      <option value="October">October</option>
      <option value="November">November</option>
      <option value="December">December</option>
    </select>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{filteredPosts.length === 0 ? (
  <div className="col-span-full bg-white rounded-2xl border border-amber-100 p-10 text-center text-stone-500 font-medium">
    No news or events found.
  </div>
) : (
  filteredPosts.map(post => (
    <div
      key={post.postID}
      onClick={() => {
        setEditingPost(post)
        setForm({
          title: post.title,
          content: post.content,
          date: post.date,
          fb_link: post.fb_link || ''
        })
        setExistingImages(post.image_urls || [])
        setSelectedFiles([])
      }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 hover:border-amber-500 transition-all group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
          <FiCalendar /> {new Date(post.date).toLocaleDateString()}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setEditingPost(post)
              setForm({
                title: post.title,
                content: post.content,
                date: post.date,
                fb_link: post.fb_link || ''
              })
              setExistingImages(post.image_urls || [])
              setSelectedFiles([])
            }}
            className="text-amber-600 hover:text-amber-800"
          >
            <FiEdit3 size={18} />
          </button>
        </div>
      </div>

      {post.image_urls && post.image_urls.length > 0 && (
        <div className="mb-4 overflow-hidden rounded-xl">
          <img
            src={post.image_urls[0]}
            alt={post.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <h3 className="text-lg font-serif font-bold text-[#3d2b1f] mb-3">
        {post.title}
      </h3>
      <p className="text-stone-500 text-sm line-clamp-3 leading-relaxed mb-4">
        {post.content}
      </p>
      <div
        onClick={(e) => {
          e.stopPropagation()
          setEditingPost(post)
          setForm({
            title: post.title,
            content: post.content,
            date: post.date,
            fb_link: post.fb_link || ''
          })
          setExistingImages(post.image_urls || [])
          setSelectedFiles([])
        }}
        className="pt-4 border-t border-stone-50 text-[10px] font-black text-amber-700 uppercase tracking-tighter cursor-pointer"
      >
        Read Full Article &rarr;
      </div>
    </div>
  ))
)}
          </div>
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

                <div>
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">
                Facebook Post Link (Optional)
              </label>
              <input
                type="text"
                className="w-full border p-4 rounded-xl mt-2 outline-none border-stone-200 focus:border-amber-700 transition-colors"
                placeholder="https://www.facebook.com/..."
                value={form.fb_link || ''}
                onChange={e => setForm({ ...form, fb_link: e.target.value })}
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
  <label className="text-xs font-bold text-amber-800 uppercase block mb-2">
    Upload Article Images
  </label>

  <input
    type="file"
    accept="image/*"
    multiple
    className="w-full text-sm"
    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
  />

  {(existingImages.length > 0 || selectedFiles.length > 0) && (
    <div className="mt-4 space-y-4">
      {existingImages.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">
            Existing Images
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {existingImages.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-28 object-cover rounded-xl border border-amber-100 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    setExistingImages(existingImages.filter((_, i) => i !== index))
                  }
                  className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">
            New Image Preview ({selectedFiles.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-28 object-cover rounded-xl border border-amber-100 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
                  }
                  className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )}
</div>
          
              
             </div>

             <div className="mt-10 pt-6 border-t flex justify-end gap-4">
                <button onClick={() => { setActiveTab('view'); resetForm(); }} className="px-8 py-4 rounded-xl font-bold text-stone-400 hover:bg-stone-50 transition">Discard</button>
                <button 
                  onClick={handleSavePost} 
                  disabled={isProcessing}
                  className={`px-12 py-4 rounded-xl font-bold text-white shadow-xl ${isProcessing ? 'bg-gray-300' : 'bg-[#3d2b1f] hover:bg-stone-800 transition-all'}`}
                >
                 {isProcessing || uploadingImages
  ? 'Uploading...'
  : (editingPost ? 'Update Article' : 'Publish News')}
                </button>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}