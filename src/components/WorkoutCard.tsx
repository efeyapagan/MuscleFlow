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

const LONG_PRESS_MS = 280
const SWIPE_THRESHOLD = 80

export default function WorkoutCard({ workout }: Props) {
  const { deleteWorkout, updateWorkout } = useWorkouts()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [swipeFlash, setSwipeFlash] = useState<'done' | 'skip' | null>(null)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inDragMode = useRef(false)
  const didDrag = useRef(false)

  const statusStyle = STATUS_STYLES[workout.status]
  const categoryStyle = CATEGORY_COLORS[workout.category]

  const flash = (type: 'done' | 'skip') => {
    setSwipeFlash(type)
    setTimeout(() => setSwipeFlash(null), 500)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    inDragMode.current = false
    didDrag.current = false

    longPressTimer.current = setTimeout(() => {
      inDragMode.current = true
      setIsDragging(true)
      if (navigator.vibrate) navigator.vibrate(15)
    }, LONG_PRESS_MS)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    // cancel long press if scrolling vertically
    if (!inDragMode.current && Math.abs(dy) > 10) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
      return
    }

    if (!inDragMode.current) return
    didDrag.current = true
    e.preventDefault()
    setDragX(Math.max(-140, Math.min(140, dx)))
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)

    if (inDragMode.current) {
      const dx = dragX
      setDragX(0)
      setIsDragging(false)
      inDragMode.current = false

      if (dx > SWIPE_THRESHOLD) {
        updateWorkout({ ...workout, status: 'tamamlandi' })
        flash('done')
      } else if (dx < -SWIPE_THRESHOLD) {
        updateWorkout({ ...workout, status: 'atlandi' })
        flash('skip')
      }
    }
  }

  const handleCardClick = () => {
    if (didDrag.current) return
    setSheetOpen(true)
  }

  const clampedDrag = Math.max(-140, Math.min(140, dragX))
  const bgOpacity = Math.min(Math.abs(clampedDrag) / SWIPE_THRESHOLD, 1) * 0.35

  return (
    <>
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer"
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe background layer */}
        <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none">
          <div
            className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
            style={{ opacity: clampedDrag > 0 ? bgOpacity * 3 : 0 }}
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div
            className="w-10 h-10 rounded-full bg-zinc-500 flex items-center justify-center"
            style={{ opacity: clampedDrag < 0 ? bgOpacity * 3 : 0 }}
          >
            <span className="text-white text-xs font-bold">—</span>
          </div>
        </div>

        {/* Swipe flash overlay */}
        {swipeFlash && (
          <div className={`absolute inset-0 z-10 rounded-2xl pointer-events-none ${
            swipeFlash === 'done' ? 'bg-green-500/25' : 'bg-zinc-500/25'
          }`} />
        )}

        {/* Card content (slides during drag) */}
        <div
          className="bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-[border-color] duration-200 group"
          style={{
            transform: `translateX(${clampedDrag}px)`,
            transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Card top */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              {/* Left: status toggle + title */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={(e) => { e.stopPropagation(); const next: WorkoutStatus = workout.status === 'tamamlandi' ? 'planli' : 'tamamlandi'; updateWorkout({ ...workout, status: next }) }}
                  className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
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
                  onClick={(e) => { e.stopPropagation(); setEditing(true) }}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteWorkout(workout.id) }}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
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
          <div
            className="w-full flex items-center justify-between px-5 py-2.5 border-t border-zinc-800 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors rounded-b-2xl"
          >
            <span>{workout.exercises.length > 0 ? 'Egzersizleri görüntüle' : 'Detayları görüntüle'}</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
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
