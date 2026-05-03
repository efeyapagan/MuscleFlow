export type WorkoutCategory = 'Kuvvet' | 'Kardiyo' | 'Esneklik' | 'HIIT' | 'Spor'
export type WorkoutStatus = 'tamamlandi' | 'planli' | 'atlandi'

export interface SetData {
  setNumber: number
  reps: number
  weight?: number
}

export interface ExerciseEntry {
  id: string
  name: string
  sets: SetData[]
  notes?: string
}

export interface Workout {
  id: string
  date: string
  title: string
  category: WorkoutCategory
  status: WorkoutStatus
  duration: number
  exercises: ExerciseEntry[]
  notes?: string
  createdAt: string
}
