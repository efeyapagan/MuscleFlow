import { Workout } from './types'

const today = new Date()
const daysAgo = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export const SEED_WORKOUTS: Workout[] = [
  {
    id: 'seed-1',
    title: 'Göğüs & Tricep',
    category: 'Kuvvet',
    status: 'tamamlandi',
    date: daysAgo(1),
    duration: 65,
    notes: 'Bench press kişisel rekoru kırdım!',
    exercises: [
      {
        id: 'e1',
        name: 'Bench Press',
        sets: [
          { setNumber: 1, reps: 10, weight: 60 },
          { setNumber: 2, reps: 8, weight: 70 },
          { setNumber: 3, reps: 6, weight: 80 },
        ],
      },
      {
        id: 'e2',
        name: 'Dumbbell Flyes',
        sets: [
          { setNumber: 1, reps: 12, weight: 20 },
          { setNumber: 2, reps: 12, weight: 20 },
          { setNumber: 3, reps: 10, weight: 22 },
        ],
      },
      {
        id: 'e3',
        name: 'Tricep Pushdown',
        sets: [
          { setNumber: 1, reps: 15, weight: 25 },
          { setNumber: 2, reps: 12, weight: 30 },
          { setNumber: 3, reps: 10, weight: 35 },
        ],
      },
    ],
    createdAt: new Date(today.getTime() - 86400000).toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Sabah Koşusu',
    category: 'Kardiyo',
    status: 'tamamlandi',
    date: daysAgo(2),
    duration: 40,
    notes: '7 km koştum, tempo iyi gitti.',
    exercises: [
      {
        id: 'e4',
        name: 'Outdoor Koşu',
        sets: [{ setNumber: 1, reps: 1 }],
      },
    ],
    createdAt: new Date(today.getTime() - 2 * 86400000).toISOString(),
  },
  {
    id: 'seed-3',
    title: 'Bacak Günü',
    category: 'Kuvvet',
    status: 'tamamlandi',
    date: daysAgo(3),
    duration: 75,
    exercises: [
      {
        id: 'e5',
        name: 'Squat',
        sets: [
          { setNumber: 1, reps: 10, weight: 80 },
          { setNumber: 2, reps: 8, weight: 90 },
          { setNumber: 3, reps: 6, weight: 100 },
          { setNumber: 4, reps: 6, weight: 100 },
        ],
      },
      {
        id: 'e6',
        name: 'Leg Press',
        sets: [
          { setNumber: 1, reps: 15, weight: 120 },
          { setNumber: 2, reps: 12, weight: 140 },
          { setNumber: 3, reps: 10, weight: 160 },
        ],
      },
      {
        id: 'e7',
        name: 'Leg Curl',
        sets: [
          { setNumber: 1, reps: 12, weight: 40 },
          { setNumber: 2, reps: 12, weight: 45 },
          { setNumber: 3, reps: 10, weight: 50 },
        ],
      },
    ],
    createdAt: new Date(today.getTime() - 3 * 86400000).toISOString(),
  },
  {
    id: 'seed-4',
    title: 'HIIT Kardiyo',
    category: 'HIIT',
    status: 'tamamlandi',
    date: daysAgo(5),
    duration: 30,
    notes: '20 sn iş / 10 sn dinlenme formatı.',
    exercises: [
      {
        id: 'e8',
        name: 'Burpee',
        sets: [
          { setNumber: 1, reps: 10 },
          { setNumber: 2, reps: 10 },
          { setNumber: 3, reps: 8 },
        ],
      },
      {
        id: 'e9',
        name: 'Jump Squat',
        sets: [
          { setNumber: 1, reps: 15 },
          { setNumber: 2, reps: 15 },
          { setNumber: 3, reps: 12 },
        ],
      },
    ],
    createdAt: new Date(today.getTime() - 5 * 86400000).toISOString(),
  },
  {
    id: 'seed-5',
    title: 'Yoga & Esneme',
    category: 'Esneklik',
    status: 'tamamlandi',
    date: daysAgo(6),
    duration: 45,
    notes: 'Harika bir toparlanma seansı.',
    exercises: [
      {
        id: 'e10',
        name: 'Yoga Akışı',
        sets: [{ setNumber: 1, reps: 1 }],
      },
    ],
    createdAt: new Date(today.getTime() - 6 * 86400000).toISOString(),
  },
  {
    id: 'seed-6',
    title: 'Sırt & Bicep',
    category: 'Kuvvet',
    status: 'planli',
    date: daysAgo(0),
    duration: 60,
    exercises: [
      {
        id: 'e11',
        name: 'Pull-Up',
        sets: [
          { setNumber: 1, reps: 10 },
          { setNumber: 2, reps: 8 },
          { setNumber: 3, reps: 8 },
        ],
      },
      {
        id: 'e12',
        name: 'Barbell Row',
        sets: [
          { setNumber: 1, reps: 10, weight: 60 },
          { setNumber: 2, reps: 10, weight: 65 },
          { setNumber: 3, reps: 8, weight: 70 },
        ],
      },
      {
        id: 'e13',
        name: 'Bicep Curl',
        sets: [
          { setNumber: 1, reps: 12, weight: 15 },
          { setNumber: 2, reps: 12, weight: 15 },
          { setNumber: 3, reps: 10, weight: 17.5 },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  },
]
