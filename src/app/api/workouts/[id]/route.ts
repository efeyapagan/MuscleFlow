import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function ownsWorkout(userId: string, id: string) {
  const w = await prisma.workout.findUnique({ where: { id }, select: { userId: true } })
  return w?.userId === userId
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { id } = await params
  if (!(await ownsWorkout(session.user.id, id))) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }

  const body = await req.json()
  const workout = await prisma.workout.update({
    where: { id },
    data: {
      title: body.title,
      category: body.category,
      status: body.status,
      date: body.date,
      duration: body.duration,
      exercises: body.exercises,
      notes: body.notes ?? null,
    },
  })

  return NextResponse.json(workout)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { id } = await params
  if (!(await ownsWorkout(session.user.id, id))) {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }

  await prisma.workout.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
