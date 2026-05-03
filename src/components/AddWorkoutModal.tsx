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

const WORKOUT_NAMES = [
  'Göğüs',
  'Sırt',
  'Omuz',
  'Kol (Bicep & Tricep)',
  'Bacak',
  'Karın / Core',
  'Göğüs & Tricep',
  'Sırt & Bicep',
  'Omuz & Kol',
  'Bacak & Kalça',
  'Full Body',
  'Kardiyo',
  'HIIT',
  'Esneklik / Yoga',
  'Ön Kol',
  'Özel...',
]

function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  placeholder = '—',
}: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
}) {
  const dec = () => {
    const cur = value ?? 0
    const next = Math.round((cur - step) * 10) / 10
    if (next < min) return
    onChange(next)
  }
  const inc = () => {
    const cur = value ?? 0
    const next = Math.round((cur + step) * 10) / 10
    if (next > max) return
    onChange(next)
  }
  return (
    <div className="flex items-center bg-zinc-800 border border-zinc-700/60 rounded-xl overflow-hidden select-none">
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); dec() }}
        className="w-8 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-colors text-base font-bold flex items-center justify-center flex-shrink-0"
      >
        −
      </button>
      <span className="flex-1 text-center text-sm font-medium text-white tabular-nums">
        {value !== undefined ? value : <span className="text-zinc-600">{placeholder}</span>}
      </span>
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); inc() }}
        className="w-8 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-colors text-base font-bold flex items-center justify-center flex-shrink-0"
      >
        +
      </button>
    </div>
  )
}

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

const INPUT_BASE =
  'w-full bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors'

export default function AddWorkoutModal({ onClose, initialWorkout }: Props) {
  const { addWorkout, updateWorkout } = useWorkouts()
  const isEdit = !!initialWorkout

  const isCustomTitle = initialWorkout?.title
    ? !WORKOUT_NAMES.slice(0, -1).includes(initialWorkout.title)
    : false
  const [titleSelect, setTitleSelect] = useState(
    isCustomTitle ? 'Özel...' : (initialWorkout?.title ?? WORKOUT_NAMES[0])
  )
  const [titleCustom, setTitleCustom] = useState(isCustomTitle ? (initialWorkout?.title ?? '') : '')
  const title = titleSelect === 'Özel...' ? titleCustom : titleSelect
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
  const removeExercise = (id: string) => setExercises((prev) => prev.filter((e) => e.id !== id))
  const updateExerciseName = (id: string, name: string) =>
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, name } : e)))
  const addSet = (exerciseId: string) =>
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId ? { ...e, sets: [...e.sets, newSet(e.sets.length + 1)] } : e
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
                i === setIndex
                  ? {
                      ...s,
                      [field]:
                        field === 'setNumber'
                          ? Number(value)
                          : value === ''
                          ? undefined
                          : Number(value),
                    }
                  : s
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
    if (isEdit) updateWorkout(workout)
    else addWorkout(workout)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full md:max-w-2xl max-h-[94vh] overflow-y-auto bg-zinc-950 md:rounded-2xl rounded-t-3xl border border-zinc-800 shadow-2xl">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-0 md:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-zinc-950 border-b border-zinc-800/80">
          <h2 className="text-base font-semibold text-white">
            {isEdit ? 'Antrenmanı Düzenle' : 'Yeni Antrenman'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <select
              value={titleSelect}
              onChange={(e) => setTitleSelect(e.target.value)}
              className={`${INPUT_BASE} px-4 py-3 text-base font-medium`}
            >
              {WORKOUT_NAMES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {titleSelect === 'Özel...' && (
              <input
                type="text"
                value={titleCustom}
                onChange={(e) => setTitleCustom(e.target.value)}
                placeholder="Antrenman adını yaz..."
                autoFocus
                required
                className={`${INPUT_BASE} px-4 py-3 text-sm`}
              />
            )}
          </div>

          {/* Category + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkoutCategory)}
                className={`${INPUT_BASE} px-3 py-3 text-sm`}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Durum</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkoutStatus)}
                className={`${INPUT_BASE} px-3 py-3 text-sm`}
              >
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Date + Duration row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Tarih</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${INPUT_BASE} px-3 py-3 text-sm`}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Süre (dk)</label>
              <Stepper
                value={Number(duration) || undefined}
                onChange={(v) => setDuration(String(v ?? 0))}
                min={0}
                max={600}
                step={5}
                placeholder="60"
              />
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Egzersizler</span>
              <button
                type="button"
                onClick={addExercise}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors border border-zinc-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Egzersiz Ekle
              </button>
            </div>

            <div className="space-y-3">
              {exercises.map((exercise, exIdx) => (
                <div key={exercise.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  {/* Exercise name */}
                  <div className="flex items-center gap-2 p-3 border-b border-zinc-800/80">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                      placeholder={`Egzersiz ${exIdx + 1}`}
                      className="flex-1 bg-transparent text-white placeholder-zinc-600 text-sm font-medium focus:outline-none"
                    />
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.id)}
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Rest timer */}
                  {restTimer?.exerciseId === exercise.id && (
                    <div className="px-3 pt-3">
                      <RestTimer totalSeconds={90} onDismiss={() => setRestTimer(null)} />
                    </div>
                  )}

                  {/* Sets table */}
                  <div className="px-3 pt-2 pb-1">
                    {/* Column headers */}
                    <div className="grid items-center mb-1" style={{ gridTemplateColumns: '28px 1fr 1fr 36px' }}>
                      <span className="text-xs text-zinc-600">Set</span>
                      <span className="text-xs text-zinc-600 text-center">Tekrar</span>
                      <span className="text-xs text-zinc-600 text-center">Ağırlık kg</span>
                      <span />
                    </div>

                    <div className="space-y-1.5">
                      {exercise.sets.map((set, setIdx) => (
                        <div
                          key={setIdx}
                          className="grid items-center gap-1.5"
                          style={{ gridTemplateColumns: '28px 1fr 1fr 36px' }}
                        >
                          {/* Set number */}
                          <span className="text-sm font-semibold text-zinc-500 text-center">{set.setNumber}</span>

                          {/* Reps */}
                          <Stepper
                            value={set.reps}
                            onChange={(v) => updateSet(exercise.id, setIdx, 'reps', String(v ?? 0))}
                            min={0}
                            max={999}
                            step={1}
                          />

                          {/* Weight */}
                          <Stepper
                            value={set.weight}
                            onChange={(v) => updateSet(exercise.id, setIdx, 'weight', v !== undefined ? String(v) : '')}
                            min={0}
                            max={500}
                            step={2.5}
                            placeholder="—"
                          />

                          {/* Done / remove */}
                          <button
                            type="button"
                            onClick={() => {
                              if (restTimer?.exerciseId === exercise.id && restTimer.setIdx === setIdx) {
                                setRestTimer(null)
                              } else {
                                setRestTimer({ exerciseId: exercise.id, setIdx })
                              }
                            }}
                            title="Set bitti — dinlenme başlat"
                            className={`h-10 w-9 flex items-center justify-center rounded-xl transition-colors ${
                              restTimer?.exerciseId === exercise.id && restTimer.setIdx === setIdx
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add set + remove set row */}
                  <div className="flex items-center gap-2 px-3 pb-3 pt-2">
                    <button
                      type="button"
                      onClick={() => addSet(exercise.id)}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-700/60 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors text-xs font-medium"
                    >
                      + Set Ekle
                    </button>
                    {exercise.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSet(exercise.id, exercise.sets.length - 1)}
                        className="py-2.5 px-3 rounded-xl border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-colors text-xs"
                      >
                        Son Seti Sil
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Notlar</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="İsteğe bağlı notlar..."
              rows={2}
              className={`${INPUT_BASE} px-4 py-3 text-sm resize-none`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-sm font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-sm transition-all shadow-lg shadow-orange-600/20 flex-1"
            >
              {isEdit ? 'Kaydet' : 'Antrenmanı Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
