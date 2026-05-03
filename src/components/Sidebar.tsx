'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, TrendingUp, Flame } from 'lucide-react'
import BottomNav from './BottomNav'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workouts', label: 'Antrenmanlar', icon: Dumbbell },
  { href: '/progress', label: 'İlerleme', icon: TrendingUp },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 fixed top-0 left-0 z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">SportTrack</p>
            <p className="text-zinc-500 text-xs">Antrenman Takibi</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-orange-400' : ''}`} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800">
          <p className="text-zinc-600 text-xs">© 2025 SportTrack</p>
        </div>
      </aside>

      <BottomNav />
    </>
  )
}
