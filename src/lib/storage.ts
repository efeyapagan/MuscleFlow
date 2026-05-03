import { Workout } from './types'

const STORAGE_KEY = 'sports-tracker-workouts'

export const getWorkouts = (): Workout[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export const saveWorkouts = (workouts: Workout[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
}
