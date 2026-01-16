'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AdminSidebar from '@/components/AdminSidebar'
import { FiGrid, FiList, FiSearch, FiTrash2, FiEdit3 } from 'react-icons/fi' 

const SERVICE_TYPES = [
  "Custom Furniture",
  "Kitchen Cabinetry",
  "Restoration",
  "Masjid Woodwork",
  "Special Projects",
  "Others"
];

interface Customer {
  recordID: string;
  name: string;
  phone: string;
  serviceType: string;
  transactionHistory: string;
  created_at?: string;
}

export default function AdminCustomersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table') // Default to table for CRM
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState('All')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const [form, setForm] = useState({ name: '', phone: '', serviceType: 'Custom Furniture', transactionHistory: '' })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/admin/login')
      else {
        fetchCustomers()
        setLoading(false)
      }
    })
  }, [router])

  const fetchCustomers = async () => {
    const { data, error } = await supabase.from('customerRecord').select('*').order('name', { ascending: true })
    if (data) setCustomers(data)
  }

  const resetForm = () => {
    setForm({ name: '', phone: '', serviceType: 'Custom Furniture', transactionHistory: '' })
    setErrors([])
  }

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer)
    setForm({
      name: customer.name,
      phone: customer.phone,
      serviceType: customer.serviceType,
      transactionHistory: customer.transactionHistory
    })
    setErrors([]) 
  }

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    setIsProcessing(true)
    try {
      const { error } = await supabase.from('customerRecord').update({
        name: form.name,
        phone: form.phone,
        serviceType: form.serviceType,
        transactionHistory: form.transactionHistory
      }).eq('recordID', editingCustomer.recordID)

      if (error) throw error
      alert("Customer record updated!"); setEditingCustomer(null); fetchCustomers(); resetForm();
    } catch (err: any) { alert(err.message) } finally { setIsProcessing(false) }
  }

  const handleAddCustomer = async () => {
    const newErrors: string[] = []
    if (!form.name.trim()) newErrors.push('name')
    if (!form.phone.trim()) newErrors.push('phone')
    if (!form.transactionHistory.trim()) newErrors.push('history')

    if (newErrors.length > 0) { setErrors(newErrors); return; }

    setIsProcessing(true)
    try {
      const { error } = await supabase.from('customerRecord').insert([form])
      if (error) throw error
      resetForm(); fetchCustomers(); setShowSuccessModal(true)
    } catch (err: any) { alert(err.message) } finally { setIsProcessing(false) }
  }

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    const matchesService = selectedService === 'All' || c.serviceType === selectedService;
    return matchesSearch && matchesService;
  });

  if (loading) return <div className="p-10 text-center font-bold">Loading CRM...</div>

  return (
    <div className="flex min-h-screen bg-[#f5efe6]">
      <AdminSidebar />
      <main className="flex-1 p-8">
        
        {/* SUCCESS MODAL - Matches Product Style */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-amber-100">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">✓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful</h3>
              <div className="flex flex-col gap-3">
                <button onClick={() => { setShowSuccessModal(false); setActiveTab('view'); }} className="bg-amber-700 text-white font-bold py-3 rounded-xl hover:bg-amber-800 transition-all">View CRM List</button>
                <button onClick={() => setShowSuccessModal(false)} className="text-gray-500 font-semibold py-2">Add Another</button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL POPUP - Matches Product Style */}
        {editingCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 max-w-4xl w-full relative border border-amber-100 shadow-2xl">
              <button onClick={() => setEditingCustomer(null)} className="absolute top-4 right-6 text-gray-400 hover:text-red-500 text-3xl">&times;</button>
              <h2 className="text-2xl font-bold text-amber-900 mb-6 border-b pb-4 uppercase tracking-tighter italic">Update Customer Data</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div><label className="text-xs font-bold text-gray-400 uppercase">Customer Name</label>
                  <input className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                  <input className="w-full border p-3 border-gray-900 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                </div>

                <div className="space-y-6">
                  <div><label className="text-xs font-bold text-amber-800 uppercase block mb-2">Service Type</label>
                  <select className="w-full border p-3 border-gray-900 rounded-xl bg-white outline-none" value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})}>
                    {SERVICE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select></div>
                  
                  <div><label className="text-xs font-bold text-amber-800 uppercase block mb-2">Transaction/Project History</label>
                  <textarea className="w-full border p-3 border-gray-900 rounded-xl h-32 mt-1 outline-none focus:ring-2 focus:ring-amber-500" value={form.transactionHistory} onChange={e => setForm({...form, transactionHistory: e.target.value})} /></div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                <button onClick={() => setEditingCustomer(null)} className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                <button onClick={handleUpdateCustomer} disabled={isProcessing} className={`px-12 py-3 rounded-xl font-bold text-white shadow-lg ${isProcessing ? 'bg-gray-300' : 'bg-amber-700 hover:bg-amber-800 transition-all'}`}>Save Updates</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls - Exactly like Product Management */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 tracking-tight">Customer Management</h1>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-amber-100">
            <button onClick={() => setActiveTab('view')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'view' ? 'bg-amber-700 text-white shadow-md' : 'text-amber-800 hover:bg-amber-50'}`}>View All</button>
            <button onClick={() => setActiveTab('add')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'add' ? 'bg-amber-700 text-white shadow-md' : 'text-amber-800 hover:bg-amber-50'}`}>Add New</button>
          </div>
        </div>

        {/* --- VIEW ALL TAB --- */}
        {activeTab === 'view' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 items-center w-full">
              <select className="h-12 px-4 border border-amber-100 rounded-xl bg-white text-amber-900 font-semibold outline-none focus:ring-2 focus:ring-amber-500 shadow-sm min-w-[180px]" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                <option value="All">All Services</option>
                {SERVICE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <div className="relative flex-1 w-full">
                <input type="text" placeholder="Search customer name or phone..." className="w-full h-12 pl-4 pr-4 bg-white border border-amber-100 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-amber-50 border-b border-amber-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Customer Name</th>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Phone</th>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest">Primary Service</th>
                      <th className="p-4 text-xs font-bold text-amber-900 uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map(c => (
                      <tr key={c.recordID} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-sm text-[#3d2b1f]">{c.name}</td>
                        <td className="p-4 text-sm text-gray-600 font-medium">{c.phone}</td>
                        <td className="p-4 font-bold text-amber-700 text-sm">{c.serviceType}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => openEditModal(c)} className="text-amber-600 font-bold text-xs hover:underline flex items-center justify-center gap-1 mx-auto"><FiEdit3 /> Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        )}

        {/* --- ADD CUSTOMER TAB - Exactly like Add Product --- */}
        {activeTab === 'add' && (
          <div className="bg-white p-8 rounded-2xl shadow-md border border-amber-100 max-w-5xl mx-auto">
             <h2 className="text-2xl font-bold mb-6 text-amber-900 underline underline-offset-8 decoration-amber-200 uppercase tracking-tighter italic">Register New Customer</h2>
             {errors.length > 0 && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-bold">⚠️ Please fill up the required fields highlighted in red.</div>}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Customer Full Name</label>
                  <input className={`w-full border p-3 rounded-xl mt-1 outline-none border-gray-900 transition-colors ${errors.includes('name') ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-amber-500'}`} value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  
                  <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Phone Number</label>
                  <input className={`w-full border p-3 rounded-xl mt-1 outline-none border-gray-900 transition-colors ${errors.includes('phone') ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-amber-500'}`} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                </div>
                
                <div className="space-y-4">
                  <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Primary Service Requested</label>
                  <select className="w-full border border-gray-900 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-500 mt-1" value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})}>
                    {SERVICE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select></div>

                  <div><label className="text-xs font-bold text-gray-400 uppercase ml-1">Project/Transaction History</label>
                  <textarea className={`w-full border p-3 rounded-xl h-32 mt-1 outline-none border-gray-900 transition-colors ${errors.includes('history') ? 'border-red-500 bg-red-50' : 'focus:ring-2 focus:ring-amber-500'}`} placeholder="Provide details of products ordered or services rendered..." value={form.transactionHistory} onChange={e => setForm({...form, transactionHistory: e.target.value})} /></div>
                </div>
             </div>
             <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                <button onClick={resetForm} className="px-8 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 border border-gray-200">Reset Form</button>
                <button onClick={handleAddCustomer} disabled={isProcessing} className={`px-12 py-4 rounded-xl font-bold text-white shadow-xl ${isProcessing ? 'bg-gray-300' : 'bg-amber-700 hover:bg-amber-800 transition-all'}`}>
                  {isProcessing ? 'Processing...' : 'Register Customer'}
                </button>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}