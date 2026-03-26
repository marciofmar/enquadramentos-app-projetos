import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'MANUAL_PROJETOS.md')
    const content = readFileSync(filePath, 'utf-8')
    return NextResponse.json({ content })
  } catch {
    return NextResponse.json({ content: 'Manual não encontrado.' }, { status: 404 })
  }
}
