'use client'

import { useState, useRef } from 'react'
import { Clock, Dumbbell, ChevronDown, Pencil, Trash2, CheckCircle2, Circle, CalendarDays } from 'lucide-react'
import { Workout, WorkoutCategory, WorkoutStatus } from '@/lib/types'
import { useWorkouts } from '@/lib/WorkoutContext'
import AddWorkoutModal from './AddWorkoutModal'
import WorkoutDetailSheet from './WorkoutDetailSheet'

const CATEGORY_COLORS: Record<WorkoutCategory, string> = {
  Kuvvet: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  Kardiyo: 'text-red-400 bg-red-400/10 border-red-400/20',
  Esneklik: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  HIIT: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Spor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
}

const STATUS_STYLES: Record<WorkoutStatus, { label: string; className: string }> = {
  tamamlandi: { label: 'Tamamlandı', className: 'text-green-400 bg-green-400/10 border-green-400/20' },
  planli: { label: 'Planlı', className: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  atlandi: { label: 'Atlandı', className: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20' },
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface Props {
  workout: Workout
}

export default function WorkoutCard({ workout }: Props) {
  const { deleteWorkout, updateWorkout } = useWorkouts()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [swipeFlash, setSwipeFlash] = useState<'done' | 'skip' | null>(null)
  const touchStartX = useRef<number | null>(null)

  const statusStyle = STATUS_STYLES[workout.status]
  const categoryStyle = CATEGORY_COLORS[workout.category]

  const toggleStatus = () => {
    const next: WorkoutStatus = workout.status === 'tamamlandi' ? 'planli' : 'tamamlandi'
    updateWorkout({ ...workout, status: next })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (delta > 72) {
      updateWorkout({ ...workout, status: 'tamamlandi' })
      setSwipeFlash('done')
      setTimeout(() => setSwipeFlash(null), 500)
    } else if (delta < -72) {
      updateWorkout({ ...workout, status: 'atlandi' })
      setSwipeFlash('skip')
      setTimeout(() => setSwipeFlash(null), 500)
    }
  }

  return (
    <>
      <div
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all duration-200 group overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe flash overlay */}
        {swipeFlash && (
          <div className={`absolute inset-0 z-10 rounded-2xl pointer-events-none transition-opacity duration-300 ${
            swipeFlash === 'done' ? 'bg-green-500/20' : 'bg-zinc-500/20'
          }`} />
        )}
        {/* Card top */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            {/* Left: status toggle + title */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button
                onClick={toggleStatus}
                className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                title="Durumu değiştir"
              >
                {workout.status === 'tamamlandi' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
                )}
              </button>
              <div className="min-w-0">
                <h3 className={`font-semibold text-base leading-snug truncate ${workout.status === 'atlandi' ? 'line-through text-zinc-500' : 'text-white'}`}>
                  {workout.title}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${categoryStyle}`}>
                    {workout.category}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusStyle.className}`}>
                    {statusStyle.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Düzenle"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteWorkout(workout.id)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3 ml-8">
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
              {formatDate(workout.date)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {workout.duration} dk
            </span>
            {workout.exercises.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
                {workout.exercises.length} egzersiz
              </span>
            )}
          </div>

          {/* Notes preview */}
          {workout.notes && (
            <p className="ml-8 mt-2 text-xs text-zinc-500 line-clamp-1">{workout.notes}</p>
          )}
        </div>

        {/* Detail sheet trigger */}
        {workout.exercises.length > 0 && (
          <button
            onClick={() => setSheetOpen(true)}
            className="w-full flex items-center justify-between px-5 py-2.5 border-t border-zinc-800 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors rounded-b-2xl"
          >
            <span>Egzersizleri görüntüle</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {sheetOpen && (
        <WorkoutDetailSheet
          workout={workout}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onEdit={() => setEditing(true)}
        />
      )}

      {editing && (
        <AddWorkoutModal onClose={() => setEditing(false)} initialWorkout={workout} />
      )}
    </>
  )
}
