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

  const results: Record<string, unknown> = {}

  try {
    // List all tables in public schema
    const tables = await db.$queryRawUnsafe<{ tbl: string }[]>(
      `SELECT table_name::text AS tbl
       FROM information_schema.tables
       WHERE table_schema = 'public'`
    )
    results.tables = tables.map((r) => r.tbl)

    // Columns in "User" table
    const userCols = await db.$queryRawUnsafe<{ col: string; typ: string }[]>(
      `SELECT column_name::text AS col, data_type::text AS typ
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'User'
       ORDER BY ordinal_position`
    )
    results.userColumns = userCols

    // Columns in "Workout" table
    const woCols = await db.$queryRawUnsafe<{ col: string; typ: string }[]>(
      `SELECT column_name::text AS col, data_type::text AS typ
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'Workout'
       ORDER BY ordinal_position`
    )
    results.workoutColumns = woCols

    // Try a real Prisma ORM query
    try {
      const count = await db.user.count()
      results.userCount = count
    } catch (e) {
      results.userOrmError = (e as Error).message
    }

  } catch (err) {
    results.error = (err as Error).message
  } finally {
    await db.$disconnect()
  }

  return NextResponse.json(results)
}
