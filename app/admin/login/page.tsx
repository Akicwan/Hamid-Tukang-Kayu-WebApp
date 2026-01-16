'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/admin/dashboard')
    }
  }

  return (
    // Background is now a clean solid color (#f5efe6) as per your design
    <div className="flex items-center justify-center min-h-screen bg-[#f5efe6] relative overflow-hidden font-sans">
      
      {/* Background pattern div was removed from here */}

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Minimalist Login Container - Design remains unchanged */}
        <div className="bg-white rounded-lg shadow-[0_10px_40px_rgba(61,43,31,0.08)] p-10 border border-stone-200/50">
          
          {/* Top Branding - Minimal Circular Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full border border-stone-100 p-2 shadow-sm">
              <img 
                src="/logo.jpeg" 
                alt="Hamid Tukang Kayu" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl font-serif text-[#3d2b1f] tracking-tight uppercase">Admin Login</h1>
            <div className="w-8 h-[2px] bg-amber-600 mx-auto mt-2"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Minimalist Input - Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:border-[#3d2b1f] outline-none transition-all text-sm text-[#3d2b1f]"
                placeholder="admin@hamid.com"
                required
              />
            </div>

            {/* Minimalist Input - Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:border-[#3d2b1f] outline-none transition-all text-sm text-[#3d2b1f]"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-stone-400 hover:text-amber-700 uppercase tracking-tighter"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="py-2 px-3 bg-red-50 rounded border border-red-100">
                <p className="text-red-600 text-[11px] font-medium leading-tight">{error}</p>
              </div>
            )}

            <button className="w-full bg-[#3d2b1f] text-white py-4 rounded-md text-xs font-bold tracking-[0.3em] hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98]">
              SIGN IN
            </button>
          </form>

          <p className="text-center text-[9px] text-stone-400 mt-10 uppercase tracking-widest font-medium">
            &copy; 2026 Hamid Tukang Kayu &bull; Batu Pahat
          </p>
        </div>
      </div>
    </div>
  )
}