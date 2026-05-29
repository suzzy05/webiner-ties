import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAdminAuthed } from '@/server/adminAuth'
import { addRsvpQuestionToEvent, getRsvpFormForEvent } from '@/server/events'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const schema = z.object({
  step: z.enum(['personal', 'professional', 'final']),
  ord: z.number().int().min(1).max(10_000),
  label: z.string().min(2).max(140),
  fieldType: z.enum(['text', 'email', 'tel', 'number', 'select', 'textarea']),
  required: z.boolean().default(true),
  optionsCsv: z.string().optional().default(''),
  placeholder: z.string().optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const questions = await getRsvpFormForEvent(id)
  return NextResponse.json({ questions })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const options = parsed.data.optionsCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const created = await addRsvpQuestionToEvent(id, {
    step: parsed.data.step,
    ord: parsed.data.ord,
    label: parsed.data.label,
    fieldType: parsed.data.fieldType,
    required: parsed.data.required,
    options: parsed.data.fieldType === 'select' ? options : undefined,
    placeholder: parsed.data.placeholder,
  })

  return NextResponse.json({ ok: true, question: created }, { status: 201 })
}
