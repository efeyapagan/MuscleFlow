import { NextResponse } from 'next/server'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/generated/prisma/client'

function getUrl() {
  return (process.env.DATABASE_URL ?? '')
    .replace('&channel_binding=require', '')
    .replace('?channel_binding=require&', '?')
    .replace('?channel_binding=require', '')
}

export async function GET() {
  const adapter = new PrismaNeon({ connectionString: getUrl() })
  const db = new PrismaClient({ adapter })

  try {
    // Check actual columns in User table
    const cols = await db.$queryRawUnsafe<{ column_name: string; data_type: string }[]>(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'User'
       ORDER BY ordinal_position`
    )

    const workoutCols = await db.$queryRawUnsafe<{ column_name: string; data_type: string }[]>(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'Workout'
       ORDER BY ordinal_position`
    )

    return NextResponse.json({
      userColumns: cols,
      workoutColumns: workoutCols,
      dbUrl: getUrl().replace(/:[^:@]+@/, ':***@'),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}
