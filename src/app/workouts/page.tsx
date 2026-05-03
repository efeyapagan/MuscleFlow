'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Dumbbell, ChevronDown } from 'lucide-react'
import { useWorkouts } from '@/lib/WorkoutContext'
import WorkoutCard from '@/components/WorkoutCard'
import AddWorkoutModal from '@/components/AddWorkoutModal'
import { WorkoutCategory, WorkoutStatus } from '@/lib/types'

const STATUS_TABS: { value: WorkoutStatus | 'hepsi'; label: string }[] = [
  { value: 'hepsi', label: 'Tümü' },
  { value: 'tamamlandi', label: 'Tamamlandı' },
  { value: 'planli', label: 'Planlı' },
  { value: 'atlandi', label: 'Atlandı' },
]

const CATEGORIES: (WorkoutCategory | 'hepsi')[] = ['hepsi', 'Kuvvet', 'Kardiyo', 'Esneklik', 'HIIT', 'Spor']
const CATEGORY_LABELS: Record<WorkoutCategory | 'hepsi', string> = {
  hepsi: 'Kategori',
  Kuvvet: 'Kuvvet',
  Kardiyo: 'Kardiyo',
  Esneklik: 'Esneklik',
  HIIT: 'HIIT',
  Spor: 'Spor',
}

export default function WorkoutsPage() {
  const { workouts } = useWorkouts()
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<WorkoutStatus | 'hepsi'>('hepsi')
  const [categoryFilter, setCategoryFilter] = useState<WorkoutCategory | 'hepsi'>('hepsi')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return [...workouts]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((w) => {
        if (statusFilter !== 'hepsi' && w.status !== statusFilter) return false
        if (categoryFilter !== 'hepsi' && w.category !== categoryFilter) return false
        if (search.trim()) {
          const q = search.toLowerCase()
          if (
            !w.title.toLowerCase().includes(q) &&
            !w.category.toLowerCase().includes(q) &&
            !w.exercises.some((e) => e.name.toLowerCase().includes(q))
          )
            return false
        }
        return true
      })
  }, [workouts, statusFilter, categoryFilter, search])

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Antrenmanlar</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{workouts.length} antrenman kayıtlı</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Antrenman</span>
          <span className="sm:hidden">Yeni</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Antrenman veya egzersiz ara..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
        />
      </div>

      {/* Compact filter bar: status segment + category dropdown in one row */}
      <div className="flex items-center gap-2 mb-6">
        {/* Status segment control */}
        <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-0.5 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex-1 min-w-fit px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        <div className="relative flex-shrink-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as WorkoutCategory | 'hepsi')}
            className="appearance-none pl-3 pr-7 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 focus:outline-none focus:border-zinc-600 transition-colors text-xs font-medium cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Workout list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 bg-zinc-900 rounded-2xl border border-zinc-800">
          <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium text-zinc-400">Antrenman bulunamadı</p>
          <p className="text-xs text-zinc-600 mt-1">
            {search || statusFilter !== 'hepsi' || categoryFilter !== 'hepsi'
              ? 'Filtreleri değiştirmeyi deneyin'
              : 'İlk antrenmanını eklemek için + düğmesine bas'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <WorkoutCard key={w.id} workout={w} />
          ))}
        </div>
      )}

      {showModal && <AddWorkoutModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
