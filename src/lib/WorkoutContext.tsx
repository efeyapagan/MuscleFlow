'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Workout } from './types'

interface WorkoutContextType {
  workouts: Workout[]
  loading: boolean
  addWorkout: (workout: Workout) => Promise<void>
  updateWorkout: (workout: Workout) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
}

const WorkoutContext = createContext<WorkoutContextType | null>(null)

function toWorkout(raw: Record<string, unknown>): Workout {
  return {
    id: raw.id as string,
    title: raw.title as string,
    category: raw.category as Workout['category'],
    status: raw.status as Workout['status'],
    date: raw.date as string,
    duration: raw.duration as number,
    exercises: (raw.exercises as Workout['exercises']) ?? [],
    notes: raw.notes as string | undefined,
    createdAt: raw.createdAt as string,
  }
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/workouts')
      .then((r) => r.json())
      .then((data: Record<string, unknown>[]) => setWorkouts(data.map(toWorkout)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const addWorkout = async (workout: Workout) => {
    setWorkouts((prev) => [workout, ...prev])
    try {
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout),
      })
    } catch {
      setWorkouts((prev) => prev.filter((w) => w.id !== workout.id))
    }
  }

  const updateWorkout = async (workout: Workout) => {
    setWorkouts((prev) => prev.map((w) => (w.id === workout.id ? workout : w)))
    try {
      await fetch(`/api/workouts/${workout.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout),
      })
    } catch {
      // Ideally rollback — for now just refetch
      fetch('/api/workouts')
        .then((r) => r.json())
        .then((data: Record<string, unknown>[]) => setWorkouts(data.map(toWorkout)))
        .catch(() => {})
    }
  }

  const deleteWorkout = async (id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
    try {
      await fetch(`/api/workouts/${id}`, { method: 'DELETE' })
    } catch {
      fetch('/api/workouts')
        .then((r) => r.json())
        .then((data: Record<string, unknown>[]) => setWorkouts(data.map(toWorkout)))
        .catch(() => {})
    }
  }

  return (
    <WorkoutContext.Provider value={{ workouts, loading, addWorkout, updateWorkout, deleteWorkout }}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkouts() {
  const ctx = useContext(WorkoutContext)
  if (!ctx) throw new Error('useWorkouts must be used within WorkoutProvider')
  return ctx
}
