import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Geçersiz bilgiler.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı.' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({ data: { name: name || null, email, password: hashed } })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const code = (err as Record<string, unknown>)?.code
    console.error('[register] code:', code, 'message:', message)
    return NextResponse.json(
      { error: 'Sunucu hatası.', code: code ?? null, detail: message.slice(0, 200) },
      { status: 500 }
    )
  }
}
