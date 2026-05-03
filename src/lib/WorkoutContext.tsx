'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Workout } from './types'
import { getWorkouts, saveWorkouts } from './storage'
import { SEED_WORKOUTS } from './seedData'

interface WorkoutContextType {
  workouts: Workout[]
  addWorkout: (workout: Workout) => void
  updateWorkout: (workout: Workout) => void
  deleteWorkout: (id: string) => void
}

const WorkoutContext = createContext<WorkoutContextType | null>(null)

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([])

  useEffect(() => {
    const stored = getWorkouts()
    if (stored.length === 0) {
      saveWorkouts(SEED_WORKOUTS)
      setWorkouts(SEED_WORKOUTS)
    } else {
      setWorkouts(stored)
    }
  }, [])

  const addWorkout = (workout: Workout) => {
    const updated = [workout, ...workouts]
    setWorkouts(updated)
    saveWorkouts(updated)
  }

  const updateWorkout = (workout: Workout) => {
    const updated = workouts.map((w) => (w.id === workout.id ? workout : w))
    setWorkouts(updated)
    saveWorkouts(updated)
  }

  const deleteWorkout = (id: string) => {
    const updated = workouts.filter((w) => w.id !== id)
    setWorkouts(updated)
    saveWorkouts(updated)
  }

  return (
    <WorkoutContext.Provider value={{ workouts, addWorkout, updateWorkout, deleteWorkout }}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkouts() {
  const ctx = useContext(WorkoutContext)
  if (!ctx) throw new Error('useWorkouts must be used within WorkoutProvider')
  return ctx
}
