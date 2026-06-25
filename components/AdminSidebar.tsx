'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  FiHome,
  FiUsers,
  FiBox,
  FiLogOut,
  FiFileText,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiBarChart2
} from 'react-icons/fi'

export default function AdminSidebar() {
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('adminSidebarOpen')

    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState))
    }

    // Enable animation after initial render
    const timer = setTimeout(() => {
      setHasMounted(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const toggleSidebar = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem(
      'adminSidebarOpen',
      JSON.stringify(newState)
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside
      className={`
        bg-white shadow-lg sticky top-0 h-screen shrink-0 overflow-hidden
        ${hasMounted ? 'transition-all duration-500 ease-in-out' : ''}
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      <div className="flex flex-col h-full">

        {/* Toggle Button */}
        <div
          className={`
            flex p-4 border-b
            ${isOpen ? 'justify-end' : 'justify-center'}
          `}
        >
          <button
            onClick={toggleSidebar}
            className="text-2xl text-gray-600 hover:text-amber-700 transition-all duration-300 hover:scale-110"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Profile Section */}
        <div className="border-b">
          <div
            className={`
              overflow-hidden
              ${hasMounted ? 'transition-all duration-500 ease-in-out' : ''}
              ${isOpen ? 'max-h-60 opacity-100 p-6' : 'max-h-0 opacity-0 p-0'}
            `}
          >
            <img
              src="/logo.jpeg"
              alt="Admin Profile"
              className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-2 border-amber-100 shadow-sm"
            />

            <h3 className="font-semibold text-lg text-[#3d2b1f] font-serif text-center">
              Admin Portal
            </h3>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-3 font-medium text-gray-600">

<li>

  {/* Dashboard Button */}
  <div
    className={`
      flex items-center cursor-pointer rounded-lg p-3
      hover:bg-gray-100 hover:text-amber-700
      transition-all duration-300
      ${isOpen ? 'gap-3 justify-start' : 'justify-center'}
    `}
    onClick={() => router.push('/admin/dashboard')}
  >
    <FiHome size={20} />
    {isOpen && <span>Dashboard</span>}
  </div>

  {/* Analytics Buttons */}
  {isOpen && (
    <div className="ml-10 mt-1 space-y-2">

      <button
        onClick={() => router.push('/admin/product-analysis')}
        className="w-full text-left text-xs px-3 py-2 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
      >
        Product Analytics
      </button>

      <button
        onClick={() => router.push('/admin/news-analysis')}
        className="w-full text-left text-xs px-3 py-2 rounded-lg bg-green-50 text-green-800 hover:bg-green-100 transition"
      >
        News Analytics
      </button>

    </div>
  )}

</li>

            <li
              className={`
                flex items-center cursor-pointer rounded-lg p-3
                hover:bg-gray-100 hover:text-amber-700
                transition-all duration-300
                ${isOpen ? 'gap-3 justify-start' : 'justify-center'}
              `}
              onClick={() => router.push('/admin/customers')}
            >
              <FiUsers size={20} />
              {isOpen && <span>Customer Management</span>}
            </li>

            <li
              className={`
                flex items-center cursor-pointer rounded-lg p-3
                hover:bg-gray-100 hover:text-amber-700
                transition-all duration-300
                ${isOpen ? 'gap-3 justify-start' : 'justify-center'}
              `}
              onClick={() => router.push('/admin/products')}
            >
              <FiBox size={20} />
              {isOpen && <span>Product Management</span>}
            </li>

            <li
              className={`
                flex items-center cursor-pointer rounded-lg p-3
                hover:bg-gray-100 hover:text-amber-700
                transition-all duration-300
                ${isOpen ? 'gap-3 justify-start' : 'justify-center'}
              `}
              onClick={() => router.push('/admin/NewsEvent')}
            >
              <FiFileText size={20} />
              {isOpen && <span>News & Events</span>}
            </li>

          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className={`
              flex items-center rounded-lg p-3 w-full
              text-red-500 hover:text-red-700 hover:bg-red-50
              transition-all duration-300
              ${isOpen ? 'gap-3 justify-start' : 'justify-center'}
            `}
          >
            <FiLogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>

      </div>
    </aside>
  )
}