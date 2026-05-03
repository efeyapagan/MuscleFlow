'use client'

import { Drawer } from 'vaul'
import {
  Clock,
  Dumbbell,
  CalendarDays,
  CheckCircle2,
  Circle,
  Pencil,
} from 'lucide-react'
import { Workout, WorkoutCategory, WorkoutStatus } from '@/lib/types'

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
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface Props {
  workout: Workout
  open: boolean
  onClose: () => void
  onEdit: () => void
}

export default function WorkoutDetailSheet({ workout, open, onClose, onEdit }: Props) {
  const statusStyle = STATUS_STYLES[workout.status]
  const categoryStyle = CATEGORY_COLORS[workout.category]

  return (
    <Drawer.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-zinc-900 border border-zinc-800 border-b-0 max-h-[90vh] focus:outline-none">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-zinc-700" />
          </div>

          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {workout.status === 'tamamlandi' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                  )}
                  <h2 className="text-lg font-bold text-white truncate">{workout.title}</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap ml-7">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${categoryStyle}`}>
                    {workout.category}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusStyle.className}`}>
                    {statusStyle.label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => { onClose(); onEdit() }}
                className="p-2 rounded-xl text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-3 ml-7">
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
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-8">
            {workout.notes && (
              <p className="text-sm text-zinc-400 bg-zinc-800/50 rounded-xl px-4 py-3 italic border border-zinc-700/50">
                &ldquo;{workout.notes}&rdquo;
              </p>
            )}

            {workout.exercises.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-8">Egzersiz kaydedilmemiş</p>
            )}

            {workout.exercises.map((ex, i) => (
              <div key={ex.id} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-md bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold text-zinc-100">{ex.name}</p>
                  <span className="ml-auto text-xs text-zinc-500">{ex.sets.length} set</span>
                </div>
                <div className="space-y-1.5">
                  <div className="grid grid-cols-3 gap-2 text-xs text-zinc-500 px-1">
                    <span>Set</span>
                    <span>Tekrar</span>
                    <span>Ağırlık</span>
                  </div>
                  {ex.sets.map((set) => (
                    <div
                      key={set.setNumber}
                      className="grid grid-cols-3 gap-2 text-xs text-zinc-300 bg-zinc-800/60 rounded-lg px-2 py-2"
                    >
                      <span className="text-zinc-500 font-medium">{set.setNumber}</span>
                      <span>{set.reps} tekrar</span>
                      <span className={set.weight != null ? 'text-orange-300 font-medium' : 'text-zinc-600'}>
                        {set.weight != null ? `${set.weight} kg` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
