import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { WorkoutProvider } from '@/lib/WorkoutContext'
import AuthProvider from '@/components/AuthProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SportTrack — Antrenman Takibi',
  description: 'Antrenmanlarını takip et, ilerleni gör.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased">
        <AuthProvider>
        <WorkoutProvider>
          <div className="flex">
            <Sidebar />
            {/* Main content — offset for sidebar on desktop, padded bottom for mobile nav */}
            <main className="flex-1 md:ml-64 min-h-screen pb-20 md:pb-0">
              {children}
            </main>
          </div>
        </WorkoutProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
