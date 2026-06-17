'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AdminSidebar from '@/components/AdminSidebar'


export default function SettingsPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
 const [currentPassword, setCurrentPassword] = useState('')

  const [textSize, setTextSize] = useState('medium')
  const [darkMode, setDarkMode] = useState(false)
  const [showEmailChange, setShowEmailChange] = useState(false)
const [showPasswordChange, setShowPasswordChange] = useState(false)


  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/admin/login')
      } else {
        setEmail(session.user.email || '')
      }
    }

    loadUser()

    const savedTextSize = localStorage.getItem('textSize')
    const savedDarkMode = localStorage.getItem('darkMode')
   

    if (savedTextSize) setTextSize(savedTextSize)
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true')
    }, [router])

 const handleEmailUpdate = async () => {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  })

  if (error) {
    alert(error.message)
  } else {
    alert(
      'Verification email sent to your new email address.'
    )

    setNewEmail('')
    setShowEmailChange(false)
  }
}

const handlePasswordUpdate = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      alert('User not found.')
      return
    }

    // Verify current password
    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

    if (signInError) {
      alert('Current password is incorrect.')
      return
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Password updated successfully!')

      setCurrentPassword('')
      setNewPassword('')
      setShowPasswordChange(false)
    }
  } catch (err) {
    console.error(err)
    alert('Something went wrong.')
  }
}

  const saveAccessibility = () => {
    localStorage.setItem('textSize', textSize)
    localStorage.setItem('darkMode', String(darkMode))
  
    alert('Preferences saved!')
  }

return (
  <div className="flex min-h-screen bg-[#f5efe6]">
    
    <AdminSidebar />

    <main className="flex-1 px-6 md:px-12 py-10 overflow-y-auto">



    

      {/* HEADER */}
      <div className="mb-14">
        <p className="uppercase tracking-[0.3em] text-xs text-[#9b7b5f] font-semibold mb-3">
          Admin Preferences
        </p>

        <h1 className="text-5xl font-serif font-bold text-[#2f241d]">
          Settings
        </h1>
      </div>

      {/* ACCOUNT */}
      <section
        id="account"
        className="bg-white rounded-[2rem] p-10 shadow-sm border border-stone-200 mb-10"
      >
        <h2 className="text-2xl font-serif font-bold text-[#2f241d] mb-8">
          Account
        </h2>

        {/* EMAIL */}
        <div className="border-b border-stone-200 pb-8 mb-8">

          <p className="text-sm text-stone-500 mb-2">
            Current Email
          </p>

          <div className="flex items-center justify-between">
            <p className="font-semibold text-lg">
              {email}
            </p>

            <button
              onClick={() =>
                setShowEmailChange(!showEmailChange)
              }
              className="text-sm font-bold text-amber-700 hover:underline"
            >
              Change Email
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              showEmailChange
                ? 'max-h-96 mt-6'
                : 'max-h-0'
            }`}
          >
           <input
  type="password"
  placeholder="Enter current password"
  value={currentPassword}
  onChange={(e) =>
    setCurrentPassword(e.target.value)
  }
  className="w-full border border-stone-300 rounded-2xl px-5 py-4 mb-4"
/>
            <input
            type="email"
            placeholder="Enter new email"
            value={newEmail}
            onChange={(e) =>
                setNewEmail(e.target.value)
            }
            className="w-full border border-stone-300 rounded-2xl px-5 py-4 mb-4"
            />
            <button
              onClick={handleEmailUpdate}
              className="bg-[#3d2b1f] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#5b3f2f] transition"
            >
              Update Email
            </button>
          </div>
        </div>

        {/* PASSWORD */}
        <div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">
                Password
              </p>

              <p className="text-sm text-stone-500 mt-1">
                Secure your admin account
              </p>
            </div>

            <button
              onClick={() =>
                setShowPasswordChange(!showPasswordChange)
              }
              className="text-sm font-bold text-amber-700 hover:underline"
            >
              Change Password
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              showPasswordChange
                ? 'max-h-40 mt-6'
                : 'max-h-0'
            }`}
          >
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className="w-full border border-stone-300 rounded-2xl px-5 py-4 mb-4"
            />

            <button
              onClick={handlePasswordUpdate}
              className="bg-[#3d2b1f] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#5b3f2f] transition"
            >
              Update Password
            </button>
          </div>
        </div>
      </section>

      {/* ACCESSIBILITY */}
      <section
        id="accessibility"
        className="bg-white rounded-[2rem] p-10 shadow-sm border border-stone-200"
      >
        <h2 className="text-2xl font-serif font-bold text-[#2f241d] mb-8">
          Accessibility & Appearance
        </h2>

        {/* TEXT SIZE */}
        <div className="mb-12">

          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-semibold text-lg">
                Text Size
              </p>

              <p className="text-sm text-stone-500">
                Adjust admin interface readability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">

            <span className="text-sm">A</span>

            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={
                textSize === 'small'
                  ? 0
                  : textSize === 'medium'
                  ? 1
                  : 2
              }
              onChange={(e) => {
                const value = Number(e.target.value)

                if (value === 0)
                  setTextSize('small')

                if (value === 1)
                  setTextSize('medium')

                if (value === 2)
                  setTextSize('large')
              }}
              className="w-full accent-[#3d2b1f]"
            />

            <span className="text-3xl">A</span>
          </div>
        </div>

        {/* DARK MODE */}
        <div className="flex items-center justify-between">

          <div>
            <p className="font-semibold text-lg">
              Dark Mode
            </p>

            <p className="text-sm text-stone-500">
              Switch interface appearance
            </p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-16 h-9 rounded-full flex items-center p-1 transition-all duration-300 ${
              darkMode
                ? 'bg-[#3d2b1f]'
                : 'bg-stone-300'
            }`}
          >
            <div
              className={`w-7 h-7 bg-white rounded-full shadow-md transition-all duration-300 ${
                darkMode
                  ? 'translate-x-7'
                  : ''
              }`}
            />
          </button>
        </div>

        {/* SAVE BUTTON */}
        <div className="mt-12">
          <button
            onClick={saveAccessibility}
            className="bg-[#3d2b1f] text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-[#5b3f2f] transition"
          >
            Save Preferences
          </button>
        </div>
      </section>
    </main>
  </div>
)   
  }
