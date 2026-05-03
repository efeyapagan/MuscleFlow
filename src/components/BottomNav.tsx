'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, TrendingUp } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workouts', label: 'Antrenmanlar', icon: Dumbbell },
  { href: '/progress', label: 'İlerleme', icon: TrendingUp },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800">
      <div className="flex items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 pt-3 pb-4 text-xs font-medium transition-colors relative ${
                active ? 'text-orange-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-orange-500" />
              )}
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
