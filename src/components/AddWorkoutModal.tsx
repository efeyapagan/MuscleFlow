'use client'

import { useState } from 'react'
import { X, Plus, Trash2, CheckCheck } from 'lucide-react'
import { Workout, WorkoutCategory, WorkoutStatus, ExerciseEntry, SetData } from '@/lib/types'
import { useWorkouts } from '@/lib/WorkoutContext'
import RestTimer from './RestTimer'

interface Props {
  onClose: () => void
  initialWorkout?: Workout
}

const CATEGORIES: WorkoutCategory[] = ['Kuvvet', 'Kardiyo', 'Esneklik', 'HIIT', 'Spor']
const STATUSES: { value: WorkoutStatus; label: string }[] = [
  { value: 'tamamlandi', label: 'Tamamlandı' },
  { value: 'planli', label: 'Planlı' },
  { value: 'atlandi', label: 'Atlandı' },
]

function newExercise(): ExerciseEntry {
  return {
    id: crypto.randomUUID(),
    name: '',
    sets: [{ setNumber: 1, reps: 10, weight: undefined }],
  }
}

function newSet(setNumber: number): SetData {
  return { setNumber, reps: 10, weight: undefined }
}

export default function AddWorkoutModal({ onClose, initialWorkout }: Props) {
  const { addWorkout, updateWorkout } = useWorkouts()
  const isEdit = !!initialWorkout

  const [title, setTitle] = useState(initialWorkout?.title ?? '')
  const [category, setCategory] = useState<WorkoutCategory>(initialWorkout?.category ?? 'Kuvvet')
  const [status, setStatus] = useState<WorkoutStatus>(initialWorkout?.status ?? 'tamamlandi')
  const [date, setDate] = useState(initialWorkout?.date ?? new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState(String(initialWorkout?.duration ?? 60))
  const [notes, setNotes] = useState(initialWorkout?.notes ?? '')
  const [exercises, setExercises] = useState<ExerciseEntry[]>(
    initialWorkout?.exercises?.length ? initialWorkout.exercises : [newExercise()]
  )
  const [restTimer, setRestTimer] = useState<{ exerciseId: string; setIdx: number } | null>(null)

  const addExercise = () => setExercises((prev) => [...prev, newExercise()])

  const removeExercise = (id: string) =>
    setExercises((prev) => prev.filter((e) => e.id !== id))

  const updateExerciseName = (id: string, name: string) =>
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, name } : e)))

  const addSet = (exerciseId: string) =>
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId
          ? { ...e, sets: [...e.sets, newSet(e.sets.length + 1)] }
          : e
      )
    )

  const removeSet = (exerciseId: string, setIndex: number) =>
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              sets: e.sets
                .filter((_, i) => i !== setIndex)
                .map((s, i) => ({ ...s, setNumber: i + 1 })),
            }
          : e
      )
    )

  const updateSet = (exerciseId: string, setIndex: number, field: keyof SetData, value: string) =>
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s, i) =>
                i === setIndex ? { ...s, [field]: field === 'setNumber' ? Number(value) : value === '' ? undefined : Number(value) } : s
              ),
            }
          : e
      )
    )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const workout: Workout = {
      id: initialWorkout?.id ?? crypto.randomUUID(),
      title: title.trim(),
      category,
      status,
      date,
      duration: Number(duration) || 0,
      exercises: exercises.filter((ex) => ex.name.trim()),
      notes: notes.trim() || undefined,
      createdAt: initialWorkout?.createdAt ?? new Date().toISOString(),
    }

    if (isEdit) {
      updateWorkout(workout)
    } else {
      addWorkout(workout)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full md:max-w-2xl max-h-[92vh] overflow-y-auto bg-zinc-900 md:rounded-2xl rounded-t-2xl border border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? 'Antrenmanı Düzenle' : 'Yeni Antrenman'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Antrenman Adı <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="örn. Göğüs & Tricep"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
            />
          </div>

          {/* Category + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkoutCategory)}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-orange-500 transition-colors text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Durum</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkoutStatus)}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-orange-500 transition-colors text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date + Duration row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tarih</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-orange-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Süre (dk)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="0"
                placeholder="60"
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-zinc-300">Egzersizler</label>
              <button
                type="button"
                onClick={addExercise}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Egzersiz Ekle
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((exercise, exIdx) => (
                <div key={exercise.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
                  {/* Exercise name row */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                      placeholder={`Egzersiz ${exIdx + 1}`}
                      className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm"
                    />
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.id)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Sets header */}
                  <div className="grid gap-2 mb-2 px-1" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
                    <span className="text-xs text-zinc-500">Set</span>
                    <span className="text-xs text-zinc-500">Tekrar</span>
                    <span className="text-xs text-zinc-500">Ağırlık (kg)</span>
                    <span className="w-7" />
                  </div>

                  {/* Rest Timer */}
                  {restTimer?.exerciseId === exercise.id && (
                    <div className="mb-2">
                      <RestTimer
                        totalSeconds={90}
                        onDismiss={() => setRestTimer(null)}
                      />
                    </div>
                  )}

                  {/* Sets */}
                  <div className="space-y-2">
                    {exercise.sets.map((set, setIdx) => (
                      <div key={setIdx} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 w-4">{set.setNumber}</span>
                          {exercise.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSet(exercise.id, setIdx)}
                              className="p-0.5 text-zinc-600 hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(exercise.id, setIdx, 'reps', e.target.value)}
                          min="0"
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-orange-500 transition-colors text-sm text-center"
                        />
                        <input
                          type="number"
                          value={set.weight ?? ''}
                          onChange={(e) => updateSet(exercise.id, setIdx, 'weight', e.target.value)}
                          min="0"
                          step="0.5"
                          placeholder="—"
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors text-sm text-center"
                        />
                        <button
                          type="button"
                          onClick={() => setRestTimer({ exerciseId: exercise.id, setIdx })}
                          title="Set bitti — dinlenmeye başla"
                          className={`p-1.5 rounded-lg transition-colors ${
                            restTimer?.exerciseId === exercise.id && restTimer.setIdx === setIdx
                              ? 'text-orange-400 bg-orange-500/15'
                              : 'text-zinc-600 hover:text-orange-400 hover:bg-orange-500/10'
                          }`}
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addSet(exercise.id)}
                    className="mt-2 text-xs text-zinc-500 hover:text-orange-400 transition-colors"
                  >
                    + Set ekle
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Notlar</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="İsteğe bağlı notlar..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-sm font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-orange-500/20"
            >
              {isEdit ? 'Kaydet' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
