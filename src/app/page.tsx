'use client'

import { useState, useMemo } from 'react'
import { Plus, Flame, Clock, Trophy, Zap, TrendingUp, Calendar } from 'lucide-react'
import { useWorkouts } from '@/lib/WorkoutContext'
import WorkoutCard from '@/components/WorkoutCard'
import AddWorkoutModal from '@/components/AddWorkoutModal'
import { WorkoutCategory } from '@/lib/types'

const CATEGORY_EMOJI: Record<WorkoutCategory, string> = {
  Kuvvet: '🏋️',
  Kardiyo: '🏃',
  Esneklik: '🧘',
  HIIT: '⚡',
  Spor: '⚽',
}

function getStartOfWeek() {
  const d = new Date()
  const day = d.getDay() || 7 // treat Sunday (0) as 7 so Monday is always start
  d.setDate(d.getDate() - day + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function calcStreak(workoutDates: string[]): number {
  if (!workoutDates.length) return 0
  const sorted = [...new Set(workoutDates)].sort().reverse()
  let streak = 0
  const current = new Date()
  current.setHours(0, 0, 0, 0)

  for (const dateStr of sorted) {
    const d = current.toISOString().split('T')[0]
    if (dateStr === d) {
      streak++
      current.setDate(current.getDate() - 1)
    } else if (dateStr < d) {
      break
    }
  }
  return streak
}

export default function Dashboard() {
  const { workouts } = useWorkouts()
  const [showModal, setShowModal] = useState(false)

  const weekStart = getStartOfWeek()

  const stats = useMemo(() => {
    const completed = workouts.filter((w) => w.status === 'tamamlandi')
    const thisWeek = completed.filter((w) => new Date(w.date + 'T00:00:00') >= weekStart)
    const totalMinutes = thisWeek.reduce((sum, w) => sum + w.duration, 0)
    const streak = calcStreak(completed.map((w) => w.date))
    return {
      weeklyCount: thisWeek.length,
      weeklyMinutes: totalMinutes,
      streak,
      totalCompleted: completed.length,
    }
  }, [workouts, weekStart])

  const recentWorkouts = useMemo(
    () => [...workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [workouts]
  )

  const categoryBreakdown = useMemo(() => {
    const counts: Partial<Record<WorkoutCategory, number>> = {}
    workouts.forEach((w) => {
      if (w.status === 'tamamlandi') {
        counts[w.category] = (counts[w.category] ?? 0) + 1
      }
    })
    return Object.entries(counts).sort(([, a], [, b]) => b - a) as [WorkoutCategory, number][]
  }, [workouts])

  const totalCategoryCount = categoryBreakdown.reduce((sum, [, n]) => sum + n, 0)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar'

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-zinc-400 text-sm mb-0.5">{greeting} 👋</p>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-orange-500/25"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Antrenman Ekle</span>
          <span className="sm:hidden">Ekle</span>
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          label="Bu Hafta"
          value={String(stats.weeklyCount)}
          unit="antrenman"
          gradient="from-orange-500/10 to-red-500/10"
          border="border-orange-500/20"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-blue-400" />}
          label="Haftalık Süre"
          value={
            stats.weeklyMinutes >= 60
              ? `${Math.floor(stats.weeklyMinutes / 60)}s ${stats.weeklyMinutes % 60}dk`
              : String(stats.weeklyMinutes)
          }
          unit={stats.weeklyMinutes >= 60 ? '' : 'dakika'}
          gradient="from-blue-500/10 to-cyan-500/10"
          border="border-blue-500/20"
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-yellow-400" />}
          label="Seri"
          value={String(stats.streak)}
          unit="gün"
          gradient="from-yellow-500/10 to-orange-500/10"
          border="border-yellow-500/20"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5 text-green-400" />}
          label="Toplam"
          value={String(stats.totalCompleted)}
          unit="tamamlandı"
          gradient="from-green-500/10 to-teal-500/10"
          border="border-green-500/20"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent workouts */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400" />
              Son Antrenmanlar
            </h2>
          </div>
          {recentWorkouts.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 bg-zinc-900 rounded-2xl border border-zinc-800">
              <Flame className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Henüz antrenman yok.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-3 text-orange-400 text-sm hover:text-orange-300 underline"
              >
                İlk antrenmanı ekle
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            Kategori Dağılımı
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">Veri yok</p>
            ) : (
              categoryBreakdown.map(([cat, count]) => {
                const pct = totalCategoryCount > 0 ? Math.round((count / totalCategoryCount) * 100) : 0
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-zinc-300 flex items-center gap-1.5">
                        <span>{CATEGORY_EMOJI[cat]}</span>
                        {cat}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {count}x · {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {showModal && <AddWorkoutModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  unit,
  gradient,
  border,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  gradient: string
  border: string
}) {
  return (
    <div className={`bg-gradient-to-br ${gradient} border ${border} rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs text-zinc-400 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {unit && <p className="text-xs text-zinc-500 mt-0.5">{unit}</p>}
    </div>
  )
}
