'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { FiHome, FiUsers, FiBox, FiSettings, FiLogOut, FiEdit, FiFileText } from 'react-icons/fi'

export default function AdminSidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col sticky top-0 h-screen overflow-y-auto shrink-0">
      
      {/* Profile */}
      <div className="p-6 border-b text-center shrink-0">
        <img
          src="/logo.jpeg" 
          alt="Admin Profile"
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-amber-100 shadow-sm"
        />
        <h3 className="font-semibold text-lg text-[#3d2b1f] font-serif">Admin Portal</h3>
        <button
          onClick={() => router.push('/admin/profile')}
          className="mt-3 flex items-center justify-center gap-2 text-sm text-amber-700 hover:text-amber-900 mx-auto transition-colors"
        >
          <FiEdit />
          Edit Profile
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <ul className="space-y-4 font-medium text-gray-600">
          <li 
            className="flex items-center gap-3 cursor-pointer hover:text-amber-700 transition-colors" 
            onClick={() => router.push('/admin/dashboard')}
          >
            <FiHome />
            Dashboard
          </li>

          <li 
            className="flex items-center gap-3 cursor-pointer hover:text-amber-700 transition-colors" 
            onClick={() => router.push('/admin/customers')}
          >
            <FiUsers />
            Customer Management
          </li>
          
          <li 
            className="flex items-center gap-3 cursor-pointer hover:text-amber-700 transition-colors" 
            onClick={() => router.push('/admin/products')}
          >
            <FiBox />
            Product Management
          </li>

          {/* Matches folder: app/admin/NewsEvent/page.tsx */}
          <li 
            className="flex items-center gap-3 cursor-pointer hover:text-amber-700 transition-colors" 
            onClick={() => router.push('/admin/NewsEvent')}
          >
            <FiFileText />
            News & Events
          </li>

          <li 
            className="flex items-center gap-3 cursor-pointer hover:text-amber-700 transition-colors" 
            onClick={() => router.push('/admin/settings')}
          >
            <FiSettings />
            Settings
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-6 border-t shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors font-bold text-sm"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </aside>
  )
}