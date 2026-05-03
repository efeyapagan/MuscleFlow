import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const workouts = await prisma.workout.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(workouts)
  } catch (err) {
    console.error('[GET /api/workouts]', err)
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const body = await req.json()

    const workout = await prisma.workout.create({
      data: {
        id: body.id,
        userId: session.user.id,
        title: body.title,
        category: body.category,
        status: body.status,
        date: body.date,
        duration: body.duration ?? 0,
        exercises: body.exercises ?? [],
        notes: body.notes ?? null,
      },
    })

    return NextResponse.json(workout, { status: 201 })
  } catch (err) {
    console.error('[POST /api/workouts]', err)
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
