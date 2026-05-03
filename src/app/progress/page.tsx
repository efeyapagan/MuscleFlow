'use client'

import { useMemo } from 'react'
import { TrendingUp, BarChart3, Clock, Flame, Award } from 'lucide-react'
import { useWorkouts } from '@/lib/WorkoutContext'
import { WorkoutCategory } from '@/lib/types'

const CATEGORY_COLORS: Record<WorkoutCategory, string> = {
  Kuvvet: 'from-orange-500 to-orange-600',
  Kardiyo: 'from-red-500 to-red-600',
  Esneklik: 'from-teal-500 to-teal-600',
  HIIT: 'from-yellow-500 to-yellow-600',
  Spor: 'from-purple-500 to-purple-600',
}

const CATEGORY_BG: Record<WorkoutCategory, string> = {
  Kuvvet: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  Kardiyo: 'bg-red-500/10 border-red-500/20 text-red-400',
  Esneklik: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
  HIIT: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  Spor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function getLast4Weeks(): { label: string; start: string; end: string }[] {
  return Array.from({ length: 4 }, (_, i) => {
    const end = new Date()
    end.setDate(end.getDate() - i * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    return {
      label: `${4 - i}. Hafta`,
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }).reverse()
}

const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

export default function ProgressPage() {
  const { workouts } = useWorkouts()

  const completed = useMemo(() => workouts.filter((w) => w.status === 'tamamlandi'), [workouts])

  const last7Days = getLast7Days()
  const last4Weeks = getLast4Weeks()

  // Daily activity for last 7 days
  const dailyActivity = useMemo(() =>
    last7Days.map((date) => {
      const dayWorkouts = completed.filter((w) => w.date === date)
      return {
        date,
        count: dayWorkouts.length,
        minutes: dayWorkouts.reduce((s, w) => s + w.duration, 0),
        dayName: DAY_NAMES[new Date(date + 'T00:00:00').getDay()],
      }
    }), [completed, last7Days])

  const maxCount = Math.max(...dailyActivity.map((d) => d.count), 1)

  // Weekly volume
  const weeklyData = useMemo(() =>
    last4Weeks.map(({ label, start, end }) => {
      const ww = completed.filter((w) => w.date >= start && w.date <= end)
      return {
        label,
        count: ww.length,
        minutes: ww.reduce((s, w) => s + w.duration, 0),
      }
    }), [completed, last4Weeks])

  const maxWeeklyCount = Math.max(...weeklyData.map((w) => w.count), 1)

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Partial<Record<WorkoutCategory, { count: number; totalMinutes: number }>> = {}
    completed.forEach((w) => {
      if (!stats[w.category]) stats[w.category] = { count: 0, totalMinutes: 0 }
      stats[w.category]!.count++
      stats[w.category]!.totalMinutes += w.duration
    })
    return Object.entries(stats).sort(([, a], [, b]) => b.count - a.count) as [
      WorkoutCategory,
      { count: number; totalMinutes: number }
    ][]
  }, [completed])

  const totalMinutesAll = completed.reduce((s, w) => s + w.duration, 0)
  const avgDuration = completed.length > 0 ? Math.round(totalMinutesAll / completed.length) : 0

  // Most trained exercise
  const topExercises = useMemo(() => {
    const counts: Record<string, number> = {}
    completed.forEach((w) => {
      w.exercises.forEach((e) => {
        if (e.name.trim()) counts[e.name] = (counts[e.name] ?? 0) + 1
      })
    })
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5)
  }, [completed])

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">İlerleme</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Antrenman geçmişin ve istatistiklerin</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-zinc-400">Toplam Antrenman</span>
          </div>
          <p className="text-3xl font-bold text-white">{completed.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-400">Toplam Süre</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {Math.floor(totalMinutesAll / 60)}
            <span className="text-lg text-zinc-400">s</span>
          </p>
          <p className="text-xs text-zinc-500">{totalMinutesAll} dakika</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-400">Ort. Süre</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {avgDuration}
            <span className="text-lg text-zinc-400">dk</span>
          </p>
          <p className="text-xs text-zinc-500">antrenman başına</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* 7-day activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            Son 7 Gün
          </h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {dailyActivity.map((day) => {
              const heightPct = maxCount > 0 ? (day.count / maxCount) * 100 : 0
              const isToday = day.date === new Date().toISOString().split('T')[0]
              return (
                <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full flex items-end justify-center" style={{ height: '88px' }}>
                    {day.count > 0 ? (
                      <div
                        className={`w-full rounded-t-md bg-gradient-to-t from-orange-600 to-orange-400 transition-all duration-500 ${isToday ? 'ring-1 ring-orange-400' : ''}`}
                        style={{ height: `${Math.max(heightPct, 8)}%` }}
                        title={`${day.count} antrenman · ${day.minutes}dk`}
                      />
                    ) : (
                      <div className="w-full rounded-t-md bg-zinc-800" style={{ height: '8%' }} />
                    )}
                  </div>
                  <span className={`text-xs ${isToday ? 'text-orange-400 font-semibold' : 'text-zinc-500'}`}>
                    {day.dayName}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weekly volume */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            Haftalık Hacim
          </h2>
          <div className="space-y-3">
            {weeklyData.map((week) => {
              const pct = maxWeeklyCount > 0 ? (week.count / maxWeeklyCount) * 100 : 0
              return (
                <div key={week.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400">{week.label}</span>
                    <span className="text-xs text-zinc-500">
                      {week.count} antrenman · {week.minutes}dk
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Category stats */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-zinc-400" />
            Kategoriler
          </h2>
          {categoryStats.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">Veri yok</p>
          ) : (
            <div className="space-y-3">
              {categoryStats.map(([cat, data]) => (
                <div key={cat} className={`flex items-center justify-between p-3 rounded-xl border ${CATEGORY_BG[cat]}`}>
                  <div>
                    <p className="text-sm font-medium">{cat}</p>
                    <p className="text-xs opacity-70 mt-0.5">
                      {Math.round(data.totalMinutes / data.count)}dk ort.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{data.count}</p>
                    <p className="text-xs opacity-70">antrenman</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top exercises */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-zinc-400" />
            En Çok Yapılan Egzersizler
          </h2>
          {topExercises.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">Veri yok</p>
          ) : (
            <div className="space-y-3">
              {topExercises.map(([name, count], i) => {
                const max = topExercises[0][1]
                const pct = (count / max) * 100
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-zinc-300 flex items-center gap-2">
                        <span className={`text-xs font-bold w-4 ${i === 0 ? 'text-yellow-400' : 'text-zinc-500'}`}>
                          {i + 1}.
                        </span>
                        {name}
                      </span>
                      <span className="text-xs text-zinc-500">{count}x</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${i === 0 ? 'from-yellow-500 to-orange-500' : 'from-orange-600 to-red-600'} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
