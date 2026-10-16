import { NextResponse } from 'next/server'
import { SEEDED_NOTICES } from '@/lib/data/store'
import { noticeSchema } from '@/lib/validations'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const collegeId = searchParams.get('collegeId') || 'col-003'
  const departmentId = searchParams.get('departmentId')
  const semesterStr = searchParams.get('semester')
  const semester = semesterStr ? parseInt(semesterStr) : null
  const query = searchParams.get('q')?.toLowerCase()

  let list = SEEDED_NOTICES.filter(
    (n) => n.collegeId === collegeId && n.status === 'published'
  )

  if (departmentId) {
    list = list.filter(
      (n) => n.audience === 'all' || n.targetDepartmentId === departmentId
    )
  }

  if (semester) {
    list = list.filter(
      (n) => n.audience === 'all' || n.targetSemester === semester
    )
  }

  if (query) {
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
    )
  }

  return NextResponse.json({
    data: list,
    total: list.length,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = noticeSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid notice parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const newNotice = {
      id: `not-${Date.now()}`,
      collegeId: 'col-003',
      authorId: 'usr-admin-001',
      title: result.data.title,
      content: result.data.content,
      status: result.data.status,
      audience: result.data.audience,
      targetDepartmentId: result.data.targetDepartmentId || null,
      targetSemester: result.data.targetSemester || null,
      attachmentUrls: result.data.attachmentUrls || null,
      publishedAt: result.data.status === 'published' ? new Date().toISOString() : null,
      expiresAt: result.data.expiresAt || null,
      createdAt: new Date().toISOString(),
      author: {
        fullName: 'Dr. Robert Jamir',
        username: 'dean_academic',
        avatarUrl: null,
      },
    }

    return NextResponse.json({ data: newNotice }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 })
  }
}
