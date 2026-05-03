'use client'

import { signIn } from 'next-auth/react'
import { Flame } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl shadow-orange-500/25 mb-4">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SportTrack</h1>
          <p className="text-zinc-400 text-sm mt-1">Antrenmanlarına giriş yap</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              signIn('credentials', {
                email: fd.get('email'),
                password: fd.get('password'),
                callbackUrl: '/',
              })
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">E-posta</label>
              <input
                name="email"
                type="email"
                placeholder="ornek@mail.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Şifre</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-orange-500/20 mt-1"
            >
              Giriş Yap
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">SportTrack · 2025</p>
      </div>
    </div>
  )
}
