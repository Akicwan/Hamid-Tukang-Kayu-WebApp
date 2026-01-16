'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  // Helper function to see if a link is active
  const isActive = (path: string) => pathname === path

  return (
    <nav className="w-full border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            {/* Replaced HTK text with company logo image */}
            <img 
              src="/logo.jpeg" 
              alt="Hamid Tukang Kayu Logo" 
              className="h-12 w-auto object-contain rounded-sm"
            />
            <div className="h-6 w-[1px] bg-stone-200 hidden md:block ml-2"></div>
          </Link>

          {/* Navigation links */}
          <div className="hidden md:flex gap-8 text-[13px] font-bold uppercase tracking-widest">
            <Link 
              href="/products" 
              className={`transition-colors duration-300 ${isActive('/products') ? 'text-amber-700' : 'text-stone-500 hover:text-amber-700'}`}
            >
              Products
            </Link>
            <Link 
              href="/about" 
              className={`transition-colors duration-300 ${isActive('/about') ? 'text-amber-700' : 'text-stone-500 hover:text-amber-700'}`}
            >
              Our Heritage
            </Link>
            <Link 
              href="/events" 
              className={`transition-colors duration-300 ${isActive('/events') ? 'text-amber-700' : 'text-stone-500 hover:text-amber-700'}`}
            >
              News & Events
            </Link>
          </div>
        </div>

        {/* Contact CTA */}
        <Link 
          href="/contact" 
          className="bg-[#3d2b1f] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-tighter hover:bg-stone-800 transition-all shadow-md"
        >
          Contact Us
        </Link>

      </div>
    </nav>
  )
}