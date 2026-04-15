'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AdminSidebar from '@/components/AdminSidebar'
import { FiGrid, FiList, FiTrash2 } from 'react-icons/fi' 

const CATEGORY_MAP: Record<string, string[]> = {
  "Dining Room": ["Dining Table", "Dining Chairs", "Dining Table Sets"],
  "Living Room": ["Coffee Table", "Sofa", "Console Table"],
  "Bedroom": ["Beds", "Dressing Table", "Wardrobe"],
  "Cabinet": ["Display Cabinet", "Book Cabinet", "Kitchen Cabinet"],
  "Masjid": [],
  "Others": ["Rehal", "Tongkat", "Cermin"],
  "Special Projects": ["Mahkamah Shariah", "Kerusi Diraja", "Kerusi Chancellor", "Tapak Cokmar", "Rostrum Diraja"]
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sub_category: string;
  image: string;
  additional_images: string[];
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Dining Room', sub_category: '' })
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/admin/login')
      else {
        fetchProducts()
        setLoading(false)
      }
    })
  }, [router])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
  }

  const resetForm = () => {
    setMainImagePreview(null)
    setAdditionalImagePreviews([])
    setForm({ name: '', description: '', price: '', category: 'Dining Room', sub_category: '' })
    setMainImage(null); setAdditionalImages([]); setErrors([]);
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(input => { input.value = ''; });
  }

  const uploadImage = async (file: File): Promise<string> => {

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return data.publicUrl
  }


  const handleMainImageChange = (file: File | null) => {
  setMainImage(file)
  setMainImagePreview(file ? URL.createObjectURL(file) : null)
  setErrors(errors.filter(err => err !== 'mainImage'))
}

const handleAdditionalImagesChange = (files: File[]) => {
  setAdditionalImages(files)
  setAdditionalImagePreviews(files.map(file => URL.createObjectURL(file)))
}

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      sub_category: product.sub_category || ''
    })
    setErrors([]) 
  }

  // --- DELETE LOGIC ---
  const handleDeleteProduct = async () => {
    if (!editingProduct) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${editingProduct.name}"? This action cannot be undone.`);
    
    if (confirmDelete) {
      setIsUploading(true);
      try {
        const { error } = await supabase.from('products').delete().eq('id', editingProduct.id);
        if (error) throw error;
        
        alert("Product deleted successfully");
        setEditingProduct(null);
        fetchProducts();
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsUploading(false);
      }
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    setIsUploading(true)
    try {
      let finalMainUrl = editingProduct.image;
      if (mainImage) finalMainUrl = await uploadImage(mainImage);
      
      let finalAdditionalUrls = editingProduct.additional_images || [];
      if (additionalImages.length > 0) {
        const newUrls = await Promise.all(additionalImages.map(img => uploadImage(img)));
        finalAdditionalUrls = [...finalAdditionalUrls, ...newUrls];
      }

      const { error } = await supabase.from('products').update({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        sub_category: form.sub_category,
        image: finalMainUrl,
        additional_images: finalAdditionalUrls
      }).eq('id', editingProduct.id)

      if (error) throw error
      alert("Product updated!"); setEditingProduct(null); fetchProducts(); resetForm();
    } catch (err: any) { alert(err.message) } finally { setIsUploading(false) }
  }

  const handleAddProduct = async () => {
    const newErrors: string[] = []
    if (!form.name.trim()) newErrors.push('name')
    if (!form.price || Number(form.price) <= 0) newErrors.push('price')
    if (!form.description.trim()) newErrors.push('description')
    if (!mainImage) newErrors.push('mainImage')
    if (!form.sub_category) newErrors.push('sub_category')

    if (newErrors.length > 0) { setErrors(newErrors); return; }

    setIsUploading(true)
    try {
      const mainImageUrl = await uploadImage(mainImage!)
      const additionalUrls = await Promise.all(additionalImages.map(img => uploadImage(img)))
      const { error } = await supabase.from('products').insert([{
        ...form, price: Number(form.price), image: mainImageUrl, additional_images: additionalUrls
      }])
      if (error) throw error
      resetForm(); fetchProducts(); setShowSuccessModal(true)
    } catch (err: any) { alert(err.message) } finally { setIsUploading(false) }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesToDisplay = selectedCategory === 'All' ? Object.keys(CATEGORY_MAP) : [selectedCategory];

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>

  return (
    <div className="flex min-h-screen bg-[#f5efe6]">
      <AdminSidebar />
      <main className="flex-1 p-8">
        
        {/* SUCCESS MODAL */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-amber-100">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">✓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <div className="flex flex-col gap-3">
                <button onClick={() => { setShowSuccessModal(false); setActiveTab('view'); }} className="bg-amber-700 text-white font-bold py-3 rounded-xl hover:bg-amber-800 transition-all">View List</button>
                <button onClick={() => setShowSuccessModal(false)} className="text-gray-500 font-semibold py-2">Add Another</button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL POPUP */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 max-w-4xl w-full relative border border-amber-100 shadow-2xl">
              <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-6 text-gray-400 hover:text-red-500 text-3xl">&times;</button>
              <h2 className="text-2xl font-bold text-amber-900 mb-6 border-b pb-4 uppercase tracking-tighter italic">Edit Product</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div><label className="text-xs font-bold text-gray-400 uppercase">Product Name</label>
                  <input className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                  <select className="w-full border border-gray-900 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-500" value={form.category} onChange={e => {setForm({...form, category: e.target.value, sub_category: ''})}}>
                    {Object.keys(CATEGORY_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select></div>
                  <div><label className="text-xs font-bold text-gray-400 uppercase">Price (RM)</label>
                  <input type="number" className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                  <textarea className="w-full border p-3 border-gray-900 rounded-xl h-32 mt-1 outline-none focus:ring-2 focus:ring-amber-500" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                </div>

<div className="space-y-6">
  <div>
    <label className="text-xs font-bold text-amber-800 uppercase block mb-2">
      Select Sub-Category
    </label>
    <select
      className="w-full border p-3 border-gray-900 rounded-xl bg-white outline-none"
      value={form.sub_category}
      onChange={e => setForm({ ...form, sub_category: e.target.value })}
    >
      <option value="">Select Sub-Category...</option>
      {CATEGORY_MAP[form.category]?.map(sub => (
        <option key={sub} value={sub}>{sub}</option>
      ))}
    </select>
  </div>

  <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
    <label className="text-xs font-bold text-amber-800 uppercase block mb-2">
      Change Main Image
    </label>
    <input
      type="file"
      accept="image/*"
      className="w-full text-sm"
      onChange={e => handleMainImageChange(e.target.files?.[0] || null)}
    />

    <div className="mt-4">
      <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Main Image</p>
      <img
        src={mainImagePreview || editingProduct.image}
        alt="Current main product"
        className="w-full h-48 object-cover rounded-xl border border-amber-100 shadow-sm"
      />
    </div>
  </div>

  <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
    <label className="text-xs font-bold text-amber-800 uppercase block mb-2">
      Add New Gallery Images
    </label>
    <input
      type="file"
      accept="image/*"
      multiple
      className="w-full text-sm"
      onChange={e => handleAdditionalImagesChange(Array.from(e.target.files || []))}
    />

    {editingProduct.additional_images?.length > 0 && (
      <p className="text-[10px] text-gray-500 mt-2 italic font-semibold uppercase">
        Current Gallery: {editingProduct.additional_images.length} images
      </p>
    )}

    {additionalImagePreviews.length > 0 && (
      <div className="mt-4">
        <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">
          New Gallery Preview ({additionalImagePreviews.length})
        </p>
        <div className="grid grid-cols-2 gap-3">
          {additionalImagePreviews.map((preview, index) => (
            <img
              key={index}
              src={preview}
              alt={`New gallery preview ${index + 1}`}
              className="w-full h-24 object-cover rounded-xl border border-amber-100"
            />
          ))}
        </div>
      </div>
    )}
  </div>
</div>
              </div>

              <div className="mt-8 pt-6 border-t flex justify-between items-center">
                {/* DELETE BUTTON */}
                <button 
                  onClick={handleDeleteProduct} 
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  <FiTrash2 /> Delete Product
                </button>

                <div className="flex gap-4">
                  <button onClick={() => setEditingProduct(null)} className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                  <button onClick={handleUpdateProduct} disabled={isUploading} className={`px-12 py-3 rounded-xl font-bold text-white shadow-lg ${isUploading ? 'bg-gray-300' : 'bg-amber-700 hover:bg-amber-800 transition-all'}`}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 tracking-tight">Product Management</h1>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-amber-100">
            <button onClick={() => setActiveTab('view')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'view' ? 'bg-amber-700 text-white shadow-md' : 'text-amber-800 hover:bg-amber-50'}`}>View All</button>
            <button onClick={() => setActiveTab('add')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'add' ? 'bg-amber-700 text-white shadow-md' : 'text-amber-800 hover:bg-amber-50'}`}>Add New</button>
          </div>
        </div>

        {/* --- VIEW ALL TAB --- */}
        {activeTab === 'view' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 items-center w-full">
              <select className="h-12 px-4 border border-amber-100 rounded-xl bg-white text-amber-900 font-semibold outline-none focus:ring-2 focus:ring-amber-500 shadow-sm min-w-[180px]" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {Object.keys(CATEGORY_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="relative flex-1 w-full">
                <input type="text" placeholder="Search product name..." className="w-full h-12 pl-4 pr-4 bg-white border border-amber-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex bg-white p-1 rounded-xl border border-amber-100 shadow-sm h-12">
                <button onClick={() => setViewMode('grid')} className={`px-4 rounded-lg transition ${viewMode === 'grid' ? 'bg-amber-100 text-amber-700' : 'text-gray-400'}`}><FiGrid size={20}/></button>
                <button onClick={() => setViewMode('table')} className={`px-4 rounded-lg transition ${viewMode === 'table' ? 'bg-amber-100 text-amber-700' : 'text-gray-400'}`}><FiList size={20}/></button>
              </div>
            </div>

            {viewMode === 'grid' && (
              <div className="space-y-12">
                {categoriesToDisplay.map(category => {
                  const categoryProducts = filteredProducts.filter(p => p.category === category);
                  if (categoryProducts.length === 0) return null;
                  return (
                    <section key={category}>
                      <div className="flex items-center gap-4 mb-6"><h2 className="text-xl font-black text-amber-900 uppercase tracking-widest">{category}</h2><div className="h-[2px] flex-1 bg-amber-100 rounded-full"></div></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categoryProducts.map(p => (
                          <div key={p.id} onClick={() => openEditModal(p)} className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden hover:border-amber-500 cursor-pointer group transition-all relative">
                            <img src={p.image} className="w-full h-44 object-cover" alt={p.name} />
                            <div className="p-4">
                              <h3 className="font-bold text-gray-900 line-clamp-1">{p.name}</h3>
                              <p className="text-amber-700 font-bold text-sm mt-1">RM {p.price}</p>
                              <div className="mt-2"><span className="text-[9px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded border border-gray-100">#{p.sub_category}</span></div>
                              <div className="mt-4 pt-3 border-t flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">✎ Click to Edit</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {viewMode === 'table' && (
              <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-amber-50 border-b border-amber-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Product</th>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Category</th>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest text-center">Price</th>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4"><div className="flex items-center gap-3"><img src={p.image} className="w-10 h-10 object-cover rounded-lg border border-gray-100" /><span className="font-bold text-sm">{p.name}</span></div></td>
                        <td className="p-4 text-sm text-gray-600 font-medium">{p.category}</td>
                        <td className="p-4 text-center font-bold text-amber-700 text-sm">RM {p.price}</td>
                        <td className="p-4 text-center"><button onClick={() => openEditModal(p)} className="text-amber-600 font-bold text-xs hover:underline">Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- ADD PRODUCT TAB --- */}
        {activeTab === 'add' && (
          <div className="bg-white p-8 rounded-2xl shadow-md border border-amber-100 max-w-5xl mx-auto">
             <h2 className="text-2xl font-bold mb-6 text-amber-900 underline underline-offset-8 decoration-amber-200 uppercase tracking-tighter italic">Product Details</h2>
             {errors.length > 0 && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-bold">⚠️ Please fill up the required information highlighted below.</div>}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Product Name</label>
                 <input className={`w-full border p-3 rounded-xl mt-1 outline-none border-gray-900 transition-colors ${errors.includes('name') ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-amber-500'}`} value={form.name} onChange={e => {setForm({...form, name: e.target.value}); setErrors(errors.filter(err => err !== 'name'))}} /></div>
                 <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Category</label>
                 <select className="w-full border border-gray-900 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-500 mt-1" value={form.category} onChange={e => {setForm({...form, category: e.target.value, sub_category: ''}); setErrors(errors.filter(err => err !== 'category'))}}>
                   {Object.keys(CATEGORY_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                 </select></div>
                 <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Price (RM)</label>
                 <input type="number" className={`w-full border p-3 rounded-xl mt-1 outline-none border-gray-900 transition-colors ${errors.includes('price') ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-amber-500'}`} value={form.price} onChange={e => {setForm({...form, price: e.target.value}); setErrors(errors.filter(err => err !== 'price'))}} /></div>
                 <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Description</label>
                 <textarea className={`w-full border p-3 rounded-xl h-32 mt-1 outline-none border-gray-900 transition-colors ${errors.includes('description') ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-amber-500'}`} value={form.description} onChange={e => {setForm({...form, description: e.target.value}); setErrors(errors.filter(err => err !== 'description'))}} /></div>
               </div>
               <div className="space-y-6">
                 <div className={`p-4 rounded-xl border-2 border-dashed transition-colors ${errors.includes('mainImage') ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-300'}`}>
                   <label className="text-xs font-bold text-amber-800 uppercase block mb-2">Main Product Image</label>
                   <input
                      type="file"
                      accept="image/*"
                      className="w-full text-sm"
                      onChange={e => handleMainImageChange(e.target.files?.[0] || null)}
                    />
                 </div>

                {mainImagePreview && (
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Main Image Preview</p>
                    <img
                      src={mainImagePreview}
                      alt="Main preview"
                      className="w-full h-56 object-cover rounded-xl border border-amber-100 shadow-sm"
                    />
                  </div>
                )}
                 <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
                   <label className="text-xs font-bold text-amber-800 uppercase block mb-2">Additional Gallery Images</label>
                  <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="w-full text-sm"
                      onChange={e => handleAdditionalImagesChange(Array.from(e.target.files || []))}
                    />
                 </div>
                 {additionalImagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">
                      Gallery Preview ({additionalImagePreviews.length})
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {additionalImagePreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Gallery preview ${index + 1}`}
                          className="w-full h-28 object-cover rounded-xl border border-amber-100 shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
               </div>
               <div className={`md:col-span-2 p-6 rounded-2xl border transition-colors ${errors.includes('sub_category') ? 'border-red-500 bg-red-50' : 'bg-amber-50/50 border-amber-100'}`}>
                 <label className="text-sm font-bold text-amber-900 block mb-2 tracking-wide">Select Sub-Category</label>
                 <select className="w-full border border-gray-900 p-3 rounded-xl outline-none bg-white shadow-sm" value={form.sub_category} onChange={e => {setForm({...form, sub_category: e.target.value}); setErrors(errors.filter(err => err !== 'sub_category'))}}>
                   <option value="">Select Sub-Category...</option>
                   {CATEGORY_MAP[form.category]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                 </select>
               </div>
             </div>
             <div className="mt-8 pt-6 border-t flex justify-end gap-4">
               <button onClick={resetForm} className="px-8 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 border border-gray-200">Reset Form</button>
               <button onClick={handleAddProduct} disabled={isUploading} className={`px-12 py-4 rounded-xl font-bold text-white shadow-xl ${isUploading ? 'bg-gray-300' : 'bg-amber-700 hover:bg-amber-800 transition-all'}`}>
                 {isUploading ? 'Publishing...' : 'Publish Product'}
               </button>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}